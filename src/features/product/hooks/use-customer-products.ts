//src/features/product/hooks/use-customer-products.ts
"use client"

import { useEffect, useState } from "react"
import { api } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"

export interface ProductQuery {
    page?: number
    pageSize?: number
    categoryId?: string
    animeId?: string
    search?: string
    sortType?: string
}

interface PaginationResult<T> {
    items: T[]
    pageIndex: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasPreviousPage: boolean
    hasNextPage: boolean
}

// tạm kiểu any để tránh lỗi type
type ProductItem = any

export function useCustomerProducts(query: ProductQuery = {}) {
    const {
        page = 1,
        pageSize = 10,
        categoryId,
        animeId,
        search,
        sortType,
    } = query

    const [data, setData] = useState<PaginationResult<ProductItem> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
            Page: String(page),
            PageSize: String(pageSize),
        })

        if (categoryId) params.append("CategoryId", categoryId)
        if (animeId) params.append("AnimeSeriesId", animeId)
        if (search) params.append("Search", search)
        if (sortType) params.append("SortType", sortType)

        api.get<PaginationResult<ProductItem>>(
            `${env.ENDPOINTS.PRODUCT.LIST}?${params.toString()}`
        )
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))

    }, [page, pageSize, categoryId, animeId, search, sortType])

    return { data, loading, error }
}
