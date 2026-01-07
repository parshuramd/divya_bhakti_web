'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, CreditCard, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { addressSchema, type AddressInput } from '@/lib/validations';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'India',
      type: 'HOME',
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
        <p className="text-muted-foreground mb-8">{t('cart.emptyDesc')}</p>
        <Button variant="saffron" asChild>
          <Link href="/products">{t('cart.continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = getTotal() + shipping;

  const handleAddressSubmit = (data: AddressInput) => {
    setStep(2);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === 'RAZORPAY') {
        // Create order on server
        const response = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.product.id,
              quantity: item.quantity
            })),
            addressId: 'temp-address', // In a real app, create/select address first
            couponCode: null, // Add coupon logic
          }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        // Open Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'Divya Bhakti Store',
          description: 'Payment for your order',
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              clearCart();
              router.push(`/order-confirmation/${data.orderId}`);
            } else {
              toast({
                title: 'Payment Failed',
                description: verifyData.error,
                variant: 'destructive',
              });
            }
          },
          prefill: {
            name: session?.user?.name,
            email: session?.user?.email,
          },
          theme: {
            color: '#f97316',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Handle COD
        // Implement COD logic here
        toast({
          title: 'Order Placed',
          description: 'Cash on Delivery order placed successfully.',
          variant: 'success',
        });
        clearCart();
        // Redirect to confirmation
        // router.push(`/order-confirmation/${orderId}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 1 ? 'bg-saffron-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                <span className={step >= 1 ? 'font-medium text-gray-900' : 'text-gray-500'}>Address</span>
              </div>
              <div className="h-px flex-1 bg-gray-200 mx-4" />
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 2 ? 'bg-saffron-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                <span className={step >= 2 ? 'font-medium text-gray-900' : 'text-gray-500'}>Payment</span>
              </div>
            </div>

            {/* Step 1: Address */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.shippingAddress')}</CardTitle>
                  <CardDescription>Enter your delivery details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="address-form" onSubmit={handleSubmit(handleAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t('address.fullName')}</Label>
                        <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('address.phone')}</Label>
                        <Input id="phone" {...register('phone')} placeholder="9876543210" />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">{t('address.addressLine1')}</Label>
                      <Input id="addressLine1" {...register('addressLine1')} placeholder="Flat, House no., Building, Company, Apartment" />
                      {errors.addressLine1 && <p className="text-sm text-red-500">{errors.addressLine1.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">{t('address.addressLine2')}</Label>
                      <Input id="addressLine2" {...register('addressLine2')} placeholder="Area, Street, Sector, Village" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">{t('address.pincode')}</Label>
                        <Input id="pincode" {...register('pincode')} placeholder="400001" />
                        {errors.pincode && <p className="text-sm text-red-500">{errors.pincode.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">{t('address.city')}</Label>
                        <Input id="city" {...register('city')} placeholder="Mumbai" />
                        {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">{t('address.state')}</Label>
                        <Input id="state" {...register('state')} placeholder="Maharashtra" />
                        {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address Type</Label>
                      <RadioGroup defaultValue="HOME" onValueChange={(val) => register('type').onChange({ target: { value: val, name: 'type' } })}>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="HOME" id="home" />
                            <Label htmlFor="home">{t('address.home')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OFFICE" id="office" />
                            <Label htmlFor="office">{t('address.office')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OTHER" id="other" />
                            <Label htmlFor="other">{t('address.other')}</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button type="submit" form="address-form" className="w-full bg-saffron-600 hover:bg-saffron-700">
                    {t('common.continue')}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.paymentMethod')}</CardTitle>
                  <CardDescription>Select how you want to pay</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="RAZORPAY" onValueChange={(val: 'COD' | 'RAZORPAY') => setPaymentMethod(val)} className="space-y-4">
                    <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'RAZORPAY' ? 'border-saffron-500 bg-saffron-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="RAZORPAY" id="razorpay" />
                        <div className="space-y-1">
                          <Label htmlFor="razorpay" className="font-medium cursor-pointer">{t('checkout.online')}</Label>
                          <p className="text-sm text-muted-foreground">{t('checkout.onlineDesc')}</p>
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-saffron-500 bg-saffron-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="COD" id="cod" />
                        <div className="space-y-1">
                          <Label htmlFor="cod" className="font-medium cursor-pointer">{t('checkout.cod')}</Label>
                          <p className="text-sm text-muted-foreground">{t('checkout.codDesc')}</p>
                        </div>
                      </div>
                      <Truck className="h-5 w-5 text-gray-500" />
                    </div>
                  </RadioGroup>
                </CardContent>
                <CardFooter className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    {t('common.back')}
                  </Button>
                  <Button onClick={handlePayment} disabled={isProcessing} className="flex-1 bg-saffron-600 hover:bg-saffron-700">
                    {isProcessing ? t('common.loading') : `Pay ${formatPrice(total)}`}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-96 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">{item.quantity}x</span>
                        <span className="truncate max-w-[150px]" title={item.product.name}>{item.product.name}</span>
                      </div>
                      <span className="font-medium">{formatPrice(Number(item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? t('checkout.freeShipping') : formatPrice(shipping)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('cart.discount')}</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('cart.total')}</span>
                  <span className="text-saffron-600">{formatPrice(total)}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-lg p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground w-full justify-center">
                  <Shield className="h-3 w-3" />
                  {t('footer.securePayments')}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

