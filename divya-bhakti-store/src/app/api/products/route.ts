import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    if (!name || !price || !categoryId || !sku) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const slug = slugify(name);

    const product = await prisma.product.create({
      data: {
        name,
        nameMarathi,
        slug, // Note: In production, check for slug uniqueness and append suffix if needed
        description,
        descriptionMarathi,
        price,
        compareAtPrice,
        costPrice,
        categoryId,
        isFeatured,
        isActive,
        stock,
        sku,
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }, index: number) => ({
                url: image.url,
                alt: name,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            ],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

