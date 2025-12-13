// src/widgets/home/featured-products.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/src/features/product/product-card";
import { productService } from "@/src/entities/product/service/product-service";
import { Button } from "@/src/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { ProductItem } from "@/src/entities/product/type/product";
import { useCartStore } from "@/src/entities/cart/service";
import { useToast } from "@/src/hooks/use-toast";

interface FeaturedProductsSectionProps {
  title: string;
  /** true = lấy mới nhất, false = lấy ngẫu nhiên */
  isNewest?: boolean;
  limit?: number;
  showViewAll?: boolean;
}

export function FeaturedProductsSection({
  title,
  isNewest = true,
  limit = 20,
  showViewAll = false,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = {
          page: 1,
          pageSize: limit * 5,
          sortType: isNewest ? "newest" : undefined,
        };

        const res = await productService.getProductList(query);
        let list = res.items;

        if (!isNewest) {
          list = [...list].sort(() => Math.random() - 0.5);
        }

        setProducts(list.slice(0, limit));
      } catch (err) {
        console.error(err);
        toast({
          title: "Lỗi",
          description: "Không tải được danh sách sản phẩm",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isNewest, limit, toast]);

  const handleAddToCart = async (product: ProductItem) => {
    const result = await addToCart({ productId: product.id, quantity: 1 });
    if (result.success) {
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${product.name} đã được thêm vào giỏ hàng`,
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      });
    }
  };

  // CHỈ MAP NHỮNG TRƯỜNG CẦN THIẾT → ĐỂ PRODUCTCARD TỰ TÍNH GIÁ
  const mapToProductCard = (item: ProductItem) => {
    const primaryImageUrl = item.primaryImage || item.images?.[0]?.imagePath;

    return {
      id: item.id,
      name: item.name,
      slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
      description: item.description || "",

      // TRUYỀN ĐÚNG THEO LOGIC MỚI CỦA PRODUCTCARD
      price: item.price, // giá gốc
      discountPrice: item.discountPrice ?? null, // giá đã giảm cố định (nếu có)
      eventDiscountPercentage: item.eventDiscountPercentage ?? 0, // % giảm thêm từ event

      categoryId: item.categoryId,
      category: item.category
        ? {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.name.toLowerCase().replace(/\s+/g, "-"),
        }
        : undefined,

      images: primaryImageUrl
        ? [
          {
            id: `${item.id}-primary`,
            productId: item.id,
            url: primaryImageUrl,
            isPrimary: true,
            order: 0,
          },
        ]
        : [],

      stock: item.stockQuantity,
      isPreOrder: item.isPreOrder || false,
      rating: item.averageRating || 0,
      reviewCount: item.reviewCount || 0,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : "",
    };
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold">{title}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: Math.min(limit, 10) }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-balance">{title}</h2>
          {showViewAll && (
            <Link href="/products?sort=newest">
              <Button variant="ghost" className="group">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((item) => {
            const productForCard = mapToProductCard(item);

            return (
              <ProductCard
                key={item.id}
                product={productForCard}
                onAddToCart={() => handleAddToCart(item)}
              // onAddToWishlist vẫn để tạm, hoặc bạn có thể dùng store trực tiếp trong ProductCard
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}