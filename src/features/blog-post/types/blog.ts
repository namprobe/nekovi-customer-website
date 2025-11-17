//src/features/blog-post/types/blog.ts
export interface PostCategoryItem {
    id: string
    name: string
}

export interface TagItem {
    id: string
    name: string
    createdAt: string
    status: number
}

export interface PostTagItem {
    id: string
    tagId: string
    tags: TagItem[]
}

export interface BlogPostItem {
    id: string
    title: string
    content: string
    postCategoryId?: string
    postCategory?: PostCategoryItem
    authorId?: string
    authorName?: string
    authorAvatar?: string
    publishDate: string
    isPublished: boolean
    featuredImage?: string
    postTags: PostTagItem[]
    createdAt: string
    updatedAt?: string | null
    status: number
    statusName?: string
}

export interface PaginationResult<T> {
    isSuccess: boolean
    items: T[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasPrevious: boolean
    hasNext: boolean
    errors?: string[]
    errorCode?: string
}

// src/features/blog-post/types/blog.ts
export interface PostCategorySelectItem {
    id: string;
    name: string;
}