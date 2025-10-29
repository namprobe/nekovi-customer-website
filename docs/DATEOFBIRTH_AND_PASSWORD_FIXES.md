# Date of Birth Display & Password Change Logout Fixes

## Vấn đề

### 1. Date of Birth hiển thị sai

**Triệu chứng:**
- Backend trả về: `"dateOfBirth": "1999-09-01T00:00:00"` (September 1st)
- Frontend hiển thị: `31/8/1999` (August 31st)
- Sai lệch 1 ngày!

**Response từ API:**
```json
{
  "isSuccess": true,
  "message": "Profile retrieved successfully",
  "data": {
    "email": "nguyenhoainamvt99@gmail.com",
    "firstName": "Nam",
    "lastName": "Nguyễn Hoài",
    "phoneNumber": "0867619150",
    "gender": 1,
    "dateOfBirth": "1999-09-01T00:00:00",
    "bio": "Tôi là người yêu thích anime.",
    "avatarPath": "http://localhost:5240/uploads/avatars/a8c55c31-ee30-4201-8762-725cd9cba166.jpg"
  }
}
```

**Nguyên nhân:**
```typescript
// ❌ TRƯỚC - Convert string → Date object → string
dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ""
```

**Vấn đề:**
1. Backend trả về ISO string: `"1999-09-01T00:00:00"`
2. Frontend convert sang Date: `new Date("1999-09-01T00:00:00")`
3. JavaScript parse theo **local timezone** (VN = UTC+7)
4. UTC time = `1999-09-01 00:00:00 UTC`
5. VN time = `1999-08-31 17:00:00 GMT+7` (previous day!)
6. `.toISOString()` → `1999-08-31T17:00:00Z`
7. `.split('T')[0]` → `1999-08-31` ❌

### 2. Change Password không logout

**Triệu chứng:**
- User đổi password thành công
- Backend xóa toàn bộ sessions/tokens
- Frontend vẫn giữ token cũ trong localStorage
- User vẫn ở trạng thái "logged in"
- Khi call API lần sau → 401 Unauthorized

**Backend behavior (IdentityService.cs):**
```csharp
public async Task<IdentityResult> ChangePasswordAsync(
    AppUser user, string currentPassword, string newPassword)
{
    var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
    user.RefreshToken = null;  // ❌ Clear refresh token
    user.RefreshTokenExpiryTime = null;  // ❌ Clear expiry
    await _userManager.UpdateAsync(user);
    return result;
}
```

**Vấn đề:**
- Backend invalidates all sessions
- Frontend không biết và không clear local state
- Mismatch giữa backend và frontend auth state

## Giải pháp

### 1. Fix Date of Birth - Direct string manipulation

**Code mới:**
```typescript
// ✅ SAU - Direct string split, no Date conversion
dateOfBirth: user?.dateOfBirth?.split('T')[0] || ""
```

**Tại sao hoạt động:**
1. Backend trả về: `"1999-09-01T00:00:00"`
2. `.split('T')[0]` → `"1999-09-01"` ✅
3. Không có timezone conversion!
4. HTML `<input type="date">` nhận giá trị `"1999-09-01"` đúng

**Lợi ích:**
- ✅ Không có timezone conversion
- ✅ Không tạo Date object
- ✅ Simple string manipulation
- ✅ Hiển thị đúng ngày từ backend

### 2. Fix Password Change - Auto logout

**Step 1: Update return type**
```typescript
// auth.ts
changePassword: (request: ChangePasswordRequest) => Promise<{
  success: boolean
  requiresLogout?: boolean  // ✅ New flag
  error?: string
  errors?: string[]
}>
```

**Step 2: Set flag in auth-service.ts**
```typescript
// auth-service.ts
changePassword: async (request: ChangePasswordRequest) => {
  // ... API call ...
  
  if (result.isSuccess) {
    // After successful password change, backend clears all sessions
    // We need to clear local auth state and trigger logout
    return { success: true, requiresLogout: true }  // ✅
  }
  
  // ... error handling ...
}
```

**Step 3: Handle logout in ChangePasswordForm.tsx**
```typescript
// ChangePasswordForm.tsx
const result = await changePassword(formData)

if (result.success) {
  toast({
    title: "Thành công",
    description: "Đã thay đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
  })
  
  // Backend clears all sessions after password change
  // Clear local auth state and redirect to login
  if (result.requiresLogout) {
    setTimeout(() => {
      logout()  // Clear localStorage
      router.push("/login")  // Redirect
    }, 1500)  // Give user time to see success message
  }
}
```

**Flow:**
```
User changes password
  ↓
Frontend → Backend API
  ↓
Backend:
  - Changes password ✅
  - Clears RefreshToken ✅
  - Clears RefreshTokenExpiryTime ✅
  ↓
Frontend receives success
  ↓
Show success toast (1.5s)
  ↓
Call logout():
  - Clear localStorage
  - Clear Zustand state
  - Clear all auth info
  ↓
Redirect to /login
  ↓
User must login with new password ✅
```

## Implementation

### File 1: `src/entities/auth/type/auth.ts`

**Change 1: ProfileResponse dateOfBirth type**
```typescript
export interface ProfileResponse {
  // ... other fields ...
  dateOfBirth?: string  // ✅ ISO date string from API (not Date object)
  // ... other fields ...
}
```

**Change 2: changePassword return type**
```typescript
changePassword: (request: ChangePasswordRequest) => Promise<{
  success: boolean
  requiresLogout?: boolean  // ✅ Added
  error?: string
  errors?: string[]
}>
```

### File 2: `src/features/profile/components/UpdateProfileForm.tsx`

**Change 1: Initial state**
```typescript
const [formData, setFormData] = useState({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  phoneNumber: user?.phoneNumber || "",
  gender: user?.gender?.toString() || Gender.Male.toString(),
  dateOfBirth: user?.dateOfBirth?.split('T')[0] || "",  // ✅ Direct split
  bio: user?.bio || "",
})
```

**Change 2: Sync effect**
```typescript
useEffect(() => {
  if (user) {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      gender: user.gender?.toString() || Gender.Male.toString(),
      dateOfBirth: user.dateOfBirth?.split('T')[0] || "",  // ✅ Direct split
      bio: user.bio || "",
    })
  }
}, [user])
```

### File 3: `src/entities/auth/service/auth-service.ts`

```typescript
changePassword: async (request: ChangePasswordRequest) => {
  try {
    set({ isLoading: true, error: null })

    const result = await apiClient.post(
      env.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      request
    )

    set({ isLoading: false })

    if (result.isSuccess) {
      // After successful password change, backend clears all sessions
      // We need to clear local auth state and trigger logout
      return { success: true, requiresLogout: true }  // ✅
    } else {
      set({ error: result.message || "Password change failed" })
      return { 
        success: false, 
        error: result.message || "Password change failed",
        errors: result.errors || []
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error"
    set({
      isLoading: false,
      error: errorMessage
    })
    return { success: false, error: errorMessage, errors: [errorMessage] }
  }
}
```

### File 4: `src/features/profile/components/ChangePasswordForm.tsx`

**Change 1: Add imports**
```typescript
import { useRouter } from "next/navigation"
```

**Change 2: Add router and logout**
```typescript
export function ChangePasswordForm() {
  const router = useRouter()  // ✅
  const { changePassword, logout, isLoading } = useAuth()  // ✅ Added logout
  const { toast } = useToast()
  
  // ... rest of code ...
}
```

**Change 3: Handle logout after success**
```typescript
const result = await changePassword(formData)

if (result.success) {
  toast({
    title: "Thành công",
    description: "Đã thay đổi mật khẩu thành công. Vui lòng đăng nhập lại.",  // ✅
  })
  
  // Backend clears all sessions after password change
  // Clear local auth state and redirect to login
  if (result.requiresLogout) {  // ✅
    setTimeout(() => {
      logout()
      router.push("/login")
    }, 1500)  // Give user time to see success message
  }
}
```

## Testing

### Test 1: Date of Birth Display

```typescript
// Given: Backend returns date
const apiResponse = {
  dateOfBirth: "1999-09-01T00:00:00"
}

// When: Frontend processes it
const dateValue = apiResponse.dateOfBirth?.split('T')[0]

// Then: Correct date extracted
expect(dateValue).toBe("1999-09-01")  // ✅ Not "1999-08-31"
```

### Test 2: Password Change Flow

```typescript
// Given: User is logged in
expect(isAuthenticated).toBe(true)
expect(localStorage.getItem('auth-storage')).toBeTruthy()

// When: User changes password successfully
await changePassword({
  currentPassword: "OldPass123",
  newPassword: "NewPass123",
  confirmPassword: "NewPass123"
})

// Wait for redirect delay
await new Promise(resolve => setTimeout(resolve, 2000))

// Then: User is logged out and redirected
expect(isAuthenticated).toBe(false)
expect(localStorage.getItem('auth-storage')).toBeNull()
expect(window.location.pathname).toBe("/login")
```

### Test 3: Round-trip Date Preservation

```typescript
// 1. User views profile
// Backend: "dateOfBirth": "1999-09-01T00:00:00"
// Frontend input shows: 1999-09-01 ✅

// 2. User updates other fields (not date)
await updateProfile({ firstName: "NewName" })

// 3. Refresh profile
await getProfile(true)

// 4. Date unchanged
expect(user.dateOfBirth).toBe("1999-09-01T00:00:00")  // ✅
expect(inputValue).toBe("1999-09-01")  // ✅
```

## Benefits

### Date of Birth Fix

| Aspect | Before | After |
|--------|--------|-------|
| Timezone issue | ❌ Yes | ✅ No |
| Conversion overhead | ❌ Heavy | ✅ Light |
| Accuracy | ❌ Off by 1 day | ✅ Exact |
| Code complexity | ❌ High | ✅ Simple |

### Password Change Fix

| Aspect | Before | After |
|--------|--------|-------|
| Session sync | ❌ Mismatch | ✅ Synced |
| Security | ❌ Stale tokens | ✅ Forced re-login |
| User experience | ❌ Confusing | ✅ Clear |
| Error handling | ❌ 401 errors | ✅ Proactive logout |

## Common Pitfalls Avoided

### ❌ Don't use Date constructor for date-only values
```typescript
// BAD - Timezone issues
new Date("1999-09-01T00:00:00")
```

### ✅ Use string manipulation for date-only values
```typescript
// GOOD - No timezone conversion
"1999-09-01T00:00:00".split('T')[0]
```

### ❌ Don't keep user logged in after password change
```typescript
// BAD - Stale session
if (result.isSuccess) {
  toast({ title: "Success" })
  // User still logged in with old session ❌
}
```

### ✅ Always logout after password change
```typescript
// GOOD - Force re-login
if (result.isSuccess) {
  toast({ title: "Success, please login again" })
  logout()
  router.push("/login")  // ✅
}
```

## Security Implications

### Password Change Logout

**Why it's important:**
1. **Revoke old sessions:** User might have changed password because of security concerns
2. **Prevent session hijacking:** All devices must re-authenticate
3. **Best practice:** Industry standard (Google, Facebook, etc. all do this)

**Backend enforcement:**
```csharp
// IdentityService.cs
user.RefreshToken = null;  // Invalidate on server
user.RefreshTokenExpiryTime = null;
```

**Frontend enforcement:**
```typescript
// ChangePasswordForm.tsx
logout()  // Clear on client
router.push("/login")  // Force re-login
```

**Defense in depth:** Both backend AND frontend enforce logout

## Alternative Approaches

### Date Handling

#### Option 1: Use date-fns or moment (Current approach rejects this)
```typescript
import { format, parseISO } from 'date-fns'
const date = format(parseISO(user.dateOfBirth), 'yyyy-MM-dd')
```
**Cons:** Extra dependency, overkill for simple string split

#### Option 2: Use UTC methods
```typescript
const date = new Date(user.dateOfBirth)
const dateStr = `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`
```
**Cons:** More complex, still creates Date object

#### Option 3: String split (Current solution) ✅
```typescript
const dateStr = user.dateOfBirth?.split('T')[0]
```
**Pros:** Simple, fast, no dependencies, no timezone issues

### Password Change Logout

#### Option 1: Immediate logout (Too abrupt)
```typescript
if (result.isSuccess) {
  logout()
  router.push("/login")
}
```

#### Option 2: Delayed logout (Current solution) ✅
```typescript
if (result.isSuccess) {
  toast({ ... })
  setTimeout(() => {
    logout()
    router.push("/login")
  }, 1500)
}
```

#### Option 3: User choice (Too complex)
```typescript
if (result.isSuccess) {
  const confirm = await showDialog("Logout now?")
  if (confirm) logout()
}
```

## Summary

### Date of Birth Fix
- ✅ Changed `dateOfBirth` type from `Date` to `string` in `ProfileResponse`
- ✅ Use `.split('T')[0]` instead of `new Date().toISOString().split('T')[0]`
- ✅ Eliminates timezone conversion issues
- ✅ Displays correct date from backend

### Password Change Logout Fix
- ✅ Added `requiresLogout` flag to `changePassword` return type
- ✅ Backend clears all sessions → Frontend auto-logout
- ✅ Show success message → Wait 1.5s → Logout → Redirect
- ✅ Synchronizes auth state between backend and frontend
- ✅ Improves security by forcing re-authentication

Both fixes ensure data accuracy and security alignment between frontend and backend! 🎉

