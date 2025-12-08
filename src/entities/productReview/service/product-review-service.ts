//src/entities/productReview/service/product-review-service.ts
import apiClient from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { ProductReviewCreateRequest, ProductReviewItem, ProductReviewResponse, ReviewCheckParams } from '../type/product-review';

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
        // Log để kiểm tra dữ liệu trước khi gửi
        console.log("Sending Review Data:", review);

        const response = await apiClient.post<ProductReviewItem>(env.ENDPOINTS.PRODUCT_REVIEW.CREATE, review);

        if (!response.isSuccess) {
            throw new Error(response.message || 'Không thể tạo đánh giá');
        }

        // Kiểm tra xem data có trả về đúng trong response.data hay không
        return response.data as ProductReviewItem;
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


    async getMyReview(params: ReviewCheckParams): Promise<ProductReviewResponse> {
        const url = env.ENDPOINTS.PRODUCT_REVIEW.GET_BY_USER_AND_ORDER(params.productId, params.orderId);

        // Gọi API
        const response = await apiClient.get<any>(url); // Tạm để any để debug

        console.log("Debug - GetMyReview Raw Response:", response);

        // CASE 1: Backend trả về 200 OK và tìm thấy review
        // Cấu trúc thường là: { isSuccess: true, data: { value: { ...reviewData... }, isSuccess: true } }
        // Hoặc: { isSuccess: true, data: { ...reviewData... } }
        // Tùy thuộc vào apiClient của bạn bóc tách data thế nào.

        // Giả sử Backend trả về Result<ProductReviewResponse>, thì trong đó có field 'value'
        if (response.isSuccess) {
            // Kiểm tra kỹ cấu trúc data trả về
            // Nếu API Client đã bóc data, thì response.data chính là body response từ BE
            const responseData = response.data;

            // Nếu BE trả về { value: {...}, isSuccess: true }
            if (responseData && responseData.value) {
                return {
                    isSuccess: true,
                    value: responseData.value
                };
            }

            // Nếu apiClient mapping thẳng data vào response.data
            return {
                isSuccess: true,
                value: responseData
            };
        }

        // CASE 2: Backend trả về 200 OK nhưng Logic là Failure (Ví dụ: Result.Failure)
        // Hoặc Backend trả 404 (Not Found)
        return {
            isSuccess: false,
            value: undefined,
            message: response.message || "Chưa có đánh giá"
        };
    }
}

export const productReviewService = new ProductReviewService();