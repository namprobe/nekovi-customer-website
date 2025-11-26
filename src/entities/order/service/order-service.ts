// src/entities/order/service/order-service.ts

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  PlaceOrderRequest,
  PlaceOrderResponse,
  OrderFilter,
  CustomerOrderListItem,
  CustomerOrderDetailDto,
  PaginationResult,
  OrderState,
} from "../type/order"
import type { ApiResult } from "@/src/shared/types/common"

// Initial state
const initialState = {
  orderList: null,
  orderListLoading: false,
  orderListError: null,
  orderListPagination: null,
  orderDetail: null,
  orderDetailLoading: false,
  orderDetailError: null,
}

// Create Zustand Store
export const useOrderStore = create<OrderState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch order list
      fetchOrderList: async (filter?: OrderFilter) => {
        try {
          set({ orderListLoading: true, orderListError: null })

          const params = new URLSearchParams()
          if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                params.append(key, value.toString())
              }
            })
          }

          const queryString = params.toString()
          const url = queryString
            ? `${env.ENDPOINTS.ORDER.LIST}?${queryString}`
            : env.ENDPOINTS.ORDER.LIST

          const result = await apiClient.get<PaginationResult<CustomerOrderListItem>>(url)

          if (result.isSuccess && result.data) {
            set({
              orderList: result.data.items,
              orderListPagination: {
                totalItems: result.data.totalItems,
                currentPage: result.data.currentPage,
                totalPages: result.data.totalPages,
                pageSize: result.data.pageSize,
              },
              orderListLoading: false,
            })
          } else {
            set({
              orderListLoading: false,
              orderListError: result.message || "Failed to fetch order list",
            })
          }
        } catch (error) {
          set({
            orderListLoading: false,
            orderListError: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Fetch order detail
      fetchOrderDetail: async (orderId: string) => {
        try {
          set({ orderDetailLoading: true, orderDetailError: null })

          const result = await apiClient.get<CustomerOrderDetailDto>(
            `${env.ENDPOINTS.ORDER.LIST}/${orderId}`
          )

          if (result.isSuccess && result.data) {
            set({
              orderDetail: result.data,
              orderDetailLoading: false,
            })
          } else {
            set({
              orderDetailLoading: false,
              orderDetailError: result.message || "Failed to fetch order detail",
            })
          }
        } catch (error) {
          set({
            orderDetailLoading: false,
            orderDetailError: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Clear order list
      clearOrderList: () => {
        set({
          orderList: null,
          orderListPagination: null,
          orderListError: null,
        })
      },

      // Clear order detail
      clearOrderDetail: () => {
        set({
          orderDetail: null,
          orderDetailError: null,
        })
      },

      // Clear error
      clearError: () => {
        set({
          orderListError: null,
          orderDetailError: null,
        })
      },
    }),
    {
      name: "order-store",
    }
  )
)

// Selector hooks
export const useOrderList = () => useOrderStore((state) => state.orderList)
export const useOrderListLoading = () => useOrderStore((state) => state.orderListLoading)
export const useOrderListError = () => useOrderStore((state) => state.orderListError)
export const useOrderListPagination = () => useOrderStore((state) => state.orderListPagination)

export const useOrderDetail = () => useOrderStore((state) => state.orderDetail)
export const useOrderDetailLoading = () => useOrderStore((state) => state.orderDetailLoading)
export const useOrderDetailError = () => useOrderStore((state) => state.orderDetailError)

// Service functions (for non-store usage)
export const orderService = {
  // Place order
  placeOrder: async (request: PlaceOrderRequest): Promise<ApiResult<PlaceOrderResponse>> => {
    return apiClient.post<PlaceOrderResponse>(env.ENDPOINTS.ORDER.PLACE, request)
  },
}

