// src/app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { Button } from '@/src/components/ui/button';
import { useCart } from '@/src/core/providers/cart-provider';
import { useToast } from '@/src/hooks/use-toast';
import { formatCurrency } from '@/src/shared/utils/format';
import { ProductCard } from '@/src/features/product/product-card';
import { Badge } from '@/src/components/ui/badge';
import { Star } from 'lucide-react';
import { useProductDetail } from '@/src/features/product/hooks/use-product-detail';
import { Product } from '@/src/shared/types';
import { productService } from '@/src/entities/product/service/product-service';
import { ArrowLeft } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';

import { ProductReviewForm } from '@/src/features/productReview/ProductReviewForm';
import { useAuth } from '@/src/core/providers/auth-provider';
import { productReviewService } from '@/src/entities/productReview/service/product-review-service';
import { ProductReviewItem } from '@/src/entities/productReview/type/product-review';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  // === AUTH & REVIEWS STATE ===
  const { user } = useAuth(); // Lấy user từ context
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [userReview, setUserReview] = useState<ProductReviewItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // ---------------- Handlers ----------------
  const handleBack = () => {
    // Nếu có query, giữ nguyên, nếu không thì về trang /products
    router.push(`/products${queryString ? '?' + queryString : ''}`);
  };


  // ---------------- Hooks ----------------
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { data: product, loading, error } = useProductDetail(params.id as string);


  // === LOAD REVIEWS KHI product CÓ DỮ LIỆU ===
  useEffect(() => {
    if (!product?.reviews) return;

    // Map từ ProductReview (backend) → ProductReviewItem (frontend)
    const mappedReviews: ProductReviewItem[] = product.reviews.map((r) => ({
      id: r.id,
      productId: product.id,
      userId: r.userId || '', // backend phải trả userId
      userName: r.userName,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    setReviews(mappedReviews);

    // Tìm đánh giá của user hiện tại
    if (user) {
      const myReview = mappedReviews.find((r) => r.userId === user.id);
      setUserReview(myReview || null);
    }
  }, [product, user]);

  // === REFRESH REVIEWS SAU KHI GỬI ===
  const handleReviewSuccess = async () => {
    try {
      const updatedReviews = await productReviewService.getByProduct(params.id as string);
      setReviews(updatedReviews);
      const myNewReview = updatedReviews.find((r) => r.userId === user?.id);
      setUserReview(myNewReview || null);
      setIsEditing(false);
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lại đánh giá',
        variant: 'destructive',
      });
    }
  };


  // ---------------- Fetch Related Products ----------------
  useEffect(() => {
    if (!product) return;

    const fetchRelatedProducts = async (): Promise<Product[]> => {
      try {
        const response = await productService.getProductList({
          categoryId: product.categoryId,
          pageSize: 6,
        });
        return response.items
          .filter((p) => p.id !== product.id)
          .map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, '-') || 'product-' + item.id,
            description: item.description || 'Không có mô tả',
            price: item.price,
            originalPrice: undefined,
            discount: undefined,
            categoryId: item.categoryId,
            category: item.category
              ? {
                id: item.category.id,
                name: item.category.name,
                slug: item.category.name.toLowerCase().replace(/\s+/g, '-'),
                description: item.category.description,
              }
              : undefined,
            images: item.primaryImage
              ? [
                {
                  id: `${item.id}-primary`,
                  productId: item.id,
                  url: item.primaryImage,
                  alt: item.name,
                  isPrimary: true,
                  order: 0,
                },
              ]
              : [],
            stock: item.stockQuantity,
            isPreOrder: item.isPreOrder || false,
            tags: [],
            rating: 0,
            reviewCount: 0,
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          }));
      } catch {
        return [];
      }
    };

    fetchRelatedProducts().then(setRelatedProducts);
  }, [product?.id, product?.categoryId]);

  // ---------------- Early Returns ----------------
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
          <Button onClick={handleBack} variant="outline" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  // ---------------- Map Product ----------------
  const mappedProduct: Product = {
    id: product.id,
    name: product.name,
    slug: product.name.toLowerCase().replace(/\s+/g, '-') || 'product-' + product.id,
    description: product.description || 'Không có mô tả',
    price: product.discountPrice
      ? product.price - product.price * (product.discountPrice / 100)
      : product.price,
    originalPrice: product.discountPrice ? product.price : undefined,
    discount: product.discountPrice, // chính là % giảm
    categoryId: product.categoryId,
    category: product.category
      ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.name.toLowerCase().replace(/\s+/g, '-'),
        description: product.category.description,
      }
      : undefined,
    images: product.images?.length
      ? product.images.map((img) => ({
        id: img.id,
        productId: img.productId,
        url: img.imagePath,
        alt: img.imagePath.split('/').pop() || product.name,
        isPrimary: img.isPrimary,
        order: img.displayOrder,
      }))
      : product.primaryImage
        ? [
          {
            id: `${product.id}-primary`,
            productId: product.id,
            url: product.primaryImage,
            alt: product.name,
            isPrimary: true,
            order: 0,
          },
        ]
        : [],
    stock: product.stockQuantity,
    isPreOrder: product.isPreOrder || false,
    tags: product.productTags?.map((pt) => pt.tag.name) || [],
    rating: product.averageRating || 0,
    reviewCount: product.reviews?.length || 0,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
  };

  const images = mappedProduct.images;






  // ---------------- Handlers ----------------
  const handleAddToCart = () => {
    addToCart(mappedProduct, quantity);
    toast({
      title: 'Đã thêm vào giỏ hàng',
      description: `${mappedProduct.name} x${quantity}`,
    });
  };

  // ---------------- Render ----------------
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Nút quay lại */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        {/* Product Detail */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
              <img
                src={images[selectedImage]?.url || '/placeholder.svg'}
                alt={images[selectedImage]?.alt || mappedProduct.name}
                className="w-full h-full object-cover"
              />

              {mappedProduct.discount && (
                <Badge className="absolute right-4 top-4 bg-red-500 text-lg">-{mappedProduct.discount}%</Badge>
              )}
              {mappedProduct.isPreOrder && (
                <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">Pre-Order</Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                >
                  <img src={img.url} alt={img.alt || mappedProduct.name} className="w-full h-full object-cover" />

                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{mappedProduct.name}</h1>
              <p className="mt-2 text-muted-foreground">{mappedProduct.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(mappedProduct.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({mappedProduct.reviewCount} đánh giá)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(mappedProduct.price)}</span>
              {mappedProduct.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(mappedProduct.originalPrice)}
                </span>
              )}
            </div>

            <div className="space-y-4 rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="bg-transparent"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(mappedProduct.stock, q + 1))}
                    className="bg-transparent"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Tình trạng:</span>
                <Badge variant={mappedProduct.stock > 0 ? 'default' : 'destructive'}>
                  {mappedProduct.stock > 0 ? `Còn ${mappedProduct.stock} sản phẩm` : 'Hết hàng'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddToCart} disabled={mappedProduct.stock === 0} className="flex-1" size="lg">
                Thêm vào giỏ hàng
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart();
                  router.push('/cart');
                }}
                disabled={mappedProduct.stock === 0}
                variant="outline"
                className="flex-1 bg-transparent"
                size="lg"
              >
                Mua ngay
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border bg-card p-6">
              <h3 className="font-semibold">Thông tin sản phẩm</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Danh mục:</span>
                  <span className="font-medium capitalize">{mappedProduct.category?.name || 'Không có'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anime Series:</span>
                  <span className="font-medium">{product.animeSeries?.title || 'Không có'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tags:</span>
                  <span className="font-medium">{mappedProduct.tags?.join(', ') || 'Không có'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Đánh giá sản phẩm</h2>
            {user && !userReview && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Viết đánh giá
              </Button>
            )}
          </div>

          {/* Form tạo/sửa */}
          {isEditing && (
            <ProductReviewForm
              productId={params.id as string}
              existingReview={userReview || undefined}
              onSuccess={() => {
                handleReviewSuccess();
                setIsEditing(false);
              }}
            />
          )}

          {/* Đánh giá của user */}
          {userReview && !isEditing && (
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">Đánh giá của bạn</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < userReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Sửa
                </Button>
              </div>
              {userReview.title && <h3 className="font-medium">{userReview.title}</h3>}
              {userReview.comment && <p className="mt-1 text-sm text-foreground">"{userReview.comment}"</p>}
            </div>
          )}

          {/* Danh sách đánh giá khác */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews
                .filter((r) => r.userId !== user?.id)
                .map((r) => {
                  const date = new Date(r.createdAt);
                  const monthYear = `(${date.getMonth() + 1}/${date.getFullYear()})`;

                  return (
                    <div key={r.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-base text-primary">
                          {r.userName ?? 'Ẩn danh'}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-xs">{monthYear}</span>
                      </div>
                      {r.title && <h3 className="mt-1 font-medium text-sm">{r.title}</h3>}
                      {r.comment && <p className="mt-1 text-sm text-foreground">"{r.comment}"</p>}
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>
          )}
        </section>



        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Sản Phẩm Tương Tự</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
