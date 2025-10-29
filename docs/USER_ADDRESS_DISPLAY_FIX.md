# User Address Display & Edit Fix

## Vấn đề

### 1. Full Address không hiển thị

**Triệu chứng:**
- Backend trả về `fullAddress`: `"A31 Khu doi 2, Binh Gia Street, Ward 10, Vung Tau city, Bà Rịa–Vũng Tàu, Vietnam"`
- Frontend không hiển thị gì
- Giao diện trống

**Backend Response:**
```json
{
  "items": [
    {
      "fullName": "Nam Nguyen",
      "fullAddress": "A31 Khu doi 2, Binh Gia Street, Ward 10, Vung Tau city, Bà Rịa–Vũng Tàu, Vietnam",
      "isDefault": true,
      "phoneNumber": "0867619150",
      "id": "11721d4e-d654-43bf-819b-f3403c8e3027",
      ...
    }
  ]
}
```

**Nguyên nhân:**
```typescript
// Frontend cố access các field KHÔNG tồn tại trong response
<p>
  {address.address}, {address.city}  // ❌ undefined
  {address.state && `, ${address.state}`}, {address.postalCode}, {address.country}
</p>
```

Backend `UserAddressItem` CHỈ có:
- `fullName`
- `fullAddress` (concatenated)
- `isDefault`
- `phoneNumber`
- Base fields (`id`, `createdAt`, `status`, etc.)

Backend KHÔNG có:
- ❌ `address`
- ❌ `city`
- ❌ `state`
- ❌ `postalCode`
- ❌ `country`
- ❌ `addressType`

### 2. Runtime Error khi sửa địa chỉ

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'toString')
Source: src\features\profile\components\UserAddressManager.tsx (392:47)

value={formData.addressType.toString()}
                              ^
```

**Nguyên nhân:**
```typescript
// ❌ TRƯỚC
const handleOpenDialog = (address?: UserAddressItem) => {
  if (address) {
    setFormData({
      addressType: address.addressType,  // ❌ undefined! UserAddressItem không có field này
      fullName: address.fullName,
      address: address.address,  // ❌ undefined!
      city: address.city,  // ❌ undefined!
      ...
    })
  }
}
```

`UserAddressItem` (list response) không có các field riêng lẻ → tất cả đều `undefined` → `formData.addressType.toString()` lỗi!

## Nguyên nhân gốc

### Backend Architecture

**UserAddressItem.cs** (for list display):
```csharp
public class UserAddressItem : BaseResponse
{
    public string FullName { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;  // ✅ Concatenated
    public bool IsDefault { get; set; } = true;
    public string? PhoneNumber { get; set; }
}
```

**UserAddressDetail.cs** (for detail/edit):
```csharp
public class UserAddressDetail : BaseResponse
{
    public string FullName { get; set; } = string.Empty;
    public AddressTypeEnum AddressType { get; set; }  // ✅ Has it
    public string Address { get; set; } = string.Empty;  // ✅ Has it
    public string City { get; set; } = string.Empty;  // ✅ Has it
    public string? State { get; set; }
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = true;
    public string? PhoneNumber { get; set; }
}
```

**Mapping:**
```csharp
// UserAddressMappingProfile.cs
CreateMap<UserAddress, UserAddressItem>()
    .ForMember(dest => dest.FullAddress, 
        opt => opt.MapFrom(src => $"{src.Address}, {src.City}, {src.State}, {src.Country}"));

CreateMap<UserAddress, UserAddressDetail>();  // Maps all fields
```

### Frontend Mismatch

**Frontend `UserAddressItem` (TRƯỚC) - SAI:**
```typescript
export interface UserAddressItem {
  id: string
  userId: string
  addressType: AddressTypeEnum  // ❌ Backend không trả về
  fullName: string
  address: string  // ❌ Backend không trả về
  city: string  // ❌ Backend không trả về
  state?: string  // ❌ Backend không trả về
  postalCode: string  // ❌ Backend không trả về
  country: string  // ❌ Backend không trả về
  isDefault: boolean
  phoneNumber?: string
  status: EntityStatusEnum
  createdAt: Date
  updatedAt?: Date
}
```

**Mismatch:**
- Frontend expect 12+ fields
- Backend chỉ trả về 4 fields + base fields
- Runtime: Tất cả missing fields = `undefined`

## Giải pháp

### 1. Fix Frontend Types - Match Backend

**File:** `src/entities/user-address/type/user-address.ts`

```typescript
// ✅ SAU - Match backend UserAddressItem
export interface UserAddressItem {
  id: string
  fullName: string
  fullAddress: string  // ✅ Concatenated from backend
  isDefault: boolean
  phoneNumber?: string
  status: EntityStatusEnum
  createdAt: string
  updatedAt?: string
}

// ✅ SAU - Match backend UserAddressDetail
export interface UserAddressDetail {
  id: string
  fullName: string
  addressType: AddressTypeEnum  // ✅ Only in detail
  address: string  // ✅ Only in detail
  city: string  // ✅ Only in detail
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
  phoneNumber?: string
  status: EntityStatusEnum
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}
```

**Key Changes:**
- `UserAddressItem`: Chỉ có `fullAddress`, KHÔNG có các field riêng lẻ
- `UserAddressDetail`: Có đầy đủ các field riêng lẻ
- Clear separation of concerns

### 2. Fix Display - Use fullAddress

**File:** `src/features/profile/components/UserAddressManager.tsx`

**TRƯỚC (SAI):**
```typescript
<div className="flex items-start gap-3 mb-4">
  <div className="p-2 rounded-lg bg-primary/10">
    {getAddressTypeIcon(address.addressType)}  // ❌ undefined
  </div>
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <h4 className="font-semibold">{address.fullName}</h4>
      <Badge variant="outline" className="text-xs">
        {getAddressTypeLabel(address.addressType)}  // ❌ undefined
      </Badge>
    </div>
    ...
  </div>
</div>

<p className="text-sm text-muted-foreground mb-3">
  {address.address}, {address.city}  // ❌ undefined
  {address.state && `, ${address.state}`}, {address.postalCode}, {address.country}
</p>
```

**SAU (ĐÚNG):**
```typescript
<div className="flex items-start gap-3 mb-4">
  <div className="p-2 rounded-lg bg-primary/10">
    <MapPin className="h-4 w-4" />  // ✅ Generic icon
  </div>
  <div className="flex-1">
    <h4 className="font-semibold mb-1">{address.fullName}</h4>  // ✅ Simple
    {address.phoneNumber && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="h-3 w-3" />
        {address.phoneNumber}
      </div>
    )}
  </div>
</div>

<p className="text-sm text-muted-foreground mb-3">
  {address.fullAddress}  // ✅ Use backend's concatenated address
</p>
```

**Changes:**
- ✅ Removed `addressType` icon logic (no data)
- ✅ Removed `addressType` badge (no data)
- ✅ Display `fullAddress` directly from backend
- ✅ Simplified UI structure

### 3. Fix Edit - Fetch Detail First

**TRƯỚC (SAI):**
```typescript
const handleOpenDialog = (address?: UserAddressItem) => {
  if (address) {
    setEditingAddress(address)
    setFormData({
      addressType: address.addressType,  // ❌ undefined
      fullName: address.fullName,
      address: address.address,  // ❌ undefined
      city: address.city,  // ❌ undefined
      state: address.state || "",  // ❌ undefined
      postalCode: address.postalCode,  // ❌ undefined
      country: address.country,  // ❌ undefined
      ...
    })
  }
  setIsDialogOpen(true)
}
```

**SAU (ĐÚNG):**
```typescript
const handleOpenDialog = async (address?: UserAddressItem) => {
  if (address) {
    // ✅ Fetch full details from backend first
    const addressDetail = await fetchAddressById(address.id)
    if (!addressDetail) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin địa chỉ",
        variant: "destructive",
      })
      return
    }
    
    setEditingAddress(address)
    setFormData({
      addressType: addressDetail.addressType,  // ✅ From detail
      fullName: addressDetail.fullName,
      address: addressDetail.address,  // ✅ From detail
      city: addressDetail.city,  // ✅ From detail
      state: addressDetail.state || "",
      postalCode: addressDetail.postalCode,  // ✅ From detail
      country: addressDetail.country,  // ✅ From detail
      isDefault: addressDetail.isDefault,
      phoneNumber: addressDetail.phoneNumber || "",
      status: addressDetail.status,
    })
  } else {
    resetForm()
  }
  setIsDialogOpen(true)
}
```

**Changes:**
- ✅ Made function `async`
- ✅ Call `fetchAddressById()` to get `UserAddressDetail`
- ✅ Use detail data to populate form
- ✅ Error handling with toast

### 4. Add fetchAddressById to Store Usage

```typescript
const { 
  addresses, 
  isLoading, 
  fetchAddresses,
  fetchAddressById,  // ✅ Added
  createAddress, 
  updateAddress, 
  deleteAddress 
} = useUserAddressStore()
```

### 5. Clean Up Unused Code

**Removed:**
```typescript
// ❌ Removed unused icon logic
const getAddressTypeIcon = (type: AddressTypeEnum) => {
  switch (type) {
    case AddressTypeEnum.Home:
      return <Home className="h-4 w-4" />
    case AddressTypeEnum.Office:
      return <Building2 className="h-4 w-4" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}
```

**Kept:**
```typescript
// ✅ Still needed for form select dropdown
const getAddressTypeLabel = (type: AddressTypeEnum) => {
  switch (type) {
    case AddressTypeEnum.Home: return "Nhà riêng"
    case AddressTypeEnum.Office: return "Văn phòng"
    default: return "Khác"
  }
}
```

**Updated imports:**
```typescript
// TRƯỚC
import { Home, Building2, MapPin, Phone, Pencil, Trash2, Plus, Loader2 } from "lucide-react"

// SAU
import { MapPin, Phone, Pencil, Trash2, Plus, Loader2 } from "lucide-react"
```

## Implementation Summary

### Files Changed

1. **`src/entities/user-address/type/user-address.ts`**
   - Updated `UserAddressItem` to match backend (only `fullAddress`)
   - Updated `UserAddressDetail` to match backend (all individual fields)
   - Added comments for clarity

2. **`src/features/profile/components/UserAddressManager.tsx`**
   - Added `fetchAddressById` to store usage
   - Made `handleOpenDialog` async to fetch details
   - Updated address card to display `fullAddress`
   - Removed `addressType` icon and badge from list
   - Removed `getAddressTypeIcon` function
   - Updated imports

## Flow Comparison

### Display Flow

**TRƯỚC (SAI):**
```
Backend → UserAddressItem with fullAddress
  ↓
Frontend tries to access address.address, address.city
  ↓
undefined → Empty display ❌
```

**SAU (ĐÚNG):**
```
Backend → UserAddressItem with fullAddress
  ↓
Frontend displays address.fullAddress
  ↓
"A31 Khu doi 2, Binh Gia Street, Ward 10, Vung Tau city..." ✅
```

### Edit Flow

**TRƯỚC (SAI):**
```
User clicks "Sửa"
  ↓
Try to populate form from UserAddressItem
  ↓
addressType = undefined → formData.addressType.toString() → Error ❌
```

**SAU (ĐÚNG):**
```
User clicks "Sửa"
  ↓
Call API: GET /user-addresses/{id}
  ↓
Receive UserAddressDetail with all fields
  ↓
Populate form with complete data
  ↓
formData.addressType = 1 (Home) → .toString() = "1" ✅
  ↓
Form displays correctly ✅
```

## Testing

### Test 1: List Display
```typescript
// Given: Backend returns addresses
const addresses = [
  {
    fullName: "Nam Nguyen",
    fullAddress: "A31 Khu doi 2, Binh Gia Street, Ward 10, Vung Tau city, ...",
    isDefault: true,
    phoneNumber: "0867619150"
  }
]

// When: Component renders
render(<UserAddressManager />)

// Then: Display shows fullAddress
expect(screen.getByText(/A31 Khu doi 2/)).toBeInTheDocument()  // ✅
expect(screen.getByText("Nam Nguyen")).toBeInTheDocument()  // ✅
expect(screen.getByText("0867619150")).toBeInTheDocument()  // ✅
```

### Test 2: Edit Flow
```typescript
// Given: User clicks "Sửa"
const address = { id: "123", fullName: "Nam Nguyen", ... }
await userEvent.click(screen.getByText("Sửa"))

// When: Fetch detail is called
expect(fetchAddressById).toHaveBeenCalledWith("123")  // ✅

// Then: Form is populated with detail data
await waitFor(() => {
  expect(screen.getByDisplayValue("Nam Nguyen")).toBeInTheDocument()
  expect(screen.getByDisplayValue("A31 Khu doi 2")).toBeInTheDocument()
  expect(screen.getByDisplayValue("Vung Tau city")).toBeInTheDocument()
})
```

### Test 3: No Runtime Error
```typescript
// Given: Address with only list fields
const address: UserAddressItem = {
  id: "123",
  fullName: "Test",
  fullAddress: "Test Address",
  isDefault: true,
  phoneNumber: "0901234567",
  status: EntityStatusEnum.Active,
  createdAt: "2025-01-01",
}

// When: Click edit
await userEvent.click(screen.getByText("Sửa"))

// Then: No error thrown
expect(console.error).not.toHaveBeenCalled()  // ✅

// And: Form opens with fetched data
await waitFor(() => {
  expect(screen.getByRole("dialog")).toBeInTheDocument()
})
```

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Type Safety | ❌ Mismatch | ✅ Match backend |
| Display | ❌ Empty/broken | ✅ Shows fullAddress |
| Edit | ❌ Runtime error | ✅ Works correctly |
| API Calls | 1 (list) | 2 (list + detail on edit) |
| Code Clarity | ❌ Confusing | ✅ Clear separation |

## Performance Note

**Extra API Call:**
- Old: Click "Sửa" → immediate (but broken)
- New: Click "Sửa" → fetch detail → populate form

**Trade-off:**
- ✅ Correct behavior
- ✅ Always fresh data
- ❌ Slight delay (~100-200ms)

This is acceptable because:
1. Edit is a rare operation (not frequently clicked)
2. Data freshness is important
3. Loading state can be shown

## Architecture Lesson

**Backend DTO Strategy:**
- **List DTOs** (e.g., `UserAddressItem`): Minimal fields for performance
  - Only display data
  - Concatenated/computed fields
  - Optimized for list rendering
  
- **Detail DTOs** (e.g., `UserAddressDetail`): Complete fields for editing
  - All editable fields
  - Individual components
  - Ready for form population

**Frontend Should:**
- ✅ Match backend DTO structure exactly
- ✅ Use list DTO for display
- ✅ Fetch detail DTO for edit
- ❌ Never assume list DTO has all fields

## Summary

### Fixes Applied
1. ✅ Updated `UserAddressItem` type to match backend (only `fullAddress`)
2. ✅ Updated `UserAddressDetail` type to match backend (all fields)
3. ✅ Display `fullAddress` directly instead of concatenating
4. ✅ Fetch `UserAddressDetail` before opening edit dialog
5. ✅ Removed unused `addressType` display logic
6. ✅ Cleaned up unused imports and functions

### Result
- ✅ Address list displays correctly with `fullAddress`
- ✅ No runtime errors when editing
- ✅ Form populates correctly with full details
- ✅ Type-safe throughout
- ✅ Clean code architecture

All issues resolved! 🎉

