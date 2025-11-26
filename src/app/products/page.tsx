//src/app/products/page.tsx
'use client';

import { useCustomerProducts } from '@/src/features/product/hooks/use-customer-products';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { ProductCard } from '@/src/features/product/product-card';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Pagination } from '@/src/components/ui/pagination';
import { useDebounce } from 'use-debounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { AsyncSelect } from '@/src/shared/ui/selects/async-select';
import { useCategorySelectStore } from '@/src/entities/categories/services/category-select-service';
import { categoryService } from '@/src/entities/categories/services/category.service';

import type { Product } from '@/src/shared/types';
import ProductCardSkeleton from '@/src/features/product/product-card-skeleton';
import { useCartStore } from '@/src/entities/cart/service';
import { useWishlistStore } from '@/src/entities/wishlist/service';
import { useToast } from '@/src/hooks/use-toast';
import { useAuth } from '@/src/core/providers/auth-provider';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCartStore();
  const wishlistStore = useWishlistStore();
  const { addToWishlist, isInWishlist, fetchWishlist } = wishlistStore;
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  console.log('🔴 [Products Page] wishlistStore:', wishlistStore);
  console.log('🔴 [Products Page] wishlistStore keys:', Object.keys(wishlistStore));
  console.log('🔴 [Products Page] addToWishlist function:', addToWishlist);
  console.log('🔴 [Products Page] addToWishlist type:', typeof addToWishlist);

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
  // categoryService.getCategorySelectList();

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

  const handleAddToWishlist = useCallback(async (product: Product) => {
    try {
      console.log('🟡🟡🟡 [PRODUCTS PAGE handleAddToWishlist] Called with product:', product.id, product.name)
      console.log('🟡 [handleAddToWishlist] wishlistStore object:', wishlistStore)
      console.log('🟡 [handleAddToWishlist] wishlistStore.addToWishlist:', wishlistStore.addToWishlist)
      console.log('🟡 [handleAddToWishlist] Calling addToWishlist from store...')
      
      // Call directly from store object instead of destructured function
      const result = await wishlistStore.addToWishlist({ productId: product.id });
      
      console.log('🟡 [handleAddToWishlist] Result from addToWishlist:', result)
      
      if (result.success) {
        const isLiked = wishlistStore.isInWishlist(product.id);
        toast({
          title: isLiked ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
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
      console.error('🔴 [handleAddToWishlist] Error:', error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật wishlist",
        variant: "destructive",
      });
    }
  }, [wishlistStore, toast]);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories('');
    }
  }, []);

  // Fetch wishlist when component mounts (if user is authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🟣 [Products Page] Fetching wishlist on mount');
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

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
      rating: item.averageRating,
      reviewCount: item.reviewCount,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    })) || [];

  const totalPages = data?.totalPages ?? 1;

  return (
    <MainLayout>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {(animeTitle || debouncedSearch) && (
            <h1 className="mb-4 text-3xl font-bold">
              Kết quả tìm kiếm cho '{animeTitle || debouncedSearch}'
            </h1>
          )}
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

          <div className="ml-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && Array.from({ length: itemsPerPage }).map((_, i) => <ProductCardSkeleton key={i} />)}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      </div>
    </MainLayout>
  );
}