import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ announcements });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, messageMarathi, link, bgColor, textColor, isActive } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                message,
                messageMarathi: messageMarathi || null,
                link: link || null,
                bgColor: bgColor || '#f97316',
                textColor: textColor || '#ffffff',
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return NextResponse.json({ announcement }, { status: 201 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error creating announcement:', error);
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, message, messageMarathi, link, bgColor, textColor, isActive } = body;

        if (!id || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                message,
                messageMarathi: messageMarathi || null,
                link: link || null,
                bgColor: bgColor || '#f97316',
                textColor: textColor || '#ffffff',
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return NextResponse.json({ announcement });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error updating announcement:', error);
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
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
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.announcement.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error deleting announcement:', error);
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }
}
