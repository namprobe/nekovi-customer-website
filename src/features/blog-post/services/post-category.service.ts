// src/features/blog-post/services/post-category.service.ts
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"

export interface PostCategorySelectItem {
    id: string
    name: string
}

export const postCategoryService = {
    getSelectList: async (search?: string): Promise<PostCategorySelectItem[]> => {
        const url = `${env.ENDPOINTS.BLOG_CATEGORY.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ''}`

        // Gọi API và nhận mảng trực tiếp
        const result = await apiClient.get<PostCategorySelectItem[]>(url)


        // API trả về mảng → dùng result.data trực tiếp
        return result.isSuccess && Array.isArray(result.data) ? result.data : []
    },
}