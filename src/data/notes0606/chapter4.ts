import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_4_NOTES_0606: SubtopicNote[] = [
  {
    id: '4.1',
    chapterId: 4,
    code: '4.1',
    title: 'Solving modulus equations',
    tier: 'Extended',
    summary:
      'Solve $|ax + b| = c$, $|ax + b| = cx + d$, $|ax + b| = |cx + d|$, and $|ax^2 + bx + c| = d$ accurately, always rejecting extraneous roots when the right-hand side is linear.',
    bigIdea:
      'Squaring or splitting cases solves $|A| = B$, yet squaring can create false solutions where $B < 0$ because $|A|$ can never be negative. Always check every candidate root back in the original equation!',
    keyFindings: [
      {
        title: 'Crucial Extraneous-Root Check',
        finding: 'For $|ax + b| = cx + d$, ANY solution making $cx + d < 0$ is **invalid** and must be explicitly rejected!',
      },
    ],
    stepByStepMethod: [
      'For $|ax + b| = k$ ($k \\ge 0$): split into $ax + b = k$ or $ax + b = -k$. (If $k < 0$, there are no solutions.)',
      'For $|ax + b| = cx + d$: solve $ax + b = cx + d$ and $ax + b = -(cx + d)$ (or square both sides), THEN test every root to ensure $cx + d \\ge 0$.',
      'For $|ax + b| = |cx + d|$: either square both sides $(ax+b)^2 = (cx+d)^2$ using difference of two squares, or solve $ax + b = \\pm(cx + d)$ — no extraneous roots occur here because both sides are non-negative.',
      'For $|ax^2 + bx + c| = d$ ($d > 0$): solve two quadratics $ax^2 + bx + c = d$ and $ax^2 + bx + c = -d$.',
    ],
    comparisonTable: {
      title: 'Modulus Equation Strategy Selector',
      headers: ['Equation Type', 'Best Method', 'Extraneous Check Needed?'],
      rows: [
        ['$|ax + b| = k$ ($k \\ge 0$)', '$ax + b = \\pm k$', 'No (provided $k \\ge 0$)'],
        ['$|ax + b| = cx + d$', '$ax + b = \\pm(cx + d)$ + check $cx+d \\ge 0$', 'YES — reject if RHS $< 0$'],
        ['$|ax + b| = |cx + d|$', '$(ax+b)^2 - (cx+d)^2 = 0$', 'No (both sides $\\ge 0$)'],
        ['$|ax^2 + bx + c| = d$', '$ax^2 + bx + c = \\pm d$', 'No (check discriminant of each)'],
      ],
    },
    rapidSummary: [
      { rule: 'Never negative', detail: '$|A| = B \\implies B \\ge 0$ MUST hold.' },
      { rule: 'Squaring trick', detail: '$|u| = |v| \\iff u^2 = v^2 \\iff (u - v)(u + v) = 0$.' },
      { rule: 'Quadratic modulus', detail: 'Check BOTH $f(x) = +d$ and $f(x) = -d$ for up to 4 roots.' },
    ],
    coreObjectives: [
      'Solve equations of the type $|ax + b| = c$ ($c \\ge 0$), $|ax + b| = cx + d$, $|ax + b| = |cx + d|$, and $|ax^2 + bx + c| = d$, graphically or algebraically.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Two-modulus identity', latex: '|u| = |v| \\iff u^2 = v^2 \\iff (u - v)(u + v) = 0' },
    ],
    studyNotes: [
      {
        heading: 'Why Graph + Algebra Saves Marks on $|ax+b| = cx+d$',
        body: 'A V-shaped graph $y = |2x - 1|$ and a straight line $y = x - 3$ may cut once, twice, or not at all! Sketching the gradient ($2$ vs $1$) instantly warns you if one of the two algebraic branches never intersects the true V-arm.',
      },
    ],
    workedExamples: [
      {
        title: 'Detecting and rejecting an extraneous root',
        question: 'Solve the equation $|3x - 2| = x - 4$.',
        marks: 3,
        steps: [
          'Method 1 (Cases): $3x - 2 = x - 4 \\implies 2x = -2 \\implies x = -1$, OR $3x - 2 = -(x - 4) \\implies 4x = 6 \\implies x = 1.5$.',
          'Check $x = -1$: RHS $= -1 - 4 = -5 < 0$, while LHS $= |-5| = 5$. Invalid!',
          'Check $x = 1.5$: RHS $= 1.5 - 4 = -2.5 < 0$, while LHS $= |2.5| = 2.5$. Also invalid!',
          '(Note: Because $|3x - 2|$ rises steeper than $x - 4$ and its vertex $(2/3, 0)$ lies above $x - 4$ everywhere, there are no solutions.)',
        ],
        answer: 'No real solutions',
        markSchemeNotes: 'M1 for solving linear branches, A1 obtaining $-1$ and $1.5$, A1 rejecting both because RHS $< 0$.',
      },
    ],
    commonMistakes: [
      'Accepting a root of $|ax + b| = cx + d$ obtained from squaring without checking $cx + d \\ge 0$.',
      'Forgetting the $-d$ case when solving $|ax^2 + bx + c| = d$.',
    ],
    coursebookTip: 'Show your substitution check explicitly ("check $x = \\dots$: RHS $< 0$, reject") — examiners award an A1 specifically for rejecting invalid roots.',
    quickCheck: {
      id: '0606-4.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Find the sum of all solutions to $|2x - 1| = |x + 5|$.',
      answer: '4.67',
      acceptedAnswers: ['14/3', '4.67'],
      numericAnswer: 14 / 3,
      tolerance: 0.02,
      hint: 'Solve $2x - 1 = x + 5$ and $2x - 1 = -(x + 5)$, then add the two roots.',
      solution: 'Case 1: $2x - 1 = x + 5 \\implies x = 6$. Case 2: $2x - 1 = -x - 5 \\implies 3x = -4 \\implies x = -\\frac{4}{3}$. Sum $= 6 - \\frac{4}{3} = \\frac{14}{3} \\approx 4.67$.',
    },
  },
  {
    id: '4.2',
    chapterId: 4,
    code: '4.2',
    title: 'Modulus inequalities & hidden quadratics',
    tier: 'Extended',
    summary:
      'Solve modulus inequalities ($|ax+b| < c$, $|ax+b| > cx+d$, $|ax+b| \\le |cx+d|$) and reduce disguised equations by substitution (e.g. $x^{2/3}$, $e^x$, $\\ln x$).',
    bigIdea:
      'Modulus inequalities turn into double linear inequalities or squared quadratics; disguised equations reveal familiar quadratics as soon as you define $u = x^{1/3}$, $u = e^x$, or $u = \\ln x$.',
    keyFindings: [
      {
        title: 'Squaring Preserves Inequalities Between Non-Negatives',
        finding: 'Since $|A| \\ge 0$ and $|B| \\ge 0$, $|A| > |B| \\iff A^2 > B^2 \\iff (A - B)(A + B) > 0$.',
      },
    ],
    stepByStepMethod: [
      'For $|ax + b| < c$ ($c > 0$): write $-c < ax + b < c$ and isolate $x$ across all three parts.',
      'For $|ax + b| > c$ ($c > 0$): split into TWO separate tails: $ax + b < -c$ OR $ax + b > c$.',
      'For hidden quadratics like $x^{2/3} - 5x^{1/3} + 6 = 0$, let $u = x^{1/3}$, solve for $u$, then reverse the substitution ($x = u^3$).',
      'Discard any invalid $u$-roots if $u = e^x$ ($u$ MUST be $> 0$!) or $u = \\sqrt{x}$ ($u \\ge 0$).',
    ],
    rapidSummary: [
      { rule: 'Sandwich rule', detail: '$|u| \\le k \\iff -k \\le u \\le k$.' },
      { rule: 'Two-tail rule', detail: '$|u| > k \\iff u < -k \\text{ or } u > k$.' },
      { rule: 'Hidden $e^x$ root', detail: 'If $u = e^x$, any negative root $u < 0$ yields NO real $x$.' },
    ],
    coreObjectives: [
      'Solve graphically or algebraically equations and inequalities of the type $|ax + b| > c$, $|ax + b| \\le cx + d$, and $|ax + b| < |cx + d|$.',
      'Use substitution to form and solve a quadratic equation in disguise (such as $x^{2/3}$, $e^x$, or $\\ln 5x$).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Double inequality', latex: '|ax + b| < c \\iff -c < ax + b < c' },
      { label: 'Substitution power law', latex: 'x^{2n} = (x^n)^2, \\qquad e^{2x} = (e^x)^2' },
    ],
    studyNotes: [
      {
        heading: 'Examples of Hidden Quadratics on 0606 Papers',
        body: 'Watch for the middle term — it always tells you what substitution $u$ to pick:',
        bullets: [
          '$2x^{2/3} + x^{1/3} - 6 = 0 \\implies$ let $u = x^{1/3}$ so $2u^2 + u - 6 = 0$.',
          '$(\\ln x)^2 - 3\\ln x + 2 = 0 \\implies$ let $u = \\ln x$ so $u^2 - 3u + 2 = 0 \\implies x = e^1, e^2$.',
          '$3e^x + 4e^{-x} = 8 \\implies$ multiply through by $e^x$: $3(e^x)^2 - 8e^x + 4 = 0$.',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Solving a hidden exponential quadratic',
        question: 'Solve the equation $2e^{2x} - 5e^x - 3 = 0$, giving exact answers.',
        marks: 4,
        steps: [
          'Let $u = e^x$ (noting $u > 0$ for all real $x$). The equation becomes $2u^2 - 5u - 3 = 0$.',
          'Factorise: $(2u + 1)(u - 3) = 0 \\implies u = -\\frac{1}{2}$ or $u = 3$.',
          'Reject $u = -\\frac{1}{2}$ because $e^x > 0$ always.',
          'From $e^x = 3$, take natural logs: $x = \\ln 3$.',
        ],
        answer: '$x = \\ln 3$',
        markSchemeNotes: 'M1 substituting $u = e^x$, A1 factorising, B1 rejecting $u = -1/2$, A1 for $x = \\ln 3$.',
      },
    ],
    commonMistakes: [
      'Solving $u^2 - 5u + 6 = 0$ to get $u = 2, 3$ and forgetting to transform back to $x$ (e.g. $x = 2^3 = 8$ if $u = x^{1/3}$).',
      'Trying to take $\\ln(-0.5)$ instead of rejecting negative $e^x$ values.',
    ],
    coursebookTip: 'For $|ax + b| < |cx + d|$, squaring to get $(ax + b)^2 - (cx + d)^2 < 0$ and factoring by difference of two squares avoids messy sign-case trees.',
    quickCheck: {
      id: '0606-4.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Solve $x^{2/3} - 5x^{1/3} + 6 = 0$ and enter the **larger** solution for $x$.',
      answer: '27',
      numericAnswer: 27,
      tolerance: 0,
      hint: 'Let $u = x^{1/3}$, find $u$, then cube $u$.',
      solution: '$u^2 - 5u + 6 = 0 \\implies u = 2$ or $3$, so $x = 2^3 = 8$ or $x = 3^3 = 27$. Larger root is $27$.',
    },
  },
  {
    id: '4.3',
    chapterId: 4,
    code: '4.3',
    title: 'Cubic graphs, |f(x)| cusps & cubic inequalities',
    tier: 'Extended',
    summary:
      'Sketch cubic polynomials in factorised form $y = a(x - \\alpha)(x - \\beta)(x - \\gamma)$, reflect negative branches for $y = |f(x)|$, and solve cubic inequalities.',
    bigIdea:
      'A factorised cubic exposes all $x$-intercepts (including bounces at repeated roots like $(x - 1)^2$) and its end behaviour ($a > 0$ rises from bottom-left to top-right; $a < 0$ falls from top-left to bottom-right).',
    keyFindings: [
      {
        title: 'Multiplicity Rule at Roots',
        finding: 'Simple factor $(x - \\alpha)$ crosses the axis; squared factor $(x - \\alpha)^2$ **touches (bounces)** tangentially at $(\\alpha, 0)$.',
      },
    ],
    stepByStepMethod: [
      'Find all $x$-intercepts by setting each linear factor equal to zero, and note any repeated root $(x - r)^2$.',
      'Find the $y$-intercept by substituting $x = 0$.',
      'Check end behaviour as $x \\to +\\infty$ from the sign of the leading coefficient $a$.',
      'To solve $f(x) \\ge 0$ or $f(x) < 0$, read the $x$-intervals where your sketch is above or below the $x$-axis.',
    ],
    rapidSummary: [
      { rule: 'Positive cubic ($a > 0$)', detail: 'Starts bottom-left ($-\\infty$) and finishes top-right ($+\\infty$).' },
      { rule: 'Negative cubic ($a < 0$)', detail: 'Starts top-left ($+\\infty$) and finishes bottom-right ($-\\infty$).' },
      { rule: 'Repeated factor $(x-r)^2$', detail: 'Graph touches the $x$-axis at $x = r$ without crossing.' },
    ],
    coreObjectives: [
      'Sketch the graphs of cubic polynomials and their moduli, when given as a product of three linear factors.',
      'Solve graphically or algebraically cubic inequalities of the form $f(x) \\ge d$, $f(x) > d$, $f(x) \\le d$ and $f(x) < d$ where $f(x)$ is a product of three linear factors.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Factored cubic', latex: 'y = k(x - \\alpha)(x - \\beta)(x - \\gamma)' },
    ],
    studyNotes: [
      {
        heading: 'Solving Cubic Inequalities Cleanly',
        body: 'Once $f(x) = (x + 2)(x - 1)(x - 4)$ is sketched (crosses at $-2, 1, 4$, rising on the far right), the curve lies on or above the $x$-axis on two intervals: $-2 \\le x \\le 1$ and $x \\ge 4$. Avoid multiplying out into expanded cubic form unless you are shifting by a non-zero constant $d$.',
      },
    ],
    workedExamples: [
      {
        title: 'Sketching a cubic with a repeated factor and solving an inequality',
        question: 'Solve the cubic inequality $(x + 1)(x - 2)^2 > 0$.',
        marks: 3,
        steps: [
          'Identify roots: crosses at $x = -1$ and touches (bounces) at $x = 2$.',
          'As $x \\to \\infty$, the leading coefficient is $+1 > 0$, so the curve rises above the $x$-axis for $x > 2$ and also stays positive between $-1$ and $2$ because it only touches $0$ at $x = 2$.',
          'Since the inequality is strict ($> 0$), exclude the roots $x = -1$ and $x = 2$ themselves.',
        ],
        answer: '$x > -1, \\; x \\neq 2$ (equivalently $-1 < x < 2$ or $x > 2$)',
        markSchemeNotes: 'M1 sketch showing touch at $x=2$ & crossing at $x=-1$, A1 for $x > -1$, A1 excluding $x = 2$.',
      },
    ],
    commonMistakes: [
      'Including the tangent point $x = 2$ inside a strict inequality $(x+1)(x-2)^2 > 0$.',
      'Reflecting only one side of a cubic below the $x$-axis when sketching $y = |f(x)|$.',
    ],
    coursebookTip: 'Always double-check one test point (such as $x = 0$) in $(x - \\alpha)(x - \\beta)(x - \\gamma)$ to confirm which regions lie above vs below the $x$-axis.',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-4.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Find the $y$-intercept of $y = |2(x + 1)(x - 3)(x - 2)|$.',
      answer: '12',
      numericAnswer: 12,
      tolerance: 0,
      hint: 'Substitute $x = 0$ inside the modulus bars.',
      solution: '$y = |2(1)(-3)(-2)| = |12| = 12$.',
    },
  },
];
