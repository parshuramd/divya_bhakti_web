import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Save to database
        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully'
        }, { status: 201 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error in contact POST:', error);
        }

        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
