import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminOrderNotification, sendOrderStatusEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true, user: true },
          });

          if (existingOrder && existingOrder.paymentStatus === 'PAID') {
            return NextResponse.json({ status: 'already_processed' });
          }

          if (!existingOrder) {
            return NextResponse.json({ status: 'order_not_found' });
          }

          // Use transaction for atomicity
          const order = await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
                razorpayPaymentId: payment.id,
                paidAt: new Date(),
                timeline: {
                  create: {
                    status: 'CONFIRMED',
                    message: 'Payment captured via webhook',
                  },
                },
              },
              include: {
                items: { include: { product: true } },
                address: true,
                user: true,
              },
            });

            // Decrement stock atomically
            for (const item of updatedOrder.items) {
              const product = await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
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

          // Send emails (non-blocking)
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
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
          const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (existingOrder && existingOrder.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'FAILED',
                status: 'CANCELLED',
                timeline: {
                  create: {
                    status: 'CANCELLED',
                    message: `Payment failed: ${payment.error_description || 'Unknown error'}`,
                  },
                },
              },
              include: { user: true },
            });

            // Notify customer about failure
            if (existingOrder) {
              const orderWithUser = await prisma.order.findUnique({
                where: { id: orderId },
                include: { user: true },
              });
              if (orderWithUser?.user?.email) {
                sendOrderStatusEmail(
                  orderWithUser.user.email,
                  orderWithUser.orderNumber,
                  'CANCELLED'
                ).catch(() => {});
              }
            }
          }
        }
        break;
      }

      case 'refund.created': {
        const refund = payload.refund.entity;
        const paymentId = refund.payment_id;

        const order = await prisma.order.findFirst({
          where: { razorpayPaymentId: paymentId },
          include: { user: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'REFUNDED',
              status: 'REFUNDED',
              timeline: {
                create: {
                  status: 'REFUNDED',
                  message: `Refund of ₹${(refund.amount / 100).toFixed(2)} initiated`,
                },
              },
            },
          });

          if (order.user?.email) {
            sendOrderStatusEmail(
              order.user.email,
              order.orderNumber,
              'REFUNDED'
            ).catch(() => {});
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Webhook error:', error);
    }
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
