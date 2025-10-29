# Profile Sync & Double Call Fix

## Vấn đề phát hiện

### 1. Gender hiển thị sai
**Triệu chứng:**
- Backend trả về `gender: 1` (Male theo enum)
- UI hiển thị "Nữ" thay vì "Nam"

**Nguyên nhân:**
- FormData chỉ được khởi tạo 1 lần khi component mount
- Khi user state thay đổi (sau update), formData KHÔNG tự động sync
- Component giữ giá trị cũ trong formData

```typescript
// ❌ Chỉ init 1 lần
const [formData, setFormData] = useState({
  gender: user?.gender?.toString() || Gender.Male.toString()
})
// Khi user thay đổi → formData vẫn giữ giá trị cũ
```

### 2. API getProfile bị gọi 2 lần
**Triệu chứng:**
- Sau khi update profile thành công, getProfile được gọi 2 lần

**Nguyên nhân:**
- `updateProfile` action gọi `getProfile(true)`
- Profile page cũng có thể trigger getProfile lại

## Giải pháp

### 1. Sync formData với user state

Thêm `useEffect` để tự động cập nhật formData khi user thay đổi:

**File:** `src/features/profile/components/UpdateProfileForm.tsx`

```typescript
import { useState, useRef, useEffect } from "react"

export function UpdateProfileForm() {
  const { user, updateProfile, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender?.toString() || Gender.Male.toString(),
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
    bio: user?.bio || "",
  })

  // ✅ Sync formData with user changes (after profile update)
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender?.toString() || Gender.Male.toString(),
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        bio: user.bio || "",
      })
    }
  }, [user])  // ← Re-run khi user thay đổi
```

**Lợi ích:**
- FormData luôn sync với user state mới nhất
- Gender dropdown hiển thị đúng giá trị
- Tất cả fields tự động update khi getProfile trả về data mới

### 2. Tránh double getProfile call

Sử dụng Custom Event để coordinate giữa component và page:

**A. UpdateProfileForm dispatch event:**
```typescript
// UpdateProfileForm.tsx
if (result.success) {
  toast({ /* ... */ })
  // ✅ Dispatch event thay vì gọi getProfile trực tiếp
  window.dispatchEvent(new CustomEvent('profile-updated'))
  setAvatarPreview(null)
  setAvatarFile(null)
}
```

**B. Profile page listen event:**
```typescript
// profile/page.tsx
useEffect(() => {
  const handleProfileUpdate = () => {
    updateSuccessRef.current = true
    profileFetchedRef.current = false // Allow re-fetch after update
    getProfile(true)
  }

  window.addEventListener('profile-updated', handleProfileUpdate)
  return () => window.removeEventListener('profile-updated', handleProfileUpdate)
}, [getProfile])
```

**C. Remove getProfile từ updateProfile action:**
```typescript
// auth-service.ts - updateProfile action
if (result.isSuccess) {
  // ✅ Let profile page handle the refresh to avoid double call
  return { success: true }
}
```

## Flow mới

### Before (2 calls):
```
User clicks "Lưu thay đổi"
  ↓
UpdateProfileForm.handleSubmit()
  ↓
updateProfile() API call
  ↓
✅ Success
  ├─→ getProfile(true) [Call 1] ❌
  └─→ User state changes
       ↓
     Component re-render
       ↓
     Page useEffect triggers
       ↓
     getProfile(true) [Call 2] ❌
```

### After (1 call):
```
User clicks "Lưu thay đổi"
  ↓
UpdateProfileForm.handleSubmit()
  ↓
updateProfile() API call
  ↓
✅ Success
  └─→ Dispatch 'profile-updated' event
       ↓
     Page event listener
       ↓
     getProfile(true) [Call 1 only] ✅
       ↓
     User state updates
       ↓
     FormData syncs via useEffect ✅
       ↓
     Gender dropdown shows correct value ✅
```

## Component Lifecycle

```typescript
Mount:
  1. useState initializes formData from user
  2. First useEffect: Load profile if needed
  3. Second useEffect: Setup event listener

Update Profile:
  1. User clicks submit
  2. updateProfile() API call
  3. Success → dispatch 'profile-updated' event
  4. Event listener triggers getProfile(true)
  5. User state updates
  6. useEffect([user]) triggers
  7. formData syncs with new user data
  8. Component re-renders with correct values

Unmount:
  - Event listener cleanup
```

## Benefits

### 1. Accurate UI Display
```typescript
// Backend response
{ "gender": 1 }  // Male

// Frontend display
Gender.Male === 1  // true
formData.gender === "1"  // true
Dropdown shows: "Nam" ✅  // Correct!
```

### 2. Single API Call
- Only 1 getProfile call after update
- Centralized refresh logic in page
- Component just dispatches events

### 3. Reactive Updates
- FormData automatically syncs
- No manual state management needed
- Works for all profile fields

### 4. Better Separation of Concerns
- **UpdateProfileForm**: Handles form submission and UI
- **Profile Page**: Manages profile data fetching
- **Auth Service**: Pure data operations

## Testing

### Test Gender Display
```typescript
// Given: User has gender = 1 (Male)
const user = { gender: 1 }

// When: Component renders
render(<UpdateProfileForm />)

// Then: Dropdown shows "Nam"
expect(screen.getByText("Nam")).toBeInTheDocument()
```

### Test Profile Update
```typescript
// Given: User updates profile
await updateProfile({ gender: Gender.Female })

// When: Update succeeds
// Then: 
// 1. Only 1 getProfile call
expect(getProfile).toHaveBeenCalledTimes(1)

// 2. FormData syncs
expect(formData.gender).toBe("0")  // Female

// 3. UI updates
expect(screen.getByText("Nữ")).toBeInTheDocument()
```

## Common Pitfalls Avoided

### ❌ Don't do this:
```typescript
// Calling getProfile directly in component
if (result.success) {
  await getProfile(true)  // ❌ Causes double call
}
```

### ✅ Do this instead:
```typescript
// Dispatch event for page to handle
if (result.success) {
  window.dispatchEvent(new CustomEvent('profile-updated'))  // ✅
}
```

### ❌ Don't do this:
```typescript
// Not syncing formData
const [formData] = useState({ gender: user?.gender })
// ❌ Stale data after update
```

### ✅ Do this instead:
```typescript
// Sync formData with user
useEffect(() => {
  if (user) {
    setFormData({ gender: user.gender?.toString() })  // ✅
  }
}, [user])
```

## Summary

- ✅ FormData syncs với user state via useEffect
- ✅ Gender hiển thị đúng theo Gender enum
- ✅ Chỉ 1 getProfile call sau update
- ✅ Event-driven architecture
- ✅ Clean separation of concerns
- ✅ Reactive và maintainable

