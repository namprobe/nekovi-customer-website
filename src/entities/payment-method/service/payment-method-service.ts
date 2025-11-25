// src/entities/payment-method/service/payment-method-service.ts

import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type { PaymentMethodFilter, PaymentMethodItem } from "../type/payment-method"
import type { ApiResult } from "@/src/shared/types/common"

export const paymentMethodService = {
  // Get payment methods list
  getPaymentMethods: async (filter?: PaymentMethodFilter): Promise<ApiResult<{ items: PaymentMethodItem[]; totalItems: number; currentPage: number; totalPages: number; pageSize: number }>> => {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `${env.ENDPOINTS.PAYMENT_METHOD.LIST}?${queryString}` : env.ENDPOINTS.PAYMENT_METHOD.LIST
    return apiClient.get(url)
  },
}

