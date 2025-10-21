//src/features/anime/hooks/useAnimeList.ts
import { useState, useEffect } from 'react';
import { animeService } from '@/src/entities/anime/service/anime';
import { AnimeSeries, AnimeSeriesFilter } from '@/src/entities/anime/type/anime';
import { PaginateResult } from '@/src/shared/types/common';

interface UseAnimeListResult {
    animeList: AnimeSeries[];
    totalItems: number;
    isLoading: boolean;
    error: string | null;
    fetchAnime: (filter: AnimeSeriesFilter) => Promise<void>;
}

export function useAnimeList(): UseAnimeListResult {
    const [animeList, setAnimeList] = useState<AnimeSeries[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnime = async (filter: AnimeSeriesFilter) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await animeService.getAnimeSeriesList(filter);
            if (response.isSuccess) {
                setAnimeList(response.items);
                setTotalItems(response.totalItems);
            } else {
                setError(response.errors?.join(', ') || 'Không thể tải danh sách anime');
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách anime');
        } finally {
            setIsLoading(false);
        }
    };

    return { animeList, totalItems, isLoading, error, fetchAnime };
}