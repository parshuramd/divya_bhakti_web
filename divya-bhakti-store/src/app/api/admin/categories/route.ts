import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { categorySchema } from '@/lib/validations';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// GET /api/admin/categories
export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ categories });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const parsed = categorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const data = parsed.data;
        const slug = data.slug || generateSlug(data.name);

        const category = await prisma.category.create({
            data: {
                ...data,
                slug,
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}

// PUT /api/admin/categories
export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const parsed = categorySchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                ...parsed.data,
                slug: parsed.data.slug || generateSlug(parsed.data.name),
            },
        });

        return NextResponse.json({ category });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE /api/admin/categories
export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        // Check if category has products
        const productCount = await prisma.product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${productCount} products are in this category` },
                { status: 400 }
            );
        }

        await prisma.category.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
