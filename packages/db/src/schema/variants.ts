/**
 * variants — unité de vente (SKU).
 *
 * Chaque produit a 1..N variantes (taille, couleur, contenance…). C'est la
 * variante qui porte le prix, le SKU et la courbe de stock — c'est ce que le
 * panier et la commande référencent.
 *
 * - `sku` UNIQUE globalement (impression / logistique / réconciliation).
 * - `priceCents` TOUJOURS en cents (int) — jamais de float.
 * - `currency` ISO 4217 (EUR par défaut pour le marché FR Phase 1).
 * - `weightGrams` : poids emballé en grammes (utile pour les calculs de
 *   livraison Phase 2 — Colissimo, Mondial Relay).
 * - `metadata jsonb` : storytelling maker (D-12 §4.4 — matériaux, entretien,
 *   anecdote, etc.). Non filtré.
 *
 * OnDelete productId → 'restrict' : on ne supprime JAMAIS un produit qui a
 * encore des variantes référencées (par des order_items ou stock_items) ; on
 * passe le produit en 'archived'.
 */

import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { products } from './products.js'

/** Type metadata storytelling/SEO — non filtré (D-12). */
export type VariantMetadata = {
  /** Histoire du maker (markdown léger, < 2 KB). */
  story?: string
  /** Matériaux (liste, ex: ["cuir pleine fleur", "laiton"]). */
  materials?: string[]
  /** Instructions d'entretien. */
  care?: string
  /** Anecdotes / making-of. */
  anecdote?: string
  /** Champs libres additionnels. */
  [key: string]: unknown
}

export const variants = pgTable(
  'variants',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),

    /** SKU interne, UNIQUE globalement. */
    sku: varchar('sku', { length: 64 }).notNull().unique(),

    /** Libellé affichable (ex: "Noir / M"). Dérivable des attributs typés. */
    title: varchar('title', { length: 255 }).notNull(),

    /** Prix de vente TTC en cents. JAMAIS de float. */
    priceCents: integer('price_cents').notNull(),

    /** Devise ISO 4217 (3 lettres). */
    currency: varchar('currency', { length: 3 }).notNull().default('EUR'),

    /** Poids emballé en grammes (utile calcul livraison Phase 2). */
    weightGrams: integer('weight_grams'),

    /** Position d'affichage parmi les variantes du produit. */
    position: integer('position').notNull().default(0),

    /** Désactivé manuellement (équivalent d'un "draft" sans supprimer la variante). */
    disabled: boolean('disabled').notNull().default(false),

    /** Storytelling / matériaux / entretien (cf. D-12 — JSONB non requêté). */
    metadata: jsonb('metadata').$type<VariantMetadata>(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Filtre : variantes d'un produit, dans l'ordre d'affichage. */
    productPositionIdx: index('variants_product_position_idx').on(
      table.productId,
      table.position,
    ),
    /** SKU déjà UNIQUE via .unique() ; redondance pour expliciter l'index. */
    skuUniqueIdx: uniqueIndex('variants_sku_unique').on(table.sku),
    /** Filtre storefront : variantes actives d'un produit. */
    productDisabledIdx: index('variants_product_disabled_idx').on(
      table.productId,
      table.disabled,
    ),
  }),
)

export type Variant = typeof variants.$inferSelect
export type NewVariant = typeof variants.$inferInsert