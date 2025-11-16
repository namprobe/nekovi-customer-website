//src/features/blog-post/services/blog.service.ts
import { apiClient } from "@/src/core/lib/api-client"
import type { BlogPostItem, PaginationResult } from "../types/blog"
import { env } from "@/src/core/config/env"

export interface BlogFilterParams {
    page?: number
    pageSize?: number
    search?: string
    title?: string
    postCategoryId?: string
    authorId?: string
    isPublished?: boolean
    tagIds?: string[]
    sortBy?: string
    isAscending?: boolean
}

export const blogService = {
    // Lấy danh sách bài viết (phân trang)
    getList: async (params: BlogFilterParams = {}): Promise<PaginationResult<BlogPostItem>> => {
        const searchParams = new URLSearchParams()

        if (params.page) searchParams.append("page", params.page.toString())
        if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
        if (params.search) searchParams.append("search", params.search)
        if (params.title) searchParams.append("title", params.title)
        if (params.postCategoryId) searchParams.append("postCategoryId", params.postCategoryId)
        if (params.authorId) searchParams.append("authorId", params.authorId)
        if (params.isPublished !== undefined) searchParams.append("isPublished", params.isPublished.toString())
        if (params.tagIds?.length) {
            params.tagIds.forEach(id => searchParams.append("tagIds", id))
        }
        if (params.sortBy) searchParams.append("sortBy", params.sortBy)
        if (params.isAscending !== undefined) searchParams.append("isAscending", params.isAscending.toString())

        const endpoint = `${env.ENDPOINTS.BLOG.LIST}${searchParams.toString() ? `?${searchParams}` : ''}`
        return await apiClient.paginate<BlogPostItem>(endpoint)
    },

    // Lấy bài viết mới nhất theo category
    getLatestByCategory: async (): Promise<BlogPostItem[]> => {
        const result = await apiClient.get<BlogPostItem[]>(  // Sửa: <BlogPostItem[]>
            env.ENDPOINTS.BLOG.LATEST_BY_CATEGORY
        )
        if (result.isSuccess && Array.isArray(result.data)) {
            return result.data.filter(post => post.isPublished)
        }
        return []
    },

    // Lấy chi tiết bài viết
    getById: async (id: string): Promise<BlogPostItem | null> => {
        const result = await apiClient.get<{ value: BlogPostItem }>(env.ENDPOINTS.BLOG.DETAIL(id))
        return result.isSuccess && result.data?.value ? result.data.value : null
    },
}