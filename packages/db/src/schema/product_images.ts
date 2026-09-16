/**
 * product_images — galerie d'images par produit.
 *
 * URL R2 (cf. SPEC §9 — pas de bytes via l'API). `position` ordonne l'affichage
 * (0 = image principale, celle des cards/cart). `alt` obligatoire pour a11y
 * WCAG AA (cf. qa/ACCEPTANCE_HOME.md) — on n'autorise pas la publication d'un
 * produit sans alt sur l'image 0.
 *
 * OnDelete productId → 'cascade' : la galerie suit le produit.
 */

import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { products } from './products.js'

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),

    /** URL publique R2 (CDN Cloudflare). Pas d'URL signée v1. */
    url: text('url').notNull(),

    /** Alt text — obligatoire, max 255 chars, validé côté API. */
    alt: varchar('alt', { length: 255 }).notNull(),

    /** Position d'affichage (0 = image principale). */
    position: integer('position').notNull().default(0),

    /** Légende affichée sous l'image (optionnel). */
    caption: varchar('caption', { length: 255 }),

    /** Image principale ? (raccourci pour ne pas recalculer position=0 partout). */
    isPrimary: boolean('is_primary').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    /** Galerie ordonnée : (product_id, position). */
    productPositionIdx: index('product_images_product_position_idx').on(
      table.productId,
      table.position,
    ),
    /** Filtre rapide image principale par produit. */
    productPrimaryIdx: index('product_images_product_primary_idx').on(
      table.productId,
      table.isPrimary,
    ),
  }),
)

export type ProductImage = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert
