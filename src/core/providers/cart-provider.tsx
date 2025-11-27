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
  const { isAuthenticated, isHydrated, token } = useAuth()
  const fetchCart = useCartStore((state) => state.fetchCart)
  const clearCartState = useCartStore((state) => state.clearCartState)
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
    if (!isHydrated) return

    if (isAuthenticated && token) {
      // Reset fetch flag when transitioning from logged out -> logged in
      if (previousAuthStateRef.current === false) {
        cartFetchedRef.current = false
      }

      if (!cartFetchedRef.current) {
        cartFetchedRef.current = true
        const loadCart = async () => {
          await fetchCart({ page: 1, pageSize: 3 })
          const { error } = useCartStore.getState()
          if (error) {
            cartFetchedRef.current = false
          }
        }
        loadCart()
      }

      previousAuthStateRef.current = true
    } else if (!isAuthenticated) {
      previousAuthStateRef.current = false
      cartFetchedRef.current = false
    }
  }, [isHydrated, isAuthenticated, token, fetchCart])

  return <>{children}</>
}

// Re-export cart hooks from Zustand store for backward compatibility
export { useCartStore as useCart } from "@/src/entities/cart/service"