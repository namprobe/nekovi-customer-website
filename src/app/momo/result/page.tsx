// src/app/momo/result/page.tsx
// Redirect to /payment/return for consistency

"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function MomoResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to /payment/return with all query params
    const queryString = searchParams.toString()
    const redirectUrl = queryString ? `/payment/return?${queryString}&gateway=momo` : "/payment/return?gateway=momo"
    router.replace(redirectUrl)
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

