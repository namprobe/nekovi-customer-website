// src/features/product-review/ProductReviewForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/core/providers/auth-provider';
import { useToast } from '@/src/hooks/use-toast';
import { productReviewService } from '@/src/entities/productReview/service/product-review-service';
import { Star } from 'lucide-react';

interface ProductReviewFormProps {
    productId: string;
    existingReview?: {
        id: string;
        rating: number;
        title?: string;
        comment?: string;
    };
    onSuccess: () => void;
}

export function ProductReviewForm({ productId, existingReview, onSuccess }: ProductReviewFormProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [title, setTitle] = useState(existingReview?.title || '');
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: 'Yêu cầu đăng nhập',
                description: 'Vui lòng đăng nhập để đánh giá sản phẩm',
                variant: 'destructive',
            });
            router.push('/login'); // Chuyển sang trang login
            return;
        }

        if (rating === 0) {
            toast({
                title: 'Thiếu đánh giá',
                description: 'Vui lòng chọn số sao',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            if (existingReview) {
                await productReviewService.update(existingReview.id, { rating, title, comment });
                toast({ title: 'Cập nhật đánh giá thành công!' });
            } else {
                await productReviewService.create({ productId, rating, title, comment });
                toast({ title: 'Gửi đánh giá thành công!' });
            }
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể gửi đánh giá',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
            <div>
                <label className="mb-2 block text-sm font-medium">Đánh giá của bạn</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="title" className="mb-1 block text-sm font-medium">
                    Tiêu đề (không bắt buộc)
                </label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tóm tắt cảm nhận của bạn..."
                    maxLength={100}
                />
            </div>

            <div>
                <label htmlFor="comment" className="mb-1 block text-sm font-medium">
                    Nhận xét (không bắt buộc)
                </label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    rows={3}
                    maxLength={500}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Đang gửi...' : existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </Button>
        </form>
    );
}