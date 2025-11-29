// src/entities/home-image/services/home-image.service.ts
import apiClient from "@/src/core/lib/api-client";
import { env } from "@/src/core/config/env";
import type { HomeImageItem, HomeImageListResponse } from "../types/home-image";

export const homeImageService = {
    getList: async (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        animeSeriesId?: string;
        hasAnimeSeries?: boolean;
        sortBy?: string;
        isAscending?: boolean;
    }): Promise<HomeImageListResponse> => {
        const result = await apiClient.paginate<HomeImageItem>(
            env.ENDPOINTS.HOME_IMAGE.LIIST,
            {
                page: params?.page ?? 1,
                pageSize: params?.pageSize ?? 20,
                search: params?.search,
                animeSeriesId: params?.animeSeriesId,
                hasAnimeSeries: params?.hasAnimeSeries,
                sortBy: params?.sortBy ?? "createdAt",
                isAscending: params?.isAscending ?? false,
            }
        );

        if (!result.isSuccess) {
            console.error("Lỗi khi lấy danh sách HomeImage:", result.errors);
            return { items: [], totalCount: 0, page: 1, pageSize: 10 };
        }

        return {
            items: result.items,
            totalCount: result.totalItems,
            page: result.currentPage,
            pageSize: result.pageSize,
        };
    },

    getLatestForBanner: async (): Promise<HomeImageItem[]> => {
        const result = await homeImageService.getList({
            page: 1,
            pageSize: 3,
            sortBy: "createdAt",
            isAscending: false,
        });

        return result.items;
    },
};
