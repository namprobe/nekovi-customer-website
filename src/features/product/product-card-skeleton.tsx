// src/features/product/product-card-skeleton.tsx
'use client';

import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="group relative overflow-hidden transition-all hover:shadow-lg border rounded-lg">
            <div className="relative aspect-square overflow-hidden bg-gray-200 animate-pulse" />
            <div className="p-4">
                <div className="mb-2 h-6 w-3/4 animate-pulse bg-gray-200" />
                <div className="mb-3 h-4 w-1/2 animate-pulse bg-gray-200" />
                <div className="flex gap-2">
                    <div className="flex-1 h-8 animate-pulse bg-gray-200" />
                    <div className="h-8 w-8 animate-pulse bg-gray-200" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;