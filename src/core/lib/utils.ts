import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe string helper to prevent charAt errors
export function safeString(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

// Safe charAt function
export function safeCharAt(str: unknown, index: number): string {
  const safeStr = safeString(str)
  return safeStr.charAt ? safeStr.charAt(index) : ''
}
