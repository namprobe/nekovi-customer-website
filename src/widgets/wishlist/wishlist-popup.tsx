// src/widgets/wishlist/wishlist-popup.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useWishlistStore } from "@/src/entities/wishlist/service"
import { useCartStore } from "@/src/entities/cart/service"
import { formatCurrency } from "@/src/shared/utils/format"
import { useToast } from "@/src/hooks/use-toast"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

export function WishlistPopup() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const {
    wishlist,
    isLoading,
    fetchWishlist,
    removeFromWishlist,
  } = useWishlistStore()
  
  const { addToCart } = useCartStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const wishlistFetchedRef = useRef(false)

  // Fetch wishlist when popup opens
  useEffect(() => {
    if (isOpen && isAuthenticated && !wishlistFetchedRef.current) {
      wishlistFetchedRef.current = true
      fetchWishlist()
    }
  }, [isOpen, isAuthenticated, fetchWishlist])

  // Reset fetch ref when popup closes
  useEffect(() => {
    if (!isOpen) {
      wishlistFetchedRef.current = false
    }
  }, [isOpen])

  const handleRemove = async (productId: string, productName: string) => {
    const result = await removeFromWishlist(productId)
    if (result.success) {
      toast({
        title: "Đã xóa",
        description: `${productName} đã được xóa khỏi danh sách yêu thích`,
      })
      wishlistFetchedRef.current = false
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

  const totalItems = wishlist?.items?.length || 0
  const displayedItems = wishlist?.items?.slice(0, 3) || []
  const remainingItems = Math.max(0, totalItems - 3)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Wishlist">
          <Heart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {totalItems}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Danh Sách Yêu Thích</h3>
            {totalItems > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalItems} sản phẩm
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
            </div>
          )}

          {!isLoading && totalItems === 0 && (
            <div className="p-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Danh sách yêu thích trống
              </p>
              <Link href="/products">
                <Button variant="link" size="sm" className="mt-2">
                  Khám phá sản phẩm
                </Button>
              </Link>
            </div>
          )}

          {!isLoading && displayedItems.length > 0 && (
            <div className="divide-y">
              {displayedItems.map((item) => (
                <div key={item.wishlistItemId} className="flex gap-3 p-4">
                  <Link href={`/products/${item.productId}`} className="shrink-0">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.product.primaryImage || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col gap-1">
                    <Link 
                      href={`/products/${item.productId}`}
                      className="text-sm font-medium line-clamp-1 hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(item.product.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={() => handleAddToCart(item.productId, item.product.name)}
                        disabled={item.product.stockQuantity === 0}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Thêm vào giỏ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.productId, item.product.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <div className="border-t p-4">
            {remainingItems > 0 && (
              <p className="mb-3 text-xs text-center text-muted-foreground">
                và {remainingItems} sản phẩm khác...
              </p>
            )}
            <Link href="/wishlist" onClick={() => setIsOpen(false)}>
              <Button className="w-full" size="sm">
                Xem Tất Cả Yêu Thích
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
