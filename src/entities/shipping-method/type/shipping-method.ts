import { EntityStatusEnum } from "@/src/entities/user-address/type/user-address"

export interface ShippingMethodFilter {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  isAscending?: boolean
  status?: EntityStatusEnum
  minCost?: number
  maxCost?: number
  maxEstimatedDays?: number
}

export interface ShippingMethodItem {
  id: string
  name: string
  description?: string | null
  cost?: number | null
  estimatedDays?: number | null
  status: EntityStatusEnum
  createdAt?: string
  updatedAt?: string | null
}

export interface ShippingFeeData {
  total: number
  serviceFee: number
  insuranceFee: number
  pickStationFee: number
  couponValue: number
  r2SFee: number
  documentReturn: number
  doubleCheck: number
  codFee: number
  pickRemoteAreasFee: number
  deliverRemoteAreasFee: number
  codFailedFee: number
  returnAgainFee: number
}

export interface ShippingFeeResult {
  isSuccess: boolean
  message: string
  data?: ShippingFeeData
}

export interface CalculateShippingFeeRequest {
  shippingMethodId: string
  userAddressId: string
  productId?: string | null
  quantity?: number | null
  insuranceValue?: number | null
  codValue?: number | null
  coupon?: string | null
}

export interface ShippingLeadTimeData {
  leadTime?: string | null
  leadTimeUnix?: number | null
  orderDateUnix?: number | null
  estimateFrom?: string | null
  estimateTo?: string | null
}

export interface ShippingLeadTimeResult {
  isSuccess: boolean
  message: string
  data?: ShippingLeadTimeData
}

