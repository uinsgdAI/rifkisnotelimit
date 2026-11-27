export type SakugaVfxVariant = 'indigo' | 'sakura' | 'emerald' | 'blue' | 'crimson';
export type SakugaBurstIntensity = 'normal' | 'subtle' | 'micro';

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
  intensity: SakugaBurstIntensity;
  label?: string;
  particles: SakugaParticle[];
  createdAtMs: number;
  durationMs: number;
}

const VARIANT_PALETTES: Record<SakugaVfxVariant, string[]> = {
  indigo: ['#6D69F2', '#8F8DF7', '#B8B3FF', '#1D1A4A', '#FF5FA8'],
  sakura: ['#FF5FA8', '#FF8CC4', '#8F8DF7', '#B8B3FF', '#1D1A4A'],
  emerald: ['#16A34A', '#4ADE80', '#60A5FA', '#93C5FD', '#0F2557'],
  blue: ['#2563EB', '#60A5FA', '#93C5FD', '#0F2557', '#0284C7'],
  crimson: ['#DC2626', '#F87171', '#FCA5A5', '#5C0F14', '#E11D48'],
};

export function getActiveSubjectVfxVariant(
  role: 'primary' | 'accent' | 'emerald' = 'primary'
): SakugaVfxVariant {
  if (role === 'emerald') return 'emerald';
  const is0606 =
    typeof document !== 'undefined' &&
    document.documentElement?.dataset?.subject === '0606';
  if (is0606) {
    return 'crimson';
  }
  return role === 'accent' ? 'blue' : 'blue';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Pure normalized slider progress ratio in [0, 1].
 */
export function computeSliderRatio(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * Pure anime spring squash & velocity tilt calculation for <SakugaSlider>.
 */
export function computeSliderVelocityEffects(
  deltaPx: number,
  dtMs: number
): { tiltDeg: number; squashX: number; squashY: number } {
  if (!Number.isFinite(deltaPx) || !Number.isFinite(dtMs) || dtMs <= 0) {
    return { tiltDeg: 0, squashX: 1, squashY: 1 };
  }
  const velocityPxPerSec = (deltaPx / Math.max(8, dtMs)) * 1000;
  const clampedV = Math.max(-1400, Math.min(1400, velocityPxPerSec));
  const absRatio = Math.min(1, Math.abs(clampedV) / 1400);
  const tiltDeg = Number(((clampedV / 1400) * 16).toFixed(2));
  const squashX = Number((1 + absRatio * 0.22).toFixed(3));
  const squashY = Number((1 - absRatio * 0.14).toFixed(3));
  return { tiltDeg, squashX, squashY };
}

/**
 * Pure deterministic burst generator for anime-inspired canvas impact VFX
 * (spark stars, radial impact lines, expanding ink ring, and smoke puffs).
 */
export function createSakugaBurstSpec(params: {
  originX: number;
  originY: number;
  variant?: SakugaVfxVariant;
  intensity?: SakugaBurstIntensity;
  label?: string;
  seed?: number;
  nowMs?: number;
}): SakugaBurstSpec {
  const variant = params.variant ?? 'indigo';
  const intensity = params.intensity ?? 'normal';
  const palette = VARIANT_PALETTES[variant];
  const nowMs = params.nowMs ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const baseSeed = typeof params.seed === 'number' ? params.seed : Math.round((params.originX * 13 + params.originY * 7) % 997);

  const rand = (idx: number) => {
    const raw = Math.sin(baseSeed * 12.9898 + idx * 78.233) * 43758.5453;
    return raw - Math.floor(raw);
  };

  const particles: SakugaParticle[] = [];

  const speedScale = intensity === 'micro' ? 0.58 : intensity === 'subtle' ? 0.78 : 1;
  const sizeScale = intensity === 'micro' ? 0.65 : intensity === 'subtle' ? 0.82 : 1;
  const lifeScale = intensity === 'micro' ? 0.65 : intensity === 'subtle' ? 0.8 : 1;
  const sparkCount = intensity === 'micro' ? 4 : intensity === 'subtle' ? 5 : 8;
  const rayCount = intensity === 'micro' ? 3 : intensity === 'subtle' ? 4 : 6;
  const puffCount = intensity === 'micro' ? 2 : intensity === 'subtle' ? 3 : 4;

  // Central impact ring (skip ring on micro typing sparks to stay light)
  if (intensity !== 'micro') {
    particles.push({
      x: params.originX,
      y: params.originY,
      vx: 0,
      vy: 0,
      size: 10 * sizeScale,
      kind: 'ring',
      color: palette[0],
      strokeColor: '#1D1A4A',
      alpha: intensity === 'subtle' ? 0.85 : 1,
      ageMs: 0,
      lifeMs: Math.round(420 * lifeScale),
      rotation: 0,
      spin: 0,
    });
  }

  // Crisp 4-point anime sparks
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 * i) / sparkCount + (rand(i + 1) - 0.5) * 0.38;
    const speed = (135 + rand(i + 20) * 140) * speedScale;
    particles.push({
      x: params.originX,
      y: params.originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 24 * speedScale,
      size: (6 + rand(i + 40) * 6) * sizeScale,
      kind: 'spark',
      color: palette[i % palette.length],
      strokeColor: '#1D1A4A',
      alpha: 1,
      ageMs: 0,
      lifeMs: Math.round((460 + rand(i + 60) * 140) * lifeScale),
      rotation: rand(i + 80) * Math.PI,
      spin: (rand(i + 90) - 0.5) * 8,
    });
  }

  // Manga impact rays
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 * i) / rayCount + 0.25 + (rand(i + 110) - 0.5) * 0.25;
    const speed = (180 + rand(i + 130) * 90) * speedScale;
    particles.push({
      x: params.originX + Math.cos(angle) * (10 * sizeScale),
      y: params.originY + Math.sin(angle) * (10 * sizeScale),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: (12 + rand(i + 150) * 10) * sizeScale,
      kind: 'line',
      color: i % 2 === 0 ? palette[0] : palette[4],
      strokeColor: '#1D1A4A',
      alpha: intensity === 'micro' ? 0.8 : 0.95,
      ageMs: 0,
      lifeMs: Math.round((320 + rand(i + 170) * 90) * lifeScale),
      rotation: angle,
      spin: 0,
    });
  }

  // Light sakura/lavender smoke puffs
  for (let i = 0; i < puffCount; i++) {
    const angle = (Math.PI * 2 * i) / puffCount + 0.5;
    const speed = (65 + rand(i + 200) * 55) * speedScale;
    particles.push({
      x: params.originX,
      y: params.originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 18 * speedScale,
      size: (7 + rand(i + 220) * 5) * sizeScale,
      kind: 'puff',
      color: '#FFFFFF',
      strokeColor: '#1D1A4A',
      alpha: intensity === 'micro' ? 0.72 : 0.9,
      ageMs: 0,
      lifeMs: Math.round((440 + rand(i + 240) * 100) * lifeScale),
      rotation: 0,
      spin: 0,
    });
  }

  return {
    originX: params.originX,
    originY: params.originY,
    variant,
    intensity,
    label: params.label,
    particles,
    createdAtMs: nowMs,
    durationMs: Math.round(620 * lifeScale),
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
let lastExplicitBurstMs = 0;

export interface BurstTargetLike {
  clientX?: number;
  clientY?: number;
  currentTarget?: EventTarget | null;
}

export function subscribeSakugaBursts(listener: BurstListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
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
  label?: string,
  options?: { intensity?: SakugaBurstIntensity; delegated?: boolean; coords?: { x: number; y: number } }
): boolean {
  if (prefersReducedMotion()) return false;
  const nowMs = Date.now();
  if (options?.delegated) {
    if (nowMs - lastExplicitBurstMs < 60) {
      return false;
    }
  } else {
    lastExplicitBurstMs = nowMs;
  }

  const coords = options?.coords ?? resolveBurstCoordinates(target);
  const spec = createSakugaBurstSpec({
    originX: coords.x,
    originY: coords.y,
    variant,
    intensity: options?.intensity ?? 'normal',
    label,
    seed: Math.round(nowMs % 10000),
  });
  for (const listener of listeners) {
    listener(spec);
  }
  return listeners.size > 0;
}
