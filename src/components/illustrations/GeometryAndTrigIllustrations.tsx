import React, { useState } from 'react';
import { MathText } from '../MathText';
import { circlePoint, computeSssApex, regularPolygonVertices } from '../../utils/topicDiagrams';

/* 4.2 Geometrical Constructions */
export const ConstructionsIllustration: React.FC = () => {
  const [tab, setTab] = useState<'sss' | 'perp' | 'angle'>('sss');

  const ax = 68;
  const ay = 195;
  const pxPerCm = 36;
  const bx = ax + 6 * pxPerCm;
  const by = ay;
  const cPt = computeSssApex(ax, ay, 6, 5, 4, pxPerCm);

  return (
    <section aria-label="Geometrical Constructions Diagrams" className="p-5 sm:p-6 sk-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#1D1A4A]">
            Visual Notebook Diagrams · Ruler &amp; Compass Constructions
          </h2>
          <p className="text-xs text-[#5E588C] mt-0.5">
            Keep all intersecting compass arcs visible — erasing construction arcs loses exam marks.
          </p>
        </div>
        <div className="inline-flex flex-wrap gap-1 sk-tabs" role="tablist">
          {(
            [
              { id: 'sss', label: '1. SSS Triangle (6, 5, 4 cm)' },
              { id: 'perp', label: '2. Perpendicular Bisector' },
              { id: 'angle', label: '3. Angle Bisector' },
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

      {tab === 'sss' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 360 235" className="w-full h-auto" role="img" aria-label="SSS Triangle construction with intersecting compass arcs">
              <rect x="0" y="0" width="360" height="235" fill="#FAF9FF" rx="10" />
              {/* Arc from A radius 5 cm */}
              <path
                d={`M ${ax + 125} ${ay - 129} A ${5 * pxPerCm} ${5 * pxPerCm} 0 0 1 ${ax + 168} ${ay - 65}`}
                fill="none"
                stroke="#5B57E8"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              {/* Arc from B radius 4 cm */}
              <path
                d={`M ${bx - 135} ${by - 50} A ${4 * pxPerCm} ${4 * pxPerCm} 0 0 1 ${bx - 70} ${by - 126}`}
                fill="none"
                stroke="#FF5FA8"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              <polygon
                points={`${ax},${ay} ${bx},${by} ${cPt.x},${cPt.y}`}
                fill="#EDE9FE"
                fillOpacity="0.4"
                stroke="#1D1A4A"
                strokeWidth="2.2"
              />
              <circle cx={ax} cy={ay} r="3.5" fill="#5B57E8" />
              <circle cx={bx} cy={by} r="3.5" fill="#FF5FA8" />
              <circle cx={cPt.x} cy={cPt.y} r="4" fill="#059669" stroke="#1D1A4A" strokeWidth="1.4" />
              <text x={ax - 12} y={ay + 4} fontSize="12" fontWeight="800" fill="#1D1A4A">A</text>
              <text x={bx + 8} y={by + 4} fontSize="12" fontWeight="800" fill="#1D1A4A">B</text>
              <text x={cPt.x} y={cPt.y - 12} textAnchor="middle" fontSize="12" fontWeight="800" fill="#047857">C (intersection)</text>
              <text x={(ax + bx) / 2} y={ay + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D1A4A">6 cm</text>
              <text x={(ax + cPt.x) / 2 - 48} y={(ay + cPt.y) / 2 - 4} fontSize="10.5" fontWeight="700" fill="#5B57E8">5 cm arc</text>
              <text x={(bx + cPt.x) / 2 + 16} y={(by + cPt.y) / 2 - 4} fontSize="10.5" fontWeight="700" fill="#C0266B">4 cm arc</text>
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">SSS Triangle Construction (Compass Only)</div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li><MathText text={'Draw the longest base $AB = 6\\text{ cm}$ cleanly with a sharp pencil and ruler.'} /></li>
              <li><MathText text={'Open compass to $5\\text{ cm}$, pivot at $A$, and sweep a smooth blue arc.'} /></li>
              <li><MathText text={'Open compass to $4\\text{ cm}$, pivot at $B$, and sweep a pink arc cutting the first arc at $C$.'} /></li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'perp' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 360 235" className="w-full h-auto" role="img" aria-label="Perpendicular bisector construction of segment AB">
              <rect x="0" y="0" width="360" height="235" fill="#FAF9FF" rx="10" />
              <line x1="75" y1="120" x2="285" y2="120" stroke="#1D1A4A" strokeWidth="2.4" />
              {/* Intersecting equal arcs from A(75,120) and B(285,120), R = 135 */}
              <path d="M 155 15 A 135 135 0 0 1 198 70" fill="none" stroke="#5B57E8" strokeWidth="1.8" strokeDasharray="4 3" />
              <path d="M 205 15 A 135 135 0 0 0 162 70" fill="none" stroke="#FF5FA8" strokeWidth="1.8" strokeDasharray="4 3" />
              <path d="M 198 170 A 135 135 0 0 1 155 225" fill="none" stroke="#5B57E8" strokeWidth="1.8" strokeDasharray="4 3" />
              <path d="M 162 170 A 135 135 0 0 0 205 225" fill="none" stroke="#FF5FA8" strokeWidth="1.8" strokeDasharray="4 3" />
              {/* Bisector line */}
              <line x1="180" y1="15" x2="180" y2="222" stroke="#059669" strokeWidth="2.4" />
              <rect x="180" y="108" width="12" height="12" fill="none" stroke="#1D1A4A" strokeWidth="1.5" />
              <circle cx="75" cy="120" r="4" fill="#5B57E8" />
              <circle cx="285" cy="120" r="4" fill="#FF5FA8" />
              <circle cx="180" cy="36" r="3.5" fill="#059669" />
              <circle cx="180" cy="204" r="3.5" fill="#059669" />
              <text x="61" y="124" fontSize="12" fontWeight="800" fill="#1D1A4A">A</text>
              <text x="294" y="124" fontSize="12" fontWeight="800" fill="#1D1A4A">B</text>
              <text x="190" y="34" fontSize="10.5" fontWeight="700" fill="#047857">Equidistant locus (PA = PB)</text>
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">Perpendicular Bisector (Equidistant from Two Points)</div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li><MathText text={'Set compass width strictly **more than half** of $AB$.'} /></li>
              <li><MathText text={'Keeping the **exact same radius**, draw arcs above and below $AB$ from $A$ and from $B$.'} /></li>
              <li><MathText text={'Join the two intersection points: every point on this green line has $PA = PB$ and crosses $AB$ at $90^\\circ$.'} /></li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'angle' && (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 360 235" className="w-full h-auto" role="img" aria-label="Angle bisector construction">
              <rect x="0" y="0" width="360" height="235" fill="#FAF9FF" rx="10" />
              {/* Vertex B(60, 175), arms to A(260, 55) and C(290, 175) */}
              <line x1="60" y1="175" x2="275" y2="46" stroke="#1D1A4A" strokeWidth="2.3" />
              <line x1="60" y1="175" x2="305" y2="175" stroke="#1D1A4A" strokeWidth="2.3" />
              {/* First arc radius 90 */}
              <path d="M 137 129 A 90 90 0 0 1 150 175" fill="none" stroke="#5B57E8" strokeWidth="2" strokeDasharray="4 3" />
              {/* Second intersecting arcs */}
              <path d="M 205 110 A 85 85 0 0 1 232 148" fill="none" stroke="#FF5FA8" strokeWidth="1.8" strokeDasharray="4 3" />
              <path d="M 232 108 A 85 85 0 0 0 198 148" fill="none" stroke="#FF5FA8" strokeWidth="1.8" strokeDasharray="4 3" />
              {/* Angle bisector */}
              <line x1="60" y1="175" x2="295" y2="108" stroke="#059669" strokeWidth="2.4" />
              <circle cx="60" cy="175" r="4" fill="#1D1A4A" />
              <circle cx="137" cy="129" r="3.5" fill="#5B57E8" />
              <circle cx="150" cy="175" r="3.5" fill="#5B57E8" />
              <circle cx="220" cy="129" r="4" fill="#059669" />
              <text x="45" y="180" fontSize="12" fontWeight="800" fill="#1D1A4A">B</text>
              <text x="128" y="118" fontSize="11" fontWeight="700" fill="#5B57E8">P</text>
              <text x="150" y="192" fontSize="11" fontWeight="700" fill="#5B57E8">Q</text>
              <text x="230" y="125" fontSize="11" fontWeight="700" fill="#047857">R</text>
              <text x="255" y="98" fontSize="10.5" fontWeight="700" fill="#047857">Bisector (θ/2)</text>
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <div className="font-display font-bold text-[#1D1A4A]">Angle Bisector (Equidistant from Two Lines)</div>
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li><MathText text={'Pivot at vertex $B$ and swing one arc cutting both arms at $P$ and $Q$ ($BP = BQ$).'} /></li>
              <li><MathText text={'Without changing radius, draw arcs from $P$ and $Q$ crossing at $R$.'} /></li>
              <li><MathText text={'Line $BR$ splits the angle exactly in half and is equidistant from both rays.'} /></li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

/* 4.4 Similarity (Length k, Area k^2, Volume k^3) */
export const SimilarityIllustration: React.FC = () => (
  <section aria-label="Similarity Scale Factors Diagram" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagram · Length (<span className="font-mono text-[#5B57E8]">k</span>), Area (<span className="font-mono text-[#FF5FA8]">k²</span>) &amp; Volume (<span className="font-mono text-[#059669]">k³</span>) Scale Factors
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">
        Find the linear ratio <span className="font-mono font-semibold text-[#1D1A4A]">k</span> first before scaling area or volume.
      </p>
    </div>
    <div className="grid md:grid-cols-2 gap-5 items-center">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
        <svg viewBox="0 0 380 220" className="w-full h-auto" role="img" aria-label="Similar triangles and similar 3D solids scaling by k=1.5">
          <rect x="0" y="0" width="380" height="220" fill="#FAF9FF" rx="10" />
          {/* Small cylinder/cone pair left */}
          <ellipse cx="75" cy="175" rx="28" ry="8" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2" />
          <line x1="47" y1="95" x2="47" y2="175" stroke="#5B57E8" strokeWidth="2" />
          <line x1="103" y1="95" x2="103" y2="175" stroke="#5B57E8" strokeWidth="2" />
          <ellipse cx="75" cy="95" rx="28" ry="8" fill="#DDD6FE" stroke="#5B57E8" strokeWidth="2" />
          <text x="75" y="138" textAnchor="middle" fontSize="10" fontWeight="800" fill="#4338CA">V₁ = 240 cm³</text>
          <text x="27" y="138" fontSize="10" fontWeight="700" fill="#1D1A4A">12 cm</text>

          {/* Arrow k = 1.5 */}
          <line x1="126" y1="130" x2="188" y2="130" stroke="#1D1A4A" strokeWidth="2" />
          <polygon points="193,130 184,125 184,135" fill="#1D1A4A" />
          <text x="158" y="114" textAnchor="middle" fontSize="11" fontWeight="800" fill="#5B57E8">× k = 1.5</text>
          <text x="158" y="149" textAnchor="middle" fontSize="10" fontWeight="700" fill="#C0266B">Area × 1.5²</text>
          <text x="158" y="164" textAnchor="middle" fontSize="10" fontWeight="700" fill="#047857">Vol × 1.5³</text>

          {/* Large cylinder right (1.5x dimensions) */}
          <ellipse cx="268" cy="178" rx="42" ry="11" fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="2.2" />
          <line x1="226" y1="58" x2="226" y2="178" stroke="#FF5FA8" strokeWidth="2.2" />
          <line x1="310" y1="58" x2="310" y2="178" stroke="#FF5FA8" strokeWidth="2.2" />
          <ellipse cx="268" cy="58" rx="42" ry="11" fill="#FBCFE8" stroke="#FF5FA8" strokeWidth="2.2" />
          <text x="268" y="122" textAnchor="middle" fontSize="11" fontWeight="800" fill="#BE185D">V₂ = 810 cm³</text>
          <text x="320" y="122" fontSize="10.5" fontWeight="700" fill="#1D1A4A">18 cm</text>
        </svg>
      </div>
      <div className="space-y-2.5 text-sm text-[#393469]">
        <div className="p-3 sk-card-soft font-mono text-xs space-y-1.5">
          <div>Length ratio: <strong className="text-[#5B57E8]">k = 18 ÷ 12 = 1.5</strong></div>
          <div>Surface area ratio: <strong className="text-[#C0266B]">k² = 1.5² = 2.25</strong></div>
          <div>Volume ratio: <strong className="text-[#047857]">k³ = 1.5³ = 3.375</strong></div>
        </div>
        <div className="p-3 rounded-xl bg-[#FFF5FA] border-[1.5px] border-[#1D1A4A] shadow-[2px_3px_0_#B8B3FF] text-xs text-[#1D1A4A]">
          <strong>Note:</strong> Given areas? Take <MathText text={'$\\sqrt{\\text{Area ratio}}$'} /> to get <span className="font-mono font-bold">k</span>. Given volumes? Take <MathText text={'$\\sqrt[3]{\\text{Volume ratio}}$'} /> to get <span className="font-mono font-bold">k</span>!
        </div>
      </div>
    </div>
  </section>
);

/* 4.5 Symmetry Explorer */
const SYMMETRY_SHAPES = [
  { id: 'square', name: 'Square', lines: 4, order: 4, note: '2 vertical/horizontal midlines + 2 diagonals.' },
  { id: 'rect', name: 'Rectangle', lines: 2, order: 2, note: 'Midlines only! Diagonals do NOT fold onto matching corners.' },
  { id: 'rhombus', name: 'Rhombus', lines: 2, order: 2, note: 'Both diagonals are lines of symmetry.' },
  { id: 'para', name: 'Parallelogram', lines: 0, order: 2, note: '0 mirror lines, but maps onto itself after 180° turn (order 2).' },
  { id: 'hex', name: 'Regular Hexagon', lines: 6, order: 6, note: '3 opposite-vertex lines + 3 opposite-midpoint lines.' },
] as const;

export const SymmetryIllustration: React.FC = () => {
  const [shapeId, setShapeId] = useState<(typeof SYMMETRY_SHAPES)[number]['id']>('rect');
  const active = SYMMETRY_SHAPES.find((s) => s.id === shapeId) ?? SYMMETRY_SHAPES[1];
  const hexPts = regularPolygonVertices(120, 105, 68, 6);

  return (
    <section aria-label="2D Line and Rotational Symmetry Visuals" className="p-5 sm:p-6 sk-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#1D1A4A]">
            Visual Notebook Explorer · Line &amp; Rotational Symmetry
          </h2>
          <p className="text-xs text-[#5E588C] mt-0.5">
            Compare tricky quadrilaterals and regular polygons side-by-side.
          </p>
        </div>
        <div className="inline-flex flex-wrap gap-1 sk-tabs" role="tablist">
          {SYMMETRY_SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={shapeId === s.id}
              data-active={shapeId === s.id}
              onClick={() => setShapeId(s.id)}
              className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-center">
        <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
          <svg viewBox="0 0 240 210" className="w-full max-w-[260px] mx-auto h-auto" role="img" aria-label={`${active.name} symmetry diagram`}>
            <rect x="0" y="0" width="240" height="210" fill="#FAF9FF" rx="10" />
            {shapeId === 'square' && (
              <g>
                <rect x="55" y="40" width="130" height="130" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
                <line x1="120" y1="22" x2="120" y2="188" stroke="#FF5FA8" strokeWidth="2" strokeDasharray="5 3" />
                <line x1="37" y1="105" x2="203" y2="105" stroke="#FF5FA8" strokeWidth="2" strokeDasharray="5 3" />
                <line x1="42" y1="27" x2="198" y2="183" stroke="#5B57E8" strokeWidth="2" strokeDasharray="5 3" />
                <line x1="198" y1="27" x2="42" y2="183" stroke="#5B57E8" strokeWidth="2" strokeDasharray="5 3" />
              </g>
            )}
            {shapeId === 'rect' && (
              <g>
                <rect x="42" y="55" width="156" height="100" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
                <line x1="120" y1="32" x2="120" y2="178" stroke="#FF5FA8" strokeWidth="2.2" strokeDasharray="5 3" />
                <line x1="25" y1="105" x2="215" y2="105" stroke="#FF5FA8" strokeWidth="2.2" strokeDasharray="5 3" />
              </g>
            )}
            {shapeId === 'rhombus' && (
              <g>
                <polygon points="120,38 196,105 120,172 44,105" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
                <line x1="120" y1="22" x2="120" y2="188" stroke="#FF5FA8" strokeWidth="2.2" strokeDasharray="5 3" />
                <line x1="26" y1="105" x2="214" y2="105" stroke="#FF5FA8" strokeWidth="2.2" strokeDasharray="5 3" />
              </g>
            )}
            {shapeId === 'para' && (
              <g>
                <polygon points="74,56 202,56 166,154 38,154" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
                <circle cx="120" cy="105" r="4" fill="#FF5FA8" />
                <path d="M 96 105 A 24 24 0 1 1 144 105" fill="none" stroke="#5B57E8" strokeWidth="2" strokeDasharray="4 3" />
                <text x="120" y="182" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C0266B">No mirror lines — 180° turns only</text>
              </g>
            )}
            {shapeId === 'hex' && (
              <g>
                <polygon points={hexPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
                {[0, 1, 2].map((i) => (
                  <line
                    key={`v-${i}`}
                    x1={hexPts[i].x}
                    y1={hexPts[i].y}
                    x2={hexPts[i + 3].x}
                    y2={hexPts[i + 3].y}
                    stroke="#FF5FA8"
                    strokeWidth="1.7"
                    strokeDasharray="4 3"
                  />
                ))}
                {[0, 1, 2].map((i) => {
                  const p1 = hexPts[i];
                  const p2 = hexPts[(i + 1) % 6];
                  const q1 = hexPts[(i + 3) % 6];
                  const q2 = hexPts[(i + 4) % 6];
                  return (
                    <line
                      key={`m-${i}`}
                      x1={(p1.x + p2.x) / 2}
                      y1={(p1.y + p2.y) / 2}
                      x2={(q1.x + q2.x) / 2}
                      y2={(q1.y + q2.y) / 2}
                      stroke="#5B57E8"
                      strokeWidth="1.6"
                      strokeDasharray="4 3"
                    />
                  );
                })}
              </g>
            )}
          </svg>
        </div>
        <div className="space-y-3 text-sm text-[#393469]">
          <div className="font-display font-bold text-[#1D1A4A]">{active.name}</div>
          <div className="grid grid-cols-2 gap-3 p-3.5 sk-card-soft font-mono text-xs">
            <div>
              <div className="text-[#5E588C]">Lines of Symmetry</div>
              <div className="text-xl font-bold text-[#FF5FA8] tabular-nums">{active.lines}</div>
            </div>
            <div>
              <div className="text-[#5E588C]">Rotational Order</div>
              <div className="text-xl font-bold text-[#5B57E8] tabular-nums">{active.order}</div>
            </div>
          </div>
          <p className="leading-relaxed">{active.note}</p>
        </div>
      </div>
    </section>
  );
};

/* 4.6 Angles (Parallel Lines & Regular Polygons) */
export const AnglesIllustration: React.FC = () => {
  const [tab, setTab] = useState<'parallel' | 'polygon'>('parallel');
  const polyPts = regularPolygonVertices(140, 118, 66, 6);

  return (
    <section aria-label="Angles in Parallel Lines and Polygons" className="p-5 sm:p-6 sk-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#1D1A4A]">
            Visual Notebook Diagrams · Parallel Lines &amp; Polygon Angles
          </h2>
          <p className="text-xs text-[#5E588C] mt-0.5">
            Always quote Cambridge terms: <strong>alternate</strong>, <strong>corresponding</strong>, or <strong>co-interior</strong> (never Z/F/C).
          </p>
        </div>
        <div className="inline-flex gap-1 sk-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'parallel'} data-active={tab === 'parallel'} onClick={() => setTab('parallel')} className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer sk-tab">
            1. Parallel Lines
          </button>
          <button type="button" role="tab" aria-selected={tab === 'polygon'} data-active={tab === 'polygon'} onClick={() => setTab('polygon')} className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer sk-tab">
            2. Interior &amp; Exterior
          </button>
        </div>
      </div>

      {tab === 'parallel' ? (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 360 220" className="w-full h-auto" role="img" aria-label="Alternate, corresponding, and co-interior angles in parallel lines">
              <rect x="0" y="0" width="360" height="220" fill="#FAF9FF" rx="10" />
              <line x1="35" y1="70" x2="325" y2="70" stroke="#1D1A4A" strokeWidth="2.4" />
              <line x1="35" y1="155" x2="325" y2="155" stroke="#1D1A4A" strokeWidth="2.4" />
              {/* Parallel arrows */}
              <polyline points="270,65 278,70 270,75" fill="none" stroke="#1D1A4A" strokeWidth="2" />
              <polyline points="270,150 278,155 270,160" fill="none" stroke="#1D1A4A" strokeWidth="2" />
              {/* Transversal */}
              <line x1="115" y1="200" x2="235" y2="25" stroke="#5B57E8" strokeWidth="2.4" />
              {/* Corresponding angles */}
              <path d="M 220 70 A 20 20 0 0 0 212 54" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2" />
              <path d="M 162 155 A 20 20 0 0 0 154 139" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2" />
              {/* Alternate angle at bottom-right and top-left */}
              <path d="M 184 70 A 20 20 0 0 1 193 84" fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="2" />
              {/* Co-interior label */}
              <text x="228" y="61" fontSize="11" fontWeight="800" fill="#5B57E8">a = 55°</text>
              <text x="170" y="146" fontSize="11" fontWeight="800" fill="#5B57E8">a = 55° (Corr.)</text>
              <text x="155" y="88" fontSize="11" fontWeight="800" fill="#C0266B">a = 55° (Alt.)</text>
              <text x="200" y="102" fontSize="10.5" fontWeight="700" fill="#047857">b = 125°</text>
              <text x="175" y="122" fontSize="9.5" fontWeight="700" fill="#047857">(a + b = 180° Co-interior)</text>
            </svg>
          </div>
          <ul className="space-y-2.5 text-sm text-[#393469] list-disc pl-5 leading-relaxed">
            <li><MathText text={'**Corresponding angles** are equal (same corner position at each parallel crossing).'} /></li>
            <li><MathText text={'**Alternate angles** are equal (opposite sides between the two parallel lines).'} /></li>
            <li><MathText text={'**Co-interior (allied) angles** between parallel lines add up to **$180^\\circ$**.'} /></li>
          </ul>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
            <svg viewBox="0 0 360 220" className="w-full h-auto" role="img" aria-label="Regular hexagon showing interior 120 degrees and exterior 60 degrees">
              <rect x="0" y="0" width="360" height="220" fill="#FAF9FF" rx="10" />
              <polygon points={polyPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
              {/* Extend bottom-right side from vertex 2 to outside */}
              <line x1={polyPts[1].x} y1={polyPts[1].y} x2={polyPts[2].x} y2={polyPts[2].y} stroke="#1D1A4A" strokeWidth="2.2" />
              <line x1={polyPts[2].x} y1={polyPts[2].y} x2={polyPts[2].x} y2={polyPts[2].y + 52} stroke="#FF5FA8" strokeWidth="2.2" strokeDasharray="4 3" />
              <path d={`M ${polyPts[2].x - 20} ${polyPts[2].y + 11} A 22 22 0 0 1 ${polyPts[2].x} ${polyPts[2].y + 22}`} fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="2" />
              <text x={polyPts[2].x + 12} y={polyPts[2].y + 28} fontSize="11" fontWeight="800" fill="#C0266B">Ext = 360° ÷ 6 = 60°</text>
              <text x={polyPts[2].x - 68} y={polyPts[2].y + 4} fontSize="11" fontWeight="800" fill="#5B57E8">Int = 120°</text>
            </svg>
          </div>
          <div className="space-y-3 text-sm text-[#393469]">
            <ul className="space-y-2 list-disc pl-5 leading-relaxed">
              <li><MathText text={'Sum of ALL exterior angles of ANY convex polygon $= 360^\\circ$.'} /></li>
              <li><MathText text={'At every vertex on a straight extended edge: $\\text{Interior} + \\text{Exterior} = 180^\\circ$.'} /></li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

/* 4.7 Circle Theorems I Gallery */
export const CircleTheorems1Gallery: React.FC = () => {
  const c1A = circlePoint(90, 90, 56, 270);
  const c1B = circlePoint(90, 90, 56, 90);
  const c1C = circlePoint(90, 90, 56, 35);

  return (
    <section aria-label="Circle Theorems I Visual Summary" className="p-5 sm:p-6 sk-card space-y-4">
      <div>
        <h2 className="font-display text-base font-bold text-[#1D1A4A]">
          Visual Theorem Cards · Circle Theorems I (90° &amp; Symmetry Rules)
        </h2>
        <p className="text-xs text-[#5E588C] mt-0.5">Four visual patterns tested repeatedly on Core &amp; Extended papers.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
          <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Angle in a semicircle is 90 degrees">
            <circle cx="90" cy="82" r="56" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
            <line x1={c1A.x} y1={c1A.y - 8} x2={c1B.x} y2={c1B.y - 8} stroke="#1D1A4A" strokeWidth="2" />
            <polygon points={`${c1A.x},${c1A.y - 8} ${c1B.x},${c1B.y - 8} ${c1C.x},${c1C.y - 8}`} fill="#EDE9FE" fillOpacity="0.65" stroke="#5B57E8" strokeWidth="2" />
            <circle cx="90" cy="82" r="3" fill="#1D1A4A" />
            <text x={c1C.x - 10} y={c1C.y + 12} fontSize="10" fontWeight="800" fill="#C0266B">90°</text>
          </svg>
          <div className="text-xs font-bold text-[#1D1A4A]">Angle in a semicircle = 90°</div>
        </div>

        <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
          <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Radius is perpendicular to tangent">
            <circle cx="85" cy="70" r="50" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
            <line x1="85" y1="70" x2="85" y2="120" stroke="#5B57E8" strokeWidth="2.2" />
            <line x1="22" y1="120" x2="155" y2="120" stroke="#FF5FA8" strokeWidth="2.2" />
            <rect x="85" y="109" width="11" height="11" fill="none" stroke="#1D1A4A" strokeWidth="1.5" />
            <circle cx="85" cy="70" r="3" fill="#1D1A4A" />
            <text x="103" y="114" fontSize="10" fontWeight="800" fill="#C0266B">90°</text>
          </svg>
          <div className="text-xs font-bold text-[#1D1A4A]">Radius ⊥ Tangent = 90°</div>
        </div>

        <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
          <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Two tangents from an external point are equal">
            <circle cx="66" cy="78" r="46" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
            <line x1="86" y1="36" x2="156" y2="78" stroke="#5B57E8" strokeWidth="2.2" />
            <line x1="86" y1="120" x2="156" y2="78" stroke="#5B57E8" strokeWidth="2.2" />
            <line x1="66" y1="78" x2="86" y2="36" stroke="#9B96C2" strokeWidth="1.4" strokeDasharray="3 2" />
            <line x1="66" y1="78" x2="86" y2="120" stroke="#9B96C2" strokeWidth="1.4" strokeDasharray="3 2" />
            <circle cx="156" cy="78" r="3.5" fill="#FF5FA8" />
            <text x="122" y="52" fontSize="9.5" fontWeight="800" fill="#5B57E8">Equal</text>
            <text x="122" y="112" fontSize="9.5" fontWeight="800" fill="#5B57E8">Equal</text>
          </svg>
          <div className="text-xs font-bold text-[#1D1A4A]">External Tangents Equal</div>
        </div>

        <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
          <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Isosceles radius triangle and perpendicular chord bisector">
            <circle cx="90" cy="78" r="52" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
            <line x1="48" y1="108" x2="132" y2="108" stroke="#1D1A4A" strokeWidth="2.2" />
            <line x1="90" y1="78" x2="48" y2="108" stroke="#5B57E8" strokeWidth="2" />
            <line x1="90" y1="78" x2="132" y2="108" stroke="#5B57E8" strokeWidth="2" />
            <line x1="90" y1="78" x2="90" y2="108" stroke="#FF5FA8" strokeWidth="1.6" strokeDasharray="3 2" />
            <circle cx="90" cy="78" r="3" fill="#1D1A4A" />
            <text x="64" y="88" fontSize="9" fontWeight="700" fill="#5B57E8">r</text>
            <text x="112" y="88" fontSize="9" fontWeight="700" fill="#5B57E8">r</text>
            <text x="90" y="122" textAnchor="middle" fontSize="9" fontWeight="700" fill="#C0266B">Bisected at 90°</text>
          </svg>
          <div className="text-xs font-bold text-[#1D1A4A]">Radii Isosceles &amp; Chord Bisector</div>
        </div>
      </div>
    </section>
  );
};

/* 4.8 Circle Theorems II Gallery */
export const CircleTheorems2Gallery: React.FC = () => (
  <section aria-label="Circle Theorems II Visual Summary" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Theorem Cards · Circle Theorems II (Extended)
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">All four Extended angle theorems side-by-side.</p>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Angle at centre is twice angle at circumference">
          <circle cx="90" cy="78" r="52" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
          <polyline points="53,115 90,26 127,115" fill="none" stroke="#5B57E8" strokeWidth="2" />
          <polyline points="53,115 90,78 127,115" fill="none" stroke="#FF5FA8" strokeWidth="2" />
          <circle cx="90" cy="78" r="3" fill="#1D1A4A" />
          <text x="90" y="52" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#5B57E8">θ</text>
          <text x="90" y="102" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#C0266B">2θ</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A]">Centre = 2 × Circumference</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Angles in the same segment are equal">
          <circle cx="90" cy="78" r="52" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
          <line x1="50" y1="112" x2="130" y2="112" stroke="#1D1A4A" strokeWidth="1.8" />
          <polyline points="50,112 65,33 130,112" fill="none" stroke="#5B57E8" strokeWidth="2" />
          <polyline points="50,112 120,36 130,112" fill="none" stroke="#059669" strokeWidth="2" />
          <text x="68" y="54" fontSize="10" fontWeight="800" fill="#5B57E8">x</text>
          <text x="111" y="56" fontSize="10" fontWeight="800" fill="#047857">x</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A]">Same Segment Angles Equal</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Opposite angles in cyclic quadrilateral sum to 180">
          <circle cx="90" cy="78" r="52" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
          <polygon points="58,38 134,50 128,115 46,105" fill="#EDE9FE" fillOpacity="0.6" stroke="#5B57E8" strokeWidth="2" />
          <text x="64" y="55" fontSize="10" fontWeight="800" fill="#5B57E8">α</text>
          <text x="114" y="106" fontSize="10" fontWeight="800" fill="#C0266B">180°−α</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A]">Cyclic Quad: α + β = 180°</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 180 155" className="w-full h-auto" role="img" aria-label="Alternate segment theorem">
          <circle cx="90" cy="72" r="48" fill="#FAF9FF" stroke="#1D1A4A" strokeWidth="1.8" />
          <line x1="25" y1="120" x2="155" y2="120" stroke="#1D1A4A" strokeWidth="2" />
          <polygon points="90,120 135,56 54,40" fill="#FCE7F3" fillOpacity="0.45" stroke="#5B57E8" strokeWidth="2" />
          <text x="114" y="114" fontSize="10.5" fontWeight="800" fill="#C0266B">63°</text>
          <text x="64" y="58" fontSize="10.5" fontWeight="800" fill="#C0266B">63°</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A]">Alternate Segment Theorem</div>
      </div>
    </div>
  </section>
);

/* 5.2 Area & Perimeter */
export const AreaPerimeterIllustration: React.FC = () => (
  <section aria-label="Area and Perpendicular Height Diagrams" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · Always Use Perpendicular Height (<span className="font-mono text-[#FF5FA8]">h</span>)
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">Area multiplies perpendicular height; perimeter adds slanted outer edges.</p>
    </div>
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 200 135" className="w-full h-auto" role="img" aria-label="Triangle area one half base times perpendicular height">
          <polygon points="30,108 170,108 118,28" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="118" y1="28" x2="118" y2="108" stroke="#FF5FA8" strokeWidth="2" strokeDasharray="4 3" />
          <rect x="118" y="98" width="10" height="10" fill="none" stroke="#1D1A4A" strokeWidth="1.4" />
          <text x="100" y="124" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D1A4A">base b</text>
          <text x="125" y="72" fontSize="11" fontWeight="800" fill="#C0266B">h</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Triangle: ½ × b × h</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 200 135" className="w-full h-auto" role="img" aria-label="Parallelogram area base times perpendicular height">
          <polygon points="30,108 140,108 172,30 62,30" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="62" y1="30" x2="62" y2="108" stroke="#FF5FA8" strokeWidth="2" strokeDasharray="4 3" />
          <rect x="62" y="98" width="10" height="10" fill="none" stroke="#1D1A4A" strokeWidth="1.4" />
          <text x="90" y="124" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D1A4A">b</text>
          <text x="69" y="72" fontSize="11" fontWeight="800" fill="#C0266B">h</text>
          <text x="160" y="72" fontSize="9.5" fontWeight="700" fill="#6E6996">slant</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Parallelogram: b × h (not slant!)</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 200 135" className="w-full h-auto" role="img" aria-label="Trapezium area half sum of parallel sides times height">
          <polygon points="28,108 172,108 142,30 64,30" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="64" y1="30" x2="64" y2="108" stroke="#FF5FA8" strokeWidth="2" strokeDasharray="4 3" />
          <rect x="64" y="98" width="10" height="10" fill="none" stroke="#1D1A4A" strokeWidth="1.4" />
          <text x="103" y="23" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D1A4A">a</text>
          <text x="100" y="124" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D1A4A">b</text>
          <text x="70" y="72" fontSize="11" fontWeight="800" fill="#C0266B">h</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Trapezium: ½(a + b)h</div>
      </div>
    </div>
  </section>
);

/* 5.3 Minor vs Major Sectors & Sector Perimeter */
export const SectorIllustration: React.FC = () => (
  <section aria-label="Minor vs Major Sectors and Sector Perimeter" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · Minor vs Major Sector Areas &amp; Sector Perimeter (<span className="font-mono text-[#FF5FA8]">+ 2r</span>)
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">
        Two radii always split a circle into a Minor Sector (<span className="font-mono">&theta; &lt; 180°</span>) and a Major Sector (<span className="font-mono">360° &minus; &theta;</span>). Their areas add up to <span className="font-mono">&pi;r&sup2;</span>.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-5 items-stretch">
      {/* Panel 1: Minor Sector vs Major Sector */}
      <div className="p-3.5 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF] flex flex-col justify-between gap-3">
        <svg viewBox="0 0 320 210" className="w-full h-auto" role="img" aria-label="Circle split into 72 degree minor sector and 288 degree major sector of radius 10 cm">
          <rect x="0" y="0" width="320" height="210" fill="#FAF9FF" rx="10" />
          {/* Major sector (288 deg): clockwise from A(214,106) to B(171.2,47) with O(152,106), R=62 */}
          <path d="M 152 106 L 214 106 A 62 62 0 1 1 171.2 47 Z" fill="#EDE9FE" stroke="none" />
          {/* Minor sector (72 deg): clockwise from B(171.2,47) to A(214,106) */}
          <path d="M 152 106 L 171.2 47 A 62 62 0 0 1 214 106 Z" fill="#FCE7F3" stroke="none" />

          {/* Major arc & Minor arc highlights */}
          <path d="M 214 106 A 62 62 0 1 1 171.2 47" fill="none" stroke="#5B57E8" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 171.2 47 A 62 62 0 0 1 214 106" fill="none" stroke="#FF5FA8" strokeWidth="3.8" strokeLinecap="round" />

          {/* Radii OA and OB */}
          <line x1="152" y1="106" x2="214" y2="106" stroke="#1D1A4A" strokeWidth="2.4" />
          <line x1="152" y1="106" x2="171.2" y2="47" stroke="#1D1A4A" strokeWidth="2.4" />
          <circle cx="152" cy="106" r="3" fill="#1D1A4A" />

          {/* Reflex angle arc (288 deg) & Minor angle arc (72 deg) */}
          <path d="M 167 106 A 15 15 0 1 1 156.6 91.7" fill="none" stroke="#4338CA" strokeWidth="1.7" />
          <path d="M 158.8 85.1 A 22 22 0 0 1 174 106" fill="none" stroke="#C0266B" strokeWidth="1.9" />

          {/* Vertex & radius labels */}
          <text x="142" y="102" fontSize="10.5" fontWeight="800" fill="#1D1A4A">O</text>
          <text x="220" y="110" fontSize="10.5" fontWeight="800" fill="#1D1A4A">A</text>
          <text x="174" y="39" fontSize="10.5" fontWeight="800" fill="#1D1A4A">B</text>
          <text x="186" y="121" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1D1A4A">r = 10 cm</text>

          {/* Angle labels inside sectors */}
          <text x="179" y="96" fontSize="10.5" fontWeight="800" fill="#C0266B">72°</text>
          <text x="125" y="124" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#4338CA">288°</text>

          {/* Outside-left pointer + label for Major Sector */}
          <line x1="78" y1="74" x2="104" y2="88" stroke="#4338CA" strokeWidth="1.4" strokeDasharray="3 2" />
          <text x="45" y="64" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#4338CA">Major Sector</text>
          <text x="45" y="77" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#4338CA">(360° &minus; 72°)</text>

          {/* Outside-right pointer + label for Minor Sector */}
          <line x1="201" y1="75" x2="231" y2="60" stroke="#C0266B" strokeWidth="1.4" strokeDasharray="3 2" />
          <text x="270" y="52" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#C0266B">Minor Sector</text>
          <text x="270" y="65" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#C0266B">(&theta; = 72°)</text>

          {/* Bottom legend strip */}
          <rect x="14" y="183" width="292" height="20" rx="6" fill="#FFFFFF" stroke="#DCDAF0" strokeWidth="1" />
          <text x="160" y="196.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1D1A4A">
            Minor Area + Major Area = 20π + 80π = 100π cm² (Full Circle)
          </text>
        </svg>
        <div className="p-3 sk-card-soft font-mono text-xs space-y-1.5 text-[#393469]">
          <div><span className="text-[#C0266B] font-bold">Minor Area</span> = (72 &divide; 360) &times; &pi;(10&sup2;) = <strong>20&pi; cm&sup2;</strong></div>
          <div><span className="text-[#4338CA] font-bold">Major Area</span> = (288 &divide; 360) &times; &pi;(10&sup2;) = <strong>80&pi; cm&sup2;</strong></div>
          <div className="pt-1 border-t border-[#DCDAF0] text-[#1D1A4A] font-bold">Fast Check: &pi;r&sup2; &minus; Minor = 100&pi; &minus; 20&pi; = 80&pi; cm&sup2;</div>
        </div>
      </div>

      {/* Panel 2: Arc Length vs Sector Perimeter (+ 2r) */}
      <div className="p-3.5 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF] flex flex-col justify-between gap-3">
        <svg viewBox="0 0 320 210" className="w-full h-auto" role="img" aria-label="Circle sector of radius 6 cm and angle 60 degrees">
          <rect x="0" y="0" width="320" height="210" fill="#FAF9FF" rx="10" />
          {/* Ghost full circle */}
          <circle cx="115" cy="148" r="95" fill="none" stroke="#DCDAF0" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Sector wedge 60 degrees */}
          <path d="M 115 148 L 162.5 65.7 A 95 95 0 0 1 210 148 Z" fill="#EDE9FE" stroke="none" />
          <line x1="115" y1="148" x2="162.5" y2="65.7" stroke="#5B57E8" strokeWidth="2.6" />
          <line x1="115" y1="148" x2="210" y2="148" stroke="#5B57E8" strokeWidth="2.6" />
          <path d="M 162.5 65.7 A 95 95 0 0 1 210 148" fill="none" stroke="#FF5FA8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 131 120 A 32 32 0 0 1 147 148" fill="none" stroke="#1D1A4A" strokeWidth="1.6" />
          <text x="148" y="138" fontSize="11" fontWeight="800" fill="#1D1A4A">60°</text>
          <text x="122" y="98" fontSize="10.5" fontWeight="800" fill="#5B57E8">r = 6 cm</text>
          <text x="162" y="164" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#5B57E8">r = 6 cm</text>
          <text x="206" y="96" fontSize="11" fontWeight="800" fill="#C0266B">Arc = 2π cm</text>
        </svg>
        <div className="p-3 sk-card-soft font-mono text-xs space-y-1.5 text-[#393469]">
          <div><span className="text-[#C0266B] font-bold">Curved Arc</span> = (60 &divide; 360) &times; 2&pi;(6) = <strong>2&pi; cm</strong></div>
          <div><span className="text-[#5B57E8] font-bold">Two Straight Radii</span> = 6 + 6 = <strong>12 cm</strong></div>
          <div className="pt-1 border-t border-[#DCDAF0] text-[#1D1A4A] font-bold">Sector Perimeter = Arc + 2r = 2&pi; + 12 cm</div>
        </div>
      </div>
    </div>
  </section>
);

/* 5.4 Surface Area & Volume (Net & Cone r-h-l) */
export const MensurationNetIllustration: React.FC = () => (
  <section aria-label="Cylinder Net and Cone Cross-Section" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · Cylinder Net &amp; Cone Pythagoras Link
      </h2>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 280 160" className="w-full h-auto" role="img" aria-label="Cylinder net rectangle 2 pi r by h plus two circular ends">
          <rect x="0" y="0" width="280" height="160" fill="#FAF9FF" rx="8" />
          <circle cx="140" cy="28" r="20" fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="2" />
          <rect x="52" y="52" width="176" height="56" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2" />
          <circle cx="140" cy="132" r="20" fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="2" />
          <text x="140" y="84" textAnchor="middle" fontSize="11" fontWeight="800" fill="#4338CA">Width = 2πr, Height = h</text>
          <text x="172" y="32" fontSize="10" fontWeight="700" fill="#C0266B">πr²</text>
          <text x="172" y="136" fontSize="10" fontWeight="700" fill="#C0266B">πr²</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Cylinder Total SA = 2πrh + 2πr²</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 280 160" className="w-full h-auto" role="img" aria-label="Cone cross section right triangle r h and slant height l">
          <rect x="0" y="0" width="280" height="160" fill="#FAF9FF" rx="8" />
          <ellipse cx="140" cy="126" rx="64" ry="16" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2" />
          <line x1="76" y1="126" x2="140" y2="24" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="204" y1="126" x2="140" y2="24" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="140" y1="24" x2="140" y2="126" stroke="#FF5FA8" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="140" y1="126" x2="204" y2="126" stroke="#059669" strokeWidth="2" />
          <rect x="140" y="116" width="10" height="10" fill="none" stroke="#1D1A4A" strokeWidth="1.4" />
          <text x="128" y="82" fontSize="11" fontWeight="800" fill="#C0266B">h</text>
          <text x="170" y="122" fontSize="11" fontWeight="800" fill="#047857">r</text>
          <text x="180" y="72" fontSize="11" fontWeight="800" fill="#5B57E8">l (slant)</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Pythagoras in Cone: l² = r² + h²</div>
      </div>
    </div>
  </section>
);

/* 6.3 Exact Trigonometric Triangles */
export const ExactTrigTrianglesIllustration: React.FC = () => (
  <section aria-label="Special Exact Trigonometric Triangles" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · The Two Special Triangles (Non-Calculator)
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">Read sin, cos, and tan straight off these two triangles using SOH CAH TOA.</p>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 260 175" className="w-full h-auto" role="img" aria-label="45-45-90 right isosceles triangle with sides 1, 1, root 2">
          <rect x="0" y="0" width="260" height="175" fill="#FAF9FF" rx="8" />
          <polygon points="58,140 172,140 172,26" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2.2" />
          <rect x="160" y="128" width="12" height="12" fill="none" stroke="#1D1A4A" strokeWidth="1.5" />
          <text x="115" y="158" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">1</text>
          <text x="184" y="88" fontSize="12" fontWeight="800" fill="#1D1A4A">1</text>
          <text x="98" y="76" fontSize="12" fontWeight="800" fill="#C0266B">√2</text>
          <text x="74" y="132" fontSize="10.5" fontWeight="800" fill="#5B57E8">45°</text>
          <text x="148" y="54" fontSize="10.5" fontWeight="800" fill="#5B57E8">45°</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">sin 45° = cos 45° = 1/√2 = √2/2 · tan 45° = 1</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 260 175" className="w-full h-auto" role="img" aria-label="30-60-90 triangle with sides 1, root 3, 2">
          <rect x="0" y="0" width="260" height="175" fill="#FAF9FF" rx="8" />
          <polygon points="54,142 150,142 150,24" fill="#FCE7F3" fillOpacity="0.45" stroke="#FF5FA8" strokeWidth="2.2" />
          <rect x="138" y="130" width="12" height="12" fill="none" stroke="#1D1A4A" strokeWidth="1.5" />
          <text x="102" y="159" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">1</text>
          <text x="160" y="86" fontSize="12" fontWeight="800" fill="#047857">√3</text>
          <text x="86" y="76" fontSize="12" fontWeight="800" fill="#C0266B">2</text>
          <text x="68" y="133" fontSize="10.5" fontWeight="800" fill="#5B57E8">60°</text>
          <text x="128" y="54" fontSize="10.5" fontWeight="800" fill="#5B57E8">30°</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">sin 30° = ½ · cos 30° = √3/2 · tan 60° = √3</div>
      </div>
    </div>
  </section>
);

/* 6.5 Sine vs Cosine Rule + Ambiguous Case */
export const NonRightTrigIllustration: React.FC = () => (
  <section aria-label="Sine Rule versus Cosine Rule and Ambiguous Case" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · Sine Rule vs Cosine Rule &amp; Ambiguous Case
      </h2>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 280 165" className="w-full h-auto" role="img" aria-label="Matched opposite pair for Sine Rule versus SAS for Cosine Rule">
          <rect x="0" y="0" width="280" height="165" fill="#FAF9FF" rx="8" />
          <polygon points="35,126 225,126 155,34" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="155" y1="34" x2="130" y2="126" stroke="#FF5FA8" strokeWidth="1.6" strokeDasharray="4 3" />
          <text x="150" y="54" fontSize="10.5" fontWeight="800" fill="#5B57E8">A</text>
          <text x="130" y="142" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#C0266B">opposite side a</text>
          <text x="78" y="74" fontSize="10.5" fontWeight="700" fill="#1D1A4A">b = 8</text>
          <text x="200" y="74" fontSize="10.5" fontWeight="700" fill="#1D1A4A">c = 11</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Matched pair (A, a) → Sine Rule · No match (SAS/SSS) → Cosine Rule</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 280 165" className="w-full h-auto" role="img" aria-label="Ambiguous case of the Sine Rule giving two valid triangles">
          <rect x="0" y="0" width="280" height="165" fill="#FAF9FF" rx="8" />
          <line x1="32" y1="128" x2="252" y2="128" stroke="#1D1A4A" strokeWidth="2" />
          <line x1="32" y1="128" x2="152" y2="38" stroke="#1D1A4A" strokeWidth="2.2" />
          {/* Two equal swinging sides from apex (152, 38) */}
          <line x1="152" y1="38" x2="215" y2="128" stroke="#5B57E8" strokeWidth="2.2" />
          <line x1="152" y1="38" x2="112" y2="128" stroke="#FF5FA8" strokeWidth="2.2" />
          <path d="M 102 128 A 110 110 0 0 0 225 128" fill="none" stroke="#FF5FA8" strokeWidth="1.4" strokeDasharray="3 3" />
          <text x="58" y="122" fontSize="10" fontWeight="700" fill="#1D1A4A">30°</text>
          <text x="195" y="122" fontSize="10" fontWeight="800" fill="#5B57E8">θ</text>
          <text x="120" y="122" fontSize="10" fontWeight="800" fill="#C0266B">180°−θ</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Ambiguous Case: Both θ and (180° − θ) share the same sin!</div>
      </div>
    </div>
  </section>
);

/* 6.6 3D Pythagoras & Trigonometry in Cuboid */
export const Trigonometry3DIllustration: React.FC = () => (
  <section aria-label="3D Cuboid Space Diagonal and Plane Angle" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagram · Finding the Angle Between Line AG and Base ABCD
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">Drop perpendicular <span className="font-mono font-semibold">GC</span> onto the base, then solve the shaded vertical right triangle <span className="font-mono font-semibold">△ACG</span>.</p>
    </div>
    <div className="grid md:grid-cols-2 gap-5 items-center">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
        <svg viewBox="0 0 360 230" className="w-full h-auto" role="img" aria-label="Isometric cuboid ABCDEFGH highlighting right triangle ACG">
          <rect x="0" y="0" width="360" height="230" fill="#FAF9FF" rx="10" />
          {/* Back hidden edges */}
          <line x1="110" y1="60" x2="110" y2="145" stroke="#B8B3FF" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="110" y1="145" x2="55" y2="185" stroke="#B8B3FF" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="110" y1="145" x2="290" y2="145" stroke="#B8B3FF" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Shaded internal right-triangle A(55,185) -> C(290,145) -> G(290,60) */}
          <polygon points="55,185 290,145 290,60" fill="#EDE9FE" fillOpacity="0.85" stroke="#5B57E8" strokeWidth="2.2" />
          <rect x="278" y="133" width="12" height="12" fill="none" stroke="#1D1A4A" strokeWidth="1.4" />

          {/* Cuboid outer visible wireframe */}
          <polygon points="55,100 235,100 235,185 55,185" fill="none" stroke="#1D1A4A" strokeWidth="2" />
          <polygon points="55,100 110,60 290,60 235,100" fill="none" stroke="#1D1A4A" strokeWidth="2" />
          <polyline points="235,185 290,145 290,60" fill="none" stroke="#1D1A4A" strokeWidth="2" />

          {/* Space diagonal AG */}
          <line x1="55" y1="185" x2="290" y2="60" stroke="#FF5FA8" strokeWidth="2.6" />

          <text x="41" y="191" fontSize="11.5" fontWeight="800" fill="#1D1A4A">A</text>
          <text x="235" y="201" fontSize="11.5" fontWeight="800" fill="#1D1A4A">B</text>
          <text x="297" y="149" fontSize="11.5" fontWeight="800" fill="#1D1A4A">C</text>
          <text x="103" y="138" fontSize="11" fontWeight="700" fill="#6E6996">D</text>
          <text x="297" y="63" fontSize="11.5" fontWeight="800" fill="#C0266B">G</text>

          <text x="145" y="202" fontSize="10.5" fontWeight="700" fill="#1D1A4A">8 cm</text>
          <text x="270" y="176" fontSize="10.5" fontWeight="700" fill="#1D1A4A">6 cm</text>
          <text x="304" y="106" fontSize="10.5" fontWeight="800" fill="#5B57E8">5 cm</text>
          <text x="172" y="164" fontSize="10" fontWeight="800" fill="#5B57E8">AC = 10 cm</text>
          <text x="102" y="177" fontSize="10.5" fontWeight="800" fill="#C0266B">θ = 26.6°</text>
        </svg>
      </div>
      <div className="space-y-2.5 text-sm text-[#393469]">
        <div className="p-3.5 sk-card-soft font-mono text-xs space-y-1.5">
          <div>1. Base diagonal: <strong>AC = √(8² + 6²) = 10 cm</strong></div>
          <div>2. Space diagonal: <strong>AG = √(10² + 5²) = √125 cm</strong></div>
          <div>3. Elevation angle: <strong className="text-[#C0266B]">tan θ = 5 ÷ 10 → θ = 26.6°</strong></div>
        </div>
      </div>
    </div>
  </section>
);
