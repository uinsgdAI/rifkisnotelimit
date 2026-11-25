export interface DifferenceTable {
  terms: number[];
  firstDiffs: number[];
  secondDiffs: number[];
  thirdDiffs?: number[];
}

export interface QuadraticFastSolution {
  kind: 'quadratic';
  a: number;
  b: number;
  c: number;
  d2: number;
  d1First: number;
  u1: number;
  zerothTerm: number;
  d0First: number;
  table: DifferenceTable;
  formulaText: string;
  formulaLatex: string;
  isValid: boolean;
}

export interface CubicFastSolution {
  kind: 'cubic';
  a: number;
  b: number;
  c: number;
  d: number;
  d3: number;
  d2First: number;
  d1First: number;
  u1: number;
  zerothTerm: number;
  d1Zero: number;
  d2Zero: number;
  table: DifferenceTable;
  formulaText: string;
  formulaLatex: string;
  isValid: boolean;
}

function roundClean(value: number): number {
  const rounded = Math.round(value * 1e9) / 1e9;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function formatCoeffNumber(n: number): string {
  const clean = roundClean(n);
  if (Number.isInteger(clean)) return String(clean);
  // Check simple fractions (halves, thirds, sixths)
  for (const denom of [2, 3, 6]) {
    const num = roundClean(clean * denom);
    if (Number.isInteger(num)) {
      return `${num}/${denom}`;
    }
  }
  return String(Number(clean.toFixed(3)));
}

function formatCoeffLatex(n: number): string {
  const clean = roundClean(n);
  if (Number.isInteger(clean)) return String(clean);
  for (const denom of [2, 3, 6]) {
    const num = roundClean(clean * denom);
    if (Number.isInteger(num)) {
      const sign = num < 0 ? '-' : '';
      return `${sign}\\frac{${Math.abs(num)}}{${denom}}`;
    }
  }
  return String(Number(clean.toFixed(3)));
}

export function formatNthTermPolynomial(
  coeffs: { a: number; b: number; c: number; d?: number },
  useLatex = false
): string {
  const entries: Array<{ coeff: number; power: number }> =
    typeof coeffs.d === 'number'
      ? [
          { coeff: coeffs.a, power: 3 },
          { coeff: coeffs.b, power: 2 },
          { coeff: coeffs.c, power: 1 },
          { coeff: coeffs.d, power: 0 },
        ]
      : [
          { coeff: coeffs.a, power: 2 },
          { coeff: coeffs.b, power: 1 },
          { coeff: coeffs.c, power: 0 },
        ];

  const parts: string[] = [];
  for (const { coeff, power } of entries) {
    const clean = roundClean(coeff);
    if (clean === 0) continue;

    const absVal = Math.abs(clean);
    const numStr = useLatex ? formatCoeffLatex(absVal) : formatCoeffNumber(absVal);
    const varPart = power === 0 ? '' : power === 1 ? 'n' : `n^${power}`;
    const termCore = power === 0 ? numStr : absVal === 1 ? varPart : `${numStr}${varPart}`;

    if (parts.length === 0) {
      parts.push(clean < 0 ? `-${termCore}` : termCore);
    } else {
      parts.push(clean < 0 ? ` - ${termCore}` : ` + ${termCore}`);
    }
  }

  return parts.length === 0 ? '0' : parts.join('');
}

export function computeDifferenceTable(terms: number[], includeThird = false): DifferenceTable {
  const firstDiffs: number[] = [];
  for (let i = 0; i < terms.length - 1; i++) {
    firstDiffs.push(roundClean(terms[i + 1] - terms[i]));
  }
  const secondDiffs: number[] = [];
  for (let i = 0; i < firstDiffs.length - 1; i++) {
    secondDiffs.push(roundClean(firstDiffs[i + 1] - firstDiffs[i]));
  }
  if (!includeThird) {
    return { terms: terms.map(roundClean), firstDiffs, secondDiffs };
  }
  const thirdDiffs: number[] = [];
  for (let i = 0; i < secondDiffs.length - 1; i++) {
    thirdDiffs.push(roundClean(secondDiffs[i + 1] - secondDiffs[i]));
  }
  return { terms: terms.map(roundClean), firstDiffs, secondDiffs, thirdDiffs };
}

export function solveQuadraticFromCoefficients(
  a: number,
  b: number,
  c: number,
  count = 6
): QuadraticFastSolution {
  const terms: number[] = [];
  for (let n = 1; n <= count; n++) {
    terms.push(roundClean(a * n * n + b * n + c));
  }
  const table = computeDifferenceTable(terms, false);
  const d2 = table.secondDiffs[0] ?? roundClean(2 * a);
  const d1First = table.firstDiffs[0] ?? roundClean(3 * a + b);
  const u1 = terms[0];
  const d0First = roundClean(d1First - d2);
  const zerothTerm = roundClean(u1 - d0First);

  return {
    kind: 'quadratic',
    a: roundClean(a),
    b: roundClean(b),
    c: roundClean(c),
    d2,
    d1First,
    u1,
    zerothTerm,
    d0First,
    table,
    formulaText: formatNthTermPolynomial({ a, b, c }, false),
    formulaLatex: formatNthTermPolynomial({ a, b, c }, true),
    isValid: true,
  };
}

/**
 * Fits u_n = a*n^2 + b*n + c using the Fast Coefficient Method:
 * 2a = D_2 (constant 2nd difference)
 * 3a + b = d_1 (first 1st-difference, u_2 - u_1)
 * a + b + c = u_1 (first term)
 */
export function fitQuadraticSequence(terms: number[]): QuadraticFastSolution | null {
  if (terms.length < 3 || terms.some((t) => !Number.isFinite(t))) return null;
  const table = computeDifferenceTable(terms, false);
  if (table.secondDiffs.length === 0) return null;

  const d2 = table.secondDiffs[0];
  const isConstantD2 = table.secondDiffs.every((d) => Math.abs(d - d2) < 1e-6);
  const d1First = table.firstDiffs[0];
  const u1 = roundClean(terms[0]);

  const a = roundClean(d2 / 2);
  const b = roundClean(d1First - 3 * a);
  const c = roundClean(u1 - a - b);

  const d0First = roundClean(d1First - d2);
  const zerothTerm = roundClean(u1 - d0First);

  const allMatch = terms.every((val, idx) => {
    const n = idx + 1;
    return Math.abs(a * n * n + b * n + c - val) < 1e-6;
  });

  return {
    kind: 'quadratic',
    a,
    b,
    c,
    d2,
    d1First,
    u1,
    zerothTerm,
    d0First,
    table,
    formulaText: formatNthTermPolynomial({ a, b, c }, false),
    formulaLatex: formatNthTermPolynomial({ a, b, c }, true),
    isValid: isConstantD2 && allMatch,
  };
}

export function solveCubicFromCoefficients(
  a: number,
  b: number,
  c: number,
  d: number,
  count = 6
): CubicFastSolution {
  const terms: number[] = [];
  for (let n = 1; n <= count; n++) {
    terms.push(roundClean(a * n * n * n + b * n * n + c * n + d));
  }
  const table = computeDifferenceTable(terms, true);
  const d3 = table.thirdDiffs?.[0] ?? roundClean(6 * a);
  const d2First = table.secondDiffs[0] ?? roundClean(12 * a + 2 * b);
  const d1First = table.firstDiffs[0] ?? roundClean(7 * a + 3 * b + c);
  const u1 = terms[0];

  const d2Zero = roundClean(d2First - d3);
  const d1Zero = roundClean(d1First - d2Zero);
  const zerothTerm = roundClean(u1 - d1Zero);

  return {
    kind: 'cubic',
    a: roundClean(a),
    b: roundClean(b),
    c: roundClean(c),
    d: roundClean(d),
    d3,
    d2First,
    d1First,
    u1,
    zerothTerm,
    d1Zero,
    d2Zero,
    table,
    formulaText: formatNthTermPolynomial({ a, b, c, d }, false),
    formulaLatex: formatNthTermPolynomial({ a, b, c, d }, true),
    isValid: true,
  };
}

/**
 * Fits u_n = a*n^3 + b*n^2 + c*n + d using the Fast Coefficient Method:
 * 6a = D_3 (constant 3rd difference)
 * 12a + 2b = d_2(1) (first 2nd-difference)
 * 7a + 3b + c = d_1(1) (first 1st-difference)
 * a + b + c + d = u_1 (first term)
 */
export function fitCubicSequence(terms: number[]): CubicFastSolution | null {
  if (terms.length < 4 || terms.some((t) => !Number.isFinite(t))) return null;
  const table = computeDifferenceTable(terms, true);
  if (!table.thirdDiffs || table.thirdDiffs.length === 0) return null;

  const d3 = table.thirdDiffs[0];
  const isConstantD3 = table.thirdDiffs.every((val) => Math.abs(val - d3) < 1e-6);
  const d2First = table.secondDiffs[0];
  const d1First = table.firstDiffs[0];
  const u1 = roundClean(terms[0]);

  const a = roundClean(d3 / 6);
  const b = roundClean((d2First - 12 * a) / 2);
  const c = roundClean(d1First - 7 * a - 3 * b);
  const d = roundClean(u1 - a - b - c);

  const d2Zero = roundClean(d2First - d3);
  const d1Zero = roundClean(d1First - d2Zero);
  const zerothTerm = roundClean(u1 - d1Zero);

  const allMatch = terms.every((val, idx) => {
    const n = idx + 1;
    return Math.abs(a * n * n * n + b * n * n + c * n + d - val) < 1e-6;
  });

  return {
    kind: 'cubic',
    a,
    b,
    c,
    d,
    d3,
    d2First,
    d1First,
    u1,
    zerothTerm,
    d1Zero,
    d2Zero,
    table,
    formulaText: formatNthTermPolynomial({ a, b, c, d }, false),
    formulaLatex: formatNthTermPolynomial({ a, b, c, d }, true),
    isValid: isConstantD3 && allMatch,
  };
}
