import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { addressId, items, couponCode, notes } = body;

    // Validate items and calculate total
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          OR: [
            { startsAt: null },
            { startsAt: { lte: new Date() } },
          ],
          AND: [
            {
              OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
              ],
            },
          ],
        },
      });

      if (coupon) {
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
          return NextResponse.json(
            { error: `Minimum order amount is ₹${coupon.minOrderAmount}` },
            { status: 400 }
          );
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json(
            { error: 'Coupon usage limit exceeded' },
            { status: 400 }
          );
        }

        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
            discount = Number(coupon.maxDiscount);
          }
        } else {
          discount = Number(coupon.discountValue);
        }
      }
    }

    // Calculate shipping (free above ₹499)
    const shippingCost = subtotal >= 499 ? 0 : 49;
    const total = Math.max(0, subtotal - discount + shippingCost);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Amount in paise
      currency: 'INR',
      receipt: generateOrderNumber(),
      notes: {
        userId: session.user.id,
        addressId,
      },
    });

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: razorpayOrder.receipt as string,
        userId: session.user.id,
        addressId,
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        subtotal,
        shippingCost,
        discount,
        total,
        couponId: coupon?.id,
        notes,
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: orderItems,
        },
        timeline: {
          create: {
            status: 'PENDING',
            message: 'Order created, awaiting payment',
          },
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

