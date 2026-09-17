'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Tag, X } from 'lucide-react';
import { Button, Input } from '@ecommerce/ui';

/**
 * PromoCodeInput — input + bouton Appliquer + line subtotal -X EUR si applique.
 *
 * - 4 etats visuels : idle (input vide) | loading (spinner) | success (badge vert) | error (texte rouge).
 * - Validation client : input trim + uppercase. Enter = submit.
 * - onApply : prop async injectable (hook cote serveur Phase M3+).
 * - Accessibilite : role=alert sur erreur, aria-label explicite sur remove.
 */

export interface PromoCodeResult {
  code: string;
  discountCents: number;
  label: string;
}

export interface PromoCodeInputProps {
  /** Resoudre le code. Retourne null si invalide. */
  onApply?: (code: string) => Promise<PromoCodeResult | null>;
  /** Reset le code. */
  onRemove?: () => void;
  /** Resultat deja applique au montage (pour persistance checkout). */
  initialApplied?: PromoCodeResult | null;
}

type Status = 'idle' | 'loading' | 'error' | 'success';

export function PromoCodeInput({
  onApply,
  onRemove,
  initialApplied = null,
}: PromoCodeInputProps): React.ReactElement {
  const [value, setValue] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [applied, setApplied] = React.useState<PromoCodeResult | null>(initialApplied);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed || status === 'loading') return;
    setStatus('loading');
    setErrorMsg(null);
    try {
      const result = onApply ? await onApply(trimmed) : null;
      if (result) {
        setApplied(result);
        setValue('');
        setStatus('success');
        window.setTimeout(() => setStatus('idle'), 1200);
      } else {
        setErrorMsg('Code invalide ou expire.');
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur reseau. Reessayez.');
      setStatus('error');
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setValue('');
    setStatus('idle');
    setErrorMsg(null);
    onRemove?.();
  };

  if (applied) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-2 rounded-2xl border border-success-500 bg-success-50 px-3 py-2.5"
        data-testid="promo-code-applied"
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500 text-white">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
          <span className="truncate font-medium text-success-700">{applied.code}</span>
          <span className="truncate text-ink-600">— {applied.label}</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Retirer le code promo"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-success-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="promo-code" className="block text-sm font-medium text-ink-800">
        Code promo
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Tag
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <Input
            id="promo-code"
            type="text"
            inputMode="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (status === 'error') {
                setStatus('idle');
                setErrorMsg(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleApply();
              }
            }}
            invalid={status === 'error'}
            placeholder="BIENVENUE10"
            className="pl-9 uppercase tracking-wide"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={status === 'loading'}
            data-testid="promo-code-input"
          />
        </div>
        <Button
          type="button"
          onClick={() => void handleApply()}
          disabled={!value.trim() || status === 'loading'}
          variant="primary"
          data-testid="promo-code-apply"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Verification…</span>
            </>
          ) : (
            'Appliquer'
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {errorMsg && status === 'error' ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-danger-600"
            role="alert"
          >
            {errorMsg}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}