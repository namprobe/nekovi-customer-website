"use client"

import { useState, useEffect, useRef } from "react"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Search, Calendar, User } from "lucide-react"
import Link from "next/link"
import { blogService } from "@/src/features/blog-post/services/blog.service"
import { BlogPostItem, PaginationResult } from "@/src/features/blog-post/types/blog"
import LatestBlogCategory from "@/src/features/blog-post/components/latestBlogCategory"
import { postCategoryService, PostCategorySelectItem } from "@/src/features/blog-post/services/post-category.service"
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebounce } from "use-debounce"

const truncateContent = (html: string, maxLength = 100) => {
  const text = html.replace(/<[^>]*>/g, "")
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}

export default function BlogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Đọc từ URL
  const urlCategoryId = searchParams.get('cat') || ''
  const urlSearch = searchParams.get('q') || ''
  const urlPage = Number(searchParams.get('page')) || 1

  // State
  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [selectedCategoryId, setSelectedCategoryId] = useState(urlCategoryId)
  const [currentPage, setCurrentPage] = useState(urlPage)
  const [debouncedSearch] = useDebounce(searchQuery, 500)

  const [latestPosts, setLatestPosts] = useState<BlogPostItem[]>([])
  const [blogData, setBlogData] = useState<PaginationResult<BlogPostItem> | null>(null)
  const [categories, setCategories] = useState<PostCategorySelectItem[]>([])
  const [loading, setLoading] = useState(true)

  const pageSize = 9
  const searchInputRef = useRef<HTMLInputElement>(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Load categories từ API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await postCategoryService.getSelectList()
        setCategories([{ id: '', name: 'Tất cả' }, ...cats])
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
    }
    loadCategories()
  }, [])

  // Load blog data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [latest, list] = await Promise.all([
          blogService.getLatestByCategory(),
          blogService.getList({
            page: currentPage,
            pageSize,
            search: debouncedSearch || undefined,
            postCategoryId: selectedCategoryId || undefined,
            isPublished: true,
          }),
        ])

        setLatestPosts(latest)
        setBlogData(list)
      } catch (err) {
        console.error("Failed to load blog data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentPage, debouncedSearch, selectedCategoryId])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCategoryId) params.set('cat', selectedCategoryId)
    if (currentPage > 1) params.set('page', String(currentPage))

    router.replace(`/blog?${params.toString()}`, { scroll: false })
  }, [searchQuery, selectedCategoryId, currentPage, router])

  // Reset page khi search hoặc category thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, selectedCategoryId])

  // Giữ focus input khi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (searchInputRef.current && document.activeElement === searchInputRef.current && searchQuery) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus()
          searchInputRef.current!.selectionStart = searchInputRef.current!.selectionEnd = searchQuery.length
        })
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [searchQuery])

  // Hiển thị items từ API (không filter client)
  const items = blogData?.items || []

  if (loading && !blogData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Đang tải bài viết...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold text-primary">Bảng Tin NekoVi</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cập nhật tin tức mới nhất về cosplay, anime và các sự kiện thú vị
          </p>
        </div>

        <div className="mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-50" />
        </div>

        {/* NỔI BẬT */}
        {latestPosts.length > 0 && (
          <div className="mb-16">
            <LatestBlogCategory posts={latestPosts} />
          </div>
        )}

        <div className="mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50" />
        </div>

        {/* SEARCH & FILTER */}
        <div className="mb-12 space-y-6">
          <h2 className="text-2xl font-bold text-center md:text-left">Tìm kiếm & Lọc</h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-base transition-all focus:ring-2 focus:ring-pink-500"
                autoComplete="off"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  size="sm"
                  className="transition-all"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* DANH SÁCH BÀI VIẾT */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl md:text-3xl font-bold text-center md:text-left">Tất cả bài viết</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/fallback-blog.jpg"
                      }}
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                  )}
                  {post.postCategory && (
                    <Badge className="absolute left-4 top-4 bg-pink-500 text-white border-0 text-xs font-medium">
                      {post.postCategory.name}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold line-clamp-2">{post.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                    {truncateContent(post.content)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.authorName || "NekoVi Team"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="outline" className="w-full hover:bg-pink-500 dark:hover:bg-pink-900/20">
                      Đọc tiếp
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {blogData && blogData.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(Math.max(1, currentPage - 1))
                  scrollToTop()
                }}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="flex items-center px-4 text-sm font-medium">
                Trang {currentPage} / {blogData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(currentPage + 1)
                  scrollToTop()
                }}
                disabled={currentPage === blogData.totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </div>

        {/* No results */}
        {items.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Không tìm thấy bài viết nào phù hợp</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}