// src/entities/product/service/product-service.ts
import apiClient from '@/src/core/lib/api-client';
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

        const response = await apiClient.get<PaginateResult<ProductItem>>(`${env.ENDPOINTS.PRODUCT.LIST}?${params.toString()}`);
        
        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể lấy danh sách sản phẩm');
        }
        
        return response.data;
    }

    async getProductById(id: string): Promise<ProductItem> {
        const response = await apiClient.get<ProductItem>(env.ENDPOINTS.PRODUCT.DETAIL(id));
        
        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || `Không tìm thấy sản phẩm với ID: ${id}`);
        }
        
        return response.data;
    }
}

export const productService = new ProductService();