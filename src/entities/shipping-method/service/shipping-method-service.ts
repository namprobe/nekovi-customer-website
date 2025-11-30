import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  ShippingMethodFilter,
  ShippingMethodItem,
  ShippingFeeResult,
  CalculateShippingFeeRequest,
  ShippingLeadTimeResult,
} from "../type/shipping-method"
import type { PaginateResult, ApiResult } from "@/src/shared/types/common"

export const shippingMethodService = {
  async getShippingMethods(
    filter?: ShippingMethodFilter
  ): Promise<PaginateResult<ShippingMethodItem>> {
    const params = {
      page: filter?.page ?? 1,
      pageSize: filter?.pageSize ?? 10,
      search: filter?.search,
      sortBy: filter?.sortBy,
      isAscending: filter?.isAscending,
      status: filter?.status,
      minCost: filter?.minCost,
      maxCost: filter?.maxCost,
      maxEstimatedDays: filter?.maxEstimatedDays,
    }

    return apiClient.paginate<ShippingMethodItem>(
      env.ENDPOINTS.SHIPPING_METHOD.BASE,
      params
    )
  },

  async calculateShippingFee(
    request: CalculateShippingFeeRequest
  ): Promise<ApiResult<ShippingFeeResult>> {
    return apiClient.post<ShippingFeeResult>(
      env.ENDPOINTS.SHIPPING_METHOD.CALCULATE_FEE,
      request
    )
  },

  async calculateShippingLeadTime(
    request: CalculateShippingFeeRequest
  ): Promise<ApiResult<ShippingLeadTimeResult>> {
    return apiClient.post<ShippingLeadTimeResult>(
      env.ENDPOINTS.SHIPPING_METHOD.LEAD_TIME,
      request
    )
  },
}

