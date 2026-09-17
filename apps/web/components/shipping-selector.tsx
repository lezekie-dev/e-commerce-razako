'use client';

import * as React from 'react';
import { Truck, Zap, MapPin } from 'lucide-react';
import { cn } from '@ecommerce/ui';
import { formatPriceCents } from '../lib/format';

/**
 * ShippingSelector — 3 options radio cards.
 *
 * - Standard 4,90 EUR / 3-5j (Truck)
 * - Express 9,90 EUR / 24-48h (Zap)
 * - Point relais 3,90 EUR / 4-6j (Map) — gratuit des 80 EUR
 *
 * Accessibilite :
 * - role=radiogroup + inputs radio reels (input.sr-only + label visuelle).
 * - Highlight terracotta + ring quand selectionne.
 * - Prix affiche en vert si gratuit (palier atteint).
 */

export type ShippingIconKind = 'truck' | 'zap' | 'map';

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  priceCents: number;
  /** Seuil au-dessus duquel la livraison devient gratuite. */
  freeFromCents?: number;
  icon: ShippingIconKind;
}

export const DEFAULT_SHIPPING_OPTIONS: ReadonlyArray<ShippingOption> = [
  { id: 'standard', label: 'Standard', description: '3-5 jours ouvrés', priceCents: 490, icon: 'truck' },
  { id: 'express', label: 'Express', description: '24-48h', priceCents: 990, icon: 'zap' },
  { id: 'relay', label: 'Point relais', description: '4-6 jours ouvrés', priceCents: 390, freeFromCents: 8000, icon: 'map' },
];

import type { LucideIcon } from 'lucide-react';
const ICON_MAP: Record<ShippingIconKind, LucideIcon> = {
  truck: Truck,
  zap: Zap,
  map: MapPin,
};

export interface ShippingSelectorProps {
  options?: ReadonlyArray<ShippingOption>;
  subtotalCents: number;
  value?: string;
  onChange: (id: string) => void;
  name?: string;
}

export function ShippingSelector({
  options = DEFAULT_SHIPPING_OPTIONS,
  subtotalCents,
  value,
  onChange,
  name = 'shipping',
}: ShippingSelectorProps): React.ReactElement {
  const [selected, setSelected] = React.useState<string>(value ?? options[0]?.id ?? '');

  React.useEffect(() => {
    if (value !== undefined && value !== selected) {
      setSelected(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (id: string) => {
    setSelected(id);
    onChange(id);
  };

  return (
    <div role="radiogroup" aria-label="Mode de livraison" className="space-y-3" data-testid="shipping-selector">
      {options.map((opt) => {
        const checked = selected === opt.id;
        const freeFrom = opt.freeFromCents;
        const isFree = freeFrom !== undefined && subtotalCents >= freeFrom;
        const displayPrice = isFree ? 0 : opt.priceCents;
        const Icon = ICON_MAP[opt.icon];
        return (
          <label
            key={opt.id}
            className={cn(
              'flex cursor-pointer items-start gap-4 rounded-2xl border bg-white p-4 transition-all',
              'hover:border-accent-700 focus-within:ring-2 focus-within:ring-accent-600 focus-within:ring-offset-2',
              checked ? 'border-accent-700 ring-2 ring-accent-600' : 'border-ink-300',
            )}
            data-testid={`shipping-${opt.id}`}
          >
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={checked}
              onChange={() => handleChange(opt.id)}
              className="sr-only"
              aria-label={`${opt.label} — ${opt.description}`}
            />
            <span
              className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                checked ? 'bg-accent-700 text-white' : 'bg-ink-100 text-ink-700',
              )}
              aria-hidden="true"
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900">{opt.label}</p>
                <p
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    isFree ? 'text-success-700' : 'text-ink-900',
                  )}
                >
                  {isFree ? 'Offert' : formatPriceCents(displayPrice)}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-ink-600">{opt.description}</p>
              {isFree ? (
                <p className="mt-1 text-xs font-medium text-success-700">
                  Livraison offerte (palier atteint)
                </p>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}