import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SubjectCode } from '../types/syllabus';
import { KaTeXFormula } from './MathText';

interface FormulaSheetModalProps {
  open: boolean;
  subject?: SubjectCode;
  onClose: () => void;
}

const GIVEN_FORMULAS_0580 = [
  {
    title: 'Area of a trapezium',
    latex: 'A = \\frac{1}{2}(a + b)h',
    tier: 'Core & Extended',
  },
  {
    title: 'Curved surface area of a cylinder',
    latex: 'A = 2\\pi r h',
    tier: 'Core & Extended',
  },
  {
    title: 'Volume of a prism / cylinder',
    latex: 'V = A_{\\text{cross}} l \\qquad V_{\\text{cyl}} = \\pi r^2 h',
    tier: 'Core & Extended',
  },
  {
    title: 'Curved surface area & volume of a cone',
    latex: 'A = \\pi r l \\qquad V = \\frac{1}{3}\\pi r^2 h',
    tier: 'Core & Extended (2025+)',
  },
  {
    title: 'Surface area & volume of a sphere',
    latex: 'A = 4\\pi r^2 \\qquad V = \\frac{4}{3}\\pi r^3',
    tier: 'Core & Extended (2025+)',
  },
  {
    title: 'Volume of a pyramid',
    latex: 'V = \\frac{1}{3} \\times \\text{base area} \\times h',
    tier: 'Core & Extended (2025+)',
  },
  {
    title: 'Quadratic formula',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    tier: 'Extended (2025+)',
  },
  {
    title: 'Sine rule & Cosine rule',
    latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} \\qquad a^2 = b^2 + c^2 - 2bc\\cos A',
    tier: 'Extended (2025+)',
  },
  {
    title: 'Area of any triangle',
    latex: '\\text{Area} = \\frac{1}{2}ab\\sin C',
    tier: 'Extended (2025+)',
  },
];

const MEMORISED_FORMULAS_0580 = [
  {
    title: 'Compound Interest',
    latex: 'A = P\\left(1 + \\frac{r}{100}\\right)^n',
  },
  {
    title: 'Pythagoras’ Theorem',
    latex: 'a^2 + b^2 = c^2',
  },
  {
    title: 'SOH CAH TOA',
    latex: '\\sin\\theta = \\frac{\\text{O}}{\\text{H}},\\quad \\cos\\theta = \\frac{\\text{A}}{\\text{H}},\\quad \\tan\\theta = \\frac{\\text{O}}{\\text{A}}',
  },
  {
    title: 'Straight-line gradient & distance',
    latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}, \\qquad d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
  },
  {
    title: 'Interior angle sum of an n-gon',
    latex: 'S = (n - 2) \\times 180^\\circ',
  },
  {
    title: 'Frequency Density (Histograms)',
    latex: '\\text{Frequency Density} = \\frac{\\text{Frequency}}{\\text{Class Width}}',
  },
];

const GIVEN_FORMULAS_0606 = [
  {
    title: 'Equation of a circle',
    latex: '(x - a)^2 + (y - b)^2 = r^2',
    tier: 'Ch. 8 · Circle Geometry',
  },
  {
    title: 'Mensuration (Cone, Sphere, Pyramid)',
    latex: 'A_{\\text{cone}} = \\pi r l, \\quad V_{\\text{cone}} = \\frac{1}{3}\\pi r^2 h, \\quad A_{\\text{sphere}} = 4\\pi r^2, \\quad V_{\\text{sphere}} = \\frac{4}{3}\\pi r^3, \\quad V_{\\text{pyr}} = \\frac{1}{3}Ah',
    tier: '2025–2027 Formula Page',
  },
  {
    title: 'Quadratic equations & discriminant',
    latex: 'ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    tier: 'Ch. 2 · Quadratics',
  },
  {
    title: 'Binomial Theorem (positive integer n)',
    latex: '(a + b)^n = a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\dots + \\binom{n}{r}a^{n-r}b^r + \\dots + b^n, \\quad \\binom{n}{r} = \\frac{n!}{(n-r)!r!}',
    tier: 'Ch. 12 · Series',
  },
  {
    title: 'Arithmetic Series (AP)',
    latex: 'u_n = a + (n - 1)d \\qquad S_n = \\frac{1}{2}n\\{2a + (n - 1)d\\}',
    tier: 'Ch. 12 · Series',
  },
  {
    title: 'Geometric Series (GP) & Sum to Infinity',
    latex: 'u_n = ar^{n-1} \\qquad S_n = \\frac{a(1 - r^n)}{1 - r} \\;(r \\neq 1) \\qquad S_\\infty = \\frac{a}{1 - r} \\;(|r| < 1)',
    tier: 'Ch. 12 · Series',
  },
  {
    title: 'Trigonometric Pythagorean Identities',
    latex: '\\sin^2 A + \\cos^2 A = 1 \\qquad \\sec^2 A = 1 + \\tan^2 A \\qquad \\operatorname{cosec}^2 A = 1 + \\cot^2 A',
    tier: 'Ch. 10 · Trigonometry',
  },
  {
    title: 'Triangle Laws (Sine, Cosine & Area)',
    latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} \\qquad a^2 = b^2 + c^2 - 2bc\\cos A \\qquad \\Delta = \\frac{1}{2}ab\\sin C',
    tier: 'Ch. 9 & 10',
  },
];

const MEMORISED_FORMULAS_0606 = [
  {
    title: 'Circular Measure (θ in radians)',
    latex: 's = r\\theta, \\qquad A_{\\text{sector}} = \\frac{1}{2}r^2\\theta, \\qquad \\pi\\text{ rad} = 180^\\circ',
  },
  {
    title: 'Logarithm Laws & Change of Base',
    latex: '\\log_a(xy) = \\log_a x + \\log_a y, \\quad \\log_a\\!\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y, \\quad \\log_a b = \\frac{\\ln b}{\\ln a}',
  },
  {
    title: 'Permutations & Combinations',
    latex: '^nP_r = \\frac{n!}{(n - r)!}, \\qquad ^nC_r = \\binom{n}{r} = \\frac{n!}{(n - r)!r!}',
  },
  {
    title: 'Standard Derivatives (x in radians for trig)',
    latex: '\\frac{d}{dx}(x^n)=nx^{n-1}, \\quad \\frac{d}{dx}(e^{kx})=ke^{kx}, \\quad \\frac{d}{dx}(\\ln x)=\\frac{1}{x}, \\quad \\frac{d}{dx}(\\sin x)=\\cos x, \\quad \\frac{d}{dx}(\\cos x)=-\\sin x, \\quad \\frac{d}{dx}(\\tan x)=\\sec^2 x',
  },
  {
    title: 'Chain, Product & Quotient Rules',
    latex: '\\frac{dy}{dx}=\\frac{dy}{du}\\frac{du}{dx}, \\qquad \\frac{d}{dx}(uv)=u\\frac{dv}{dx}+v\\frac{du}{dx}, \\qquad \\frac{d}{dx}\\!\\left(\\frac{u}{v}\\right)=\\frac{v\\frac{du}{dx}-u\\frac{dv}{dx}}{v^2}',
  },
  {
    title: 'Standard Integrals & Kinematics',
    latex: '\\int (ax+b)^n\\,dx=\\frac{(ax+b)^{n+1}}{a(n+1)}+c \\;(n\\neq -1), \\quad \\int \\frac{1}{ax+b}\\,dx=\\frac{1}{a}\\ln|ax+b|+c, \\quad v=\\frac{ds}{dt}, \\; a=\\frac{dv}{dt}',
  },
  {
    title: 'Unit Vector & Circle Tangent Perpendicularity',
    latex: '\\hat{\\mathbf{v}} = \\frac{\\mathbf{v}}{|\\mathbf{v}|} = \\frac{a\\mathbf{i}+b\\mathbf{j}}{\\sqrt{a^2+b^2}}, \\qquad m_{\\text{radius}} \\times m_{\\text{tangent}} = -1',
  },
  {
    title: 'Completed-Square Circle Form',
    latex: 'x^2 + y^2 + 2gx + 2fy + c = 0 \\implies \\text{Centre } (-g, -f), \\quad r = \\sqrt{g^2 + f^2 - c}',
  },
];

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  open,
  subject = '0580',
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const is0606 = subject === '0606';
  const givenFormulas = is0606 ? GIVEN_FORMULAS_0606 : GIVEN_FORMULAS_0580;
  const memorisedFormulas = is0606 ? MEMORISED_FORMULAS_0606 : MEMORISED_FORMULAS_0580;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--sk-ink)]/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="formula-sheet-title"
    >
      <div className="bg-white border-2 border-[var(--sk-ink)] rounded-[20px] max-w-4xl w-full max-h-[88vh] flex flex-col shadow-[6px_7px_0_var(--sk-soft)]">
        <div className="px-6 py-4 border-b-[1.5px] border-[var(--sk-line)] flex items-center justify-between gap-4">
          <div>
            <h2 id="formula-sheet-title" className="font-display text-lg font-bold text-[var(--sk-ink)]">
              {is0606
                ? 'Cambridge IGCSE Additional Mathematics (0606) Formula Sheet (2025–2027)'
                : 'Cambridge IGCSE 0580 Formula Sheet (2025–2027)'}
            </h2>
            <p className="text-xs text-[var(--sk-dim)] mt-0.5">
              {is0606
                ? 'Official formulae printed on Paper 1 (Non-Calculator) & Paper 2 (Calculator) plus essential calculus, log & circular measure recall'
                : 'Official formulae printed on Papers 1–4 compared with essential memorised formulae'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close formula sheet"
            className="p-2 rounded-xl text-[var(--sk-dim)] hover:text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] border border-transparent hover:border-[var(--sk-line)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          <section>
            <div className="mb-3">
              <h3 className="font-display text-sm font-bold text-[var(--sk-ink)]">
                Provided on the 2025–2027 Examination Formula Page
              </h3>
              <p className="text-xs text-[var(--sk-dim)]">
                {is0606
                  ? 'Printed on Page 2 of both 0606 Paper 1 (Non-Calculator) and Paper 2 (Calculator)'
                  : 'Included inside Papers 1, 2, 3, and 4 for reference during the exam'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {givenFormulas.map((f) => (
                <div key={f.title} className="p-4 sk-card-soft">
                  <div className="flex items-baseline justify-between gap-2 text-xs text-[var(--sk-dim)] mb-2">
                    <span className="font-semibold text-[var(--sk-ink)]">{f.title}</span>
                    <span className="shrink-0">{f.tier}</span>
                  </div>
                  <div className="overflow-x-auto text-[var(--sk-ink)]">
                    <KaTeXFormula latex={f.latex} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h3 className="font-display text-sm font-bold text-[var(--sk-ink)]">
                Must Be Memorised (Not Printed on the Exam Sheet)
              </h3>
              <p className="text-xs text-[var(--sk-dim)]">
                {is0606
                  ? 'Core rules tested without formula-sheet prompts across 0606 Papers 1 & 2'
                  : 'Required by syllabus recall in both Core and Extended tiers'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {memorisedFormulas.map((f) => (
                <div
                  key={f.title}
                  className="p-4 rounded-xl border-[1.5px] border-[var(--sk-line)] bg-white"
                >
                  <div className="text-xs font-semibold text-[var(--sk-ink)] mb-2">{f.title}</div>
                  <div className="overflow-x-auto text-[var(--sk-ink)]">
                    <KaTeXFormula latex={f.latex} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
