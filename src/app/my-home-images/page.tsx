// src/app/my-home-images/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import { homeImageService } from "@/src/entities/home-image/services/home-image.service";
import { userHomeImageService } from "@/src/entities/user-home-image/services/user-home-image.service";
import type { HomeImageItem } from "@/src/entities/home-image/types/home-image";
import type { UserHomeImageItem, UserHomeImageSaveRequest } from "@/src/entities/user-home-image/types/user-home-image";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { AsyncSelect } from "@/src/shared/ui/selects/async-select";
import { Pagination } from "@/src/components/ui/pagination";
import { toast } from "sonner";
import { Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { MainLayout } from "@/src/widgets/layout/main-layout";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/src/shared/ui/inputs/SearchInput";
import { animeSeriesSelectService } from "@/src/entities/anime/service/anime-series-select.service";

const MAX_SELECTION = 3;
const PAGE_SIZE = 24;

export default function MyHomeImagesPage() {
    const router = useRouter();

    // Filters
    const [searchName, setSearchName] = useState("");
    const [selectedAnimeId, setSelectedAnimeId] = useState<string>("all");
    const [filterSearch, setFilterSearch] = useState("");
    const [filterAnimeId, setFilterAnimeId] = useState<string | undefined>(undefined);

    // Pagination & Data
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [allImages, setAllImages] = useState<HomeImageItem[]>([]);

    // Selection
    const [mySelections, setMySelections] = useState<UserHomeImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<{ focus: () => void }>(null);

    // Fetch images
    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const res = await homeImageService.getList({
                    page: currentPage,
                    pageSize: PAGE_SIZE,
                    search: filterSearch || undefined,
                    animeSeriesId: filterAnimeId,
                    sortBy: "createdAt",
                    isAscending: false,
                });

                setAllImages(res.items);
                setTotalItems(res.totalCount);
                setTotalPages(res.totalPages);
            } catch (err) {
                toast.error("Không thể tải danh sách ảnh");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [currentPage, filterSearch, filterAnimeId]);

    // Reset page khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [filterSearch, filterAnimeId]);

    // Load user selections
    useEffect(() => {
        const fetchMySelections = async () => {
            try {
                const res = await userHomeImageService.getMyList();
                const sorted = res.sort((a, b) => a.position - b.position);
                setMySelections(sorted);
            } catch {
                toast.error("Không thể tải ảnh đã chọn");
            }
        };
        fetchMySelections();
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            if (animeTimeoutRef.current) clearTimeout(animeTimeoutRef.current);
        };
    }, []);

    // Debounced handlers
    const handleSearchNameChange = (value: string) => {
        setSearchName(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setFilterSearch(value.trim());
        }, 400);
    };

    const handleAnimeChange = (value: string) => {
        setSelectedAnimeId(value);
        if (animeTimeoutRef.current) clearTimeout(animeTimeoutRef.current);
        animeTimeoutRef.current = setTimeout(() => {
            setFilterAnimeId(value === "all" ? undefined : value);
        }, 300);
    };

    const selectedMap = useMemo(() => {
        const map = new Map<string, number>();
        mySelections.forEach((item) => map.set(item.homeImage.id, item.position));
        return map;
    }, [mySelections]);

    const selectedCount = mySelections.length;

    const toggleSelection = (image: HomeImageItem) => {
        const pos = selectedMap.get(image.id);
        if (pos) {
            setMySelections((prev) =>
                prev.filter((i) => i.homeImage.id !== image.id).map((i, idx) => ({ ...i, position: idx + 1 }))
            );
        } else if (selectedCount < MAX_SELECTION) {
            setMySelections((prev) => [
                ...prev,
                { id: "", userId: "", position: prev.length + 1, homeImage: image },
            ]);
        } else {
            toast.warning("Chỉ được chọn tối đa 3 ảnh");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: UserHomeImageSaveRequest[] = mySelections.map((item) => ({
                id: item.id || undefined,
                position: item.position,
                homeImageId: item.homeImage.id,
            }));

            const success = await userHomeImageService.saveAll(payload);
            if (success) {
                toast.success("Lưu thành công! Đang về trang chủ...");
                setTimeout(() => router.push("/"));
            } else {
                toast.error("Lưu thất bại");
            }
        } catch {
            toast.error("Lỗi khi lưu");
        } finally {
            setSaving(false);
        }
    };

    const handleResetToDefault = async () => {
        if (!confirm("Bạn có chắc muốn đặt lại về ảnh mặc định của hệ thống không?")) return;

        setIsResetting(true);
        try {
            const success = await userHomeImageService.saveAll([]);
            if (success) {
                toast.success("Đã đặt lại về mặc định!");
                setMySelections([]);
                setTimeout(() => router.push("/"));
            } else {
                toast.error("Không thể đặt lại");
            }
        } catch {
            toast.error("Lỗi khi đặt lại");
        } finally {
            setIsResetting(false);
        }
    };

    const breakpointColumns = { default: 5, 1536: 4, 1280: 4, 1024: 3, 768: 2, 640: 1 };
    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="mb-2 text-4xl font-bold">Chọn Ảnh Trang Chủ Của Bạn</h1>
                    <p className="text-muted-foreground">
                        Chọn tối đa <strong>{MAX_SELECTION}</strong> ảnh đẹp nhất để hiển thị trên trang chủ
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end">
                        <div className="flex-1 max-w-md">
                            <Label className="mb-2 block">Tìm theo tên ảnh</Label>
                            <SearchInput
                                ref={searchInputRef}
                                value={searchName}
                                onChange={handleSearchNameChange}
                                placeholder="Nhập tên ảnh để tìm..."
                                onClear={() => {
                                    setSearchName("");
                                    setFilterSearch("");
                                }}
                            />
                        </div>

                        <div className="w-full md:w-80">
                            <Label className="mb-2 block">Lọc theo Anime</Label>
                            <AsyncSelect
                                value={selectedAnimeId}
                                onChange={handleAnimeChange}
                                fetchOptions={async (search) => {
                                    try {
                                        const result = await animeSeriesSelectService.getOptions(search?.trim() || undefined);
                                        return result;
                                    } catch (err) {
                                        console.error("Lỗi tải anime series:", err);
                                        return [];
                                    }
                                }}
                                placeholder="Chọn Anime Series..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleResetToDefault}
                            disabled={saving || isResetting || selectedCount === 0}
                            className="min-w-44"
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang đặt lại...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    Đặt lại mặc định
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={saving || isResetting || selectedCount === 0}
                            size="lg"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Lưu & Về Trang Chủ
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Đếm lượt chọn + Tổng ảnh */}
                <div className="mb-8 flex flex-col items-center gap-3 text-center text-lg sm:flex-row sm:justify-center">
                    <div>
                        Đã chọn: <strong className="text-primary">{selectedCount} / {MAX_SELECTION}</strong>
                    </div>
                    <div className="text-muted-foreground">
                        Tổng: <strong>{totalItems}</strong> ảnh
                    </div>
                </div>

                {/* Preview */}
                <div className="mb-16">
                    <h2 className="mb-6 text-center text-2xl font-semibold">Preview thứ tự hiển thị</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[1, 2, 3].map((pos) => {
                            const item = mySelections.find((i) => i.position === pos);
                            return (
                                <div key={pos} className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl ring-4 ring-gray-200">
                                    {item ? (
                                        <>
                                            <img src={item.homeImage.imagePath} alt="" className="h-full w-full object-cover" />
                                            <div className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white shadow-xl">
                                                {pos}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-2xl text-gray-500">
                                            Vị trí {pos}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Masonry Grid */}
                        <Masonry breakpointCols={breakpointColumns} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
                            {allImages.map((image) => {
                                const position = selectedMap.get(image.id);
                                const isSelected = !!position;

                                return (
                                    <div
                                        key={image.id}
                                        className="group relative mb-6 cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl"
                                        onClick={() => toggleSelection(image)}
                                    >
                                        <img
                                            src={image.imagePath}
                                            alt={image.name}
                                            className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        <AnimatePresence>
                                            {(isSelected || selectedCount < MAX_SELECTION) && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/70"
                                                >
                                                    {isSelected ? (
                                                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-6xl font-black text-white shadow-2xl">
                                                            {position}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-full border-4 border-white bg-white/20 px-8 py-4 text-3xl font-bold text-white backdrop-blur-md">
                                                            Vị trí {selectedCount + 1}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
                                            <p className="truncate text-sm font-bold text-white">{image.name}</p>
                                            {image.animeSeriesName && (
                                                <p className="truncate text-xs text-pink-300">Anime: {image.animeSeriesName}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </Masonry>

                        {/* No results */}
                        {allImages.length === 0 && (
                            <div className="py-20 text-center text-muted-foreground text-lg">
                                Không tìm thấy ảnh nào phù hợp với bộ lọc
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}