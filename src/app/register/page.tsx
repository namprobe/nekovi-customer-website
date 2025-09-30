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

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Mã OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn",
      })
      setStep("verify")
    } catch (error) {
      toast({
        title: "Gửi mã OTP thất bại",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verify OTP (mock - always succeeds if all fields filled)
      if (otp.every((digit) => digit !== "")) {
        await register(username, email, password)
        toast({
          title: "Đăng ký thành công",
          description: "Chào mừng bạn đến với NekoVi!",
        })
        router.push("/")
      } else {
        throw new Error("Invalid OTP")
      }
    } catch (error) {
      toast({
        title: "Xác thực thất bại",
        description: "Mã OTP không chính xác",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Mã OTP đã được gửi lại",
        description: "Vui lòng kiểm tra email của bạn",
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
              src="/register.png"
              alt="Anime Register"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col justify-center">
            {step === "register" ? (
              <>
                <div className="mb-8 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-foreground">Đăng ký</h1>
                  <p className="mt-2 text-muted-foreground">Điền thông tin tin</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên tài khoản</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Tên tài khoản"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

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
                    {isLoading ? "Đang gửi..." : "Tiếp tục"}
                  </Button>

                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
                      </div>
                    </div>

                    <Button type="button" variant="outline" className="h-12 w-full bg-transparent">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Đăng ký bằng Google
                    </Button>

                    <Button type="button" variant="outline" className="h-12 w-full bg-transparent">
                      <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Đăng ký bằng Facebook
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Đã có tài khoản ?{" "}
                      <Link href="/login" className="font-medium text-primary hover:underline">
                        Đăng nhập
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-foreground">Xác thực OTP</h1>
                  <p className="mt-2 text-muted-foreground">
                    Nhập mã OTP đã được gửi đến <span className="font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Mã OTP</Label>
                    <div className="flex gap-2 justify-center lg:justify-start">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="h-14 w-14 text-center text-xl font-semibold"
                          required
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xác thực..." : "Xác thực"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Không nhận được mã?</p>
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-primary"
                    >
                      Gửi lại mã OTP
                    </Button>
                  </div>

                  <Button type="button" variant="ghost" onClick={() => setStep("register")} className="w-full">
                    Quay lại
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
