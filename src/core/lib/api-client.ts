// src/core/lib/api-client.ts
import { env } from "../config/env";

class ApiClient {
    private base = env.BASE_URL;

    async get<T>(url: string): Promise<T> {
        const res = await fetch(this.base + url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
        return res.json();
    }
}

export const api = new ApiClient();