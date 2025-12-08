// src/entities/productReview/type/product-review.ts
export interface ProductReviewCreateRequest {
    productId: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment?: string;
    status?: number;
}

export interface ProductReviewItem {
    id: string;
    productId: string;
    orderId?: string;
    userId: string;
    userName?: string;
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    updatedAt?: string;
}

// THÊM: Type cho response từ API (dựa trên backend Result<ProductReviewResponse>)
export interface ProductReviewResponse {
    value?: ProductReviewItem;  // Review nếu tồn tại
    isSuccess: boolean;
    message?: string;
    errorCode?: string;  // Ví dụ: "NotFound" nếu chưa đánh giá
}

// THÊM: Params cho getMyReview
export interface ReviewCheckParams {
    productId: string;
    orderId?: string;
}