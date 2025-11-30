import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog"
import { UserAddressManager } from "@/src/features/profile/components/UserAddressManager"
import type { UserAddressItem } from "@/src/entities/user-address/type/user-address"

interface AddressSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAddressId?: string | null
  onSelectAddress: (address: UserAddressItem) => void
}

export function AddressSelectModal({
  open,
  onOpenChange,
  selectedAddressId,
  onSelectAddress,
}: AddressSelectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
          <DialogDescription>
            Quản lý và chọn địa chỉ bạn muốn sử dụng cho đơn hàng này.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <UserAddressManager
            hideHeader
            selectable
            selectedAddressId={selectedAddressId}
            onSelectAddress={(address) => {
              onSelectAddress(address)
              onOpenChange(false)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

