'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/config/i18n';

const localeNames: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie and refresh
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            className={locale === l ? 'bg-accent' : ''}
          >
            <span className="mr-2">{l === 'en' ? '🇬🇧' : '🇮🇳'}</span>
            <span>{localeNames[l].nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
