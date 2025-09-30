"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Search, Trophy, Medal, Star, Crown, Shield, BookOpen, Coins, Award, Users, Calendar, MessageCircle, Heart } from "lucide-react"
import { MainLayout } from "@/src/widgets/layout/main-layout"

// Mock data cho awards và members
const mockAwards = [
  {
    id: "bronze-rank",
    title: "Rank Đồng",
    description: "Thành viên tích cực tham gia cộng đồng",
    icon: "bronze-shield",
    color: "bg-amber-600",
    requirements: "50+ điểm hoạt động",
    members: [
      { name: "David Laid", avatar: "/anime-fan-avatar.png", points: 75, description: "Tham gia 15 sự kiện" },
      { name: "Mark Zucc", avatar: "/anime-fan-avatar.png", points: 68, description: "Tích cực đóng góp" },
    ]
  },
  {
    id: "silver-rank",
    title: "Rank Bạc",
    description: "Thành viên có đóng góp đáng kể",
    icon: "silver-shield",
    color: "bg-gray-400",
    requirements: "100+ điểm hoạt động",
    members: [
      { name: "Tều Phạm", avatar: "/anime-fan-avatar.png", points: 125, description: "Tương tác nhiều nhất" },
      { name: "MCK", avatar: "/anime-fan-avatar.png", points: 110, description: "Hỗ trợ cộng đồng" },
    ]
  },
  {
    id: "gold-rank",
    title: "Rank Vàng",
    description: "Thành viên xuất sắc và có ảnh hưởng",
    icon: "gold-shield",
    color: "bg-yellow-500",
    requirements: "200+ điểm hoạt động",
    members: [
      { name: "Nam", avatar: "/anime-fan-avatar.png", points: 250, description: "Giúp đỡ bạn bè" },
      { name: "Sang", avatar: "/anime-fan-avatar.png", points: 220, description: "Mentor tích cực" },
    ]
  },
  {
    id: "vip",
    title: "VIP",
    description: "Thành viên VIP đặc biệt",
    icon: "vip-card",
    color: "bg-purple-600",
    requirements: "Mua hàng 5M+ VNĐ",
    members: [
      { name: "David Laid", avatar: "/anime-fan-avatar.png", points: 500, description: "Khách hàng VIP" },
    ]
  },
  {
    id: "veteran",
    title: "Kì Cựu",
    description: "Thành viên lâu năm của cộng đồng",
    icon: "veteran-shield",
    color: "bg-blue-600",
    requirements: "Tham gia 2+ năm",
    members: [
      { name: "con mefo", avatar: "/anime-fan-avatar.png", points: 300, description: "Thành viên từ 2022" },
    ]
  },
  {
    id: "newbie",
    title: "Non",
    description: "Thành viên mới tham gia",
    icon: "newbie-shield",
    color: "bg-gray-500",
    requirements: "Tham gia < 6 tháng",
    members: [
      { name: "Lionel Messi", avatar: "/anime-fan-avatar.png", points: 25, description: "Thành viên mới" },
      { name: "Billie Eilish", avatar: "/anime-fan-avatar.png", points: 30, description: "Thành viên mới" },
    ]
  },
]

const mockFeaturedMembers = [
  {
    id: "1",
    name: "David Laid",
    avatar: "/anime-fan-avatar.png",
    category: "Tham gia nhiều sự kiện",
    events: 15,
    interactions: 250,
    friendsHelped: 12,
    points: 500,
    joinDate: "2022-03-15",
    description: "Thành viên tích cực nhất cộng đồng"
  },
  {
    id: "2",
    name: "Mark Zucc",
    avatar: "/anime-fan-avatar.png",
    category: "Tham gia nhiều sự kiện",
    events: 12,
    interactions: 180,
    friendsHelped: 8,
    points: 400,
    joinDate: "2022-05-20",
    description: "Luôn sẵn sàng hỗ trợ mọi người"
  },
  {
    id: "3",
    name: "Tều Phạm",
    avatar: "/anime-fan-avatar.png",
    category: "Tương tác nhiều nhất",
    events: 8,
    interactions: 350,
    friendsHelped: 15,
    points: 450,
    joinDate: "2022-01-10",
    description: "Chuyên gia tư vấn cosplay"
  },
  {
    id: "4",
    name: "MCK",
    avatar: "/anime-fan-avatar.png",
    category: "Tương tác nhiều nhất",
    events: 10,
    interactions: 320,
    friendsHelped: 20,
    points: 420,
    joinDate: "2022-02-28",
    description: "Nghệ sĩ cosplay chuyên nghiệp"
  },
  {
    id: "5",
    name: "Nam",
    avatar: "/anime-fan-avatar.png",
    category: "Giúp đỡ bạn bè",
    events: 6,
    interactions: 200,
    friendsHelped: 35,
    points: 380,
    joinDate: "2021-11-12",
    description: "Mentor tận tâm của cộng đồng"
  },
  {
    id: "6",
    name: "Sang",
    avatar: "/anime-fan-avatar.png",
    category: "Giúp đỡ bạn bè",
    events: 9,
    interactions: 180,
    friendsHelped: 28,
    points: 360,
    joinDate: "2022-04-05",
    description: "Chuyên gia phụ kiện cosplay"
  }
]

const mockNewestMembers = [
  { name: "Lionel Messi", avatar: "/anime-fan-avatar.png" },
  { name: "Billie Eilish", avatar: "/anime-fan-avatar.png" },
  { name: "Kylian Mbappé", avatar: "/anime-fan-avatar.png" },
  { name: "Justin Bieber", avatar: "/anime-fan-avatar.png" },
  { name: "Taylor Swift", avatar: "/anime-fan-avatar.png" },
  { name: "BTS", avatar: "/anime-fan-avatar.png" },
  { name: "Blackpink", avatar: "/anime-fan-avatar.png" },
  { name: "Ariana Grande", avatar: "/anime-fan-avatar.png" },
  { name: "Drake", avatar: "/anime-fan-avatar.png" },
  { name: "Ed Sheeran", avatar: "/anime-fan-avatar.png" },
  { name: "Adele", avatar: "/anime-fan-avatar.png" },
  { name: "The Weeknd", avatar: "/anime-fan-avatar.png" },
  { name: "Dua Lipa", avatar: "/anime-fan-avatar.png" },
  { name: "Post Malone", avatar: "/anime-fan-avatar.png" },
  { name: "con mefo", avatar: "/anime-fan-avatar.png" },
]

const getAwardIcon = (iconType: string, color: string) => {
  const iconClass = `h-8 w-8 ${color} text-white rounded-lg flex items-center justify-center`
  
  switch (iconType) {
    case "bronze-shield":
    case "silver-shield":
    case "gold-shield":
    case "veteran-shield":
    case "newbie-shield":
      return <Shield className={iconClass} />
    case "vip-card":
      return <Crown className={iconClass} />
    default:
      return <Award className={iconClass} />
  }
}

export default function AwardsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "events", name: "Tham gia nhiều sự kiện" },
    { id: "interactions", name: "Tương tác nhiều nhất" },
    { id: "helpful", name: "Giúp đỡ bạn bè" },
  ]

  const filteredMembers = mockFeaturedMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || member.category === categories.find(c => c.id === selectedCategory)?.name
    return matchesSearch && matchesCategory
  })

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
          <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full shadow-lg">
            Click ngay để tham gia CUỘC THI ẢNH SAKURA COSPLAY FESTIVAL
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary">Danh Hiệu & Thành Viên</h1>
          <p className="text-lg text-muted-foreground">
            Tôn vinh những thành viên xuất sắc trong cộng đồng NekoVi
          </p>
        </div>

        {/* Awards Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Danh Hiệu Sôi Nổi</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockAwards.map((award) => (
              <Card key={award.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    {getAwardIcon(award.icon, award.color)}
                  </div>
                  <CardTitle className="text-xl">{award.title}</CardTitle>
                  <CardDescription>{award.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-2">
                      {award.requirements}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {award.members.length} thành viên đạt được
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {award.members.map((member, index) => (
                      <div key={`${award.id}-${index}`} className="flex items-center gap-3 rounded-lg border p-2">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {member.points} điểm
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Members */}
        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">Thành Viên Đáng Chú Ý</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm thành viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {member.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">
                    {member.description}
                  </p>

                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{member.events} sự kiện</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{member.interactions} tương tác</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>{member.friendsHelped} bạn bè</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{member.points} điểm</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      Nhắn tin
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="mr-1 h-4 w-4" />
                      Theo dõi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Most Contributions */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Đóng Góp Nhiều Nhất</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {mockFeaturedMembers.slice(0, 2).map((member) => (
              <Card key={`contribution-${member.id}`} className="p-6">
                <div className="flex items-center gap-4">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </div>
                  <Badge className="bg-primary">
                    {member.points} điểm
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Newest Members */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Thành Viên Mới Nhất</h2>
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15">
            {mockNewestMembers.map((member, index) => (
              <div key={index} className="text-center">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={50}
                  height={50}
                  className="mx-auto mb-2 rounded-full"
                />
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {member.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}