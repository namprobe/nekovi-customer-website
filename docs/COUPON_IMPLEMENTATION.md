# Coupon System Implementation

## Overview
Implemented a complete coupon collection system for users following the wishlist pattern. Users can browse available coupons and collect them for later use during checkout.

## Backend Implementation

### 1. API Controller (`CouponController.cs`)
**Location:** `src/NekoViBE.API/Controllers/Customer/CouponController.cs`

**Endpoints:**
- `GET /api/customer/coupons/available` - Get all available coupons (public endpoint)
- `GET /api/customer/coupons/my-coupons` - Get user's collected coupons (requires auth)
- `POST /api/customer/coupons/collect` - Collect a coupon (requires auth)

### 2. Application Layer

#### DTOs Created:
- **CollectCouponRequest.cs** - Request model for collecting coupons
- **AvailableCouponsResponse.cs** - Response model for available coupons list
- **UserCouponsResponse.cs** - Response model for user's collected coupons

#### Queries:
- **GetAvailableCouponsQuery** - Fetches coupons that are:
  - Active
  - Within date range (StartDate <= now <= EndDate)
  - Have remaining slots (if usage limit exists)
  - Includes `isCollected` flag for authenticated users

- **GetUserCouponsQuery** - Fetches user's collected coupons with:
  - Collection date
  - Usage status
  - Expiry status

#### Commands:
- **CollectCouponCommand** - Handles coupon collection with validations:
  - User authentication check
  - Coupon exists and is active
  - Coupon date range validation
  - Usage limit validation
  - Duplicate collection prevention
  - Increments `CurrentUsage` counter

### 3. Database Entities Used
- **Coupon** - Main coupon entity
- **UserCoupon** - Junction table linking users to collected coupons

## Frontend Implementation

### 1. Entity Layer

**Location:** `src/entities/coupon/`

**Files Created:**
- `type/coupon.ts` - TypeScript interfaces matching backend DTOs
- `service/coupon-service.ts` - Zustand store for state management
- `service/index.ts` - Export barrel

**Zustand Store Features:**
- `availableCoupons` - List of available coupons
- `userCoupons` - List of user's collected coupons
- `fetchAvailableCoupons()` - Fetch available coupons
- `fetchUserCoupons()` - Fetch user's coupons
- `collectCoupon()` - Collect a coupon
- `isCollected()` - Check if coupon is already collected

### 2. Coupon Page

**Location:** `src/app/coupons/page.tsx`

**Features:**
- Grid display of available coupons
- Visual badges for:
  - Already collected coupons
  - Expiring soon coupons (within 3 days)
- Coupon information display:
  - Discount amount (percentage or fixed)
  - Coupon code
  - Description
  - Minimum order amount
  - Valid date range
  - Remaining slots
- "Collect" button with states:
  - Disabled if already collected
  - Requires login if not authenticated
  - Shows success/error toasts
- Loading and error states
- Empty state when no coupons available

### 3. Navigation Integration

**Modified:** `src/widgets/layout/navbar.tsx`
- Added "Khuyến mãi" link to main navigation
- Positioned between "Sản Phẩm" and "Bảng tin"

### 4. Configuration

**Modified:** `src/core/config/env.ts`
- Added COUPON endpoints:
  - `AVAILABLE` - `/coupons/available`
  - `MY_COUPONS` - `/coupons/my-coupons`
  - `COLLECT` - `/coupons/collect`

## Key Differences from Wishlist Implementation

### Backend:
1. **No Toggle Logic** - Coupons are only collected once (no remove endpoint)
2. **Usage Limit Tracking** - Increments `CurrentUsage` when collected
3. **Public Endpoint** - Available coupons can be viewed without login
4. **Duplicate Prevention** - Checks for existing UserCoupon before collecting

### Frontend:
1. **No Direct Store Access in Components** - Unlike wishlist bug, coupon collect button uses store properly
2. **Public Page** - Coupons page accessible without authentication
3. **Authentication Gate** - Collect action requires login, redirects if not authenticated
4. **No Toggle UI** - Collect button disabled after collection (not removable)

## Usage Flow

1. **User browses coupons:**
   - Visit `/coupons` page
   - View all available coupons
   - No login required to browse

2. **User collects coupon:**
   - Click "Thu thập ngay" button
   - If not logged in → redirect to login
   - If logged in → create UserCoupon record
   - Increment CurrentUsage counter
   - Update UI to show "Đã thu thập"

3. **Validation checks:**
   - Coupon must be active
   - Coupon must be within valid date range
   - Coupon must have available slots
   - User cannot collect same coupon twice

## Testing Checklist

### Backend:
- [ ] Available coupons endpoint works without auth
- [ ] My coupons endpoint requires authentication
- [ ] Collect coupon requires authentication
- [ ] Cannot collect expired coupon
- [ ] Cannot collect inactive coupon
- [ ] Cannot collect when usage limit reached
- [ ] Cannot collect same coupon twice
- [ ] CurrentUsage increments correctly

### Frontend:
- [ ] Coupon page loads without authentication
- [ ] Collect button redirects to login if not authenticated
- [ ] Collect button works when authenticated
- [ ] Success toast appears on successful collection
- [ ] Error toast appears on failure
- [ ] UI updates after collection (button disabled)
- [ ] Expiring soon badge shows for coupons within 3 days
- [ ] Collected badge shows for already collected coupons
- [ ] Loading state displays while fetching
- [ ] Error state displays on API failure
- [ ] Empty state displays when no coupons available

## Future Enhancements

1. **Coupon Usage** - Integrate with checkout to apply collected coupons
2. **My Coupons Page** - Dedicated page to view user's collected coupons
3. **Expiry Notifications** - Notify users of expiring coupons
4. **Coupon Categories** - Filter coupons by product category
5. **Sharing** - Allow users to share coupons
6. **Analytics** - Track coupon collection and usage rates
