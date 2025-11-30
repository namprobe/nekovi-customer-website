// src/entities/home-image/services/home-image.service.ts
import apiClient from "@/src/core/lib/api-client";
import { env } from "@/src/core/config/env";
import type { HomeImageItem, HomeImageListResponse } from "../types/home-image";

export const homeImageService = {
    async getList(params: {
        page?: number;
        pageSize?: number;
        search?: string;
        animeSeriesId?: string;
        sortBy?: string;
        isAscending?: boolean;
    }): Promise<HomeImageListResponse> {
        const { page = 1, pageSize = 50, search, animeSeriesId, sortBy = "createdAt", isAscending = false } = params;

        const response = await apiClient.paginate<HomeImageItem>(env.ENDPOINTS.HOME_IMAGE.LIST, {
            page,
            pageSize,
            search: search || undefined,
            animeSeriesId: animeSeriesId || undefined,
            sortBy,
            isAscending,
        });

        if (!response.isSuccess) {
            throw new Error(response.errors?.[0] || "Failed to fetch home images");
        }

        return {
            items: response.items,
            totalCount: response.totalItems,
            page: response.currentPage,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            isSuccess: true,
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
