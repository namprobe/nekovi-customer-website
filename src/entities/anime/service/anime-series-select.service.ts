// src/entities/anime/service/anime-series-select.service.ts
import apiClient from "@/src/core/lib/api-client";
import { env } from "@/src/core/config/env";

export interface AnimeSeriesOption {
    id: string;
    label: string;
}

export const animeSeriesSelectService = {
    getOptions: async (search?: string): Promise<AnimeSeriesOption[]> => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            const url = `${env.ENDPOINTS.ANIME_SERIES.SELECT_LIST}${params.toString() ? "?" + params.toString() : ""}`;

            const res = await apiClient.get<{ id: string; title: string }[]>(url);

            // SỬA DÒNG NÀY: res.data?.data → res.data
            if (!res.isSuccess || !res.data) {
                console.warn("API trả về không có data hoặc không thành công:", res);
                return [];
            }

            // Dữ liệu nằm trực tiếp trong res.data (không có res.data.data)
            return res.data.map((item) => ({
                id: item.id,
                label: item.title,
            }));
        } catch (error) {
            console.error("Lỗi tải danh sách anime series:", error);
            return [];
        }
    },
};