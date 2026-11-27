import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_2_NOTES_0606: SubtopicNote[] = [
  {
    id: '2.1',
    chapterId: 2,
    code: '2.1',
    title: 'Completing the square, extrema & range',
    tier: 'Extended',
    summary:
      'Rewrite $ax^2 + bx + c$ in the completed-square form $a(x + p)^2 + q$ (or use differentiation) to locate stationary points, lines of symmetry, and exact ranges.',
    bigIdea:
      'Because $(x + p)^2 \\ge 0$ for every real $x$, writing $ax^2 + bx + c = a(x + p)^2 + q$ exposes the turning point $(-p, q)$ immediately with zero calculus.',
    keyFindings: [
      {
        title: 'Vertex & Symmetry from $a(x + p)^2 + q$',
        finding: 'Turning point is $(-p, q)$ and axis of symmetry is $x = -p$.',
        noteBox:
          'When $a > 0$, $q$ is the **minimum** value ($f(x) \\ge q$). When $a < 0$, $q$ is the **maximum** value ($f(x) \\le q$).',
      },
    ],
    stepByStepMethod: [
      'Factor out $a$ (even if $a$ is negative or fractional!) from the $x^2$ and $x$ terms only: $a\\left(x^2 + \\frac{b}{a}x\\right) + c$.',
      'Inside the bracket, halve the $x$-coefficient: $\\left(x + \\frac{b}{2a}\\right)^2 - \\left(\\frac{b}{2a}\\right)^2$.',
      'Expand the outer factor $a$ over the subtracted square term and combine with $+c$.',
      'Read off the vertex $(-p, q)$ directly by setting the squared bracket equal to $0$.',
    ],
    rapidSummary: [
      { rule: 'Completed square', detail: '$ax^2 + bx + c = a(x + p)^2 + q$ with vertex $(-p, q)$.' },
      { rule: 'Negative $a$', detail: 'Factor $-1$ carefully: $-x^2 + 6x - 2 = -(x - 3)^2 + 7$, max $7$.' },
      { rule: 'Algebraic check', detail: 'Vertex $x$-coordinate is always $x = -\\frac{b}{2a}$.' },
    ],
    coreObjectives: [
      'Find the maximum or minimum value of the quadratic function $f: x \\mapsto ax^2 + bx + c$ by completing the square or by differentiation.',
      'Use completed-square form to determine the range of a quadratic function or solve $ax^2 + bx + c = 0$ in surd form.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Completed square identity', latex: 'ax^2 + bx + c = a\\left(x + \\frac{b}{2a}\\right)^2 + \\left(c - \\frac{b^2}{4a}\\right)' },
      { label: 'Line of symmetry', latex: 'x = -\\frac{b}{2a}' },
    ],
    studyNotes: [
      {
        heading: 'Handling Non-Monic Quadratics ($a \\neq 1$)',
        body: 'Most errors happen when $a \\neq 1$ or $a < 0$. Never leave $a$ out when multiplying the constant inside the square bracket.',
        bullets: [
          'Example: $3x^2 - 12x + 5 = 3(x^2 - 4x) + 5 = 3[(x - 2)^2 - 4] + 5 = 3(x - 2)^2 - 12 + 5 = 3(x - 2)^2 - 7$.',
          'Check by expanding $3(x^2 - 4x + 4) - 7 = 3x^2 - 12x + 12 - 7 = 3x^2 - 12x + 5$.',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Maximum value of a negative quadratic',
        question: 'Express $5 + 12x - 2x^2$ in the form $a - b(x - c)^2$ and deduce its maximum value and the value of $x$ at which it occurs.',
        marks: 4,
        steps: [
          'Reorder and factor $-2$ from the $x$-terms: $-2(x^2 - 6x) + 5$.',
          'Complete the square inside: $-2[(x - 3)^2 - 9] + 5$.',
          'Expand: $-2(x - 3)^2 + 18 + 5 = 23 - 2(x - 3)^2$.',
          'Since $-2(x - 3)^2 \\le 0$, the maximum value is $23$ when $x = 3$.',
        ],
        answer: '$23 - 2(x - 3)^2$; maximum value $23$ at $x = 3$',
        markSchemeNotes: 'M1 factoring $-2$, A1 for $23 - 2(x - 3)^2$, B1 max $23$, B1 at $x = 3$.',
      },
    ],
    commonMistakes: [
      'Forgetting to multiply the subtracted square term by $a$ when removing outer brackets.',
      'Reversing the sign of the vertex $x$-coordinate: in $(x - 3)^2$, the vertex is at $x = +3$, not $-3$.',
    ],
    coursebookTip: 'Whenever a question says "Hence find the minimum value", you MUST use your completed square rather than differentiating unless differentiation is also permitted — always check the question wording.',
    quickCheck: {
      id: '0606-2.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'When $3x^2 - 12x + 17$ is written as $a(x - p)^2 + q$, find the value of $q$.',
      answer: '5',
      numericAnswer: 5,
      tolerance: 0,
      hint: 'Evaluate at the axis of symmetry $x = -\\frac{b}{2a} = 2$.',
      solution: '$3(x - 2)^2 + q \\implies 3(x^2 - 4x + 4) + q = 3x^2 - 12x + 12 + q = 3x^2 - 12x + 17 \\implies q = 5$.',
    },
  },
  {
    id: '2.2',
    chapterId: 2,
    code: '2.2',
    title: 'Discriminant b² − 4ac & line–curve intersections',
    tier: 'Extended',
    summary:
      'Use $\\Delta = b^2 - 4ac$ to determine whether a quadratic has two distinct roots, repeated/tangent contact, or no real roots, and find ranges of an unknown constant $k$.',
    bigIdea:
      'Equating a line $y = mx + c$ and a curve $y = ax^2 + bx + d$ produces a single quadratic whose discriminant $\\Delta = B^2 - 4AC$ counts the exact number of geometric intersections.',
    keyFindings: [
      {
        title: 'Three Discriminant Regimes',
        finding: '$\\Delta > 0$: 2 distinct real roots (cuts twice). $\\Delta = 0$: 1 repeated root (tangent). $\\Delta < 0$: no real roots (does not meet).',
        noteBox:
          'Phrases like **"meets"**, **"intersects"**, or **"has real roots"** include BOTH $2$ roots and $1$ repeated root, so you MUST use $\\Delta \\ge 0$ (not strict $>$)!',
      },
    ],
    stepByStepMethod: [
      'Eliminate $y$ (or $x$) between the line and quadratic equations and collect every term onto one side as $Ax^2 + Bx + C = 0$.',
      'Identify $A$, $B$, and $C$ carefully in terms of the unknown parameter $k$.',
      'Form $\\Delta = B^2 - 4AC$ and apply the required sign: $>0$, $=0$, $\\ge 0$, or $<0$.',
      'Solve the resulting equation or quadratic inequality for $k$ using a quick sign sketch.',
    ],
    comparisonTable: {
      title: 'Discriminant & Intersection Rules',
      headers: ['Question Wording', 'Geometric Meaning', 'Discriminant Condition'],
      rows: [
        ['Two distinct real roots / cuts at two points', 'Two separate intersections', '$b^2 - 4ac > 0$'],
        ['Equal roots / repeated root / tangent to curve', 'Touches at one point', '$b^2 - 4ac = 0$'],
        ['Has real roots / line meets curve', 'Cuts OR touches', '$b^2 - 4ac \\ge 0$'],
        ['No real roots / does not meet / strictly positive for all $x$ ($a>0$)', 'Zero intersections', '$b^2 - 4ac < 0$'],
      ],
    },
    rapidSummary: [
      { rule: 'Tangent condition', detail: '$b^2 - 4ac = 0$' },
      { rule: 'Always positive quadratic', detail: '$ax^2 + bx + c > 0 \\;\\forall x \\iff a > 0$ AND $b^2 - 4ac < 0$.' },
      { rule: 'Cuts OR touches', detail: 'Use $\\ge 0$ whenever wording says "meets" or "has real roots".' },
    ],
    coreObjectives: [
      'Use the condition for $f(x) = 0$ to have two real roots, two equal roots, or no real roots.',
      'Use the discriminant to determine whether a given line intersects, is a tangent to, or does not intersect a given quadratic curve.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Discriminant', latex: '\\Delta = b^2 - 4ac' },
      { label: 'Always positive quadratic', latex: 'ax^2 + bx + c > 0 \\;\\forall x \\in \\mathbb{R} \\iff a > 0 \\text{ and } b^2 - 4ac < 0' },
    ],
    studyNotes: [
      {
        heading: 'Always Positive / Always Negative Quadratics',
        body: 'If a question states that $kx^2 + 4x + k > 0$ for all real $x$, remember TWO conditions must hold simultaneously: the parabola must open upward ($k > 0$) AND never touch the $x$-axis ($\\Delta = 16 - 4k^2 < 0 \\implies k > 2$ or $k < -2$). Combining both gives $k > 2$.',
      },
    ],
    workedExamples: [
      {
        title: 'Line and curve do not intersect',
        question: 'Find the set of values of $k$ for which the line $y = kx - 1$ does not intersect the curve $y = x^2 - 3x + 8$.',
        marks: 4,
        steps: [
          'Equate the expressions for $y$: $x^2 - 3x + 8 = kx - 1$.',
          'Rearrange into standard form: $x^2 - (3 + k)x + 9 = 0$.',
          'For no intersection, require $b^2 - 4ac < 0$: $(-(3 + k))^2 - 4(1)(9) < 0 \\implies (k + 3)^2 - 36 < 0$.',
          'Critical values: $k + 3 = \\pm 6 \\implies k = 3$ or $k = -9$. Taking the inner region: $-9 < k < 3$.',
        ],
        answer: '$-9 < k < 3$',
        markSchemeNotes: 'M1 equating & rearranging, M1 $\\Delta < 0$, A1 critical values $-9, 3$, A1 for $-9 < k < 3$.',
      },
    ],
    commonMistakes: [
      'Using $\\Delta > 0$ when the question asks when a line "meets" a curve — "meets" includes tangency, so use $\\Delta \\ge 0$.',
      'Forgetting the minus sign in $b$ or failing to keep brackets around $b$, e.g. writing $-3 + k^2$ instead of $(k + 3)^2$.',
    ],
    coursebookTip: 'If $\\Delta = (k + 3)^2 - 36 < 0$, write $(k+3)^2 < 36 \\implies -6 < k + 3 < 6 \\implies -9 < k < 3$ — faster and less error-prone than expanding!',
    quickCheck: {
      id: '0606-2.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'The equation $x^2 - 8x + k = 0$ has equal (repeated) roots. Find $k$.',
      answer: '16',
      numericAnswer: 16,
      tolerance: 0,
      hint: 'Set $b^2 - 4ac = 0$ with $a = 1, b = -8, c = k$.',
      solution: '$(-8)^2 - 4(1)(k) = 0 \\implies 64 = 4k \\implies k = 16$.',
    },
  },
  {
    id: '2.3',
    chapterId: 2,
    code: '2.3',
    title: 'Solving quadratic equations & inequalities',
    tier: 'Extended',
    summary:
      'Solve quadratic equations by factorising, quadratic formula, or completing the square, and solve quadratic inequalities accurately by sketching roots on a parabola.',
    bigIdea:
      'Never multiply or divide an inequality by an unknown expression whose sign could flip, and never drop the inequality sketch: $(x - \\alpha)(x - \\beta) < 0$ holds **between** the roots, while $> 0$ holds **outside** them.',
    keyFindings: [
      {
        title: 'Sketch Rule for Quadratic Inequalities',
        finding: 'Rewrite so $a > 0$ first: $a(x-\\alpha)(x-\\beta) < 0 \\implies \\alpha < x < \\beta$ (1 interval); $> 0 \\implies x < \\alpha \\text{ or } x > \\beta$ (2 separate tails).',
      },
    ],
    stepByStepMethod: [
      'Move all terms to one side so the $x^2$ coefficient is positive.',
      'Find the critical values $\\alpha < \\beta$ by factorising or using the quadratic formula.',
      'Sketch an upward parabola crossing the $x$-axis at $\\alpha$ and $\\beta$.',
      'Read off the interval(s) where the curve sits below ($< 0$) or above ($> 0$) the axis, preserving strict ($<, >$) or inclusive ($\\le, \\ge$) boundaries.',
    ],
    rapidSummary: [
      { rule: 'Between roots', detail: '$(x - \\alpha)(x - \\beta) < 0 \\implies \\alpha < x < \\beta$ (single combined inequality).' },
      { rule: 'Outside roots', detail: '$(x - \\alpha)(x - \\beta) > 0 \\implies x < \\alpha \\text{ or } x > \\beta$ (must write two separate inequalities).' },
      { rule: 'Forbidden notation', detail: 'NEVER write $2 > x > 5$ for an outside-roots solution!' },
    ],
    coreObjectives: [
      'Solve quadratic equations by factorisation, completing the square, and use of the formula.',
      'Solve quadratic inequalities in one unknown and represent solution sets accurately.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Quadratic formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Two-tail inequality', latex: '(x - \\alpha)(x - \\beta) > 0 \\;(\\alpha < \\beta) \\implies x < \\alpha \\text{ or } x > \\beta' },
    ],
    studyNotes: [
      {
        heading: 'Exact Surd Answers vs Decimals',
        body: 'In Paper 1 (Non-Calculator), quadratic equations that do not factorise must be left in exact simplified surd form such as $x = 2 \\pm \\sqrt{7}$. Simplify radicals like $\\sqrt{28} = 2\\sqrt{7}$ before cancelling common factors from numerator and denominator.',
      },
    ],
    workedExamples: [
      {
        title: 'Solving a quadratic inequality with two intervals',
        question: 'Find the set of values of $x$ satisfying $2x^2 + 3x > 20$.',
        marks: 3,
        steps: [
          'Bring all terms to the left: $2x^2 + 3x - 20 > 0$.',
          'Factorise: $(2x - 5)(x + 4) > 0$, giving critical values $x = -4$ and $x = 2.5$.',
          'Since the parabola opens upward ($a = 2 > 0$) and we want $> 0$ (above the $x$-axis), choose the outer tails.',
        ],
        answer: '$x < -4$ or $x > 2.5$',
        markSchemeNotes: 'M1 factorising $(2x - 5)(x + 4)$, A1 critical values $-4$ & $2.5$, A1 for $x < -4$ or $x > 2.5$.',
      },
    ],
    commonMistakes: [
      'Writing "$x < -4$ and $x > 2.5$" instead of "or" — no number can simultaneously be less than $-4$ and greater than $2.5$.',
      'Turning $(2x - 5)(x + 4) > 0$ into $x > 2.5$ and $x > -4$ directly from the linear factors without sketching.',
    ],
    coursebookTip: 'If a question says "solve $x^2 \\le 9$", sketch $y = x^2 - 9$ — never write $x \\le \\pm 3$! The correct answer is $-3 \\le x \\le 3$.',
    quickCheck: {
      id: '0606-2.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'How many integer values of $x$ satisfy the inequality $x^2 - 2x - 8 < 0$?',
      answer: '5',
      numericAnswer: 5,
      tolerance: 0,
      hint: 'Factorise $(x - 4)(x + 2) < 0$ and list the integers strictly between $-2$ and $4$.',
      solution: 'The inequality holds for $-2 < x < 4$. Integers in this open interval are $-1, 0, 1, 2, 3$ — a total of $5$ integers.',
    },
  },
];
