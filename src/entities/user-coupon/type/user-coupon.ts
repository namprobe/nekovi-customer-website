import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"

export enum DiscountTypeEnum {
  Percentage = 0,
  Fixed = 1,
  FreeShipping = 2,
}

export interface UserCouponItem {
  id: string
  couponId: string
  couponCode: string
  couponName?: string
  description?: string
  discountType: DiscountTypeEnum
  discountValue: number
  maxDiscountCap?: number | null
  discountTypeName: string
  minOrderAmount: number
  startDate: string
  endDate: string
  usageLimit?: number
  currentUsage: number
  usedDate?: string
  isUsed: boolean
  isExpired: boolean
  status: EntityStatusEnum
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface UserCouponFilter {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  isAscending?: boolean
  status?: EntityStatusEnum
  userId?: string
  isCurrentUser?: boolean
  isUsed?: boolean
  isExpired?: boolean
  couponId?: string
  onlyActiveCoupons?: boolean
}

export interface UserCouponState {
  coupons: UserCouponItem[]
  currentPage: number
  pageSize: number
  totalItems: number
  isLoading: boolean
  error: string | null
  fetchCoupons: (filter?: UserCouponFilter) => Promise<void>
  clearCoupons: () => void
  clearError: () => void
}

