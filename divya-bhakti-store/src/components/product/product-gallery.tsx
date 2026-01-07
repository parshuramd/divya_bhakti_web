'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.url);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        No Image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm group">
        <Image
          src={selectedImage || images[0].url}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image.url)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                selectedImage === image.url
                  ? "border-saffron-500 ring-2 ring-saffron-200"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || productName}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

