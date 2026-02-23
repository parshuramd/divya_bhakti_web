import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { addressSchema } from '@/lib/validations';

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
    const validatedData = addressSchema.parse(body);

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        addressLine1: validatedData.addressLine1,
        addressLine2: validatedData.addressLine2 || null,
        city: validatedData.city,
        state: validatedData.state,
        pincode: validatedData.pincode,
        country: validatedData.country || 'India',
        type: validatedData.type || 'HOME',
        isDefault: false,
      },
    });

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Address creation error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}
