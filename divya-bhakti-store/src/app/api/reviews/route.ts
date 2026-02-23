import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reviewSchema } from '@/lib/validations';

// GET /api/reviews?productId=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate stats
        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;

        const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: reviews.filter((r) => r.rating === star).length,
            percentage:
                totalReviews > 0
                    ? Math.round(
                        (reviews.filter((r) => r.rating === star).length / totalReviews) *
                        100
                    )
                    : 0,
        }));

        return NextResponse.json({
            reviews,
            stats: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingBreakdown,
            },
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const { productId, rating, title, comment } = parsed.data;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        if (existingReview) {
            // Update existing review
            const updated = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating,
                    title: title || null,
                    comment: comment || null,
                    isApproved: true,
                },
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            });

            return NextResponse.json({ review: updated, updated: true });
        }

        // Create new review
        const review = await prisma.review.create({
            data: {
                userId: session.user.id,
                productId,
                rating,
                title: title || null,
                comment: comment || null,
                isApproved: true, // Auto-approve for now
            },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
        });

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}
