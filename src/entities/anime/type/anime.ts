// src/entities/anime/type/anime.ts
import { BaseEntity, PaginateResult } from '@/src/shared/types/common';

export interface AnimeSeries extends BaseEntity {
    id: string;
    title: string;
    releaseYear: number;
    imagePath?: string;
    description?: string;
    japaneseTitle?: string;
    genres?: string[];
    episodes?: number;
    rating?: number;
    studio?: string;
    popularity?: number;
    featured?: boolean;
}

export interface AnimeSeriesFilter {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    isAscending?: boolean;
    status?: number;
    title?: string;
    releaseYear?: number;
}

export type AnimeSeriesListResponse = PaginateResult<AnimeSeries>;
