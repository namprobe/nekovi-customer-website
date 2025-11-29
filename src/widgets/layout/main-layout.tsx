// src/widgets/layout/main-layout.tsx
import type React from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"

import { QueryProvider } from "@/src/core/providers/query-provider";
import { AuthProvider } from "@/src/core/providers/auth-provider";

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <QueryProvider>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </QueryProvider>
    </div>
  )
}
