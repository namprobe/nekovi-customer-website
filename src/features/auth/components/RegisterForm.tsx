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
import { OtpVerificationForm } from "./OtpVerificationForm"

export function RegisterForm() {
  const [step, setStep] = useState<"register" | "verify">("register")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const { register, verifyOtp, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu không khớp",
        variant: "destructive",
      })
      return
    }

    const result = await register({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
    })

    if (result.success) {
      toast({
        title: "Mã OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn",
      })
      setStep("verify")
    } else {
      // Hiển thị chi tiết lỗi từ backend
      const errorMessage = result.errors && result.errors.length > 0 
        ? result.errors.join(", ") 
        : result.error || "Vui lòng thử lại sau"
      
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    const result = await verifyOtp({
      contact: email,
      otp: otpCode,
      otpType: 1, // Registration
      otpSentChannel: 1, // Email
    })

    if (result.success) {
      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng đăng nhập để tiếp tục",
      })
      router.push("/login")
    } else {
      const errorMessage = result.errors && result.errors.length > 0 
        ? result.errors.join(", ") 
        : result.error || "Mã OTP không chính xác"
      
      toast({
        title: "Xác thực thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleResendOtp = async () => {
    const result = await register({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
    })

    if (result.success) {
      toast({
        title: "Mã OTP đã được gửi lại",
        description: "Vui lòng kiểm tra email của bạn",
      })
    } else {
      const errorMessage = result.errors && result.errors.length > 0 
        ? result.errors.join(", ") 
        : result.error || "Vui lòng thử lại sau"
      
      toast({
        title: "Gửi lại mã OTP thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (step === "verify") {
    return (
      <>
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-foreground">Xác thực OTP</h1>
          <p className="mt-2 text-muted-foreground">
            Nhập mã OTP đã được gửi đến <span className="font-medium">{email}</span>
          </p>
        </div>
        <OtpVerificationForm
          email={email}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          onBack={() => setStep("register")}
          isLoading={isLoading}
        />
      </>
    )
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-4xl font-bold text-foreground">Đăng ký</h1>
        <p className="mt-2 text-muted-foreground">Điền thông tin tin</p>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Tên</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Tên"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Họ</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Họ"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Số điện thoại</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
  )
}

