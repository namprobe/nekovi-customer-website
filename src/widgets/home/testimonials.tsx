// src/widgets/home/testimonials.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Star, StarHalf } from "lucide-react"
import { productReviewService } from "@/src/entities/productReview/service/product-review-service"
import { ProductReviewItem } from "@/src/entities/productReview/type/product-review"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale" // để hiển thị tiếng Việt: "2 ngày trước"

interface TestimonialData extends ProductReviewItem {
  timeAgo: string
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        // Lấy tất cả review có rating = 5, sắp xếp theo mới nhất, lấy 3 cái
        const response = await productReviewService.getByProduct({
          productId: "", // backend sẽ bỏ qua nếu không cần, hoặc bạn có thể tạo endpoint riêng
          rating: 5,
          page: 1,
          pageSize: 3,
          sortBy: "createdat",
          isAscending: false, // mới nhất trước
        })

        const formatted = response.items.map((item) => ({
          ...item,
          timeAgo: formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: vi, // "2 ngày trước", "1 tuần trước"...
          }).replace("khoảng ", ""), // tùy chọn: bỏ từ "khoảng"
        }))

        setTestimonials(formatted)
      } catch (err) {
        console.error("Lỗi khi tải đánh giá:", err)
        // Có thể fallback về data tĩnh nếu muốn
      } finally {
        setLoading(false)
      }
    }

    fetchTopReviews()
  }, [])

  // Hiển thị skeleton hoặc placeholder khi đang load
  if (loading) {
    return (
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Đánh giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Nếu không có đánh giá nào đạt 5 sao
  if (testimonials.length === 0) {
    return null // hoặc hiển thị thông báo "Chưa có đánh giá 5 sao nào"
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-3">
          <h2 className="text-3xl font-bold">Đánh giá từ khách hàng</h2>
          <div className="flex items-center gap-1 text-primary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-secondary/30 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="mb-4 text-lg font-medium italic text-balance">
                  "{testimonial.comment || testimonial.title || "Khách hàng rất hài lòng với sản phẩm!"}"
                </p>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.userName ? undefined : "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10">
                      {testimonial.userName?.[0]?.toUpperCase() || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.userName || "Khách hàng"}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {testimonial.timeAgo}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}