# Error Display Fix - Detailed Validation Errors

## Problem

Khi backend trả về validation errors chi tiết (ví dụ: "Phone number already exists"), frontend chỉ hiển thị message chung chung "Validation failed" thay vì các lỗi cụ thể.

### Backend Response Example
```json
{
    "isSuccess": false,
    "message": "Validation failed",
    "errors": [
        "Phone number already exists",
        "Email is already in use"
    ],
    "errorCode": "ValidationFailed"
}
```

### Previous Frontend Behavior
❌ **Toast chỉ hiển thị:** "Validation failed"  
✅ **Should display:** "Phone number already exists, Email is already in use"

## Root Cause

1. **API Client** đã trả về `errors` array correctly (line 154 in `api-client.ts`)
2. **Auth Service** chỉ trả về `error` (singular) không có `errors` (plural array)
3. **UI Forms** chỉ hiển thị `result.error` thay vì `result.errors`

### Flow of Error Data

```
Backend → API Client → Auth Service → UI Forms → Toast
   ✅         ✅            ❌           ❌        ❌
(has errors) (passes)   (drops)    (doesn't use) (shows generic)
```

## Solution

### 1. Update Type Definitions

**File:** `nekovi-customer-web/src/entities/auth/type/auth.ts`

```typescript
// Before
login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>

// After
login: (credentials: LoginCredentials) => Promise<{ 
  success: boolean; 
  error?: string; 
  errors?: string[] 
}>
```

Applied to all auth methods: `login`, `register`, `verifyOtp`, `resetPassword`

### 2. Update Auth Service to Return Errors Array

**File:** `nekovi-customer-web/src/entities/auth/service/auth-service.ts`

**Before:**
```typescript
return { 
  success: false, 
  error: result.message || "Login failed" 
}
```

**After:**
```typescript
return { 
  success: false, 
  error: result.message || "Login failed",
  errors: result.errors || []  // ✅ Pass through errors array
}
```

Applied to:
- ✅ `login()` method
- ✅ `register()` method
- ✅ `verifyOtp()` method
- ✅ `resetPassword()` method

### 3. Update UI Forms to Display Errors Array

**Applied to all forms:**
- ✅ `LoginForm.tsx`
- ✅ `RegisterForm.tsx` (register + resend OTP + verify OTP)
- ✅ `ForgotPasswordForm.tsx` (all 3 steps)

**Before:**
```typescript
toast({
  title: "Đăng ký thất bại",
  description: result.error || "Vui lòng thử lại sau",
  variant: "destructive",
})
```

**After:**
```typescript
const errorMessage = result.errors && result.errors.length > 0 
  ? result.errors.join(", ")  // ✅ Join all errors with comma
  : result.error || "Vui lòng thử lại sau"

toast({
  title: "Đăng ký thất bại",
  description: errorMessage,
  variant: "destructive",
})
```

## Result

### Now When User Gets Validation Error:

**Backend returns:**
```json
{
  "isSuccess": false,
  "message": "Validation failed",
  "errors": [
    "Phone number already exists",
    "Email is already in use"
  ]
}
```

**Frontend displays:**
```
Title: "Đăng ký thất bại"
Description: "Phone number already exists, Email is already in use"
```

### Examples of Improved Error Messages

#### Registration
- ❌ Before: "Validation failed"
- ✅ After: "Phone number already exists, Email format is invalid"

#### Login
- ❌ Before: "Login failed"
- ✅ After: "Invalid credentials, Account is locked"

#### Forgot Password
- ❌ Before: "Request failed"
- ✅ After: "User not found, Invalid email format"

#### OTP Verification
- ❌ Before: "Verification failed"
- ✅ After: "OTP expired, Invalid OTP code"

## Error Message Formatting

### Single Error
```json
{ "errors": ["Phone number already exists"] }
```
**Display:** "Phone number already exists"

### Multiple Errors
```json
{ 
  "errors": [
    "Phone number already exists",
    "Email is already in use"
  ] 
}
```
**Display:** "Phone number already exists, Email is already in use"

### No Errors Array (Fallback)
```json
{ 
  "message": "Something went wrong"
  // no errors array
}
```
**Display:** "Something went wrong"

### Network Error (Exception)
```javascript
catch (error) {
  return { 
    success: false, 
    error: "Network error", 
    errors: ["Network error"] 
  }
}
```
**Display:** "Network error"

## Testing Checklist

### Register Form
- [ ] Try registering with existing phone number
- [ ] Try registering with existing email
- [ ] Try registering with invalid email format
- [ ] Try registering with weak password
- [ ] Verify all errors display clearly

### Login Form
- [ ] Try wrong email/password
- [ ] Try with locked account (if applicable)
- [ ] Try with unverified account (if applicable)

### Forgot Password Form
- [ ] Try with non-existent email
- [ ] Try with invalid email format
- [ ] Try wrong OTP code
- [ ] Try expired OTP

### OTP Verification
- [ ] Try invalid OTP
- [ ] Try expired OTP
- [ ] Try OTP with wrong length

## Backend Error Response Standards

All backend errors should follow this structure:

```csharp
return Result.Failure(
    message: "Validation failed",
    errorCode: ErrorCodeEnum.ValidationFailed,
    errors: new List<string> 
    { 
        "Phone number already exists",
        "Email is already in use"
    }
);
```

## Benefits

1. ✅ **Better UX:** Users see exactly what went wrong
2. ✅ **Easier Debugging:** Developers can see specific validation failures
3. ✅ **Consistent Error Handling:** All forms handle errors the same way
4. ✅ **Multilingual Ready:** Errors array can be localized by backend
5. ✅ **No Information Loss:** All backend errors reach the user

## Future Improvements

### Option 1: Display Errors as List
Instead of joining with comma, display as bullet points:

```typescript
const errorList = result.errors && result.errors.length > 0
  ? result.errors.map(err => `• ${err}`).join("\n")
  : result.error || "Unknown error"
```

**Display:**
```
• Phone number already exists
• Email is already in use
```

### Option 2: Field-Specific Errors
Map errors to specific form fields:

```typescript
interface FieldError {
  field: string
  message: string
}

errors: [
  { field: "phoneNumber", message: "Phone already exists" },
  { field: "email", message: "Email already in use" }
]
```

### Option 3: Toast Per Error
Show separate toast for each error (max 3):

```typescript
result.errors?.slice(0, 3).forEach(error => {
  toast({
    title: "Validation Error",
    description: error,
    variant: "destructive",
  })
})
```

## Related Files

- `src/core/lib/api-client.ts` - Handles API responses
- `src/entities/auth/type/auth.ts` - Type definitions
- `src/entities/auth/service/auth-service.ts` - Auth state management
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`
- `src/features/auth/components/ForgotPasswordForm.tsx`
- `src/hooks/use-toast.ts` - Toast notification system

## Deployment Checklist

- [x] Update type definitions
- [x] Update auth service
- [x] Update all form components
- [x] Build passes without errors
- [x] No linter errors
- [ ] Test all error scenarios
- [ ] Test on staging environment
- [ ] Deploy to production

