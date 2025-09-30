import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Search, Download, Package, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/src/shared/utils/format"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  // Mock orders data - in production, fetch from API
  const mockOrders = [
    {
      id: "1",
      orderNumber: "1736626932601",
      createdDate: "17/05/2024",
      receivedDate: "17/05/2024",
      estimatedDelivery: "21/05/2024",
      weight: "500",
      service: "Giao hàng nhanh",
      status: "Đang giao hàng",
      statusColor: "text-blue-600",
      total: 2500000,
      items: [
        {
          id: "1",
          name: "Astray Blue Third Momoko",
          image: "/gundam-astray-blue.jpg",
          quantity: 1,
          price: 2500000,
        },
      ],
      recipient: {
        name: "Nguyen Van A",
        address: "Hồ Chí Minh - THÀNH PHỐ THỦ ĐỨC",
      },
      tracking: [
        {
          date: "17/05/2024 18:24:07",
          status: "Đã nhận hàng",
          description: "Nhận thành công - Nhân viên N***** - 8******",
        },
      ],
    },
    {
      id: "2",
      orderNumber: "1736626932602",
      createdDate: "16/05/2024",
      receivedDate: "16/05/2024",
      estimatedDelivery: "20/05/2024",
      weight: "300",
      service: "Giao hàng tiết kiệm",
      status: "Đã giao hàng",
      statusColor: "text-green-600",
      total: 2500000,
      items: [
        {
          id: "2",
          name: "Trang phục Violet Evergarden",
          image: "/violet-evergarden-cosplay.jpg",
          quantity: 1,
          price: 2500000,
        },
      ],
      recipient: {
        name: "Tran Thi B",
        address: "Hà Nội - QUẬN CẦU GIẤY",
      },
      tracking: [
        {
          date: "16/05/2024 14:30:15",
          status: "Đã giao hàng",
          description: "Giao hàng thành công - Nhân viên L***** - 9******",
        },
      ],
    },
  ]

  // Find order by ID
  const order = mockOrders.find((o) => o.id === params.id)

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Không tìm thấy đơn hàng</h1>
          <p className="text-muted-foreground mb-6">Đơn hàng với ID {params.id} không tồn tại</p>
          <Link href="/orders">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách đơn hàng
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
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
            <Badge className={`${order.statusColor} bg-opacity-20`}>{order.status}</Badge>
            <span className="text-muted-foreground">Tổng tiền: {formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Order Information Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {/* Order Details Card */}
          <Card className="bg-muted/30 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã phiếu gửi:</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chi tiết đơn hàng:</p>
                <button className="text-accent hover:underline">Xem chi tiết</button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người nhận:</p>
                <p className="font-medium">{order.recipient.name}</p>
                <p className="text-sm text-muted-foreground">{order.recipient.address}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Details Card */}
          <Card className="bg-muted/30 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Khối lượng(Gram):</p>
                <p className="font-semibold">{order.weight}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dịch vụ:</p>
                <p className="font-medium">{order.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái:</p>
                <p className={`font-semibold ${order.statusColor}`}>{order.status}</p>
              </div>
            </div>
          </Card>

          {/* Dates Card */}
          <Card className="bg-muted/30 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Ngày tạo:</p>
                <p className="font-semibold">{order.createdDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày nhận hàng:</p>
                <p className="font-semibold">{order.receivedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày giao hàng dự kiến:</p>
                <p className="font-semibold">{order.estimatedDelivery}</p>
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
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              </div>
            ))}
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
            {order.tracking.map((event, index) => (
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
              <Input placeholder="Tra  cứu đơn hàng" className="flex-1" />
              <Button size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Mascot Illustration - 30% */}
          <div className="flex items-center justify-center p-6 lg:col-span-3">
            <div className="relative h-80 w-80">
              <Image src="/cute-anime-cat-mascot-with-pink-hat-holding-packag.jpg" alt="NekoVi Mascot" fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
