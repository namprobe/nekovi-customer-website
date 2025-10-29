"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { formatCurrency } from "@/src/shared/utils/format"
import { Search, Eye } from "lucide-react"

const mockOrders = [
  {
    id: "1",
    items: [
      {
        id: "1",
        name: "Astray Blue Third Momoko",
        image: "/gundam-astray-blue.jpg",
        quantity: 1,
        price: 2500000,
      },
    ],
    status: "Đang giao hàng",
    total: 2500000,
    date: "2024-01-15",
  },
  {
    id: "2",
    items: [
      {
        id: "1",
        name: "Trang phục Maomao",
        image: "/maomao-cosplay-costume.jpg",
        quantity: 1,
        price: 10990,
      },
      {
        id: "2",
        name: "Móc khóa Doraemon",
        image: "/doraemon-keychain.jpg",
        quantity: 2,
        price: 5000,
      },
    ],
    status: "Đã giao",
    total: 20990,
    date: "2024-01-10",
  },
  {
    id: "3",
    items: [
      {
        id: "1",
        name: "Figure Goku Super Saiyan",
        image: "/goku-figure.jpg",
        quantity: 1,
        price: 450000,
      },
    ],
    status: "Đang xử lý",
    total: 450000,
    date: "2024-01-18",
  },
]

function OrdersPageContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "shipping" | "completed">("all")

  const statusMap = {
    all: "Tất cả",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    completed: "Đã giao",
  }

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = order.items.some((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "processing" && order.status === "Đang xử lý") ||
      (activeTab === "shipping" && order.status === "Đang giao hàng") ||
      (activeTab === "completed" && order.status === "Đã giao")

    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Đang giao hàng":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Đã giao":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <MainLayout>
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
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {Object.entries(statusMap).map(([key, label]) => (
              <Button
                key={key}
                variant={activeTab === key ? "default" : "outline"}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className="whitespace-nowrap"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn hàng: #{order.id}</p>
                    <p className="text-sm text-muted-foreground">Ngày đặt: {order.date}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng cộng</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(order.total)}</p>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default function OrdersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrdersPageContent />
    </AuthGuard>
  )
}
