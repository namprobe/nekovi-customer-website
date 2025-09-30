"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/src/hooks/use-toast"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
        toast({
          title: "Xác thực thành công",
          description: "Vui lòng đặt mật khẩu mới",
        })
        setStep("reset")
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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Vui lòng kiểm tra lại mật khẩu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Bạn có thể đăng nhập với mật khẩu mới",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: "Vui lòng thử lại sau",
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
              src="/tanjiro-sword-glowing.jpg"
              alt="Forgot Password"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col justify-center">
            {step === "email" && (
              <>
                <div className="mb-8 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-foreground">Quên mật khẩu</h1>
                  <p className="mt-2 text-muted-foreground">Nhập email của bạn để nhận mã xác thực</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
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

                  <Button
                    type="submit"
                    className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </form>
              </>
            )}

            {step === "verify" && (
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

                  <Button type="button" variant="ghost" onClick={() => setStep("email")} className="w-full">
                    Quay lại
                  </Button>
                </form>
              </>
            )}

            {step === "reset" && (
              <>
                <div className="mb-8 text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-foreground">Đặt lại mật khẩu</h1>
                  <p className="mt-2 text-muted-foreground">Nhập mật khẩu mới của bạn</p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
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
