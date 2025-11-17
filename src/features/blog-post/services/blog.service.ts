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
        const endpoint = env.ENDPOINTS.BLOG.LIST

        // Tách riêng tagIds vì nó là mảng
        const { tagIds, ...otherParams } = params

        // Tạo query params cơ bản
        const queryParams: Record<string, string | number | boolean | undefined> = {
            page: otherParams.page,
            pageSize: otherParams.pageSize,
            search: otherParams.search,
            title: otherParams.title,
            postCategoryId: otherParams.postCategoryId,
            authorId: otherParams.authorId,
            isPublished: otherParams.isPublished,
            sortBy: otherParams.sortBy,
            isAscending: otherParams.isAscending,
        }

        // Build URL với query params + xử lý tagIds riêng
        const searchParams = new URLSearchParams()
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value.toString())
            }
        })

        // Xử lý tagIds: thêm nhiều lần
        if (tagIds?.length) {
            tagIds.forEach(id => searchParams.append("tagIds", id))
        }

        const finalEndpoint = searchParams.toString()
            ? `${endpoint}?${searchParams.toString()}`
            : endpoint

        return await apiClient.paginate<BlogPostItem>(finalEndpoint)
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