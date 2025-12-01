import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Loader2, Ticket } from "lucide-react"
import { Pagination } from "@/src/components/ui/pagination"
import { useUserCouponStore } from "@/src/entities/user-coupon/service/user-coupon-service"
import type { UserCouponItem } from "@/src/entities/user-coupon/type/user-coupon"
import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"
import { formatCurrency } from "@/src/shared/utils/format"
import { DiscountTypeEnum } from "@/src/entities/user-coupon/type/user-coupon"
import { useToast } from "@/src/hooks/use-toast"

interface VoucherSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCoupons: UserCouponItem[]
  onChangeCoupons: (coupons: UserCouponItem[]) => void
}

const baseFilter = {
  page: 1,
  pageSize: 10,
  isCurrentUser: true,
  onlyActiveCoupons: true,
  status: EntityStatusEnum.Active,
  isUsed: false,
  isExpired: false,
}

export function VoucherSelectModal({
  open,
  onOpenChange,
  selectedCoupons,
  onChangeCoupons,
}: VoucherSelectModalProps) {
  const {
    coupons,
    isLoading,
    currentPage,
    totalItems,
    pageSize,
    fetchCoupons,
  } = useUserCouponStore()
  const [manualCode, setManualCode] = useState("")
  const [localSelection, setLocalSelection] = useState<UserCouponItem[]>([])
  const { toast } = useToast()

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalItems || coupons.length || 1) / (pageSize || 10))),
    [totalItems, coupons.length, pageSize]
  )

  useEffect(() => {
    if (open) {
      void fetchCoupons(baseFilter)
      setLocalSelection(selectedCoupons)
    }
  }, [open, fetchCoupons, selectedCoupons])

  const isSelected = (couponId: string) =>
    localSelection.some((coupon) => coupon.id === couponId)

  const toggleCoupon = (coupon: UserCouponItem) => {
    setLocalSelection((prev) => {
      // Nếu coupon đã được chọn, bỏ chọn
      if (prev.some((item) => item.id === coupon.id)) {
        return prev.filter((item) => item.id !== coupon.id)
      }
      
      // RULE: Không được chọn cả Percentage và Fixed cùng lúc
      const hasPercentage = prev.some((item) => item.discountType === DiscountTypeEnum.Percentage)
      const hasFixed = prev.some((item) => item.discountType === DiscountTypeEnum.Fixed)
      
      if (coupon.discountType === DiscountTypeEnum.Percentage && hasFixed) {
        toast({
          title: "Không thể chọn",
          description: "Chỉ được chọn mã giảm theo phần trăm HOẶC giảm cố định, không được dùng cả hai",
          variant: "destructive",
        })
        return prev
      }
      
      if (coupon.discountType === DiscountTypeEnum.Fixed && hasPercentage) {
        toast({
          title: "Không thể chọn",
          description: "Chỉ được chọn mã giảm theo phần trăm HOẶC giảm cố định, không được dùng cả hai",
          variant: "destructive",
        })
        return prev
      }
      
      // RULE: Chỉ được 1 FreeShip coupon
      if (coupon.discountType === DiscountTypeEnum.FreeShipping) {
        const existingFreeShip = prev.find(
          (item) => item.discountType === DiscountTypeEnum.FreeShipping
        )
        if (existingFreeShip) {
          toast({
            title: "Không thể chọn",
            description: "Chỉ được áp dụng tối đa 1 mã miễn phí vận chuyển",
            variant: "destructive",
          })
          return prev
        }
      }
      
      // RULE: Chỉ được 1 Percentage coupon
      if (coupon.discountType === DiscountTypeEnum.Percentage && hasPercentage) {
        // Thay thế coupon Percentage cũ bằng coupon mới
        return prev
          .filter((item) => item.discountType !== DiscountTypeEnum.Percentage)
          .concat([coupon])
      }
      
      // RULE: Chỉ được 1 Fixed coupon
      if (coupon.discountType === DiscountTypeEnum.Fixed && hasFixed) {
        // Thay thế coupon Fixed cũ bằng coupon mới
        return prev
          .filter((item) => item.discountType !== DiscountTypeEnum.Fixed)
          .concat([coupon])
      }
      
      // RULE: Tổng số coupon không quá 2 (1 FreeShip + 1 Percentage/Fixed)
      if (prev.length >= 2) {
        toast({
          title: "Không thể chọn",
          description: "Chỉ được áp dụng tối đa 2 mã giảm giá (1 FreeShip + 1 Percentage/Fixed)",
          variant: "destructive",
        })
        return prev
      }
      
      // Nếu chưa có coupon cùng loại, thêm mới
      return [...prev, coupon]
    })
  }

  const handleApplySelection = () => {
    onChangeCoupons(localSelection)
    onOpenChange(false)
  }

  const handleClearSelection = () => {
    setLocalSelection([])
  }

  const handleManualApply = () => {
    if (!manualCode.trim()) return
    const target = coupons.find(
      (coupon) => coupon.couponCode.toLowerCase() === manualCode.trim().toLowerCase()
    )

    if (!target) {
      toast({
        title: "Không tìm thấy",
        description: "Mã giảm giá không hợp lệ hoặc chưa được lưu trong tài khoản của bạn.",
        variant: "destructive",
      })
      return
    }

    if (!isSelected(target.id)) {
      const prev = localSelection
      
      // RULE: Không được chọn cả Percentage và Fixed cùng lúc
      const hasPercentage = prev.some((item) => item.discountType === DiscountTypeEnum.Percentage)
      const hasFixed = prev.some((item) => item.discountType === DiscountTypeEnum.Fixed)
      
      if (target.discountType === DiscountTypeEnum.Percentage && hasFixed) {
        toast({
          title: "Không thể chọn",
          description: "Chỉ được chọn mã giảm theo phần trăm HOẶC giảm cố định, không được dùng cả hai",
          variant: "destructive",
        })
        return
      }
      
      if (target.discountType === DiscountTypeEnum.Fixed && hasPercentage) {
        toast({
          title: "Không thể chọn",
          description: "Chỉ được chọn mã giảm theo phần trăm HOẶC giảm cố định, không được dùng cả hai",
          variant: "destructive",
        })
        return
      }
      
      // RULE: Chỉ được 1 FreeShip coupon
      if (target.discountType === DiscountTypeEnum.FreeShipping) {
        const existingFreeShip = prev.find(
          (item) => item.discountType === DiscountTypeEnum.FreeShipping
        )
        if (existingFreeShip) {
          toast({
            title: "Không thể chọn",
            description: "Chỉ được áp dụng tối đa 1 mã miễn phí vận chuyển",
            variant: "destructive",
          })
          return
        }
      }
      
      // RULE: Chỉ được 1 Percentage coupon
      if (target.discountType === DiscountTypeEnum.Percentage && hasPercentage) {
        // Thay thế coupon Percentage cũ bằng coupon mới
        const existingPercentage = prev.find(
          (item) => item.discountType === DiscountTypeEnum.Percentage
        )
        setLocalSelection((prev) =>
          prev
            .filter((item) => item.discountType !== DiscountTypeEnum.Percentage)
            .concat([target])
        )
        toast({
          title: "Đã thay thế mã",
          description: `Đã thay thế ${existingPercentage?.couponCode} bằng ${target.couponCode}`,
        })
        return
      }
      
      // RULE: Chỉ được 1 Fixed coupon
      if (target.discountType === DiscountTypeEnum.Fixed && hasFixed) {
        // Thay thế coupon Fixed cũ bằng coupon mới
        const existingFixed = prev.find(
          (item) => item.discountType === DiscountTypeEnum.Fixed
        )
        setLocalSelection((prev) =>
          prev
            .filter((item) => item.discountType !== DiscountTypeEnum.Fixed)
            .concat([target])
        )
        toast({
          title: "Đã thay thế mã",
          description: `Đã thay thế ${existingFixed?.couponCode} bằng ${target.couponCode}`,
        })
        return
      }
      
      // RULE: Tổng số coupon không quá 2 (1 FreeShip + 1 Percentage/Fixed)
      if (prev.length >= 2) {
        toast({
          title: "Không thể chọn",
          description: "Chỉ được áp dụng tối đa 2 mã giảm giá (1 FreeShip + 1 Percentage/Fixed)",
          variant: "destructive",
        })
        return
      }
      
      // Thêm mới nếu chưa có coupon cùng loại
      setLocalSelection((prev) => [...prev, target])
      toast({
        title: "Đã thêm mã",
        description: `Đã thêm ${target.couponCode} vào danh sách chọn`,
      })
    } else {
      toast({
        title: "Đã có mã này",
        description: `${target.couponCode} đã nằm trong danh sách chọn`,
      })
    }
  }

  const handlePageChange = (page: number) => {
    void fetchCoupons({ ...baseFilter, page })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn mã giảm giá</DialogTitle>
          <DialogDescription>
            Áp dụng voucher để nhận ưu đãi cho đơn hàng của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Nhập mã giảm giá"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleManualApply}>
              Áp dụng
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải danh sách voucher...
            </div>
          ) : coupons.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Bạn chưa có mã giảm giá khả dụng.
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon: UserCouponItem) => {
                const selected = isSelected(coupon.id)
                return (
                  <div
                    key={coupon.id}
                    className={`rounded-lg border bg-background/80 p-4 text-sm shadow-sm transition-all ${
                      selected ? "border-primary ring-1 ring-primary/50" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                          <Ticket className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-primary">
                            {coupon.couponCode}
                          </p>
                          {(coupon.couponName || coupon.description) && (
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {coupon.couponName || coupon.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "secondary"}
                        onClick={() => toggleCoupon(coupon)}
                        disabled={
                          !selected && (
                            // Disable nếu đã có coupon cùng loại (sẽ được thay thế)
                            localSelection.some(
                              (item) => item.discountType === coupon.discountType
                            ) ||
                            // Disable nếu đã chọn Percentage và đang cố chọn Fixed (hoặc ngược lại)
                            (coupon.discountType === DiscountTypeEnum.Percentage &&
                              localSelection.some(
                                (item) => item.discountType === DiscountTypeEnum.Fixed
                              )) ||
                            (coupon.discountType === DiscountTypeEnum.Fixed &&
                              localSelection.some(
                                (item) => item.discountType === DiscountTypeEnum.Percentage
                              )) ||
                            // Disable nếu đã có FreeShip và đang cố chọn FreeShip khác
                            (coupon.discountType === DiscountTypeEnum.FreeShipping &&
                              localSelection.some(
                                (item) => item.discountType === DiscountTypeEnum.FreeShipping
                              )) ||
                            // Disable nếu đã chọn đủ 2 coupons
                            localSelection.length >= 2
                          )
                        }
                      >
                        {selected
                          ? "Đang chọn"
                          : localSelection.some(
                              (item) => item.discountType === coupon.discountType
                            )
                          ? "Đã có loại này"
                          : (coupon.discountType === DiscountTypeEnum.Percentage &&
                              localSelection.some(
                                (item) => item.discountType === DiscountTypeEnum.Fixed
                              )) ||
                            (coupon.discountType === DiscountTypeEnum.Fixed &&
                              localSelection.some(
                                (item) => item.discountType === DiscountTypeEnum.Percentage
                              ))
                          ? "Không thể chọn"
                          : localSelection.length >= 2
                          ? "Đã đủ"
                          : "Chọn"}
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Ưu đãi:{" "}
                        {coupon.discountTypeName?.toLowerCase() === "freeshipping"
                          ? "Miễn phí vận chuyển"
                          : coupon.discountType === DiscountTypeEnum.Percentage
                          ? `${coupon.discountValue}%${coupon.maxDiscountCap && coupon.maxDiscountCap > 0 ? ` (tối đa ${formatCurrency(coupon.maxDiscountCap)})` : ""}`
                          : formatCurrency(coupon.discountValue)}
                      </span>
                      <span>Tối thiểu: {formatCurrency(coupon.minOrderAmount)}</span>
                      <span>
                        HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Đã chọn {localSelection.length} mã
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClearSelection}>
              Bỏ chọn tất cả
            </Button>
            <Button onClick={handleApplySelection}>Áp dụng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
