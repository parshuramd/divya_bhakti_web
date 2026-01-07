'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  nameMarathi: string | null;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  currentCategory?: string;
}

export function ProductFilters({ categories, currentCategory }: ProductFiltersProps) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const hasFilters =
    searchParams.has('category') ||
    searchParams.has('minPrice') ||
    searchParams.has('maxPrice') ||
    searchParams.has('sort');

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">{t('common.categories')}</h3>
        <div className="space-y-2">
          <button
            className={cn(
              'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
              !currentCategory
                ? 'bg-saffron-100 text-saffron-800'
                : 'hover:bg-muted'
            )}
            onClick={() => updateFilter('category', null)}
          >
            {t('common.all')}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                currentCategory === category.slug
                  ? 'bg-saffron-100 text-saffron-800'
                  : 'hover:bg-muted'
              )}
              onClick={() => updateFilter('category', category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minPrice" className="text-xs">
              Min
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="₹0"
              defaultValue={searchParams.get('minPrice') || ''}
              onBlur={(e) => updateFilter('minPrice', e.target.value || null)}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="text-xs">
              Max
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="₹10000"
              defaultValue={searchParams.get('maxPrice') || ''}
              onBlur={(e) => updateFilter('maxPrice', e.target.value || null)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-3">{t('common.sortBy')}</h3>
        <Select
          value={searchParams.get('sort') || 'newest'}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            {t('common.clearAll')}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t('common.filters')}
          </h2>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {t('common.filters')}
              {hasFilters && (
                <span className="ml-2 bg-saffron-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{t('common.filters')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

