// src/shared/ui/selects/async-select.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/src/components/ui/select';
import './styles.css';

export interface Option {
    id: string;
    label: string;
}

interface AsyncSelectProps {
    value: string;
    onChange: (value: string) => void;
    fetchOptions: (search: string) => Promise<Option[]>;
    placeholder?: string;
    disabled?: boolean;
}

export function AsyncSelect({ value, onChange, fetchOptions, placeholder, disabled }: AsyncSelectProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Lưu trữ option đã chọn để giữ trong danh sách lọc
    const selectedOption = options.find((opt) => opt.id === value) || null;

    const loadOptions = useCallback(
        debounce(async (searchValue: string) => {
            console.log('loadOptions called with:', searchValue);
            setLoading(true);
            try {
                const res = await fetchOptions(searchValue);
                // Nếu có option đã chọn và nó khớp với search, thêm vào danh sách
                const filteredOptions = res.filter((opt) =>
                    searchValue ? opt.label.toLowerCase().includes(searchValue.toLowerCase()) : true
                );
                if (selectedOption && value !== 'all' && searchValue) {
                    const isSelectedOptionInResults = filteredOptions.some((opt) => opt.id === selectedOption.id);
                    if (!isSelectedOptionInResults && selectedOption.label.toLowerCase().includes(searchValue.toLowerCase())) {
                        filteredOptions.unshift(selectedOption); // Thêm option đã chọn vào đầu danh sách
                    }
                }
                setOptions(filteredOptions);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        }, 500),
        [fetchOptions, selectedOption, value]
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (open && options.length === 0) {
                loadOptions(''); // Load toàn bộ danh sách khi mở lần đầu
            }
            if (!open) {
                setSearch(''); // Reset search khi đóng dropdown
            }
        },
        [options, loadOptions]
    );

    // Preload nếu value không có trong options
    useEffect(() => {
        if (value && value !== 'all' && !options.find((opt) => opt.id === value)) {
            loadOptions('');
        }
    }, [value, options, loadOptions]);

    // Focus input khi dropdown mở
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    // Xử lý thay đổi search
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            console.log('Search changed:', newValue);
            setSearch(newValue);
            loadOptions(newValue); // Gọi loadOptions với debounce
        },
        [loadOptions]
    );

    // Xử lý khi chọn option
    const handleValueChange = useCallback(
        (newValue: string) => {
            onChange(newValue);
            setSearch(''); // Reset search sau khi chọn
        },
        [onChange]
    );

    return (
        <Select value={value} onValueChange={handleValueChange} onOpenChange={handleOpenChange} disabled={disabled}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className="async-select-content">
                <div className="async-select-search">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full border rounded px-2 py-1 text-sm"
                        autoComplete="off"
                        onKeyDown={(e) => {
                            // Chặn phím điều hướng và Enter để ngăn tự động chọn
                            if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].includes(e.key)) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }}
                        onKeyUp={(e) => e.stopPropagation()}
                    />
                </div>

                <div className="async-select-scroll">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            {option.label}
                        </SelectItem>
                    ))}
                    {loading && <div className="p-2 text-center text-sm">Đang tải...</div>}
                    {!loading && options.length === 0 && (
                        <div className="p-2 text-center text-sm text-gray-500">Không tìm thấy danh mục</div>
                    )}
                </div>
            </SelectContent>
        </Select>
    );
}