'use client';

/**
 * NewsletterCTA — bloc ink-900 avec champ email + état de succès
 *
 * Server-compatible : 'use client' pour le state local du formulaire.
 *
 * - Sur submit : animation de "envoi..." 1.5s puis passe en état succès
 *   avec un check animé (Framer Motion pathLength) + bouton reset.
 * - Pas de backend réel — Phase 3 câblera Resend.
 */

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Loader2, Mail } from 'lucide-react';
import { MotionFade } from '@ecommerce/ui';

type State = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterCTA() {
  const reduced = useReducedMotion();
  const [email, setEmail] = React.useState('');
  const [state, setState] = React.useState<State>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error');
      window.setTimeout(() => setState('idle'), 1800);
      return;
    }
    setState('loading');
    // Simulation envoi API (Resend sera branché Phase 3)
    window.setTimeout(() => {
      setState('success');
      setEmail('');
    }, 1400);
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className="relative overflow-hidden bg-ink-900 text-white"
    >
      {/* Halo terracotta animé en arrière-plan */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(192,74,42,0.32) 0%, transparent 70%)', filter: 'blur(40px)' }}
        animate={
          reduced
            ? undefined
            : {
                scale: [1, 1.1, 1],
                x: [0, 30, 0],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <MotionFade>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-300">Newsletter</p>
          <h2
            id="newsletter-title"
            className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl"
          >
            Recevez nos coups de cœur,
            <br className="hidden sm:block" />
            <span className="text-accent-300">une fois par mois.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">
            Pas de spam. Juste nos trouvailles, nos nouveautés et nos coulisses.
            Vous pouvez vous désinscrire en un clic.
          </p>
        </MotionFade>

        <MotionFade delay={0.15} y={16}>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            aria-live="polite"
          >
            <div className="relative flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse e-mail
              </label>
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              />
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'error') setState('idle');
                }}
                placeholder="vous@maison.fr"
                disabled={state === 'loading' || state === 'success'}
                aria-invalid={state === 'error'}
                className={[
                  'h-12 w-full rounded-full border bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-colors',
                  'focus:outline-none focus:ring-2',
                  state === 'error'
                    ? 'border-danger-500 focus:ring-danger-500'
                    : 'border-white/15 focus:border-accent-500 focus:ring-accent-500',
                  'disabled:opacity-60',
                ].join(' ')}
              />
            </div>
            <button
              type="submit"
              disabled={state === 'loading' || state === 'success'}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-accent-700 px-6 text-sm font-medium text-white shadow-lg shadow-accent-900/30 transition-all hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait" initial={false}>
                {state === 'idle' || state === 'error' ? (
                  <motion.span
                    key="idle"
                    initial={{ y: reduced ? 0 : 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: reduced ? 0 : -8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-2"
                  >
                    S’inscrire
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                  </motion.span>
                ) : null}
                {state === 'loading' ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Envoi…
                  </motion.span>
                ) : null}
                {state === 'success' ? (
                  <motion.span
                    key="success"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="inline-flex items-center gap-2"
                  >
                    <motion.span
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-success-700"
                      aria-hidden="true"
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </motion.span>
                    Inscrit, merci !
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
          </form>
        </MotionFade>

        <MotionFade delay={0.25}>
          <p className="mt-6 text-xs text-white/50">
            En vous inscrivant, vous acceptez notre{' '}
            <a href="/legal/privacy" className="underline-offset-4 hover:underline">
              politique de confidentialité
            </a>
            . RGPD respecté.
          </p>
        </MotionFade>
      </div>
    </section>
  );
}