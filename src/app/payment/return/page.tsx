// src/app/payment/return/page.tsx

"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { CheckCircle2, XCircle, Loader2, Package, User, Receipt, Calendar } from "lucide-react"
import { useCartStore } from "@/src/entities/cart/service"
import { formatDateTime, formatCurrency as formatCurrencyUtil } from "@/src/shared/utils/format"

interface PaymentMetadata {
  CustomerName?: string
  ProductNames?: string
  TotalAmount?: string
  FinalAmount?: string
  OrderId?: string
  CreatedAt?: string
}

function PaymentReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchCart } = useCartStore()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")
  const [metadata, setMetadata] = useState<PaymentMetadata | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [amount, setAmount] = useState<string | null>(null)

  // Helper function to decode Base64 and parse JSON from extraData
  const decodeExtraData = (extraData: string | null): PaymentMetadata | null => {
    if (!extraData) return null
    
    try {
      // Decode Base64
      const decodedString = atob(extraData)
      // Parse JSON
      const parsed = JSON.parse(decodedString) as PaymentMetadata
      return parsed
    } catch (error) {
      console.error("Error decoding extraData:", error)
      return null
    }
  }


  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const gateway = searchParams.get("gateway") || "vnpay" // Default to vnpay for backward compatibility

        if (gateway === "momo") {
          // MoMo redirect parameters
          const resultCode = searchParams.get("resultCode")
          const message = searchParams.get("message")
          const orderIdParam = searchParams.get("orderId")
          const transId = searchParams.get("transId")
          const amountParam = searchParams.get("amount")
          const extraData = searchParams.get("extraData")

          // Decode metadata from extraData
          const decodedMetadata = decodeExtraData(extraData)
          if (decodedMetadata) {
            setMetadata(decodedMetadata)
            // Use OrderId from metadata if available, otherwise use from query params
            setOrderId(decodedMetadata.OrderId || orderIdParam)
            // Use FinalAmount from metadata if available, otherwise use amount from query params
            setAmount(decodedMetadata.FinalAmount || amountParam)
          } else {
            setOrderId(orderIdParam)
            setAmount(amountParam)
          }

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

          setOrderId(vnp_TxnRef)
          if (vnp_Amount) {
            // VNPay amount is in cents, convert to VND
            const amountInVnd = parseFloat(vnp_Amount) / 100
            setAmount(amountInVnd.toString())
          }

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
                  {/* Payment Details Section */}
                  {(metadata || orderId || amount) && (
                    <div className="border-t pt-4 space-y-3">
                      <h3 className="font-semibold text-lg mb-3">Chi tiết đơn hàng</h3>
                      
                      {orderId && (
                        <div className="flex items-start gap-3">
                          <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                            <p className="font-medium">{orderId}</p>
                          </div>
                        </div>
                      )}

                      {metadata?.CustomerName && (
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Khách hàng</p>
                            <p className="font-medium">{metadata.CustomerName}</p>
                          </div>
                        </div>
                      )}

                      {metadata?.ProductNames && (
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Sản phẩm</p>
                            <p className="font-medium">{metadata.ProductNames}</p>
                          </div>
                        </div>
                      )}

                      {metadata?.CreatedAt && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                            <p className="font-medium">{formatDateTime(metadata.CreatedAt)}</p>
                          </div>
                        </div>
                      )}

                      {metadata?.TotalAmount && metadata?.FinalAmount && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tổng tiền:</span>
                            <span>{formatCurrencyUtil(metadata.TotalAmount)}</span>
                          </div>
                          {parseFloat(metadata.TotalAmount.replace(/,/g, "")) > parseFloat(metadata.FinalAmount.replace(/,/g, "")) && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Giảm giá:</span>
                              <span>
                                -{formatCurrencyUtil(
                                  (
                                    parseFloat(metadata.TotalAmount.replace(/,/g, "")) -
                                    parseFloat(metadata.FinalAmount.replace(/,/g, ""))
                                  ).toString()
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Thành tiền:</span>
                            <span className="text-primary">{formatCurrencyUtil(metadata.FinalAmount)}</span>
                          </div>
                        </div>
                      )}

                      {!metadata?.FinalAmount && amount && (
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Thành tiền:</span>
                          <span className="text-primary">{formatCurrencyUtil(amount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 justify-center pt-4">
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

