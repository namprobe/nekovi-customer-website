// src/app/payment/return/page.tsx

"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useCartStore } from "@/src/entities/cart/service"

function PaymentReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchCart } = useCartStore()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const gateway = searchParams.get("gateway") || "vnpay" // Default to vnpay for backward compatibility

        if (gateway === "momo") {
          // MoMo redirect parameters
          const resultCode = searchParams.get("resultCode")
          const message = searchParams.get("message")
          const orderId = searchParams.get("orderId")
          const transId = searchParams.get("transId")
          const amount = searchParams.get("amount")

          // MoMo: resultCode = 0 means success
          const isSuccess = resultCode === "0"

          if (isSuccess) {
            setStatus("success")
            setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xử lý.")
            
            // Refresh cart to get updated state (backend đã xóa cart items khi order thành công)
            await fetchCart({ page: 1, pageSize: 6 })
          } else {
            setStatus("failed")
            const errorCode = resultCode || "Unknown"
            const errorMessage = message || "Thanh toán thất bại"
            setMessage(`${errorMessage}. Mã lỗi: ${errorCode}`)
          }
        } else {
          // VNPay parameters
          const vnp_ResponseCode = searchParams.get("vnp_ResponseCode")
          const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus")
          const vnp_TxnRef = searchParams.get("vnp_TxnRef")
          const vnp_TransactionNo = searchParams.get("vnp_TransactionNo")
          const vnp_Amount = searchParams.get("vnp_Amount")
          const vnp_OrderInfo = searchParams.get("vnp_OrderInfo")

          // Check payment result
          const isSuccess = vnp_ResponseCode === "00" && vnp_TransactionStatus === "00"

          if (isSuccess) {
            setStatus("success")
            setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xử lý.")
            
            // Refresh cart to get updated state (backend đã xóa cart items khi order thành công)
            await fetchCart({ page: 1, pageSize: 6 })
          } else {
            setStatus("failed")
            const errorCode = vnp_ResponseCode || vnp_TransactionStatus || "Unknown"
            setMessage(`Thanh toán thất bại. Mã lỗi: ${errorCode}`)
          }
        }
      } catch (error) {
        setStatus("failed")
        setMessage("Có lỗi xảy ra khi xử lý kết quả thanh toán")
      }
    }

    processPaymentReturn()
  }, [searchParams, fetchCart])

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                {status === "loading" && (
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                )}
                {status === "success" && (
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                )}
                {status === "failed" && (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-center">
                {status === "loading" && "Đang xử lý..."}
                {status === "success" && "Thanh toán thành công"}
                {status === "failed" && "Thanh toán thất bại"}
              </CardTitle>
              <CardDescription className="text-center">{message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status !== "loading" && (
                <>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push("/orders")} variant="default">
                      Xem đơn hàng
                    </Button>
                    <Button onClick={() => router.push("/products")} variant="outline">
                      Tiếp tục mua sắm
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </MainLayout>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  )
}

