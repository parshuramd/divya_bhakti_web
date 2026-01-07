import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Truck, Shield, RefreshCw, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { ProductCarousel } from '@/components/home/product-carousel';
import { DealOfTheDay } from '@/components/home/deal-of-day';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // Revalidate every hour

// Helper to serialize Prisma objects (converts Decimal to number)
function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  };
}

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
}

async function getCategoryProducts(categorySlug: string) {
  const products = await prisma.product.findMany({
    where: { 
      isActive: true,
      category: { slug: categorySlug }
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
}

export default async function HomePage() {
  const t = await getTranslations();
  const [
    featuredProducts,
    idolProducts,
    malaProducts
  ] = await Promise.all([
    getFeaturedProducts(),
    getCategoryProducts('idols'),
    getCategoryProducts('mala'),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* 1. Hero Carousel (Amazon Style) */}
      <HeroCarousel />

      {/* 2. Negative margin to pull content up over the hero fade if needed, 
           but here we'll keep it clean */}
      
      <div className="space-y-4 md:space-y-8 -mt-10 sm:-mt-20 relative z-10">
        {/* 3. Horizontal Product Rows */}
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Free Shipping', desc: 'On orders over ₹499', icon: Truck },
                { title: 'Secure Payment', desc: '100% secure transaction', icon: Shield },
                { title: 'Easy Returns', desc: '7 Days Return Policy', icon: RefreshCw },
                { title: 'Authentic', desc: '100% Original Products', icon: HeartHandshake },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50/50 hover:bg-saffron-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-saffron-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ProductCarousel 
          title="Best Sellers in Devotional" 
          products={featuredProducts} 
          link="/products?featured=true"
        />

        <DealOfTheDay />

        <ProductCarousel 
          title="Sacred Idols & Murtis" 
          products={idolProducts}
          link="/category/idols"
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative h-[250px] rounded-xl overflow-hidden group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800" 
                alt="Incense" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium Incense</h3>
                <p className="mb-4 text-gray-200">Aromatic dhoop and agarbatti for your home.</p>
                <Button variant="outline" className="w-fit text-white border-white hover:bg-white hover:text-black">
                  Explore
                </Button>
              </div>
            </div>
            <div className="relative h-[250px] rounded-xl overflow-hidden group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800" 
                alt="Books" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Spiritual Books</h3>
                <p className="mb-4 text-gray-200">Ancient wisdom for modern life.</p>
                <Button variant="outline" className="w-fit text-white border-white hover:bg-white hover:text-black">
                  Read Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ProductCarousel 
          title="Meditation Essentials" 
          products={malaProducts}
          link="/category/mala"
        />
      </div>
    </div>
  );
}
