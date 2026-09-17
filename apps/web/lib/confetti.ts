/**
 * Confetti micro — célébration courte sans bundle externe
 *
 * Crée N particules qui tombent depuis le point d'event avec une
 * physique simple (gravity + air drag). Pas de dépendance externe,
 * pas de canvas — chaque particule est un <span> positionné fixed.
 * Animation ~800ms puis nettoyage automatique.
 *
 * Usage :
 *   const fire = useConfetti();
 *   <button onClick={() => fire({ origin: { x: 50, y: 30 } })}>...</button>
 *
 * SSR-safe : no-op si document absent.
 */

export interface ConfettiOptions {
  /** Nombre de particules (défaut 28) */
  count?: number;
  /** Couleurs (défaut palette Maison 14) */
  colors?: ReadonlyArray<string>;
  /** Origine en % de la viewport (x,y) — défaut { x: 50, y: 25 } */
  origin?: { x: number; y: number };
  /** Durée en ms — défaut 800 */
  duration?: number;
}

const DEFAULT_COLORS: ReadonlyArray<string> = ['#C04A2A', '#18181B', '#F4D6B8', '#E8E2DA', '#16A34A'];

interface ParticleSpec {
  color: string;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  shape: 'circle' | 'square';
}

function generateParticles(opts: ConfettiOptions): ParticleSpec[] {
  const count = opts.count ?? 28;
  const colors = opts.colors ?? DEFAULT_COLORS;
  const origin = opts.origin ?? { x: 50, y: 25 };
  const particles: ParticleSpec[] = [];
  for (let i = 0; i < count; i++) {
    // Vitesse : vers le haut (angle ≈ -90°) avec dispersion gauche/droite
    const angleBase = -Math.PI / 2;
    const angleJitter = (Math.random() - 0.5) * Math.PI * 0.8;
    const angle = angleBase + angleJitter;
    const speed = 220 + Math.random() * 320;
    const vx = Math.cos(angle) * speed * (0.4 + Math.random() * 0.6);
    const vy = Math.sin(angle) * speed - 60; // un peu de portance
    const color = colors[i % colors.length] ?? DEFAULT_COLORS[0]!;
    particles.push({
      color,
      startX: origin.x + (Math.random() - 0.5) * 6,
      startY: origin.y + (Math.random() - 0.5) * 4,
      vx,
      vy,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 720,
      size: 4 + Math.random() * 6,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    });
  }
  return particles;
}

function spawnParticles(particles: ParticleSpec[], duration: number): void {
  if (typeof document === 'undefined') return;
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  const gravity = 720;
  const drag = 0.96;
  const start = performance.now();
  const elements: HTMLSpanElement[] = [];

  for (const p of particles) {
    const el = document.createElement('span');
    el.style.position = 'fixed';
    el.style.left = `${p.startX}%`;
    el.style.top = `${p.startY}%`;
    el.style.width = `${p.size}px`;
    el.style.height = `${p.size}px`;
    el.style.background = p.color;
    el.style.borderRadius = p.shape === 'circle' ? '50%' : '2px';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.transform = `translate(-50%, -50%) rotate(${p.rotation}deg)`;
    el.style.willChange = 'transform, opacity';
    container.appendChild(el);
    elements.push(el);
  }

  const tick = (now: number) => {
    const elapsed = (now - start) / 1000;
    const totalDuration = duration / 1000;
    const t = Math.min(elapsed, totalDuration);
    elements.forEach((el, idx) => {
      const p = particles[idx];
      if (!p) return;
      const xPercent = p.startX + (p.vx * t * drag) / Math.max(window.innerWidth, 1) * 100;
      const yPx = (p.vy * t + 0.5 * gravity * t * t) / Math.max(window.innerHeight, 1) * 100;
      const yPercent = p.startY + yPx;
      const rot = p.rotation + p.rotationSpeed * t;
      const opacity = Math.max(0, 1 - t / totalDuration);
      el.style.left = `${xPercent}%`;
      el.style.top = `${yPercent}%`;
      el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
      el.style.opacity = String(opacity);
    });
    if (elapsed * 1000 < duration) {
      requestAnimationFrame(tick);
    } else {
      window.setTimeout(() => container.remove(), 60);
    }
  };
  requestAnimationFrame(tick);
}

export function fireConfetti(options: ConfettiOptions = {}): void {
  const duration = options.duration ?? 800;
  const particles = generateParticles(options);
  spawnParticles(particles, duration);
}

import { useCallback } from 'react';
export function useConfetti() {
  return useCallback(fireConfetti, []);
}