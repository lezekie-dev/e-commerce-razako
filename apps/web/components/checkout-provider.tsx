'use client';

import * as React from 'react';
import { PromoCodeResult } from './promo-code-input';

/**
 * CheckoutProvider — Context partage entre les etapes du tunnel.
 *
 * State :
 * - shippingId  : mode de livraison choisi (defaut 'standard')
 * - promo       : code promo applique (null si aucun)
 * - giftWrap    : emballage cadeau (defaut false)
 * - reset       : remet a zero (utile apres paiement reussi)
 *
 * Pas de persistence localStorage : la selection vit le temps du tunnel,
 * on reset quand l'utilisateur quitte /checkout.
 */

export interface CheckoutContextValue {
  shippingId: string;
  setShippingId: (id: string) => void;
  promo: PromoCodeResult | null;
  setPromo: (p: PromoCodeResult | null) => void;
  giftWrap: boolean;
  setGiftWrap: (g: boolean) => void;
  reset: () => void;
}

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

export const DEFAULT_SHIPPING_ID = 'standard';

export function CheckoutProvider({
  children,
  initialShippingId = DEFAULT_SHIPPING_ID,
}: {
  children: React.ReactNode;
  initialShippingId?: string;
}): React.ReactElement {
  const [shippingId, setShippingId] = React.useState<string>(initialShippingId);
  const [promo, setPromo] = React.useState<PromoCodeResult | null>(null);
  const [giftWrap, setGiftWrap] = React.useState<boolean>(false);

  const reset = React.useCallback(() => {
    setShippingId(DEFAULT_SHIPPING_ID);
    setPromo(null);
    setGiftWrap(false);
  }, []);

  const value = React.useMemo<CheckoutContextValue>(
    () => ({ shippingId, setShippingId, promo, setPromo, giftWrap, setGiftWrap, reset }),
    [shippingId, promo, giftWrap, reset],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
  const ctx = React.useContext(CheckoutContext);
  if (!ctx) {
    throw new Error('useCheckout doit etre utilise dans un <CheckoutProvider>');
  }
  return ctx;
}
