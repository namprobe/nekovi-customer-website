import { MainLayout } from "@/src/widgets/layout/main-layout"
import { HeroBanner } from "@/src/widgets/home/hero-banner"
import { CategoryShowcase } from "@/src/widgets/home/category-showcase"
import { FeaturedProducts } from "@/src/widgets/home/featured-products"
import { Testimonials } from "@/src/widgets/home/testimonials"
import { mockProducts, mockCategories } from "@/src/core/lib/mock-data"

export default function HomePage() {
  const newProducts = mockProducts.slice(0, 5)
  const popularProducts = mockProducts.slice(2, 7)

  return (
    <MainLayout>
      <HeroBanner />
      <CategoryShowcase categories={mockCategories.slice(0, 4)} />
      <FeaturedProducts title="Các mẫu mới nhất" products={newProducts} />
      <FeaturedProducts title="Sản phẩm phổ biến" products={popularProducts} />
      <Testimonials />
    </MainLayout>
  )
}
