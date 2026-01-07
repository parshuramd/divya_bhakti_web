'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Settings,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCartStore } from '@/store/cart-store';
import { cn, getInitials } from '@/lib/utils';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { LanguageSwitcher } from '@/components/common/language-switcher';

const categories = [
  { name: 'Idols & Murtis', href: '/category/idols', nameKey: 'idols' },
  { name: 'Mala & Beads', href: '/category/mala', nameKey: 'mala' },
  { name: 'Incense & Dhoop', href: '/category/incense', nameKey: 'incense' },
  { name: 'Photos & Frames', href: '/category/photos', nameKey: 'photos' },
  { name: 'Puja Items', href: '/category/puja', nameKey: 'puja' },
];

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar - Amazon Style Dark */}
      <div className="bg-gray-900 text-white py-2 px-4 text-xs font-medium">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-saffron-400 cursor-pointer">
              <MapPin className="h-3 w-3" />
              Deliver to <strong>India</strong>
            </span>
            <span className="hidden sm:inline">
              🙏 {t('common.tagline')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:text-saffron-400 transition-colors">
              <Phone className="h-3 w-3" />
              Support
            </a>
            <div className="h-3 w-px bg-white/20"></div>
            <Link href="/track-order" className="hover:text-saffron-400">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-md border-saffron-100" 
            : "bg-white border-transparent"
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            
            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden hover:bg-saffron-50 text-gray-700">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] border-r-saffron-200">
                  <SheetHeader className="text-left border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-lg shadow-md">
                        🙏
                      </div>
                      <div>
                        <SheetTitle className="font-display text-saffron-700">
                          {t('common.siteName')}
                        </SheetTitle>
                      </div>
                    </div>
                  </SheetHeader>
                  {/* ... mobile nav items same as before ... */}
                  <nav className="flex flex-col gap-2">
                    <Link href="/" className="px-4 py-3 rounded-lg text-lg font-medium hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('common.home')}</Link>
                    {categories.map((c) => (
                      <Link key={c.href} href={c.href} className="px-4 py-2.5 hover:bg-gray-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>{t(`nav.${c.nameKey}`)}</Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                  🙏
                </div>
                <div className="hidden md:block leading-tight">
                  <h1 className="font-display text-xl font-bold text-saffron-700">Divya Bhakti</h1>
                </div>
              </Link>
            </div>

            {/* Search Bar - Amazon Style Central & Large */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full group relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-saffron-500 transition-colors" />
                </div>
                <input
                  type="search"
                  placeholder="Search for idols, incense, malas..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-l-lg border-2 border-r-0 border-gray-200 focus:border-saffron-500 focus:ring-0 outline-none transition-all"
                />
                <Button className="rounded-l-none rounded-r-lg bg-saffron-500 hover:bg-saffron-600 px-6 font-bold border-2 border-saffron-500">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
              {/* Language */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Account - Amazon Style */}
              <div className="hidden sm:block">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-left px-2 py-1 hover:bg-gray-100 rounded-md transition-colors outline-none group">
                        <div className="text-[11px] text-gray-500 font-medium">Hello, {session.user.name?.split(' ')[0]}</div>
                        <div className="text-sm font-bold text-gray-800 flex items-center gap-1 group-hover:text-saffron-600">
                          Account & Lists <ChevronDown className="h-3 w-3" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/account">Profile</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/orders">Orders</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/wishlist">Wishlist</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login" className="text-left px-2 py-1 hover:bg-gray-100 rounded-md transition-colors block">
                    <div className="text-[11px] text-gray-500 font-medium">Hello, Sign in</div>
                    <div className="text-sm font-bold text-gray-800">Account & Lists</div>
                  </Link>
                )}
              </div>

              {/* Returns & Orders (Hidden on mobile) */}
              <Link href="/orders" className="hidden lg:block text-left px-2 py-1 hover:bg-gray-100 rounded-md transition-colors">
                <div className="text-[11px] text-gray-500 font-medium">Returns</div>
                <div className="text-sm font-bold text-gray-800">& Orders</div>
              </Link>

              {/* Cart */}
              <Button
                variant="ghost"
                className="relative h-auto py-1 px-2 hover:bg-gray-100 flex items-end gap-1"
                onClick={openCart}
              >
                <div className="relative">
                  <ShoppingCart className="h-8 w-8 text-gray-800" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-saffron-600 text-white text-[10px] font-bold border-2 border-white">
                    {itemCount}
                  </span>
                </div>
                <span className="font-bold text-sm text-gray-800 mb-1 hidden sm:inline">Cart</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar - Visible only on mobile */}
          <div className="md:hidden mt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search Divya Bhakti..."
                className="pl-10 w-full bg-gray-100 border-transparent focus:bg-white focus:border-saffron-500 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Secondary Navigation - Categories Row */}
        <div className="bg-saffron-600 text-white text-sm py-2 px-4 overflow-x-auto scrollbar-hide hidden md:block">
          <div className="container mx-auto flex items-center gap-6 font-medium whitespace-nowrap">
            <div className="flex items-center gap-1 cursor-pointer hover:text-saffron-100">
              <Menu className="h-4 w-4" />
              All
            </div>
            {categories.map((c) => (
              <Link key={c.href} href={c.href} className="hover:text-saffron-100 hover:underline transition-colors">
                {t(`nav.${c.nameKey}`)}
              </Link>
            ))}
            <Link href="/products?featured=true" className="hover:text-saffron-100 hover:underline">Best Sellers</Link>
            <Link href="/products?sort=newest" className="hover:text-saffron-100 hover:underline">New Releases</Link>
            <div className="flex-1" />
            <Link href="/festival-sale" className="font-bold text-yellow-300 hover:text-white animate-pulse">
              🎉 Festival Sale Live
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
