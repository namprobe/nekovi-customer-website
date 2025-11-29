// src/widgets/home/hero-banner.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeroBannerImages } from "@/src/hooks/useHeroBannerImages";
import { useState, useEffect } from "react";
import clsx from "clsx";

export function HeroBanner() {
  const { images, isLoading } = useHeroBannerImages();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Loading
  if (isLoading) {
    return <Skeleton className="w-full aspect-[21/9] md:aspect-[21/7] rounded-none" />;
  }

  // Fallback khi không có ảnh
  if (!images.length) {
    return (
      <div className="relative aspect-[21/9] md:aspect-[21/7] bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center flex overflow-hidden">
        <div className="text-center z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">NekoViBE</h1>
          <p className="text-xl text-white/80">Anime Paradise</p>
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div className="relative aspect-[21/9] md:aspect-[21/7]">
        {/* Các ảnh */}
        {images.map((img, i) => (
          <div
            key={img.id}
            className={clsx(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              i === currentIndex ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Dùng thẻ <img> thuần + trick chống layout shift */}
            <img
              src={img.imagePath}
              alt={img.name}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              style={{ aspectRatio: "21 / 9" }}
            />

            {/* Overlay tên anime (nếu có) */}
            {img.name && (
              <div className="absolute bottom-8 left-8 bg-black/70 backdrop-blur px-8 py-4 rounded-xl pointer-events-none">
                <p className="text-3xl font-bold text-white drop-shadow-2xl">
                  {img.name}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Navigation - chỉ hiện khi có nhiều hơn 1 ảnh */}
        {images.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              className="
        absolute left-4 top-1/2 -translate-y-1/2 
        flex items-center justify-center
        h-14 w-14 rounded-full
        bg-black/50 hover:bg-black/70 
        border border-white/70
        shadow-xl
        backdrop-blur-lg
        transition-all
        hover:scale-110
      "
              onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-10 w-10 text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]" />
            </button>

            {/* Right Arrow */}
            <button
              className="
        absolute right-4 top-1/2 -translate-y-1/2 
        flex items-center justify-center
        h-14 w-14 rounded-full
        bg-black/50 hover:bg-black/70 
        border border-white/70
        shadow-xl
        backdrop-blur-lg
        transition-all
        hover:scale-110
      "
              onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
            >
              <ChevronRight className="h-10 w-10 text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]" />
            </button>
            {/* Dots indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={clsx(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentIndex ? "w-12 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}