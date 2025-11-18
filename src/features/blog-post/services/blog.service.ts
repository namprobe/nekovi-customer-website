//src/features/blog-post/services/blog.service.ts
import { apiClient } from "@/src/core/lib/api-client"
import type { BlogPostItem, PaginationResult, BlogPostDetail } from "../types/blog"
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
    getList: async (params: BlogFilterParams = {}): Promise<PaginationResult<BlogPostItem>> => {
        const endpoint = env.ENDPOINTS.BLOG.LIST

        const { tagIds, ...otherParams } = params

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

        const searchParams = new URLSearchParams()
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value.toString())
            }
        })

        if (tagIds?.length) {
            tagIds.forEach(id => searchParams.append("tagIds", id))
        }

        const finalEndpoint = searchParams.toString()
            ? `${endpoint}?${searchParams.toString()}`
            : endpoint

        return await apiClient.paginate<BlogPostItem>(finalEndpoint)
    },

    getLatestByCategory: async (): Promise<BlogPostItem[]> => {
        const result = await apiClient.get<BlogPostItem[]>(
            env.ENDPOINTS.BLOG.LATEST_BY_CATEGORY
        )
        if (result.isSuccess && Array.isArray(result.data)) {
            return result.data.filter(post => post.isPublished)
        }
        return []
    },

    getById: async (id: string): Promise<BlogPostDetail | null> => {
        const result = await apiClient.get<any>(env.ENDPOINTS.BLOG.DETAIL(id))

        if (result.isSuccess && result.data?.value) {
            return result.data.value as BlogPostDetail
        }

        if (result.isSuccess && result.data) {
            return result.data as BlogPostDetail
        }

        return null
    },
}

