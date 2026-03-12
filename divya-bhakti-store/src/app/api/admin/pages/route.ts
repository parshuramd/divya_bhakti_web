import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ pages });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching pages:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, content, contentMarathi, isPublished } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingSlug = await prisma.page.findUnique({ where: { slug } });
        if (existingSlug) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const page = await prisma.page.create({
            data: {
                title,
                slug,
                content,
                contentMarathi: contentMarathi || null,
                isPublished: isPublished !== undefined ? isPublished : false,
            },
        });

        return NextResponse.json({ page }, { status: 201 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error creating page:', error);
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, slug, content, contentMarathi, isPublished } = body;

        if (!id || !title || !slug || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingSlug = await prisma.page.findFirst({
            where: { slug, NOT: { id } },
        });
        if (existingSlug) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const page = await prisma.page.update({
            where: { id },
            data: {
                title,
                slug,
                content,
                contentMarathi: contentMarathi || null,
                isPublished: isPublished !== undefined ? isPublished : false,
            },
        });

        return NextResponse.json({ page });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error updating page:', error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
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
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        await prisma.page.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting page:', error);
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
