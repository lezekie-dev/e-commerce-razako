'use client';

import * as React from 'react';
import Link from 'next/link';
import { buttonVariants, cn } from '@ecommerce/ui';
import {
  CartDrawer,
  HeaderSearch,
  MenuIcon,
  MobileMenu,
  SearchIcon,
  UserIcon,
  type NavLink,
} from './site-header-overlays';
import { CartButton } from './cart-button';

/**
 * SiteHeader — `apps/web/components/site-header.tsx`
 * M2 : badge Panier réactif (compte live via Zustand).
 */

const PRIMARY_NAV: ReadonlyArray<NavLink> = [
  { href: '/collections', label: 'Collections' },
  { href: '/nouveautes', label: 'Nouveautés' },
  { href: '/categories', label: 'Catégories' },
  { href: '/a-propos', label: 'Maison 14' },
  { href: '/magazine', label: 'Magazine' },
];

export function SiteHeader(): React.ReactElement {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const lastTriggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (searchOpen) setSearchOpen(false);
      else if (cartOpen) setCartOpen(false);
      else if (mobileOpen) setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, cartOpen, mobileOpen]);

  React.useEffect(() => {
    const open = searchOpen || cartOpen || mobileOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen, cartOpen, mobileOpen]);

  const openSearch = () => {
    lastTriggerRef.current = document.activeElement as HTMLElement;
    setSearchOpen(true);
  };
  const openCart = () => {
    lastTriggerRef.current = document.activeElement as HTMLElement;
    setCartOpen(true);
  };

  return (
    <>
      <header
        role="banner"
        data-testid="site-header"
        className={cn(
          'sticky top-0 z-50 w-full',
          'h-[72px]',
          'border-b border-ink-200/60',
          'bg-white/80 backdrop-blur-md',
          'supports-[backdrop-filter]:bg-white/70'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Maison 14 — Accueil"
            className="font-display text-xl font-medium text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Maison 14
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul role="list" className="flex items-center gap-7">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-ink-700 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Rechercher"
              aria-expanded={searchOpen}
              aria-controls="site-search"
              onClick={openSearch}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <CartButton open={cartOpen} onOpen={openCart} />

            <Link
              href="/compte"
              aria-label="Mon compte"
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 sm:inline-flex"
            >
              <UserIcon className="h-5 w-5" aria-hidden="true" />
              <span className="hidden lg:inline">Compte</span>
            </Link>

            <Link
              href="/products"
              className={buttonVariants({ variant: 'primary', size: 'sm', className: 'hidden md:inline-flex' })}
            >
              Découvrir
            </Link>

            <button
              type="button"
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 md:hidden"
            >
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <HeaderSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} nav={PRIMARY_NAV} />
    </>
  );
}

export type { NavLink };
