"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Ticket, Clock, ShoppingCart, CheckCircle2, XCircle } from "lucide-react"
import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { formatCurrency } from "@/src/shared/utils/format"
import { useCouponStore } from "@/src/entities/coupon/service"
import { useToast } from "@/src/hooks/use-toast"

export default function MyCouponsPage() {
  const { toast } = useToast()
  const {
    userCoupons,
    isLoading,
    error,
    fetchUserCoupons,
  } = useCouponStore()

  useEffect(() => {
    fetchUserCoupons()
  }, [fetchUserCoupons])

  const getDiscountText = (discountType: string | number, discountValue: number, maxDiscountCap?: number | null) => {
    // Backend trả về: "Percentage", "Fixed", "FreeShipping" (từ .ToString())
    // Có thể nhận cả string hoặc number (enum)
    const typeStr = String(discountType).toLowerCase().trim()
    
    // Check Percentage (0 hoặc "Percentage")
    if (typeStr === 'percentage' || typeStr === '0' || discountType === 0) {
      const text = `${discountValue}%`
      if (maxDiscountCap && maxDiscountCap > 0) {
        return `${text} (tối đa ${formatCurrency(maxDiscountCap)})`
      }
      return text
    }
    
    // Check FreeShipping (2 hoặc "FreeShipping")
    if (typeStr === 'freeshipping' || typeStr === '2' || discountType === 2) {
      return 'Miễn phí vận chuyển'
    }
    
    // Default: Fixed amount (1 hoặc "Fixed" hoặc "FixedAmount")
    return formatCurrency(discountValue)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (coupon: typeof userCoupons[0]) => {
    if (coupon.isUsed) {
      return <Badge className="bg-gray-500">Đã sử dụng</Badge>
    }
    if (coupon.isExpired) {
      return <Badge variant="destructive">Đã hết hạn</Badge>
    }
    return <Badge className="bg-green-500">Khả dụng</Badge>
  }

  const availableCoupons = userCoupons.filter(c => !c.isUsed && !c.isExpired)
  const usedCoupons = userCoupons.filter(c => c.isUsed)
  const expiredCoupons = userCoupons.filter(c => c.isExpired && !c.isUsed)

  return (
    <AuthGuard>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Phiếu Giảm Giá Của Tôi</h1>
                <p className="text-muted-foreground">
                  Quản lý tất cả phiếu giảm giá bạn đã thu thập
                </p>
              </div>
              <Link href="/coupons">
                <Button variant="outline">
                  <Ticket className="mr-2 h-4 w-4" />
                  Thu thập thêm
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          {!isLoading && !error && userCoupons.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Khả dụng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{availableCoupons.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Đã sử dụng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{usedCoupons.length}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Đã hết hạn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-2xl font-bold">{expiredCoupons.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Đang tải phiếu giảm giá của bạn...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchUserCoupons()}>Thử lại</Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && userCoupons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Ticket className="h-24 w-24 text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Chưa có phiếu giảm giá</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Bạn chưa thu thập phiếu giảm giá nào. Hãy khám phá và thu thập ngay!
              </p>
              <Link href="/coupons">
                <Button size="lg">
                  <Ticket className="mr-2 h-5 w-5" />
                  Thu thập phiếu giảm giá
                </Button>
              </Link>
            </div>
          )}

          {/* Available Coupons Section */}
          {!isLoading && !error && availableCoupons.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Phiếu khả dụng ({availableCoupons.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableCoupons.map((coupon) => (
                  <Card key={coupon.id} className="border-2 border-green-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold text-primary mb-1">
                            {getDiscountText(coupon.discountType, coupon.discountValue, coupon.maxDiscountCap)}
                          </CardTitle>
                          <CardDescription className="text-sm font-mono font-semibold">
                            {coupon.couponCode}
                          </CardDescription>
                        </div>
                        {getStatusBadge(coupon)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                      )}
                      {coupon.minOrderAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Đơn tối thiểu:</span>
                          <span className="font-semibold">{formatCurrency(coupon.minOrderAmount)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Hết hạn: {formatDate(coupon.endDate)}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Thu thập lúc: {formatDate(coupon.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Used Coupons Section */}
          {!isLoading && !error && usedCoupons.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
                Đã sử dụng ({usedCoupons.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {usedCoupons.map((coupon) => (
                  <Card key={coupon.id} className="opacity-75 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-muted-foreground mb-1">
                            {getDiscountText(coupon.discountType, coupon.discountValue, coupon.maxDiscountCap)}
                          </CardTitle>
                          <CardDescription className="text-sm font-mono">
                            {coupon.couponCode}
                          </CardDescription>
                        </div>
                        {getStatusBadge(coupon)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                      )}
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          Sử dụng lúc: {coupon.usedDate && formatDate(coupon.usedDate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Expired Coupons Section */}
          {!isLoading && !error && expiredCoupons.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                Đã hết hạn ({expiredCoupons.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expiredCoupons.map((coupon) => (
                  <Card key={coupon.id} className="opacity-60 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-muted-foreground mb-1">
                            {getDiscountText(coupon.discountType, coupon.discountValue, coupon.maxDiscountCap)}
                          </CardTitle>
                          <CardDescription className="text-sm font-mono">
                            {coupon.couponCode}
                          </CardDescription>
                        </div>
                        {getStatusBadge(coupon)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                      )}
                      <div className="text-sm text-red-500">
                        Hết hạn lúc: {formatDate(coupon.endDate)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
