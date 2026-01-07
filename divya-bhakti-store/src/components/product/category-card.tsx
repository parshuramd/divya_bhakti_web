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
  idols: 'https://images.unsplash.com/photo-1567591414240-e9c1e001a2b7?w=400',
  mala: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=400',
  incense: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=400',
  photos: 'https://images.unsplash.com/photo-1545697318-c6913e0e3ab7?w=400',
  puja: 'https://images.unsplash.com/photo-1585997907656-a4e5ff9c5d02?w=400',
  books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
};

export function CategoryCard({ category }: CategoryCardProps) {
  const imageUrl =
    category.image ||
    defaultImages[category.slug] ||
    'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400';

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

