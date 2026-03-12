import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const email = searchParams.get('email')?.trim()?.toLowerCase();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required for verification' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        trackingUrl: true,
        awbNumber: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true,
        user: { select: { email: true } },
        timeline: {
          orderBy: { createdAt: 'desc' },
          select: { status: true, message: true, createdAt: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify email matches to prevent unauthorized access
    if (order.user?.email !== email) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Don't expose user email in response
    const { user, ...orderData } = order;

    return NextResponse.json({ order: orderData });
  } catch {
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
  }
}
