// src/core/config/env.ts

function normalizeUrl(url: string) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

const BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7284");
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
    },
} as const;
