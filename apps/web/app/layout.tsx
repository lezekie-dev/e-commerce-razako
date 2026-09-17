import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '../components/site-header';
import { PMReviewOverlay } from '../components/pm-review-overlay';
import { ToastHost } from '../components/toast-host';
import { CartHydrator } from '../components/cart-hydrator';

/**
 * Root layout — `apps/web/app/layout.tsx`
 * Server Component (RSC). Aucun 'use client' ici.
 *
 * Couvre AC-HOME-07 (P0) :
 * - <header role="banner"> sticky 72 px, glass (backdrop-blur + bg-white/80),
 *   ne masque pas le contenu (top:0; z-50; height:72px).
 * - 3 sous-composants interactifs (Client Components, cf. site-header.tsx) :
 *     <HeaderSearch/>  → overlay recherche (Esc/click-outside pour fermer)
 *     <CartDrawer/>    → drawer latéral droit (ouvre via le bouton Panier)
 *     <MobileMenu/>    → menu plein écran < md (hamburger)
 *
 * Notes :
 * - Le footer vit DANS `apps/web/app/page.tsx` pour l'instant (refacto M2 :
 *   extraire en <SiteFooter/> pour mutualisation sur /collections, /panier, etc.).
 * - `lang="fr"` sur <html> (AC ARIA + SEO).
 * - Metadata consolidée ici pour éviter la duplication page/page.
 * - Tokens `ink-*` / `accent-*` dépendent de l'extension de
 *   `tailwind.config.ts` (cf. callout bloquant TechLead).
 */

export const metadata: Metadata = {
  title: {
    default: 'Maison 14 — Objets design, durables & made in Europe',
    template: '%s · Maison 14',
  },
  description:
    'Maison 14 sélectionne des objets design, durables et accessibles, pensés pour le quotidien et les belles occasions.',
  metadataBase: new URL('https://maison14.fr'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Maison 14 — Objets design & durables',
    description: 'Sélection premium d’objets design, durables et made in Europe.',
    url: '/',
    siteName: 'Maison 14',
    locale: 'fr_FR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#18181B' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-ink-900 antialiased">
        {/* Skip-link accessibilité — visible au focus clavier */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent-700 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          Aller au contenu principal
        </a>

        {/* AC-HOME-07 — header sticky 72 px (Server-rendered shell + Client interactivity) */}
        <ToastHost><CartHydrator /><SiteHeader />

        {children}</ToastHost>

        {/* PM Review overlay */}
        <PMReviewOverlay />
      </body>
    </html>
  );
}
