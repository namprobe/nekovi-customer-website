// src/features/order/components/OrderDetailManager.tsx

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link" // Đảm bảo đã import Link
import { ArrowLeft, Loader2, Package, Star, CheckCircle2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { useToast } from "@/src/hooks/use-toast";
import {
  useOrderStore,
  useOrderDetail,
  useOrderDetailLoading,
  useOrderDetailError,
  orderService,
} from "@/src/entities/order/service/order-service"
import type { ShippingHistoryDto } from "@/src/entities/order/type/order"
import { formatCurrency, formatDateOnly, formatDateTime, formatOrderId } from "@/src/shared/utils/format"
import { useAuth } from "@/src/core/providers/auth-provider"
import { ProductReviewDialog } from "@/src/features/productReview/ProductReviewDialog"
import { productReviewService } from "@/src/entities/productReview/service/product-review-service"

interface OrderDetailManagerProps {
  orderId: string
}

export function OrderDetailManager({ orderId }: OrderDetailManagerProps) {
  const { isAuthenticated, isHydrated } = useAuth()
  const { toast } = useToast()
  const { fetchOrderDetail, clearOrderDetail, clearError } = useOrderStore()
  const order = useOrderDetail()
  const isLoading = useOrderDetailLoading()
  const error = useOrderDetailError()
  const fetchedRef = useRef(false)
  const [shippingHistory, setShippingHistory] = useState<ShippingHistoryDto[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // State lưu trạng thái review
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({})

  const [reviewDialogState, setReviewDialogState] = useState<{
    isOpen: boolean
    productId: string
    productName: string
    productImage?: string
  }>({
    isOpen: false,
    productId: "",
    productName: "",
    productImage: undefined,
  })

  // Hàm check review
  const checkAllReviewsStatus = useCallback(async () => {
    if (!order?.items || order.items.length === 0) return;
    if (order.orderStatus !== 3) return;

    const promises = order.items.map(async (item) => {
      const validProductId = item.productId || (item as any).ProductId || item.productName;
      if (!validProductId) return null;

      try {
        const response = await productReviewService.getMyReview({
          productId: validProductId,
          orderId: orderId
        });
        if (response.isSuccess && response.value) {
          return { id: validProductId, isReviewed: true };
        }
        return { id: validProductId, isReviewed: false };
      } catch (e) {
        return { id: validProductId, isReviewed: false };
      }
    });

    const results = await Promise.all(promises);
    const statusMap: Record<string, boolean> = {};
    results.forEach(res => {
      if (res) statusMap[res.id] = res.isReviewed;
    });
    setReviewedItems(statusMap);
  }, [order, orderId]);

  // Effects
  useEffect(() => {
    if (isHydrated && isAuthenticated && !fetchedRef.current && orderId) {
      fetchedRef.current = true
      fetchOrderDetail(orderId)
    }
  }, [isHydrated, isAuthenticated, orderId, fetchOrderDetail])

  useEffect(() => {
    if (isHydrated && isAuthenticated && orderId) {
      setIsLoadingHistory(true)
      orderService.getShippingHistory(orderId)
        .then((result) => {
          if (result.isSuccess && result.data) setShippingHistory(result.data)
        })
        .catch(() => { })
        .finally(() => setIsLoadingHistory(false))
    }
  }, [isHydrated, isAuthenticated, orderId])

  useEffect(() => {
    if (order) checkAllReviewsStatus();
  }, [order, checkAllReviewsStatus]);

  useEffect(() => {
    return () => {
      clearOrderDetail()
      clearError()
    }
  }, [clearOrderDetail, clearError])

  const handleOpenReview = (item: any) => {
    const validProductId = item.productId || item.ProductId || item.product?.id || item.id;
    if (!validProductId) {
      toast({ variant: "destructive", title: "Lỗi dữ liệu", description: "Không tìm thấy ID sản phẩm." })
      return;
    }
    setReviewDialogState({
      isOpen: true,
      productId: validProductId,
      productName: item.productName || "Sản phẩm",
      productImage: item.productImage || undefined,
    })
  }

  const handleReviewSuccess = () => {
    checkAllReviewsStatus();
  }

  // Helpers
  const getOrderStatusText = (status: number): string => {
    switch (status) {
      case 0: return "Đang xử lý"; case 1: return "Đã xác nhận"; case 2: return "Đang giao hàng";
      case 3: return "Đã giao"; case 4: return "Đã hủy"; case 5: return "Đã trả hàng"; case 6: return "Giao thất bại";
      default: return "Không xác định";
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "text-blue-600"; case 1: return "text-purple-600"; case 2: return "text-yellow-600";
      case 3: return "text-green-600"; case 4: return "text-red-600"; case 5: return "text-orange-600";
      case 6: return "text-rose-600"; default: return "text-gray-600";
    }
  }

  const shippingInfo = order?.shipping
  const trackingEvents = shippingHistory.length > 0
    ? shippingHistory.map((history) => ({
      title: history.statusDescription,
      description: history.statusName,
      date: formatDateTime(history.eventTime),
      statusCode: history.statusCode,
    }))
    : [
      shippingInfo?.shippedDate && { title: "Đã gửi hàng", description: "Đơn hàng đã bàn giao cho đơn vị vận chuyển", date: formatDateTime(shippingInfo.shippedDate), statusCode: 5 },
      shippingInfo?.estimatedDeliveryDate && { title: "Dự kiến giao", description: "Thời gian giao hàng dự kiến", date: formatDateTime(shippingInfo.estimatedDeliveryDate), statusCode: 0 },
      shippingInfo?.deliveredDate && { title: "Đã giao", description: "Đơn hàng đã giao cho khách", date: formatDateTime(shippingInfo.deliveredDate), statusCode: 11 },
    ].filter(Boolean) as { title: string; description: string; date: string; statusCode: number }[]

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Lỗi</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>
    )
  }

  // Not found state
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Không tìm thấy đơn hàng</h1>
        <p className="text-muted-foreground mb-6">Đơn hàng với ID #{formatOrderId(orderId)} không tồn tại</p>
        <Link href="/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Chi tiết đơn hàng #{formatOrderId(order.id)}</h1>
        <div className="flex items-center gap-4">
          <Badge className={`${getStatusColor(order.orderStatus)} bg-opacity-20`}>
            {getOrderStatusText(order.orderStatus)}
          </Badge>
          <span className="text-muted-foreground">
            Tổng tiền: {formatCurrency(order.finalAmount)}
          </span>
        </div>
      </div>

      {/* Thông tin vận chuyển (Rút gọn cho tập trung vào Items) */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Đơn vị vận chuyển</p>
              <p className="font-semibold">
                {shippingInfo?.shippingMethodName || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <p className={`font-semibold ${getStatusColor(shippingInfo?.shippingStatus ?? order.orderStatus)}`}>
                {getOrderStatusText(shippingInfo?.shippingStatus ?? order.orderStatus)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mã vận đơn</p>
              <p className="font-semibold">
                {shippingInfo?.trackingNumber || "Đang cập nhật"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Người nhận</p>
              <p className="font-semibold">
                {shippingInfo?.recipientName || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="font-semibold">
                {shippingInfo?.recipientPhone || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Địa chỉ</p>
              <p className="font-semibold">
                {shippingInfo?.address
                  ? `${shippingInfo.address}${shippingInfo.wardName ? `, ${shippingInfo.wardName}` : ""}${shippingInfo.districtName ? `, ${shippingInfo.districtName}` : ""}${shippingInfo.provinceName ? `, ${shippingInfo.provinceName}` : ""}`
                  : "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ngày gửi</p>
              <p className="font-semibold">
                {shippingInfo?.shippedDate
                  ? formatDateOnly(shippingInfo.shippedDate)
                  : "Chưa có"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dự kiến giao</p>
              <p className="font-semibold">
                {shippingInfo?.estimatedDeliveryDate
                  ? formatDateOnly(shippingInfo.estimatedDeliveryDate)
                  : "Chưa có"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày giao thực tế</p>
              <p className="font-semibold">
                {shippingInfo?.deliveredDate
                  ? formatDateOnly(shippingInfo.deliveredDate)
                  : "Chưa có"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
              <p className="font-semibold">{formatOrderId(order.id)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo</p>
              <p className="font-semibold">
                {order.createdAt ? formatDateTime(order.createdAt) : "Chưa có"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ghi chú</p>
              <p className="font-semibold">
                {"Không có ghi chú"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-xl font-semibold">Sản phẩm trong đơn hàng</h2>
        <div className="space-y-4">
          {order.items.map((item) => {
            const isReviewed = reviewedItems[item.productId];
            // Xác định link sản phẩm
            const productLink = `/products/${item.productId}`;

            return (
              <div key={item.id} className="flex gap-4 rounded-lg border p-4">

                {/* --- 1. ẢNH SẢN PHẨM CÓ LINK --- */}
                <Link href={productLink} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg block cursor-pointer">
                  <Image
                    src={item.productImage || "/placeholder.svg"}
                    alt={item.productName}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 items-start justify-between">
                  <div>
                    {/* --- 2. TÊN SẢN PHẨM CÓ LINK --- */}
                    <h3 className="font-medium">
                      <Link href={productLink} className="hover:text-primary hover:underline transition-colors">
                        {item.productName}
                      </Link>
                    </h3>

                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                    {item.categoryName && <p className="text-sm text-muted-foreground">Danh mục: {item.categoryName}</p>}
                    {item.animeSeriesName && <p className="text-sm text-muted-foreground">Anime: {item.animeSeriesName}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(item.itemTotal)}</p>
                      {item.discountAmount > 0 && (
                        <p className="text-sm text-muted-foreground line-through">{formatCurrency(item.unitPrice * item.quantity)}</p>
                      )}
                    </div>

                    {order.orderStatus === 3 && (
                      <Button
                        size="sm"
                        variant={isReviewed ? "secondary" : "outline"}
                        onClick={() => handleOpenReview(item)}
                        className={`mt-1 ${isReviewed ? "text-green-700 bg-green-100 hover:bg-green-200 border-green-200" : ""}`}
                      >
                        {isReviewed ? (
                          <>
                            <CheckCircle2 className="mr-2 h-3 w-3 text-green-600" />
                            <span className="font-medium">Đã đánh giá</span>
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-3 w-3" />
                            Đánh giá
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng đơn hàng gốc:</span>
              <span>{formatCurrency(order.subtotalOriginal)}</span>
            </div>
            {order.productDiscountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá sản phẩm:</span>
                <span>-{formatCurrency(order.productDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng sau giảm giá sản phẩm:</span>
              <span>{formatCurrency(order.subtotalAfterProductDiscount)}</span>
            </div>
            {order.couponDiscountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá voucher:</span>
                <span>-{formatCurrency(order.couponDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền hàng:</span>
              <span>{formatCurrency(order.totalProductAmount)}</span>
            </div>
            {order.shippingFeeOriginal > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span>{formatCurrency(order.shippingFeeOriginal)}</span>
                </div>
                {order.shippingDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm phí vận chuyển:</span>
                    <span>-{formatCurrency(order.shippingDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển sau ưu đãi:</span>
                  <span>{formatCurrency(order.shippingFeeActual)}</span>
                </div>
              </>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thuế:</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            {order.payment && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức thanh toán:</span>
                  <span>{order.payment.paymentMethodName}</span>
                </div>
                {order.payment.transactionNo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch:</span>
                    <span className="font-mono text-sm">{order.payment.transactionNo}</span>
                  </div>
                )}
              </>
            )}
            {order.appliedCoupons && order.appliedCoupons.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">Voucher đã sử dụng:</p>
                {order.appliedCoupons.map((coupon, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {coupon.couponCode}
                      {coupon.description && ` - ${coupon.description}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Thành tiền:</span>
              <span className="text-primary">{formatCurrency(order.finalAmount)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-10">
        <Card className="bg-destructive/10 p-6 lg:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-destructive">Lịch sử vận chuyển</h2>
          </div>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : trackingEvents.length > 0 ? (
            <div className="space-y-4">
              {trackingEvents.map((event, index) => (
                <div key={`${event.title}-${index}`} className="relative border-l-2 border-primary pl-4 pb-4 last:border-l-0 last:pb-0">
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary"></div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu vận chuyển cho đơn hàng này.
            </p>
          )}
        </Card>
        <div className="flex items-center justify-center p-6 lg:col-span-3">
          <div className="relative h-60 w-60">
            <Image src="/cute-anime-cat-mascot-with-pink-hat-holding-packag.jpg" alt="Mascot" fill className="object-contain" />
          </div>
        </div>
      </div>

      <ProductReviewDialog
        open={reviewDialogState.isOpen}
        onOpenChange={(open) => {
          setReviewDialogState(prev => ({ ...prev, isOpen: open }));
          if (!open) checkAllReviewsStatus();
        }}
        productId={reviewDialogState.productId}
        orderId={orderId}
        productName={reviewDialogState.productName}
        productImage={reviewDialogState.productImage}
      />
    </div>
  )
}