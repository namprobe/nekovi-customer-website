"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/hooks/use-toast"
import { useAuth } from "@/src/core/providers/auth-provider"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function ChangePasswordForm() {
  const router = useRouter()
  const { changePassword, logout, isLoading } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp",
        variant: "destructive",
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive",
      })
      return
    }

    const result = await changePassword(formData)

    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã thay đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      })
      
      // Backend clears all sessions after password change
      // Clear local auth state and redirect to login
      if (result.requiresLogout) {
        setTimeout(() => {
          logout()
          router.push("/login")
        }, 1500) // Give user time to see success message
      }
    } else {
      const errorMessage = result.errors && result.errors.length > 0
        ? result.errors.join(", ")
        : result.error || "Đổi mật khẩu thất bại"
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Đổi Mật Khẩu</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="h-12 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            >
              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="h-12 pr-10"
              required
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            >
              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Ít nhất 6 ký tự</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="h-12 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
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
            Đang xử lý...
          </>
        ) : (
          "Đổi mật khẩu"
        )}
      </Button>
    </form>
  )
}

