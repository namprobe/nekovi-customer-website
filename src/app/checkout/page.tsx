"use client"

import { MainLayout } from "@/src/widgets/layout/main-layout"
import { CheckoutManager } from "@/src/features/checkout/components"

export default function CheckoutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <CheckoutManager />
      </div>
    </MainLayout>
  )
}
