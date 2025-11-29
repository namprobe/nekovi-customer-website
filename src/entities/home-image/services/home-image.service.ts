// src/entities/home-image/services/home-image.service.ts
import { apiClient } from "@/src/core/lib/api-client";
import type { HomeImageItem, HomeImageListResponse } from "../types/home-image";

export const homeImageService = {
    // Lấy danh sách ảnh từ kho chung (có phân trang, search, filter...)
    getList: async (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        animeSeriesId?: string;
        hasAnimeSeries?: boolean;
        sortBy?: string;
        isAscending?: boolean;
    }): Promise<HomeImageListResponse> => {
        // Dùng paginate vì backend trả PaginateResult trực tiếp
        const result = await apiClient.paginate<HomeImageItem>("/home-images", {
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? 20,
            search: params?.search,
            animeSeriesId: params?.animeSeriesId,
            hasAnimeSeries: params?.hasAnimeSeries,
            sortBy: params?.sortBy ?? "createdAt",
            isAscending: params?.isAscending ?? false,
        });

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

    // Dùng riêng cho Hero Banner: lấy 3 ảnh mới nhất
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