"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/src/shared/types"

interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
}

interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("nekovi_cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("nekovi_cart", JSON.stringify(cart))
  }, [cart])

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    return { total, itemCount }
  }

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find((item) => item.productId === product.id)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = prevCart.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
        }
        newItems = [...prevCart.items, newItem]
      }

      const { total, itemCount } = calculateTotal(newItems)
      return { items: newItems, total, itemCount }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId)
      const { total, itemCount } = calculateTotal(newItems)
      return { items: newItems, total, itemCount }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      const { total, itemCount } = calculateTotal(newItems)
      return { items: newItems, total, itemCount }
    })
  }

  const clearCart = () => {
    setCart({ items: [], total: 0, itemCount: 0 })
  }

  const getTotalPrice = () => cart.total

  const getItemCount = () => cart.itemCount

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
