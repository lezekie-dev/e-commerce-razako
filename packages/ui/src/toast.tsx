'use client';

/**
 * Toast — design system
 *
 * Provider + hook minimal inspiré Sonner :
 * - Viewport ancré configurable (bottom-right par défaut, top-center mobile).
 * - Empilement avec spring Framer Motion, AnimatePresence pour l'exit.
 * - Respecte `prefers-reduced-motion`.
 * - Z-100 : reste visible au-dessus des drawers (z-60).
 * - Bouton close accessible (aria-label).
 * - variants : default (ink-900), success (vert), accent (terracotta), danger.
 */

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from './cn';

export type ToastVariant = 'default' | 'success' | 'accent' | 'danger';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Durée en ms (0 = sticky). */
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) clearTimeout(t);
    timersRef.current.delete(id);
  }, []);

  const toast = React.useCallback<ToastContextValue['toast']>((t) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const duration = t.duration ?? 4000;
    setToasts((prev) => [...prev, { id, ...t, variant: t.variant ?? 'default' }]);
    if (duration > 0) {
      const handle = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, handle);
    }
    return id;
  }, [dismiss]);

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un <ToastProvider>');
  return ctx;
}

const positions = {
  'top-right': 'top-6 right-6 sm:top-8 sm:right-8',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 sm:top-8',
  'bottom-right': 'bottom-6 right-6 sm:bottom-8 sm:right-8',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-8',
} as const;

function ToastViewport({
  toasts,
  dismiss,
  position,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
  position: keyof typeof positions;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'pointer-events-none fixed z-[100] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0',
        positions[position]
      )}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-ink-900 text-white border-ink-800',
  success: 'bg-success-700 text-white border-success-700',
  accent: 'bg-accent-700 text-white border-accent-800',
  danger: 'bg-danger-700 text-white border-danger-700',
};

const variantIcon: Record<ToastVariant, React.ComponentType<{ className?: string }> | null> = {
  default: null,
  success: Check,
  accent: Check,
  danger: X,
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const reduced = useReducedMotion();
  const Icon = variantIcon[toast.variant ?? 'default'];

  return (
    <motion.div
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }}
      className={cn(
        'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-lg ring-1 ring-black/5',
        variantStyles[toast.variant ?? 'default']
      )}
      role="status"
    >
      {Icon ? (
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="flex-1 text-sm">
        <p className="font-medium leading-tight">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-xs leading-snug text-white/75">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}
