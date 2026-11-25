import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acquireFullscreenBodyLock,
  capturePdfZoomAnchor,
  computeAnchoredScrollPosition,
  computeFitWidthZoom,
  computePinchZoomScale,
  computeScrollThumbMetrics,
  computeScrollTopFromTrackY,
  computeTwoFingerPanAndZoom,
  eraseStrokesAlongSegment,
  evaluateTwoFingerPinchEngagement,
  resolveAnnotatorContainerClasses,
  resolveDefaultAnnotatorToolAndWidth,
  shouldStartSinglePointerBackgroundPan,
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

test('computeFitWidthZoom fits A4 page cleanly to tablet portrait/landscape containers and clamps bounds', () => {
  // Tablet portrait ~710px container, A4 base width 595px, 48px padding -> 662 / 595 = 1.11
  assert.equal(
    computeFitWidthZoom({ containerWidth: 710, pageWidth: 595, horizontalPadding: 48 }),
    1.11
  );
  // Tablet landscape ~1200px container -> (1200 - 48) / 595 = 1.94
  assert.equal(
    computeFitWidthZoom({ containerWidth: 1200, pageWidth: 595, horizontalPadding: 48 }),
    1.94
  );
  // Clamps extremely narrow / wide containers safely
  assert.equal(computeFitWidthZoom({ containerWidth: 260, pageWidth: 595 }), 0.65);
  assert.equal(computeFitWidthZoom({ containerWidth: 2200, pageWidth: 595 }), 2.5);
  assert.equal(computeFitWidthZoom({ containerWidth: 0, pageWidth: 0 }), 1);
});

test('resolveAnnotatorContainerClasses switches cleanly between inline, parent split fullscreen, and annotator fullscreen', () => {
  const inlineLayout = resolveAnnotatorContainerClasses({
    isAnnotatorFullscreen: false,
    isParentFullscreen: false,
    defaultHeightClass: 'h-[620px]',
  });
  assert.equal(inlineLayout.isImmersive, false);
  assert.equal(inlineLayout.scrollContainerClass, 'h-[620px]');

  const splitFsLayout = resolveAnnotatorContainerClasses({
    isAnnotatorFullscreen: false,
    isParentFullscreen: true,
  });
  assert.equal(splitFsLayout.isImmersive, true);
  assert.equal(splitFsLayout.scrollContainerClass, 'flex-1 min-h-0');
  assert.ok(splitFsLayout.rootClass.includes('flex-1'));

  const soloFsLayout = resolveAnnotatorContainerClasses({
    isAnnotatorFullscreen: true,
    isParentFullscreen: true,
  });
  assert.equal(soloFsLayout.isImmersive, true);
  assert.ok(soloFsLayout.rootClass.includes('fixed inset-0'));
  assert.ok(soloFsLayout.rootClass.includes('z-[70]'));
  assert.ok(soloFsLayout.rootClass.includes('h-[100dvh]'));
  assert.equal(soloFsLayout.scrollContainerClass, 'flex-1 min-h-0');

  // Safe no-op in Node SSR environment
  const release = acquireFullscreenBodyLock();
  release();
  release();
});

test('eraseStrokesAlongSegment erases strokes crossed by fast slide gestures without requiring endpoint proximity', () => {
  const strokes = [
    {
      id: 'vertical-stroke',
      tool: 'pen' as const,
      color: '#1d4ed8',
      size: 2,
      points: [
        { x: 0.5, y: 0.2 },
        { x: 0.5, y: 0.8 },
      ],
    },
    {
      id: 'untouched-stroke',
      tool: 'pen' as const,
      color: '#0f172a',
      size: 2,
      points: [
        { x: 0.1, y: 0.1 },
        { x: 0.2, y: 0.15 },
      ],
    },
    {
      id: 'thick-highlighter',
      tool: 'highlighter' as const,
      color: '#facc15',
      size: 26,
      points: [
        { x: 0.3, y: 0.9 },
        { x: 0.7, y: 0.9 },
      ],
    },
  ];

  // Fast swipe jumps across x=0.5 from x=0.2 to x=0.8 (neither endpoint is within 0.024 of x=0.5)
  const fastSwipe = eraseStrokesAlongSegment(
    strokes,
    { x: 0.2, y: 0.45 },
    { x: 0.8, y: 0.55 },
    0.024
  );
  assert.equal(fastSwipe.removedAny, true);
  assert.deepEqual(
    fastSwipe.remaining.map((s) => s.id),
    ['untouched-stroke', 'thick-highlighter']
  );

  // Sliding along edge of bold highlighter also erases it cleanly
  const hlSwipe = eraseStrokesAlongSegment(
    fastSwipe.remaining,
    { x: 0.45, y: 0.865 },
    { x: 0.55, y: 0.865 },
    0.024
  );
  assert.equal(hlSwipe.removedAny, true);
  assert.deepEqual(
    hlSwipe.remaining.map((s) => s.id),
    ['untouched-stroke']
  );
});

test('shouldStartSinglePointerBackgroundPan allows 1-finger scroll outside paper while requiring 2 fingers inside paper during draw/erase', () => {
  // Outside paper (background / margin / inter-page gap): 1 finger scrolls even when Pen/Eraser is active
  for (const activeTool of ['pen', 'highlighter', 'eraser', 'pan'] as const) {
    assert.equal(
      shouldStartSinglePointerBackgroundPan({
        activeTool,
        hasDocument: true,
        isInteractiveControl: false,
        isInsidePaperPage: false,
        activeTouchCount: 1,
        isMultiTouchActive: false,
        pointerType: 'touch',
        button: 0,
      }),
      true
    );
  }

  // Inside paper: 1 finger draws/erases (does NOT pan) unless Scroll ('pan') tool is active
  for (const activeTool of ['pen', 'highlighter', 'eraser'] as const) {
    assert.equal(
      shouldStartSinglePointerBackgroundPan({
        activeTool,
        hasDocument: true,
        isInteractiveControl: false,
        isInsidePaperPage: true,
        activeTouchCount: 1,
        isMultiTouchActive: false,
        pointerType: 'touch',
        button: 0,
      }),
      false
    );
  }
  assert.equal(
    shouldStartSinglePointerBackgroundPan({
      activeTool: 'pan',
      hasDocument: true,
      isInteractiveControl: false,
      isInsidePaperPage: true,
      activeTouchCount: 1,
      isMultiTouchActive: false,
      pointerType: 'touch',
      button: 0,
    }),
    true
  );

  // When 2nd finger is down, single-pointer pan yields immediately to two-finger pan/pinch
  assert.equal(
    shouldStartSinglePointerBackgroundPan({
      activeTool: 'pen',
      hasDocument: true,
      isInteractiveControl: false,
      isInsidePaperPage: false,
      activeTouchCount: 2,
      isMultiTouchActive: true,
      pointerType: 'touch',
      button: 0,
    }),
    false
  );
});



