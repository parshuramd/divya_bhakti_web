import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Star, Truck, Shield, RefreshCw, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/product-card';
import { CategoryCard } from '@/components/product/category-card';
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
    where: {
      isActive: true,
      isFeatured: true,
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      category: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
  return products.map(serializeProduct);
}

async function getCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  });
}

async function getNewArrivals() {
  const products = await prisma.product.findMany({
    where: {
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

async function getBanners() {
  return prisma.banner.findMany({
    where: {
      isActive: true,
      position: 'HOME_HERO',
      OR: [
        { startsAt: null },
        { startsAt: { lte: new Date() } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: new Date() } },
          ],
        },
      ],
    },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  });
}

export default async function HomePage() {
  const t = await getTranslations();
  const [featuredProducts, categories, newArrivals, banners] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getNewArrivals(),
    getBanners(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-pattern-mandala opacity-[0.03] animate-[spin_60s_linear_infinite]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-saffron-300 rounded-full blur-[80px] opacity-40 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gold-300 rounded-full blur-[100px] opacity-30 animate-pulse delay-700" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-saffron-100 shadow-sm animate-in zoom-in fade-in duration-700 delay-200">
                <Sparkles className="h-4 w-4 text-saffron-500" />
                <span className="text-sm font-medium text-saffron-800">
                  {t('common.tagline')}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight">
                <span className="text-gradient-saffron block mb-2">Divine Blessings</span>
                <span className="text-foreground">For Your Home</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed text-balance">
                {t('home.heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button variant="saffron" size="xl" className="rounded-full px-8 shadow-lg hover:shadow-saffron-200/50" asChild>
                  <Link href="/products">
                    {t('home.shopNow')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="rounded-full px-8 border-saffron-200 hover:bg-saffron-50 hover:text-saffron-700" asChild>
                  <Link href="/categories">{t('home.exploreCollection')}</Link>
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-80">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Handcrafted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block relative animate-in zoom-in fade-in duration-1000 delay-300">
              <div className="relative h-[600px] w-full animate-float">
                {/* Decorative Circle Behind Image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-saffron-100/50 to-transparent rounded-full blur-3xl" />
                
                <Image
                  src="https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800"
                  alt="Devotional Products"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                
                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-saffron-100 animate-float delay-1000">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Free Shipping</p>
                      <p className="text-xs text-muted-foreground">On orders above ₹499</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-20 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-saffron-100 animate-float delay-500">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center">
                      <Star className="h-5 w-5 text-gold-600 fill-gold-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">4.9/5 Rating</p>
                      <p className="text-xs text-muted-foreground">Trusted by devotees</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="border-saffron-200 text-saffron-700 uppercase tracking-widest text-[10px] px-3 py-1">
              Collections
            </Badge>
            <h2 className="section-title">{t('home.shopByCategory')}</h2>
            <p className="section-subtitle mx-auto">
              Explore our diverse range of spiritual categories designed to elevate your daily worship
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8 group" asChild>
              <Link href="/categories">
                {t('common.viewAll')} Categories
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-saffron-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="border-saffron-200 text-saffron-700 uppercase tracking-widest text-[10px] px-3 py-1">
                Handpicked
              </Badge>
              <h2 className="section-title block">{t('home.featuredProducts')}</h2>
              <p className="text-muted-foreground max-w-lg">
                Our most loved products, curated especially for your spiritual journey
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex text-saffron-700 hover:text-saffron-800 hover:bg-saffron-50" asChild>
              <Link href="/products?featured=true">
                {t('common.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Suspense
              fallback={Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showBadge="featured" />
              ))}
            </Suspense>
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link href="/products?featured=true">
                {t('common.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-saffron-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-mandala opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Why Choose Divya Bhakti?</h2>
            <p className="text-saffron-200 max-w-2xl mx-auto text-lg">
              We are committed to providing you with the most authentic and high-quality devotional products
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: HeartHandshake,
                title: t('home.authenticProducts'),
                description: t('home.authenticProductsDesc'),
              },
              {
                icon: Truck,
                title: t('home.freeShipping'),
                description: t('home.freeShippingDesc'),
              },
              {
                icon: Shield,
                title: t('home.securePayment'),
                description: t('home.securePaymentDesc'),
              },
              {
                icon: RefreshCw,
                title: t('home.easyReturns'),
                description: t('home.easyReturnsDesc'),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-saffron-100 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-2">
              <Badge variant="outline" className="border-saffron-200 text-saffron-700 uppercase tracking-widest text-[10px] px-3 py-1">
                Fresh In Stock
              </Badge>
              <h2 className="section-title block">{t('home.newArrivals')}</h2>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex text-saffron-700 hover:text-saffron-800 hover:bg-saffron-50">
              <Link href="/products?sort=newest">
                {t('common.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} showBadge="new" />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-saffron-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <h2 className="section-title">{t('home.testimonials')}</h2>
            <p className="section-subtitle mx-auto">
              Trusted by thousands of devotees across India
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                location: 'Mumbai',
                rating: 5,
                comment:
                  'Excellent quality products! The Ganesh idol I ordered is absolutely beautiful. Fast delivery and great packaging.',
                initial: 'P',
                color: 'bg-pink-100 text-pink-700'
              },
              {
                name: 'Rajesh Kulkarni',
                location: 'Pune',
                rating: 5,
                comment:
                  'Best place for authentic devotional items. I have been ordering from Divya Bhakti Store for over a year now.',
                initial: 'R',
                color: 'bg-blue-100 text-blue-700'
              },
              {
                name: 'Sunita Deshpande',
                location: 'Nagpur',
                rating: 5,
                comment:
                  'The rudraksha mala is of premium quality. Customer service is also very responsive and helpful.',
                initial: 'S',
                color: 'bg-purple-100 text-purple-700'
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-gold-400 text-gold-400"
                    />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full ${testimonial.color} flex items-center justify-center font-bold text-lg`}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-pattern-mandala opacity-10" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Join Our Spiritual Community
              </h2>
              <p className="text-saffron-100 text-lg">
                Subscribe to receive updates on new arrivals, special offers, and spiritual insights directly to your inbox.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t('home.emailPlaceholder')}
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 backdrop-blur-sm transition-all"
                />
                <Button size="lg" className="rounded-full bg-white text-saffron-600 hover:bg-saffron-50 font-bold px-8 shadow-lg">
                  {t('home.subscribe')}
                </Button>
              </form>
              
              <p className="text-xs text-saffron-200 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
