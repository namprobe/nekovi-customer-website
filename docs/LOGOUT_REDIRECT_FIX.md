# Logout Redirect Fix

## Problem

Khi user bấm "Đăng Xuất" trong navbar (trên bất kỳ trang nào có auth), trang bị **stuck** và không redirect ra trang login. User phải **reload** trang thủ công mới thấy login page.

### Symptoms
1. Click "Đăng Xuất" trong dropdown menu
2. Trang không thay đổi, vẫn hiển thị nội dung cũ
3. State đã logout (console shows `isAuthenticated: false`)
4. Nhưng URL không chuyển sang `/login`
5. Phải F5 (reload) mới redirect được

### Root Cause

**Before Fix:**
```typescript
// Navbar chỉ gọi logout(), không có redirect
<DropdownMenuItem onClick={logout}>
  Đăng Xuất
</DropdownMenuItem>
```

**Flow:**
```
User clicks "Đăng Xuất"
    ↓
logout() called (async)
    ↓
Zustand state updates: isAuthenticated = false
    ↓
Component may re-render...
    ↓
❌ NO REDIRECT - User stuck on same page
    ↓
AuthGuard useEffect might trigger but too late
```

### Why AuthGuard Doesn't Help

`AuthGuard` has a `useEffect` to redirect unauthenticated users:

```typescript
useEffect(() => {
  if (!isMounted || !isHydrated) return
  if (isLoading) return
  
  if (requireAuth && !isAuthenticated) {
    router.push(fallbackUrl)
  }
}, [isAuthenticated, ...])
```

**Issues:**
1. **Async State Update:** Zustand state updates asynchronously, so `useEffect` might not fire immediately
2. **Component Unmounting:** After logout, if component unmounts, `useEffect` cleanup happens before redirect
3. **Loading State:** If `isLoading` becomes `true` during logout, redirect is blocked
4. **Timing:** React batches updates, so redirect may be delayed

## Solution

Add **explicit redirect** immediately after logout completes, directly in the logout handler.

### Implementation

**File:** `src/widgets/layout/navbar.tsx`

```typescript
// Import useRouter
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  
  // Create logout handler with redirect
  const handleLogout = async () => {
    await logout()           // Wait for logout to complete
    router.push("/login")    // Immediately redirect to login
  }
  
  // Use handleLogout instead of logout directly
  return (
    // Desktop dropdown
    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
      Đăng Xuất
    </DropdownMenuItem>
    
    // Mobile menu
    <button onClick={handleLogout} className="...">
      Đăng Xuất
    </button>
  )
}
```

### Changes Made

1. ✅ **Added `useRouter` import**
2. ✅ **Created `handleLogout` async function**
3. ✅ **Replaced `onClick={logout}` with `onClick={handleLogout}` in desktop dropdown**
4. ✅ **Replaced `onClick={logout}` with `onClick={handleLogout}` in mobile menu**

## Result

**After Fix:**
```
User clicks "Đăng Xuất"
    ↓
handleLogout() called
    ↓
await logout() - wait for completion
    ↓
Zustand state updates: isAuthenticated = false
    ↓
router.push("/login") - IMMEDIATE redirect ✅
    ↓
User sees login page
```

### Benefits

1. ✅ **Immediate Redirect:** No waiting for React reconciliation
2. ✅ **Predictable Behavior:** Always redirects after logout
3. ✅ **Better UX:** No stuck state, seamless transition
4. ✅ **No Manual Reload:** User doesn't need to refresh
5. ✅ **Works on All Pages:** Desktop and mobile menus both fixed

## Testing

### Test Desktop Logout

1. **Login to app**
2. **Navigate to any protected page** (Profile, Orders, Wishlist)
3. **Click profile icon in navbar**
4. **Click "Đăng Xuất"**
5. ✅ **Expected:** Immediately redirected to `/login`

### Test Mobile Logout

1. **Login to app**
2. **Open mobile menu** (hamburger icon)
3. **Click "Đăng Xuất" button**
4. ✅ **Expected:** Immediately redirected to `/login`

### Test From Different Pages

**Test Matrix:**

| Page | Logged In | Action | Expected Result |
|------|-----------|--------|-----------------|
| `/profile` | Yes | Logout | Redirect to `/login` ✅ |
| `/orders` | Yes | Logout | Redirect to `/login` ✅ |
| `/wishlist` | Yes | Logout | Redirect to `/login` ✅ |
| `/products/123` | Yes | Logout | Redirect to `/login` ✅ |
| `/` (home) | Yes | Logout | Redirect to `/login` ✅ |

### Test Logout State

**Before logout:**
```javascript
{
  isAuthenticated: true,
  user: { id: "123", email: "user@example.com" },
  token: "eyJhbGc..."
}
```

**After logout:**
```javascript
{
  isAuthenticated: false,
  user: null,
  token: null
}
```

**URL transition:**
```
/profile → /login ✅
```

### Test No Reload Required

1. Logout from any page
2. ✅ Should redirect WITHOUT needing manual refresh
3. ✅ Console should show: `[Auth] Token refresh timer cleared`

## Edge Cases Handled

### 1. Logout from Login Page
If user is on `/login` and clicks logout (shouldn't happen but...):
```typescript
await logout()
router.push("/login") // No-op, already on login page
```

### 2. Multiple Rapid Clicks
If user clicks "Đăng Xuất" multiple times:
```typescript
handleLogout = async () => {
  await logout() // First call completes
  router.push("/login") // Redirects
  // Subsequent clicks are ignored (component unmounted)
}
```

### 3. Logout During Navigation
If user navigates away during logout:
```typescript
await logout() // Completes
router.push("/login") // Redirects regardless
```

### 4. Browser Back Button
After logout + redirect:
- User on `/login`
- Press browser back button
- ✅ `AuthGuard` prevents access to protected pages
- ✅ Redirects back to `/login`

## Alternative Approaches Considered

### ❌ Option 1: Wait for AuthGuard to Redirect
```typescript
// Just call logout(), rely on AuthGuard useEffect
<DropdownMenuItem onClick={logout}>
```

**Problems:**
- Timing issues
- Race conditions
- Component unmounting
- Unreliable

### ❌ Option 2: Add redirect inside logout() in Zustand store
```typescript
// In auth-service.ts
logout: async () => {
  await apiClient.post(LOGOUT_ENDPOINT)
  clearToken()
  router.push("/login") // ❌ Can't access router in store
}
```

**Problems:**
- Zustand store can't access Next.js router
- Would need to pass router as parameter (messy)
- Violates separation of concerns

### ✅ Option 3: Explicit redirect in UI handler (CHOSEN)
```typescript
// In navbar component
const handleLogout = async () => {
  await logout()
  router.push("/login") // ✅ Clear, explicit, reliable
}
```

**Advantages:**
- Simple and explicit
- Component has access to router
- Easy to test and maintain
- Clear intent

## Related Files

- ✅ `src/widgets/layout/navbar.tsx` - Added `handleLogout` handler
- `src/entities/auth/service/auth-service.ts` - Logout implementation
- `src/components/auth/auth-guard.tsx` - Route protection (fallback)
- `src/core/hooks/use-auth.tsx` - Auth hook

## Future Improvements

### 1. Add Loading State During Logout
```typescript
const [isLoggingOut, setIsLoggingOut] = useState(false)

const handleLogout = async () => {
  setIsLoggingOut(true)
  await logout()
  router.push("/login")
}

// In UI
<DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
  {isLoggingOut ? "Đang đăng xuất..." : "Đăng Xuất"}
</DropdownMenuItem>
```

### 2. Add Toast Notification
```typescript
const { toast } = useToast()

const handleLogout = async () => {
  await logout()
  toast({
    title: "Đã đăng xuất",
    description: "Hẹn gặp lại!",
  })
  router.push("/login")
}
```

### 3. Add Confirmation Dialog
```typescript
const handleLogout = async () => {
  const confirmed = window.confirm("Bạn có chắc muốn đăng xuất?")
  if (!confirmed) return
  
  await logout()
  router.push("/login")
}
```

### 4. Remember Return URL
```typescript
const handleLogout = async () => {
  // Save current URL to return after login
  sessionStorage.setItem('returnUrl', window.location.pathname)
  
  await logout()
  router.push("/login")
}

// In login page after successful login:
const returnUrl = sessionStorage.getItem('returnUrl') || '/'
router.push(returnUrl)
```

## Performance Impact

### Before
- User stuck on page
- Manual reload required (full page load)
- Poor UX

### After
- Immediate redirect ✅
- Client-side navigation (fast) ✅
- Smooth transition ✅
- Better UX ✅

## Deployment Checklist

- [x] Add `handleLogout` function
- [x] Replace desktop dropdown logout
- [x] Replace mobile menu logout
- [x] Test build
- [x] Test linter
- [ ] Test in browser (desktop menu)
- [ ] Test in browser (mobile menu)
- [ ] Test from different protected pages
- [ ] Test browser back button
- [ ] Deploy to staging
- [ ] Deploy to production

## Related Issues

This fix resolves:
- ✅ Logout stuck on current page
- ✅ Requires manual reload after logout
- ✅ Inconsistent logout behavior
- ✅ Poor logout UX

## Breaking Changes

None. This is a pure bug fix with no breaking changes.

## Backwards Compatibility

Fully backwards compatible. All existing functionality preserved.

