// src/app/blog/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/src/widgets/layout/main-layout";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Calendar, User, Tag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { blogService } from "@/src/features/blog-post/services/blog.service";
import { BlogPostDetail } from "@/src/features/blog-post/types/blog";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/features/product/product-card";
import type { Product } from "@/src/shared/types";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hàm cuộn mượt
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  useEffect(() => {
    if (!id) return;

    blogService
      .getById(id as string)
      .then((data) => {
        if (!data) notFound();
        setPost(data);

        // SEO
        document.title = `${data?.title || "Bài viết"} - NekoVi Blog`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && data?.content) {
          const plainText = data.content.replace(/<[^>]*>/g, "").slice(0, 160);
          metaDesc.setAttribute("content", plainText);
        }
        if (data?.featuredImage) {
          let ogImage = document.querySelector('meta[property="og:image"]');
          if (!ogImage) {
            ogImage = document.createElement("meta");
            ogImage.setAttribute("property", "og:image");
            document.head.appendChild(ogImage);
          }
          ogImage.setAttribute("content", data.featuredImage);
        }
      })
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [id]);

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

  // Map sản phẩm từ backend → format Product để ProductCard dùng được
  const relatedProducts: Product[] = (post.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    discount: p.discount || undefined,
    images: p.primaryImage
      ? [{ id: "1", productId: p.id, url: p.primaryImage, alt: p.name, isPrimary: true, order: 0 }]
      : [],
    stock: p.stockQuantity || 0,
    rating: p.averageRating || 0,
    reviewCount: p.reviewCount || 0,
    isPreOrder: p.isPreOrder || false,
    tags: [],
    description: "",
    category: undefined,
    categoryId: "",
    slug: "",
    createdAt: "",
  }));

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

      {/* Nội dung chính */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-10 inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách
          </button>


          <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
            <div dangerouslySetInnerHTML={{ __html: post.content }} className="leading-relaxed text-foreground" />
          </article>

          {/* Tags */}
          {post.postTags.length > 0 && (
            <div className="mb-12">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.postTags.flatMap((pt: any) => pt.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="text-sm">{tag.name}</Badge>
                )))}
              </div>
            </div>
          )}

          <hr className="my-16 border-t border-muted" />

          {relatedProducts.length > 0 ? (
            <section className="mt-20">
              <h2 className="mb-8 text-3xl font-bold">Sản phẩm liên quan</h2>

              <div className="relative">
                <button
                  onClick={scrollLeft}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all hover:scale-110 hover:bg-white hover:shadow-3xl"
                  aria-label="Cuộn trái"
                >
                  <ChevronLeft className="h-8 w-8 text-gray-800" />
                </button>

                <button
                  onClick={scrollRight}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-all hover:scale-110 hover:bg-white hover:shadow-3xl"
                  aria-label="Cuộn phải"
                >
                  <ChevronRight className="h-8 w-8 text-gray-800" />
                </button>

                <div
                  ref={scrollRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pl-16 pr-16" // thêm padding để không bị che
                >
                  {relatedProducts.map((product) => (
                    <div key={product.id} className="flex-none w-80 snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <p className="py-8 text-center text-muted-foreground">Chưa có sản phẩm liên quan nào.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}