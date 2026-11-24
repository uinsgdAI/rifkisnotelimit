import React, { useEffect, useRef } from 'react';
import {
  prefersReducedMotion,
  stepSakugaParticle,
  subscribeSakugaBursts,
  type SakugaBurstSpec,
} from '../utils/sakugaVfx';

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  fill: string,
  stroke: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  const inner = r * 0.34;
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = (Math.PI / 4) * i;
    const px = Math.cos(angle) * rad;
    const py = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

export const SakugaCanvasOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bursts: SakugaBurstSpec[] = [];
    let rafId: number | null = null;
    let lastTimeMs = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const renderFrame = (nowMs: number) => {
      const dtSec = Math.min(0.05, Math.max(0.001, (nowMs - lastTimeMs) / 1000));
      lastTimeMs = nowMs;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let bIdx = bursts.length - 1; bIdx >= 0; bIdx--) {
        const burst = bursts[bIdx];
        const nextParticles = [];

        for (const particle of burst.particles) {
          const next = stepSakugaParticle(particle, dtSec);
          if (next.ageMs >= next.lifeMs) continue;
          nextParticles.push(next);

          ctx.save();
          ctx.globalAlpha = next.alpha;

          if (next.kind === 'ring') {
            const p = Math.min(1, next.ageMs / next.lifeMs);
            const radius = 10 + p * 48;
            ctx.beginPath();
            ctx.arc(next.x, next.y, radius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(1.5, 4.5 * (1 - p));
            ctx.strokeStyle = next.color;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(next.x, next.y, radius * 0.78, 0, Math.PI * 2);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = next.strokeColor;
            ctx.stroke();
          } else if (next.kind === 'line') {
            const len = next.size * (0.4 + 0.6 * next.alpha);
            const dx = Math.cos(next.rotation) * len;
            const dy = Math.sin(next.rotation) * len;
            ctx.beginPath();
            ctx.moveTo(next.x, next.y);
            ctx.lineTo(next.x + dx, next.y + dy);
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = next.color;
            ctx.stroke();
          } else if (next.kind === 'puff') {
            const p = Math.min(1, next.ageMs / next.lifeMs);
            const radius = next.size * (0.85 + p * 0.7);
            ctx.beginPath();
            ctx.arc(next.x, next.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = next.color;
            ctx.fill();
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = next.strokeColor;
            ctx.stroke();
          } else {
            drawFourPointStar(
              ctx,
              next.x,
              next.y,
              next.size,
              next.rotation,
              next.color,
              next.strokeColor
            );
          }

          ctx.restore();
        }

        // Pop-up comic impact caption
        const elapsed = nowMs - burst.createdAtMs;
        if (burst.label && elapsed < 520) {
          const p = Math.min(1, elapsed / 520);
          const popScale = p < 0.25 ? 0.65 + (p / 0.25) * 0.45 : 1.1 - p * 0.1;
          const riseY = burst.originY - 22 - p * 26;
          const alpha = p > 0.65 ? Math.max(0, 1 - (p - 0.65) / 0.35) : 1;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(burst.originX, riseY);
          ctx.rotate(-0.08);
          ctx.scale(popScale, popScale);
          ctx.font = '800 13px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#FFFFFF';
          ctx.strokeText(burst.label, 0, 0);
          ctx.fillStyle =
            burst.variant === 'emerald'
              ? '#15803D'
              : burst.variant === 'sakura'
                ? '#DB2777'
                : '#1D1A4A';
          ctx.fillText(burst.label, 0, 0);
          ctx.restore();
        }

        burst.particles = nextParticles;
        if (nextParticles.length === 0 && (!burst.label || elapsed >= 520)) {
          bursts.splice(bIdx, 1);
        }
      }

      if (bursts.length > 0) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        rafId = null;
      }
    };

    const unsub = subscribeSakugaBursts((spec) => {
      if (prefersReducedMotion()) return;
      bursts.push(spec);
      if (rafId === null) {
        lastTimeMs = performance.now();
        rafId = window.requestAnimationFrame(renderFrame);
      }
    });

    return () => {
      unsub();
      window.removeEventListener('resize', resize);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="sakuga-vfx-canvas"
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
};
