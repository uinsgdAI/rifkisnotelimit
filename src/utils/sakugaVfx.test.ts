import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeSliderRatio,
  computeSliderVelocityEffects,
  createSakugaBurstSpec,
  stepSakugaParticle,
  triggerSakugaBurst,
} from './sakugaVfx.ts';

test('createSakugaBurstSpec builds balanced anime impact particles and respects variant palettes', () => {
  const indigoBurst = createSakugaBurstSpec({
    originX: 420,
    originY: 260,
    variant: 'indigo',
    label: 'GO!',
    seed: 17,
    nowMs: 1000,
  });

  assert.equal(indigoBurst.originX, 420);
  assert.equal(indigoBurst.originY, 260);
  assert.equal(indigoBurst.label, 'GO!');
  assert.equal(indigoBurst.particles.length, 19);
  assert.equal(indigoBurst.particles.filter((p) => p.kind === 'ring').length, 1);
  assert.equal(indigoBurst.particles.filter((p) => p.kind === 'spark').length, 8);
  assert.equal(indigoBurst.particles.filter((p) => p.kind === 'line').length, 6);
  assert.equal(indigoBurst.particles.filter((p) => p.kind === 'puff').length, 4);

  const sakuraBurst = createSakugaBurstSpec({
    originX: 100,
    originY: 120,
    variant: 'sakura',
    seed: 17,
    nowMs: 1000,
  });
  assert.equal(sakuraBurst.particles[0].color, '#FF5FA8');

  const microBurst = createSakugaBurstSpec({
    originX: 50,
    originY: 50,
    intensity: 'micro',
    seed: 3,
  });
  assert.equal(microBurst.particles.filter((p) => p.kind === 'ring').length, 0);
  assert.equal(microBurst.particles.filter((p) => p.kind === 'spark').length, 4);
});

test('stepSakugaParticle advances coordinates and decays alpha smoothly to zero', () => {
  const burst = createSakugaBurstSpec({
    originX: 200,
    originY: 200,
    variant: 'emerald',
    seed: 5,
  });
  const spark = burst.particles.find((p) => p.kind === 'spark');
  assert.ok(spark);

  let cur = spark;
  for (let i = 0; i < 40; i++) {
    cur = stepSakugaParticle(cur, 0.016);
  }
  assert.ok(cur.ageMs > 600);
  assert.equal(cur.alpha, 0);
  assert.ok(cur.x !== 200 || cur.y !== 200);
});

test('computeSliderRatio and computeSliderVelocityEffects clamp cleanly and scale spring tilt', () => {
  assert.equal(computeSliderRatio(6, 2, 10), 0.5);
  assert.equal(computeSliderRatio(-5, 1, 12), 0);
  assert.equal(computeSliderRatio(99, 1, 12), 1);
  assert.equal(computeSliderRatio(5, 5, 5), 0);

  const rest = computeSliderVelocityEffects(0, 16);
  assert.deepEqual(rest, { tiltDeg: 0, squashX: 1, squashY: 1 });

  const fastRight = computeSliderVelocityEffects(40, 16);
  assert.ok(fastRight.tiltDeg > 5);
  assert.ok(fastRight.squashX > 1);
  assert.ok(fastRight.squashY < 1);

  const fastLeft = computeSliderVelocityEffects(-40, 16);
  assert.ok(fastLeft.tiltDeg < -5);
});

test('triggerSakugaBurst returns false cleanly in headless Node when no listeners exist', () => {
  const fired = triggerSakugaBurst(null, 'indigo', 'CLEAR!');
  assert.equal(fired, false);
});
