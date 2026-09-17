import * as React from 'react';
import { CheckoutProgress, type CheckoutStepId } from './checkout-progress';
import { OrderSummary } from './order-summary';
import { CheckoutProvider, useCheckout } from './checkout-provider';
import { PromoCodeInput } from './promo-code-input';
import { useCartSubtotalCents, useCartStore, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_SHIPPING_CENTS } from '../lib/cart-store';
import { DEFAULT_SHIPPING_OPTIONS } from './shipping-selector';
import { cn } from '@ecommerce/ui';

/**
 * CheckoutShell — Server Component (RSC) qui wrap le funnel de paiement.
 *
 * - Lit les items du panier + calcule shipping depuis useCheckout (Client).
 * - Stepper en haut + OrderSummary sticky droite + zone formulaire gauche.
 * - CheckoutProvider wrappe le tout pour partager promo/shipping/gift entre etapes.
 *
 * Layout :
 *   - mobile : 1 colonne (form puis summary)
 *   - desktop : 2 colonnes (form gauche col-span-7, summary droite col-span-5)
 */

export function CheckoutShell({
  current,
  children,
}: {
  current: CheckoutStepId;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <CheckoutProvider>
      <CheckoutProgress current={current} />
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">{children}</div>
        <aside className="lg:col-span-5">
          <CheckoutSummary current={current} />
        </aside>
      </div>
    </CheckoutProvider>
  );
}

function CheckoutSummary({
  current,
}: {
  current: CheckoutStepId;
}): React.ReactElement {
  const { shippingId, promo } = useCheckout();
  const subtotal = useCartSubtotalCents();
  const items = useCartStore((s) => s.items);
  const [giftWrap] = React.useState(false); // M3: pas encore UI cadeau sur checkout funnel

  const selected = DEFAULT_SHIPPING_OPTIONS.find((o) => o.id === shippingId) ?? DEFAULT_SHIPPING_OPTIONS[0];
  const isFree = selected?.freeFromCents !== undefined && subtotal >= selected.freeFromCents;
  const shippingCents = isFree ? 0 : selected?.priceCents ?? STANDARD_SHIPPING_CENTS;
  const discount = promo?.discountCents ?? 0;
  const giftWrapCents = giftWrap && items.length > 0 ? 390 : 0;
  const totalCents = Math.max(0, subtotal - discount + giftWrapCents) + shippingCents;

  // M3 mock : pas de Stripe sur OrderSummary step — submit programmatique via formId
  const formId = current === 'address' ? 'address-form' : current === 'shipping' ? 'shipping-form' : 'payment-form';

  return (
    <OrderSummary
      subtotalCents={subtotal}
      shippingCents={shippingCents}
      promoDiscountCents={discount}
      promoLabel={promo?.code}
      totalCents={totalCents}
      formId={formId}
      sticky
      ctaLabel={
        current === 'payment'
          ? 'Confirmer le paiement'
          : 'Continuer'
      }
      showCheckoutButton={false}
    />
  );
}
