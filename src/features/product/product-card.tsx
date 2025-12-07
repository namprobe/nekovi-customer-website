// src/features/product/product-card.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import type { Product } from '@/src/shared/types'; // Lưu ý: Đảm bảo type Product ở shared cũng có field eventDiscountPercentage, hoặc cast kiểu
import { formatCurrency } from '@/src/shared/utils/format';
import { useWishlistStore } from '@/src/entities/wishlist/service';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/hooks/use-toast';

interface ProductCardProps {
  // Chúng ta mở rộng type Product để chấp nhận eventDiscountPercentage nếu type gốc chưa có
  product: Product & { eventDiscountPercentage?: number | null };
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const { isInWishlist, addToWishlist: addToWishlistFromStore } = useWishlistStore();
  const { toast } = useToast();

  const isLiked = isInWishlist(product.id);

  // --- LOGIC TÍNH TOÁN GIÁ MỚI ---

  // 1. Giá gốc
  const originalPrice = product.price;

  // 2. Số tiền giảm cố định (Base Discount Price)
  const baseDiscountAmount = product.discountPrice ?? 0;

  // 3. Phần trăm giảm giá sự kiện (Event Discount Percentage)
  const eventDiscountPercent = product.eventDiscountPercentage ?? 0;

  // 4. Số tiền giảm từ % sự kiện = Price * % / 100
  const eventDiscountAmount = (originalPrice * eventDiscountPercent) / 100;

  // 5. Tổng tiền được giảm = Base Discount + Event Discount Amount
  const totalDiscountAmount = baseDiscountAmount + eventDiscountAmount;

  // 6. Giá cuối cùng = Giá gốc - Tổng giảm
  const finalPrice = originalPrice - totalDiscountAmount;

  // Kiểm tra có giảm giá không để hiển thị UI
  const hasDiscount = totalDiscountAmount > 0;

  const handleWishlistClick = async () => {
    try {
      const result = await addToWishlistFromStore({ productId: product.id });
      if (result.success) {
        const isNowLiked = isInWishlist(product.id);
        toast({
          title: isNowLiked ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
          description: `${product.name}`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật danh sách yêu thích",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🔴 [ProductCard] Error:', error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage?.url || '/placeholder.svg?height=400&width=400'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {/* BADGE GIẢM GIÁ: Hiển thị tổng số tiền được giảm */}
          {hasDiscount && (
            <Badge className="absolute right-2 top-2 bg-destructive text-destructive-foreground font-bold">
              -{formatCurrency(totalDiscountAmount)}
            </Badge>
          )}

          {product.isPreOrder && (
            <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground z-10">Pre-Order</Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`} className="flex-1">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-balance hover:text-primary min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        {/* --- KHU VỰC HIỂN THỊ GIÁ --- */}
        <div className="mb-3 flex items-center flex-wrap gap-2">
          {/* Giá gốc gạch ngang */}
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through decoration-destructive/60">
              {formatCurrency(originalPrice)}
            </span>
          )}

          {/* Giá sau giảm (đã trừ DiscountPrice và EventDiscount) */}
          <span
            className={cn(
              "text-lg font-bold",
              "text-primary"
            )}
          >
            {formatCurrency(finalPrice)}
          </span>
        </div>

        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistClick();
            }}
            aria-label="Add to wishlist"
            className={cn(
              "transition-colors",
              isLiked && "text-red-500 hover:text-red-600 border-red-200 bg-red-50"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </Button>
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="mt-2 text-xs text-destructive font-medium">Chỉ còn {product.stock} sản phẩm</p>
        )}
        {product.stock === 0 && <p className="mt-2 text-xs text-muted-foreground">Hết hàng</p>}
      </CardContent>
    </Card>
  );
}