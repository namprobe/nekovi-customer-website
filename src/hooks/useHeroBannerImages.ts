// src/widgets/home/hooks/useHeroBannerImages.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { homeImageService } from "@/src/entities/home-image/services/home-image.service";
import { userHomeImageService } from "@/src/entities/user-home-image/services/user-home-image.service";
import { useAuthIsAuthenticated, useAuthIsHydrated } from "@/src/entities/auth/service/auth-service";

export const useHeroBannerImages = () => {
    const isAuthenticated = useAuthIsAuthenticated();
    const isHydrated = useAuthIsHydrated();
    const queryClient = useQueryClient();

    // Chỉ bật query user khi đã đăng nhập + đã hydrate
    const shouldFetchUserImages = isHydrated && isAuthenticated;

    const userImagesQuery = useQuery({
        queryKey: ["user-home-images"],
        queryFn: async () => {
            const items = await userHomeImageService.getMyList();
            return items
                .sort((a, b) => a.position - b.position)
                .map((x) => x.homeImage)
                .slice(0, 3);
        },
        enabled: shouldFetchUserImages,
        staleTime: 1000 * 60 * 5, // 5 phút
        gcTime: 1000 * 60 * 10,
    });

    const defaultImagesQuery = useQuery({
        queryKey: ["default-hero-images"],
        queryFn: homeImageService.getLatestForBanner,
        staleTime: 1000 * 60 * 10, // 10 phút
        gcTime: 1000 * 60 * 30,
    });

    // Ưu tiên: user images → fallback → default images
    const images = useMemo(() => {
        if (!isHydrated) return []; // chưa hydrate → không render gì, tránh flash

        if (shouldFetchUserImages) {
            if (userImagesQuery.data && userImagesQuery.data.length > 0) {
                return userImagesQuery.data;
            }
        }

        return defaultImagesQuery.data ?? [];
    }, [
        isHydrated,
        shouldFetchUserImages,
        userImagesQuery.data,
        defaultImagesQuery.data,
    ]);

    const isLoading = useMemo(() => {
        if (!isHydrated) return true;

        if (shouldFetchUserImages) {
            return userImagesQuery.isLoading || defaultImagesQuery.isLoading;
        }

        return defaultImagesQuery.isLoading;
    }, [isHydrated, shouldFetchUserImages, userImagesQuery.isLoading, defaultImagesQuery.isLoading]);

    // Tự động invalidate khi đăng nhập/đăng xuất (nếu cần)
    useEffect(() => {
        if (isHydrated) {
            queryClient.invalidateQueries({ queryKey: ["user-home-images"] });
        }
    }, [isHydrated, isAuthenticated, queryClient]);

    return {
        images,
        isLoading,
        isError: userImagesQuery.isError || defaultImagesQuery.isError,
    };
};