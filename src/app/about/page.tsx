import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Card } from "@/src/components/ui/card"
import Image from "next/image"

export default function AboutPage() {
  const timeline = [
    {
      year: "2015",
      description:
        "NekoVi bắt đầu như một nhóm nhỏ yêu thích cosplay tại TP.HCM, tham gia Cosplay Festival tại Vincom Mega Mall.",
      position: "left",
    },
    {
      year: "2018",
      description: "Mở rộng cộng đồng qua nhóm Facebook, tổ chức workshop",
      position: "right",
    },
    {
      year: "2020",
      description:
        "Ra mắt website NekoVi, giới thiệu sản phẩm cosplay đầu tiên (bộ trang phục Tanjiro, 700,000 VNĐ) tại Sakura Cosplay Festival.",
      position: "left",
    },
    {
      year: "2023",
      description: "Hợp tác với GIGAMALL, tổ chức booth tại Sakura Cosplay Festival với doanh thu 500 triệu VNĐ.",
      position: "right",
    },
    {
      year: "2025",
      description:
        "Dẫn đầu thị trường cosplay Việt Nam, ra mắt tại Sakura Cosplay Festival 2025 với 20 sản phẩm mới, hướng tới mở rộng quốc tế",
      position: "left",
    },
  ]

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-primary/10 to-background">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-primary">NekoVi</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Kết nối cộng đồng anime Việt Nam, vươn tầm thế giới
          </p>
        </div>

        {/* About Content */}
        <div className="container mx-auto px-4 pb-16">
          <Card className="mb-12 overflow-hidden">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Images Grid */}
              <div className="relative h-[400px] md:h-auto">
                <Image src="/anime-cosplay-event-with-colorful-costumes.jpg" alt="NekoVi Event" fill className="object-cover" />
              </div>

              {/* Text Content */}
              <div className="p-8">
                <p className="leading-relaxed text-foreground">
                  NekoVi ra đời với sứ mệnh mang đến một không gian lý tưởng cho người yêu thích anime, webtoon và
                  cosplay tại Việt Nam. Với cơ hội làm việc với các nhà phân phối chính hãng, học hỏi và thể hiện bản
                  thân. Chúng tôi tự hào là cầu nối giữa văn hóa otaku của Nhật Bản và cộng đồng anime Việt Nam. Với mô
                  hình đi, NekoVi cung cấp các sản phẩm cosplay chất lượng cao như trang phục Tanjiro (Luffy 700,000
                  VNĐ) đến kiếm gỗ Nichirin (250,000 VNĐ). Với mô hình đi, NekoVi hướng tới việc mở rộng thị trường và
                  kiện gỗ Nichirin tại Sakura Cosplay Festival 2025 tại GIGAMALL, TP.HCM.
                </p>
              </div>
            </div>
          </Card>

          {/* Event Images Grid */}
          <div className="mb-16 grid gap-4 md:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image src="/sakura-festival-entrance-with-torii-gate.jpg" alt="Sakura Festival" fill className="object-cover" />
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <div className="relative h-[120px]">
                  <Image src="/anime-merchandise-booth.jpg" alt="Merchandise Booth" fill className="object-cover" />
                </div>
              </Card>
              <Card className="overflow-hidden">
                <div className="relative h-[120px]">
                  <Image src="/cosplay-competition-stage.jpg" alt="Cosplay Stage" fill className="object-cover" />
                </div>
              </Card>
              <Card className="col-span-2 overflow-hidden">
                <div className="relative h-[120px]">
                  <Image src="/anime-festival-crowd-with-cherry-blossoms.jpg" alt="Festival Crowd" fill className="object-cover" />
                </div>
              </Card>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-primary/20" />

            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative mb-16 flex items-center ${
                  item.position === "left" ? "justify-start" : "justify-end"
                }`}
              >
                <Card
                  className={`w-full max-w-md p-8 ${
                    item.position === "left" ? "mr-auto md:mr-[52%]" : "ml-auto md:ml-[52%]"
                  }`}
                >
                  <div
                    className={`mb-4 inline-block rounded-full bg-primary px-6 py-2 ${
                      item.position === "left" ? "" : "float-right"
                    }`}
                  >
                    <span className="text-2xl font-bold text-primary-foreground">{item.year}</span>
                  </div>
                  <p className="clear-both leading-relaxed text-foreground">{item.description}</p>
                </Card>

                {/* Timeline Dot */}
                <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary bg-background" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
