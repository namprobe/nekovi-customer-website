// src/entities/order/type/order.ts

export interface PlaceOrderRequest {
  productId?: string | null
  quantity?: number | null
  userCouponId?: string | null
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

// CustomerOrderItemDTO
export interface CustomerOrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage?: string | null
  quantity: number
  unitPrice: number
  discountAmount: number
  itemTotal: number
  createdAt?: string | null
  updatedAt?: string | null
}

// CustomerOrderDetailItemDto extends CustomerOrderItem
export interface CustomerOrderDetailItem extends CustomerOrderItem {
  categoryName: string
  animeSeriesName?: string | null
  isPreOrder: boolean
  preOrderReleaseDate?: string | null
}

// CustomerOrderPaymentDto
export interface CustomerOrderPayment {
  paymentId: string
  paymentMethodId: string
  paymentMethodName: string
  amount: number
  paymentStatus: number
  transactionNo?: string | null
  paymentDate?: string | null
}

// CustomerOrderListItem
export interface CustomerOrderListItem {
  id: string
  isOneClick: boolean
  totalAmount: number
  finalAmount: number
  paymentStatus: number
  orderStatus: number
  items: CustomerOrderItem[]
  createdAt?: string | null
  updatedAt?: string | null
}

// CustomerOrderDetailDto extends CustomerOrderListItem
export interface CustomerOrderDetailDto extends CustomerOrderListItem {
  discountAmount: number
  payment?: CustomerOrderPayment | null
  items: CustomerOrderDetailItem[]
}

// Pagination response
export interface PaginationResult<T> {
  items: T[]
  totalItems: number
  currentPage: number
  totalPages: number
  pageSize: number
}

// Order State
export interface OrderState {
  // List state
  orderList: CustomerOrderListItem[] | null
  orderListLoading: boolean
  orderListError: string | null
  orderListPagination: {
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
  } | null

  // Detail state
  orderDetail: CustomerOrderDetailDto | null
  orderDetailLoading: boolean
  orderDetailError: string | null

  // Actions
  fetchOrderList: (filter?: OrderFilter) => Promise<void>
  fetchOrderDetail: (orderId: string) => Promise<void>
  clearOrderList: () => void
  clearOrderDetail: () => void
  clearError: () => void
}

