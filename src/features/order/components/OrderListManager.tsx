// src/features/order/components/OrderListManager.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Eye, Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Pagination } from "@/src/components/ui/pagination"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  useOrderStore,
  useOrderList,
  useOrderListLoading,
  useOrderListError,
  useOrderListPagination,
} from "@/src/entities/order/service/order-service"
import { formatCurrency, formatDateOnly } from "@/src/shared/utils/format"
import { useAuth } from "@/src/core/providers/auth-provider"
import type { OrderFilter } from "@/src/entities/order/type/order"

export function OrderListManager() {
  const { isAuthenticated, isHydrated } = useAuth()
  const {
    fetchOrderList,
    clearOrderList,
    clearError,
  } = useOrderStore()
  const orderList = useOrderList()
  const isLoading = useOrderListLoading()
  const error = useOrderListError()
  const pagination = useOrderListPagination()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "shipping" | "completed">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const fetchedRef = useRef(false)

  // Map order status to display text
  const getOrderStatusText = (status: number): string => {
    // OrderStatusEnum: Processing = 0, Confirmed = 1, Shipping = 2, Delivered = 3, Cancelled = 4
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
      case 0: // Processing
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case 1: // Confirmed
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case 2: // Shipping
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case 3: // Delivered
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case 4: // Cancelled
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Build filter function
  const buildFilter = (): OrderFilter => {
    const filter: OrderFilter = {
      page: currentPage,
      pageSize: 10,
    }

    if (searchQuery) {
      filter.search = searchQuery
    }

    // Map tab to orderStatus
    if (activeTab !== "all") {
      switch (activeTab) {
        case "processing":
          filter.orderStatus = 0 // Processing
          break
        case "shipping":
          filter.orderStatus = 2 // Shipping
          break
        case "completed":
          filter.orderStatus = 3 // Delivered
          break
      }
    }

    return filter
  }

  // Fetch orders when dependencies change
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchedRef.current = true
      fetchOrderList(buildFilter())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAuthenticated, currentPage, activeTab, searchQuery])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOrderList()
      clearError()
    }
  }, [clearOrderList, clearError])

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    // Trigger re-fetch via useEffect dependency
  }

  // Handle tab change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    // Trigger re-fetch via useEffect dependency
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Trigger re-fetch via useEffect dependency
  }

  const statusMap = {
    all: "Tất cả",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    completed: "Đã giao",
  }

  const filteredOrders = orderList || []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium text-primary">Orders</p>
        <h1 className="text-4xl font-bold text-foreground">Đơn hàng của tôi</h1>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Tìm kiếm đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {Object.entries(statusMap).map(([key, label]) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "outline"}
              onClick={() => handleTabChange(key as typeof activeTab)}
              className="whitespace-nowrap"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && filteredOrders.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Orders List */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy đơn hàng nào</p>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mã đơn hàng: #{order.id}</p>
                      {order.createdAt && (
                        <p className="text-sm text-muted-foreground">
                          Ngày đặt: {formatDateOnly(order.createdAt)}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(order.orderStatus)}>
                      {getOrderStatusText(order.orderStatus)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.productImage || "/placeholder.svg"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.itemTotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng cộng</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(order.finalAmount)}
                      </p>
                    </div>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

