'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('Please enter an order number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order?.id) {
          router.push(`/order-confirmation/${data.order.id}`);
          return;
        }
      }
      setError('Order not found. Please check the order number and try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-saffron-50 rounded-full flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-saffron-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to check the current status of your delivery.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => { setOrderNumber(e.target.value); setError(''); }}
                placeholder="e.g. ORD-20260206-XXXXX"
                className="mt-1.5"
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1.5">{error}</p>}
            </div>
            <Button
              type="submit"
              variant="saffron"
              className="w-full rounded-xl"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <Package className="h-6 w-6 text-saffron-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Order Placed</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmation sent to your email</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <Truck className="h-6 w-6 text-saffron-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">In Transit</p>
            <p className="text-xs text-muted-foreground mt-1">Real-time tracking available</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <MapPin className="h-6 w-6 text-saffron-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Delivered</p>
            <p className="text-xs text-muted-foreground mt-1">Right to your doorstep</p>
          </div>
        </div>
      </div>
    </div>
  );
}
