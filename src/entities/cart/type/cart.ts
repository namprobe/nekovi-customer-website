// src/entities/cart/type/cart.ts

import { EntityStatusEnum } from "../../user-address/type/user-address"

export interface CartItemRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface CartItemResponse {
  id: string
  productId: string
  name: string
  price: number
  discountPrice?: number | null
  quantity: number
  imagePath: string
  createdAt: string
  updatedAt?: string
  status: EntityStatusEnum
  statusName: string
}

export interface CartResponse {
  id: string
  totalPrice: number
  totalItems: number
  cartItems: CartItemResponse[]
  createdAt: string
  updatedAt?: string
  status: EntityStatusEnum
  statusName: string
}

export interface CartFilter {
  page?: number
  pageSize?: number
}

export interface CartState {
  // State properties
  cart: CartResponse | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCart: (filter?: CartFilter) => Promise<void>
  addToCart: (request: CartItemRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  updateCartItem: (cartItemId: string, quantity: number) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  deleteCartItem: (cartItemId: string) => Promise<{ success: boolean; error?: string }>
  clearCart: () => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

