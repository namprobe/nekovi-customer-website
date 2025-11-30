import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  UserCouponState,
  UserCouponFilter,
  UserCouponItem,
} from "../type/user-coupon"

const initialState = {
  coupons: [],
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  isLoading: false,
  error: null,
}

export const useUserCouponStore = create<UserCouponState>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchCoupons: async (filter?: UserCouponFilter) => {
        try {
          set({ isLoading: true, error: null })

          const params = {
            page: filter?.page ?? 1,
            pageSize: filter?.pageSize ?? 10,
            search: filter?.search,
            sortBy: filter?.sortBy,
            isAscending: filter?.isAscending,
            status: filter?.status,
            userId: filter?.userId,
            isCurrentUser:
              filter?.isCurrentUser !== undefined ? filter.isCurrentUser : true,
            isUsed: filter?.isUsed,
            isExpired: filter?.isExpired,
            couponId: filter?.couponId,
            onlyActiveCoupons: filter?.onlyActiveCoupons,
          }

          const result = await apiClient.paginate<UserCouponItem>(
            env.ENDPOINTS.USER_COUPON.BASE,
            params
          )

          if (result.isSuccess && result.items) {
            set({
              coupons: result.items,
              totalItems: result.totalItems ?? result.items.length,
              currentPage: result.currentPage ?? params.page,
              pageSize: result.pageSize ?? params.pageSize,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.errors?.[0] || "Failed to load coupons",
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      clearCoupons: () => set({ ...initialState }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "user-coupon-store",
    }
  )
)

export const useUserCoupons = () => useUserCouponStore((state) => state.coupons)
export const useUserCouponLoading = () =>
  useUserCouponStore((state) => state.isLoading)

