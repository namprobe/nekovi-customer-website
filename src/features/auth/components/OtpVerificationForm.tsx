"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

interface OtpVerificationFormProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  isLoading: boolean
}

export function OtpVerificationForm({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép số
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]

    // Xử lý paste
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('')
      for (let i = 0; i < pastedData.length && index + i < 6; i++) {
        newOtp[index + i] = pastedData[i]
      }
      setOtp(newOtp)
      
      // Focus vào ô cuối cùng được điền
      const lastFilledIndex = Math.min(index + pastedData.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      return
    }

    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      
      // Focus vào ô cuối cùng
      const lastIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length === 6) {
      await onVerify(otpCode)
    }
  }

  const handleResend = async () => {
    if (canResend && !isLoading) {
      await onResend()
      setCountdown(60)
      setCanResend(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Mã OTP</Label>
        <div className="flex gap-2 justify-center lg:justify-start">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="h-14 w-14 text-center text-xl font-semibold"
              required
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-teal-700 text-white hover:bg-teal-800"
        disabled={isLoading || otp.some(digit => !digit)}
      >
        {isLoading ? "Đang xác thực..." : "Xác thực"}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {canResend ? "Không nhận được mã?" : `Gửi lại sau ${countdown}s`}
        </p>
        <Button
          type="button"
          variant="link"
          onClick={handleResend}
          disabled={!canResend || isLoading}
          className="text-primary"
        >
          Gửi lại mã OTP
        </Button>
      </div>

      <Button type="button" variant="ghost" onClick={onBack} className="w-full">
        Quay lại
      </Button>
    </form>
  )
}

