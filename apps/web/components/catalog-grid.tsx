'use client';

import * as React from 'react';
import Link from 'next/link';
import { ProductCard, MotionStagger, MotionStaggerItem, type ProductCardData } from '@ecommerce/ui';
import { useAddToCart } from '../lib/use-add-to-cart';
import { PRODUCTS, CATEGORIES, type Product } from '../lib/products';

/**
 * CatalogGrid — Client Component pour /products et /collections/[slug].
 *
 * - Liste tous les produits du catalog.
 * - Filtres : categorie (pre-appliquee si initialCategory est fourni), prix range.
 * - Tri : nouveautes (defaut), prix asc/desc, popularite.
 * - Pagination client-side (12 par page).
 * - Vide : empty state avec reset filtres.
 */

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'rating';
type CategoryFilter = string | 'all';

const PAGE_SIZE = 12;

interface Filters {
  category: CategoryFilter;
  minPrice: number;
  maxPrice: number;
}

const DEFAULT_FILTERS: Filters = {
  category: 'all',
  minPrice: 0,
  maxPrice: 25000,
};

interface CatalogGridProps {
  /** Categorie pre-appliquee (pour /collections/[slug]). */
  initialCategory?: string;
}

function priceCents(p: Product): number {
  return p.priceCents;
}

function applyFilters(items: ReadonlyArray<Product>, f: Filters): Product[] {
  return items.filter((p) => {
    if (f.category !== 'all' && p.category !== f.category) return false;
    if (priceCents(p) < f.minPrice) return false;
    if (priceCents(p) > f.maxPrice) return false;
    return true;
  });
}

function applySort(items: ReadonlyArray<Product>, sort: SortKey): Product[] {
  const arr = [...items];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => priceCents(a) - priceCents(b));
    case 'price-desc':
      return arr.sort((a, b) => priceCents(b) - priceCents(a));
    case 'rating':
      return arr.sort((a, b) => b.variants.length - a.variants.length);
    case 'newest':
    default:
      return arr;
  }
}

function toCardData(p: Product): ProductCardData {
  return {
    slug: p.slug,
    name: p.name,
    image: p.image,
    alt: p.alt,
    amount: p.priceCents,
    compareAt: p.compareAtCents,
    badge: p.badge,
    category: p.category,
  };
}

export function CatalogGrid({ initialCategory }: CatalogGridProps = {}): React.ReactElement {
  const [filters, setFilters] = React.useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    category: initialCategory ?? 'all',
  }));
  const [sort, setSort] = React.useState<SortKey>('newest');
  const [page, setPage] = React.useState(1);
  const add = useAddToCart();

  const filtered = React.useMemo(() => applyFilters(PRODUCTS, filters), [filters]);
  const sorted = React.useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateCategory = (category: CategoryFilter) => {
    setFilters((f) => ({ ...f, category }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div data-testid="catalog-grid">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-500">Categorie</span>
          <button
            type="button"
            onClick={() => updateCategory('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filters.category === 'all'
                ? 'bg-accent-700 text-white'
                : 'border border-ink-300 bg-white text-ink-700 hover:border-accent-700 hover:text-accent-700'
            }`}
            aria-pressed={filters.category === 'all'}
          >
            Toutes
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.category === c
                  ? 'bg-accent-700 text-white'
                  : 'border border-ink-300 bg-white text-ink-700 hover:border-accent-700 hover:text-accent-700'
              }`}
              aria-pressed={filters.category === c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="catalog-sort" className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Trier
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              setPage(1);
            }}
            className="h-9 rounded-full border border-ink-300 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-600"
            data-testid="catalog-sort"
          >
            <option value="newest">Nouveautes</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix decroissant</option>
            <option value="rating">Popularite</option>
          </select>
        </div>
      </div>

      {/* Compteur */}
      <p className="mb-4 text-sm text-ink-600" data-testid="catalog-count">
        {sorted.length === 0
          ? 'Aucun produit ne correspond a vos criteres.'
          : `${sorted.length} produit${sorted.length > 1 ? 's' : ''} ${filters.category === 'all' ? '' : `en ${filters.category}`}`}
      </p>

      {/* Grille */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-12 text-center">
          <p className="font-display text-xl text-ink-900">Aucun resultat</p>
          <p className="mt-2 text-sm text-ink-600">
            Essayez d&apos;elargir vos filtres pour voir plus de produits.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-sm font-medium text-accent-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : (
        <MotionStagger
          
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          data-testid="catalog-list"
        >
          {pageItems.map((product) => {
            const data = toCardData(product);
            return (
              <MotionStaggerItem key={product.slug}>
                <ProductCard
                  product={data}
                  onQuickAdd={() =>
                    add({
                      variantId: product.variants[0]?.id ?? product.slug,
                      productSlug: product.slug,
                      name: product.name,
                      image: product.image,
                      amount: product.priceCents,
                      compareAt: product.compareAtCents,
                      options: product.variants[0]?.options,
                      maxQuantity: product.variants[0]?.stock ?? 10,
                    })
                  }
                />
              </MotionStaggerItem>
            );
          })}
        </MotionStagger>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <nav
          aria-label="Pagination du catalogue"
          className="mt-10 flex items-center justify-center gap-2"
          data-testid="catalog-pagination"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-ink-300 bg-white px-3 py-1 text-sm font-medium text-ink-700 transition-colors hover:border-accent-700 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Precedent
          </button>
          <span className="px-3 text-sm text-ink-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full border border-ink-300 bg-white px-3 py-1 text-sm font-medium text-ink-700 transition-colors hover:border-accent-700 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Suivant
          </button>
        </nav>
      ) : null}

      {/* Lien vers le footer statique */}
      <div className="mt-12 text-center text-xs text-ink-500">
        <Link href="/collections" className="underline-offset-4 hover:underline">
          Voir aussi les collections vedettes
        </Link>
      </div>
    </div>
  );
}