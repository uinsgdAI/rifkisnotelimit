import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatThreeFigureBearing,
  computeBackBearing,
  bearingPoint,
  describeClockwiseBearingArc,
  layoutBearingPair,
  computeSssApex,
  regularPolygonVertices,
  computeHistogramBins,
  interpolateCumulativeX,
} from './topicDiagrams.ts';

test('formatThreeFigureBearing pads single and double digits with leading zeros', () => {
  assert.equal(formatThreeFigureBearing(0), '000°');
  assert.equal(formatThreeFigureBearing(7), '007°');
  assert.equal(formatThreeFigureBearing(45), '045°');
  assert.equal(formatThreeFigureBearing(72), '072°');
  assert.equal(formatThreeFigureBearing(252), '252°');
  assert.equal(formatThreeFigureBearing(360), '000°');
});

test('computeBackBearing correctly adds or subtracts 180° across all quadrants', () => {
  assert.equal(computeBackBearing(0), 180);
  assert.equal(computeBackBearing(72), 252);
  assert.equal(computeBackBearing(135), 315);
  assert.equal(computeBackBearing(180), 0);
  assert.equal(computeBackBearing(252), 72);
  assert.equal(computeBackBearing(310), 130);
});

test('bearingPoint maps 000° North, 090° East, 180° South, 270° West accurately', () => {
  const origin = { x: 100, y: 100 };
  const north = bearingPoint(origin, 0, 50);
  const east = bearingPoint(origin, 90, 50);
  const south = bearingPoint(origin, 180, 50);
  const west = bearingPoint(origin, 270, 50);

  assert.deepEqual(north, { x: 100, y: 50 });
  assert.deepEqual(east, { x: 150, y: 100 });
  assert.deepEqual(south, { x: 100, y: 150 });
  assert.deepEqual(west, { x: 50, y: 100 });
});

test('describeClockwiseBearingArc sets SVG large-arc-flag correctly for <=180° vs >180°', () => {
  const acute = describeClockwiseBearingArc(100, 100, 30, 72);
  assert.match(acute, /A 30 30 0 0 1 /);
  const reflex = describeClockwiseBearingArc(100, 100, 30, 252);
  assert.match(reflex, /A 30 30 0 1 1 /);
});

test('layoutBearingPair places A and B symmetrically and computes co-interior angle', () => {
  const pair72 = layoutBearingPair(72, 180, 120, 100);
  assert.equal(pair72.backBearing, 252);
  assert.equal(pair72.coInteriorAngle, 108);
  const dist = Math.hypot(pair72.B.x - pair72.A.x, pair72.B.y - pair72.A.y);
  assert.ok(Math.abs(dist - 100) < 0.05);
});

test('computeSssApex locates vertex C at exact distances AC=5 and BC=4 from base AB=6', () => {
  const pxPerCm = 32;
  const ax = 60;
  const ay = 180;
  const bx = ax + 6 * pxPerCm;
  const by = ay;
  const c = computeSssApex(ax, ay, 6, 5, 4, pxPerCm);

  const distAC = Math.hypot(c.x - ax, c.y - ay) / pxPerCm;
  const distBC = Math.hypot(c.x - bx, c.y - by) / pxPerCm;
  assert.ok(Math.abs(distAC - 5) < 0.01);
  assert.ok(Math.abs(distBC - 4) < 0.01);
});

test('regularPolygonVertices returns exact vertex count and radius', () => {
  const hex = regularPolygonVertices(100, 100, 50, 6);
  assert.equal(hex.length, 6);
  assert.deepEqual(hex[0], { x: 100, y: 50 });
  for (const v of hex) {
    assert.ok(Math.abs(Math.hypot(v.x - 100, v.y - 100) - 50) < 0.1);
  }
});

test('computeHistogramBins computes frequency density such that area equals frequency', () => {
  const bins = computeHistogramBins([
    { start: 0, end: 10, frequency: 12 },
    { start: 10, end: 15, frequency: 15 },
    { start: 15, end: 35, frequency: 48 },
    { start: 35, end: 55, frequency: 24 },
  ]);
  assert.equal(bins[0].frequencyDensity, 1.2);
  assert.equal(bins[1].frequencyDensity, 3.0);
  assert.equal(bins[2].frequencyDensity, 2.4);
  assert.equal(bins[3].frequencyDensity, 1.2);
  for (const b of bins) {
    assert.ok(Math.abs(b.width * b.frequencyDensity - b.frequency) < 0.01);
  }
});

test('interpolateCumulativeX finds Q1, median, and Q3 on cumulative curve', () => {
  const pts = [
    { x: 0, cf: 0 },
    { x: 20, cf: 10 },
    { x: 40, cf: 26 },
    { x: 60, cf: 58 },
    { x: 80, cf: 74 },
    { x: 100, cf: 80 },
  ];
  assert.equal(interpolateCumulativeX(pts, 20), 32.5);
  assert.equal(interpolateCumulativeX(pts, 40), 48.75);
  assert.equal(interpolateCumulativeX(pts, 60), 62.5);
});
