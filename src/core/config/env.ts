// src/core/config/env.ts

function normalizeUrl(url: string): string {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

const BASE_URL = normalizeUrl(
    process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7252"
);
const CUSTOMER_PREFIX = process.env.NEXT_PUBLIC_CUSTOMER_PREFIX || "/api/customer";
const COMMON_PREFIX = process.env.NEXT_PUBLIC_COMMON_PREFIX || "/api/common";

const API_BASE = `${BASE_URL}${CUSTOMER_PREFIX}`;

export const env = {
    BASE_URL,
    CUSTOMER_PREFIX,
    COMMON_PREFIX,
    API_BASE,

    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Customer FE",
    DEBUG: process.env.NEXT_PUBLIC_DEBUG === "true",

    ENDPOINTS: {
        AUTH: {
            LOGIN: "/auth/login",
            LOGOUT: "/auth/logout",
            PROFILE: "/auth/profile",
            REFRESH_TOKEN: "/auth/refresh-token",
            REGISTER: "/auth/register",
            VERIFY_OTP: "/auth/verify-otp",
            RESET_PASSWORD: "/auth/reset-password",
            CHANGE_PASSWORD: "/auth/change-password",
            UPDATE_PROFILE: "/auth/update-profile",
        },
        PRODUCT: {
            LIST: `/products`,
            DETAIL: (id: string) => `/products/${id}`,
        },
        CATEGORY: {
            SELECT_LIST: `/categories/select-list`,
        },
        ANIME_SERIES: {
            SELECT_LIST: `/anime-series`,
        },
        PRODUCT_REVIEW: {
            CREATE: `/product-reviews`,
            GET_BY_PRODUCT: (productId: string) => `/product-reviews/product/${productId}`,
            UPDATE: (id: string) => `/product-reviews/${id}`,
            DELETE: (id: string) => `/product-reviews/${id}`,
        },
        USER_ADDRESS: {
            BASE: `/user-addresses`,
        },
    },
} as const;