# Testing Guide - Toast Notifications & Auth Flow

## Overview
This guide helps you test the authentication system and verify that toast notifications are working correctly.

## Prerequisites
```bash
cd d:\MyLearning\Ky8\EXE201\nekovi-customer-web
npm run dev
```

## 1. Test Toast Notifications

### Login Page (`/login`)

**Test Success Toast:**
1. Navigate to `http://localhost:3000/login`
2. Enter valid credentials
3. Click "Đăng nhập"
4. ✅ **Expected:** Green toast appears top-right: "Đăng nhập thành công"

**Test Error Toast:**
1. Enter invalid credentials (wrong email/password)
2. Click "Đăng nhập"
3. ✅ **Expected:** Red toast appears: "Đăng nhập thất bại"

### Register Page (`/register`)

**Test OTP Send Toast:**
1. Navigate to `http://localhost:3000/register`
2. Fill in all fields (Tên, Họ, Email, Số điện thoại, Mật khẩu)
3. Click "Tiếp tục"
4. ✅ **Expected:** Toast appears: "Mã OTP đã được gửi"
5. ✅ **Expected:** Page shows OTP input screen

**Test Password Mismatch Toast:**
1. Fill form but make passwords different
2. Click "Tiếp tục"
3. ✅ **Expected:** Red toast: "Mật khẩu không khớp"

**Test OTP Verification:**
1. After receiving OTP email, enter the 6-digit code
2. Click "Xác thực"
3. ✅ **Expected:** Toast: "Đăng ký thành công"
4. ✅ **Expected:** Redirect to `/login`

**Test OTP Paste:**
1. Copy OTP code (e.g., `123456`)
2. Click any OTP input box
3. Press `Ctrl+V`
4. ✅ **Expected:** All 6 boxes filled automatically

**Test Resend OTP:**
1. Wait 60 seconds on OTP screen
2. Click "Gửi lại mã OTP" (becomes enabled)
3. ✅ **Expected:** Toast: "Mã OTP đã được gửi lại"
4. ✅ **Expected:** Countdown resets to 60s

### Forgot Password Page (`/forgot-password`)

**Test Full Flow:**

**Step 1 - Enter Contact:**
1. Navigate to `http://localhost:3000/forgot-password`
2. Enter email or phone number
3. Click "Tiếp tục"
4. ✅ **Expected:** Move to password entry screen

**Step 2 - Enter New Password:**
1. Enter new password
2. Enter confirm password
3. Click "Tiếp tục"
4. ✅ **Expected:** Toast: "Mã OTP đã được gửi"
5. ✅ **Expected:** Move to OTP verification screen

**Step 3 - Verify OTP:**
1. Enter 6-digit OTP from email/SMS
2. Click "Xác thực"
3. ✅ **Expected:** Toast: "Đặt lại mật khẩu thành công"
4. ✅ **Expected:** Redirect to `/login`

**Test Error Cases:**
1. Password mismatch → Toast: "Mật khẩu không khớp"
2. Wrong OTP → Toast: "Xác thực thất bại"
3. Resend too quickly → Toast: "Gửi lại mã OTP thất bại" (rate limit)

## 2. Test Route Protection

### Protected Routes
These pages require authentication:
- `/profile`
- `/orders`
- `/wishlist`

**Test Redirect:**
1. Logout (if logged in)
2. Try to access `/profile` directly
3. ✅ **Expected:** Redirected to `/login`

**Test Access After Login:**
1. Login successfully
2. Navigate to `/profile`
3. ✅ **Expected:** Profile page loads

**Test Logout:**
1. While logged in, click profile icon → "Đăng xuất"
2. Click confirm
3. ✅ **Expected:** Redirected to homepage
4. Try accessing `/profile`
5. ✅ **Expected:** Redirected to `/login`

## 3. Test Navbar State

**When Logged Out:**
1. ✅ **Expected:** Shows "Đăng nhập" and "Đăng ký" buttons

**When Logged In:**
1. ✅ **Expected:** Shows profile icon with user's name
2. Click icon
3. ✅ **Expected:** Dropdown shows:
   - User's full name (firstName + lastName)
   - User's email
   - "Trang cá nhân" link
   - "Đơn hàng" link
   - "Danh sách yêu thích" link
   - "Đăng xuất" button

## 4. Test State Persistence

**Test Page Reload:**
1. Login successfully
2. Refresh page (`F5`)
3. ✅ **Expected:** Still logged in (profile icon shows)
4. Navigate to `/profile`
5. ✅ **Expected:** Profile data loads (not redirected)

**Test Browser Close/Reopen:**
1. Login successfully
2. Close browser
3. Reopen and go to site
4. ✅ **Expected:** Still logged in (Zustand persist works)

## 5. Test Multiple Toasts

**Trigger Multiple Actions:**
1. Open 3 different tabs with forms
2. Submit all 3 quickly
3. ✅ **Expected:** Max 3 toasts shown at once
4. ✅ **Expected:** Toasts auto-dismiss after 5 seconds

## 6. Inspect Toast Rendering

**Open Browser DevTools:**
1. Press `F12`
2. Go to "Elements" tab
3. Trigger a toast (e.g., login error)
4. Look for `<ToastViewport>` element in DOM
5. ✅ **Expected:** See toast component rendered with:
   - `<ToastTitle>` (e.g., "Đăng nhập thất bại")
   - `<ToastDescription>` (e.g., error message)
   - Close button (X)

**Check Console:**
1. Open Console tab
2. Trigger actions
3. ✅ **Expected:** No errors related to toast
4. ✅ **Expected:** API calls logged (if enabled)

## Common Issues & Solutions

### Toast Not Showing

**Check 1: Toaster Component**
```typescript
// src/app/layout.tsx should have:
<Toaster />
```

**Check 2: Toast Import**
```typescript
// Forms should import:
import { useToast } from "@/src/hooks/use-toast"
const { toast } = useToast()
```

**Check 3: Browser Cache**
```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

### OTP Not Received

1. Check backend logs for email/SMS sending errors
2. Verify `OtpCacheService` is working
3. Check email spam folder
4. Ensure backend email/SMS credentials are correct

### State Not Persisting

1. Check browser LocalStorage:
   - F12 → Application → Local Storage
   - Look for `customer-auth-store`
2. Verify Zustand persist config in `auth-service.ts`
3. Clear browser cache if corrupted

## Backend Verification

### Check OTP in Backend Logs
```
[INF] OTP sent successfully to user@example.com via email for reset password
```

### Check Rate Limiting
If getting "Too many requests" error:
- Backend limits OTP requests to 1 per 60 seconds
- Wait 60 seconds before resending
- Frontend countdown matches this limit

## Success Criteria

✅ All toasts visible and styled correctly
✅ All auth flows complete successfully  
✅ Route protection works as expected
✅ State persists across page reloads
✅ OTP paste and countdown work
✅ No console errors
✅ Navbar updates based on auth state

## Debug Mode

To enable detailed logging:

```typescript
// In api-client.ts, add:
console.log('API Request:', endpoint, data)
console.log('API Response:', result)

// In auth-service.ts, add:
console.log('Auth State:', state)
```

## Browser Compatibility

Tested on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Edge 120+
- ✅ Safari 17+

## Performance Notes

- Toast animations use CSS transitions (60fps)
- Max 3 toasts prevent UI clutter
- Auto-dismiss prevents memory buildup
- Zustand persist uses localStorage (5MB limit)

