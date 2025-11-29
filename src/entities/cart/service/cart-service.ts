// src/entities/cart/service/cart-service.ts

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type {
  CartState,
  CartItemRequest,
  CartResponse,
  CartFilter,
} from "../type/cart"

// Initial state
const initialState = {
  cart: null,
  isLoading: false,
  error: null,
}

// Create Zustand Store
export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch cart with pagination
      fetchCart: async (filter?: CartFilter) => {
        try {
          set({ isLoading: true, error: null })

          const params = new URLSearchParams({
            page: String(filter?.page || 1),
            pageSize: String(filter?.pageSize || 10),
          })

          const result = await apiClient.get<CartResponse>(
            `${env.ENDPOINTS.CART.BASE}?${params.toString()}`
          )

          if (result.isSuccess && result.data) {
            set({
              cart: result.data,
              isLoading: false,
            })
          } else {
            set({
              isLoading: false,
              error: result.message || "Failed to fetch cart",
            })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Network error",
          })
        }
      },

      // Add item to cart
      addToCart: async (request: CartItemRequest) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.post(env.ENDPOINTS.CART.BASE, request)

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh cart after adding
            await get().fetchCart({ page: 1, pageSize: 10 })
            return { success: true }
          } else {
            set({ error: result.message || "Failed to add to cart" })
            return {
              success: false,
              error: result.message || "Failed to add to cart",
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

      // Update cart item quantity
      updateCartItem: async (cartItemId: string, quantity: number) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.put(
            env.ENDPOINTS.CART.UPDATE_ITEM(cartItemId),
            { quantity }
          )

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh cart after updating
            await get().fetchCart({ page: 1, pageSize: 10 })
            return { success: true }
          } else {
            set({ error: result.message || "Failed to update cart item" })
            return {
              success: false,
              error: result.message || "Failed to update cart item",
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

      // Delete cart item
      deleteCartItem: async (cartItemId: string) => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.delete(
            env.ENDPOINTS.CART.DELETE_ITEM(cartItemId)
          )

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh cart after deleting
            await get().fetchCart({ page: 1, pageSize: 10 })
            return { success: true }
          } else {
            set({ error: result.message || "Failed to delete cart item" })
            return {
              success: false,
              error: result.message || "Failed to delete cart item",
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

      // Clear cart
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null })

          const result = await apiClient.delete(env.ENDPOINTS.CART.CLEAR)

          set({ isLoading: false })

          if (result.isSuccess) {
            // Refresh cart after clearing
            await get().fetchCart({ page: 1, pageSize: 10 })
            return { success: true }
          } else {
            set({ error: result.message || "Failed to clear cart" })
            return {
              success: false,
              error: result.message || "Failed to clear cart",
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

      // Clear cart state (without API call - for logout/unauthorized)
      clearCartState: () => {
        set({
          cart: null,
          isLoading: false,
          error: null,
        })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "cart-store",
    }
  )
)

// Selector hooks
export const useCartData = () => useCartStore((state) => state.cart)
export const useCartLoading = () => useCartStore((state) => state.isLoading)
export const useCartError = () => useCartStore((state) => state.error)

