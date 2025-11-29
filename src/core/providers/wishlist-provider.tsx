// src/core/providers/wishlist-provider.tsx
// Wishlist provider that automatically manages wishlist state based on auth state

"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useWishlistStore } from "@/src/entities/wishlist/service"

interface WishlistProviderProps {
  children: React.ReactNode
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { isAuthenticated, isHydrated, token } = useAuth()
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const clearWishlistState = useWishlistStore((state) => state.clearWishlistState)
  const wishlistFetchedRef = useRef(false)
  const previousAuthStateRef = useRef<boolean | null>(null)

  // Clear wishlist immediately when user logs out or becomes unauthenticated
  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        // Always clear wishlist when not authenticated (immediately, no conditions)
        clearWishlistState()
        wishlistFetchedRef.current = false
        previousAuthStateRef.current = false
      }
    }
  }, [isHydrated, isAuthenticated, clearWishlistState])

  // Auto-fetch wishlist when user logs in or when hydrated with authenticated state
  useEffect(() => {
    if (!isHydrated) return

    if (isAuthenticated && token) {
      // Reset fetch flag when transitioning from logged out -> logged in
      if (previousAuthStateRef.current === false) {
        wishlistFetchedRef.current = false
      }

      if (!wishlistFetchedRef.current) {
        wishlistFetchedRef.current = true
        const loadWishlist = async () => {
          await fetchWishlist()
          const { error } = useWishlistStore.getState()
          if (error) {
            wishlistFetchedRef.current = false
          }
        }
        loadWishlist()
      }

      previousAuthStateRef.current = true
    } else if (!isAuthenticated) {
      previousAuthStateRef.current = false
      wishlistFetchedRef.current = false
    }
  }, [isHydrated, isAuthenticated, token, fetchWishlist])

  return <>{children}</>
}

// Re-export wishlist hooks from Zustand store for backward compatibility
export { useWishlistStore as useWishlist } from "@/src/entities/wishlist/service"
