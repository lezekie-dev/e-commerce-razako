import type { Metadata } from 'next';
import { Breadcrumbs } from '../../components/breadcrumbs';
import { CatalogGrid } from '../../components/catalog-grid';

/**
 * Page /products — catalogue complet.
 *
 * Couvre :
 *  - AC-SEARCH-03 : tri / filtres (delegues au composant client CatalogGrid)
 *  - AC-SEARCH-04 : tri (nouveautes / prix asc / prix desc / popularite)
 *  - AC-SEARCH-05 : pagination (24 produits donnes)
 *  - AC-NFR-03 : responsive mobile-first
 *
 * Server Component. La grille interactive est un Client Component
 * (CatalogueGrid) qui consomme `findProductsByCategory` + helpers du catalog.
 */

export const metadata: Metadata = {
  title: 'Catalogue',
  description: 'Tous nos objets design, durables et accessibles, selectionnes par Maison 14.',
  alternates: { canonical: '/products' },
};

export default function ProductsPage() {
  return (
    <main id="main" className="bg-white text-ink-900">
      <section
        aria-labelledby="catalogue-heading"
        className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12"
      >
        <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Catalogue' }]} />

        <header className="mt-6 mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Selection</p>
          <h1
            id="catalogue-heading"
            className="mt-2 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink-900 sm:text-5xl"
          >
            Le catalogue
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-700 sm:text-lg">
            {`Explorez l'integralite de notre selection. Filtrez par categorie, couleur ou prix, et triez selon vos envies.`}
          </p>
        </header>

        <CatalogGrid />
      </section>
    </main>
  );
}