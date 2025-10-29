'use client';

import { useState, useEffect } from 'react';
import { animeService } from '@/src/entities/anime/service/anime';
import { AnimeSeries } from '@/src/entities/anime/type/anime';

export function useFeaturedAnime() {
    const [featured, setFeatured] = useState<AnimeSeries[]>([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await animeService.getAnimeSeriesList({
                    page: 1,
                    pageSize: 3,
                    sortBy: 'releaseYear',
                    isAscending: false,
                });
                if (res.isSuccess) {
                    setFeatured(res.items);
                }
            } catch (err) {
                console.error('Error fetching featured anime', err);
            }
        };

        fetchFeatured();
    }, []);

    return featured;
}
