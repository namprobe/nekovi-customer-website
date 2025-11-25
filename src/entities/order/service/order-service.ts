// src/entities/order/service/order-service.ts

import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type { PlaceOrderRequest, PlaceOrderResponse, OrderFilter, OrderListItem } from "../type/order"
import type { ApiResult } from "@/src/shared/types/common"

export const orderService = {
  // Place order
  placeOrder: async (request: PlaceOrderRequest): Promise<ApiResult<PlaceOrderResponse>> => {
    return apiClient.post<PlaceOrderResponse>(env.ENDPOINTS.ORDER.PLACE, request)
  },

  // Get order list
  getOrderList: async (filter?: OrderFilter): Promise<ApiResult<{ items: OrderListItem[]; totalItems: number; currentPage: number; totalPages: number; pageSize: number }>> => {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `${env.ENDPOINTS.ORDER.LIST}?${queryString}` : env.ENDPOINTS.ORDER.LIST
    return apiClient.get(url)
  },
}

