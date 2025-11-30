// src/shared/ui/inputs/SearchInput.tsx
"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export const SearchInput = forwardRef<{ focus: () => void }, SearchInputProps>(
    ({ value, onChange, placeholder = "Tìm kiếm...", onClear }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => ({
            focus: () => inputRef.current?.focus(),
        }));

        return (
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {value && (
                    <button
                        onClick={() => {
                            onChange("");
                            onClear?.();
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = "SearchInput";