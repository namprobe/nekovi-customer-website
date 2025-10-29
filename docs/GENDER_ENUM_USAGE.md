# Gender Enum Usage - Tuân thủ Common Types

## Vấn đề

Gender values đang được hard-code trực tiếp thay vì dùng enum từ `common.ts`:

```typescript
// ❌ SAI - Hard-code magic numbers
gender: "0"  // Nam
gender: "1"  // Nữ
gender: "2"  // Khác
```

## Giải pháp

Sử dụng `Gender` enum từ `src/shared/types/common.ts` đã được định nghĩa sẵn:

```typescript
// ✅ ĐÚNG - Dùng enum
export enum Gender {
    Female = 0,
    Male = 1,
    Other = 2,
}
```

## Thay đổi Backend

Backend đã được update để trả về `GenderEnum` (enum type) thay vì int:

**ProfileResponse.cs:**
```csharp
public GenderEnum? Gender { get; set; }
```

**AuthMappingProfile.cs:**
```csharp
.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => 
    src.CustomerProfile != null ? src.CustomerProfile.Gender : null))
// Không cần cast (int), giữ nguyên enum type
```

## Thay đổi Frontend

### 1. Type Definition

**File:** `src/entities/auth/type/auth.ts`

```typescript
import type { GrantTypeEnum, Gender } from "@/src/shared/types/common"

export interface ProfileResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  avatarPath?: string
  gender?: Gender  // ← Dùng Gender enum type, không phải number
  dateOfBirth?: Date
  bio?: string
}
```

### 2. Component Usage

**File:** `src/features/profile/components/UpdateProfileForm.tsx`

```typescript
import { Gender } from "@/src/shared/types/common"

// State initialization - Dùng enum
const [formData, setFormData] = useState({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  phoneNumber: user?.phoneNumber || "",
  gender: user?.gender?.toString() || Gender.Male.toString(),  // ← Dùng enum
  dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
  bio: user?.bio || "",
})

// Label helper - Dùng enum
const getGenderLabel = (value: string) => {
  const genderValue = parseInt(value)
  switch (genderValue) {
    case Gender.Male: return "Nam"      // ← Dùng enum
    case Gender.Female: return "Nữ"    // ← Dùng enum
    case Gender.Other: return "Khác"   // ← Dùng enum
    default: return "Chọn giới tính"
  }
}

// Select options - Dùng enum
<SelectContent>
  <SelectItem value={Gender.Male.toString()}>Nam</SelectItem>      {/* ← Dùng enum */}
  <SelectItem value={Gender.Female.toString()}>Nữ</SelectItem>    {/* ← Dùng enum */}
  <SelectItem value={Gender.Other.toString()}>Khác</SelectItem>   {/* ← Dùng enum */}
</SelectContent>
```

## Lợi ích

### 1. Type Safety
```typescript
// ✅ TypeScript sẽ check đúng kiểu
const gender: Gender = Gender.Male

// ❌ Sẽ báo lỗi nếu dùng sai
const gender: Gender = 3  // Error: Type '3' is not assignable to type 'Gender'
```

### 2. Maintainability
```typescript
// Nếu cần thay đổi giá trị, chỉ sửa 1 nơi
export enum Gender {
    Female = 0,
    Male = 1,
    Other = 2,
    PreferNotToSay = 3,  // ← Thêm mới dễ dàng
}
```

### 3. Consistency
- Backend: `GenderEnum` (0, 1, 2)
- Frontend: `Gender` enum (0, 1, 2)
- Cùng mapping, không bị sai lệch

### 4. Readable Code
```typescript
// ❌ SAI - Khó đọc
if (user.gender === 1) { }

// ✅ ĐÚNG - Dễ hiểu
if (user.gender === Gender.Male) { }
```

## API Response Example

```json
{
  "isSuccess": true,
  "data": {
    "email": "user@example.com",
    "firstName": "Nam",
    "lastName": "Nguyễn Hoài",
    "gender": 1,  // ← Backend trả về GenderEnum as int (0=Female, 1=Male, 2=Other)
    "phoneNumber": "0867619150",
    "dateOfBirth": "1999-08-30T00:00:00",
    "avatarPath": "http://localhost:5240/uploads/avatars/..."
  }
}
```

Frontend sẽ parse:
```typescript
user.gender === Gender.Male  // true (1 === 1)
```

## Best Practices

1. **LUÔN import enum từ common.ts:**
   ```typescript
   import { Gender } from "@/src/shared/types/common"
   ```

2. **KHÔNG hard-code magic numbers:**
   ```typescript
   ❌ if (gender === 0)
   ✅ if (gender === Gender.Female)
   ```

3. **Sử dụng enum cho tất cả gender-related operations:**
   - State initialization
   - Comparisons
   - Switch statements
   - Select options

4. **Keep backend-frontend enum sync:**
   - Backend: `GenderEnum` in C#
   - Frontend: `Gender` in TypeScript
   - Same values: 0, 1, 2

## Testing

```typescript
// Test gender mapping
const testCases = [
  { value: Gender.Female, label: "Nữ" },
  { value: Gender.Male, label: "Nam" },
  { value: Gender.Other, label: "Khác" },
]

testCases.forEach(({ value, label }) => {
  expect(getGenderLabel(value.toString())).toBe(label)
})
```

## Common Mistakes to Avoid

```typescript
// ❌ KHÔNG làm thế này
const gender = 1  // Magic number
case 0: return "Nữ"  // Hard-code

// ✅ Làm thế này
const gender = Gender.Male  // Explicit enum
case Gender.Female: return "Nữ"  // Use enum
```

## Summary

- ✅ Backend: `GenderEnum` (enum type)
- ✅ Frontend: `Gender` enum từ `common.ts`
- ✅ Mapping: 0=Female, 1=Male, 2=Other
- ✅ Type-safe, maintainable, consistent
- ✅ No magic numbers

