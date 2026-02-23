'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore, useCartStore } from '@/store/cart-store';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { Product } from '@/types';

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addToCart = useCartStore((state) => state.addItem);

  // Hydration guard for Zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
      variant: 'success',
    });
  };

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((item) => item.stock > 0);
    if (inStockItems.length === 0) {
      toast({
        title: 'No items available',
        description: 'All wishlist items are currently out of stock.',
        variant: 'destructive',
      });
      return;
    }
    inStockItems.forEach((item) => addToCart(item));
    toast({
      title: 'Added to cart',
      description: `${inStockItems.length} item${inStockItems.length > 1 ? 's' : ''} added to your cart.`,
      variant: 'success',
    });
  };

  const handleRemoveItem = (product: Product) => {
    removeItem(product.id);
    toast({
      title: 'Removed from wishlist',
      description: `${product.name} has been removed from your wishlist.`,
    });
  };

  if (!mounted) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <div className="mx-auto w-20 h-20 bg-saffron-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-saffron-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
              Your Wishlist is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Save items you love to your wishlist. Browse our collection and tap the heart icon to add products.
            </p>
            <Button asChild variant="saffron" size="lg" className="rounded-xl">
              <Link href="/products">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-7 w-7 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearWishlist();
                toast({ title: 'Wishlist cleared', description: 'All items have been removed.' });
              }}
              className="text-gray-500 hover:text-red-600 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={handleAddAllToCart}
              className="rounded-lg"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add All to Cart
            </Button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => {
            const price = Number(product.price);
            const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
            const discount = compareAtPrice ? calculateDiscount(price, compareAtPrice) : 0;
            const isOutOfStock = product.stock <= 0;
            const primaryImage = product.images?.[0]?.url;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50 group">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-saffron-50/50 text-saffron-300">
                      <ShoppingCart className="h-12 w-12 opacity-50" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {discount > 0 && (
                      <Badge variant="destructive" className="shadow-md">{discount}% OFF</Badge>
                    )}
                    {isOutOfStock && (
                      <Badge variant="secondary" className="bg-gray-900/90 text-white">Out of Stock</Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(product);
                    }}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </Link>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {product.category && (
                    <p className="text-[10px] uppercase tracking-wider font-bold text-saffron-600/80 mb-1">
                      {product.category.name}
                    </p>
                  )}

                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-display font-medium text-base leading-tight line-clamp-2 hover:text-saffron-700 transition-colors mb-3">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4 mt-auto">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(price)}</span>
                    {compareAtPrice && compareAtPrice > price && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="saffron"
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200"
                      onClick={() => handleRemoveItem(product)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-saffron-600 hover:text-saffron-700 font-medium transition-colors"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
