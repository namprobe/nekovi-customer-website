//src/app/products/page.tsx
"use client"

import { useCustomerProducts } from "@/src/features/product/hooks/use-customer-products"
import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { ProductCard } from "@/src/features/product/product-card"
import { mockProducts } from "@/src/core/lib/mock-data"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Input } from "@/src/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
  const [category, setCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12


  const { data, loading, error } = useCustomerProducts({
    page: currentPage,
    pageSize: itemsPerPage,
    search: searchQuery,
    sortType: sortBy === "newest" ? undefined : sortBy, // server sẽ xử lý
  })

  const totalPages = data?.totalPages ?? 1

  return (
    <MainLayout>
      {/* Sakura Cosplay Festival Banner - Top of page */}
      <div className="relative overflow-hidden">
        <Image
          src="/cuoc-thi-anh-banner.png"
          alt="Cuộc thi ảnh Sakura Cosplay Festival"
          width={1200}
          height={300}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Link href="/awards">
            <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full shadow-lg">
              Click ngay để tham gia CUỘC THI ẢNH SAKURA COSPLAY FESTIVAL
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header with search */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Kết quả tìm kiếm cho từ khóa 'figure'</h1>
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            onClick={() => setSortBy("newest")}
            className="bg-transparent"
          >
            Sắp xếp theo
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-transparent">
              <SelectValue placeholder="Liên quan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="name">Tên A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[180px] bg-transparent">
              <SelectValue placeholder="Giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="under-500k">Dưới 500k</SelectItem>
              <SelectItem value="500k-1m">500k - 1M</SelectItem>
              <SelectItem value="1m-2m">1M - 2M</SelectItem>
              <SelectItem value="over-2m">Trên 2M</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-transparent">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="cosplay">Cosplay</SelectItem>
              <SelectItem value="figure">Figure</SelectItem>
              <SelectItem value="merchandise">Merchandise</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentPage}/{totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && <p>Đang tải...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {data?.items?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-transparent"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Trước
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "" : "bg-transparent"}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-transparent"
            >
              Sau
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
