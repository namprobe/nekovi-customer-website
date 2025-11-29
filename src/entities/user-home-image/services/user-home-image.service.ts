// src/entities/user-home-image/services/user-home-image.service.ts
import { apiClient } from "@/src/core/lib/api-client";
import type { UserHomeImageItem, UserHomeImageSaveRequest } from "../types/user-home-image";

export const userHomeImageService = {
    getMyList: async (): Promise<UserHomeImageItem[]> => {
        const result = await apiClient.get<{ data: UserHomeImageItem[] }>("/user-home-images/me");

        if (!result.isSuccess || !result.data?.data) {
            console.error("Lỗi khi lấy UserHomeImage:", result.errors ?? result.message);
            return [];
        }

        // Đúng: result.data.data mới là mảng UserHomeImageItem[]
        return result.data.data;
    },

    saveAll: async (items: UserHomeImageSaveRequest[]): Promise<boolean> => {
        const result = await apiClient.post<unknown>("/user-home-images/save", items);

        if (!result.isSuccess) {
            console.error("Lưu UserHomeImage thất bại:", result.errors ?? result.message);
            return false;
        }

        return true;
    },

    deleteOne: async (id: string): Promise<boolean> => {
        const result = await apiClient.delete<unknown>(`/user-home-images/${id}`);
        return result.isSuccess;
    },
};