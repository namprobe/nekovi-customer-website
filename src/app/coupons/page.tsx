"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Ticket, Gift, Clock, Users } from "lucide-react"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { formatCurrency } from "@/src/shared/utils/format"
import { useCouponStore } from "@/src/entities/coupon/service"
import { useToast } from "@/src/hooks/use-toast"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useRouter } from "next/navigation"

export default function CouponsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const {
    availableCoupons,
    isLoading,
    error,
    fetchAvailableCoupons,
    collectCoupon,
    isCollected,
  } = useCouponStore()

  useEffect(() => {
    fetchAvailableCoupons()
  }, [fetchAvailableCoupons])

  const handleCollectCoupon = async (couponId: string, couponCode: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thu thập phiếu giảm giá",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const result = await collectCoupon({ couponId })
    
    if (result.success) {
      toast({
        title: "Thu thập thành công!",
        description: `Bạn đã thu thập phiếu giảm giá ${couponCode}`,
      })
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể thu thập phiếu giảm giá",
        variant: "destructive",
      })
    }
  }

  const getDiscountText = (discountType: string, discountValue: number, maxDiscountCap?: number | null) => {
    if (discountType === 'Percentage') {
      const text = `${discountValue}%`
      if (maxDiscountCap && maxDiscountCap > 0) {
        return `${text} (tối đa ${formatCurrency(maxDiscountCap)})`
      }
      return text
    }
    return formatCurrency(discountValue)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Gift className="h-12 w-12 text-primary mr-3" />
              <div>
                <h1 className="text-4xl font-bold">Phiếu Giảm Giá</h1>
                <p className="text-muted-foreground text-lg">
                  Thu thập phiếu giảm giá để tiết kiệm chi phí cho đơn hàng của bạn!
                </p>
              </div>
            </div>
            {isAuthenticated && (
              <Link href="/my-coupons">
                <Button variant="outline" size="lg">
                  <Ticket className="mr-2 h-5 w-5" />
                  Phiếu của tôi
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Đang tải phiếu giảm giá...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchAvailableCoupons()}>Thử lại</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && availableCoupons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Ticket className="h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Không có phiếu giảm giá</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Hiện tại chưa có phiếu giảm giá nào khả dụng. Vui lòng quay lại sau!
            </p>
          </div>
        )}

        {/* Coupons Grid */}
        {!isLoading && !error && availableCoupons.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableCoupons.map((coupon) => {
              const collected = isCollected(coupon.id)
              const expiringSoon = isExpiringSoon(coupon.endDate)

              return (
                <Card
                  key={coupon.id}
                  className="relative overflow-hidden border-2 hover:shadow-lg transition-all"
                >
                  {/* Badge góc trên */}
                  {collected && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-green-500">
                        Đã thu thập
                      </Badge>
                    </div>
                  )}
                  {expiringSoon && !collected && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-orange-500">
                        Sắp hết hạn
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold text-primary mb-2">
                          {getDiscountText(coupon.discountType, coupon.discountValue, coupon.maxDiscountCap)}
                        </CardTitle>
                        <CardDescription className="text-sm font-mono font-semibold">
                          {coupon.code}
                        </CardDescription>
                      </div>
                      <Ticket className="h-8 w-8 text-primary/30" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground">
                        {coupon.description}
                      </p>
                    )}

                    {/* Min Order Amount */}
                    {coupon.minOrderAmount > 0 && (
                      <div className="flex items-center text-sm">
                        <span className="text-muted-foreground">
                          Đơn tối thiểu:
                        </span>
                        <span className="ml-2 font-semibold">
                          {formatCurrency(coupon.minOrderAmount)}
                        </span>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                      </span>
                    </div>

                    {/* Usage Limit */}
                    {coupon.usageLimit && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          Còn lại: {coupon.remainingSlots} / {coupon.usageLimit}
                        </span>
                      </div>
                    )}

                    {/* Collect Button */}
                    <Button
                      className="w-full"
                      disabled={collected || isLoading}
                      onClick={() => handleCollectCoupon(coupon.id, coupon.code)}
                      variant={collected ? "secondary" : "default"}
                    >
                      {collected ? "Đã thu thập" : "Thu thập ngay"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
