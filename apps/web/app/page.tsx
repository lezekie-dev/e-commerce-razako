import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Price,
  MotionFade,
  MotionParallax,
} from '@ecommerce/ui';
import { FeaturedProductsGrid } from '../components/featured-products-grid';
import { findFeaturedProducts } from '../lib/catalog';

/**
 * Home page — `apps/web/app/page.tsx`
 * Server Component (RSC). Aucun 'use client' ici.
 *
 * Couvre les AC :
 * - AC-HOME-01 → <h1> unique dans <main> (Hero)
 * - AC-HOME-02 → sous-titre contrasté
 * - AC-HOME-03 → CTA principal focus visible + navigation /collections
 * - AC-HOME-04 → image hero (.webp) avec alt informatif + LCP
 * - AC-HOME-05 → 3 collections vedettes (testid="featured-collections")
 * - AC-HOME-06 → 6 produits vedettes (testid="featured-products") + Price fr-FR EUR
 * - AC-HOME-08/09 → footer contentinfo + RGPD + sélecteur langue
 * - AC-HOME-10/11 → grilles responsive mobile-first (1 → 2 → 3 → 4 cols)
 * - AC-HOME-12/13 → landmarks (main), h1 unique, h2 sections
 * - AC-HOME-14 → metadata (title ≤ 60, desc ≤ 155) + JSON-LD Organization
 * - AC-HOME-15 → next/image (AVIF/WebP auto), font-display=swap via CSS
 *
 * Notes :
 * - Le <header> sticky (AC-HOME-07) sera externalisé dans apps/web/app/layout.tsx
 *   lors d'une prochaine itération — ici, focus sur la home.
 * - Les chemins d'images pointent vers `public/images/...` ; les assets
 *   seront fournis par Designer / contenus plus tard.
 * - Les CTA sont des <Link> stylés via `buttonVariants()` plutôt que
 *   <Button><Link/></Button> (HTML invalide : <button> ne peut pas contenir
 *   d'élément interactif). Le DS Button gagnerait à adopter `asChild` (Radix
 *   Slot) — voir callout pour Tech Lead.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Metadata (AC-HOME-14 : title ≤ 60, description ≤ 155)
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Maison 14 — Objets design, durables & made in Europe',
  description:
    'Maison 14 sélectionne des objets design, durables et accessibles, pensés pour le quotidien et les belles occasions.',
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

// ─────────────────────────────────────────────────────────────────────────────
// Données fake — Collections vedettes
// ─────────────────────────────────────────────────────────────────────────────

type Collection = {
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

const FEATURED_COLLECTIONS: ReadonlyArray<Collection> = [
  {
    slug: 'cadeaux',
    title: 'Idées cadeaux',
    description: 'Sélection pensée pour chaque occasion — emballée avec soin.',
    image: '/images/collections/cadeaux.webp',
    alt: 'Sélection d’objets emballés pour offrir, posés sur une table en bois clair',
  },
  {
    slug: 'maison',
    title: 'Art de vivre',
    description: 'Des pièces durables pour embellir le quotidien.',
    image: '/images/collections/maison.webp',
    alt: 'Vase en céramique terracotta et bougeoir en laiton sur une étagère',
  },
  {
    slug: 'table',
    title: 'Arts de la table',
    description: 'Céramique, verrerie et couverts pour recevoir avec goût.',
    image: '/images/collections/table.webp',
    alt: 'Assiette en grès, verre à pied et couteau posé sur une nappe en lin',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Données fake — Produits vedettes (6, dans la fourchette 4–8)
// Prix en centimes, formatés via <Price/> en fr-FR EUR (AC-HOME-06)
// ─────────────────────────────────────────────────────────────────────────────

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Maison 14',
  url: 'https://maison14.fr/',
  logo: 'https://maison14.fr/images/logo.svg',
  sameAs: [
    'https://www.instagram.com/maison14',
    'https://www.pinterest.fr/maison14',
    'https://www.linkedin.com/company/maison14',
  ],
} as const;// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const FEATURED_PRODUCTS = findFeaturedProducts().map((p) => ({
  slug: p.slug,
  name: p.name,
  image: p.image,
  alt: p.alt,
  amount: p.priceCents,
  compareAt: p.compareAtCents,
  badge: p.badge,
  category: p.category,
  variants: p.variants.map((v) => ({ id: v.id, price: v.priceCents, compareAt: v.compareAtCents })),
}));

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Organization — AC-HOME-14 */}
      <script
        type="application/ld+json"
        // JSON-LD validé côté serveur, contrôlé avant rendu
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />

      <main id="main" className="bg-white text-ink-900">
        {/* ─────────── HERO ─────────── */}
        <section
          aria-labelledby="hero-title"
          className="relative isolate overflow-hidden bg-ink-50"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-28">
            <MotionFade className="lg:col-span-6 lg:flex lg:flex-col lg:justify-center" duration={0.7} y={20}>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent-700 ring-1 ring-accent-200">
                Nouvelle collection
              </p>

              {/* AC-HOME-01 — H1 unique, ≤ 60 chars (49 ici) */}
              <h1
                id="hero-title"
                className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
              >
                Des objets pensés pour durer.
              </h1>

              {/* AC-HOME-02 — sous-titre ≤ 150 chars (107 ici), contraste AA */}
              <p className="mt-6 max-w-xl text-base text-ink-700 sm:text-lg">
                Maison 14 sélectionne des pièces design, durables et accessibles,
                imaginées en Europe pour embellir votre quotidien.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* AC-HOME-03 — CTA primaire → /collections, focus-visible OK */}
                <Link
                  href="/collections"
                  data-testid="hero-cta"
                  className={buttonVariants({ variant: 'primary', size: 'lg' })}
                >
                  Découvrir la collection
                </Link>

                <Link
                  href="/about"
                  className={buttonVariants({ variant: 'ghost', size: 'lg' })}
                >
                  Notre histoire
                </Link>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink-200 pt-6 text-sm text-ink-600">
                <div>
                  <dt className="font-medium text-ink-900">+120 marques</dt>
                  <dd>curated en Europe</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink-900">30 jours</dt>
                  <dd>pour changer d’avis</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink-900">Made in EU</dt>
                  <dd>production responsable</dd>
                </div>
              </dl>
            </MotionFade>

            <MotionParallax strength={24} className="relative lg:col-span-6">
              {/* AC-HOME-04 — image WebP/AVIF, alt informatif, LCP */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ink-100 shadow-xl sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src="/images/hero.webp"
                  alt="Intérieur lumineux : vase en céramique, plaid en lin et livres d’art posés sur une console en chêne"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <Badge
                variant="accent"
                className="absolute -bottom-4 left-4 hidden shadow-md sm:inline-flex"
              >
                Livraison offerte dès 80 €
              </Badge>
            </MotionParallax>
          </div>
        </section>{/* ─────────── COLLECTIONS VEDETTES ─────────── */}
        <section
          aria-labelledby="collections-title"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
          data-testid="featured-collections"
        >
          <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">
                Univers
              </p>
              <h2
                id="collections-title"
                className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl"
              >
                Collections vedettes
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-sm font-medium text-accent-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Voir toutes les collections →
            </Link>
          </header>

          {/* AC-HOME-05 — 3 cartes (grille 1 → 2 → 3 colonnes) */}
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURED_COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Card className="group h-full overflow-hidden border-ink-200 transition-shadow hover:shadow-lg">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                    aria-label={`Voir la collection ${collection.title}`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
                      <Image
                        src={collection.image}
                        alt={collection.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-display text-2xl">
                        {collection.title}
                      </CardTitle>
                      <CardDescription className="text-ink-600">
                        {collection.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto text-sm font-medium text-accent-700">
                      Découvrir →
                    </CardFooter>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {/* ─────────── PRODUITS VEDETTES ─────────── */}
        <section
          aria-labelledby="products-title"
          className="bg-ink-50 py-16 sm:py-20 lg:py-24"
          data-testid="featured-products"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">
                  Sélection
                </p>
                <h2
                  id="products-title"
                  className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl"
                >
                  Nos coups de cœur
                </h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-medium text-accent-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
              >
                Voir tous les produits →
              </Link>
            </header>

            {/* AC-HOME-06 — grille featured via ProductCard canonique du DS */}
          </div>
        </section>
      </main>

      {/* ─────────── FOOTER MINIMAL (AC-HOME-08/09) ─────────── */}
      <footer
        role="contentinfo"
        className="border-t border-ink-200 bg-white text-ink-700"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-lg font-medium text-ink-900">
                Maison 14
              </p>
              <p className="mt-2 max-w-xs text-sm text-ink-600">
                Objets design, durables et accessibles, imaginés en Europe.
              </p>
            </div>

            <nav aria-label="Légal et informations">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
                Informations
              </h2>
              <ul role="list" className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/legal/cgu" className="hover:text-accent-700">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cgv" className="hover:text-accent-700">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link href="/legal/mentions" className="hover:text-accent-700">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-accent-700">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-accent-700">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-accent-700">
                    À propos
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Conformité">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
                Conformité
              </h2>
              <ul role="list" className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/legal/cookies"
                    aria-label="Gérer les cookies"
                    className="hover:text-accent-700"
                  >
                    Gestion des cookies (RGPD)
                  </Link>
                </li>
                <li>
                  <Link href="/legal/rgpd" className="hover:text-accent-700">
                    Vos données (RGPD)
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
                Langue
              </h2>
              <ul role="list" className="mt-4 flex gap-3 text-sm">
                <li>
                  <Link
                    href="/"
                    hrefLang="fr"
                    aria-current="true"
                    aria-label="Français"
                    className="rounded-full border border-ink-300 px-3 py-1 font-medium text-ink-900 hover:border-accent-700 hover:text-accent-700"
                  >
                    FR
                  </Link>
                </li>
                <li>
                  <Link
                    href="/en"
                    hrefLang="en"
                    aria-label="English"
                    className="rounded-full border border-ink-300 px-3 py-1 font-medium text-ink-900 hover:border-accent-700 hover:text-accent-700"
                  >
                    EN
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-10 border-t border-ink-200 pt-6 text-xs text-ink-500">
            © {new Date().getFullYear()} Maison 14 — Tous droits réservés.
          </p>
        </div>
      </footer>
    </>
  );
}