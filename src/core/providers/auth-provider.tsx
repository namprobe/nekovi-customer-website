"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuthStore } from "@/src/entities/auth/service/auth-service"
import { apiClient } from "@/src/core/lib/api-client"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const token = useAuthStore(state => state.token)
  const isHydrated = useAuthStore(state => state.isHydrated)
  const _setHydrated = useAuthStore(state => state._setHydrated)

  useEffect(() => {
    if (isHydrated && token) {
      apiClient.setToken(token)
    }
  }, [isHydrated, token])

  useEffect(() => {
    _setHydrated(true)
  }, [_setHydrated])

  return <>{children}</>
}

export { useAuth } from "@/src/core/hooks/use-auth"
