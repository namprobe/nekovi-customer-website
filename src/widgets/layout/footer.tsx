import Link from "next/link"
import { Facebook, Instagram, Twitter, Phone, Mail, Heart } from "lucide-react"

export function Footer() {
  const productCategories = [
    { name: "Kimetsu no Yaiba", href: "/products?category=demon-slayer" },
    { name: "One Piece", href: "/products?category=one-piece" },
    { name: "Jujutsu Kaisen", href: "/products?category=jujutsu-kaisen" },
    { name: "Naruto", href: "/products?category=naruto" },
    { name: "The Boy and the Heron", href: "/products?category=the-boy-and-the-heron" },
  ]

  const companyLinks = [
    { name: "Câu chuyện", href: "/about" },
    { name: "Liên lạc", href: "/contact" },
    { name: "Chọn Anime", href: "/anime" },
  ]

  const customerLinks = [
    { name: "Tài khoản", href: "/profile" },
    { name: "Giỏ hàng", href: "/cart" },
    { name: "Yêu thích", href: "/wishlist" },
    { name: "Bán Hàng", href: "/sell" },
  ]

  return (
    <footer className="w-full border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">NekoVi</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Số điện thoại: +8801611112222</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>NekoVi@gmail.com</span>
              </div>
            </div>
          </div>

          {/* NekoVi Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">NekoVi</h3>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary-foreground/80">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              {productCategories.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} className="transition-colors hover:text-primary-foreground/80">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Thêm</h3>
            <ul className="space-y-2 text-sm">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary-foreground/80">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
          <div className="flex gap-4">
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="/wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm">All rights reserved@NekoVi.com</p>
        </div>
      </div>
    </footer>
  )
}
