import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { applyCouponSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = applyCouponSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const { code } = parsed.data;
        const subtotal = body.subtotal || 0;

        const coupon = await prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
                isActive: true,
                OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
                AND: [
                    {
                        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
                    },
                ],
            },
        });

        if (!coupon) {
            return NextResponse.json(
                { error: 'Invalid or expired coupon code' },
                { status: 400 }
            );
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json(
                { error: 'Coupon usage limit exceeded' },
                { status: 400 }
            );
        }

        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
            return NextResponse.json(
                {
                    error: `Minimum order amount is ₹${Number(coupon.minOrderAmount).toFixed(0)}`,
                },
                { status: 400 }
            );
        }

        let discountAmount = 0;

        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                discountAmount = Number(coupon.maxDiscount);
            }
        } else {
            discountAmount = Number(coupon.discountValue);
        }

        discountAmount = Math.min(discountAmount, subtotal);

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountAmount: Math.round(discountAmount * 100) / 100,
                discountType: coupon.discountType,
                discountValue: Number(coupon.discountValue),
                description: coupon.description,
            },
        });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error applying coupon:', error);
        return NextResponse.json(
            { error: 'Failed to apply coupon' },
            { status: 500 }
        );
    }
}
