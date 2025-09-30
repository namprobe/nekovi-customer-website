import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/src/components/ui/card"
import type { Category } from "@/src/shared/types"

interface CategoryShowcaseProps {
  categories: Category[]
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-balance">Danh Mục Sản Phẩm</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`}>
              <Card className="group overflow-hidden transition-all hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={category.image || "/placeholder.svg?height=300&width=300"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-balance">{category.name}</h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-muted-foreground text-balance">{category.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
