/**
 * Formatting utilities
 * Handles UTC time from backend and converts to user's local timezone
 */

/**
 * Normalize UTC date string from backend
 * Backend sends: "2025-11-19T03:45:40.0793879" (UTC but no Z suffix)
 * This ensures it's parsed as UTC, not local time
 */
const normalizeUTCDate = (date: string | Date): Date => {
  if (date instanceof Date) return date
  
  // If string doesn't have timezone indicator, assume it's UTC from backend
  let dateString = String(date).trim()
  
  // If already has Z or timezone offset, use as is
  if (dateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
    return new Date(dateString)
  }
  
  // Backend sends UTC time without Z suffix, add Z to force UTC parsing
  // Remove any trailing milliseconds beyond 3 digits if present
  dateString = dateString.replace(/\.(\d+)$/, (_match, digits) => {
    // Keep only first 3 digits of milliseconds for ISO format
    const ms = digits.substring(0, 3).padEnd(3, '0')
    return `.${ms}`
  })
  
  // Add Z suffix to indicate UTC
  if (!dateString.endsWith('Z')) {
    dateString += 'Z'
  }
  
  return new Date(dateString)
}

/**
 * Format date to Vietnamese locale with automatic timezone conversion
 * Backend sends UTC time, this converts to user's local timezone
 */
export function formatDate(date: string | Date): string {
  try {
    if (!date) return ''

    // TIMEZONE: Lấy múi giờ của người dùng từ trình duyệt
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // LOCALE: Lấy ngôn ngữ/định dạng hiện thị từ trình duyệt
    const userLocale = navigator.language || 'vi-VN'

    // Tùy chọn hiển thị ngày giờ
    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }

    // Normalize và parse UTC date từ backend
    const dateObj = normalizeUTCDate(date)
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date')
    }

    // Hiển thị ngày giờ theo định dạng locale của người dùng và múi giờ của họ
    let formattedDate = dateObj.toLocaleString(userLocale, options)

    // Kiểm tra định dạng và áp dụng định dạng mặc định nếu cần
    if (!formattedDate.includes(':')) {
      // Nếu định dạng không chứa dấu : giữa giờ và phút, dùng định dạng Việt Nam
      formattedDate = dateObj.toLocaleString('vi-VN', options)
    }

    return formattedDate
  } catch (error) {
    console.error('Error formatting date:', error)
    // Fallback an toàn
    return date ? new Date(date).toLocaleString() : ''
  }
}

/**
 * Format date only (no time) with timezone conversion
 */
export function formatDateOnly(date: string | Date): string {
  try {
    if (!date) return ''

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const userLocale = navigator.language || 'vi-VN'

    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }

    // Normalize và parse UTC date từ backend
    const dateObj = normalizeUTCDate(date)
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date')
    }

    return dateObj.toLocaleDateString(userLocale, options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return date ? new Date(date).toLocaleDateString('vi-VN') : ''
  }
}

/**
 * Format date with time (alias for formatDate)
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date)
}

/**
 * Format date with weekday (e.g., "Th 7, 29/11/2025 23:59")
 */
export function formatDateWithWeekday(date: string | Date, includeTime = true): string {
  try {
    if (!date) return ""

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const userLocale = navigator.language || "vi-VN"

    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimeZone,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }

    if (includeTime) {
      options.hour = "2-digit"
      options.minute = "2-digit"
      options.hour12 = false
    }

    const dateObj = normalizeUTCDate(date)
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date")
    }

    return dateObj.toLocaleString(userLocale, options)
  } catch (error) {
    console.error("Error formatting date with weekday:", error)
    return date ? new Date(date).toLocaleString("vi-VN") : ""
  }
}

/**
 * Format time only (HH:mm)
 */
export function formatTimeOnly(date: string | Date): string {
  try {
    if (!date) return ''

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const userLocale = navigator.language || 'vi-VN'

    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }

    // Normalize và parse UTC date từ backend
    const dateObj = normalizeUTCDate(date)
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date')
    }

    return dateObj.toLocaleTimeString(userLocale, options)
  } catch (error) {
    console.error('Error formatting time:', error)
    return ''
  }
}

/**
 * Format order ID to show only last 8 characters
 * @param orderId - Full order ID (UUID)
 * @returns Last 8 characters of the order ID in uppercase
 */
export function formatOrderId(orderId: string): string {
  if (!orderId || orderId.length <= 8) {
    return orderId.toUpperCase()
  }
  return orderId.slice(-8).toUpperCase()
}

/**
 * Format currency (VND)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '0đ'
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount
  
  if (isNaN(numAmount)) return '0đ'
  
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount) + 'đ'
  )
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

/**
 * Get user's timezone
 */
export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get user's locale
 */
export function getUserLocale(): string {
  return navigator.language || 'vi-VN'
}

/**
 * Convert UTC date string to local Date object
 * Backend sends: "2025-11-19T03:45:40.0793879" (UTC but no Z suffix)
 * This creates a proper Date object that respects user's timezone
 */
export function parseUTCDate(utcDateString: string | Date): Date {
  return normalizeUTCDate(utcDateString)
}
