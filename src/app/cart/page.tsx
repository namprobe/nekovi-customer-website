"use client"

import { MainLayout } from "@/src/widgets/layout/main-layout"
import { CartManager } from "@/src/features/cart/components/CartManager"

export default function CartPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Giỏ hàng của bạn</h1>
        <CartManager />
      </div>
    </MainLayout>
  )
}
