'use client';

import { useState } from 'react';
import { Tag, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart-store';

export function CouponInput() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { coupon, applyCoupon, removeCoupon, getSubtotal } = useCartStore();

    const handleApply = async () => {
        if (!code.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/coupons/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim(), subtotal: getSubtotal() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid coupon');
            }

            applyCoupon({
                code: data.coupon.code,
                discountAmount: data.coupon.discountAmount,
            });

            toast({
                title: 'Coupon Applied! 🎉',
                description: `You saved ₹${data.coupon.discountAmount.toFixed(0)}`,
            });

            setCode('');
        } catch (error) {
            toast({
                title: 'Invalid Coupon',
                description:
                    error instanceof Error ? error.message : 'Failed to apply coupon',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        removeCoupon();
        toast({ title: 'Coupon removed' });
    };

    if (coupon) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-800">
                            <Tag className="h-3 w-3 inline mr-1" />
                            {coupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                            Saving ₹{coupon.discountAmount.toFixed(0)}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-red-500 hover:bg-red-50"
                    onClick={handleRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Have a coupon?</p>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="pl-9 uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />
                </div>
                <Button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    variant="outline"
                    className="border-saffron-300 text-saffron-700 hover:bg-saffron-50"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Apply'
                    )}
                </Button>
            </div>
        </div>
    );
}
