// src/app/my-home-images/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import { homeImageService } from "@/src/entities/home-image/services/home-image.service";
import { userHomeImageService } from "@/src/entities/user-home-image/services/user-home-image.service";
import type { HomeImageItem } from "@/src/entities/home-image/types/home-image";
import type { UserHomeImageItem, UserHomeImageSaveRequest } from "@/src/entities/user-home-image/types/user-home-image";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { useRouter } from "next/navigation";

const MAX_SELECTION = 3;

export default function MyHomeImagesPage() {
    const [allImages, setAllImages] = useState<HomeImageItem[]>([]);
    const [mySelections, setMySelections] = useState<UserHomeImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Load dữ liệu lần đầu
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [homeRes, myRes] = await Promise.all([
                    homeImageService.getList({ pageSize: 200 }),
                    userHomeImageService.getMyList(),
                ]);

                setAllImages(homeRes.items);
                // Đảm bảo thứ tự đúng 1 → 2 → 3
                const sorted = myRes.sort((a, b) => a.position - b.position);
                setMySelections(sorted);
            } catch (err) {
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Map: homeImageId → position (1, 2 hoặc 3)
    const selectedMap = useMemo(() => {
        const map = new Map<string, number>();
        mySelections.forEach((item) => {
            map.set(item.homeImage.id, item.position); // position từ DB là 1,2,3
        });
        return map;
    }, [mySelections]);

    const selectedCount = mySelections.length;

    // Chọn / bỏ chọn ảnh
    const toggleSelection = (image: HomeImageItem) => {
        const currentPosition = selectedMap.get(image.id);

        if (currentPosition !== undefined) {
            // Đang chọn → bỏ chọn → dồn các ảnh sau lên 1 bậc
            setMySelections((prev) =>
                prev
                    .filter((item) => item.homeImage.id !== image.id)
                    .map((item, idx) => ({ ...item, position: idx + 1 })) // 1,2,3
            );
        } else {
            // Chưa chọn → thêm vào vị trí tiếp theo
            if (selectedCount >= MAX_SELECTION) {
                toast.warning(`Chỉ được chọn tối đa ${MAX_SELECTION} ảnh`);
                return;
            }

            const newItem: UserHomeImageItem = {
                id: "",
                userId: "",
                position: selectedCount + 1, // 1, 2 hoặc 3
                homeImage: image,
            };

            setMySelections((prev) => [...prev, newItem]);
        }
    };

    // Lưu về backend
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
                toast.success("Lưu ảnh trang chủ thành công! Đang trở về trang chủ...");

                // Làm mới danh sách từ server trước khi về
                const refreshed = await userHomeImageService.getMyList();
                setMySelections(refreshed.sort((a, b) => a.position - b.position));

                // Quay về trang chủ sau 1.5 giây để người dùng thấy toast
                setTimeout(() => {
                    router.push("/");
                });
            } else {
                toast.error("Lưu thất bại, vui lòng thử lại");
            }
        } catch (err) {
            toast.error("Có lỗi xảy ra khi lưu");
        } finally {
            setSaving(false);
        }
    };

    const breakpointColumns = {
        default: 5,
        1536: 4,
        1280: 4,
        1024: 3,
        768: 2,
        640: 1,
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="mb-2 text-4xl font-bold">Chọn Ảnh Trang Chủ Của Bạn</h1>
                    <p className="text-muted-foreground">
                        Chọn tối đa <strong>{MAX_SELECTION}</strong> ảnh để hiển thị trên trang chủ cá nhân
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                        <div className="text-lg">
                            Đã chọn: <strong>{selectedCount} / {MAX_SELECTION}</strong>
                        </div>
                        <Button onClick={handleSave} disabled={saving || selectedCount === 0} size="lg">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Lưu Lại
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Preview 3 ô */}
                <div className="mb-mx-4 mb-16 px-4">
                    <h2 className="mb-6 text-center text-2xl font-semibold">Preview thứ tự hiển thị</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[1, 2, 3].map((pos) => {
                            const item = mySelections.find((i) => i.position === pos);
                            return (
                                <div
                                    key={pos}
                                    className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl ring-4 ring-gray-200 ring-offset-2"
                                >
                                    {item ? (
                                        <>
                                            <img
                                                src={item.homeImage.imagePath}
                                                alt={item.homeImage.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground shadow-xl">
                                                {pos}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-2xl font-medium text-gray-500">
                                            Vị trí {pos}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Masonry Grid chọn ảnh */}
                <Masonry breakpointCols={breakpointColumns} className="flex -ml-4 w-auto" columnClassName="pl-4">
                    {allImages.map((image) => {
                        const position = selectedMap.get(image.id);
                        const isSelected = position !== undefined;

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

                                {/* Overlay khi hover hoặc đã chọn */}
                                <AnimatePresence>
                                    {(isSelected || selectedCount < MAX_SELECTION) && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/60"
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

                                {/* Tên ảnh */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <p className="truncate text-sm font-semibold text-white">{image.name}</p>
                                    {image.animeSeriesName && (
                                        <p className="truncate text-xs text-pink-300">Anime: {image.animeSeriesName}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </Masonry>
            </div>
        </MainLayout>
    );
}