// src/entities/event/types/event.ts
import { PaginateResult, BaseEntity } from '@/src/shared/types/common';
import { ProductItem } from '../../product/type/product';

// Filter params cho Event
export interface EventFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    name?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    isOngoing?: boolean; // Lọc sự kiện đang diễn ra
}

// Item hiển thị ở danh sách (gọn nhẹ)
export interface EventItem extends BaseEntity {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    imagePath?: string;
    location?: string;
    statusName?: string; // Tùy chọn, nếu backend trả về
}

// Response chi tiết (bao gồm description và list sản phẩm)
export interface EventResponse extends EventItem {
    description?: string;
    products?: ProductItem[];
}

export type EventListResponse = PaginateResult<EventItem>;