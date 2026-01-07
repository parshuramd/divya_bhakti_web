import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 3600;

interface ProductsPageProps {
  searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    featured?: string;
    page?: string;
  };
}

async function getProducts(searchParams: ProductsPageProps['searchParams']) {
  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (searchParams.category) {
    const category = await prisma.category.findUnique({
      where: { slug: searchParams.category },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }

  if (searchParams.featured === 'true') {
    where.isFeatured = true;
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      (where.price as Record<string, number>).gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      (where.price as Record<string, number>).lte = parseFloat(searchParams.maxPrice);
    }
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' };

  switch (searchParams.sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations();
  const [{ products, total, page, totalPages }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters 
            categories={categories} 
            currentCategory={searchParams.category}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold">
                {searchParams.featured === 'true'
                  ? t('home.featuredProducts')
                  : t('common.shop')}
              </h1>
              <p className="text-muted-foreground">
                {total} products found
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                {t('common.noResults')}
              </p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <a
                  key={i}
                  href={`/products?${new URLSearchParams({
                    ...searchParams,
                    page: String(i + 1),
                  }).toString()}`}
                  className={`px-4 py-2 rounded-md ${
                    page === i + 1
                      ? 'bg-saffron-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

