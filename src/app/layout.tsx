import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/src/core/providers/auth-provider"
import { CartProvider } from "@/src/core/providers/cart-provider"
import { Toaster } from "@/src/components/ui/toaster"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "NekoVi - Cửa hàng Anime & Cosplay",
  description: "Cửa hàng anime, cosplay, figure và phụ kiện chính hãng",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
