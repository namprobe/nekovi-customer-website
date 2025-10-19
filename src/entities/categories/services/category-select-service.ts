// src/entities/categories/services/category-select-service.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '@/src/core/lib/api-client';
import { env } from '@/src/core/config/env';

export interface CategorySelectItem {
    id: string;
    name: string;
}

interface CategorySelectState {
    options: CategorySelectItem[];
    isLoading: boolean;
    error: string | null;
    fetchOptions: (search?: string) => Promise<CategorySelectItem[]>;
    setOptions: (options: CategorySelectItem[]) => void;
    clearError: () => void;
}

export const useCategorySelectStore = create<CategorySelectState>()(
    devtools((set) => ({
        options: [],
        isLoading: false,
        error: null,

        fetchOptions: async (search = '') => {
            try {
                set({ isLoading: true, error: null });
                const endpoint = `${env.ENDPOINTS.CATEGORY.SELECT_LIST}${search ? `?search=${encodeURIComponent(search)}` : ''}`;
                console.log(`Category Fetch URL: ${endpoint}`);
                const res = await api.get<CategorySelectItem[]>(endpoint);
                console.log(`Category Response:`, res);
                set({ options: res, isLoading: false });
                return res;
            } catch (error: any) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                set({ error: message, isLoading: false });
                return [];
            }
        },

        setOptions: (options) => set({ options }),

        clearError: () => set({ error: null }),
    }))
);