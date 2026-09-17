'use client';

/**
 * <QuantityStepper> — input numérique accessible + micro-bounce
 *
 * - Boutons - / + autour d'un <input type="text" inputMode=numeric>.
 * - Min / max respectés, clamp automatique.
 * - Bouton désactivé si on atteint min / max (visuel : opacité 0.4).
 * - Clavier : ←/- décrémente, →/+ incrémente.
 * - Effet "bounce" sur le chiffre au changement de valeur (Framer Motion).
 * - Subtle color flash quand on tape min/max (rouge/vert 200ms).
 */

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { cn } from './cn';

export interface QuantityStepperProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantityStepper = React.forwardRef<HTMLInputElement, QuantityStepperProps>(
  ({ value, onValueChange, min = 1, max = 99, className, disabled, ...rest }, ref) => {
    const reduced = useReducedMotion();
    const clamp = React.useCallback(
      (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? Math.trunc(v) : min)),
      [min, max]
    );

    const [flash, setFlash] = React.useState<null | 'min' | 'max'>(null);
    const flashTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerFlash = React.useCallback(
      (kind: 'min' | 'max') => {
        if (reduced) return;
        setFlash(kind);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(null), 320);
      },
      [reduced]
    );

    React.useEffect(() => {
      return () => {
        if (flashTimer.current) clearTimeout(flashTimer.current);
      };
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number.parseInt(e.target.value.replace(/\D/g, ''), 10);
      const next = Number.isNaN(raw) ? min : clamp(raw);
      onValueChange(next);
    };

    const dec = () => {
      const next = clamp(value - 1);
      onValueChange(next);
      if (next === min) triggerFlash('min');
    };
    const inc = () => {
      const next = clamp(value + 1);
      onValueChange(next);
      if (next === max) triggerFlash('max');
    };

    const borderClass =
      flash === 'min'
        ? 'border-danger-500'
        : flash === 'max'
          ? 'border-warning-500'
          : 'border-ink-300';

    return (
      <div
        role="group"
        aria-label="Quantité"
        className={cn(
          'inline-flex h-11 items-stretch overflow-hidden rounded-full border bg-white transition-colors',
          borderClass,
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
        <div className="relative w-12 overflow-hidden border-x border-ink-200">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(value)}
            onChange={handleInput}
            disabled={disabled}
            aria-label="Quantité"
            className="absolute inset-0 w-full bg-transparent text-center text-base font-medium text-ink-900 focus:outline-none"
            {...rest}
          />
          <div className="pointer-events-none flex h-full items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={reduced ? false : { y: -16, opacity: 0, scale: 0.85 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { y: 16, opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="text-base font-medium text-ink-900 tabular-nums"
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
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