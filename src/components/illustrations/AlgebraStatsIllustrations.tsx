import React, { useState } from 'react';
import { MathText } from '../MathText';
import { computeHistogramBins } from '../../utils/topicDiagrams';

/* 1.2 Sets & Venn Diagrams */
type VennRegion = 'both' | 'union' | 'only-a' | 'neither';

export const SetsVennIllustration: React.FC = () => {
  const [region, setRegion] = useState<VennRegion>('both');

  return (
    <section aria-label="Sets and Venn Diagram Explorer" className="p-5 sm:p-6 sk-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#1D1A4A]">
            Visual Notebook Explorer · Venn Diagram Regions &amp; Cardinality
          </h2>
          <p className="text-xs text-[#5E588C] mt-0.5">
            Select a set expression to highlight its exact region and count (<MathText text={'$n(\\mathscr{E}) = 30$'} />).
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 sk-tabs" role="tablist">
          {(
            [
              { id: 'both', label: 'F ∩ S (8)' },
              { id: 'union', label: 'F ∪ S (25)' },
              { id: 'only-a', label: "F ∩ S' (10)" },
              { id: 'neither', label: "(F ∪ S)' (5)" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={region === item.id}
              data-active={region === item.id}
              onClick={() => setRegion(item.id)}
              className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-center">
        <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
          <svg viewBox="0 0 340 210" className="w-full h-auto" role="img" aria-label="Two-set Venn diagram with French and Spanish counts">
            <defs>
              <clipPath id="clip-F">
                <circle cx="132" cy="108" r="64" />
              </clipPath>
              <clipPath id="clip-S">
                <circle cx="208" cy="108" r="64" />
              </clipPath>
            </defs>
            <rect
              x="16"
              y="18"
              width="308"
              height="176"
              rx="10"
              fill={region === 'neither' ? '#FCE7F3' : '#FAF9FF'}
              stroke="#1D1A4A"
              strokeWidth="2.2"
            />
            <text x="26" y="38" fontSize="13" fontWeight="800" fill="#1D1A4A">ℰ (30)</text>

            {/* Union background fill when neither is active to punch out interior */}
            <circle cx="132" cy="108" r="64" fill={region === 'union' || region === 'only-a' ? '#DDD6FE' : '#FFFFFF'} />
            <circle cx="208" cy="108" r="64" fill={region === 'union' ? '#DDD6FE' : '#FFFFFF'} />

            {/* Intersection highlight */}
            {(region === 'both' || region === 'union') && (
              <circle cx="208" cy="108" r="64" clipPath="url(#clip-F)" fill="#FF5FA8" fillOpacity={region === 'both' ? 0.38 : 0.25} />
            )}

            {/* Outlines */}
            <circle cx="132" cy="108" r="64" fill="none" stroke="#5B57E8" strokeWidth="2.4" />
            <circle cx="208" cy="108" r="64" fill="none" stroke="#FF5FA8" strokeWidth="2.4" />

            <text x="86" y="50" fontSize="12" fontWeight="800" fill="#4338CA">F (18)</text>
            <text x="234" y="50" fontSize="12" fontWeight="800" fill="#BE185D">S (15)</text>

            <text x="104" y="114" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1D1A4A">10</text>
            <text x="170" y="114" textAnchor="middle" fontSize="16" fontWeight="800" fill="#C0266B">8</text>
            <text x="236" y="114" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1D1A4A">7</text>
            <text x="296" y="176" textAnchor="end" fontSize="14" fontWeight="800" fill="#5E588C">5</text>
          </svg>
        </div>

        <div className="space-y-3 text-sm text-[#393469]">
          <div className="font-display font-bold text-[#1D1A4A]">Fill From the Centre Outwards</div>
          <ul className="space-y-2 list-disc pl-5 leading-relaxed">
            <li><MathText text={'Intersection $F \\cap S = 8$ goes inside the overlap first.'} /></li>
            <li><MathText text={'Only $F$: $18 - 8 = 10$. Only $S$: $15 - 8 = 7$.'} /></li>
            <li><MathText text={'Total check: $10 + 8 + 7 + 5 = 30 = n(\\mathscr{E})$.'} /></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

/* 7.4 Vector Geometry */
export const VectorGeometryIllustration: React.FC = () => (
  <section aria-label="Triangle Law Vector Geometry Diagram" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagram · Vector Paths &amp; Ratio Point <span className="font-mono text-[#FF5FA8]">AM : MB = 1 : 2</span>
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">To travel from O to M, follow known base arrows: go O → A, then ⅓ of the way along A → B.</p>
    </div>
    <div className="grid md:grid-cols-2 gap-5 items-center">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
        <svg viewBox="0 0 360 225" className="w-full h-auto" role="img" aria-label="Triangle OAB with ratio point M one third along AB">
          <rect x="0" y="0" width="360" height="225" fill="#FAF9FF" rx="10" />
          {/* O=(50,185), A=(140,42), B=(310,165) -> M = A + 1/3(B-A) = (196.7, 83) */}
          <line x1="50" y1="185" x2="140" y2="42" stroke="#5B57E8" strokeWidth="2.6" />
          <line x1="50" y1="185" x2="310" y2="165" stroke="#059669" strokeWidth="2.6" />
          <line x1="140" y1="42" x2="310" y2="165" stroke="#1D1A4A" strokeWidth="2.2" />
          <line x1="50" y1="185" x2="197" y2="83" stroke="#FF5FA8" strokeWidth="2.6" strokeDasharray="5 3" />

          {/* Arrow mid-ticks */}
          <polygon points="99,107 90,113 98,119" fill="#5B57E8" />
          <polygon points="190,174 180,170 181,180" fill="#059669" />
          <polygon points="232,108 221,105 225,97" fill="#1D1A4A" />

          <circle cx="50" cy="185" r="4" fill="#1D1A4A" />
          <circle cx="140" cy="42" r="4" fill="#5B57E8" />
          <circle cx="310" cy="165" r="4" fill="#059669" />
          <circle cx="197" cy="83" r="4.5" fill="#FF5FA8" stroke="#1D1A4A" strokeWidth="1.5" />

          <text x="34" y="191" fontSize="12" fontWeight="800" fill="#1D1A4A">O</text>
          <text x="136" y="30" fontSize="12" fontWeight="800" fill="#4338CA">A</text>
          <text x="319" y="170" fontSize="12" fontWeight="800" fill="#047857">B</text>
          <text x="206" y="76" fontSize="12" fontWeight="800" fill="#C0266B">M (1:2)</text>

          <text x="76" y="108" fontSize="12" fontWeight="800" fill="#5B57E8">a</text>
          <text x="180" y="196" fontSize="12" fontWeight="800" fill="#047857">b</text>
          <text x="235" y="96" fontSize="10.5" fontWeight="800" fill="#1D1A4A">AB = −a + b</text>
          <text x="112" y="150" fontSize="10.5" fontWeight="800" fill="#C0266B">OM = ⅔a + ⅓b</text>
        </svg>
      </div>
      <div className="space-y-2.5 text-sm text-[#393469]">
        <div className="p-3.5 sk-card-soft font-mono text-xs space-y-1.5">
          <div>Total ratio parts = <strong>1 + 2 = 3</strong></div>
          <div><MathText text={'$\\vec{AB} = \\vec{AO} + \\vec{OB} = -\\mathbf{a} + \\mathbf{b}$'} /></div>
          <div><MathText text={'$\\vec{OM} = \\mathbf{a} + \\frac{1}{3}(-\\mathbf{a} + \\mathbf{b}) = \\frac{2}{3}\\mathbf{a} + \\frac{1}{3}\\mathbf{b}$'} /></div>
        </div>
      </div>
    </div>
  </section>
);

/* 8.3 Probability Tree Diagram */
export const ProbabilityTreeDiagramIllustration: React.FC = () => (
  <section aria-label="Two-Stage Probability Tree Diagram Without Replacement" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagram · Probability Tree Without Replacement (<span className="font-mono text-[#FF5FA8]">5 Red, 3 Blue</span>)
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">Multiply ALONG qualifying branches, then ADD path probabilities down.</p>
    </div>
    <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF] overflow-x-auto">
      <svg viewBox="0 0 600 220" className="w-full min-w-[480px] h-auto" role="img" aria-label="Two-stage probability tree diagram for 5 red and 3 blue counters without replacement">
        <rect x="0" y="0" width="600" height="220" fill="#FAF9FF" rx="10" />
        {/* 1st draw */}
        <line x1="40" y1="110" x2="185" y2="55" stroke="#FF5FA8" strokeWidth="2.2" />
        <line x1="40" y1="110" x2="185" y2="165" stroke="#5B57E8" strokeWidth="2.2" />
        <text x="106" y="70" fontSize="11" fontWeight="800" fill="#C0266B">5/8</text>
        <text x="106" y="156" fontSize="11" fontWeight="800" fill="#4338CA">3/8</text>
        <circle cx="195" cy="55" r="12" fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="2" />
        <text x="195" y="59" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C0266B">R</text>
        <circle cx="195" cy="165" r="12" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2" />
        <text x="195" y="169" textAnchor="middle" fontSize="11" fontWeight="800" fill="#4338CA">B</text>

        {/* 2nd draw */}
        <line x1="208" y1="55" x2="365" y2="30" stroke="#9B96C2" strokeWidth="1.8" />
        <line x1="208" y1="55" x2="365" y2="85" stroke="#059669" strokeWidth="2.4" />
        <line x1="208" y1="165" x2="365" y2="135" stroke="#059669" strokeWidth="2.4" />
        <line x1="208" y1="165" x2="365" y2="190" stroke="#9B96C2" strokeWidth="1.8" />

        <text x="282" y="34" fontSize="10.5" fontWeight="700" fill="#6E6996">4/7</text>
        <text x="282" y="82" fontSize="10.5" fontWeight="800" fill="#047857">3/7 ✓</text>
        <text x="282" y="142" fontSize="10.5" fontWeight="800" fill="#047857">5/7 ✓</text>
        <text x="282" y="188" fontSize="10.5" fontWeight="700" fill="#6E6996">2/7</text>

        {/* End outcomes */}
        <text x="378" y="34" fontSize="11" fontWeight="700" fill="#6E6996">RR : (5/8 × 4/7) = 20/56</text>
        <text x="378" y="89" fontSize="11" fontWeight="800" fill="#047857">RB : (5/8 × 3/7) = 15/56</text>
        <text x="378" y="139" fontSize="11" fontWeight="800" fill="#047857">BR : (3/8 × 5/7) = 15/56</text>
        <text x="378" y="194" fontSize="11" fontWeight="700" fill="#6E6996">BB : (3/8 × 2/7) = 6/56</text>
      </svg>
    </div>
  </section>
);

/* 8.4 Conditional Probability Restricted Sample Space */
export const ConditionalProbIllustration: React.FC = () => (
  <section aria-label="Conditional Probability Restricted Venn Diagram" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagram · "Given That R" Shrinks the Denominator to <span className="font-mono text-[#5B57E8]">n(R) = 18</span>
      </h2>
    </div>
    <div className="grid md:grid-cols-2 gap-5 items-center">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
        <svg viewBox="0 0 340 195" className="w-full h-auto" role="img" aria-label="Conditional probability restricting universe to runners R=18 with overlap 6">
          <defs>
            <clipPath id="clip-cond-R">
              <circle cx="132" cy="98" r="60" />
            </clipPath>
          </defs>
          <rect x="14" y="14" width="312" height="168" rx="10" fill="#F8F7FC" stroke="#DCDAF0" strokeWidth="1.8" strokeDasharray="4 3" />
          <text x="24" y="34" fontSize="11.5" fontWeight="700" fill="#9B96C2">ℰ (30 ignored)</text>
          {/* Shaded new universe R */}
          <circle cx="132" cy="98" r="60" fill="#EDE9FE" stroke="#5B57E8" strokeWidth="2.6" />
          <circle cx="208" cy="98" r="60" clipPath="url(#clip-cond-R)" fill="#FF5FA8" fillOpacity="0.4" />
          <circle cx="208" cy="98" r="60" fill="none" stroke="#9B96C2" strokeWidth="1.8" strokeDasharray="4 3" />
          <text x="86" y="48" fontSize="11.5" fontWeight="800" fill="#4338CA">R (18)</text>
          <text x="236" y="48" fontSize="11.5" fontWeight="700" fill="#9B96C2">S (12)</text>
          <text x="104" y="104" textAnchor="middle" fontSize="15" fontWeight="800" fill="#4338CA">12</text>
          <text x="170" y="104" textAnchor="middle" fontSize="15" fontWeight="800" fill="#C0266B">6</text>
          <text x="236" y="104" textAnchor="middle" fontSize="14" fontWeight="700" fill="#9B96C2">6</text>
        </svg>
      </div>
      <div className="p-3.5 sk-card-soft font-mono text-xs space-y-2">
        <div className="text-[#5E588C]">Find P(Swim | Run):</div>
        <div className="text-sm font-bold text-[#1D1A4A]">New denominator = n(R) = 12 + 6 = 18</div>
        <div className="text-sm font-bold text-[#C0266B]">P(S | R) = 6 / 18 = 1 / 3</div>
      </div>
    </div>
  </section>
);

/* 9.3 Mean, Median & Mode Across Every Chart */
export const AveragesAcrossChartsIllustration: React.FC = () => (
  <section aria-label="Finding Mean, Median and Mode in Every Chart" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Guide · Finding Mean, Median &amp; Mode in Every Chart
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">
        Every chart hides the same frequencies <span className="font-mono font-semibold">f</span> — read <span className="font-mono font-semibold">f</span> first (height, angle, or bar area), then apply the exact average rule.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-3.5">
      {/* Panel 1: Bar Chart */}
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 240 165" className="w-full h-auto" role="img" aria-label="Bar chart showing Mode at tallest bar, Median at cumulative midpoint, Mean via sum of x times frequency">
          <rect x="0" y="0" width="240" height="165" fill="#FAF9FF" rx="8" />
          <line x1="30" y1="120" x2="222" y2="120" stroke="#1D1A4A" strokeWidth="1.8" />
          <line x1="30" y1="22" x2="30" y2="120" stroke="#1D1A4A" strokeWidth="1.8" />
          {[
            { xVal: '0', f: 3, bx: 42, fill: '#EDE9FE' },
            { xVal: '1', f: 6, bx: 76, fill: '#EDE9FE' },
            { xVal: '2', f: 8, bx: 110, fill: '#FCE7F3' },
            { xVal: '3', f: 5, bx: 144, fill: '#EDE9FE' },
            { xVal: '4', f: 3, bx: 178, fill: '#EDE9FE' },
          ].map((bar) => {
            const h = bar.f * 10;
            const y = 120 - h;
            const isMode = bar.xVal === '2';
            return (
              <g key={bar.xVal}>
                <rect x={bar.bx} y={y} width="24" height={h} fill={bar.fill} stroke={isMode ? '#C0266B' : '#1D1A4A'} strokeWidth="1.8" rx="3" />
                <text x={bar.bx + 12} y={y - 4} textAnchor="middle" fontSize="9" fontWeight="800" fill={isMode ? '#C0266B' : '#1D1A4A'}>{bar.f}</text>
                <text x={bar.bx + 12} y="133" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#5E588C">{bar.xVal}</text>
              </g>
            );
          })}
          <text x="122" y="20" textAnchor="middle" fontSize="9" fontWeight="800" fill="#C0266B">Mode = 2 (tallest)</text>
          <text x="120" y="152" textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#393469">Med: 13th = 2 · Mean: 49÷25 = 1.96</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Bar Chart / Frequency Graph</div>
      </div>

      {/* Panel 2: Pie Chart */}
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 240 165" className="w-full h-auto" role="img" aria-label="Pie chart showing Mode as widest angle 144 degrees, Median at 180 degree cumulative split, Mean weighted by angle over 360">
          <rect x="0" y="0" width="240" height="165" fill="#FAF9FF" rx="8" />
          {/* Total 360 deg: 0 goals=72°, 1 goal=144°, 2 goals=108°, 3 goals=36° */}
          {/* 0..72 deg */}
          <path d="M 68 76 L 68 28 A 48 48 0 0 1 113.65 61.17 Z" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="1.8" />
          {/* 72..216 deg (144 deg mode!) */}
          <path d="M 68 76 L 113.65 61.17 A 48 48 0 0 1 39.79 114.83 Z" fill="#FCE7F3" stroke="#C0266B" strokeWidth="2" />
          {/* 216..324 deg (108 deg) */}
          <path d="M 68 76 L 39.79 114.83 A 48 48 0 0 1 39.79 37.17 Z" fill="#DBEAFE" stroke="#1D1A4A" strokeWidth="1.8" />
          {/* 324..360 deg (36 deg) */}
          <path d="M 68 76 L 39.79 37.17 A 48 48 0 0 1 68 28 Z" fill="#D1FAE5" stroke="#1D1A4A" strokeWidth="1.8" />
          {/* 180 deg cumulative line straight down */}
          <line x1="68" y1="22" x2="68" y2="128" stroke="#5B57E8" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="128" y="42" fontSize="9.5" fontWeight="800" fill="#C0266B">Mode = widest θ (144°)</text>
          <text x="128" y="64" fontSize="9.2" fontWeight="700" fill="#5B57E8">Median = 180° mark</text>
          <text x="128" y="84" fontSize="9" fontWeight="700" fill="#1D1A4A">f = (θ ÷ 360°) × N</text>
          <text x="128" y="104" fontSize="9" fontWeight="700" fill="#393469">Mean = Σ(x·θ) ÷ 360°</text>
          <text x="120" y="152" textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#393469">Works even if total N is unknown!</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Pie Chart (Angles = Weights)</div>
      </div>

      {/* Panel 3: Histogram */}
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 240 165" className="w-full h-auto" role="img" aria-label="Histogram showing frequency equals bar area, median splits total area in half, mean uses midpoints">
          <rect x="0" y="0" width="240" height="165" fill="#FAF9FF" rx="8" />
          <line x1="28" y1="120" x2="220" y2="120" stroke="#1D1A4A" strokeWidth="1.8" />
          <line x1="28" y1="24" x2="28" y2="120" stroke="#1D1A4A" strokeWidth="1.8" />
          {/* 0-10 (f=12, FD=1.2), 10-20 (f=28, FD=2.8), 20-40 (f=40, FD=2.0) */}
          <rect x="36" y="84" width="42" height="36" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="1.8" />
          <rect x="78" y="36" width="42" height="84" fill="#FCE7F3" stroke="#C0266B" strokeWidth="1.8" />
          <rect x="120" y="60" width="84" height="60" fill="#DBEAFE" stroke="#1D1A4A" strokeWidth="1.8" />
          {/* 50% Area median line at x=20 (px=120) */}
          <line x1="120" y1="24" x2="120" y2="126" stroke="#059669" strokeWidth="2" strokeDasharray="4 2" />
          <text x="57" y="106" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#4338CA">A=12</text>
          <text x="99" y="76" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#C0266B">A=28</text>
          <text x="162" y="92" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#1D4ED8">A=40</text>
          <text x="120" y="20" textAnchor="middle" fontSize="8.8" fontWeight="800" fill="#059669">50% Area = Median (20)</text>
          <text x="36" y="133" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#5E588C">0</text>
          <text x="78" y="133" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#5E588C">10</text>
          <text x="120" y="133" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#059669">20</text>
          <text x="204" y="133" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#5E588C">40</text>
          <text x="120" y="152" textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#393469">Freq = Area · Mean ≈ Σ(A·mid)÷80 = 21</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Histogram (Unequal Widths)</div>
      </div>
    </div>
  </section>
);

/* 9.4 Pie Chart, Frequency Polygon & Stem-and-Leaf */
export const ChartsIllustration: React.FC = () => (
  <section aria-label="Pie Chart and Frequency Polygon Visuals" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · Pie Sectors &amp; Frequency Polygons (Midpoints!)
      </h2>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 260 165" className="w-full h-auto" role="img" aria-label="Pie chart showing 48 degree Cycling sector out of 360 degrees">
          <rect x="0" y="0" width="260" height="165" fill="#FAF9FF" rx="8" />
          <circle cx="95" cy="82" r="58" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2" />
          {/* 48 degree sector from top (0°) clockwise */}
          <path d="M 95 82 L 95 24 A 58 58 0 0 1 138.1 43.2 Z" fill="#FF5FA8" fillOpacity="0.65" stroke="#1D1A4A" strokeWidth="2" />
          <text x="108" y="64" fontSize="9.5" fontWeight="800" fill="#1D1A4A">48°</text>
          <text x="168" y="68" fontSize="10.5" fontWeight="800" fill="#C0266B">Cycling: 48°</text>
          <text x="168" y="84" fontSize="10" fontWeight="700" fill="#393469">= (48/360) × 180</text>
          <text x="168" y="100" fontSize="10.5" fontWeight="800" fill="#5B57E8">= 24 commuters</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Sector Angle = (Freq ÷ Total) × 360°</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
        <svg viewBox="0 0 260 165" className="w-full h-auto" role="img" aria-label="Frequency polygon plotted at class midpoints">
          <rect x="0" y="0" width="260" height="165" fill="#FAF9FF" rx="8" />
          <line x1="35" y1="132" x2="240" y2="132" stroke="#1D1A4A" strokeWidth="1.8" />
          <line x1="35" y1="20" x2="35" y2="132" stroke="#1D1A4A" strokeWidth="1.8" />
          {/* Midpoints at x=60, 105, 150, 195 */}
          <polyline points="60,104 105,62 150,42 195,92" fill="none" stroke="#5B57E8" strokeWidth="2.4" />
          {[
            [60, 104, '5'],
            [105, 62, '15'],
            [150, 42, '25'],
            [195, 92, '35'],
          ].map(([cx, cy, lbl]) => (
            <g key={String(lbl)}>
              <line x1={Number(cx)} y1={Number(cy)} x2={Number(cx)} y2="132" stroke="#DCDAF0" strokeWidth="1.2" strokeDasharray="3 2" />
              <circle cx={Number(cx)} cy={Number(cy)} r="4" fill="#FF5FA8" stroke="#1D1A4A" strokeWidth="1.4" />
              <text x={Number(cx)} y="146" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#5E588C">{lbl}</text>
            </g>
          ))}
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Frequency Polygon: Plot at Class Midpoints</div>
      </div>
    </div>

    {/* Dedicated Stem-and-Leaf + Back-to-Back visual panel */}
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 320 175" className="w-full h-auto" role="img" aria-label="Ordered stem-and-leaf diagram with Key 2 bar 3 equals 23, Mode 25, Median 26.5, Mean 28">
          <rect x="0" y="0" width="320" height="175" fill="#FAF9FF" rx="8" />
          <text x="14" y="20" fontSize="10.5" fontWeight="800" fill="#1D1A4A">Ordered Stem-and-Leaf (n = 12)</text>
          <rect x="202" y="8" width="106" height="22" rx="6" fill="#FFF5FA" stroke="#FF5FA8" strokeWidth="1.5" />
          <text x="255" y="22.5" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#C0266B">Key: 2 | 3 = 23</text>

          {/* Header & divider line */}
          <text x="38" y="42" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#5B57E8">Stem</text>
          <text x="122" y="42" fontSize="9.5" fontWeight="800" fill="#5B57E8">Leaves (ordered ascending →)</text>
          <line x1="60" y1="32" x2="60" y2="128" stroke="#1D1A4A" strokeWidth="2" />
          <line x1="16" y1="47" x2="296" y2="47" stroke="#DCDAF0" strokeWidth="1.2" />

          {/* Rows */}
          <text x="38" y="66" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">1</text>
          <text x="76" y="66" fontSize="12" fontWeight="700" fill="#393469" fontFamily="monospace">4   7   9</text>

          <text x="38" y="86" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">2</text>
          {/* Highlight 5, 5 (Mode=25) and midpoint between 5 and 8 (Median=26.5) */}
          <rect x="94" y="74" width="38" height="16" rx="4" fill="#FCE7F3" stroke="#FF5FA8" strokeWidth="1.2" />
          <text x="76" y="86" fontSize="12" fontWeight="800" fill="#1D1A4A" fontFamily="monospace">3   5   5   8</text>

          <text x="38" y="106" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">3</text>
          <text x="76" y="106" fontSize="12" fontWeight="700" fill="#393469" fontFamily="monospace">0   2   6</text>

          <text x="38" y="124" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">4</text>
          <text x="76" y="124" fontSize="12" fontWeight="700" fill="#393469" fontFamily="monospace">1   6</text>

          {/* Bottom summary strip */}
          <rect x="14" y="136" width="292" height="30" rx="6" fill="#F4F3FC" stroke="#8F8DF7" strokeWidth="1.2" />
          <text x="160" y="149" textAnchor="middle" fontSize="9.2" fontWeight="800" fill="#C0266B">Mode = 25 (NOT 5!) · Median = ½(25+28) = 26.5</text>
          <text x="160" y="161" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1D1A4A">Range = 46 − 14 = 32 · Mean = 336 ÷ 12 = 28</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Single Stem-and-Leaf: Read Stem + Leaf Together</div>
      </div>

      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1.5">
        <svg viewBox="0 0 320 175" className="w-full h-auto" role="img" aria-label="Back-to-back stem-and-leaf diagram comparing Class A on the left and Class B on the right">
          <rect x="0" y="0" width="320" height="175" fill="#FAF9FF" rx="8" />
          <text x="14" y="20" fontSize="10.5" fontWeight="800" fill="#1D1A4A">Back-to-Back Stem-and-Leaf</text>
          <text x="306" y="20" textAnchor="end" fontSize="9" fontWeight="800" fill="#5B57E8">Key: 4 | 2 | 1 → A=24, B=21</text>

          <text x="74" y="42" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#C0266B">← Class A (outward)</text>
          <text x="160" y="42" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1D1A4A">Stem</text>
          <text x="246" y="42" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#059669">Class B (outward) →</text>

          <line x1="142" y1="32" x2="142" y2="128" stroke="#1D1A4A" strokeWidth="2" />
          <line x1="178" y1="32" x2="178" y2="128" stroke="#1D1A4A" strokeWidth="2" />
          <line x1="14" y1="47" x2="306" y2="47" stroke="#DCDAF0" strokeWidth="1.2" />

          <text x="132" y="68" textAnchor="end" fontSize="12" fontWeight="700" fill="#C0266B" fontFamily="monospace">8   5</text>
          <text x="160" y="68" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">1</text>
          <text x="188" y="68" textAnchor="start" fontSize="12" fontWeight="700" fill="#059669" fontFamily="monospace">2   7</text>

          <text x="132" y="92" textAnchor="end" fontSize="12" fontWeight="700" fill="#C0266B" fontFamily="monospace">9   4   1</text>
          <text x="160" y="92" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">2</text>
          <text x="188" y="92" textAnchor="start" fontSize="12" fontWeight="700" fill="#059669" fontFamily="monospace">1   5   8</text>

          <text x="132" y="116" textAnchor="end" fontSize="12" fontWeight="700" fill="#C0266B" fontFamily="monospace">3</text>
          <text x="160" y="116" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1D1A4A">3</text>
          <text x="188" y="116" textAnchor="start" fontSize="12" fontWeight="700" fill="#059669" fontFamily="monospace">0   4   6</text>

          <rect x="14" y="136" width="292" height="30" rx="6" fill="#FFF5FA" stroke="#FF5FA8" strokeWidth="1.2" />
          <text x="160" y="149" textAnchor="middle" fontSize="9" fontWeight="800" fill="#C0266B">Left side ascends RIGHT-TO-LEFT: 15, 18, 21, 24, 29, 33</text>
          <text x="160" y="161" textAnchor="middle" fontSize="9" fontWeight="700" fill="#047857">Right side ascends LEFT-TO-RIGHT: 12, 17, 21, 25, 28, 30, 34, 36</text>
        </svg>
        <div className="text-xs font-bold text-[#1D1A4A] text-center">Back-to-Back Stem-and-Leaf: Read Outward From Centre</div>
      </div>
    </div>
  </section>
);

/* 9.5 Scatter Diagrams */
export const ScatterCorrelationIllustration: React.FC = () => (
  <section aria-label="Scatter Diagram Correlation Types" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagrams · Positive, Negative &amp; Zero Correlation
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">Draw your line of best fit straight through the mean point <span className="font-mono font-semibold">(x̄, ȳ)</span>.</p>
    </div>
    <div className="grid sm:grid-cols-3 gap-3.5">
      {[
        {
          title: 'Positive Correlation',
          line: [32, 112, 162, 32] as const,
          pts: [[40, 108], [58, 92], [75, 86], [96, 70], [118, 60], [136, 46], [154, 38]] as const,
          color: '#5B57E8',
        },
        {
          title: 'Negative Correlation',
          line: [32, 34, 162, 112] as const,
          pts: [[40, 42], [60, 48], [76, 62], [98, 72], [116, 88], [138, 98], [154, 110]] as const,
          color: '#FF5FA8',
        },
        {
          title: 'No / Zero Correlation',
          line: null,
          pts: [[44, 42], [58, 106], [78, 56], [96, 94], [112, 38], [134, 104], [152, 66]] as const,
          color: '#6E6996',
        },
      ].map((panel) => (
        <div key={panel.title} className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[14px] shadow-[2px_3px_0_#B8B3FF] space-y-1">
          <svg viewBox="0 0 190 135" className="w-full h-auto" role="img" aria-label={panel.title}>
            <line x1="25" y1="118" x2="175" y2="118" stroke="#1D1A4A" strokeWidth="1.6" />
            <line x1="25" y1="18" x2="25" y2="118" stroke="#1D1A4A" strokeWidth="1.6" />
            {panel.line && (
              <line x1={panel.line[0]} y1={panel.line[1]} x2={panel.line[2]} y2={panel.line[3]} stroke={panel.color} strokeWidth="2.2" />
            )}
            {panel.pts.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3.4" fill={panel.color} />
            ))}
          </svg>
          <div className="text-xs font-bold text-[#1D1A4A] text-center">{panel.title}</div>
        </div>
      ))}
    </div>
  </section>
);

/* 9.6 Cumulative Frequency Ogive + Box Plot */
export const CumulativeFreqBoxIllustration: React.FC = () => (
  <section aria-label="Cumulative Frequency S-Curve and Box-and-Whisker Plot" className="p-5 sm:p-6 sk-card space-y-4">
    <div>
      <h2 className="font-display text-base font-bold text-[#1D1A4A]">
        Visual Notebook Diagram · Cumulative Frequency Curve (<span className="font-mono text-[#5B57E8]">N = 80</span>) &amp; Box Plot
      </h2>
      <p className="text-xs text-[#5E588C] mt-0.5">Plot at UPPER class bounds, then read <span className="font-mono font-semibold">Q₁ (N/4), Median (N/2), Q₃ (3N/4)</span>.</p>
    </div>
    <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
      <svg viewBox="0 0 540 300" className="w-full h-auto" role="img" aria-label="Aligned cumulative frequency ogive and box-and-whisker plot">
        <rect x="0" y="0" width="540" height="300" fill="#FAF9FF" rx="10" />
        {/* Top Ogive axes */}
        <line x1="65" y1="175" x2="495" y2="175" stroke="#1D1A4A" strokeWidth="1.8" />
        <line x1="65" y1="22" x2="65" y2="175" stroke="#1D1A4A" strokeWidth="1.8" />
        <text x="18" y="102" fontSize="10" fontWeight="700" fill="#1D1A4A" transform="rotate(-90 18 102)" textAnchor="middle">
          Cum. Freq
        </text>
        <text x="488" y="190" fontSize="9.5" fontWeight="700" fill="#5E588C" textAnchor="end">
          Score
        </text>

        {/* Smooth S-curve passing EXACTLY through (65,175), Q1(233,140), Med(297,105), Q3(349,70), and (465,35) */}
        <path
          d="M 65 175 C 145 173, 198 158, 233 140 C 261 126, 280 116, 297 105 C 316 93, 333 81, 349 70 C 379 50, 415 37, 465 35"
          fill="none"
          stroke="#5B57E8"
          strokeWidth="2.8"
        />

        {/* Q1=42 (x=233, CF=20 y=140), Median=58 (x=297, CF=40 y=105), Q3=71 (x=349, CF=60 y=70) */}
        {[
          { label: 'Q₁=42', cfLabel: '20 (¼N)', x: 233, y: 140, color: '#059669' },
          { label: 'Med=58', cfLabel: '40 (½N)', x: 297, y: 105, color: '#C0266B' },
          { label: 'Q₃=71', cfLabel: '60 (¾N)', x: 349, y: 70, color: '#5B57E8' },
        ].map((q) => (
          <g key={q.label}>
            <line x1="65" y1={q.y} x2={q.x} y2={q.y} stroke={q.color} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1={q.x} y1={q.y} x2={q.x} y2="255" stroke={q.color} strokeWidth="1.4" strokeDasharray="4 3" />
            <circle cx={q.x} cy={q.y} r="4" fill={q.color} stroke="#FFFFFF" strokeWidth="1" />
            <text x="59" y={q.y + 3} textAnchor="end" fontSize="9.5" fontWeight="700" fill={q.color}>{q.cfLabel}</text>
            <text x={q.x} y="280" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={q.color}>{q.label}</text>
          </g>
        ))}

        {/* Box-and-Whisker Plot aligned underneath (Min=15 -> x=125, Max=95 -> x=445) */}
        <line x1="125" y1="227" x2="125" y2="251" stroke="#1D1A4A" strokeWidth="2" />
        <line x1="125" y1="239" x2="233" y2="239" stroke="#1D1A4A" strokeWidth="2" />
        <rect x="233" y="223" width="116" height="32" fill="#EDE9FE" stroke="#1D1A4A" strokeWidth="2.2" />
        <line x1="297" y1="223" x2="297" y2="255" stroke="#FF5FA8" strokeWidth="2.8" />
        <line x1="349" y1="239" x2="445" y2="239" stroke="#1D1A4A" strokeWidth="2" />
        <line x1="445" y1="227" x2="445" y2="251" stroke="#1D1A4A" strokeWidth="2" />
        <text x="125" y="280" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5E588C">Min</text>
        <text x="445" y="280" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5E588C">Max</text>
        <text x="291" y="214" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1D1A4A">IQR = Q₃ − Q₁ = 29 (middle 50%)</text>
      </svg>
    </div>
  </section>
);

/* 9.7 Histograms (Frequency Density) */
export const HistogramIllustration: React.FC = () => {
  const bins = computeHistogramBins([
    { start: 0, end: 10, frequency: 12 },
    { start: 10, end: 15, frequency: 15 },
    { start: 15, end: 35, frequency: 48 },
    { start: 35, end: 55, frequency: 24 },
  ]);

  const x0 = 58;
  const y0 = 186;
  const pxPerUnitX = 7.6; // 0..55 -> 418 px
  const pxPerFdY = 44; // 0..3.4 -> ~150 px

  return (
    <section aria-label="Unequal-Width Histogram with Frequency Density" className="p-5 sm:p-6 sk-card space-y-4">
      <div>
        <h2 className="font-display text-base font-bold text-[#1D1A4A]">
          Visual Notebook Diagram · Histogram (<span className="font-mono text-[#FF5FA8]">Bar Area = Frequency</span>)
        </h2>
        <p className="text-xs text-[#5E588C] mt-0.5">Unequal class widths require Frequency Density on the vertical axis (<span className="font-mono font-semibold">FD = Freq ÷ Width</span>).</p>
      </div>
      <div className="p-3 bg-white border-2 border-[#1D1A4A] rounded-[16px] shadow-[3px_4px_0_#B8B3FF]">
        <svg viewBox="0 0 510 225" className="w-full h-auto" role="img" aria-label="Unequal width histogram with frequency density on vertical axis">
          <rect x="0" y="0" width="510" height="225" fill="#FAF9FF" rx="10" />
          {/* Horizontal gridlines at FD = 1, 2, 3 */}
          {[1, 2, 3].map((fd) => {
            const gy = y0 - fd * pxPerFdY;
            return (
              <g key={fd}>
                <line x1={x0} y1={gy} x2="490" y2={gy} stroke="#ECEAF8" strokeWidth="1" />
                <text x={x0 - 8} y={gy + 3} textAnchor="end" fontSize="9.5" fontWeight="700" fill="#5E588C">{fd}.0</text>
              </g>
            );
          })}
          {/* Bars */}
          {bins.map((b, idx) => {
            const bx = x0 + b.start * pxPerUnitX;
            const bw = b.width * pxPerUnitX;
            const bh = b.frequencyDensity * pxPerFdY;
            const by = y0 - bh;
            const highlight = idx === 2;
            return (
              <g key={b.label}>
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={bh}
                  fill={highlight ? '#FCE7F3' : '#EDE9FE'}
                  stroke="#1D1A4A"
                  strokeWidth="2"
                />
                <text x={bx + bw / 2} y={by + 16} textAnchor="middle" fontSize="9.5" fontWeight="800" fill={highlight ? '#C0266B' : '#4338CA'}>
                  f = {b.frequency}
                </text>
                <text x={bx + bw / 2} y={by - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1D1A4A">
                  FD {b.frequencyDensity}
                </text>
                <text x={bx} y={y0 + 15} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#5E588C">{b.start}</text>
              </g>
            );
          })}
          <text x={x0 + 55 * pxPerUnitX} y={y0 + 15} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#5E588C">55</text>
          <line x1={x0} y1={y0} x2="490" y2={y0} stroke="#1D1A4A" strokeWidth="2" />
          <line x1={x0} y1="22" x2={x0} y2={y0} stroke="#1D1A4A" strokeWidth="2" />
          <text x="16" y="105" fontSize="10" fontWeight="800" fill="#1D1A4A" transform="rotate(-90 16 105)" textAnchor="middle">
            Frequency Density
          </text>
        </svg>
      </div>
    </section>
  );
};
