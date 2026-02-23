'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Star,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
    addresses: number;
  };
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account');
      return;
    }
    if (status === 'authenticated') {
      fetchProfile();
      fetchAddresses();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setEditName(data.user.name || '');
        setEditPhone(data.user.phone || '');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load profile.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      // Silently fail
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, name: data.user.name, phone: data.user.phone } : prev);
        setIsEditing(false);
        toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
      } else {
        toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        toast({ title: 'Address deleted' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete address.', variant: 'destructive' });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="bg-white rounded-2xl p-8">
              <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto" />
              <div className="mt-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-8">
          My Account
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {profile?.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
                <p className="text-saffron-100 text-sm">{profile?.email}</p>
                {profile?.role !== 'CUSTOMER' && (
                  <Badge className="mt-1 bg-white/20 text-white border-none text-xs">{profile?.role}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <Link href="/orders" className="py-4 text-center hover:bg-gray-50 transition-colors">
              <p className="text-2xl font-bold text-gray-900">{profile?._count?.orders || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Orders</p>
            </Link>
            <Link href="/wishlist" className="py-4 text-center hover:bg-gray-50 transition-colors">
              <p className="text-2xl font-bold text-gray-900">{profile?._count?.reviews || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Reviews</p>
            </Link>
            <div className="py-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{profile?._count?.addresses || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Addresses</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={saving} className="bg-saffron-500 hover:bg-saffron-600 text-white">
                    {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile?.email || ''} disabled className="mt-1 bg-gray-50" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{profile?.name || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{profile?.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-saffron-500" />
              Saved Addresses
            </h3>
          </div>
          <div className="p-6">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>No saved addresses yet.</p>
                <p className="text-sm mt-1">Addresses will be saved when you place an order.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-xl p-4 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{address.fullName}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {address.type}
                          </Badge>
                          {address.isDefault && (
                            <Badge className="bg-saffron-100 text-saffron-700 text-[10px] px-1.5 py-0 border-none">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.addressLine1}</p>
                        {address.addressLine2 && (
                          <p className="text-sm text-gray-600">{address.addressLine2}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {address.phone}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/orders"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-saffron-200 transition-all flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">My Orders</p>
              <p className="text-sm text-muted-foreground">Track & manage orders</p>
            </div>
          </Link>
          <Link
            href="/wishlist"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-saffron-200 transition-all flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Wishlist</p>
              <p className="text-sm text-muted-foreground">Items you love</p>
            </div>
          </Link>
          <Link
            href="/products"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-saffron-200 transition-all flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-saffron-50 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-saffron-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Shop</p>
              <p className="text-sm text-muted-foreground">Browse products</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
