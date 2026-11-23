import type {
  AngleUnit,
  GraphCircle,
  GraphPoint,
  GraphPolygon,
  GraphSegment,
  GraphViewport,
  ParamMap,
} from '../utils/graphMath';

export interface GraphExpressionPreset {
  id: string;
  input: string;
  color: string;
  visible?: boolean;
}

export interface GraphSliderConfig {
  name: string;
  min: number;
  max: number;
  step: number;
}

export interface GraphPreset {
  id: string;
  title: string;
  subtitle: string;
  angleUnit: AngleUnit;
  viewport: GraphViewport;
  expressions: GraphExpressionPreset[];
  params: ParamMap;
  sliderConfigs?: Record<string, GraphSliderConfig>;
  points?: GraphPoint[];
  segments?: GraphSegment[];
  polygons?: GraphPolygon[];
  circles?: GraphCircle[];
  tangentEnabled?: boolean;
  tangentX?: number;
  snapToGrid?: boolean;
  showKeyPoints?: boolean;
}

export const GRAPH_PALETTE = [
  '#1d4ed8', // Cobalt blue
  '#dc2626', // Crimson
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Violet
  '#0891b2', // Cyan
];

export const GRAPH_PRESETS: Record<string, GraphPreset> = {
  general: {
    id: 'general',
    title: 'Interactive Graphing & Geometry Workbench',
    subtitle: 'Plot equations, inequalities, tangent lines, points, segments, vectors, and circles.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 0, pxPerUnitX: 38, pxPerUnitY: 38 },
    expressions: [
      { id: 'exp-1', input: 'y = x^2 - 4', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = 2x - 1', color: GRAPH_PALETTE[1], visible: true },
    ],
    params: {},
    points: [],
    segments: [],
    polygons: [],
    circles: [],
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.5': {
    id: '2.5',
    title: 'GeoGebra Explorer · Simultaneous Curves & Roots',
    subtitle: 'Observe intersections between y = x^2 - 4x + 3 and y = x - 1, or test your own equations.',
    angleUnit: 'rad',
    viewport: { centerX: 2, centerY: 1, pxPerUnitX: 44, pxPerUnitY: 44 },
    expressions: [
      { id: 'exp-1', input: 'y = x^2 - 4x + 3', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = x - 1', color: GRAPH_PALETTE[1], visible: true },
    ],
    params: {},
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.6': {
    id: '2.6',
    title: 'GeoGebra Explorer · Linear Inequalities & Regions',
    subtitle: 'Solid lines represent <= or >=; dashed lines represent strict < or > boundaries.',
    angleUnit: 'rad',
    viewport: { centerX: 1, centerY: 2, pxPerUnitX: 40, pxPerUnitY: 40 },
    expressions: [
      { id: 'exp-1', input: 'y <= 2x + 3', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y >= -x + 1', color: GRAPH_PALETTE[2], visible: true },
      { id: 'exp-3', input: 'x < 3', color: GRAPH_PALETTE[1], visible: true },
    ],
    params: {},
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.8': {
    id: '2.8',
    title: 'GeoGebra Explorer · Direct & Inverse Proportion',
    subtitle: 'Adjust the constant of proportionality k to compare direct (y = kx) and inverse (y = k/x) graphs.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 0, pxPerUnitX: 38, pxPerUnitY: 38 },
    expressions: [
      { id: 'exp-1', input: 'y = kx', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = k / x', color: GRAPH_PALETTE[1], visible: true },
    ],
    params: { k: 4 },
    sliderConfigs: {
      k: { name: 'k', min: -8, max: 8, step: 0.5 },
    },
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.9': {
    id: '2.9',
    title: 'GeoGebra Explorer · Speed–Time Kinematics Graph',
    subtitle: 'Inspect acceleration (gradient) and distance travelled (area under speed–time polygon).',
    angleUnit: 'rad',
    viewport: { centerX: 7, centerY: 10, pxPerUnitX: 30, pxPerUnitY: 15 },
    expressions: [],
    params: {},
    points: [
      { id: 'pt-1', label: 'O', x: 0, y: 0, color: GRAPH_PALETTE[0] },
      { id: 'pt-2', label: 'A', x: 4, y: 20, color: GRAPH_PALETTE[0] },
      { id: 'pt-3', label: 'B', x: 10, y: 20, color: GRAPH_PALETTE[0] },
      { id: 'pt-4', label: 'C', x: 14, y: 0, color: GRAPH_PALETTE[0] },
    ],
    segments: [
      {
        id: 'seg-1',
        label: 'Accel',
        from: { x: 0, y: 0, label: 'O' },
        to: { x: 4, y: 20, label: 'A' },
        color: GRAPH_PALETTE[0],
        kind: 'segment',
      },
      {
        id: 'seg-2',
        label: 'Cruise',
        from: { x: 4, y: 20, label: 'A' },
        to: { x: 10, y: 20, label: 'B' },
        color: GRAPH_PALETTE[2],
        kind: 'segment',
      },
      {
        id: 'seg-3',
        label: 'Brake',
        from: { x: 10, y: 20, label: 'B' },
        to: { x: 14, y: 0, label: 'C' },
        color: GRAPH_PALETTE[1],
        kind: 'segment',
      },
    ],
    polygons: [
      {
        id: 'poly-1',
        label: 'Distance Area',
        vertices: [
          { x: 0, y: 0, label: 'O' },
          { x: 4, y: 20, label: 'A' },
          { x: 10, y: 20, label: 'B' },
          { x: 14, y: 0, label: 'C' },
        ],
        color: GRAPH_PALETTE[0],
      },
    ],
    snapToGrid: true,
    showKeyPoints: false,
  },
  '2.10': {
    id: '2.10',
    title: 'GeoGebra Explorer · Graphs of Functions',
    subtitle: 'Vary coefficients a, b, c on the quadratic curve or compare with exponential growth y = 2^x.',
    angleUnit: 'rad',
    viewport: { centerX: 1, centerY: 1, pxPerUnitX: 38, pxPerUnitY: 38 },
    expressions: [
      { id: 'exp-1', input: 'y = ax^2 + bx + c', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = 2^x', color: GRAPH_PALETTE[2], visible: true },
    ],
    params: { a: 1, b: -4, c: 3 },
    sliderConfigs: {
      a: { name: 'a', min: -3, max: 3, step: 0.5 },
      b: { name: 'b', min: -6, max: 6, step: 0.5 },
      c: { name: 'c', min: -6, max: 6, step: 0.5 },
    },
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.11': {
    id: '2.11',
    title: 'GeoGebra Explorer · Sketching Curves, Roots & Turning Points',
    subtitle: 'Inspect x-intercepts, y-intercept, and local turning points of a cubic and quadratic.',
    angleUnit: 'rad',
    viewport: { centerX: 0.5, centerY: 0, pxPerUnitX: 44, pxPerUnitY: 28 },
    expressions: [
      { id: 'exp-1', input: 'y = x^3 - 2x^2 - 5x + 6', color: GRAPH_PALETTE[0], visible: true },
    ],
    params: {},
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.12': {
    id: '2.12',
    title: 'GeoGebra Explorer · Differentiation & Tangent Gradient',
    subtitle: 'Slide x0 to move the tangent line along the cubic curve and inspect dy/dx and turning points.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 1, pxPerUnitX: 48, pxPerUnitY: 38 },
    expressions: [
      { id: 'exp-1', input: 'y = x^3 - 3x + 1', color: GRAPH_PALETTE[0], visible: true },
    ],
    params: {},
    tangentEnabled: true,
    tangentX: 1.5,
    snapToGrid: true,
    showKeyPoints: true,
  },
  '2.13': {
    id: '2.13',
    title: 'GeoGebra Explorer · Functions & Inverse Symmetry',
    subtitle: 'Notice how f(x) = 2x + 2 and its inverse f^-1(x) = (x - 2)/2 reflect across y = x.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 0, pxPerUnitX: 40, pxPerUnitY: 40 },
    expressions: [
      { id: 'exp-1', input: 'y = 2x + 2', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = (x - 2) / 2', color: GRAPH_PALETTE[2], visible: true },
      { id: 'exp-3', input: 'y = x', color: GRAPH_PALETTE[3], visible: true },
    ],
    params: {},
    snapToGrid: true,
    showKeyPoints: true,
  },
  '3.1': {
    id: '3.1',
    title: 'GeoGebra Explorer · Cartesian Coordinates & Polygons',
    subtitle: 'Drag vertices A, B, C, D or add points to explore shapes, area, and perimeter on the grid.',
    angleUnit: 'rad',
    viewport: { centerX: 3.5, centerY: 2.5, pxPerUnitX: 46, pxPerUnitY: 46 },
    expressions: [],
    params: {},
    points: [
      { id: 'pt-1', label: 'A', x: 1, y: 1, color: GRAPH_PALETTE[0] },
      { id: 'pt-2', label: 'B', x: 5, y: 1, color: GRAPH_PALETTE[0] },
      { id: 'pt-3', label: 'C', x: 6, y: 4, color: GRAPH_PALETTE[0] },
      { id: 'pt-4', label: 'D', x: 2, y: 4, color: GRAPH_PALETTE[0] },
    ],
    polygons: [
      {
        id: 'poly-1',
        label: 'Parallelogram ABCD',
        vertices: [
          { x: 1, y: 1, label: 'A' },
          { x: 5, y: 1, label: 'B' },
          { x: 6, y: 4, label: 'C' },
          { x: 2, y: 4, label: 'D' },
        ],
        color: GRAPH_PALETTE[0],
      },
    ],
    snapToGrid: true,
    showKeyPoints: false,
  },
  '3.2': {
    id: '3.2',
    title: 'GeoGebra Explorer · Drawing Linear Graphs',
    subtitle: 'Plot equations in y = mx + c or implicit ax + by = c form and inspect their axis intercepts.',
    angleUnit: 'rad',
    viewport: { centerX: 2.5, centerY: 2, pxPerUnitX: 42, pxPerUnitY: 42 },
    expressions: [
      { id: 'exp-1', input: '2x + 3y = 12', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = x - 1', color: GRAPH_PALETTE[2], visible: true },
    ],
    params: {},
    snapToGrid: true,
    showKeyPoints: true,
  },
  '3.3': {
    id: '3.3',
    title: 'GeoGebra Explorer · Gradient of Linear Graphs',
    subtitle: 'Drag points A and B or use the m slider to inspect rise over run and gradient m.',
    angleUnit: 'rad',
    viewport: { centerX: 1, centerY: 2, pxPerUnitX: 44, pxPerUnitY: 44 },
    expressions: [
      { id: 'exp-1', input: 'y = mx + c', color: GRAPH_PALETTE[0], visible: true },
    ],
    params: { m: 1.5, c: 0.5 },
    sliderConfigs: {
      m: { name: 'm', min: -4, max: 4, step: 0.5 },
      c: { name: 'c', min: -5, max: 5, step: 0.5 },
    },
    points: [
      { id: 'pt-1', label: 'A', x: -1, y: -1, color: GRAPH_PALETTE[1] },
      { id: 'pt-2', label: 'B', x: 3, y: 5, color: GRAPH_PALETTE[1] },
    ],
    segments: [
      {
        id: 'seg-1',
        label: 'AB',
        from: { x: -1, y: -1, label: 'A' },
        to: { x: 3, y: 5, label: 'B' },
        color: GRAPH_PALETTE[1],
        kind: 'segment',
        dashed: true,
      },
    ],
    snapToGrid: true,
    showKeyPoints: true,
  },
  '3.4': {
    id: '3.4',
    title: 'GeoGebra Explorer · Length & Midpoint of a Segment',
    subtitle: 'Drag points A and B to see exact segment length AB, midpoint coordinates, and gradient update live.',
    angleUnit: 'rad',
    viewport: { centerX: 1, centerY: 2.5, pxPerUnitX: 46, pxPerUnitY: 46 },
    expressions: [],
    params: {},
    points: [
      { id: 'pt-1', label: 'A', x: -2, y: 1, color: GRAPH_PALETTE[0] },
      { id: 'pt-2', label: 'B', x: 4, y: 5, color: GRAPH_PALETTE[0] },
      { id: 'pt-3', label: 'M', x: 1, y: 3, color: GRAPH_PALETTE[2] },
    ],
    segments: [
      {
        id: 'seg-1',
        label: 'AB',
        from: { x: -2, y: 1, label: 'A' },
        to: { x: 4, y: 5, label: 'B' },
        color: GRAPH_PALETTE[0],
        kind: 'segment',
      },
    ],
    snapToGrid: true,
    showKeyPoints: false,
  },
  '3.5': {
    id: '3.5',
    title: 'GeoGebra Explorer · Equations of Linear Graphs (y = mx + c)',
    subtitle: 'Adjust gradient m and y-intercept c to match any line through two points.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 0, pxPerUnitX: 42, pxPerUnitY: 42 },
    expressions: [
      { id: 'exp-1', input: 'y = mx + c', color: GRAPH_PALETTE[0], visible: true },
    ],
    params: { m: 2, c: -1 },
    sliderConfigs: {
      m: { name: 'm', min: -4, max: 4, step: 0.5 },
      c: { name: 'c', min: -6, max: 6, step: 0.5 },
    },
    points: [
      { id: 'pt-1', label: 'P', x: 0, y: -1, color: GRAPH_PALETTE[2] },
      { id: 'pt-2', label: 'Q', x: 2, y: 3, color: GRAPH_PALETTE[2] },
    ],
    snapToGrid: true,
    showKeyPoints: true,
  },
  '3.6': {
    id: '3.6',
    title: 'GeoGebra Explorer · Parallel Lines (Equal Gradients)',
    subtitle: 'Both lines share gradient m. Adjust c and d to translate vertically without intersecting.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 0, pxPerUnitX: 42, pxPerUnitY: 42 },
    expressions: [
      { id: 'exp-1', input: 'y = mx + c', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = mx + d', color: GRAPH_PALETTE[2], visible: true },
    ],
    params: { m: 1.5, c: 2, d: -2 },
    sliderConfigs: {
      m: { name: 'm', min: -4, max: 4, step: 0.5 },
      c: { name: 'c', min: -5, max: 5, step: 0.5 },
      d: { name: 'd', min: -5, max: 5, step: 0.5 },
    },
    snapToGrid: true,
    showKeyPoints: true,
  },
  '3.7': {
    id: '3.7',
    title: 'GeoGebra Explorer · Perpendicular Lines (m1 * m2 = -1)',
    subtitle: 'Change gradient m and watch the perpendicular line (-1/m) rotate to stay at 90 degrees.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 1, pxPerUnitX: 42, pxPerUnitY: 42 },
    expressions: [
      { id: 'exp-1', input: 'y = mx + c', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = (-1 / m)x + d', color: GRAPH_PALETTE[2], visible: true },
    ],
    params: { m: 2, c: 1, d: 3 },
    sliderConfigs: {
      m: { name: 'm', min: -4, max: 4, step: 0.5 },
      c: { name: 'c', min: -5, max: 5, step: 0.5 },
      d: { name: 'd', min: -5, max: 5, step: 0.5 },
    },
    snapToGrid: true,
    showKeyPoints: true,
  },
  '6.4': {
    id: '6.4',
    title: 'GeoGebra Explorer · Trigonometric Graphs in Degrees [0°, 360°]',
    subtitle: 'Slide horizontal line y = k to solve cos(x) = k or sin(x) = k across all quadrants.',
    angleUnit: 'deg',
    viewport: { centerX: 180, centerY: 0, pxPerUnitX: 1.45, pxPerUnitY: 105 },
    expressions: [
      { id: 'exp-1', input: 'y = cos(x)', color: GRAPH_PALETTE[0], visible: true },
      { id: 'exp-2', input: 'y = k', color: GRAPH_PALETTE[1], visible: true },
      { id: 'exp-3', input: 'y = sin(x)', color: GRAPH_PALETTE[2], visible: false },
    ],
    params: { k: -0.5 },
    sliderConfigs: {
      k: { name: 'k', min: -1, max: 1, step: 0.1 },
    },
    snapToGrid: false,
    showKeyPoints: true,
  },
  '7.1': {
    id: '7.1',
    title: 'GeoGebra Explorer · Geometric Transformations on Coordinate Grid',
    subtitle: 'Compare an object triangle with its reflection across x = 0, or test mirror lines like y = x.',
    angleUnit: 'rad',
    viewport: { centerX: 0, centerY: 2, pxPerUnitX: 44, pxPerUnitY: 44 },
    expressions: [
      { id: 'exp-1', input: 'x = 0', color: GRAPH_PALETTE[3], visible: true },
    ],
    params: {},
    polygons: [
      {
        id: 'poly-1',
        label: 'Object ABC',
        vertices: [
          { x: 1, y: 1, label: 'A' },
          { x: 4, y: 1, label: 'B' },
          { x: 1, y: 4, label: 'C' },
        ],
        color: GRAPH_PALETTE[0],
      },
      {
        id: 'poly-2',
        label: "Image A'B'C'",
        vertices: [
          { x: -1, y: 1, label: "A'" },
          { x: -4, y: 1, label: "B'" },
          { x: -1, y: 4, label: "C'" },
        ],
        color: GRAPH_PALETTE[2],
        dashed: true,
      },
    ],
    snapToGrid: true,
    showKeyPoints: false,
  },
  '7.2': {
    id: '7.2',
    title: 'GeoGebra Explorer · 2D Vectors & Vector Addition',
    subtitle: 'Visualise column vectors a, b, and resultant a + b from tip to tail, or draw new vectors.',
    angleUnit: 'rad',
    viewport: { centerX: 2.5, centerY: 3, pxPerUnitX: 44, pxPerUnitY: 44 },
    expressions: [],
    params: {},
    points: [
      { id: 'pt-1', label: 'O', x: 0, y: 0, color: '#334155' },
      { id: 'pt-2', label: 'A', x: 3, y: 1, color: GRAPH_PALETTE[0] },
      { id: 'pt-3', label: 'B', x: 4, y: 5, color: GRAPH_PALETTE[2] },
    ],
    segments: [
      {
        id: 'vec-1',
        label: 'a = (3, 1)',
        from: { x: 0, y: 0, label: 'O' },
        to: { x: 3, y: 1, label: 'A' },
        color: GRAPH_PALETTE[0],
        kind: 'vector',
      },
      {
        id: 'vec-2',
        label: 'b = (1, 4)',
        from: { x: 3, y: 1, label: 'A' },
        to: { x: 4, y: 5, label: 'B' },
        color: GRAPH_PALETTE[2],
        kind: 'vector',
      },
      {
        id: 'vec-3',
        label: 'a + b = (4, 5)',
        from: { x: 0, y: 0, label: 'O' },
        to: { x: 4, y: 5, label: 'B' },
        color: GRAPH_PALETTE[1],
        kind: 'vector',
        dashed: true,
      },
    ],
    snapToGrid: true,
    showKeyPoints: false,
  },
  '7.3': {
    id: '7.3',
    title: 'GeoGebra Explorer · Magnitude of a Vector',
    subtitle: 'Inspect displacement components (dx, dy) and vector magnitude |v| = sqrt(dx^2 + dy^2).',
    angleUnit: 'rad',
    viewport: { centerX: 2, centerY: 2, pxPerUnitX: 46, pxPerUnitY: 46 },
    expressions: [],
    params: {},
    points: [
      { id: 'pt-1', label: 'O', x: 0, y: 0, color: '#334155' },
      { id: 'pt-2', label: 'V', x: 3, y: 4, color: GRAPH_PALETTE[0] },
    ],
    segments: [
      {
        id: 'vec-1',
        label: 'v = (3, 4)',
        from: { x: 0, y: 0, label: 'O' },
        to: { x: 3, y: 4, label: 'V' },
        color: GRAPH_PALETTE[0],
        kind: 'vector',
      },
    ],
    snapToGrid: true,
    showKeyPoints: false,
  },
};

export const CALCULATOR_PRESET_OPTIONS: { id: string; label: string }[] = [
  { id: 'general', label: 'Parabola & Line' },
  { id: '2.10', label: 'Quadratic + 2^x' },
  { id: '2.11', label: 'Cubic Roots & Extrema' },
  { id: '2.12', label: 'Tangent & dy/dx' },
  { id: '2.6', label: 'Linear Inequalities' },
  { id: '6.4', label: 'Trig Graphs (Deg)' },
  { id: '3.7', label: 'Perpendicular Lines' },
  { id: '7.2', label: '2D Vectors' },
];

export function getGraphPresetForTopic(topicId?: string): GraphPreset {
  if (topicId && GRAPH_PRESETS[topicId]) {
    return GRAPH_PRESETS[topicId];
  }
  return GRAPH_PRESETS.general;
}
