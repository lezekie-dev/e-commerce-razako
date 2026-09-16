'use client';

import * as React from 'react';
import { cn } from '@ecommerce/ui';
import type { ProductVariant } from '../lib/products';

/**
 * VariantSelector — pills + swatches accessibles.
 *
 * - Groupes d'options affiches si la variante possede plusieurs `options`.
 * - Sinon : simple liste de pills avec libelle + swatch hex.
 * - Selection : un seul variant actif (radio group semantics).
 * - Stock 0 ou null : option desactivee avec mention "epuise".
 */

interface VariantSelectorProps {
  variants: ReadonlyArray<ProductVariant>;
  value: string;
  onChange: (variantId: string) => void;
}

export function VariantSelector({
  variants,
  value,
  onChange,
}: VariantSelectorProps): React.ReactElement {
  if (variants.length === 0) {
    return <p className="text-sm text-ink-600">Aucune variante disponible.</p>;
  }

  // Detecte si toutes les variantes ont les memes `options[].label` (ex: "Couleur")
  // pour les regrouper visuellement.
  const firstLabel = variants[0]?.options[0]?.label ?? '';
  const grouped = !!firstLabel && variants.every((v) => (v.options[0]?.label ?? '') === firstLabel);

  if (grouped) {
    return (
      <div role="radiogroup" aria-label={firstLabel} className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const checked = variant.id === value;
          const disabled = !variant.stock || variant.stock === 0;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => !disabled && onChange(variant.id)}
              className={cn(
                'group inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2',
                checked
                  ? 'border-accent-700 ring-2 ring-accent-600'
                  : 'border-ink-300 text-ink-700 hover:border-accent-700',
                disabled && 'cursor-not-allowed opacity-50 line-through',
              )}
              data-testid={`variant-${variant.id}`}
            >
              {variant.options[0]?.swatch ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-4 rounded-full border border-ink-300"
                  style={{ backgroundColor: variant.options[0].swatch }}
                />
              ) : null}
              <span>{variant.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variantes heterogenes : affichage stack (taille + couleur par exemple)
  return (
    <ul role="list" className="space-y-3">
      {variants.map((variant) => {
        const checked = variant.id === value;
        const disabled = !variant.stock || variant.stock === 0;
        return (
          <li key={variant.id}>
            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-3 transition-all',
                checked ? 'border-accent-700 ring-2 ring-accent-600' : 'border-ink-300 hover:border-accent-700',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                name="variant"
                value={variant.id}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(variant.id)}
                className="h-4 w-4 text-accent-700 focus:ring-2 focus:ring-accent-600"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink-900">{variant.label}</span>
                {variant.options.length > 0 ? (
                  <span className="block text-xs text-ink-500">
                    {variant.options.map((o) => `${o.label}: ${o.value}`).join(' · ')}
                  </span>
                ) : null}
              </span>
              <span className="text-sm font-medium text-ink-900">
                {(variant.priceCents / 100).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}