//src/app/not-found.tsx
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        {/* 404 Title */}
        <h1 className="mb-4 text-8xl font-bold text-foreground md:text-9xl">404 Không Tìm Thấy</h1>

        {/* Description */}
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          Trang bạn vừa truy cập không khả thi. Hãy thử lại sau
        </p>

        {/* Back to Home Button */}
        <Link href="/">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            Quay lại trang chủ
          </Button>
        </Link>

        {/* Mascot Illustration */}
        <div className="relative mt-12 h-64 w-64">
          <Image
            src="/placeholder.svg?key=sad-neko"
            alt="NekoVi Mascot - Page Not Found"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </MainLayout>
  )
}
