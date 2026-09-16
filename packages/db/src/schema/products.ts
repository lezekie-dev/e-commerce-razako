/**
 * products — entité catalogue racine.
 *
 * - `slug` UNIQUE pour les URLs storefront canoniques (/p/[slug]).
 * - `status` contrôle la visibilité storefront (cf. SPEC §4 — pas de soft delete
 *   global ; l'archive est un statut).
 * - `defaultCategoryId` est la catégorie principale (affichée en breadcrumb,
 *   utilisée pour la navigation) ; les catégories secondaires passent par la
 *   table de jointure (non incluse dans le schéma initial, ajoutée Phase 2).
 * - `metadata jsonb` : champs flexibles (SEO avancé, tags, cadeaux, etc.).
 * - Full-text search : colonne GENERATED tsvector + GIN (cf. SPEC §4.3) — la
 *   migration initiale ajoutera la colonne ; ici on pose juste la base.
 *
 * OnDelete defaultCategoryId → 'set null' : on ne supprime pas un produit si
 * on supprime une catégorie (un admin peut vouloir le faire).
 */

import { sql } from 'drizzle-orm'
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { categories } from './categories.js'
import { productStatus } from './enums.js'

/** Type metadata libre pour un produit (tags, flags, etc.). */
export type ProductMetadata = {
  /** Tags libres (recherche interne). */
  tags?: string[]
  /** Drapeaux saisonniers / promotionnels. */
  flags?: Record<string, boolean>
  /** Champs SEO additionnels (og:title, etc.). */
  seo?: Record<string, string>
  /** Données non structurées (libre, max 16 KB contrôlés côté API). */
  [key: string]: unknown
}

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    /** Slug URL-safe UNIQUE. */
    slug: varchar('slug', { length: 255 }).notNull().unique(),

    /** Titre affiché (FR ; internationalisation Phase 2 via table dédiée). */
    title: varchar('title', { length: 255 }).notNull(),

    /** Description longue (Markdown autorisé). */
    description: text('description'),

    /** Marque (libre, non normalisée v1 — peut devenir FK en Phase 2). */
    brand: varchar('brand', { length: 128 }),

    /** Visibilité storefront. */
    status: productStatus('status').notNull().default('draft'),

    /**
     * Catégorie principale. SET NULL sur suppression de catégorie
     * (on n'efface pas le produit ; un admin le rattachera).
     */
    defaultCategoryId: uuid('default_category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),

    /** Métadonnées libres (cf. D-12 — non filtrables, non requêtables). */
    metadata: jsonb('metadata').$type<ProductMetadata>(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Filtre storefront principal : produits actifs récents. */
    statusCreatedIdx: index('products_status_created_at_idx').on(
      table.status,
      table.createdAt.desc(),
    ),
    /** Filtre par catégorie principale. */
    defaultCategoryIdx: index('products_default_category_idx').on(table.defaultCategoryId),
    /** Lookup par slug — UNIQUE déjà appliqué via .unique(). */
    slugUniqueIdx: uniqueIndex('products_slug_unique').on(table.slug),
    /** Filtre par marque. */
    brandIdx: index('products_brand_idx').on(table.brand),
  }),
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert