import type { Metadata } from 'next';
import { Inter, Playfair_Display, Noto_Sans_Devanagari } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-sans-devanagari',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://divyabhaktistore.com'),
  title: {
    default: 'Divya Bhakti Store - Divine Devotional Products | दिव्य भक्ती स्टोअर',
    template: '%s | Divya Bhakti Store',
  },
  description:
    'Shop authentic devotional products including idols, mala, incense, and puja items. Trusted by devotees across India. Free shipping on orders above ₹499.',
  keywords: [
    'devotional products',
    'puja items',
    'hindu idols',
    'mala beads',
    'incense sticks',
    'dhoop',
    'religious items',
    'bhakti store',
    'online puja shop',
    'मूर्ती',
    'पूजा साहित्य',
    'माळा',
    'अगरबत्ती',
  ],
  authors: [{ name: 'Divya Bhakti Store' }],
  creator: 'Divya Bhakti Store',
  publisher: 'Divya Bhakti Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: 'mr_IN',
    url: 'https://divyabhaktistore.com',
    siteName: 'Divya Bhakti Store',
    title: 'Divya Bhakti Store - Divine Devotional Products',
    description:
      'Shop authentic devotional products including idols, mala, incense, and puja items. Trusted by devotees across India.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Divya Bhakti Store - Divine Devotional Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Divya Bhakti Store - Divine Devotional Products',
    description:
      'Shop authentic devotional products including idols, mala, incense, and puja items.',
    images: ['/og-image.jpg'],
    creator: '@divyabhaktistore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'ecommerce',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${notoDevanagari.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider messages={messages}>
              {children}
              <Toaster />
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

