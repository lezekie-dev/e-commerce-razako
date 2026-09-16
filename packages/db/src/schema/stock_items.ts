/**
 * stock_items — stock par variante (1 ligne par variante, PK = variantId).
 *
 * Modèle "disponible vs réservé" pour découpler la promesse commerciale du
 * paiement effectif :
 * - `onHand`     : quantité physiquement en stock.
 * - `reserved`   : quantité engagée par des paniers non expirés (TTL Redis 24h).
 * - `available`  = onHand - reserved (vue calculée, pas stockée).
 *
 * Décrémentation de `reserved` au webhook Stripe `payment_intent.succeeded`,
 * puis décrémentation de `onHand` à l'expédition (SPEC §5).
 *
 * OnDelete variantId → 'cascade' : la vie d'un item de stock suit la variante.
 */

import { sql } from 'drizzle-orm'
import { check, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { variants } from './variants.js'

export const stockItems = pgTable(
  'stock_items',
  {
    /** PK = variantId (relation 1-1 avec variants). */
    variantId: uuid('variant_id')
      .primaryKey()
      .references(() => variants.id, { onDelete: 'cascade' }),

    /** Quantité physiquement disponible (incluant réservée). */
    onHand: integer('on_hand').notNull().default(0),

    /** Quantité engagée par paniers/checkouts en cours. */
    reserved: integer('reserved').notNull().default(0),

    /**
     * Seuil bas — déclenche notification admin (Phase 2).
     * Nullable = pas d'alerte configurée.
     */
    lowStockThreshold: integer('low_stock_threshold'),

    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    // Pas de createdAt : PK = FK, la ligne est créée avec la variante.
  },
  (table) => ({
    /** Invariant : reserved <= onHand (sinon survente). */
    reservedLteOnHand: check(
      'stock_items_reserved_lte_on_hand',
      sql`${table.reserved} <= ${table.onHand}`,
    ),
    /** Invariant : valeurs non négatives. */
    nonNegative: check(
      'stock_items_non_negative',
      sql`${table.onHand} >= 0 AND ${table.reserved} >= 0`,
    ),
  }),
)

export type StockItem = typeof stockItems.$inferSelect
export type NewStockItem = typeof stockItems.$inferInsert
