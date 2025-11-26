// src/app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { Button } from '@/src/components/ui/button';
import { useCartStore } from '@/src/entities/cart/service';
import { useToast } from '@/src/hooks/use-toast';
import { formatCurrency } from '@/src/shared/utils/format';
import { ProductCard } from '@/src/features/product/product-card';
import { Badge } from '@/src/components/ui/badge';
import { Star, ArrowLeft } from 'lucide-react';
import { useProductDetail } from '@/src/features/product/hooks/use-product-detail';
import { Product } from '@/src/shared/types';
import { productService } from '@/src/entities/product/service/product-service';
import { productReviewService } from '@/src/entities/productReview/service/product-review-service';
import { ProductReviewItem } from '@/src/entities/productReview/type/product-review';
import { Pagination } from '@/src/components/ui/pagination';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  // === PRODUCT DETAIL ===
  const { data: product, loading, error } = useProductDetail(params.id as string);

  // === REVIEW STATES – Chỉ dùng 1 currentPage như trang danh sách ===
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // === IMAGE & CART STATES ===
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // === LOAD REVIEWS – Dùng API paging riêng ===
  const loadReviews = async (page: number = 1) => {
    if (!params.id) return;

    setIsLoadingReviews(true);
    try {
      const result = await productReviewService.getByProduct({
        productId: params.id as string,
        page,
        pageSize: 5,
        sortBy: "createdAt",
        isAscending: false,
      });

      setReviews(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể tải đánh giá",
        variant: "destructive",
      });
      setReviews([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Load lần đầu khi có product
  useEffect(() => {
    if (product) {
      loadReviews(1);
    }
  }, [product?.id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page); // ← Phải có dòng này trước
    loadReviews(page);

  };

  // === RELATED PRODUCTS ===
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const res = await productService.getProductList({
          categoryId: product.categoryId,
          pageSize: 6,
        });
        const filtered = res.items
          .filter(p => p.id !== product.id)
          .slice(0, 6)
          .map(item => ({
            id: item.id,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, '-') || `product-${item.id}`,
            description: item.description || 'Không có mô tả',
            price: item.price,
            originalPrice: undefined,
            discount: undefined,
            categoryId: item.categoryId,
            category: item.category ? {
              id: item.category.id,
              name: item.category.name,
              slug: item.category.name.toLowerCase().replace(/\s+/g, '-'),
              description: item.category.description,
            } : undefined,
            images: item.primaryImage ? [{
              id: `${item.id}-primary`,
              productId: item.id,
              url: item.primaryImage,
              alt: item.name,
              isPrimary: true,
              order: 0,
            }] : [],
            stock: item.stockQuantity,
            isPreOrder: item.isPreOrder || false,
            tags: [],
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
          }));
        setRelatedProducts(filtered);
      } catch { /* ignore */ }
    };

    fetchRelated();
  }, [product?.id, product?.categoryId]);

  // === EARLY RETURNS ===
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Đang tải sản phẩm...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
          <Button onClick={() => router.push('/products')} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  // === MAP PRODUCT – Đã fix hết lỗi TypeScript ===
  const mappedProduct: Product = {
    id: product.id,
    name: product.name,
    slug: product.name.toLowerCase().replace(/\s+/g, '-') || `product-${product.id}`,
    description: product.description || 'Không có mô tả',
    price: product.discountPrice
      ? product.price * (1 - product.discountPrice / 100)
      : product.price,
    originalPrice: product.discountPrice ? product.price : undefined,
    discount: product.discountPrice ?? undefined,
    categoryId: product.categoryId,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.name.toLowerCase().replace(/\s+/g, '-'),
      description: product.category.description,
    } : undefined,

    images: Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(img => ({
        id: img.id,
        productId: img.productId,
        url: img.imagePath,
        alt: img.imagePath.split('/').pop() || product.name,
        isPrimary: img.isPrimary,
        order: img.displayOrder,
      }))
      : product.primaryImage
        ? [{
          id: `${product.id}-primary`,
          productId: product.id,
          url: product.primaryImage,
          alt: product.name,
          isPrimary: true,
          order: 0,
        }]
        : [],

    stock: product.stockQuantity,
    isPreOrder: product.isPreOrder || false,
    tags: product.productTags?.map(pt => pt.tag.name) || [],
    rating: product.averageRating ?? 0,
    reviewCount: totalCount, // Dùng từ API paging → chính xác nhất
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
  };

  const images = mappedProduct.images;

  const handleAddToCart = async () => {
    const result = await addToCart({ productId: mappedProduct.id, quantity });
    if (result.success) {
      toast({ title: "Thành công", description: `${mappedProduct.name} x${quantity} đã thêm vào giỏ hàng` });
    } else {
      toast({ title: "Lỗi", description: result.error || "Không thể thêm vào giỏ", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>

        {/* Product Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
              <img
                src={images[selectedImage]?.url || '/placeholder.svg'}
                alt={images[selectedImage]?.alt || mappedProduct.name}
                className="w-full h-full object-cover"
              />
              {mappedProduct.discount ? (
                <Badge className="absolute right-4 top-4 bg-red-500 text-lg">
                  -{mappedProduct.discount}%
                </Badge>
              ) : null}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{mappedProduct.name}</h1>
              <p className="mt-2 text-muted-foreground">{mappedProduct.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(mappedProduct.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({totalCount} đánh giá)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(mappedProduct.price)}</span>
              {mappedProduct.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(mappedProduct.originalPrice)}
                </span>
              )}
            </div>

            {/* Quantity & Stock */}
            <div className="space-y-4 rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(mappedProduct.stock, q + 1))} disabled={quantity >= mappedProduct.stock}>+</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tình trạng:</span>
                <Badge variant={mappedProduct.stock > 0 ? "default" : "destructive"}>
                  {mappedProduct.stock > 0 ? `Còn ${mappedProduct.stock} sản phẩm` : 'Hết hàng'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddToCart} disabled={mappedProduct.stock === 0} size="lg" className="flex-1">
                Thêm vào giỏ hàng
              </Button>
              <Button onClick={() => { handleAddToCart(); router.push('/cart'); }} disabled={mappedProduct.stock === 0} variant="outline" size="lg" className="flex-1">
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section – Phân trang chuẩn như trang danh sách */}
        <section id="reviews-section" className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold">Đánh giá sản phẩm ({totalCount})</h2>

          {isLoadingReviews ? (
            <p className="text-center py-8 text-muted-foreground">Đang tải đánh giá...</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((r) => {
                const date = new Date(r.createdAt);
                return (
                  <div key={r.id} className="border-b pb-8 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold text-primary">{r.userName || 'Ẩn danh'}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < (r.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {date.toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {r.title && <h3 className="mt-2 font-medium">{r.title}</h3>}
                    {r.comment && <p className="mt-1 text-foreground">"{r.comment}"</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange} // ← vẫn dùng handlePageChange
              />
            </div>
          )}
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}