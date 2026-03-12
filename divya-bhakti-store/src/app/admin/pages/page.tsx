'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    contentMarathi: string | null;
    isPublished: boolean;
    updatedAt: string;
}

export default function AdminPagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [contentMarathi, setContentMarathi] = useState('');
    const [isPublished, setIsPublished] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/admin/pages');
            if (res.ok) {
                const data = await res.json();
                setPages(data.pages);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load pages', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSlug('');
        setContent('');
        setContentMarathi('');
        setIsPublished(true);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (page: Page) => {
        setEditingId(page.id);
        setTitle(page.title);
        setSlug(page.slug);
        setContent(page.content);
        setContentMarathi(page.contentMarathi || '');
        setIsPublished(page.isPublished);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title,
                slug,
                content,
                contentMarathi: contentMarathi || undefined,
                isPublished,
            };

            const res = await fetch('/api/admin/pages', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            toast({ title: 'Success', description: `Page ${editingId ? 'updated' : 'created'} successfully` });
            resetForm();
            fetchPages();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save page',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, pageTitle: string) => {
        if (!confirm(`Are you sure you want to delete the page "${pageTitle}"?`)) return;

        try {
            const res = await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast({ title: 'Success', description: 'Page deleted successfully' });
            setPages(pages.filter((p) => p.id !== id));
        } catch {
            toast({ title: 'Error', description: 'Failed to delete page', variant: 'destructive' });
        }
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (!editingId) {
            setSlug(generateSlug(e.target.value));
        }
    };

    return (
        <div className="lg:ml-64">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Pages</h1>
                    <p className="text-muted-foreground">Manage your store's CMS pages</p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-saffron-600 hover:bg-saffron-700"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Page
                </Button>
            </div>

            {showForm && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Page' : 'Create New Page'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Page Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={handleTitleChange}
                                        placeholder="e.g., About Us"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="e.g., about-us"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">The URL will be: /pages/{slug}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content (English) *</Label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="You can use HTML or plain text here..."
                                    className="w-full min-h-[200px] flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contentMarathi">Content (Marathi) - Optional</Label>
                                <textarea
                                    id="contentMarathi"
                                    value={contentMarathi}
                                    onChange={(e) => setContentMarathi(e.target.value)}
                                    placeholder="मराठी मजकूर येथे लिहा..."
                                    className="w-full min-h-[200px] flex rounded-md border border-input bg-background px-3 py-2 text-sm font-marathi ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Switch checked={isPublished} onCheckedChange={setIsPublished} id="publish" />
                                <Label htmlFor="publish">Publish this page</Label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-saffron-600 hover:bg-saffron-700"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {editingId ? 'Update Page' : 'Publish Page'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
                </div>
            ) : pages.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium text-lg text-gray-900 mb-1">No pages found</p>
                        <p className="text-sm">Create content pages like About Us, Privacy Policy, or Terms.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create First Page
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Last Updated</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page) => (
                                        <tr key={page.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{page.title}</div>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">/{page.slug}</td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant={page.isPublished ? 'success' : 'secondary'}>
                                                    {page.isPublished ? 'Published' : 'Draft'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {new Date(page.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(page)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(page.id, page.title)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                    >
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
