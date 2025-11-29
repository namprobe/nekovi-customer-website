// src/components/auth/auth-guard.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/core/providers/auth-provider"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  fallbackUrl?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallbackUrl = "/login",
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return // Wait for client-side mount

    // DEBUG: Log state to help debugging
    console.log('🔒 AuthGuard State:', {
      isLoading,
      isAuthenticated,
      isMounted,
      requireAuth,
      hasUser: !!user
    })

    if (isLoading) {
      console.log('🔒 Still loading...')
      return
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login')
      router.push(fallbackUrl)
      return
    }
  }, [isMounted, isLoading, isAuthenticated, user, requireAuth, router, fallbackUrl])

  // Show loading spinner while mounting or loading
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {!isMounted ? "Loading..." : "Authenticating..."}
          </p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}

