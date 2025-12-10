// src/app/blog/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/src/widgets/layout/main-layout";
import { Badge } from "@/src/components/ui/badge";
import { Calendar, User, Tag, ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { blogService } from "@/src/features/blog-post/services/blog.service";
import { BlogPostDetail } from "@/src/features/blog-post/types/blog";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/features/product/product-card";
import type { Product } from "@/src/shared/types";
import { productService } from "@/src/entities/product/service/product-service";
import { useCartStore } from "@/src/entities/cart/service";
import { useToast } from "@/src/hooks/use-toast";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const latestScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  const handleAddToCart = async (product: Product) => {
    const result = await addToCart({ productId: product.id, quantity: 1 });
    if (result.success) {
      toast({ title: "Thành công", description: `Đã thêm ${product.name} vào giỏ hàng` });
    } else {
      toast({ title: "Lỗi", description: result.error || "Không thể thêm vào giỏ", variant: "destructive" });
    }
  };

  // Load bài viết
  useEffect(() => {
    if (!id) return;

    blogService
      .getById(id as string)
      .then((data) => {
        if (!data) notFound();
        setPost(data);
        document.title = `${data?.title || "Bài viết"} - NekoVi Blog`;
      })
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [id]);

  // Map sản phẩm liên quan từ bài viết (post.products)
  useEffect(() => {
    if (!post?.products || post.products.length === 0) return;

    // === SỬA LOGIC MAP TẠI ĐÂY ===
    const mapped: Product[] = post.products.map((p: any): Product => ({
      id: p.id,
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/\s+/g, "-"),
      description: p.description || "",

      // Truyền dữ liệu thô để ProductCard tự tính toán
      price: p.price, // Giá gốc
      discountPrice: p.discountPrice, // Giá giảm cố định (nếu có)
      eventDiscountPercentage: p.eventDiscountPercentage, // % giảm sự kiện (nếu có)

      images: p.primaryImage
        ? [{ id: `${p.id}-1`, productId: p.id, url: p.primaryImage, alt: p.name, isPrimary: true, order: 0 }]
        : [],
      stock: p.stockQuantity || 0,
      rating: p.averageRating || 0,
      reviewCount: p.reviewCount || 0,
      isPreOrder: p.isPreOrder || false,
      tags: [],
      category: p.category || undefined,
      categoryId: p.categoryId || "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    }));

    setRelatedProducts(mapped);
  }, [post]);

  // Load 5 sản phẩm mới nhất
  useEffect(() => {
    const loadLatest = async () => {
      try {
        setLoadingLatest(true);
        const result = await productService.getProductList({
          page: 1,
          pageSize: 10,
          sortType: "newest",
        });

        // === SỬA LOGIC MAP TẠI ĐÂY ===
        const mapped: Product[] = (result.items || []).slice(0, 5).map((item): Product => ({
          id: item.id,
          name: item.name,
          slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
          description: item.description || "",

          // Truyền dữ liệu thô
          price: item.price,
          discountPrice: item.discountPrice,
          eventDiscountPercentage: item.eventDiscountPercentage,

          images: item.primaryImage
            ? [{ id: `${item.id}-primary`, productId: item.id, url: item.primaryImage, alt: item.name, isPrimary: true, order: 0 }]
            : [],
          stock: item.stockQuantity || 0,
          rating: item.averageRating || 0,
          reviewCount: item.reviewCount || 0,
          isPreOrder: item.isPreOrder || false,
          tags: [],
          category: item.category || undefined,
          categoryId: item.categoryId || "",
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        }));

        setLatestProducts(mapped);
      } catch (err) {
        console.error("Lỗi load sản phẩm mới:", err);
      } finally {
        setLoadingLatest(false);
      }
    };

    loadLatest();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Đang tải bài viết...</p>
        </div>
      </MainLayout>
    );
  }

  if (!post) notFound();

  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="relative h-96 w-full overflow-hidden bg-muted">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
            <span className="text-5xl font-bold text-muted-foreground">NekoVi Blog</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-6xl">
            {post.postCategory && (
              <Badge className="mb-3 text-sm" variant="secondary">{post.postCategory.name}</Badge>
            )}
            <h1 className="mb-4 text-3xl md:text-5xl font-bold leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm opacity-90">
              {post.authorName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.authorName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishDate}>
                  {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                </time>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-10 inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách
          </button>

          <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
            <div dangerouslySetInnerHTML={{ __html: post.content }} className="leading-relaxed text-foreground" />
          </article>

          {post.postTags?.length > 0 && (
            <div className="mb-12">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.postTags.flatMap((pt: any) => pt.tags?.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="text-sm">{tag.name}</Badge>
                )) || [])}
              </div>
            </div>
          )}

          <hr className="my-16 border-t border-muted" />

          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="mb-8 text-3xl font-bold">Sản phẩm liên quan</h2>
              <div className="relative">
                <button onClick={() => scrollLeft(relatedScrollRef)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all hover:scale-110">
                  <ChevronLeft className="h-8 w-8 text-gray-800" />
                </button>
                <button onClick={() => scrollRight(relatedScrollRef)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all hover:scale-110">
                  <ChevronRight className="h-8 w-8 text-gray-800" />
                </button>

                <div ref={relatedScrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pl-16 pr-16 py-4">
                  {relatedProducts.map((product) => (
                    <div key={product.id} className="flex-none w-80 snap-start">
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Các sản phẩm mới nhất</h2>
              <Link href="/products" className="inline-flex items-center gap-2 text-primary font-medium hover:text-pink-600 transition-colors">
                Xem tất cả sản phẩm
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {loadingLatest ? (
              <div className="flex gap-6 overflow-x-auto pl-16 pr-16">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex-none w-80">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="relative">
                <button onClick={() => scrollLeft(latestScrollRef)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all hover:scale-110">
                  <ChevronLeft className="h-8 w-8 text-gray-800" />
                </button>
                <button onClick={() => scrollRight(latestScrollRef)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all hover:scale-110">
                  <ChevronRight className="h-8 w-8 text-gray-800" />
                </button>

                <div ref={latestScrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pl-16 pr-16 py-4">
                  {latestProducts.map((product) => (
                    <div key={product.id} className="flex-none w-80 snap-start">
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Chưa có sản phẩm mới nào.</p>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}