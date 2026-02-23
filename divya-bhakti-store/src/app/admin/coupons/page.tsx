'use client';

import { useState, useEffect } from 'react';
import {
    Ticket,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Save,
    X,
    Percent,
    IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
    startsAt: string | null;
    expiresAt: string | null;
    isActive: boolean;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState(10);
    const [minOrderAmount, setMinOrderAmount] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            if (res.ok) {
                const data = await res.json();
                setCoupons(data.coupons);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load coupons', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCode('');
        setDescription('');
        setDiscountType('PERCENTAGE');
        setDiscountValue(10);
        setMinOrderAmount('');
        setMaxDiscount('');
        setUsageLimit('');
        setExpiresAt('');
        setIsActive(true);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingId(coupon.id);
        setCode(coupon.code);
        setDescription(coupon.description || '');
        setDiscountType(coupon.discountType);
        setDiscountValue(coupon.discountValue);
        setMinOrderAmount(coupon.minOrderAmount?.toString() || '');
        setMaxDiscount(coupon.maxDiscount?.toString() || '');
        setUsageLimit(coupon.usageLimit?.toString() || '');
        setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '');
        setIsActive(coupon.isActive);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                code,
                description: description || undefined,
                discountType,
                discountValue,
                isActive,
            };
            if (minOrderAmount) payload.minOrderAmount = Number(minOrderAmount);
            if (maxDiscount) payload.maxDiscount = Number(maxDiscount);
            if (usageLimit) payload.usageLimit = Number(usageLimit);
            if (expiresAt) payload.expiresAt = new Date(expiresAt);

            const body = editingId ? { id: editingId, ...payload } : payload;

            const res = await fetch('/api/admin/coupons', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            toast({ title: editingId ? 'Coupon updated' : 'Coupon created' });
            resetForm();
            fetchCoupons();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;

        try {
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            toast({ title: 'Coupon deleted' });
            fetchCoupons();
        } catch (error) {
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete', variant: 'destructive' });
        }
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="lg:ml-64">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Coupons</h1>
                    <p className="text-muted-foreground">Manage discount coupons</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-saffron-600 hover:bg-saffron-700">
                    <Plus className="h-4 w-4 mr-2" /> Create Coupon
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">{editingId ? 'Edit Coupon' : 'New Coupon'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Code *</Label>
                                    <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="uppercase" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="10% off on first order" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant={discountType === 'PERCENTAGE' ? 'default' : 'outline'} size="sm" onClick={() => setDiscountType('PERCENTAGE')} className={discountType === 'PERCENTAGE' ? 'bg-saffron-600' : ''}>
                                            <Percent className="h-4 w-4 mr-1" /> Percentage
                                        </Button>
                                        <Button type="button" variant={discountType === 'FIXED' ? 'default' : 'outline'} size="sm" onClick={() => setDiscountType('FIXED')} className={discountType === 'FIXED' ? 'bg-saffron-600' : ''}>
                                            <IndianRupee className="h-4 w-4 mr-1" /> Fixed
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Value *</Label>
                                    <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} min={1} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Order Amount</Label>
                                    <Input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} placeholder="499" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Max Discount</Label>
                                    <Input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="No limit" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Usage Limit</Label>
                                    <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Unlimited" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expires At</Label>
                                    <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                                <Label>Active</Label>
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" disabled={saving} className="bg-saffron-600 hover:bg-saffron-700">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    {editingId ? 'Update' : 'Create'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetForm}>
                                    <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
                </div>
            ) : coupons.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No coupons yet</p>
                        <p className="text-sm">Create a coupon to offer discounts.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Code</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Discount</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Usage</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Expires</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-mono font-bold text-sm">{coupon.code}</p>
                                                    {coupon.description && <p className="text-xs text-muted-foreground">{coupon.description}</p>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="gap-1">
                                                    {coupon.discountType === 'PERCENTAGE' ? (
                                                        <>{coupon.discountValue}% OFF</>
                                                    ) : (
                                                        <>₹{coupon.discountValue} OFF</>
                                                    )}
                                                </Badge>
                                                {coupon.minOrderAmount && (
                                                    <p className="text-xs text-muted-foreground mt-1">Min ₹{coupon.minOrderAmount}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">
                                                {coupon.usedCount}/{coupon.usageLimit || '∞'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {!coupon.isActive ? (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                ) : isExpired(coupon.expiresAt) ? (
                                                    <Badge variant="destructive">Expired</Badge>
                                                ) : (
                                                    <Badge variant="success">Active</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                                                {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-IN') : 'Never'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(coupon)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(coupon.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
