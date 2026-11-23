import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUp } from 'lucide-react';
import {
  computeScrollThumbMetrics,
  computeScrollTopFromTrackY,
} from '../utils/pdfAnnotations';

export const UniversalPageScroller: React.FC = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ active: boolean; grabOffsetRatio: number }>({
    active: false,
    grabOffsetRatio: 0.5,
  });

  const [metrics, setMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    trackHeight: 260,
  });

  const syncMetrics = useCallback(() => {
    const doc = document.documentElement;
    const track = trackRef.current;
    setMetrics({
      scrollTop: window.scrollY || doc.scrollTop || 0,
      scrollHeight: Math.max(doc.scrollHeight, document.body?.scrollHeight || 0),
      clientHeight: window.innerHeight || doc.clientHeight,
      trackHeight: track ? track.clientHeight : 260,
    });
  }, []);

  useEffect(() => {
    syncMetrics();
    const onScroll = () => syncMetrics();
    const onResize = () => syncMetrics();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => syncMetrics());
      observer.observe(document.documentElement);
      if (document.body) observer.observe(document.body);
      if (trackRef.current) observer.observe(trackRef.current);
    }

    const timer = window.setInterval(syncMetrics, 600);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      window.clearInterval(timer);
    };
  }, [syncMetrics]);

  const thumb = useMemo(
    () =>
      computeScrollThumbMetrics({
        scrollTop: metrics.scrollTop,
        scrollHeight: metrics.scrollHeight,
        clientHeight: metrics.clientHeight,
        trackHeight: metrics.trackHeight,
        minThumbHeight: 60,
      }),
    [metrics]
  );

  const applyTrackY = useCallback(
    (clientY: number, grabOffsetRatio: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const doc = document.documentElement;
      const scrollHeight = Math.max(doc.scrollHeight, document.body?.scrollHeight || 0);
      const clientHeight = window.innerHeight || doc.clientHeight;

      const targetY = computeScrollTopFromTrackY({
        pointerY: clientY,
        trackTop: rect.top,
        trackHeight: rect.height,
        thumbHeight: thumb.thumbHeight,
        scrollHeight,
        clientHeight,
        grabOffsetRatio,
      });
      window.scrollTo({ top: targetY, behavior: 'auto' });
      syncMetrics();
    },
    [thumb.thumbHeight, syncMetrics]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!thumb.canScroll) return;
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    track.setPointerCapture(e.pointerId);

    const rect = track.getBoundingClientRect();
    const localY = e.clientY - rect.top;
    const hitThumb =
      localY >= thumb.thumbTop && localY <= thumb.thumbTop + thumb.thumbHeight;
    const grabRatio = hitThumb
      ? (localY - thumb.thumbTop) / Math.max(1, thumb.thumbHeight)
      : 0.5;

    draggingRef.current = { active: true, grabOffsetRatio: grabRatio };
    applyTrackY(e.clientY, grabRatio);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current.active) return;
    e.preventDefault();
    applyTrackY(e.clientY, draggingRef.current.grabOffsetRatio);
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current.active) return;
    draggingRef.current.active = false;
    const track = trackRef.current;
    if (track && track.hasPointerCapture(e.pointerId)) {
      try {
        track.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const scrollStep = (dir: -1 | 1) => {
    const delta = Math.max(220, Math.round(window.innerHeight * 0.65));
    window.scrollBy({ top: dir * delta, behavior: 'smooth' });
  };

  const preventContextMenu = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
  };

  if (!thumb.canScroll) {
    return null;
  }

  return (
    <aside
      data-testid="universal-page-scroller"
      aria-label="Universal page scroller"
      onContextMenu={preventContextMenu}
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      className="fixed right-1 top-20 bottom-4 z-40 w-9 sm:w-10 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-xl shadow-md flex flex-col items-center overflow-hidden select-none"
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onContextMenu={preventContextMenu}
        aria-label="Scroll page to top"
        title="Back to top of page"
        className="w-full h-9 flex items-center justify-center text-blue-700 hover:bg-blue-50 active:bg-blue-100 border-b border-slate-200 cursor-pointer"
      >
        <ChevronsUp className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => scrollStep(-1)}
        onContextMenu={preventContextMenu}
        aria-label="Scroll page up"
        title="Scroll page up"
        className="w-full h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 border-b border-slate-200 cursor-pointer"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <div
        ref={trackRef}
        data-testid="universal-page-track"
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        onPointerCancel={handleTrackPointerUp}
        onContextMenu={preventContextMenu}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        className="relative flex-1 w-full bg-slate-100 cursor-pointer"
      >
        <div
          data-testid="universal-page-thumb"
          style={{
            height: `${thumb.thumbHeight}px`,
            transform: `translateY(${thumb.thumbTop}px)`,
          }}
          className="absolute inset-x-1 top-0 rounded-lg bg-blue-700 hover:bg-blue-800 shadow-xs flex flex-col items-center justify-center gap-1 pointer-events-none"
        >
          <span className="w-3.5 h-0.5 rounded-full bg-white/80" />
          <span className="text-[8px] font-mono font-bold text-white leading-none tracking-tighter">
            PAGE
          </span>
          <span className="w-3.5 h-0.5 rounded-full bg-white/80" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollStep(1)}
        onContextMenu={preventContextMenu}
        aria-label="Scroll page down"
        title="Scroll page down"
        className="w-full h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 border-t border-slate-200 cursor-pointer"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </aside>
  );
};
