// src/features/checkout/components/CheckoutManager.tsx

"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { useCartStore } from "@/src/entities/cart/service"
import { useAuth } from "@/src/core/providers/auth-provider"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { formatCurrency, formatDateWithWeekday } from "@/src/shared/utils/format"
import { useToast } from "@/src/hooks/use-toast"
import { Pagination } from "@/src/components/ui/pagination"
import { orderService } from "@/src/entities/order/service"
import { paymentMethodService } from "@/src/entities/payment-method/service"
import type { PaymentMethodItem } from "@/src/entities/payment-method/type/payment-method"
import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"
import type { CartItemResponse } from "@/src/entities/cart/type/cart"
import { useProductDetail } from "@/src/features/product/hooks/use-product-detail"
import { useUserAddressStore } from "@/src/entities/user-address/service/user-address-service"
import {
  ghnAddressService,
  type GHNProvince,
  type GHNDistrict,
  type GHNWard,
} from "@/src/entities/ghn/service/ghn-address-service"
import { shippingMethodService } from "@/src/entities/shipping-method/service/shipping-method-service"
import type {
  ShippingMethodItem,
  ShippingFeeResult as ShippingFeeResultDto,
  ShippingLeadTimeResult as ShippingLeadTimeResultDto,
  CalculateShippingFeeRequest,
  ShippingLeadTimeData,
} from "@/src/entities/shipping-method/type/shipping-method"
import type { UserCouponItem } from "@/src/entities/user-coupon/type/user-coupon"
import { DiscountTypeEnum } from "@/src/entities/user-coupon/type/user-coupon"
import { CheckoutAuthSection } from "@/src/features/checkout/components/sections/CheckoutAuthSection"
import { CheckoutGuestSection } from "@/src/features/checkout/components/sections/CheckoutGuestSection"
import { AddressSelectModal } from "@/src/features/checkout/components/modals/AddressSelectModal"
import { ShippingMethodSelectModal } from "@/src/features/checkout/components/modals/ShippingMethodSelectModal"
import { VoucherSelectModal } from "@/src/features/checkout/components/modals/VoucherSelectModal"

const ITEMS_PER_PAGE = 3
const SHIPPING_PAGE_SIZE = 10

const formatLeadTimeLabel = (data?: ShippingLeadTimeData | null): string | null => {
  if (!data) {
    return null
  }

  const formatValue = (
    isoValue?: string | null,
    unixValue?: number | null
  ): string | null => {
    if (isoValue) {
      return formatDateWithWeekday(isoValue)
    }
    if (typeof unixValue === "number") {
      return formatDateWithWeekday(new Date(unixValue * 1000))
    }
    return null
  }

  const fromLabel = formatValue(data.estimateFrom)
  const toLabel = formatValue(data.estimateTo)

  if (fromLabel && toLabel) {
    if (fromLabel === toLabel) {
      return fromLabel
    }
    return `${fromLabel} - ${toLabel}`
  }

  const primaryLabel =
    formatValue(data.leadTime, data.leadTimeUnix) ??
    formatValue(data.estimateFrom) ??
    formatValue(data.estimateTo)

  return primaryLabel
}

export function CheckoutManager() {
  const { cart, fetchCart, isLoading: isCartLoading } = useCartStore()
  const { user, isAuthenticated, isHydrated } = useAuth()
  const {
    addresses,
    fetchAddresses,
    isLoading: isAddressLoading,
  } = useUserAddressStore()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [selectedUserCoupons, setSelectedUserCoupons] = useState<UserCouponItem[]>([])
  const [saveInfo, setSaveInfo] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodItem[]>([])
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] = useState(false)
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>("")
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethodItem | null>(null)
  const [shippingFeeResult, setShippingFeeResult] = useState<ShippingFeeResultDto | null>(null)
  const [shippingAmount, setShippingAmount] = useState(0)
  const [isCalculatingShippingFee, setIsCalculatingShippingFee] = useState(false)
  const [shippingLeadTimeResult, setShippingLeadTimeResult] = useState<ShippingLeadTimeResultDto | null>(null)
  const [isCalculatingShippingLeadTime, setIsCalculatingShippingLeadTime] = useState(false)
  const [shippingPagination, setShippingPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: SHIPPING_PAGE_SIZE,
  })
  const initialGuestLocation = {
    provinceId: 0,
    provinceName: "",
    districtId: 0,
    districtName: "",
    wardCode: "",
    wardName: "",
    postalCode: "",
  }
  const [guestLocation, setGuestLocation] = useState(initialGuestLocation)
  const [provinceOptions, setProvinceOptions] = useState<GHNProvince[]>([])
  const [districtOptions, setDistrictOptions] = useState<GHNDistrict[]>([])
  const [wardOptions, setWardOptions] = useState<GHNWard[]>([])
  const [hasLoadedGuestProvinces, setHasLoadedGuestProvinces] = useState(false)
  const [isProvinceLoading, setIsProvinceLoading] = useState(false)
  const [isDistrictLoading, setIsDistrictLoading] = useState(false)
  const [isWardLoading, setIsWardLoading] = useState(false)
  
  // Local state for accumulated cart items
  const [displayedItems, setDisplayedItems] = useState<CartItemResponse[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const cartFetchedRef = useRef(false)
  const addressFetchedRef = useRef(false)

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

  const loadShippingMethods = useCallback(
    async (page = 1) => {
      setIsLoadingShippingMethods(true)
      try {
        const result = await shippingMethodService.getShippingMethods({
          page,
          pageSize: SHIPPING_PAGE_SIZE,
          status: EntityStatusEnum.Active,
        })

        if (result.isSuccess && result.items) {
          const methods = result.items
          setShippingMethods(methods)

          const nextPageSize = result.pageSize ?? SHIPPING_PAGE_SIZE
          const totalItems = result.totalItems ?? methods.length
          const totalPages =
            result.totalPages ?? Math.max(1, Math.ceil(totalItems / nextPageSize))

          setShippingPagination({
            totalItems,
            currentPage: result.currentPage ?? page,
            totalPages,
            pageSize: nextPageSize,
          })

          if (!selectedShippingMethodId && methods.length > 0) {
            setSelectedShippingMethodId(methods[0].id)
            setSelectedShippingMethod(methods[0])
          } else if (selectedShippingMethodId) {
            const matched = methods.find((method) => method.id === selectedShippingMethodId)
            if (matched) {
              setSelectedShippingMethod(matched)
            }
          }
        } else {
          toast({
            title: "Lỗi",
            description:
              result.errors?.[0] || "Không thể tải danh sách phương thức vận chuyển",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description:
            error instanceof Error ? error.message : "Không thể tải danh sách phương thức vận chuyển",
          variant: "destructive",
        })
      } finally {
        setIsLoadingShippingMethods(false)
      }
    },
    [toast, selectedShippingMethodId]
  )

  const loadProvinces = async () => {
    if (hasLoadedGuestProvinces) return
    try {
      setIsProvinceLoading(true)
      const provinces = await ghnAddressService.getProvinces()
      setProvinceOptions(provinces)
      setHasLoadedGuestProvinces(true)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách tỉnh/thành",
        variant: "destructive",
      })
    } finally {
      setIsProvinceLoading(false)
    }
  }

  const ensureGuestProvincesLoaded = async () => {
    if (!hasLoadedGuestProvinces) {
      await loadProvinces()
    }
  }

  const loadDistricts = async (provinceId: number, resetFields = true) => {
    if (!provinceId) {
      setDistrictOptions([])
      setWardOptions([])
      return
    }
    try {
      setIsDistrictLoading(true)
      const districts = await ghnAddressService.getDistricts(provinceId)
      setDistrictOptions(districts)
      if (resetFields) {
        setGuestLocation((prev) => ({
          ...prev,
          districtId: 0,
          districtName: "",
          wardCode: "",
          wardName: "",
        }))
      }
      setWardOptions([])
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách quận/huyện",
        variant: "destructive",
      })
    } finally {
      setIsDistrictLoading(false)
    }
  }

  const loadWards = async (districtId: number, resetFields = true) => {
    if (!districtId) {
      setWardOptions([])
      return
    }
    try {
      setIsWardLoading(true)
      const wards = await ghnAddressService.getWards(districtId)
      setWardOptions(wards)
      if (resetFields) {
        setGuestLocation((prev) => ({
          ...prev,
          wardCode: "",
          wardName: "",
        }))
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách phường/xã",
        variant: "destructive",
      })
    } finally {
      setIsWardLoading(false)
    }
  }

  const handleGuestProvinceChange = async (value: string) => {
    const provinceId = Number(value)
    const selected = provinceOptions.find((p) => p.ProvinceID === provinceId)
    setGuestLocation((prev) => ({
      ...prev,
      provinceId,
      provinceName: selected?.ProvinceName ?? "",
      districtId: 0,
      districtName: "",
      wardCode: "",
      wardName: "",
    }))
    await loadDistricts(provinceId)
  }

  const handleGuestDistrictChange = async (value: string) => {
    const districtId = Number(value)
    const selected = districtOptions.find((d) => d.DistrictID === districtId)
    setGuestLocation((prev) => ({
      ...prev,
      districtId,
      districtName: selected?.DistrictName ?? "",
      wardCode: "",
      wardName: "",
    }))
    await loadWards(districtId)
  }

  const handleGuestWardChange = (value: string) => {
    const selected = wardOptions.find((w) => w.WardCode === value)
    setGuestLocation((prev) => ({
      ...prev,
      wardCode: value,
      wardName: selected?.WardName ?? "",
    }))
  }

  const handleShippingMethodSelect = (method: ShippingMethodItem) => {
    setSelectedShippingMethodId(method.id)
    setSelectedShippingMethod(method)
  }

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || null
  const selectedPaymentMethod =
    paymentMethods.find((method) => method.id === selectedPaymentMethodId) || null
  const isCodPayment = selectedPaymentMethod ? !selectedPaymentMethod.isOnlinePayment : false
  const currentShippingMethod =
    selectedShippingMethod ||
    shippingMethods.find((method) => method.id === selectedShippingMethodId) ||
    null

  const currentShippingAmount = isAuthenticated ? shippingAmount : 0

  // Calculate order breakdown matching backend logic
  const orderBreakdown = useMemo(() => {
    // STEP 1: Calculate subtotal and product discount (matching backend)
    let subtotalOriginal = 0
    let productDiscountAmount = 0

    displayedItems.forEach((item) => {
      // Backend logic: 
      // - item.price = Product.Price (giá gốc)
      // - item.discountPrice = Product.DiscountPrice (giá sau giảm, nếu có)
      // Matching backend CalculateProductPricing method
      const unitPriceOriginal = item.price // Price is the original price from backend
      
      // If discountPrice exists and is valid, use it as the discounted price
      // Otherwise, use original price (no discount)
      const unitPriceAfterDiscount = item.discountPrice && item.discountPrice > 0
        && item.discountPrice <= item.price
        ? item.discountPrice
        : item.price
      
      const unitDiscountAmount = unitPriceOriginal - unitPriceAfterDiscount

      subtotalOriginal += unitPriceOriginal * item.quantity
      productDiscountAmount += unitDiscountAmount * item.quantity
    })

    const subtotalAfterProductDiscount = subtotalOriginal - productDiscountAmount

    // STEP 2: Calculate coupon discount (matching backend logic)
    let couponDiscountAmount = 0
    const couponBreakdown: Array<{ id: string; code: string; amount: number }> = []

    if (selectedUserCoupons.length > 0) {
      // Filter out FreeShipping coupons for product discount calculation
      const productDiscountCoupons = selectedUserCoupons.filter(
        (coupon) => coupon.discountType !== DiscountTypeEnum.FreeShipping
      )

      productDiscountCoupons.forEach((coupon) => {
        // Validate MinOrderAmount on SubtotalAfterProductDiscount (matching backend)
        if (subtotalAfterProductDiscount < coupon.minOrderAmount) {
        return
      }

      let discountValue = 0
      if (coupon.discountType === DiscountTypeEnum.Percentage) {
          const calculated = (subtotalAfterProductDiscount * coupon.discountValue) / 100
          // Apply MaxDiscountCap if exists (matching backend)
          discountValue = coupon.maxDiscountCap && coupon.maxDiscountCap > 0
            ? Math.min(calculated, coupon.maxDiscountCap)
            : calculated
      } else if (coupon.discountType === DiscountTypeEnum.Fixed) {
          discountValue = Math.min(coupon.discountValue, subtotalAfterProductDiscount)
      }

      if (discountValue > 0) {
          couponBreakdown.push({
          id: coupon.id,
          code: coupon.couponCode,
          amount: discountValue,
        })
          couponDiscountAmount += discountValue
      }
    })

      // Ensure discount doesn't exceed subtotal (matching backend)
      couponDiscountAmount = Math.min(couponDiscountAmount, subtotalAfterProductDiscount)
    }

    const totalProductAmount = subtotalAfterProductDiscount - couponDiscountAmount

    // STEP 3: Calculate shipping discount (matching backend)
    let shippingDiscountAmount = 0
    if (isAuthenticated && currentShippingAmount > 0) {
      const freeShippingCoupons = selectedUserCoupons.filter(
        (coupon) => coupon.discountType === DiscountTypeEnum.FreeShipping
      )

      // Only apply first FreeShip coupon (matching backend validation)
      if (freeShippingCoupons.length > 0) {
        const freeShipCoupon = freeShippingCoupons[0]
        // Validate MinOrderAmount on SubtotalAfterProductDiscount (matching backend)
        if (subtotalAfterProductDiscount >= freeShipCoupon.minOrderAmount) {
          shippingDiscountAmount = currentShippingAmount // 100% freeship
        }
      }
    }

    const shippingFeeActual = Math.max(0, currentShippingAmount - shippingDiscountAmount)
    const taxAmount = 0 // Backend default is 0
    const finalAmount = totalProductAmount + shippingFeeActual + taxAmount

    return {
      subtotalOriginal,
      productDiscountAmount,
      subtotalAfterProductDiscount,
      couponDiscountAmount,
      totalProductAmount,
      shippingFeeOriginal: currentShippingAmount,
      shippingDiscountAmount,
      shippingFeeActual,
      taxAmount,
      finalAmount,
      couponBreakdown,
    }
  }, [displayedItems, selectedUserCoupons, currentShippingAmount, isAuthenticated])

  const shippingLeadTimeLabel = formatLeadTimeLabel(shippingLeadTimeResult?.data ?? null)
  
  // Extract estimated delivery date from shipping lead time result
  const estimatedDeliveryDate = useMemo(() => {
    if (!shippingLeadTimeResult?.data) return null
    
    // Prefer estimateTo, then estimateFrom, then leadTime
    const dateStr = shippingLeadTimeResult.data.estimateTo 
      || shippingLeadTimeResult.data.estimateFrom
      || shippingLeadTimeResult.data.leadTime
    
    if (!dateStr) {
      // Try unix timestamp
      if (shippingLeadTimeResult.data.leadTimeUnix) {
        return new Date(shippingLeadTimeResult.data.leadTimeUnix * 1000).toISOString()
      }
      return null
    }
    
    // If it's already an ISO string, return as is
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return dateStr
    }
    
    // Try to parse as date
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date.toISOString()
  }, [shippingLeadTimeResult])

  const buildShippingCalculationRequest = useCallback((): CalculateShippingFeeRequest | null => {
    if (!selectedShippingMethodId || !selectedAddressId) {
      return null
    }

    const roundedTotal = Math.max(0, Math.round(totalPrice))

    return {
      shippingMethodId: selectedShippingMethodId,
      userAddressId: selectedAddressId,
      productId: isBuyNow ? buyNowProductId ?? undefined : undefined,
      quantity: isBuyNow ? buyNowQuantity : undefined,
      insuranceValue: roundedTotal,
      codValue: isCodPayment ? roundedTotal : undefined,
    }
  }, [
    selectedShippingMethodId,
    selectedAddressId,
    isBuyNow,
    buyNowProductId,
    buyNowQuantity,
    totalPrice,
    isCodPayment,
  ])

  // Fetch cart with pageSize = 3 (similar to cart popup) - only for normal cart checkout
  useEffect(() => {
    if (isBuyNow) return
    if (isHydrated && isAuthenticated && !cartFetchedRef.current) {
      cartFetchedRef.current = true
      fetchCart({ page: 1, pageSize: ITEMS_PER_PAGE }).catch(() => {})
    }
  }, [isHydrated, isAuthenticated, fetchCart, isBuyNow])

  // Fetch user addresses once user is ready
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      addressFetchedRef.current = false
      setSelectedAddressId("")
      setSelectedUserCoupons([])
      return
    }

    if (addressFetchedRef.current) return

    addressFetchedRef.current = true
    fetchAddresses({
      page: 1,
      pageSize: 6,
      status: EntityStatusEnum.Active,
      isCurrentUser: true,
    }).catch(() => {
      addressFetchedRef.current = false
    })
  }, [isHydrated, isAuthenticated, fetchAddresses])

  // Auto select default address when list changes
  useEffect(() => {
    if (!isAuthenticated || addresses.length === 0) return

    setSelectedAddressId((prev) => {
      if (prev && addresses.some((address) => address.id === prev)) {
        return prev
      }
      const defaultAddress = addresses.find((address) => address.isDefault)
      return (defaultAddress ?? addresses[0]).id
    })
  }, [addresses, isAuthenticated])

  const isShippingReady =
    !isAuthenticated ||
    (!!selectedShippingMethodId &&
      !!selectedAddressId &&
      !!shippingFeeResult?.data &&
      !isCalculatingShippingFee)
  const validateGuestLocation = () => {
    if (!guestLocation.provinceId || !guestLocation.provinceName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Tỉnh/Thành phố",
        variant: "destructive",
      })
      return false
    }
    if (!guestLocation.districtId || !guestLocation.districtName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Quận/Huyện",
        variant: "destructive",
      })
      return false
    }
    if (!guestLocation.wardCode || !guestLocation.wardName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Phường/Xã",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const getGuestFullAddress = () =>
    [formData.address, guestLocation.wardName, guestLocation.districtName, guestLocation.provinceName]
      .filter((segment) => !!segment)
      .join(", ")

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

    // Backend logic: 
    // - buyNowProduct.price = Product.Price (giá gốc)
    // - buyNowProduct.discountPrice = Product.DiscountPrice (giá sau giảm, nếu có)
    // Price calculation will be handled in orderBreakdown useMemo
    const unitPriceOriginal = buyNowProduct.price
    const unitPriceAfterDiscount = buyNowProduct.discountPrice && buyNowProduct.discountPrice > 0
      && buyNowProduct.discountPrice <= buyNowProduct.price
      ? buyNowProduct.discountPrice
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
      price: unitPriceOriginal, // Store original price (matching backend mapping)
      discountPrice: buyNowProduct.discountPrice ?? null, // Store discount price if exists
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
    // Use original price for totalPrice calculation (will be adjusted in orderBreakdown)
    setTotalPrice(unitPriceOriginal * buyNowQuantity)
  }, [isBuyNow, buyNowProduct, buyNowQuantity])

  useEffect(() => {
    if (!isAuthenticated) {
      setShippingFeeResult(null)
      setShippingAmount(0)
      setShippingLeadTimeResult(null)
      setIsCalculatingShippingLeadTime(false)
      setSelectedUserCoupons([])
      return
    }

    if (!selectedAddressId || !selectedShippingMethodId) {
      setShippingFeeResult(null)
      setShippingAmount(0)
      setShippingLeadTimeResult(null)
      setIsCalculatingShippingLeadTime(false)
      return
    }

    if (displayedItems.length === 0) {
      return
    }

    const payload = buildShippingCalculationRequest()
    if (!payload) {
      return
    }

    let cancelled = false

    const calculateShippingFee = async () => {
      setIsCalculatingShippingFee(true)
      try {
        const response = await shippingMethodService.calculateShippingFee(payload)
        if (cancelled) {
          return
        }

        if (response.isSuccess && response.data) {
          const feeResult = response.data
          if (feeResult.isSuccess && feeResult.data) {
            setShippingFeeResult(feeResult)
            setShippingAmount(feeResult.data.total)
          } else {
            setShippingFeeResult(feeResult)
            setShippingAmount(feeResult.data?.total ?? 0)
            toast({
              title: "Cảnh báo",
              description: feeResult.message || "Không thể tính phí vận chuyển",
              variant: "destructive",
            })
          }
        } else {
          setShippingFeeResult(null)
          setShippingAmount(0)
          toast({
            title: "Lỗi",
            description: response.message || "Không thể tính phí vận chuyển",
            variant: "destructive",
          })
        }
      } catch (error) {
        if (!cancelled) {
          setShippingFeeResult(null)
          setShippingAmount(0)
          toast({
            title: "Lỗi",
            description:
              error instanceof Error ? error.message : "Không thể tính phí vận chuyển",
            variant: "destructive",
          })
        }
      } finally {
        if (!cancelled) {
          setIsCalculatingShippingFee(false)
        }
      }
    }

    void calculateShippingFee()

    return () => {
      cancelled = true
    }
  }, [
    isAuthenticated,
    selectedAddressId,
    selectedShippingMethodId,
    isBuyNow,
    buyNowProductId,
    buyNowQuantity,
    totalPrice,
    displayedItems.length,
    isCodPayment,
    buildShippingCalculationRequest,
    toast,
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      setShippingLeadTimeResult(null)
      setIsCalculatingShippingLeadTime(false)
      return
    }

    if (!selectedAddressId || !selectedShippingMethodId) {
      setShippingLeadTimeResult(null)
      setIsCalculatingShippingLeadTime(false)
      return
    }

    if (displayedItems.length === 0) {
      return
    }

    const payload = buildShippingCalculationRequest()
    if (!payload) {
      return
    }

    let cancelled = false

    const fetchLeadTime = async () => {
      setIsCalculatingShippingLeadTime(true)
      try {
        const response = await shippingMethodService.calculateShippingLeadTime(payload)
        if (cancelled) {
          return
        }

        if (response.isSuccess && response.data) {
          setShippingLeadTimeResult(response.data)
        } else {
          setShippingLeadTimeResult(null)
          toast({
            title: "Lỗi",
            description: response.message || "Không thể lấy thời gian giao hàng dự kiến",
            variant: "destructive",
          })
        }
      } catch (error) {
        if (!cancelled) {
          setShippingLeadTimeResult(null)
          toast({
            title: "Lỗi",
            description:
              error instanceof Error ? error.message : "Không thể lấy thời gian giao hàng dự kiến",
            variant: "destructive",
          })
        }
      } finally {
        if (!cancelled) {
          setIsCalculatingShippingLeadTime(false)
        }
      }
    }

    void fetchLeadTime()

    return () => {
      cancelled = true
    }
  }, [
    isAuthenticated,
    selectedAddressId,
    selectedShippingMethodId,
    displayedItems.length,
    buildShippingCalculationRequest,
    toast,
  ])

  // Show loading while fetching Buy Now product
  useEffect(() => {
    if (!isBuyNow || !isBuyNowLoading) return
    setDisplayedItems([])
    setTotalItems(0)
    setTotalPrice(0)
  }, [isBuyNow, isBuyNowLoading])

  useEffect(() => {
    if (isAuthenticated) {
      void loadShippingMethods(1)
    } else {
      setShippingMethods([])
      setSelectedShippingMethod(null)
      setSelectedShippingMethodId("")
      setIsAddressModalOpen(false)
      setIsShippingModalOpen(false)
      setIsVoucherModalOpen(false)
      setShippingPagination({
        totalItems: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: SHIPPING_PAGE_SIZE,
      })
      setShippingFeeResult(null)
      setShippingAmount(0)
    setShippingLeadTimeResult(null)
    setIsCalculatingShippingLeadTime(false)
    }
  }, [isAuthenticated, loadShippingMethods])

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
      setGuestLocation(initialGuestLocation)
    } else {
      setGuestLocation(initialGuestLocation)
    }
  }, [isAuthenticated, user])

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

      if (!validateGuestLocation()) {
        return
      }
    }

    if (isAuthenticated) {
      if (!selectedAddressId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn địa chỉ giao hàng",
          variant: "destructive",
        })
        return
      }

      if (!selectedShippingMethodId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn phương thức vận chuyển",
          variant: "destructive",
        })
        return
      }

      if (!shippingFeeResult?.data) {
        toast({
          title: "Lỗi",
          description: "Vui lòng tính phí vận chuyển trước khi đặt hàng",
          variant: "destructive",
        })
        return
      }
    }

    // Validate coupon rules (matching backend validation)
    if (selectedUserCoupons.length > 0) {
      const hasPercentage = selectedUserCoupons.some(
        (coupon) => coupon.discountType === DiscountTypeEnum.Percentage
      )
      const hasFixed = selectedUserCoupons.some(
        (coupon) => coupon.discountType === DiscountTypeEnum.Fixed
      )
      const freeShipCount = selectedUserCoupons.filter(
        (coupon) => coupon.discountType === DiscountTypeEnum.FreeShipping
      ).length

      // RULE 2: Chỉ được chọn Percentage HOẶC Fixed (KHÔNG được dùng cả 2 cùng lúc)
      if (hasPercentage && hasFixed) {
        toast({
          title: "Lỗi",
          description: "Chỉ được chọn mã giảm theo phần trăm HOẶC giảm cố định, không được dùng cả hai",
          variant: "destructive",
        })
        return
      }

      // RULE 1: Chỉ được 1 FreeShip coupon
      if (freeShipCount > 1) {
        toast({
          title: "Lỗi",
          description: "Chỉ được áp dụng tối đa 1 mã miễn phí vận chuyển",
          variant: "destructive",
        })
        return
      }

      // RULE 5: Tổng số coupon không quá 2
      if (selectedUserCoupons.length > 2) {
        toast({
          title: "Lỗi",
          description: "Chỉ được áp dụng tối đa 2 mã giảm giá (1 FreeShip + 1 Percentage/Fixed)",
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
        userCouponIds:
          selectedUserCoupons.length > 0
            ? selectedUserCoupons.map((coupon) => coupon.id)
            : null,
        paymentMethodId: selectedPaymentMethodId,
        ...(isAuthenticated
          ? {
              shippingMethodId: selectedShippingMethodId,
              userAddressId: selectedAddressId || null,
              shippingAmount: orderBreakdown.shippingFeeOriginal,
              estimatedDeliveryDate: estimatedDeliveryDate,
            }
          : {}),
        isOneClick: !isAuthenticated, // true nếu user chưa login
        // Guest info chỉ cần khi isOneClick = true
        ...(!isAuthenticated && {
          guestEmail: formData.email,
          guestFirstName: formData.fullName.split(" ")[0] || formData.fullName,
          guestLastName: formData.fullName.split(" ").slice(1).join(" ") || "",
          guestPhone: formData.phone,
          oneClickAddress: getGuestFullAddress() || formData.address,
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
                <CheckoutAuthSection
                  user={user}
                  note={formData.note}
                  onNoteChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      note: value,
                    }))
                  }
                  addressSummary={{
                    address: selectedAddress,
                    isLoading: isAddressLoading,
                    onClick: () => setIsAddressModalOpen(true),
                  }}
                  shippingSummary={{
                    shippingMethod: currentShippingMethod,
                    shippingAmount: currentShippingAmount,
                    shippingDiscountAmount: orderBreakdown.shippingDiscountAmount,
                    shippingFeeResult,
                  isCalculating: isCalculatingShippingFee,
                  isCalculatingLeadTime: isCalculatingShippingLeadTime,
                  shippingLeadTimeResult,
                    leadTimeLabel: shippingLeadTimeLabel,
                    hasAddress: !!selectedAddressId,
                    onClick: () => setIsShippingModalOpen(true),
                  }}
                  voucherSummary={{
                    selectedCoupons: selectedUserCoupons,
                    onClear:
                      selectedUserCoupons.length > 0
                        ? () => setSelectedUserCoupons([])
                        : undefined,
                    onClick: () => setIsVoucherModalOpen(true),
                  }}
                />
              ) : (
                <CheckoutGuestSection
                  formData={formData}
                  onFormDataChange={(field, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: value,
                    }))
                  }
                  guestLocation={guestLocation}
                  onProvinceChange={handleGuestProvinceChange}
                  onDistrictChange={handleGuestDistrictChange}
                  onWardChange={handleGuestWardChange}
                  onPostalCodeChange={(value) =>
                    setGuestLocation((prev) => ({
                      ...prev,
                      postalCode: value,
                    }))
                  }
                  saveInfo={saveInfo}
                  onSaveInfoChange={setSaveInfo}
                  provinceOptions={provinceOptions}
                  districtOptions={districtOptions}
                  wardOptions={wardOptions}
                  isProvinceLoading={isProvinceLoading}
                  isDistrictLoading={isDistrictLoading}
                  isWardLoading={isWardLoading}
                  ensureProvincesLoaded={ensureGuestProvincesLoaded}
                  loadDistricts={loadDistricts}
                  loadWards={loadWards}
                />
              )}
            </div>
          </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6 rounded-lg border bg-card p-6">
            {isAuthenticated && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                  <span>Địa chỉ nhận hàng</span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    Thay đổi
                  </Button>
                </div>
                {selectedAddress ? (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{selectedAddress.fullName}</p>
                    {selectedAddress.phoneNumber && <p>{selectedAddress.phoneNumber}</p>}
                    <p>{selectedAddress.fullAddress}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Vui lòng chọn địa chỉ giao hàng.</p>
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
                  <span className="text-muted-foreground">Tổng đơn hàng gốc</span>
                  <span className="font-medium">{formatCurrency(orderBreakdown.subtotalOriginal)}</span>
                </div>
                {orderBreakdown.productDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Giảm giá sản phẩm</span>
                    <span>-{formatCurrency(orderBreakdown.productDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng sau giảm giá sản phẩm</span>
                  <span className="font-medium">{formatCurrency(orderBreakdown.subtotalAfterProductDiscount)}</span>
                </div>
                {orderBreakdown.couponDiscountAmount > 0 && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Giảm giá voucher</span>
                      <span>-{formatCurrency(orderBreakdown.couponDiscountAmount)}</span>
                    </div>
                    <div className="space-y-1">
                      {orderBreakdown.couponBreakdown.map((entry) => (
                        <div key={entry.id} className="flex justify-between">
                          <span>{entry.code}</span>
                          <span>-{formatCurrency(entry.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng tiền hàng</span>
                  <span className="font-medium">{formatCurrency(orderBreakdown.totalProductAmount)}</span>
                </div>
                {isAuthenticated ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">
                        {isCalculatingShippingFee
                          ? "Đang tính..."
                          : shippingFeeResult?.data
                          ? formatCurrency(orderBreakdown.shippingFeeOriginal)
                          : selectedShippingMethodId
                          ? "Chưa tính"
                          : "Chưa chọn"}
                      </span>
                    </div>
                    {orderBreakdown.shippingDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Giảm phí vận chuyển</span>
                        <span>-{formatCurrency(orderBreakdown.shippingDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển sau ưu đãi</span>
                      <span className="font-medium">{formatCurrency(orderBreakdown.shippingFeeActual)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Giao dự kiến</span>
                      <span>
                        {isCalculatingShippingLeadTime
                          ? "Đang tính..."
                          : shippingLeadTimeLabel
                          ? shippingLeadTimeLabel
                          : "Chưa có dữ liệu"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                )}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="w-full"
                    >
                      {selectedUserCoupons.length > 0 ? "Thay đổi voucher" : "Chọn voucher"}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Đăng nhập để xem danh sách mã giảm giá của bạn.
                    </p>
                  )}

                  <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {selectedUserCoupons.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUserCoupons.map((coupon) => (
                          <div key={coupon.id}>
                            <p className="font-semibold text-foreground">{coupon.couponCode}</p>
                            {coupon.description && <p>{coupon.description}</p>}
                            <p>
                              Loại ưu đãi:{" "}
                              {coupon.discountType === DiscountTypeEnum.Percentage
                                ? `${coupon.discountValue}%${coupon.maxDiscountCap && coupon.maxDiscountCap > 0 ? ` (tối đa ${formatCurrency(coupon.maxDiscountCap)})` : ""}`
                                : coupon.discountType === DiscountTypeEnum.Fixed
                                ? formatCurrency(coupon.discountValue)
                                : coupon.discountTypeName}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Chưa chọn mã giảm giá.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Tổng thanh toán:</span>
                <span className="text-primary">{formatCurrency(orderBreakdown.finalAmount)}</span>
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
                disabled={
                  isPlacingOrder ||
                  !selectedPaymentMethodId ||
                  isLoadingPaymentMethods ||
                  !isShippingReady
                }
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

      {isAuthenticated && (
        <AddressSelectModal
          open={isAddressModalOpen}
          onOpenChange={setIsAddressModalOpen}
          selectedAddressId={selectedAddressId}
          onSelectAddress={(address) => setSelectedAddressId(address.id)}
        />
      )}

      {isAuthenticated && (
        <ShippingMethodSelectModal
          open={isShippingModalOpen}
          onOpenChange={setIsShippingModalOpen}
          shippingMethods={shippingMethods}
          selectedShippingMethodId={selectedShippingMethodId}
          isLoading={isLoadingShippingMethods}
          pagination={shippingPagination}
          onPageChange={(page) => {
            void loadShippingMethods(page)
          }}
          onSelect={handleShippingMethodSelect}
        />
      )}

      {isAuthenticated && (
        <VoucherSelectModal
          open={isVoucherModalOpen}
          onOpenChange={setIsVoucherModalOpen}
          selectedCoupons={selectedUserCoupons}
          onChangeCoupons={(coupons) => {
            const uniqueCoupons = Array.from(
              new Map(coupons.map((coupon) => [coupon.id, coupon])).values()
            )
            setSelectedUserCoupons(uniqueCoupons)
            toast({
              title: "Cập nhật voucher",
              description:
                uniqueCoupons.length > 0
                  ? `Đã áp dụng ${uniqueCoupons.length} mã giảm giá`
                  : "Không còn mã giảm giá được áp dụng",
            })
          }}
        />
      )}
    </>
  )
}

