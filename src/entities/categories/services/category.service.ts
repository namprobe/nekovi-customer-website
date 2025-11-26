// src/entities/categories/service/category.service.ts
import apiClient from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { PaginateResult } from '@/src/shared/types/common';
import type {
    CategoryItem,
    CategorySelectItem,
    CategoryFilterParams,
} from '@/src/entities/categories/type/category';

class CategoryService {
    /**
     * Lấy danh sách danh mục có phân trang + filter (giống Anime)
     */
    async getCategoryList(
        filter: CategoryFilterParams = {}
    ): Promise<PaginateResult<CategoryItem>> {
        const {
            page = 1,
            pageSize = 10,
            search,
            sortBy,
            isAscending,
            status,
            name,
            parentCategoryId,
            hasImage,
            isRoot,
        } = filter;

        const params = new URLSearchParams({
            Page: String(page),
            PageSize: String(pageSize),
        });

        if (search) params.append('Search', search);
        if (sortBy) params.append('SortBy', sortBy);
        if (isAscending !== undefined) params.append('IsAscending', String(isAscending));
        if (status !== undefined) params.append('Status', String(status));
        if (name) params.append('Name', name);
        if (parentCategoryId) params.append('ParentCategoryId', parentCategoryId);
        if (hasImage !== undefined) params.append('HasImage', String(hasImage));
        if (isRoot !== undefined) params.append('IsRoot', String(isRoot));

        // Dùng apiClient.paginate vì backend trả về PaginateResult trực tiếp (không wrap trong ApiResult)
        const response = await apiClient.paginate<CategoryItem>(
            `${env.ENDPOINTS.CATEGORY.LIST}?${params.toString()}`
        );

        // apiClient.paginate đã trả về PaginateResult với isSuccess = false nếu lỗi
        if (!response.isSuccess) {
            throw new Error(response.errors?.[0] || response.errorCode || 'Không thể lấy danh sách danh mục');
        }

        return response;
    }

    /**
     * Lấy danh sách danh mục dạng select (dropdown)
     */
    async getCategorySelectList(search?: string): Promise<CategorySelectItem[]> {
        const endpoint = search
            ? `${env.ENDPOINTS.CATEGORY.SELECT_LIST}?search=${encodeURIComponent(search.trim())}`
            : env.ENDPOINTS.CATEGORY.SELECT_LIST;

        const response = await apiClient.get<CategorySelectItem[]>(endpoint);

        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể lấy danh sách danh mục chọn');
        }

        return response.data;
    }
}

// Export singleton giống như animeService
export const categoryService = new CategoryService();