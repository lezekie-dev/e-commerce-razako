import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '../../components/breadcrumbs';
import { COLLECTIONS } from '../../lib/products';

/**
 * Page /collections — index des collections vedettes.
 *
 * Couvre :
 *  - AC-SEARCH-03 : navigation par collection (entree catalogue)
 *  - AC-HOME-05 : 3 collections vedettes
 *
 * Server Component. Aucun 'use client'.
 */

export const metadata: Metadata = {
  title: 'Collections',
  description: "Decouvrez nos collections d'objets design, durables et accessibles, soigneusement selectionnes par Maison 14.",
  alternates: { canonical: '/collections' },
};

export default function CollectionsPage() {
  return (
    <>
      <main id="main" className="bg-white text-ink-900">
        <section
          aria-labelledby="collections-heading"
          className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12"
        >
          <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Collections' }]} />

          <header className="mt-6 mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Univers</p>
            <h1
              id="collections-heading"
              className="mt-2 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink-900 sm:text-5xl"
            >
              Nos collections
            </h1>
            <p className="mt-4 max-w-2xl text-base text-ink-700 sm:text-lg">
              Trois univers complementaires pour composer un interieur qui vous ressemble, du quotidien aux grandes occasions.
            </p>
          </header>

          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  data-testid={`collection-card-${collection.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                >
                  <article className="overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-[0_24px_48px_-24px_rgba(24,24,27,0.18)]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
                      <Image
                        src={collection.image}
                        alt={`Visuel de la collection ${collection.title}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-6">
                      <h2 className="font-display text-2xl font-medium text-ink-900">
                        {collection.title}
                      </h2>
                      <p className="text-sm text-ink-600">{collection.description}</p>
                      <span className="mt-2 text-sm font-medium text-accent-700">
                        Decouvrir la collection →
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}