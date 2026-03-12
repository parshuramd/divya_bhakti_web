import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reviews = await prisma.review.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, image: true } },
                product: { select: { id: true, name: true, images: { where: { isPrimary: true }, take: 1 } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching admin reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, isApproved } = body;

        if (!id || typeof isApproved !== 'boolean') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const review = await prisma.review.update({
            where: { id },
            data: { isApproved },
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        await prisma.review.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
