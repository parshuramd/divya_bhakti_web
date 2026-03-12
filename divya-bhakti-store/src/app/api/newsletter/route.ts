import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = subscribeSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email } = result.data;

        const subscriber = await prisma.subscriber.upsert({
            where: { email },
            update: { isActive: true },
            create: { email, isActive: true },
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to the newsletter!'
        }, { status: 201 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Newsletter subscription error:', error);
        }

        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again later.' },
            { status: 500 }
        );
    }
}
