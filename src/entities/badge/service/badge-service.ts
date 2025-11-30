import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  BadgeState,
  UserBadgeWalletItem,
  BadgeProgressItem,
  NewlyAwardedBadge,
  BadgeWalletResponse,
} from "../type/badge"

const initialState = {
  unlockedBadges: [],
  lockedBadges: [],
  isLoading: false,
  error: null,
  currentFilter: "unlocked" as "unlocked" | "all",
}

export const useBadgeStore = create<BadgeState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Fetch my badges
      fetchMyBadges: async (filter: "unlocked" | "all" = "unlocked") => {
        try {
          set({ isLoading: true, error: null, currentFilter: filter })

          const params = filter === "all" ? "?filter=all" : ""
          const result = await apiClient.get<BadgeWalletResponse>(
            `${env.ENDPOINTS.BADGE.MY_BADGES}${params}`
          )

          if (result.isSuccess && result.data) {
            if (filter === "all" && result.data.locked) {
              set({
                unlockedBadges: result.data.unlocked || [],
                lockedBadges: result.data.locked || [],
                isLoading: false,
              })
            } else {
              const unlocked = Array.isArray(result.data) 
                ? result.data 
                : result.data.unlocked || []
              set({
                unlockedBadges: unlocked as UserBadgeWalletItem[],
                lockedBadges: [],
                isLoading: false,
              })
            }
          } else {
            set({
              isLoading: false,
              error: result.message || "Failed to fetch badges",
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Fetch specific user's badges (for profile viewing)
      fetchUserBadges: async (userId: string) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.get<UserBadgeWalletItem[]>(
            env.ENDPOINTS.BADGE.USER_BADGES(userId)
          )

          if (result.isSuccess && result.data) {
            set({
              unlockedBadges: result.data,
              lockedBadges: [],
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.message || "Failed to fetch user badges",
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Equip a badge
      equipBadge: async (badgeId: string) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.patch(
            env.ENDPOINTS.BADGE.EQUIP(badgeId)
          )

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh badges after equipping using the current filter
            const store = useBadgeStore.getState()
            await store.fetchMyBadges(store.currentFilter)
            return { success: true }
          } else {
            set({ error: result.message || "Failed to equip badge" })
            return {
              success: false,
              error: result.message || "Failed to equip badge",
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Process badge eligibility
      processBadgeEligibility: async () => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.post<NewlyAwardedBadge[]>(
            env.ENDPOINTS.BADGE.PROCESS
          )

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh badges after processing using the current filter
            const store = useBadgeStore.getState()
            await store.fetchMyBadges(store.currentFilter)
            return { 
              success: true, 
              newBadges: result.data || [] 
            }
          } else {
            set({ error: result.message || "Failed to process badge eligibility" })
            return {
              success: false,
              error: result.message || "Failed to process badge eligibility",
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage }
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    { name: "badge-store" }
  )
)
