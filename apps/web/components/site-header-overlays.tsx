'use client';

import * as React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@ecommerce/ui';

/**
 * Overlays du SiteHeader — `apps/web/components/site-header-overlays.tsx`
 * 3 sous-composants Client, séparés du shell `site-header.tsx` pour
 * réduire le couplage et permettre le code-splitting par overlay.
 *
 * - <HeaderSearch/>  → overlay recherche (input autofocus, Esc pour fermer)
 * - <CartDrawer/>    → drawer latéral droit (ouvre via le bouton Panier)
 * - <MobileMenu/>    → menu plein écran < md (hamburger)
 */

export type NavLink = { href: string; label: string };

/* ─────────────────────────────────────────────────────────────────────────
 * HeaderSearch
 * ───────────────────────────────────────────────────────────────────────── */

export function HeaderSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): React.ReactElement | null {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      id="site-search"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink-900/40 px-4 pt-[88px] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-ink-200 bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          role="search"
          action="/recherche"
          method="get"
          className="flex items-center gap-2"
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            name="q"
            placeholder="Rechercher un produit, une marque, une idée…"
            aria-label="Rechercher un produit"
            className="flex-1 border-0 bg-transparent text-base text-ink-900 placeholder:text-ink-500 focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-full border border-ink-300 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Échap
          </button>
        </form>
        <p className="mt-3 px-1 text-xs text-ink-500">
          Astuce : <kbd className="rounded border border-ink-200 px-1">Esc</kbd> pour fermer.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * CartDrawer — placeholder branchera le store M3
 * ───────────────────────────────────────────────────────────────────────── */

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): React.ReactElement | null {
  if (!open) return null;

  return (
    <div
      id="site-cart"
      role="dialog"
      aria-modal="true"
      aria-label="Panier"
      className="fixed inset-0 z-[60] flex justify-end bg-ink-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-ink-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <h2 className="font-display text-lg font-medium text-ink-900">
            Votre panier
          </h2>
          <button
            type="button"
            aria-label="Fermer le panier"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center text-sm text-ink-600">
            Votre panier est vide.
            <br />
            <span className="mt-1 inline-block text-xs text-ink-500">
              Branchez le store M3 pour afficher les articles.
            </span>
          </div>
        </div>

        <footer className="border-t border-ink-200 p-5">
          <Link
            href="/panier"
            onClick={onClose}
            className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true })}
          >
            Voir le panier
          </Link>
        </footer>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * MobileMenu
 * ───────────────────────────────────────────────────────────────────────── */

export function MobileMenu({
  open,
  onClose,
  nav,
}: {
  open: boolean;
  onClose: () => void;
  nav: ReadonlyArray<NavLink>;
}): React.ReactElement | null {
  if (!open) return null;

  return (
    <div
      id="site-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
      className="fixed inset-0 z-[60] flex flex-col bg-white md:hidden"
    >
      <div className="flex h-[72px] items-center justify-between border-b border-ink-200 px-4">
        <Link
          href="/"
          onClick={onClose}
          className="font-display text-xl font-medium text-ink-900"
        >
          Maison 14
        </Link>
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
        >
          <CloseIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Navigation principale (mobile)" className="flex-1 overflow-y-auto px-4 py-6">
        <ul role="list" className="flex flex-col gap-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-4 text-lg font-medium text-ink-900 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
              >
                {item.label}
                <span aria-hidden="true" className="text-ink-400">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-3 border-t border-ink-200 pt-6">
          <Link
            href="/compte"
            onClick={onClose}
            className={buttonVariants({ variant: 'outline', size: 'lg', fullWidth: true })}
          >
            Mon compte
          </Link>
          <Link
            href="/collections"
            onClick={onClose}
            className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true })}
          >
            Découvrir la collection
          </Link>
        </div>
      </nav>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Icônes inline (SVG, aucune dépendance externe ; lucide-react dispo si
 * Designer veut standardiser en M3).
 * ───────────────────────────────────────────────────────────────────────── */

type IconProps = React.SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
