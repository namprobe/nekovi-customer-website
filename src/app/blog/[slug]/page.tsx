import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  // Mock articles data - in production, fetch from API
  const mockArticles = [
    {
      id: "sakura-cosplay-festival-2025",
      title: "Sakura Cosplay Festival 2025",
      subtitle: "Những điểm nhấn không thể bỏ lỡ",
      publishDate: "15/03/2025",
      author: "NekoVi Team",
      bannerImage: "/sakura-festival-entrance-with-torii-gate.jpg",
      content: [
        {
          type: "text",
          content:
            "Sakura Cosplay Festival 2025 sẽ chính thức khai mạc vào ngày 15/03/2025 tại GIGAMALL, TP.HCM. Đây là sự kiện cosplay lớn nhất trong năm, quy tụ hàng ngàn cosplayer từ khắp cả nước. Với chủ đề 'Hoa Thần Cung Xứ Sở Hoa Anh Đào', festival hứa hẹn mang đến những trải nghiệm tuyệt vời cho cộng đồng yêu thích anime, webtoon và cosplay tại Việt Nam.",
        },
        {
          type: "image-grid",
          images: [
            "/anime-cosplay-event-with-colorful-costumes.jpg",
            "/cosplay-competition-stage.jpg",
            "/anime-festival-crowd-with-cherry-blossoms.jpg",
            "/anime-merchandise-booth.jpg",
          ],
        },
        {
          type: "heading",
          content: "Cosplay Luffy - Huyền thoại Mũ Rơm từ One Piece",
        },
        {
          type: "text",
          content:
            "Luôn là lựa chọn hàng đầu cho các bạn yêu thích One Piece - Luffy với chiếc mũ rơm biểu tượng và tính cách lạc quan, dũng cảm đã trở thành nguồn cảm hứng cho hàng triệu fan trên toàn thế giới. Tại Sakura Cosplay Festival 2025, bạn sẽ có cơ hội gặp gỡ những cosplayer Luffy xuất sắc nhất và tham gia các hoạt động đặc biệt dành riêng cho fan One Piece.",
        },
        {
          type: "text",
          content:
            "Cuộc thi, đề cử mặt cosplay nổi bật, chụy hình tập lưu niệm với các cosplayer từ khắp cả nước. Cộng đồng Cosplay Việt Nam sẽ tụ họp tại Sakura Cosplay Festival và chia sẻ niềm đam mê với nhau. Đừng bỏ lỡ cơ hội này!",
        },
        {
          type: "text",
          content:
            "NekoVi tại sự kiện sẽ trưng bày và bán các sản phẩm cosplay đặc biệt cho festival. Từ trang phục Luffy (700,000 VNĐ) đến kiếm gỗ Nichirin (250,000 VNĐ). Với mô hình đi, NekoVi hướng tới việc mở rộng thị trường và kiện gỗ Nichirin tại Sakura Cosplay Festival 2025 tại GIGAMALL, TP.HCM.",
        },
      ],
      relatedProducts: [
        {
          id: 1,
          name: "Trang phục cosplay Monkey D Luffy",
          price: "đ85.000 - đ543.000",
          image: "/luffy-cosplay.jpg",
        },
        {
          id: 2,
          name: "Hướng Dẫn Làm Tóc Giả Cosplay",
          description: "Từ cơ bản đến nâng cao",
          image: "/violet-evergarden-cosplay.jpg",
        },
        {
          id: 3,
          name: "Top 10 Nhân Vật Cosplay 2025",
          description: "Top những nhân vật anime được cosplay nhiều nhất",
          image: "/anime-cosplay-event-with-colorful-costumes.jpg",
        },
      ],
      featuredProducts: [
        {
          id: 1,
          name: "Trang phục Maomao",
          price: "1.200.000đ",
          image: "/maomao-cosplay-costume.jpg",
        },
        {
          id: 2,
          name: "Thủy trụ của Kamado Tanjiro",
          price: "850.000đ",
          image: "/tanjiro-sword-glowing.jpg",
        },
      ],
    },
    {
      id: "cosplay-luffy-guide",
      title: "Hướng dẫn Cosplay Luffy hoàn hảo",
      subtitle: "Từ trang phục đến phụ kiện",
      publishDate: "10/03/2025",
      author: "Cosplay Expert",
      bannerImage: "/luffy-cosplay.jpg",
      content: [
        {
          type: "text",
          content:
            "Luôn là lựa chọn hàng đầu cho các bạn yêu thích One Piece - Luffy với chiếc mũ rơm biểu tượng và tính cách lạc quan, dũng cảm đã trở thành nguồn cảm hứng cho hàng triệu fan trên toàn thế giới.",
        },
        {
          type: "image-grid",
          images: [
            "/luffy-cosplay-red-vest.jpg",
            "/zoro-cosplay-costume.jpg",
            "/naruto-orange-costume.jpg",
            "/tanjiro-sword-glowing.jpg",
          ],
        },
        {
          type: "heading",
          content: "Các bước chuẩn bị Cosplay Luffy",
        },
        {
          type: "text",
          content:
            "Để có một bộ cosplay Luffy hoàn hảo, bạn cần chuẩn bị đầy đủ các phụ kiện: áo đỏ, quần xanh, mũ rơm, và đặc biệt là thái độ lạc quan, vui vẻ như nhân vật.",
        },
      ],
      relatedProducts: [
        {
          id: 1,
          name: "Trang phục cosplay Monkey D Luffy",
          price: "đ365.000",
          image: "/luffy-cosplay.jpg",
        },
        {
          id: 2,
          name: "Mũ rơm Luffy",
          price: "đ150.000",
          image: "/luffy-cosplay-red-vest.jpg",
        },
      ],
      featuredProducts: [
        {
          id: 1,
          name: "Trang phục Zoro",
          price: "đ420.000",
          image: "/zoro-cosplay-costume.jpg",
        },
        {
          id: 2,
          name: "Trang phục Naruto",
          price: "đ380.000",
          image: "/naruto-orange-costume.jpg",
        },
      ],
    },
    {
      id: "gundam-model-guide",
      title: "Hướng dẫn lắp ráp Gundam Model",
      subtitle: "Từ người mới đến chuyên nghiệp",
      publishDate: "28/02/2025",
      author: "Model Builder",
      bannerImage: "/gundam-rx78-model.jpg",
      content: [
        {
          type: "text",
          content:
            "Gundam Model là một trong những sản phẩm được yêu thích nhất trong cộng đồng anime. Việc lắp ráp Gundam không chỉ là một sở thích mà còn là một nghệ thuật đòi hỏi sự kiên nhẫn và tỉ mỉ.",
        },
        {
          type: "image-grid",
          images: [
            "/gundam-astray-blue.jpg",
            "/gundam-rx78-model.jpg",
            "/anime-figure.jpg",
            "/anime-accessories.jpg",
          ],
        },
        {
          type: "heading",
          content: "Các bước lắp ráp cơ bản",
        },
        {
          type: "text",
          content:
            "Bắt đầu với việc chuẩn bị dụng cụ: kéo cắt, dao cắt, giấy nhám, và keo dán. Sau đó, cắt các phần từ runner một cách cẩn thận và lắp ráp theo hướng dẫn.",
        },
      ],
      relatedProducts: [
        {
          id: 1,
          name: "Gundam RX-78-2 Model",
          price: "đ450.000",
          image: "/gundam-rx78-model.jpg",
        },
        {
          id: 2,
          name: "Gundam Astray Blue",
          price: "đ520.000",
          image: "/gundam-astray-blue.jpg",
        },
      ],
      featuredProducts: [
        {
          id: 1,
          name: "Figure Anime",
          price: "đ280.000",
          image: "/anime-figure.jpg",
        },
        {
          id: 2,
          name: "Phụ kiện Anime",
          price: "đ150.000",
          image: "/anime-accessories.jpg",
        },
      ],
    },
  ]

  // Find article by slug
  const article = mockArticles.find((a) => a.id === params.slug)

  if (!article) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Không tìm thấy bài viết</h1>
          <p className="text-muted-foreground mb-6">Bài viết với slug {params.slug} không tồn tại</p>
          <Link href="/blog">
            <Button>Quay lại danh sách bài viết</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="relative h-[400px] w-full">
        <Image src={article.bannerImage || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <Button className="mb-4 bg-primary text-primary-foreground">ĐĂNG KÝ NGAY</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">{article.title}</h1>
          <p className="mb-2 text-xl text-muted-foreground">{article.subtitle}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{article.publishDate}</span>
            <span>•</span>
            <span>{article.author}</span>
          </div>
        </div>

        {/* Article Content */}
        <div className="mx-auto max-w-4xl">
          {article.content.map((block, index) => {
            if (block.type === "text") {
              return (
                <p key={index} className="mb-6 leading-relaxed text-foreground">
                  {block.content}
                </p>
              )
            }

            if (block.type === "heading") {
              return (
                <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-foreground">
                  {block.content}
                </h2>
              )
            }

            if (block.type === "image-grid") {
              return (
                <div key={index} className="my-8 grid grid-cols-2 gap-4">
                  {block.images?.map((img, imgIndex) => (
                    <div key={imgIndex} className="relative h-64 overflow-hidden rounded-lg">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Gallery ${imgIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )
            }

            return null
          })}
        </div>

        {/* Related Products Section */}
        <div className="my-16">
          <h2 className="mb-8 text-3xl font-bold text-foreground">Trang phục cosplay Monkey D Luffy</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {article.relatedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-64">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-semibold text-foreground">{product.name}</h3>
                  {product.price && <p className="text-lg font-bold text-primary">{product.price}</p>}
                  {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="my-16">
          <h2 className="mb-8 text-3xl font-bold text-foreground">Các mẫu mới nhất</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {article.featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative h-80">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-foreground">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">{product.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
