'use client';

/**
 * CartDrawer — version réelle (alimentée par le cart store)
 *
 * Remplace le placeholder dans `site-header-overlays.tsx`.
 * - Liste les items du store avec qty stepper + remove.
 * - Affiche subtotal + barre "livraison offerte dès X €" qui se remplit.
 * - Empty state propre avec illustration SVG inline.
 * - Bouton "Voir le panier" → /panier (M3).
 * - Fermeture : ESC / backdrop / clic X.
 * - Body scroll-lock quand ouvert.
 * - Spring d'ouverture via Framer Motion.
 */

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Minus, X, ShoppingBag, Truck } from 'lucide-react';
import { buttonVariants, QuantityStepper, cn } from '@ecommerce/ui';
import {
  useCartItems,
  useCartStore,
  computeSubtotalCents,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from '../lib/cart-store';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const fmtEUR = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const reduced = useReducedMotion();
  const items = useCartItems();
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);

  // ESC + body scroll-lock
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const subtotal = computeSubtotalCents(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {open ? (
        <div
          id="site-cart"
          role="dialog"
          aria-modal="true"
          aria-label="Panier"
          className="fixed inset-0 z-[60] flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-sm"
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.aside
            initial={reduced ? { x: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? { x: 0 } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36, mass: 0.7 }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-ink-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
              <div>
                <h2 className="font-display text-xl font-medium text-ink-900">Votre panier</h2>
                <p className="text-xs text-ink-500">
                  {items.length === 0
                    ? 'Aucun article'
                    : `${items.reduce((acc, i) => acc + i.quantity, 0)} article${items.reduce((acc, i) => acc + i.quantity, 0) > 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer le panier"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            {/* Progress bar livraison offerte */}
            {items.length > 0 ? (
              <div className="border-b border-ink-200 bg-ink-50 px-5 py-3">
                <div className="flex items-center gap-2 text-xs text-ink-700">
                  <Truck className="h-4 w-4 text-accent-700" aria-hidden="true" />
                  {remaining > 0 ? (
                    <p>
                      Plus que <strong className="font-semibold text-ink-900">{fmtEUR(remaining)}</strong> pour la{' '}
                      <strong className="font-semibold text-success-700">livraison offerte</strong>
                    </p>
                  ) : (
                    <p className="text-success-700 font-medium">🎉 Livraison offerte débloquée</p>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
                  <motion.div
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                    className="h-full rounded-full bg-accent-700"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ) : null}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyCart onClose={onClose} />
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, x: 60, scale: 0.96 }}
                        transition={{ duration: reduced ? 0 : 0.25 }}
                        className="flex gap-3 rounded-2xl border border-ink-200 bg-white p-3"
                      >
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={onClose}
                          className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                        >
                          <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={onClose}
                            className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-accent-700"
                          >
                            {item.name}
                          </Link>
                          {item.options ? (
                            <p className="mt-0.5 text-xs text-ink-500">
                              {item.options.map((o) => `${o.label}: ${o.value}`).join(' · ')}
                            </p>
                          ) : null}
                          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                            <QuantityStepper
                              value={item.quantity}
                              onValueChange={(v) => updateQty(item.variantId, v)}
                              max={item.maxQuantity ?? 10}
                              className="h-9"
                            />
                            <p className="text-sm font-semibold tabular-nums text-ink-900">
                              {fmtEUR(item.unitPriceCents * item.quantity)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Retirer ${item.name} du panier`}
                          onClick={() => remove(item.variantId)}
                          className="-mt-1 -mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 ? (
              <footer className="border-t border-ink-200 bg-white p-5">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-600">Sous-total</dt>
                    <dd className="font-medium tabular-nums text-ink-900">{fmtEUR(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-600">Livraison</dt>
                    <dd className="font-medium tabular-nums text-ink-900">
                      {shipping === 0 ? <span className="text-success-700">Offerte</span> : fmtEUR(shipping)}
                    </dd>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-ink-200 pt-2 text-base">
                    <dt className="font-semibold text-ink-900">Total</dt>
                    <dd className="font-semibold tabular-nums text-ink-900">{fmtEUR(total)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-ink-500">TVA incluse. Frais de port calculés à l'étape suivante.</p>
                <Link
                  href="/panier"
                  onClick={onClose}
                  className={cn(buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true }), 'mt-3')}
                >
                  Voir le panier
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 w-full text-center text-sm font-medium text-ink-600 hover:text-ink-900"
                >
                  Continuer mes achats
                </button>
              </footer>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-ink-100">
        <ShoppingBag className="h-9 w-9 text-ink-500" aria-hidden="true" />
      </div>
      <p className="font-display text-lg text-ink-900">Votre panier est vide</p>
      <p className="mt-1 max-w-xs text-sm text-ink-600">
        Parcourez notre catalogue pour dénicher des pièces sélectionnées avec soin.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <Link href="/products" onClick={onClose} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Découvrir le catalogue
        </Link>
        <Link href="/collections" onClick={onClose} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Voir les collections
        </Link>
      </div>
    </div>
  );
}
