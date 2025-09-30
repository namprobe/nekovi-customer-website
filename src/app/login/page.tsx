"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useToast } from "@/src/hooks/use-toast"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left side - Image */}
          <div className="relative hidden aspect-[3/4] overflow-hidden rounded-2xl lg:block">
            <Image
              src="/login.png"
              alt="Demon Slayer Login"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-8 text-center lg:text-left">
              <p className="mb-2 text-sm font-medium text-primary">Profile</p>
              <h1 className="text-4xl font-bold text-foreground">Đăng nhập ngay</h1>
              <p className="mt-2 text-muted-foreground">Điền thông tin tin bên dưới</p>
            </div>

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
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
