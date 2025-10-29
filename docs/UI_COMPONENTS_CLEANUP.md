# UI Components Cleanup - Clean Architecture Compliance

## Vấn đề phát hiện

Có các components bị trùng lặp ở nhiều vị trí khác nhau:
1. `src/components/` (ngoài ui/) - các file trùng
2. `src/components/ui/` - vị trí đúng theo Clean Architecture
3. `components/ui/` (ngoài src/) - các file trùng

## Giải pháp

### 1. Xóa các file trùng lặp

**Đã xóa khỏi `src/components/` (không trong ui/):**
- ❌ `src/components/badge.tsx` → ✅ `src/components/ui/badge.tsx`
- ❌ `src/components/checkbox.tsx` → ✅ `src/components/ui/checkbox.tsx`
- ❌ `src/components/label.tsx` → ✅ `src/components/ui/label.tsx`
- ❌ `src/components/radio-group.tsx` → ✅ `src/components/ui/radio-group.tsx`
- ❌ `src/components/select.tsx` → ✅ `src/components/ui/select.tsx`
- ❌ `src/components/textarea.tsx` → ✅ `src/components/ui/textarea.tsx`

**Đã xóa khỏi `components/ui/` (ngoài src/):**
- ❌ `components/ui/button.tsx` → ✅ `src/components/ui/button.tsx`
- ❌ `components/ui/select.tsx` → ✅ `src/components/ui/select.tsx`
- ❌ `components/ui/textarea.tsx` → ✅ `src/components/ui/textarea.tsx`

### 2. Cấu trúc cuối cùng (Clean Architecture)

```
src/
└── components/
    ├── auth/
    │   └── auth-guard.tsx
    └── ui/                    ← Tất cả UI components ở đây
        ├── alert-dialog.tsx
        ├── avatar.tsx
        ├── badge.tsx
        ├── button.tsx
        ├── card.tsx
        ├── checkbox.tsx
        ├── dialog.tsx
        ├── dropdown-menu.tsx
        ├── input.tsx
        ├── label.tsx
        ├── radio-group.tsx
        ├── select.tsx
        ├── sheet.tsx
        ├── tabs.tsx
        ├── textarea.tsx
        ├── toast.tsx
        └── toaster.tsx
```

## Tuân thủ Clean Architecture

### Nguyên tắc
1. **Single Source of Truth**: Mỗi component chỉ có 1 file, ở đúng vị trí
2. **Separation of Concerns**: 
   - `src/components/ui/` - Pure UI components (reusable)
   - `src/components/auth/` - Auth-specific components
   - `src/features/` - Feature-specific components (business logic)
   - `src/widgets/` - Complex composite components
3. **Consistent Imports**: Tất cả imports đều dùng `@/src/components/ui/`

### Import Pattern
```typescript
// ✅ Đúng
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Select } from "@/src/components/ui/select"

// ❌ Sai (các imports này đã được xóa)
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/src/components/badge"
```

## Verification

### Build Status
```bash
✓ Compiled successfully
✓ Checking validity of types ...
✓ Generating static pages (19/19)
```

### Linter Status
- ✅ No ESLint errors
- ✅ No TypeScript errors
- ✅ All imports resolved correctly

## Components Reference

Tất cả các UI components hiện có trong `src/components/ui/`:

| Component | Type | Status |
|-----------|------|--------|
| `alert-dialog` | Radix UI | ✅ |
| `avatar` | Radix UI | ✅ |
| `badge` | CVA | ✅ |
| `button` | CVA + Radix | ✅ |
| `card` | Custom | ✅ |
| `checkbox` | Radix UI | ✅ |
| `dialog` | Radix UI | ✅ |
| `dropdown-menu` | Radix UI | ✅ |
| `input` | Native | ✅ |
| `label` | Radix UI | ✅ |
| `radio-group` | Radix UI | ✅ |
| `select` | Radix UI | ✅ |
| `sheet` | Radix UI | ✅ |
| `tabs` | Radix UI | ✅ |
| `textarea` | Native | ✅ |
| `toast` | Radix UI | ✅ |
| `toaster` | Radix UI | ✅ |

## Best Practices Enforced

1. ✅ **No Duplicates**: Mỗi component chỉ có 1 file
2. ✅ **Consistent Location**: Tất cả UI components trong `src/components/ui/`
3. ✅ **Type Safety**: Tất cả components đều có TypeScript types
4. ✅ **Import Consistency**: Tất cả imports dùng `@/src/components/ui/`
5. ✅ **Clean Architecture**: Tuân thủ layer separation

## Migration Notes

Nếu có file nào đang import từ các paths cũ, chúng sẽ bị lỗi. Cần update:
```typescript
// Old (will break)
import { Button } from "@/components/ui/button"
import { Badge } from "@/src/components/badge"

// New (correct)
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
```

## Future Maintenance

Khi thêm UI component mới:
1. ✅ Luôn thêm vào `src/components/ui/`
2. ✅ Sử dụng `@/src/lib/utils` cho `cn()` utility
3. ✅ Tuân theo naming convention: `kebab-case.tsx`
4. ✅ Export named exports, không dùng default export
5. ✅ Thêm TypeScript types đầy đủ

