//src/entities/user-home-image/types/user-home-image.ts
import type { HomeImageItem } from "@/src/entities/home-image/types/home-image";

export interface UserHomeImageItem {
    id: string;
    userId: string;
    position: number;
    homeImage: HomeImageItem;
}

export interface UserHomeImageSaveRequest {
    id?: string;           // có = update hoặc delete, không có = create
    position: number;
    homeImageId?: string;  // bắt buộc khi create/update
}