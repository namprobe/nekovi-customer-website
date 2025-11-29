// src/widgets/layout/main-layout.tsx
import type React from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"

import { Toaster } from "sonner"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Toaster position="top-center" richColors />
      <Footer />
    </div>
  )
}
