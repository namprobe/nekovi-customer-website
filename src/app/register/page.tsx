//src/app/register/page.tsx
"use client"

import Image from "next/image"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { RegisterForm } from "@/src/features/auth/components/RegisterForm"

export default function RegisterPage() {
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
            <RegisterForm />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
