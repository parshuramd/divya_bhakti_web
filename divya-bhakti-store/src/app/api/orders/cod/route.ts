import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';

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

    if (!addressId || !items?.length) {
      return NextResponse.json(
        { error: 'Address and items are required' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Use a transaction for the entire order creation + stock decrement
    const order = await prisma.$transaction(async (tx) => {
      // Validate items and calculate total
      const productIds = items.map((item: { productId: string }) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for: ${product.name}`);
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
        coupon = await tx.coupon.findFirst({
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
            throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
          }

          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error('Coupon usage limit exceeded');
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

      const shippingCost = subtotal >= 499 ? 0 : 49;
      const total = Math.max(0, subtotal - discount + shippingCost);

      // Create order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          addressId,
          status: 'CONFIRMED',
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          subtotal,
          shippingCost,
          discount,
          total,
          couponId: coupon?.id,
          notes,
          items: { create: orderItems },
          timeline: {
            create: {
              status: 'CONFIRMED',
              message: 'Order placed with Cash on Delivery',
            },
          },
        },
        include: {
          items: { include: { product: true } },
          address: true,
          user: true,
        },
      });

      // Atomically decrement stock with guard
      for (const item of createdOrder.items) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (product.stock < 0) {
          throw new Error(`Insufficient stock for: ${item.name}`);
        }
      }

      // Update coupon usage
      if (createdOrder.couponId) {
        await tx.coupon.update({
          where: { id: createdOrder.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    // Send emails outside transaction (non-blocking)
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
      paymentMethod: 'COD',
      items: orderItemsSummary,
      total: Number(order.total),
      address: addressStr,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
