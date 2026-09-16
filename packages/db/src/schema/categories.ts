/**
 * categories — taxonomie produit (arbre N-niveaux).
 *
 * Self-référencée via `parentId`. `slug` UNIQUE globalement pour permettre les
 * URLs canoniques /c/[slug] sans collision. `position` contrôle l'affichage
 * dans le menu (ordre stable).
 *
 * Note : `depth` est dénormalisé (calculé via trigger ou migration one-shot) pour
 * éviter les boucles et accélérer les requêtes d'arbre. Nullable : nullable
 * pour les racines.
 */

import { sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

    /** NULL = racine. SET NULL pour ne pas perdre une catégorie si son parent est supprimé. */
    parentId: uuid('parent_id').references((): AnyPgColumn => categories.id,
      { onDelete: 'set null' },
    ),

    /** Slug URL-safe, UNIQUE. Source : titre slugifié, validé côté API. */
    slug: varchar('slug', { length: 255 }).notNull().unique(),

    /** Nom affiché. */
    name: varchar('name', { length: 255 }).notNull(),

    /** Description courte (SEO + menu). */
    description: text('description'),

    /** Ordre d'affichage au sein du même parent. */
    position: integer('position').notNull().default(0),

    /** Profondeur dans l'arbre (0 = racine). Dénormalisé pour perf. */
    depth: integer('depth').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    parentIdx: index('categories_parent_id_idx').on(table.parentId),
    /** Filtre liste menu par parent. */
    parentPositionIdx: index('categories_parent_position_idx').on(
      table.parentId,
      table.position,
    ),
    /** Slug déjà UNIQUE via .unique() ; redondance défensive. */
    slugIdx: uniqueIndex('categories_slug_unique').on(table.slug),
  }),
)

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert