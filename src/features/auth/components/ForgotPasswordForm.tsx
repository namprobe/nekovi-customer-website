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

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"contact" | "password" | "verify">("contact")
  const [contact, setContact] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otpSentChannel, setOtpSentChannel] = useState(1) // 1 = Email, 2 = SMS
  
  const { resetPassword, verifyOtp, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Step 1: Submit contact (email/phone)
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Detect if contact is email or phone
    const isEmail = contact.includes("@")
    setOtpSentChannel(isEmail ? 1 : 2)
    
    setStep("password")
  }

  // Step 2: Submit password and trigger OTP
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Vui lòng kiểm tra lại mật khẩu",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      })
      return
    }

    // Call reset password API - this sends OTP
    const result = await resetPassword({
      contact: contact,
      newPassword: newPassword,
      otpSentChannel: otpSentChannel,
    })

    if (result.success) {
      toast({
        title: "Mã OTP đã được gửi",
        description: `Vui lòng kiểm tra ${otpSentChannel === 1 ? "email" : "điện thoại"} của bạn`,
      })
      setStep("verify")
    } else {
      const errorMessage = result.errors && result.errors.length > 0 
        ? result.errors.join(", ") 
        : result.error || "Vui lòng thử lại sau"
      
      toast({
        title: "Gửi mã OTP thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Step 3: Verify OTP (password reset happens here)
  const handleVerifyOtp = async (otpCode: string) => {
    const result = await verifyOtp({
      contact: contact,
      otp: otpCode,
      otpType: 2, // PasswordReset
      otpSentChannel: otpSentChannel,
    })

    if (result.success) {
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Bạn có thể đăng nhập với mật khẩu mới",
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

  // Resend OTP
  const handleResendOtp = async () => {
    const result = await resetPassword({
      contact: contact,
      newPassword: newPassword,
      otpSentChannel: otpSentChannel,
    })

    if (result.success) {
      toast({
        title: "Mã OTP đã được gửi lại",
        description: `Vui lòng kiểm tra ${otpSentChannel === 1 ? "email" : "điện thoại"} của bạn`,
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

  // Step 3: Verify OTP
  if (step === "verify") {
    return (
      <>
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-foreground">Xác thực OTP</h1>
          <p className="mt-2 text-muted-foreground">
            Nhập mã OTP đã được gửi đến <span className="font-medium">{contact}</span>
          </p>
        </div>
        <OtpVerificationForm
          email={contact}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          onBack={() => setStep("password")}
          isLoading={isLoading}
        />
      </>
    )
  }

  // Step 2: Enter new password
  if (step === "password") {
    return (
      <>
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-foreground">Đặt mật khẩu mới</h1>
          <p className="mt-2 text-muted-foreground">Nhập mật khẩu mới của bạn</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
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
              minLength={6}
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

          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setStep("contact")} 
            className="w-full"
          >
            Quay lại
          </Button>
        </form>
      </>
    )
  }

  // Step 1: Enter contact
  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-4xl font-bold text-foreground">Quên mật khẩu</h1>
        <p className="mt-2 text-muted-foreground">Nhập email hoặc số điện thoại của bạn</p>
      </div>

      <form onSubmit={handleContactSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contact">Email/Số điện thoại</Label>
          <Input
            id="contact"
            type="text"
            placeholder="Email hoặc số điện thoại"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800"
          disabled={isLoading}
        >
          Tiếp tục
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </>
  )
}

