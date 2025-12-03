// src/entities/event/services/event.service.ts
import { customerApiClient } from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { EventFilterParams, EventItem, EventResponse } from '../types/event';

export const EventService = {
    // Lấy danh sách sự kiện (có phân trang & filter)
    getList: async (params: EventFilterParams) => {
        const queryParams = {
            Page: params.page || 1,
            PageSize: params.limit || 9, // Mặc định lấy 9 item cho đẹp grid
            IsOngoing: params.isOngoing ?? false,
            Search: params.search || "",
            SortBy: params.sortBy || "startDate",
            IsAscending: params.sortOrder === "asc",
            // Custom filters
            Name: params.name,
            StartDate: params.startDate,
            EndDate: params.endDate,
            Location: params.location
        };

        // Cast 'as any' vì PaginateResult của bạn có thể trả về cấu trúc khác params mặc định
        return await customerApiClient.paginate<EventItem>(
            env.ENDPOINTS.EVENT.LIST,
            queryParams as any
        );
    },

    // Lấy chi tiết sự kiện
    getDetail: async (id: string) => {
        const endpoint = env.ENDPOINTS.EVENT.DETAIL(id);
        return await customerApiClient.get<EventResponse>(endpoint);
    }
};