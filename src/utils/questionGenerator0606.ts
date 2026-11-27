import type { PracticeQuestion } from '../types/syllabus';
import { PRACTICE_QUESTION_BANK_0606 } from '../data/practiceBank0606';

export type MockPaperMode0606 =
  | 'mock-0606-p1'
  | 'mock-0606-p2'
  | 'mock-0606-full'
  | 'topical';

export interface MockGenerationOptions0606 {
  mode: MockPaperMode0606;
  attemptNumber: number;
  chapterId?: number | 'all';
  topicId?: string;
  avoidSignatures?: Set<string>;
}

export interface GeneratedQuestionResult0606 {
  questions: PracticeQuestion[];
  signatures: string[];
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function shuffle<T>(rng: () => number, items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildUniqueMcqOptions(
  rng: () => number,
  correct: string,
  candidates: string[]
): string[] {
  const unique: string[] = [correct];
  for (const c of candidates) {
    if (c && !unique.includes(c)) {
      unique.push(c);
    }
    if (unique.length === 4) break;
  }
  let guard = 1;
  while (unique.length < 4) {
    const fallback = `${correct} + ${guard}`;
    if (!unique.includes(fallback)) unique.push(fallback);
    guard += 1;
  }
  return shuffle(rng, unique);
}

interface GeneratedTemplateItem {
  signature: string;
  question: PracticeQuestion;
}

interface TemplateDef0606 {
  key: string;
  chapterId: number;
  topicId: string;
  paperType: 'Non-Calculator' | 'Calculator';
  build: (rng: () => number, idSuffix: string) => GeneratedTemplateItem;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formatFrac(num: number, den: number): string {
  const sign = num * den < 0 ? '-' : '';
  const g = gcd(num, den);
  const n = Math.abs(num) / g;
  const d = Math.abs(den) / g;
  return d === 1 ? `${sign}${n}` : `${sign}${n}/${d}`;
}

const TEMPLATES_0606: TemplateDef0606[] = [
  // Ch 1: Composite & Inverse Function (Non-Calc Numeric)
  {
    key: '0606-ch1-composite',
    chapterId: 1,
    topicId: '1.3',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = randInt(rng, 2, 5);
      const b = randInt(rng, 1, 6);
      const c = randInt(rng, 2, 4);
      const x0 = randInt(rng, 2, 5);
      const gx = x0 * x0 - c;
      const ans = a * gx + b;
      return {
        signature: `0606-1.3:${a}:${b}:${c}:${x0}`,
        question: {
          id: `gen-0606-1.3-${idSuffix}`,
          chapterId: 1,
          topicId: '1.3',
          topicTitle: 'Composite functions & domain matching',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 1.3',
          question: `Given $f(x) = ${a}x + ${b}$ and $g(x) = x^2 - ${c}$ for $x \\in \\mathbb{R}$, evaluate $fg(${x0})$.`,
          questionType: 'numeric',
          correctAnswer: String(ans),
          numericAnswer: ans,
          tolerance: 0,
          markScheme: [
            { code: 'B1', detail: `$g(${x0}) = ${x0}^2 - ${c} = ${gx}$` },
            { code: 'A1', detail: `$f(${gx}) = ${a}(${gx}) + ${b} = ${ans}$` },
          ],
          fullSolution: `First evaluate the inner function $g(${x0}) = ${x0}^2 - ${c} = ${gx}$, then apply $f$: $f(${gx}) = ${a}(${gx}) + ${b} = ${ans}$.`,
        },
      };
    },
  },

  // Ch 2: Completing the square minimum value (Non-Calc Numeric)
  {
    key: '0606-ch2-complete-sq',
    chapterId: 2,
    topicId: '2.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [2, 3, 4]);
      const p = randInt(rng, 2, 5);
      const q = randInt(rng, 3, 12);
      const b = -2 * a * p;
      const c = a * p * p + q;
      return {
        signature: `0606-2.1:${a}:${p}:${q}`,
        question: {
          id: `gen-0606-2.1-${idSuffix}`,
          chapterId: 2,
          topicId: '2.1',
          topicTitle: 'Completing the square & turning points',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 3,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 2.1',
          question: `Express $${a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + ${c}$ in the form $a(x - p)^2 + q$ and state its minimum value.`,
          questionType: 'numeric',
          correctAnswer: String(q),
          numericAnswer: q,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `$${a}(x^2 - ${2 * p}x) + ${c}$` },
            { code: 'M1', detail: `$${a}(x - ${p})^2 - ${a * p * p} + ${c} = ${a}(x - ${p})^2 + ${q}$` },
            { code: 'A1', detail: `Minimum value is $${q}$` },
          ],
          fullSolution: `$${a}[(x - ${p})^2 - ${p * p}] + ${c} = ${a}(x - ${p})^2 + ${q}$. Because $(x - ${p})^2 \\ge 0$, the minimum value is $${q}$.`,
        },
      };
    },
  },

  // Ch 3: Remainder Theorem (Non-Calc Numeric)
  {
    key: '0606-ch3-remainder',
    chapterId: 3,
    topicId: '3.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [1, 2, 3]);
      const r = pick(rng, [-2, 2, 3]);
      const k = randInt(rng, 2, 7);
      const constTerm = randInt(rng, -5, 9);
      const rem = a * r * r * r - 2 * r * r + k * r + constTerm;
      return {
        signature: `0606-3.1:${a}:${r}:${k}:${constTerm}`,
        question: {
          id: `gen-0606-3.1-${idSuffix}`,
          chapterId: 3,
          topicId: '3.1',
          topicTitle: 'Remainder theorem & factor theorem',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 3.1',
          question: `Find the remainder when $f(x) = ${a === 1 ? '' : a}x^3 - 2x^2 + ${k}x ${constTerm >= 0 ? '+' : '-'} ${Math.abs(constTerm)}$ is divided by $(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})$.`,
          questionType: 'numeric',
          correctAnswer: String(rem),
          numericAnswer: rem,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Substitute $x = ${r}$ into $f(x)$` },
            { code: 'A1', detail: `$f(${r}) = ${rem}$` },
          ],
          fullSolution: `By the Remainder Theorem, the remainder is $f(${r}) = ${a}(${r})^3 - 2(${r})^2 + ${k}(${r}) ${constTerm >= 0 ? '+' : '-'} ${Math.abs(constTerm)} = ${rem}$.`,
        },
      };
    },
  },

  // Ch 4: Modulus Equation (Non-Calc Numeric)
  {
    key: '0606-ch4-modulus',
    chapterId: 4,
    topicId: '4.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [2, 3, 4]);
      const xPos = randInt(rng, 4, 10);
      const rhs = randInt(rng, 5, 13);
      const b = a * xPos - rhs;
      return {
        signature: `0606-4.1:${a}:${b}:${rhs}`,
        question: {
          id: `gen-0606-4.1-${idSuffix}`,
          chapterId: 4,
          topicId: '4.1',
          topicTitle: 'Solving modulus equations',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 4.1',
          question: `Find the larger solution to the modulus equation $|${a}x ${b >= 0 ? '-' : '+'} ${Math.abs(b)}| = ${rhs}$.`,
          questionType: 'numeric',
          correctAnswer: String(xPos),
          numericAnswer: xPos,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Solve $${a}x ${b >= 0 ? '-' : '+'} ${Math.abs(b)} = \\pm ${rhs}$` },
            { code: 'A1', detail: `Larger root is $x = ${xPos}$` },
          ],
          fullSolution: `The two linear cases give $${a}x = ${b} + ${rhs} \\implies x = ${xPos}$ and $${a}x = ${b} - ${rhs}$, so the larger solution is $${xPos}$.`,
        },
      };
    },
  },

  // Ch 5: Simultaneous Equations (Non-Calc Numeric)
  {
    key: '0606-ch5-simul',
    chapterId: 5,
    topicId: '5.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const x1 = randInt(rng, 2, 5);
      const m = pick(rng, [1, 2]);
      const c = randInt(rng, 1, 4);
      const y1 = m * x1 + c;
      const rhs = x1 * x1 + y1 * y1;
      return {
        signature: `0606-5.1:${m}:${c}:${x1}`,
        question: {
          id: `gen-0606-5.1-${idSuffix}`,
          chapterId: 5,
          topicId: '5.1',
          topicTitle: 'Solving linear & non-linear simultaneous equations',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 4,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 5.1',
          question: `Solve the simultaneous equations $y = ${m === 1 ? '' : m}x + ${c}$ and $x^2 + y^2 = ${rhs}$. Enter the positive value of $x$.`,
          questionType: 'numeric',
          correctAnswer: String(x1),
          numericAnswer: x1,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Substitute $y = ${m === 1 ? '' : m}x + ${c}$ into $x^2 + y^2 = ${rhs}$` },
            { code: 'M1', detail: 'Simplify to a quadratic in $x$ and factorise' },
            { code: 'A1', detail: `Obtain $x = ${x1}$ as a root` },
            { code: 'A1', detail: `Select positive value $x = ${x1}$` },
          ],
          fullSolution: `Substituting $y = ${m === 1 ? '' : m}x + ${c}$ into $x^2 + y^2 = ${rhs}$ gives a quadratic whose positive root is $x = ${x1}$ (giving $y = ${y1}$).`,
        },
      };
    },
  },

  // Ch 6: Laws of Logarithms (Non-Calc Numeric)
  {
    key: '0606-ch6-log-eval',
    chapterId: 6,
    topicId: '6.2',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const base = pick(rng, [2, 3, 5]);
      const p = randInt(rng, 2, 4);
      const target = Math.pow(base, p);
      const shift = randInt(rng, 2, 9);
      const xAns = target - shift;
      return {
        signature: `0606-6.2:${base}:${p}:${shift}`,
        question: {
          id: `gen-0606-6.2-${idSuffix}`,
          chapterId: 6,
          topicId: '6.2',
          topicTitle: 'Laws of logarithms & change of base',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 6.2',
          question: `Solve the equation $\\log_{${base}}(x + ${shift}) = ${p}$.`,
          questionType: 'numeric',
          correctAnswer: String(xAns),
          numericAnswer: xAns,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Rewrite in exponential form: $x + ${shift} = ${base}^{${p}} = ${target}$` },
            { code: 'A1', detail: `$x = ${target} - ${shift} = ${xAns}$` },
          ],
          fullSolution: `Converting from log form gives $x + ${shift} = ${base}^{${p}} = ${target} \\implies x = ${xAns}$.`,
        },
      };
    },
  },

  // Ch 6: Exponential equation a^x = b (Calc Numeric)
  {
    key: '0606-ch6-exp-calc',
    chapterId: 6,
    topicId: '6.3',
    paperType: 'Calculator',
    build: (rng, idSuffix) => {
      const base = pick(rng, [2, 3, 4, 5, 7]);
      const rhs = pick(rng, [45, 75, 120, 250, 480]);
      const exact = Math.log(rhs) / Math.log(base);
      const ans = Number(exact.toPrecision(3));
      return {
        signature: `0606-6.3:${base}:${rhs}`,
        question: {
          id: `gen-0606-6.3-${idSuffix}`,
          chapterId: 6,
          topicId: '6.3',
          topicTitle: 'Solving exponential equations aˣ = b',
          tier: 'Extended',
          paperType: 'Calculator',
          marks: 2,
          sourceRef: '0606 Paper 2 Calc · Topic 6.3',
          question: `Solve $${base}^x = ${rhs}$, giving your answer correct to $3$ significant figures.`,
          questionType: 'numeric',
          correctAnswer: String(ans),
          numericAnswer: exact,
          tolerance: 0.02,
          markScheme: [
            { code: 'M1', detail: `Take logs: $x = \\frac{\\ln ${rhs}}{\\ln ${base}}$` },
            { code: 'A1', detail: `$x \\approx ${ans}$` },
          ],
          fullSolution: `Taking natural logarithms: $x\\ln ${base} = \\ln ${rhs} \\implies x = \\frac{\\ln ${rhs}}{\\ln ${base}} \\approx ${ans}$.`,
        },
      };
    },
  },

  // Ch 7: Linear Law (Calc Numeric)
  {
    key: '0606-ch7-linear-law',
    chapterId: 7,
    topicId: '7.2',
    paperType: 'Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [2, 3, 4, 5]);
      const n = pick(rng, [1.5, 2.5, 3, -0.5]);
      const x1 = 1;
      const x2 = 3;
      const lnA = Number(Math.log(a).toFixed(3));
      const y1 = (n * x1 + lnA).toFixed(3);
      const y2 = (n * x2 + lnA).toFixed(3);
      return {
        signature: `0606-7.2:${a}:${n}`,
        question: {
          id: `gen-0606-7.2-${idSuffix}`,
          chapterId: 7,
          topicId: '7.2',
          topicTitle: 'Transforming non-linear equations to straight-line form',
          tier: 'Extended',
          paperType: 'Calculator',
          marks: 3,
          sourceRef: '0606 Paper 2 Calc · Topic 7.2',
          question: `Variables $x$ and $y$ satisfy $y = A x^n$. Plotting $\\ln y$ against $\\ln x$ gives a line passing through $(${x1}, ${y1})$ and $(${x2}, ${y2})$. Find the value of $n$.`,
          questionType: 'numeric',
          correctAnswer: String(n),
          numericAnswer: n,
          tolerance: 0.02,
          markScheme: [
            { code: 'M1', detail: '$\\ln y = n\\ln x + \\ln A$, so gradient equals $n$' },
            { code: 'M1', detail: `Compute $\\frac{\\Delta Y}{\\Delta X}$ across $(${x1}, ${y1})$ and $(${x2}, ${y2})$` },
            { code: 'A1', detail: `$n = ${n}$` },
          ],
          fullSolution: `Linearising gives $\\ln y = n\\ln x + \\ln A$. Hence $n = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${n}$.`,
        },
      };
    },
  },

  // Ch 8: Circle centre & radius (Non-Calc Numeric)
  {
    key: '0606-ch8-circle-radius',
    chapterId: 8,
    topicId: '8.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = randInt(rng, 2, 6);
      const b = randInt(rng, 1, 5);
      const r = pick(rng, [4, 5, 6, 7, 8]);
      const twoG = -2 * a;
      const twoF = 2 * b;
      const c = a * a + b * b - r * r;
      return {
        signature: `0606-8.1:${a}:${b}:${r}`,
        question: {
          id: `gen-0606-8.1-${idSuffix}`,
          chapterId: 8,
          topicId: '8.1',
          topicTitle: 'Equation of a circle, centre & radius',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 3,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 8.1',
          question: `A circle has equation $x^2 + y^2 ${twoG < 0 ? '-' : '+'} ${Math.abs(twoG)}x + ${twoF}y ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0$. Find its radius.`,
          questionType: 'numeric',
          correctAnswer: String(r),
          numericAnswer: r,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Complete square: $(x - ${a})^2 - ${a * a} + (y + ${b})^2 - ${b * b} ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0$` },
            { code: 'A1', detail: `$(x - ${a})^2 + (y + ${b})^2 = ${r * r}$` },
            { code: 'A1', detail: `Radius $r = ${r}$` },
          ],
          fullSolution: `Completing the square produces $(x - ${a})^2 + (y + ${b})^2 = ${r * r}$, so the centre is $(${a}, -${b})$ and the radius is $\\sqrt{${r * r}} = ${r}$.`,
        },
      };
    },
  },

  // Ch 8: Circle MCQ (Non-Calc MCQ)
  {
    key: '0606-ch8-circle-mcq',
    chapterId: 8,
    topicId: '8.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const h = randInt(rng, 2, 6);
      const k = randInt(rng, 1, 5);
      const r = pick(rng, [3, 4, 5, 7]);
      const correct = `Centre $(${h}, -${k})$, radius $${r}$`;
      const options = buildUniqueMcqOptions(rng, correct, [
        `Centre $(-${h}, ${k})$, radius $${r}$`,
        `Centre $(${h}, -${k})$, radius $${r * r}$`,
        `Centre $(${h}, ${k})$, radius $${r}$`,
      ]);
      return {
        signature: `0606-8.1-mcq:${h}:${k}:${r}`,
        question: {
          id: `gen-0606-8.1-mcq-${idSuffix}`,
          chapterId: 8,
          topicId: '8.1',
          topicTitle: 'Equation of a circle, centre & radius',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 8.1',
          question: `State the centre and radius of the circle $(x - ${h})^2 + (y + ${k})^2 = ${r * r}$.`,
          questionType: 'mcq',
          options,
          correctAnswer: correct,
          markScheme: [
            { code: 'B1', detail: `Centre $(${h}, -${k})$` },
            { code: 'B1', detail: `Radius $\\sqrt{${r * r}} = ${r}$` },
          ],
          fullSolution: `Comparing directly with $(x - a)^2 + (y - b)^2 = r^2$ gives centre $(${h}, -${k})$ and radius $r = \\sqrt{${r * r}} = ${r}$.`,
        },
      };
    },
  },

  // Ch 9: Circular Measure Sector Area (Calc Numeric)
  {
    key: '0606-ch9-sector-area',
    chapterId: 9,
    topicId: '9.2',
    paperType: 'Calculator',
    build: (rng, idSuffix) => {
      const r = pick(rng, [6, 8, 10, 12, 14]);
      const theta = pick(rng, [0.8, 1.1, 1.25, 1.4, 1.6]);
      const area = Number((0.5 * r * r * theta).toFixed(2));
      return {
        signature: `0606-9.2:${r}:${theta}`,
        question: {
          id: `gen-0606-9.2-${idSuffix}`,
          chapterId: 9,
          topicId: '9.2',
          topicTitle: 'Sector area, segments & compound circular regions',
          tier: 'Extended',
          paperType: 'Calculator',
          marks: 2,
          sourceRef: '0606 Paper 2 Calc · Topic 9.2',
          question: `A sector of a circle of radius $${r}\\text{ cm}$ subtends an angle of $${theta}\\text{ rad}$ at the centre. Calculate the area of the sector in $\\text{cm}^2$.`,
          questionType: 'numeric',
          correctAnswer: String(area),
          numericAnswer: area,
          tolerance: 0.05,
          unit: 'cm²',
          markScheme: [
            { code: 'M1', detail: `$A = \\frac{1}{2}r^2\\theta = \\frac{1}{2}(${r}^2)(${theta})$` },
            { code: 'A1', detail: `$${area}\\text{ cm}^2$` },
          ],
          fullSolution: `Using the radian sector formula: $A = \\frac{1}{2}(${r}^2)(${theta}) = ${area}\\text{ cm}^2$.`,
        },
      };
    },
  },

  // Ch 10: Trig Amplitude & Period (Non-Calc MCQ)
  {
    key: '0606-ch10-amp-period-mcq',
    chapterId: 10,
    topicId: '10.2',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = randInt(rng, 2, 6);
      const b = pick(rng, [2, 3, 4]);
      const c = randInt(rng, 1, 5);
      const periodDeg = Math.round(360 / b);
      const correct = `Amplitude $${a}$, period $${periodDeg}^\\circ$`;
      const options = buildUniqueMcqOptions(rng, correct, [
        `Amplitude $${a + c}$, period $${periodDeg}^\\circ$`,
        `Amplitude $${a}$, period $${360 * b}^\\circ$`,
        `Amplitude $${b}$, period $${Math.round(180 / b)}^\\circ$`,
      ]);
      return {
        signature: `0606-10.2-mcq:${a}:${b}:${c}`,
        question: {
          id: `gen-0606-10.2-mcq-${idSuffix}`,
          chapterId: 10,
          topicId: '10.2',
          topicTitle: 'Trigonometric graphs, amplitude, period & asymptotes',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 10.2',
          question: `State the amplitude and period (in degrees) of the function $y = ${a}\\cos(${b}x) + ${c}$.`,
          questionType: 'mcq',
          options,
          correctAnswer: correct,
          markScheme: [
            { code: 'B1', detail: `Amplitude is $|a| = ${a}$ (independent of $+${c}$)` },
            { code: 'B1', detail: `Period $= \\frac{360^\\circ}{${b}} = ${periodDeg}^\\circ$` },
          ],
          fullSolution: `For $y = a\\cos(bx) + c$, amplitude $= |a| = ${a}$ and period $= \\frac{360^\\circ}{b} = \\frac{360^\\circ}{${b}} = ${periodDeg}^\\circ$.`,
        },
      };
    },
  },

  // Ch 11: Permutations & Combinations (Non-Calc Numeric)
  {
    key: '0606-ch11-comb',
    chapterId: 11,
    topicId: '11.2',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const n1 = pick(rng, [4, 5, 6]);
      const n2 = pick(rng, [3, 4, 5]);
      const comb = (n: number, r: number) => {
        let num = 1;
        let den = 1;
        for (let i = 0; i < r; i += 1) {
          num *= n - i;
          den *= i + 1;
        }
        return num / den;
      };
      const ans = comb(n1, 2) * comb(n2, 2);
      return {
        signature: `0606-11.2:${n1}:${n2}`,
        question: {
          id: `gen-0606-11.2-${idSuffix}`,
          chapterId: 11,
          topicId: '11.2',
          topicTitle: 'Combinations (ⁿCᵣ) & restricted selections',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 11.2',
          question: `A quiz team of $4$ students is selected from $${n1}$ chemists and $${n2}$ physicists. How many teams contain exactly $2$ chemists and $2$ physicists?`,
          questionType: 'numeric',
          correctAnswer: String(ans),
          numericAnswer: ans,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Multiply selections: $^{${n1}}C_2 \\times {}^{${n2}}C_2$` },
            { code: 'A1', detail: `$${comb(n1, 2)} \\times ${comb(n2, 2)} = ${ans}$` },
          ],
          fullSolution: `Choose $2$ chemists in $^{${n1}}C_2 = ${comb(n1, 2)}$ ways and $2$ physicists in $^{${n2}}C_2 = ${comb(n2, 2)}$ ways. Total $= ${ans}$.`,
        },
      };
    },
  },

  // Ch 12: Binomial Coefficient (Non-Calc Numeric)
  {
    key: '0606-ch12-binomial',
    chapterId: 12,
    topicId: '12.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const n = pick(rng, [5, 6, 7]);
      const b = pick(rng, [2, 3]);
      const r = 2;
      const nCr = (n * (n - 1)) / 2;
      const coeff = nCr * b * b;
      return {
        signature: `0606-12.1:${n}:${b}`,
        question: {
          id: `gen-0606-12.1-${idSuffix}`,
          chapterId: 12,
          topicId: '12.1',
          topicTitle: 'Binomial theorem for (a + b)ⁿ',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 12.1',
          question: `Find the coefficient of $x^2$ in the expansion of $(1 + ${b}x)^{${n}}$.`,
          questionType: 'numeric',
          correctAnswer: String(coeff),
          numericAnswer: coeff,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `$\\binom{${n}}{${r}} (1)^{${n - r}} (${b}x)^2$` },
            { code: 'A1', detail: `$${nCr} \\times ${b * b} = ${coeff}$` },
          ],
          fullSolution: `The $x^2$ term is $\\binom{${n}}{2}(${b}x)^2 = ${nCr} \\times ${b * b}x^2 = ${coeff}x^2$, giving coefficient $${coeff}$.`,
        },
      };
    },
  },

  // Ch 12: Geometric Progression S_infinity (Calc Numeric)
  {
    key: '0606-ch12-gp-sinf',
    chapterId: 12,
    topicId: '12.3',
    paperType: 'Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [24, 36, 48, 60, 72]);
      const den = pick(rng, [3, 4, 5]);
      const u2 = a / den;
      const sInf = Number((a / (1 - 1 / den)).toFixed(2));
      return {
        signature: `0606-12.3:${a}:${den}`,
        question: {
          id: `gen-0606-12.3-${idSuffix}`,
          chapterId: 12,
          topicId: '12.3',
          topicTitle: 'Geometric progressions (GP), convergence & sum to infinity',
          tier: 'Extended',
          paperType: 'Calculator',
          marks: 2,
          sourceRef: '0606 Paper 2 Calc · Topic 12.3',
          question: `A geometric progression has first term $${a}$ and second term $${u2}$. Find its sum to infinity $S_\\infty$.`,
          questionType: 'numeric',
          correctAnswer: String(sInf),
          numericAnswer: sInf,
          tolerance: 0.02,
          markScheme: [
            { code: 'B1', detail: `$r = \\frac{${u2}}{${a}} = \\frac{1}{${den}}$ ($|r| < 1$)` },
            { code: 'A1', detail: `$S_\\infty = \\frac{${a}}{1 - 1/${den}} = ${sInf}$` },
          ],
          fullSolution: `Common ratio $r = \\frac{1}{${den}}$. Since $|r| < 1$, $S_\\infty = \\frac{${a}}{1 - 1/${den}} = ${sInf}$.`,
        },
      };
    },
  },

  // Ch 13: Vector Magnitude & Position (Non-Calc Numeric)
  {
    key: '0606-ch13-vec-mag',
    chapterId: 13,
    topicId: '13.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const triple = pick(rng, [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [8, 15, 17],
      ]);
      const [dx, dy, mag] = triple;
      const ax = randInt(rng, 1, 4);
      const ay = randInt(rng, -2, 3);
      const bx = ax + dx;
      const by = ay - dy;
      return {
        signature: `0606-13.1:${ax}:${ay}:${dx}:${dy}`,
        question: {
          id: `gen-0606-13.1-${idSuffix}`,
          chapterId: 13,
          topicId: '13.1',
          topicTitle: 'Vector notation, position vectors, magnitude & unit vectors',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 13.1',
          question: `Points $A$ and $B$ have position vectors $\\begin{pmatrix} ${ax} \\\\ ${ay} \\end{pmatrix}$ and $\\begin{pmatrix} ${bx} \\\\ ${by} \\end{pmatrix}$. Find the magnitude $|\\overrightarrow{AB}|$.`,
          questionType: 'numeric',
          correctAnswer: String(mag),
          numericAnswer: mag,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `$\\overrightarrow{AB} = \\begin{pmatrix} ${dx} \\\\ ${-dy} \\end{pmatrix}$` },
            { code: 'A1', detail: `$|\\overrightarrow{AB}| = \\sqrt{${dx}^2 + (${-dy})^2} = ${mag}$` },
          ],
          fullSolution: `$\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA} = \\begin{pmatrix} ${dx} \\\\ ${-dy} \\end{pmatrix}$, so $|\\overrightarrow{AB}| = \\sqrt{${dx * dx} + ${dy * dy}} = ${mag}$.`,
        },
      };
    },
  },

  // Ch 14: Derivative Gradient at Point (Non-Calc Numeric)
  {
    key: '0606-ch14-grad',
    chapterId: 14,
    topicId: '14.1',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [1, 2, 3]);
      const b = randInt(rng, 2, 6);
      const x0 = pick(rng, [1, 2]);
      const grad = 3 * a * x0 * x0 - b;
      return {
        signature: `0606-14.1:${a}:${b}:${x0}`,
        question: {
          id: `gen-0606-14.1-${idSuffix}`,
          chapterId: 14,
          topicId: '14.1',
          topicTitle: 'Derived function notation & standard derivatives',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 2,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 14.1',
          question: `Find the gradient of the curve $y = ${a === 1 ? '' : a}x^3 - ${b}x + 4$ at the point where $x = ${x0}$.`,
          questionType: 'numeric',
          correctAnswer: String(grad),
          numericAnswer: grad,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `$\\frac{dy}{dx} = ${3 * a}x^2 - ${b}$` },
            { code: 'A1', detail: `At $x = ${x0}$, gradient $= ${3 * a}(${x0}^2) - ${b} = ${grad}$` },
          ],
          fullSolution: `Differentiate: $\\frac{dy}{dx} = ${3 * a}x^2 - ${b}$. Substituting $x = ${x0}$ gives $${grad}$.`,
        },
      };
    },
  },

  // Ch 14: Definite Integral (Calc / Non-Calc Numeric)
  {
    key: '0606-ch14-definite-int',
    chapterId: 14,
    topicId: '14.6',
    paperType: 'Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [3, 6]);
      const b = pick(rng, [2, 4]);
      const upper = pick(rng, [2, 3]);
      const val = (a / 3) * upper * upper * upper + (b / 2) * upper * upper;
      return {
        signature: `0606-14.6:${a}:${b}:${upper}`,
        question: {
          id: `gen-0606-14.6-${idSuffix}`,
          chapterId: 14,
          topicId: '14.6',
          topicTitle: 'Definite integrals & plane areas',
          tier: 'Extended',
          paperType: 'Calculator',
          marks: 3,
          sourceRef: '0606 Paper 2 Calc · Topic 14.6',
          question: `Evaluate the definite integral $\\int_0^{${upper}} (${a}x^2 + ${b}x)\\,dx$.`,
          questionType: 'numeric',
          correctAnswer: String(val),
          numericAnswer: val,
          tolerance: 0,
          markScheme: [
            { code: 'M1', detail: `Integrate: $\\left[${a === 3 ? '' : `${a / 3}`}x^3 + ${b === 2 ? '' : `${b / 2}`}x^2\\right]_0^{${upper}}$` },
            { code: 'M1', detail: 'Substitute limits $x = ' + upper + '$ minus $x = 0$' },
            { code: 'A1', detail: `$${val}$` },
          ],
          fullSolution: `Antiderivative is $${a / 3}x^3 + ${b / 2}x^2$. Evaluating from $0$ to $${upper}$ gives $${val}$.`,
        },
      };
    },
  },

  // Ch 14: Kinematics Acceleration (Calc Numeric)
  {
    key: '0606-ch14-kinematics',
    chapterId: 14,
    topicId: '14.7',
    paperType: 'Calculator',
    build: (rng, idSuffix) => {
      const a = pick(rng, [2, 3, 4]);
      const b = randInt(rng, 4, 12);
      const t0 = randInt(rng, 3, 6);
      const acc = 2 * a * t0 - b;
      return {
        signature: `0606-14.7:${a}:${b}:${t0}`,
        question: {
          id: `gen-0606-14.7-${idSuffix}`,
          chapterId: 14,
          topicId: '14.7',
          topicTitle: 'Kinematics & motion graphs (s-t, distance-t, v-t, speed-t, a-t)',
          tier: 'Extended',
          paperType: 'Calculator',
          marks: 2,
          sourceRef: '0606 Paper 2 Calc · Topic 14.7',
          question: `A particle moves in a straight line with velocity $v = ${a}t^2 - ${b}t + 5\\text{ m/s}$. Find its acceleration (in $\\text{m/s}^2$) when $t = ${t0}\\text{ s}$.`,
          questionType: 'numeric',
          correctAnswer: String(acc),
          numericAnswer: acc,
          tolerance: 0,
          unit: 'm/s²',
          markScheme: [
            { code: 'M1', detail: `Differentiate $v$: $a = \\frac{dv}{dt} = ${2 * a}t - ${b}$` },
            { code: 'A1', detail: `At $t = ${t0}$, $a = ${acc}\\text{ m/s}^2$` },
          ],
          fullSolution: `Acceleration is $a = \\frac{dv}{dt} = ${2 * a}t - ${b}$. At $t = ${t0}$, $a = ${2 * a}(${t0}) - ${b} = ${acc}\\text{ m/s}^2$.`,
        },
      };
    },
  },

  // Ch 14: Tangent/Normal fraction check (Non-Calc Text)
  {
    key: '0606-ch14-normal-frac',
    chapterId: 14,
    topicId: '14.3',
    paperType: 'Non-Calculator',
    build: (rng, idSuffix) => {
      const k = pick(rng, [2, 3, 4, 5]);
      const x0 = 1;
      const mT = 2 + k;
      const ans = formatFrac(-1, mT);
      const dec = Number((-1 / mT).toFixed(3));
      return {
        signature: `0606-14.3-norm:${k}`,
        question: {
          id: `gen-0606-14.3-${idSuffix}`,
          chapterId: 14,
          topicId: '14.3',
          topicTitle: 'Tangents, normals, stationary points & optimisation',
          tier: 'Extended',
          paperType: 'Non-Calculator',
          marks: 3,
          sourceRef: '0606 Paper 1 Non-Calc · Topic 14.3',
          question: `Find the exact gradient of the normal to the curve $y = x^2 + ${k}x - 3$ at $x = ${x0}$ (enter as a simplified fraction a/b).`,
          questionType: 'text',
          correctAnswer: ans,
          acceptedAnswers: [ans, String(dec)],
          numericAnswer: dec,
          tolerance: 0.01,
          markScheme: [
            { code: 'M1', detail: `$\\frac{dy}{dx} = 2x + ${k}$` },
            { code: 'A1', detail: `At $x = 1$, tangent gradient $m_T = ${mT}$` },
            { code: 'A1', detail: `Normal gradient $m_N = -\\frac{1}{${mT}}$` },
          ],
          fullSolution: `$\\frac{dy}{dx} = 2x + ${k} \\implies m_T(1) = ${mT}$. Therefore $m_N = -\\frac{1}{${mT}}$.`,
        },
      };
    },
  },
];

function buildBankItemsForSelection(options: MockGenerationOptions0606): PracticeQuestion[] {
  switch (options.mode) {
    case 'mock-0606-p1':
      return PRACTICE_QUESTION_BANK_0606.filter((q) => q.paperType === 'Non-Calculator');
    case 'mock-0606-p2':
      return PRACTICE_QUESTION_BANK_0606.filter((q) => q.paperType === 'Calculator');
    case 'topical': {
      if (options.topicId) {
        const exact = PRACTICE_QUESTION_BANK_0606.filter((q) => q.topicId === options.topicId);
        if (exact.length > 0) return exact;
        const ch = Number(options.topicId.split('.')[0]) || 1;
        return PRACTICE_QUESTION_BANK_0606.filter((q) => q.chapterId === ch);
      }
      if (typeof options.chapterId === 'number') {
        return PRACTICE_QUESTION_BANK_0606.filter((q) => q.chapterId === options.chapterId);
      }
      return PRACTICE_QUESTION_BANK_0606;
    }
    case 'mock-0606-full':
    default:
      return PRACTICE_QUESTION_BANK_0606;
  }
}

function selectTemplates0606(options: MockGenerationOptions0606): TemplateDef0606[] {
  switch (options.mode) {
    case 'mock-0606-p1':
      return TEMPLATES_0606.filter((t) => t.paperType === 'Non-Calculator');
    case 'mock-0606-p2':
      return TEMPLATES_0606.filter((t) => t.paperType === 'Calculator');
    case 'topical': {
      if (options.topicId) {
        const exact = TEMPLATES_0606.filter((t) => t.topicId === options.topicId);
        if (exact.length > 0) return exact;
        const ch = Number(options.topicId.split('.')[0]) || 1;
        const chMatches = TEMPLATES_0606.filter((t) => t.chapterId === ch);
        if (chMatches.length > 0) return chMatches;
      }
      if (typeof options.chapterId === 'number') {
        const chMatches = TEMPLATES_0606.filter((t) => t.chapterId === options.chapterId);
        if (chMatches.length > 0) return chMatches;
      }
      return TEMPLATES_0606;
    }
    case 'mock-0606-full':
    default:
      return TEMPLATES_0606;
  }
}

export function generate0606MockQuestions(
  options: MockGenerationOptions0606
): GeneratedQuestionResult0606 {
  const pool = selectTemplates0606(options);
  const bankPool = buildBankItemsForSelection(options);
  const seedKey = `0606|${options.mode}|${options.chapterId ?? 'all'}|${options.topicId ?? ''}|attempt:${options.attemptNumber}`;
  const rng = createRng(hashSeed(seedKey));

  const desiredCount =
    options.mode === 'mock-0606-full'
      ? 12
      : options.mode === 'topical'
        ? Math.max(4, Math.min(8, Math.max(pool.length, bankPool.length) * 2))
        : 8;

  const questions: PracticeQuestion[] = [];
  const signatures: string[] = [];
  const usedInPaper = new Set<string>();

  // Blend procedural templates first (ensuring diverse retries), then enrich with curated bank items if needed
  const orderedTemplates: TemplateDef0606[] = [];
  let roundPool = shuffle(rng, pool);
  const targetGenerated = Math.min(
    desiredCount,
    pool.length > 0 ? (options.mode === 'topical' ? pool.length * 2 : desiredCount - Math.min(2, bankPool.length)) : 0
  );

  while (orderedTemplates.length < targetGenerated && pool.length > 0) {
    if (roundPool.length === 0) {
      roundPool = shuffle(rng, pool);
    }
    const nextTpl = roundPool.shift();
    if (nextTpl) orderedTemplates.push(nextTpl);
  }

  orderedTemplates.forEach((tpl, idx) => {
    let chosen: GeneratedTemplateItem | null = null;
    for (let retry = 0; retry < 25; retry += 1) {
      const subSeed = hashSeed(`${seedKey}|slot:${idx}|tpl:${tpl.key}|try:${retry}`);
      const subRng = createRng(subSeed);
      const candidate = tpl.build(subRng, `a${options.attemptNumber}-q${idx + 1}`);
      const alreadyAvoided = options.avoidSignatures?.has(candidate.signature);
      const dupInSamePaper = usedInPaper.has(candidate.signature);
      if (!alreadyAvoided && !dupInSamePaper) {
        chosen = candidate;
        break;
      }
      if (!dupInSamePaper && !chosen) {
        chosen = candidate;
      }
    }

    if (chosen) {
      usedInPaper.add(chosen.signature);
      signatures.push(chosen.signature);
      questions.push(chosen.question);
    }
  });

  // Top up from curated 0606 question bank (so all 14 chapters & Paper 1 / Paper 2 always have rich coverage)
  const shuffledBank = shuffle(rng, bankPool);
  for (const bankQ of shuffledBank) {
    if (questions.length >= desiredCount) break;
    const bankSig = `bank:${bankQ.id}`;
    if (usedInPaper.has(bankSig)) continue;
    if (options.avoidSignatures?.has(bankSig) && questions.length + 1 <= shuffledBank.length) {
      // Allow fallback if bank has no unseen items left
      const unseenLeft = shuffledBank.some(
        (b) => !usedInPaper.has(`bank:${b.id}`) && !options.avoidSignatures?.has(`bank:${b.id}`)
      );
      if (unseenLeft) continue;
    }
    usedInPaper.add(bankSig);
    signatures.push(bankSig);
    questions.push({
      ...bankQ,
      id: `${bankQ.id}-a${options.attemptNumber}`,
    });
  }

  return { questions, signatures };
}
