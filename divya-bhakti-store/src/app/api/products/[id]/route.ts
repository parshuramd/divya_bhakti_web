import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      nameMarathi,
      description,
      descriptionMarathi,
      price,
      compareAtPrice,
      costPrice,
      categoryId,
      images,
      isFeatured,
      isActive,
      stock,
      sku,
    } = body;

    // Delete existing images and re-create
    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    });

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        nameMarathi,
        slug: slugify(name),
        description,
        descriptionMarathi,
        price,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        categoryId,
        isFeatured,
        isActive,
        stock,
        sku,
        images: {
          createMany: {
            data: images.map((image: { url: string }, index: number) => ({
              url: image.url,
              alt: name,
              isPrimary: index === 0,
              sortOrder: index,
            })),
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[PRODUCT_PATCH]', error);
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete related records first
    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    });

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[PRODUCT_DELETE]', error);
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}
