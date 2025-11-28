"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, User, Menu } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/src/core/providers/auth-provider"
import { useCartStore } from "@/src/entities/cart/service"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import { CartPopup } from "@/src/widgets/cart/cart-popup"
import { WishlistPopup } from "@/src/widgets/wishlist/wishlist-popup"
import { useWishlistStore } from "@/src/entities/wishlist/service"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { clearCartState } = useCartStore()
  const { clearWishlistState } = useWishlistStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = async () => {
    // Clear cart and wishlist immediately before logout
    clearCartState()
    clearWishlistState()
    await logout()
    router.push("/login")
  }

  const navLinks = [
    { href: "/anime", label: "Anime" },
    { href: "/products", label: "Sản Phẩm" },
    { href: "/coupons", label: "Khuyến mãi" },
    { href: "/blog", label: "Bảng tin" },
    { href: "/awards", label: "Danh hiệu" },
    { href: "/about", label: "Câu chuyện" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground overflow-hidden">
            <Image
              src="/logo-nekovi.png"
              alt="NekoVi Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="hidden text-xl font-bold sm:inline">NekoVi</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary-foreground/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-md lg:flex">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60 border-primary-foreground/20"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full hover:bg-transparent"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Wishlist Popup */}
          <WishlistPopup />

          {/* Cart Popup */}
          <CartPopup />

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium"> {user?.lastName} {user?.firstName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Hồ Sơ Của Tôi</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Đơn Hàng</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">Yêu Thích</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Đăng Xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10 border border-primary-foreground/20">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="mt-4 pt-4 border-t">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Link href="/profile" className="block text-sm hover:text-primary">
                          Hồ Sơ Của Tôi
                        </Link>
                        <Link href="/orders" className="block text-sm hover:text-primary">
                          Đơn Hàng
                        </Link>
                        <Link href="/wishlist" className="block text-sm hover:text-primary">
                          Yêu Thích
                        </Link>
                        <button 
                          onClick={handleLogout} 
                          className="block text-sm text-destructive hover:text-destructive/80"
                        >
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" className="block text-sm hover:text-primary">
                        Đăng nhập
                      </Link>
                      <Link href="/register" className="block text-sm hover:text-primary">
                        Đăng ký
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Input
                    type="search"
                    placeholder="Tìm kiếm sản phẩm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
