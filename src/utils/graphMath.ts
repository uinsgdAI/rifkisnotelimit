export type AngleUnit = 'rad' | 'deg';

export type ComparisonOp = '=' | '<=' | '<' | '>=' | '>';

export interface ParamMap {
  [name: string]: number;
}

export interface GraphViewport {
  centerX: number;
  centerY: number;
  /** World units per pixel horizontally? Actually easier: pixelsPerUnitX and pixelsPerUnitY */
  pxPerUnitX: number;
  pxPerUnitY: number;
}

export interface GraphPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  visible?: boolean;
}

export interface GraphSegment {
  id: string;
  label?: string;
  from: { x: number; y: number; label?: string };
  to: { x: number; y: number; label?: string };
  color: string;
  kind: 'segment' | 'vector' | 'ray';
  dashed?: boolean;
}

export interface GraphPolygon {
  id: string;
  label?: string;
  vertices: { x: number; y: number; label?: string }[];
  color: string;
  dashed?: boolean;
}

export interface GraphCircle {
  id: string;
  label?: string;
  cx: number;
  cy: number;
  radius: number;
  color: string;
}

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' };

const KNOWN_FUNCS = [
  'asin',
  'acos',
  'atan',
  'floor',
  'ceil',
  'sqrt',
  'sin',
  'cos',
  'tan',
  'abs',
  'exp',
  'log',
  'ln',
] as const;

const KNOWN_CONSTS = new Set(['pi', 'e']);

type AstNode =
  | { kind: 'num'; value: number }
  | { kind: 'var'; name: string }
  | { kind: 'unary'; op: '+' | '-'; arg: AstNode }
  | { kind: 'binary'; op: '+' | '-' | '*' | '/' | '^'; left: AstNode; right: AstNode }
  | { kind: 'call'; fn: string; arg: AstNode };

export function normalizeMathInput(raw: string): string {
  return raw
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/π/g, 'pi')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/√\s*\(/g, 'sqrt(')
    .replace(/√\s*([a-zA-Z0-9.]+)/g, 'sqrt($1)')
    .trim();
}

export function tokenizeExpression(raw: string): Token[] {
  const input = normalizeMathInput(raw);
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      const rest = input.slice(i);
      const numMatch = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!numMatch) {
        throw new Error(`Invalid number near "${rest.slice(0, 8)}"`);
      }
      const val = Number(numMatch[0]);
      if (!Number.isFinite(val)) {
        throw new Error(`Invalid numeric value "${numMatch[0]}"`);
      }
      tokens.push({ type: 'num', value: val });
      i += numMatch[0].length;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      const rest = input.slice(i).toLowerCase();
      let matchedFunc: string | null = null;
      for (const fn of KNOWN_FUNCS) {
        if (rest.startsWith(fn)) {
          // Match function if followed by '(' or whitespace + '(' or not strictly part of another single-letter chain?
          // Checking if next non-space char is '(' handles sin(x), xsin(x), 2cos(x) cleanly
          const after = rest.slice(fn.length);
          if (/^\s*\(/.test(after)) {
            matchedFunc = fn;
            break;
          }
        }
      }
      if (matchedFunc) {
        tokens.push({ type: 'ident', value: matchedFunc });
        i += matchedFunc.length;
        continue;
      }

      if (rest.startsWith('pi') && !/[a-zA-Z]/.test(rest[2] || '')) {
        tokens.push({ type: 'ident', value: 'pi' });
        i += 2;
        continue;
      }

      if (rest.startsWith('pi') && (rest[2] === 'x' || rest[2] === 'a' || rest[2] === 'b')) {
        tokens.push({ type: 'ident', value: 'pi' });
        i += 2;
        continue;
      }

      // Single-letter identifier (x, y, a, b, c, m, k, e, etc.)
      tokens.push({ type: 'ident', value: ch.toLowerCase() });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    throw new Error(`Unexpected character "${ch}"`);
  }

  // Insert implicit multiplication tokens
  const withImplicit: Token[] = [];
  const isFuncIdent = (t: Token): boolean =>
    t.type === 'ident' && (KNOWN_FUNCS as readonly string[]).includes(t.value);
  const canEndFactor = (t: Token): boolean =>
    t.type === 'num' || t.type === 'rparen' || (t.type === 'ident' && !isFuncIdent(t));
  const canStartFactor = (t: Token): boolean =>
    t.type === 'num' || t.type === 'lparen' || t.type === 'ident';

  for (let idx = 0; idx < tokens.length; idx++) {
    const curr = tokens[idx];
    const prev = withImplicit[withImplicit.length - 1];
    if (prev && canEndFactor(prev) && canStartFactor(curr)) {
      withImplicit.push({ type: 'op', value: '*' });
    }
    withImplicit.push(curr);
  }

  return withImplicit;
}

export function parseAst(raw: string): AstNode {
  const tokens = tokenizeExpression(raw);
  if (tokens.length === 0) {
    throw new Error('Expression cannot be empty');
  }
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  const parseAddSub = (): AstNode => {
    let left = parseMulDiv();
    while (true) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseMulDiv();
        left = { kind: 'binary', op: t.value, left, right };
      } else {
        break;
      }
    }
    return left;
  };

  const parseMulDiv = (): AstNode => {
    let left = parseUnary();
    while (true) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '*' || t.value === '/')) {
        consume();
        const right = parseUnary();
        left = { kind: 'binary', op: t.value, left, right };
      } else {
        break;
      }
    }
    return left;
  };

  const parseUnary = (): AstNode => {
    const t = peek();
    if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume();
      const arg = parseUnary();
      return { kind: 'unary', op: t.value, arg };
    }
    return parsePower();
  };

  const parsePower = (): AstNode => {
    const base = parsePrimary();
    const t = peek();
    if (t?.type === 'op' && t.value === '^') {
      consume();
      const exponent = parseUnary();
      return { kind: 'binary', op: '^', left: base, right: exponent };
    }
    return base;
  };

  const parsePrimary = (): AstNode => {
    const t = peek();
    if (!t) {
      throw new Error('Unexpected end of expression');
    }
    if (t.type === 'num') {
      consume();
      return { kind: 'num', value: t.value };
    }
    if (t.type === 'ident') {
      consume();
      const next = peek();
      if ((KNOWN_FUNCS as readonly string[]).includes(t.value) && next?.type === 'lparen') {
        consume(); // '('
        const arg = parseAddSub();
        const close = peek();
        if (close?.type !== 'rparen') {
          throw new Error(`Missing closing ")" for ${t.value}(...)`);
        }
        consume();
        return { kind: 'call', fn: t.value, arg };
      }
      if ((KNOWN_FUNCS as readonly string[]).includes(t.value)) {
        throw new Error(`Function "${t.value}" must be followed by (...)`);
      }
      return { kind: 'var', name: t.value };
    }
    if (t.type === 'lparen') {
      consume();
      const inner = parseAddSub();
      const close = peek();
      if (close?.type !== 'rparen') {
        throw new Error('Missing closing ")"');
      }
      consume();
      return inner;
    }
    throw new Error('Unexpected token in expression');
  };

  const ast = parseAddSub();
  if (pos < tokens.length) {
    throw new Error('Unexpected trailing input in expression');
  }
  return ast;
}

export function evaluateAst(
  node: AstNode,
  vars: ParamMap,
  angleUnit: AngleUnit = 'rad'
): number {
  switch (node.kind) {
    case 'num':
      return node.value;
    case 'var': {
      if (node.name === 'pi') return Math.PI;
      if (node.name === 'e') return Math.E;
      if (Object.prototype.hasOwnProperty.call(vars, node.name)) {
        return vars[node.name];
      }
      return NaN;
    }
    case 'unary': {
      const v = evaluateAst(node.arg, vars, angleUnit);
      return node.op === '-' ? -v : v;
    }
    case 'binary': {
      const l = evaluateAst(node.left, vars, angleUnit);
      const r = evaluateAst(node.right, vars, angleUnit);
      switch (node.op) {
        case '+':
          return l + r;
        case '-':
          return l - r;
        case '*':
          return l * r;
        case '/':
          return r === 0 ? NaN : l / r;
        case '^': {
          // Handle real odd-integer roots or standard Math.pow
          if (l < 0 && Number.isInteger(1 / r) && Math.abs(Math.round(1 / r) % 2) === 1) {
            return -Math.pow(-l, r);
          }
          return Math.pow(l, r);
        }
      }
    }
    case 'call': {
      const v = evaluateAst(node.arg, vars, angleUnit);
      if (!Number.isFinite(v)) return NaN;
      const toRad = angleUnit === 'deg' ? Math.PI / 180 : 1;
      const fromRad = angleUnit === 'deg' ? 180 / Math.PI : 1;
      switch (node.fn) {
        case 'sin':
          return Math.sin(v * toRad);
        case 'cos':
          return Math.cos(v * toRad);
        case 'tan': {
          const rad = v * toRad;
          const cosVal = Math.cos(rad);
          if (Math.abs(cosVal) < 1e-10) return NaN;
          return Math.tan(rad);
        }
        case 'asin':
          return Math.asin(v) * fromRad;
        case 'acos':
          return Math.acos(v) * fromRad;
        case 'atan':
          return Math.atan(v) * fromRad;
        case 'abs':
          return Math.abs(v);
        case 'sqrt':
          return v < 0 ? NaN : Math.sqrt(v);
        case 'ln':
          return v <= 0 ? NaN : Math.log(v);
        case 'log':
          return v <= 0 ? NaN : Math.log10(v);
        case 'exp':
          return Math.exp(v);
        case 'floor':
          return Math.floor(v);
        case 'ceil':
          return Math.ceil(v);
        default:
          return NaN;
      }
    }
  }
}

function collectAstVars(node: AstNode, out: Set<string>): void {
  if (node.kind === 'var') {
    if (!KNOWN_CONSTS.has(node.name)) {
      out.add(node.name);
    }
    return;
  }
  if (node.kind === 'unary' || node.kind === 'call') {
    collectAstVars(node.arg, out);
    return;
  }
  if (node.kind === 'binary') {
    collectAstVars(node.left, out);
    collectAstVars(node.right, out);
  }
}

export interface CompiledPlotSpec {
  kind: 'function' | 'vertical';
  op: ComparisonOp;
  isInequality: boolean;
  dashedBoundary: boolean;
  referencedParams: string[];
  evaluate: (x: number, params: ParamMap, angleUnit: AngleUnit) => number;
}

export type ParsePlotResult =
  | { ok: true; spec: CompiledPlotSpec }
  | { ok: false; error: string };

function flipOp(op: ComparisonOp): ComparisonOp {
  switch (op) {
    case '<':
      return '>';
    case '<=':
      return '>=';
    case '>':
      return '<';
    case '>=':
      return '<=';
    case '=':
      return '=';
  }
}

export function parsePlotInput(rawInput: string): ParsePlotResult {
  const normalized = normalizeMathInput(rawInput);
  if (!normalized) {
    return { ok: false, error: 'Enter an equation such as y = x^2 - 4' };
  }

  try {
    const compMatch = normalized.match(/^(.+?)\s*(<=|>=|<|>|=)\s*(.+)$/);
    if (!compMatch) {
      // Bare expression -> y = expr
      const ast = parseAst(normalized);
      const vars = new Set<string>();
      collectAstVars(ast, vars);
      if (vars.has('y')) {
        return { ok: false, error: 'Include "=" (e.g. 2x + 3y = 12) or write y = ...' };
      }
      vars.delete('x');
      return {
        ok: true,
        spec: {
          kind: 'function',
          op: '=',
          isInequality: false,
          dashedBoundary: false,
          referencedParams: Array.from(vars).sort(),
          evaluate: (x, params, angleUnit) => evaluateAst(ast, { ...params, x }, angleUnit),
        },
      };
    }

    const lhsStr = compMatch[1].trim();
    const rawOp = compMatch[2] as ComparisonOp;
    const rhsStr = compMatch[3].trim();

    const lhsAst = parseAst(lhsStr);
    const rhsAst = parseAst(rhsStr);

    const lhsVars = new Set<string>();
    const rhsVars = new Set<string>();
    collectAstVars(lhsAst, lhsVars);
    collectAstVars(rhsAst, rhsVars);

    // Direct y <op> f(x)
    if (lhsStr.toLowerCase() === 'y' && !rhsVars.has('y')) {
      const params = Array.from(rhsVars).filter((v) => v !== 'x').sort();
      return {
        ok: true,
        spec: {
          kind: 'function',
          op: rawOp,
          isInequality: rawOp !== '=',
          dashedBoundary: rawOp === '<' || rawOp === '>',
          referencedParams: params,
          evaluate: (x, p, angleUnit) => evaluateAst(rhsAst, { ...p, x }, angleUnit),
        },
      };
    }

    // Direct f(x) <op> y
    if (rhsStr.toLowerCase() === 'y' && !lhsVars.has('y')) {
      const flipped = flipOp(rawOp);
      const params = Array.from(lhsVars).filter((v) => v !== 'x').sort();
      return {
        ok: true,
        spec: {
          kind: 'function',
          op: flipped,
          isInequality: flipped !== '=',
          dashedBoundary: flipped === '<' || flipped === '>',
          referencedParams: params,
          evaluate: (x, p, angleUnit) => evaluateAst(lhsAst, { ...p, x }, angleUnit),
        },
      };
    }

    // Direct x <op> c
    if (lhsStr.toLowerCase() === 'x' && !rhsVars.has('x') && !rhsVars.has('y')) {
      const params = Array.from(rhsVars).sort();
      return {
        ok: true,
        spec: {
          kind: 'vertical',
          op: rawOp,
          isInequality: rawOp !== '=',
          dashedBoundary: rawOp === '<' || rawOp === '>',
          referencedParams: params,
          evaluate: (_x, p, angleUnit) => evaluateAst(rhsAst, p, angleUnit),
        },
      };
    }

    // Implicit equation / inequality in x and y (supports general linear equations like 2x + 3y = 12)
    const diffAst: AstNode = { kind: 'binary', op: '-', left: lhsAst, right: rhsAst };
    const allVars = new Set<string>([...lhsVars, ...rhsVars]);
    allVars.delete('x');
    allVars.delete('y');
    const paramNames = Array.from(allVars).sort();

    // Test linearity dynamically at evaluation time with current params
    const sampleLinear = (params: ParamMap, angleUnit: AngleUnit) => {
      const f = (x: number, y: number) => evaluateAst(diffAst, { ...params, x, y }, angleUnit);
      const f00 = f(0, 0);
      const f10 = f(1, 0);
      const f01 = f(0, 1);
      const f23 = f(2, 3);
      if (![f00, f10, f01, f23].every(Number.isFinite)) return null;
      const A = f10 - f00;
      const B = f01 - f00;
      const C = -f00;
      const expected23 = A * 2 + B * 3 - C;
      if (Math.abs(f23 - expected23) > 1e-6) return null;
      return { A, B, C };
    };

    // Quick static linearity validation with unit dummy params (1.37)
    const dummyParams: ParamMap = {};
    for (const p of paramNames) dummyParams[p] = 1.37;
    const check = sampleLinear(dummyParams, 'rad');
    if (!check) {
      return {
        ok: false,
        error: 'Non-linear equations must be solved for y (e.g. y = x^2 - 4)',
      };
    }

    if (Math.abs(check.B) > 1e-9) {
      const opForY = check.B < 0 ? flipOp(rawOp) : rawOp;
      return {
        ok: true,
        spec: {
          kind: 'function',
          op: opForY,
          isInequality: opForY !== '=',
          dashedBoundary: opForY === '<' || opForY === '>',
          referencedParams: paramNames,
          evaluate: (x, params, angleUnit) => {
            const lin = sampleLinear(params, angleUnit);
            if (!lin || Math.abs(lin.B) < 1e-12) return NaN;
            return (lin.C - lin.A * x) / lin.B;
          },
        },
      };
    }

    if (Math.abs(check.A) > 1e-9) {
      const opForX = check.A < 0 ? flipOp(rawOp) : rawOp;
      return {
        ok: true,
        spec: {
          kind: 'vertical',
          op: opForX,
          isInequality: opForX !== '=',
          dashedBoundary: opForX === '<' || opForX === '>',
          referencedParams: paramNames,
          evaluate: (_x, params, angleUnit) => {
            const lin = sampleLinear(params, angleUnit);
            if (!lin || Math.abs(lin.A) < 1e-12) return NaN;
            return lin.C / lin.A;
          },
        },
      };
    }

    return { ok: false, error: 'Equation has no x or y dependency' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid expression',
    };
  }
}

export function worldToScreen(
  wx: number,
  wy: number,
  vp: GraphViewport,
  width: number,
  height: number
): { sx: number; sy: number } {
  return {
    sx: width / 2 + (wx - vp.centerX) * vp.pxPerUnitX,
    sy: height / 2 - (wy - vp.centerY) * vp.pxPerUnitY,
  };
}

export function screenToWorld(
  sx: number,
  sy: number,
  vp: GraphViewport,
  width: number,
  height: number
): { wx: number; wy: number } {
  return {
    wx: vp.centerX + (sx - width / 2) / vp.pxPerUnitX,
    wy: vp.centerY - (sy - height / 2) / vp.pxPerUnitY,
  };
}

export function getWorldBounds(
  vp: GraphViewport,
  width: number,
  height: number
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const halfW = width / (2 * vp.pxPerUnitX);
  const halfH = height / (2 * vp.pxPerUnitY);
  return {
    xMin: vp.centerX - halfW,
    xMax: vp.centerX + halfW,
    yMin: vp.centerY - halfH,
    yMax: vp.centerY + halfH,
  };
}

export function computeNiceTickStep(
  pxPerUnit: number,
  targetPixelSpacing = 64,
  preferDegreeTicks = false
): number {
  const rawStep = targetPixelSpacing / Math.max(pxPerUnit, 1e-6);
  if (preferDegreeTicks) {
    const degreeSteps = [5, 10, 15, 30, 45, 90, 180, 360];
    for (const s of degreeSteps) {
      if (s >= rawStep * 0.85) return s;
    }
  }
  const exp = Math.floor(Math.log10(rawStep));
  const pow = Math.pow(10, exp);
  const frac = rawStep / pow;
  let niceFrac = 1;
  if (frac <= 1.2) niceFrac = 1;
  else if (frac <= 2.5) niceFrac = 2;
  else if (frac <= 5.5) niceFrac = 5;
  else niceFrac = 10;
  return niceFrac * pow;
}

export function formatGraphNumber(n: number, maxDecimals = 2): string {
  if (!Number.isFinite(n)) return '—';
  const cleaned = Math.abs(n) < 1e-9 ? 0 : n;
  const rounded = Number(cleaned.toFixed(maxDecimals));
  if (Object.is(rounded, -0)) return '0';
  return String(rounded);
}

function bisectRoot(
  fn: (x: number) => number,
  a: number,
  b: number,
  iters = 26
): number | null {
  let fa = fn(a);
  let fb = fn(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
  if (Math.abs(fa) < 1e-10) return a;
  if (Math.abs(fb) < 1e-10) return b;
  if (fa * fb > 0) return null;
  let lo = a;
  let hi = b;
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    const fm = fn(mid);
    if (!Number.isFinite(fm)) return null;
    if (Math.abs(fm) < 1e-10) return mid;
    if (fa * fm <= 0) {
      hi = mid;
      fb = fm;
    } else {
      lo = mid;
      fa = fm;
    }
  }
  const res = (lo + hi) / 2;
  const fres = fn(res);
  // Reject asymptote jump false positives (like 1/x crossing sign across x=0)
  if (!Number.isFinite(fres) || Math.abs(fres) > 0.5) return null;
  return res;
}

export function findRoots(
  evaluate: (x: number, params: ParamMap, angleUnit: AngleUnit) => number,
  xMin: number,
  xMax: number,
  params: ParamMap,
  angleUnit: AngleUnit,
  samples = 360
): { x: number; y: number }[] {
  const fn = (x: number) => evaluate(x, params, angleUnit);
  const step = (xMax - xMin) / samples;
  if (step <= 0) return [];
  const roots: { x: number; y: number }[] = [];

  let prevX = xMin;
  let prevY = fn(prevX);

  const pushUnique = (rx: number) => {
    const cleanX = Math.abs(rx) < 1e-7 ? 0 : rx;
    if (!roots.some((r) => Math.abs(r.x - cleanX) < step * 0.6)) {
      roots.push({ x: cleanX, y: 0 });
    }
  };

  if (Number.isFinite(prevY) && Math.abs(prevY) < 1e-6) {
    pushUnique(prevX);
  }

  for (let i = 1; i <= samples; i++) {
    const curX = xMin + i * step;
    const curY = fn(curX);
    if (Number.isFinite(prevY) && Number.isFinite(curY)) {
      if (Math.abs(curY) < 1e-7) {
        pushUnique(curX);
      } else if (prevY * curY < 0) {
        const root = bisectRoot(fn, prevX, curX);
        if (root !== null) pushUnique(root);
      }
    }
    prevX = curX;
    prevY = curY;
  }

  return roots;
}

export function numericDerivative(
  evaluate: (x: number, params: ParamMap, angleUnit: AngleUnit) => number,
  x0: number,
  params: ParamMap,
  angleUnit: AngleUnit
): number {
  const h = angleUnit === 'deg' ? 1e-3 : 1e-5;
  const fPlus = evaluate(x0 + h, params, angleUnit);
  const fMinus = evaluate(x0 - h, params, angleUnit);
  if (!Number.isFinite(fPlus) || !Number.isFinite(fMinus)) return NaN;
  return (fPlus - fMinus) / (2 * h);
}

export function findExtrema(
  evaluate: (x: number, params: ParamMap, angleUnit: AngleUnit) => number,
  xMin: number,
  xMax: number,
  params: ParamMap,
  angleUnit: AngleUnit,
  samples = 300
): { x: number; y: number; kind: 'min' | 'max' }[] {
  const deriv = (x: number) => numericDerivative(evaluate, x, params, angleUnit);
  const step = (xMax - xMin) / samples;
  if (step <= 0) return [];

  const extrema: { x: number; y: number; kind: 'min' | 'max' }[] = [];
  let prevX = xMin + step * 0.5;
  let prevD = deriv(prevX);

  const pushExtremum = (rx: number, kind: 'min' | 'max') => {
    const y = evaluate(rx, params, angleUnit);
    if (!Number.isFinite(y)) return;
    const cleanX = Math.abs(rx) < 1e-6 ? 0 : rx;
    const cleanY = Math.abs(y) < 1e-6 ? 0 : y;
    if (!extrema.some((e) => Math.abs(e.x - cleanX) < step * 0.8)) {
      extrema.push({ x: cleanX, y: cleanY, kind });
    }
  };

  for (let i = 2; i < samples; i++) {
    const curX = xMin + i * step;
    const curD = deriv(curX);
    if (Number.isFinite(prevD) && Number.isFinite(curD)) {
      if (Math.abs(curD) < 1e-6) {
        const dLeft = deriv(curX - step * 0.25);
        const dRight = deriv(curX + step * 0.25);
        if (Number.isFinite(dLeft) && Number.isFinite(dRight) && dLeft * dRight < 0) {
          pushExtremum(curX, dLeft < 0 ? 'min' : 'max');
        }
      } else if (prevD * curD < 0) {
        const rootX = bisectRoot(deriv, prevX, curX, 24);
        if (rootX !== null) {
          pushExtremum(rootX, prevD < 0 && curD > 0 ? 'min' : 'max');
        }
      }
    }
    prevX = curX;
    prevD = curD;
  }

  return extrema;
}

export function findIntersections(
  evalA: (x: number, params: ParamMap, angleUnit: AngleUnit) => number,
  evalB: (x: number, params: ParamMap, angleUnit: AngleUnit) => number,
  xMin: number,
  xMax: number,
  params: ParamMap,
  angleUnit: AngleUnit,
  samples = 360
): { x: number; y: number }[] {
  const diff = (x: number) =>
    evalA(x, params, angleUnit) - evalB(x, params, angleUnit);
  const roots = findRoots(
    (x) => diff(x),
    xMin,
    xMax,
    params,
    angleUnit,
    samples
  );
  return roots
    .map((r) => ({ x: r.x, y: evalA(r.x, params, angleUnit) }))
    .filter((pt) => Number.isFinite(pt.y));
}

export function computeSegmentMetrics(
  a: { x: number; y: number },
  b: { x: number; y: number }
): {
  dx: number;
  dy: number;
  length: number;
  midpoint: { x: number; y: number };
  gradient: number | null;
} {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const gradient = Math.abs(dx) < 1e-9 ? null : dy / dx;
  return { dx, dy, length, midpoint, gradient };
}

export function computePolygonMetrics(
  vertices: { x: number; y: number }[]
): { perimeter: number; area: number } {
  if (vertices.length < 3) return { perimeter: 0, area: 0 };
  let perimeter = 0;
  let twiceArea = 0;
  for (let i = 0; i < vertices.length; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    perimeter += Math.hypot(next.x - curr.x, next.y - curr.y);
    twiceArea += curr.x * next.y - next.x * curr.y;
  }
  return { perimeter, area: Math.abs(twiceArea) / 2 };
}

export function snapWorldCoord(value: number, step = 0.5): number {
  return Math.round(value / step) * step;
}
