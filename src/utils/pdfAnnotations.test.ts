import assert from 'node:assert/strict';
import test from 'node:test';
import {
  capturePdfZoomAnchor,
  computeAnchoredScrollPosition,
  computePinchZoomScale,
  computeScrollThumbMetrics,
  computeScrollTopFromTrackY,
  computeTwoFingerPanAndZoom,
  evaluateTwoFingerPinchEngagement,
  resolveDefaultAnnotatorToolAndWidth,
  snapClientPointToRulerEdge,
} from './pdfAnnotations';

test('capturePdfZoomAnchor selects visible page and preserves normalized focal offset', () => {
  const containerRect = { left: 20, top: 100, width: 700, height: 600 };
  const pages = [
    { pageNumber: 1, left: 70, top: -1600, width: 600, height: 840 },
    { pageNumber: 2, left: 70, top: -740, width: 600, height: 840 },
    { pageNumber: 3, left: 70, top: 120, width: 600, height: 840 },
    { pageNumber: 4, left: 70, top: 980, width: 600, height: 840 },
  ];

  const anchor = capturePdfZoomAnchor({
    pages,
    containerRect,
    anchorClientX: 370,
    anchorClientY: 370, // container top 100 + 270 -> inside Page 3 at relY = (370-120)/840
  });

  assert.ok(anchor);
  assert.equal(anchor.pageNumber, 3);
  assert.ok(Math.abs(anchor.relX - 0.5) < 1e-6);
  assert.ok(Math.abs(anchor.relY - 250 / 840) < 1e-6);
  assert.equal(anchor.anchorViewportX, 350);
  assert.equal(anchor.anchorViewportY, 270);
});

test('computeAnchoredScrollPosition locks page focal line in place after zooming in or out', () => {
  const anchor = {
    pageNumber: 3,
    relX: 0.5,
    relY: 0.5,
    anchorViewportX: 350,
    anchorViewportY: 270,
  };

  // Suppose zoom increased from 1.0 to 1.5 while scrollTop stayed at 1720.
  // Pages 1 & 2 pushed Page 3 down by +860px; Page 3 grew from 840px -> 1260px.
  const next = computeAnchoredScrollPosition({
    anchor,
    newPageRect: { left: 20, top: 1180, width: 900, height: 1260 },
    newContainerRect: { left: 20, top: 100, width: 700, height: 600 },
    currentScrollLeft: 0,
    currentScrollTop: 1720,
    scrollWidth: 960,
    scrollHeight: 5300,
    clientWidth: 700,
    clientHeight: 600,
  });

  // Anchored point is currently at 1180 + 0.5 * 1260 = 1810, should be at 100 + 270 = 370 -> delta = +1440
  assert.equal(next.scrollTop, 1720 + 1440);
  // Horizontal center: 20 + 0.5 * 900 = 470, desired = 20 + 350 = 370 -> delta = +100
  assert.equal(next.scrollLeft, 100);
});

test('computeTwoFingerPanAndZoom supports 2D pan/scroll when not pinching and midpoint-pinned pinch zoom when engaged', () => {
  const panResult = computeTwoFingerPanAndZoom({
    startMidX: 300,
    startMidY: 400,
    curMidX: 240, // dragged 60px left -> scrollRight +60
    curMidY: 250, // dragged 150px up -> scrollDown +150
    startScrollLeft: 40,
    startScrollTop: 500,
    maxScrollLeft: 400,
    maxScrollTop: 3000,
    pinchEngaged: false,
    pinchStartDist: 100,
    curDist: 102,
    pinchStartZoom: 1.2,
    pinchStartMidX: 300,
    pinchStartMidY: 400,
    pinchAnchorInnerX: 280,
    pinchAnchorInnerY: 850,
  });

  assert.equal(panResult.mode, 'pan');
  assert.equal(panResult.scrollLeft, 100);
  assert.equal(panResult.scrollTop, 650);
  assert.equal(panResult.previewScale, 1);

  const pinchResult = computeTwoFingerPanAndZoom({
    startMidX: 300,
    startMidY: 400,
    curMidX: 320,
    curMidY: 410,
    startScrollLeft: 100,
    startScrollTop: 650,
    maxScrollLeft: 400,
    maxScrollTop: 3000,
    pinchEngaged: true,
    pinchStartDist: 100,
    curDist: 150,
    pinchStartZoom: 1.0,
    pinchStartMidX: 300,
    pinchStartMidY: 400,
    pinchAnchorInnerX: 280,
    pinchAnchorInnerY: 850,
  });

  assert.equal(pinchResult.mode, 'pinch');
  assert.equal(pinchResult.targetZoom, 1.5);
  assert.equal(pinchResult.previewScale, 1.5);
  // tx = (320 - 300) + (1 - 1.5) * 280 = 20 - 140 = -120
  assert.ok(Math.abs(pinchResult.previewTx - -120) < 1e-6);
  // ty = (410 - 400) + (1 - 1.5) * 850 = 10 - 425 = -415
  assert.ok(Math.abs(pinchResult.previewTy - -415) < 1e-6);
});

test('pinch zoom clamping, scroll rail math, and ruler snap remain accurate', () => {
  assert.equal(
    computePinchZoomScale({ initialZoom: 1, startDistance: 100, currentDistance: 400 }),
    2.5
  );
  assert.equal(
    computePinchZoomScale({ initialZoom: 1, startDistance: 200, currentDistance: 50 }),
    0.65
  );

  const metrics = computeScrollThumbMetrics({
    scrollTop: 500,
    scrollHeight: 2000,
    clientHeight: 500,
    trackHeight: 400,
  });
  assert.equal(metrics.canScroll, true);
  assert.equal(metrics.thumbHeight, 100);
  assert.equal(metrics.thumbTop, 100);

  const topFromTrack = computeScrollTopFromTrackY({
    pointerY: 250,
    trackTop: 100,
    trackHeight: 400,
    thumbHeight: 100,
    scrollHeight: 2000,
    clientHeight: 500,
    grabOffsetRatio: 0.5,
  });
  assert.equal(topFromTrack, 500);

  const snapped = snapClientPointToRulerEdge(300, 185, {
    centerX: 300,
    centerY: 200,
    angleDeg: 0,
    lengthPx: 300,
    thicknessPx: 40,
  });
  assert.equal(snapped.snapped, true);
  assert.equal(snapped.edge, 'top');
});

test('evaluateTwoFingerPinchEngagement resists single-finger pan stagger while engaging deliberate pinches', () => {
  // Single finger moves ahead in a parallel pan -> exceededDeadband true, engage false
  const stagger = evaluateTwoFingerPinchEngagement({
    startDist: 80,
    curDist: 140,
    movedPointerCount: 1,
    pendingDurationMs: 4,
  });
  assert.equal(stagger.exceededDeadband, true);
  assert.equal(stagger.engage, false);

  // Partner finger catches up restoring distance -> exceededDeadband false, stays panning
  const caughtUp = evaluateTwoFingerPinchEngagement({
    startDist: 80,
    curDist: 82,
    movedPointerCount: 2,
    pendingDurationMs: 6,
  });
  assert.equal(caughtUp.exceededDeadband, false);
  assert.equal(caughtUp.engage, false);

  // Both fingers spread -> engages immediately with deadband-adjusted pinchStartDist
  const spread = evaluateTwoFingerPinchEngagement({
    startDist: 80,
    curDist: 170,
    movedPointerCount: 2,
    pendingDurationMs: 8,
  });
  assert.equal(spread.engage, true);
  assert.equal(spread.pinchStartDist, 102);

  // Stationary anchor thumb + single dragging finger sustained past staggerHoldMs -> engages
  const anchoredPinch = evaluateTwoFingerPinchEngagement({
    startDist: 200,
    curDist: 140,
    movedPointerCount: 1,
    pendingDurationMs: 80,
  });
  assert.equal(anchoredPinch.engage, true);
  assert.equal(anchoredPinch.pinchStartDist, 172);
});

test('resolveDefaultAnnotatorToolAndWidth defaults MS/answers to pan(scroll) and QP/questions to pen+fine', () => {
  assert.deepEqual(resolveDefaultAnnotatorToolAndWidth('qp'), {
    tool: 'pen',
    widthPreset: 'fine',
  });
  assert.deepEqual(resolveDefaultAnnotatorToolAndWidth('questions'), {
    tool: 'pen',
    widthPreset: 'fine',
  });
  assert.deepEqual(resolveDefaultAnnotatorToolAndWidth('ms'), {
    tool: 'pan',
    widthPreset: 'fine',
  });
  assert.deepEqual(resolveDefaultAnnotatorToolAndWidth('answers'), {
    tool: 'pan',
    widthPreset: 'fine',
  });
});

