// src/shared/utils/image.ts

import { env } from "@/src/core/config/env"

/**
 * Convert relative image path to full URL
 * @param path - Relative path from backend (e.g., "/uploads/badge/image.png")
 * @returns Full URL (e.g., "https://localhost:7252/uploads/badge/image.png")
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return "/placeholder.svg"
  }

  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  // Remove leading slash if present
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  // Combine with BASE_URL
  return `${env.BASE_URL}/${normalizedPath}`
}

/**
 * Get badge icon URL
 */
export function getBadgeIconUrl(iconPath: string | null | undefined): string {
  return getImageUrl(iconPath)
}

/**
 * Get product image URL
 */
export function getProductImageUrl(imagePath: string | null | undefined): string {
  return getImageUrl(imagePath)
}
