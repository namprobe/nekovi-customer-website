// src/app/products/page.tsx
'use client';

import { useCustomerProducts } from '@/src/features/product/hooks/use-customer-products';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { ProductCard } from '@/src/features/product/product-card';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import type { Product, Category } from '@/src/shared/types';
import { api } from '@/src/core/lib/api-client';
import ProductCardSkeleton from '@/src/features/product/product-card-skeleton';
import { AsyncSelect } from '@/src/shared/ui/selects/async-select';
import { useCategorySelectStore } from '@/src/entities/categories/services/category-select-service';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [category, setCategory] = useState('all'); // Lưu id hoặc 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sử dụng useCategorySelectStore để fetch categories
  const { fetchOptions: fetchCategories, options: categories, isLoading: categoriesLoading, error: categoriesError } =
    useCategorySelectStore();

  // Map category id to categoryId
  const categoryIdMap: Record<string, string> = {
    all: '',
    ...Object.fromEntries(categories.map((cat) => [cat.id, cat.id])), // Ánh xạ id -> id
  };

  const { data, loading, error } = useCustomerProducts({
    page: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearch,
    sortType: sortBy === 'newest' ? undefined : sortBy,
    categoryId: category === 'all' ? undefined : category, // Dùng trực tiếp category (id)
    priceRange: priceRange === 'all' ? undefined : priceRange,
  });

  // Transform ProductItem to Product
  const products: Product[] =
    data?.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || '',
      description: item.description || '',
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      categoryId: item.categoryId,
      category: item.category,
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
      tags: item.tags,
      rating: item.rating,
      reviewCount: item.reviewCount,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    })) || [];

  const totalPages = data?.totalPages ?? 1;

  // Preload categories khi trang được load
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories('');
    }
  }, [fetchCategories, categories]);

  return (
    <MainLayout>
      {/* Sakura Cosplay Festival Banner */}
      <div className="relative overflow-hidden">
        <Image
          src="/cuoc-thi-anh-banner.png"
          alt="Cuộc thi ảnh Sakura Cosplay Festival"
          width={1200}
          height={300}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Link href="/awards">
            <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full shadow-lg">
              Click ngay để tham gia CUỘC THI ẢNH SAKURA COSPLAY FESTIVAL
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Kết quả tìm kiếm cho từ khóa '{debouncedSearch || 'figure'}'</h1>
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
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            onClick={() => setSortBy('newest')}
            className="bg-transparent"
          >
            Sắp xếp theo
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
              return options.map((opt) => ({
                id: opt.id,
                label: opt.name,
              }));
            }}
            placeholder="Danh mục"
            disabled={categoriesLoading}
          />
          {categoriesError && <p className="text-sm text-red-600">{categoriesError}</p>}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentPage}/{totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && Array.from({ length: itemsPerPage }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {error && <p className="text-red-500">{error}</p>}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-transparent"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Trước
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? '' : 'bg-transparent'}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-transparent"
            >
              Sau
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}