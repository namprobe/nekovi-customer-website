import { env } from "../config/env"
import type { ApiResult, PaginateResult } from "../../shared/types/common"

// Type guard for API response
function isApiResponse(data: unknown): data is {
  isSuccess?: boolean
  data?: unknown
  message?: string
  errors?: string[]
  errorCode?: string
} {
  return typeof data === 'object' && data !== null
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  [key: string]: string | number | boolean | undefined
}

//Note
//Trong Next.js, code có thể chạy cả server (Node.js) lẫn client (trình duyệt).
//Ở server-side, đối tượng window (vốn chỉ có trong browser) không tồn tại 
// → nếu gọi thẳng window.localStorage thì sẽ bị lỗi ReferenceError: window is not defined.
//Do đó người ta check typeof window !== "undefined" để đảm bảo code chỉ chạy khi đang ở client-side (trình duyệt).
class ApiClient {
  private token: string | null = null
  private baseURL: string
  private refreshingPromise: Promise<boolean> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL

    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  //Token management
  setToken(token: string): void {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken(): void {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  getToken(): string | null {
    return this.token
  }
  // Header with token management
  private getHeaders() {
    // header is a hashmap of key-value pairs record
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  //Core request method with error handling
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    //cú pháp object destructuring với default value + rest operator (ES6)
    //Lấy ra một vài field chính (timeout, retries) với giá trị mặc định.
    //Gom phần còn lại (method, headers...) vào một object riêng (fetchOptions).
    const { timeout = 30000, retries = 1, ...fetchOptions } = options
    const url = `${this.baseURL}${endpoint}`
    
    // Debug log for URL construction (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 API Request:', { baseURL: this.baseURL, endpoint, finalURL: url })
    }
    // Tạo controller để quản lý việc hủy request
    const controller = new AbortController()

    // Đặt timeout → nếu quá thời gian thì tự động hủy request
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Gửi request bằng fetch
      // - url: endpoint cần gọi
      // - fetchOptions: config request (method, body, headers...)
      // - headers: gộp giữa headers mặc định + headers từ fetchOptions
      // - signal: cho phép request bị hủy qua controller
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.getHeaders(),
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      })

      // Nếu request xong thì xóa timeout
      clearTimeout(timeoutId)

      //parse response
      //content-type: application/json || text/plain || application/octet-stream || ...
      let responseData: unknown
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = { message: await response.text() }
      }

      // Handle token expiration - auto refresh
      if (response.status === 401 && this.token) {
        const refreshed = await this.handleTokenRefresh()
        if (refreshed && retries > 0) {
          // Retry với token mới
          return this.request<T>(endpoint, { ...options, retries: retries - 1 })
        }
      }

      // Success response
      if (response.ok) {
        const apiData = isApiResponse(responseData) ? responseData : { data: responseData }
        return {
          isSuccess: true,
          data: (apiData.data || responseData) as T,
          message: apiData.message || "Success",
        }
      }

      // Error response - match with backend Result pattern
      const apiError = isApiResponse(responseData) ? responseData : {}
      return {
        isSuccess: false,
        message: apiError.message || `HTTP ${response.status}: ${response.statusText}`,
        errors: apiError.errors || [],
        errorCode: apiError.errorCode || response.status.toString(),
      }
    } catch (error) {
      // Nếu có lỗi xảy ra thì xóa timeout và trả về kết quả lỗi
      clearTimeout(timeoutId)
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          isSuccess: false,
          message: "Request timeout",
          errors: ["Request took too long to complete"],
          errorCode: "TIMEOUT",
        }
      }

      return {
        isSuccess: false,
        message: "Network error occurred",
        errors: [error instanceof Error ? error.message : "Unknown network error"],
        errorCode: "NETWORK_ERROR",
      }
    }
  }

  //Handle token refresh
  private async handleTokenRefresh(): Promise<boolean> {
    if (this.refreshingPromise) {
      return await this.refreshingPromise
    }

    this.refreshingPromise = this.performTokenRefresh()
    const result = await this.refreshingPromise
    this.refreshingPromise = null

    return result
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${env.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: "POST",
        headers: this.getHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.isSuccess && data.data?.accessToken) {
          this.setToken(data.data.accessToken)
          return true
        }
      }

      //refresh failed, clear token
      this.clearToken()
      return false
    } catch (error) {
      console.error("Token refresh failed:", error)
      this.clearToken()
      return false
    }
  }

  //Http Methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body: data ? JSON.stringify(data) : undefined })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: data ? JSON.stringify(data) : undefined })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: data ? JSON.stringify(data) : undefined })
  }

  // FormData methods for file uploads và multipart/form-data
  async postFormData<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.requestFormData<T>(endpoint, formData, "POST", options)
  }

  async putFormData<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.requestFormData<T>(endpoint, formData, "PUT", options)
  }

  async patchFormData<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.requestFormData<T>(endpoint, formData, "PATCH", options)
  }

  // Core method for FormData requests
  private async requestFormData<T>(
    endpoint: string, 
    formData: FormData, 
    method: string,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    const { timeout = 30000, retries = 1, ...fetchOptions } = options
    const url = `${this.baseURL}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Lấy headers nhưng bỏ Content-Type để browser tự set cho FormData
      const headers = this.getHeaders()
      delete headers["Content-Type"] // Browser sẽ tự set multipart/form-data với boundary

      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Parse response
      let responseData: unknown
      const contentType = response.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = { message: await response.text() }
      }

      // Handle token expiration
      if (response.status === 401 && this.token) {
        const refreshed = await this.handleTokenRefresh()
        if (refreshed && retries > 0) {
          return this.requestFormData<T>(endpoint, formData, method, { ...options, retries: retries - 1 })
        }
      }

      // Success response
      if (response.ok) {
        const apiData = isApiResponse(responseData) ? responseData : { data: responseData }
        return {
          isSuccess: true,
          data: (apiData.data || responseData) as T,
          message: apiData.message || "Success",
        }
      }

      // Error response
      const apiError = isApiResponse(responseData) ? responseData : {}
      return {
        isSuccess: false,
        message: apiError.message || `HTTP ${response.status}: ${response.statusText}`,
        errors: apiError.errors || [],
        errorCode: apiError.errorCode || response.status.toString(),
      }

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          isSuccess: false,
          message: "Request timeout",
          errors: ["Request took too long to complete"],
          errorCode: "TIMEOUT",
        }
      }

      return {
        isSuccess: false,
        message: "Network error occurred",
        errors: [error instanceof Error ? error.message : "Unknown network error"],
        errorCode: "NETWORK_ERROR",
      }
    }
  }

  // Paginated request - Backend trả về PaginateResult trực tiếp (không wrap trong ApiResult)
  async paginate<T>(endpoint: string, params?: PaginationParams, options?: RequestOptions): Promise<PaginateResult<T>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    //build url with search params
    const url = searchParams.toString() ? `${endpoint}?${searchParams.toString()}` : endpoint
    
    // Direct fetch vì backend trả về PaginateResult trực tiếp
    const { timeout = 30000, retries = 1, ...fetchOptions } = options || {}
    const fullUrl = `${this.baseURL}${url}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        method: "GET",
        headers: {
          ...this.getHeaders(),
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle token expiration
      if (response.status === 401 && this.token) {
        const refreshed = await this.handleTokenRefresh()
        if (refreshed && retries > 0) {
          return this.paginate<T>(endpoint, params, { ...options, retries: retries - 1 })
        }
      }

      // Parse response
      let responseData: unknown
      const contentType = response.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        throw new Error("Invalid response format")
      }

      // Success - backend trả về PaginateResult trực tiếp
      if (response.ok) {
        return responseData as PaginateResult<T>
      }

      // Error response - transform thành PaginateResult
      const apiError = isApiResponse(responseData) ? responseData : {}
      return {
        isSuccess: false,
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        hasPrevious: false,
        hasNext: false,
        errors: apiError.errors || [apiError.message || "Request failed"],
        errorCode: apiError.errorCode || response.status.toString(),
      }

    } catch (error) {
      clearTimeout(timeoutId)
      
      return {
        isSuccess: false,
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        hasPrevious: false,
        hasNext: false,
        errors: [error instanceof Error ? error.message : "Network error"],
        errorCode: "NETWORK_ERROR",
      }
    }
  }
  
  // File upload with progress
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResult<T>> {
    return new Promise((resolve) => {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener("load", async () => {
        try {
          const responseData = JSON.parse(xhr.responseText)
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              isSuccess: true,
              data: responseData.data || responseData,
              message: responseData.message || "Upload successful",
            })
          } else {
            resolve({
              isSuccess: false,
              message: responseData.message || "Upload failed",
              errors: responseData.errors || [],
              errorCode: responseData.errorCode || xhr.status.toString(),
            })
          }
        } catch {
          resolve({
            isSuccess: false,
            message: "Upload failed",
            errors: ["Failed to parse response"],
            errorCode: "PARSE_ERROR",
          })
        }
      })

      xhr.addEventListener("error", () => {
        resolve({
          isSuccess: false,
          message: "Upload failed",
          errors: ["Network error during upload"],
          errorCode: "NETWORK_ERROR",
        })
      })

      xhr.open("POST", `${this.baseURL}${endpoint}`)
      
      // Add auth header if available
      if (this.token) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.token}`)
      }

      xhr.send(formData)
    })
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.get("/health", { timeout: 5000 })
      return result.isSuccess
    } catch {
      return false
    }
  }
}
// Create instances for different API bases
export const customerApiClient = new ApiClient(env.BASE_URL + env.CUSTOMER_PREFIX)
export const commonApiClient = new ApiClient(env.BASE_URL + env.COMMON_PREFIX)

// Default export cho Customer (primary usage)
export const apiClient = customerApiClient
export default apiClient



