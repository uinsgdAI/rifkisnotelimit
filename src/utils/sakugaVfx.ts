export type SakugaVfxVariant = 'indigo' | 'sakura' | 'emerald';

export interface SakugaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  kind: 'spark' | 'ring' | 'puff' | 'line';
  color: string;
  strokeColor: string;
  alpha: number;
  ageMs: number;
  lifeMs: number;
  rotation: number;
  spin: number;
}

export interface SakugaBurstSpec {
  originX: number;
  originY: number;
  variant: SakugaVfxVariant;
  label?: string;
  particles: SakugaParticle[];
  createdAtMs: number;
  durationMs: number;
}

const VARIANT_PALETTES: Record<SakugaVfxVariant, string[]> = {
  indigo: ['#6D69F2', '#8F8DF7', '#B8B3FF', '#1D1A4A', '#FF5FA8'],
  sakura: ['#FF5FA8', '#FF8CC4', '#8F8DF7', '#B8B3FF', '#1D1A4A'],
  emerald: ['#16A34A', '#4ADE80', '#8F8DF7', '#B8B3FF', '#1D1A4A'],
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Pure deterministic burst generator for anime-inspired canvas impact VFX
 * (spark stars, radial impact lines, expanding ink ring, and smoke puffs).
 */
export function createSakugaBurstSpec(params: {
  originX: number;
  originY: number;
  variant?: SakugaVfxVariant;
  label?: string;
  seed?: number;
  nowMs?: number;
}): SakugaBurstSpec {
  const variant = params.variant ?? 'indigo';
  const palette = VARIANT_PALETTES[variant];
  const nowMs = params.nowMs ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const baseSeed = typeof params.seed === 'number' ? params.seed : Math.round((params.originX * 13 + params.originY * 7) % 997);

  const rand = (idx: number) => {
    const raw = Math.sin(baseSeed * 12.9898 + idx * 78.233) * 43758.5453;
    return raw - Math.floor(raw);
  };

  const particles: SakugaParticle[] = [];

  // Central impact ring
  particles.push({
    x: params.originX,
    y: params.originY,
    vx: 0,
    vy: 0,
    size: 10,
    kind: 'ring',
    color: palette[0],
    strokeColor: '#1D1A4A',
    alpha: 1,
    ageMs: 0,
    lifeMs: 420,
    rotation: 0,
    spin: 0,
  });

  // Crisp 4-point anime sparks
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + (rand(i + 1) - 0.5) * 0.38;
    const speed = 135 + rand(i + 20) * 140;
    particles.push({
      x: params.originX,
      y: params.originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 24,
      size: 6 + rand(i + 40) * 6,
      kind: 'spark',
      color: palette[i % palette.length],
      strokeColor: '#1D1A4A',
      alpha: 1,
      ageMs: 0,
      lifeMs: 460 + Math.round(rand(i + 60) * 140),
      rotation: rand(i + 80) * Math.PI,
      spin: (rand(i + 90) - 0.5) * 8,
    });
  }

  // Manga impact rays
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + 0.25 + (rand(i + 110) - 0.5) * 0.25;
    const speed = 180 + rand(i + 130) * 90;
    particles.push({
      x: params.originX + Math.cos(angle) * 10,
      y: params.originY + Math.sin(angle) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 12 + rand(i + 150) * 10,
      kind: 'line',
      color: i % 2 === 0 ? palette[0] : palette[4],
      strokeColor: '#1D1A4A',
      alpha: 0.95,
      ageMs: 0,
      lifeMs: 320 + Math.round(rand(i + 170) * 90),
      rotation: angle,
      spin: 0,
    });
  }

  // Light sakura/lavender smoke puffs
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI * 2 * i) / 4 + 0.5;
    const speed = 65 + rand(i + 200) * 55;
    particles.push({
      x: params.originX,
      y: params.originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 18,
      size: 7 + rand(i + 220) * 5,
      kind: 'puff',
      color: '#FFFFFF',
      strokeColor: '#1D1A4A',
      alpha: 0.9,
      ageMs: 0,
      lifeMs: 440 + Math.round(rand(i + 240) * 100),
      rotation: 0,
      spin: 0,
    });
  }

  return {
    originX: params.originX,
    originY: params.originY,
    variant,
    label: params.label,
    particles,
    createdAtMs: nowMs,
    durationMs: 620,
  };
}

export function stepSakugaParticle(p: SakugaParticle, dtSec: number): SakugaParticle {
  const nextAge = p.ageMs + dtSec * 1000;
  const progress = Math.min(1, nextAge / Math.max(1, p.lifeMs));
  const drag = p.kind === 'line' ? 0.88 : 0.93;
  const factor = Math.pow(drag, dtSec * 60);
  const gravity = p.kind === 'spark' ? 240 * dtSec : 0;

  return {
    ...p,
    x: p.x + p.vx * dtSec,
    y: p.y + p.vy * dtSec,
    vx: p.vx * factor,
    vy: p.vy * factor + gravity,
    rotation: p.rotation + p.spin * dtSec,
    ageMs: nextAge,
    alpha: Math.max(0, 1 - Math.pow(progress, 1.4)),
  };
}

type BurstListener = (spec: SakugaBurstSpec) => void;
const listeners = new Set<BurstListener>();

export function subscribeSakugaBursts(listener: BurstListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface BurstTargetLike {
  clientX?: number;
  clientY?: number;
  currentTarget?: EventTarget | null;
}

export function resolveBurstCoordinates(target?: BurstTargetLike | HTMLElement | null): {
  x: number;
  y: number;
} {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  if (target && typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
    const r = target.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  }

  if (target && !(target instanceof HTMLElement)) {
    if (
      typeof target.clientX === 'number' &&
      typeof target.clientY === 'number' &&
      (target.clientX > 0 || target.clientY > 0)
    ) {
      return { x: target.clientX, y: target.clientY };
    }
    if (target.currentTarget && target.currentTarget instanceof HTMLElement) {
      const r = target.currentTarget.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
  }

  return { x: window.innerWidth / 2, y: window.innerHeight / 3 };
}

export function triggerSakugaBurst(
  target?: BurstTargetLike | HTMLElement | null,
  variant: SakugaVfxVariant = 'indigo',
  label?: string
): boolean {
  if (prefersReducedMotion()) return false;
  const { x, y } = resolveBurstCoordinates(target);
  const spec = createSakugaBurstSpec({
    originX: x,
    originY: y,
    variant,
    label,
    seed: Math.round(Date.now() % 10000),
  });
  for (const listener of listeners) {
    listener(spec);
  }
  return listeners.size > 0;
}
