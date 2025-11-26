// src/features/checkout/components/CheckoutManager.tsx

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Pagination } from "@/src/components/ui/pagination"
import { orderService } from "@/src/entities/order/service"
import { paymentMethodService } from "@/src/entities/payment-method/service"
import type { PaymentMethodItem } from "@/src/entities/payment-method/type/payment-method"
import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"
import type { CartItemResponse, CartResponse } from "@/src/entities/cart/type/cart"
import { useProductDetail } from "@/src/features/product/hooks/use-product-detail"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"

const ITEMS_PER_PAGE = 3

export function CheckoutManager() {
  const { cart, fetchCart, isLoading: isCartLoading } = useCartStore()
  const { user, isAuthenticated, isHydrated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [saveInfo, setSaveInfo] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Local state for accumulated cart items
  const [displayedItems, setDisplayedItems] = useState<CartItemResponse[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const cartFetchedRef = useRef(false)

  // Detect "Buy Now" mode from query params
  const buyNowProductId = searchParams.get("productId")
  const buyNowQuantityParam = searchParams.get("quantity")
  const buyNowQuantity = Math.max(1, Number(buyNowQuantityParam || "1") || 1)
  const isBuyNow = !!buyNowProductId

  // Load product detail for Buy Now mode (re-use product detail hook)
  const {
    data: buyNowProduct,
    loading: isBuyNowLoading,
  } = useProductDetail(buyNowProductId || "")

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch cart with pageSize = 3 (similar to cart popup) - only for normal cart checkout
  useEffect(() => {
    if (isBuyNow) return
    if (isHydrated && isAuthenticated && !cartFetchedRef.current) {
      cartFetchedRef.current = true
      fetchCart({ page: 1, pageSize: ITEMS_PER_PAGE }).catch(() => {})
    }
  }, [isHydrated, isAuthenticated, fetchCart, isBuyNow])

  // Update displayed items when cart changes (cart checkout mode)
  useEffect(() => {
    if (!cart || isBuyNow) return

    // Always replace items with current page data from backend
    setDisplayedItems(cart.cartItems || [])
    setTotalItems(cart.totalItems || 0)
    setTotalPrice(cart.totalPrice || 0)

    // Check if there are more items to load
    const totalPages = Math.ceil((cart.totalItems || 0) / ITEMS_PER_PAGE)
    setTotalPages(totalPages || 1)
  }, [cart, currentPage, isBuyNow])

  // When in Buy Now mode, build a synthetic displayedItems list from product detail (does NOT touch cart)
  useEffect(() => {
    if (!isBuyNow || !buyNowProduct) return

    const unitPrice = buyNowProduct.discountPrice
      ? buyNowProduct.price * (1 - buyNowProduct.discountPrice / 100)
      : buyNowProduct.price

    const imagePath =
      buyNowProduct.primaryImage ||
      (Array.isArray(buyNowProduct.images) && buyNowProduct.images.length > 0
        ? buyNowProduct.images[0].imagePath
        : "/placeholder.svg")

    const nowIso = new Date().toISOString()

    const syntheticItem: CartItemResponse = {
      id: buyNowProduct.id,
      productId: buyNowProduct.id,
      name: buyNowProduct.name,
      price: unitPrice,
      discountPrice: buyNowProduct.discountPrice ?? null,
      quantity: buyNowQuantity,
      imagePath,
      createdAt:
        typeof buyNowProduct.createdAt === "string"
          ? buyNowProduct.createdAt
          : nowIso,
      updatedAt:
        typeof buyNowProduct.updatedAt === "string"
          ? buyNowProduct.updatedAt
          : undefined,
      status: EntityStatusEnum.Active,
      statusName: "Active",
    }

    setDisplayedItems([syntheticItem])
    setTotalItems(buyNowQuantity)
    setTotalPrice(unitPrice * buyNowQuantity)
  }, [isBuyNow, buyNowProduct, buyNowQuantity])

  // Show loading while fetching Buy Now product
  useEffect(() => {
    if (!isBuyNow || !isBuyNowLoading) return
    setDisplayedItems([])
    setTotalItems(0)
    setTotalPrice(0)
  }, [isBuyNow, isBuyNowLoading])

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

  // Redirect to cart only AFTER cart has been loaded and is confirmed empty
  // Do this in an effect to avoid updating Router during render
  // useEffect(() => {
  //   if (!isClient) return
  //   if (!isCartLoading && totalItems === 0 && displayedItems.length === 0) {
  //     router.push("/cart")
  //   }
  // }, [isClient, isCartLoading, totalItems, displayedItems.length, router])

  // Handle page change for cart items (pagination instead of "load more")
  const handlePageChange = async (page: number) => {
    if (page === currentPage || isBuyNow) return
    setCurrentPage(page)
    try {
      await fetchCart({ page, pageSize: ITEMS_PER_PAGE })
    } catch {
      // error already handled inside fetchCart
    }
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

    if (displayedItems.length === 0) {
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
        productId: isBuyNow ? buyNowProductId : null,
        quantity: isBuyNow ? buyNowQuantity : null,
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
        cartFetchedRef.current = false
        setCurrentPage(1)
        setDisplayedItems([])
        await fetchCart({ page: 1, pageSize: ITEMS_PER_PAGE })
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

  // Show loading while fetching cart (cart checkout) or while not yet hydrated on client
  if (!isClient || (!isBuyNow && isCartLoading && displayedItems.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold text-primary">Thanh toán</h1>

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
                {displayedItems.map((item) => (
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

                {/* Pagination for cart items (only in normal cart checkout mode) */}
                {!isBuyNow && totalPages > 1 && (
                  <div className="pt-2 border-t">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng đơn hàng</span>
                  <span className="font-medium">{formatCurrency(totalPrice)}</span>
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
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
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
                      <div key={method.id} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="cursor-pointer flex-1 flex items-center gap-3">
                          {method.iconPath && (
                            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={method.iconPath}
                                alt={method.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <span className="font-medium">{method.name}</span>
                          {method.description && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({method.description})
                            </span>
                          )}
                          </div>
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

