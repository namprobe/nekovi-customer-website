// src/app/event/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  Loader2,
  Share2
} from "lucide-react"

import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/shared/ui/separator"

import { EventService } from "@/src/entities/event/services/event.service"
import { EventResponse } from "@/src/entities/event/types/event"
import { ProductCard } from "@/src/features/product/product-card"
import type { Product } from "@/src/shared/types"
import { useCartStore } from "@/src/entities/cart/service"
import { useToast } from "@/src/hooks/use-toast"

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [mappedProducts, setMappedProducts] = useState<Product[]>([])

  const [countdown, setCountdown] = useState<string>("");
  const [status, setStatus] = useState<{ label: string, color: "default" | "secondary" | "destructive" | "outline" } | null>(null);

  const handleAddToCart = async (product: Product) => {
    const result = await addToCart({ productId: product.id, quantity: 1 });
    if (result.success) {
      toast({ title: "Thành công", description: `Đã thêm ${product.name} vào giỏ hàng` });
    } else {
      toast({ title: "Lỗi", description: result.error || "Không thể thêm vào giỏ", variant: "destructive" });
    }
  };

  const getEventStatus = (start: string, end: string) => {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime) {
      return { label: "Sắp diễn ra", color: "secondary" as const };
    } else if (now >= startTime && now <= endTime) {
      return { label: "Đang diễn ra", color: "default" as const };
    } else {
      return { label: "Đã kết thúc", color: "destructive" as const };
    }
  };

  useEffect(() => {
    if (!event?.endDate || !event?.startDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();

      const currentStatus = getEventStatus(event.startDate, event.endDate);
      setStatus(currentStatus);

      let targetDate = end;
      let labelPrefix = "Kết thúc sau: ";

      if (now < start) {
        targetDate = start;
        labelPrefix = "Bắt đầu sau: ";
      }

      const distance = targetDate - now;

      if (distance < 0) {
        if (now > end) {
          setCountdown("Sự kiện đã kết thúc");
        } else {
          setCountdown("Đang diễn ra");
        }
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(`${labelPrefix}${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    setStatus(getEventStatus(event.startDate, event.endDate));

    return () => clearInterval(interval);
  }, [event?.endDate, event?.startDate]);


  useEffect(() => {
    if (!id) return

    const fetchDetail = async () => {
      setLoading(true)
      try {
        const result = await EventService.getDetail(id as string)
        if (result.isSuccess && result.data) {
          setEvent(result.data)

          if (result.data.products && result.data.products.length > 0) {
            // === LOGIC MAP GIỮ NGUYÊN NHƯNG ĐẢM BẢO CHÍNH XÁC ===
            const mapped: Product[] = result.data.products.map((p: any): Product => ({
              id: p.id,
              name: p.name,
              slug: p.slug || p.name.toLowerCase().replace(/\s+/g, "-"),
              description: p.description || "",

              price: p.price, // Giá gốc
              discountPrice: p.discountPrice, // Giá giảm cố định
              eventDiscountPercentage: p.eventDiscountPercentage, // % Sự kiện

              images: p.primaryImage
                ? [{ id: `${p.id}-img`, productId: p.id, url: p.primaryImage, alt: p.name, isPrimary: true, order: 0 }]
                : [],
              stock: p.stockQuantity || 0,
              rating: p.averageRating || 0,
              reviewCount: p.reviewCount || 0,
              isPreOrder: p.isPreOrder || false,
              tags: [],
              category: p.category || undefined,
              categoryId: p.categoryId || "",
              createdAt: new Date().toISOString(),
            } as Product));

            setMappedProducts(mapped)
          }
        } else {
          console.error("Event not found")
        }
      } catch (error) {
        console.error("Error fetching event:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])


  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Đang tải thông tin sự kiện...</p>
        </div>
      </MainLayout>
    )
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy sự kiện</h2>
          <Button onClick={() => router.push('/event')}>Quay lại danh sách</Button>
        </div>
      </MainLayout>
    )
  }

  const startDateStr = event.startDate ? format(new Date(event.startDate), "EEEE, dd 'tháng' MM, yyyy", { locale: vi }) : '';

  return (
    <MainLayout>
      <div className="min-h-screen pb-10">
        <div className="relative w-full h-[400px] md:h-[500px] bg-muted">
          {event.imagePath ? (
            <img
              src={event.imagePath}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Calendar className="w-20 h-20 text-gray-400" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 container mx-auto">
            <div className="max-w-4xl">
              <Badge
                className="mb-4 text-base px-4 py-1 shadow-sm uppercase tracking-wide"
                variant={status?.color || "default"}
              >
                {status?.label || event.statusName}
              </Badge>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 drop-shadow-md leading-tight">
                {event.name}
              </h1>

              <div className="flex flex-wrap gap-4 text-foreground/80 md:text-lg font-medium">
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md px-3 py-1 rounded-full">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="capitalize">{startDateStr}</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md px-3 py-1 rounded-full">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          <button
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại danh sách
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-card rounded-xl p-6 border shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  Thông tin chi tiết
                </h2>
                <div
                  className="prose prose-stone dark:prose-invert max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.description || '<p>Chưa có mô tả chi tiết cho sự kiện này.</p>' }}
                />
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/30 rounded-xl p-6 border shadow-sm sticky top-24">
                <h3 className="font-semibold text-xl mb-6">Thời gian & Địa điểm</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-full">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg mt-1 text-foreground">
                        {countdown || "Đang tải..."}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">
                        {status?.label === "Sắp diễn ra" ? "Bắt đầu: " : "Kết thúc: "}
                        {status?.label === "Sắp diễn ra"
                          ? format(new Date(event.startDate), "HH:mm dd/MM/yyyy", { locale: vi })
                          : format(new Date(event.endDate), "HH:mm dd/MM/yyyy", { locale: vi })
                        }
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-full">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Địa điểm tổ chức</p>
                      <p className="font-bold text-lg mt-1 text-foreground">{event.location}</p>
                    </div>
                  </div>

                  <Separator />

                  <Button className="w-full gap-2" variant="outline">
                    <Share2 className="w-4 h-4" /> Chia sẻ sự kiện
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {mappedProducts.length > 0 && status?.label === "Đang diễn ra" && (
            <div className="mt-20 mb-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Sản phẩm tại sự kiện</h2>
                  <p className="text-muted-foreground mt-2">Các sản phẩm độc quyền được bày bán tại sự kiện này</p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {mappedProducts.length} Sản phẩm
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mappedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          )}

          {mappedProducts.length > 0 && status?.label === "Sắp diễn ra" && (
            <div className="mt-20 mb-10 text-center p-8 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground">Danh sách sản phẩm sẽ được hiển thị khi sự kiện bắt đầu.</p>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  )
}