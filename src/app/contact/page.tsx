"use client"

import type React from "react"

import { MainLayout } from "@/src/widgets/layout/main-layout"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Phone, Mail } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">CONTACT US</p>
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Liên Hệ Với Chúng Tôi Ngay</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Input
                      placeholder="Họ và tên *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-muted/50"
                    />
                  </div>
                </div>

                <div>
                  <Input
                    type="tel"
                    placeholder="Số điện thoại *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-muted/50"
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Lý do viết đơn của bạn"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="resize-none bg-muted/50"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Gửi đơn
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Call Us Card */}
              <Card className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <Phone className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">Gọi cho chúng tôi</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Thời gian làm việc từ 08:00 - 17:00 từ thứ 2 tới thứ sáu.
                </p>
                <p className="text-lg font-semibold text-foreground">Số điện thoại: +880161112222</p>
              </Card>

              {/* Email Us Card */}
              <Card className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <Mail className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">Email cho chúng tôi</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Điền đơn và chúng tôi sẽ liên lạc với bạn trong vòng 24 giờ
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Emails:</span> NekoVi@gmail.com
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Emails:</span> NekoVisupport@gmail.com
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
