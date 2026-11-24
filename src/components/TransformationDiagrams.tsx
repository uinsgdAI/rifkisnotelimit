import React, { useState } from 'react';
import { MathText } from './MathText';

type TransformTab = 'translation' | 'reflection' | 'enlargement' | 'rotation';

interface GridConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
  pad: number;
}

function makeProjector(cfg: GridConfig) {
  const plotW = cfg.width - cfg.pad * 2;
  const plotH = cfg.height - cfg.pad * 2;
  const sx = plotW / (cfg.xMax - cfg.xMin);
  const sy = plotH / (cfg.yMax - cfg.yMin);
  const scale = Math.min(sx, sy);
  const usedW = (cfg.xMax - cfg.xMin) * scale;
  const usedH = (cfg.yMax - cfg.yMin) * scale;
  const offsetX = (cfg.width - usedW) / 2;
  const offsetY = (cfg.height - usedH) / 2;

  const pt = (x: number, y: number): [number, number] => [
    offsetX + (x - cfg.xMin) * scale,
    offsetY + (cfg.yMax - y) * scale,
  ];
  const poly = (pts: [number, number][]) => pts.map(([x, y]) => pt(x, y).join(',')).join(' ');
  return { pt, poly, scale };
}

const GridBackdrop: React.FC<{ cfg: GridConfig }> = ({ cfg }) => {
  const { pt } = makeProjector(cfg);
  const xs: number[] = [];
  for (let x = cfg.xMin; x <= cfg.xMax; x += 1) xs.push(x);
  const ys: number[] = [];
  for (let y = cfg.yMin; y <= cfg.yMax; y += 1) ys.push(y);

  const [x0yMinX, x0yMinY] = pt(0, cfg.yMin);
  const [x0yMaxX, x0yMaxY] = pt(0, cfg.yMax);
  const [y0xMinX, y0xMinY] = pt(cfg.xMin, 0);
  const [y0xMaxX, y0xMaxY] = pt(cfg.xMax, 0);

  return (
    <g>
      {xs.map((x) => {
        const [x1, y1] = pt(x, cfg.yMin);
        const [x2, y2] = pt(x, cfg.yMax);
        return (
          <line
            key={`vx-${x}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={x === 0 ? '#1D1A4A' : '#ECEAF8'}
            strokeWidth={x === 0 ? 1.5 : 1}
          />
        );
      })}
      {ys.map((y) => {
        const [x1, y1] = pt(cfg.xMin, y);
        const [x2, y2] = pt(cfg.xMax, y);
        return (
          <line
            key={`hy-${y}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={y === 0 ? '#1D1A4A' : '#ECEAF8'}
            strokeWidth={y === 0 ? 1.5 : 1}
          />
        );
      })}
      <text
        x={x0yMaxX + 5}
        y={x0yMaxY + 10}
        fontSize="10"
        fontWeight="700"
        fill="#1D1A4A"
      >
        y
      </text>
      <text
        x={y0xMaxX - 10}
        y={y0xMaxY - 5}
        fontSize="10"
        fontWeight="700"
        fill="#1D1A4A"
      >
        x
      </text>
      <text
        x={x0yMinX + 4}
        y={y0xMinY + 11}
        fontSize="9"
        fontWeight="600"
        fill="#5E588C"
      >
        O
      </text>
      {/* Keep axis lines referenced cleanly */}
      <line x1={x0yMinX} y1={x0yMinY} x2={x0yMaxX} y2={x0yMaxY} stroke="#1D1A4A" strokeWidth={1.5} />
      <line x1={y0xMinX} y1={y0xMinY} x2={y0xMaxX} y2={y0xMaxY} stroke="#1D1A4A" strokeWidth={1.5} />
    </g>
  );
};

export const TransformationDiagrams: React.FC = () => {
  const [tab, setTab] = useState<TransformTab>('translation');

  const cfgStd: GridConfig = {
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    width: 340,
    height: 250,
    pad: 16,
  };

  const cfgEnl: GridConfig = {
    xMin: -3,
    xMax: 9,
    yMin: -2,
    yMax: 7,
    width: 340,
    height: 250,
    pad: 16,
  };

  return (
    <section
      aria-label="Transformation Visual Notebook Diagrams"
      className="p-5 sm:p-6 sk-card space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#1D1A4A]">
            Visual Notebook Diagrams · All 4 Transformations (Translation → Rotation)
          </h2>
          <p className="text-xs text-[#5E588C] mt-0.5">
            Graph-paper illustrations showing how to find the image and how to describe the single transformation.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 sk-tabs" role="tablist" aria-label="Transformation types">
          {(
            [
              { id: 'translation', label: '1. Translation' },
              { id: 'reflection', label: '2. Reflection' },
              { id: 'enlargement', label: '3. Enlargement' },
              { id: 'rotation', label: '4. Rotation' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              data-active={tab === item.id}
              onClick={() => setTab(item.id)}
              className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'translation' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 340 250" className="w-full h-auto" role="img" aria-label="Translation examples A to A prime and B to B prime">
              <GridBackdrop cfg={cfgStd} />
              {(() => {
                const { pt, poly } = makeProjector(cfgStd);
                const triA: [number, number][] = [[-4, 3], [-2, 3], [-2, 5]];
                const triAp: [number, number][] = [[-1, 1], [1, 1], [1, 3]];
                const rectB: [number, number][] = [[3, -4], [4, -4], [4, -2], [3, -2]];
                const rectBp: [number, number][] = [[-3, -1], [-2, -1], [-2, 1], [-3, 1]];
                const [ax1, ay1] = pt(-2, 4);
                const [ax2, ay2] = pt(1, 2);
                const [bx1, by1] = pt(3.5, -3);
                const [bx2, by2] = pt(-2.5, 0);

                return (
                  <g>
                    <polygon points={poly(triA)} fill="#6D69F2" fillOpacity={0.22} stroke="#6D69F2" strokeWidth={2} />
                    <polygon points={poly(triAp)} fill="#FF5FA8" fillOpacity={0.22} stroke="#FF5FA8" strokeWidth={2} />
                    <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="#1D1A4A" strokeWidth={1.6} strokeDasharray="4 3" />
                    <circle cx={ax2} cy={ay2} r={3} fill="#1D1A4A" />
                    <text x={pt(-3.2, 3.6)[0]} y={pt(-3.2, 3.6)[1]} fontSize="11" fontWeight="700" fill="#1D1A4A">A</text>
                    <text x={pt(-0.2, 1.6)[0]} y={pt(-0.2, 1.6)[1]} fontSize="11" fontWeight="700" fill="#C0266B">A&apos;</text>

                    <polygon points={poly(rectB)} fill="#6D69F2" fillOpacity={0.22} stroke="#6D69F2" strokeWidth={2} />
                    <polygon points={poly(rectBp)} fill="#FF5FA8" fillOpacity={0.22} stroke="#FF5FA8" strokeWidth={2} />
                    <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke="#1D1A4A" strokeWidth={1.6} strokeDasharray="4 3" />
                    <circle cx={bx2} cy={by2} r={3} fill="#1D1A4A" />
                    <text x={pt(3.25, -3.2)[0]} y={pt(3.25, -3.2)[1]} fontSize="11" fontWeight="700" fill="#1D1A4A">B</text>
                    <text x={pt(-2.85, -0.2)[0]} y={pt(-2.85, -0.2)[1]} fontSize="11" fontWeight="700" fill="#C0266B">B&apos;</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              1. Translation — Moving or Shifting the Object
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'**Finding the image**: $A \\xrightarrow{T\\binom{a}{b}} A\'$ where $a$ is <u>horizontal movement</u> ($+\\to$, $-\\leftarrow$) and $b$ is <u>vertical movement</u> ($+\\uparrow$, $-\\downarrow$).'} />
              </li>
              <li>
                <MathText text={'Example: Triangle $A$ is translated by $\\binom{3}{-2}$ ($3$ right, $2$ down) to $A\'$.'} />
              </li>
              <li>
                <MathText text={'**Finding single transformation**: We must <u>find</u> the <u>column vector</u>. From rectangle $B$ to $B\'$ is translation by $\\binom{-6}{3}$ ($6$ left, $3$ up).'} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A]">
              <strong>Note:</strong> <MathText text={'Count from ONE vertex on object $B$ to its exact matching vertex on $B\'$. Never draw a fraction line inside $\\binom{a}{b}$.'} />
            </div>
          </div>
        </div>
      )}

      {tab === 'reflection' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 340 250" className="w-full h-auto" role="img" aria-label="Reflection across y-axis, y = 1/2, and y = -x">
              <GridBackdrop cfg={cfgStd} />
              {(() => {
                const { pt, poly } = makeProjector(cfgStd);
                const figA: [number, number][] = [[1.5, 1.5], [4, 1.5], [3, 3.5]];
                const figD: [number, number][] = [[-1.5, 1.5], [-4, 1.5], [-3, 3.5]];
                const figB: [number, number][] = [[1.5, -0.5], [4, -0.5], [3, -2.5]];
                const figC: [number, number][] = [[-1.5, -1.5], [-1.5, -4], [-3.5, -3]];

                const [m1x, m1y] = pt(cfgStd.xMin, 0.5);
                const [m2x, m2y] = pt(cfgStd.xMax, 0.5);
                const [d1x, d1y] = pt(-4.5, 4.5);
                const [d2x, d2y] = pt(4.5, -4.5);

                return (
                  <g>
                    {/* Mirror lines */}
                    <line x1={m1x} y1={m1y} x2={m2x} y2={m2y} stroke="#FF5FA8" strokeWidth={1.8} strokeDasharray="5 3" />
                    <line x1={d1x} y1={d1y} x2={d2x} y2={d2y} stroke="#5B57E8" strokeWidth={1.6} strokeDasharray="5 3" />

                    {/* Equal distance guide */}
                    <line x1={pt(-1.5, 1.5)[0]} y1={pt(-1.5, 1.5)[1]} x2={pt(1.5, 1.5)[0]} y2={pt(1.5, 1.5)[1]} stroke="#1D1A4A" strokeWidth={1.2} strokeDasharray="2 2" />

                    <polygon points={poly(figA)} fill="#6D69F2" fillOpacity={0.25} stroke="#6D69F2" strokeWidth={2} />
                    <polygon points={poly(figB)} fill="#FF5FA8" fillOpacity={0.22} stroke="#FF5FA8" strokeWidth={2} />
                    <polygon points={poly(figC)} fill="#10B981" fillOpacity={0.2} stroke="#059669" strokeWidth={2} />
                    <polygon points={poly(figD)} fill="#F59E0B" fillOpacity={0.22} stroke="#D97706" strokeWidth={2} />

                    <text x={pt(2.6, 2.1)[0]} y={pt(2.6, 2.1)[1]} fontSize="11" fontWeight="700" fill="#1D1A4A">A</text>
                    <text x={pt(2.6, -1.5)[0]} y={pt(2.6, -1.5)[1]} fontSize="11" fontWeight="700" fill="#C0266B">B</text>
                    <text x={pt(-2.5, -3.1)[0]} y={pt(-2.5, -3.1)[1]} fontSize="11" fontWeight="700" fill="#047857">C</text>
                    <text x={pt(-3.1, 2.1)[0]} y={pt(-3.1, 2.1)[1]} fontSize="11" fontWeight="700" fill="#B45309">D</text>

                    <text x={pt(3.1, 0.75)[0]} y={pt(3.1, 0.75)[1]} fontSize="9.5" fontWeight="700" fill="#C0266B">y = ½</text>
                    <text x={pt(2.7, -3.9)[0]} y={pt(2.7, -3.9)[1]} fontSize="9.5" fontWeight="700" fill="#5B57E8">y = -x</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              2. Reflection — Mirroring the Object
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'(i) $A \\to B$: Reflection by $y = \\frac{1}{2}$ (horizontal mirror midway between $y = 1.5$ and $y = -0.5$).'} />
              </li>
              <li>
                <MathText text={'(ii) $A \\to C$: Reflection by $y = -x$ (diagonal mirror swapping $(x, y) \\mapsto (-y, -x)$).'} />
              </li>
              <li>
                <MathText text={'(iii) $A \\to D$: Reflection at $x = 0$ or the $y$-axis.'} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A] space-y-1">
              <div>
                <strong>Note 1:</strong> <MathText text={'<u>Object and image must have equal perpendicular distance to the mirror</u>.'} />
              </div>
              <div>
                <strong>Note 2:</strong> <MathText text={'To find an unknown mirror line, draw the <u>perpendicular bisector of corresponding points</u>.'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'enlargement' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 340 250" className="w-full h-auto" role="img" aria-label="Enlargement with k=2, k=1/2, and negative scale factor k=-1/2 through centre">
              <GridBackdrop cfg={cfgEnl} />
              {(() => {
                const { pt, poly } = makeProjector(cfgEnl);
                const figA: [number, number][] = [[2, 1], [4, 1], [4, 3]];
                const figB: [number, number][] = [[4, 2], [8, 2], [8, 6]];
                const figC: [number, number][] = [[1, 0.5], [2, 0.5], [2, 1.5]];
                const figD: [number, number][] = [[-1, -0.5], [-2, -0.5], [-2, -1.5]];

                return (
                  <g>
                    {/* Projection rays through (0,0) */}
                    <line x1={pt(-2, -1.5)[0]} y1={pt(-2, -1.5)[1]} x2={pt(8, 6)[0]} y2={pt(8, 6)[1]} stroke="#1D1A4A" strokeWidth={1.2} strokeDasharray="4 3" />
                    <line x1={pt(-2, -0.5)[0]} y1={pt(-2, -0.5)[1]} x2={pt(8, 2)[0]} y2={pt(8, 2)[1]} stroke="#1D1A4A" strokeWidth={1.2} strokeDasharray="4 3" />

                    <polygon points={poly(figB)} fill="#FF5FA8" fillOpacity={0.16} stroke="#FF5FA8" strokeWidth={2} />
                    <polygon points={poly(figA)} fill="#6D69F2" fillOpacity={0.25} stroke="#6D69F2" strokeWidth={2} />
                    <polygon points={poly(figC)} fill="#10B981" fillOpacity={0.22} stroke="#059669" strokeWidth={1.8} />
                    <polygon points={poly(figD)} fill="#F59E0B" fillOpacity={0.25} stroke="#D97706" strokeWidth={1.8} />

                    <circle cx={pt(0, 0)[0]} cy={pt(0, 0)[1]} r={3.5} fill="#FF5FA8" stroke="#1D1A4A" strokeWidth={1.5} />
                    <text x={pt(3.1, 1.5)[0]} y={pt(3.1, 1.5)[1]} fontSize="11" fontWeight="700" fill="#1D1A4A">A</text>
                    <text x={pt(6.6, 3.4)[0]} y={pt(6.6, 3.4)[1]} fontSize="11" fontWeight="700" fill="#C0266B">B (k=2)</text>
                    <text x={pt(1.3, 2.1)[0]} y={pt(1.3, 2.1)[1]} fontSize="9.5" fontWeight="700" fill="#047857">C (k=½)</text>
                    <text x={pt(-2.5, -1.75)[0]} y={pt(-2.5, -1.75)[1]} fontSize="9.5" fontWeight="700" fill="#B45309">D (k=-½)</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              3. Enlargement — Upscale or Downscale an Object
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'If $k > 1$: <u>enlarges with the same direction</u> ($A \\to B$).'} />
              </li>
              <li>
                <MathText text={'If $0 < k < 1$: <u>downscales, still with the same direction</u> ($A \\to C$).'} />
              </li>
              <li>
                <MathText text={'If $k < 0$: <u>opposite direction from the centre</u> ($A \\to D$, inverted $180^\\circ$).'} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A] space-y-1">
              <div>
                <strong>Note:</strong> <MathText text={'To find the <u>centre of enlargement</u>, <u>connect at least two corresponding points</u> and find where the straight rays cross.'} />
              </div>
              <div>
                <MathText text={'<u>Scale factor</u> $k = \\dfrac{\\text{unit of image}}{\\text{unit of object}}$ (negative when on opposite sides of centre).'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'rotation' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 340 250" className="w-full h-auto" role="img" aria-label="Rotation 90 degrees clockwise, 90 degrees anticlockwise, and 180 degrees about origin">
              <GridBackdrop cfg={cfgStd} />
              {(() => {
                const { pt, poly } = makeProjector(cfgStd);
                const triA: [number, number][] = [[1, 2], [3, 2], [3, 3]];
                const triB: [number, number][] = [[2, -1], [2, -3], [3, -3]]; // 90 CW
                const triC: [number, number][] = [[-2, 1], [-2, 3], [-3, 3]]; // 90 ACW
                const triD: [number, number][] = [[-1, -2], [-3, -2], [-3, -3]]; // 180

                const [ox, oy] = pt(0, 0);
                const [ax, ay] = pt(1, 2);
                const [bx, by] = pt(2, -1);
                const [cx, cy] = pt(-2, 1);

                return (
                  <g>
                    {/* Spokes from centre (0,0) */}
                    <line x1={ox} y1={oy} x2={ax} y2={ay} stroke="#6D69F2" strokeWidth={1.3} strokeDasharray="3 3" />
                    <line x1={ox} y1={oy} x2={bx} y2={by} stroke="#FF5FA8" strokeWidth={1.3} strokeDasharray="3 3" />
                    <line x1={ox} y1={oy} x2={cx} y2={cy} stroke="#059669" strokeWidth={1.3} strokeDasharray="3 3" />

                    {/* Perpendicular bisector between (1,2) and (-2,1) passing through (0,0) */}
                    <line
                      x1={pt(-1.5, 4.5)[0]}
                      y1={pt(-1.5, 4.5)[1]}
                      x2={pt(1.5, -4.5)[0]}
                      y2={pt(1.5, -4.5)[1]}
                      stroke="#9D174D"
                      strokeWidth={1.1}
                      strokeDasharray="2 3"
                    />

                    <polygon points={poly(triA)} fill="#6D69F2" fillOpacity={0.25} stroke="#6D69F2" strokeWidth={2} />
                    <polygon points={poly(triB)} fill="#FF5FA8" fillOpacity={0.22} stroke="#FF5FA8" strokeWidth={2} />
                    <polygon points={poly(triC)} fill="#10B981" fillOpacity={0.22} stroke="#059669" strokeWidth={2} />
                    <polygon points={poly(triD)} fill="#F59E0B" fillOpacity={0.22} stroke="#D97706" strokeWidth={2} />

                    <circle cx={ox} cy={oy} r={3.5} fill="#FF5FA8" stroke="#1D1A4A" strokeWidth={1.5} />

                    <text x={pt(2.0, 3.35)[0]} y={pt(2.0, 3.35)[1]} fontSize="10.5" fontWeight="700" fill="#1D1A4A">A</text>
                    <text x={pt(2.15, -3.7)[0]} y={pt(2.15, -3.7)[1]} fontSize="9.5" fontWeight="700" fill="#C0266B">B (90° CW)</text>
                    <text x={pt(-4.3, 3.4)[0]} y={pt(-4.3, 3.4)[1]} fontSize="9.5" fontWeight="700" fill="#047857">C (90° ACW)</text>
                    <text x={pt(-3.9, -3.7)[0]} y={pt(-3.9, -3.7)[1]} fontSize="9.5" fontWeight="700" fill="#B45309">D (180°)</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              4. Rotation — Turning Around a Fixed Centre
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'**Finding the image**: Turn vector $\\binom{dx}{dy}$ from the <u>centre of rotation</u>: $90^\\circ\\text{ CW} \\mapsto \\binom{dy}{-dx}$ ($A \\to B$), $90^\\circ\\text{ ACW} \\mapsto \\binom{-dy}{dx}$ ($A \\to C$), and $180^\\circ \\mapsto \\binom{-dx}{-dy}$ ($A \\to D$).'} />
              </li>
              <li>
                <MathText text={'**Finding single transformation**: We must state <u>three parameters</u>: <u>angle</u>, <u>direction</u> (CW/ACW, omit for $180^\\circ$), and <u>centre</u>.'} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A] space-y-1">
              <div>
                <strong>Note 1:</strong> <MathText text={'<u>Distance from centre to every corresponding vertex stays equal</u>.'} />
              </div>
              <div>
                <strong>Note 2:</strong> <MathText text={'To locate the <u>centre of rotation</u>, draw the <u>perpendicular bisector of two pairs of corresponding points</u> — their intersection is the centre (for $180^\\circ$, simply take the midpoint of $AA\'$).'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
