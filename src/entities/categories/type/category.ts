// src/entities/categories/types/category.ts
import { BaseEntity, PaginateResult } from '@/src/shared/types/common';

export interface CategoryItem extends BaseEntity {
    id: string;
    name: string;
    parentCategoryId: string | null;
    imagePath: string | null;
    description: string | null;
    statusName: string;
}

export interface CategorySelectItem {
    id: string;
    name: string;
}

// Filter params cho API GET /categories
export interface CategoryFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    isAscending?: boolean;
    status?: number;
    name?: string;
    parentCategoryId?: string;
    hasImage?: boolean;
    isRoot?: boolean; // chỉ lấy category cha (root)
}

export type CategoryListResponse = PaginateResult<CategoryItem>;