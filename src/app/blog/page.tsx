"use client"

import { useState } from "react"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Search, Calendar, User, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock blog data
const mockBlogPosts = [
  {
    id: "sakura-cosplay-festival-2025",
    title: "Sakura Cosplay Festival 2025",
    subtitle: "Những điểm nhấn không thể bỏ lỡ",
    excerpt: "Sakura Cosplay Festival 2025 sẽ chính thức khai mạc vào ngày 15/03/2025 tại GIGAMALL, TP.HCM. Đây là sự kiện cosplay lớn nhất trong năm...",
    author: "NekoVi Team",
    publishDate: "15/03/2025",
    readTime: "5 phút đọc",
    views: 1280,
    category: "Sự kiện",
    image: "/sakura-festival-entrance-with-torii-gate.jpg",
    featured: true,
  },
  {
    id: "cosplay-luffy-guide",
    title: "Hướng dẫn Cosplay Luffy hoàn hảo",
    subtitle: "Từ trang phục đến phụ kiện",
    excerpt: "Luôn là lựa chọn hàng đầu cho các bạn yêu thích One Piece - Luffy với chiếc mũ rơm biểu tượng...",
    author: "Cosplay Expert",
    publishDate: "10/03/2025",
    readTime: "8 phút đọc",
    views: 2560,
    category: "Hướng dẫn",
    image: "/luffy-cosplay.jpg",
    featured: false,
  },
  {
    id: "anime-trends-2025",
    title: "Top 10 Nhân Vật Cosplay 2025",
    subtitle: "Những nhân vật anime được cosplay nhiều nhất",
    excerpt: "Cùng điểm qua những nhân vật anime được cosplay nhiều nhất tại Việt Nam trong năm 2025...",
    author: "Anime Fan",
    publishDate: "08/03/2025",
    readTime: "6 phút đọc",
    views: 1890,
    category: "Top List",
    image: "/anime-cosplay-event-with-colorful-costumes.jpg",
    featured: false,
  },
  {
    id: "cosplay-wig-guide",
    title: "Hướng Dẫn Làm Tóc Giả Cosplay",
    subtitle: "Từ cơ bản đến nâng cao",
    excerpt: "Tóc giả là một phần quan trọng trong cosplay. Hãy cùng tìm hiểu cách chọn và chăm sóc tóc giả...",
    author: "Wig Master",
    publishDate: "05/03/2025",
    readTime: "10 phút đọc",
    views: 3200,
    category: "Hướng dẫn",
    image: "/violet-evergarden-cosplay.jpg",
    featured: false,
  },
  {
    id: "cosplay-photography-tips",
    title: "Bí quyết chụp ảnh Cosplay đẹp",
    subtitle: "Từ góc chụp đến ánh sáng",
    excerpt: "Chụp ảnh cosplay không chỉ cần trang phục đẹp mà còn cần kỹ thuật chụp ảnh tốt...",
    author: "Photo Pro",
    publishDate: "03/03/2025",
    readTime: "7 phút đọc",
    views: 1450,
    category: "Nhiếp ảnh",
    image: "/cosplay-competition-stage.jpg",
    featured: false,
  },
  {
    id: "anime-conventions-2025",
    title: "Lịch sự kiện Anime 2025",
    subtitle: "Các sự kiện không thể bỏ lỡ",
    excerpt: "Tổng hợp các sự kiện anime và cosplay lớn nhất trong năm 2025 tại Việt Nam...",
    author: "Event Organizer",
    publishDate: "01/03/2025",
    readTime: "4 phút đọc",
    views: 2100,
    category: "Sự kiện",
    image: "/anime-festival-crowd-with-cherry-blossoms.jpg",
    featured: false,
  },
  {
    id: "gundam-model-guide",
    title: "Hướng dẫn lắp ráp Gundam Model",
    subtitle: "Từ người mới đến chuyên nghiệp",
    excerpt: "Gundam Model là một trong những sản phẩm được yêu thích nhất trong cộng đồng anime. Hãy cùng tìm hiểu cách lắp ráp...",
    author: "Model Builder",
    publishDate: "28/02/2025",
    readTime: "12 phút đọc",
    views: 3200,
    category: "Hướng dẫn",
    image: "/gundam-rx78-model.jpg",
    featured: false,
  },
  {
    id: "naruto-cosplay-collection",
    title: "Bộ sưu tập Cosplay Naruto",
    subtitle: "Từ Naruto đến Boruto",
    excerpt: "Naruto là một trong những anime được yêu thích nhất mọi thời đại. Cùng khám phá các nhân vật cosplay nổi bật...",
    author: "Naruto Fan",
    publishDate: "25/02/2025",
    readTime: "9 phút đọc",
    views: 2800,
    category: "Top List",
    image: "/naruto-orange-costume.jpg",
    featured: false,
  },
  {
    id: "anime-merchandise-trends",
    title: "Xu hướng Merchandise Anime 2025",
    subtitle: "Những sản phẩm hot nhất",
    excerpt: "Cùng điểm qua những sản phẩm merchandise anime được săn đón nhất trong năm 2025...",
    author: "Merch Expert",
    publishDate: "22/02/2025",
    readTime: "6 phút đọc",
    views: 1950,
    category: "Sự kiện",
    image: "/anime-merchandise-booth.jpg",
    featured: false,
  },
]

const categories = ["Tất cả", "Sự kiện", "Hướng dẫn", "Top List", "Nhiếp ảnh"]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")

  const filteredPosts = mockBlogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tất cả" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPost = mockBlogPosts.find(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

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

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Bài viết nổi bật</h2>
            <Card className="overflow-hidden">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 flex flex-col justify-center">
                  <Badge className="mb-4 w-fit">{featuredPost.category}</Badge>
                  <h3 className="mb-3 text-2xl font-bold">{featuredPost.title}</h3>
                  <p className="mb-4 text-muted-foreground">{featuredPost.subtitle}</p>
                  <p className="mb-6 text-sm leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.publishDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredPost.views} lượt xem
                    </div>
                  </div>
                  <Link href={`/blog/${featuredPost.id}`}>
                    <Button>Đọc tiếp</Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Regular Posts */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold">Tất cả bài viết</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute left-4 top-4">{post.category}</Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold line-clamp-2">{post.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.publishDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views}
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
        </div>

        {/* No Results */}
        {regularPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy bài viết nào phù hợp</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
