/**
 * Enums Postgres natifs (pgEnum) — source unique de vérité pour toutes les valeurs
 * contrôlées au niveau DB. Centralisés ici pour éviter la duplication et faciliter
 * les migrations ALTER TYPE.
 *
 * Convention : un pgEnum par "domaine fonctionnel".
 */

import { pgEnum } from 'drizzle-orm/pg-core'

// ─────────────────────────────────────────────────────────────────────────────
// Identité & rôles
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rôle utilisateur.
 * - 'customer' : compte acheteur (rôle par défaut).
 * - 'admin'    : back-office (RBAC via flag applicatif, pas via enum).
 */
export const userRole = pgEnum('user_role', ['customer', 'admin'])
export type UserRole = (typeof userRole.enumValues)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cycle de vie d'un produit.
 * - 'draft'    : en cours de préparation, non visible storefront.
 * - 'active'   : publié, achetable.
 * - 'archived' : retiré du storefront, conservé pour historique (commandes, reviews).
 */
export const productStatus = pgEnum('product_status', ['draft', 'active', 'archived'])
export type ProductStatus = (typeof productStatus.enumValues)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Commandes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * État d'une commande.
 * Cycle nominal : pending → paid → fulfilling → shipped → delivered.
 * Branches terminales : cancelled, refunded.
 */
export const orderStatus = pgEnum('order_status', [
  'pending',
  'paid',
  'fulfilling',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])
export type OrderStatus = (typeof orderStatus.enumValues)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Paiements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fournisseur de paiement. 'mock' utilisé en dev/tests (cf. SPEC §7).
 */
export const paymentProvider = pgEnum('payment_provider', ['stripe', 'mock'])
export type PaymentProvider = (typeof paymentProvider.enumValues)[number]

/**
 * Statut d'un paiement.
 * - 'pending'   : PaymentIntent créé, non confirmé.
 * - 'succeeded' : autorisé + capturé (ou prêt à capturer).
 * - 'failed'    : échec carte / 3DS / réseau.
 * - 'refunded'  : remboursé (total ou partiel, suivi via payment.refunds).
 */
export const paymentStatus = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
])
export type PaymentStatus = (typeof paymentStatus.enumValues)[number]