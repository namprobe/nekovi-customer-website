import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "@/src/shared/utils/format"
import type {
  ShippingFeeResult as ShippingFeeResultDto,
  ShippingLeadTimeResult,
  ShippingMethodItem,
} from "@/src/entities/shipping-method/type/shipping-method"
import type { UserAddressItem } from "@/src/entities/user-address/type/user-address"
import type { UserCouponItem } from "@/src/entities/user-coupon/type/user-coupon"

interface CheckoutAuthSectionProps {
  user: {
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    phoneNumber?: string | null
  } | null
  note: string
  onNoteChange: (value: string) => void
  addressSummary: {
    address: UserAddressItem | null
    isLoading: boolean
    onClick: () => void
  }
  shippingSummary: {
    shippingMethod: ShippingMethodItem | null
    shippingAmount: number
    shippingDiscountAmount: number
    shippingFeeResult: ShippingFeeResultDto | null
    isCalculating: boolean
    isCalculatingLeadTime: boolean
    shippingLeadTimeResult: ShippingLeadTimeResult | null
    leadTimeLabel?: string | null
    hasAddress: boolean
    onClick: () => void
  }
  voucherSummary: {
    selectedCoupons: UserCouponItem[]
    onClick: () => void
    onClear?: () => void
  }
}

export function CheckoutAuthSection({
  user,
  note,
  onNoteChange,
  addressSummary,
  shippingSummary,
  voucherSummary,
}: CheckoutAuthSectionProps) {
  const fullName =
    (user?.lastName || "").trim() || (user?.firstName || "").trim()
      ? `${(user?.lastName || "").trim()} ${(user?.firstName || "").trim()}`.trim()
      : user?.username || "Chưa cập nhật"

  const payableShippingAmount = Math.max(
    0,
    shippingSummary.shippingAmount - shippingSummary.shippingDiscountAmount
  )

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card/70 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Thông tin Liên Hệ</h3>
          <Button asChild variant="outline" size="sm">
            <a href="/profile">Chỉnh sửa</a>
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">Họ và tên</p>
            <p className="font-medium text-foreground">{fullName || "Chưa cập nhật"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user?.email || "Chưa cập nhật"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Số điện thoại</p>
            <p className="font-medium text-foreground">
              {user?.phoneNumber || "Chưa cập nhật"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Địa chỉ giao hàng</h3>
            <p className="text-xs text-muted-foreground">
              Chọn địa chỉ phù hợp để giao hàng chính xác hơn.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {addressSummary.isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            <Button type="button" variant="outline" size="sm" onClick={addressSummary.onClick}>
              {addressSummary.address ? "Thay đổi" : "Chọn địa chỉ"}
            </Button>
          </div>
        </div>
        {addressSummary.address ? (
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{addressSummary.address.fullName}</p>
            {addressSummary.address.phoneNumber && <p>{addressSummary.address.phoneNumber}</p>}
            <p>{addressSummary.address.fullAddress}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Bạn chưa chọn địa chỉ giao hàng.
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Phương thức vận chuyển</h3>
            <p className="text-xs text-muted-foreground">
              Phí vận chuyển sẽ được tính dựa trên phương thức bạn chọn.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={shippingSummary.onClick}
            disabled={!shippingSummary.hasAddress}
          >
            {shippingSummary.shippingMethod ? "Thay đổi" : "Chọn phương thức"}
          </Button>
        </div>
        {shippingSummary.shippingMethod ? (
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{shippingSummary.shippingMethod.name}</p>
              {/* <Badge variant="secondary">
                {formatCurrency(shippingSummary.shippingMethod.cost)}
              </Badge> */}
            </div>
            {shippingSummary.shippingMethod.description && (
              <p>{shippingSummary.shippingMethod.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span>Phí dự kiến:</span>
              {shippingSummary.isCalculating ? (
                <span className="text-muted-foreground">Đang tính...</span>
              ) : shippingSummary.shippingFeeResult?.data ? (
                <span className="font-semibold text-primary">
                  {formatCurrency(shippingSummary.shippingAmount)}
                </span>
              ) : (
                <span className="text-muted-foreground">Chưa tính</span>
              )}
            </div>
            {shippingSummary.shippingDiscountAmount > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Giảm phí vận chuyển:</span>
                <span className="font-semibold text-emerald-600">
                  -{formatCurrency(shippingSummary.shippingDiscountAmount)}
                </span>
              </div>
            )}
            {shippingSummary.shippingFeeResult?.data && (
              <div className="flex items-center gap-2 text-sm">
                <span>Phí sau ưu đãi:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(payableShippingAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Thời gian giao dự kiến:</span>
              {shippingSummary.isCalculatingLeadTime ? (
                <span className="text-muted-foreground">Đang tính...</span>
              ) : shippingSummary.leadTimeLabel ? (
                <span className="font-semibold text-foreground">{shippingSummary.leadTimeLabel}</span>
              ) : (
                <span className="text-muted-foreground">Chưa có dữ liệu</span>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {shippingSummary.hasAddress
              ? "Vui lòng chọn phương thức vận chuyển."
              : "Chọn địa chỉ giao hàng trước khi chọn phương thức vận chuyển."}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Voucher</h3>
            <p className="text-xs text-muted-foreground">
              Chọn voucher để nhận ưu đãi cho đơn hàng của bạn.
            </p>
          </div>
          <div className="flex gap-2">
            {voucherSummary.selectedCoupons.length > 0 && voucherSummary.onClear && (
              <Button type="button" variant="ghost" size="sm" onClick={voucherSummary.onClear}>
                Bỏ chọn
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={voucherSummary.onClick}>
              {voucherSummary.selectedCoupons.length > 0 ? "Thay đổi" : "Chọn mã"}
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          {voucherSummary.selectedCoupons.length > 0 ? (
            voucherSummary.selectedCoupons.map((coupon) => (
              <div key={coupon.id}>
                <p className="font-medium text-foreground">{coupon.couponCode}</p>
                {coupon.description && <p>{coupon.description}</p>}
                <p className="text-xs">Loại ưu đãi: {coupon.discountTypeName}</p>
              </div>
            ))
          ) : (
            <p>Chưa áp dụng voucher.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Input
          id="note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="bg-muted/50"
          placeholder="Ghi chú cho đơn hàng (tùy chọn)"
        />
      </div>
    </div>
  )
}

