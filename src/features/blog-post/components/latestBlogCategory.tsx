// src/features/blog-post/components/latestBlogCategory.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, PanInfo } from "framer-motion"
import Link from "next/link"
import { BlogPostItem } from "@/src/features/blog-post/types/blog"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Calendar, User, ChevronLeft, ChevronRight } from "lucide-react"

interface LatestBlogCategoryProps {
    posts: BlogPostItem[]
}

const truncateContent = (html: string, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, "").trim()
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}

export default function LatestBlogCategory({ posts }: LatestBlogCategoryProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const autoplayDelay = 4000

    const goToNext = () => {
        setActiveIndex((prev) => (prev + 1) % posts.length)
    }

    useEffect(() => {
        if (!isPaused && posts.length > 1) {
            autoplayIntervalRef.current = setInterval(goToNext, autoplayDelay)
        }
        return () => {
            if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
        }
    }, [isPaused, activeIndex, posts.length])

    const changeSlide = (newIndex: number) => {
        const safeIndex = ((newIndex % posts.length) + posts.length) % posts.length
        setActiveIndex(safeIndex)
        if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
        if (!isPaused && posts.length > 1) {
            autoplayIntervalRef.current = setInterval(goToNext, autoplayDelay)
        }
    }

    const onDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100
        if (info.offset.x > threshold) changeSlide(activeIndex - 1)
        else if (info.offset.x < -threshold) changeSlide(activeIndex + 1)
    }

    if (!posts || posts.length === 0) return null

    return (
        <section className="w-full py-8 md:py-12 overflow-hidden">
            <div
                className="w-full max-w-7xl mx-auto px-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Badge tiêu đề */}
                <div className="mb-6 md:mb-8">
                    <Badge className="inline-flex items-center gap-2 px-4 py-2 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                        <SparklesIcon className="w-5 h-5" />
                        Các bài viết nổi bật
                    </Badge>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    <div className="overflow-hidden rounded-3xl">
                        <motion.div
                            className="flex"
                            drag="x"
                            dragConstraints={{ left: -100, right: 100 }}
                            dragElastic={0.2}
                            onDragEnd={onDragEnd}
                            style={{ x: `${-activeIndex * 100}%` }}
                            animate={{ x: `${-activeIndex * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {posts.map((post, index) => (
                                <div
                                    key={post.id}
                                    className="w-full flex-shrink-0 px-2"
                                    style={{ width: "100%" }}
                                >
                                    <BlogHighlightCard post={post} />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Nút điều hướng */}
                    {posts.length > 1 && (
                        <>
                            <button
                                onClick={() => changeSlide(activeIndex - 1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 shadow-lg hover:bg-white dark:hover:bg-neutral-800 transition-all backdrop-blur-sm border border-gray-200 dark:border-white/20"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
                            </button>
                            <button
                                onClick={() => changeSlide(activeIndex + 1)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 shadow-lg hover:bg-white dark:hover:bg-neutral-800 transition-all backdrop-blur-sm border border-gray-200 dark:border-white/20"
                                aria-label="Next"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700 dark:text-white" />
                            </button>
                        </>
                    )}

                    {/* Dots */}
                    {posts.length > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {posts.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => changeSlide(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex
                                        ? "w-8 bg-pink-500"
                                        : "w-2 bg-gray-300 dark:bg-neutral-600 hover:bg-gray-400"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function BlogHighlightCard({ post }: { post: BlogPostItem }) {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full">
            <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
                {post.featuredImage ? (
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/fallback-blog.jpg"
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-6">
                        <p className="text-center font-bold text-xl text-purple-700">{post.title}</p>
                    </div>
                )}

                {/* Badge danh mục - góc trên trái */}
                {post.postCategory && (
                    <Badge className="absolute top-4 left-4 bg-pink-500 text-white border-0 text-sm font-medium">
                        {post.postCategory.name}
                    </Badge>
                )}
            </div>

            {/* === PHẦN THÔNG TIN DƯỚI ẢNH === */}
            <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                    {/* Tiêu đề */}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {post.title}
                    </h3>

                    {/* Mô tả ngắn */}
                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-4 line-clamp-3">
                        {truncateContent(post.content)}
                    </p>

                    {/* Tác giả + ngày */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{post.authorName || "NekoVi Team"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.publishDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                    </div>
                </div>

                {/* === NÚT ĐỌC TIẾP - GÓC DƯỚI BÊN PHẢI === */}
                <div className="mt-6 flex justify-end">
                    <Link href={`/blog/${post.id}`}>
                        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                            Đọc tiếp
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// Icon Sparkles
const SparklesIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M9.93 2.25 12 7.5l2.07-5.25a.5.5 0 0 1 .9 0L17.25 8.5l4.16.34a.5.5 0 0 1 .29.88l-3.2 3.1.95 4.5a.5.5 0 0 1-.73.53L12 14.5l-3.72 2.33a.5.5 0 0 1-.73-.53l.95-4.5-3.2-3.1a.5.5 0 0 1 .29-.88l4.16-.34Z" />
    </svg>
)