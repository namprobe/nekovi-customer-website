"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { mockProducts } from "@/src/core/lib/mock-data"
import { Button } from "@/src/components/ui/button"
import { useCart } from "@/src/core/providers/cart-provider"
import { useToast } from "@/src/hooks/use-toast"
import { formatCurrency } from "@/src/shared/utils/format"
import { ProductCard } from "@/src/features/product/product-card"
import { Badge } from "@/src/components/ui/badge"
import { Star } from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const product = mockProducts.find((p) => p.id === params.id)

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
          <Button onClick={() => router.push("/products")} className="mt-4">
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </MainLayout>
    )
  }

  const images = [
    product.images[0] || { url: "/placeholder.svg" },
    product.images[1] || { url: "/placeholder.svg" },
    product.images[2] || { url: "/placeholder.svg" },
    product.images[3] || { url: "/placeholder.svg" }
  ]
  const relatedProducts = mockProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} x${quantity}`,
    })
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Product Detail */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
              <Image
                src={images[selectedImage]?.url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.discount && (
                <Badge className="absolute right-4 top-4 bg-red-500 text-lg">-{product.discount}%</Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                    selectedImage === idx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img?.url || "/placeholder.svg"}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(128 đánh giá)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
              {product.discount && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(product.price / (1 - product.discount / 100))}
                </span>
              )}
            </div>

            <div className="space-y-4 rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="bg-transparent"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="bg-transparent"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Tình trạng:</span>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1" size="lg">
                Thêm vào giỏ hàng
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart()
                  router.push("/cart")
                }}
                disabled={product.stock === 0}
                variant="outline"
                className="flex-1 bg-transparent"
                size="lg"
              >
                Mua ngay
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border bg-card p-6">
              <h3 className="font-semibold">Thông tin sản phẩm</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Danh mục:</span>
                  <span className="font-medium capitalize">{product.category?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thương hiệu:</span>
                  <span className="font-medium">NekoVi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Xuất xứ:</span>
                  <span className="font-medium">Nhật Bản</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Sản Phẩm Tương Tự</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
