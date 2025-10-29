// src/core/lib/api-client.ts
import { env } from "../config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
    body?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

class ApiClient {
    private base = env.API_BASE; // Dùng API_BASE = BASE_URL + PUBLIC_PREFIX

    private async request<T>(
        method: HttpMethod,
        url: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { body, headers = {}, signal } = options;

        const config: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            signal,
        };

        if (body && method !== "GET") {
            config.body = JSON.stringify(body);
        }

        const res = await fetch(this.base + url, config);

        // Xử lý lỗi HTTP
        if (!res.ok) {
            let errorMessage = `Request failed: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // ignore
            }
            throw new Error(errorMessage);
        }

        // Trả về JSON nếu có content
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            return res.json();
        }

        return {} as T; // cho 204 No Content
    }

    async get<T>(url: string, options?: Omit<RequestOptions, "body">): Promise<T> {
        return this.request<T>("GET", url, options);
    }

    async post<T>(url: string, body?: any, options?: Omit<RequestOptions, "body">): Promise<T> {
        return this.request<T>("POST", url, { ...options, body });
    }

    async put<T>(url: string, body?: any, options?: Omit<RequestOptions, "body">): Promise<T> {
        return this.request<T>("PUT", url, { ...options, body });
    }

    async patch<T>(url: string, body?: any, options?: Omit<RequestOptions, "body">): Promise<T> {
        return this.request<T>("PATCH", url, { ...options, body });
    }

    async delete<T>(url: string, options?: Omit<RequestOptions, "body">): Promise<T> {
        return this.request<T>("DELETE", url, options);
    }
}

export const api = new ApiClient();