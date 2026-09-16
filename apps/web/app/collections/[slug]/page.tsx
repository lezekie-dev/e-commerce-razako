import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '../../../components/breadcrumbs';
import { CatalogGrid } from '../../../components/catalog-grid';
import { COLLECTIONS } from '../../../lib/products';

/**
 * Page /collections/[slug] — collection filtree.
 *
 * Reutilise le composant CatalogGrid en passant le filtre de categorie.
 * La categorie est derivee du slug collection (mapping : collection slug
 * -> categorie de produit).
 */

const COLLECTION_TO_CATEGORY: Record<string, string> = {
  maison: 'Art de vivre',
  table: 'Arts de la table',
  cadeaux: 'Art de vivre', // fallback
};

export function generateStaticParams(): Array<{ slug: string }> {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const collection = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!collection) return { title: 'Collection introuvable' };
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!collection) {
    notFound();
  }
  const category = COLLECTION_TO_CATEGORY[params.slug] ?? collection.title;

  return (
    <main id="main" className="bg-white text-ink-900">
      <section
        aria-labelledby="collection-title"
        className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12"
      >
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: collection.title },
          ]}
        />

        <header className="mt-6 mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Collection</p>
          <h1
            id="collection-title"
            className="mt-2 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink-900 sm:text-5xl"
          >
            {collection.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-700 sm:text-lg">
            {collection.description}
          </p>
        </header>

        {/* Filtre par categorie via une prop searchParams sera M3.
            Pour M2, on passe la categorie en dur dans le composant. */}
        <CatalogGrid initialCategory={category} />
      </section>
    </main>
  );
}