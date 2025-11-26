// src/features/order/components/OrderDetailManager.tsx

"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Loader2, Package, Download, Search } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import {
  useOrderStore,
  useOrderDetail,
  useOrderDetailLoading,
  useOrderDetailError,
} from "@/src/entities/order/service/order-service"
import { formatCurrency, formatDateOnly, formatDateTime } from "@/src/shared/utils/format"
import { useAuth } from "@/src/core/providers/auth-provider"

interface OrderDetailManagerProps {
  orderId: string
}

export function OrderDetailManager({ orderId }: OrderDetailManagerProps) {
  const { isAuthenticated, isHydrated } = useAuth()
  const { fetchOrderDetail, clearOrderDetail, clearError } = useOrderStore()
  const order = useOrderDetail()
  const isLoading = useOrderDetailLoading()
  const error = useOrderDetailError()
  const fetchedRef = useRef(false)

  // Fetch order detail
  useEffect(() => {
    if (isHydrated && isAuthenticated && !fetchedRef.current && orderId) {
      fetchedRef.current = true
      fetchOrderDetail(orderId)
    }
  }, [isHydrated, isAuthenticated, orderId, fetchOrderDetail])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOrderDetail()
      clearError()
    }
  }, [clearOrderDetail, clearError])

  // Map order status to display text
  const getOrderStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Đang xử lý"
      case 1:
        return "Đã xác nhận"
      case 2:
        return "Đang giao hàng"
      case 3:
        return "Đã giao"
      case 4:
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "text-blue-600"
      case 1:
        return "text-purple-600"
      case 2:
        return "text-yellow-600"
      case 3:
        return "text-green-600"
      case 4:
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Mock shipping data (as requested)
  const mockShippingData = {
    orderNumber: order?.id || "N/A",
    createdDate: order?.createdAt ? formatDateOnly(order.createdAt) : "N/A",
    receivedDate: order?.createdAt ? formatDateOnly(order.createdAt) : "N/A",
    estimatedDelivery: "N/A",
    weight: "500",
    service: "Giao hàng nhanh",
    status: getOrderStatusText(order?.orderStatus || 0),
    statusColor: getStatusColor(order?.orderStatus || 0),
    recipient: {
      name: "Nguyen Van A",
      address: "Hồ Chí Minh - THÀNH PHỐ THỦ ĐỨC",
    },
    tracking: [
      {
        date: order?.createdAt ? formatDateTime(order.createdAt) : "N/A",
        status: getOrderStatusText(order?.orderStatus || 0),
        description: "Đơn hàng đã được tạo",
      },
    ],
  }

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
        <p className="text-muted-foreground mb-6">Đơn hàng với ID {orderId} không tồn tại</p>
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
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Chi tiết đơn hàng #{order.id}</h1>
        <div className="flex items-center gap-4">
          <Badge className={`${getStatusColor(order.orderStatus)} bg-opacity-20`}>
            {getOrderStatusText(order.orderStatus)}
          </Badge>
          <span className="text-muted-foreground">
            Tổng tiền: {formatCurrency(order.finalAmount)}
          </span>
        </div>
      </div>

      {/* Order Information Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        {/* Order Details Card */}
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Mã phiếu gửi:</p>
              <p className="font-semibold">{mockShippingData.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chi tiết đơn hàng:</p>
              <button className="text-accent hover:underline">Xem chi tiết</button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Người nhận:</p>
              <p className="font-medium">{mockShippingData.recipient.name}</p>
              <p className="text-sm text-muted-foreground">{mockShippingData.recipient.address}</p>
            </div>
          </div>
        </Card>

        {/* Shipping Details Card */}
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Khối lượng(Gram):</p>
              <p className="font-semibold">{mockShippingData.weight}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dịch vụ:</p>
              <p className="font-medium">{mockShippingData.service}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái:</p>
              <p className={`font-semibold ${mockShippingData.statusColor}`}>
                {mockShippingData.status}
              </p>
            </div>
          </div>
        </Card>

        {/* Dates Card */}
        <Card className="bg-muted/30 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo:</p>
              <p className="font-semibold">{mockShippingData.createdDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày nhận hàng:</p>
              <p className="font-semibold">{mockShippingData.receivedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày giao hàng dự kiến:</p>
              <p className="font-semibold">{mockShippingData.estimatedDelivery}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-xl font-semibold">Sản phẩm trong đơn hàng</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-lg border p-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.productImage || "/placeholder.svg"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.productName}</h3>
                  <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  {item.categoryName && (
                    <p className="text-sm text-muted-foreground">Danh mục: {item.categoryName}</p>
                  )}
                  {item.animeSeriesName && (
                    <p className="text-sm text-muted-foreground">
                      Anime: {item.animeSeriesName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(item.itemTotal)}</p>
                  {item.discountAmount > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 border-t pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            {order.payment && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span>{order.payment.paymentMethodName}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Thành tiền:</span>
              <span className="text-primary">{formatCurrency(order.finalAmount)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tracking Timeline and Mascot */}
      <div className="mb-8 grid gap-6 lg:grid-cols-10">
        {/* Tracking Timeline - 70% */}
        <Card className="bg-destructive/10 p-6 lg:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-destructive">Lịch sử vận chuyển</h2>
          </div>
          {mockShippingData.tracking.map((event, index) => (
            <div key={index} className="mb-2">
              <p className="text-sm font-medium">{event.date}</p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <button className="mt-1 flex items-center gap-1 text-sm text-accent hover:underline">
                <Download className="h-4 w-4" />
                Tải ảnh tin bưu cục
              </button>
            </div>
          ))}

          {/* Search Tracking */}
          <div className="mt-6 flex gap-2">
            <Input placeholder="Tra cứu đơn hàng" className="flex-1" />
            <Button size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Mascot Illustration - 30% */}
        <div className="flex items-center justify-center p-6 lg:col-span-3">
          <div className="relative h-80 w-80">
            <Image
              src="/cute-anime-cat-mascot-with-pink-hat-holding-packag.jpg"
              alt="NekoVi Mascot"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

