// src/app/products/page.tsx
'use client';

import { useCustomerProducts } from '@/src/features/product/hooks/use-customer-products';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { ProductCard } from '@/src/features/product/product-card';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { Search } from 'lucide-react';
import { Pagination } from '@/src/components/ui/pagination';
import { useDebounce } from 'use-debounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { AsyncSelect } from '@/src/shared/ui/selects/async-select';
import { useCategorySelectStore } from '@/src/entities/categories/services/category-select-service';

import type { Product } from '@/src/shared/types';
import ProductCardSkeleton from '@/src/features/product/product-card-skeleton';
import { useCartStore } from '@/src/entities/cart/service';
import { useToast } from '@/src/hooks/use-toast';

// THÊM IMPORT CHO BLOG CAROUSEL
import LatestBlogCategory from '@/src/features/blog-post/components/latestBlogCategory';
import { blogService } from '@/src/features/blog-post/services/blog.service';
import { BlogPostItem } from '@/src/features/blog-post/types/blog';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [animeId, setAnimeId] = useState(searchParams.get('animeId') || '');
  const [animeTitle, setAnimeTitle] = useState(searchParams.get('animeTitle') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 12;

  const { fetchOptions: fetchCategories, options: categories, isLoading: categoriesLoading, error: categoriesError } =
    useCategorySelectStore();

  // STATE CHO CÁC BÀI VIẾT NỔI BẬT
  const [latestPosts, setLatestPosts] = useState<BlogPostItem[]>([]);

  const handleAddToCart = async (product: Product) => {
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

  const handleAddToWishlist = (product: Product) => {
    toast({
      title: "Đã thêm vào yêu thích",
      description: `${product.name} đã được thêm vào danh sách yêu thích`,
    });
  };

  // FETCH CÁC BÀI VIẾT NỔI BẬT
  useEffect(() => {
    blogService
      .getLatestByCategory()
      .then(setLatestPosts)
      .catch((err) => {
        console.error('Lỗi khi tải bài viết nổi bật:', err);
      });
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories('');
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (priceRange !== 'all') params.set('price', priceRange);
    if (category !== 'all') params.set('cat', category);
    if (animeId) params.set('animeId', animeId);
    if (animeTitle) params.set('animeTitle', animeTitle);
    if (currentPage !== 1) params.set('page', String(currentPage));
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [searchQuery, sortBy, priceRange, category, animeId, animeTitle, currentPage, router]);

  const { data, loading, error } = useCustomerProducts({
    page: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearch,
    sortType: sortBy === 'newest' ? undefined : sortBy,
    categoryId: category === 'all' ? undefined : category,
    priceRange: priceRange === 'all' ? undefined : priceRange,
    animeId: animeId || undefined,
  });

  const products: Product[] =
    data?.items.map((item) => {
      // 1. Lấy giá trị giảm giá (nếu null/undefined thì là 0)
      const discountAmount = item.discountPrice || 0;

      // 2. Tính giá bán cuối cùng (Price - DiscountAmount)
      const finalPrice = item.price - discountAmount;

      return {
        id: item.id,
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, '-') || 'product-' + item.id,
        description: item.description || 'Không có mô tả',

        // 3. Price hiển thị (giá đã trừ tiền giảm)
        price: item.price, // Đây là Giá Gốc (100k)
        discountPrice: item.discountPrice, // Đây là số tiền giảm (40k)

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
          ? [{ id: `${item.id}-primary`, productId: item.id, url: item.primaryImage, alt: item.name, isPrimary: true, order: 0 }]
          : [],
        stock: item.stockQuantity,
        isPreOrder: item.isPreOrder || false,
        tags: [],
        rating: item.averageRating,
        reviewCount: item.reviewCount,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      };
    }) || [];

  const totalPages = data?.totalPages ?? 1;

  return (
    <MainLayout>

      {/* THAY BANNER CŨ BẰNG CAROUSEL BÀI VIẾT NỔI BẬT */}
      {latestPosts.length > 0 && <LatestBlogCategory posts={latestPosts} />}

      {/* PHẦN DANH SÁCH SẢN PHẨM */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {(animeTitle || debouncedSearch) && (
            <h1 className="mb-4 text-3xl font-bold">
              Kết quả tìm kiếm cho '{animeTitle || debouncedSearch}'
            </h1>
          )}
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
          <Button
            variant={sortBy === 'newest' && priceRange === 'all' && category === 'all' && !animeId ? 'default' : 'outline'}
            onClick={() => {
              setSortBy('newest');
              setPriceRange('all');
              setCategory('all');
              setAnimeId('');
              setAnimeTitle('');
              setCurrentPage(1);
            }}
          >
            Sắp xếp lại
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-transparent">
              <SelectValue placeholder="Liên quan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="name-asc">Tên A-Z</SelectItem>
              <SelectItem value="name-desc">Tên Z-A</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[180px] bg-transparent">
              <SelectValue placeholder="Giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="under-500k">Dưới 500k</SelectItem>
              <SelectItem value="500k-1m">500k - 1M</SelectItem>
              <SelectItem value="1m-2m">1M - 2M</SelectItem>
              <SelectItem value="over-2m">Trên 2M</SelectItem>
            </SelectContent>
          </Select>

          <AsyncSelect
            value={category}
            onChange={setCategory}
            fetchOptions={async (search: string) => {
              const options = await fetchCategories(search);
              return options.map((opt) => ({ id: opt.id, label: opt.name }));
            }}
            placeholder="Danh mục"
            disabled={categoriesLoading}
          />
          {categoriesError && <p className="text-sm text-red-600">{categoriesError}</p>}

          <div className="ml-auto">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading &&
            Array.from({ length: itemsPerPage }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {error && <p className="text-red-500">{error}</p>}
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-8" />
      </div>
    </MainLayout>
  );
}