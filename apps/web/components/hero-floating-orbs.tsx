'use client';

/**
 * HeroFloatingOrbs — 3 orbes décoratives flottantes
 *
 * Position absolue en arrière-plan du hero. Chacune bouge avec un
 * délai et une amplitude différente (effet "respiration" lent).
 *
 * Respecte prefers-reduced-motion (statique).
 */

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface OrbConfig {
  size: number;
  color: string;
  initialX: string;
  initialY: string;
  /** Amplitude en px (max ±) */
  amp: number;
  /** Durée en s */
  duration: number;
  delay: number;
}

const ORBS: ReadonlyArray<OrbConfig> = [
  {
    size: 480,
    color: 'rgba(192, 74, 42, 0.18)',
    initialX: '12%',
    initialY: '20%',
    amp: 14,
    duration: 9,
    delay: 0,
  },
  {
    size: 360,
    color: 'rgba(244, 198, 181, 0.32)',
    initialX: '78%',
    initialY: '65%',
    amp: 18,
    duration: 11,
    delay: 1.5,
  },
  {
    size: 280,
    color: 'rgba(232, 226, 218, 0.45)',
    initialX: '50%',
    initialY: '90%',
    amp: 12,
    duration: 8,
    delay: 0.8,
  },
];

export function HeroFloatingOrbs() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {ORBS.map((orb, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full"
          style={{
            left: orb.initialX,
            top: orb.initialY,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
            filter: 'blur(40px)',
          }}
          animate={
            reduced
              ? undefined
              : {
                  x: [0, orb.amp, -orb.amp * 0.6, 0],
                  y: [0, -orb.amp * 0.7, orb.amp * 0.5, 0],
                  scale: [1, 1.04, 0.98, 1],
                }
          }
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}