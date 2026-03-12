import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateOrderStatusSchema } from '@/lib/validations';
import { sendOrderStatusEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
        timeline: { orderBy: { createdAt: 'desc' } },
        coupon: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, message } = parsed.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      status,
      timeline: {
        create: {
          status,
          message: message || `Order status updated to ${status}`,
        },
      },
    };

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      if (existingOrder.paymentMethod === 'COD') {
        updateData.paymentStatus = 'PAID';
        updateData.paidAt = new Date();
      }
    } else if (status === 'CANCELLED') {
      // Restore stock on cancellation
      const items = await prisma.orderItem.findMany({
        where: { orderId: params.id },
      });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // Allow tracking URL and AWB from request body
    if (body.trackingUrl) updateData.trackingUrl = body.trackingUrl;
    if (body.awbNumber) updateData.awbNumber = body.awbNumber;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: true,
        address: true,
        items: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Send status email to customer
    if (order.user?.email) {
      sendOrderStatusEmail(
        order.user.email,
        order.orderNumber,
        status,
        order.trackingUrl || undefined
      ).catch(() => {});
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
