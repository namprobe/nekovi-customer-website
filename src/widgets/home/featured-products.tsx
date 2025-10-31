"use client"

import { ProductCard } from "@/src/features/product/product-card"
import type { Product } from "@/src/shared/types"
import { useCartStore } from "@/src/entities/cart/service"
import { useToast } from "@/src/hooks/use-toast"

interface FeaturedProductsProps {
  title: string
  products: Product[]
}

export function FeaturedProducts({ title, products }: FeaturedProductsProps) {
  const { addToCart } = useCartStore()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addToCart({ productId: product.id, quantity: 1 }).then((result) => {
      if (result.success) {
        toast({
          title: "Đã thêm vào giỏ hàng",
          description: `${product.name} đã được thêm vào giỏ hàng`,
        })
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể thêm vào giỏ hàng",
          variant: "destructive",
        })
      }
    })
  }

  const handleAddToWishlist = (product: Product) => {
    toast({
      title: "Đã thêm vào yêu thích",
      description: `${product.name} đã được thêm vào danh sách yêu thích`,
    })
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-balance">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
