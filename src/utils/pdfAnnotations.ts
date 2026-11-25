import { isDirectCorsPdfUrl } from './papacambridge';

export interface NormalizedPoint {
  x: number; // 0..1 relative to page width
  y: number; // 0..1 relative to page height
}

export type AnnotationTool = 'pen' | 'highlighter' | 'eraser' | 'pan';
export type StrokeWidthPresetId = 'fine' | 'med' | 'bold';

export function resolveDefaultAnnotatorToolAndWidth(
  docRole: 'qp' | 'questions' | 'ms' | 'answers' | 'general'
): { tool: AnnotationTool; widthPreset: StrokeWidthPresetId } {
  if (docRole === 'ms' || docRole === 'answers') {
    return { tool: 'pan', widthPreset: 'fine' };
  }
  return { tool: 'pen', widthPreset: 'fine' };
}

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

function cross2d(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function onSegmentBoundingBox(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): boolean {
  return (
    px <= Math.max(ax, bx) + 1e-9 &&
    px >= Math.min(ax, bx) - 1e-9 &&
    py <= Math.max(ay, by) + 1e-9 &&
    py >= Math.min(ay, by) - 1e-9
  );
}

function segmentsIntersect(
  a1: NormalizedPoint,
  a2: NormalizedPoint,
  b1: NormalizedPoint,
  b2: NormalizedPoint
): boolean {
  const d1 = cross2d(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y);
  const d2 = cross2d(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y);
  const d3 = cross2d(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y);
  const d4 = cross2d(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  if (Math.abs(d1) <= 1e-9 && onSegmentBoundingBox(a1.x, a1.y, b1.x, b1.y, b2.x, b2.y)) return true;
  if (Math.abs(d2) <= 1e-9 && onSegmentBoundingBox(a2.x, a2.y, b1.x, b1.y, b2.x, b2.y)) return true;
  if (Math.abs(d3) <= 1e-9 && onSegmentBoundingBox(b1.x, b1.y, a1.x, a1.y, a2.x, a2.y)) return true;
  if (Math.abs(d4) <= 1e-9 && onSegmentBoundingBox(b2.x, b2.y, a1.x, a1.y, a2.x, a2.y)) return true;
  return false;
}

export function segmentToSegmentDistance(
  a1: NormalizedPoint,
  a2: NormalizedPoint,
  b1: NormalizedPoint,
  b2: NormalizedPoint
): number {
  if (segmentsIntersect(a1, a2, b1, b2)) return 0;
  return Math.min(
    pointToSegmentDistance(a1.x, a1.y, b1.x, b1.y, b2.x, b2.y),
    pointToSegmentDistance(a2.x, a2.y, b1.x, b1.y, b2.x, b2.y),
    pointToSegmentDistance(b1.x, b1.y, a1.x, a1.y, a2.x, a2.y),
    pointToSegmentDistance(b2.x, b2.y, a1.x, a1.y, a2.x, a2.y)
  );
}

export function isPointNearStroke(
  point: NormalizedPoint,
  stroke: AnnotationStroke,
  normalizedRadius: number
): boolean {
  return isSegmentNearStroke(point, point, stroke, normalizedRadius);
}

export function isSegmentNearStroke(
  fromPoint: NormalizedPoint,
  toPoint: NormalizedPoint,
  stroke: AnnotationStroke,
  normalizedRadius: number
): boolean {
  if (stroke.points.length === 0) return false;
  const effectiveRadius = normalizedRadius + (stroke.size * 0.5) / 720;
  if (stroke.points.length === 1) {
    const p = stroke.points[0];
    return (
      pointToSegmentDistance(p.x, p.y, fromPoint.x, fromPoint.y, toPoint.x, toPoint.y) <=
      effectiveRadius
    );
  }
  for (let i = 0; i < stroke.points.length - 1; i++) {
    const a = stroke.points[i];
    const b = stroke.points[i + 1];
    if (segmentToSegmentDistance(fromPoint, toPoint, a, b) <= effectiveRadius) {
      return true;
    }
  }
  return false;
}

export function eraseStrokesAlongSegment(
  strokes: AnnotationStroke[],
  fromPoint: NormalizedPoint,
  toPoint: NormalizedPoint,
  normalizedRadius = 0.024
): { remaining: AnnotationStroke[]; removedAny: boolean } {
  let removedAny = false;
  const remaining = strokes.filter((stroke) => {
    const hit = isSegmentNearStroke(fromPoint, toPoint, stroke, normalizedRadius);
    if (hit) removedAny = true;
    return !hit;
  });
  return { remaining, removedAny };
}

export function eraseStrokesNearPoint(
  strokes: AnnotationStroke[],
  point: NormalizedPoint,
  normalizedRadius = 0.024
): { remaining: AnnotationStroke[]; removedAny: boolean } {
  return eraseStrokesAlongSegment(strokes, point, point, normalizedRadius);
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

export function buildPdfByteCandidateUrls(sourceUrl: string, externalUrl?: string): string[] {
  const trimmedSource = sourceUrl.trim();
  const trimmedExternal = (externalUrl || '').trim();

  if (trimmedSource.startsWith('blob:') || trimmedSource.startsWith('data:')) {
    return [trimmedSource];
  }

  const candidates: string[] = [];
  if (trimmedExternal && isDirectCorsPdfUrl(trimmedExternal)) {
    candidates.push(trimmedExternal);
    if (trimmedSource && trimmedSource !== trimmedExternal) {
      candidates.push(trimmedSource);
    }
  } else {
    if (trimmedSource) {
      candidates.push(trimmedSource);
    }
    if (trimmedExternal && trimmedExternal !== trimmedSource) {
      candidates.push(trimmedExternal);
    }
  }

  return candidates;
}

const PDF_BYTES_CACHE_MAX_ENTRIES = 18;
const PDF_BYTES_CACHE_MAX_TOTAL_BYTES = 55 * 1024 * 1024;
const PDF_PERSISTENT_CACHE_NAME = 'rifkis-notes-pdf-v1';
const PDF_PERSISTENT_CACHE_MAX_ENTRIES = 200;

const pdfBytesCache = new Map<string, { bytes: Uint8Array; loadedFrom: string }>();
const inFlightPdfFetches = new Map<string, Promise<{ bytes: Uint8Array; loadedFrom: string }>>();
let pdfBytesCacheTotalBytes = 0;
let activeHighPriorityFetches = 0;
const highPriorityIdleResolvers: Array<() => void> = [];

function notifyHighPriorityIdle(): void {
  if (activeHighPriorityFetches > 0) return;
  while (highPriorityIdleResolvers.length > 0) {
    const resolve = highPriorityIdleResolvers.shift();
    resolve?.();
  }
}

export function hasActiveHighPriorityPdfFetch(): boolean {
  return activeHighPriorityFetches > 0;
}

export function waitForHighPriorityPdfFetches(): Promise<void> {
  if (activeHighPriorityFetches === 0) return Promise.resolve();
  return new Promise((resolve) => {
    highPriorityIdleResolvers.push(resolve);
  });
}

function toPersistentCacheKey(url: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.location?.origin) return null;
    return new URL(url, window.location.origin).toString();
  } catch {
    return null;
  }
}

async function openPersistentPdfCache(): Promise<Cache | null> {
  if (typeof window === 'undefined') return null;
  const cacheStorage = window.caches;
  if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
  try {
    return await cacheStorage.open(PDF_PERSISTENT_CACHE_NAME);
  } catch {
    return null;
  }
}

async function readPersistentPdfCache(
  candidateUrls: string[]
): Promise<{ bytes: Uint8Array; loadedFrom: string } | null> {
  const cache = await openPersistentPdfCache();
  if (!cache) return null;
  for (const url of candidateUrls) {
    const cacheKey = toPersistentCacheKey(url);
    if (!cacheKey) continue;
    try {
      const match = await cache.match(cacheKey);
      if (!match || !match.ok) continue;
      const buf = await match.arrayBuffer();
      const bytes = new Uint8Array(buf);
      if (!hasPdfHeader(bytes)) {
        void cache.delete(cacheKey).catch(() => undefined);
        continue;
      }
      const loadedFrom = match.headers.get('X-Pdf-Loaded-From') || url;
      const entry = { bytes, loadedFrom };
      writePdfBytesCache(url, entry);
      if (loadedFrom !== url) {
        writePdfBytesCache(loadedFrom, entry);
      }
      return { bytes: bytes.slice(), loadedFrom };
    } catch {
      // ignore Cache API read failure
    }
  }
  return null;
}

async function writePersistentPdfCache(
  urlsToIndex: string[],
  bytes: Uint8Array,
  loadedFrom: string
): Promise<void> {
  if (bytes.byteLength > 20 * 1024 * 1024) return;
  const cache = await openPersistentPdfCache();
  if (!cache) return;
  try {
    const keys = await cache.keys();
    if (keys.length >= PDF_PERSISTENT_CACHE_MAX_ENTRIES) {
      const removeCount = keys.length - PDF_PERSISTENT_CACHE_MAX_ENTRIES + 1;
      for (let i = 0; i < removeCount; i++) {
        await cache.delete(keys[i]);
      }
    }
    const uniqueKeys = Array.from(
      new Set(
        urlsToIndex
          .map((u) => toPersistentCacheKey(u))
          .filter((k): k is string => Boolean(k))
      )
    );
    for (const key of uniqueKeys) {
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const response = new Response(copy.buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'X-Pdf-Loaded-From': loadedFrom,
        },
      });
      await cache.put(key, response);
    }
  } catch {
    // ignore quota or private-mode Cache API errors cleanly
  }
}

export async function hasCachedPdfBytes(candidateUrls: string[]): Promise<boolean> {
  for (const url of candidateUrls) {
    if (pdfBytesCache.has(url)) return true;
  }
  const cache = await openPersistentPdfCache();
  if (!cache) return false;
  for (const url of candidateUrls) {
    const cacheKey = toPersistentCacheKey(url);
    if (!cacheKey) continue;
    try {
      const hit = await cache.match(cacheKey);
      if (hit && hit.ok) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

function writePdfBytesCache(url: string, entry: { bytes: Uint8Array; loadedFrom: string }): void {
  if (entry.bytes.byteLength > 15 * 1024 * 1024) return;
  const existing = pdfBytesCache.get(url);
  if (existing) {
    pdfBytesCacheTotalBytes -= existing.bytes.byteLength;
    pdfBytesCache.delete(url);
  }
  while (
    pdfBytesCache.size >= PDF_BYTES_CACHE_MAX_ENTRIES ||
    (pdfBytesCacheTotalBytes + entry.bytes.byteLength > PDF_BYTES_CACHE_MAX_TOTAL_BYTES &&
      pdfBytesCache.size > 0)
  ) {
    const oldestKey = pdfBytesCache.keys().next().value;
    if (!oldestKey) break;
    const oldest = pdfBytesCache.get(oldestKey);
    if (oldest) pdfBytesCacheTotalBytes -= oldest.bytes.byteLength;
    pdfBytesCache.delete(oldestKey);
  }
  pdfBytesCache.set(url, entry);
  pdfBytesCacheTotalBytes += entry.bytes.byteLength;
}

export function clearPdfBytesCache(): void {
  pdfBytesCache.clear();
  inFlightPdfFetches.clear();
  pdfBytesCacheTotalBytes = 0;
}

export function prefetchPdfBytes(candidateUrls: string[]): void {
  if (candidateUrls.length === 0) return;
  void fetchPdfBytesWithFallback(candidateUrls, { priority: 'high' }).catch(() => undefined);
}

export async function fetchPdfBytesWithFallback(
  candidateUrls: string[],
  options: {
    signal?: AbortSignal;
    fetchImpl?: typeof fetch;
    bypassCache?: boolean;
    priority?: 'high' | 'background';
  } = {}
): Promise<{ bytes: Uint8Array; loadedFrom: string }> {
  const fetchFn = options.fetchImpl ?? fetch;
  const canUseSharedCache = !options.bypassCache;
  const isHighPriority = options.priority !== 'background';

  if (canUseSharedCache) {
    for (const url of candidateUrls) {
      const cached = pdfBytesCache.get(url);
      if (cached) {
        // Refresh LRU order and return a fresh copy so pdf.js worker transfer cannot detach cached bytes
        pdfBytesCache.delete(url);
        pdfBytesCache.set(url, cached);
        return { bytes: cached.bytes.slice(), loadedFrom: cached.loadedFrom };
      }
    }

    const persistentHit = await readPersistentPdfCache(candidateUrls);
    if (persistentHit) {
      return persistentHit;
    }

    const cacheKey = candidateUrls.join('|');
    const existingFlight = inFlightPdfFetches.get(cacheKey);
    if (existingFlight) {
      const result = await existingFlight;
      return { bytes: result.bytes.slice(), loadedFrom: result.loadedFrom };
    }

    if (isHighPriority) {
      activeHighPriorityFetches += 1;
    }

    const flightPromise = (async () => {
      const fetched = await executeFetchCandidates(candidateUrls, fetchFn, options.signal);
      if (isHighPriority) {
        writePdfBytesCache(fetched.loadedFrom, fetched);
        if (candidateUrls[0] && candidateUrls[0] !== fetched.loadedFrom) {
          writePdfBytesCache(candidateUrls[0], fetched);
        }
      }
      void writePersistentPdfCache(
        candidateUrls[0] ? [fetched.loadedFrom, candidateUrls[0]] : [fetched.loadedFrom],
        fetched.bytes,
        fetched.loadedFrom
      );
      return fetched;
    })();

    inFlightPdfFetches.set(cacheKey, flightPromise);
    try {
      const result = await flightPromise;
      return { bytes: result.bytes.slice(), loadedFrom: result.loadedFrom };
    } finally {
      inFlightPdfFetches.delete(cacheKey);
      if (isHighPriority) {
        activeHighPriorityFetches = Math.max(0, activeHighPriorityFetches - 1);
        notifyHighPriorityIdle();
      }
    }
  }

  return executeFetchCandidates(candidateUrls, fetchFn, options.signal);
}

async function executeFetchCandidates(
  candidateUrls: string[],
  fetchFn: typeof fetch,
  signal?: AbortSignal
): Promise<{ bytes: Uint8Array; loadedFrom: string }> {
  let lastError = 'Unable to fetch or parse PDF bytes.';

  for (const url of candidateUrls) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const isExternalHttps = /^https?:\/\//i.test(url) && !url.startsWith('/api/');
    try {
      const resp = await fetchFn(url, {
        mode: isExternalHttps ? 'cors' : 'same-origin',
        credentials: isExternalHttps ? 'omit' : 'same-origin',
        signal,
      });

      const contentType = (resp.headers.get('content-type') || '').toLowerCase();
      if (!resp.ok) {
        let detail = `HTTP ${resp.status}`;
        if (contentType.includes('application/json')) {
          try {
            const payload = (await resp.json()) as { error?: string };
            if (payload.error) detail = payload.error;
          } catch {
            // ignore JSON parse failure
          }
        }
        lastError = detail;
        continue;
      }

      const buffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (!hasPdfHeader(bytes)) {
        if (contentType.includes('text/html') && url.startsWith('/api/')) {
          lastError =
            'The PDF proxy endpoint returned an HTML page instead of PDF bytes (the backend proxy may not be running on this host, or the file does not exist in the archive).';
        } else {
          lastError = `Expected a PDF document (%PDF-), but received ${contentType || 'unknown content'}.`;
        }
        continue;
      }

      return { bytes, loadedFrom: url };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      lastError = err instanceof Error && err.message ? err.message : lastError;
    }
  }

  throw new Error(lastError);
}

export function computeFitWidthZoom(opts: {
  containerWidth: number;
  pageWidth: number;
  horizontalPadding?: number;
  minZoom?: number;
  maxZoom?: number;
}): number {
  const {
    containerWidth,
    pageWidth,
    horizontalPadding = 48,
    minZoom = 0.65,
    maxZoom = 2.5,
  } = opts;
  if (!Number.isFinite(containerWidth) || !Number.isFinite(pageWidth) || pageWidth <= 0) {
    return 1;
  }
  const usableWidth = Math.max(120, containerWidth - horizontalPadding);
  const raw = usableWidth / pageWidth;
  const clamped = Math.max(minZoom, Math.min(maxZoom, raw));
  return Number(clamped.toFixed(2));
}

export function resolveAnnotatorContainerClasses(opts: {
  isAnnotatorFullscreen: boolean;
  isParentFullscreen?: boolean;
  defaultHeightClass?: string;
}): {
  rootClass: string;
  scrollContainerClass: string;
  isImmersive: boolean;
} {
  const defaultHeight = opts.defaultHeightClass ?? 'h-[620px]';
  if (opts.isAnnotatorFullscreen) {
    return {
      rootClass:
        'fixed inset-0 z-[70] w-screen h-screen h-[100dvh] flex flex-col bg-[#FAF9FF] overflow-hidden',
      scrollContainerClass: 'flex-1 min-h-0',
      isImmersive: true,
    };
  }
  if (opts.isParentFullscreen) {
    return {
      rootClass: 'flex-1 min-h-0 flex flex-col bg-[#FAF9FF]',
      scrollContainerClass: 'flex-1 min-h-0',
      isImmersive: true,
    };
  }
  return {
    rootClass: 'flex flex-col bg-[#FAF9FF]',
    scrollContainerClass: defaultHeight,
    isImmersive: false,
  };
}

let activeFullscreenLocks = 0;
let savedBodyOverflow: string | null = null;

export function acquireFullscreenBodyLock(): () => void {
  if (typeof document === 'undefined' || !document.body) {
    return () => undefined;
  }
  if (activeFullscreenLocks === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activeFullscreenLocks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeFullscreenLocks = Math.max(0, activeFullscreenLocks - 1);
    if (activeFullscreenLocks === 0 && typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = savedBodyOverflow ?? '';
      savedBodyOverflow = null;
    }
  };
}

export function shouldStartSinglePointerBackgroundPan(params: {
  activeTool: AnnotationTool;
  hasDocument: boolean;
  isInteractiveControl: boolean;
  isInsidePaperPage: boolean;
  activeTouchCount: number;
  isMultiTouchActive: boolean;
  pointerType: string;
  button: number;
}): boolean {
  const {
    activeTool,
    hasDocument,
    isInteractiveControl,
    isInsidePaperPage,
    activeTouchCount,
    isMultiTouchActive,
    pointerType,
    button,
  } = params;

  if (!hasDocument || isInteractiveControl) return false;
  if (isMultiTouchActive || activeTouchCount >= 2) return false;
  if (pointerType === 'mouse' && button !== 0) return false;

  if (activeTool === 'pan') return true;
  return !isInsidePaperPage;
}

