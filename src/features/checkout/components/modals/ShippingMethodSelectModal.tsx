import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/components/ui/radio-group"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Pagination } from "@/src/components/ui/pagination"
import { Loader2, Truck } from "lucide-react"
import type { ShippingMethodItem } from "@/src/entities/shipping-method/type/shipping-method"
import { formatCurrency } from "@/src/shared/utils/format"
import { cn } from "@/src/lib/utils"

interface ShippingPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

interface ShippingMethodSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shippingMethods: ShippingMethodItem[]
  selectedShippingMethodId?: string
  isLoading: boolean
  pagination: ShippingPagination
  onPageChange: (page: number) => void
  onSelect: (method: ShippingMethodItem) => void
}

export function ShippingMethodSelectModal({
  open,
  onOpenChange,
  shippingMethods,
  selectedShippingMethodId,
  isLoading,
  pagination,
  onPageChange,
  onSelect,
}: ShippingMethodSelectModalProps) {
  const totalPages = Math.max(1, pagination.totalPages)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn phương thức vận chuyển</DialogTitle>
          <DialogDescription>
            Lựa chọn dịch vụ vận chuyển phù hợp với nhu cầu của bạn.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải phương thức vận chuyển...
          </div>
        ) : shippingMethods.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Hiện không có phương thức vận chuyển khả dụng.
          </div>
        ) : (
          <RadioGroup
            value={selectedShippingMethodId}
            onValueChange={(value) => {
              const method = shippingMethods.find((item) => item.id === value)
              if (method) {
                onSelect(method)
                onOpenChange(false)
              }
            }}
            className="space-y-3"
          >
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                htmlFor={`shipping-${method.id}`}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-2xl border bg-background p-4 transition-all",
                  selectedShippingMethodId === method.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={method.id}
                    id={`shipping-${method.id}`}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <Label htmlFor={`shipping-${method.id}`} className="font-semibold">
                        {method.name}
                      </Label>
                    </div>
                    {method.description && (
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    )}
                    {/* {method.estimatedDays && (
                      <p className="text-xs text-muted-foreground">
                        Giao trong khoảng {method.estimatedDays} ngày
                      </p>
                    )} */}
                  </div>
                  {/* <span className="font-semibold text-primary">
                    {formatCurrency(method.cost)}
                  </span> */}
                </div>
              </label>
            ))}
          </RadioGroup>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

