'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Loader2,
  ShoppingBag,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  product: {
    slug: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingUrl: string | null;
  awbNumber: string | null;
  items: OrderItem[];
  address: {
    fullName: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  PACKED: { label: 'Packed', color: 'bg-indigo-100 text-indigo-800', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  RETURNED: { label: 'Returned', color: 'bg-gray-100 text-gray-800', icon: RotateCcw },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: RotateCcw },
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders');
      return;
    }
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <div className="mx-auto w-20 h-20 bg-saffron-50 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-saffron-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
              No Orders Yet
            </h1>
            <p className="text-muted-foreground mb-8">
              You haven&apos;t placed any orders yet. Start shopping and your orders will appear here.
            </p>
            <Button asChild variant="saffron" size="lg" className="rounded-xl">
              <Link href="/products">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              My Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order </span>
                      <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <Badge className={`${statusInfo.color} border-none font-medium`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <Link
                          href={`/product/${item.product?.slug || '#'}`}
                          className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                        >
                          {item.product?.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.product?.slug || '#'}`}
                            className="font-medium text-sm text-gray-900 hover:text-saffron-600 transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty: {item.quantity} &times; {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-sm text-gray-900 flex-shrink-0">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.address?.city}, {order.address?.state}
                      </span>
                      <span className="capitalize">
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.trackingUrl && (
                        <Button asChild variant="outline" size="sm" className="text-xs h-8">
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                            <Truck className="h-3 w-3 mr-1" />
                            Track
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm" className="text-xs h-8 text-saffron-600 hover:text-saffron-700">
                        <Link href={`/order-confirmation/${order.id}`}>
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
