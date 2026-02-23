'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, User, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ReviewUser {
    id: string;
    name: string | null;
    image: string | null;
}

interface Review {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    createdAt: string;
    user: ReviewUser;
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: { star: number; count: number; percentage: number }[];
}

interface ReviewSectionProps {
    productId: string;
    initialStats?: ReviewStats;
}

function StarRating({
    rating,
    size = 'sm',
    interactive = false,
    onRate,
}: {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRate?: (rating: number) => void;
}) {
    const [hover, setHover] = useState(0);
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        sizeClasses[size],
                        'transition-colors',
                        interactive && 'cursor-pointer hover:scale-110 transition-transform',
                        (interactive ? hover || rating : rating) >= star
                            ? 'fill-gold-400 text-gold-400'
                            : 'text-gray-300'
                    )}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    onClick={() => interactive && onRate?.(star)}
                />
            ))}
        </div>
    );
}

export function ReviewSection({ productId, initialStats }: ReviewSectionProps) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>(
        initialStats || {
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: [5, 4, 3, 2, 1].map((star) => ({
                star,
                count: 0,
                percentage: 0,
            })),
        }
    );
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
                setStats(data.stats);
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            toast({
                title: 'Login Required',
                description: 'Please login to write a review.',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, title, comment }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            toast({
                title: data.updated ? 'Review Updated' : 'Review Submitted',
                description: 'Thank you for your feedback!',
            });

            setShowForm(false);
            setTitle('');
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to submit review',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                    Customer Reviews
                </h2>
                {session && (
                    <Button
                        variant="outline"
                        onClick={() => setShowForm(!showForm)}
                        className="border-saffron-200 text-saffron-700 hover:bg-saffron-50"
                    >
                        <Star className="h-4 w-4 mr-2" />
                        Write a Review
                    </Button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-[200px_1fr] gap-8">
                <div className="text-center md:text-left">
                    <div className="text-5xl font-bold text-gray-900">
                        {stats.averageRating.toFixed(1)}
                    </div>
                    <StarRating rating={Math.round(stats.averageRating)} size="md" />
                    <p className="text-sm text-muted-foreground mt-1">
                        {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                </div>

                <div className="space-y-2">
                    {stats.ratingBreakdown.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-8 text-right">
                                {star}★
                            </span>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gold-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground w-10">
                                {count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Write Review Form */}
            {showForm && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-lg mb-4">Write Your Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Rating</Label>
                            <StarRating rating={rating} size="lg" interactive onRate={setRating} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review-title">Title (optional)</Label>
                            <Input
                                id="review-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Sum up your experience"
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review-comment">Your Review (optional)</Label>
                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                maxLength={1000}
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-saffron-600 hover:bg-saffron-700"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Submit Review
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <Separator />

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-saffron-500" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to review this product!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-saffron-100 flex items-center justify-center flex-shrink-0 text-saffron-700 font-medium">
                                {review.user?.name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-900">
                                        {review.user?.name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} size="sm" />
                                {review.title && (
                                    <p className="font-medium text-gray-900 pt-1">{review.title}</p>
                                )}
                                {review.comment && (
                                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
