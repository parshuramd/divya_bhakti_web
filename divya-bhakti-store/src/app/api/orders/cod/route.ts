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

    // Create order in database
    const order = await prisma.order.create({
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
        items: {
          create: orderItems,
        },
        timeline: {
          create: {
            status: 'CONFIRMED',
            message: 'Order placed with Cash on Delivery',
          },
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        address: true,
        user: true,
      },
    });

    // Decrement stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    // Update coupon usage
    if (order.couponId) {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
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
      paymentMethod: 'COD',
      items: orderItemsSummary,
      total: Number(order.total),
      address: addressStr,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('COD order creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
