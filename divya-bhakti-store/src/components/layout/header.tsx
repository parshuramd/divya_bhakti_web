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
      {/* Top Bar */}
      <div className="bg-saffron-900 text-white py-1.5 px-4 text-xs font-medium hidden sm:block">
        <div className="container mx-auto flex justify-between items-center">
          <p className="flex items-center gap-2">
            <span>🙏 {t('common.tagline')}</span>
          </p>
          <div className="flex items-center gap-4">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:text-saffron-200 transition-colors">
              <Phone className="h-3 w-3" />
              +91 98765 43210
            </a>
            <div className="h-3 w-px bg-white/20"></div>
            <span>Free Shipping on Orders Above ₹499</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm border-saffron-100" 
            : "bg-white border-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-saffron-50 text-saffron-900">
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
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className={cn(
                      "px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                      pathname === '/' 
                        ? "bg-saffron-50 text-saffron-700" 
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('common.home')}
                  </Link>
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('common.categories')}
                    </p>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="block py-2.5 px-3 rounded-md text-base hover:bg-saffron-50 hover:text-saffron-700 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t(`nav.${category.nameKey}`)}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/products"
                    className="px-4 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('common.shop')}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                🙏
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold text-saffron-700 leading-none group-hover:text-saffron-600 transition-colors">
                  Divya Bhakti
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-saffron-900/60 font-medium mt-0.5">Store</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-saffron-50 hover:text-saffron-700',
                  pathname === '/' && 'text-saffron-700 bg-saffron-50'
                )}
              >
                {t('common.home')}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-saffron-50 hover:text-saffron-700 outline-none data-[state=open]:bg-saffron-50 data-[state=open]:text-saffron-700">
                  {t('common.categories')}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 p-2 animate-in slide-in-from-top-2 fade-in-20 duration-200">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.href} asChild className="cursor-pointer py-2.5">
                      <Link href={category.href}>
                        {t(`nav.${category.nameKey}`)}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="cursor-pointer py-2.5 font-medium text-saffron-700 focus:text-saffron-800 focus:bg-saffron-50">
                    <Link href="/categories">
                      {t('common.viewAll')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/products"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-saffron-50 hover:text-saffron-700',
                  pathname === '/products' && 'text-saffron-700 bg-saffron-50'
                )}
              >
                {t('common.shop')}
              </Link>
              <Link
                href="/products?featured=true"
                className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-saffron-50 hover:text-saffron-700"
              >
                {t('nav.bestSellers')}
              </Link>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-sm mx-6">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-saffron-500 transition-colors" />
                <Input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  className="pl-10 pr-4 w-full bg-gray-50 border-transparent focus-visible:bg-white focus-visible:border-saffron-200 focus-visible:ring-2 focus-visible:ring-saffron-100 rounded-full transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-saffron-50 hover:text-saffron-600 rounded-full"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Language Switcher */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hover:bg-saffron-50 hover:text-saffron-600 rounded-full hidden sm:flex" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">{t('common.wishlist')}</span>
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-saffron-50 hover:text-saffron-600 rounded-full"
                onClick={openCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-saffron-600 border-2 border-white shadow-sm"
                  >
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">{t('common.cart')}</span>
              </Button>

              {/* User Menu */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full ml-1 h-9 w-9 border border-gray-100 shadow-sm">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ''} />
                        <AvatarFallback className="bg-saffron-100 text-saffron-700 font-semibold">
                          {getInitials(session.user.name || session.user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 animate-in slide-in-from-top-2 fade-in-20 duration-200">
                    <DropdownMenuLabel className="p-3 bg-gray-50 rounded-md mb-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {session.user.name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link href="/account">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t('account.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link href="/orders">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t('account.orders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link href="/account/addresses">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t('account.addresses')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link href="/account/settings">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        {t('account.settings')}
                      </Link>
                    </DropdownMenuItem>
                    {session.user.role === 'ADMIN' ||
                    session.user.role === 'SUPER_ADMIN' ? (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 bg-saffron-50 text-saffron-700 focus:bg-saffron-100 focus:text-saffron-800">
                          <Link href="/admin">
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : null}
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      className="cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="saffron" size="sm" className="ml-2 rounded-full px-5 shadow-sm" asChild>
                  <Link href="/login">{t('common.login')}</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden py-3 border-t animate-in slide-in-from-top-2 fade-in-20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  className="pl-10 pr-10 w-full rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-saffron-200"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
