'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@ecommerce/ui';

/**
 * CheckoutProgress — stepper 3 etapes du tunnel de paiement.
 *
 * Etapes : Adresse → Livraison → Paiement.
 *
 * - Mobile : pastille numerotee + label court.
 * - Desktop : pastille numerotee + label complet, separateur anime.
 * - Pastille terminee : check + bg-accent-700 + ring terracotta.
 * - Connecteur entre pastilles : barre animee scaleX(0→1) via Framer Motion.
 * - Respecte prefers-reduced-motion (via Framer useReducedMotion implicite).
 */

export type CheckoutStepId = 'address' | 'shipping' | 'payment';

interface StepDef {
  id: CheckoutStepId;
  label: string;
  short: string;
}

const STEPS: ReadonlyArray<StepDef> = [
  { id: 'address', label: 'Adresse', short: '1' },
  { id: 'shipping', label: 'Livraison', short: '2' },
  { id: 'payment', label: 'Paiement', short: '3' },
];

export function CheckoutProgress({
  current,
}: {
  current: CheckoutStepId;
}): React.ReactElement {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Progression du paiement" data-testid="checkout-progress">
      <ol role="list" className="flex items-center justify-between gap-2 sm:gap-6">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const past = done || active;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 last:flex-none sm:gap-4">
              <div className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: past ? '#C04A2A' : '#FFFFFF',
                    borderColor: past ? '#C04A2A' : '#D4D4D8',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className={cn(
                    'relative inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold sm:h-10 sm:w-10',
                    past ? 'text-white' : 'text-ink-500',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {step.short}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <span
                  className={cn(
                    'ml-3 text-sm font-medium transition-colors',
                    'hidden sm:inline',
                    active
                      ? 'text-ink-900'
                      : past
                        ? 'text-ink-700'
                        : 'text-ink-500',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 ? (
                <div
                  className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ink-200"
                  aria-hidden="true"
                >
                  <motion.div
                    initial={false}
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-accent-700"
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}