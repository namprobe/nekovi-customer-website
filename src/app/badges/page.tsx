"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge as UIBadge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Award, CheckCircle2, Lock, TrendingUp, Gift, Calendar, Target } from "lucide-react"
import { AuthGuard } from "@/src/components/auth/auth-guard"
import { MainLayout } from "@/src/widgets/layout/main-layout"
import { useBadgeStore } from "@/src/entities/badge/service/badge-service"
import { useToast } from "@/src/hooks/use-toast"
import { ConditionType } from "@/src/entities/badge/type/badge"
import { getBadgeIconUrl } from "@/src/shared/utils/image"

export default function BadgesPage() {
  const { toast } = useToast()
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(false)
  const [newBadges, setNewBadges] = useState<any[]>([])

  const {
    unlockedBadges,
    lockedBadges,
    isLoading,
    error,
    fetchMyBadges,
    equipBadge,
    processBadgeEligibility,
  } = useBadgeStore()

  useEffect(() => {
    fetchMyBadges("all")
  }, [fetchMyBadges])

  const handleEquipBadge = async (badgeId: string, badgeName: string) => {
    const result = await equipBadge(badgeId)
    if (result.success) {
      toast({
        title: "✓ Danh hiệu đã trang bị",
        description: `${badgeName} đang được hiển thị trên hồ sơ của bạn`,
      })
      // Scroll to top to show the equipped badge section
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể trang bị danh hiệu",
        variant: "destructive",
      })
    }
  }

  const handleCheckNewBadges = async () => {
    const result = await processBadgeEligibility()
    if (result.success) {
      if (result.newBadges && result.newBadges.length > 0) {
        setNewBadges(result.newBadges)
        setShowNewBadgeModal(true)
        toast({
          title: "🎉 Chúc mừng!",
          description: `Bạn đã nhận được ${result.newBadges.length} danh hiệu mới!`,
        })
      } else {
        toast({
          title: "Không có danh hiệu mới",
          description: "Bạn chưa đủ điều kiện để nhận danh hiệu mới",
        })
      }
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể kiểm tra danh hiệu",
        variant: "destructive",
      })
    }
  }

  const getConditionText = (type: ConditionType, value: string) => {
    switch (type) {
      case ConditionType.TotalSpent:
        return `Chi tiêu ${parseInt(value).toLocaleString('vi-VN')}đ`
      case ConditionType.OrderCount:
        return `Hoàn thành ${value} đơn hàng`
      case ConditionType.ReviewCount:
        return `Đánh giá ${value} sản phẩm`
      default:
        return value
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const equippedBadge = unlockedBadges.find(b => b.isEquipped)

  return (
    <AuthGuard>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  Danh Hiệu Của Tôi
                </h1>
                <p className="text-muted-foreground">
                  Mở khóa danh hiệu để nhận ưu đãi và thể hiện thành tựu của bạn
                </p>
              </div>
              <Button onClick={handleCheckNewBadges} size="lg" disabled={isLoading}>
                <TrendingUp className="mr-2 h-5 w-5" />
                Kiểm Tra Danh Hiệu Mới
              </Button>
            </div>

            {/* Equipped Badge Display */}
            {equippedBadge && (
              <Card className="mt-6 border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                      {equippedBadge.iconUrl ? (
                        <img src={getBadgeIconUrl(equippedBadge.iconUrl)} alt={equippedBadge.name} className="h-12 w-12" />
                      ) : (
                        <Award className="h-12 w-12 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Đang Trang Bị</p>
                      <h3 className="text-2xl font-bold">{equippedBadge.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{equippedBadge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{equippedBadge.discountPercentage}%</div>
                      <p className="text-sm text-muted-foreground">Giảm Giá</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã Mở Khóa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{unlockedBadges.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Đang Khóa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{lockedBadges.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Tổng Ưu Đãi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {Math.max(...unlockedBadges.map(b => b.discountPercentage), 0)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Đang tải danh hiệu...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchMyBadges("all")}>Thử lại</Button>
            </div>
          )}

          {/* Badge Tabs */}
          {!isLoading && !error && (
            <Tabs defaultValue="unlocked" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="unlocked">Đã Mở Khóa ({unlockedBadges.length})</TabsTrigger>
                <TabsTrigger value="locked">Đang Khóa ({lockedBadges.length})</TabsTrigger>
              </TabsList>

              {/* Unlocked Badges */}
              <TabsContent value="unlocked" className="mt-6">
                {unlockedBadges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Award className="h-24 w-24 text-muted-foreground/50 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Chưa có danh hiệu</h2>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Mua sắm và tương tác để mở khóa danh hiệu đầu tiên của bạn!
                    </p>
                    <Button onClick={handleCheckNewBadges}>
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Kiểm Tra Ngay
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {unlockedBadges.map((badge) => (
                      <Card
                        key={badge.userBadgeId}
                        className={`relative overflow-hidden transition-all hover:shadow-lg ${
                          badge.isEquipped ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                        }`}
                      >
                        {badge.isEquipped && (
                          <div className="absolute top-3 right-3">
                            <UIBadge className="bg-primary">Đang Trang Bị</UIBadge>
                          </div>
                        )}

                        <CardHeader className="text-center pb-3">
                          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                            {badge.iconUrl ? (
                              <img src={getBadgeIconUrl(badge.iconUrl)} alt={badge.name} className="h-16 w-16" />
                            ) : (
                              <Award className="h-16 w-16 text-primary" />
                            )}
                          </div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          {badge.description && (
                            <p className="text-sm text-muted-foreground mt-2">{badge.description}</p>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {badge.discountPercentage > 0 && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                              <Gift className="h-5 w-5 text-primary" />
                              <span className="font-bold text-primary">{badge.discountPercentage}% Giảm Giá</span>
                            </div>
                          )}

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Nhận lúc: {formatDate(badge.earnedDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Target className="h-4 w-4" />
                              <span>{getConditionText(badge.conditionType, badge.conditionValue)}</span>
                            </div>
                          </div>

                          {!badge.isEquipped && (
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => handleEquipBadge(badge.badgeId, badge.name)}
                            >
                              <Award className="mr-2 h-4 w-4" />
                              Trang Bị
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Locked Badges */}
              <TabsContent value="locked" className="mt-6">
                {lockedBadges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <CheckCircle2 className="h-24 w-24 text-green-500 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Hoàn Thành Tất Cả!</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      Bạn đã mở khóa tất cả danh hiệu hiện có. Hãy tiếp tục mua sắm!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {lockedBadges.map((badge) => (
                      <Card key={badge.badgeId} className="relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                        <div className="absolute top-3 right-3">
                          <UIBadge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Đang Khóa
                          </UIBadge>
                        </div>

                        <CardHeader className="text-center pb-3">
                          <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                            {badge.iconUrl ? (
                              <img src={getBadgeIconUrl(badge.iconUrl)} alt={badge.name} className="h-16 w-16 grayscale" />
                            ) : (
                              <Award className="h-16 w-16 text-muted-foreground" />
                            )}
                          </div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          {badge.description && (
                            <p className="text-sm text-muted-foreground mt-2">{badge.description}</p>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {badge.discountPercentage > 0 && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                              <Gift className="h-5 w-5 text-muted-foreground" />
                              <span className="font-bold text-muted-foreground">{badge.discountPercentage}% Giảm Giá</span>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tiến Độ:</span>
                              <span className="font-semibold">{badge.progress}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: badge.progress || '0%' }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{badge.currentValue.toLocaleString('vi-VN')}</span>
                              <span>{badge.targetValue.toLocaleString('vi-VN')}</span>
                            </div>
                          </div>

                          <div className="pt-2 text-center text-sm text-muted-foreground">
                            {getConditionText(badge.conditionType, badge.conditionValue)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* New Badge Modal */}
          {showNewBadgeModal && newBadges.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="max-w-2xl mx-4 border-2 border-primary">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
                      <Award className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl">🎉 Chúc Mừng!</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Bạn đã nhận được {newBadges.length} danh hiệu mới!
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newBadges.map((badge) => (
                    <div key={badge.userBadgeId} className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                        {badge.iconUrl ? (
                          <img src={getBadgeIconUrl(badge.iconUrl)} alt={badge.name} className="h-12 w-12" />
                        ) : (
                          <Award className="h-12 w-12 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        {badge.discountPercentage > 0 && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            +{badge.discountPercentage}% Giảm Giá
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" size="lg" onClick={() => setShowNewBadgeModal(false)}>
                    Tuyệt Vời!
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
