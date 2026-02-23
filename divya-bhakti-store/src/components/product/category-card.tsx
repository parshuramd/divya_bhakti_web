import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    nameMarathi?: string | null;
    slug: string;
    image?: string | null;
    _count?: {
      products: number;
    };
  };
}

// Default category images for devotional products
const defaultImages: Record<string, string> = {
  idols: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
  mala: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
  incense: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
  photos: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
  puja: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
  books: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
};

export function CategoryCard({ category }: CategoryCardProps) {
  const imageUrl =
    category.image ||
    defaultImages[category.slug] ||
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400';

  return (
    <Link href={`/category/${category.slug}`} className="group">
      <div className="category-card">
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
        <div className="category-card-overlay" />
        <div className="category-card-content">
          <h3 className="font-display font-semibold text-lg mb-1">
            {category.name}
          </h3>
          {category.nameMarathi && (
            <p className="text-xs opacity-80 font-marathi mb-1">
              {category.nameMarathi}
            </p>
          )}
          {category._count && (
            <p className="text-xs opacity-70">
              {category._count.products} products
            </p>
          )}
          <div className="flex items-center gap-1 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

