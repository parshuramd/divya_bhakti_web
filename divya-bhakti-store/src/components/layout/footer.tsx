'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: t('nav.idols'), href: '/category/idols' },
      { name: t('nav.mala'), href: '/category/mala' },
      { name: t('nav.incense'), href: '/category/incense' },
      { name: t('nav.photos'), href: '/category/photos' },
      { name: t('nav.puja'), href: '/category/puja' },
      { name: t('nav.newArrivals'), href: '/products?sort=newest' },
    ],
    support: [
      { name: t('footer.contactUs'), href: '/contact' },
      { name: t('footer.faq'), href: '/faq' },
      { name: t('footer.shippingPolicy'), href: '/shipping-policy' },
      { name: 'Track Order', href: '/track-order' },
    ],
    legal: [
      { name: t('footer.aboutUs'), href: '/about' },
      { name: t('footer.privacyPolicy'), href: '/privacy-policy' },
      { name: t('footer.termsConditions'), href: '/terms' },
      { name: t('footer.refundPolicy'), href: '/refund-policy' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-saffron-100">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-xl shadow-lg">
                🙏
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-saffron-700 leading-none">
                  Divya Bhakti
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-saffron-900/60 font-medium mt-1">
                  Store
                </p>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Your trusted destination for authentic devotional products.
              Bringing divine blessings to homes across India since 2020.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 pt-2">
              <a
                href="mailto:support@divyabhaktistore.com"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-saffron-600 transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-saffron-300 group-hover:bg-saffron-50 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                support@divyabhaktistore.com
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-saffron-600 transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-saffron-300 group-hover:bg-saffron-50 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                +91 98765 43210
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-600 group">
                <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mt-0.5 group-hover:border-saffron-300 group-hover:bg-saffron-50 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>
                  123 Devotional Lane, Mumbai,
                  <br />
                  Maharashtra 400001, India
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-saffron-500 hover:text-white hover:border-saffron-500 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-blue-400 hover:text-white hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="col-span-1">
            <h3 className="font-display font-bold text-lg mb-6 text-gray-900">{t('common.shop')}</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-saffron-600 hover:pl-1 transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-display font-bold text-lg mb-6 text-gray-900">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-saffron-600 hover:pl-1 transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-display font-bold text-lg mb-6 text-gray-900">Company</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-saffron-600 hover:pl-1 transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
          <p className="text-sm text-gray-500 text-center md:text-left">
            {t('footer.copyright', { year: currentYear })}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-2 uppercase tracking-wide">
              Secure Payments
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-10 bg-white rounded border border-gray-200 shadow-sm" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center pb-4">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            Made with <span className="text-red-500 animate-pulse">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
