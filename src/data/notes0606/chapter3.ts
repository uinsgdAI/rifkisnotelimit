import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_3_NOTES_0606: SubtopicNote[] = [
  {
    id: '3.1',
    chapterId: 3,
    code: '3.1',
    title: 'Remainder theorem & Factor theorem',
    tier: 'Extended',
    summary:
      'Use the remainder theorem $R = f(b/a)$ and factor theorem $f(b/a) = 0$ to test linear divisors $(ax - b)$ and form simultaneous equations for unknown coefficients.',
    bigIdea:
      'When a polynomial $f(x)$ is divided by $(ax - b)$, writing $f(x) = (ax - b)Q(x) + R$ means substituting $x = \\frac{b}{a}$ kills the quotient term $(ax - b)Q(x)$, leaving $R = f\\!\\left(\\frac{b}{a}\\right)$ immediately.',
    keyFindings: [
      {
        title: 'Remainder & Factor Equivalence',
        finding: 'Dividing $f(x)$ by $(ax - b)$ gives remainder $f\\!\\left(\\frac{b}{a}\\right)$. Therefore $(ax - b)$ is a factor iff $f\\!\\left(\\frac{b}{a}\\right) = 0$.',
      },
    ],
    stepByStepMethod: [
      'Set the linear divisor equal to zero ($ax - b = 0$) to find the exact test value $x = \\frac{b}{a}$.',
      'Substitute $x = \\frac{b}{a}$ into $f(x)$ carefully, keeping negative numbers in brackets when raising to powers.',
      'Set $f\\!\\left(\\frac{b}{a}\\right)$ equal to the given remainder (or $0$ for a factor).',
      'If two unknown constants ($p, q$) appear, generate two equations from two conditions and solve simultaneously.',
    ],
    rapidSummary: [
      { rule: 'Divisor $(x - c)$', detail: 'Remainder is $f(c)$; factor iff $f(c) = 0$.' },
      { rule: 'Divisor $(ax - b)$', detail: 'Remainder is $f(b/a)$; factor iff $f(b/a) = 0$.' },
      { rule: 'Zero-remainder shortcut', detail: 'Check factors of the constant term first when searching for integer roots.' },
    ],
    coreObjectives: [
      'Know and use the remainder and factor theorems.',
      'Find unknown constants in polynomials given remainder or factor conditions.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Remainder theorem', latex: 'f(x) = (ax - b)Q(x) + R \\implies R = f\\!\\left(\\frac{b}{a}\\right)' },
      { label: 'Factor theorem', latex: '(ax - b) \\text{ is a factor of } f(x) \\iff f\\!\\left(\\frac{b}{a}\\right) = 0' },
    ],
    studyNotes: [
      {
        heading: 'Watch the Sign of the Divisor',
        body: 'Dividing by $(2x + 3)$ means solving $2x + 3 = 0 \\implies x = -\\frac{3}{2}$, NOT $+\\frac{3}{2}$. Similarly, if $f(-2) = 0$, the corresponding linear factor is $(x + 2)$, NOT $(x - 2)$.',
      },
    ],
    workedExamples: [
      {
        title: 'Two unknown coefficients via factor and remainder theorems',
        question: 'The polynomial $f(x) = x^3 + ax^2 + bx - 6$ has $(x - 2)$ as a factor, and leaves a remainder of $-12$ when divided by $(x + 1)$. Find the values of $a$ and $b$.',
        marks: 5,
        steps: [
          'Since $(x - 2)$ is a factor, $f(2) = 0$: $8 + 4a + 2b - 6 = 0 \\implies 4a + 2b = -2 \\implies 2a + b = -1$.',
          'Remainder $-12$ on division by $(x + 1)$ gives $f(-1) = -12$: $-1 + a - b - 6 = -12 \\implies a - b = -5$.',
          'Add the two equations: $(2a + b) + (a - b) = -1 + (-5) \\implies 3a = -6 \\implies a = -2$.',
          'Substitute $a = -2$ into $a - b = -5$: $-2 - b = -5 \\implies b = 3$.',
        ],
        answer: '$a = -2, \\quad b = 3$',
        markSchemeNotes: 'M1 for $f(2) = 0$, M1 for $f(-1) = -12$, M1 solving simultaneous linear pair, A1+A1 for $a = -2, b = 3$.',
      },
    ],
    commonMistakes: [
      'Evaluating $f(a)$ instead of $f(-a)$ for a divisor $(x + a)$.',
      'Sign errors when evaluating $(-1)^3 = -1$ or $(-2)^3 = -8$.',
    ],
    coursebookTip: 'When a question gives two divisors and asks for $p$ and $q$, immediately write "By the Factor/Remainder Theorem, $f(\\dots) = \\dots$" before substituting so method marks are guaranteed.',
    quickCheck: {
      id: '0606-3.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Find the remainder when $f(x) = 2x^3 - 3x^2 + x - 5$ is divided by $(x - 2)$.',
      answer: '1',
      numericAnswer: 1,
      tolerance: 0,
      hint: 'Evaluate $f(2)$.',
      solution: '$f(2) = 2(2^3) - 3(2^2) + 2 - 5 = 16 - 12 + 2 - 5 = 1$.',
    },
  },
  {
    id: '3.2',
    chapterId: 3,
    code: '3.2',
    title: 'Factorising polynomials & solving cubics',
    tier: 'Extended',
    summary:
      'Find an initial linear factor by trial, divide a cubic by $(ax - b)$ via long division or coefficient comparison to extract a quadratic quotient, and solve cubic equations cleanly (including surd roots).',
    bigIdea:
      'Every cubic with real coefficients splits into at least one real linear factor $(ax - b)$ times a quadratic $(px^2 + qx + r)$, reducing cubic problems directly to Chapter 2 quadratics.',
    keyFindings: [
      {
        title: 'Rational Root Search',
        finding: 'Test small integers $\\pm 1, \\pm 2, \\pm 3$ dividing the constant term first; if leading coeff $a \\neq 1$, test $\\pm \\frac{\\text{factor of constant}}{\\text{factor of leading coeff}}$ (e.g. $\\pm \\frac{1}{2}$).',
      },
    ],
    stepByStepMethod: [
      'Test $x = 1, -1, 2, -2, \\dots$ until you find a root $x = r$ such that $f(r) = 0$; deduce the factor $(x - r)$.',
      'Divide $f(x)$ by $(x - r)$ using polynomial long division, synthetic division, or equating coefficients $(x - r)(ax^2 + bx + c)$.',
      'Check if the quadratic factor $ax^2 + bx + c$ factorises further into two linear factors.',
      'If $f(x) = 0$ is required, solve $x = r$ and set $ax^2 + bx + c = 0$ (checking $b^2 - 4ac$ for extra real or repeated roots!).',
    ],
    rapidSummary: [
      { rule: 'Equating coefficients', detail: 'Write $f(x) = (x - r)(ax^2 + bx + c)$: $a$ and $c$ come straight from leading and constant terms!' },
      { rule: 'Irrational/no more roots', detail: 'If $\\Delta < 0$ on the quadratic factor, the cubic has only $1$ real root.' },
      { rule: 'Factorise completely', detail: 'Don’t leave a factorable quadratic unfactorised at the end!' },
    ],
    coreObjectives: [
      'Find factors of polynomials (up to degree 3 and suitable degree 4 expressions).',
      'Solve cubic equations algebraically, giving exact rational or surd roots where required.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Cubic factorisation', latex: 'ax^3 + bx^2 + cx + d = (px - q)(rx^2 + sx + t)' },
    ],
    studyNotes: [
      {
        heading: 'Fast Coefficient Comparison Trick',
        body: 'Once you know $(x - 2)$ is a factor of $2x^3 - 3x^2 - 8x + 12$, write $(x - 2)(Ax^2 + Bx + C)$: immediately $A = 2$ (from $x \\cdot Ax^2 = 2x^3$) and $C = -6$ (from $-2C = +12$). Matching the $x^2$-coefficient gives $-3 = B - 4 \\implies B = 1$, giving $(x - 2)(2x^2 + x - 6) = (x - 2)(2x - 3)(x + 2)$.',
      },
    ],
    workedExamples: [
      {
        title: 'Solving a cubic with one rational root and two surd roots',
        question: 'Show that $(x + 1)$ is a factor of $f(x) = x^3 - 3x^2 - 6x - 2$, and hence solve $f(x) = 0$ giving answers in exact surd form where appropriate.',
        marks: 5,
        steps: [
          'Check $f(-1) = (-1)^3 - 3(-1)^2 - 6(-1) - 2 = -1 - 3 + 6 - 2 = 0$, so $(x + 1)$ is a factor.',
          'Write $x^3 - 3x^2 - 6x - 2 = (x + 1)(x^2 + bx - 2)$. Matching $x^2$ terms: $b + 1 = -3 \\implies b = -4$.',
          'Check $x$ term: $b - 2 = -4 - 2 = -6$ (matches!). So $f(x) = (x + 1)(x^2 - 4x - 2)$.',
          'Solve $x + 1 = 0 \\implies x = -1$, and use the quadratic formula on $x^2 - 4x - 2 = 0$: $x = \\frac{4 \\pm \\sqrt{16 + 8}}{2} = 2 \\pm \\sqrt{6}$.',
        ],
        answer: '$x = -1, \\quad x = 2 + \\sqrt{6}, \\quad x = 2 - \\sqrt{6}$',
        markSchemeNotes: 'B1 showing $f(-1)=0$, M1 finding $x^2 - 4x - 2$, M1 quadratic formula, A1 all roots simplified ($2 \\pm \\sqrt{6}$).',
      },
    ],
    commonMistakes: [
      'Factorising $f(x)$ correctly into three brackets and then stopping without writing the solved $x$-values when asked to "solve $f(x) = 0$".',
      'Forgetting the initial root $x = -1$ when stating all solutions of the cubic equation.',
    ],
    coursebookTip: 'If a question says "Factorise $f(x)$ completely", look at the quadratic factor even if it looks awkward — verify whether $\\Delta$ is a square number before concluding it cannot factorise.',
    quickCheck: {
      id: '0606-3.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'The cubic $x^3 - 6x^2 + 11x - 6 = 0$ has $x = 1$ and $x = 2$ as two of its roots. Find the third root.',
      answer: '3',
      numericAnswer: 3,
      tolerance: 0,
      hint: 'Sum of roots of $x^3 + px^2 + qx + r = 0$ equals $-p = 6$, or divide out $(x-1)(x-2)$.',
      solution: 'Dividing by $(x-1)(x-2) = x^2 - 3x + 2$ leaves $(x - 3)$, so the third root is $3$ ($1 + 2 + 3 = 6$).',
    },
  },
];
