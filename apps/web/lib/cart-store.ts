'use client';

/**
 * Cart store — Zustand + persist (localStorage)
 *
 * Pourquoi zustand + persist et non API serveur dès maintenant :
 * - Phase M2 : panier mocké client-side, le serveur sera branché Phase M3
 *   (Stripe Checkout) en migrant ce store vers une API + merging token
 *   anonyme côté serveur.
 * - Persist dans localStorage pour conserver le panier entre refreshs.
 * - Sérialisation safe (priceCents en number — pas de Decimal).
 *
 * API publique :
 *   useCartStore()                                  // hook complet
 *   useCartCount()                                  // sélecteur items.length
 *   useCartSubtotalCents()                          // sélecteur subtotal
 *   useCart()                                       // alias pratique
 *
 * Selectors stables : on utilise des hooks dédiés pour éviter re-renders
 * inutiles (granular subscriptions Zustand).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Identifiant variant. */
  variantId: string;
  /** Slug produit (affichage + lien PDP). */
  productSlug: string;
  /** Nom produit. */
  name: string;
  /** URL image miniature (120×120). */
  image: string;
  /** Prix unitaire au moment de l'ajout (snapshot — fige le prix en panier). */
  unitPriceCents: number;
  /** Prix barré (pour cartes promo). */
  compareAtCents?: number;
  /** Devise ISO 4217. */
  currency: string;
  /** Options affichées (taille, couleur…). */
  options?: Array<{ label: string; value: string }>;
  /** Quantité. */
  quantity: number;
  /** Stock maximum réservé (limite qty côté UI). */
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  /** Token anonyme (cookie HttpOnly côté serveur, ici juste pour partage entre onglets). */
  anonymousToken?: string;
  // Actions
  add: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  remove: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clear: () => void;
  /** Ferme le panier (pas de side-effect réseau pour l'instant). */
  hydrate: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const clampQty = (q: number, max?: number) =>
  Math.max(1, Math.trunc(Number.isFinite(q) ? q : 1)) >= 1 ? Math.max(1, Math.min(max ?? 99, Math.trunc(q))) : 1;

const hasStorage = typeof window !== 'undefined';

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      anonymousToken: undefined,

      add: (incoming) => {
        const qty = clampQty(incoming.quantity ?? 1, incoming.maxQuantity);
        set((state) => {
          const existing = state.items.find((i) => i.variantId === incoming.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === incoming.variantId
                  ? { ...i, quantity: clampQty(i.quantity + qty, incoming.maxQuantity ?? i.maxQuantity) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                variantId: incoming.variantId,
                productSlug: incoming.productSlug,
                name: incoming.name,
                image: incoming.image,
                unitPriceCents: incoming.unitPriceCents,
                compareAtCents: incoming.compareAtCents,
                currency: incoming.currency,
                options: incoming.options,
                quantity: qty,
                maxQuantity: incoming.maxQuantity,
              },
            ],
          };
        });
      },

      remove: (variantId) => {
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) }));
      },

      updateQty: (variantId, quantity) => {
        set((state) => {
          const q = clampQty(quantity, state.items.find((i) => i.variantId === variantId)?.maxQuantity);
          return {
            items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity: q } : i)),
          };
        });
      },

      clear: () => set({ items: [] }),

      hydrate: () => {
        // no-op côté store — `persist` gère la réhydratation. Hook conservé
        // pour un futur branchement serveur.
      },
    }),
    {
      name: 'maison14.cart.v1',
      version: 1,
      storage: hasStorage ? createJSONStorage(() => localStorage) : undefined,
      // On ne persist PAS le token anonyme — il sera émis côté serveur.
      partialize: (state) => ({ items: state.items }),
      // Migration format si le localStorage contient une version antérieure.
      migrate: (state) => state as CartState,
      skipHydration: !hasStorage,
    }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// Selectors stables (évitent les re-renders inutiles)
// ─────────────────────────────────────────────────────────────────────────────

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
}

export function useCartItems(): CartItem[] {
  return useCartStore((s) => s.items);
}

export function useCartSubtotalCents(): number {
  return useCartStore((s) => s.items.reduce((acc, i) => acc + i.unitPriceCents * i.quantity, 0));
}

export function useCartCountForVariant(variantId: string): number {
  return useCartStore((s) => s.items.find((i) => i.variantId === variantId)?.quantity ?? 0);
}

/** Lit le panier sans abonnement (pour les méthodes de transfert / messages). */
export const getCartSnapshot = () => useCartStore.getState();
export const getCartItemsSnapshot = () => useCartStore.getState().items;

/** Helper pour calculer le total à partir d'un snapshot. */
export function computeSubtotalCents(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.unitPriceCents * i.quantity, 0);
}

/** Helper shipping threshold — barème Phase 1 (mock). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 8000;
export const STANDARD_SHIPPING_CENTS = 590;

/** Sélecteur de ré-export pour Shallow (conservé pour hooks dérivés). */
export const cartShallow = shallow;
