// src/entities/product-review/service/product-review-service.ts
import { api } from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { ProductReviewCreateRequest, ProductReviewItem } from '../type/product-review';

export class ProductReviewService {
    async create(review: ProductReviewCreateRequest): Promise<ProductReviewItem> {
        return api.post<ProductReviewItem>(env.ENDPOINTS.PRODUCT_REVIEW.CREATE, review);
    }

    async update(id: string, review: Omit<ProductReviewCreateRequest, 'productId'>): Promise<ProductReviewItem> {
        return api.put<ProductReviewItem>(env.ENDPOINTS.PRODUCT_REVIEW.UPDATE(id), review);
    }

    async delete(id: string): Promise<void> {
        return api.delete(env.ENDPOINTS.PRODUCT_REVIEW.DELETE(id));
    }

    async getByProduct(productId: string): Promise<ProductReviewItem[]> {
        return api.get<ProductReviewItem[]>(env.ENDPOINTS.PRODUCT_REVIEW.GET_BY_PRODUCT(productId));
    }
}

export const productReviewService = new ProductReviewService();