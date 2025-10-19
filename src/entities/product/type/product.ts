// src/entities/product/type/product.ts
import { PaginateResult, BaseEntity } from '@/src/shared/types/common';
import { Category } from '@/src/shared/types/index';

export interface ProductItem extends BaseEntity {
    id: string;
    name: string;
    slug: string; // Added to match Product
    description: string; // Added to match Product
    price: number;
    originalPrice?: number;
    discount?: number;
    categoryId: string;
    category?: Category;
    animeSeriesId?: string;
    animeSeries?: { id: string; name: string };
    stockQuantity: number;
    isPreOrder?: boolean;
    primaryImage?: string;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
}

export interface ProductQuery {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    animeId?: string;
    search?: string;
    sortType?: string;
    priceRange?: string;
}

export type ProductListResponse = PaginateResult<ProductItem>;