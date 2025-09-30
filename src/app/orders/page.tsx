"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/src/core/providers/auth-provider"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { formatCurrency } from "@/src/shared/utils/format"
import { Search, Eye } from "lucide-react"
import { redirect } from "next/navigation"

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
        id: "2",
        name: "Trang phục Violet Evergarden",
        image: "/violet-evergarden-cosplay.jpg",
        quantity: 1,
        price: 2500000,
      },
    ],
    status: "Đang giao hàng",
    total: 2500000,
    date: "2024-01-14",
  },
  {
    id: "3",
    items: [
      {
        id: "3",
        name: "Trang Phục Luffy",
        image: "/luffy-cosplay.jpg",
        quantity: 1,
        price: 2500000,
      },
    ],
    status: "Đang giao hàng",
    total: 2500000,
    date: "2024-01-13",
  },
]

const tabs = [
  { id: "all", label: "Tất cả đơn" },
  { id: "pending", label: "Chờ thanh toán" },
  { id: "shipping", label: "Vận chuyển" },
  { id: "delivering", label: "Chờ giao hàng" },
  { id: "completed", label: "Hoàn thành" },
  { id: "returned", label: "Đã hủy" },
]

export default function OrdersPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("delivering")
  const [searchQuery, setSearchQuery] = useState("")

  if (!user) {
    redirect("/login")
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Đang giao hàng":
        return "default"
      case "Hoàn thành":
        return "secondary"
      case "Đã hủy":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-primary">Thanh toán</h1>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border bg-card p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "" : "bg-transparent"}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button className="bg-teal-700 hover:bg-teal-800">Đã nhận hàng</Button>
          <Button variant="outline" className="bg-transparent">
            Yêu cầu Trả hàng/Hoàn tiền
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    <span className="text-sm text-muted-foreground">Đơn hàng #{order.id}</span>
                    <span className="text-sm text-muted-foreground">{order.date}</span>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Số lượng : {item.quantity}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Tổng cộng: {order.items.length} sản phẩm
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(order.total)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
