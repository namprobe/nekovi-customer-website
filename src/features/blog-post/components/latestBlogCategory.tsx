// src/features/blog-post/components/latestBlogCategory.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, PanInfo } from "framer-motion"
import Link from "next/link"
import { BlogPostItem } from "@/src/features/blog-post/types/blog"

interface LatestBlogCategoryProps {
    posts: BlogPostItem[]
}

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9.93 2.25 12 7.5l2.07-5.25a.5.5 0 0 1 .9 0L17.25 8.5l4.16.34a.5.5 0 0 1 .29.88l-3.2 3.1.95 4.5a.5.5 0 0 1-.73.53L12 14.5l-3.72 2.33a.5.5 0 0 1-.73-.53l.95-4.5-3.2-3.1a.5.5 0 0 1 .29-.88l4.16-.34Z" />
    </svg>
)

const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m15 18-6-6 6-6" />
    </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
)

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${className}`}>
        {children}
    </div>
)

export default function LatestBlogCategory({ posts }: LatestBlogCategoryProps) {
    const [activeIndex, setActiveIndex] = useState(Math.floor(posts.length / 2))
    const [isPaused, setIsPaused] = useState(false)
    const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const autoplayDelay = 3000

    const goToNext = () => {
        setActiveIndex((prev) => (prev + 1) % posts.length)
    }

    useEffect(() => {
        if (!isPaused && posts.length > 0) {
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
        if (!isPaused) {
            autoplayIntervalRef.current = setInterval(goToNext, autoplayDelay)
        }
    }

    const onDragEnd = (_: any, info: PanInfo) => {
        const threshold = 75
        if (info.offset.x > threshold) changeSlide(activeIndex - 1)
        else if (info.offset.x < -threshold) changeSlide(activeIndex + 1)
    }

    if (posts.length === 0) return null

    return (
        <section className="w-full flex-col items-center justify-center font-sans overflow-hidden">
            <div
                className="w-full max-w-5xl mx-auto p-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="relative flex w-full flex-col rounded-3xl border border-white/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 pt-6 md:p-6">
                    <Badge className="absolute left-4 top-6 rounded-xl border border-gray-300 dark:border-white/10 text-base text-gray-700 dark:text-white/80 bg-gray-100/80 dark:bg-black/20 backdrop-blur-sm md:left-6">
                        <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800 h-5 w-5 mr-1" />
                        Các bài viết nổi bật
                    </Badge>

                    <div className="relative w-full h-[280px] md:h-[400px] flex items-center justify-center overflow-hidden pt-12">
                        <motion.div
                            className="w-full h-full flex items-center justify-center"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={onDragEnd}
                        >
                            {posts.map((post, index) => (
                                <BlogCard
                                    key={post.id}
                                    post={post}
                                    index={index}
                                    activeIndex={activeIndex}
                                    totalCards={posts.length}
                                />
                            ))}
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-6">
                        <button
                            onClick={() => changeSlide(activeIndex - 1)}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-center gap-2">
                            {posts.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => changeSlide(i)}
                                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${activeIndex === i
                                        ? "w-6 bg-pink-400"
                                        : "w-2 bg-gray-300 dark:bg-neutral-600 hover:bg-gray-400 dark:hover:bg-neutral-500"
                                        }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => changeSlide(activeIndex + 1)}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

function BlogCard({
    post,
    index,
    activeIndex,
    totalCards,
}: {
    post: BlogPostItem
    index: number
    activeIndex: number
    totalCards: number
}) {
    let offset = index - activeIndex
    if (offset > totalCards / 2) offset -= totalCards
    else if (offset < -totalCards / 2) offset += totalCards

    const isVisible = Math.abs(offset) <= 1
    const animate = {
        x: `${offset * 50}%`,
        scale: offset === 0 ? 1 : 0.8,
        zIndex: totalCards - Math.abs(offset),
        opacity: isVisible ? 1 : 0,
        transition: { type: "spring" as const, stiffness: 260, damping: 30 },
    }

    return (
        <motion.div
            className="absolute w-1/2 md:w-1/3 h-[95%]"
            animate={animate}
            initial={false}
        >
            <Link href={`/blog/${post.id}`} className="block h-full">
                <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-gray-200 dark:bg-neutral-800">
                    {post.featuredImage ? (
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover pointer-events-none"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.src = "/fallback-blog.jpg"
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center p-4">
                            <p className="text-white font-bold text-center">{post.title}</p>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <h4 className="text-white text-lg font-semibold line-clamp-2">
                            {post.title}
                        </h4>
                        {post.postCategory && (
                            <p className="text-pink-300 text-sm mt-1">{post.postCategory.name}</p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}