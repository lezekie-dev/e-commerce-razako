'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Gift, ShoppingBag, Sparkles, Truck, X } from 'lucide-react';
import { buttonVariants, QuantityStepper, MotionCountUp, cn } from '@ecommerce/ui';
import {
  useCartItems,
  useCartStore,
  computeSubtotalCents,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from '../../lib/cart-store';
import { fireConfetti } from '../../lib/confetti';
import { formatPriceCents } from '../../lib/format';
import { PromoCodeInput, type PromoCodeResult } from '../../components/promo-code-input';
import { RelatedProducts } from '../../components/related-products';
import type { Product } from '../../lib/products';

const GIFT_WRAP_PRICE_CENTS = 390;

/**
 * PanierContent — Client Component racine de la page /panier.
 *
 * - Liste les items du store avec qty stepper + remove.
 * - Barre "livraison offerte des 80 EUR" avec progress + confetti au palier.
 * - Toggle emballage cadeau (+3,90 EUR).
 * - PromoCodeInput applique (mock local — branchement API M3+).
 * - Empty state avec illustration SVG inline.
 * - Cross-sell 4 produits (reuse RelatedProducts).
 */

export function PanierContent({
  featured,
}: {
  featured: ReadonlyArray<Product>;
}): React.ReactElement {
  const items = useCartItems();
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);
  const [promo, setPromo] = React.useState<PromoCodeResult | null>(null);
  const [giftWrap, setGiftWrap] = React.useState(false);

  const subtotal = computeSubtotalCents(items);
  const discount = promo?.discountCents ?? 0;
  const giftWrapCents = giftWrap && items.length > 0 ? GIFT_WRAP_PRICE_CENTS : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount + giftWrapCents);
  const shipping =
    subtotalAfterDiscount === 0 || subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD_CENTS
      ? 0
      : STANDARD_SHIPPING_CENTS;
  const total = subtotalAfterDiscount + shipping;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalAfterDiscount);
  const progress = Math.min(
    100,
    (subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD_CENTS) * 100,
  );
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  const prevSubtotalRef = React.useRef(0);
  React.useEffect(() => {
    const prev = prevSubtotalRef.current;
    if (
      subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD_CENTS &&
      prev < FREE_SHIPPING_THRESHOLD_CENTS &&
      items.length > 0
    ) {
      fireConfetti({ count: 36, origin: { x: 50, y: 35 } });
    }
    prevSubtotalRef.current = subtotalAfterDiscount;
  }, [subtotalAfterDiscount, items.length]);

  const resolvePromo = React.useCallback(async (code: string): Promise<PromoCodeResult | null> => {
    await new Promise((r) => setTimeout(r, 400));
    const table: Record<string, PromoCodeResult> = {
      BIENVENUE10: { code: 'BIENVENUE10', discountCents: Math.round(subtotal * 0.1), label: '-10% sur le panier' },
      MAISON14: { code: 'MAISON14', discountCents: 500, label: '-5,00 EUR bienvenue' },
    };
    return table[code] ?? null;
  }, [subtotal]);

  if (items.length === 0) {
    return <EmptyPanier featured={featured} />;
  }


  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-ink-200 bg-white shadow-sm">
          <header className="flex items-baseline justify-between gap-3 border-b border-ink-200 px-5 py-4">
            <h1 className="font-display text-2xl font-medium text-ink-900 sm:text-3xl">
              Votre panier
            </h1>
            <p className="text-sm text-ink-600">
              {totalQty} article{totalQty > 1 ? 's' : ''}
            </p>
          </header>

          <div className="border-b border-ink-200 bg-gradient-to-r from-ink-50 via-ink-50 to-accent-50/40 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-ink-700">
              {remaining === 0 ? (
                <Sparkles className="h-4 w-4 text-success-600" aria-hidden="true" />
              ) : (
                <Truck className="h-4 w-4 text-accent-700" aria-hidden="true" />
              )}
              {remaining > 0 ? (
                <p>
                  Plus que{' '}
                  <strong className="font-semibold tabular-nums text-ink-900">
                    <MotionCountUp value={remaining / 100} prefix="" decimals={2} suffix=" €" duration={0.5} />
                  </strong>{' '}
                  pour la{' '}
                  <strong className="font-semibold text-success-700">livraison offerte</strong>
                </p>
              ) : (
                <p className="font-semibold text-success-700">Livraison offerte débloquée</p>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
              <motion.div
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                className="h-full rounded-full bg-gradient-to-r from-accent-500 via-accent-700 to-accent-500"
                aria-hidden="true"
              />
            </div>
          </div>

          <ul role="list" className="divide-y divide-ink-200 px-5">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 60, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-4 py-4"
                  data-testid={`cart-item-${item.variantId}`}
                >
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
                  >
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-accent-700 sm:text-base"
                        >
                          {item.name}
                        </Link>
                        {item.options && item.options.length > 0 ? (
                          <p className="mt-0.5 text-xs text-ink-500">
                            {item.options.map((o) => `${o.label} : ${o.value}`).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantId)}
                        aria-label={`Retirer ${item.name} du panier`}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <QuantityStepper
                        value={item.quantity}
                        onValueChange={(v) => updateQty(item.variantId, v)}
                        min={1}
                        max={item.maxQuantity ?? 10}
                      />
                      <p className="text-sm font-semibold tabular-nums text-ink-900">
                        <MotionCountUp
                          value={(item.unitPriceCents * item.quantity) / 100}
                          decimals={2}
                          suffix=" €"
                          duration={0.4}
                        />
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(e) => setGiftWrap(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-accent-700 focus:ring-2 focus:ring-accent-600"
              data-testid="gift-wrap-toggle"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">
                  Emballage cadeau
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
                    <Gift className="h-3 w-3" aria-hidden="true" /> Cadeau
                  </span>
                </p>
                <p className="text-sm font-semibold tabular-nums text-ink-900">
                  +{formatPriceCents(GIFT_WRAP_PRICE_CENTS)}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Pochon en lin sérigraphié, message personnalisé sur carte.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-5">
          <PromoCodeInput onApply={resolvePromo} onRemove={() => setPromo(null)} initialApplied={promo} />
          <p className="mt-2 text-xs text-ink-500">
            Codes de test : <code className="rounded bg-ink-100 px-1">BIENVENUE10</code> · <code className="rounded bg-ink-100 px-1">MAISON14</code>
          </p>
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-24 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm" data-testid="panier-summary">
          <h2 className="font-display text-lg font-medium text-ink-900">Récapitulatif</h2>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-600">Sous-total</dt>
              <dd className="font-medium tabular-nums text-ink-900">{formatPriceCents(subtotal)}</dd>
            </div>
            {giftWrapCents > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-600">Emballage cadeau</dt>
                <dd className="font-medium tabular-nums text-ink-900">+{formatPriceCents(giftWrapCents)}</dd>
              </div>
            ) : null}
            {discount > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-ink-600">Code {promo?.code}</dt>
                <dd className="font-medium tabular-nums text-success-700">-{formatPriceCents(discount)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-600">Livraison</dt>
              <dd className={cn('font-medium tabular-nums', shipping === 0 ? 'text-success-700' : 'text-ink-900')}>
                {shipping === 0 ? 'Offerte' : formatPriceCents(shipping)}
              </dd>
            </div>
          </dl>

          <div className="my-4 border-t border-ink-200" />

          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-ink-900">Total TTC</p>
            <p className="font-display text-2xl font-semibold tabular-nums text-ink-900" data-testid="panier-total">
              <MotionCountUp value={total / 100} decimals={2} suffix=" €" duration={0.5} />
            </p>
          </div>

          <Link
            href="/checkout"
            className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true, className: 'mt-5' })}
            data-testid="panier-checkout"
          >
            Passer commande
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link href="/collections" className="mt-3 block text-center text-sm text-ink-600 hover:text-accent-700">
            Continuer mes achats
          </Link>
        </div>
      </aside>

      {featured.length > 0 ? (
        <section className="lg:col-span-12" aria-labelledby="cross-sell-title">
          <h2 id="cross-sell-title" className="mb-6 font-display text-xl font-medium tracking-tight text-ink-900 sm:text-2xl">
            Vous aimerez aussi
          </h2>
          <RelatedProducts items={featured} />
        </section>
      ) : null}
    </div>
  );
}

function EmptyPanier({
  featured,
}: {
  featured: ReadonlyArray<Product>;
}): React.ReactElement {
  return (
    <div className="mx-auto max-w-2xl text-center" data-testid="empty-panier">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-ink-100">
        <ShoppingBag className="h-12 w-12 text-ink-500" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl">
        Votre panier est vide
      </h1>
      <p className="mt-3 text-base text-ink-600">
        Découvrez notre sélection d'objets design, durables et accessibles.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/collections" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          Découvrir la collection
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
          Tous les produits
        </Link>
      </div>
      {featured.length > 0 ? (
        <section className="mt-16 text-left" aria-labelledby="empty-cross-sell-title">
          <h2 id="empty-cross-sell-title" className="mb-6 font-display text-xl font-medium tracking-tight text-ink-900 sm:text-2xl">
            Notre sélection
          </h2>
          <RelatedProducts items={featured} />
        </section>
      ) : null}
    </div>
  );
}
