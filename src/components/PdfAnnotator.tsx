import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eraser,
  Hand,
  Highlighter,
  Loader2,
  Maximize2,
  Minimize2,
  PanelLeft,
  Pen,
  Redo2,
  RotateCw,
  Ruler,
  Shield,
  Trash2,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  acquireFullscreenBodyLock,
  buildPdfByteCandidateUrls,
  capturePdfZoomAnchor,
  clampStrokeSize,
  cloneAnnotationsMap,
  computeAnchoredScrollPosition,
  computeFitWidthZoom,
  computePageJumpScrollTop,
  computeScrollThumbMetrics,
  computeScrollTopFromTrackY,
  computeTwoFingerPanAndZoom,
  countTotalStrokes,
  createInitialAnnotationHistory,
  eraseBrushAlongSegment,
  estimateVisiblePage,
  evaluateTwoFingerPinchEngagement,
  fetchPdfBytesWithFallback,
  loadPaperAnnotations,
  nextScrollRailSide,
  normalizePointerToPage,
  PALM_LOCK_STORAGE_KEY,
  pushAnnotationHistory,
  redoAnnotationHistory,
  renderStrokesToCanvas,
  resolveAnnotatorContainerClasses,
  resolveStrokeSizeFromPreset,
  savePaperAnnotations,
  SCROLL_RAIL_SIDE_STORAGE_KEY,
  shouldIgnoreSinglePointerForPalmLock,
  shouldStartSinglePointerBackgroundPan,
  snapClientPointToRulerEdge,
  STROKE_SIZE_BOUNDS,
  undoAnnotationHistory,
  type AnnotationHistoryState,
  type AnnotationStroke,
  type AnnotationTool,
  type NormalizedPoint,
  type PaperAnnotationsMap,
  type PdfZoomAnchor,
  type RulerClientGeometry,
  type ScrollRailSide,
  type StrokeWidthPresetId,
} from '../utils/pdfAnnotations';
import { loadPdfDocumentFast } from '../utils/pdfJsCache';
import { SakugaSlider } from './SakugaSlider';

interface PdfAnnotatorProps {
  sourceUrl: string;
  externalUrl?: string;
  paperKey: string;
  paperTitle: string;
  heightClass?: string;
  isParentFullscreen?: boolean;
  initialTool?: AnnotationTool;
  initialPenColorHex?: string;
  initialWidthPreset?: StrokeWidthPresetId;
  onFallbackViewer?: () => void;
}

const PEN_COLORS = [
  { id: 'ink', label: 'Black Ink', hex: '#0f172a' },
  { id: 'blue', label: 'Blue Ink', hex: '#1d4ed8' },
  { id: 'red', label: 'Red Marking', hex: '#dc2626' },
  { id: 'green', label: 'Green Check', hex: '#059669' },
];

const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Yellow Highlighter', hex: '#facc15' },
  { id: 'cyan', label: 'Cyan Highlighter', hex: '#38bdf8' },
  { id: 'pink', label: 'Pink Highlighter', hex: '#f472b6' },
];

interface PageDimension {
  pageNumber: number;
  width: number;
  height: number;
}

interface PdfPageCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  baseDim?: { width: number; height: number };
  fallbackDim?: { width: number; height: number };
  scale: number;
  strokes: AnnotationStroke[];
  activeTool: AnnotationTool;
  activeColor: string;
  activeSize: number;
  eraserSize: number;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  isMultiTouchActiveRef: React.MutableRefObject<boolean>;
  multiTouchSignal: number;
  palmLock: boolean;
  onDetectStylus?: () => void;
  getRulerGeometry: () => RulerClientGeometry | null;
  onCommitStroke: (pageNumber: number, stroke: AnnotationStroke) => void;
  onEraseSegment: (
    pageNumber: number,
    fromPoint: NormalizedPoint,
    toPoint: NormalizedPoint,
    beginSession: boolean
  ) => void;
  registerCanvases: (
    pageNumber: number,
    refs: { pdfCanvas: HTMLCanvasElement | null; drawCanvas: HTMLCanvasElement | null }
  ) => void;
}

const EMPTY_STROKES: AnnotationStroke[] = [];

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = React.memo(({
  pdfDoc,
  pageNumber,
  baseDim,
  fallbackDim,
  scale,
  strokes,
  activeTool,
  activeColor,
  activeSize,
  eraserSize,
  scrollRootRef,
  isMultiTouchActiveRef,
  multiTouchSignal,
  palmLock,
  onDetectStylus,
  getRulerGeometry,
  onCommitStroke,
  onEraseSegment,
  registerCanvases,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveStrokeRef = useRef<AnnotationStroke | null>(null);
  const snappedEdgeRef = useRef<'top' | 'bottom' | null>(null);
  const isDrawingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const activePointerTypeRef = useRef<string>('mouse');
  const sawButtonsOnDownRef = useRef(false);
  const windowListenersCleanupRef = useRef<(() => void) | null>(null);
  const activeEraseModeRef = useRef(false);
  const lastErasePointRef = useRef<NormalizedPoint | null>(null);
  const liveEraseCursorRef = useRef<NormalizedPoint | null>(null);
  const [renderedDims, setRenderedDims] = useState<{ width: number; height: number } | null>(null);
  const [isNearViewport, setIsNearViewport] = useState<boolean>(pageNumber <= 2);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsNearViewport(entry.isIntersecting || pageNumber <= 2);
        }
      },
      {
        root: scrollRootRef.current,
        rootMargin: '850px 0px',
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, scrollRootRef]);

  const effectiveBaseDim = baseDim ?? fallbackDim;

  const displayDims = useMemo(() => {
    if (effectiveBaseDim) {
      return {
        width: Math.max(1, Math.floor(effectiveBaseDim.width * scale)),
        height: Math.max(1, Math.floor(effectiveBaseDim.height * scale)),
      };
    }
    return renderedDims;
  }, [effectiveBaseDim, scale, renderedDims]);

  useEffect(() => {
    registerCanvases(pageNumber, {
      pdfCanvas: pdfCanvasRef.current,
      drawCanvas: drawCanvasRef.current,
    });
    return () => {
      registerCanvases(pageNumber, { pdfCanvas: null, drawCanvas: null });
    };
  }, [pageNumber, registerCanvases]);

  // Render PDF page bitmap via pdf.js only when near the scroll viewport
  useEffect(() => {
    if (!isNearViewport) return;
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    pdfDoc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const canvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      if (!canvas || !drawCanvas) return;

      const cssW = Math.floor(viewport.width);
      const cssH = Math.floor(viewport.height);

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      drawCanvas.width = Math.floor(viewport.width * dpr);
      drawCanvas.height = Math.floor(viewport.height * dpr);

      setRenderedDims({ width: cssW, height: cssH });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      renderTask = page.render({
        canvas,
        canvasContext: ctx,
        viewport,
      });

      renderTask.promise.catch(() => {
        // ignore cancel errors during fast zoom or document switch
      });
    });

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, scale, isNearViewport]);

  const redrawOverlay = useCallback(() => {
    if (!isNearViewport) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const all = liveStrokeRef.current ? [...strokes, liveStrokeRef.current] : strokes;
    renderStrokesToCanvas(ctx, all, cssWidth, cssHeight, scale);

    if (liveEraseCursorRef.current) {
      const ex = liveEraseCursorRef.current.x * cssWidth;
      const ey = liveEraseCursorRef.current.y * cssHeight;
      const radiusPx = Math.max(2, (eraserSize / 2) * scale);
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, radiusPx, 0, Math.PI * 2);
      ctx.fillStyle = activeEraseModeRef.current
        ? 'rgba(255, 95, 168, 0.22)'
        : 'rgba(255, 95, 168, 0.12)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(192, 38, 107, 0.88)';
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes, scale, eraserSize, isNearViewport]);

  useEffect(() => {
    redrawOverlay();
  }, [redrawOverlay, displayDims, renderedDims]);

  useEffect(() => {
    if (activeTool !== 'eraser' && !activeEraseModeRef.current && liveEraseCursorRef.current) {
      liveEraseCursorRef.current = null;
      redrawOverlay();
    }
  }, [activeTool, redrawOverlay]);

  const detachWindowStrokeListeners = useCallback(() => {
    if (windowListenersCleanupRef.current) {
      windowListenersCleanupRef.current();
      windowListenersCleanupRef.current = null;
    }
  }, []);

  const resetActiveGesture = useCallback(
    (clearCursor = true) => {
      detachWindowStrokeListeners();
      isDrawingRef.current = false;
      activePointerIdRef.current = null;
      sawButtonsOnDownRef.current = false;
      activeEraseModeRef.current = false;
      lastErasePointRef.current = null;
      if (clearCursor) {
        liveEraseCursorRef.current = null;
      }
      liveStrokeRef.current = null;
      snappedEdgeRef.current = null;
      redrawOverlay();
    },
    [detachWindowStrokeListeners, redrawOverlay]
  );

  useEffect(() => {
    return () => {
      detachWindowStrokeListeners();
    };
  }, [detachWindowStrokeListeners]);

  useEffect(() => {
    if (multiTouchSignal === 0) return;
    if (
      activePointerTypeRef.current === 'touch' &&
      (isDrawingRef.current || liveStrokeRef.current || activeEraseModeRef.current)
    ) {
      resetActiveGesture(true);
    }
  }, [multiTouchSignal, resetActiveGesture]);

  const completeActiveGesture = useCallback(
    (pointerId: number, pointerType: string, eventType: string) => {
      if (!isDrawingRef.current) return;
      if (
        activePointerIdRef.current !== null &&
        activePointerIdRef.current !== pointerId &&
        eventType !== 'pointercancel' &&
        eventType !== 'blur'
      ) {
        return;
      }

      detachWindowStrokeListeners();
      isDrawingRef.current = false;
      activePointerIdRef.current = null;
      sawButtonsOnDownRef.current = false;

      const canvas = drawCanvasRef.current;
      if (canvas && typeof canvas.hasPointerCapture === 'function') {
        try {
          if (canvas.hasPointerCapture(pointerId)) {
            canvas.releasePointerCapture(pointerId);
          }
        } catch {
          // ignore
        }
      }

      if (pointerType === 'touch' && isMultiTouchActiveRef.current) {
        activeEraseModeRef.current = false;
        lastErasePointRef.current = null;
        liveEraseCursorRef.current = null;
        liveStrokeRef.current = null;
        snappedEdgeRef.current = null;
        redrawOverlay();
        return;
      }

      if (activeEraseModeRef.current) {
        activeEraseModeRef.current = false;
        lastErasePointRef.current = null;
        if (
          (pointerType !== 'mouse' && pointerType !== 'pen') ||
          activeTool !== 'eraser' ||
          eventType !== 'pointerup'
        ) {
          liveEraseCursorRef.current = null;
        }
        redrawOverlay();
        return;
      }

      snappedEdgeRef.current = null;
      if (activeTool !== 'eraser' && liveStrokeRef.current) {
        const committed = liveStrokeRef.current;
        liveStrokeRef.current = null;
        onCommitStroke(pageNumber, committed);
      }
    },
    [activeTool, detachWindowStrokeListeners, isMultiTouchActiveRef, onCommitStroke, pageNumber, redrawOverlay]
  );

  const processActivePointerMove = useCallback(
    (
      pointerId: number,
      pointerType: string,
      buttons: number,
      clientX: number,
      clientY: number
    ) => {
      if (pointerType === 'touch' && isMultiTouchActiveRef.current) {
        if (isDrawingRef.current || activeEraseModeRef.current) {
          resetActiveGesture(true);
        }
        return;
      }

      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      if (!isDrawingRef.current) {
        if (activeTool === 'eraser' && (pointerType === 'mouse' || pointerType === 'pen')) {
          liveEraseCursorRef.current = normalizePointerToPage(clientX, clientY, rect);
          redrawOverlay();
        }
        return;
      }

      if (activePointerIdRef.current !== null && activePointerIdRef.current !== pointerId) {
        return;
      }

      // Recover cleanly if mouse or S Pen lifted into hover without firing pointerup
      if (
        sawButtonsOnDownRef.current &&
        pointerType !== 'touch' &&
        (buttons & (1 | 2 | 32)) === 0
      ) {
        completeActiveGesture(pointerId, pointerType, 'pointerup');
        return;
      }

      if (activeTool === 'pan' && !activeEraseModeRef.current) return;

      if (activeEraseModeRef.current || activeTool === 'eraser') {
        const pt = normalizePointerToPage(clientX, clientY, rect);
        const prevPt = lastErasePointRef.current ?? pt;
        onEraseSegment(pageNumber, prevPt, pt, false);
        lastErasePointRef.current = pt;
        liveEraseCursorRef.current = pt;
        redrawOverlay();
        return;
      }

      if (!liveStrokeRef.current) return;

      if (snappedEdgeRef.current) {
        const ruler = getRulerGeometry();
        if (ruler) {
          const snap = snapClientPointToRulerEdge(clientX, clientY, ruler, {
            forcedEdge: snappedEdgeRef.current,
          });
          const endPt = normalizePointerToPage(snap.clientX, snap.clientY, rect);
          const startPt = liveStrokeRef.current.points[0];
          liveStrokeRef.current.points = [startPt, endPt];
          redrawOverlay();
          return;
        }
      }

      const point = normalizePointerToPage(clientX, clientY, rect);
      const prev = liveStrokeRef.current.points[liveStrokeRef.current.points.length - 1];
      if (Math.hypot(point.x - prev.x, point.y - prev.y) < 0.0012) {
        return;
      }
      liveStrokeRef.current.points.push(point);
      redrawOverlay();
    },
    [
      activeTool,
      completeActiveGesture,
      getRulerGeometry,
      isMultiTouchActiveRef,
      onEraseSegment,
      pageNumber,
      redrawOverlay,
      resetActiveGesture,
    ]
  );

  const attachWindowStrokeListeners = useCallback(
    (trackedPointerId: number, trackedPointerType: string) => {
      detachWindowStrokeListeners();
      const canvas = drawCanvasRef.current;

      const onWinMove = (ev: PointerEvent) => {
        if (ev.pointerId !== trackedPointerId) return;
        if (canvas && ev.target === canvas) return;
        processActivePointerMove(
          ev.pointerId,
          ev.pointerType || trackedPointerType,
          ev.buttons,
          ev.clientX,
          ev.clientY
        );
      };
      const onWinEnd = (ev: PointerEvent) => {
        if (ev.pointerId !== trackedPointerId) return;
        if (canvas && ev.target === canvas) return;
        completeActiveGesture(ev.pointerId, ev.pointerType || trackedPointerType, ev.type);
      };
      const onWinBlur = () => {
        completeActiveGesture(trackedPointerId, trackedPointerType, 'blur');
      };

      window.addEventListener('pointermove', onWinMove);
      window.addEventListener('pointerup', onWinEnd);
      window.addEventListener('pointercancel', onWinEnd);
      window.addEventListener('blur', onWinBlur);

      windowListenersCleanupRef.current = () => {
        window.removeEventListener('pointermove', onWinMove);
        window.removeEventListener('pointerup', onWinEnd);
        window.removeEventListener('pointercancel', onWinEnd);
        window.removeEventListener('blur', onWinBlur);
      };
    },
    [completeActiveGesture, detachWindowStrokeListeners, processActivePointerMove]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pan') return;
    if (e.pointerType === 'pen') {
      onDetectStylus?.();
    }
    if (
      shouldIgnoreSinglePointerForPalmLock({
        palmLockActive: palmLock,
        activeTool,
        pointerType: e.pointerType,
      })
    ) {
      // Let single-finger touch bubble up cleanly to scroll container in S Pen Mode
      return;
    }
    const isHardwarePenEraser =
      e.pointerType === 'pen' && (e.button === 5 || (e.buttons & 32) !== 0);
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    if (e.pointerType === 'touch' && isMultiTouchActiveRef.current) {
      resetActiveGesture(true);
      return;
    }

    // If an earlier pointer somehow missed pointerup/pointercancel, finalize it instead of deadlocking future strokes/erases
    if (
      isDrawingRef.current &&
      activePointerIdRef.current !== null &&
      activePointerIdRef.current !== e.pointerId
    ) {
      if (e.isPrimary || e.pointerType === 'pen' || e.pointerType === 'mouse') {
        completeActiveGesture(activePointerIdRef.current, activePointerTypeRef.current, 'pointercancel');
      } else {
        return;
      }
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore if synthetic pointer
    }

    const rect = canvas.getBoundingClientRect();
    activePointerIdRef.current = e.pointerId;
    activePointerTypeRef.current = e.pointerType;
    sawButtonsOnDownRef.current = e.buttons !== 0;
    attachWindowStrokeListeners(e.pointerId, e.pointerType);

    if (activeTool === 'eraser' || isHardwarePenEraser) {
      const point = normalizePointerToPage(e.clientX, e.clientY, rect);
      isDrawingRef.current = true;
      activeEraseModeRef.current = true;
      lastErasePointRef.current = point;
      liveEraseCursorRef.current = point;
      onEraseSegment(pageNumber, point, point, true);
      redrawOverlay();
      return;
    }

    const ruler = getRulerGeometry();
    const snap = ruler
      ? snapClientPointToRulerEdge(e.clientX, e.clientY, ruler, { snapThresholdPx: 32 })
      : null;

    snappedEdgeRef.current = snap?.snapped ? snap.edge : null;
    const point = normalizePointerToPage(
      snap?.snapped ? snap.clientX : e.clientX,
      snap?.snapped ? snap.clientY : e.clientY,
      rect
    );

    isDrawingRef.current = true;
    activeEraseModeRef.current = false;
    liveStrokeRef.current = {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tool: activeTool,
      color: activeColor,
      size: activeSize,
      points: [point],
    };
    redrawOverlay();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    processActivePointerMove(
      e.pointerId,
      e.pointerType,
      e.buttons,
      e.clientX,
      e.clientY
    );
  };

  const finishStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    completeActiveGesture(e.pointerId, e.pointerType, e.type);
  };

  const handlePointerLeave = () => {
    if (!isDrawingRef.current && liveEraseCursorRef.current) {
      liveEraseCursorRef.current = null;
      redrawOverlay();
    }
  };

  return (
    <div
      ref={wrapperRef}
      data-pdf-page={pageNumber}
      className="relative mx-auto bg-white shadow-sm border border-slate-200 select-none"
      style={
        displayDims
          ? { width: `${displayDims.width}px`, height: `${displayDims.height}px` }
          : undefined
      }
    >
      <canvas ref={pdfCanvasRef} className="block w-full h-full" />
      <canvas
        ref={drawCanvasRef}
        data-testid={`pdf-annot-canvas-${pageNumber}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        className={`absolute inset-0 block w-full h-full ${
          activeTool === 'pan'
            ? 'pointer-events-none cursor-grab'
            : activeTool === 'eraser'
              ? 'cursor-none'
              : 'cursor-crosshair'
        }`}
      />
      <div className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/90 border-t border-l border-slate-200 absolute bottom-0 right-0 pointer-events-none">
        Page {pageNumber}
      </div>
    </div>
  );
});

export const PdfAnnotator: React.FC<PdfAnnotatorProps> = ({
  sourceUrl,
  externalUrl,
  paperKey,
  paperTitle,
  heightClass = 'h-[620px]',
  isParentFullscreen = false,
  initialTool = 'pen',
  initialPenColorHex = PEN_COLORS[1].hex,
  initialWidthPreset = 'fine',
  onFallbackViewer,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [basePageDims, setBasePageDims] = useState<
    Record<number, { width: number; height: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localOverrideUrl, setLocalOverrideUrl] = useState<string | null>(null);
  const localUploadRef = useRef<HTMLInputElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [zoomCommitSeq, setZoomCommitSeq] = useState(0);
  const [pinchPreview, setPinchPreview] = useState({ scale: 1, tx: 0, ty: 0 });
  const [tool, setTool] = useState<AnnotationTool>(initialTool);
  const [penColor, setPenColor] = useState(initialPenColorHex);
  const [hlColor, setHlColor] = useState(HIGHLIGHT_COLORS[0].hex);
  const [penSize, setPenSize] = useState<number>(() =>
    resolveStrokeSizeFromPreset('pen', initialWidthPreset)
  );
  const [hlSize, setHlSize] = useState<number>(() =>
    resolveStrokeSizeFromPreset('highlighter', initialWidthPreset)
  );
  const [eraserSize, setEraserSize] = useState<number>(STROKE_SIZE_BOUNDS.eraser.defaultSize);
  const [activeExportPage, setActiveExportPage] = useState(1);

  const [rulerEnabled, setRulerEnabled] = useState(false);
  const [rulerState, setRulerState] = useState({
    xPct: 50,
    yPct: 45,
    angleDeg: 0,
    lengthPx: 360,
    thicknessPx: 42,
  });

  // Right-handed ergonomic defaults: Left-edge auto-hide scroll rail + S Pen Palm Lock
  const [railSide, setRailSide] = useState<ScrollRailSide>(() => {
    if (typeof window === 'undefined') return 'left';
    try {
      const saved = window.localStorage.getItem(SCROLL_RAIL_SIDE_STORAGE_KEY);
      if (saved === 'left' || saved === 'right' || saved === 'off') return saved;
    } catch {
      // ignore storage errors
    }
    return 'left';
  });
  // S Pen Mode ON by default: S Pen & mouse draw/highlight/erase; finger touch scrolls
  const [palmLock, setPalmLock] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem(PALM_LOCK_STORAGE_KEY);
      if (saved === 'false') return false;
      if (saved === 'true') return true;
    } catch {
      // ignore
    }
    return true;
  });
  const manualPalmOverrideRef = useRef(false);
  const activePenPointerIdsRef = useRef<Set<number>>(new Set());
  const lastStylusActivityAtRef = useRef<number>(0);

  const [history, setHistory] = useState<AnnotationHistoryState>(() =>
    createInitialAnnotationHistory(loadPaperAnnotations(paperKey))
  );

  const annotatorRootRef = useRef<HTMLDivElement | null>(null);
  const enteredNativeFsRef = useRef(false);
  const viewportBoxRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pagesStackRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollAnchorRef = useRef<(PdfZoomAnchor & { pinToTop?: boolean }) | null>(null);
  const singlePanRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });
  const draggingRailRef = useRef<{ active: boolean; grabOffsetRatio: number }>({
    active: false,
    grabOffsetRatio: 0.5,
  });
  const railHideTimerRef = useRef<number | null>(null);
  const isRailMouseHoverRef = useRef(false);
  const lastPdfScrollTopRef = useRef(0);
  const [isRailVisible, setIsRailVisible] = useState(false);
  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    trackHeight: 400,
  });

  // Multi-touch 2-finger pan/scroll + pinch-to-zoom state
  const activeTouchPointersRef = useRef<Map<number, { x: number; y: number; updatedAt: number }>>(new Map());
  const isMultiTouchActiveRef = useRef(false);
  const [multiTouchSignal, setMultiTouchSignal] = useState(0);
  const twoFingerSessionRef = useRef<{
    active: boolean;
    startDist: number;
    startMidX: number;
    startMidY: number;
    lastMidX: number;
    lastMidY: number;
    startScrollLeft: number;
    startScrollTop: number;
    movedPointerIds: Set<number>;
    pendingPinchSinceMs: number | null;
    pinchEngaged: boolean;
    pinchStartDist: number;
    pinchStartZoom: number;
    pinchStartMidX: number;
    pinchStartMidY: number;
    pinchAnchorInnerX: number;
    pinchAnchorInnerY: number;
    targetZoom: number;
  }>({
    active: false,
    startDist: 0,
    startMidX: 0,
    startMidY: 0,
    lastMidX: 0,
    lastMidY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    movedPointerIds: new Set<number>(),
    pendingPinchSinceMs: null,
    pinchEngaged: false,
    pinchStartDist: 0,
    pinchStartZoom: 1,
    pinchStartMidX: 0,
    pinchStartMidY: 0,
    pinchAnchorInnerX: 0,
    pinchAnchorInnerY: 0,
    targetZoom: 1,
  });

  // Ruler drag/rotate state
  const rulerDragRef = useRef<
    | { mode: 'none' }
    | { mode: 'move'; startX: number; startY: number; startXPct: number; startYPct: number }
    | { mode: 'rotate'; centerX: number; centerY: number }
  >({ mode: 'none' });

  const rulerEnabledRef = useRef(rulerEnabled);
  rulerEnabledRef.current = rulerEnabled;
  const rulerStateRef = useRef(rulerState);
  rulerStateRef.current = rulerState;

  const pageCanvasesRef = useRef<
    Record<number, { pdfCanvas: HTMLCanvasElement | null; drawCanvas: HTMLCanvasElement | null }>
  >({});

  const scrollRafRef = useRef<number | null>(null);

  const clearRailHideTimer = useCallback(() => {
    if (railHideTimerRef.current !== null) {
      window.clearTimeout(railHideTimerRef.current);
      railHideTimerRef.current = null;
    }
  }, []);

  const scheduleRailHide = useCallback(() => {
    clearRailHideTimer();
    railHideTimerRef.current = window.setTimeout(() => {
      if (!draggingRailRef.current.active && !isRailMouseHoverRef.current) {
        setIsRailVisible(false);
      }
      railHideTimerRef.current = null;
    }, 1400);
  }, [clearRailHideTimer]);

  const revealRailTemporarily = useCallback(() => {
    if (railSide === 'off') return;
    setIsRailVisible(true);
    scheduleRailHide();
  }, [railSide, scheduleRailHide]);

  const syncScrollMetrics = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = containerRef.current;
      const track = trackRef.current;
      if (!el) return;
      const next = {
        scrollTop: Math.round(el.scrollTop),
        scrollHeight: Math.round(el.scrollHeight),
        clientHeight: Math.round(el.clientHeight),
        trackHeight: track ? Math.round(track.clientHeight) : 400,
      };
      lastPdfScrollTopRef.current = next.scrollTop;
      setScrollState((prev) =>
        prev.scrollTop === next.scrollTop &&
        prev.scrollHeight === next.scrollHeight &&
        prev.clientHeight === next.clientHeight &&
        prev.trackHeight === next.trackHeight
          ? prev
          : next
      );
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const raf = window.requestAnimationFrame(syncScrollMetrics);
    const timer = window.setTimeout(syncScrollMetrics, 250);
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => syncScrollMetrics());
      observer.observe(el);
      if (trackRef.current) observer.observe(trackRef.current);
    }
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      clearRailHideTimer();
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      observer?.disconnect();
    };
  }, [pdfDoc, numPages, zoom, loading, isFullscreen, isParentFullscreen, railSide, syncScrollMetrics, clearRailHideTimer]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCROLL_RAIL_SIDE_STORAGE_KEY, railSide);
    } catch {
      // ignore
    }
    if (railSide === 'off') {
      setIsRailVisible(false);
      clearRailHideTimer();
    }
  }, [railSide, clearRailHideTimer]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PALM_LOCK_STORAGE_KEY, String(palmLock));
    } catch {
      // ignore
    }
  }, [palmLock]);

  const handleDetectStylus = useCallback(() => {
    if (!manualPalmOverrideRef.current) {
      setPalmLock((prev) => (prev ? prev : true));
    }
  }, []);

  const handleTogglePalmLock = useCallback(() => {
    setPalmLock((prev) => {
      const next = !prev;
      manualPalmOverrideRef.current = !next;
      return next;
    });
  }, []);

  const handleCycleRailSide = useCallback(() => {
    setRailSide((prev) => {
      const next = nextScrollRailSide(prev);
      if (next !== 'off') {
        setIsRailVisible(true);
        scheduleRailHide();
      }
      return next;
    });
  }, [scheduleRailHide]);

  // Sync annotations map & default tool/stroke width when switching papers
  useEffect(() => {
    setHistory(createInitialAnnotationHistory(loadPaperAnnotations(paperKey)));
    setActiveExportPage(1);
    setTool(initialTool);
    setPenColor(initialPenColorHex);
    setPenSize(resolveStrokeSizeFromPreset('pen', initialWidthPreset));
    setHlSize(resolveStrokeSizeFromPreset('highlighter', initialWidthPreset));
  }, [paperKey, initialTool, initialPenColorHex, initialWidthPreset]);

  // Persist changes to localStorage
  useEffect(() => {
    savePaperAnnotations(paperKey, history.present);
  }, [paperKey, history.present]);

  // Reset any temporary offline file override when switching source PDFs
  useEffect(() => {
    setLocalOverrideUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [sourceUrl, externalUrl]);

  // Fetch PDF bytes (with cache + direct CORS/proxy fallback), reuse shared PDFWorker + doc cache, and display Page 1 immediately
  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();
    let disposeDoc: (() => void) | null = null;

    setLoading(true);
    setErrorMsg(null);
    setPdfDoc(null);
    setBasePageDims({});

    const candidates = localOverrideUrl
      ? [localOverrideUrl]
      : buildPdfByteCandidateUrls(sourceUrl, externalUrl);
    const cacheKey = candidates[0] || sourceUrl;

    (async () => {
      try {
        const result = await loadPdfDocumentFast({
          cacheKey,
          useCache: !localOverrideUrl,
          signal: abortController.signal,
          getBytes: async () => {
            const { bytes } = await fetchPdfBytesWithFallback(candidates, {
              signal: abortController.signal,
            });
            return bytes;
          },
        });
        disposeDoc = result.dispose;
        if (cancelled) {
          disposeDoc();
          return;
        }

        const { doc, firstPageDims } = result;
        setBasePageDims({ 1: firstPageDims });
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);

        // Hydrate remaining pages' exact dimensions lazily in small batches without blocking Page 1
        if (doc.numPages > 1) {
          (async () => {
            const batchSize = 4;
            for (let start = 2; start <= doc.numPages; start += batchSize) {
              if (cancelled) return;
              const pageSlice = Array.from(
                { length: Math.min(batchSize, doc.numPages - start + 1) },
                (_, i) => start + i
              );
              const entries = await Promise.all(
                pageSlice.map(async (pNum) => {
                  const pg = await doc.getPage(pNum);
                  const vp = pg.getViewport({ scale: 1 });
                  return [pNum, { width: vp.width, height: vp.height }] as const;
                })
              );
              if (cancelled) return;
              setBasePageDims((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
            }
          })().catch(() => undefined);
        }
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        const reason = err instanceof Error && err.message ? err.message : 'Unable to fetch or parse PDF bytes.';
        setErrorMsg(
          `Could not load PDF bytes for canvas annotation (${reason}). You can switch to Web Viewer, open the PDF directly, or upload a local PDF file to scribble on offline.`
        );
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      abortController.abort();
      if (disposeDoc) {
        disposeDoc();
      }
    };
  }, [sourceUrl, externalUrl, localOverrideUrl]);

  const registerCanvases = useCallback(
    (
      pageNumber: number,
      refs: { pdfCanvas: HTMLCanvasElement | null; drawCanvas: HTMLCanvasElement | null }
    ) => {
      pageCanvasesRef.current[pageNumber] = refs;
    },
    []
  );

  const liveAnnotationsRef = useRef<PaperAnnotationsMap>(history.present);
  useEffect(() => {
    liveAnnotationsRef.current = history.present;
  }, [history.present]);
  const eraserSizeRef = useRef(eraserSize);
  eraserSizeRef.current = eraserSize;
  const basePageDimsRef = useRef(basePageDims);
  basePageDimsRef.current = basePageDims;
  const eraseGestureHasPushedRef = useRef(false);

  const handleCommitStroke = useCallback((pageNumber: number, stroke: AnnotationStroke) => {
    setActiveExportPage(pageNumber);
    const nextMap = cloneAnnotationsMap(liveAnnotationsRef.current);
    nextMap[pageNumber] = [...(nextMap[pageNumber] || []), stroke];
    liveAnnotationsRef.current = nextMap;
    setHistory((prev) => pushAnnotationHistory(prev, nextMap));
  }, []);

  const handleEraseSegment = useCallback(
    (
      pageNumber: number,
      fromPoint: NormalizedPoint,
      toPoint: NormalizedPoint,
      beginSession: boolean
    ) => {
      if (beginSession) {
        eraseGestureHasPushedRef.current = false;
      }
      const currentList = liveAnnotationsRef.current[pageNumber] || [];
      if (currentList.length === 0) return;

      const pageDims =
        basePageDimsRef.current[pageNumber] ??
        basePageDimsRef.current[1] ?? { width: 595, height: 842 };

      const { remaining, removedAny } = eraseBrushAlongSegment(
        currentList,
        fromPoint,
        toPoint,
        eraserSizeRef.current,
        pageDims
      );
      if (!removedAny) return;

      const nextMap: PaperAnnotationsMap = { ...liveAnnotationsRef.current };
      if (remaining.length === 0) {
        delete nextMap[pageNumber];
      } else {
        nextMap[pageNumber] = remaining;
      }
      liveAnnotationsRef.current = nextMap;

      if (!eraseGestureHasPushedRef.current) {
        eraseGestureHasPushedRef.current = true;
        setHistory((prev) => pushAnnotationHistory(prev, nextMap));
      } else {
        setHistory((prev) => ({
          ...prev,
          present: nextMap,
        }));
      }
    },
    []
  );

  const handleClearAll = () => {
    if (countTotalStrokes(history.present) === 0) return;
    liveAnnotationsRef.current = {};
    setHistory((prev) => pushAnnotationHistory(prev, {}));
  };

  const handleExportPng = () => {
    const entry = pageCanvasesRef.current[activeExportPage] || pageCanvasesRef.current[1];
    if (!entry?.pdfCanvas || !entry?.drawCanvas) return;

    const out = document.createElement('canvas');
    out.width = entry.pdfCanvas.width;
    out.height = entry.pdfCanvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(entry.pdfCanvas, 0, 0);
    ctx.drawImage(entry.drawCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `${paperTitle.replace(/\.pdf$/i, '')}-page-${activeExportPage}-notes.png`;
    link.href = out.toDataURL('image/png');
    link.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        setHistory((prev) => redoAnnotationHistory(prev));
      } else {
        setHistory((prev) => undoAnnotationHistory(prev));
      }
    }
  };

  const activeColor = tool === 'highlighter' ? hlColor : penColor;
  const activeSize = tool === 'highlighter' ? hlSize : penSize;
  const sliderValue =
    tool === 'eraser' ? eraserSize : tool === 'highlighter' ? hlSize : penSize;
  const strokeBounds =
    tool === 'eraser'
      ? STROKE_SIZE_BOUNDS.eraser
      : tool === 'highlighter'
        ? STROKE_SIZE_BOUNDS.highlighter
        : STROKE_SIZE_BOUNDS.pen;
  const dotPreviewPx =
    tool === 'eraser'
      ? Math.max(5, Math.min(20, Math.round(eraserSize * 0.42)))
      : tool === 'highlighter'
        ? Math.max(6, Math.min(18, Math.round(hlSize * 0.5)))
        : Math.max(3, Math.min(15, Math.round(penSize * 1.35)));
  const totalStrokes = useMemo(() => countTotalStrokes(history.present), [history.present]);

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages]
  );

  const thumbMetrics = useMemo(
    () =>
      computeScrollThumbMetrics({
        scrollTop: scrollState.scrollTop,
        scrollHeight: scrollState.scrollHeight,
        clientHeight: scrollState.clientHeight,
        trackHeight: scrollState.trackHeight,
        minThumbHeight: 60,
      }),
    [scrollState]
  );

  const visiblePage = useMemo(
    () =>
      estimateVisiblePage({
        scrollTop: scrollState.scrollTop,
        scrollHeight: scrollState.scrollHeight,
        clientHeight: scrollState.clientHeight,
        numPages,
      }),
    [scrollState, numPages]
  );

  const getRulerGeometry = useCallback((): RulerClientGeometry | null => {
    if (!rulerEnabledRef.current) return null;
    const box = viewportBoxRef.current;
    if (!box) return null;
    const rect = box.getBoundingClientRect();
    const curRuler = rulerStateRef.current;
    const effectiveLength = Math.min(curRuler.lengthPx, Math.max(200, rect.width - 40));
    return {
      centerX: rect.left + (rect.width * curRuler.xPct) / 100,
      centerY: rect.top + (rect.height * curRuler.yPct) / 100,
      angleDeg: curRuler.angleDeg,
      lengthPx: effectiveLength,
      thicknessPx: curRuler.thicknessPx,
    };
  }, []);

  const applyRailPointerY = useCallback(
    (clientY: number, grabOffsetRatio: number) => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;
      const rect = track.getBoundingClientRect();
      const nextTop = computeScrollTopFromTrackY({
        pointerY: clientY,
        trackTop: rect.top,
        trackHeight: rect.height,
        thumbHeight: thumbMetrics.thumbHeight,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        grabOffsetRatio,
      });
      container.scrollTop = nextTop;
      syncScrollMetrics();
    },
    [thumbMetrics.thumbHeight, syncScrollMetrics]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!thumbMetrics.canScroll || !isRailVisible) return;
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    try {
      track.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const rect = track.getBoundingClientRect();
    const localY = e.clientY - rect.top;
    const hitThumb =
      localY >= thumbMetrics.thumbTop &&
      localY <= thumbMetrics.thumbTop + thumbMetrics.thumbHeight;
    const grabRatio = hitThumb
      ? (localY - thumbMetrics.thumbTop) / Math.max(1, thumbMetrics.thumbHeight)
      : 0.5;

    draggingRailRef.current = { active: true, grabOffsetRatio: grabRatio };
    clearRailHideTimer();
    setIsRailVisible(true);
    applyRailPointerY(e.clientY, grabRatio);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRailRef.current.active) return;
    e.preventDefault();
    applyRailPointerY(e.clientY, draggingRailRef.current.grabOffsetRatio);
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRailRef.current.active) return;
    draggingRailRef.current.active = false;
    scheduleRailHide();
    const track = trackRef.current;
    if (track && track.hasPointerCapture(e.pointerId)) {
      try {
        track.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const stepScroll = (direction: -1 | 1) => {
    const container = containerRef.current;
    if (!container) return;
    const delta = Math.max(180, Math.round(container.clientHeight * 0.72));
    container.scrollBy({ top: direction * delta, behavior: 'smooth' });
    revealRailTemporarily();
  };

  const jumpToPage = useCallback(
    (targetPage: number) => {
      const container = containerRef.current;
      if (!container || numPages <= 0) return;
      const pageEls = Array.from(
        container.querySelectorAll<HTMLElement>('[data-pdf-page]')
      );
      const cRect = container.getBoundingClientRect();
      const pageTopOffsets = pageEls.map(
        (el) => el.getBoundingClientRect().top - cRect.top + container.scrollTop
      );
      const nextTop = computePageJumpScrollTop({
        targetPage,
        numPages,
        pageTopOffsets,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        topPaddingPx: 14,
      });
      container.scrollTo({ top: nextTop, behavior: 'smooth' });
      revealRailTemporarily();
    },
    [numPages, revealRailTemporarily]
  );

  const handleContainerScroll = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const moved = Math.abs(container.scrollTop - lastPdfScrollTopRef.current) >= 2;
      if (moved) {
        revealRailTemporarily();
      }
    }
    syncScrollMetrics();
  }, [revealRailTemporarily, syncScrollMetrics]);

  const handleRailMouseEnter = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    isRailMouseHoverRef.current = true;
    revealRailTemporarily();
  };

  const handleRailMouseLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    isRailMouseHoverRef.current = false;
    scheduleRailHide();
  };

  const captureAnchorAt = useCallback(
    (clientX?: number, clientY?: number): (PdfZoomAnchor & { pinToTop?: boolean }) | null => {
      const container = containerRef.current;
      if (!container) return null;
      const pinToTop = clientY === undefined && container.scrollTop <= 8;
      const pageEls = container.querySelectorAll<HTMLElement>('[data-pdf-page]');
      const snapshots = Array.from(pageEls)
        .map((el) => {
          const pageNumber = Number(el.dataset.pdfPage);
          const r = el.getBoundingClientRect();
          return {
            pageNumber,
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
          };
        })
        .filter((p) => Number.isFinite(p.pageNumber) && p.height > 0);
      const anchor = capturePdfZoomAnchor({
        pages: snapshots,
        containerRect: container.getBoundingClientRect(),
        anchorClientX: clientX,
        anchorClientY: clientY,
      });
      return anchor ? { ...anchor, pinToTop } : null;
    },
    []
  );

  useLayoutEffect(() => {
    const anchor = pendingScrollAnchorRef.current;
    const container = containerRef.current;
    if (!anchor || !container) return;
    pendingScrollAnchorRef.current = null;

    const pageEl = container.querySelector<HTMLElement>(
      `[data-pdf-page="${anchor.pageNumber}"]`
    );
    if (!pageEl) return;

    const nextPos = computeAnchoredScrollPosition({
      anchor,
      newPageRect: pageEl.getBoundingClientRect(),
      newContainerRect: container.getBoundingClientRect(),
      currentScrollLeft: container.scrollLeft,
      currentScrollTop: container.scrollTop,
      scrollWidth: container.scrollWidth,
      scrollHeight: container.scrollHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
    });
    container.scrollLeft = nextPos.scrollLeft;
    container.scrollTop = anchor.pinToTop ? 0 : nextPos.scrollTop;
    syncScrollMetrics();
  }, [zoom, zoomCommitSeq, syncScrollMetrics]);

  const applyButtonZoom = useCallback(
    (delta: number) => {
      const anchor = captureAnchorAt();
      if (anchor) {
        pendingScrollAnchorRef.current = anchor;
      }
      setZoom((z) => Math.max(0.65, Math.min(2.5, Number((z + delta).toFixed(2)))));
      setZoomCommitSeq((s) => s + 1);
    },
    [captureAnchorAt]
  );

  const applyFitWidthZoom = useCallback(() => {
    const container = containerRef.current;
    const basePage = basePageDims[visiblePage] ?? basePageDims[1];
    if (!container || !basePage) return;
    const anchor = captureAnchorAt();
    if (anchor) {
      pendingScrollAnchorRef.current = anchor;
    }
    const nextZoom = computeFitWidthZoom({
      containerWidth: container.clientWidth,
      pageWidth: basePage.width,
      horizontalPadding: isFullscreen || isParentFullscreen ? 24 : 56,
    });
    setZoom(nextZoom);
    setZoomCommitSeq((s) => s + 1);
  }, [basePageDims, visiblePage, captureAnchorAt, isFullscreen, isParentFullscreen]);

  const exitFullscreen = useCallback(() => {
    const anchor = captureAnchorAt();
    if (anchor) {
      pendingScrollAnchorRef.current = anchor;
    }
    setIsFullscreen(false);
    setZoomCommitSeq((s) => s + 1);
    if (
      enteredNativeFsRef.current &&
      typeof document !== 'undefined' &&
      document.fullscreenElement === annotatorRootRef.current &&
      typeof document.exitFullscreen === 'function'
    ) {
      document.exitFullscreen().catch(() => undefined);
    }
    enteredNativeFsRef.current = false;
  }, [captureAnchorAt]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
      return;
    }
    const anchor = captureAnchorAt();
    if (anchor) {
      pendingScrollAnchorRef.current = anchor;
    }
    setIsFullscreen(true);
    setZoomCommitSeq((s) => s + 1);
    const el = annotatorRootRef.current;
    if (
      el &&
      typeof el.requestFullscreen === 'function' &&
      typeof document !== 'undefined' &&
      !document.fullscreenElement
    ) {
      try {
        Promise.resolve(el.requestFullscreen())
          .then(() => {
            enteredNativeFsRef.current = true;
          })
          .catch(() => {
            enteredNativeFsRef.current = false;
          });
      } catch {
        enteredNativeFsRef.current = false;
      }
    }
  }, [isFullscreen, exitFullscreen, captureAnchorAt]);

  useEffect(() => {
    if (!isFullscreen) {
      if (typeof document !== 'undefined' && document.body) {
        delete document.body.dataset.annotatorFullscreen;
      }
      return;
    }
    if (typeof document !== 'undefined' && document.body) {
      document.body.dataset.annotatorFullscreen = 'true';
    }
    const releaseLock = acquireFullscreenBodyLock();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        exitFullscreen();
      }
    };
    const onFsChange = () => {
      if (enteredNativeFsRef.current && !document.fullscreenElement) {
        enteredNativeFsRef.current = false;
        const anchor = captureAnchorAt();
        if (anchor) {
          pendingScrollAnchorRef.current = anchor;
        }
        setIsFullscreen(false);
        setZoomCommitSeq((s) => s + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      releaseLock();
      if (typeof document !== 'undefined' && document.body) {
        delete document.body.dataset.annotatorFullscreen;
      }
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [isFullscreen, exitFullscreen, captureAnchorAt]);

  useEffect(() => {
    return () => {
      if (
        enteredNativeFsRef.current &&
        typeof document !== 'undefined' &&
        document.fullscreenElement === annotatorRootRef.current &&
        typeof document.exitFullscreen === 'function'
      ) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
  }, []);

  // Unified two-finger gesture handlers: pan/scroll (X+Y) + pinch-to-zoom around midpoint
  const getTwoTouchMetrics = () => {
    const pts = Array.from(activeTouchPointersRef.current.values());
    if (pts.length < 2) return null;
    const [p0, p1] = pts;
    return {
      midX: (p0.x + p1.x) / 2,
      midY: (p0.y + p1.y) / 2,
      dist: Math.hypot(p1.x - p0.x, p1.y - p0.y),
    };
  };

  const pruneStaleTouchPointers = useCallback((nowMs: number, maxIdleMs: number) => {
    let removed = false;
    for (const [pid, info] of activeTouchPointersRef.current.entries()) {
      if (nowMs - info.updatedAt > maxIdleMs) {
        activeTouchPointersRef.current.delete(pid);
        removed = true;
      }
    }
    if (removed && activeTouchPointersRef.current.size < 2) {
      const session = twoFingerSessionRef.current;
      session.active = false;
      session.pinchEngaged = false;
      session.movedPointerIds.clear();
      session.pendingPinchSinceMs = null;
      setPinchPreview({ scale: 1, tx: 0, ty: 0 });
      if (activeTouchPointersRef.current.size === 0) {
        isMultiTouchActiveRef.current = false;
      }
    }
  }, []);

  const handleViewportPointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    // If S Pen presses down, record active stylus state, cancel any accidental palm pan, and prune stale touches
    if (e.pointerType === 'pen') {
      activePenPointerIdsRef.current.add(e.pointerId);
      lastStylusActivityAtRef.current = nowMs;
      singlePanRef.current.active = false;
      pruneStaleTouchPointers(nowMs, 180);
      if (!twoFingerSessionRef.current.pinchEngaged && activeTouchPointersRef.current.size < 2) {
        isMultiTouchActiveRef.current = false;
      }
      return;
    }
    if (e.pointerType !== 'touch') return;

    pruneStaleTouchPointers(nowMs, e.isPrimary ? 1200 : 3500);
    activeTouchPointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      updatedAt: nowMs,
    });
    if (activeTouchPointersRef.current.size >= 2) {
      isMultiTouchActiveRef.current = true;
      singlePanRef.current.active = false;
      setMultiTouchSignal((s) => s + 1);

      const metrics = getTwoTouchMetrics();
      const container = containerRef.current;
      if (metrics && container && !twoFingerSessionRef.current.active) {
        twoFingerSessionRef.current = {
          active: true,
          startDist: metrics.dist,
          startMidX: metrics.midX,
          startMidY: metrics.midY,
          lastMidX: metrics.midX,
          lastMidY: metrics.midY,
          startScrollLeft: container.scrollLeft,
          startScrollTop: container.scrollTop,
          movedPointerIds: new Set<number>(),
          pendingPinchSinceMs: null,
          pinchEngaged: false,
          pinchStartDist: metrics.dist,
          pinchStartZoom: zoom,
          pinchStartMidX: metrics.midX,
          pinchStartMidY: metrics.midY,
          pinchAnchorInnerX: 0,
          pinchAnchorInnerY: 0,
          targetZoom: zoom,
        };
      }
    }
  };

  const handleViewportPointerMoveCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'pen') {
      lastStylusActivityAtRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return;
    }
    if (e.pointerType !== 'touch') return;
    if (!activeTouchPointersRef.current.has(e.pointerId)) return;
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    activeTouchPointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      updatedAt: nowMs,
    });

    const session = twoFingerSessionRef.current;
    const container = containerRef.current;
    if (activeTouchPointersRef.current.size >= 2 && session.active && container) {
      const metrics = getTwoTouchMetrics();
      if (!metrics) return;
      session.lastMidX = metrics.midX;
      session.lastMidY = metrics.midY;

      if (!session.pinchEngaged) {
        session.movedPointerIds.add(e.pointerId);
        const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const pendingDurationMs =
          session.pendingPinchSinceMs !== null ? nowMs - session.pendingPinchSinceMs : 0;

        const evaluation = evaluateTwoFingerPinchEngagement({
          startDist: session.startDist,
          curDist: metrics.dist,
          movedPointerCount: session.movedPointerIds.size,
          pendingDurationMs,
        });

        if (evaluation.engage) {
          const innerRect = pagesStackRef.current?.getBoundingClientRect();
          session.pinchEngaged = true;
          session.pinchStartDist = evaluation.pinchStartDist;
          session.pinchStartZoom = zoom;
          session.targetZoom = zoom;
          session.pinchStartMidX = metrics.midX;
          session.pinchStartMidY = metrics.midY;
          session.pinchAnchorInnerX = innerRect ? metrics.midX - innerRect.left : 0;
          session.pinchAnchorInnerY = innerRect ? metrics.midY - innerRect.top : 0;
          session.pendingPinchSinceMs = null;
        } else {
          if (evaluation.exceededDeadband) {
            if (session.pendingPinchSinceMs === null) {
              session.pendingPinchSinceMs = nowMs;
            }
          } else {
            session.pendingPinchSinceMs = null;
            if (session.movedPointerIds.size >= 2) {
              session.movedPointerIds.clear();
            }
          }
        }
      }

      const result = computeTwoFingerPanAndZoom({
        startMidX: session.startMidX,
        startMidY: session.startMidY,
        curMidX: metrics.midX,
        curMidY: metrics.midY,
        startScrollLeft: session.startScrollLeft,
        startScrollTop: session.startScrollTop,
        maxScrollLeft: Math.max(0, container.scrollWidth - container.clientWidth),
        maxScrollTop: Math.max(0, container.scrollHeight - container.clientHeight),
        pinchEngaged: session.pinchEngaged,
        pinchStartDist: session.pinchStartDist,
        curDist: metrics.dist,
        pinchStartZoom: session.pinchStartZoom,
        pinchStartMidX: session.pinchStartMidX,
        pinchStartMidY: session.pinchStartMidY,
        pinchAnchorInnerX: session.pinchAnchorInnerX,
        pinchAnchorInnerY: session.pinchAnchorInnerY,
        minZoom: 0.65,
        maxZoom: 2.5,
      });

      if (result.mode === 'pan') {
        container.scrollLeft = result.scrollLeft;
        container.scrollTop = result.scrollTop;
        syncScrollMetrics();
      } else {
        session.targetZoom = result.targetZoom;
        setPinchPreview({
          scale: result.previewScale,
          tx: result.previewTx,
          ty: result.previewTy,
        });
      }
    }
  };

  const releaseTouchPointer = useCallback(
    (pointerId: number) => {
      if (!activeTouchPointersRef.current.has(pointerId)) return;
      activeTouchPointersRef.current.delete(pointerId);

      if (activeTouchPointersRef.current.size < 2) {
        const session = twoFingerSessionRef.current;
        if (session.active) {
          if (session.pinchEngaged) {
            const anchor = captureAnchorAt(session.lastMidX, session.lastMidY);
            if (anchor) {
              pendingScrollAnchorRef.current = anchor;
            }
            const committedZoom = Number(session.targetZoom.toFixed(2));
            setPinchPreview({ scale: 1, tx: 0, ty: 0 });
            setZoom(committedZoom);
            setZoomCommitSeq((s) => s + 1);
          }
          session.active = false;
          session.pinchEngaged = false;
          session.movedPointerIds.clear();
          session.pendingPinchSinceMs = null;
        }
        if (activeTouchPointersRef.current.size === 0) {
          window.setTimeout(() => {
            if (activeTouchPointersRef.current.size === 0) {
              isMultiTouchActiveRef.current = false;
            }
          }, 0);
        }
      }
    },
    [captureAnchorAt]
  );

  const handleViewportPointerEndCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'pen') {
      activePenPointerIdsRef.current.delete(e.pointerId);
      lastStylusActivityAtRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return;
    }
    if (e.pointerType !== 'touch') return;
    releaseTouchPointer(e.pointerId);
  };

  // Single-finger / mouse drag 2D pan:
  // - When S Pen Mode is ON: finger touch scrolls anywhere while S Pen draws/erases.
  // - When S Pen Mode is OFF: finger draws on paper, scrolls on margins, or 2-finger scrolls inside paper.
  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const isInteractiveControl = Boolean(target?.closest('button, a, input, select'));
    const isInsidePaperPage = Boolean(target?.closest('[data-pdf-page]'));
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const isStylusActiveRecently =
      activePenPointerIdsRef.current.size > 0 || nowMs - lastStylusActivityAtRef.current < 180;

    if (
      !shouldStartSinglePointerBackgroundPan({
        activeTool: tool,
        hasDocument: Boolean(pdfDoc && !errorMsg),
        isInteractiveControl,
        isInsidePaperPage,
        activeTouchCount: activeTouchPointersRef.current.size,
        isMultiTouchActive: isMultiTouchActiveRef.current,
        pointerType: e.pointerType,
        button: e.button,
        palmLockActive: palmLock,
        isStylusActiveRecently,
      })
    ) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    singlePanRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: container.scrollLeft,
      startScrollTop: container.scrollTop,
    };
  };

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pan = singlePanRef.current;
    if (!pan.active || pan.pointerId !== e.pointerId) return;
    if (isMultiTouchActiveRef.current || activeTouchPointersRef.current.size >= 2) {
      pan.active = false;
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    container.scrollLeft = pan.startScrollLeft - (e.clientX - pan.startX);
    container.scrollTop = pan.startScrollTop - (e.clientY - pan.startY);
    syncScrollMetrics();
  };

  const handleContainerPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (singlePanRef.current.pointerId === e.pointerId) {
      singlePanRef.current.active = false;
    }
  };

  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      const pan = singlePanRef.current;
      if (!pan.active || pan.pointerId !== e.pointerId) return;
      if (isMultiTouchActiveRef.current || activeTouchPointersRef.current.size >= 2) {
        pan.active = false;
        return;
      }
      const container = containerRef.current;
      if (!container) return;
      container.scrollLeft = pan.startScrollLeft - (e.clientX - pan.startX);
      container.scrollTop = pan.startScrollTop - (e.clientY - pan.startY);
      syncScrollMetrics();
    };
    const onWindowPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'pen') {
        activePenPointerIdsRef.current.delete(e.pointerId);
      }
      if (singlePanRef.current.pointerId === e.pointerId) {
        singlePanRef.current.active = false;
      }
      if (e.pointerType === 'touch') {
        releaseTouchPointer(e.pointerId);
      }
    };
    const clearTransientTouchState = () => {
      singlePanRef.current.active = false;
      activePenPointerIdsRef.current.clear();
      activeTouchPointersRef.current.clear();
      isMultiTouchActiveRef.current = false;
      twoFingerSessionRef.current.active = false;
      twoFingerSessionRef.current.pinchEngaged = false;
      twoFingerSessionRef.current.movedPointerIds.clear();
      twoFingerSessionRef.current.pendingPinchSinceMs = null;
      setPinchPreview({ scale: 1, tx: 0, ty: 0 });
    };
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
    window.addEventListener('blur', clearTransientTouchState);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
      window.removeEventListener('blur', clearTransientTouchState);
    };
  }, [syncScrollMetrics, releaseTouchPointer]);

  // Ruler drag & rotate handlers
  const handleRulerBodyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    rulerDragRef.current = {
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      startXPct: rulerState.xPct,
      startYPct: rulerState.yPct,
    };
  };

  const handleRulerRotatePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const geom = getRulerGeometry();
    if (!geom) return;
    rulerDragRef.current = {
      mode: 'rotate',
      centerX: geom.centerX,
      centerY: geom.centerY,
    };
  };

  const handleRulerPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = rulerDragRef.current;
    if (drag.mode === 'none') return;
    e.stopPropagation();
    e.preventDefault();

    if (drag.mode === 'move') {
      const box = viewportBoxRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const dxPct = ((e.clientX - drag.startX) / Math.max(1, rect.width)) * 100;
      const dyPct = ((e.clientY - drag.startY) / Math.max(1, rect.height)) * 100;
      setRulerState((prev) => ({
        ...prev,
        xPct: Math.min(92, Math.max(8, drag.startXPct + dxPct)),
        yPct: Math.min(92, Math.max(8, drag.startYPct + dyPct)),
      }));
      return;
    }

    if (drag.mode === 'rotate') {
      const angleRad = Math.atan2(e.clientY - drag.centerY, e.clientX - drag.centerX);
      let deg = Math.round((angleRad * 180) / Math.PI);
      for (const target of [-90, -45, 0, 45, 90, 135, -135, 180, -180]) {
        if (Math.abs(deg - target) <= 3) {
          deg = target;
          break;
        }
      }
      setRulerState((prev) => ({ ...prev, angleDeg: deg }));
    }
  };

  const handleRulerPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (rulerDragRef.current.mode === 'none') return;
    rulerDragRef.current = { mode: 'none' };
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const preventContextMenu = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
  };

  const layout = resolveAnnotatorContainerClasses({
    isAnnotatorFullscreen: isFullscreen,
    isParentFullscreen,
    defaultHeightClass: heightClass,
  });

  return (
    <div
      ref={annotatorRootRef}
      data-testid="pdf-annotator-root"
      data-fullscreen={isFullscreen}
      className={layout.rootClass}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`PDF Annotation Workspace for ${paperTitle}`}
    >
      {/* Annotation Toolbar */}
      <div
        className={`bg-white border-b-[1.5px] border-[var(--sk-line)] flex flex-wrap items-center justify-between ${
          layout.isImmersive ? 'px-2.5 py-1.5 gap-1.5' : 'px-3 py-2 gap-2'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Primary Tool Selector */}
          <div
            role="group"
            aria-label="Drawing tool"
            className="sk-tabs inline-flex items-center"
          >
            <button
              type="button"
              onClick={() => setTool('pen')}
              aria-pressed={tool === 'pen'}
              data-active={tool === 'pen'}
              className="sk-tab inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Pen className="w-3.5 h-3.5" />
              Pen
            </button>
            <button
              type="button"
              onClick={() => setTool('highlighter')}
              aria-pressed={tool === 'highlighter'}
              data-active={tool === 'highlighter'}
              className="sk-tab inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Highlighter className="w-3.5 h-3.5" />
              Highlight
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              aria-pressed={tool === 'eraser'}
              data-active={tool === 'eraser'}
              className="sk-tab inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Eraser className="w-3.5 h-3.5" />
              Eraser
            </button>
            <button
              type="button"
              onClick={() => setTool('pan')}
              aria-pressed={tool === 'pan'}
              data-active={tool === 'pan'}
              className="sk-tab inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Hand className="w-3.5 h-3.5" />
              Scroll
            </button>
          </div>

          {/* Colors for Pen or Highlighter */}
          {(tool === 'pen' || tool === 'highlighter') && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--sk-chip)] border-2 border-[var(--sk-ink)] rounded-[12px] shadow-[2px_2px_0_var(--sk-soft)]">
              {(tool === 'highlighter' ? HIGHLIGHT_COLORS : PEN_COLORS).map((c) => {
                const selected = activeColor === c.hex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.label}
                    aria-pressed={selected}
                    onClick={() =>
                      tool === 'highlighter' ? setHlColor(c.hex) : setPenColor(c.hex)
                    }
                    className={`w-5 h-5 rounded-md border-2 transition-transform cursor-pointer ${
                      selected
                        ? 'border-[var(--sk-ink)] scale-115 shadow-[1.5px_1.5px_0_var(--sk-soft)]'
                        : 'border-[var(--sk-soft)] hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          )}

          {/* Manual Pen / Highlighter / Eraser Brush Slider */}
          {(tool === 'pen' || tool === 'highlighter' || tool === 'eraser') && (
            <div
              role="group"
              aria-label={
                tool === 'eraser'
                  ? 'Eraser brush size'
                  : tool === 'highlighter'
                    ? 'Highlighter stroke thickness'
                    : 'Pen stroke thickness'
              }
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--sk-chip)] border-2 border-[var(--sk-ink)] rounded-[12px] shadow-[2px_2px_0_var(--sk-soft)]"
            >
              <span
                aria-hidden="true"
                className="w-5 h-5 flex items-center justify-center shrink-0"
              >
                <span
                  className="rounded-full block transition-all duration-100"
                  style={
                    tool === 'eraser'
                      ? {
                          width: `${dotPreviewPx}px`,
                          height: `${dotPreviewPx}px`,
                          backgroundColor: 'rgba(255, 95, 168, 0.22)',
                          border: '1.5px solid var(--sk-acc-ink)',
                        }
                      : {
                          width: `${dotPreviewPx}px`,
                          height: `${dotPreviewPx}px`,
                          backgroundColor: activeColor,
                          opacity: tool === 'highlighter' ? 0.55 : 1,
                          border: '1px solid rgba(29, 26, 74, 0.4)',
                        }
                  }
                />
              </span>
              <SakugaSlider
                testId="annotator-stroke-slider"
                size="compact"
                variant={tool === 'pen' ? 'indigo' : 'sakura'}
                min={strokeBounds.min}
                max={strokeBounds.max}
                step={strokeBounds.step}
                value={sliderValue}
                ariaLabel={
                  tool === 'eraser'
                    ? 'Eraser brush size'
                    : tool === 'highlighter'
                      ? 'Highlighter thickness'
                      : 'Pen thickness'
                }
                showValuePill={true}
                formatValue={(v) => `${v}px`}
                onChange={(next) => {
                  if (tool === 'eraser') {
                    setEraserSize(clampStrokeSize('eraser', next));
                  } else if (tool === 'highlighter') {
                    setHlSize(clampStrokeSize('highlighter', next));
                  } else {
                    setPenSize(clampStrokeSize('pen', next));
                  }
                }}
                className="w-[126px] sm:w-[140px]"
              />
            </div>
          )}

          {/* Ruler Toggle for Straight Function & Graph Lines */}
          <button
            type="button"
            onClick={() => setRulerEnabled((r) => !r)}
            aria-pressed={rulerEnabled}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[11px] cursor-pointer whitespace-nowrap ${
              rulerEnabled
                ? 'bg-[var(--sk-acc-soft)] border-2 border-[var(--sk-ink)] text-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-acc)]'
                : 'sk-btn-subtle'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Ruler
          </button>

          {/* S Pen Mode: S Pen & mouse draw/erase; finger touch scrolls smoothly */}
          <button
            type="button"
            data-testid="pdf-palm-lock-btn"
            onClick={handleTogglePalmLock}
            aria-pressed={palmLock}
            title={
              palmLock
                ? 'S Pen Mode ON: Pen/Brush only draws with S Pen & mouse; dragging with your finger scrolls the PDF. Tap to allow finger drawing.'
                : 'Finger Draw ON: Both finger touch and S Pen can draw on the PDF. Tap to switch back to S Pen Mode (finger scrolls).'
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[11px] cursor-pointer whitespace-nowrap transition-transform ${
              palmLock
                ? 'bg-[var(--sk-acc-soft)] border-2 border-[var(--sk-ink)] text-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-acc)]'
                : 'sk-btn-subtle'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {palmLock ? 'S Pen Mode' : 'Finger Draw'}
          </button>

          {/* Scroll Rail Placement (Left default for right-handed users, Right, or Off) */}
          <button
            type="button"
            data-testid="pdf-rail-mode-btn"
            onClick={handleCycleRailSide}
            title="Switch auto-hide scroll rail side (Left is best for right-handed S Pen writers)"
            className="sk-btn-subtle inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <PanelLeft className="w-3.5 h-3.5" />
            {railSide === 'left' ? 'Rail: Left' : railSide === 'right' ? 'Rail: Right' : 'Rail: Off'}
          </button>
        </div>

        {/* Page Stepper, History, Zoom, Export, and Fullscreen Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isFullscreen && (
            <span
              title={paperTitle}
              className="hidden lg:inline-block max-w-[190px] truncate px-2 py-0.5 text-[11px] font-mono font-semibold text-[var(--sk-dim)] bg-[var(--sk-chip)] border border-[var(--sk-line)] rounded-lg"
            >
              {paperTitle}
            </span>
          )}
          {numPages > 1 && (
            <div className="inline-flex items-center border-2 border-[var(--sk-ink)] rounded-[12px] bg-white shadow-[2px_2px_0_var(--sk-soft)] overflow-hidden">
              <button
                type="button"
                data-testid="pdf-prev-page-btn"
                onClick={() => jumpToPage(visiblePage - 1)}
                disabled={visiblePage <= 1}
                aria-label="Previous PDF page"
                title="Previous page (one-tap jump without edge scrollbar)"
                className="p-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-mono tabular-nums font-bold text-[var(--sk-ink)] border-x border-[var(--sk-line)]">
                {visiblePage}/{numPages}
              </span>
              <button
                type="button"
                data-testid="pdf-next-page-btn"
                onClick={() => jumpToPage(visiblePage + 1)}
                disabled={visiblePage >= numPages}
                aria-label="Next PDF page"
                title="Next page (one-tap jump without edge scrollbar)"
                className="p-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="inline-flex items-center border-2 border-[var(--sk-ink)] rounded-[12px] bg-white shadow-[2px_2px_0_var(--sk-soft)] overflow-hidden">
            <button
              type="button"
              onClick={() => applyButtonZoom(-0.15)}
              aria-label="Zoom out"
              className="p-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono tabular-nums font-semibold text-[var(--sk-ink)] border-x border-[var(--sk-line)]">
              {Math.round(zoom * pinchPreview.scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => applyButtonZoom(0.15)}
              aria-label="Zoom in"
              className="p-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={applyFitWidthZoom}
              disabled={!pdfDoc}
              title="Fit page width to screen"
              aria-label="Fit page width"
              className="px-2 py-1 text-[11px] font-semibold text-[var(--sk-pri-hover)] hover:bg-[var(--sk-chip)] border-l border-[var(--sk-line)] disabled:opacity-40 cursor-pointer"
            >
              Fit
            </button>
          </div>

          <button
            type="button"
            onClick={() => setHistory((prev) => undoAnnotationHistory(prev))}
            disabled={history.past.length === 0}
            aria-label="Undo stroke"
            className="sk-btn-subtle p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setHistory((prev) => redoAnnotationHistory(prev))}
            disabled={history.future.length === 0}
            aria-label="Redo stroke"
            className="sk-btn-subtle p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={totalStrokes === 0}
            aria-label="Clear all drawings"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border-[1.5px] border-[var(--sk-line)] rounded-[11px] bg-white text-[var(--sk-acc-ink)] hover:border-[var(--sk-acc)] hover:bg-[var(--sk-acc-soft)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear ({totalStrokes})
          </button>
          <button
            type="button"
            onClick={handleExportPng}
            disabled={!pdfDoc}
            title={`Download page ${activeExportPage} with your annotations as PNG`}
            className="sk-btn-subtle inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            Save PNG
          </button>
          <button
            type="button"
            data-testid="pdf-annotator-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Exit fullscreen annotate mode (Esc)' : 'Maximize annotation canvas'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold cursor-pointer whitespace-nowrap ${
              isFullscreen ? 'sk-btn-ink' : 'sk-btn-secondary'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                Exit FS
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Multi-Page PDF + Pinch-Zoom + Interactive Ruler + Wide Touch Scroll Rail */}
      <div className="flex items-stretch w-full flex-1 min-h-0">
        <div
          ref={viewportBoxRef}
          onPointerDownCapture={handleViewportPointerDownCapture}
          onPointerMoveCapture={handleViewportPointerMoveCapture}
          onPointerUpCapture={handleViewportPointerEndCapture}
          onPointerCancelCapture={handleViewportPointerEndCapture}
          className="relative flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col"
        >
          <div
            ref={containerRef}
            data-testid="pdf-scroll-container"
            onScroll={handleContainerScroll}
            onPointerDown={handleContainerPointerDown}
            onPointerMove={handleContainerPointerMove}
            onPointerUp={handleContainerPointerEnd}
            onPointerCancel={handleContainerPointerEnd}
            onContextMenu={preventContextMenu}
            style={{
              touchAction: pdfDoc && !errorMsg ? 'none' : 'pan-y',
              WebkitTouchCallout: 'none',
            }}
            className={`w-full ${layout.scrollContainerClass} overflow-auto bg-[#EBE9F9]/75 pdf-annotator-scroll ${
              layout.isImmersive ? 'px-2 sm:px-6 py-4' : 'px-4 sm:px-7 py-5'
            } ${
              pdfDoc && !errorMsg ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
          >
            {loading && (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center gap-3 text-sm text-[var(--sk-body)]">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--sk-pri)]" />
                <span>Rendering PDF pages for annotation...</span>
              </div>
            )}

            {!loading && errorMsg && (
              <div className="max-w-lg mx-auto my-12 p-5 sk-card-accent bg-white text-center space-y-3">
                <p className="text-sm text-[var(--sk-body)] leading-relaxed">{errorMsg}</p>
                <input
                  ref={localUploadRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const blob = URL.createObjectURL(file);
                    setLocalOverrideUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return blob;
                    });
                    e.target.value = '';
                  }}
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {onFallbackViewer && (
                    <button
                      type="button"
                      onClick={onFallbackViewer}
                      className="sk-btn-primary px-3.5 py-2 text-xs font-semibold cursor-pointer"
                    >
                      Switch to Web Viewer
                    </button>
                  )}
                  {externalUrl && (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sk-btn-secondary px-3.5 py-2 text-xs font-semibold"
                    >
                      Open PDF Directly
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => localUploadRef.current?.click()}
                    className="sk-btn-subtle px-3.5 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Upload Local PDF
                  </button>
                </div>
              </div>
            )}

            {!loading && !errorMsg && pdfDoc && (
              <div
                ref={pagesStackRef}
                style={
                  pinchPreview.scale !== 1 || pinchPreview.tx !== 0 || pinchPreview.ty !== 0
                    ? {
                        transform: `translate3d(${pinchPreview.tx}px, ${pinchPreview.ty}px, 0) scale(${pinchPreview.scale})`,
                        transformOrigin: '0 0',
                      }
                    : undefined
                }
                className="min-w-full w-max mx-auto space-y-5"
              >
                {pageNumbers.map((pageNumber) => (
                  <PdfPageCanvas
                    key={`${paperKey}-p${pageNumber}`}
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    baseDim={basePageDims[pageNumber]}
                    fallbackDim={basePageDims[1]}
                    scale={zoom}
                    strokes={history.present[pageNumber] || EMPTY_STROKES}
                    activeTool={tool}
                    activeColor={activeColor}
                    activeSize={activeSize}
                    eraserSize={eraserSize}
                    scrollRootRef={containerRef}
                    isMultiTouchActiveRef={isMultiTouchActiveRef}
                    multiTouchSignal={multiTouchSignal}
                    palmLock={palmLock}
                    onDetectStylus={handleDetectStylus}
                    getRulerGeometry={getRulerGeometry}
                    onCommitStroke={handleCommitStroke}
                    onEraseSegment={handleEraseSegment}
                    registerCanvases={registerCanvases}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Interactive Straight-Edge Ruler Overlay */}
          {rulerEnabled && (
            <div
              data-testid="pdf-ruler-overlay"
              onPointerDown={handleRulerBodyPointerDown}
              onPointerMove={handleRulerPointerMove}
              onPointerUp={handleRulerPointerUp}
              onPointerCancel={handleRulerPointerUp}
              onContextMenu={preventContextMenu}
              style={{
                left: `${rulerState.xPct}%`,
                top: `${rulerState.yPct}%`,
                width: `${rulerState.lengthPx}px`,
                maxWidth: 'calc(100% - 40px)',
                height: `${rulerState.thicknessPx}px`,
                transform: `translate(-50%, -50%) rotate(${rulerState.angleDeg}deg)`,
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
              className="absolute z-20 bg-amber-100/90 border-2 border-[var(--sk-ink)] rounded-lg shadow-[3px_3px_0_var(--sk-soft)] cursor-move flex items-center justify-between px-2 select-none"
            >
              {/* Ruler cm tick marks along top edge */}
              <div
                aria-hidden="true"
                className="absolute inset-x-2 top-0 h-2.5 flex justify-between pointer-events-none"
              >
                {Array.from({ length: 19 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-px bg-amber-800/60 ${idx % 2 === 0 ? 'h-2.5' : 'h-1.5'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 z-10">
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/90 text-amber-950 border border-amber-400/70 rounded">
                  {rulerState.angleDeg}°
                </span>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setRulerState((r) => ({ ...r, angleDeg: 0 }))}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-white/90 hover:bg-white text-slate-700 border border-amber-400/70 rounded cursor-pointer"
                  title="Reset ruler to 0° horizontal"
                >
                  0°
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setRulerState((r) => ({ ...r, angleDeg: -45 }))}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-white/90 hover:bg-white text-slate-700 border border-amber-400/70 rounded cursor-pointer"
                  title="Set ruler to -45°"
                >
                  -45°
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setRulerState((r) => ({ ...r, angleDeg: 90 }))}
                  className="px-1.5 py-0.5 text-[10px] font-mono bg-white/90 hover:bg-white text-slate-700 border border-amber-400/70 rounded cursor-pointer"
                  title="Set ruler to 90° vertical"
                >
                  90°
                </button>
              </div>

              <div className="flex items-center gap-1 z-10">
                <button
                  type="button"
                  data-testid="pdf-ruler-rotate-handle"
                  onPointerDown={handleRulerRotatePointerDown}
                  onPointerMove={handleRulerPointerMove}
                  onPointerUp={handleRulerPointerUp}
                  onPointerCancel={handleRulerPointerUp}
                  onContextMenu={preventContextMenu}
                  aria-label="Rotate ruler"
                  title="Drag to rotate ruler"
                  style={{
                    touchAction: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                  className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md cursor-grab active:cursor-grabbing shadow-xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setRulerEnabled(false)}
                  aria-label="Hide ruler"
                  title="Hide ruler"
                  className="p-1 bg-white/90 hover:bg-white text-slate-700 border border-amber-400/70 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Auto-Hiding Floating PDF Scroll Rail Overlay (Left-side default for right-handed writers) */}
          {railSide !== 'off' && thumbMetrics.canScroll && (
            <>
              <div
                aria-hidden="true"
                onPointerEnter={handleRailMouseEnter}
                className={`hidden md:block absolute top-3 bottom-3 w-3 z-10 ${
                  railSide === 'left' ? 'left-0' : 'right-0'
                }`}
              />
              <div
                data-testid="pdf-scroll-rail"
                data-visible={isRailVisible ? 'true' : 'false'}
                data-rail-side={railSide}
                aria-label="PDF page scroll bar"
                aria-hidden={!isRailVisible}
                onPointerEnter={handleRailMouseEnter}
                onPointerLeave={handleRailMouseLeave}
                onContextMenu={preventContextMenu}
                style={{
                  touchAction: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                className={`absolute top-3 bottom-3 z-20 w-9 sm:w-10 rounded-[14px] border-2 border-[var(--sk-ink)] bg-white/95 backdrop-blur-xs shadow-[3px_3px_0_var(--sk-soft)] flex flex-col items-center overflow-hidden select-none transition-all duration-200 ${
                  railSide === 'left' ? 'left-2' : 'right-2'
                } ${
                  isRailVisible
                    ? 'opacity-100 translate-x-0 pointer-events-auto'
                    : railSide === 'left'
                      ? 'opacity-0 -translate-x-2 pointer-events-none'
                      : 'opacity-0 translate-x-2 pointer-events-none'
                }`}
              >
                <button
                  type="button"
                  tabIndex={isRailVisible ? 0 : -1}
                  onClick={() => stepScroll(-1)}
                  onContextMenu={preventContextMenu}
                  disabled={!thumbMetrics.canScroll}
                  aria-label="Scroll PDF up"
                  className="w-full h-10 flex items-center justify-center text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] active:bg-[#E7E5FA] border-b-[1.5px] border-[var(--sk-line)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <div
                  ref={trackRef}
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
                  className="relative flex-1 w-full bg-[var(--sk-chip)] cursor-pointer"
                >
                  <div
                    data-testid="pdf-scroll-thumb"
                    style={{
                      height: `${thumbMetrics.thumbHeight}px`,
                      transform: `translateY(${thumbMetrics.thumbTop}px)`,
                    }}
                    className="absolute inset-x-1 top-0 rounded-lg bg-[var(--sk-pri)] hover:bg-[var(--sk-pri-hover)] border-[1.5px] border-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)] flex flex-col items-center justify-center gap-1 pointer-events-none transition-colors"
                  >
                    <span className="w-3.5 h-0.5 rounded-full bg-white/85" />
                    <span className="text-[9px] font-mono font-semibold text-white leading-none tabular-nums">
                      P{visiblePage}
                    </span>
                    <span className="w-3.5 h-0.5 rounded-full bg-white/85" />
                  </div>
                </div>

                <button
                  type="button"
                  tabIndex={isRailVisible ? 0 : -1}
                  onClick={() => stepScroll(1)}
                  onContextMenu={preventContextMenu}
                  disabled={!thumbMetrics.canScroll}
                  aria-label="Scroll PDF down"
                  className="w-full h-10 flex items-center justify-center text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] active:bg-[#E7E5FA] border-t-[1.5px] border-[var(--sk-line)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quiet Footer Hint */}
      <div
        className={`px-3 bg-white border-t-[1.5px] border-[var(--sk-line)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--sk-dim)] ${
          layout.isImmersive ? 'py-1' : 'py-1.5'
        }`}
      >
        <span>
          {numPages > 0
            ? palmLock
              ? `Page ${visiblePage}/${numPages} · S Pen draws/erases · Finger scrolls · 2-finger pinch-zoom`
              : `Page ${visiblePage}/${numPages} · Finger & S Pen draw · 2-finger scroll/zoom · ‹ › to jump pages`
            : 'Preparing PDF canvas'}
        </span>
        <span className="font-mono tabular-nums">
          {totalStrokes} {totalStrokes === 1 ? 'stroke' : 'strokes'} saved · Ctrl+Z to undo
          {isFullscreen ? ' · Esc to exit' : ''}
        </span>
      </div>
    </div>
  );
};

export type { PageDimension };
