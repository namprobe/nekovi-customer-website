import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiClient } from '@/src/core/lib/api-client'
import { env } from '@/src/core/config/env'
import type {
  CouponState,
  AvailableCouponsResponse,
  UserCouponsResponse,
  CollectCouponRequest,
} from '../type/coupon'

export const useCouponStore = create<CouponState>()(
  devtools(
    (set, get) => ({
      availableCoupons: [],
      userCoupons: [],
      isLoading: false,
      error: null,

      fetchAvailableCoupons: async () => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.get<AvailableCouponsResponse>(
            env.ENDPOINTS.COUPON.AVAILABLE
          )

          if (result.isSuccess && result.data) {
            set({
              availableCoupons: result.data.coupons,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.message || 'Failed to fetch available coupons',
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Network error',
          })
        }
      },

      fetchUserCoupons: async () => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.get<UserCouponsResponse>(
            env.ENDPOINTS.COUPON.MY_COUPONS
          )

          if (result.isSuccess && result.data) {
            set({
              userCoupons: result.data.coupons,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.message || 'Failed to fetch user coupons',
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Network error',
          })
        }
      },

      collectCoupon: async (request: CollectCouponRequest) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.post(env.ENDPOINTS.COUPON.COLLECT, request)

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh both lists after collecting
            await Promise.all([
              get().fetchAvailableCoupons(),
              get().fetchUserCoupons(),
            ])
            return { success: true }
          } else {
            set({ error: result.message || 'Failed to collect coupon' })
            return {
              success: false,
              error: result.message || 'Failed to collect coupon',
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error'
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage }
        }
      },

      isCollected: (couponId: string) => {
        const coupon = get().availableCoupons.find((c) => c.id === couponId)
        return coupon?.isCollected || false
      },
    }),
    { name: 'coupon-store' }
  )
)
