"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Heart, ShoppingCart, Eye, Trash2, Star } from "lucide-react"
import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { formatCurrency } from "@/src/shared/utils/format"

// Mock wishlist data
const mockWishlistItems = [
  {
    id: "1",
    product: {
      id: "1",
      name: "Trang phục Maomao",
      slug: "trang-phuc-maomao",
      description: "Trang phục cosplay Maomao Anime Nhật ký Apothecary Hanfu",
      price: 10990,
      originalPrice: 15000,
      discount: 27,
      images: [
        {
          id: "1",
          productId: "1",
          url: "/maomao-cosplay-costume.jpg",
          isPrimary: true,
          order: 1,
        },
      ],
      stock: 15,
      rating: 4.8,
      reviewCount: 24,
      category: "Cosplay",
    },
    addedAt: "2024-02-01T10:30:00Z",
  },
  {
    id: "2",
    product: {
      id: "2",
      name: "Trang phục Luffy",
      slug: "trang-phuc-luffy",
      description: "Trang phục cosplay Monkey D Luffy One Piece",
      price: 365000,
      originalPrice: 450000,
      discount: 19,
      images: [
        {
          id: "2",
          productId: "2",
          url: "/luffy-cosplay-red-vest.jpg",
          isPrimary: true,
          order: 1,
        },
      ],
      stock: 8,
      rating: 4.9,
      reviewCount: 156,
      category: "Cosplay",
    },
    addedAt: "2024-01-28T14:20:00Z",
  },
  {
    id: "3",
    product: {
      id: "3",
      name: "Thủy trụ của Kamado Tanjiro",
      slug: "thuy-tru-kamado-tanjiro",
      description: "Đạo cụ phát sáng anime cosplay thủng Thanh Gươm Diệt Quỷ",
      price: 250000,
      images: [
        {
          id: "3",
          productId: "3",
          url: "/tanjiro-sword-glowing.jpg",
          isPrimary: true,
          order: 1,
        },
      ],
      stock: 20,
      rating: 4.7,
      reviewCount: 89,
      category: "Phụ kiện",
    },
    addedAt: "2024-01-25T09:15:00Z",
  },
  {
    id: "4",
    product: {
      id: "4",
      name: "Trang phục Roronoa Zoro",
      slug: "trang-phuc-roronoa-zoro",
      description: "Trang phục cosplay Roronoa Zoro One Piece",
      price: 1270620,
      images: [
        {
          id: "4",
          productId: "4",
          url: "/zoro-cosplay-costume.jpg",
          isPrimary: true,
          order: 1,
        },
      ],
      stock: 5,
      rating: 4.9,
      reviewCount: 67,
      category: "Cosplay",
    },
    addedAt: "2024-01-20T16:45:00Z",
  },
  {
    id: "5",
    product: {
      id: "5",
      name: "Astray Blue Third Momoko",
      slug: "astray-blue-third-momoko",
      description: "Mô hình Gundam Astray Blue Third Momoko",
      price: 2500000,
      images: [
        {
          id: "5",
          productId: "5",
          url: "/gundam-astray-blue.jpg",
          isPrimary: true,
          order: 1,
        },
      ],
      stock: 3,
      rating: 5.0,
      reviewCount: 12,
      category: "Figure",
    },
    addedAt: "2024-01-18T11:30:00Z",
  },
]

function WishlistPageContent() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)
  const [sortBy, setSortBy] = useState("newest")

  // Xóa item khỏi wishlist
  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId))
  }

  // Sắp xếp wishlist
  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.product.price - b.product.price
      case "price-high":
        return b.product.price - a.product.price
      case "rating":
        return b.product.rating - a.product.rating
      case "newest":
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    }
  })

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Danh sách yêu thích</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} sản phẩm trong danh sách yêu thích của bạn
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
          
          {wishlistItems.length > 0 && (
            <Button variant="outline" className="w-fit">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm tất cả vào giỏ hàng
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.product.images[0]?.url || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.product.discount && (
                    <Badge className="absolute top-2 left-2 bg-destructive">
                      -{item.product.discount}%
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {item.product.category}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.product.description}
                    </p>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({item.product.reviewCount} đánh giá)
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(item.product.price)}
                      </span>
                      {item.product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Thêm vào {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${item.product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-1 h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Button size="sm" className="flex-1">
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Danh sách yêu thích trống</h3>
            <p className="mb-6 text-muted-foreground">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích
            </p>
            <Link href="/products">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-4 text-lg font-semibold">Thao tác nhanh</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Chia sẻ danh sách
              </Button>
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm tất cả vào giỏ hàng
              </Button>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tất cả
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default function WishlistPage() {
  return (
    <AuthGuard requireAuth={true}>
      <WishlistPageContent />
    </AuthGuard>
  )
}
