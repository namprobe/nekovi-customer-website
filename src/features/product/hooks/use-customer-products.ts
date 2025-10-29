// src/features/product/hooks/use-customer-products.ts
'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/src/entities/product/service/product-service';
import { PaginateResult, ErrorCodeEnum } from '@/src/shared/types/common';
import { ProductItem, ProductQuery } from '@/src/entities/product/type/product';

export function useCustomerProducts(query: ProductQuery = {}) {
    const [data, setData] = useState<PaginateResult<ProductItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        productService
            .getProductList(query)
            .then((response) => {
                if (response.isSuccess) {
                    setData(response);
                } else {
                    const errorMessage =
                        response.errorCode === ErrorCodeEnum.NotFound.toString()
                            ? 'Không tìm thấy sản phẩm'
                            : response.errors?.join(', ') || response.errors?.[0] || 'Lỗi khi tải sản phẩm';
                    setError(errorMessage);
                }
            })
            .catch((err) => setError('Lỗi khi tải sản phẩm: ' + err.message))
            .finally(() => setLoading(false));
    }, [query.page, query.pageSize, query.categoryId, query.animeId, query.search, query.sortType, query.priceRange]);

    return { data, loading, error };
}