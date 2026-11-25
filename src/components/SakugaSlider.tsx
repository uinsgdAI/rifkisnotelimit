import React, { useEffect, useRef, useState } from 'react';
import {
  computeSliderRatio,
  computeSliderVelocityEffects,
  triggerSakugaBurst,
  type SakugaVfxVariant,
} from '../utils/sakugaVfx';

interface SakugaSliderProps {
  id?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
  variant?: SakugaVfxVariant;
  size?: 'default' | 'compact';
  formatValue?: (value: number) => string;
  showValuePill?: boolean;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

export const SakugaSlider: React.FC<SakugaSliderProps> = ({
  id,
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  variant = 'indigo',
  size = 'default',
  formatValue,
  showValuePill = false,
  disabled = false,
  className = '',
  testId,
}) => {
  const trackWrapRef = useRef<HTMLDivElement | null>(null);
  const lastDragRef = useRef<{ x: number; t: number } | null>(null);
  const decayTimerRef = useRef<number | null>(null);
  const [fx, setFx] = useState({ tiltDeg: 0, squashX: 1, squashY: 1 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (decayTimerRef.current !== null) {
        window.clearTimeout(decayTimerRef.current);
      }
    };
  }, []);

  const ratio = computeSliderRatio(value, min, max);
  const thumbSize = size === 'compact' ? 18 : 22;
  const trackHeight = size === 'compact' ? 10 : 12;
  const fillColor =
    variant === 'sakura'
      ? '#FF5FA8'
      : variant === 'emerald'
        ? '#16A34A'
        : '#6D69F2';

  const scheduleDecay = () => {
    if (decayTimerRef.current !== null) {
      window.clearTimeout(decayTimerRef.current);
    }
    decayTimerRef.current = window.setTimeout(() => {
      setFx({ tiltDeg: 0, squashX: 1, squashY: 1 });
      decayTimerRef.current = null;
    }, 110);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
    if (!isDragging || disabled) return;
    const now = performance.now();
    const prev = lastDragRef.current;
    if (prev) {
      const nextFx = computeSliderVelocityEffects(e.clientX - prev.x, now - prev.t);
      setFx(nextFx);
      scheduleDecay();
    }
    lastDragRef.current = { x: e.clientX, t: now };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (disabled) return;
    setIsDragging(true);
    lastDragRef.current = { x: e.clientX, t: performance.now() };
    setFx({ tiltDeg: 0, squashX: 0.92, squashY: 1.08 });
  };

  const handleRelease = () => {
    if (!isDragging) return;
    const hadFastDrag = Math.abs(fx.tiltDeg) >= 3.5;
    setIsDragging(false);
    lastDragRef.current = null;
    setFx({ tiltDeg: 0, squashX: 1.12, squashY: 0.9 });
    scheduleDecay();

    const wrap = trackWrapRef.current;
    if (wrap && hadFastDrag && !disabled) {
      const rect = wrap.getBoundingClientRect();
      const thumbCenterX = rect.left + ratio * Math.max(0, rect.width - thumbSize) + thumbSize / 2;
      const thumbCenterY = rect.top + rect.height / 2;
      triggerSakugaBurst(null, variant, undefined, {
        intensity: 'micro',
        coords: { x: thumbCenterX, y: thumbCenterY },
      });
    }
  };

  const displayLabel = formatValue ? formatValue(value) : String(value);

  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center gap-2 ${size === 'compact' ? '' : 'w-full'} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      <div
        ref={trackWrapRef}
        className={`relative flex-1 flex items-center select-none ${
          size === 'compact' ? 'h-6 min-w-[78px]' : 'h-7 min-w-[110px]'
        }`}
      >
        <div
          aria-hidden="true"
          style={{ height: `${trackHeight}px` }}
          className={`w-full rounded-full border-2 border-[#1D1A4A] bg-white overflow-hidden ${
            size === 'compact' ? '' : 'shadow-[2px_2px_0_#B8B3FF]'
          }`}
        >
          <div
            style={{
              width: `calc(${ratio * 100}% + ${ratio > 0 ? 4 : 0}px)`,
              maxWidth: '100%',
              backgroundColor: fillColor,
            }}
            className="h-full transition-[width] duration-75"
          />
        </div>

        <span
          aria-hidden="true"
          style={{
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            left: `calc(${ratio} * (100% - ${thumbSize}px))`,
            transform: `scale(${fx.squashX}, ${fx.squashY})`,
            transition: isDragging
              ? 'transform 60ms ease-out'
              : 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), left 80ms ease-out',
          }}
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white border-[2.5px] border-[#1D1A4A] shadow-[1.5px_2px_0_#B8B3FF] pointer-events-none"
        />

        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handleRelease}
          onPointerCancel={handleRelease}
          className={`absolute inset-0 w-full h-full m-0 opacity-0 ${
            disabled ? 'cursor-not-allowed' : 'cursor-ew-resize'
          }`}
        />
      </div>

      {showValuePill && (
        <span
          aria-hidden="true"
          style={{
            transform: `rotate(${fx.tiltDeg}deg)`,
            transition: 'transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="shrink-0 min-w-[36px] px-1.5 py-0.5 text-center text-[11px] font-mono font-bold tabular-nums text-[#1D1A4A] bg-white border-2 border-[#1D1A4A] rounded-[8px] shadow-[1.5px_2px_0_#B8B3FF]"
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
};
