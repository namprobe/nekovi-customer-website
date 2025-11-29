"use client"

import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { OrderListManager } from "@/src/features/order/components/OrderListManager"

function OrdersPageContent() {
  return (
    <MainLayout>
      <OrderListManager />
    </MainLayout>
  )
}

export default function OrdersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrdersPageContent />
    </AuthGuard>
  )
}
