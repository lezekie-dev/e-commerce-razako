'use client';

/**
 * <QuantityStepper> — input numérique accessible
 *
 * - Boutons - / + autour d'un <input type="number">.
 * - Min / max respectés, clamp automatique.
 * - Bouton désactivé si on atteint min / max (visuel : opacité 0.4).
 * - Clavier : ←/- décrémente, →/+ incrémente (rotation autorisée).
 * - Label aria sur chaque bouton (décrémenter / incrémenter).
 */

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from './cn';

export interface QuantityStepperProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantityStepper = React.forwardRef<HTMLInputElement, QuantityStepperProps>(
  ({ value, onValueChange, min = 1, max = 99, className, disabled, ...rest }, ref) => {
    const clamp = React.useCallback(
      (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? Math.trunc(v) : min)),
      [min, max]
    );

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number.parseInt(e.target.value.replace(/\D/g, ''), 10);
      onValueChange(Number.isNaN(raw) ? min : clamp(raw));
    };

    const dec = () => onValueChange(clamp(value - 1));
    const inc = () => onValueChange(clamp(value + 1));

    return (
      <div
        role="group"
        aria-label="Quantité"
        className={cn(
          'inline-flex h-11 items-stretch overflow-hidden rounded-full border border-ink-300 bg-white',
          disabled && 'opacity-50',
          className
        )}
      >
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          aria-label="Diminuer la quantité"
          className="inline-flex w-11 items-center justify-center text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-inset disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={String(value)}
          onChange={handleInput}
          disabled={disabled}
          aria-label="Quantité"
          className="w-12 border-x border-ink-200 bg-white text-center text-base font-medium text-ink-900 focus:outline-none focus-visible:bg-white"
          {...rest}
        />
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          aria-label="Augmenter la quantité"
          className="inline-flex w-11 items-center justify-center text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-inset disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
);
QuantityStepper.displayName = 'QuantityStepper';
