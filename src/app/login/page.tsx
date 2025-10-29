//src/app/login/page.tsx
"use client"

import Image from "next/image"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { LoginForm } from "@/src/features/auth/components/LoginForm"

export default function LoginPage() {
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

            <LoginForm />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
