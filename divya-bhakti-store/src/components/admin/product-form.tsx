'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { toast } from '@/components/ui/use-toast';
import type { Category, Product, ProductImage } from '@prisma/client';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameMarathi: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  descriptionMarathi: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  compareAtPrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, 'Stock must be positive'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.object({ url: z.string() }).array(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: (Product & { images: ProductImage[] }) | null;
  categories: Category[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: Number(initialData.price),
          compareAtPrice: initialData.compareAtPrice ? Number(initialData.compareAtPrice) : 0,
          costPrice: initialData.costPrice ? Number(initialData.costPrice) : 0,
          nameMarathi: initialData.nameMarathi || '',
          descriptionMarathi: initialData.descriptionMarathi || '',
          images: initialData.images.map((img) => ({ url: img.url })),
        }
      : {
          name: '',
          nameMarathi: '',
          description: '',
          descriptionMarathi: '',
          price: 0,
          compareAtPrice: 0,
          costPrice: 0,
          stock: 0,
          sku: '',
          categoryId: '',
          isActive: true,
          isFeatured: false,
          images: [],
        },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        // Update
        const response = await fetch(`/api/products/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Something went wrong');
        toast({ title: 'Product updated successfully', variant: 'success' });
      } else {
        // Create
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Something went wrong');
        toast({ title: 'Product created successfully', variant: 'success' });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {initialData ? 'Edit Product' : 'Create Product'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {initialData ? 'Edit product details' : 'Add a new product to your store'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {initialData && (
            <Button
              disabled={loading}
              variant="destructive"
              size="icon"
              onClick={() => {
                /* Add delete logic */
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
          <Button disabled={loading} type="submit" variant="saffron">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input disabled={loading} {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Name (Marathi)</Label>
                  <Input disabled={loading} {...form.register('nameMarathi')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea disabled={loading} {...form.register('description')} rows={5} />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description (Marathi)</Label>
                <Textarea disabled={loading} {...form.register('descriptionMarathi')} rows={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={form.watch('images').map((image) => image.url)}
                disabled={loading}
                onChange={(url) => {
                  const currentImages = form.getValues('images');
                  form.setValue('images', [...currentImages, { url }]);
                }}
                onRemove={(url) => {
                  const currentImages = form.getValues('images');
                  form.setValue(
                    'images',
                    currentImages.filter((image) => image.url !== url)
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  disabled={loading}
                  onValueChange={(value) => form.setValue('categoryId', value)}
                  defaultValue={form.getValues('categoryId')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>SKU</Label>
                <Input disabled={loading} {...form.register('sku')} />
                {form.formState.errors.sku && (
                  <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-4">
                <Checkbox
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Product will be visible in the store
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-4">
                <Checkbox
                  id="isFeatured"
                  checked={form.watch('isFeatured')}
                  onCheckedChange={(checked) => form.setValue('isFeatured', checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="isFeatured">Featured Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Show on home page and featured lists
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" disabled={loading} {...form.register('price')} />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Compare at Price (₹)</Label>
                <Input type="number" disabled={loading} {...form.register('compareAtPrice')} />
                <p className="text-xs text-muted-foreground">Original price (for discount)</p>
              </div>

              <div className="space-y-2">
                <Label>Cost per Item (₹)</Label>
                <Input type="number" disabled={loading} {...form.register('costPrice')} />
                <p className="text-xs text-muted-foreground">For profit calculation (hidden)</p>
              </div>

              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" disabled={loading} {...form.register('stock')} />
                {form.formState.errors.stock && (
                  <p className="text-sm text-red-500">{form.formState.errors.stock.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

