// src/entities/auth/service/auth-service.ts

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { apiClient } from "@/src/core/lib/api-client"
import { env } from "@/src/core/config/env"
import type { 
  AuthState, 
  LoginCredentials, 
  LoginRequest, 
  ProfileResponse, 
  AuthResponse,
  RegisterCredentials,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest
} from "../type/auth"
import { GrantTypeEnum } from "@/src/shared/types/common"
import { useCartStore } from "@/src/entities/cart/service"

// Init State - Default values khi app khởi động
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  roles: null,
  tokenExpiresAt: null,
  isHydrated: false,
}

// Singleton refresh timer để tránh multiple refresh calls
let refreshTimerId: NodeJS.Timeout | null = null

// Singleton flag để tránh multiple getProfile calls
let isProfileFetching = false
let profileFetchPromise: Promise<void> | null = null

// Helper functions for token refresh scheduling
const clearRefreshTimer = () => {
  if (refreshTimerId) {
    clearTimeout(refreshTimerId)
    refreshTimerId = null
  }
}

const isTokenExpired = (expiresAt: Date): boolean => {
  try {
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    return currentTime >= expiryTime
  } catch (error) {
    console.error('Error parsing token expiry:', error)
    return true
  }
}

const calculateRefreshTimeout = (expiresAt: Date): number => {
  try {
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    // Refresh 5 minutes before expiry
    const refreshTime = expiryTime - (5 * 60 * 1000)
    const timeUntilRefresh = refreshTime - currentTime
    return Math.max(timeUntilRefresh, 0)
  } catch (error) {
    console.error('Error calculating refresh timeout:', error)
    return 0
  }
}

const scheduleTokenRefresh = (expiresAt: Date, refreshFn: () => Promise<boolean>, logoutFn: () => Promise<void>) => {
  // Clear any existing timer
  clearRefreshTimer()

  // Check if token is already expired
  if (isTokenExpired(expiresAt)) {
    console.log('Token already expired, logging out...')
    logoutFn()
    return
  }

  const refreshTimeout = calculateRefreshTimeout(expiresAt)
  console.log(`[Auth] Token refresh scheduled in ${Math.round(refreshTimeout / 1000 / 60)} minutes`)

  refreshTimerId = setTimeout(async () => {
    console.log('[Auth] Attempting token refresh...')
    const success = await refreshFn()
    if (!success) {
      console.error('[Auth] Token refresh failed, logging out...')
      await logoutFn()
    }
  }, refreshTimeout)
}

// Create Zustand Store với TypeScript
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        //======STATE PROPERTIES======
        ...initialState,

        //======PUBLIC ACTIONS======

        login: async (credentials: LoginCredentials) => {
          try {
            set({ isLoading: true, error: null })

            const loginRequest: LoginRequest = {
              email: credentials.email,
              password: credentials.password,
              grantType: GrantTypeEnum.Password,
            }

            const result = await apiClient.post<AuthResponse>(
              env.ENDPOINTS.AUTH.LOGIN,
              loginRequest
            )

            if (result.isSuccess && result.data) {
              const authData = result.data

              apiClient.setToken(authData.accessToken)

              set({
                token: authData.accessToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                roles: authData.roles,
                tokenExpiresAt: authData.expiresAt
              })

              await get().getProfile()

              if (typeof window !== "undefined") {
                try {
                  await useCartStore.getState().fetchCart({ page: 1, pageSize: 3 })
                } catch (cartError) {
                  console.warn("Unable to prefetch cart after login:", cartError)
                }
              }

              // Schedule automatic token refresh
              scheduleTokenRefresh(authData.expiresAt, get().refreshToken, get().logout)

              return { success: true }
            } else {
              set({
                isLoading: false,
                error: result.message || "Login failed"
              })
              return { 
                success: false, 
                error: result.message || "Login failed",
                errors: result.errors || []
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage, errors: [errorMessage] }
          }
        },

        logout: async () => {
          try {
            await apiClient.post(env.ENDPOINTS.AUTH.LOGOUT)
          } catch (error) {
            console.warn("Logout API failed:", error)
          } finally {
            // Clear refresh timer
            clearRefreshTimer()
            apiClient.clearToken()
            if (typeof window !== "undefined") {
              useCartStore.getState().clearCartState()
            }
            set(initialState)
          }
        },

        register: async (credentials: RegisterCredentials) => {
          try {
            set({ isLoading: true, error: null })

            const formData = new FormData()
            formData.append("email", credentials.email)
            formData.append("password", credentials.password)
            formData.append("confirmPassword", credentials.confirmPassword)
            formData.append("firstName", credentials.firstName)
            formData.append("lastName", credentials.lastName)
            formData.append("phoneNumber", credentials.phoneNumber)
            if (credentials.gender !== undefined) {
              formData.append("gender", credentials.gender.toString())
            }
            if (credentials.dateOfBirth) {
              formData.append("dateOfBirth", credentials.dateOfBirth)
            }

            const result = await apiClient.postFormData(
              env.ENDPOINTS.AUTH.REGISTER,
              formData
            )

            set({ isLoading: false })

            if (result.isSuccess) {
              return { success: true }
            } else {
              set({ error: result.message || "Registration failed" })
              return { 
                success: false, 
                error: result.message || "Registration failed",
                errors: result.errors || []
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage, errors: [errorMessage] }
          }
        },

        verifyOtp: async (request: VerifyOtpRequest) => {
          try {
            set({ isLoading: true, error: null })

            const result = await apiClient.post(
              env.ENDPOINTS.AUTH.VERIFY_OTP,
              request
            )

            set({ isLoading: false })

            if (result.isSuccess) {
              // KHÔNG tự động login - user phải login lại
              return { success: true }
            } else {
              set({ error: result.message || "OTP verification failed" })
              return { 
                success: false, 
                error: result.message || "OTP verification failed",
                errors: result.errors || []
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage, errors: [errorMessage] }
          }
        },

        resetPassword: async (request: ResetPasswordRequest) => {
          try {
            set({ isLoading: true, error: null })

            const result = await apiClient.post(
              env.ENDPOINTS.AUTH.RESET_PASSWORD,
              request
            )

            set({ isLoading: false })

            if (result.isSuccess) {
              return { success: true }
            } else {
              set({ error: result.message || "Password reset failed" })
              return { 
                success: false, 
                error: result.message || "Password reset failed",
                errors: result.errors || []
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage, errors: [errorMessage] }
          }
        },

        changePassword: async (request: ChangePasswordRequest) => {
          try {
            set({ isLoading: true, error: null })

            const result = await apiClient.post(
              env.ENDPOINTS.AUTH.CHANGE_PASSWORD,
              request
            )

            set({ isLoading: false })

            if (result.isSuccess) {
              // After successful password change, backend clears all sessions
              // We need to clear local auth state and trigger logout
              return { success: true, requiresLogout: true }
            } else {
              set({ error: result.message || "Password change failed" })
              return { 
                success: false, 
                error: result.message || "Password change failed",
                errors: result.errors || []
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage, errors: [errorMessage] }
          }
        },

        updateProfile: async (request: UpdateProfileRequest) => {
          try {
            set({ isLoading: true, error: null })

            const formData = new FormData()
            formData.append("firstName", request.firstName)
            formData.append("lastName", request.lastName)
            formData.append("phoneNumber", request.phoneNumber)
            formData.append("gender", request.gender.toString())
            
            if (request.avatar) {
              formData.append("avatar", request.avatar)
            }

            const result = await apiClient.putFormData(
              env.ENDPOINTS.AUTH.UPDATE_PROFILE,
              formData
            )

            set({ isLoading: false })

            if (result.isSuccess) {
              // Let profile page handle the refresh to avoid double call
              return { success: true }
            } else {
              set({ error: result.message || "Profile update failed" })
              return { 
                success: false, 
                error: result.message || "Profile update failed",
                errors: result.errors || []
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network error"
            set({
              isLoading: false,
              error: errorMessage
            })
            return { success: false, error: errorMessage, errors: [errorMessage] }
          }
        },

        refreshToken: async () => {
          try {
            const result = await apiClient.post<AuthResponse>(env.ENDPOINTS.AUTH.REFRESH_TOKEN)

            if (result.isSuccess && result.data) {
              const authData = result.data

              apiClient.setToken(authData.accessToken)
              set({ 
                token: authData.accessToken, 
                isAuthenticated: true,
                tokenExpiresAt: authData.expiresAt 
              })

              // Schedule next automatic token refresh
              scheduleTokenRefresh(authData.expiresAt, get().refreshToken, get().logout)

              return true
            } else {
              await get().logout()
              return false
            }
          } catch (error) {
            console.error('Token refresh error:', error)
            await get().logout()
            return false
          }
        },

        getProfile: async (force = false) => {
          // Nếu đang fetch và không phải force, đợi fetch hiện tại
          if (isProfileFetching && !force) {
            if (profileFetchPromise) {
              await profileFetchPromise
            }
            return
          }

          // Đặt flag và tạo promise
          isProfileFetching = true
          profileFetchPromise = (async () => {
            try {
              const result = await apiClient.get<ProfileResponse>(env.ENDPOINTS.AUTH.PROFILE)

              if (result.isSuccess && result.data) {
                set({ user: result.data })
              } else {
                console.error("Failed to get profile", result.message)
              }
            } catch (error) {
              console.error("Get profile error:", error)
            } finally {
              isProfileFetching = false
              profileFetchPromise = null
            }
          })()

          await profileFetchPromise
        },

        clearError: () => {
          set({ error: null })
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        //======PRIVATE ACTIONS======
        _setUser: (user: ProfileResponse | null) => {
          set({ user })
        },

        _setToken: (token: string | null) => {
          set({ token, isAuthenticated: !!token })
          if (token) {
            apiClient.setToken(token)
          } else {
            apiClient.clearToken()
          }
        },

        _setError: (error: string | null) => {
          set({ error })
        },

        _setHydrated: (hydrated: boolean) => {
          set({ isHydrated: hydrated })
        },

        _reset: () => {
          set(initialState)
        }
      }),
      {
        name: "customer-auth-store",
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          roles: state.roles,
          tokenExpiresAt: state.tokenExpiresAt,
        }),
        onRehydrateStorage: () => (state) => {
          state?._setHydrated(true)
          
          // Schedule token refresh after hydration if user is authenticated
          if (state?.isAuthenticated && state?.tokenExpiresAt) {
            scheduleTokenRefresh(
              state.tokenExpiresAt as Date, 
              state.refreshToken, 
              state.logout
            )
          }
        },
      }
    ),
    {
      name: "customer-auth-store",
    }
  )
)

//=========== SELECTOR HOOKS ===========

export const useAuthUser = () => useAuthStore(state => state.user)
export const useAuthToken = () => useAuthStore(state => state.token)
export const useAuthIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore(state => state.isLoading)
export const useAuthError = () => useAuthStore(state => state.error)
export const useAuthAccessTokenExpiresAt = () => useAuthStore(state => state.tokenExpiresAt)
export const useAuthIsHydrated = () => useAuthStore(state => state.isHydrated)

export const useUserRoles = () => {
  return useAuthStore(state => state.roles) || []
}

export const useUserFullName = () => {
  return useAuthStore(state => {
    if (!state.user) return null
    return `${state.user.firstName} ${state.user.lastName}`.trim()
  })
}

