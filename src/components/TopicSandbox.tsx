import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getGraphPresetForTopic } from '../data/graphPresets';
import type { SandboxType } from '../types/syllabus';
import { GeoGebraGraphTool } from './GeoGebraGraphTool';
import { SakugaSlider } from './SakugaSlider';

interface TopicSandboxProps {
  type: SandboxType;
  topicId?: string;
}

const MoneyConverterSandbox: React.FC = () => {
  const [amount, setAmount] = useState(500);
  const [rate, setRate] = useState(0.92);
  const [commissionPct, setCommissionPct] = useState(2);
  const [direction, setDirection] = useState<'home-to-foreign' | 'foreign-to-home'>('home-to-foreign');
  const [commissionStage, setCommissionStage] = useState<'before' | 'none'>('before');

  const effectivePct = commissionStage === 'before' ? commissionPct : 0;
  const netAmount = amount * (1 - effectivePct / 100);
  const converted = direction === 'home-to-foreign' ? netAmount * rate : netAmount / rate;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div role="group" aria-label="Conversion Direction" className="grid grid-cols-2 gap-1 sk-tabs">
          <button
            type="button"
            data-active={direction === 'home-to-foreign'}
            onClick={() => setDirection('home-to-foreign')}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
          >
            $1 → Rate (Multiply)
          </button>
          <button
            type="button"
            data-active={direction === 'foreign-to-home'}
            onClick={() => setDirection('foreign-to-home')}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
          >
            Rate → $1 (Divide)
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="money-amount" className="font-semibold text-[#1D1A4A]">
              Starting Amount ({direction === 'home-to-foreign' ? 'USD' : 'EUR'})
            </label>
            <span className="font-mono tabular-nums text-[#1D1A4A] font-bold">
              {direction === 'home-to-foreign' ? `$${amount}` : `€${amount}`}
            </span>
          </div>
          <SakugaSlider
            id="money-amount"
            min={50}
            max={2000}
            step={25}
            value={amount}
            onChange={setAmount}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="money-rate" className="font-semibold text-[#1D1A4A]">
              Exchange Rate ($1 USD = r EUR)
            </label>
            <span className="font-mono tabular-nums text-[#1D1A4A] font-bold">{rate.toFixed(2)}</span>
          </div>
          <SakugaSlider
            id="money-rate"
            min={0.5}
            max={2.5}
            step={0.02}
            value={rate}
            onChange={setRate}
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <label htmlFor="money-comm" className="font-semibold text-[#1D1A4A]">
                Bank Commission (%)
              </label>
              <span className="font-mono tabular-nums text-[#1D1A4A] font-bold">
                {effectivePct}%
              </span>
            </div>
            <SakugaSlider
              id="money-comm"
              variant="sakura"
              min={0}
              max={6}
              step={0.5}
              value={commissionPct}
              disabled={commissionStage === 'none'}
              onChange={setCommissionPct}
            />
          </div>
          <button
            type="button"
            onClick={() => setCommissionStage((s) => (s === 'before' ? 'none' : 'before'))}
            className="px-3 py-1.5 text-xs font-semibold sk-btn-subtle cursor-pointer shrink-0"
          >
            {commissionStage === 'before' ? 'Disable Fee' : 'Enable Fee'}
          </button>
        </div>
      </div>

      <div className="p-4 sk-card-soft space-y-3">
        <div className="text-xs font-semibold text-[#5E588C]">Live Step-by-Step Working</div>
        <div className="space-y-2 text-xs font-mono text-[#393469]">
          <div>
            1. Net after {effectivePct}% commission:{' '}
            <span className="font-semibold text-[#1D1A4A]">
              {amount} × {(1 - effectivePct / 100).toFixed(3)} = {netAmount.toFixed(2)}
            </span>
          </div>
          <div>
            2. {direction === 'home-to-foreign' ? 'Multiply by rate' : 'Divide by rate'}:{' '}
            <span className="font-semibold text-[#1D1A4A]">
              {netAmount.toFixed(2)} {direction === 'home-to-foreign' ? '×' : '÷'} {rate.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="pt-2 border-t border-[#DCDAF0] flex items-baseline justify-between">
          <span className="text-xs font-semibold text-[#5E588C]">Converted Total (2 d.p.)</span>
          <span className="font-mono text-xl font-bold tabular-nums text-[#5B57E8]">
            {direction === 'home-to-foreign' ? `€${converted.toFixed(2)}` : `$${converted.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

const TrigTriangleSandbox: React.FC = () => {
  const [opp, setOpp] = useState(6);
  const [adj, setAdj] = useState(8);
  const hyp = Math.sqrt(opp * opp + adj * adj);
  const angleDeg = (Math.atan2(opp, adj) * 180) / Math.PI;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="trig-opp" className="font-semibold text-[#1D1A4A]">Opposite Side (cm)</label>
            <span className="font-mono tabular-nums font-bold text-[#1D1A4A]">{opp} cm</span>
          </div>
          <SakugaSlider
            id="trig-opp"
            min={2}
            max={15}
            step={1}
            value={opp}
            onChange={setOpp}
          />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="trig-adj" className="font-semibold text-[#1D1A4A]">Adjacent Side (cm)</label>
            <span className="font-mono tabular-nums font-bold text-[#1D1A4A]">{adj} cm</span>
          </div>
          <SakugaSlider
            id="trig-adj"
            min={2}
            max={15}
            step={1}
            value={adj}
            onChange={setAdj}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono sk-card-soft p-3">
          <div>Hypotenuse: <strong className="text-[#1D1A4A]">{hyp.toFixed(2)} cm</strong></div>
          <div>Angle θ: <strong className="text-[#5B57E8]">{angleDeg.toFixed(1)}°</strong></div>
          <div>sin θ: <strong className="text-[#1D1A4A]">{(opp / hyp).toFixed(3)}</strong></div>
          <div>cos θ: <strong className="text-[#1D1A4A]">{(adj / hyp).toFixed(3)}</strong></div>
        </div>
      </div>

      <svg
        viewBox="0 0 260 190"
        className="w-full max-w-[280px] mx-auto bg-[#FAF9FF] border-[1.5px] border-[#DCDAF0] rounded-xl"
        role="img"
        aria-label="Right angled triangle trigonometry explorer"
      >
        <polygon
          points={`40,155 ${40 + adj * 11},155 ${40 + adj * 11},${155 - opp * 8}`}
          fill="#EDE9FE"
          stroke="#6D69F2"
          strokeWidth="2.2"
        />
        <rect
          x={40 + adj * 11 - 12}
          y={143}
          width="12"
          height="12"
          fill="none"
          stroke="#1D1A4A"
          strokeWidth="1.5"
        />
        <text x={40 + (adj * 11) / 2} y={173} fontSize="11" textAnchor="middle" fill="#1D1A4A">
          Adj = {adj}
        </text>
        <text
          x={40 + adj * 11 + 8}
          y={155 - (opp * 8) / 2}
          fontSize="11"
          fill="#1D1A4A"
        >
          Opp = {opp}
        </text>
        <text x={58} y={147} fontSize="10" fill="#DB2777" fontWeight="700">
          θ={angleDeg.toFixed(0)}°
        </text>
      </svg>
    </div>
  );
};

const CircleTheoremSandbox: React.FC = () => {
  const [circumAngle, setCircumAngle] = useState(42);
  const centreAngle = circumAngle * 2;
  const cyclicOpp = 180 - circumAngle;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="circle-theta" className="font-semibold text-[#1D1A4A]">
              Circumference Angle θ (degrees)
            </label>
            <span className="font-mono tabular-nums font-bold text-[#5B57E8]">{circumAngle}°</span>
          </div>
          <SakugaSlider
            id="circle-theta"
            min={20}
            max={75}
            step={1}
            value={circumAngle}
            onChange={setCircumAngle}
          />
        </div>
        <div className="space-y-2 text-xs sk-card-soft p-3.5 font-mono">
          <div className="flex justify-between">
            <span className="text-[#5E588C]">Angle at centre (2θ):</span>
            <strong className="text-emerald-700">{centreAngle}°</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5E588C]">Cyclic opposite (180° − θ):</span>
            <strong className="text-[#C0266B]">{cyclicOpp}°</strong>
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 220 200"
        className="w-full max-w-[230px] mx-auto bg-[#FAF9FF] border-[1.5px] border-[#DCDAF0] rounded-xl"
        role="img"
        aria-label="Circle theorem angle at centre demonstration"
      >
        <circle cx="110" cy="100" r="76" fill="white" stroke="#B8B3FF" strokeWidth="1.8" />
        {/* Chord endpoints A, B */}
        <line x1="56" y1="154" x2="110" y2="24" stroke="#6D69F2" strokeWidth="2.2" />
        <line x1="164" y1="154" x2="110" y2="24" stroke="#6D69F2" strokeWidth="2.2" />
        {/* Centre lines */}
        <line x1="56" y1="154" x2="110" y2="100" stroke="#FF5FA8" strokeWidth="2.2" />
        <line x1="164" y1="154" x2="110" y2="100" stroke="#FF5FA8" strokeWidth="2.2" />
        <circle cx="110" cy="100" r="3.5" fill="#1D1A4A" />
        <text x="110" y="54" fontSize="11" textAnchor="middle" fill="#5B57E8" fontWeight="700">
          {circumAngle}°
        </text>
        <text x="110" y="128" fontSize="11" textAnchor="middle" fill="#C0266B" fontWeight="700">
          {centreAngle}°
        </text>
      </svg>
    </div>
  );
};

const CompoundInterestSandbox: React.FC = () => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(6);
  const [mode, setMode] = useState<'growth' | 'decay'>('growth');

  const mult = mode === 'growth' ? 1 + rate / 100 : 1 - rate / 100;
  const finalAmount = principal * Math.pow(mult, years);

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div role="group" aria-label="Growth or Decay" className="grid grid-cols-2 gap-1 sk-tabs">
          <button
            type="button"
            data-active={mode === 'growth'}
            onClick={() => setMode('growth')}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
          >
            Compound Growth (+)
          </button>
          <button
            type="button"
            data-active={mode === 'decay'}
            onClick={() => setMode('decay')}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer sk-tab"
          >
            Depreciation (−)
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="ci-p" className="font-semibold text-[#1D1A4A]">Principal ($)</label>
            <span className="font-mono tabular-nums font-bold">${principal}</span>
          </div>
          <SakugaSlider id="ci-p" min={200} max={5000} step={100} value={principal} onChange={setPrincipal} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="ci-r" className="font-semibold text-[#1D1A4A]">Annual Rate (%)</label>
            <span className="font-mono tabular-nums font-bold">{rate}%</span>
          </div>
          <SakugaSlider id="ci-r" min={1} max={20} step={1} value={rate} onChange={setRate} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="ci-n" className="font-semibold text-[#1D1A4A]">Years (n)</label>
            <span className="font-mono tabular-nums font-bold">{years} yrs</span>
          </div>
          <SakugaSlider id="ci-n" variant="sakura" min={1} max={15} step={1} value={years} onChange={setYears} />
        </div>
      </div>

      <div className="p-4 sk-card-soft space-y-3">
        <div className="text-xs font-mono text-[#393469]">
          Formula: {principal} × ({mult.toFixed(2)})<sup>{years}</sup>
        </div>
        <div className="flex items-baseline justify-between pt-2 border-t border-[#DCDAF0]">
          <span className="text-xs font-semibold text-[#5E588C]">Final Value</span>
          <span className="font-mono text-xl font-bold tabular-nums text-[#5B57E8]">
            ${finalAmount.toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-[#5E588C] font-mono">
          Total change: {finalAmount >= principal ? '+' : ''}${(finalAmount - principal).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const ProbabilityTreeSandbox: React.FC = () => {
  const [red, setRed] = useState(5);
  const [blue, setBlue] = useState(3);
  const [withReplacement, setWithReplacement] = useState(false);

  const total = red + blue;
  const secondTotal = withReplacement ? total : total - 1;
  const pRR = (red / total) * ((withReplacement ? red : Math.max(0, red - 1)) / secondTotal);
  const pDiff = ((red / total) * (blue / secondTotal)) + ((blue / total) * (red / secondTotal));

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="prob-red" className="font-semibold text-[#1D1A4A]">Red Counters</label>
            <span className="font-mono tabular-nums font-bold">{red}</span>
          </div>
          <SakugaSlider id="prob-red" variant="sakura" min={1} max={9} step={1} value={red} onChange={setRed} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="prob-blue" className="font-semibold text-[#1D1A4A]">Blue Counters</label>
            <span className="font-mono tabular-nums font-bold">{blue}</span>
          </div>
          <SakugaSlider id="prob-blue" min={1} max={9} step={1} value={blue} onChange={setBlue} />
        </div>
        <button
          type="button"
          onClick={() => setWithReplacement((w) => !w)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold sk-btn-subtle cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#5B57E8]" />
          Mode: {withReplacement ? 'With Replacement' : 'Without Replacement'}
        </button>
      </div>

      <div className="p-4 sk-card-soft space-y-2.5 text-xs font-mono">
        <div className="text-[#5E588C]">Total counters = {total}</div>
        <div className="flex justify-between">
          <span>P(Both Red):</span>
          <strong className="text-[#1D1A4A]">{pRR.toFixed(4)}</strong>
        </div>
        <div className="flex justify-between">
          <span>P(Different colours):</span>
          <strong className="text-[#5B57E8]">{pDiff.toFixed(4)}</strong>
        </div>
      </div>
    </div>
  );
};

const MensurationSandbox: React.FC = () => {
  const [radius, setRadius] = useState(5);
  const [height, setHeight] = useState(12);
  const slant = Math.sqrt(radius * radius + height * height);
  const cylVol = Math.PI * radius * radius * height;
  const coneVol = cylVol / 3;
  const sphereVol = (4 / 3) * Math.PI * Math.pow(radius, 3);

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="mens-r" className="font-semibold text-[#1D1A4A]">Radius r (cm)</label>
            <span className="font-mono font-bold">{radius} cm</span>
          </div>
          <SakugaSlider id="mens-r" min={2} max={15} step={1} value={radius} onChange={setRadius} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="mens-h" className="font-semibold text-[#1D1A4A]">Vertical Height h (cm)</label>
            <span className="font-mono font-bold">{height} cm</span>
          </div>
          <SakugaSlider id="mens-h" variant="sakura" min={3} max={20} step={1} value={height} onChange={setHeight} />
        </div>
      </div>
      <div className="p-4 sk-card-soft space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <span>Cone slant height l:</span>
          <strong>{slant.toFixed(2)} cm</strong>
        </div>
        <div className="flex justify-between">
          <span>Cylinder Volume:</span>
          <strong>{cylVol.toFixed(1)} cm³ ({radius * radius * height}π)</strong>
        </div>
        <div className="flex justify-between">
          <span>Cone Volume:</span>
          <strong>{coneVol.toFixed(1)} cm³</strong>
        </div>
        <div className="flex justify-between">
          <span>Sphere Volume:</span>
          <strong>{sphereVol.toFixed(1)} cm³</strong>
        </div>
      </div>
    </div>
  );
};

const StandardFormSandbox: React.FC = () => {
  const [coeff, setCoeff] = useState(24);
  const [exp, setExp] = useState(4);

  const value = coeff * Math.pow(10, exp);
  const normExp = value === 0 ? 0 : Math.floor(Math.log10(Math.abs(value)));
  const normA = value / Math.pow(10, normExp);

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="sf-c" className="font-semibold text-[#1D1A4A]">Raw Coefficient</label>
            <span className="font-mono font-bold">{coeff}</span>
          </div>
          <SakugaSlider id="sf-c" min={0.2} max={50} step={0.2} value={coeff} onChange={setCoeff} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="sf-e" className="font-semibold text-[#1D1A4A]">Raw Exponent (n)</label>
            <span className="font-mono font-bold">{exp}</span>
          </div>
          <SakugaSlider id="sf-e" variant="sakura" min={-4} max={8} step={1} value={exp} onChange={setExp} />
        </div>
      </div>
      <div className="p-4 sk-card-soft space-y-2 text-xs font-mono">
        <div>Input: {coeff.toFixed(1)} × 10<sup>{exp}</sup></div>
        <div className="text-[#5B57E8] font-bold text-base">
          Normalised: {normA.toFixed(2)} × 10<sup>{normExp}</sup>
        </div>
        <div className="text-[#5E588C]">Ordinary value: {value.toPrecision(4)}</div>
      </div>
    </div>
  );
};

export const TopicSandbox: React.FC<TopicSandboxProps> = ({ type, topicId }) => {
  if (type === 'none') return null;

  const isGeoGebra =
    type === 'geogebra-graph' || type === 'linear-graph' || type === 'quadratic-solver';
  const graphPreset = isGeoGebra ? getGraphPresetForTopic(topicId) : null;

  const titles: Record<Exclude<SandboxType, 'none'>, string> = {
    'money-converter': 'Interactive Currency & Commission Calculator',
    'percentage-interest': 'Interactive Compound Growth & Depreciation Explorer',
    'linear-graph': graphPreset?.title ?? 'GeoGebra Explorer · Linear Graphs & Gradients',
    'quadratic-solver': graphPreset?.title ?? 'GeoGebra Explorer · Curves, Roots & Intersections',
    'geogebra-graph': graphPreset?.title ?? 'GeoGebra Explorer · Interactive Graph & Geometry',
    'trigonometry-triangle': 'Interactive Right-Angled Triangle Solver',
    'circle-theorems': 'Interactive Circle Theorem Angle Explorer',
    'probability-tree': 'Interactive Two-Stage Probability Simulator',
    'mensuration-3d': 'Interactive 3D Solid Volume & Slant Height Calculator',
    'standard-form': 'Interactive Standard Form Normaliser',
  };

  return (
    <section
      className="p-5 sk-card space-y-4"
      aria-label={titles[type]}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold text-[#1D1A4A]">{titles[type]}</h3>
        <span className="text-xs font-medium text-[#5E588C]">
          {isGeoGebra ? 'GeoGebra Interactive Graph' : 'Interactive Model'}
        </span>
      </div>
      {type === 'money-converter' && <MoneyConverterSandbox />}
      {type === 'percentage-interest' && <CompoundInterestSandbox />}
      {isGeoGebra && <GeoGebraGraphTool topicId={topicId} allowPresetSwitch={true} />}
      {type === 'trigonometry-triangle' && <TrigTriangleSandbox />}
      {type === 'circle-theorems' && <CircleTheoremSandbox />}
      {type === 'probability-tree' && <ProbabilityTreeSandbox />}
      {type === 'mensuration-3d' && <MensurationSandbox />}
      {type === 'standard-form' && <StandardFormSandbox />}
    </section>
  );
};
