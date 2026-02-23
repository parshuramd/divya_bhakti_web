import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/product/product-card';

interface SearchPageProps {
  searchParams: { q?: string };
}

function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  };
}

export function generateMetadata({ searchParams }: SearchPageProps): Metadata {
  return {
    title: searchParams.q ? `Search: ${searchParams.q}` : 'Search Products',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || '';

  let products: any[] = [];

  if (query) {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { nameMarathi: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      take: 40,
      orderBy: { createdAt: 'desc' },
    });
  }

  const serializedProducts = products.map(serializeProduct);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          {query ? (
            <>
              <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">
                Search results for &quot;{query}&quot;
              </h1>
              <p className="text-muted-foreground">
                {serializedProducts.length} {serializedProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Search Products</h1>
              <p className="text-muted-foreground">Use the search bar above to find products.</p>
            </div>
          )}
        </div>

        {/* Results */}
        {query && serializedProducts.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              Try different keywords or browse our categories.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-saffron-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-saffron-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {serializedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
