/**
 * order_items — lignes de commande.
 *
 * - Prix snapshotés (`unitPriceCents`, `lineTotalCents`) pour intégrité
 *   comptable (obligation légale 10 ans en FR).
 * - Snapshots de `productTitle`, `variantTitle`, `sku` pour pouvoir afficher
 *   /éditer la facture même si le produit est archivé ensuite.
 * - OnDelete orderId → 'cascade' : supprimer une commande ⇒ supprime ses items.
 * - OnDelete variantId → 'restrict' : on ne supprime JAMAIS une variante
 *   référencée par une commande.
 */

import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { orders } from './orders.js'
import { variants } from './variants.js'

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    variantId: uuid('variant_id')
      .notNull()
      .references(() => variants.id, { onDelete: 'restrict' }),

    /** Quantité figée à la commande. */
    qty: integer('qty').notNull(),

    /** Prix unitaire figé en cents. JAMAIS de float. */
    unitPriceCents: integer('unit_price_cents').notNull(),

    /** Total ligne figé = unitPriceCents * qty. JAMAIS de float. */
    lineTotalCents: integer('line_total_cents').notNull(),

    /** Devise snapshot. */
    currency: varchar('currency', { length: 3 }).notNull().default('EUR'),

    /** Snapshots pour facture/archive (ne dépend pas des variantes actuelles). */
    productTitle: varchar('product_title', { length: 255 }).notNull(),
    variantTitle: varchar('variant_title', { length: 255 }).notNull(),
    sku: varchar('sku', { length: 64 }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Items d'une commande. */
    orderIdx: index('order_items_order_id_idx').on(table.orderId),
    /** CA par variante / reporting. */
    variantIdx: index('order_items_variant_id_idx').on(table.variantId),
    /** Filtre "commandes contenant ce SKU" (back-office). */
    skuIdx: index('order_items_sku_idx').on(table.sku),
  }),
)

export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert