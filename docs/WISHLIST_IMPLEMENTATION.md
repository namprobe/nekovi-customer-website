# Wishlist Feature Implementation

## Overview
This document describes the implementation of the Wishlist feature for the Nekovi customer website. The feature allows authenticated users to save their favorite products and manage them from a dedicated wishlist page.

## Architecture

### Frontend Structure

```
src/
├── entities/wishlist/
│   ├── type/
│   │   ├── wishlist.ts          # Type definitions
│   │   └── index.ts
│   └── service/
│       ├── wishlist-service.ts  # Zustand store with API calls
│       └── index.ts
├── widgets/wishlist/
│   └── wishlist-popup.tsx       # Navbar wishlist popup component
├── app/wishlist/
│   └── page.tsx                 # Full wishlist page
└── core/config/
    └── env.ts                   # Updated with WISHLIST endpoints
```

### Backend Structure (Reference)

```
src/NekoViBE.API/Controllers/Customer/
└── WishlistController.cs

src/NekoViBE.Application/
├── Common/DTOs/Wishlist/
│   ├── GetWishlistResponse.cs
│   ├── WishlistItemDto.cs
│   └── AddToWishlistRequest.cs
└── Features/Wishlist/
    ├── Commands/
    │   ├── AddToWishlist/
    │   └── RemoveFromWishlist/
    └── Queries/
        └── GetWishlist/
```

## API Endpoints

### 1. GET /api/customer/wishlist
- **Purpose**: Fetch user's wishlist
- **Authentication**: Required
- **Response**:
```json
{
  "isSuccess": true,
  "data": {
    "wishlistId": "guid",
    "items": [
      {
        "wishlistItemId": "guid",
        "productId": "guid",
        "product": {
          "id": "guid",
          "name": "string",
          "price": 0,
          "stockQuantity": 0,
          "primaryImage": "string",
          "averageRating": 0,
          "reviewCount": 0
        },
        "addedAt": "datetime"
      }
    ]
  }
}
```

### 2. POST /api/customer/wishlist
- **Purpose**: Add or remove product from wishlist (Toggle)
- **Authentication**: Required
- **Request Body**:
```json
{
  "productId": "guid"
}
```
- **Behavior**: 
  - If product exists in wishlist → removes it
  - If product doesn't exist → adds it
  - Auto-creates wishlist if user doesn't have one

### 3. DELETE /api/customer/wishlist/{productId}
- **Purpose**: Remove specific product from wishlist
- **Authentication**: Required
- **Parameters**: productId (GUID in URL)

## Frontend Implementation

### State Management (Zustand)

The wishlist uses Zustand for state management with the following actions:

```typescript
interface WishlistState {
  wishlist: WishlistResponse | null
  isLoading: boolean
  error: string | null
  
  fetchWishlist: () => Promise<void>
  addToWishlist: (request: AddToWishlistRequest) => Promise<Result>
  removeFromWishlist: (productId: string) => Promise<Result>
  isInWishlist: (productId: string) => boolean
  clearError: () => void
}
```

### Usage in Components

#### 1. Product Card
```typescript
import { useWishlistStore } from '@/src/entities/wishlist/service'

const { isInWishlist, addToWishlist } = useWishlistStore()
const isLiked = isInWishlist(product.id)

// Toggle wishlist
await addToWishlist({ productId: product.id })
```

#### 2. Wishlist Page
```typescript
const { wishlist, fetchWishlist, removeFromWishlist } = useWishlistStore()

useEffect(() => {
  fetchWishlist()
}, [])
```

## User Flow

### 1. Adding to Wishlist
1. User browses products at `/products`
2. Clicks heart icon on product card
3. Product is added to wishlist (or removed if already added)
4. Heart icon fills with red color
5. Wishlist count badge updates in navbar

### 2. Viewing Wishlist
1. User clicks heart icon in navbar
2. Popup shows first 3 wishlist items
3. Click "Xem Tất Cả Yêu Thích" to go to full page
4. Full page at `/wishlist` shows all items

### 3. Managing Wishlist
- **Add to Cart**: Click "Thêm vào giỏ" button
- **Remove**: Click trash icon (in popup or page)
- **View Product**: Click on product image or name

## Features

### Product Cards
- ✅ Heart icon with toggle functionality
- ✅ Visual feedback (filled heart when liked)
- ✅ Synced across all product listings
- ✅ Disabled state for out-of-stock items

### Navbar Popup
- ✅ Shows wishlist count badge
- ✅ Displays first 3 items
- ✅ Quick actions: Add to cart, Remove
- ✅ Link to full wishlist page
- ✅ Empty state message

### Wishlist Page (`/wishlist`)
- ✅ Protected route (requires authentication)
- ✅ Grid layout of all wishlist items
- ✅ Product information display
- ✅ Stock quantity indicators
- ✅ Rating display
- ✅ Quick add to cart
- ✅ Remove from wishlist
- ✅ Loading states
- ✅ Error handling
- ✅ Empty state with CTA

## Authentication

The wishlist feature requires user authentication:
- Wishlist data is user-specific
- UserId is extracted from JWT token on backend
- Frontend uses AuthGuard for wishlist page
- Popup only shows for authenticated users

## Error Handling

### Frontend
- Loading states during API calls
- Toast notifications for success/error
- Error boundary on wishlist page
- Retry mechanism for failed requests

### Backend
- Validation for productId
- Auto-creation of wishlist if not exists
- Proper error messages
- Authorization checks

## Performance Optimizations

1. **Lazy Loading**: Popup fetches data only when opened
2. **Caching**: Zustand store caches wishlist data
3. **Optimistic Updates**: UI updates before API response
4. **Debouncing**: Prevents rapid toggle clicks

## Testing Checklist

- [ ] Add product to wishlist from products page
- [ ] Remove product from wishlist
- [ ] Toggle wishlist (add/remove same product)
- [ ] View wishlist popup in navbar
- [ ] Navigate to full wishlist page
- [ ] Add to cart from wishlist
- [ ] Remove from wishlist page
- [ ] Test with empty wishlist
- [ ] Test with out-of-stock products
- [ ] Test authentication requirement
- [ ] Test error states
- [ ] Test loading states
- [ ] Verify wishlist count badge updates
- [ ] Verify heart icon visual state

## Future Enhancements

- [ ] Share wishlist with others
- [ ] Move all wishlist items to cart
- [ ] Email notifications for price drops
- [ ] Wishlist product recommendations
- [ ] Sort/filter wishlist items
- [ ] Pagination for large wishlists
- [ ] Wishlist product availability alerts

## Dependencies

### Frontend
- `zustand`: State management
- `@tanstack/react-query`: Could be added for better caching
- `lucide-react`: Icons (Heart, ShoppingCart, Trash2)

### Backend
- `MediatR`: CQRS pattern
- `Entity Framework Core`: Database access
- ASP.NET Core Identity: Authentication

## Configuration

Add to `.env.local`:
```bash
NEXT_PUBLIC_BASE_URL=https://localhost:7252
NEXT_PUBLIC_CUSTOMER_PREFIX=/api/customer
```

## Notes

- The backend uses a "lazy create" pattern - wishlist is created when first item is added
- The POST endpoint serves as a toggle - handles both add and remove
- ProductId is the only required parameter (UserId comes from token)
- Wishlist items are automatically removed if product is deleted
