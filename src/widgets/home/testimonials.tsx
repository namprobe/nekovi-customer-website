import { Card, CardContent } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Minh",
    avatar: "/customer-1.jpg",
    rating: 5,
    comment: "A terrific piece of praise",
    date: "2 ngày trước",
  },
  {
    id: 2,
    name: "Hương",
    avatar: "/customer-2.jpg",
    rating: 5,
    comment: "A fantastic bit of feedback",
    date: "1 tuần trước",
  },
  {
    id: 3,
    name: "Nam",
    avatar: "/customer-3.jpg",
    rating: 5,
    comment: "A genuinely glowing review",
    date: "2 tuần trước",
  },
]

export function Testimonials() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-2">
          <h2 className="text-3xl font-bold">Đánh giá</h2>
          <div className="flex items-center gap-1 text-primary">
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
            <Star className="h-5 w-5 fill-current" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-secondary/30">
              <CardContent className="p-6">
                <p className="mb-4 text-lg font-medium text-balance">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
