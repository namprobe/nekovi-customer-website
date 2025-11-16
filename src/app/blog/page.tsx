// src/app/blog/page.tsx
"use client"

import { useState, useEffect } from "react"
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

const truncateContent = (html: string, maxLength = 150) => {
  const text = html.replace(/<[^>]*>/g, "")
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [latestPosts, setLatestPosts] = useState<BlogPostItem[]>([])
  const [blogData, setBlogData] = useState<PaginationResult<BlogPostItem> | null>(null)
  const [categories, setCategories] = useState<string[]>(["Tất cả"])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 9

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [latest, list] = await Promise.all([
          blogService.getLatestByCategory(),
          blogService.getList({
            page,
            pageSize,
            search: searchQuery || undefined,
            isPublished: true,
          }),
        ])

        setLatestPosts(latest)
        setBlogData(list)

        // Extract categories
        const cats = new Set<string>(["Tất cả"])
        list.items.forEach(p => p.postCategory?.name && cats.add(p.postCategory.name))
        latest.forEach(p => p.postCategory?.name && cats.add(p.postCategory.name))
        setCategories(Array.from(cats))
      } catch (err) {
        console.error("Failed to load blog data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchQuery, page])

  // Filter theo category
  const filteredItems = blogData?.items.filter(post => {
    return selectedCategory === "Tất cả" || post.postCategory?.name === selectedCategory
  }) || []

  if (loading) {
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
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">Bảng Tin NekoVi</h1>
          <p className="text-lg text-muted-foreground">
            Cập nhật tin tức mới nhất về cosplay, anime và các sự kiện thú vị
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setPage(1)
                  }}
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {latestPosts.length > 0 && (
          <div className="mb-12">
            <LatestBlogCategory posts={latestPosts} />
          </div>
        )}

        {/* Danh sách bài viết */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold">Tất cả bài viết</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
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
                    <Badge className="absolute left-4 top-4">
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
                    <Button variant="outline" className="w-full">
                      Đọc tiếp
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {blogData && blogData.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!blogData.hasPrevious}
              >
                Trước
              </Button>
              <span className="flex items-center px-4">
                Trang {blogData.currentPage} / {blogData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!blogData.hasNext}
              >
                Sau
              </Button>
            </div>
          )}
        </div>

        {/* No results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy bài viết nào phù hợp</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}