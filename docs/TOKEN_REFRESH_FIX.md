# Token Refresh Multiple Calls Fix

## Problem

API `refreshToken` was being called **3 times** simultaneously when performing silent token refresh.

### Symptoms
```
[Auth] Attempting token refresh...
[Auth] Attempting token refresh...
[Auth] Attempting token refresh...
```

This happened because:
1. Multiple components called `useAuth()` hook
2. Each hook instance created its own `useEffect` with a timer
3. All timers fired at the same time → multiple simultaneous refresh calls

### Root Cause Analysis

**Before (Broken):**
```
Component A → useAuth() → useEffect → Timer A → refreshToken()
Component B → useAuth() → useEffect → Timer B → refreshToken()
Component C → useAuth() → useEffect → Timer C → refreshToken()
                                           ↓
                                    3 simultaneous calls! ❌
```

The token refresh logic was in `use-auth.tsx` hook (lines 87-112), which is called by every component that needs auth:
- Navbar
- AuthGuard
- Profile page
- etc.

Each component mount → new timer → multiple refresh calls.

## Solution

Move token refresh scheduling from **React hook** to **Zustand store** (singleton).

### Architecture Change

**After (Fixed):**
```
Zustand Store (Singleton)
    ↓
Single Refresh Timer
    ↓
refreshToken() called ONCE ✅
    ↓
All components get updated via store subscription
```

### Implementation

#### 1. Created Singleton Timer in Store

**File:** `src/entities/auth/service/auth-service.ts`

```typescript
// Singleton refresh timer để tránh multiple refresh calls
let refreshTimerId: NodeJS.Timeout | null = null

const clearRefreshTimer = () => {
  if (refreshTimerId) {
    clearTimeout(refreshTimerId)
    refreshTimerId = null
  }
}

const scheduleTokenRefresh = (
  expiresAt: Date, 
  refreshFn: () => Promise<boolean>, 
  logoutFn: () => Promise<void>
) => {
  // Clear any existing timer
  clearRefreshTimer()

  // Check if token is already expired
  if (isTokenExpired(expiresAt)) {
    console.log('Token already expired, logging out...')
    logoutFn()
    return
  }

  const refreshTimeout = calculateRefreshTimeout(expiresAt)
  console.log(`[Auth] Token refresh scheduled in ${Math.round(refreshTimeout / 1000 / 60)} minutes`)

  // Create SINGLE timer for entire app
  refreshTimerId = setTimeout(async () => {
    console.log('[Auth] Attempting token refresh...')
    const success = await refreshFn()
    if (!success) {
      console.error('[Auth] Token refresh failed, logging out...')
      await logoutFn()
    }
  }, refreshTimeout)
}
```

#### 2. Schedule Refresh on Login

```typescript
login: async (credentials: LoginCredentials) => {
  // ... login logic ...
  
  if (result.isSuccess && result.data) {
    // ... set state ...
    
    // Schedule automatic token refresh
    scheduleTokenRefresh(authData.expiresAt, get().refreshToken, get().logout)
    
    return { success: true }
  }
}
```

#### 3. Schedule Refresh on Token Refresh

```typescript
refreshToken: async () => {
  // ... refresh logic ...
  
  if (result.isSuccess && result.data) {
    // ... set state ...
    
    // Schedule NEXT automatic token refresh
    scheduleTokenRefresh(authData.expiresAt, get().refreshToken, get().logout)
    
    return true
  }
}
```

#### 4. Clear Timer on Logout

```typescript
logout: async () => {
  try {
    await apiClient.post(env.ENDPOINTS.AUTH.LOGOUT)
  } catch (error) {
    console.warn("Logout API failed:", error)
  } finally {
    // Clear refresh timer
    clearRefreshTimer()
    apiClient.clearToken()
    set(initialState)
  }
}
```

#### 5. Schedule Refresh on Hydration

When app loads and restores state from localStorage:

```typescript
onRehydrateStorage: () => (state) => {
  state?._setHydrated(true)
  
  // Schedule token refresh after hydration if user is authenticated
  if (state?.isAuthenticated && state?.tokenExpiresAt) {
    scheduleTokenRefresh(
      state.tokenExpiresAt as Date, 
      state.refreshToken, 
      state.logout
    )
  }
}
```

#### 6. Remove Logic from Hook

**File:** `src/core/hooks/use-auth.tsx`

**Before (Removed):**
```typescript
// ❌ Removed - caused multiple timers
useEffect(() => {
  if (!isAuthenticated || !token) return
  
  const refreshTimeout = calculateRefreshTimeout(accessTokenExpiresAt)
  const timeoutId = setTimeout(async () => {
    await refreshToken()
  }, refreshTimeout)
  
  return () => clearTimeout(timeoutId)
}, [isAuthenticated, token, accessTokenExpiresAt, refreshToken])
```

**After:**
```typescript
// ✅ Note: Token refresh scheduling is now handled in the Zustand store
// to prevent multiple refresh calls when multiple components mount
```

## Benefits

### 1. Single Refresh Call ✅
Only **ONE** timer exists in the entire app, regardless of how many components mount.

### 2. Consistent Behavior ✅
All components see the same refresh state via Zustand subscriptions.

### 3. Memory Efficient ✅
No timer cleanup needed when components unmount - timer persists at store level.

### 4. Easier Debugging ✅
Clear log prefix `[Auth]` and single refresh point makes debugging easier.

### 5. Race Condition Prevention ✅
Prevents race conditions from multiple simultaneous refresh calls.

## Testing

### Test Single Refresh Call

1. **Login to app**
2. **Open browser console**
3. **Wait for token to be near expiry** (5 minutes before)
4. **Check logs:**

**Before (Broken):**
```
[Auth] Attempting token refresh...
[Auth] Attempting token refresh...
[Auth] Attempting token refresh...
```

**After (Fixed):**
```
[Auth] Token refresh scheduled in 25 minutes
... (25 minutes later) ...
[Auth] Attempting token refresh...
✓ Token refreshed successfully
[Auth] Token refresh scheduled in 25 minutes
```

### Test Multiple Component Mounts

1. **Navigate between pages** (Profile → Home → Orders → Wishlist)
2. **Each page has AuthGuard + Navbar** (both use `useAuth()`)
3. **Check console:** Should only see ONE refresh timer scheduled

### Test Hydration

1. **Login to app**
2. **Close browser** (localStorage persists)
3. **Reopen browser and navigate to site**
4. **Check console:**
```
[Auth] Token refresh scheduled in X minutes
```
Only ONE schedule log, even though multiple components mount.

### Test Logout

1. **Login to app**
2. **Check console:** Timer scheduled
3. **Logout**
4. **Check console:** Timer cleared
5. **Login again**
6. **Check console:** New timer scheduled (old one was cleared)

## Refresh Token Flow

### Timeline

```
Login at 10:00 AM
Token expires at 10:30 AM
    ↓
Timer scheduled for 10:25 AM (5 min before expiry)
    ↓
At 10:25 AM: refreshToken() called
    ↓
New token expires at 10:55 AM
    ↓
Timer scheduled for 10:50 AM
    ↓
... cycle continues ...
```

### Refresh Logic

```typescript
const calculateRefreshTimeout = (expiresAt: Date): number => {
  const expiryTime = new Date(expiresAt).getTime()
  const currentTime = Date.now()
  // Refresh 5 minutes before expiry
  const refreshTime = expiryTime - (5 * 60 * 1000)
  const timeUntilRefresh = refreshTime - currentTime
  return Math.max(timeUntilRefresh, 0)
}
```

**Example:**
- Token expires at: 10:30:00 AM
- Refresh time: 10:25:00 AM (5 min before)
- Current time: 10:00:00 AM
- Time until refresh: 25 minutes
- Timer set for: 25 * 60 * 1000 = 1,500,000 ms

## Edge Cases Handled

### 1. Token Already Expired on Load
```typescript
if (isTokenExpired(expiresAt)) {
  console.log('Token already expired, logging out...')
  logoutFn()
  return
}
```

### 2. Multiple Login/Logout Cycles
```typescript
clearRefreshTimer() // Clear old timer before creating new one
```

### 3. Refresh Failure
```typescript
const success = await refreshFn()
if (!success) {
  console.error('[Auth] Token refresh failed, logging out...')
  await logoutFn()
}
```

### 4. Browser Tab Inactive
Timer continues in background. When tab becomes active, if token expired → logout.

### 5. Multiple Browser Tabs
Each tab has its own Zustand store instance, so each tab manages its own timer. This is correct behavior - each tab should independently refresh its token.

## Configuration

### Refresh Timing
Change refresh time before expiry:

```typescript
// Currently: 5 minutes before
const refreshTime = expiryTime - (5 * 60 * 1000)

// To change to 10 minutes:
const refreshTime = expiryTime - (10 * 60 * 1000)
```

### Backend Token Lifetime
Make sure backend JWT lifetime is longer than refresh interval:

```json
{
  "JwtSettings": {
    "TokenLifetimeMinutes": 30,  // Token expires in 30 min
    "RefreshTokenLifetimeMinutes": 43200  // Refresh token expires in 30 days
  }
}
```

Frontend refreshes 5 minutes before expiry → at 25 minutes.

## Related Files

- ✅ `src/entities/auth/service/auth-service.ts` - Token refresh logic (singleton)
- ✅ `src/core/hooks/use-auth.tsx` - Hook (refresh logic removed)
- ✅ `src/core/lib/api-client.ts` - API calls (includes auto-retry on 401)

## Performance Impact

### Before
- **Memory:** 3 timers × N components mounted
- **API calls:** 3 simultaneous calls every 25 minutes
- **Network:** Wasted bandwidth on duplicate calls

### After
- **Memory:** 1 timer for entire app ✅
- **API calls:** 1 call every 25 minutes ✅
- **Network:** Optimal bandwidth usage ✅

## Debugging Tips

### Enable Debug Logs
All logs are prefixed with `[Auth]` for easy filtering:

```javascript
// Browser console filter
[Auth]
```

### Check Timer State
In browser console:

```javascript
// This won't work directly, but you can add a debug method:
// In auth-service.ts, export:
export const getRefreshTimerState = () => ({
  hasTimer: refreshTimerId !== null,
  timerId: refreshTimerId
})
```

### Test Refresh Manually
In browser console:

```javascript
// Force refresh (if you expose the store)
const store = window.__ZUSTAND_DEVTOOLS_STORE__
await store.getState().refreshToken()
```

## Migration Checklist

- [x] Move timer logic to Zustand store
- [x] Add singleton timer variable
- [x] Add helper functions (schedule, clear, calculate)
- [x] Schedule on login
- [x] Schedule on refresh
- [x] Schedule on hydration
- [x] Clear on logout
- [x] Remove logic from hook
- [x] Test build
- [x] Test linter
- [ ] Test in browser (multiple tabs)
- [ ] Test refresh cycle
- [ ] Deploy to staging
- [ ] Deploy to production

## Future Improvements

### 1. Visibility API Integration
Pause refresh when tab is hidden, resume when visible:

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearRefreshTimer()
  } else {
    // Reschedule based on current token
    const state = useAuthStore.getState()
    if (state.isAuthenticated && state.tokenExpiresAt) {
      scheduleTokenRefresh(state.tokenExpiresAt, ...)
    }
  }
})
```

### 2. Network Status Integration
Pause refresh when offline:

```typescript
window.addEventListener('online', () => {
  // Reschedule refresh when connection restored
})
```

### 3. Retry Logic
Add retry on refresh failure:

```typescript
let retryCount = 0
const MAX_RETRIES = 3

if (!success && retryCount < MAX_RETRIES) {
  retryCount++
  setTimeout(() => refreshFn(), 5000) // Retry after 5s
}
```

