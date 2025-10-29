# Forgot Password Flow

## Backend Design

The backend implements a 2-step process for password reset:

### Step 1: Reset Password Request (`/auth/reset-password`)
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "contact": "user@example.com",
  "newPassword": "newSecurePassword",
  "otpSentChannel": 1  // 1 = Email, 2 = SMS
}
```

**Backend Processing:**
1. Validates user exists by contact (email or phone)
2. Encrypts the new password using `PasswordCryptoHelper`
3. Generates a password reset token via Identity
4. Stores encrypted password + reset token in cache (key: contact + OtpType.PasswordReset)
5. Generates 6-digit OTP
6. Sends OTP to user via specified channel (email/SMS)

**Response:**
```json
{
  "isSuccess": true,
  "message": "Reset password initiated. Please verify the OTP sent to your email to complete the reset password process."
}
```

### Step 2: Verify OTP (`/auth/verify-otp`)
**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "contact": "user@example.com",
  "otp": "123456",
  "otpType": 2,  // 2 = PasswordReset
  "otpSentChannel": 1
}
```

**Backend Processing:**
1. Verifies OTP from cache
2. Retrieves cached data (encrypted password + reset token)
3. Decrypts the password
4. Calls Identity's `ResetPasswordAsync` with the token and plain password
5. Clears OTP and rate limit tracker from cache

**Response:**
```json
{
  "isSuccess": true,
  "message": "Password reset successfully."
}
```

## Frontend Implementation

### Flow Diagram
```
┌─────────────┐      ┌──────────────┐      ┌───────────┐
│ Enter       │      │ Enter New    │      │ Verify    │
│ Contact     │─────▶│ Password     │─────▶│ OTP       │─────▶ Login Page
│             │      │              │      │           │
└─────────────┘      └──────────────┘      └───────────┘
     Step 1               Step 2               Step 3
                    (API Call Here)
```

### Step 1: Collect Contact
- User enters email or phone number
- Detect channel type (email contains "@", otherwise phone)
- No API call yet - just validation and move to next step

### Step 2: Collect Password
- User enters new password + confirm password
- Validate password match and minimum length
- **API Call:** `POST /auth/reset-password` with `{ contact, newPassword, otpSentChannel }`
- Backend encrypts password, generates OTP, sends to user
- Move to Step 3

### Step 3: Verify OTP
- User enters 6-digit OTP
- **API Call:** `POST /auth/verify-otp` with `{ contact, otp, otpType: 2, otpSentChannel }`
- Backend verifies OTP and resets password
- Redirect to login page

### Resend OTP
When user clicks "Resend OTP":
- **API Call:** `POST /auth/reset-password` again with same `{ contact, newPassword, otpSentChannel }`
- New OTP generated and sent
- Reset countdown timer to 60 seconds

## Key Points

1. ✅ **Password is sent WITH the reset request**, not after OTP verification
2. ✅ **Backend handles encryption** - frontend sends plain password
3. ✅ **OTP verification automatically resets the password** - no separate reset API call needed
4. ✅ **Rate limiting: 60 seconds** - matches backend's OTP rate limit tracker
5. ✅ **OTP is cached with user data** - encrypted password + reset token
6. ❌ **Do NOT auto-login after password reset** - user must login with new credentials

## Security Features

1. **Password Encryption:** Backend encrypts password before caching using AES encryption
2. **Token-based Reset:** Uses Identity's built-in password reset token mechanism
3. **OTP Expiration:** OTP expires after configured time (default: 5 minutes)
4. **Rate Limiting:** Prevents OTP spam (60 seconds cooldown)
5. **Cache Cleanup:** OTP and cached data removed after successful verification

## Error Handling

### Common Errors
- **TooManyRequests (2005):** User requested OTP too frequently (< 60 seconds)
- **NotFound (3001):** User with given contact doesn't exist
- **ValidationFailed (2001):** Invalid OTP or OTP expired
- **InternalError (5001):** Email/SMS service failure

### Frontend Error Display
All errors are displayed using toast notifications with:
- **Title:** Brief error message
- **Description:** Detailed error from backend or fallback message
- **Variant:** "destructive" for errors

