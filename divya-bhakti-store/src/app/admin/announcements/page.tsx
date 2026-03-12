'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Loader2, Save, X, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface Announcement {
    id: string;
    message: string;
    messageMarathi: string | null;
    link: string | null;
    bgColor: string;
    textColor: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [message, setMessage] = useState('');
    const [messageMarathi, setMessageMarathi] = useState('');
    const [link, setLink] = useState('');
    const [bgColor, setBgColor] = useState('#f97316');
    const [textColor, setTextColor] = useState('#ffffff');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements);
            }
        } catch {
            toast({ title: 'Error', description: 'Failed to load announcements', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMessage('');
        setMessageMarathi('');
        setLink('');
        setBgColor('#f97316');
        setTextColor('#ffffff');
        setIsActive(true);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setMessage(announcement.message);
        setMessageMarathi(announcement.messageMarathi || '');
        setLink(announcement.link || '');
        setBgColor(announcement.bgColor);
        setTextColor(announcement.textColor);
        setIsActive(announcement.isActive);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                message,
                messageMarathi: messageMarathi || undefined,
                link: link || undefined,
                bgColor,
                textColor,
                isActive,
            };

            const res = await fetch('/api/admin/announcements', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            toast({ title: 'Success', description: `Announcement ${editingId ? 'updated' : 'created'} successfully` });
            resetForm();
            fetchAnnouncements();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save announcement',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast({ title: 'Success', description: 'Announcement deleted successfully' });
            setAnnouncements(announcements.filter((a) => a.id !== id));
        } catch {
            toast({ title: 'Error', description: 'Failed to delete announcement', variant: 'destructive' });
        }
    };

    return (
        <div className="lg:ml-64">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Announcements</h1>
                    <p className="text-muted-foreground">Manage top-bar announcements for the store</p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-saffron-600 hover:bg-saffron-700"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Announcement
                </Button>
            </div>

            {showForm && (
                <Card className="mb-8 border-saffron-200 shadow-md">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="rounded-md border p-4 mb-6" style={{ backgroundColor: bgColor, color: textColor }}>
                                <p className="text-sm font-medium mb-1 opacity-70">Live Preview:</p>
                                <div className="text-center w-full font-medium">
                                    {message || 'Your announcement message will appear here'}
                                    {link && <span className="underline ml-2">Click Here</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message (English) *</Label>
                                    <Input
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="e.g., Free shipping on orders over ₹499!"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="messageMarathi">Message (Marathi) - Optional</Label>
                                    <Input
                                        id="messageMarathi"
                                        value={messageMarathi}
                                        onChange={(e) => setMessageMarathi(e.target.value)}
                                        placeholder="मराठी संदेश"
                                        className="font-marathi"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="link">Link URL (Optional)</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="link"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="/category/puja"
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Make the announcement clickable to a specific page.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bgColor">Background Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="bgColor"
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="flex-1 font-mono uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="textColor">Text Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="textColor"
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="flex-1 font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Switch checked={isActive} onCheckedChange={setIsActive} id="activeStatus" />
                                <Label htmlFor="activeStatus">Set as Active</Label>
                                <p className="text-xs text-muted-foreground ml-2">(Only one active announcement is typically shown on the store front)</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
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
                                    {editingId ? 'Update' : 'Create'}
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
            ) : announcements.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium text-lg text-gray-900 mb-1">No announcements yet</p>
                        <p className="text-sm">Create an announcement to highlight sales or important information.</p>
                        <Button
                            variant="outline"
                            className="mt-6"
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create First Announcement
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
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Announcement</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Preview</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {announcements.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-4 max-w-[250px]">
                                                <div className="font-medium text-gray-900 truncate" title={item.message}>{item.message}</div>
                                                {item.link && (
                                                    <div className="text-xs text-blue-600 truncate mt-1">
                                                        <LinkIcon className="h-3 w-3 inline mr-1" />
                                                        {item.link}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div
                                                    className="px-3 py-1.5 rounded text-xs text-center inline-block max-w-[200px] truncate"
                                                    style={{ backgroundColor: item.bgColor, color: item.textColor }}
                                                >
                                                    {item.message}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant={item.isActive ? 'success' : 'secondary'}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(item)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(item.id)}
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
