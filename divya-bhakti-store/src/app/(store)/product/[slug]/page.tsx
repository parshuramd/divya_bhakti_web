import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { 
  Star, 
  Truck, 
  Shield, 
  RefreshCw, 
  Heart, 
  Share2, 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingCart,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductCard } from '@/components/product/product-card';
import { AddToCartButton } from '@/components/product/add-to-cart-button';
import { ProductGallery } from '@/components/product/product-gallery';
import prisma from '@/lib/prisma';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Helper to serialize Prisma objects
function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      category: true,
      variants: true,
    },
  });

  if (!product) return null;
  return serializeProduct(product);
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      isActive: true,
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      category: true,
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const t = await getTranslations();
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  const discount = product.compareAtPrice 
    ? calculateDiscount(product.price, product.compareAtPrice) 
    : 0;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-saffron-600 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/products" className="hover:text-saffron-600 transition-colors">Shop</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href={`/category/${product.category.slug}`} className="hover:text-saffron-600 transition-colors">
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Gallery */}
          <div className="space-y-6">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 text-saffron-600 border-saffron-200 bg-saffron-50">
                    {product.category.name}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  {product.nameMarathi && (
                    <p className="text-lg text-muted-foreground font-marathi mt-1">
                      {product.nameMarathi}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-500">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-500">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                  <span className="text-sm font-medium ml-2 text-gray-600">(4.8)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" /> In Stock
                </span>
              </div>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-4xl font-bold text-saffron-700">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through decoration-gray-300">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <Badge variant="destructive" className="ml-2 text-sm px-2 py-0.5">
                      {discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Inclusive of all taxes. Free shipping on orders above ₹499.
              </p>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-6">
              <AddToCartButton product={product} />
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-saffron-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">Orders > ₹499</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-saffron-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">100% Protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-saffron-600">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">7 Days Policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-saffron-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Authentic</p>
                    <p className="text-xs text-muted-foreground">100% Original</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Accordion */}
            <Accordion type="single" collapsible defaultValue="description" className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-base font-semibold">Description</AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed space-y-4">
                  <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                  {product.descriptionMarathi && (
                    <div className="pt-4 border-t mt-4">
                      <h4 className="font-medium mb-2 text-gray-900">मराठी वर्णन</h4>
                      <div dangerouslySetInnerHTML={{ __html: product.descriptionMarathi }} />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-base font-semibold">Shipping & Returns</AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  <p>We ship all over India. Orders are typically processed within 24 hours.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Free shipping on orders above ₹499</li>
                    <li>Standard delivery: 3-5 business days</li>
                    <li>Easy 7-day return policy for damaged or defective items</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold">You May Also Like</h2>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href={`/category/${product.category.slug}`}>View More</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

