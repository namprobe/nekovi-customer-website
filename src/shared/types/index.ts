//src/shared/types/index.ts
export interface User {
  id: string
  username: string
  email: string
  phone?: string
  gender?: "male" | "female" | "other"
  dateOfBirth?: string
  avatar?: string
  isVIP?: boolean
  createdAt: string
}

export interface Address {
  id: string
  userId: string
  fullName: string
  phone: string
  address: string
  city: string
  district?: string
  isDefault: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number;
  discountPrice?: number | null;
  eventDiscountPercentage?: number | null;
  categoryId: string
  category?: Category
  images: ProductImage[]
  stock: number
  isPreOrder?: boolean
  tags?: string[]
  rating?: number
  reviewCount?: number
  createdAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt?: string
  isPrimary: boolean
  order: number
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  selectedVariant?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: "pending" | "processing" | "shipping" | "delivered" | "cancelled"
  paymentMethod: "bank_transfer" | "cod" | "card"
  shippingAddress: Address
  note?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
}

export interface Review {
  id: string
  productId: string
  userId: string
  user: User
  rating: number
  comment: string
  images?: string[]
  createdAt: string
}

export interface Wishlist {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: string
}
