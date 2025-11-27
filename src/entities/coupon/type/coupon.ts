// Coupon types matching backend DTOs
export interface AvailableCoupon {
  id: string
  code: string
  description?: string
  discountType: 'Percentage' | 'FixedAmount'
  discountValue: number
  minOrderAmount: number
  startDate: string
  endDate: string
  usageLimit?: number
  currentUsage: number
  remainingSlots: number
  isCollected: boolean
}

export interface AvailableCouponsResponse {
  coupons: AvailableCoupon[]
}

export interface UserCoupon {
  userCouponId: string
  couponId: string
  code: string
  description?: string
  discountType: 'Percentage' | 'FixedAmount'
  discountValue: number
  minOrderAmount: number
  startDate: string
  endDate: string
  collectedDate: string
  usedDate?: string
  isUsed: boolean
  isExpired: boolean
}

export interface UserCouponsResponse {
  coupons: UserCoupon[]
}

export interface CollectCouponRequest {
  couponId: string
}

export interface CouponState {
  availableCoupons: AvailableCoupon[]
  userCoupons: UserCoupon[]
  isLoading: boolean
  error: string | null
  
  fetchAvailableCoupons: () => Promise<void>
  fetchUserCoupons: () => Promise<void>
  collectCoupon: (request: CollectCouponRequest) => Promise<{ success: boolean; error?: string }>
  isCollected: (couponId: string) => boolean
}
