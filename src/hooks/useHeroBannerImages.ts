// src/widgets/home/hooks/useHeroBannerImages.ts
import { useEffect, useState } from "react";
import { homeImageService } from "@/src/entities/home-image/services/home-image.service";
import { userHomeImageService } from "@/src/entities/user-home-image/services/user-home-image.service";

export const useHeroBannerImages = () => {
    const [images, setImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // 1. Thử lấy ảnh user trước
                const userItems = await userHomeImageService.getMyList();
                const sortedUserItems = userItems
                    .sort((a, b) => a.position - b.position)
                    .map(x => x.homeImage)
                    .slice(0, 3);

                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", sortedUserItems);

                if (sortedUserItems.length > 0) {
                    setImages(sortedUserItems);
                    setIsLoading(false);
                    return;
                }
            } catch (err: any) {
                console.warn("Không thể lấy ảnh user:", err.message);
            }

            // 2. Nếu thất bại → fallback sang default
            try {
                const defaultImages = await homeImageService.getLatestForBanner();
                setImages(defaultImages);
            } catch (err) {
                console.error("Lỗi lấy ảnh mặc định:", err);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    return {
        images,
        isLoading,
        isError,
    };
};
