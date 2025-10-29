// src/entities/product/type/product.ts
import { PaginateResult, BaseEntity } from '@/src/shared/types/common';
import { Category } from '@/src/shared/types';

export interface ProductImage {
    id: string;
    productId: string;
    imagePath: string;
    isPrimary: boolean;
    displayOrder: number;
}

export interface ProductTag {
    productId: string;
    tagId: string;
    tag: { id: string; name: string };
}

export interface ProductReview {
    id: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
    userName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface EventItem {
    id: string;
    name: string;
    imagePath?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
}

export interface ProductItem extends BaseEntity {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    discountPrice?: number;
    stockQuantity: number;
    isPreOrder?: boolean;
    preOrderReleaseDate?: string;
    categoryId: string;
    category?: Category;
    animeSeriesId?: string;
    animeSeries?: { id: string; title: string; releaseYear?: number; imagePath?: string };
    primaryImage?: string;
    // Các trường chỉ có trong GetProduct
    images?: ProductImage[];
    productTags?: ProductTag[];
    reviews?: ProductReview[];
    events?: EventItem[];
    totalSales?: number;
    averageRating?: number;
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