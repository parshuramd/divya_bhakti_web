'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, Clock, User, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { formatPrice, formatDateTime } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  PACKED: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-cyan-100 text-cyan-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED',
  'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [awbNumber, setAwbNumber] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        setTrackingUrl(data.order.trackingUrl || '');
        setAwbNumber(data.order.awbNumber || '');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch order', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingUrl: trackingUrl || undefined,
          awbNumber: awbNumber || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        toast({ title: 'Success', description: 'Order status updated and customer notified' });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="lg:ml-64 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="lg:ml-64 text-center py-20">
        <p className="text-muted-foreground">Order not found</p>
        <Button asChild className="mt-4"><Link href="/admin/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  return (
    <div className="lg:ml-64 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                      {item.product?.images?.[0]?.url ? (
                        <Image src={item.product.images[0].url} alt={item.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(Number(item.total))}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(Number(item.price))}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{Number(order.shippingCost) === 0 ? 'Free' : formatPrice(Number(order.shippingCost))}</span></div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(Number(order.discount))}</span></div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-saffron-600">{formatPrice(Number(order.total))}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((entry: any, i: number) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-saffron-500' : 'bg-gray-300'}`} />
                      {i < order.timeline.length - 1 && <div className="w-px h-full bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-sm">{entry.status.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{entry.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') && (
                <>
                  <div className="space-y-2">
                    <Label>AWB / Tracking Number</Label>
                    <Input value={awbNumber} onChange={(e) => setAwbNumber(e.target.value)} placeholder="Enter AWB number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tracking URL</Label>
                    <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </>
              )}
              <Button className="w-full bg-saffron-600 hover:bg-saffron-700" onClick={handleStatusUpdate} disabled={updating || newStatus === order.status}>
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.user?.name || 'Guest'}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
              {order.user?.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.address.fullName}</p>
              <p className="text-muted-foreground">{order.address.phone}</p>
              <p className="text-muted-foreground">{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p className="text-muted-foreground">{order.address.addressLine2}</p>}
              <p className="text-muted-foreground">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'FAILED' ? 'destructive' : 'warning'}>{order.paymentStatus}</Badge></div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between"><span className="text-muted-foreground">Payment ID</span><span className="font-mono text-xs">{order.razorpayPaymentId}</span></div>
              )}
              {order.paidAt && (
                <div className="flex justify-between"><span className="text-muted-foreground">Paid At</span><span>{formatDateTime(order.paidAt)}</span></div>
              )}
              {order.coupon && (
                <div className="flex justify-between"><span className="text-muted-foreground">Coupon</span><span className="font-medium">{order.coupon.code}</span></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
