// src/core/config/env.ts

function normalizeUrl(url: string) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

const BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:7252');
const PUBLIC_PREFIX = process.env.NEXT_PUBLIC_PUBLIC_PREFIX || "/api/customer";

export const env = {
    BASE_URL,
    PUBLIC_PREFIX,

    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Customer FE",
    DEBUG: process.env.NEXT_PUBLIC_DEBUG === "true",

    ENDPOINTS: {
        PRODUCT: {
            LIST: `${PUBLIC_PREFIX}/products`,
            DETAIL: (id: string) => `${PUBLIC_PREFIX}/products/${id}`,
        },

        CATEGORY: {
            SELECT_LIST: `${PUBLIC_PREFIX}/categories/select-list`,
        },
        ANIMESERIES: {
            SELECT_LIST: `${PUBLIC_PREFIX}/anime-series`,
        },
        PRODUCTREVIEW: {
            CREATE: `${PUBLIC_PREFIX}/product-reviews`,
            UPDATE: (id: string) => `${PUBLIC_PREFIX}/product-reviews/${id}`,
        }
    },
} as const;
