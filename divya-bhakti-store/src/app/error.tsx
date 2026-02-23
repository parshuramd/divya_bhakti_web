'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🙏</div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We apologize for the inconvenience. Please try again or contact our support team.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="saffron" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
