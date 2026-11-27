import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Circle as CircleIcon,
  Crosshair,
  Eye,
  EyeOff,
  Grid,
  Hand,
  Magnet,
  Minus,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Slash,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { SakugaSlider } from './SakugaSlider';
import {
  CALCULATOR_PRESET_OPTIONS,
  getGraphPresetForTopic,
  GRAPH_PALETTE,
  type GraphPreset,
  type GraphSliderConfig,
} from '../data/graphPresets';
import {
  computeNiceTickStep,
  computePolygonMetrics,
  computeSegmentMetrics,
  findExtrema,
  findIntersections,
  findRoots,
  formatGraphNumber,
  getWorldBounds,
  numericDerivative,
  parsePlotInput,
  screenToWorld,
  snapWorldCoord,
  worldToScreen,
  type AngleUnit,
  type CompiledPlotSpec,
  type GraphCircle,
  type GraphPoint,
  type GraphPolygon,
  type GraphSegment,
  type GraphViewport,
  type ParamMap,
} from '../utils/graphMath';

type ToolMode = 'move' | 'point' | 'segment' | 'vector' | 'circle' | 'tangent';

interface ExpressionItem {
  id: string;
  input: string;
  color: string;
  visible: boolean;
}

interface CompiledExpression extends ExpressionItem {
  parsed: ReturnType<typeof parsePlotInput>;
}

interface GeoGebraGraphToolProps {
  topicId?: string;
  allowPresetSwitch?: boolean;
  heightClassName?: string;
}

const NEXT_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getNextPointLabel(existing: GraphPoint[]): string {
  const used = new Set(existing.map((p) => p.label));
  for (const ch of NEXT_LABELS) {
    if (!used.has(ch)) return ch;
  }
  return `P${existing.length + 1}`;
}

function defaultSliderForParam(name: string): GraphSliderConfig {
  return { name, min: -6, max: 6, step: 0.5 };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(29, 78, 216, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const GeoGebraGraphTool: React.FC<GeoGebraGraphToolProps> = ({
  topicId,
  allowPresetSwitch = false,
  heightClassName = 'h-[300px] sm:h-[360px] lg:h-[420px]',
}) => {
  const initialPreset = useMemo(() => getGraphPresetForTopic(topicId), [topicId]);

  const [activePresetId, setActivePresetId] = useState<string>(initialPreset.id);
  const [toolMode, setToolMode] = useState<ToolMode>('move');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>(initialPreset.angleUnit);
  const [viewport, setViewport] = useState<GraphViewport>(initialPreset.viewport);
  const [expressions, setExpressions] = useState<ExpressionItem[]>(() =>
    initialPreset.expressions.map((e) => ({
      id: e.id,
      input: e.input,
      color: e.color,
      visible: e.visible ?? true,
    }))
  );
  const [params, setParams] = useState<ParamMap>(initialPreset.params);
  const [sliderConfigs, setSliderConfigs] = useState<Record<string, GraphSliderConfig>>(
    initialPreset.sliderConfigs ?? {}
  );
  const [points, setPoints] = useState<GraphPoint[]>(initialPreset.points ?? []);
  const [segments, setSegments] = useState<GraphSegment[]>(initialPreset.segments ?? []);
  const [polygons, setPolygons] = useState<GraphPolygon[]>(initialPreset.polygons ?? []);
  const [circles, setCircles] = useState<GraphCircle[]>(initialPreset.circles ?? []);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(initialPreset.snapToGrid ?? true);
  const [showKeyPoints, setShowKeyPoints] = useState<boolean>(
    initialPreset.showKeyPoints ?? true
  );
  const [tangentEnabled, setTangentEnabled] = useState<boolean>(
    initialPreset.tangentEnabled ?? false
  );
  const [tangentX, setTangentX] = useState<number>(initialPreset.tangentX ?? 1);
  const [animatingParam, setAnimatingParam] = useState<string | null>(null);
  const [focusedExprId, setFocusedExprId] = useState<string | null>(
    initialPreset.expressions[0]?.id ?? null
  );
  const [pendingStart, setPendingStart] = useState<{
    x: number;
    y: number;
    label?: string;
  } | null>(null);
  const [cursorWorld, setCursorWorld] = useState<{ wx: number; wy: number } | null>(null);
  const [hoveredReadout, setHoveredReadout] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 640,
    height: 400,
  });

  const activePointersRef = useRef<Map<number, { sx: number; sy: number }>>(new Map());
  const dragStateRef = useRef<
    | { kind: 'none' }
    | { kind: 'pan'; startSx: number; startSy: number; startCenterX: number; startCenterY: number }
    | { kind: 'point'; pointId: string; pointLabel: string }
    | { kind: 'tangent' }
    | {
        kind: 'pinch';
        startDist: number;
        startPxX: number;
        startPxY: number;
        anchorWx: number;
        anchorWy: number;
        midSx: number;
        midSy: number;
      }
  >({ kind: 'none' });

  const applyPreset = useCallback((preset: GraphPreset) => {
    setActivePresetId(preset.id);
    setAngleUnit(preset.angleUnit);
    setViewport(preset.viewport);
    setExpressions(
      preset.expressions.map((e) => ({
        id: e.id,
        input: e.input,
        color: e.color,
        visible: e.visible ?? true,
      }))
    );
    setParams(preset.params);
    setSliderConfigs(preset.sliderConfigs ?? {});
    setPoints(preset.points ?? []);
    setSegments(preset.segments ?? []);
    setPolygons(preset.polygons ?? []);
    setCircles(preset.circles ?? []);
    setSnapToGrid(preset.snapToGrid ?? true);
    setShowKeyPoints(preset.showKeyPoints ?? true);
    setTangentEnabled(preset.tangentEnabled ?? false);
    setTangentX(preset.tangentX ?? 1);
    setAnimatingParam(null);
    setPendingStart(null);
    setFocusedExprId(preset.expressions[0]?.id ?? null);
  }, []);

  // Re-sync preset when topicId changes
  useEffect(() => {
    const preset = getGraphPresetForTopic(topicId);
    applyPreset(preset);
  }, [topicId, applyPreset]);

  // Observe canvas container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setCanvasSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compile expressions
  const compiledExpressions: CompiledExpression[] = useMemo(
    () =>
      expressions.map((expr) => ({
        ...expr,
        parsed: parsePlotInput(expr.input),
      })),
    [expressions]
  );

  // Collect all active parameter names referenced by expressions
  const activeParamNames = useMemo(() => {
    const set = new Set<string>(Object.keys(params));
    for (const exp of compiledExpressions) {
      if (exp.parsed.ok) {
        for (const p of exp.parsed.spec.referencedParams) {
          set.add(p);
        }
      }
    }
    return Array.from(set).sort();
  }, [compiledExpressions, params]);

  // Resolved parameter values (default 1 for newly typed parameters)
  const resolvedParams: ParamMap = useMemo(() => {
    const out: ParamMap = {};
    for (const name of activeParamNames) {
      out[name] = Object.prototype.hasOwnProperty.call(params, name) ? params[name] : 1;
    }
    return out;
  }, [activeParamNames, params]);

  // Animate a parameter smoothly if Play is toggled
  useEffect(() => {
    if (!animatingParam) return;
    const cfg = sliderConfigs[animatingParam] ?? defaultSliderForParam(animatingParam);
    let direction = 1;
    const timer = window.setInterval(() => {
      setParams((prev) => {
        const cur = prev[animatingParam] ?? 1;
        let next = cur + direction * (cfg.step * 0.4 || 0.2);
        if (next >= cfg.max) {
          next = cfg.max;
          direction = -1;
        } else if (next <= cfg.min) {
          next = cfg.min;
          direction = 1;
        }
        return { ...prev, [animatingParam]: Number(next.toFixed(2)) };
      });
    }, 65);
    return () => window.clearInterval(timer);
  }, [animatingParam, sliderConfigs]);

  const visibleFunctions = useMemo(
    () =>
      compiledExpressions.filter(
        (e): e is CompiledExpression & { parsed: { ok: true; spec: CompiledPlotSpec } } =>
          e.visible && e.parsed.ok && e.parsed.spec.kind === 'function'
      ),
    [compiledExpressions]
  );

  // Compute key points (roots, y-intercepts, extrema, intersections) inside current viewport
  const analysisPoints = useMemo(() => {
    const bounds = getWorldBounds(viewport, canvasSize.width, canvasSize.height);
    const roots: { x: number; y: number; color: string; exprInput: string }[] = [];
    const yIntercepts: { x: number; y: number; color: string }[] = [];
    const extrema: { x: number; y: number; kind: 'min' | 'max'; color: string }[] = [];
    const intersections: { x: number; y: number; label: string }[] = [];

    if (!showKeyPoints) {
      return { roots, yIntercepts, extrema, intersections };
    }

    for (const fn of visibleFunctions) {
      if (fn.parsed.spec.isInequality) continue;
      const evalFn = fn.parsed.spec.evaluate;

      const r = findRoots(evalFn, bounds.xMin, bounds.xMax, resolvedParams, angleUnit, 240);
      for (const pt of r.slice(0, 6)) {
        roots.push({ x: pt.x, y: pt.y, color: fn.color, exprInput: fn.input });
      }

      if (bounds.xMin <= 0 && bounds.xMax >= 0) {
        const y0 = evalFn(0, resolvedParams, angleUnit);
        if (Number.isFinite(y0) && y0 >= bounds.yMin && y0 <= bounds.yMax) {
          yIntercepts.push({ x: 0, y: y0, color: fn.color });
        }
      }

      const ext = findExtrema(evalFn, bounds.xMin, bounds.xMax, resolvedParams, angleUnit, 180);
      for (const pt of ext.slice(0, 5)) {
        if (pt.y >= bounds.yMin - 2 && pt.y <= bounds.yMax + 2) {
          extrema.push({ ...pt, color: fn.color });
        }
      }
    }

    for (let i = 0; i < visibleFunctions.length; i++) {
      for (let j = i + 1; j < visibleFunctions.length; j++) {
        const a = visibleFunctions[i];
        const b = visibleFunctions[j];
        const inter = findIntersections(
          a.parsed.spec.evaluate,
          b.parsed.spec.evaluate,
          bounds.xMin,
          bounds.xMax,
          resolvedParams,
          angleUnit,
          240
        );
        for (const pt of inter.slice(0, 6)) {
          if (pt.y >= bounds.yMin - 1 && pt.y <= bounds.yMax + 1) {
            intersections.push({
              x: pt.x,
              y: pt.y,
              label: `(${formatGraphNumber(pt.x)}, ${formatGraphNumber(pt.y)})`,
            });
          }
        }
      }
    }

    return { roots, yIntercepts, extrema, intersections };
  }, [
    visibleFunctions,
    viewport,
    canvasSize.width,
    canvasSize.height,
    resolvedParams,
    angleUnit,
    showKeyPoints,
  ]);

  // Primary tangent info (on first visible non-vertical function)
  const tangentInfo = useMemo(() => {
    if (!tangentEnabled || visibleFunctions.length === 0) return null;
    const target = visibleFunctions[0];
    const y0 = target.parsed.spec.evaluate(tangentX, resolvedParams, angleUnit);
    const slope = numericDerivative(
      target.parsed.spec.evaluate,
      tangentX,
      resolvedParams,
      angleUnit
    );
    if (!Number.isFinite(y0) || !Number.isFinite(slope)) return null;
    const intercept = y0 - slope * tangentX;
    return {
      color: target.color,
      x0: tangentX,
      y0,
      slope,
      intercept,
    };
  }, [tangentEnabled, visibleFunctions, tangentX, resolvedParams, angleUnit]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const bounds = getWorldBounds(viewport, width, height);
    const stepX = computeNiceTickStep(viewport.pxPerUnitX, 72, angleUnit === 'deg');
    const stepY = computeNiceTickStep(viewport.pxPerUnitY, 64, false);

    // Minor gridlines
    const minorX = stepX / 2;
    const minorY = stepY / 2;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMinorX = Math.floor(bounds.xMin / minorX) * minorX;
    for (let wx = startMinorX; wx <= bounds.xMax; wx += minorX) {
      const { sx } = worldToScreen(wx, 0, viewport, width, height);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMinorY = Math.floor(bounds.yMin / minorY) * minorY;
    for (let wy = startMinorY; wy <= bounds.yMax; wy += minorY) {
      const { sy } = worldToScreen(0, wy, viewport, width, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Major gridlines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startMajorX = Math.floor(bounds.xMin / stepX) * stepX;
    for (let wx = startMajorX; wx <= bounds.xMax; wx += stepX) {
      const { sx } = worldToScreen(wx, 0, viewport, width, height);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMajorY = Math.floor(bounds.yMin / stepY) * stepY;
    for (let wy = startMajorY; wy <= bounds.yMax; wy += stepY) {
      const { sy } = worldToScreen(0, wy, viewport, width, height);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Axes
    const origin = worldToScreen(0, 0, viewport, width, height);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    if (origin.sy >= 0 && origin.sy <= height) {
      ctx.beginPath();
      ctx.moveTo(0, origin.sy);
      ctx.lineTo(width, origin.sy);
      ctx.stroke();
    }
    if (origin.sx >= 0 && origin.sx <= width) {
      ctx.beginPath();
      ctx.moveTo(origin.sx, 0);
      ctx.lineTo(origin.sx, height);
      ctx.stroke();
    }

    // Axis Tick Labels
    ctx.fillStyle = '#475569';
    ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xAxisLabelY = Math.min(Math.max(origin.sy + 5, 6), height - 18);
    for (let wx = startMajorX; wx <= bounds.xMax; wx += stepX) {
      if (Math.abs(wx) < stepX * 0.01) continue;
      const { sx } = worldToScreen(wx, 0, viewport, width, height);
      if (sx < 14 || sx > width - 14) continue;
      const label = angleUnit === 'deg' ? `${formatGraphNumber(wx, 0)}°` : formatGraphNumber(wx, 2);
      ctx.fillText(label, sx, xAxisLabelY);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yAxisLabelX = Math.min(Math.max(origin.sx - 6, 32), width - 6);
    for (let wy = startMajorY; wy <= bounds.yMax; wy += stepY) {
      if (Math.abs(wy) < stepY * 0.01) continue;
      const { sy } = worldToScreen(0, wy, viewport, width, height);
      if (sy < 10 || sy > height - 10) continue;
      ctx.fillText(formatGraphNumber(wy, 2), yAxisLabelX, sy);
    }

    // Polygons (underneath curves and segments)
    for (const poly of polygons) {
      if (poly.vertices.length < 3) continue;
      ctx.save();
      ctx.beginPath();
      poly.vertices.forEach((v, idx) => {
        const { sx, sy } = worldToScreen(v.x, v.y, viewport, width, height);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.fillStyle = hexToRgba(poly.color, 0.14);
      ctx.fill();
      ctx.strokeStyle = poly.color;
      ctx.lineWidth = 2;
      if (poly.dashed) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // Circles
    for (const c of circles) {
      const center = worldToScreen(c.cx, c.cy, viewport, width, height);
      const rx = Math.abs(c.radius * viewport.pxPerUnitX);
      const ry = Math.abs(c.radius * viewport.pxPerUnitY);
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(center.sx, center.sy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(c.color, 0.08);
      ctx.fill();
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Expressions (functions, vertical lines, inequalities)
    for (const exp of compiledExpressions) {
      if (!exp.visible || !exp.parsed.ok) continue;
      const spec = exp.parsed.spec;

      if (spec.kind === 'vertical') {
        const xVal = spec.evaluate(0, resolvedParams, angleUnit);
        if (!Number.isFinite(xVal)) continue;
        const { sx } = worldToScreen(xVal, 0, viewport, width, height);

        if (spec.isInequality) {
          ctx.save();
          ctx.fillStyle = hexToRgba(exp.color, 0.12);
          if (spec.op === '<' || spec.op === '<=') {
            ctx.fillRect(0, 0, Math.max(0, sx), height);
          } else {
            ctx.fillRect(Math.min(width, sx), 0, Math.max(0, width - sx), height);
          }
          ctx.restore();
        }

        ctx.save();
        ctx.strokeStyle = exp.color;
        ctx.lineWidth = 2.25;
        if (spec.dashedBoundary) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // Function y = f(x) or inequality y <= f(x) etc.
      const sampleCount = Math.max(240, Math.min(width, 900));
      const pts: { sx: number; sy: number; valid: boolean }[] = [];
      for (let i = 0; i <= sampleCount; i++) {
        const sx = (i / sampleCount) * width;
        const { wx } = screenToWorld(sx, 0, viewport, width, height);
        const wy = spec.evaluate(wx, resolvedParams, angleUnit);
        if (!Number.isFinite(wy) || Math.abs(wy) > 1e6) {
          pts.push({ sx, sy: 0, valid: false });
        } else {
          const { sy } = worldToScreen(wx, wy, viewport, width, height);
          pts.push({ sx, sy, valid: true });
        }
      }

      // Inequality Shading
      if (spec.isInequality) {
        const shadeTop = spec.op === '>' || spec.op === '>=';
        const edgeY = shadeTop ? 0 : height;
        ctx.save();
        ctx.fillStyle = hexToRgba(exp.color, 0.12);
        let segStart: number | null = null;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const prev = i > 0 ? pts[i - 1] : null;
          const jumped =
            prev && prev.valid && p.valid && Math.abs(p.sy - prev.sy) > height * 1.2;
          if (!p.valid || jumped) {
            if (segStart !== null && i - 1 >= segStart) {
              ctx.beginPath();
              ctx.moveTo(pts[segStart].sx, edgeY);
              for (let k = segStart; k < i; k++) {
                ctx.lineTo(pts[k].sx, Math.min(Math.max(pts[k].sy, -height), height * 2));
              }
              ctx.lineTo(pts[i - 1].sx, edgeY);
              ctx.closePath();
              ctx.fill();
            }
            segStart = p.valid ? i : null;
          } else if (segStart === null) {
            segStart = i;
          }
        }
        if (segStart !== null) {
          ctx.beginPath();
          ctx.moveTo(pts[segStart].sx, edgeY);
          for (let k = segStart; k < pts.length; k++) {
            ctx.lineTo(pts[k].sx, Math.min(Math.max(pts[k].sy, -height), height * 2));
          }
          ctx.lineTo(pts[pts.length - 1].sx, edgeY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Curve stroke with asymptote jump detection
      ctx.save();
      ctx.strokeStyle = exp.color;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (spec.dashedBoundary) ctx.setLineDash([7, 5]);
      ctx.beginPath();
      let drawing = false;
      let prevPt: { sx: number; sy: number; valid: boolean } | null = null;
      for (const pt of pts) {
        if (!pt.valid) {
          drawing = false;
          prevPt = pt;
          continue;
        }
        const clippedSy = Math.min(Math.max(pt.sy, -height * 1.5), height * 2.5);
        const hugeJump =
          prevPt && prevPt.valid && Math.abs(pt.sy - prevPt.sy) > height * 0.85;
        if (!drawing || hugeJump) {
          ctx.moveTo(pt.sx, clippedSy);
          drawing = true;
        } else {
          ctx.lineTo(pt.sx, clippedSy);
        }
        prevPt = pt;
      }
      ctx.stroke();
      ctx.restore();
    }

    // Tangent Line overlay
    if (tangentInfo) {
      const xA = bounds.xMin;
      const xB = bounds.xMax;
      const yA = tangentInfo.slope * xA + tangentInfo.intercept;
      const yB = tangentInfo.slope * xB + tangentInfo.intercept;
      const pA = worldToScreen(xA, yA, viewport, width, height);
      const pB = worldToScreen(xB, yB, viewport, width, height);
      const p0 = worldToScreen(tangentInfo.x0, tangentInfo.y0, viewport, width, height);

      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(p0.sx, p0.sy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // Segments & Vectors
    for (const seg of segments) {
      const p1 = worldToScreen(seg.from.x, seg.from.y, viewport, width, height);
      const p2 = worldToScreen(seg.to.x, seg.to.y, viewport, width, height);
      ctx.save();
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = 2.4;
      if (seg.dashed) ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      if (seg.kind === 'vector') {
        const angle = Math.atan2(p2.sy - p1.sy, p2.sx - p1.sx);
        const headLen = 11;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.moveTo(p2.sx, p2.sy);
        ctx.lineTo(
          p2.sx - headLen * Math.cos(angle - Math.PI / 6),
          p2.sy - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          p2.sx - headLen * Math.cos(angle + Math.PI / 6),
          p2.sy - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Special Key Points (roots, extrema, y-intercepts, intersections)
    if (showKeyPoints) {
      const drawKeyDot = (wx: number, wy: number, fill: string, radius = 4) => {
        const { sx, sy } = worldToScreen(wx, wy, viewport, width, height);
        if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) return;
        ctx.save();
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      for (const r of analysisPoints.roots) drawKeyDot(r.x, r.y, '#059669', 4);
      for (const yi of analysisPoints.yIntercepts) drawKeyDot(yi.x, yi.y, '#d97706', 4);
      for (const ex of analysisPoints.extrema) drawKeyDot(ex.x, ex.y, '#7c3aed', 4.5);
      for (const inter of analysisPoints.intersections) drawKeyDot(inter.x, inter.y, '#0f172a', 5);
    }

    // User/Preset Named Draggable Points
    for (const pt of points) {
      if (pt.visible === false) continue;
      const { sx, sy } = worldToScreen(pt.x, pt.y, viewport, width, height);
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `${pt.label}(${formatGraphNumber(pt.x, 1)}, ${formatGraphNumber(pt.y, 1)})`,
        sx + 8,
        sy - 6
      );
      ctx.restore();
    }

    // Pending construction point preview
    if (pendingStart) {
      const p1 = worldToScreen(pendingStart.x, pendingStart.y, viewport, width, height);
      ctx.save();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(p1.sx, p1.sy, 8, 0, Math.PI * 2);
      ctx.stroke();
      if (cursorWorld) {
        const p2 = worldToScreen(cursorWorld.wx, cursorWorld.wy, viewport, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [
    canvasSize,
    viewport,
    angleUnit,
    polygons,
    circles,
    compiledExpressions,
    resolvedParams,
    tangentInfo,
    segments,
    showKeyPoints,
    analysisPoints,
    points,
    pendingStart,
    cursorWorld,
  ]);

  const snapIfNeeded = useCallback(
    (wx: number, wy: number) => {
      if (!snapToGrid) {
        return { x: Number(wx.toFixed(2)), y: Number(wy.toFixed(2)) };
      }
      const step = angleUnit === 'deg' ? 15 : 0.5;
      const stepY = 0.5;
      return {
        x: snapWorldCoord(wx, step),
        y: angleUnit === 'deg' ? snapWorldCoord(wy, 0.1) : snapWorldCoord(wy, stepY),
      };
    },
    [snapToGrid, angleUnit]
  );

  const findNearestPoint = useCallback(
    (sx: number, sy: number, maxPx = 18): GraphPoint | null => {
      let best: GraphPoint | null = null;
      let bestDist = maxPx;
      for (const pt of points) {
        const pos = worldToScreen(pt.x, pt.y, viewport, canvasSize.width, canvasSize.height);
        const d = Math.hypot(pos.sx - sx, pos.sy - sy);
        if (d < bestDist) {
          bestDist = d;
          best = pt;
        }
      }
      return best;
    },
    [points, viewport, canvasSize.width, canvasSize.height]
  );

  const updatePointAndConnected = useCallback((pointId: string, label: string, nx: number, ny: number) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, x: nx, y: ny } : p))
    );
    setSegments((prev) =>
      prev.map((seg) => ({
        ...seg,
        from: seg.from.label === label ? { ...seg.from, x: nx, y: ny } : seg.from,
        to: seg.to.label === label ? { ...seg.to, x: nx, y: ny } : seg.to,
      }))
    );
    setPolygons((prev) =>
      prev.map((poly) => ({
        ...poly,
        vertices: poly.vertices.map((v) => (v.label === label ? { ...v, x: nx, y: ny } : v)),
      }))
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    activePointersRef.current.set(e.pointerId, { sx, sy });

    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.max(10, Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy));
      const midSx = (pts[0].sx + pts[1].sx) / 2;
      const midSy = (pts[0].sy + pts[1].sy) / 2;
      const anchor = screenToWorld(midSx, midSy, viewport, canvasSize.width, canvasSize.height);
      dragStateRef.current = {
        kind: 'pinch',
        startDist: dist,
        startPxX: viewport.pxPerUnitX,
        startPxY: viewport.pxPerUnitY,
        anchorWx: anchor.wx,
        anchorWy: anchor.wy,
        midSx,
        midSy,
      };
      return;
    }

    const { wx, wy } = screenToWorld(sx, sy, viewport, canvasSize.width, canvasSize.height);

    if (toolMode === 'tangent') {
      setTangentEnabled(true);
      setTangentX(Number(wx.toFixed(2)));
      dragStateRef.current = { kind: 'tangent' };
      return;
    }

    if (toolMode === 'point') {
      const snapped = snapIfNeeded(wx, wy);
      const label = getNextPointLabel(points);
      setPoints((prev) => [
        ...prev,
        {
          id: `pt-${Date.now()}`,
          label,
          x: snapped.x,
          y: snapped.y,
          color: GRAPH_PALETTE[prev.length % GRAPH_PALETTE.length],
        },
      ]);
      return;
    }

    if (toolMode === 'segment' || toolMode === 'vector' || toolMode === 'circle') {
      const nearPt = findNearestPoint(sx, sy);
      const picked = nearPt
        ? { x: nearPt.x, y: nearPt.y, label: nearPt.label }
        : snapIfNeeded(wx, wy);

      if (!pendingStart) {
        if (!nearPt) {
          const newLabel = getNextPointLabel(points);
          const created: GraphPoint = {
            id: `pt-${Date.now()}`,
            label: newLabel,
            x: picked.x,
            y: picked.y,
            color: GRAPH_PALETTE[0],
          };
          setPoints((prev) => [...prev, created]);
          setPendingStart({ x: created.x, y: created.y, label: created.label });
        } else {
          setPendingStart(picked);
        }
        return;
      }

      // Second click completes segment, vector, or circle
      if (toolMode === 'circle') {
        const radius = Math.hypot(picked.x - pendingStart.x, picked.y - pendingStart.y);
        if (radius > 0.05) {
          setCircles((prev) => [
            ...prev,
            {
              id: `cir-${Date.now()}`,
              label: `Circle r=${formatGraphNumber(radius, 2)}`,
              cx: pendingStart.x,
              cy: pendingStart.y,
              radius: Number(radius.toFixed(3)),
              color: GRAPH_PALETTE[prev.length % GRAPH_PALETTE.length],
            },
          ]);
        }
        setPendingStart(null);
        return;
      }

      let endLabel = nearPt?.label;
      if (!nearPt) {
        endLabel = getNextPointLabel(points);
        setPoints((prev) => [
          ...prev,
          {
            id: `pt-${Date.now()}-end`,
            label: endLabel!,
            x: picked.x,
            y: picked.y,
            color: GRAPH_PALETTE[2],
          },
        ]);
      }

      setSegments((prev) => [
        ...prev,
        {
          id: `${toolMode}-${Date.now()}`,
          label: `${pendingStart.label || 'P'}${endLabel || 'Q'}`,
          from: pendingStart,
          to: { x: picked.x, y: picked.y, label: endLabel },
          color: toolMode === 'vector' ? '#059669' : '#1d4ed8',
          kind: toolMode === 'vector' ? 'vector' : 'segment',
        },
      ]);
      setPendingStart(null);
      return;
    }

    // Move / Pan mode: drag nearest point or pan graph
    const hitPoint = findNearestPoint(sx, sy);
    if (hitPoint) {
      dragStateRef.current = {
        kind: 'point',
        pointId: hitPoint.id,
        pointLabel: hitPoint.label,
      };
      return;
    }

    dragStateRef.current = {
      kind: 'pan',
      startSx: sx,
      startSy: sy,
      startCenterX: viewport.centerX,
      startCenterY: viewport.centerY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { sx, sy });
    }

    const drag = dragStateRef.current;
    if (drag.kind === 'pinch' && activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.max(10, Math.hypot(pts[1].sx - pts[0].sx, pts[1].sy - pts[0].sy));
      const factor = Math.min(Math.max(dist / drag.startDist, 0.25), 4);
      const nextPxX = Math.min(Math.max(drag.startPxX * factor, 0.5), 240);
      const nextPxY = Math.min(Math.max(drag.startPxY * factor, 8), 240);
      const midSx = (pts[0].sx + pts[1].sx) / 2;
      const midSy = (pts[0].sy + pts[1].sy) / 2;
      setViewport({
        pxPerUnitX: nextPxX,
        pxPerUnitY: nextPxY,
        centerX: drag.anchorWx - (midSx - canvasSize.width / 2) / nextPxX,
        centerY: drag.anchorWy + (midSy - canvasSize.height / 2) / nextPxY,
      });
      return;
    }

    const world = screenToWorld(sx, sy, viewport, canvasSize.width, canvasSize.height);
    setCursorWorld(world);

    // Check hover over special analysis points
    if (showKeyPoints) {
      let label: string | null = null;
      const checkList: { x: number; y: number; prefix: string }[] = [
        ...analysisPoints.intersections.map((p) => ({ ...p, prefix: 'Intersection' })),
        ...analysisPoints.extrema.map((p) => ({
          ...p,
          prefix: p.kind === 'min' ? 'Local Min' : 'Local Max',
        })),
        ...analysisPoints.roots.map((p) => ({ ...p, prefix: 'Root' })),
        ...analysisPoints.yIntercepts.map((p) => ({ ...p, prefix: 'y-Intercept' })),
      ];
      for (const item of checkList) {
        const p = worldToScreen(item.x, item.y, viewport, canvasSize.width, canvasSize.height);
        if (Math.hypot(p.sx - sx, p.sy - sy) < 12) {
          label = `${item.prefix}: (${formatGraphNumber(item.x)}, ${formatGraphNumber(item.y)})`;
          break;
        }
      }
      setHoveredReadout(label);
    }

    if (drag.kind === 'pan') {
      const dxPx = sx - drag.startSx;
      const dyPx = sy - drag.startSy;
      setViewport((prev) => ({
        ...prev,
        centerX: drag.startCenterX - dxPx / prev.pxPerUnitX,
        centerY: drag.startCenterY + dyPx / prev.pxPerUnitY,
      }));
    } else if (drag.kind === 'point') {
      const snapped = snapIfNeeded(world.wx, world.wy);
      updatePointAndConnected(drag.pointId, drag.pointLabel, snapped.x, snapped.y);
    } else if (drag.kind === 'tangent') {
      setTangentX(Number(world.wx.toFixed(2)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      dragStateRef.current = { kind: 'none' };
    }
  };

  const zoomBy = (factor: number, anchorSx = canvasSize.width / 2, anchorSy = canvasSize.height / 2) => {
    setViewport((prev) => {
      const anchor = screenToWorld(anchorSx, anchorSy, prev, canvasSize.width, canvasSize.height);
      const nextPxX = Math.min(Math.max(prev.pxPerUnitX * factor, 0.5), 240);
      const nextPxY = Math.min(Math.max(prev.pxPerUnitY * factor, 8), 240);
      return {
        pxPerUnitX: nextPxX,
        pxPerUnitY: nextPxY,
        centerX: anchor.wx - (anchorSx - canvasSize.width / 2) / nextPxX,
        centerY: anchor.wy + (anchorSy - canvasSize.height / 2) / nextPxY,
      };
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomBy(factor, sx, sy);
  };

  const addExpression = () => {
    const id = `exp-${Date.now()}`;
    const nextColor = GRAPH_PALETTE[expressions.length % GRAPH_PALETTE.length];
    setExpressions((prev) => [...prev, { id, input: '', color: nextColor, visible: true }]);
    setFocusedExprId(id);
  };

  const insertSnippet = (snippet: string) => {
    const targetId = focusedExprId || expressions[0]?.id;
    if (!targetId) {
      const id = `exp-${Date.now()}`;
      setExpressions([{ id, input: `y = ${snippet}`, color: GRAPH_PALETTE[0], visible: true }]);
      setFocusedExprId(id);
      return;
    }
    setExpressions((prev) =>
      prev.map((e) => (e.id === targetId ? { ...e, input: `${e.input}${snippet}` } : e))
    );
  };

  const toggleAngleUnit = () => {
    const nextUnit: AngleUnit = angleUnit === 'rad' ? 'deg' : 'rad';
    setAngleUnit(nextUnit);
    if (nextUnit === 'deg') {
      setViewport({ centerX: 180, centerY: 0, pxPerUnitX: 1.45, pxPerUnitY: 105 });
    } else {
      setViewport({ centerX: 0, centerY: 0, pxPerUnitX: 40, pxPerUnitY: 40 });
    }
  };

  const currentPreset = getGraphPresetForTopic(activePresetId);

  return (
    <div
      className="space-y-3"
      data-testid="geogebra-workbench"
      data-expression-count={expressions.length}
      data-point-count={points.length}
    >
      {/* Top Toolbar: Tools + Preset Switcher + View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-[1.5px] border-[var(--sk-line)]">
        <div
          className="flex flex-wrap items-center gap-1"
          role="toolbar"
          aria-label="GeoGebra Geometry & Graph Tools"
        >
          {(
            [
              { id: 'move', label: 'Move / Pan', icon: MousePointer2 },
              { id: 'point', label: 'Point', icon: Crosshair },
              { id: 'segment', label: 'Segment', icon: Slash },
              { id: 'vector', label: 'Vector', icon: TrendingUp },
              { id: 'circle', label: 'Circle', icon: CircleIcon },
              { id: 'tangent', label: 'Tangent', icon: Hand },
            ] as const
          ).map((tool) => {
            const Icon = tool.icon;
            const active = toolMode === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setToolMode(tool.id);
                  setPendingStart(null);
                  if (tool.id === 'tangent') setTangentEnabled(true);
                }}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-[11px] border-[1.5px] transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--sk-pri)] text-white border-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)]'
                    : 'bg-[var(--sk-chip)] text-[var(--sk-body)] border-[var(--sk-line)] hover:border-[var(--sk-ink)] hover:text-[var(--sk-ink)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {allowPresetSwitch && (
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--sk-dim)]">
              <span className="sr-only">Load preset</span>
              <select
                aria-label="Graph preset"
                value={activePresetId}
                onChange={(e) => applyPreset(getGraphPresetForTopic(e.target.value))}
                className="sk-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                {CALCULATOR_PRESET_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    Preset: {opt.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={() => setSnapToGrid((s) => !s)}
            aria-pressed={snapToGrid}
            title="Snap points to grid"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-[11px] border-[1.5px] cursor-pointer ${
              snapToGrid
                ? 'bg-[var(--sk-ink)] text-white border-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)]'
                : 'bg-white text-[var(--sk-body)] border-[var(--sk-line)] hover:border-[var(--sk-ink)] hover:bg-[var(--sk-chip)]'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Snap</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKeyPoints((k) => !k)}
            aria-pressed={showKeyPoints}
            title="Highlight roots, extrema & intersections"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-[11px] border-[1.5px] cursor-pointer ${
              showKeyPoints
                ? 'bg-[var(--sk-chip)] text-[var(--sk-ink)] border-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)]'
                : 'bg-white text-[var(--sk-body)] border-[var(--sk-line)] hover:border-[var(--sk-ink)] hover:bg-[var(--sk-chip)]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Key Pts</span>
          </button>

          <button
            type="button"
            onClick={toggleAngleUnit}
            className="sk-btn-subtle px-2.5 py-1.5 text-xs font-mono font-semibold cursor-pointer"
            title="Switch angle unit between Radians and Degrees"
          >
            {angleUnit === 'deg' ? 'DEG °' : 'RAD'}
          </button>

          <div className="inline-flex items-center border-[1.5px] border-[var(--sk-line)] rounded-[11px] overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => zoomBy(1.25)}
              aria-label="Zoom in graph"
              className="px-2 py-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] border-r border-[var(--sk-line)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(0.8)}
              aria-label="Zoom out graph"
              className="px-2 py-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] border-r border-[var(--sk-line)] cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyPreset(currentPreset)}
              aria-label="Reset graph view"
              title="Reset to topic preset"
              className="px-2 py-1.5 text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workbench: Algebra Input & Live Analysis + Interactive Canvas */}
      <div className="grid lg:grid-cols-[330px_1fr] gap-4 items-start">
        {/* Left Algebra & Geometry Panel (stacks below canvas on tablet/mobile) */}
        <div className="order-2 lg:order-1 space-y-3 bg-[var(--sk-surface)] border-[1.5px] border-[var(--sk-line)] rounded-[16px] p-3">
          {/* Expressions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--sk-ink)]">
                Equations &amp; Inequalities
              </span>
              <button
                type="button"
                onClick={addExpression}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[var(--sk-pri)] hover:bg-[var(--sk-chip)] rounded-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Equation
              </button>
            </div>

            {expressions.map((exp, idx) => {
              const compiled = compiledExpressions[idx];
              const isValid = compiled.parsed.ok || exp.input.trim() === '';
              return (
                <div key={exp.id} className="space-y-1">
                  <div className="sk-input-shell flex items-center gap-1.5 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpressions((prev) =>
                          prev.map((item) =>
                            item.id === exp.id ? { ...item, visible: !item.visible } : item
                          )
                        )
                      }
                      aria-label={`${exp.visible ? 'Hide' : 'Show'} expression ${idx + 1}`}
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 cursor-pointer border border-[var(--sk-line)]"
                      style={{
                        backgroundColor: exp.visible ? exp.color : 'var(--sk-surface)',
                        color: exp.visible ? '#ffffff' : '#8580B0',
                      }}
                    >
                      {exp.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="text"
                      value={exp.input}
                      onFocus={() => setFocusedExprId(exp.id)}
                      onChange={(e) =>
                        setExpressions((prev) =>
                          prev.map((item) =>
                            item.id === exp.id ? { ...item, input: e.target.value } : item
                          )
                        )
                      }
                      aria-label={`Equation ${idx + 1}`}
                      placeholder="e.g. y = x^2 - 4 or 2x + 3y = 12"
                      className="sk-input-field flex-1 min-w-0 text-xs font-mono text-[var(--sk-ink)] bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExpressions((prev) => prev.filter((item) => item.id !== exp.id))
                      }
                      aria-label={`Remove expression ${idx + 1}`}
                      className="p-1 text-[var(--sk-dim)] hover:text-[var(--sk-acc-ink)] cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {!isValid && !compiled.parsed.ok && (
                    <div className="text-[11px] text-[var(--sk-acc-ink)] px-1">{compiled.parsed.error}</div>
                  )}
                </div>
              );
            })}

            {/* Quick Math Keypad Chips */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {[
                { label: 'x²', insert: 'x^2' },
                { label: '√()', insert: 'sqrt(' },
                { label: '|x|', insert: 'abs(x)' },
                { label: 'sin', insert: 'sin(x)' },
                { label: 'cos', insert: 'cos(x)' },
                { label: 'π', insert: 'pi' },
                { label: '≤', insert: ' <= ' },
                { label: '≥', insert: ' >= ' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => insertSnippet(chip.insert)}
                  className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white border border-[var(--sk-line)] rounded-md hover:border-[var(--sk-ink)] hover:bg-[var(--sk-chip)] text-[var(--sk-ink)] cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Sliders */}
          {activeParamNames.length > 0 && (
            <div className="pt-2 border-t border-[var(--sk-line)] space-y-2">
              <div className="text-xs font-semibold text-[var(--sk-ink)]">Parameter Sliders</div>
              {activeParamNames.map((name) => {
                const cfg = sliderConfigs[name] ?? defaultSliderForParam(name);
                const val = resolvedParams[name] ?? 1;
                const isPlaying = animatingParam === name;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor={`slider-${name}`} className="font-mono font-semibold text-[var(--sk-ink)]">
                        {name} = {formatGraphNumber(val, 2)}
                      </label>
                      <button
                        type="button"
                        onClick={() => setAnimatingParam(isPlaying ? null : name)}
                        aria-label={`${isPlaying ? 'Pause' : 'Animate'} parameter ${name}`}
                        className="p-1 sk-btn-subtle cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                    <SakugaSlider
                      id={`slider-${name}`}
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                      value={val}
                      onChange={(nextVal) =>
                        setParams((prev) => ({ ...prev, [name]: nextVal }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Tangent Line Inspector */}
          {tangentEnabled && visibleFunctions.length > 0 && (
            <div className="pt-2 border-t border-[var(--sk-line)] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="tangent-x0" className="font-semibold text-[var(--sk-ink)]">
                  Tangent at x₀ = <span className="font-mono">{formatGraphNumber(tangentX, 2)}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTangentEnabled(false)}
                  className="text-[11px] text-[var(--sk-dim)] hover:text-[var(--sk-ink)] cursor-pointer"
                >
                  Hide
                </button>
              </div>
              <SakugaSlider
                id="tangent-x0"
                variant="sakura"
                min={angleUnit === 'deg' ? 0 : -5}
                max={angleUnit === 'deg' ? 360 : 5}
                step={angleUnit === 'deg' ? 5 : 0.1}
                value={tangentX}
                onChange={setTangentX}
              />
              {tangentInfo && (
                <div className="text-[11px] font-mono text-[var(--sk-body)] bg-white border border-[var(--sk-line)] rounded-lg p-2 space-y-0.5">
                  <div>
                    Point: ({formatGraphNumber(tangentInfo.x0, 2)},{' '}
                    {formatGraphNumber(tangentInfo.y0, 2)})
                  </div>
                  <div className="text-[var(--sk-acc-ink)] font-semibold">
                    Gradient dy/dx = {formatGraphNumber(tangentInfo.slope, 3)}
                  </div>
                  <div>
                    Tangent: y = {formatGraphNumber(tangentInfo.slope, 2)}x{' '}
                    {tangentInfo.intercept >= 0
                      ? `+ ${formatGraphNumber(tangentInfo.intercept, 2)}`
                      : `- ${formatGraphNumber(Math.abs(tangentInfo.intercept), 2)}`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Geometry Objects & Live Measurements */}
          {(points.length > 0 || segments.length > 0 || polygons.length > 0 || circles.length > 0) && (
            <div className="pt-2 border-t border-[var(--sk-line)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--sk-ink)]">Geometry Objects</span>
                <button
                  type="button"
                  onClick={() => {
                    setPoints([]);
                    setSegments([]);
                    setPolygons([]);
                    setCircles([]);
                    setPendingStart(null);
                  }}
                  className="text-[11px] text-[var(--sk-dim)] hover:text-[var(--sk-acc-ink)] cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-[11px] font-mono">
                {points.map((pt) => (
                  <div
                    key={pt.id}
                    className="flex items-center justify-between bg-white border border-[var(--sk-line)] rounded-md px-2 py-1"
                  >
                    <span className="text-[var(--sk-ink)]">
                      <strong>{pt.label}</strong> = ({formatGraphNumber(pt.x, 2)},{' '}
                      {formatGraphNumber(pt.y, 2)})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPoints((prev) => prev.filter((p) => p.id !== pt.id))}
                      aria-label={`Delete point ${pt.label}`}
                      className="text-[var(--sk-dim)] hover:text-[var(--sk-acc-ink)] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {segments.map((seg) => {
                  const m = computeSegmentMetrics(seg.from, seg.to);
                  return (
                    <div
                      key={seg.id}
                      className="bg-white border border-[var(--sk-line)] rounded-md px-2 py-1 space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[var(--sk-ink)] font-semibold">
                        <span>
                          {seg.kind === 'vector' ? 'Vector' : 'Segment'} {seg.label ?? ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSegments((prev) => prev.filter((s) => s.id !== seg.id))}
                          aria-label={`Delete ${seg.kind} ${seg.label ?? ''}`}
                          className="text-[var(--sk-dim)] hover:text-[var(--sk-acc-ink)] cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {seg.kind === 'vector' ? (
                        <div className="text-[#047857]">
                          ({formatGraphNumber(m.dx, 2)}, {formatGraphNumber(m.dy, 2)}) · |v| ={' '}
                          {formatGraphNumber(m.length, 2)}
                        </div>
                      ) : (
                        <div className="text-[var(--sk-body)]">
                          d = {formatGraphNumber(m.length, 2)} · m ={' '}
                          {m.gradient !== null ? formatGraphNumber(m.gradient, 2) : 'undef'} · mid (
                          {formatGraphNumber(m.midpoint.x, 2)}, {formatGraphNumber(m.midpoint.y, 2)}
                          )
                        </div>
                      )}
                    </div>
                  );
                })}

                {polygons.map((poly) => {
                  const m = computePolygonMetrics(poly.vertices);
                  return (
                    <div
                      key={poly.id}
                      className="bg-white border border-[var(--sk-line)] rounded-md px-2 py-1 text-[var(--sk-body)]"
                    >
                      <strong className="text-[var(--sk-ink)]">{poly.label ?? 'Polygon'}</strong>: Area ={' '}
                      {formatGraphNumber(m.area, 2)} · Perim = {formatGraphNumber(m.perimeter, 2)}
                    </div>
                  );
                })}

                {circles.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-white border border-[var(--sk-line)] rounded-md px-2 py-1 text-[var(--sk-body)]"
                  >
                    <span>
                      Circle ({formatGraphNumber(c.cx, 1)}, {formatGraphNumber(c.cy, 1)}) r ={' '}
                      {formatGraphNumber(c.radius, 2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCircles((prev) => prev.filter((item) => item.id !== c.id))}
                      aria-label="Delete circle"
                      className="text-[var(--sk-dim)] hover:text-[var(--sk-acc-ink)] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Key Points Readout */}
          {showKeyPoints &&
            (analysisPoints.roots.length > 0 ||
              analysisPoints.extrema.length > 0 ||
              analysisPoints.intersections.length > 0) && (
              <div className="pt-2 border-t border-[var(--sk-line)] space-y-1 text-[11px] font-mono">
                <div className="font-sans text-xs font-semibold text-[var(--sk-ink)]">
                  Special Key Points (Visible Window)
                </div>
                {analysisPoints.intersections.length > 0 && (
                  <div className="text-[var(--sk-ink)]">
                    <span className="font-semibold">Intersections:</span>{' '}
                    {analysisPoints.intersections.map((p) => p.label).join(', ')}
                  </div>
                )}
                {analysisPoints.roots.length > 0 && (
                  <div className="text-[#047857]">
                    <span className="font-semibold">Roots (x-int):</span>{' '}
                    {analysisPoints.roots
                      .map((r) => `(${formatGraphNumber(r.x, 2)}, 0)`)
                      .join(', ')}
                  </div>
                )}
                {analysisPoints.extrema.length > 0 && (
                  <div className="text-[var(--sk-pri)]">
                    <span className="font-semibold">Turning Pts:</span>{' '}
                    {analysisPoints.extrema
                      .map(
                        (ex) =>
                          `${ex.kind}(${formatGraphNumber(ex.x, 2)}, ${formatGraphNumber(ex.y, 2)})`
                      )
                      .join(', ')}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Right Interactive Coordinate Canvas (appears first on tablet/mobile) */}
        <div className="order-1 lg:order-2 space-y-1.5">
          <div
            ref={containerRef}
            className={`relative w-full ${heightClassName} bg-white border-2 border-[var(--sk-ink)] rounded-[16px] shadow-[3px_4px_0_var(--sk-soft)] overflow-hidden select-none`}
          >
            <canvas
              ref={canvasRef}
              data-testid="geogebra-canvas"
              aria-label="Interactive GeoGebra coordinate graphing canvas"
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={() => {
                setCursorWorld(null);
                setHoveredReadout(null);
              }}
              onWheel={handleWheel}
              className="w-full h-full block touch-none cursor-crosshair"
            />

            {/* Mode Instruction / Hover Readout Badge */}
            {(hoveredReadout || pendingStart) && (
              <div className="pointer-events-none absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 border-[1.5px] border-[var(--sk-ink)] text-xs font-mono text-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)]">
                {pendingStart
                  ? `Click second point to finish ${toolMode}...`
                  : hoveredReadout}
              </div>
            )}

            {/* Live Coordinate Readout */}
            {cursorWorld && (
              <div className="pointer-events-none absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/95 border-[1.5px] border-[var(--sk-ink)] text-[11px] font-mono tabular-nums text-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)]">
                ({formatGraphNumber(cursorWorld.wx, 2)}
                {angleUnit === 'deg' ? '°' : ''}, {formatGraphNumber(cursorWorld.wy, 2)})
              </div>
            )}
          </div>

          <p className="text-[11px] text-[var(--sk-dim)]">
            {currentPreset.subtitle} Drag canvas to pan, scroll or pinch to zoom, or drag plotted
            points directly.
          </p>
        </div>
      </div>
    </div>
  );
};
