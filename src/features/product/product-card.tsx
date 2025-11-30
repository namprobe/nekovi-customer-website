// src/features/product/product-card.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import type { Product } from '@/src/shared/types';
import { formatCurrency } from '@/src/shared/utils/format';
import { usePathname, useSearchParams } from 'next/navigation';
import { useWishlistStore } from '@/src/entities/wishlist/service';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const discountPercent =
    product.discount ||
    (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  const searchParams = useSearchParams();
  const queryString = searchParams.toString(); // giữ nguyên query params hiện tại

  const { isInWishlist, addToWishlist: addToWishlistFromStore } = useWishlistStore();
  const { toast } = useToast();
  const isLiked = isInWishlist(product.id);

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
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage?.url || '/placeholder.svg?height=400&width=400'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {discountPercent > 0 && (
            <Badge className="absolute right-2 top-2 bg-destructive text-destructive-foreground">
              -{discountPercent}%
            </Badge>
          )}
          {product.isPreOrder && (
            <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground">Pre-Order</Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-balance hover:text-primary">{product.name}</h3>
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>

        <div className="flex gap-2">
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
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </Button>
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="mt-2 text-xs text-destructive">Chỉ còn {product.stock} sản phẩm</p>
        )}
        {product.stock === 0 && <p className="mt-2 text-xs text-muted-foreground">Hết hàng</p>}
      </CardContent>
    </Card>
  );
}
