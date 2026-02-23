import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Sparkles, Clock, Tag } from 'lucide-react';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/product/product-card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Festival Sale - Divya Bhakti Store',
  description: 'Celebrate with divine deals! Shop our festival sale for amazing discounts on idols, puja items, incense, and more.',
};

export const revalidate = 3600;

function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  };
}

async function getSaleProducts() {
  // Get products that have a compareAtPrice (i.e., on sale)
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      compareAtPrice: { not: null },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });

  // If not enough sale products, also include featured ones
  if (products.length < 8) {
    const featured = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        id: { notIn: products.map((p) => p.id) },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    products.push(...featured);
  }

  return products.map(serializeProduct);
}

export default async function FestivalSalePage() {
  const products = await getSaleProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🪔</div>
          <div className="absolute top-20 right-20 text-7xl">🎆</div>
          <div className="absolute bottom-10 left-1/3 text-6xl">🙏</div>
          <div className="absolute bottom-20 right-10 text-8xl">✨</div>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 text-center">
          <Badge className="bg-white/20 text-white border-none mb-4 text-sm px-4 py-1 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 mr-1" />
            Limited Time Offer
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
            Festival Sale
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2 font-medium">
            🎉 Celebrate with Divine Deals!
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Get amazing discounts on idols, puja essentials, incense, malas, and more. 
            Perfect time to bring home blessings.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span className="font-bold text-lg">Up to 40% OFF</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <span className="font-bold text-lg">Free Shipping 499+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
            Festival Deals
          </h2>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'} on sale
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sale Coming Soon!</h3>
            <p className="text-muted-foreground mb-6">
              We&apos;re preparing amazing festival deals for you. Check back soon!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-saffron-600 px-6 py-3 text-sm font-medium text-white hover:bg-saffron-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showBadge="sale" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
