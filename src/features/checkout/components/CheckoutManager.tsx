// src/features/checkout/components/CheckoutManager.tsx

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { useCartStore } from "@/src/entities/cart/service"
import { useAuth } from "@/src/core/providers/auth-provider"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Checkbox } from "@/src/components/ui/checkbox"
import { formatCurrency } from "@/src/shared/utils/format"
import { useToast } from "@/src/hooks/use-toast"
import { orderService } from "@/src/entities/order/service"
import { paymentMethodService } from "@/src/entities/payment-method/service"
import type { PaymentMethodItem } from "@/src/entities/payment-method/type/payment-method"
import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"

const steps = ["Tất cả đơn", "Chờ thanh toán", "Vận chuyển", "Chờ giao hàng", "Hoàn thành"]

export function CheckoutManager() {
  const { cart, fetchCart } = useCartStore()
  const { user, isAuthenticated, isHydrated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [saveInfo, setSaveInfo] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ensure cart loaded (first page default)
  useEffect(() => {
    if (isHydrated && isAuthenticated && !cart) {
      fetchCart({ page: 1, pageSize: 6 }).catch(() => {})
    }
  }, [cart, fetchCart, isHydrated, isAuthenticated])

  // Load payment methods (chỉ lấy Active) - load cho cả user đã login và chưa login
  useEffect(() => {
    const loadPaymentMethods = async () => {
      setIsLoadingPaymentMethods(true)
      try {
        const result = await paymentMethodService.getPaymentMethods({
          page: 1,
          pageSize: 100,
          status: EntityStatusEnum.Active,
        })
        if (result.isSuccess && result.data) {
          setPaymentMethods(result.data.items || [])
          // Set first payment method as default
          if (result.data.items && result.data.items.length > 0) {
            setSelectedPaymentMethodId(result.data.items[0].id)
          }
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách phương thức thanh toán",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPaymentMethods(false)
      }
    }

    if (isHydrated) {
      loadPaymentMethods()
    }
  }, [isHydrated, toast])

  // Chỉ cần form data khi user chưa login (one-click purchase)
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    note: "",
    phone: "",
    email: "",
  })

  // Update form data khi user login
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        fullName: user.username || "",
        address: "",
        note: "",
        phone: user.phoneNumber || "",
        email: user.email || "",
      })
    }
  }, [isAuthenticated, user])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if ((cart?.cartItems?.length || 0) === 0) {
    router.push("/cart")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPaymentMethodId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive",
      })
      return
    }

    if (!cart || cart.cartItems.length === 0) {
      toast({
        title: "Lỗi",
        description: "Giỏ hàng trống",
        variant: "destructive",
      })
      return
    }

    // Validate form data chỉ khi user chưa login (one-click purchase)
    if (!isAuthenticated) {
      if (!formData.fullName.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập họ và tên",
          variant: "destructive",
        })
        return
      }
      if (!formData.address.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập địa chỉ giao hàng",
          variant: "destructive",
        })
        return
      }
      if (!formData.phone.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập số điện thoại",
          variant: "destructive",
        })
        return
      }
      if (!formData.email.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập email",
          variant: "destructive",
        })
        return
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Lỗi",
          description: "Email không hợp lệ",
          variant: "destructive",
        })
        return
      }
    }

    setIsPlacingOrder(true)

    try {
      // Chỉ gửi guest info khi user chưa login
      const orderRequest = {
        productId: null,
        quantity: null,
        couponCode: couponCode || null,
        paymentMethodId: selectedPaymentMethodId,
        isOneClick: !isAuthenticated, // true nếu user chưa login
        // Guest info chỉ cần khi isOneClick = true
        ...(!isAuthenticated && {
          guestEmail: formData.email,
          guestFirstName: formData.fullName.split(" ")[0] || formData.fullName,
          guestLastName: formData.fullName.split(" ").slice(1).join(" ") || "",
          guestPhone: formData.phone,
          oneClickAddress: formData.address,
        }),
      }

      const result = await orderService.placeOrder(orderRequest)

      if (result.isSuccess && result.data) {
        // Nếu có paymentUrl, redirect đến payment gateway
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl
          return
        }

        // Nếu không có paymentUrl (offline payment), thông báo thành công và refresh cart
        toast({
          title: "Đặt hàng thành công",
          description: "Cảm ơn bạn đã mua hàng tại NekoVi!",
        })
        
        // Refresh cart to get updated state (backend đã xóa cart items)
        await fetchCart({ page: 1, pageSize: 6 })
      } else {
        toast({
          title: "Lỗi",
          description: result.message || "Đặt hàng thất bại",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đặt hàng thất bại",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold text-primary">Thanh toán</h1>

      {/* Steps */}
      <div className="mb-8 flex items-center justify-between rounded-lg border bg-card p-4">
        {steps.map((step, index) => (
          <button
            key={step}
            onClick={() => setCurrentStep(index)}
            className={`flex-1 text-center text-sm font-medium ${
              currentStep === index ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {step}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold">
                {isAuthenticated ? "Thông tin giao hàng" : "Thông tin giao hàng*"}
              </h2>

              {isAuthenticated ? (
                // User đã login: chỉ hiển thị note (optional)
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Thông tin giao hàng sẽ được lấy từ tài khoản của bạn.
                    </p>
                    {user && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Họ tên:</span> {user.username || "Chưa cập nhật"}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {user.email || "Chưa cập nhật"}
                        </p>
                        {user.phoneNumber && (
                          <p>
                            <span className="font-medium">Số điện thoại:</span> {user.phoneNumber}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="bg-muted/50"
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    />
                  </div>
                </div>
              ) : (
                // User chưa login: hiển thị form bắt buộc
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên*</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ giao hàng*</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại*</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="bg-muted/50"
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="saveInfo" checked={saveInfo} onCheckedChange={(checked) => setSaveInfo(!!checked)} />
                    <Label htmlFor="saveInfo" className="cursor-pointer text-sm">
                      Lưu thông tin cho lần thanh toán tiếp theo
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6 rounded-lg border bg-card p-6">
              <div className="space-y-4">
                {cart!.cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imagePath || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng đơn hàng</span>
                  <span className="font-medium">{formatCurrency(cart?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Tổng:</span>
                <span className="text-primary">{formatCurrency(cart?.totalPrice || 0)}</span>
              </div>

              <div className="space-y-3">
                <Label>Phương thức thanh toán*</Label>
                {isLoadingPaymentMethods ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có phương thức thanh toán</p>
                ) : (
                  <RadioGroup
                    value={selectedPaymentMethodId}
                    onValueChange={setSelectedPaymentMethodId}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="cursor-pointer">
                          {method.name}
                          {method.description && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({method.description})
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800"
                size="lg"
                disabled={isPlacingOrder || !selectedPaymentMethodId || isLoadingPaymentMethods}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Thanh toán"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

