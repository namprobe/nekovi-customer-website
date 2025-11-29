// src/entities/user-home-image/services/user-home-image.service.ts
import apiClient from "@/src/core/lib/api-client";
import { env } from "@/src/core/config/env";
import type { UserHomeImageItem, UserHomeImageSaveRequest } from "../types/user-home-image";

export const userHomeImageService = {
    getMyList: async (): Promise<UserHomeImageItem[]> => {
        try {
            const result = await apiClient.get<UserHomeImageItem[]>(
                env.ENDPOINTS.USER_HOME_IMAGE.MY_LIST
            );


            if (!result.isSuccess || !result.data) {
                return [];
            }

            return result.data;
        } catch (error: any) {
            if (error.status === 401 || error.status === 403) {
                return [];
            }
            console.error("Lỗi khi lấy user home images:", error);
            return [];
        }
    }
    ,

    saveAll: async (items: UserHomeImageSaveRequest[]): Promise<boolean> => {
        const result = await apiClient.post(
            env.ENDPOINTS.USER_HOME_IMAGE.SAVE_ALL,
            items
        );

        if (!result.isSuccess) {
            console.error("Lưu UserHomeImage thất bại:", result.errors ?? result.message);
            return false;
        }

        return true;
    },

    deleteOne: async (id: string): Promise<boolean> => {
        const result = await apiClient.delete(
            env.ENDPOINTS.USER_HOME_IMAGE.DETAIL(id)
        );

        return result.isSuccess;
    },
};
