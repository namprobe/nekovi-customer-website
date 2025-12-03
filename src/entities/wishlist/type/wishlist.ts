// src/entities/wishlist/type/wishlist.ts

import { EntityStatusEnum } from "../../user-address/type/user-address"

export interface ProductItemInWishlist {
  id: string
  name: string
  categoryId: string
  category?: {
    id: string
    name: string
    description?: string
  }
  animeSeriesId?: string
  animeSeries?: {
    id: string
    title: string
  }
  stockQuantity: number
  price: number
  primaryImage?: string
  averageRating?: number
  reviewCount: number
  status: EntityStatusEnum
  statusName: string
  createdAt: string
  updatedAt?: string
}

export interface WishlistItemResponse {
  wishlistItemId: string
  productId: string
  product: ProductItemInWishlist
  addedAt: string
}

export interface WishlistResponse {
  wishlistId: string
  items: WishlistItemResponse[]
}

export interface AddToWishlistRequest {
  productId: string
}

export interface WishlistState {
  // State properties
  wishlist: WishlistResponse | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchWishlist: () => Promise<void>
  addToWishlist: (request: AddToWishlistRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  removeFromWishlist: (productId: string) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  isInWishlist: (productId: string) => boolean
  clearWishlistState: () => void
  clearError: () => void
}
