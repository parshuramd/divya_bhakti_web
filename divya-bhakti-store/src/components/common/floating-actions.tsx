'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FloatingActions() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-green-200/50"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Back to Top */}
      <Button
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800 text-white shadow-lg transition-all duration-300 transform",
          showScroll ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  );
}

