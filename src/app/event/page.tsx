// src/app/event/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useDebounce } from "use-debounce"
import { Search, CalendarDays, MapPin, Loader2, Filter, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"

import { EventService } from "@/src/entities/event/services/event.service"
import { EventListResponse } from "@/src/entities/event/types/event"

export default function EventPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // --- STATES ---
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // State mới cho Filter Ongoing
  const [isOngoing, setIsOngoing] = useState(() => {
    return searchParams.get('type') === 'ongoing'
  })

  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page')
    return page ? Math.max(1, Number(page)) : 1
  })

  const [debouncedSearch] = useDebounce(searchQuery, 500)

  const [eventData, setEventData] = useState<EventListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const pageSize = 9

  // --- HELPER FUNCTION ---
  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) {
      return { label: "Sắp diễn ra", color: "secondary" as const };
    } else if (now >= start && now <= end) {
      return { label: "Đang diễn ra", color: "default" as const };
    } else {
      return { label: "Đã kết thúc", color: "destructive" as const };
    }
  };

  // --- EFFECTS ---

  // 1. Fetch Data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await EventService.getList({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          isOngoing: isOngoing,
          sortBy: isOngoing ? "endDate" : "startDate",
          sortOrder: isOngoing ? "asc" : "desc"
        })
        setEventData(result)
      } catch (err) {
        console.error("Lỗi tải danh sách sự kiện:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [currentPage, debouncedSearch, isOngoing])

  // 2. Sync URL
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('q', searchQuery)
    if (currentPage > 1) params.set('page', String(currentPage))

    if (isOngoing) {
      params.set('type', 'ongoing')
    } else {
      params.delete('type')
    }

    const newUrl = `/event${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl, { scroll: false })
  }, [searchQuery, currentPage, isOngoing, router])

  // 3. Reset Page logic
  useEffect(() => {
    const urlSearch = searchParams.get('q')?.trim() || ''
    const urlType = searchParams.get('type') === 'ongoing'
    const currentSearch = (debouncedSearch || '').trim()

    if ((currentSearch !== urlSearch || isOngoing !== urlType) && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearch, isOngoing, searchParams, currentPage])

  // 4. Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPage])

  // Helper render ngày
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const items = eventData?.items || []

  // --- RENDER ---
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold text-primary">Sự Kiện & Hoạt Động</h1>
          <p className="text-lg text-muted-foreground max-w-none text-center">
            Khám phá các sự kiện anime, manga, cosplay và các buổi offline thú vị sắp diễn ra.
          </p>

        </div>

        {/* Divider */}
        <div className="mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-12 flex flex-col items-center gap-6">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-base w-full shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg border">
            <Button
              variant={!isOngoing ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setIsOngoing(false)
                setCurrentPage(1)
              }}
              className="rounded-md transition-all"
            >
              Tất cả sự kiện
            </Button>
            <Button
              variant={isOngoing ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setIsOngoing(true)
                setCurrentPage(1)
              }}
              className="rounded-md transition-all gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${isOngoing ? "bg-white" : "bg-green-500 animate-pulse"}`} />
              Đang diễn ra
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !eventData && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải sự kiện...</p>
          </div>
        )}

        {/* Data List (Thay đổi Layout tại đây) */}
        {!loading && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {items.map((event) => {
              const status = getEventStatus(event.startDate, event.endDate);

              return (
                <Card
                  key={event.id}
                  className="group overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 border-muted"
                >
                  {/* --- Phần Hình Ảnh (Bên trái trên Desktop) --- */}
                  <Link
                    href={`/event/${event.id}`}
                    className="relative w-full md:w-[320px] lg:w-[400px] aspect-video md:aspect-auto shrink-0 overflow-hidden bg-muted"
                  >
                    {event.imagePath ? (
                      <img
                        src={event.imagePath}
                        alt={event.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-secondary/30">
                        <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Overlay gradient nhẹ để text dễ đọc hơn nếu cần, hoặc tạo hiệu ứng */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                    <Badge
                      className="absolute top-3 left-3 backdrop-blur-md shadow-sm border-white/20"
                      variant={status.color}
                    >
                      {status.label}
                    </Badge>
                  </Link>

                  {/* --- Phần Nội Dung (Bên phải trên Desktop) --- */}
                  <CardContent className="flex flex-col flex-1 p-6">
                    <div className="flex-1">
                      {/* Tiêu đề */}
                      <Link href={`/event/${event.id}`}>
                        <h3 className="font-bold text-2xl mb-3 text-balance hover:text-primary transition-colors cursor-pointer">
                          {event.name}
                        </h3>
                      </Link>

                      {/* Thông tin metadata */}
                      <div className="space-y-3 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <CalendarDays className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground/80">
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <span className="line-clamp-1">{event.location || 'Địa điểm đang cập nhật'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nút bấm (Footer của content) */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        NekoVi Event
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        className="group/btn gap-2 hover:bg-primary/10 hover:text-primary"
                      >
                        <Link href={`/event/${event.id}`}>
                          Xem chi tiết
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-lg max-w-5xl mx-auto">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">
              {isOngoing
                ? "Hiện không có sự kiện nào đang diễn ra."
                : "Không tìm thấy sự kiện nào phù hợp."}
            </p>
            {isOngoing && (
              <Button variant="link" onClick={() => setIsOngoing(false)} className="mt-2 text-primary">
                Xem tất cả sự kiện
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {eventData && eventData.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="flex items-center px-4 text-sm font-medium">
              Trang {currentPage} / {eventData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === eventData.totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}