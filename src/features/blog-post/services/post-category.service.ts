// src/features/blog-post/services/post-category.service.ts
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"

export interface PostCategorySelectItem {
    id: string
    name: string
}

export const postCategoryService = {
    getSelectList: async (search?: string): Promise<PostCategorySelectItem[]> => {
        const result = await apiClient.get<{ value: PostCategorySelectItem[] }>(
            `${env.ENDPOINTS.BLOG_CATEGORY.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ''}`
        )
        return result.isSuccess && result.data?.value ? result.data.value : []
    },
}