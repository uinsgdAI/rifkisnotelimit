import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeNiceTickStep,
  computePolygonMetrics,
  computeSegmentMetrics,
  findExtrema,
  findIntersections,
  findRoots,
  formatGraphNumber,
  numericDerivative,
  parsePlotInput,
  screenToWorld,
  worldToScreen,
} from './graphMath';

test('parsePlotInput parses explicit functions, implicit multiplication, and powers', () => {
  const quad = parsePlotInput('y = x^2 - 4');
  assert.equal(quad.ok, true);
  if (quad.ok) {
    assert.equal(quad.spec.kind, 'function');
    assert.equal(quad.spec.evaluate(0, {}, 'rad'), -4);
    assert.equal(quad.spec.evaluate(2, {}, 'rad'), 0);
    assert.equal(quad.spec.evaluate(-3, {}, 'rad'), 5);
  }

  // Unary minus lower precedence than ^ (so -x^2 at x=3 is -9)
  const negQuad = parsePlotInput('-x^2 + 1');
  assert.equal(negQuad.ok, true);
  if (negQuad.ok) {
    assert.equal(negQuad.spec.evaluate(3, {}, 'rad'), -8);
  }

  // Parameters and implicit multiplication like y = mx + c
  const line = parsePlotInput('y = mx + c');
  assert.equal(line.ok, true);
  if (line.ok) {
    assert.deepEqual(line.spec.referencedParams, ['c', 'm']);
    assert.equal(line.spec.evaluate(4, { m: 2, c: -3 }, 'rad'), 5);
  }
});

test('parsePlotInput supports trig in radians and degrees, implicit lines, inequalities, and vertical lines', () => {
  const trig = parsePlotInput('y = 2sin(x) + 1');
  assert.equal(trig.ok, true);
  if (trig.ok) {
    assert.ok(Math.abs(trig.spec.evaluate(30, {}, 'deg') - 2) < 1e-6);
    assert.ok(Math.abs(trig.spec.evaluate(Math.PI / 6, {}, 'rad') - 2) < 1e-6);
  }

  // Implicit general linear equation 2x + 3y = 12 => y = (12 - 2x)/3
  const implicitLine = parsePlotInput('2x + 3y = 12');
  assert.equal(implicitLine.ok, true);
  if (implicitLine.ok) {
    assert.equal(implicitLine.spec.kind, 'function');
    assert.ok(Math.abs(implicitLine.spec.evaluate(0, {}, 'rad') - 4) < 1e-6);
    assert.ok(Math.abs(implicitLine.spec.evaluate(6, {}, 'rad') - 0) < 1e-6);
  }

  // Linear inequality flipping sign when y has negative coefficient: 2x - y <= 4 => y >= 2x - 4
  const ineq = parsePlotInput('2x - y <= 4');
  assert.equal(ineq.ok, true);
  if (ineq.ok) {
    assert.equal(ineq.spec.isInequality, true);
    assert.equal(ineq.spec.op, '>=');
    assert.equal(ineq.spec.dashedBoundary, false);
    assert.ok(Math.abs(ineq.spec.evaluate(3, {}, 'rad') - 2) < 1e-6);
  }

  // Vertical line / inequality x < 3
  const vert = parsePlotInput('x < 3');
  assert.equal(vert.ok, true);
  if (vert.ok) {
    assert.equal(vert.spec.kind, 'vertical');
    assert.equal(vert.spec.dashedBoundary, true);
    assert.equal(vert.spec.evaluate(0, {}, 'rad'), 3);
  }
});

test('parsePlotInput rejects invalid syntax cleanly', () => {
  assert.equal(parsePlotInput('').ok, false);
  assert.equal(parsePlotInput('y = (x + 1').ok, false);
  assert.equal(parsePlotInput('x^2 + y^2 = 9').ok, false);
});

test('findRoots, findExtrema, findIntersections, and numericDerivative are accurate', () => {
  const quad = parsePlotInput('y = x^2 - 4x + 3');
  const line = parsePlotInput('y = x - 1');
  assert.equal(quad.ok && line.ok, true);
  if (!quad.ok || !line.ok) return;

  const roots = findRoots(quad.spec.evaluate, -5, 10, {}, 'rad');
  assert.equal(roots.length, 2);
  assert.ok(Math.abs(roots[0].x - 1) < 1e-4);
  assert.ok(Math.abs(roots[1].x - 3) < 1e-4);

  const extrema = findExtrema(quad.spec.evaluate, -5, 10, {}, 'rad');
  assert.equal(extrema.length, 1);
  assert.equal(extrema[0].kind, 'min');
  assert.ok(Math.abs(extrema[0].x - 2) < 1e-4);
  assert.ok(Math.abs(extrema[0].y - -1) < 1e-4);

  // Intersections of x^2 - 4x + 3 and x - 1 => x^2 - 5x + 4 = 0 => x=1, x=4
  const inters = findIntersections(
    quad.spec.evaluate,
    line.spec.evaluate,
    -5,
    10,
    {},
    'rad'
  );
  assert.equal(inters.length, 2);
  assert.ok(Math.abs(inters[0].x - 1) < 1e-4);
  assert.ok(Math.abs(inters[0].y - 0) < 1e-4);
  assert.ok(Math.abs(inters[1].x - 4) < 1e-4);
  assert.ok(Math.abs(inters[1].y - 3) < 1e-4);

  // Derivative of x^2 - 4x + 3 at x = 4 is 2(4) - 4 = 4
  const slope = numericDerivative(quad.spec.evaluate, 4, {}, 'rad');
  assert.ok(Math.abs(slope - 4) < 1e-4);

  // Asymptote check: 1/x must NOT produce a false root at x=0
  const recip = parsePlotInput('y = 1/x');
  assert.equal(recip.ok, true);
  if (recip.ok) {
    const recipRoots = findRoots(recip.spec.evaluate, -5, 5, {}, 'rad');
    assert.equal(recipRoots.length, 0);
  }
});

test('coordinate transforms and segment/polygon geometry helpers compute exact values', () => {
  const vp = { centerX: 0, centerY: 0, pxPerUnitX: 40, pxPerUnitY: 40 };
  const s = worldToScreen(2, 3, vp, 800, 600);
  assert.deepEqual(s, { sx: 480, sy: 180 });
  const w = screenToWorld(480, 180, vp, 800, 600);
  assert.deepEqual(w, { wx: 2, wy: 3 });

  assert.equal(computeNiceTickStep(40, 64, false), 2);
  assert.equal(computeNiceTickStep(1.5, 64, true), 45);
  assert.equal(formatGraphNumber(-0.0000000001), '0');

  const seg = computeSegmentMetrics({ x: 1, y: 2 }, { x: 4, y: 6 });
  assert.equal(seg.dx, 3);
  assert.equal(seg.dy, 4);
  assert.equal(seg.length, 5);
  assert.deepEqual(seg.midpoint, { x: 2.5, y: 4 });
  assert.ok(Math.abs((seg.gradient ?? 0) - 4 / 3) < 1e-9);

  // 3-4-5 right triangle area = 6, perimeter = 12
  const poly = computePolygonMetrics([
    { x: 0, y: 0 },
    { x: 3, y: 0 },
    { x: 0, y: 4 },
  ]);
  assert.equal(poly.area, 6);
  assert.equal(poly.perimeter, 12);
});

import { GRAPH_PRESETS } from '../data/graphPresets';
import { ALL_SUBTOPICS_0580 } from '../data/syllabus0580';

test('All topical GeoGebra presets compile cleanly and cover every graph-enabled syllabus topic', () => {
  for (const [id, preset] of Object.entries(GRAPH_PRESETS)) {
    for (const expr of preset.expressions) {
      const parsed = parsePlotInput(expr.input);
      assert.equal(parsed.ok, true, `Preset ${id} expression "${expr.input}" failed to parse`);
    }
  }

  const graphTopics = ALL_SUBTOPICS_0580.filter(
    (t) =>
      t.sandbox === 'geogebra-graph' ||
      t.sandbox === 'linear-graph' ||
      t.sandbox === 'quadratic-solver'
  );
  assert.ok(graphTopics.length >= 18, `Expected >=18 graph-enabled topics, got ${graphTopics.length}`);
  for (const t of graphTopics) {
    assert.ok(
      GRAPH_PRESETS[t.id],
      `Missing GeoGebra preset for graph-enabled syllabus topic ${t.id}`
    );
  }
});
