// src/entities/product-review/type/product-review.ts
export interface ProductReviewCreateRequest {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
}

export interface ProductReviewItem {
    id: string;
    productId: string;
    userId: string;
    userName?: string;
    rating: number;
    title?: string;
    comment?: string;
    createdAt: string;
    updatedAt?: string;
}