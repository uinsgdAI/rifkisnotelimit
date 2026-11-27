export interface Point2D {
  x: number;
  y: number;
}

/**
 * Formats an angle in degrees [0, 360) as a Cambridge 0580 three-figure bearing, e.g. "072°".
 */
export function formatThreeFigureBearing(deg: number): string {
  const normalized = ((Math.round(deg) % 360) + 360) % 360;
  return `${String(normalized).padStart(3, '0')}°`;
}

/**
 * Computes the back bearing (bearing of A from B given bearing of B from A).
 * Adds 180° when < 180°, subtracts 180° when >= 180°.
 */
export function computeBackBearing(forwardBearingDeg: number): number {
  const norm = ((forwardBearingDeg % 360) + 360) % 360;
  return norm < 180 ? norm + 180 : norm - 180;
}

/**
 * Converts a compass bearing (0° = North / straight up, clockwise positive)
 * into SVG screen coordinates relative to an origin.
 */
export function bearingPoint(origin: Point2D, bearingDeg: number, distance: number): Point2D {
  const rad = (bearingDeg * Math.PI) / 180;
  return {
    x: Number((origin.x + distance * Math.sin(rad)).toFixed(2)),
    y: Number((origin.y - distance * Math.cos(rad)).toFixed(2)),
  };
}

/**
 * Builds an SVG arc path measured clockwise starting from straight North (0°).
 * Handles 0°..360° smoothly including reflex angles (> 180° uses large-arc-flag = 1).
 */
export function describeClockwiseBearingArc(
  cx: number,
  cy: number,
  radius: number,
  bearingDeg: number
): string {
  const norm = ((bearingDeg % 360) + 360) % 360;
  if (norm <= 0.1) return '';
  if (norm >= 359.5) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${(cx - 0.5).toFixed(2)} ${cy - radius}`;
  }
  const end = bearingPoint({ x: cx, y: cy }, norm, radius);
  const largeArc = norm > 180 ? 1 : 0;
  return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Builds an SVG arc path between two compass bearings (clockwise from startBearing to endBearing).
 */
export function describeSectorArc(
  cx: number,
  cy: number,
  radius: number,
  startBearingDeg: number,
  endBearingDeg: number
): string {
  const start = bearingPoint({ x: cx, y: cy }, startBearingDeg, radius);
  const end = bearingPoint({ x: cx, y: cy }, endBearingDeg, radius);
  const sweepDeg = ((endBearingDeg - startBearingDeg) % 360 + 360) % 360;
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Computes two points A and B inside a bounded SVG box [width x height]
 * such that the line AB is nicely centred regardless of bearing angle (0°..359°).
 */
export function layoutBearingPair(
  bearingDeg: number,
  centerX: number,
  centerY: number,
  segmentLength: number
): { A: Point2D; B: Point2D; backBearing: number; coInteriorAngle: number } {
  const rad = (bearingDeg * Math.PI) / 180;
  const half = segmentLength / 2;
  const dx = half * Math.sin(rad);
  const dy = -half * Math.cos(rad);
  const A: Point2D = {
    x: Number((centerX - dx).toFixed(2)),
    y: Number((centerY - dy).toFixed(2)),
  };
  const B: Point2D = {
    x: Number((centerX + dx).toFixed(2)),
    y: Number((centerY + dy).toFixed(2)),
  };
  const norm = ((bearingDeg % 360) + 360) % 360;
  const backBearing = computeBackBearing(norm);
  // Smaller co-interior angle formed with North ray at B
  const coInteriorAngle = norm <= 180 ? 180 - norm : norm - 180;
  return { A, B, backBearing, coInteriorAngle };
}

/**
 * Computes the apex C of an SSS triangle with base AB horizontal:
 * A = (ax, ay), B = (ax + basePx, ay), and side lengths scaled consistently.
 */
export function computeSssApex(
  ax: number,
  ay: number,
  abLen: number,
  acLen: number,
  bcLen: number,
  pxPerUnit: number
): Point2D {
  // Law of cosines at A: cos(A) = (AB^2 + AC^2 - BC^2) / (2 * AB * AC)
  const cosA = (abLen * abLen + acLen * acLen - bcLen * bcLen) / (2 * abLen * acLen);
  const clamped = Math.max(-1, Math.min(1, cosA));
  const sinA = Math.sqrt(1 - clamped * clamped);
  return {
    x: Number((ax + acLen * clamped * pxPerUnit).toFixed(2)),
    y: Number((ay - acLen * sinA * pxPerUnit).toFixed(2)),
  };
}

/**
 * Regular n-gon vertices centred at (cx, cy) with top vertex straight up.
 */
export function regularPolygonVertices(
  cx: number,
  cy: number,
  radius: number,
  sides: number
): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / sides;
    pts.push({
      x: Number((cx + radius * Math.cos(angle)).toFixed(2)),
      y: Number((cy + radius * Math.sin(angle)).toFixed(2)),
    });
  }
  return pts;
}

/**
 * Point on a circle centred at (cx, cy) using standard SVG compass degrees (0° = top, clockwise).
 */
export function circlePoint(cx: number, cy: number, radius: number, compassDeg: number): Point2D {
  return bearingPoint({ x: cx, y: cy }, compassDeg, radius);
}

export interface HistogramBin {
  label: string;
  start: number;
  end: number;
  frequency: number;
  width: number;
  frequencyDensity: number;
}

/**
 * Computes class widths and exact frequency densities (frequency / class width) for unequal-width histograms.
 */
export function computeHistogramBins(
  rawBins: Array<{ start: number; end: number; frequency: number }>
): HistogramBin[] {
  return rawBins.map((b) => {
    const width = b.end - b.start;
    const frequencyDensity = width > 0 ? Number((b.frequency / width).toFixed(2)) : 0;
    return {
      label: `${b.start}–${b.end}`,
      start: b.start,
      end: b.end,
      frequency: b.frequency,
      width,
      frequencyDensity,
    };
  });
}

/**
 * Linear interpolation on a piecewise cumulative frequency curve to verify quartile readings.
 */
export function interpolateCumulativeX(
  points: Array<{ x: number; cf: number }>,
  targetCf: number
): number {
  if (points.length === 0) return 0;
  if (targetCf <= points[0].cf) return points[0].x;
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (targetCf <= p1.cf) {
      const span = p1.cf - p0.cf;
      if (span <= 0) return p1.x;
      const t = (targetCf - p0.cf) / span;
      return Number((p0.x + t * (p1.x - p0.x)).toFixed(2));
    }
  }
  return points[points.length - 1].x;
}

export interface StemAndLeafRow {
  stem: number;
  leaves: number[];
}

export interface StemAndLeafStats {
  values: number[];
  count: number;
  min: number;
  max: number;
  range: number;
  mode: number | null;
  median: number;
  mean: number;
}

/**
 * Reconstructs ordered numeric values from a stem-and-leaf diagram and computes
 * count, min, max, range, mode, median, and mean.
 */
export function computeStemAndLeafStats(
  rows: StemAndLeafRow[],
  stemMultiplier = 10,
  leafMultiplier = 1
): StemAndLeafStats {
  const values = rows
    .flatMap((row) =>
      row.leaves.map((leaf) =>
        Number((row.stem * stemMultiplier + leaf * leafMultiplier).toFixed(6))
      )
    )
    .sort((a, b) => a - b);

  const count = values.length;
  if (count === 0) {
    return { values: [], count: 0, min: 0, max: 0, range: 0, mode: null, median: 0, mean: 0 };
  }

  const min = values[0];
  const max = values[count - 1];
  const range = Number((max - min).toFixed(6));

  const freqMap = new Map<number, number>();
  let sum = 0;
  for (const v of values) {
    sum += v;
    freqMap.set(v, (freqMap.get(v) || 0) + 1);
  }

  let mode: number | null = null;
  let bestFreq = 1;
  for (const [val, freq] of freqMap.entries()) {
    if (freq > bestFreq) {
      bestFreq = freq;
      mode = val;
    }
  }

  const median =
    count % 2 === 1
      ? values[(count - 1) / 2]
      : Number(((values[count / 2 - 1] + values[count / 2]) / 2).toFixed(6));
  const mean = Number((sum / count).toFixed(6));

  return { values, count, min, max, range, mode, median, mean };
}

export interface GroupedChartStats {
  totalFrequency: number;
  estimatedMean: number;
  estimatedMedian: number;
  modalFrequencyLabel: string;
  modalDensityLabel: string;
}

/**
 * Computes estimated mean (via midpoints), 50%-area median, highest-frequency class,
 * and highest-density class (tallest bar) from grouped/histogram bins.
 */
export function computeGroupedChartStats(
  rawBins: Array<{ start: number; end: number; frequency: number }>
): GroupedChartStats {
  const bins = computeHistogramBins(rawBins);
  const totalFrequency = bins.reduce((acc, b) => acc + b.frequency, 0);
  if (totalFrequency <= 0) {
    return {
      totalFrequency: 0,
      estimatedMean: 0,
      estimatedMedian: 0,
      modalFrequencyLabel: '',
      modalDensityLabel: '',
    };
  }

  let fxSum = 0;
  let maxFreqBin = bins[0];
  let maxFdBin = bins[0];
  for (const b of bins) {
    const mid = (b.start + b.end) / 2;
    fxSum += b.frequency * mid;
    if (b.frequency > maxFreqBin.frequency) maxFreqBin = b;
    if (b.frequencyDensity > maxFdBin.frequencyDensity) maxFdBin = b;
  }

  const half = totalFrequency / 2;
  let running = 0;
  let estimatedMedian = bins[bins.length - 1].end;
  for (const b of bins) {
    if (running + b.frequency >= half) {
      const needed = half - running;
      const frac = b.frequency > 0 ? needed / b.frequency : 0;
      estimatedMedian = Number((b.start + frac * b.width).toFixed(4));
      break;
    }
    running += b.frequency;
  }

  return {
    totalFrequency,
    estimatedMean: Number((fxSum / totalFrequency).toFixed(4)),
    estimatedMedian,
    modalFrequencyLabel: maxFreqBin.label,
    modalDensityLabel: maxFdBin.label,
  };
}
