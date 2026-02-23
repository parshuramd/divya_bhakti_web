import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
          // Check if already processed (idempotency)
          const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (existingOrder && existingOrder.paymentStatus === 'PAID') {
            return NextResponse.json({ status: 'already_processed' });
          }

          await prisma.order.update({
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
          });
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const orderId = payment.notes?.orderId;

        if (orderId) {
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
          });
        }
        break;
      }

      case 'refund.created': {
        const refund = payload.refund.entity;
        const paymentId = refund.payment_id;

        const order = await prisma.order.findFirst({
          where: { razorpayPaymentId: paymentId },
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
        }
        break;
      }

      default:
        // Unhandled event type - acknowledge receipt
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
