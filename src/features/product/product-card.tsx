// src/features/product/product-card.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import type { Product } from '@/src/shared/types'; // Lưu ý: Đảm bảo type Product ở shared cũng có field eventDiscountPercentage, hoặc cast kiểu
import { formatCurrency } from '@/src/shared/utils/format';
import { useWishlistStore } from '@/src/entities/wishlist/service';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/hooks/use-toast';

interface ProductCardProps {
  product: Product & { eventDiscountPercentage?: number | null };
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const { isInWishlist, addToWishlist: addToWishlistFromStore } = useWishlistStore();
  const { toast } = useToast();
  const isLiked = isInWishlist(product.id);

  // === LOGIC GIÁ MỚI THEO YÊU CẦU ===
  const originalPrice = product.price;
  const hasBaseDiscount = product.discountPrice != null && product.discountPrice > 0;
  const basePrice = hasBaseDiscount ? product.discountPrice! : originalPrice; // Giá sau khi đã giảm cố định
  const eventPercent = product.eventDiscountPercentage ?? 0;

  // Tiền giảm thêm từ sự kiện (tính trên giá GỐC)
  const eventDiscountAmount = (originalPrice * eventPercent) / 100;

  // Giá cuối cùng hiển thị
  const finalPrice = basePrice - eventDiscountAmount;

  // Tổng tiền được giảm (dùng để hiện badge)
  const totalSaved = originalPrice - finalPrice;

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

          {/* Badge tổng tiết kiệm */}
          {totalSaved > 0 && (
            <Badge className="absolute right-2 top-2 bg-destructive text-destructive-foreground font-bold text-sm">
              -{formatCurrency(totalSaved)}
            </Badge>
          )}

          {/* Badge sự kiện riêng */}
          {eventPercent > 0 && (
            <Badge className="absolute left-2 top-2 bg-yellow-500 text-white font-bold text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              -{eventPercent}%
            </Badge>
          )}

          {product.isPreOrder && (
            <Badge className="absolute left-2 top-10 bg-accent text-accent-foreground z-10">Pre-Order</Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`} className="flex-1">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium hover:text-primary min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        {/* GIÁ HIỂN THỊ */}
        <div className="mb-3 flex items-baseline flex-wrap gap-2">
          {/* Giá gốc - luôn gạch nếu có giảm bất kỳ */}
          {totalSaved > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}

          {/* Giá sau tất cả giảm */}
          <span className="text-lg font-bold text-primary">
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
            Thêm vào giỏ hàng
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistClick();
            }}
            className={cn(isLiked && "text-red-500 border-red-300 bg-red-50")}
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