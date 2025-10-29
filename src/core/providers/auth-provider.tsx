//src/core/providers/auth-provider.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/src/shared/types"
import { mockUser } from "@/src/core/lib/mock-data"

import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  redirectToLogin: () => void;          // <-- mới
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    const storedUser = localStorage.getItem("nekovi_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    // No auto-login - user starts as not authenticated
  }, [])

  // Redirect to login page
  const redirectToLogin = () => {
    // Lưu URL hiện tại để quay lại sau khi login thành công
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const login = async (email: string, password: string) => {
    // Mock login - always succeeds
    await new Promise((resolve) => setTimeout(resolve, 500))
    setUser(mockUser)
    setIsAuthenticated(true)
    localStorage.setItem("nekovi_user", JSON.stringify(mockUser))
  }

  const register = async (username: string, email: string, password: string) => {
    // Mock registration
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newUser = { ...mockUser, username, email }
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("nekovi_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("nekovi_user")
  }

  const updateProfile = async (data: Partial<User>) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("nekovi_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      redirectToLogin,          // <-- expose
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
