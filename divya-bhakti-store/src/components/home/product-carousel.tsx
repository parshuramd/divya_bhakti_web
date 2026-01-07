'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import type { Product } from '@/types';

interface ProductCarouselProps {
  title: string;
  products: any[]; // Using any to handle serialized/Prisma differences easily
  link?: string;
}

export function ProductCarousel({ title, products, link }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 'auto',
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative py-8 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-display">
            {title}
          </h2>
          {link && (
            <a href={link} className="text-sm font-medium text-saffron-600 hover:underline">
              See all
            </a>
          )}
        </div>

        <div className="relative group">
          <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
            <div className="flex gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex-[0_0_180px] sm:flex-[0_0_220px] md:flex-[0_0_260px] min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex z-10"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex z-10"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </Button>
        </div>
      </div>
    </div>
  );
}

