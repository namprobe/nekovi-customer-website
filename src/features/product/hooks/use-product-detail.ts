// src/features/product/hooks/use-product-detail.ts
'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/src/entities/product/service/product-service';
import type { ProductItem } from '@/src/entities/product/type/product';

export function useProductDetail(id: string) {
    const [data, setData] = useState<ProductItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('ID sản phẩm không hợp lệ');
            setLoading(false);
            return;
        }

        setLoading(true);
        productService
            .getProductById(id)
            .then((p) => setData(p))
            .catch((e) => setError(e.message || 'Không load được sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    return { data, loading, error };
}