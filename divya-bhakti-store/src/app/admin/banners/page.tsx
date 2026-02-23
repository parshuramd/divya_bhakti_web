'use client';

import { useState, useEffect } from 'react';
import {
    ImageIcon,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Save,
    X,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface Banner {
    id: string;
    title: string;
    titleMarathi: string | null;
    subtitle: string | null;
    image: string;
    imageMobile: string | null;
    link: string | null;
    linkText: string | null;
    position: string;
    isActive: boolean;
    sortOrder: number;
    startsAt: string | null;
    endsAt: string | null;
}

const POSITIONS = [
    { value: 'HOME_HERO', label: 'Home Hero' },
    { value: 'HOME_SECONDARY', label: 'Home Secondary' },
    { value: 'CATEGORY_PAGE', label: 'Category Page' },
    { value: 'PRODUCT_PAGE', label: 'Product Page' },
    { value: 'CHECKOUT_PAGE', label: 'Checkout Page' },
];

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [image, setImage] = useState('');
    const [imageMobile, setImageMobile] = useState('');
    const [link, setLink] = useState('');
    const [linkText, setLinkText] = useState('');
    const [position, setPosition] = useState('HOME_HERO');
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners');
            if (res.ok) {
                const data = await res.json();
                setBanners(data.banners);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load banners', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSubtitle('');
        setImage('');
        setImageMobile('');
        setLink('');
        setLinkText('');
        setPosition('HOME_HERO');
        setIsActive(true);
        setSortOrder(0);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (banner: Banner) => {
        setEditingId(banner.id);
        setTitle(banner.title);
        setSubtitle(banner.subtitle || '');
        setImage(banner.image);
        setImageMobile(banner.imageMobile || '');
        setLink(banner.link || '');
        setLinkText(banner.linkText || '');
        setPosition(banner.position);
        setIsActive(banner.isActive);
        setSortOrder(banner.sortOrder);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                title, subtitle: subtitle || undefined, image, position, isActive, sortOrder,
            };
            if (imageMobile) payload.imageMobile = imageMobile;
            if (link) payload.link = link;
            if (linkText) payload.linkText = linkText;

            const body = editingId ? { id: editingId, ...payload } : payload;

            const res = await fetch('/api/admin/banners', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            toast({ title: editingId ? 'Banner updated' : 'Banner created' });
            resetForm();
            fetchBanners();
        } catch (error) {
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;

        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            toast({ title: 'Banner deleted' });
            fetchBanners();
        } catch (error) {
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete', variant: 'destructive' });
        }
    };

    return (
        <div className="lg:ml-64">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Banners</h1>
                    <p className="text-muted-foreground">Manage promotional banners</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-saffron-600 hover:bg-saffron-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Banner
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">{editingId ? 'Edit Banner' : 'New Banner'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Banner title" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Banner subtitle" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Image URL *</Label>
                                    <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile Image URL</Label>
                                    <Input value={imageMobile} onChange={(e) => setImageMobile(e.target.value)} placeholder="https://..." />
                                </div>
                            </div>
                            {image && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 max-w-md">
                                    <img src={image} alt="Preview" className="w-full h-32 object-cover" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Link URL</Label>
                                    <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/products" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Text</Label>
                                    <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Shop Now" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <select
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {POSITIONS.map((p) => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Sort Order</Label>
                                    <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                                    <Label>Active</Label>
                                </div>
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

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
                </div>
            ) : banners.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No banners yet</p>
                        <p className="text-sm">Create banners for your store.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((banner) => (
                        <Card key={banner.id} className="overflow-hidden">
                            <div className="relative h-40">
                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <Badge className="text-xs">{POSITIONS.find((p) => p.value === banner.position)?.label || banner.position}</Badge>
                                    <Badge variant={banner.isActive ? 'success' : 'secondary'}>
                                        {banner.isActive ? <><Eye className="h-3 w-3 mr-1" /> Active</> : <><EyeOff className="h-3 w-3 mr-1" /> Inactive</>}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{banner.title}</h3>
                                        {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                                        {banner.link && <p className="text-xs text-saffron-600 mt-1">{banner.link}</p>}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(banner)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(banner.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
