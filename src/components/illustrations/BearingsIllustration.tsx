import React, { useState } from 'react';
import { MathText } from '../MathText';
import { SakugaSlider } from '../SakugaSlider';
import {
  bearingPoint,
  computeBackBearing,
  describeClockwiseBearingArc,
  describeSectorArc,
  formatThreeFigureBearing,
  layoutBearingPair,
} from '../../utils/topicDiagrams';

type BearingsTab = 'forward-back' | 'triangle-path' | 'scale-drawing';

const PRESETS = [
  { label: '045° (Acute)', angle: 45 },
  { label: '072° (Example)', angle: 72 },
  { label: '135° (Obtuse)', angle: 135 },
  { label: '310° (Reflex)', angle: 310 },
];

/**
 * Places a point label cleanly on the side opposite to the ray direction so labels never overlap North arrows or rays.
 */
function labelOffsetAwayFromRay(rayAngleDeg: number, dist: number): { dx: number; dy: number } {
  // Opposite quadrant from ray
  const oppRad = (((rayAngleDeg + 180) % 360) * Math.PI) / 180;
  return {
    dx: Math.round(dist * Math.sin(oppRad)),
    dy: Math.round(-dist * Math.cos(oppRad)),
  };
}

export const BearingsIllustration: React.FC = () => {
  const [tab, setTab] = useState<BearingsTab>('forward-back');
  const [bearing, setBearing] = useState<number>(72);

  const pair = layoutBearingPair(bearing, 185, 138, 124);
  const backBearing = computeBackBearing(bearing);

  // Place Station A badge away from A->B ray; Station B badge away from B->A ray
  const offsetA = labelOffsetAwayFromRay(bearing, 18);
  const offsetB = labelOffsetAwayFromRay(backBearing, 18);

  // Midpoint along clockwise arc for angle label
  const arcMidA = bearingPoint(pair.A, bearing / 2, 42);
  const arcMidB = bearingPoint(pair.B, backBearing / 2, 42);

  // Rightmost/leftmost guard inside 370x260 viewBox
  const clampX = (x: number) => Math.max(26, Math.min(344, x));
  const clampY = (y: number) => Math.max(22, Math.min(246, y));

  return (
    <section
      aria-label="Scale Drawings and Bearings Visual Diagrams"
      className="p-5 sm:p-6 sk-card space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#1D1A4A]">
            Visual Notebook Diagrams · Scale Drawings &amp; Bearings
          </h2>
          <p className="text-xs text-[#5E588C] mt-0.5">
            Measure clockwise from parallel North lines using 3 digits (<span className="font-mono font-semibold text-[#1D1A4A]">000°</span>–<span className="font-mono font-semibold text-[#1D1A4A]">359°</span>).
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 sk-tabs" role="tablist" aria-label="Bearings diagram views">
          {(
            [
              { id: 'forward-back', label: '1. Forward & Back Bearing' },
              { id: 'triangle-path', label: '2. Multi-Leg Triangle' },
              { id: 'scale-drawing', label: '3. Scale Drawing' },
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

      {tab === 'forward-back' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="space-y-3">
            <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
              <svg
                viewBox="0 0 370 265"
                className="w-full h-auto"
                role="img"
                aria-label={`Interactive bearing diagram: B from A is ${formatThreeFigureBearing(bearing)}, A from B is ${formatThreeFigureBearing(backBearing)}`}
              >
                <defs>
                  <pattern id="bearing-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#F0EEFA" strokeWidth="1" />
                  </pattern>
                  <marker id="north-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,6 L3,0 L6,6 z" fill="#1D1A4A" />
                  </marker>
                </defs>
                <rect x="0" y="0" width="370" height="265" fill="url(#bearing-grid)" rx="10" />

                {/* Mini compass rose top-right */}
                <g transform="translate(332, 34)">
                  <circle cx="0" cy="0" r="18" fill="#FAF9FF" stroke="#DCDAF0" strokeWidth="1.2" />
                  <line x1="0" y1="13" x2="0" y2="-13" stroke="#1D1A4A" strokeWidth="1.4" />
                  <line x1="-13" y1="0" x2="13" y2="0" stroke="#9B96C2" strokeWidth="1" />
                  <polygon points="0,-16 -3,-9 3,-9" fill="#5B57E8" />
                  <text x="0" y="-19" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#5B57E8">N</text>
                  <text x="16" y="3" textAnchor="start" fontSize="7.5" fontWeight="700" fill="#6E6996">E</text>
                  <text x="0" y="23" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#6E6996">S</text>
                  <text x="-16" y="3" textAnchor="end" fontSize="7.5" fontWeight="700" fill="#6E6996">W</text>
                </g>

                {/* Parallel North lines at A and B */}
                <line
                  x1={pair.A.x}
                  y1={pair.A.y + 18}
                  x2={pair.A.x}
                  y2={Math.max(18, pair.A.y - 68)}
                  stroke="#1D1A4A"
                  strokeWidth="1.7"
                  strokeDasharray="4 3"
                />
                <polygon
                  points={`${pair.A.x},${Math.max(12, pair.A.y - 72)} ${pair.A.x - 4},${Math.max(20, pair.A.y - 64)} ${pair.A.x + 4},${Math.max(20, pair.A.y - 64)}`}
                  fill="#1D1A4A"
                />
                <text
                  x={pair.A.x}
                  y={Math.max(10, pair.A.y - 76)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#1D1A4A"
                >
                  N
                </text>

                <line
                  x1={pair.B.x}
                  y1={pair.B.y + 18}
                  x2={pair.B.x}
                  y2={Math.max(18, pair.B.y - 68)}
                  stroke="#1D1A4A"
                  strokeWidth="1.7"
                  strokeDasharray="4 3"
                />
                <polygon
                  points={`${pair.B.x},${Math.max(12, pair.B.y - 72)} ${pair.B.x - 4},${Math.max(20, pair.B.y - 64)} ${pair.B.x + 4},${Math.max(20, pair.B.y - 64)}`}
                  fill="#1D1A4A"
                />
                <text
                  x={pair.B.x}
                  y={Math.max(10, pair.B.y - 76)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#1D1A4A"
                >
                  N
                </text>

                {/* Segment AB */}
                <line
                  x1={pair.A.x}
                  y1={pair.A.y}
                  x2={pair.B.x}
                  y2={pair.B.y}
                  stroke="#1D1A4A"
                  strokeWidth="2.4"
                />

                {/* Clockwise bearing arc at A (Forward Bearing) */}
                <path
                  d={describeClockwiseBearingArc(pair.A.x, pair.A.y, 26, bearing)}
                  fill="none"
                  stroke="#5B57E8"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                {/* Clockwise bearing arc at B (Back Bearing) */}
                <path
                  d={describeClockwiseBearingArc(pair.B.x, pair.B.y, 24, backBearing)}
                  fill="none"
                  stroke="#FF5FA8"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                {/* Angle labels */}
                <rect
                  x={clampX(arcMidA.x) - 20}
                  y={clampY(arcMidA.y) - 9}
                  width="40"
                  height="16"
                  rx="5"
                  fill="#EDE9FE"
                  stroke="#5B57E8"
                  strokeWidth="1"
                />
                <text
                  x={clampX(arcMidA.x)}
                  y={clampY(arcMidA.y) + 2.5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#4338CA"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatThreeFigureBearing(bearing)}
                </text>

                <rect
                  x={clampX(arcMidB.x) - 20}
                  y={clampY(arcMidB.y) - 9}
                  width="40"
                  height="16"
                  rx="5"
                  fill="#FCE7F3"
                  stroke="#FF5FA8"
                  strokeWidth="1"
                />
                <text
                  x={clampX(arcMidB.x)}
                  y={clampY(arcMidB.y) + 2.5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#BE185D"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatThreeFigureBearing(backBearing)}
                </text>

                {/* Station dots and A / B labels */}
                <circle cx={pair.A.x} cy={pair.A.y} r="4.5" fill="#5B57E8" stroke="#1D1A4A" strokeWidth="1.5" />
                <text
                  x={clampX(pair.A.x + offsetA.dx)}
                  y={clampY(pair.A.y + offsetA.dy)}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill="#1D1A4A"
                >
                  A
                </text>

                <circle cx={pair.B.x} cy={pair.B.y} r="4.5" fill="#FF5FA8" stroke="#1D1A4A" strokeWidth="1.5" />
                <text
                  x={clampX(pair.B.x + offsetB.dx)}
                  y={clampY(pair.B.y + offsetB.dy)}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill="#1D1A4A"
                >
                  B
                </text>
              </svg>
            </div>

            {/* Interactive Angle Slider & Presets */}
            <div className="p-3.5 sk-card-soft space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="bearing-slider" className="font-semibold text-[#1D1A4A]">
                  Adjust Bearing of B from A
                </label>
                <span className="font-mono font-bold text-[#5B57E8] tabular-nums">
                  {formatThreeFigureBearing(bearing)}
                </span>
              </div>
              <SakugaSlider
                id="bearing-slider"
                min={5}
                max={355}
                step={1}
                value={bearing}
                onChange={setBearing}
              />
              <div
                role="tablist"
                aria-label="Bearing preset angles"
                className="inline-flex flex-wrap gap-1 sk-tabs"
              >
                {PRESETS.map((preset) => (
                  <button
                    key={preset.angle}
                    type="button"
                    role="tab"
                    aria-selected={bearing === preset.angle}
                    data-active={bearing === preset.angle}
                    onClick={() => setBearing(preset.angle)}
                    className="px-2 py-1 text-[11px] font-semibold cursor-pointer sk-tab"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              Forward &amp; Back Bearings Using Parallel North Lines
            </div>
            <div className="p-3.5 sk-card-soft grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <div className="text-[#5E588C]">Bearing of B from A</div>
                <div className="text-lg font-bold text-[#5B57E8] tabular-nums mt-0.5">
                  {formatThreeFigureBearing(bearing)}
                </div>
              </div>
              <div>
                <div className="text-[#5E588C]">Back Bearing (A from B)</div>
                <div className="text-lg font-bold text-[#C0266B] tabular-nums mt-0.5">
                  {formatThreeFigureBearing(backBearing)}
                </div>
              </div>
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'**Stand after "from"**: "Bearing of $B$ <u>from $A$</u>" means draw the North line at $A$ and turn <u>clockwise</u> to ray $AB$.'} />
              </li>
              <li>
                <MathText text={`**Co-interior shortcut**: Parallel North lines at $A$ and $B$ give co-interior angle $180^\\circ - ${bearing < 180 ? bearing : 360 - bearing}^\\circ = ${pair.coInteriorAngle}^\\circ$, so back bearing is $${bearing < 180 ? `${bearing}^\\circ + 180^\\circ` : `${bearing}^\\circ - 180^\\circ`} = ${formatThreeFigureBearing(backBearing)}$.`} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A]">
              <strong>Note:</strong> Always write <u>three figures</u> (<span className="font-mono font-bold">072°</span>, never <span className="font-mono">72°</span>). Add <span className="font-mono font-bold">180°</span> when forward bearing &lt; 180°; subtract <span className="font-mono font-bold">180°</span> when ≥ 180°.
            </div>
          </div>
        </div>
      )}

      {tab === 'triangle-path' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg
              viewBox="0 0 370 265"
              className="w-full h-auto"
              role="img"
              aria-label="Three-point navigation bearing triangle A to B to C"
            >
              <rect x="0" y="0" width="370" height="265" fill="#FAF9FF" rx="10" />
              {(() => {
                // Exact geometric layout:
                // A at (75, 165) -> bearing 065° length 145 -> B
                // B -> bearing 155° length 110 -> C (Notice 155 - 65 = 90° difference -> interior angle at B is 90°!)
                const A = { x: 76, y: 152 };
                const B = bearingPoint(A, 65, 148);
                const C = bearingPoint(B, 155, 114);

                return (
                  <g>
                    {/* North lines at A and B */}
                    <line x1={A.x} y1={A.y + 14} x2={A.x} y2={A.y - 62} stroke="#1D1A4A" strokeWidth="1.6" strokeDasharray="4 3" />
                    <polygon points={`${A.x},${A.y - 68} ${A.x - 4},${A.y - 59} ${A.x + 4},${A.y - 59}`} fill="#1D1A4A" />
                    <text x={A.x} y={A.y - 73} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1D1A4A">N</text>

                    <line x1={B.x} y1={B.y + 62} x2={B.x} y2={B.y - 62} stroke="#1D1A4A" strokeWidth="1.6" strokeDasharray="4 3" />
                    <polygon points={`${B.x},${B.y - 68} ${B.x - 4},${B.y - 59} ${B.x + 4},${B.y - 59}`} fill="#1D1A4A" />
                    <text x={B.x} y={B.y - 73} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1D1A4A">N</text>
                    <text x={B.x - 7} y={B.y + 64} textAnchor="end" fontSize="9.5" fontWeight="700" fill="#6E6996">S</text>

                    {/* Triangle ABC */}
                    <polygon
                      points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                      fill="#EDE9FE"
                      fillOpacity="0.45"
                      stroke="#1D1A4A"
                      strokeWidth="2.2"
                    />

                    {/* Bearing 065° at A */}
                    <path d={describeClockwiseBearingArc(A.x, A.y, 26, 65)} fill="none" stroke="#5B57E8" strokeWidth="2.5" />
                    <text x={A.x + 28} y={A.y - 24} fontSize="10" fontWeight="800" fill="#5B57E8" fontFamily="ui-monospace, monospace">
                      065°
                    </text>

                    {/* Bearing 155° at B */}
                    <path d={describeClockwiseBearingArc(B.x, B.y, 26, 155)} fill="none" stroke="#FF5FA8" strokeWidth="2.5" />
                    <text x={B.x + 30} y={B.y - 8} fontSize="10" fontWeight="800" fill="#C0266B" fontFamily="ui-monospace, monospace">
                      155°
                    </text>

                    {/* Alternate angle 65° between South-of-B and BA */}
                    <path d={describeSectorArc(B.x, B.y, 24, 180, 245)} fill="none" stroke="#059669" strokeWidth="2.2" />
                    <text x={B.x - 35} y={B.y + 28} fontSize="9.5" fontWeight="800" fill="#047857" fontFamily="ui-monospace, monospace">
                      65°
                    </text>

                    {/* Angle 25° between South-of-B and BC */}
                    <path d={describeSectorArc(B.x, B.y, 33, 155, 180)} fill="none" stroke="#D97706" strokeWidth="2.2" />
                    <text x={B.x + 8} y={B.y + 42} fontSize="9.5" fontWeight="800" fill="#B45309" fontFamily="ui-monospace, monospace">
                      25°
                    </text>

                    {/* Side length labels */}
                    <text x={(A.x + B.x) / 2 - 8} y={(A.y + B.y) / 2 - 10} fontSize="10" fontWeight="700" fill="#1D1A4A">
                      8 km
                    </text>
                    <text x={(B.x + C.x) / 2 + 12} y={(B.y + C.y) / 2} fontSize="10" fontWeight="700" fill="#1D1A4A">
                      6 km
                    </text>

                    {/* Vertices */}
                    <circle cx={A.x} cy={A.y} r="4" fill="#5B57E8" stroke="#1D1A4A" strokeWidth="1.5" />
                    <text x={A.x - 13} y={A.y + 5} fontSize="12" fontWeight="800" fill="#1D1A4A">A</text>

                    <circle cx={B.x} cy={B.y} r="4" fill="#FF5FA8" stroke="#1D1A4A" strokeWidth="1.5" />
                    <text x={B.x + 10} y={B.y - 6} fontSize="12" fontWeight="800" fill="#1D1A4A">B</text>

                    <circle cx={C.x} cy={C.y} r="4" fill="#059669" stroke="#1D1A4A" strokeWidth="1.5" />
                    <text x={C.x + 9} y={C.y + 6} fontSize="12" fontWeight="800" fill="#1D1A4A">C</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              Connecting Bearings to Triangle Angles (Paper 4 Classic)
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'A ship sails $8\\text{ km}$ from $A$ to $B$ on bearing $065^\\circ$, then $6\\text{ km}$ from $B$ to $C$ on bearing $155^\\circ$.'} />
              </li>
              <li>
                <MathText text={'Extend the North–South line through $B$: alternate angles give $\\angle ABS = 65^\\circ$ (green), and straight-line angles give $\\angle SBC = 180^\\circ - 155^\\circ = 25^\\circ$ (amber).'} />
              </li>
              <li>
                <MathText text={'Therefore total interior angle $\\angle ABC = 65^\\circ + 25^\\circ = 90^\\circ$ — ready for Pythagoras or the Cosine Rule to find $AC = 10\\text{ km}$!'} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A]">
              <strong>Note:</strong> Extending the North line downwards to South splits every intermediate turning vertex cleanly into two known angles!
            </div>
          </div>
        </div>
      )}

      {tab === 'scale-drawing' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg
              viewBox="0 0 370 265"
              className="w-full h-auto"
              role="img"
              aria-label="Scale drawing diagram with 1 cm represents 5 km and vector length 4.2 cm"
            >
              <rect x="0" y="0" width="370" height="265" fill="#FAF9FF" rx="10" />
              {/* Scale Bar top */}
              <g transform="translate(22, 16)">
                <text x="0" y="0" fontSize="10.5" fontWeight="800" fill="#1D1A4A">
                  Scale: 1 cm represents 5 km
                </text>
                <rect x="0" y="8" width="180" height="15" fill="white" stroke="#1D1A4A" strokeWidth="1.5" rx="3" />
                {[0, 1, 2, 3, 4].map((cm) => (
                  <g key={cm} transform={`translate(${cm * 36}, 8)`}>
                    <rect x="0" y="0" width="36" height="15" fill={cm % 2 === 0 ? '#EDE9FE' : '#FFFFFF'} stroke="#1D1A4A" strokeWidth="0.9" />
                    <text x="0" y="27" fontSize="8.5" fontWeight="700" fill="#5E588C" textAnchor="middle">
                      {cm}
                    </text>
                  </g>
                ))}
                <text x="180" y="35" fontSize="8.5" fontWeight="700" fill="#5E588C" textAnchor="middle">
                  5 cm
                </text>
              </g>

              {(() => {
                // Vector P -> Q: bearing 120°, length 4.2 cm = 151.2 px at 36 px/cm
                const P = { x: 85, y: 140 };
                const Q = bearingPoint(P, 120, 4.2 * 36);
                return (
                  <g>
                    <line x1={P.x} y1={P.y + 12} x2={P.x} y2={P.y - 46} stroke="#1D1A4A" strokeWidth="1.6" strokeDasharray="4 3" />
                    <polygon points={`${P.x},${P.y - 52} ${P.x - 4},${P.y - 43} ${P.x + 4},${P.y - 43}`} fill="#1D1A4A" />
                    <text x={P.x} y={P.y - 56} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#1D1A4A">N</text>

                    <line x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} stroke="#5B57E8" strokeWidth="2.8" />
                    <path d={describeClockwiseBearingArc(P.x, P.y, 24, 120)} fill="none" stroke="#FF5FA8" strokeWidth="2.4" />
                    <text x={P.x + 28} y={P.y - 10} fontSize="10" fontWeight="800" fill="#C0266B" fontFamily="ui-monospace, monospace">
                      120°
                    </text>

                    <text x={(P.x + Q.x) / 2 + 8} y={(P.y + Q.y) / 2 - 10} fontSize="10.5" fontWeight="800" fill="#1D1A4A">
                      4.2 cm = 21 km
                    </text>

                    <circle cx={P.x} cy={P.y} r="4.5" fill="#5B57E8" stroke="#1D1A4A" strokeWidth="1.5" />
                    <text x={P.x - 13} y={P.y + 4} fontSize="12" fontWeight="800" fill="#1D1A4A">P</text>

                    <circle cx={Q.x} cy={Q.y} r="4.5" fill="#FF5FA8" stroke="#1D1A4A" strokeWidth="1.5" />
                    <text x={Q.x + 10} y={Q.y + 4} fontSize="12" fontWeight="800" fill="#1D1A4A">Q</text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">
              Reading &amp; Drawing Scale Diagrams Accurately
            </div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <MathText text={'**Map $\\to$ Real**: Measure line $PQ = 4.2\\text{ cm}$. With scale $1\\text{ cm} : 5\\text{ km}$, actual distance $= 4.2 \\times 5 = 21\\text{ km}$.'} />
              </li>
              <li>
                <MathText text={'**Real $\\to$ Map**: To draw $18\\text{ km}$ at $1\\text{ cm} : 5\\text{ km}$, divide by the scale: $18 \\div 5 = 3.6\\text{ cm}$.'} />
              </li>
              <li>
                <MathText text={'Always centre the protractor $0^\\circ$ mark straight up along the North line and read the **outer clockwise scale**.'} />
              </li>
            </ul>
            <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A]">
              <strong>Note:</strong> Check units! If the scale is written as a ratio <span className="font-mono font-bold">1 : 50 000</span>, convert cm to km by dividing by <span className="font-mono font-bold">100 000</span> (<span className="font-mono font-bold">1 cm = 0.5 km</span>).
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
