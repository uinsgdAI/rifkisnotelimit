import assert from 'node:assert/strict';
import test from 'node:test';
import {
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

test('triggerSakugaBurst returns false cleanly in headless Node when no listeners exist', () => {
  const fired = triggerSakugaBurst(null, 'indigo', 'CLEAR!');
  assert.equal(fired, false);
});
