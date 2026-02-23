import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata = {
  title: 'Order Confirmation',
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session?.user?.id) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      },
      address: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order #{order.orderNumber}</CardTitle>
              <span className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  {order.paymentMethod === 'COD' ? 'Order placed - Cash on Delivery' : 'Payment received'}
                </p>
                <p className="text-sm text-green-600">
                  {order.paymentMethod === 'COD'
                    ? 'Pay when your order is delivered'
                    : 'Your payment has been processed successfully'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-sm">{formatPrice(Number(item.total))}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={Number(order.shippingCost) === 0 ? 'text-green-600' : ''}>
                  {Number(order.shippingCost) === 0 ? 'Free' : formatPrice(Number(order.shippingCost))}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-saffron-600">{formatPrice(Number(order.total))}</span>
              </div>
            </div>

            <Separator />

            {/* Delivery Address */}
            <div>
              <h3 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Address
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.address.fullName}<br />
                {order.address.addressLine1}
                {order.address.addressLine2 && <>, {order.address.addressLine2}</>}<br />
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="saffron" className="flex-1" asChild>
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/orders">
              View All Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
