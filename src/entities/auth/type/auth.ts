// src/entities/auth/types.ts

import type { GrantTypeEnum, Gender } from "@/src/shared/types/common"

// ========== Request Types ==========
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
  grantType: GrantTypeEnum
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber: string
  gender?: number
  dateOfBirth?: string
}

export interface VerifyOtpRequest {
  contact: string
  otp: string
  otpType: number
  otpSentChannel: number
}

export interface ResetPasswordRequest {
  contact: string
  newPassword: string
  otpSentChannel: number
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phoneNumber: string
  gender: number
  dateOfBirth: string
  bio: string
  avatar?: File
}

// ========== Response Types ==========
export interface AuthResponse {
  accessToken: string
  roles: string[]
  expiresAt: Date
}

export interface ProfileResponse {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  avatarPath?: string
  gender?: Gender
  dateOfBirth?: string  // ISO date string from API
  bio?: string
}

// ========== State Types ==========
export interface AuthState {
  // State properties
  user: ProfileResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  roles: string[] | null
  tokenExpiresAt: Date | null
  isHydrated: boolean

  // Public actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  logout: () => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  verifyOtp: (request: VerifyOtpRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  resetPassword: (request: ResetPasswordRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  changePassword: (request: ChangePasswordRequest) => Promise<{ success: boolean; requiresLogout?: boolean; error?: string; errors?: string[] }>
  updateProfile: (request: UpdateProfileRequest) => Promise<{ success: boolean; error?: string; errors?: string[] }>
  refreshToken: () => Promise<boolean>
  getProfile: (force?: boolean) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void

  // Private actions (internal use)
  _setUser: (user: ProfileResponse | null) => void
  _setToken: (token: string | null) => void
  _setError: (error: string | null) => void
  _setHydrated: (hydrated: boolean) => void
  _reset: () => void
}

