"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/src/core/providers/auth-provider"
import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { UpdateProfileForm } from "@/src/features/profile/components/UpdateProfileForm"
import { ChangePasswordForm } from "@/src/features/profile/components/ChangePasswordForm"
import { UserAddressManager } from "@/src/features/profile/components/UserAddressManager"
import { User, Lock, MapPin } from "lucide-react"

const TAB_KEYS = ["profile", "addresses", "security"] as const
type TabKey = (typeof TAB_KEYS)[number]

const isValidTab = (value: string | null): value is TabKey => {
  if (!value) return false
  return (TAB_KEYS as readonly string[]).includes(value)
}

function ProfilePageContent() {
  const { user, getProfile, isAuthenticated, isHydrated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileFetchedRef = useRef(false)
  const [activeTab, setActiveTab] = useState<TabKey>("profile")

  // Always load profile when accessing profile page
  useEffect(() => {
    if (isHydrated && isAuthenticated && !profileFetchedRef.current) {
      profileFetchedRef.current = true
      getProfile(true) // Force refresh to get latest data
    }
  }, [isHydrated, isAuthenticated, getProfile])

  // Listen for profile updates to trigger refresh
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Save current scroll position
      const scrollY = window.scrollY
      
      // Call getProfile to refresh data
      getProfile(true).then(() => {
        // Restore scroll position after data loads
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          window.scrollTo(0, scrollY)
        }, 0)
      })
    }

    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('profile-updated', handleProfileUpdate)
  }, [getProfile])

  // Sync tab with query param
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (isValidTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams, activeTab])

  const handleTabChange = useCallback(
    (value: string) => {
      if (!isValidTab(value)) return
      setActiveTab(value)
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", value)
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">Hồ Sơ Của Tôi</h1>
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Thông tin</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Địa chỉ</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Bảo mật</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <UpdateProfileForm />
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6">
              <UserAddressManager />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <ChangePasswordForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <ProfilePageContent />
    </AuthGuard>
  )
}
