/**
 * cart_items — lignes de panier.
 *
 * - `unitPriceCents` est **snapshoté** au moment de l'ajout : si le prix du SKU
 *   change après, le panier conserve son ancien prix (UX prévisible).
 * - Contrainte unique (cart_id, variant_id) : un SKU n'apparaît qu'une fois par
 *   panier ; update de quantité = UPDATE, pas INSERT.
 * - `reservedAt` : timestamp de réservation du stock. SET NULL = pas réservé
 *   (panier abandonné, post-checkout).
 * - OnDelete cartId → 'cascade' : panier vidé ⇒ items supprimés.
 * - OnDelete variantId → 'restrict' : on n'efface pas un SKU référencé.
 */

import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { carts } from './carts.js'
import { variants } from './variants.js'

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),

    variantId: uuid('variant_id')
      .notNull()
      .references(() => variants.id, { onDelete: 'restrict' }),

    /** Quantité commandée (>0). */
    qty: integer('qty').notNull(),

    /** Prix unitaire snapshoté en cents au moment de l'ajout. JAMAIS de float. */
    unitPriceCents: integer('unit_price_cents').notNull(),

    /** Devise snapshot (normalement identique à cart.currency). */
    currency: text('currency').notNull().default('EUR'),

    /** Timestamp de réservation côté stock. NULL = pas réservé. */
    reservedAt: timestamp('reserved_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Une seule ligne par (cart, variant). */
    cartVariantUnique: uniqueIndex('cart_items_cart_variant_unique').on(
      table.cartId,
      table.variantId,
    ),
    /** Lookup rapide : items d'un panier. */
    cartIdx: index('cart_items_cart_id_idx').on(table.cartId),
    /** Calcul "combien de paniers réservent ce SKU" (purge stock réservé orphelin). */
    variantReservedIdx: index('cart_items_variant_reserved_idx').on(
      table.variantId,
      table.reservedAt,
    ),
  }),
)

export type CartItem = typeof cartItems.$inferSelect
export type NewCartItem = typeof cartItems.$inferInsert