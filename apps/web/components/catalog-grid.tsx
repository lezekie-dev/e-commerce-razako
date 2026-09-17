'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import {
  ProductCard,
  MotionStagger,
  MotionStaggerItem,
  type ProductCardData,
} from '@ecommerce/ui';
import { useAddToCart } from '../lib/use-add-to-cart';
import { PRODUCTS, CATEGORIES, type Product } from '../lib/products';

/**
 * CatalogGrid V2 — Client Component pour /products et /collections/[slug].
 *
 * - Filtres : categorie (pre-appliquee si initialCategory), prix range.
 * - Tri : nouveautes (defaut), prix asc/desc, popularite.
 * - Pagination client-side (12 par page).
 * - Empty state avec reset filtres.
 * - Filtres pill avec sliding indicator (layoutId="filter-pill-bg").
 * - AnimatePresence sur la grille : layout animation fluide quand le
 *   filtre change (les cartes se réorganisent en spring).
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

const ALL_FILTERS: ReadonlyArray<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: 'Toutes' },
  ...CATEGORIES.map((c) => ({ key: c, label: c })),
];

export function CatalogGrid({ initialCategory }: CatalogGridProps = {}): React.ReactElement {
  const reduced = useReducedMotion();
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
      <motion.div
        layout
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Catégorie
          </span>
          <div className="relative flex flex-wrap items-center gap-1 rounded-full bg-white p-1 ring-1 ring-ink-200">
            {ALL_FILTERS.map((f) => {
              const active = filters.category === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => updateCategory(f.key)}
                  className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active ? 'text-white' : 'text-ink-700 hover:text-ink-900'
                  }`}
                  aria-pressed={active}
                  data-testid={`filter-${f.key}`}
                >
                  {active ? (
                    <motion.span
                      layoutId="filter-pill-bg"
                      className="absolute inset-0 rounded-full bg-accent-700 shadow-sm"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 30 }
                      }
                    />
                  ) : null}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="catalog-sort"
            className="text-xs font-medium uppercase tracking-wide text-ink-500"
          >
            Trier
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              setPage(1);
            }}
            className="h-9 rounded-full border border-ink-300 bg-white px-3 text-sm text-ink-900 transition-colors focus:border-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-600"
            data-testid="catalog-sort"
          >
            <option value="newest">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Popularité</option>
          </select>
        </div>
      </motion.div>

      {/* Compteur */}
      <motion.p
        layout
        className="mb-4 text-sm text-ink-600"
        data-testid="catalog-count"
        key={`count-${filters.category}-${sort}-${currentPage}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {sorted.length === 0
          ? 'Aucun produit ne correspond à vos critères.'
          : `${sorted.length} produit${sorted.length > 1 ? 's' : ''} ${
              filters.category === 'all' ? '' : `en ${filters.category}`
            }`}
      </motion.p>

      {/* Grille avec AnimatePresence + layout */}
      <AnimatePresence mode="wait" initial={false}>
        {sorted.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-ink-200">
              <Search className="h-6 w-6 text-ink-500" aria-hidden="true" />
            </div>
            <p className="font-display text-xl text-ink-900">Aucun résultat</p>
            <p className="mt-2 text-sm text-ink-600">
              Essayez d&apos;élargir vos filtres pour voir plus de produits.
            </p>
            <motion.button
              type="button"
              onClick={resetFilters}
              whileHover={reduced ? undefined : { scale: 1.02 }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Réinitialiser les filtres
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${filters.category}-${sort}-${currentPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <MotionStagger
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              data-testid="catalog-list"
              stagger={0.05}
            >
              {pageItems.map((product) => {
                const data = toCardData(product);
                return (
                  <MotionStaggerItem key={product.slug} layout>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 ? (
        <motion.nav
          layout
          aria-label="Pagination du catalogue"
          className="mt-10 flex items-center justify-center gap-2"
          data-testid="catalog-pagination"
        >
          <motion.button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.96 }}
            className="rounded-full border border-ink-300 bg-white px-4 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-accent-700 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Précédent
          </motion.button>
          <span className="px-3 text-sm tabular-nums text-ink-600">
            Page <strong className="text-ink-900">{currentPage}</strong> /{' '}
            <strong className="text-ink-900">{totalPages}</strong>
          </span>
          <motion.button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.96 }}
            className="rounded-full border border-ink-300 bg-white px-4 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-accent-700 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
          >
            Suivant
          </motion.button>
        </motion.nav>
      ) : null}

      {/* Footer link */}
      <div className="mt-12 text-center text-xs text-ink-500">
        <Link href="/collections" className="underline-offset-4 hover:underline">
          Voir aussi les collections vedettes
        </Link>
      </div>
    </div>
  );
}