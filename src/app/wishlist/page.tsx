"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { formatCurrency } from "@/src/shared/utils/format"
import { useWishlistStore } from "@/src/entities/wishlist/service"
import { useCartStore } from "@/src/entities/cart/service"
import { useToast } from "@/src/hooks/use-toast"

export default function WishlistPage() {
  const { toast } = useToast()
  const {
    wishlist,
    isLoading,
    error,
    fetchWishlist,
    removeFromWishlist,
  } = useWishlistStore()
  
  const { addToCart } = useCartStore()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (productId: string, productName: string) => {
    const result = await removeFromWishlist(productId)
    if (result.success) {
      toast({
        title: "Đã xóa",
        description: `${productName} đã được xóa khỏi danh sách yêu thích`,
      })
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Xóa sản phẩm thất bại",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    const result = await addToCart({ productId, quantity: 1 })
    if (result.success) {
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${productName} đã được thêm vào giỏ hàng`,
      })
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      })
    }
  }

  const wishlistItems = wishlist?.items || []

  return (
    <AuthGuard>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Danh Sách Yêu Thích</h1>
            <p className="text-muted-foreground">
              {wishlistItems.length > 0
                ? `Bạn có ${wishlistItems.length} sản phẩm trong danh sách yêu thích`
                : "Danh sách yêu thích của bạn đang trống"}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Đang tải danh sách yêu thích...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchWishlist()}>Thử lại</Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && wishlistItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Heart className="h-24 w-24 text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Danh sách yêu thích trống</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và thêm những sản phẩm bạn thích!
              </p>
              <Link href="/products">
                <Button size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Khám Phá Sản Phẩm
                </Button>
              </Link>
            </div>
          )}

          {/* Wishlist Items */}
          {!isLoading && !error && wishlistItems.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlistItems.map((item) => {
                const product = item.product

                return (
                  <Card key={item.wishlistItemId} className="group relative overflow-hidden transition-all hover:shadow-lg">
                    <Link href={`/products/${item.productId}`}>
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.primaryImage || "/placeholder.svg?height=400&width=400"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="mb-2 line-clamp-2 text-sm font-medium hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>

                      {product.averageRating && (
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(product.averageRating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}

                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(item.productId, product.name)
                          }}
                          disabled={product.stockQuantity === 0}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Thêm vào giỏ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.preventDefault()
                            handleRemove(item.productId, product.name)
                          }}
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                        <p className="mt-2 text-xs text-destructive">
                          Chỉ còn {product.stockQuantity} sản phẩm
                        </p>
                      )}
                      {product.stockQuantity === 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">Hết hàng</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Continue Shopping Button */}
          {!isLoading && wishlistItems.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Tiếp Tục Mua Sắm
                </Button>
              </Link>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
