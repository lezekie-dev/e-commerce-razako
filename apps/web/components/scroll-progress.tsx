'use client';

/**
 * ScrollProgress — barre de progression en haut de page
 *
 * Suit le scroll vertical, de 0 à 100%. Couleur accent terracotta.
 * Animation transform (GPU) — pas de layout shift.
 */

import * as React from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-accent-500 via-accent-700 to-accent-500"
      style={{ scaleX: sx }}
    />
  );
}