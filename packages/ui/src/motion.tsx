'use client';

/**
 * Motion primitives — Framer Motion
 *
 * Effets premium pour le storefront Maison 14 :
 * - MotionFade / MotionStagger / MotionStaggerItem / MotionParallax : reveal-on-scroll
 * - MotionTextLines : titre animé ligne-par-ligne avec mask slide-up
 * - MotionMagnetic : bouton qui suit légèrement le curseur
 * - MotionMeshGradient : fond mesh-gradient animé (CSS pur + keyframes)
 * - MotionCountUp : compteur animé pour les chiffres
 * - MotionSpotlight : halo radial qui suit le curseur sur la section
 *
 * Toutes les primitives respectent `prefers-reduced-motion`.
 * Easing "outExpo" par défaut pour la sensation Apple/Linear.
 */

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
  type HTMLMotionProps,
} from 'framer-motion';
import { cn } from './cn';

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─────────────────────────────────────────────────────────────────────────────
// MotionFade
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionFadeProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  withScale?: boolean;
}

export function MotionFade({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className,
  withScale = false,
  ...rest
}: MotionFadeProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y, scale: reduced ? 1 : withScale ? 0.96 : 1 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionStagger + MotionStaggerItem
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionStaggerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
}

export function MotionStagger({
  children,
  stagger = 0.06,
  delayChildren = 0.1,
  className,
  ...rest
}: MotionStaggerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : delayChildren,
          },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export interface MotionStaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  y?: number;
  withScale?: boolean;
}

export function MotionStaggerItem({
  children,
  className,
  y = 20,
  withScale = false,
  ...rest
}: MotionStaggerItemProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y, scale: reduced ? 1 : withScale ? 0.95 : 1 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: reduced ? 0 : 0.5, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionParallax — scroll-linked translateY
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionParallaxProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  strength?: number;
}

export function MotionParallax({
  children,
  strength = 40,
  className,
  ...rest
}: MotionParallaxProps) {
  const reduced = useReducedMotion();
  const scrollY = useSpring(useMotionValue(0), { stiffness: 120, damping: 30 });
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (reduced) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const offset = Math.max(
          -1,
          Math.min(1, (window.innerHeight - rect.top) / window.innerHeight - 0.5)
        );
        scrollY.set(offset * strength);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [strength, reduced, scrollY]);

  return (
    <motion.div ref={ref} className={cn(className)} style={{ y: scrollY }} {...rest}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionTextLines — titre animé ligne-par-ligne avec mask slide-up
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionTextLinesProps {
  lines: ReadonlyArray<string>;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export function MotionTextLines({
  lines,
  className,
  stagger = 0.08,
  delay = 0,
  as: Tag = 'div',
  ...rest
}: MotionTextLinesProps) {
  const reduced = useReducedMotion();
  const fullText = lines.join(' ');
  const TagAny = Tag as keyof JSX.IntrinsicElements;
  return (
    <TagAny
      className={cn('inline-block', className)}
      aria-label={fullText}
      {...(rest as Record<string, unknown>)}
    >
      <span aria-hidden="true" className="sr-only">
        {fullText}
      </span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduced ? 0 : stagger,
              delayChildren: reduced ? 0 : delay,
            },
          },
        }}
        className="block"
      >
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.1em] last:pb-0">
            <motion.span
              className="block will-change-transform"
              variants={{
                hidden: { y: reduced ? 0 : '110%' },
                visible: { y: 0 },
              }}
              transition={{ duration: reduced ? 0 : 0.85, ease: EASE_OUT_EXPO }}
              aria-hidden="true"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </TagAny>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionMagnetic — wrap qui attire son enfant vers le curseur
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionMagneticProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  /** Force d'attraction (max translate en px) — défaut 14 */
  strength?: number;
  /** Désactive sur mobile */
  disabledOnTouch?: boolean;
}

export function MotionMagnetic({
  children,
  strength = 14,
  className,
  disabledOnTouch = true,
  ...rest
}: MotionMagneticProps) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });

  React.useEffect(() => {
    if (reduced) return;
    if (
      disabledOnTouch &&
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      x.set(Math.max(-1, Math.min(1, dx)) * strength);
      y.set(Math.max(-1, Math.min(1, dy)) * strength);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength, disabledOnTouch, reduced, x, y]);

  return (
    <motion.div ref={ref} className={cn(className)} style={{ x: sx, y: sy }} {...rest}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionMeshGradient — fond animé mesh-gradient (CSS pur + keyframes)
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionMeshGradientProps {
  className?: string;
  /** Palette de 3-4 couleurs */
  colors?: ReadonlyArray<string>;
  /** Vitesse d'animation (s) — défaut 14 */
  duration?: number;
  /** Opacité globale — défaut 1 */
  opacity?: number;
}

export function MotionMeshGradient({
  className,
  colors,
  duration = 14,
  opacity = 1,
  ...rest
}: MotionMeshGradientProps) {
  const reduced = useReducedMotion();
  const palette = colors ?? ['#C04A2A', '#F4D6B8', '#18181B', '#E8E2DA'];
  const c1 = palette[0];
  const c2 = palette[1] ?? palette[0];
  const c3 = palette[2] ?? palette[1] ?? palette[0];
  const c4 = palette[3] ?? palette[0];

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity }}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    >
      <div
        className="absolute -inset-[20%]"
        style={{
          background: `
            radial-gradient(at 20% 30%, ${c1}40 0px, transparent 50%),
            radial-gradient(at 80% 20%, ${c2}50 0px, transparent 50%),
            radial-gradient(at 60% 80%, ${c3}30 0px, transparent 50%),
            radial-gradient(at 10% 90%, ${c4}45 0px, transparent 50%),
            radial-gradient(at 90% 70%, ${c1}30 0px, transparent 50%)
          `,
          filter: 'blur(48px)',
          animation: reduced ? undefined : `mesh-shift ${duration}s ease-in-out infinite`,
          willChange: 'transform',
        }}
      />
      <style>{`
        @keyframes mesh-shift {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
          33% { transform: translate3d(2%, -3%, 0) rotate(8deg) scale(1.05); }
          66% { transform: translate3d(-2%, 2%, 0) rotate(-6deg) scale(0.97); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionCountUp — anime un nombre de 0 → target
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionCountUpProps {
  /** Valeur cible */
  value: number;
  /** Durée de l'animation (s) — défaut 1.4 */
  duration?: number;
  /** Nombre de décimales */
  decimals?: number;
  /** Préfixe (ex: '+', '€', '$') */
  prefix?: string;
  /** Suffixe (ex: ' marques', ' jours') */
  suffix?: string;
  className?: string;
  /** Locale pour Intl.NumberFormat — défaut fr-FR */
  locale?: string;
}

export function MotionCountUp({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  locale = 'fr-FR',
}: MotionCountUpProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = React.useState(reduced ? value : 0);
  const previous = React.useRef(reduced ? value : 0);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setDisplay(v),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, duration, reduced]);

  const formatter = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals]
  );

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {formatter.format(display)}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MotionSpotlight — halo radial qui suit le curseur
// ─────────────────────────────────────────────────────────────────────────────

export interface MotionSpotlightProps {
  className?: string;
  /** Taille du halo en px — défaut 600 */
  size?: number;
  /** Couleur centrale en RGB (ex: '192, 74, 42') — défaut terracotta */
  color?: string;
  /** Opacité max — défaut 0.18 */
  maxOpacity?: number;
}

export function MotionSpotlight({
  className,
  size = 600,
  color = '192, 74, 42',
  maxOpacity = 0.18,
  ...rest
}: MotionSpotlightProps) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const opacity = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 22 });
  const sy = useSpring(y, { stiffness: 120, damping: 22 });
  const sopacity = useSpring(opacity, { stiffness: 80, damping: 20 });

  React.useEffect(() => {
    if (reduced) return;
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
      opacity.set(maxOpacity);
    };
    const onLeave = () => opacity.set(0);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [maxOpacity, reduced, x, y, opacity]);

  const tx = useTransform(sx, (v) => v - size / 2);
  const ty = useTransform(sy, (v) => v - size / 2);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          x: tx,
          y: ty,
          opacity: sopacity,
          width: size,
          height: size,
          background: `radial-gradient(circle, rgba(${color}, 1) 0%, rgba(${color}, 0.4) 30%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}