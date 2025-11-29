"use client"

import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { OrderDetailManager } from "@/src/features/order/components/OrderDetailManager"

function OrderDetailPageContent({ params }: { params: { id: string } }) {
    return (
      <MainLayout>
      <OrderDetailManager orderId={params.id} />
      </MainLayout>
    )
  }

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard requireAuth={true}>
      <OrderDetailPageContent params={params} />
    </AuthGuard>
  )
}
