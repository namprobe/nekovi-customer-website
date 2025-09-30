"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Search, Star, Users, Calendar, Play } from "lucide-react"
import { MainLayout } from "@/src/widgets/layout/main-layout"

// Mock data cho các bộ anime
const mockAnime = [
  {
    id: "one-piece",
    title: "One Piece",
    japaneseTitle: "ワンピース",
    description: "Câu chuyện về Monkey D. Luffy và băng Mũ Rơm trong hành trình tìm kiếm kho báu One Piece",
    image: "/anime-banner-2.jpg",
    banner: "/anime-banner-2.jpg",
    rating: 9.2,
    episodes: 1000,
    status: "Đang phát sóng",
    year: 1999,
    genres: ["Hành động", "Phiêu lưu", "Hài hước"],
    studio: "Toei Animation",
    popularity: 95,
    featured: true,
  },
  {
    id: "naruto",
    title: "Naruto",
    japaneseTitle: "ナルト",
    description: "Hành trình trở thành Hokage của Naruto Uzumaki",
    image: "/naruto-orange-costume.jpg",
    banner: "/anime-banner-3.jpg",
    rating: 8.7,
    episodes: 720,
    status: "Hoàn thành",
    year: 2002,
    genres: ["Hành động", "Ninja", "Shounen"],
    studio: "Studio Pierrot",
    popularity: 90,
    featured: true,
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    japaneseTitle: "鬼滅の刃",
    description: "Câu chuyện về Tanjiro Kamado và cuộc chiến chống lại quỷ",
    image: "/tanjiro-sword-glowing.jpg",
    banner: "/demon-slayer-banner.jpg",
    rating: 9.0,
    episodes: 44,
    status: "Hoàn thành",
    year: 2019,
    genres: ["Hành động", "Siêu nhiên", "Drama"],
    studio: "Ufotable",
    popularity: 88,
    featured: true,
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    japaneseTitle: "呪術廻戦",
    description: "Câu chuyện về Yuji Itadori và thế giới phép thuật",
    image: "/jujutsu-kaisen.jpg",
    banner: "/anime-banner-3.jpg",
    rating: 8.8,
    episodes: 24,
    status: "Đang phát sóng",
    year: 2020,
    genres: ["Hành động", "Siêu nhiên", "Shounen"],
    studio: "MAPPA",
    popularity: 85,
    featured: false,
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    japaneseTitle: "進撃の巨人",
    description: "Cuộc chiến của nhân loại chống lại Titan",
    image: "/attack-on-titan.webp",
    banner: "/anime-banner-3.jpg",
    rating: 9.1,
    episodes: 75,
    status: "Hoàn thành",
    year: 2013,
    genres: ["Hành động", "Drama", "Dark Fantasy"],
    studio: "Wit Studio / MAPPA",
    popularity: 92,
    featured: false,
  },
  {
    id: "violet-evergarden",
    title: "Violet Evergarden",
    japaneseTitle: "ヴァイオレット・エヴァーガーデン",
    description: "Câu chuyện cảm động về Violet và hành trình tìm hiểu tình yêu",
    image: "/violet-evergarden.jpg",
    banner: "/anime-banner-3.jpg",
    rating: 8.9,
    episodes: 13,
    status: "Hoàn thành",
    year: 2018,
    genres: ["Drama", "Slice of Life", "Tâm lý"],
    studio: "Kyoto Animation",
    popularity: 80,
    featured: false,
  },
]

const genres = ["Tất cả", "Hành động", "Phiêu lưu", "Hài hước", "Ninja", "Shounen", "Siêu nhiên", "Drama", "Dark Fantasy", "Slice of Life", "Tâm lý"]

export default function AnimePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Tất cả")
  const [sortBy, setSortBy] = useState("popularity")

  // Lọc anime theo tìm kiếm và thể loại
  let filteredAnime = mockAnime.filter(anime => {
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anime.japaneseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "Tất cả" || anime.genres.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  // Sắp xếp anime
  filteredAnime.sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "year":
        return b.year - a.year
      case "episodes":
        return b.episodes - a.episodes
      case "popularity":
      default:
        return b.popularity - a.popularity
    }
  })

  const featuredAnime = mockAnime.filter(anime => anime.featured)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">Khám Phá Thế Giới Anime</h1>
          <p className="text-lg text-muted-foreground">
            Tìm hiểu về các bộ anime nổi tiếng và sản phẩm cosplay liên quan
          </p>
        </div>

        {/* Featured Anime */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Anime Nổi Bật</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredAnime.map((anime) => (
              <Card key={anime.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={anime.banner}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{anime.title}</h3>
                    <p className="text-sm opacity-90">{anime.japaneseTitle}</p>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-primary">
                    {anime.rating}/10
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {anime.description}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {anime.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {anime.year} • {anime.episodes} tập
                    </span>
                    <Link href={`/anime/${anime.id}`}>
                      <Button size="sm">
                        <Play className="mr-1 h-3 w-3" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="popularity">Phổ biến</option>
                <option value="rating">Đánh giá cao</option>
                <option value="year">Mới nhất</option>
                <option value="episodes">Nhiều tập nhất</option>
              </select>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </section>

        {/* All Anime Grid */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Tất Cả Anime</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAnime.map((anime) => (
              <Card key={anime.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={anime.image}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <h3 className="text-sm font-bold line-clamp-1">{anime.title}</h3>
                    <p className="text-xs opacity-90">{anime.japaneseTitle}</p>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-primary text-xs">
                    {anime.rating}/10
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{anime.rating}</span>
                    <span>•</span>
                    <span>{anime.year}</span>
                    <span>•</span>
                    <span>{anime.episodes} tập</span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {anime.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/anime/${anime.id}`}>
                    <Button size="sm" className="w-full">
                      <Play className="mr-1 h-3 w-3" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredAnime.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Không tìm thấy anime nào</h3>
            <p className="text-muted-foreground">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc thể loại
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
