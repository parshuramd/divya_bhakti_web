import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  orderId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = parsed.data;

    // Verify order exists, belongs to user, and hasn't already been paid
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, paymentStatus: true, total: true, razorpayOrderId: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existingOrder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (existingOrder.paymentStatus === 'PAID') {
      return NextResponse.json({ status: 'already_processed', message: 'Payment already verified' });
    }

    if (existingOrder.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Use a transaction for atomicity: update order, decrement stock, update coupon
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
          timeline: {
            create: {
              status: 'CONFIRMED',
              message: 'Payment received successfully',
            },
          },
        },
        include: {
          items: { include: { product: true } },
          address: true,
          user: true,
        },
      });

      // Atomically decrement stock with guard against negative values
      for (const item of updatedOrder.items) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
        if (product.stock < 0) {
          throw new Error(`Insufficient stock for: ${item.name}`);
        }
      }

      // Update coupon usage
      if (updatedOrder.couponId) {
        await tx.coupon.update({
          where: { id: updatedOrder.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return updatedOrder;
    });

    // Send emails (non-blocking, outside transaction)
    const addressStr = `${order.address.fullName}, ${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`;
    const orderItemsSummary = order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.total),
    }));

    if (order.user?.email) {
      sendOrderConfirmationEmail(order.user.email, {
        orderNumber: order.orderNumber,
        items: orderItemsSummary,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        address: addressStr,
      }).catch(() => {});
    }

    sendAdminOrderNotification({
      orderNumber: order.orderNumber,
      customerName: order.address.fullName,
      customerEmail: order.user?.email || 'N/A',
      customerPhone: order.address.phone,
      paymentMethod: 'RAZORPAY',
      items: orderItemsSummary,
      total: Number(order.total),
      address: addressStr,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Payment verification error:', error);
    }
    const message = error instanceof Error ? error.message : 'Failed to verify payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
