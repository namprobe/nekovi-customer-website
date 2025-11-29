// src/widgets/cart/cart-popup.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
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

const ITEMS_PER_PAGE = 3

export function CartPopup() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const {
    cart,
    isLoading,
    fetchCart,
    deleteCartItem,
  } = useCartStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const popupFetchedRef = useRef(false)

  // Fetch cart when popup opens (only if cart is not already loaded or needs refresh)
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      // If cart is already loaded with data, use it
      // Only fetch if cart is null or if we need a different page
      const hasCartData = cart && cart.cartItems.length > 0
      const needsFetch = !hasCartData || (currentPage > 1 && !popupFetchedRef.current)

      if (needsFetch && !popupFetchedRef.current) {
        popupFetchedRef.current = true
      fetchCart({ page: currentPage, pageSize: ITEMS_PER_PAGE })
    }
    }
  }, [isOpen, isAuthenticated, currentPage, fetchCart, cart])

  // Reset fetch ref when popup closes
  useEffect(() => {
    if (!isOpen) {
      popupFetchedRef.current = false
      setCurrentPage(1)
    }
  }, [isOpen])

  // Close popup and reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false)
      popupFetchedRef.current = false
      setCurrentPage(1)
    }
  }, [isAuthenticated])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    popupFetchedRef.current = false
    fetchCart({ page, pageSize: ITEMS_PER_PAGE })
  }

  const handleDelete = async (cartItemId: string) => {
    const result = await deleteCartItem(cartItemId)
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm khỏi giỏ hàng",
      })
      // Cart will be refreshed automatically by deleteCartItem action
      popupFetchedRef.current = false
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Xóa sản phẩm thất bại",
        variant: "destructive",
      })
    }
  }

  const totalItems = cart?.totalItems || 0
  // Always limit popup display to first ITEMS_PER_PAGE items,
  // even if global cart state was loaded with a larger pageSize elsewhere
  const displayedItems = cart?.cartItems?.slice(0, ITEMS_PER_PAGE) || []
  const remainingItems = Math.max(0, totalItems - displayedItems.length)
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Shopping cart">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Sản Phẩm Mới Thêm</h3>
            {totalItems > 0 && (
              <span className="text-xs text-muted-foreground">
                {totalItems} sản phẩm
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading && displayedItems.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Chưa có sản phẩm
              </p>
            </div>
          ) : (
            <>
              {displayedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 px-4 py-3 hover:bg-accent/5 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsOpen(false)
                    router.push(`/products/${item.productId}`)
                  }}
                >
                  <div 
                    className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={item.imagePath || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Show remaining items */}
              {remainingItems > 0 && (
                <div className="px-4 py-2 text-center text-xs text-muted-foreground bg-muted/30">
                  {remainingItems} sản phẩm khác trong giỏ hàng
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {displayedItems.length > 0 && (
          <div className="border-t px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tổng cộng:</span>
              <span className="text-base font-bold text-primary">
                {formatCurrency(cart?.totalPrice || 0)}
              </span>
            </div>

            <Link href="/cart" onClick={() => setIsOpen(false)} className="block">
              <Button className="w-full" size="sm">
                Xem Giỏ Hàng
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

