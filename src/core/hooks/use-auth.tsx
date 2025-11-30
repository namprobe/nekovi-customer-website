// src/core/hooks/use-auth.tsx
"use client"

import { useEffect, useCallback, useRef } from 'react'
import {
    useAuthStore,
    useAuthUser,
    useAuthToken,
    useAuthIsAuthenticated,
    useAuthLoading,
    useAuthError,
    useUserRoles,
    useUserFullName,
    useAuthAccessTokenExpiresAt,
    useAuthIsHydrated,
} from "@/src/entities/auth/service/auth-service"
import { apiClient } from "@/src/core/lib/api-client"

/**
 * Enhanced useAuth Hook - Wrapper around Zustand store
 * Provides convenient access to auth state and actions
 */
export function useAuth() {
    const login = useAuthStore(state => state.login)
    const logout = useAuthStore(state => state.logout)
    const register = useAuthStore(state => state.register)
    const verifyOtp = useAuthStore(state => state.verifyOtp)
    const resetPassword = useAuthStore(state => state.resetPassword)
    const changePassword = useAuthStore(state => state.changePassword)
    const updateProfile = useAuthStore(state => state.updateProfile)
    const getProfile = useAuthStore(state => state.getProfile)
    const clearError = useAuthStore(state => state.clearError)
    const refreshToken = useAuthStore(state => state.refreshToken)

    const user = useAuthUser()
    const token = useAuthToken()
    const isAuthenticated = useAuthIsAuthenticated()
    const isLoading = useAuthLoading()
    const error = useAuthError()
    const userFullName = useUserFullName()
    const userRoles = useUserRoles()
    const accessTokenExpiresAt = useAuthAccessTokenExpiresAt()
    const isHydrated = useAuthIsHydrated()

    // Use ref to prevent multiple initialization calls
    // Note: This ref is per-component instance, singleton logic is in auth-service.ts
    const initializedRef = useRef(false)

    const initializeAuth = useCallback(async () => {
        // Prevent multiple calls per component instance
        if (initializedRef.current) return

        try {
            if (token) {
                apiClient.setToken(token)

                // Only fetch if user is null and we're authenticated
                // getProfile() has singleton logic to prevent multiple calls
                if (!user && isAuthenticated) {
                    await getProfile()
                }
            }
        } catch (error) {
            console.error('Auth initialization failed:', error)
            await logout()
        } finally {
            initializedRef.current = true
        }
    }, [token, user, isAuthenticated, getProfile, logout])

    useEffect(() => {
        if (isHydrated && token && !initializedRef.current) {
            initializeAuth()
        }
    }, [isHydrated, token, initializeAuth])

    // Reset initialized flag when logged out to allow re-initialization after login
    useEffect(() => {
        if (!isAuthenticated && !token) {
            initializedRef.current = false
        }
    }, [isAuthenticated, token])

    // Note: Token refresh scheduling is now handled in the Zustand store (auth-service.ts)
    // to prevent multiple refresh calls when multiple components mount

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        userFullName,
        userRoles,
        accessTokenExpiresAt,
        isHydrated,

        login,
        logout,
        register,
        verifyOtp,
        resetPassword,
        changePassword,
        updateProfile,
        getProfile,
        clearError,
        refreshToken,

        initializeAuth,
    }
}

export {
    useAuthUser,
    useAuthToken,
    useAuthIsAuthenticated,
    useAuthLoading,
    useAuthError,
    useUserRoles,
    useUserFullName
}

