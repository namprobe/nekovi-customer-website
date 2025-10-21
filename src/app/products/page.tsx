'use client';

import { useCustomerProducts } from '@/src/features/product/hooks/use-customer-products';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { ProductCard } from '@/src/features/product/product-card';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { AsyncSelect } from '@/src/shared/ui/selects/async-select';
import { useCategorySelectStore } from '@/src/entities/categories/services/category-select-service';
import type { Product } from '@/src/shared/types';
import ProductCardSkeleton from '@/src/features/product/product-card-skeleton';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [animeId, setAnimeId] = useState(searchParams.get('animeId') || '');
  const [animeTitle, setAnimeTitle] = useState(searchParams.get('animeTitle') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 12;

  const [inputPage, setInputPage] = useState<number | "">(currentPage);

  const { fetchOptions: fetchCategories, options: categories, isLoading: categoriesLoading, error: categoriesError } =
    useCategorySelectStore();

  // Đồng bộ khi currentPage thay đổi từ nút prev/next hoặc nút số trang
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (categories.length === 0) fetchCategories('');
  }, [categories, fetchCategories]);

  // Đồng bộ state lên URL
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
    data?.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-') || 'product-' + item.id,
      description: item.description || 'Không có mô tả',
      price: item.price,
      originalPrice: undefined,
      discount: undefined,
      categoryId: item.categoryId,
      category: item.category
        ? { id: item.category.id, name: item.category.name, slug: item.category.name.toLowerCase().replace(/\s+/g, '-'), description: item.category.description }
        : undefined,
      images: item.primaryImage ? [{ id: `${item.id}-primary`, productId: item.id, url: item.primaryImage, alt: item.name, isPrimary: true, order: 0 }] : [],
      stock: item.stockQuantity,
      isPreOrder: item.isPreOrder || false,
      tags: [],
      rating: 0,
      reviewCount: 0,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    })) || [];

  const totalPages = data?.totalPages ?? 1;

  return (
    <MainLayout>
      {/* Banner */}
      <div className="relative overflow-hidden mb-8">
        <Image src="/cuoc-thi-anh-banner.png" alt="Cuộc thi ảnh Sakura Cosplay Festival" width={1200} height={300} className="w-full h-auto object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Link href="/awards">
            <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full shadow-lg">
              Tham gia Cuộc thi Sakura Cosplay Festival
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">
            Kết quả tìm kiếm cho '{animeTitle || debouncedSearch || 'sản phẩm'}'
          </h1>
          <div className="relative">
            <Input type="text" placeholder="Tìm kiếm sản phẩm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 pl-10" />
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
            className="bg-transparent"
          >
            Sắp xếp lại
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-transparent"><SelectValue placeholder="Liên quan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="name-asc">Tên A-Z</SelectItem>
              <SelectItem value="name-desc">Tên Z-A</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[180px] bg-transparent"><SelectValue placeholder="Giá" /></SelectTrigger>
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

          {/* Input trang */}
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Trang</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => {
                let val = typeof inputPage === 'number' ? inputPage : NaN;
                if (!val || val < 1) val = 1;
                if (val > totalPages) val = totalPages;
                setCurrentPage(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  let val = typeof inputPage === 'number' ? inputPage : NaN;
                  if (!val || val < 1) val = 1;
                  if (val > totalPages) val = totalPages;
                  setCurrentPage(val);
                }
              }}
              className="w-12 text-center border rounded"
            />
            <span>/ {totalPages}</span>
            <Button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && Array.from({ length: itemsPerPage }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {error && <p className="text-red-500">{error}</p>}
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {/* Paging dưới */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Trang</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={() => {
              let val = typeof inputPage === 'number' ? inputPage : NaN;
              if (!val || val < 1) val = 1;
              if (val > totalPages) val = totalPages;
              setCurrentPage(val);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                let val = typeof inputPage === 'number' ? inputPage : NaN;
                if (!val || val < 1) val = 1;
                if (val > totalPages) val = totalPages;
                setCurrentPage(val);
              }
            }}
            className="w-12 text-center border rounded"
          />
          <span>/ {totalPages}</span>
          <Button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}