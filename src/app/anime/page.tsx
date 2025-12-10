//src/app/anime/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Pagination } from '@/src/components/ui/pagination';
import { MainLayout } from '@/src/widgets/layout/main-layout';
import { AnimeCard } from '@/src/features/anime/components/animeCard';
import { useAnimeList } from '@/src/features/anime/hooks/useAnimeList';
import { useFeaturedAnime } from '@/src/features/anime/hooks/useFeaturedAnime';
import { AnimeSeriesFilter } from '@/src/entities/anime/type/anime';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function AnimePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---------- Đọc từ URL ----------
  const urlPage = searchParams.get('page') ? Math.max(1, Number(searchParams.get('page'))) : 1;
  const urlSearch = searchParams.get('q') ?? '';
  const urlSort = searchParams.get('sort') ?? 'all';

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState(urlSort);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [inputPage, setInputPage] = useState<number | ''>(urlPage);

  const { animeList, totalItems, isLoading, error, fetchAnime } = useAnimeList();
  const featuredAnime = useFeaturedAnime();

  const totalPages = Math.ceil(totalItems / 12);

  const latestFilter = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);


  // ----- Giữ input đồng bộ với currentPage -----
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // ----- Cập nhật URL (chỉ khi thực sự thay đổi) -----
  const prevUrlRef = useRef<string>('');

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    if (sortBy !== 'all') params.set('sort', sortBy);
    if (currentPage !== 1) params.set('page', String(currentPage));

    const newUrl = `${pathname}?${params.toString()}`;

    // Chỉ replace khi URL khác
    if (prevUrlRef.current !== newUrl) {
      prevUrlRef.current = newUrl;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, sortBy, currentPage, pathname, router]);

  // ----- Fetch dữ liệu khi filter thay đổi -----
  useEffect(() => {
    let sortField = 'createdAt';
    let asc = false;

    switch (sortBy) {
      case 'newest':
        sortField = 'releaseYear'; asc = false; break;
      case 'oldest':
        sortField = 'releaseYear'; asc = true; break;
      case 'title-asc':
        sortField = 'title'; asc = true; break;
      case 'title-desc':
        sortField = 'title'; asc = false; break;
      default:
        sortField = 'createdAt'; asc = false;
    }

    const filter: AnimeSeriesFilter = {
      page: currentPage,
      pageSize: 12,
      search: searchQuery,
      sortBy: sortField,
      isAscending: asc,
    };

    const fingerprint = JSON.stringify(filter);
    if (latestFilter.current === fingerprint) return; // <-- chặn loop
    latestFilter.current = fingerprint;

    fetchAnime(filter);
  }, [searchQuery, sortBy, currentPage, fetchAnime]);

  // ----- Scroll to top khi đổi trang -----
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">

        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">Khám Phá Thế Giới Anime</h1>
          <p className="text-lg text-muted-foreground">
            Tìm hiểu về các bộ anime nổi tiếng và sản phẩm cosplay liên quan
          </p>
        </div>

        {/* Featured */}
        {featuredAnime.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Anime Mới Nhất</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredAnime.map(anime => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Search & Sort */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm anime..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={e => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);               // reset page khi đổi sort
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title-asc">Tên (A-Z)</option>
                <option value="title-desc">Tên (Z-A)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Main Anime List */}
        {!isLoading && !error && animeList.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">
              Anime{searchQuery ? `: ${searchQuery}` : ''}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {animeList.map(anime => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>

            {/* Paging */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          </section>
        )}

        {/* Loading / Error / Empty */}
        {isLoading && <div className="py-12 text-center"><p>Đang tải danh sách anime...</p></div>}
        {error && <div className="py-12 text-center text-red-500"><p>{error}</p></div>}
        {!isLoading && !error && animeList.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Không tìm thấy anime nào</h3>
            <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}