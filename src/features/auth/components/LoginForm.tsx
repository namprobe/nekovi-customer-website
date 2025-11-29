"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useToast } from "@/src/hooks/use-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await login({ email, password })

    if (result.success) {
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      })
      router.push("/")
    } else {
      const errorMessage = result.errors && result.errors.length > 0
        ? result.errors.join(", ")
        : result.error || "Vui lòng kiểm tra lại thông tin đăng nhập"

      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email/Số điện thoại</Label>
        <Input
          id="email"
          type="text"
          placeholder="Email/Số điện thoại"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800"
        disabled={isLoading}
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Quên mật khẩu
        </Link>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản ?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </form>
  )
}

