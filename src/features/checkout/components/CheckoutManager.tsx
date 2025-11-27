// src/features/checkout/components/CheckoutManager.tsx

"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
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
import { Badge } from "@/src/components/ui/badge"
import { formatCurrency, formatDate } from "@/src/shared/utils/format"
import { useToast } from "@/src/hooks/use-toast"
import { Pagination } from "@/src/components/ui/pagination"
import { orderService } from "@/src/entities/order/service"
import { paymentMethodService } from "@/src/entities/payment-method/service"
import type { PaymentMethodItem } from "@/src/entities/payment-method/type/payment-method"
import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"
import { useUserAddressStore } from "@/src/entities/user-address/service"
import { useUserCouponStore } from "@/src/entities/user-coupon/service"
import type { UserCouponItem } from "@/src/entities/user-coupon/type/user-coupon"
import { DiscountTypeEnum } from "@/src/entities/user-coupon/type/user-coupon"
import type { CartItemResponse } from "@/src/entities/cart/type/cart"
import { useProductDetail } from "@/src/features/product/hooks/use-product-detail"
import { cn } from "@/src/lib/utils"

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
  const [saveInfo, setSaveInfo] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Local state for accumulated cart items
  const [displayedItems, setDisplayedItems] = useState<CartItemResponse[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const cartFetchedRef = useRef(false)

  const {
    addresses,
    fetchAddresses,
    isLoading: isAddressLoading,
  } = useUserAddressStore((state) => ({
    addresses: state.addresses,
    fetchAddresses: state.fetchAddresses,
    isLoading: state.isLoading,
  }))

  const {
    coupons,
    fetchCoupons,
    isLoading: isCouponLoading,
  } = useUserCouponStore((state) => ({
    coupons: state.coupons,
    fetchCoupons: state.fetchCoupons,
    isLoading: state.isLoading,
  }))

  const addressFetchRef = useRef(false)
  const couponFetchRef = useRef(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null)

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

  const selectedCoupon = selectedCouponId
    ? coupons.find((coupon) => coupon.id === selectedCouponId)
    : null

  const selectedAddress = selectedAddressId
    ? addresses.find((address) => address.id === selectedAddressId)
    : null

  const couponSummary = useMemo(() => {
    if (!selectedCoupon) {
      return { discount: 0, qualifies: true }
    }

    if (totalPrice < selectedCoupon.minOrderAmount) {
      return { discount: 0, qualifies: false }
    }

    const rawDiscount =
      selectedCoupon.discountType === DiscountTypeEnum.Percentage
        ? (totalPrice * selectedCoupon.discountValue) / 100
        : selectedCoupon.discountValue

    return {
      discount: Math.min(rawDiscount, totalPrice),
      qualifies: true,
    }
  }, [selectedCoupon, totalPrice])

  const finalAmount = useMemo(
    () => Math.max(totalPrice - couponSummary.discount, 0),
    [totalPrice, couponSummary.discount]
  )

  const isCouponEligible = !selectedCoupon || couponSummary.qualifies
  const isSubmitDisabled =
    isPlacingOrder || !selectedPaymentMethodId || isLoadingPaymentMethods || !isCouponEligible

  const getDiscountLabel = (coupon: UserCouponItem) => {
    if (coupon.discountType === DiscountTypeEnum.Percentage) {
      return `${coupon.discountValue}%`
    }
    return formatCurrency(coupon.discountValue)
  }

  const getCouponDeadline = (coupon: UserCouponItem) => {
    try {
      return formatDate(coupon.endDate)
    } catch {
      return coupon.endDate
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedAddressId(null)
      setSelectedCouponId(null)
      addressFetchRef.current = false
      couponFetchRef.current = false
    }
  }, [isAuthenticated])

  // Fetch cart with pageSize = 3 (similar to cart popup) - only for normal cart checkout
  useEffect(() => {
    if (isBuyNow) return
    if (isHydrated && isAuthenticated && !cartFetchedRef.current) {
      cartFetchedRef.current = true
      fetchCart({ page: 1, pageSize: ITEMS_PER_PAGE }).catch(() => {})
    }
  }, [isHydrated, isAuthenticated, fetchCart, isBuyNow])

  useEffect(() => {
    if (!isAuthenticated || !isHydrated || addressFetchRef.current) return
    addressFetchRef.current = true
    fetchAddresses({ page: 1, pageSize: 5, isCurrentUser: true }).catch(() => {
      addressFetchRef.current = false
    })
  }, [isAuthenticated, isHydrated, fetchAddresses])

  useEffect(() => {
    if (!isAuthenticated || !isHydrated || couponFetchRef.current) return
    couponFetchRef.current = true
    fetchCoupons({
      page: 1,
      pageSize: 10,
      isCurrentUser: true,
      isExpired: false,
      isUsed: false,
      onlyActiveCoupons: true,
    }).catch(() => {
      couponFetchRef.current = false
    })
  }, [isAuthenticated, isHydrated, fetchCoupons])

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

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedAddressId(null)
      return
    }

    if (!addresses.length) {
      setSelectedAddressId(null)
      return
    }

    setSelectedAddressId((prev) => {
      if (prev && addresses.some((address) => address.id === prev)) {
        return prev
      }
      const defaultAddress = addresses.find((address) => address.isDefault)
      return defaultAddress?.id ?? addresses[0].id
    })
  }, [addresses, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedCouponId(null)
      return
    }

    if (!coupons.length) {
      setSelectedCouponId(null)
      return
    }

    setSelectedCouponId((prev) => {
      if (prev && coupons.some((coupon) => coupon.id === prev)) {
        return prev
      }
      return null
    })
  }, [coupons, isAuthenticated])

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

    if (selectedCoupon && !couponSummary.qualifies) {
      toast({
        title: "Chưa thể áp dụng coupon",
        description: `Đơn hàng cần tối thiểu ${formatCurrency(selectedCoupon.minOrderAmount)} để dùng coupon này.`,
        variant: "destructive",
      })
      return
    }

    setIsPlacingOrder(true)

    try {
      // Chỉ gửi guest info khi user chưa login
      const orderRequest = {
        productId: isBuyNow ? buyNowProductId : null,
        quantity: isBuyNow ? buyNowQuantity : null,
        userCouponId: selectedCoupon && couponSummary.qualifies ? selectedCoupon.id : null,
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
          <div className="space-y-6 lg:col-span-2">
            {isAuthenticated ? (
              <>
                <section className="rounded-lg border bg-card p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">Thông tin tài khoản</h2>
                      <p className="text-sm text-muted-foreground">
                        Vui lòng kiểm tra thông tin trước khi thanh toán
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">Cập nhật hồ sơ</Link>
                    </Button>
                  </div>
                  {user ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Họ tên</p>
                        <p className="text-base font-semibold">
                          {user.username ||
                            `${user.firstName} ${user.lastName}`.trim() ||
                            "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Email</p>
                        <p className="text-base font-semibold">{user.email || "Chưa cập nhật"}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Số điện thoại</p>
                        <p className="text-base font-semibold">
                          {user.phoneNumber || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Ghi chú</p>
                        <Input
                          id="note"
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                          className="mt-2 bg-background"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Đang tải thông tin tài khoản...
                    </p>
                  )}
                </section>

                <section className="rounded-lg border bg-card p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">Địa chỉ nhận hàng</h2>
                      <p className="text-sm text-muted-foreground">
                        Chọn địa chỉ phù hợp để giao hàng
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile")}
                    >
                      Quản lý địa chỉ
                    </Button>
                  </div>

                  {isAddressLoading ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Đang tải danh sách địa chỉ...
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Bạn chưa có địa chỉ nào. Vui lòng vào trang hồ sơ để thêm mới.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((address) => {
                        const isSelected = selectedAddressId === address.id
                        return (
                          <button
                            type="button"
                            key={address.id}
                            onClick={() => setSelectedAddressId(address.id)}
                            className={cn(
                              "w-full rounded-lg border p-4 text-left transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold">{address.fullName}</p>
                              {address.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {address.fullAddress}
                            </p>
                            {address.phoneNumber && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                SĐT: {address.phoneNumber}
                              </p>
                            )}
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  isSelected ? "bg-primary" : "bg-muted-foreground/40"
                                )}
                              />
                              {isSelected ? "Đang sử dụng" : "Chọn địa chỉ này"}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <section className="rounded-lg border bg-card p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Thông tin giao hàng</h2>
                  <p className="text-sm text-muted-foreground">
                    Đăng nhập để chọn địa chỉ đã lưu hoặc điền thông tin bên dưới
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên*</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ giao hàng*</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại*</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-muted/30"
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
                        className="bg-muted/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="saveInfo" checked={saveInfo} onCheckedChange={(checked) => setSaveInfo(!!checked)} />
                    <Label htmlFor="saveInfo" className="cursor-pointer text-sm">
                      Lưu thông tin cho lần thanh toán tiếp theo
                    </Label>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Phiếu giảm giá của bạn</h2>
                  <p className="text-sm text-muted-foreground">
                    Chọn 1 coupon để áp dụng cho đơn hàng này
                  </p>
                </div>
                <Badge variant="outline">{coupons.length} coupon</Badge>
              </div>

              {isCouponLoading ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Đang tải coupon...
                </div>
              ) : coupons.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Bạn chưa có coupon nào. Hãy tham gia sự kiện hoặc thu thập tại cửa hàng.
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((coupon) => {
                    const isSelected = coupon.id === selectedCouponId
                    const meetsRequirement = totalPrice >= coupon.minOrderAmount
                    return (
                      <button
                        type="button"
                        key={coupon.id}
                        onClick={() => setSelectedCouponId(isSelected ? null : coupon.id)}
                        className={cn(
                          "w-full rounded-lg border p-4 text-left transition-all",
                          isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold tracking-wide">{coupon.couponCode}</p>
                            <p className="text-xs text-muted-foreground">
                              HSD: {getCouponDeadline(coupon)}
                            </p>
                          </div>
                          <Badge variant={isSelected ? "default" : "secondary"}>
                            {isSelected ? "Đang áp dụng" : "Chọn"}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="outline" className="uppercase">
                            {getDiscountLabel(coupon)}
                          </Badge>
                          <span className="text-muted-foreground">
                            ĐH tối thiểu {formatCurrency(coupon.minOrderAmount)}
                          </span>
                          {coupon.isUsed && <Badge variant="secondary">Đã sử dụng</Badge>}
                        </div>
                        {isSelected && !meetsRequirement && (
                          <p className="mt-2 text-xs text-amber-600">
                            Đơn hàng cần tối thiểu {formatCurrency(coupon.minOrderAmount)} để áp dụng.
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6 rounded-lg border bg-card p-6">
              {isAuthenticated && selectedAddress && (
                <div className="rounded-lg bg-muted/30 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Giao tới</span>
                    {selectedAddress.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                  </div>
                  <p className="mt-2 font-medium">{selectedAddress.fullName}</p>
                  <p className="text-muted-foreground">{selectedAddress.fullAddress}</p>
                  {selectedAddress.phoneNumber && (
                    <p className="mt-2 text-muted-foreground">SĐT: {selectedAddress.phoneNumber}</p>
                  )}
                </div>
              )}

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
                      <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                {!isBuyNow && totalPages > 1 && (
                  <div className="border-t pt-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng đơn hàng</span>
                  <span className="font-medium">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                {selectedCoupon && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Coupon ({selectedCoupon.couponCode})
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        couponSummary.qualifies ? "text-emerald-600" : "text-amber-600"
                      )}
                    >
                      {couponSummary.qualifies
                        ? `- ${formatCurrency(couponSummary.discount)}`
                        : "Chưa đủ điều kiện"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-primary">{formatCurrency(finalAmount)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Phương thức thanh toán*</Label>
                </div>
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
                      <div
                        key={method.id}
                        className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex flex-1 cursor-pointer items-center gap-3">
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

              <div className="space-y-2">
                {!isCouponEligible && selectedCoupon && (
                  <p className="text-xs text-center text-amber-600">
                    Đơn hàng cần tối thiểu {formatCurrency(selectedCoupon.minOrderAmount)} để dùng coupon này.
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800"
                  size="lg"
                  disabled={isSubmitDisabled}
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
        </div>
      </form>
    </>
  )
}

