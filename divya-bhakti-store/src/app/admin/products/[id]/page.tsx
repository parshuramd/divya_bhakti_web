import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import prisma from '@/lib/prisma';

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            images: {
                orderBy: { sortOrder: 'asc' },
            },
        },
    });

    if (!product) return null;

    return {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        costPrice: product.costPrice ? Number(product.costPrice) : null,
    };
}

export default async function EditProductPage({
    params,
}: {
    params: { id: string };
}) {
    const [product, categories] = await Promise.all([
        getProduct(params.id),
        prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="lg:ml-64 p-8">
            <div className="flex-col">
                <div className="flex-1 space-y-4">
                    <ProductForm initialData={product as any} categories={categories} />
                </div>
            </div>
        </div>
    );
}
