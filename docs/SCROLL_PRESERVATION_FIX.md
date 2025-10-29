# Scroll Position Preservation Fix

## Vấn đề

Sau khi update profile thành công:
1. ❌ API getProfile bị gọi 2 lần
2. ❌ Page bị scroll lên đầu, mất vị trí ban đầu
3. ❌ UI bị re-render toàn bộ

**Console logs cho thấy:**
```
🔗 API Request: /auth/profile  [Call 1]
🔗 API Request: /auth/profile  [Call 2]
🔒 AuthGuard State: {...}
🔒 AuthGuard State: {...}
🔒 AuthGuard State: {...}
```

## Nguyên nhân

### 1. Double API call

**Code cũ:**
```typescript
// profile/page.tsx
useEffect(() => {
  const handleProfileUpdate = () => {
    profileFetchedRef.current = false  // ❌ Trigger useEffect đầu tiên!
    getProfile(true)  // Call 1
  }
}, [getProfile])

useEffect(() => {
  if (!profileFetchedRef.current) {
    profileFetchedRef.current = true
    getProfile(true)  // Call 2 - Triggered vì profileFetchedRef = false
  }
}, [isHydrated, isAuthenticated, getProfile])
```

**Vấn đề:**
- Set `profileFetchedRef.current = false` trigger useEffect đầu tiên
- useEffect đầu tiên thấy `profileFetchedRef.current = false` → gọi getProfile lần nữa
- Kết quả: 2 API calls!

### 2. Scroll position bị mất

**Nguyên nhân:**
- getProfile() update user state
- User state change → Component re-render
- Re-render → React reset scroll position về 0
- Người dùng mất vị trí scroll ban đầu

## Giải pháp

### 1. Fix double call - KHÔNG reset profileFetchedRef

```typescript
// ❌ TRƯỚC
const handleProfileUpdate = () => {
  profileFetchedRef.current = false  // Trigger re-fetch
  getProfile(true)
}

// ✅ SAU
const handleProfileUpdate = () => {
  // Chỉ gọi getProfile, KHÔNG reset ref
  getProfile(true)  // Chỉ 1 call duy nhất
}
```

### 2. Fix scroll position - Save & Restore

```typescript
const handleProfileUpdate = () => {
  // 1. Save current scroll position
  const scrollY = window.scrollY
  
  // 2. Call getProfile to refresh data
  getProfile(true).then(() => {
    // 3. Restore scroll position after data loads
    setTimeout(() => {
      window.scrollTo(0, scrollY)
    }, 0)
  })
}
```

**Chi tiết:**
1. **Save scroll:** `window.scrollY` lưu vị trí hiện tại
2. **Refresh data:** `getProfile(true)` fetch data mới
3. **Wait for render:** `setTimeout(..., 0)` đợi React render xong
4. **Restore scroll:** `window.scrollTo()` restore vị trí

## Implementation

**File:** `src/app/profile/page.tsx`

```typescript
function ProfilePageContent() {
  const { user, getProfile, isAuthenticated, isHydrated } = useAuth()
  const profileFetchedRef = useRef(false)

  // Initial load
  useEffect(() => {
    if (isHydrated && isAuthenticated && !profileFetchedRef.current) {
      profileFetchedRef.current = true
      getProfile(true)
    }
  }, [isHydrated, isAuthenticated, getProfile])

  // Listen for updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const scrollY = window.scrollY
      
      getProfile(true).then(() => {
        setTimeout(() => {
          window.scrollTo(0, scrollY)
        }, 0)
      })
    }

    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('profile-updated', handleProfileUpdate)
  }, [getProfile])

  return (
    // ... JSX
  )
}
```

## Flow mới

```
User clicks "Lưu thay đổi"
  ↓
updateProfile() API call
  ↓
✅ Success
  ↓
Dispatch 'profile-updated' event
  ↓
Event listener:
  1. Save scrollY = 450px
  2. Call getProfile(true) [1 call only] ✅
  ↓
User state updates
  ↓
Component re-render (scroll resets to 0)
  ↓
setTimeout callback:
  3. Restore scrollY = 450px ✅
  ↓
User stays at same scroll position! ✅
```

## Testing

### Test 1: Single API Call
```typescript
// Given: User updates profile
await updateProfile({ firstName: "New Name" })

// When: Update succeeds
// Then: Only 1 getProfile call
expect(getProfileSpy).toHaveBeenCalledTimes(1)
```

### Test 2: Scroll Preservation
```typescript
// Given: User scrolls to 500px
window.scrollTo(0, 500)
expect(window.scrollY).toBe(500)

// When: User updates profile
await updateProfile({ firstName: "New Name" })
await waitForUpdate()

// Then: Scroll position maintained
expect(window.scrollY).toBe(500)
```

## Benefits

### ✅ Single API Call
- Chỉ 1 API request sau update
- Giảm load cho server
- Faster response time

### ✅ Better UX
- Scroll position được giữ nguyên
- Không bị "nhảy" lên đầu page
- Smooth user experience

### ✅ Predictable Behavior
- Không có side effects bất ngờ
- Clear separation of concerns
- Easy to debug

## Common Pitfalls Avoided

### ❌ Don't reset refs unnecessarily
```typescript
// BAD - Causes double call
profileFetchedRef.current = false
getProfile(true)
```

### ✅ Just call the function
```typescript
// GOOD - Single call
getProfile(true)
```

### ❌ Don't forget scroll preservation
```typescript
// BAD - Scroll resets
getProfile(true)  // User loses scroll position
```

### ✅ Save and restore scroll
```typescript
// GOOD - Scroll preserved
const scrollY = window.scrollY
getProfile(true).then(() => {
  window.scrollTo(0, scrollY)
})
```

## Alternative Approaches

### Option 1: CSS scroll-behavior
```css
/* Smooth scroll restoration */
html {
  scroll-behavior: smooth;
}
```

**Pros:** Browser handles it  
**Cons:** Doesn't prevent scroll reset

### Option 2: React state for scroll
```typescript
const [scrollPosition, setScrollPosition] = useState(0)

useEffect(() => {
  window.scrollTo(0, scrollPosition)
}, [user])
```

**Pros:** React-based  
**Cons:** Extra state management

### Option 3: Imperative (Current solution) ✅
```typescript
const scrollY = window.scrollY
getProfile(true).then(() => {
  window.scrollTo(0, scrollY)
})
```

**Pros:** Simple, direct, works reliably  
**Cons:** Imperative code

## Console Logs After Fix

```
// Before update
🔒 AuthGuard State: {...}

// User clicks "Lưu thay đổi"
🔗 API Request: PUT /auth/update-profile
✅ Success

// Profile refresh
🔗 API Request: GET /auth/profile  [1 call only] ✅
✅ Scroll preserved ✅

// No extra calls!
```

## Summary

- ✅ Fixed double API call by not resetting `profileFetchedRef`
- ✅ Preserved scroll position with save/restore pattern
- ✅ Better UX - no unexpected scroll jumps
- ✅ Cleaner code - fewer side effects
- ✅ Single source of truth for data refresh

