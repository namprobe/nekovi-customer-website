"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus } from "lucide-react"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useCart } from "@/src/core/providers/cart-provider"
import { formatCurrency } from "@/src/shared/utils/format"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart()

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">Giỏ hàng trống</h1>
          <p className="mb-8 text-muted-foreground">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link href="/products">
            <Button>Tiếp tục mua sắm</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Giỏ hàng của bạn</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-lg border bg-card p-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-medium hover:text-primary">{item.product.name}</h3>
                      </Link>
                      <p className="mt-1 text-lg font-bold text-primary">{formatCurrency(item.product.price)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
              </div>

              <div className="my-4">
                <Input placeholder="Nhập mã giảm giá" />
                <Button variant="outline" className="mt-2 w-full bg-transparent">
                  Áp dụng
                </Button>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
              </div>

              <Button className="mt-6 w-full" size="lg" onClick={handleCheckout}>
                Thanh toán
              </Button>

              <Link href="/products">
                <Button variant="outline" className="mt-2 w-full bg-transparent">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
