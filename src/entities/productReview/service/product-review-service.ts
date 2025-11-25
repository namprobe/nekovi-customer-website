//src/entities/productReview/service/product-review-service.ts
import apiClient from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { ProductReviewCreateRequest, ProductReviewItem } from '../type/product-review';

export interface GetProductReviewsParams {
    productId: string;
    page?: number;
    pageSize?: number;
    rating?: number;        // nếu muốn filter theo sao
    sortBy?: string;        // ví dụ: "createdAt", "rating"
    isAscending?: boolean;
}

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

    async getByProduct(params: GetProductReviewsParams): Promise<{
        items: ProductReviewItem[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }> {
        const { productId, page = 1, pageSize = 5, rating, sortBy = "createdAt", isAscending = false } = params;

        const searchParams = new URLSearchParams({
            productId,
            page: page.toString(),
            pageSize: pageSize.toString(),
            sortBy,
            isAscending: isAscending.toString(),
            ...(rating && { rating: rating.toString() }),
        });

        const response = await apiClient.get<{
            items: ProductReviewItem[];
            totalCount: number;
            page: number;
            pageSize: number;
            totalPages: number;
        }>(`${env.ENDPOINTS.PRODUCT_REVIEW.LIST}?${searchParams.toString()}`);

        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể lấy danh sách đánh giá');
        }

        return response.data;
    }
}

export const productReviewService = new ProductReviewService();