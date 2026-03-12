'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface Settings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  storeAddress: string;
  freeShippingThreshold: string;
  shippingCharge: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storeName: process.env.NEXT_PUBLIC_APP_NAME || 'Divya Bhakti Store',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '',
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    storeAddress: process.env.NEXT_PUBLIC_STORE_ADDRESS || '',
    freeShippingThreshold: '499',
    shippingCharge: '49',
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    twitterUrl: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    youtubeUrl: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const mapped: Partial<Settings> = {};
          for (const s of data.settings) {
            if (s.key in settings) {
              mapped[s.key as keyof Settings] = s.value;
            }
          }
          setSettings((prev) => ({ ...prev, ...mapped }));
        }
      }
    } catch {
      // Use defaults
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Settings saved successfully' });
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="lg:ml-64 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store Settings</h1>
          <p className="text-muted-foreground">Manage your store configuration</p>
        </div>
        <Button className="bg-saffron-600 hover:bg-saffron-700" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic store information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input value={settings.storeName} onChange={(e) => updateField('storeName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input type="email" value={settings.supportEmail} onChange={(e) => updateField('supportEmail', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Support Phone</Label>
                <Input value={settings.supportPhone} onChange={(e) => updateField('supportPhone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input value={settings.whatsappNumber} onChange={(e) => updateField('whatsappNumber', e.target.value)} placeholder="919876543210" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Store Address</Label>
              <Input value={settings.storeAddress} onChange={(e) => updateField('storeAddress', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
            <CardDescription>Configure shipping charges and free shipping threshold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Free Shipping Above (₹)</Label>
                <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => updateField('freeShippingThreshold', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Shipping Charge (₹)</Label>
                <Input type="number" value={settings.shippingCharge} onChange={(e) => updateField('shippingCharge', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Your social media profile URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={settings.facebookUrl} onChange={(e) => updateField('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={settings.instagramUrl} onChange={(e) => updateField('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Twitter URL</Label>
                <Input value={settings.twitterUrl} onChange={(e) => updateField('twitterUrl', e.target.value)} placeholder="https://twitter.com/..." />
              </div>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input value={settings.youtubeUrl} onChange={(e) => updateField('youtubeUrl', e.target.value)} placeholder="https://youtube.com/..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
            <CardDescription>Current environment configuration (read-only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">App URL</p>
                <p className="font-mono">{process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Razorpay</p>
                <p className="font-mono">{process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Configured' : 'Not configured'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
