// src/entities/product/service/product-service.ts
import { api } from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { PaginateResult } from '@/src/shared/types/common';
import { ProductItem, ProductQuery } from '../type/product';

export class ProductService {
    async getProductList(query: ProductQuery = {}): Promise<PaginateResult<ProductItem>> {
        const { page = 1, pageSize = 10, categoryId, animeId, search, sortType, priceRange } = query;
        const params = new URLSearchParams({
            Page: String(page),
            PageSize: String(pageSize),
        });

        if (categoryId) params.append('CategoryId', categoryId);
        if (animeId) params.append('AnimeSeriesId', animeId);
        if (search) params.append('Search', search);
        if (sortType) params.append('SortType', sortType);
        if (priceRange) params.append('PriceRange', priceRange);

        return api.get<PaginateResult<ProductItem>>(
            `${env.ENDPOINTS.PRODUCT.LIST}?${params.toString()}`
        );
    }

    async getProductById(id: string): Promise<ProductItem> {
        return api.get<ProductItem>(env.ENDPOINTS.PRODUCT.DETAIL(id));
    }
}

export const productService = new ProductService();