'use client';

import { useState, useEffect } from 'react';
import {
    FolderTree,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Package,
    Save,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface Category {
    id: string;
    name: string;
    nameMarathi: string | null;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    sortOrder: number;
    _count: { products: number };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [name, setName] = useState('');
    const [nameMarathi, setNameMarathi] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setNameMarathi('');
        setDescription('');
        setImage('');
        setIsActive(true);
        setSortOrder(0);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setName(cat.name);
        setNameMarathi(cat.nameMarathi || '');
        setDescription(cat.description || '');
        setImage(cat.image || '');
        setIsActive(cat.isActive);
        setSortOrder(cat.sortOrder);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = { name, nameMarathi: nameMarathi || undefined, description: description || undefined, image: image || undefined, isActive, sortOrder };
            const url = '/api/admin/categories';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { id: editingId, ...payload } : payload;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            toast({ title: editingId ? 'Category updated' : 'Category created' });
            resetForm();
            fetchCategories();
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
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            toast({ title: 'Category deleted' });
            fetchCategories();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to delete',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="lg:ml-64">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage product categories</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-saffron-600 hover:bg-saffron-700"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {editingId ? 'Edit Category' : 'New Category'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name *</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Name (Marathi)</Label>
                                    <Input value={nameMarathi} onChange={(e) => setNameMarathi(e.target.value)} placeholder="मराठी नाव" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Image URL</Label>
                                    <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
                                </div>
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

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
                </div>
            ) : categories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <FolderTree className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No categories yet</p>
                        <p className="text-sm">Create your first category to organize products.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Slug</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Products</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Order</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {cat.image ? (
                                                        <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-saffron-50 flex items-center justify-center">
                                                            <FolderTree className="h-5 w-5 text-saffron-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-sm">{cat.name}</p>
                                                        {cat.nameMarathi && <p className="text-xs text-muted-foreground">{cat.nameMarathi}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{cat.slug}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className="gap-1">
                                                    <Package className="h-3 w-3" /> {cat._count.products}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={cat.isActive ? 'success' : 'secondary'}>
                                                    {cat.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-muted-foreground">{cat.sortOrder}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(cat.id)}>
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
