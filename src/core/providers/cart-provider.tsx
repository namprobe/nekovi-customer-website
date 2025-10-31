// src/core/providers/cart-provider.tsx
// This file is kept for backward compatibility
// Cart is now managed by Zustand store in src/entities/cart/service

"use client"

import type React from "react"

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  return <>{children}</>
}

// Re-export cart hooks from Zustand store for backward compatibility
export { useCartStore as useCart } from "@/src/entities/cart/service"
