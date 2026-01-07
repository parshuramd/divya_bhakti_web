'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DealOfTheDay() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 }; // Reset
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-saffron-100 p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-saffron-600 font-bold uppercase tracking-wider text-sm">
            <Timer className="h-4 w-4" />
            Deal of the Day
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold">
            Premium Brass Ganesha Idol - 8 Inch
          </h3>
          <p className="text-muted-foreground">
            Handcrafted by skilled artisans from Moradabad. 
            Bring home positivity and remove obstacles.
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-3 min-w-[60px] font-mono text-xl font-bold">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground mt-1">Hours</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-3 min-w-[60px] font-mono text-xl font-bold">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground mt-1">Mins</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-3 min-w-[60px] font-mono text-xl font-bold text-saffron-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground mt-1">Secs</div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-baseline gap-2 justify-center md:justify-start mb-4">
              <span className="text-3xl font-bold text-gray-900">₹2,499</span>
              <span className="text-lg text-muted-foreground line-through">₹4,999</span>
              <span className="text-green-600 font-bold text-sm">50% OFF</span>
            </div>
            <Button size="lg" className="rounded-full bg-saffron-600 hover:bg-saffron-700 px-8" asChild>
              <Link href="/product/lord-ganesha-brass-idol-8-inch">Shop Now</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 relative h-[300px] w-full md:w-auto">
          <Image
            src="https://images.unsplash.com/photo-1567591414240-e9c1e001a2b7?w=800"
            alt="Deal Product"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

