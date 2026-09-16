'use client';

/**
 * <CartHydrator> — déclenche la réhydratation du store Zustand.
 *
 * Sans ce client component, le panier du localStorage n'est lu qu'au
 * premier accès au store, ce qui cause un décalage entre SSR et client.
 * On force la lecture au mount côté client.
 */

import * as React from 'react';
import { useCartStore } from '../lib/cart-store';

export function CartHydrator(): null {
  React.useEffect(() => {
    // persist rehydrate localement déjà ; on lit l'état pour s'assurer que
    // les sélecteurs s'abonnent avec la bonne version.
    useCartStore.persist?.rehydrate?.();
  }, []);
  return null;
}
