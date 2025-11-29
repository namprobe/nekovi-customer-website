// src/entities/home-image/types/home-image.ts
export interface HomeImageItem {
    id: string;
    name: string;
    imagePath: string;
    animeSeriesId?: string | null;
    animeSeriesName?: string | null;
}

export interface HomeImageListResponse {
    items: HomeImageItem[];
    totalCount: number;
    page: number;
    pageSize: number;
}