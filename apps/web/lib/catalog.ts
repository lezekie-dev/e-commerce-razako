import { PRODUCTS_PART_1 } from './products-part1';
import { PRODUCTS_PART_2 } from './products-part2';
import { PRODUCTS_PART_3 } from './products-part3';
import type { Product } from './products';

/**
 * Catalogue agrégé — surface publique.
 *
 * Tous les consumers (catalogue, PDP, search) passent par là.
 * Helpers prêts : `byCategory`, `byCollection`, `findBySlug`, `related`.
 */
export const PRODUCTS: ReadonlyArray<Product> = [
  ...PRODUCTS_PART_1,
  ...PRODUCTS_PART_2,
  ...PRODUCTS_PART_3,
];

export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function findProductsByCategory(category: string): ReadonlyArray<Product> {
  return PRODUCTS.filter((p) => p.category === category);
}

/** "Vous aimerez aussi" : même catégorie, exclude self, jusqu'à 4. */
export function relatedProducts(slug: string, max = 4): ReadonlyArray<Product> {
  const current = findProductBySlug(slug);
  if (!current) return [];
  return PRODUCTS.filter((p) => p.slug !== slug && p.category === current.category).slice(0, max);
}

/** Inserts featured "coups de cœur" pour la home (curation éditoriale). */
export const FEATURED_HERO_SLUGS = [
  'lampadaire-tala-led',
  'vase-terracotta-lorca',
  'bouilloire-en-fonte-segura',
  'carafe-emaillee-vega',
  'plaid-laine-brumaire',
  'set-de-table-lin-xeres',
] as const;

export function findFeaturedProducts(): ReadonlyArray<Product> {
  const set = new Set<string>(FEATURED_HERO_SLUGS);
  return PRODUCTS.filter((p) => set.has(p.slug));
}
