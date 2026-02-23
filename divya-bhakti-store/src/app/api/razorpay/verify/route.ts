import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order
    const order = await prisma.order.update({
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
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: true,
      },
    });

    // Update product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Update coupon usage if applicable
    if (order.couponId) {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // Send confirmation email to customer
    const addressStr = `${order.address.fullName}, ${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`;
    const orderItemsSummary = order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.total),
    }));

    if (order.user?.email) {
      await sendOrderConfirmationEmail(order.user.email, {
        orderNumber: order.orderNumber,
        items: orderItemsSummary,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        address: addressStr,
      });
    }

    // Send notification email to admin
    await sendAdminOrderNotification({
      orderNumber: order.orderNumber,
      customerName: order.address.fullName,
      customerEmail: order.user?.email || 'N/A',
      customerPhone: order.address.phone,
      paymentMethod: 'RAZORPAY',
      items: orderItemsSummary,
      total: Number(order.total),
      address: addressStr,
    });

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
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

