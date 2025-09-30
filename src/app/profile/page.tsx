"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/src/core/providers/auth-provider"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useToast } from "@/src/hooks/use-toast"
import { Badge } from "@/src/components/ui/badge"
import { redirect } from "next/navigation"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()

  if (!user) {
    redirect("/login")
  }

  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    gender: user.gender || undefined,
    dateOfBirth: user.dateOfBirth || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin của bạn đã được cập nhật",
      })
    } catch (error) {
      toast({
        title: "Cập nhật thất bại",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Profile</p>
          <h1 className="text-4xl font-bold text-foreground">Hồ Sơ Của Tôi</h1>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Left side - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Input
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" | undefined })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <Button type="submit" className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800 md:w-auto">
                Lưu
              </Button>
            </form>
          </div>

          {/* Right side - Avatar and VIP */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 text-center">
              <Avatar className="mx-auto h-32 w-32">
                <AvatarImage src={user.avatar || "/anime-fan-avatar.png"} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-2xl font-bold">{user.username}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dung lượng file tối đa 1 MB
                <br />
                Định dạng: JPEG, PNG
              </p>
              <Button variant="outline" className="mt-4 bg-transparent">
                Chọn ảnh
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                  <span className="text-2xl font-bold text-white">VIP</span>
                </div>
                <div>
                  <h3 className="font-semibold">Danh hiệu</h3>
                  <Badge variant="secondary" className="mt-1">
                    Thành viên thường
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
