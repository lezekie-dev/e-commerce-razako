'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Truck } from 'lucide-react';
import { Button, MotionCountUp, cn } from '@ecommerce/ui';
import { formatPriceCents } from '../lib/format';

/**
 * OrderSummary — recap panier / checkout (sidebar sticky).
 *
 * - Sticky sur desktop (top-24 = header + gap).
 * - Subtotal + shipping + promo + total TTC.
 * - Total TTC anime via MotionCountUp.
 * - CTA "Passer commande" : submit programmatique du form parent via formId
 *   (le bouton peut etre hors du form si on le veut dans une sidebar).
 * - Trust signals : paiement securise Stripe + livraison suivie.
 */

export interface OrderSummaryProps {
  subtotalCents: number;
  shippingCents: number;
  promoDiscountCents?: number;
  promoLabel?: string;
  paymentLabel?: string;
  totalCents: number;
  isSubmitting?: boolean;
  showCheckoutButton?: boolean;
  sticky?: boolean;
  ctaLabel?: string;
  formId?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function OrderSummary({
  subtotalCents,
  shippingCents,
  promoDiscountCents = 0,
  promoLabel,
  paymentLabel,
  totalCents,
  isSubmitting = false,
  showCheckoutButton = true,
  sticky = true,
  ctaLabel = 'Passer commande',
  formId,
  disabled = false,
  children,
}: OrderSummaryProps): React.ReactElement {
  const shippingFree = shippingCents === 0;

  const handleClick = () => {
    if (!formId) return;
    if (typeof document === 'undefined') return;
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.submit();
    }
  };

  return (
    <aside
      className={cn(
        'rounded-2xl border border-ink-200 bg-white p-6 shadow-sm',
        sticky && 'lg:sticky lg:top-24',
      )}
      data-testid="order-summary"
    >
      <h2 className="font-display text-lg font-medium text-ink-900">Récapitulatif</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-600">Sous-total</dt>
          <dd className="font-medium tabular-nums text-ink-900" data-testid="summary-subtotal">
            {formatPriceCents(subtotalCents)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink-600">Livraison</dt>
          <dd
            className={cn(
              'font-medium tabular-nums',
              shippingFree ? 'text-success-700' : 'text-ink-900',
            )}
            data-testid="summary-shipping"
          >
            {shippingFree ? 'Offerte' : formatPriceCents(shippingCents)}
          </dd>
        </div>
        {promoDiscountCents > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="text-ink-600">Code {promoLabel ?? 'promo'}</dt>
            <dd className="font-medium tabular-nums text-success-700" data-testid="summary-promo">
              −{formatPriceCents(promoDiscountCents)}
            </dd>
          </motion.div>
        ) : null}
        {paymentLabel ? (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-600">Paiement {paymentLabel}</dt>
            <dd className="text-xs text-ink-500">Inclus</dd>
          </div>
        ) : null}
      </dl>

      <div className="my-4 border-t border-ink-200" />

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-ink-900">Total TTC</p>
        <p
          className="font-display text-2xl font-semibold tabular-nums text-ink-900"
          data-testid="order-total"
        >
          <MotionCountUp value={totalCents / 100} decimals={2} suffix=" €" duration={0.6} />
        </p>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      {showCheckoutButton ? (
        <Button
          type="button"
          onClick={handleClick}
          disabled={disabled || isSubmitting}
          variant="primary"
          fullWidth
          size="lg"
          className="mt-5"
          data-testid="checkout-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Traitement…</span>
            </>
          ) : (
            ctaLabel
          )}
        </Button>
      ) : null}

      <ul className="mt-5 space-y-2 text-xs text-ink-600">
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
          <span>Paiement sécurisé Stripe</span>
        </li>
        <li className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
          <span>Livraison suivie 3-5 jours</span>
        </li>
      </ul>
    </aside>
  );
}
