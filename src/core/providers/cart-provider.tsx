// src/core/providers/cart-provider.tsx
// Cart provider that automatically manages cart state based on auth state

"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useCartStore } from "@/src/entities/cart/service"

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, isHydrated } = useAuth()
  const { fetchCart, clearCartState, cart } = useCartStore()
  const cartFetchedRef = useRef(false)
  const previousAuthStateRef = useRef<boolean | null>(null)

  // Clear cart immediately when user logs out or becomes unauthenticated
  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        // Always clear cart when not authenticated (immediately, no conditions)
        clearCartState()
        cartFetchedRef.current = false
        previousAuthStateRef.current = false
      }
    }
  }, [isHydrated, isAuthenticated, clearCartState])

  // Auto-fetch cart when user logs in or when hydrated with authenticated state
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const wasAuthenticated = previousAuthStateRef.current

      // User just logged in (transition from unauthenticated to authenticated)
      // or user already logged in from persisted state (wasAuthenticated is null initially)
      if (!cartFetchedRef.current) {
        // Only fetch if cart is null or empty
        // Fetch with pageSize 3 to match cart popup's initial display (first 3 items)
        // CartManager and other components will fetch their own pages as needed
        if (!cart || cart.totalItems === 0) {
          cartFetchedRef.current = true
          fetchCart({ page: 1, pageSize: 3 })
        } else {
          // Cart already has data, mark as fetched
          cartFetchedRef.current = true
        }
      }

      // Update previous auth state
      previousAuthStateRef.current = true
    } else if (isHydrated && !isAuthenticated) {
      // Update previous auth state when logged out
      previousAuthStateRef.current = false
    }
  }, [isHydrated, isAuthenticated, fetchCart, cart])

  return <>{children}</>
}

// Re-export cart hooks from Zustand store for backward compatibility
export { useCartStore as useCart } from "@/src/entities/cart/service"
