'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface Review {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isApproved: boolean;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
    product: {
        id: string;
        name: string;
        images: { url: string }[];
    };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load reviews', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isApproved: !currentStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            toast({ title: 'Success', description: `Review ${!currentStatus ? 'approved' : 'rejected'}` });
            setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r)));
        } catch {
            toast({ title: 'Error', description: 'Failed to update review status', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast({ title: 'Success', description: 'Review deleted successfully' });
            setReviews(reviews.filter((r) => r.id !== id));
        } catch {
            toast({ title: 'Error', description: 'Failed to delete review', variant: 'destructive' });
        }
    };

    return (
        <div className="lg:ml-64">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Reviews</h1>
                    <p className="text-muted-foreground">Manage product reviews and ratings</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
                </div>
            ) : reviews.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No reviews yet</p>
                        <p className="text-sm">When customers leave reviews, they will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Review</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review) => (
                                        <tr key={review.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {review.product.images[0]?.url ? (
                                                            <Image
                                                                src={review.product.images[0].url}
                                                                alt={review.product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <Star className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="font-medium max-w-[200px] truncate" title={review.product.name}>
                                                        {review.product.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top max-w-[300px]">
                                                <div className="flex items-center gap-1 mb-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                {review.title && <div className="font-semibold">{review.title}</div>}
                                                {review.comment && (
                                                    <div className="text-muted-foreground mt-1 line-clamp-2" title={review.comment}>
                                                        {review.comment}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500 mt-2">By {review.user.name || review.user.email}</div>
                                            </td>
                                            <td className="px-4 py-4 align-top text-center">
                                                <Badge variant={review.isApproved ? 'success' : 'secondary'}>
                                                    {review.isApproved ? 'Approved' : 'Pending'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 align-top text-muted-foreground whitespace-nowrap">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 align-top text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleApproval(review.id, review.isApproved)}
                                                        className={review.isApproved ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                                                    >
                                                        {review.isApproved ? 'Reject' : 'Approve'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(review.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
