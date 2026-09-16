'use client';

/**
 * CartButton — bouton Panier du header avec badge réactif.
 * Le badge anime au changement de valeur (scale-pulse via Framer).
 */

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CartIcon } from './site-header-overlays';
import { useCartCount } from '../lib/cart-store';

interface CartButtonProps {
  open: boolean;
  onOpen: () => void;
}

export function CartButton({ open, onOpen }: CartButtonProps) {
  const reduced = useReducedMotion();
  const count = useCartCount();
  const prevCount = React.useRef(count);
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    if (count > prevCount.current) {
      setPulse((p) => p + 1);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Panier (${count} article${count > 1 ? 's' : ''})` : 'Panier'}
      aria-expanded={open}
      aria-controls="site-cart"
      onClick={onOpen}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
    >
      <CartIcon className="h-5 w-5" aria-hidden="true" />
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={pulse}
            initial={reduced ? { scale: 1 } : { scale: 0.6 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-700 px-1 text-[10px] font-semibold leading-none text-white shadow-sm tabular-nums"
            aria-hidden="true"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

import { AnimatePresence } from 'framer-motion';
