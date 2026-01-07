import { ProductForm } from '@/components/admin/product-form';
import prisma from '@/lib/prisma';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <div className="lg:ml-64 p-8">
      <div className="flex-col">
        <div className="flex-1 space-y-4">
          <ProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}

