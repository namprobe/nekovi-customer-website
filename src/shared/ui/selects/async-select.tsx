//src/shared/ui/selects/async-select.tsx
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

    // Lưu option đã chọn
    const selectedOption = options.find((opt) => opt.id === value);

    const loadOptions = useCallback(
        debounce(async (searchValue: string) => {
            setLoading(true);
            try {
                const res = await fetchOptions(searchValue);

                // Filter theo search
                const filtered = res.filter((opt) =>
                    searchValue ? opt.label.toLowerCase().includes(searchValue.toLowerCase()) : true
                );

                // Nếu option đã chọn không có trong filtered, thêm vào đầu
                if (value && value !== 'all' && selectedOption) {
                    const exists = filtered.some((opt) => opt.id === selectedOption.id);
                    if (!exists) filtered.unshift(selectedOption);
                }

                setOptions(filtered);
            } catch (err) {
                console.error('Fetch error:', err);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        [fetchOptions, selectedOption, value]
    );

    // Mở dropdown
    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (open && options.length === 0) {
                loadOptions(''); // chỉ load lần đầu
            }
            if (!open) setSearch('');
        },
        [options.length, loadOptions]
    );

    // Khi value thay đổi và chưa có trong options, thêm vào danh sách
    useEffect(() => {
        if (value && value !== 'all' && !options.find((opt) => opt.id === value)) {
            loadOptions(search);
        }
    }, [value, options, loadOptions, search]);

    // Focus input khi mở
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setSearch(val);
            loadOptions(val);
        },
        [loadOptions]
    );

    const handleValueChange = useCallback(
        (val: string) => {
            onChange(val);
            setSearch('');
        },
        [onChange]
    );

    return (
        <Select
            value={value}
            onValueChange={handleValueChange}
            onOpenChange={handleOpenChange}
            disabled={disabled}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent
                className="async-select-content"
                onKeyDown={(e) => {
                    // Ngăn radix Select xử lý type-to-select
                    const keysToPrevent = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
                    if (keysToPrevent.includes(e.key)) {
                        e.stopPropagation();
                    }
                }}
            >
                <div className="async-select-search">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Tìm kiếm danh mục..."
                        className="
                            w-full px-2 py-1 text-sm rounded
                            border border-input bg-background text-foreground
                            focus:outline-none focus:ring-2 focus:ring-ring
                            placeholder:text-muted-foreground
                        "
                        autoComplete="off"
                        onKeyDown={(e) => e.stopPropagation()}
                    />

                </div>


                <div className="async-select-scroll">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
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
