// src/features/productReview/ProductReviewDialog.tsx

"use client"

import { useEffect, useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/hooks/use-toast";
import { productReviewService } from "@/src/entities/productReview/service/product-review-service"
import { ProductReviewItem } from "@/src/entities/productReview/type/product-review"
import Image from "next/image"

interface ProductReviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    productId: string
    orderId: string
    productName: string
    productImage?: string
}

interface ReviewFormValues {
    title: string
    comment: string
}

export function ProductReviewDialog({
    open,
    onOpenChange,
    productId,
    orderId,
    productName,
    productImage,
}: ProductReviewDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingReview, setExistingReview] = useState<ProductReviewItem | null>(null)

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)

    const { register, handleSubmit, reset, setValue } = useForm<ReviewFormValues>()

    useEffect(() => {
        if (open && productId && orderId) {
            checkExistingReview()
        } else if (!open) {
            // Reset form khi đóng
            setTimeout(() => {
                setExistingReview(null)
                setRating(0)
                reset()
            }, 300)
        }
    }, [open, productId, orderId])

    const checkExistingReview = async () => {
        setIsLoading(true)
        try {
            const response = await productReviewService.getMyReview({ productId, orderId })

            // Logic hiển thị: Chỉ hiện review cũ nếu isSuccess = true VÀ có value
            if (response.isSuccess && response.value) {
                setExistingReview(response.value)
                setRating(response.value.rating)
                setValue("title", response.value.title || "")
                setValue("comment", response.value.comment || "")
            } else {
                setExistingReview(null)
                setRating(0)
                reset()
            }
        } catch (error) {
            console.warn("Error/NotFound checking review:", error);
            // Nếu lỗi, mặc định cho phép tạo mới
            setExistingReview(null)
            setRating(0)
            reset()
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (data: ReviewFormValues) => {
        if (rating === 0) {
            toast({
                variant: "destructive",
                title: "Vui lòng chọn số sao",
                description: "Bạn cần chọn mức đánh giá từ 1 đến 5 sao.",
            })
            return
        }

        if (!productId || !orderId) {
            toast({
                variant: "destructive",
                title: "Lỗi dữ liệu",
                description: "Thiếu thông tin sản phẩm hoặc đơn hàng.",
            })
            return;
        }

        setIsSubmitting(true)
        try {
            // Đảm bảo rating là số nguyên
            const payload = {
                productId: productId,
                orderId: orderId,
                rating: Number(rating),
                title: data.title,
                comment: data.comment,
                status: 1,
            };

            await productReviewService.create(payload)

            toast({
                title: "Đánh giá thành công",
                description: "Cảm ơn bạn đã đánh giá sản phẩm!",
            })
            onOpenChange(false)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: error.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }


    const renderStars = (isReadOnly: boolean) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = isReadOnly
                        ? star <= rating
                        : star <= (hoverRating || rating)

                    return (
                        <button
                            key={star}
                            type="button"
                            disabled={isReadOnly}
                            className={`transition-colors duration-200 ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                            onMouseEnter={() => !isReadOnly && setHoverRating(star)}
                            onMouseLeave={() => !isReadOnly && setHoverRating(0)}
                            onClick={() => !isReadOnly && setRating(star)}
                        >
                            <Star
                                className={`h-8 w-8 ${isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-transparent text-gray-300"
                                    }`}
                            />
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {existingReview ? "Chi tiết đánh giá" : "Đánh giá sản phẩm"}
                    </DialogTitle>
                    <DialogDescription>
                        {existingReview
                            ? "Bạn đã đánh giá sản phẩm này."
                            : "Chia sẻ trải nghiệm của bạn về sản phẩm này nhé."}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {/* Product Info Summary */}
                        <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded bg-white">
                                <Image
                                    src={productImage || "/placeholder.svg"}
                                    alt={productName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium">{productName}</p>
                                <p className="text-xs text-muted-foreground">Mã đơn: {orderId?.slice(0, 8)}...</p>
                            </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex flex-col items-center gap-2 py-2">
                            {renderStars(!!existingReview)}
                            <span className="text-sm font-medium text-muted-foreground">
                                {rating > 0 ? (
                                    rating === 5 ? "Tuyệt vời" :
                                        rating === 4 ? "Hài lòng" :
                                            rating === 3 ? "Bình thường" :
                                                rating === 2 ? "Không hài lòng" : "Tệ"
                                ) : "Chọn mức đánh giá"}
                            </span>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tiêu đề</Label>
                            <Input
                                id="title"
                                placeholder="Ví dụ: Sản phẩm rất đẹp..."
                                disabled={!!existingReview || isSubmitting}
                                {...register("title")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="comment">Nội dung đánh giá</Label>
                            <Textarea
                                id="comment"
                                placeholder="Hãy chia sẻ thêm về trải nghiệm của bạn..."
                                className="min-h-[100px]"
                                disabled={!!existingReview || isSubmitting}
                                {...register("comment")}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {existingReview ? (
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                            Đóng
                        </Button>
                    ) : (
                        <div className="flex gap-2 justify-end w-full">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button onClick={handleSubmit(onSubmit)} disabled={isLoading || isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Gửi đánh giá
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}