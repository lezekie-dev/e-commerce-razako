'use client';

/**
 * useAddToCart — hook ergonomique pour ajouter au panier avec toast.
 *
 * - Centralise la logique d'ajout : on évite que chaque composant ouvre son
 *   propre toast via `useToast()`.
 * - L'option `silent` permet d'ajouter sans feedback (cas drag&drop futur,
 *   pre-hydratation, etc.).
 *
 * Usage :
 *   const add = useAddToCart();
 *   add(product);
 *   add(product, { silent: true });
 */

import * as React from 'react';
import { useToast } from '@ecommerce/ui';
import { useCartStore, type CartItem } from './cart-store';

export interface AddToCartProduct {
  variantId: string;
  productSlug: string;
  name: string;
  image: string;
  amount: number;
  compareAt?: number;
  currency?: string;
  options?: Array<{ label: string; value: string }>;
  maxQuantity?: number;
}

interface AddOptions {
  quantity?: number;
  silent?: boolean;
}

export function useAddToCart() {
  const { toast } = useToast();
  const add = useCartStore((s) => s.add);

  return React.useCallback(
    (product: AddToCartProduct, opts: AddOptions = {}) => {
      add({
        variantId: product.variantId,
        productSlug: product.productSlug,
        name: product.name,
        image: product.image,
        unitPriceCents: product.amount,
        compareAtCents: product.compareAt,
        currency: product.currency ?? 'EUR',
        options: product.options,
        maxQuantity: product.maxQuantity,
        quantity: opts.quantity ?? 1,
      });

      if (!opts.silent) {
        toast({
          variant: 'accent',
          title: 'Ajouté au panier',
          description: product.name,
          duration: 3200,
        });
      }

      return product.variantId;
    },
    [add, toast]
  );
}

/** Hook utilitaire pour les tests/SSR : permet d'injecter un panier initial. */
export const __setInitialCart = (items: CartItem[]) => {
  useCartStore.setState({ items });
};
