// src/entities/wishlist/service/wishlist-service.ts

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  WishlistState,
  AddToWishlistRequest,
  WishlistResponse,
} from "../type/wishlist"

// Initial state
const initialState = {
  wishlist: null,
  isLoading: false,
  error: null,
}

// Create Zustand Store
export const useWishlistStore = create<WishlistState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch wishlist
      fetchWishlist: async () => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.get<WishlistResponse>(
            env.ENDPOINTS.WISHLIST.BASE
          )

          if (result.isSuccess && result.data) {
            set({
              wishlist: result.data,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.message || "Failed to fetch wishlist",
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Add to wishlist (Toggle functionality)
      addToWishlist: async (request: AddToWishlistRequest) => {
        try {
          console.log('🔵🔵🔵 [Wishlist Service] addToWishlist START', request)
          set({ isLoading: true, error: null })

          console.log('🔵 [Wishlist Service] Calling API POST to:', env.ENDPOINTS.WISHLIST.CREATE)
          console.log('🔵 [Wishlist Service] Request body:', request)
          
          const result = await apiClient.post(env.ENDPOINTS.WISHLIST.CREATE, request)
          
          console.log('🔵 [Wishlist Service] API Response:', result)

          set({ isLoading: false })

          if (result.isSuccess) {
            console.log('✅ [Wishlist Service] Success! Refreshing wishlist...')
            // Refresh wishlist after adding
            await get().fetchWishlist()
            console.log('✅ [Wishlist Service] Wishlist refreshed')
            return { success: true }
          } else {
            console.error('❌ [Wishlist Service] API returned failure:', result.message)
            set({ error: result.message || "Failed to add to wishlist" })
            return {
              success: false,
              error: result.message || "Failed to add to wishlist",
              errors: result.errors || [],
            }
          }
        } catch (error) {
          console.error('❌ [Wishlist Service] Exception caught:', error)
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage, errors: [errorMessage] }
        }
      },

      // Remove from wishlist
      removeFromWishlist: async (productId: string) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.delete(
            env.ENDPOINTS.WISHLIST.REMOVE_ITEM(productId)
          )

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh wishlist after removing
            await get().fetchWishlist()
            return { success: true }
          } else {
            set({ error: result.message || "Failed to remove from wishlist" })
            return {
              success: false,
              error: result.message || "Failed to remove from wishlist",
              errors: result.errors || [],
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Network error"
          set({
            isLoading: false,
            error: errorMessage,
          })
          return { success: false, error: errorMessage, errors: [errorMessage] }
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId: string) => {
        const { wishlist } = get()
        if (!wishlist || !wishlist.items) return false
        return wishlist.items.some(item => item.productId === productId)
      },

      // Clear wishlist state (without API call - for logout/unauthorized)
      clearWishlistState: () => {
        set({
          wishlist: null,
          isLoading: false,
          error: null,
        })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    { name: "wishlist-store" }
  )
)
