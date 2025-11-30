# Wishlist Logout State Clear Fix

## Issue
When users logged out, wishlist items remained visible in the navbar (heart icon with count) until the page was refreshed. This was inconsistent with the cart behavior, which cleared immediately on logout.

## Root Cause
The wishlist service was missing a `clearWishlistState()` method that the cart service already had. The navbar's logout handler was clearing the cart state but not the wishlist state.

## Solution

### 1. Added `clearWishlistState()` Method to Wishlist Service
**File**: `src/entities/wishlist/service/wishlist-service.ts`

Added a new method to clear the wishlist state without making an API call:

```typescript
// Clear wishlist state (without API call - for logout/unauthorized)
clearWishlistState: () => {
  set({
    wishlist: null,
    isLoading: false,
    error: null,
  })
},
```

This method resets the wishlist state to its initial values, immediately removing all wishlist data from the UI.

### 2. Updated TypeScript Interface
**File**: `src/entities/wishlist/type/wishlist.ts`

Added the method signature to the `WishlistState` interface:

```typescript
export interface WishlistState {
  // ... existing properties
  clearWishlistState: () => void
  // ... other methods
}
```

### 3. Updated Navbar Logout Handler
**File**: `src/widgets/layout/navbar.tsx`

Modified the logout handler to clear both cart and wishlist states:

```typescript
import { useWishlistStore } from "@/src/entities/wishlist/service"

export function Navbar() {
  const { clearCartState } = useCartStore()
  const { clearWishlistState } = useWishlistStore()

  const handleLogout = async () => {
    // Clear cart and wishlist immediately before logout
    clearCartState()
    clearWishlistState()
    await logout()
    router.push("/login")
  }
}
```

### 4. Added Logout Detection to Wishlist Popup
**File**: `src/widgets/wishlist/wishlist-popup.tsx`

Added an effect to close the wishlist popup when user logs out:

```typescript
// Close popup and reset when user logs out
useEffect(() => {
  if (!isAuthenticated) {
    setIsOpen(false)
    wishlistFetchedRef.current = false
  }
}, [isAuthenticated])
```

## Implementation Pattern
This fix follows the exact same pattern already implemented for the cart:

1. **State Clearing Method**: Both cart and wishlist services have `clearXxxState()` methods
2. **Logout Handler**: Navbar calls both clear methods before logout
3. **Popup Behavior**: Both popups close when authentication state changes to false

## Testing
To verify the fix:

1. Log in to the application
2. Add items to your wishlist (heart icon should show item count)
3. Click logout
4. **Expected**: Heart icon should immediately show 0 items without requiring a page refresh
5. **Expected**: Wishlist popup should close automatically

## Benefits

- **Consistency**: Wishlist now behaves identically to cart on logout
- **Better UX**: No stale data shown to users after logout
- **Security**: Prevents displaying previous user's data in the UI
- **Clean State**: Ensures fresh state when a new user logs in

## Files Modified

1. `src/entities/wishlist/service/wishlist-service.ts` - Added clearWishlistState method
2. `src/entities/wishlist/type/wishlist.ts` - Updated interface
3. `src/widgets/layout/navbar.tsx` - Updated logout handler
4. `src/widgets/wishlist/wishlist-popup.tsx` - Added logout detection
