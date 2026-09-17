import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Badge,
  buttonVariants,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  MotionFade,
  MotionParallax,
  MotionMeshGradient,
  MotionTextLines,
  MotionMagnetic,
  MotionCountUp,
  MotionSpotlight,
} from '@ecommerce/ui';
import { FeaturedProductsGrid } from '../components/featured-products-grid';
import { HeroFloatingOrbs } from '../components/hero-floating-orbs';
import { InspirationGrid } from '../components/inspiration-grid';
import { NewsletterCTA } from '../components/newsletter-cta';
import { ScrollProgress } from '../components/scroll-progress';
import { findFeaturedProducts } from '../lib/catalog';

/**
 * Home page — Server Component (RSC).
 * Effets premium v2 par-dessus AC-HOME 01-15 :
 * - Hero : mesh-gradient animé + halo cursor-follow + 3 orbes flottantes en parallaxe inverse + titre animé ligne-par-ligne + CTA magnétique + compteurs animés.
 * - Featured products : grille stagger avec ProductCard (3D tilt + shimmer + quick-add avec bounce).
 * - Inspiration : masonry 6 images avec reveal au scroll.
 * - Newsletter : bloc ink-900 avec champ email + état de succès avec check.
 * - Scroll progress bar en haut de page.
 */

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

const FEATURED_COLLECTIONS = [
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
] as const;

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
} as const;

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

const ENGAGEMENTS = [
  { title: 'Curated avec soin', body: 'Chaque pièce est choisie pour sa durabilité, son design et la justesse de sa fabrication.' },
  { title: 'Made in Europe', body: 'Nous travaillons en priorité avec des ateliers et marques européennes, traçables et engagés.' },
  { title: 'Livraison responsable', body: 'Emballages recyclables, transporteurs neutres en carbone, retours offerts sous 30 jours.' },
] as const;

const STATS = [
  { value: 120, prefix: '+', suffix: ' marques', label: 'curated en Europe', duration: 1.6 },
  { value: 30, prefix: '', suffix: ' jours', label: 'pour changer d’avis', duration: 1.4 },
  { value: 98, prefix: '', suffix: '%', label: 'production responsable', duration: 1.5 },
] as const;

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <ScrollProgress />

      <main id="main" className="bg-white text-ink-900">
        {/* ─────────── HERO ─────────── */}
        <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink-50">
          <MotionMeshGradient className="-z-10" duration={18} opacity={0.85} />
          <MotionSpotlight className="-z-10" size={700} maxOpacity={0.22} color="192, 74, 42" />
          <HeroFloatingOrbs />

          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-28">
            <MotionFade className="lg:col-span-6 lg:flex lg:flex-col lg:justify-center" duration={0.7} y={28} withScale>
              <MotionFade delay={0.05} y={12} duration={0.6}>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-50/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent-700 ring-1 ring-accent-200 backdrop-blur-sm">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-700" aria-hidden="true" />
                  Nouvelle collection
                </p>
              </MotionFade>

              <MotionTextLines
                as="h1"
                lines={['Des objets pensés', 'pour durer.']}
                className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
                stagger={0.09}
                delay={0.15}
              />

              <MotionFade delay={0.45} y={16} duration={0.7}>
                <p className="mt-6 max-w-xl text-base text-ink-700 sm:text-lg">
                  Maison 14 sélectionne des pièces design, durables et accessibles,
                  imaginées en Europe pour embellir votre quotidien.
                </p>
              </MotionFade>

              <MotionFade delay={0.55} y={16} duration={0.6}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <MotionMagnetic strength={10}>
                    <Link
                      href="/collections"
                      data-testid="hero-cta"
                      className={buttonVariants({ variant: 'primary', size: 'lg' })}
                    >
                      Découvrir la collection
                    </Link>
                  </MotionMagnetic>
                  <MotionMagnetic strength={6}>
                    <Link href="/about" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
                      Notre histoire
                    </Link>
                  </MotionMagnetic>
                </div>
              </MotionFade>

              <MotionFade delay={0.7} y={16} duration={0.7}>
                <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink-200/70 pt-6 text-sm text-ink-600">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="font-medium text-ink-900">
                        <MotionCountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={stat.duration} />
                      </dt>
                      <dd>{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </MotionFade>
            </MotionFade>

            <MotionParallax strength={24} className="relative lg:col-span-6">
              <MotionFade delay={0.2} duration={0.9} y={32} withScale>
                <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ink-100 shadow-[0_32px_80px_-24px_rgba(24,24,27,0.35)] ring-1 ring-ink-200/50 sm:aspect-[5/4] lg:aspect-[4/5]">
                  <Image
                    src="/images/hero.webp"
                    alt="Intérieur lumineux : vase en céramique, plaid en lin et livres d’art posés sur une console en chêne"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink-900/10 via-transparent to-transparent" />
                </div>
              </MotionFade>

              <MotionFade delay={0.6} y={12} duration={0.6}>
                <Badge variant="accent" className="absolute -bottom-4 left-4 hidden shadow-lg sm:inline-flex">
                  Livraison offerte dès 80 €
                </Badge>
              </MotionFade>
            </MotionParallax>
          </div>
        </section>{/* ─────────── COLLECTIONS VEDETTES ─────────── */}
        <section
          aria-labelledby="collections-title"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
          data-testid="featured-collections"
        >
          <MotionFade>
            <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Univers</p>
                <MotionTextLines
                  as="h2"
                  lines={['Collections vedettes']}
                  className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl"
                  stagger={0.06}
                />
              </div>
              <Link
                href="/collections"
                className="group inline-flex items-center gap-1 text-sm font-medium text-accent-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
              >
                Voir toutes les collections
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </header>
          </MotionFade>

          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_COLLECTIONS.map((collection, idx) => (
              <MotionFade key={collection.slug} delay={idx * 0.1} y={20}>
                <Card className="group relative h-full overflow-hidden border-ink-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-ink-300 hover:shadow-[0_32px_64px_-24px_rgba(24,24,27,0.20)]">
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
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-display text-2xl transition-colors group-hover:text-accent-700">
                        {collection.title}
                      </CardTitle>
                      <CardDescription className="text-ink-600">{collection.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto text-sm font-medium text-accent-700">
                      <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
                        Découvrir <span aria-hidden="true">→</span>
                      </span>
                    </CardFooter>
                  </Link>
                </Card>
              </MotionFade>
            ))}
          </ul>
        </section>

        {/* ─────────── PRODUITS VEDETTES ─────────── */}
        <section
          aria-labelledby="products-title"
          className="relative overflow-hidden bg-ink-50 py-16 sm:py-20 lg:py-24"
          data-testid="featured-products"
        >
          <MotionMeshGradient
            className="-z-0"
            duration={22}
            opacity={0.35}
            colors={['#C04A2A', '#FAE5DC', '#18181B', '#FAFAFA']}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade>
              <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Sélection</p>
                  <MotionTextLines
                    as="h2"
                    lines={['Nos coups de cœur']}
                    className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl"
                    stagger={0.06}
                  />
                </div>
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-accent-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                >
                  Voir tous les produits
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </header>
            </MotionFade>

            <FeaturedProductsGrid items={FEATURED_PRODUCTS} priorityFirst />
          </div>
        </section>

        {/* ─────────── ENGAGEMENTS ─────────── */}
        <section
          aria-labelledby="engagements-title"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <MotionFade>
            <header className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Nos engagements</p>
              <MotionTextLines
                as="h2"
                lines={['Une sélection', 'qui a du sens']}
                className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl"
                stagger={0.08}
              />
            </header>
          </MotionFade>

          <ul role="list" className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ENGAGEMENTS.map((item, idx) => (
              <MotionFade key={item.title} delay={idx * 0.1} y={20} withScale>
                <li className="group relative h-full overflow-hidden rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent-300 hover:shadow-[0_24px_48px_-20px_rgba(192,74,42,0.25)]">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-2xl text-accent-700 ring-1 ring-accent-200 transition-all duration-500 group-hover:scale-110 group-hover:bg-accent-700 group-hover:text-white group-hover:ring-accent-700">
                    ✦
                  </div>
                  <h3 className="font-display text-xl font-medium text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.body}</p>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-accent-100 opacity-0 transition-all duration-700 group-hover:-bottom-8 group-hover:-right-8 group-hover:opacity-60"
                  />
                </li>
              </MotionFade>
            ))}
          </ul>
        </section>

        {/* ─────────── INSPIRATION ─────────── */}
        <InspirationGrid />

        {/* ─────────── NEWSLETTER ─────────── */}
        <NewsletterCTA />
      </main>

      {/* ─────────── FOOTER ─────────── */}
      <footer role="contentinfo" className="border-t border-ink-200 bg-white text-ink-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-lg font-medium text-ink-900">Maison 14</p>
              <p className="mt-2 max-w-xs text-sm text-ink-600">
                Objets design, durables et accessibles, imaginés en Europe.
              </p>
            </div>
            <nav aria-label="Légal et informations">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">Informations</h2>
              <ul role="list" className="mt-4 space-y-2 text-sm">
                <li><Link href="/legal/cgu" className="transition-colors hover:text-accent-700">CGU</Link></li>
                <li><Link href="/legal/cgv" className="transition-colors hover:text-accent-700">CGV</Link></li>
                <li><Link href="/legal/mentions" className="transition-colors hover:text-accent-700">Mentions légales</Link></li>
                <li><Link href="/legal/privacy" className="transition-colors hover:text-accent-700">Politique de confidentialité</Link></li>
                <li><Link href="/contact" className="transition-colors hover:text-accent-700">Contact</Link></li>
                <li><Link href="/about" className="transition-colors hover:text-accent-700">À propos</Link></li>
              </ul>
            </nav>
            <nav aria-label="Conformité">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">Conformité</h2>
              <ul role="list" className="mt-4 space-y-2 text-sm">
                <li><Link href="/legal/cookies" aria-label="Gérer les cookies" className="transition-colors hover:text-accent-700">Gestion des cookies (RGPD)</Link></li>
                <li><Link href="/legal/rgpd" className="transition-colors hover:text-accent-700">Vos données (RGPD)</Link></li>
              </ul>
            </nav>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">Langue</h2>
              <ul role="list" className="mt-4 flex gap-3 text-sm">
                <li>
                  <Link href="/" hrefLang="fr" aria-current="true" aria-label="Français" className="rounded-full border border-ink-900 bg-ink-900 px-3 py-1 font-medium text-white">
                    FR
                  </Link>
                </li>
                <li>
                  <Link href="/en" hrefLang="en" aria-label="English" className="rounded-full border border-ink-300 px-3 py-1 font-medium text-ink-900 transition-colors hover:border-accent-700 hover:text-accent-700">
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