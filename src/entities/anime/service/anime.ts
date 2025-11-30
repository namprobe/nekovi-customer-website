// src/entities/anime/service/anime.ts
import apiClient from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';
import { PaginateResult } from '@/src/shared/types/common';
import { AnimeSeries, AnimeSeriesFilter } from '@/src/entities/anime/type/anime';

export class AnimeService {
    async getAnimeSeriesList(query: AnimeSeriesFilter = {}): Promise<PaginateResult<AnimeSeries>> {
        const { page = 1, pageSize = 10, search, sortBy, isAscending, status, title, releaseYear } = query;
        const params = new URLSearchParams({
            Page: String(page),
            PageSize: String(pageSize),
        });

        if (search) params.append('Search', search);
        if (sortBy) params.append('SortBy', sortBy);
        if (isAscending !== undefined) params.append('IsAscending', String(isAscending));
        if (status !== undefined) params.append('Status', String(status));
        if (title) params.append('Title', title);
        if (releaseYear) params.append('ReleaseYear', String(releaseYear));

        const response = await apiClient.get<PaginateResult<AnimeSeries>>(`${env.ENDPOINTS.ANIME_SERIES.LIST}?${params.toString()}`);

        if (!response.isSuccess || !response.data) {
            throw new Error(response.message || 'Không thể lấy danh sách anime series');
        }

        return response.data;
    }
}

export const animeService = new AnimeService();
