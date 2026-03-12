import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { addressSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.address.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const address = await prisma.address.update({
      where: { id: params.id },
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2 || null,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        country: parsed.data.country || 'India',
        type: parsed.data.type || 'HOME',
        isDefault: parsed.data.isDefault || false,
      },
    });

    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const address = await prisma.address.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Don't allow deleting addresses that are used in existing orders
    const orderCount = await prisma.order.count({
      where: { addressId: params.id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete address used in existing orders' },
        { status: 400 }
      );
    }

    await prisma.address.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
