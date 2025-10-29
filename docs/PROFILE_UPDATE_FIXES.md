# Profile Update Fixes

## Các vấn đề đã sửa

### 1. Double call API `getProfile` sau khi update

**Vấn đề:**
- Sau khi update profile, API `getProfile` được gọi 2 lần:
  - Lần 1: Trong `UpdateProfileForm` component (dòng 119)
  - Lần 2: Trong `profile/page.tsx` useEffect

**Giải pháp:**
- Di chuyển logic refresh vào trong `updateProfile` action trong Zustand store
- Xóa call `getProfile(true)` khỏi `UpdateProfileForm` component
- Chỉ để `updateProfile` tự động gọi `getProfile(true)` sau khi update thành công
- Page sẽ tự động re-render khi user state thay đổi

**Thay đổi:**

```typescript
// auth-service.ts - updateProfile action
if (result.isSuccess) {
  // Refresh profile to get latest data from server
  await get().getProfile(true)
  return { success: true }
}

// UpdateProfileForm.tsx - Remove manual getProfile call
if (result.success) {
  toast({ /* ... */ })
  // Note: User state will auto-refresh from Zustand store
  setAvatarPreview(null)
  setAvatarFile(null)
}
```

### 2. Gender mapping sai giữa Backend và Frontend

**Vấn đề:**
- Backend trả về Gender là `string`: "Female", "Male", "Other"
- Frontend expect Gender là `number`: 0 = Male, 1 = Female, 2 = Other
- Dropdown không hiển thị đúng giá trị

**Nguyên nhân:**
- `AuthMappingProfile.cs` đang map Gender bằng `.ToString()`:
```csharp
.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => 
    src.CustomerProfile.Gender.ToString()))
```

**Giải pháp:**
- Thay đổi `ProfileResponse.cs`: `Gender` từ `string?` thành `int?`
- Thay đổi mapping để cast enum sang int:
```csharp
.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => 
    src.CustomerProfile != null ? (int)src.CustomerProfile.Gender : (int?)null))
```

**Kết quả:**
- Backend giờ trả về: `"gender": 1` thay vì `"gender": "Female"`
- Frontend dropdown hiển thị đúng giá trị
- Mapping 2 chiều hoạt động chính xác:
  - 0 → "Nam"
  - 1 → "Nữ"
  - 2 → "Khác"

### 3. UI duplicate "Hồ Sơ Của Tôi"

**Vấn đề:**
- Trang profile có 2 tiêu đề:
  - `<h1>Hồ Sơ Của Tôi</h1>` ở trang profile
  - `<h3>Thông Tin Cá Nhân</h3>` trong UpdateProfileForm

**Giải pháp:**
- Xóa title và description trong `UpdateProfileForm` component
- Giữ lại title chính ở trang profile
- Dùng tab labels để phân biệt các sections

**Thay đổi:**
```tsx
// UpdateProfileForm.tsx - BEFORE
<form onSubmit={handleSubmit}>
  <div>
    <h3>Thông Tin Cá Nhân</h3>
    <p>Cập nhật thông tin cá nhân và ảnh đại diện của bạn</p>
  </div>
  {/* form fields */}
</form>

// UpdateProfileForm.tsx - AFTER
<form onSubmit={handleSubmit}>
  {/* form fields directly */}
</form>
```

## Tổng kết thay đổi

### Backend Changes

**File:** `NekoViBE.Application/Common/DTOs/Auth/ProfileResponse.cs`
```csharp
// OLD
public string? Gender { get; set; }

// NEW
public int? Gender { get; set; }
```

**File:** `NekoViBE.Application/Common/Mappings/AuthMappingProfile.cs`
```csharp
// OLD
.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => 
    src.CustomerProfile != null ? src.CustomerProfile.Gender.ToString() : null))

// NEW
.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => 
    src.CustomerProfile != null ? (int)src.CustomerProfile.Gender : (int?)null))
```

### Frontend Changes

**File:** `nekovi-customer-web/src/entities/auth/service/auth-service.ts`
```typescript
// updateProfile action - Added automatic profile refresh
if (result.isSuccess) {
  await get().getProfile(true)  // ← Added this line
  return { success: true }
}
```

**File:** `nekovi-customer-web/src/features/profile/components/UpdateProfileForm.tsx`
- Removed `getProfile` from useAuth destructuring
- Removed manual `await getProfile(true)` call
- Removed title and description div

## API Response Example

**Before:**
```json
{
  "gender": "Female",  // ❌ String
  "dateOfBirth": "1999-08-30T00:00:00"
}
```

**After:**
```json
{
  "gender": 1,  // ✅ Integer (0=Male, 1=Female, 2=Other)
  "dateOfBirth": "1999-08-30T00:00:00"
}
```

## Testing Checklist

- [x] Update profile → API chỉ gọi 1 lần
- [x] Gender dropdown hiển thị đúng giá trị hiện tại
- [x] Update gender → Lưu và hiển thị đúng
- [x] Avatar upload và preview hoạt động
- [x] Không còn title duplicate
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] Build successful

## Benefits

1. **Performance**: Giảm từ 2 API calls xuống 1 call
2. **Type Safety**: Gender mapping chính xác giữa backend và frontend
3. **UX**: UI sạch hơn, không duplicate titles
4. **Maintainability**: Logic refresh tập trung ở 1 nơi (Zustand store)

