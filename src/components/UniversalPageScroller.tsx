import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUp } from 'lucide-react';
import {
  computeScrollThumbMetrics,
  computeScrollTopFromTrackY,
} from '../utils/pdfAnnotations';

const AUTO_HIDE_DELAY_MS = 1000;

export const UniversalPageScroller: React.FC = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{ active: boolean; grabOffsetRatio: number }>({
    active: false,
    grabOffsetRatio: 0.5,
  });
  const hideTimerRef = useRef<number | null>(null);
  const isMouseHoveringRef = useRef(false);
  const lastScrollTopRef = useRef<number>(
    typeof window !== 'undefined' ? window.scrollY || 0 : 0
  );

  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    trackHeight: 260,
  });

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      if (!draggingRef.current.active && !isMouseHoveringRef.current) {
        setIsVisible(false);
      }
      hideTimerRef.current = null;
    }, AUTO_HIDE_DELAY_MS);
  }, [clearHideTimer]);

  const revealTemporarily = useCallback(() => {
    if (
      typeof document !== 'undefined' &&
      document.body?.dataset.annotatorFullscreen === 'true'
    ) {
      return;
    }
    setIsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const syncMetrics = useCallback(() => {
    const doc = document.documentElement;
    const track = trackRef.current;
    const currentTop = window.scrollY || doc.scrollTop || 0;
    setMetrics({
      scrollTop: currentTop,
      scrollHeight: Math.max(doc.scrollHeight, document.body?.scrollHeight || 0),
      clientHeight: window.innerHeight || doc.clientHeight,
      trackHeight: track ? track.clientHeight : 260,
    });
    if (
      typeof document !== 'undefined' &&
      document.body?.dataset.annotatorFullscreen === 'true'
    ) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    syncMetrics();
    const onScroll = () => {
      const nextTop = window.scrollY || document.documentElement.scrollTop || 0;
      const moved = Math.abs(nextTop - lastScrollTopRef.current) >= 2;
      lastScrollTopRef.current = nextTop;
      syncMetrics();
      if (moved) {
        revealTemporarily();
      }
    };
    const onResize = () => syncMetrics();
    const onWindowPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-pdf-annotator-root]')) {
        isMouseHoveringRef.current = false;
        clearHideTimer();
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointerdown', onWindowPointerDown, { capture: true, passive: true });

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => syncMetrics());
      observer.observe(document.documentElement);
      if (document.body) observer.observe(document.body);
      if (trackRef.current) observer.observe(trackRef.current);
    }

    const timer = window.setInterval(syncMetrics, 800);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerdown', onWindowPointerDown, { capture: true });
      observer?.disconnect();
      window.clearInterval(timer);
      clearHideTimer();
    };
  }, [syncMetrics, revealTemporarily, clearHideTimer]);

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
    if (!thumb.canScroll || !isVisible) return;
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
    clearHideTimer();
    setIsVisible(true);
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
    scheduleHide();
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
    revealTemporarily();
  };

  const preventContextMenu = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
  };

  const handleDesktopMouseEnter = (e: React.PointerEvent<HTMLElement>) => {
    // Only wake on desktop mouse cursor; ignore touch/pen so right-handed stylus palms never trigger it
    if (e.pointerType !== 'mouse') return;
    isMouseHoveringRef.current = true;
    revealTemporarily();
  };

  const handleDesktopMouseLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    isMouseHoveringRef.current = false;
    scheduleHide();
  };

  if (!thumb.canScroll) {
    return null;
  }

  return (
    <>
      {/* Desktop-only slim mouse hover wake strip (never intercepts touch or stylus) */}
      <div
        aria-hidden="true"
        onPointerEnter={handleDesktopMouseEnter}
        className="hidden md:block fixed right-0 top-20 bottom-4 w-3 z-30"
      />

      <aside
        data-testid="universal-page-scroller"
        data-visible={isVisible ? 'true' : 'false'}
        aria-label="Universal page scroller"
        aria-hidden={!isVisible}
        onPointerEnter={handleDesktopMouseEnter}
        onPointerLeave={handleDesktopMouseLeave}
        onContextMenu={preventContextMenu}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        className={`fixed right-1.5 top-20 bottom-4 z-40 w-9 sm:w-10 bg-white/95 backdrop-blur-xs border-2 border-[#1D1A4A] rounded-[14px] shadow-[3px_3px_0_#B8B3FF] flex flex-col items-center overflow-hidden select-none transition-all duration-200 ${
          isVisible
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-3 pointer-events-none'
        }`}
      >
        <button
          type="button"
          tabIndex={isVisible ? 0 : -1}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            revealTemporarily();
          }}
          onContextMenu={preventContextMenu}
          aria-label="Scroll page to top"
          title="Back to top of page"
          className="w-full h-9 flex items-center justify-center text-[#5B57E8] hover:bg-[#F4F3FC] active:bg-[#B8B3FF]/40 border-b-[1.5px] border-[#DCDAF0] cursor-pointer"
        >
          <ChevronsUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          tabIndex={isVisible ? 0 : -1}
          onClick={() => scrollStep(-1)}
          onContextMenu={preventContextMenu}
          aria-label="Scroll page up"
          title="Scroll page up"
          className="w-full h-9 flex items-center justify-center text-[#1D1A4A] hover:bg-[#F4F3FC] active:bg-[#B8B3FF]/40 border-b-[1.5px] border-[#DCDAF0] cursor-pointer"
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
          className="relative flex-1 w-full bg-[#F4F3FC] cursor-pointer"
        >
          <div
            data-testid="universal-page-thumb"
            style={{
              height: `${thumb.thumbHeight}px`,
              transform: `translateY(${thumb.thumbTop}px)`,
            }}
            className="absolute inset-x-1 top-0 rounded-lg bg-[#6D69F2] hover:bg-[#5B57E8] border border-[#1D1A4A] shadow-xs flex flex-col items-center justify-center gap-1 pointer-events-none"
          >
            <span className="w-3.5 h-0.5 rounded-full bg-white/90" />
            <span className="text-[8px] font-mono font-bold text-white leading-none tracking-tighter">
              PAGE
            </span>
            <span className="w-3.5 h-0.5 rounded-full bg-white/90" />
          </div>
        </div>

        <button
          type="button"
          tabIndex={isVisible ? 0 : -1}
          onClick={() => scrollStep(1)}
          onContextMenu={preventContextMenu}
          aria-label="Scroll page down"
          title="Scroll page down"
          className="w-full h-9 flex items-center justify-center text-[#1D1A4A] hover:bg-[#F4F3FC] active:bg-[#B8B3FF]/40 border-t-[1.5px] border-[#DCDAF0] cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </aside>
    </>
  );
};
