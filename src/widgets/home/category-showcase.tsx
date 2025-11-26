// src/widgets/home/category-showcase.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryService } from "@/src/entities/categories/services/category.service";
import type { CategoryItem } from "@/src/entities/categories/type/category";

export function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const realIndex = currentIndex % categories.length;


  // Tính số item hiển thị theo width thực tế
  const getItemsPerView = useCallback(() => {
    if (!containerRef.current) return 4;
    const containerWidth = containerRef.current.offsetWidth;
    const itemWidth = 280; // 280px là width ước lượng của mỗi card + gap
    return Math.max(2, Math.floor(containerWidth / itemWidth));
  }, []);

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);

  useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        setIsLoading(true);
        const result = await categoryService.getCategoryList({
          isRoot: true,
          status: 1,
          pageSize: 30,
        });
        setCategories(result.items);
      } catch (err: any) {
        setError(err.message || "Không thể tải danh mục");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRootCategories();
  }, []);

  // Cập nhật itemsPerView khi resize
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      setItemsPerView(newItemsPerView);
      setCurrentIndex(0); // reset về đầu khi thay đổi số item hiển thị
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getItemsPerView, categories.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? categories.length - 1 : prev - 1
    );
  }, [categories.length]);


  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  }, [categories.length]);


  // Auto-play
  useEffect(() => {
    if (categories.length <= itemsPerView) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, categories.length, itemsPerView]);

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-3xl font-bold text-center">Danh Mục Sản Phẩm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-muted rounded-xl aspect-square animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) return null;

  return (
    <section className="bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-3xl font-bold text-center">Danh Mục Sản Phẩm</h2>

        <div className="relative">
          {/* Nút trái */}
          {categories.length > itemsPerView && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur hover:bg-white shadow-lg"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Nút phải */}
          {categories.length > itemsPerView && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur hover:bg-white shadow-lg"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Carousel container */}
          <div ref={containerRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {/* Duplicate để tạo vòng tròn */}
              {[...categories, ...categories].map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="flex-shrink-0 px-3"
                  style={{
                    width: `${100 / itemsPerView}%`,
                  }}
                >
                  <Link href={`/products?cat=${category.id}`}>
                    <Card className="group overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 h-full bg-white">
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <img
                            src={category.imagePath || "/placeholder.svg?height=400&width=400"}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />

                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Text overlay (đã đưa vào trong relative container) */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 text-white text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                            <h3 className="text-xl font-bold drop-shadow-lg">{category.name}</h3>

                            {category.description && (
                              <p className="mt-1 text-sm opacity-90 line-clamp-2 drop-shadow">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>

                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Dots indicator */}
          {categories.length > itemsPerView && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: categories.length }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${idx === realIndex
                    ? "bg-primary w-10 h-3"
                    : "bg-muted w-3 h-3 hover:bg-primary/70"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}