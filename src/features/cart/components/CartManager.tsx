// src/features/cart/components/CartManager.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useCartStore } from "@/src/entities/cart/service"
import { formatCurrency } from "@/src/shared/utils/format"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/hooks/use-toast"
import { useAuth } from "@/src/core/providers/auth-provider"
import { Pagination } from "@/src/components/ui/pagination"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"

const ITEMS_PER_PAGE = 6

export function CartManager() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isHydrated } = useAuth()
  const {
    cart,
    isLoading,
    fetchCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
  } = useCartStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingQuantity, setEditingQuantity] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetItemId, setDeleteTargetItemId] = useState<string | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const pageFetchedRef = useRef<number | null>(null)

  // Fetch cart when:
  // 1. User is authenticated and hydrated
  // 2. Cart is null (not yet loaded by provider) - fetch first page
  // 3. Page changes (pagination) - fetch new page
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      // If cart is null, fetch first page
      if (!cart) {
        if (pageFetchedRef.current !== 1) {
          pageFetchedRef.current = 1
          fetchCart({ page: 1, pageSize: ITEMS_PER_PAGE })
        }
      } else if (pageFetchedRef.current !== currentPage) {
        // Page changed or reset - fetch the current page
        pageFetchedRef.current = currentPage
        fetchCart({ page: currentPage, pageSize: ITEMS_PER_PAGE })
      }
    }
  }, [isHydrated, isAuthenticated, currentPage, fetchCart, cart])

  const handleCheckout = () => {
    router.push("/checkout")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    pageFetchedRef.current = null // Reset to allow fetch
  }

  const handleUpdateQuantity = async (cartItemId: string, currentQuantity: number, delta: number) => {
    // Force exit edit mode if currently editing
    if (editingItemId === cartItemId) {
      handleCancelEdit()
    }

    const newQuantity = currentQuantity + delta
    if (newQuantity < 1) {
      // ask delete confirm
      setDeleteTargetItemId(cartItemId)
      setDeleteDialogOpen(true)
      return
    }

    const result = await updateCartItem(cartItemId, newQuantity)
    if (!result.success) {
      toast({
        title: "Lỗi",
        description: result.error || "Cập nhật số lượng thất bại",
        variant: "destructive",
      })
    } else {
      // Refresh cart to get latest data
      pageFetchedRef.current = null
      await fetchCart({ page: currentPage, pageSize: ITEMS_PER_PAGE })
    }
  }

  const handleDelete = async (cartItemId: string) => {
    const result = await deleteCartItem(cartItemId)
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm khỏi giỏ hàng",
      })
      // Cart will be refreshed automatically by deleteCartItem action
      pageFetchedRef.current = null
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Xóa sản phẩm thất bại",
        variant: "destructive",
      })
    }
  }

  const handleClearCartRequest = () => {
    setClearDialogOpen(true)
  }

  const handleEditQuantity = (itemId: string, currentQuantity: number) => {
    setEditingItemId(itemId)
    setEditingQuantity(String(currentQuantity))
  }

  const handleSaveQuantity = async (itemId: string) => {
    const newQuantity = parseInt(editingQuantity)
    if (isNaN(newQuantity)) {
      toast({ title: "Lỗi", description: "Số lượng không hợp lệ", variant: "destructive" })
      return
    }
    if (newQuantity < 1) {
      // confirm delete when set to 0
      // Exit edit mode first to prevent re-rendering issues
      setEditingItemId(null)
      setEditingQuantity("")
      // Use setTimeout to ensure the Enter event doesn't bubble to dialog buttons
      setTimeout(() => {
        setDeleteTargetItemId(itemId)
        setDeleteDialogOpen(true)
      }, 50)
      return
    }

    const result = await updateCartItem(itemId, newQuantity)
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã cập nhật số lượng",
      })
      setEditingItemId(null)
      setEditingQuantity("")
      // Cart will be refreshed automatically by updateCartItem action
      pageFetchedRef.current = null
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Cập nhật số lượng thất bại",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingQuantity("")
  }

  const items = cart?.cartItems || []
  const totalItems = cart?.totalItems || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link href="/products">
            <Button size="lg">Tiếp tục mua sắm</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        {/* Clear Cart Button */}
        {items.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearCartRequest}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa toàn bộ giỏ hàng
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div 
                  className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => router.push(`/products/${item.productId}`)}
                >
                  <Image
                    src={item.imagePath || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-medium hover:text-primary line-clamp-2 cursor-pointer">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        disabled={isLoading}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="1"
                            value={editingQuantity}
                            onChange={(e) => setEditingQuantity(e.target.value)}
                            className="w-16 h-8 text-center"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                e.stopPropagation()
                                handleSaveQuantity(item.id)
                              } else if (e.key === "Escape") {
                                e.preventDefault()
                                e.stopPropagation()
                                handleCancelEdit()
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSaveQuantity(item.id)}
                            disabled={isLoading}
                          >
                            ✓
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCancelEdit}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <span 
                          className="w-12 text-center font-medium cursor-pointer hover:text-primary"
                          onClick={() => handleEditQuantity(item.id, item.quantity)}
                          title="Click để nhập số lượng"
                        >
                          {item.quantity}
                        </span>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(cart?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
              </div>

              <div className="my-4">
                <Input placeholder="Nhập mã giảm giá" />
                <Button variant="outline" className="mt-2 w-full">
                  Áp dụng
                </Button>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(cart?.totalPrice || 0)}</span>
              </div>

              <Button 
                className="mt-6 w-full" 
                size="lg" 
                onClick={handleCheckout}
                disabled={isLoading || items.length === 0}
              >
                Thanh toán
              </Button>

              <Link href="/products">
                <Button variant="outline" className="mt-2 w-full">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete item confirm dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm khỏi giỏ hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa sản phẩm khỏi giỏ hàng của bạn và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false)
              setDeleteTargetItemId(null)
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTargetItemId) return
                await handleDelete(deleteTargetItemId)
                setDeleteTargetItemId(null)
                setDeleteDialogOpen(false)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear cart confirm dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa toàn bộ giỏ hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả sản phẩm trong giỏ hàng sẽ bị xóa và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearDialogOpen(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                const result = await clearCart()
                if (result.success) {
                  toast({ title: "Thành công", description: "Đã xóa toàn bộ giỏ hàng" })
                  // Cart will be refreshed automatically by clearCart action
                  pageFetchedRef.current = null
                } else {
                  toast({ title: "Lỗi", description: result.error || "Xóa giỏ hàng thất bại", variant: "destructive" })
                }
                setClearDialogOpen(false)
              }}
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

