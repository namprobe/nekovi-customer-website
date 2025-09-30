"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"

const banners = [
  {
    id: 1,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/home-page.png-1vCN20NZC1rtVrzHB7zzrreqt8mHaH.jpeg",
    alt: "Demon Slayer Banner",
    title: "Demon Slayer Collection",
  },
  {
    id: 2,
    image: "/anime-banner-2.jpg",
    alt: "One Piece Banner",
    title: "One Piece Collection",
  },
  {
    id: 3,
    image: "/anime-banner-3.jpg",
    alt: "Naruto Banner",
    title: "Naruto Collection",
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
      <div className="relative aspect-[21/9] w-full md:aspect-[21/7]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={banner.image || "/placeholder.svg"}
              alt={banner.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "bg-background/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
