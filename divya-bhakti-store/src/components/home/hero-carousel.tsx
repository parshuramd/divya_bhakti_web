'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ... existing banner interface and data ...

const banners: Banner[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1609105572591-6c22d7681434?w=1600&h=800&fit=crop', // Higher res Ganesha
    title: 'Divine Ganesha Collection',
    subtitle: 'Bring home prosperity and wisdom with our handcrafted idols.',
    link: '/category/idols',
    linkText: 'Shop Ganesha',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1623357597394-434827c2f067?w=1600&h=800&fit=crop',
    title: 'Premium Puja Essentials',
    subtitle: 'Everything you need for your daily worship rituals.',
    link: '/category/puja',
    linkText: 'Explore Essentials',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1621506041300-4b069903cc44?w=1600&h=800&fit=crop',
    title: 'Sacred Rudraksha & Malas',
    subtitle: 'Authentic beads for meditation and peace.',
    link: '/category/mala',
    linkText: 'View Collection',
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative group overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="relative flex-[0_0_100%] min-w-0">
              <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full bg-gray-900">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover opacity-90 transition-transform duration-[10000ms] ease-linear hover:scale-110"
                  priority
                />
                {/* Advanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent sm:w-2/3" />
                
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-20 text-white container mx-auto">
                  <div className="max-w-2xl space-y-6">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tight animate-in slide-in-from-left-10 duration-700 fade-in fill-mode-both text-shadow-lg">
                      {banner.title}
                    </h2>
                    <p className="text-lg md:text-2xl text-gray-200 leading-relaxed font-light animate-in slide-in-from-left-10 duration-700 delay-200 fade-in fill-mode-both max-w-xl">
                      {banner.subtitle}
                    </p>
                    <div className="pt-4 animate-in slide-in-from-bottom-5 duration-700 delay-500 fade-in fill-mode-both">
                      <Button 
                        size="xl" 
                        className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-full px-8 py-6 text-lg shadow-[0_0_30px_-5px_rgba(249,115,22,0.6)] hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.8)] transition-all hover:scale-105"
                        asChild
                      >
                        <Link href={banner.link}>
                          {banner.linkText} 
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden sm:flex"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden sm:flex"
        onClick={scrollNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
      
      {/* Cinematic Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </div>
  );
}

