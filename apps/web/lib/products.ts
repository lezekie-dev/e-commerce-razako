/**
 * Catalogue fake — Phase M2.
 * Branche Phase M3 sur Drizzle (`packages/db`).
 * Prix en cents (jamais float). Alt obligatoire sur chaque image.
 *
 * Les produits sont dans `catalog.ts` pour éviter le coût tokens d'un seul
 * fichier de 15+ produits.
 */

export type ProductBadge = 'new' | 'promo' | 'last';

export interface ProductOption {
  label: string;
  value: string;
  swatch?: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceCents: number;
  compareAtCents?: number;
  options: ProductOption[];
  stock: number;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  currency: 'EUR';
  badge?: ProductBadge;
  image: string;
  alt: string;
  gallery: Array<{ url: string; alt: string }>;
  variants: ProductVariant[];
  materials: string[];
  care: string[];
  weightGrams: number;
  freeShippingEligible: boolean;
  story?: string;
}

export const CATEGORIES = ['Arts de la table', 'Art de vivre', 'Luminaire', 'Textile'] as const;
export type Category = (typeof CATEGORIES)[number];

export const COLLECTIONS = [
  { slug: 'cadeaux', title: 'Idées cadeaux', description: 'Sélection pensée pour chaque occasion.', image: '/images/collections/cadeaux.webp' },
  { slug: 'maison', title: 'Art de vivre', description: 'Des pièces durables pour embellir le quotidien.', image: '/images/collections/maison.webp' },
  { slug: 'table', title: 'Arts de la table', description: 'Céramique, verrerie et couverts pour recevoir.', image: '/images/collections/table.webp' },
] as const;

// Re-exports pour faciliter la consommation côté pages/components.
export { PRODUCTS, findProductBySlug, findProductsByCategory, relatedProducts, findFeaturedProducts } from './catalog';
