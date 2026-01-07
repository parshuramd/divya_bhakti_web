import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale } from './config/i18n';

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  
  let locale: Locale = defaultLocale;
  
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

// Re-export for convenience in server components
export { locales, defaultLocale, type Locale } from './config/i18n';
