// src/entities/product-review/service/product-review-service.ts
import apiClient from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { ProductReviewCreateRequest, ProductReviewItem } from '../type/product-review';

export class ProductReviewService {
    async create(review: ProductReviewCreateRequest): Promise<ProductReviewItem> {
        const response = await apiClient.post<ProductReviewItem>(env.ENDPOINTS.PRODUCT_REVIEW.CREATE, review);
        
        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể tạo đánh giá');
        }
        
        return response.data;
    }

    async update(id: string, review: Omit<ProductReviewCreateRequest, 'productId'>): Promise<ProductReviewItem> {
        const response = await apiClient.put<ProductReviewItem>(env.ENDPOINTS.PRODUCT_REVIEW.UPDATE(id), review);
        
        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể cập nhật đánh giá');
        }
        
        return response.data;
    }

    async delete(id: string): Promise<void> {
        const response = await apiClient.delete(env.ENDPOINTS.PRODUCT_REVIEW.DELETE(id));
        
        if (!response.isSuccess) {
            throw new Error(response.message || 'Không thể xóa đánh giá');
        }
    }

    async getByProduct(productId: string): Promise<ProductReviewItem[]> {
        const response = await apiClient.get<ProductReviewItem[]>(env.ENDPOINTS.PRODUCT_REVIEW.GET_BY_PRODUCT(productId));
        
        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể lấy danh sách đánh giá');
        }
        
        return response.data;
    }
}

export const productReviewService = new ProductReviewService();