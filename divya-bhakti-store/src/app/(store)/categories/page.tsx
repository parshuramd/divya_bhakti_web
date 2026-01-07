import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';

export const revalidate = 3600;

async function getCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
}

// Default category images for devotional products
const defaultImages: Record<string, string> = {
  idols: 'https://images.unsplash.com/photo-1567591414240-e9c1e001a2b7?w=800',
  mala: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=800',
  incense: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800',
  photos: 'https://images.unsplash.com/photo-1545697318-c6913e0e3ab7?w=800',
  puja: 'https://images.unsplash.com/photo-1585997907656-a4e5ff9c5d02?w=800',
  books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
};

export default async function CategoriesPage() {
  const t = await getTranslations();
  const categories = await getCategories();

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-saffron-50/50 py-12 md:py-20 border-b border-saffron-100">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 text-saffron-600 border-saffron-200 bg-white">
            Collections
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Browse Categories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our wide range of authentic devotional products, carefully categorized for your spiritual needs.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                <Image
                  src={category.image || defaultImages[category.slug] || 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800'}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-display font-bold mb-1">{category.name}</h3>
                  {category.nameMarathi && (
                    <p className="text-sm opacity-90 font-marathi mb-2">{category.nameMarathi}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <span className="text-sm font-medium">{category._count?.products || 0} Products</span>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                  {category.description || `Explore our collection of ${category.name}`}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-saffron-600 font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                  View Collection <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

