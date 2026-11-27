import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_6_NOTES_0606: SubtopicNote[] = [
  {
    id: '6.1',
    chapterId: 6,
    code: '6.1',
    title: 'Exponential & logarithmic functions, graphs & asymptotes',
    tier: 'Extended',
    summary:
      'Know the key features, intercepts, asymptotes, and inverse symmetry of $y = ke^{nx} + a$ and $y = k\\ln(ax + b)$ as well as $y = a^x$ and $y = \\log_a x$.',
    bigIdea:
      'Exponential functions $y = e^x$ and logarithmic functions $y = \\ln x$ are mirror inverses across $y = x$: $y = ke^{nx} + a$ has a horizontal asymptote $y = a$, while $y = k\\ln(ax + b)$ has a vertical asymptote $ax + b = 0$.',
    keyFindings: [
      {
        title: 'Asymptotes & Intercepts of Transformed Curves',
        finding: 'Horizontal asymptote of $y = ke^{nx} + a$ is $y = a$; vertical asymptote of $y = k\\ln(ax + b)$ is $x = -\\frac{b}{a}$.',
        noteBox:
          'Remember $e^{nx} > 0$ ALWAYS: shifting up/down by $+a$ pushes the curve strictly above $y = a$ (if $k > 0$) or strictly below $y = a$ (if $k < 0$).',
      },
    ],
    stepByStepMethod: [
      'Identify the asymptote first: $y = a$ for $y = ke^{nx} + a$, or $ax + b = 0$ for $y = k\\ln(ax + b)$.',
      'Find the $y$-intercept (if in domain) by setting $x = 0$: e.g. $y = ke^0 + a = k + a$.',
      'Find any $x$-intercept by setting $y = 0$: remember $\\ln 1 = 0$ and $e^{nx} > 0$ (so no $x$-intercept if $e^{nx}$ equals a negative number).',
      'Check direction as $x \\to \\pm\\infty$ depending on the signs of $k$ and $n$.',
    ],
    comparisonTable: {
      title: 'Exponential & Logarithmic Domains, Ranges & Asymptotes',
      headers: ['Function', 'Domain', 'Range', 'Asymptote'],
      rows: [
        ['$y = e^x$', '$x \\in \\mathbb{R}$', '$y > 0$', '$y = 0$ ($x$-axis)'],
        ['$y = ke^{nx} + a$ ($k>0$)', '$x \\in \\mathbb{R}$', '$y > a$', '$y = a$'],
        ['$y = \\ln x$', '$x > 0$', '$y \\in \\mathbb{R}$', '$x = 0$ ($y$-axis)'],
        ['$y = k\\ln(ax + b)$ ($a>0$)', '$x > -\\frac{b}{a}$', '$y \\in \\mathbb{R}$', '$x = -\\frac{b}{a}$'],
      ],
    },
    rapidSummary: [
      { rule: 'Inverse pair', detail: '$y = e^x \\iff x = \\ln y$, reflected in $y = x$.' },
      { rule: 'Natural log shorthand', detail: '$\\ln x \\equiv \\log_e x$; $\\lg x \\equiv \\log_{10} x$.' },
      { rule: 'Special exact values', detail: '$e^0 = 1$, $\\ln 1 = 0$, $\\ln e = 1$, $e^{\\ln x} = x$, $\\ln(e^x) = x$.' },
    ],
    coreObjectives: [
      'Know and use simple properties and graphs of the logarithmic and exponential functions, including $\\ln x$ and $e^x$.',
      'Draw and interpret $y = ke^{nx} + a$ and $y = k\\ln(ax + b)$ where $n, k, a, b$ are integers, identifying asymptotes and intercepts.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Log–Exponential conversion', latex: 'y = a^x \\iff x = \\log_a y \\quad (a > 0, a \\neq 1, y > 0)' },
      { label: 'Inverse cancellation', latex: 'e^{\\ln u} = u \\;(u > 0), \\qquad \\ln(e^v) = v' },
    ],
    studyNotes: [
      {
        heading: 'Sketching $y = ke^{nx} + a$ and $y = k\\ln(ax + b)$',
        body: 'Examiners award dedicated marks for: (1) drawing a dotted asymptote line with its equation labelled, (2) marking exact axes crossings (e.g. $(0, k+a)$ or $(\\frac{1-b}{a}, 0)$), and (3) showing the curve approaching—never crossing or curling away from—its asymptote.',
      },
    ],
    workedExamples: [
      {
        title: 'Asymptote and intercepts of $y = 2\\ln(3x - 6)$',
        question: 'State the equation of the asymptote and the exact coordinates of the $x$-axis crossing for the curve $y = 2\\ln(3x - 6)$.',
        marks: 3,
        steps: [
          'The log argument must be positive: $3x - 6 > 0 \\implies x > 2$.',
          'Hence the vertical asymptote is $x = 2$.',
          'Set $y = 0$: $2\\ln(3x - 6) = 0 \\implies \\ln(3x - 6) = 0 \\implies 3x - 6 = e^0 = 1 \\implies 3x = 7 \\implies x = \\frac{7}{3}$.',
        ],
        answer: 'Asymptote $x = 2$; $x$-intercept $\\left(\\frac{7}{3}, 0\\right)$',
        markSchemeNotes: 'B1 asymptote $x = 2$, M1 setting $3x - 6 = 1$, A1 for $\\left(\\frac{7}{3}, 0\\right)$.',
      },
    ],
    commonMistakes: [
      'Writing $\\ln 0 = 1$ or thinking $\\ln(3x - 6) = 0$ gives $3x - 6 = 0$ instead of $3x - 6 = 1$.',
      'Drawing the curve touching or crossing its asymptote on sketches.',
    ],
    coursebookTip: 'Check your sketch coordinates at $x = 0$ and $y = 0$ before moving on: $\\ln 1 = 0$ and $e^0 = 1$ solve almost every intercept calculation.',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-6.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'State the $y$-coordinate of the horizontal asymptote of $y = 5e^{-2x} - 4$.',
      answer: '-4',
      numericAnswer: -4,
      tolerance: 0,
      hint: 'As $x \\to +\\infty$, what happens to $5e^{-2x}$?',
      solution: 'As $x \\to +\\infty$, $e^{-2x} \\to 0$, so $y \\to 0 - 4 = -4$. The horizontal asymptote is $y = -4$.',
    },
  },
  {
    id: '6.2',
    chapterId: 6,
    code: '6.2',
    title: 'Laws of logarithms & change of base',
    tier: 'Extended',
    summary:
      'Combine and expand logarithmic expressions using the product, quotient, and power laws, plus change of base $\\log_a b = \\frac{\\ln b}{\\ln a}$.',
    bigIdea:
      'Logarithms ARE exponents: multiplying numbers adds their exponents ($\\log_a(xy) = \\log_a x + \\log_a y$), dividing subtracts them, and raising to a power multiplies the exponent.',
    keyFindings: [
      {
        title: 'Coefficients Before Combining Logs',
        finding: 'Before applying $\\log A + \\log B = \\log(AB)$, move every scalar multiplier inside as a power: $k\\log_a x = \\log_a(x^k)$.',
      },
    ],
    stepByStepMethod: [
      'Convert plain numbers into logs of the same base if needed: $k = k\\log_a a = \\log_a(a^k)$.',
      'Move leading coefficients inside as exponents: $2\\log_a x = \\log_a(x^2)$.',
      'Combine terms left-to-right using $\\log_a M + \\log_a N = \\log_a(MN)$ and $\\log_a M - \\log_a N = \\log_a\\!\\left(\\frac{M}{N}\\right)$.',
      'If bases differ (e.g. $\\log_2 x$ and $\\log_4 x$), convert to a common base using $\\log_a b = \\frac{\\log_c b}{\\log_c a}$ (especially $\\log_{a^2} x = \\frac{1}{2}\\log_a x$).',
    ],
    rapidSummary: [
      { rule: 'Product law', detail: '$\\log_a(xy) = \\log_a x + \\log_a y$' },
      { rule: 'Quotient law', detail: '$\\log_a\\!\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y$' },
      { rule: 'Power law', detail: '$\\log_a(x^n) = n\\log_a x$' },
      { rule: 'Change of base', detail: '$\\log_a b = \\frac{\\log_c b}{\\log_c a} \\implies \\log_a b = \\frac{1}{\\log_b a}$' },
    ],
    coreObjectives: [
      'Know and use the laws of logarithms, including change of base $\\log_a b = \\frac{\\log_c b}{\\log_c a}$.',
      'Simplify and combine algebraic log expressions into a single logarithm or express quantities in terms of $\\log_a p$ and $\\log_a q$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Three log laws', latex: '\\log_a(xy)=\\log_a x+\\log_a y,\\quad \\log_a\\!\\left(\\frac{x}{y}\\right)=\\log_a x-\\log_a y,\\quad \\log_a(x^k)=k\\log_a x' },
      { label: 'Change of base', latex: '\\log_a b = \\frac{\\log_c b}{\\log_c a} = \\frac{1}{\\log_b a}' },
    ],
    studyNotes: [
      {
        heading: 'Fake Identities to NEVER Use',
        body: 'Logarithms do NOT distribute over addition or division inside a single log:',
        bullets: [
          '$\\log(x + y) \\neq \\log x + \\log y$ (never split a sum inside one $\\log$!).',
          '$\\frac{\\log x}{\\log y} \\neq \\log(x - y)$ — $\\frac{\\log x}{\\log y}$ actually equals $\\log_y x$!',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Combining mixed-base logs cleanly',
        question: 'Express $\\log_9 x + 2\\log_3 y - \\frac{1}{2}$ as a single logarithm in base $3$.',
        marks: 4,
        steps: [
          'Change base on the first term: $\\log_9 x = \\frac{\\log_3 x}{\\log_3 9} = \\frac{\\log_3 x}{2} = \\log_3(\\sqrt{x})$.',
          'Move power in second term: $2\\log_3 y = \\log_3(y^2)$.',
          'Rewrite constant in base $3$: $\\frac{1}{2} = \\frac{1}{2}\\log_3 3 = \\log_3(\\sqrt{3})$.',
          'Combine using product and quotient laws: $\\log_3\\!\\left(\\frac{y^2\\sqrt{x}}{\\sqrt{3}}\\right)$.',
        ],
        answer: '$\\log_3\\!\\left(\\frac{y^2\\sqrt{x}}{\\sqrt{3}}\\right)$',
        markSchemeNotes: 'M1 change of base to $\\frac{1}{2}\\log_3 x$, B1 $2\\log_3 y = \\log_3(y^2)$, B1 $\\frac{1}{2} = \\log_3\\sqrt{3}$, A1 single log.',
      },
    ],
    commonMistakes: [
      'Rewriting $\\log(x + 2)$ as $\\log x + \\log 2$.',
      'Forgetting to divide by $\\log_a c$ when changing bases.',
    ],
    coursebookTip: 'Memorise the handy shortcut $\\log_{a^k}(x) = \\frac{1}{k}\\log_a x$ — it turns $\\log_4 x$ and $\\log_8 x$ into base-$2$ logarithms in one line.',
    quickCheck: {
      id: '0606-6.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Evaluate $\\log_2 10 + \\log_2 6.4 - 2\\log_2 2$.',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: 'First write $2\\log_2 2 = \\log_2(2^2) = \\log_2 4$, then combine into a single $\\log_2$.',
      solution: '$\\log_2\\!\\left(\\frac{10 \\times 6.4}{4}\\right) = \\log_2(16) = 4$.',
    },
  },
  {
    id: '6.3',
    chapterId: 6,
    code: '6.3',
    title: 'Solving logarithmic & exponential equations',
    tier: 'Extended',
    summary:
      'Solve equations of the form $a^x = b$, $a^{2x} + p\\,a^x + q = 0$, and logarithmic equations, always checking that all logarithm arguments stay strictly positive.',
    bigIdea:
      'Two main weapons solve every equation here: (1) combine into $\\log_a M = \\log_a N$ or $\\log_a M = k \\implies M = a^k$, and (2) take $\\ln$ or $\\lg$ of both sides when the unknown sits in an exponent.',
    keyFindings: [
      {
        title: 'Domain Verification on Log Roots',
        finding: 'After solving $\\log_a(x + 2) + \\log_a(x - 1) = k$, reject any root making $(x + 2) \\le 0$ or $(x - 1) \\le 0$ in the ORIGINAL equation!',
      },
    ],
    stepByStepMethod: [
      'For equations like $3^{2x - 1} = 5^{x + 2}$, take $\\ln$ (or $\\lg$) of both sides and bring exponents down: $(2x - 1)\\ln 3 = (x + 2)\\ln 5$.',
      'Expand brackets, collect $x$-terms on one side, factor out $x$, and divide cleanly.',
      'For equations like $\\log_a f(x) + \\log_a g(x) = k$, combine into $\\log_a(f(x)g(x)) = k$, then rewrite as $f(x)g(x) = a^k$.',
      'Solve the resulting algebraic equation and verify EVERY candidate makes every original log argument $> 0$.',
    ],
    rapidSummary: [
      { rule: 'Exponential $a^x = b$', detail: '$x = \\frac{\\ln b}{\\ln a} = \\frac{\\lg b}{\\lg a}$ (requires $b > 0$).' },
      { rule: 'Log equation', detail: 'Combine to $\\log_a(\\dots) = k \\implies (\\dots) = a^k$.' },
      { rule: 'Reject invalid roots', detail: 'Any $x$ giving $\\log(\\le 0)$ is extraneous and loses the final A1 if left unrejected.' },
    ],
    coreObjectives: [
      'Solve equations of the form $a^x = b$, including cases involving different bases and exponential quadratics.',
      'Solve logarithmic equations with same or different bases and reject invalid solutions.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Exponential solver', latex: 'a^{f(x)} = b^{g(x)} \\implies f(x)\\ln a = g(x)\\ln b' },
      { label: 'Base conversion equation', latex: '\\log_a u = k \\iff u = a^k \\quad (u > 0)' },
    ],
    studyNotes: [
      {
        heading: 'Watch $3^x$ vs $2^{x}$ Mixed Equations',
        body: 'In $2 \\cdot 3^{2x} = 5^{x + 1}$, do NOT try to combine $2$ and $3$ into $6^{2x}$! Instead take logs first: $\\ln 2 + 2x\\ln 3 = (x + 1)\\ln 5$, then group $x(2\\ln 3 - \\ln 5) = \\ln 5 - \\ln 2$.',
      },
    ],
    workedExamples: [
      {
        title: 'Logarithmic equation with an extraneous root',
        question: 'Solve $\\log_2(x + 3) + \\log_2(x - 3) = 4$.',
        marks: 4,
        steps: [
          'Combine logs: $\\log_2((x + 3)(x - 3)) = 4 \\implies \\log_2(x^2 - 9) = 4$.',
          'Rewrite in exponential form: $x^2 - 9 = 2^4 = 16 \\implies x^2 = 25$.',
          'So $x = 5$ or $x = -5$.',
          'Domain check: for $x = -5$, $x + 3 = -2 \\le 0$ and $x - 3 = -8 \\le 0$, so reject $x = -5$. For $x = 5$, both $8 > 0$ and $2 > 0$.',
        ],
        answer: '$x = 5$',
        markSchemeNotes: 'M1 product law, M1 $x^2 - 9 = 16$, A1 $x = \\pm 5$, A1 rejecting $-5$ to leave $x = 5$.',
      },
    ],
    commonMistakes: [
      'Cancelling $\\log$ from $\\log A + \\log B = 4$ to get $A + B = 2^4$ instead of multiplying $AB = 2^4$.',
      'Keeping $x = -5$ in $\\log_2(x + 3) + \\log_2(x - 3) = 4$.',
    ],
    coursebookTip: 'In Paper 2 Calculator questions solving $3^{2x} = 5^{x+1}$, keep exact log expressions like $\\frac{\\ln 5}{2\\ln 3 - \\ln 5}$ until the final step so there are zero intermediate rounding errors.',
    quickCheck: {
      id: '0606-6.3-qc',
      marks: 3,
      paperType: 'Non-Calculator',
      prompt: 'Solve $\\log_3(2x - 1) = 2 + \\log_3(x - 4)$ for $x$.',
      answer: '5',
      numericAnswer: 5,
      tolerance: 0,
      hint: 'Move $\\log_3(x - 4)$ to the left so $\\log_3\\!\\left(\\frac{2x - 1}{x - 4}\\right) = 2 = \\log_3 9$.',
      solution: '$\\frac{2x - 1}{x - 4} = 3^2 = 9 \\implies 2x - 1 = 9x - 36 \\implies 7x = 35 \\implies x = 5$ (valid since $x > 4$).',
    },
  },
];
