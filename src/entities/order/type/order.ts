// src/entities/order/type/order.ts

export interface PlaceOrderRequest {
  productId?: string | null
  quantity?: number | null
  couponCode?: string | null
  paymentMethodId: string
  isOneClick?: boolean
  guestEmail?: string | null
  guestFirstName?: string | null
  guestLastName?: string | null
  guestPhone?: string | null
  oneClickAddress?: string | null
}

export interface PlaceOrderResponse {
  orderId: string
  paymentGateway?: "VnPay" | "Momo" | null
  paymentUrl?: string | null
  createdAt: string
  finalAmount: number
}

export interface OrderFilter {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  isAscending?: boolean
  userId?: string
  userEmail?: string
  guestEmail?: string
  isOneClick?: boolean
  paymentStatus?: number
  orderStatus?: number
  status?: number
  minAmount?: number
  maxAmount?: number
  dateFrom?: string
  dateTo?: string
  hasCoupon?: boolean
}

export interface OrderListItem {
  id: string
  userId?: string | null
  isOneClick: boolean
  guestEmail?: string | null
  guestFirstName?: string | null
  guestLastName?: string | null
  guestPhone?: string | null
  oneClickAddress?: string | null
  totalAmount: number
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  finalAmount: number
  paymentStatus: number
  orderStatus: number
  notes?: string | null
  createdAt: string
  updatedAt?: string | null
}

