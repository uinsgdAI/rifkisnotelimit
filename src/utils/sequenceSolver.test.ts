import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fitCubicSequence,
  fitQuadraticSequence,
  formatNthTermPolynomial,
  solveCubicFromCoefficients,
  solveQuadraticFromCoefficients,
} from './sequenceSolver';

test('fitQuadraticSequence solves 2a, 3a+b, a+b+c fast method accurately including negative/fractional a', () => {
  // 2n^2 - 3n + 7 -> 6, 9, 16, 27, 42
  const q1 = fitQuadraticSequence([6, 9, 16, 27, 42]);
  assert.ok(q1 && q1.isValid);
  assert.equal(q1.a, 2);
  assert.equal(q1.b, -3);
  assert.equal(q1.c, 7);
  assert.equal(q1.zerothTerm, 7);
  assert.equal(q1.d2, 4);
  assert.equal(q1.d1First, 3);
  assert.equal(q1.u1, 6);
  assert.equal(q1.formulaText, '2n^2 - 3n + 7');

  // Fractional a = 0.5: 0.5n^2 + 0.5n (triangular numbers: 1, 3, 6, 10, 15)
  const tri = fitQuadraticSequence([1, 3, 6, 10, 15]);
  assert.ok(tri && tri.isValid);
  assert.equal(tri.a, 0.5);
  assert.equal(tri.b, 0.5);
  assert.equal(tri.c, 0);
  assert.equal(tri.zerothTerm, 0);

  // Reject non-quadratic sequence
  const nonQuad = fitQuadraticSequence([1, 8, 27, 64, 125]);
  assert.ok(nonQuad);
  assert.equal(nonQuad.isValid, false);
});

test('fitCubicSequence solves 6a, 12a+2b, 7a+3b+c, a+b+c+d fast method accurately', () => {
  // 2n^3 - 3n^2 + 4n - 1 -> n=1: 2, n=2: 11, n=3: 38, n=4: 95, n=5: 194
  const c1 = fitCubicSequence([2, 11, 38, 95, 194]);
  assert.ok(c1 && c1.isValid);
  assert.equal(c1.a, 2);
  assert.equal(c1.b, -3);
  assert.equal(c1.c, 4);
  assert.equal(c1.d, -1);
  assert.equal(c1.d3, 12);
  assert.equal(c1.d2First, 18); // 12(2) + 2(-3) = 18
  assert.equal(c1.d1First, 9); // 7(2) + 3(-3) + 4 = 9
  assert.equal(c1.u1, 2); // 2 - 3 + 4 - 1 = 2
  assert.equal(c1.zerothTerm, -1);
  assert.equal(c1.formulaText, '2n^3 - 3n^2 + 4n - 1');

  // Monic shifted cubic n^3 + 2n - 5 -> -2, 7, 28, 67, 130
  const c2 = fitCubicSequence([-2, 7, 28, 67, 130]);
  assert.ok(c2 && c2.isValid);
  assert.equal(c2.a, 1);
  assert.equal(c2.b, 0);
  assert.equal(c2.c, 2);
  assert.equal(c2.d, -5);
  assert.equal(c2.formulaText, 'n^3 + 2n - 5');
});

test('solveQuadraticFromCoefficients & solveCubicFromCoefficients round-trip cleanly with fit helpers', () => {
  const qGen = solveQuadraticFromCoefficients(-1, 5, 2, 6);
  const qFit = fitQuadraticSequence(qGen.table.terms);
  assert.ok(qFit && qFit.isValid);
  assert.deepEqual([qFit.a, qFit.b, qFit.c], [-1, 5, 2]);
  assert.equal(formatNthTermPolynomial({ a: -1, b: 5, c: 2 }, true), '-n^2 + 5n + 2');

  const cGen = solveCubicFromCoefficients(1, 2, -1, 3, 6);
  const cFit = fitCubicSequence(cGen.table.terms);
  assert.ok(cFit && cFit.isValid);
  assert.deepEqual([cFit.a, cFit.b, cFit.c, cFit.d], [1, 2, -1, 3]);
  assert.equal(cFit.zerothTerm, 3);
});
