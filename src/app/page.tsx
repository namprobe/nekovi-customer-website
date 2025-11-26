// src/app/page.tsx
import { MainLayout } from "@/src/widgets/layout/main-layout";
import { HeroBanner } from "@/src/widgets/home/hero-banner";
import { CategoryShowcase } from "@/src/widgets/home/category-showcase";
import { FeaturedProductsSection } from "@/src/widgets/home/featured-products";
import { Testimonials } from "@/src/widgets/home/testimonials";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroBanner />
      <CategoryShowcase />

      <FeaturedProductsSection
        title="Các mẫu mới nhất"
        isNewest={true}
        limit={5}
        showViewAll={true}
      />

      <FeaturedProductsSection
        title="Gợi ý cho bạn"
        isNewest={false}
        limit={5}
        showViewAll={false}
      />

      <Testimonials />
    </MainLayout>
  );
}