export interface NormalizedPoint {
  x: number; // 0..1 relative to page width
  y: number; // 0..1 relative to page height
}

export type AnnotationTool = 'pen' | 'highlighter' | 'eraser' | 'pan';

export interface AnnotationStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  size: number; // stroke width in base CSS pixels at zoom 1.0
  points: NormalizedPoint[];
}

export type PaperAnnotationsMap = Record<number, AnnotationStroke[]>;

export interface AnnotationHistoryState {
  present: PaperAnnotationsMap;
  past: PaperAnnotationsMap[];
  future: PaperAnnotationsMap[];
}

export const ANNOTATION_STORAGE_PREFIX = 'cambridge_0580_pdf_notes_v1:';

export function clampNormalized(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function normalizePointerToPage(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): NormalizedPoint {
  const width = rect.width > 0 ? rect.width : 1;
  const height = rect.height > 0 ? rect.height : 1;
  return {
    x: clampNormalized((clientX - rect.left) / width),
    y: clampNormalized((clientY - rect.top) / height),
  };
}

function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(px - ax, py - ay);
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export function isPointNearStroke(
  point: NormalizedPoint,
  stroke: AnnotationStroke,
  normalizedRadius: number
): boolean {
  if (stroke.points.length === 0) return false;
  if (stroke.points.length === 1) {
    const p = stroke.points[0];
    return Math.hypot(point.x - p.x, point.y - p.y) <= normalizedRadius;
  }
  for (let i = 0; i < stroke.points.length - 1; i++) {
    const a = stroke.points[i];
    const b = stroke.points[i + 1];
    if (pointToSegmentDistance(point.x, point.y, a.x, a.y, b.x, b.y) <= normalizedRadius) {
      return true;
    }
  }
  return false;
}

export function eraseStrokesNearPoint(
  strokes: AnnotationStroke[],
  point: NormalizedPoint,
  normalizedRadius = 0.02
): { remaining: AnnotationStroke[]; removedAny: boolean } {
  let removedAny = false;
  const remaining = strokes.filter((stroke) => {
    const hit = isPointNearStroke(point, stroke, normalizedRadius);
    if (hit) removedAny = true;
    return !hit;
  });
  return { remaining, removedAny };
}

export function cloneAnnotationsMap(map: PaperAnnotationsMap): PaperAnnotationsMap {
  const copy: PaperAnnotationsMap = {};
  for (const [pageKey, list] of Object.entries(map)) {
    const pageNum = Number(pageKey);
    if (!Number.isNaN(pageNum) && Array.isArray(list) && list.length > 0) {
      copy[pageNum] = list.map((s) => ({
        ...s,
        points: s.points.map((pt) => ({ x: pt.x, y: pt.y })),
      }));
    }
  }
  return copy;
}

export function createInitialAnnotationHistory(
  initial: PaperAnnotationsMap = {}
): AnnotationHistoryState {
  return {
    present: cloneAnnotationsMap(initial),
    past: [],
    future: [],
  };
}

export function pushAnnotationHistory(
  state: AnnotationHistoryState,
  nextPresent: PaperAnnotationsMap,
  maxHistory = 40
): AnnotationHistoryState {
  const past = [...state.past, cloneAnnotationsMap(state.present)].slice(-maxHistory);
  return {
    present: cloneAnnotationsMap(nextPresent),
    past,
    future: [],
  };
}

export function undoAnnotationHistory(
  state: AnnotationHistoryState
): AnnotationHistoryState {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  return {
    present: cloneAnnotationsMap(previous),
    past: state.past.slice(0, -1),
    future: [cloneAnnotationsMap(state.present), ...state.future].slice(0, 40),
  };
}

export function redoAnnotationHistory(
  state: AnnotationHistoryState
): AnnotationHistoryState {
  if (state.future.length === 0) return state;
  const [next, ...restFuture] = state.future;
  return {
    present: cloneAnnotationsMap(next),
    past: [...state.past, cloneAnnotationsMap(state.present)].slice(-40),
    future: restFuture,
  };
}

export function countTotalStrokes(map: PaperAnnotationsMap): number {
  return Object.values(map).reduce((sum, list) => sum + list.length, 0);
}

export function parseAnnotationsJson(raw: string | null): PaperAnnotationsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const sanitized: PaperAnnotationsMap = {};
    for (const [pageStr, list] of Object.entries(parsed as Record<string, unknown>)) {
      const pageNum = Number(pageStr);
      if (!Number.isInteger(pageNum) || pageNum < 1 || !Array.isArray(list)) continue;
      const validStrokes: AnnotationStroke[] = [];
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const candidate = item as Partial<AnnotationStroke>;
        if (
          typeof candidate.id === 'string' &&
          (candidate.tool === 'pen' || candidate.tool === 'highlighter') &&
          typeof candidate.color === 'string' &&
          typeof candidate.size === 'number' &&
          Array.isArray(candidate.points) &&
          candidate.points.length > 0
        ) {
          const points = candidate.points
            .filter(
              (p): p is NormalizedPoint =>
                Boolean(p) &&
                typeof p.x === 'number' &&
                typeof p.y === 'number' &&
                Number.isFinite(p.x) &&
                Number.isFinite(p.y)
            )
            .map((p) => ({ x: clampNormalized(p.x), y: clampNormalized(p.y) }));
          if (points.length > 0) {
            validStrokes.push({
              id: candidate.id,
              tool: candidate.tool,
              color: candidate.color,
              size: Math.max(1, Math.min(48, candidate.size)),
              points,
            });
          }
        }
      }
      if (validStrokes.length > 0) {
        sanitized[pageNum] = validStrokes;
      }
    }
    return sanitized;
  } catch {
    return {};
  }
}

export function loadPaperAnnotations(storageKey: string): PaperAnnotationsMap {
  if (typeof window === 'undefined') return {};
  try {
    return parseAnnotationsJson(
      window.localStorage.getItem(`${ANNOTATION_STORAGE_PREFIX}${storageKey}`)
    );
  } catch {
    return {};
  }
}

export function savePaperAnnotations(
  storageKey: string,
  annotations: PaperAnnotationsMap
): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${ANNOTATION_STORAGE_PREFIX}${storageKey}`;
    if (countTotalStrokes(annotations) === 0) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(annotations));
    }
  } catch {
    // ignore storage quota errors cleanly
  }
}

export function renderStrokesToCanvas(
  ctx: CanvasRenderingContext2D,
  strokes: AnnotationStroke[],
  widthPx: number,
  heightPx: number,
  scaleFactor = 1
): void {
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.34 : 1;
    const lineWidth = stroke.size * scaleFactor;
    ctx.lineWidth = lineWidth;

    if (stroke.points.length === 1) {
      const pt = stroke.points[0];
      ctx.beginPath();
      ctx.arc(pt.x * widthPx, pt.y * heightPx, Math.max(1, lineWidth / 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x * widthPx, stroke.points[0].y * heightPx);
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const curr = stroke.points[i];
      const next = stroke.points[i + 1];
      const midX = ((curr.x + next.x) / 2) * widthPx;
      const midY = ((curr.y + next.y) / 2) * heightPx;
      ctx.quadraticCurveTo(curr.x * widthPx, curr.y * heightPx, midX, midY);
    }
    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x * widthPx, last.y * heightPx);
    ctx.stroke();
    ctx.restore();
  }
}

export function hasPdfHeader(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  const limit = Math.min(bytes.length - 4, 1024);
  for (let i = 0; i < limit; i++) {
    // Check for ASCII "%PDF-" (0x25, 0x50, 0x44, 0x46, 0x2D)
    if (
      bytes[i] === 0x25 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x44 &&
      bytes[i + 3] === 0x46 &&
      bytes[i + 4] === 0x2d
    ) {
      return true;
    }
  }
  return false;
}

export interface ScrollThumbMetrics {
  canScroll: boolean;
  thumbHeight: number;
  thumbTop: number;
  progress: number;
}

export function computeScrollThumbMetrics(params: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  trackHeight: number;
  minThumbHeight?: number;
}): ScrollThumbMetrics {
  const {
    scrollTop,
    scrollHeight,
    clientHeight,
    trackHeight,
    minThumbHeight = 56,
  } = params;

  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  if (maxScroll <= 1 || trackHeight <= 0 || scrollHeight <= 0) {
    return {
      canScroll: false,
      thumbHeight: Math.max(0, trackHeight),
      thumbTop: 0,
      progress: 0,
    };
  }

  const ratio = Math.min(1, Math.max(0, clientHeight / scrollHeight));
  const rawThumb = Math.round(trackHeight * ratio);
  const thumbHeight = Math.min(trackHeight, Math.max(minThumbHeight, rawThumb));
  const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
  const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
  const thumbTop = Math.round(progress * maxThumbTop);

  return {
    canScroll: true,
    thumbHeight,
    thumbTop,
    progress,
  };
}

export function computeScrollTopFromTrackY(params: {
  pointerY: number;
  trackTop: number;
  trackHeight: number;
  thumbHeight: number;
  scrollHeight: number;
  clientHeight: number;
  grabOffsetRatio?: number;
}): number {
  const {
    pointerY,
    trackTop,
    trackHeight,
    thumbHeight,
    scrollHeight,
    clientHeight,
    grabOffsetRatio = 0.5,
  } = params;

  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  const availableTrack = Math.max(1, trackHeight - thumbHeight);
  if (maxScroll <= 0) return 0;

  const desiredThumbTop = pointerY - trackTop - thumbHeight * grabOffsetRatio;
  const clampedThumbTop = Math.min(availableTrack, Math.max(0, desiredThumbTop));
  return Math.round((clampedThumbTop / availableTrack) * maxScroll);
}

export function estimateVisiblePage(params: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  numPages: number;
}): number {
  const { scrollTop, scrollHeight, clientHeight, numPages } = params;
  if (numPages <= 1 || scrollHeight <= 0) return 1;
  const centerY = scrollTop + clientHeight * 0.35;
  const ratio = Math.min(0.9999, Math.max(0, centerY / scrollHeight));
  return Math.min(numPages, Math.max(1, Math.floor(ratio * numPages) + 1));
}

export function computePinchZoomScale(params: {
  initialZoom: number;
  startDistance: number;
  currentDistance: number;
  minZoom?: number;
  maxZoom?: number;
}): number {
  const {
    initialZoom,
    startDistance,
    currentDistance,
    minZoom = 0.65,
    maxZoom = 2.5,
  } = params;
  if (
    !Number.isFinite(initialZoom) ||
    !Number.isFinite(startDistance) ||
    !Number.isFinite(currentDistance) ||
    startDistance <= 4 ||
    currentDistance <= 0
  ) {
    return Math.min(maxZoom, Math.max(minZoom, initialZoom || 1));
  }
  const raw = initialZoom * (currentDistance / startDistance);
  const clamped = Math.min(maxZoom, Math.max(minZoom, raw));
  return Number(clamped.toFixed(3));
}

export interface RulerClientGeometry {
  centerX: number;
  centerY: number;
  angleDeg: number;
  lengthPx: number;
  thicknessPx: number;
}

export interface RulerSnapResult {
  snapped: boolean;
  edge: 'top' | 'bottom' | null;
  clientX: number;
  clientY: number;
}

export function snapClientPointToRulerEdge(
  clientX: number,
  clientY: number,
  ruler: RulerClientGeometry,
  options: { snapThresholdPx?: number; forcedEdge?: 'top' | 'bottom' | null } = {}
): RulerSnapResult {
  const { snapThresholdPx = 30, forcedEdge = null } = options;
  const rad = (ruler.angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = clientX - ruler.centerX;
  const dy = clientY - ruler.centerY;

  // Local coordinates in ruler frame: u along length, v perpendicular
  const u = dx * cos + dy * sin;
  const v = -dx * sin + dy * cos;

  const halfLen = ruler.lengthPx / 2;
  const halfThick = ruler.thicknessPx / 2;

  if (!forcedEdge) {
    if (Math.abs(u) > halfLen + 18) {
      return { snapped: false, edge: null, clientX, clientY };
    }
    const distTop = Math.abs(v + halfThick);
    const distBottom = Math.abs(v - halfThick);
    const minDist = Math.min(distTop, distBottom);
    if (minDist > snapThresholdPx) {
      return { snapped: false, edge: null, clientX, clientY };
    }
    const edge: 'top' | 'bottom' = distTop <= distBottom ? 'top' : 'bottom';
    const targetV = edge === 'top' ? -halfThick - 2 : halfThick + 2;
    const clampedU = Math.max(-halfLen, Math.min(halfLen, u));
    return {
      snapped: true,
      edge,
      clientX: ruler.centerX + clampedU * cos - targetV * sin,
      clientY: ruler.centerY + clampedU * sin + targetV * cos,
    };
  }

  const targetV = forcedEdge === 'top' ? -halfThick - 2 : halfThick + 2;
  const clampedU = Math.max(-halfLen, Math.min(halfLen, u));
  return {
    snapped: true,
    edge: forcedEdge,
    clientX: ruler.centerX + clampedU * cos - targetV * sin,
    clientY: ruler.centerY + clampedU * sin + targetV * cos,
  };
}

export interface PageRectSnapshot {
  pageNumber: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PdfZoomAnchor {
  pageNumber: number;
  relX: number;
  relY: number;
  anchorViewportX: number;
  anchorViewportY: number;
}

export function capturePdfZoomAnchor(params: {
  pages: PageRectSnapshot[];
  containerRect: { left: number; top: number; width: number; height: number };
  anchorClientX?: number;
  anchorClientY?: number;
}): PdfZoomAnchor | null {
  const { pages, containerRect } = params;
  if (pages.length === 0) return null;

  const anchorClientX =
    params.anchorClientX ?? containerRect.left + containerRect.width * 0.5;
  const anchorClientY =
    params.anchorClientY ?? containerRect.top + containerRect.height * 0.45;

  let chosen = pages[0];
  let bestDist = Infinity;

  for (const page of pages) {
    const bottom = page.top + page.height;
    const dist =
      anchorClientY < page.top
        ? page.top - anchorClientY
        : anchorClientY > bottom
          ? anchorClientY - bottom
          : 0;
    if (dist < bestDist) {
      bestDist = dist;
      chosen = page;
      if (dist === 0) break;
    }
  }

  const rawRelX = (anchorClientX - chosen.left) / Math.max(1, chosen.width);
  const rawRelY = (anchorClientY - chosen.top) / Math.max(1, chosen.height);

  return {
    pageNumber: chosen.pageNumber,
    relX: Math.min(1.5, Math.max(-0.5, rawRelX)),
    relY: Math.min(1.5, Math.max(-0.5, rawRelY)),
    anchorViewportX: anchorClientX - containerRect.left,
    anchorViewportY: anchorClientY - containerRect.top,
  };
}

export function computeAnchoredScrollPosition(params: {
  anchor: PdfZoomAnchor;
  newPageRect: { left: number; top: number; width: number; height: number };
  newContainerRect: { left: number; top: number; width: number; height: number };
  currentScrollLeft: number;
  currentScrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}): { scrollLeft: number; scrollTop: number } {
  const {
    anchor,
    newPageRect,
    newContainerRect,
    currentScrollLeft,
    currentScrollTop,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
  } = params;

  const currentPointX = newPageRect.left + anchor.relX * newPageRect.width;
  const desiredPointX = newContainerRect.left + anchor.anchorViewportX;
  const currentPointY = newPageRect.top + anchor.relY * newPageRect.height;
  const desiredPointY = newContainerRect.top + anchor.anchorViewportY;

  const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

  const rawLeft = currentScrollLeft + (currentPointX - desiredPointX);
  const rawTop = currentScrollTop + (currentPointY - desiredPointY);

  return {
    scrollLeft: Math.min(maxScrollLeft, Math.max(0, Math.round(rawLeft))),
    scrollTop: Math.min(maxScrollTop, Math.max(0, Math.round(rawTop))),
  };
}

export interface TwoFingerGestureResult {
  mode: 'pan' | 'pinch';
  scrollLeft: number;
  scrollTop: number;
  previewScale: number;
  previewTx: number;
  previewTy: number;
  targetZoom: number;
}

export function computeTwoFingerPanAndZoom(params: {
  startMidX: number;
  startMidY: number;
  curMidX: number;
  curMidY: number;
  startScrollLeft: number;
  startScrollTop: number;
  maxScrollLeft: number;
  maxScrollTop: number;
  pinchEngaged: boolean;
  pinchStartDist: number;
  curDist: number;
  pinchStartZoom: number;
  pinchStartMidX: number;
  pinchStartMidY: number;
  pinchAnchorInnerX: number;
  pinchAnchorInnerY: number;
  minZoom?: number;
  maxZoom?: number;
}): TwoFingerGestureResult {
  const {
    startMidX,
    startMidY,
    curMidX,
    curMidY,
    startScrollLeft,
    startScrollTop,
    maxScrollLeft,
    maxScrollTop,
    pinchEngaged,
    pinchStartDist,
    curDist,
    pinchStartZoom,
    pinchStartMidX,
    pinchStartMidY,
    pinchAnchorInnerX,
    pinchAnchorInnerY,
    minZoom = 0.65,
    maxZoom = 2.5,
  } = params;

  if (!pinchEngaged) {
    const rawLeft = startScrollLeft - (curMidX - startMidX);
    const rawTop = startScrollTop - (curMidY - startMidY);
    return {
      mode: 'pan',
      scrollLeft: Math.min(Math.max(0, maxScrollLeft), Math.max(0, rawLeft)),
      scrollTop: Math.min(Math.max(0, maxScrollTop), Math.max(0, rawTop)),
      previewScale: 1,
      previewTx: 0,
      previewTy: 0,
      targetZoom: pinchStartZoom,
    };
  }

  const targetZoom = computePinchZoomScale({
    initialZoom: pinchStartZoom,
    startDistance: pinchStartDist,
    currentDistance: curDist,
    minZoom,
    maxZoom,
  });
  const previewScale = targetZoom / Math.max(0.1, pinchStartZoom);
  const previewTx =
    curMidX - pinchStartMidX + (1 - previewScale) * pinchAnchorInnerX;
  const previewTy =
    curMidY - pinchStartMidY + (1 - previewScale) * pinchAnchorInnerY;

  return {
    mode: 'pinch',
    scrollLeft: startScrollLeft,
    scrollTop: startScrollTop,
    previewScale,
    previewTx,
    previewTy,
    targetZoom,
  };
}

export function evaluateTwoFingerPinchEngagement(params: {
  startDist: number;
  curDist: number;
  movedPointerCount: number;
  pendingDurationMs: number;
  staggerHoldMs?: number;
  minDistPx?: number;
  minRatioDiff?: number;
}): { exceededDeadband: boolean; engage: boolean; pinchStartDist: number } {
  const {
    startDist,
    curDist,
    movedPointerCount,
    pendingDurationMs,
    staggerHoldMs = 60,
    minDistPx = 22,
    minRatioDiff = 0.14,
  } = params;

  if (startDist < 16 || !Number.isFinite(curDist)) {
    return { exceededDeadband: false, engage: false, pinchStartDist: startDist };
  }

  const distDiff = Math.abs(curDist - startDist);
  const ratioDiff = Math.abs(curDist / startDist - 1);
  const exceededDeadband = distDiff > minDistPx && ratioDiff > minRatioDiff;

  if (!exceededDeadband) {
    return { exceededDeadband: false, engage: false, pinchStartDist: startDist };
  }

  const ready = movedPointerCount >= 2 || pendingDurationMs >= staggerHoldMs;
  if (!ready) {
    return { exceededDeadband: true, engage: false, pinchStartDist: startDist };
  }

  const deadband = Math.max(minDistPx, startDist * minRatioDiff);
  const pinchStartDist =
    curDist >= startDist
      ? startDist + deadband
      : Math.max(12, startDist - deadband);

  return { exceededDeadband: true, engage: true, pinchStartDist };
}

