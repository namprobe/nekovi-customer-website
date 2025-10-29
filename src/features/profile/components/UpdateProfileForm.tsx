"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { useToast } from "@/src/hooks/use-toast"
import { useAuth } from "@/src/core/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Gender } from "@/src/shared/types/common"

export function UpdateProfileForm() {
  const { user, updateProfile, isLoading } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender?.toString() || Gender.Male.toString(),
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || "",
    bio: user?.bio || "",
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Sync formData with user changes (after profile update)
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender?.toString() || Gender.Male.toString(),
        dateOfBirth: user.dateOfBirth?.split('T')[0] || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh (JPG, PNG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước ảnh không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    setAvatarFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ và tên",
        variant: "destructive",
      })
      return
    }

    if (!formData.phoneNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      })
      return
    }

    if (!formData.dateOfBirth) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày sinh",
        variant: "destructive",
      })
      return
    }

    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      gender: parseInt(formData.gender),
      dateOfBirth: formData.dateOfBirth,
      bio: formData.bio,
      avatar: avatarFile || undefined,
    })

    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cá nhân thành công",
      })
      // Dispatch event to trigger profile refresh in page
      window.dispatchEvent(new CustomEvent('profile-updated'))
      // Clear avatar preview after success
      setAvatarPreview(null)
      setAvatarFile(null)
    } else {
      const errorMessage = result.errors && result.errors.length > 0
        ? result.errors.join(", ")
        : result.error || "Cập nhật thông tin thất bại"
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getGenderLabel = (value: string) => {
    const genderValue = parseInt(value)
    switch (genderValue) {
      case Gender.Male: return "Nam"
      case Gender.Female: return "Nữ"
      case Gender.Other: return "Khác"
      default: return "Chọn giới tính"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Thông Tin Cá Nhân</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Cập nhật thông tin cá nhân và ảnh đại diện của bạn
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={avatarPreview || user?.avatarPath || "/anime-fan-avatar.png"} 
            alt={`${user?.firstName} ${user?.lastName}`} 
          />
          <AvatarFallback className="text-2xl">
            {user?.firstName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Chọn ảnh đại diện
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF. Tối đa 5MB
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div className="space-y-2">
          <Label htmlFor="lastName">Họ *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">Tên *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="h-12 bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Số điện thoại *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="h-12"
            placeholder="0901234567"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Giới tính *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Chọn giới tính">
                {getGenderLabel(formData.gender)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.Male.toString()}>Nam</SelectItem>
              <SelectItem value={Gender.Female.toString()}>Nữ</SelectItem>
              <SelectItem value={Gender.Other.toString()}>Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">Tiểu sử</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="min-h-[100px]"
            placeholder="Giới thiệu về bạn..."
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {formData.bio.length}/500 ký tự
          </p>
        </div>
      </div>

      <Button 
        type="submit" 
        className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800 md:w-auto"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          "Lưu thay đổi"
        )}
      </Button>
    </form>
  )
}

