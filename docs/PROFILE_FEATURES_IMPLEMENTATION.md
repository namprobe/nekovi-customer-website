# Profile Features Implementation

## Tổng quan
Triển khai đầy đủ các tính năng quản lý profile người dùng bao gồm:
- Change Password (Đổi mật khẩu)
- Update Profile (Cập nhật thông tin cá nhân, bao gồm avatar)
- User Address Management (Quản lý địa chỉ giao hàng - CRUD đầy đủ)

## Files Created/Updated

### 1. Backend Integration

#### Auth Types & Services
**File:** `src/entities/auth/type/auth.ts`
- Added `ChangePasswordRequest` interface
- Added `UpdateProfileRequest` interface
- Updated `AuthState` to include `changePassword` and `updateProfile` actions

**File:** `src/entities/auth/service/auth-service.ts`
- Implemented `changePassword` action
- Implemented `updateProfile` action with `FormData` support for avatar upload
- Profile refresh after successful update

#### User Address Types & Services
**File:** `src/entities/user-address/type/user-address.ts`
- Defined `UserAddressItem` interface
- Defined `UserAddressDetail` interface
- Defined `UserAddressRequest` interface
- Defined `UserAddressFilter` interface
- Added `AddressTypeEnum` (Home = 0, Office = 1, Other = 2)
- Added `EntityStatusEnum` (Active = 0, Inactive = 1)

**File:** `src/entities/user-address/service/user-address-service.ts`
- Created Zustand store for address management
- Implemented `getAddresses` with pagination support
- Implemented `getAddressById`
- Implemented `createAddress`
- Implemented `updateAddress`
- Implemented `deleteAddress`
- All actions return `{ success, error?, errors? }` for consistent error handling

**File:** `src/entities/user-address/service/index.ts`
- Barrel export for user address services

#### API Configuration
**File:** `src/core/config/env.ts`
- Added `CHANGE_PASSWORD: "/customer/auth/change-password"`
- Added `UPDATE_PROFILE: "/customer/auth/update-profile"`
- Added `USER_ADDRESS: "/customer/user-address"` with CRUD endpoints

#### Auth Hook
**File:** `src/core/hooks/use-auth.tsx`
- Exposed `changePassword` from auth store
- Exposed `updateProfile` from auth store

### 2. Feature Components (Clean Architecture)

#### Change Password Form
**File:** `src/features/profile/components/ChangePasswordForm.tsx`
- Current password input
- New password input
- Confirm password input
- Client-side validation
- Toast notifications for success/error
- Password mismatch validation

#### Update Profile Form
**File:** `src/features/profile/components/UpdateProfileForm.tsx`
- Avatar upload with preview
- First name & last name fields
- Email (read-only, display only)
- Phone number
- Gender selection (dropdown: Nam, Nữ, Khác)
- Date of birth (date picker)
- Bio/description (textarea with 500 char limit)
- File validation (image types, max 5MB)
- `FormData` submission for avatar upload

#### User Address Manager
**File:** `src/features/profile/components/UserAddressManager.tsx`
- **List View:**
  - Display all addresses in card grid
  - Show address type icon (Home/Office/Other)
  - Highlight default address
  - Edit and Delete buttons
- **Add/Edit Dialog:**
  - Full name
  - Phone number
  - Address (street)
  - City
  - State/District (optional)
  - Postal code
  - Country (default: Vietnam)
  - Address type dropdown (Home/Office/Other)
  - Set as default checkbox
- **Delete Confirmation:**
  - AlertDialog for delete confirmation
  - Prevents accidental deletion
- **Empty State:**
  - User-friendly message when no addresses
  - CTA button to add first address

### 3. Page Integration

#### Profile Page
**File:** `src/app/profile/page.tsx`
- Wrapped with `AuthGuard` (protected route)
- User info card with avatar, name, email, badges
- Tabs for navigation:
  - **Thông tin** (Profile Info): `UpdateProfileForm`
  - **Địa chỉ** (Addresses): `UserAddressManager`
  - **Bảo mật** (Security): `ChangePasswordForm`
- Responsive design (mobile + desktop)

### 4. UI Components

#### shadcn/ui Components Added
- `textarea` - For bio/description fields
- `select` - For dropdowns (gender, address type)
- `dialog` - For add/edit address modal
- `alert-dialog` - For delete confirmation
- `tabs` - For profile page navigation

All components moved to `src/components/ui/` and imports fixed to use `@/src/` prefix.

## Architecture Principles

### Clean Architecture
1. **Entities Layer** (`src/entities/`)
   - Pure data types and business logic
   - Zustand stores for state management
   - API integration

2. **Features Layer** (`src/features/`)
   - Smart components with business logic
   - Reusable across pages
   - Self-contained UI logic

3. **App Layer** (`src/app/`)
   - Page wrappers
   - Route protection (AuthGuard)
   - Layout composition

### Type Safety
- All API requests/responses are fully typed
- TypeScript interfaces for all data structures
- Generic return types for async operations
- No `any` types used

### Error Handling
- Consistent error response format: `{ success, error?, errors? }`
- Display detailed validation errors from backend
- User-friendly toast notifications
- Fallback to generic error messages

### User Experience
1. **Loading States:**
   - Spinner during async operations
   - Disabled buttons during loading

2. **Validation:**
   - Client-side validation before API calls
   - Server-side validation feedback
   - Inline field validation

3. **Feedback:**
   - Toast notifications for all operations
   - Success messages
   - Detailed error messages

4. **Accessibility:**
   - Proper labels and ARIA attributes
   - Keyboard navigation support
   - Screen reader friendly

## API Endpoints

### Authentication
- `POST /customer/auth/change-password` - Change user password
- `POST /customer/auth/update-profile` - Update user profile (FormData)

### User Address
- `GET /customer/user-address` - Get paginated addresses
- `GET /customer/user-address/{id}` - Get address by ID
- `POST /customer/user-address` - Create new address
- `PUT /customer/user-address/{id}` - Update address
- `DELETE /customer/user-address/{id}` - Delete address

## Testing Checklist

### Change Password
- [ ] Can change password with valid current password
- [ ] Cannot change with wrong current password
- [ ] Password mismatch validation works
- [ ] Toast shows success/error messages
- [ ] Form resets after success

### Update Profile
- [ ] Can update basic info (name, phone, gender, DOB, bio)
- [ ] Can upload new avatar
- [ ] Avatar preview works
- [ ] File size validation (max 5MB)
- [ ] File type validation (images only)
- [ ] Profile refreshes after update
- [ ] Email is read-only

### User Address Management
- [ ] Can view all addresses
- [ ] Can add new address
- [ ] Can edit existing address
- [ ] Can delete address (with confirmation)
- [ ] Can set default address
- [ ] Default address is highlighted
- [ ] Empty state displays correctly
- [ ] All validations work (required fields)

## ESLint & Build Status
✅ All TypeScript types correct
✅ No ESLint errors
✅ Production build successful
✅ All imports resolved correctly

## Notes
- Avatar upload uses `FormData` for multipart/form-data
- Address type enum matches backend (0=Home, 1=Office, 2=Other)
- Gender enum matches backend (0=Male, 1=Female, 2=Other)
- All dates use ISO format for API communication
- Default country is "Vietnam" for address forms

## Future Enhancements
1. Email verification for email changes
2. Two-factor authentication
3. Address auto-complete using Google Maps API
4. Bulk address import/export
5. Profile completion percentage
6. Profile picture cropping tool
