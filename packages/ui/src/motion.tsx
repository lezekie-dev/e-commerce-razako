'use client';

/**
 * Motion primitives — Framer Motion
 *
 * Wrappers de Reveal-on-scroll et Stagger pour donner du rythme aux pages.
 * Respectent `prefers-reduced-motion`. Toutes les primitives sont des
 * Client Components.
 */

import * as React from 'react';
import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { cn } from './cn';

export interface MotionFadeProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
}

export function MotionFade({ children, delay = 0, y = 24, duration = 0.6, className, ...rest }: MotionFadeProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export interface MotionStaggerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
}

export function MotionStagger({ children, stagger = 0.06, delayChildren = 0.1, className, ...rest }: MotionStaggerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: reduced ? 0 : delayChildren } },
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
}

export function MotionStaggerItem({ children, className, y = 20, ...rest }: MotionStaggerItemProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export interface MotionParallaxProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  strength?: number;
}

export function MotionParallax({ children, strength = 40, className, ...rest }: MotionParallaxProps) {
  const reduced = useReducedMotion();
  const [scrollY, setScrollY] = React.useState(0);
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
        const offset = Math.max(-1, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight - 0.5));
        setScrollY(offset * strength);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [strength, reduced]);

  return (
    <motion.div ref={ref} className={cn(className)} style={{ y: scrollY }} {...rest}>
      {children}
    </motion.div>
  );
}
