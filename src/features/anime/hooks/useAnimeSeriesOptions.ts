// src/entities/anime-series/hooks/useAnimeSeriesOptions.ts
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { animeSeriesSelectService, AnimeSeriesOption } from "@/src/entities/anime/service/anime-series-select.service";

export const useAnimeSeriesOptions = (initialSearch: string = "") => {
    const [options, setOptions] = useState<AnimeSeriesOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(initialSearch);

    const fetchOptions = useCallback(
        debounce(async (searchValue: string) => {
            setLoading(true);
            try {
                const result = await animeSeriesSelectService.getOptions(searchValue || undefined);
                setOptions(result);
            } catch (err) {
                console.error("Lỗi khi tìm anime series:", err);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Load lần đầu + khi search thay đổi
    useEffect(() => {
        fetchOptions(search);
    }, [search, fetchOptions]);

    // Load lần đầu khi component mount (nếu muốn hiện "Tất cả Anime" ngay)
    useEffect(() => {
        if (options.length === 0 && !loading) {
            fetchOptions("");
        }
    }, []);

    return {
        options,
        loading,
        search,
        setSearch,
    };
};