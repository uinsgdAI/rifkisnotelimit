import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_5_NOTES_0606: SubtopicNote[] = [
  {
    id: '5.1',
    chapterId: 5,
    code: '5.1',
    title: 'Linear & non-linear simultaneous equations',
    tier: 'Extended',
    summary:
      'Solve simultaneous systems pairing one linear equation with a quadratic, hyperbola ($xy = k$), or rational equation by substitution, and interpret solutions geometrically.',
    bigIdea:
      'Isolate the simpler variable ($x$ or $y$) from the linear equation—choosing whichever avoids awkward fractions—substitute into the non-linear equation, solve the quadratic, and **pair** every $(x, y)$ coordinate clearly.',
    keyFindings: [
      {
        title: 'Choose the Fraction-Free Substitution',
        finding: 'In $2x - y = 5$, rearrange for $y = 2x - 5$ rather than $x = \\frac{y + 5}{2}$ so you don’t square fractions.',
      },
      {
        title: 'Fractional & Product Systems',
        finding: 'Clear fractions (e.g. $\\frac{x}{y} + \\frac{2y}{x} = 4 \\implies x^2 + 2y^2 = 4xy$) BEFORE substituting the linear expression.',
      },
    ],
    stepByStepMethod: [
      'Pick the linear equation and make $x$ or $y$ the subject with minimal fractions.',
      'If the non-linear equation contains fractions ($\\frac{1}{x} + \\frac{1}{y}$ or $\\frac{x}{y}$), multiply through by the common denominator first.',
      'Substitute into the non-linear equation, expand brackets carefully, and collect terms to get $Ax^2 + Bx + C = 0$.',
      'Solve for the two values of the first variable, then substitute **each** back into the **linear** equation to find its paired coordinate.',
    ],
    rapidSummary: [
      { rule: 'Always back-sub in linear', detail: 'Substitute roots back into the **linear** equation (quadratic back-sub can give extra false coordinates!).' },
      { rule: 'Number of pairs', detail: 'Usually 2 solution pairs $(x_1, y_1), (x_2, y_2)$; 1 pair means the line is tangent to the curve.' },
      { rule: 'Domain checks', detail: 'In $\\frac{x}{y} + \\frac{2y}{x} = 4$, ensure $x \\neq 0$ and $y \\neq 0$.' },
    ],
    coreObjectives: [
      'Solve simultaneous equations in two unknowns by elimination or substitution, where one equation is linear and the other is non-linear (including quadratic curves, $xy^2 = 4$, or fractional equations).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Tangent intersection', latex: 'b^2 - 4ac = 0 \\implies \\text{one repeated intersection pair } (x_0, y_0)' },
    ],
    studyNotes: [
      {
        heading: 'Classic Syllabus Patterns (0606 Section 5.1)',
        body: 'Be fluent across all three standard Cambridge non-linear forms:',
        bullets: [
          'Quadratic curve + line: $y - x + 3 = 0$ and $x^2 - 3xy + y^2 + 19 = 0$.',
          'Symmetric/reciprocal fraction form: $\\frac{x}{y} + \\frac{2y}{x} = 4$ and $y = x - 2$ (clear $xy$ first $\\to x^2 + 2y^2 = 4xy$).',
          'Elimination by division when both are product-power equations: $xy^2 = 4$ and $xy = 3 \\implies \\frac{xy^2}{xy} = \\frac{4}{3} \\implies y = \\frac{4}{3}, x = \\frac{9}{4}$.',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Quadratic system with mixed $xy$ term',
        question: 'Solve the simultaneous equations $y - x + 3 = 0$ and $x^2 - 3xy + y^2 + 19 = 0$.',
        marks: 5,
        steps: [
          'From the linear equation, $y = x - 3$.',
          'Substitute into the second equation: $x^2 - 3x(x - 3) + (x - 3)^2 + 19 = 0$.',
          'Expand carefully: $x^2 - 3x^2 + 9x + x^2 - 6x + 9 + 19 = 0 \\implies -x^2 + 3x + 28 = 0 \\implies x^2 - 3x - 28 = 0$.',
          'Factorise: $(x - 7)(x + 4) = 0 \\implies x = 7$ or $x = -4$.',
          'Find $y = x - 3$: when $x = 7, y = 4$; when $x = -4, y = -7$.',
        ],
        answer: '$(7, 4)$ and $(-4, -7)$',
        markSchemeNotes: 'M1 substituting $y=x-3$, M1 simplifying to $x^2-3x-28=0$, A1 $x$-values, A1+A1 correctly paired $y$-values.',
      },
      {
        title: 'Product equations $xy^2 = 4$ and $xy = 3$',
        question: 'Solve $xy^2 = 4$ and $xy = 3$.',
        marks: 2,
        steps: [
          'Divide $xy^2 = 4$ by $xy = 3$ (valid since $x, y \\neq 0$): $y = \\frac{4}{3}$.',
          'Substitute $y = \\frac{4}{3}$ into $xy = 3$: $x \\cdot \\frac{4}{3} = 3 \\implies x = \\frac{9}{4}$.',
        ],
        answer: '$x = \\frac{9}{4}, \\; y = \\frac{4}{3}$',
        markSchemeNotes: 'M1 dividing equations or substituting $x = 3/y$, A1 both values.',
      },
    ],
    commonMistakes: [
      'Expanding $-3x(x - 3)$ as $-3x^2 - 9x$ instead of $-3x^2 + 9x$.',
      'Listing $x = 7, -4$ and $y = 4, -7$ separately without clearly pairing $(7, 4)$ and $(-4, -7)$.',
    ],
    coursebookTip: 'Always plug your final $(x, y)$ pairs back into the ORIGINAL non-linear equation mentally or on paper — it takes 10 seconds and guarantees 5/5 marks!',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-5.1-qc',
      marks: 3,
      paperType: 'Non-Calculator',
      prompt: 'Solve simultaneously: $y = 2x - 1$ and $x^2 + y = 7$. Enter the **positive** solution for $x$.',
      answer: '2',
      numericAnswer: 2,
      tolerance: 0,
      hint: 'Substitute $y = 2x - 1$ into $x^2 + y = 7$ and factorise.',
      solution: '$x^2 + 2x - 1 = 7 \\implies x^2 + 2x - 8 = 0 \\implies (x + 4)(x - 2) = 0 \\implies x = 2$ (positive).',
    },
  },
];
