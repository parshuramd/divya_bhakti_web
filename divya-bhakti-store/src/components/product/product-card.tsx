'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useWishlistStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { Product, ProductImage, Category } from '@/types';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    nameMarathi?: string | null;
    slug: string;
    price: number | { toNumber: () => number };
    compareAtPrice?: number | { toNumber: () => number } | null;
    stock: number;
    images: ProductImage[];
    category?: Category;
    isFeatured?: boolean;
    averageRating?: number;
  };
  showBadge?: 'new' | 'sale' | 'featured' | null;
}

export function ProductCard({ product, showBadge }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));

  const price = typeof product.price === 'object' ? product.price.toNumber() : Number(product.price);
  const compareAtPrice = product.compareAtPrice
    ? typeof product.compareAtPrice === 'object'
      ? product.compareAtPrice.toNumber()
      : Number(product.compareAtPrice)
    : null;

  const discount = compareAtPrice ? calculateDiscount(price, compareAtPrice) : 0;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      id: product.id,
      name: product.name,
      nameMarathi: product.nameMarathi ?? null,
      slug: product.slug,
      price: price,
      compareAtPrice: compareAtPrice,
      stock: product.stock,
      images: product.images,
    } as Product);

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
      variant: 'success',
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      id: product.id,
      name: product.name,
      nameMarathi: product.nameMarathi ?? null,
      slug: product.slug,
      price: price,
      compareAtPrice: compareAtPrice,
      stock: product.stock,
      images: product.images,
    } as Product);

    toast({
      title: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      description: `${product.name} has been ${isInWishlist ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const primaryImage = product.images?.[0]?.url;

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full">
      <div className="product-card h-full flex flex-col bg-white">
        {/* Image Container */}
        <div className="product-card-image overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-saffron-50/50 text-saffron-300">
              <ShoppingCart className="h-12 w-12 opacity-50" />
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          {/* Badges */}
          <div className="product-card-badge">
            {showBadge === 'new' && (
              <Badge className="bg-saffron-500 hover:bg-saffron-600 text-white border-none shadow-sm">New</Badge>
            )}
            {(showBadge === 'sale' || discount > 0) && (
              <Badge variant="destructive" className="shadow-sm">{discount}% OFF</Badge>
            )}
            {showBadge === 'featured' && (
              <Badge className="bg-gold-500 hover:bg-gold-600 text-white border-none shadow-sm">Featured</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="bg-gray-900 text-white">Out of Stock</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="product-card-actions">
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                'h-9 w-9 rounded-full shadow-lg bg-white hover:bg-saffron-50 border border-transparent hover:border-saffron-200 transition-all duration-200',
                isInWishlist && 'text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-200'
              )}
              onClick={handleToggleWishlist}
            >
              <Heart
                className={cn('h-4 w-4 transition-transform active:scale-90', isInWishlist && 'fill-current')}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg bg-white hover:bg-saffron-50 border border-transparent hover:border-saffron-200 transition-all duration-200"
              asChild
            >
              <span>
                <Eye className="h-4 w-4 text-gray-700" />
              </span>
            </Button>
          </div>
          
          {/* Add to Cart Button (Bottom Overlay) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <Button
              variant="saffron"
              size="lg"
              className="w-full shadow-xl font-medium"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            {product.category && (
              <p className="text-[10px] uppercase tracking-wider font-semibold text-saffron-600/80">
                {product.category.name}
              </p>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
              <span className="text-xs font-medium text-muted-foreground">4.8</span>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-display font-medium text-lg leading-tight line-clamp-2 group-hover:text-saffron-700 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto pt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-muted-foreground line-through decoration-gray-400">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
