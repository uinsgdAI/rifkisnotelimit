import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_14_NOTES_0606: SubtopicNote[] = [
  {
    id: '14.1',
    chapterId: 14,
    code: '14.1',
    title: 'Derived function notation & standard derivatives',
    tier: 'Extended',
    summary:
      'Understand the derivative as the limiting gradient $\\lim_{\\delta x \\to 0}\\frac{\\delta y}{\\delta x}$, use $f\'(x), f\'\'(x), \\frac{dy}{dx}, \\frac{d^2y}{dx^2}$, and differentiate $x^n$ (any rational $n$), $e^x$, $\\ln x$, $\\sin x$, $\\cos x$, and $\\tan x$ (angles in radians).',
    bigIdea:
      'Differentiation turns a curve $y = f(x)$ into a gradient formula $\\frac{dy}{dx}$. In Calculus, ALL trigonometric angles MUST be in radians — otherwise the standard derivatives $\\frac{d}{dx}(\\sin x) = \\cos x$, $\\frac{d}{dx}(\\cos x) = -\\sin x$, and $\\frac{d}{dx}(\\tan x) = \\sec^2 x$ fail by a factor of $\\frac{\\pi}{180}$.',
    keyFindings: [
      {
        title: 'NO Calculus Formulas Are Printed in the 0606 Exam Sheet',
        finding:
          'Unlike Series and Quadratics, the 2025–2027 0606 Formula List contains ZERO calculus rules! You must memorise every standard derivative and integral cleanly.',
      },
    ],
    stepByStepMethod: [
      'Rewrite roots and fractions as powers first: $\\sqrt{x} = x^{1/2}$, $\\frac{5}{x^3} = 5x^{-3}$, $\\frac{x^2 + 3}{\\sqrt{x}} = x^{3/2} + 3x^{-1/2}$.',
      'Simplify logarithms if helpful before differentiating: $\\ln(e^x) = x$, $\\ln(x^3) = 3\\ln x$, $\\ln(5x) = \\ln 5 + \\ln x$ (whose derivative is simply $\\frac{1}{x}$!).',
      'Apply power/trig/exp/log rules term by term; remember constants differentiate to $0$.',
      'Differentiate a second time to get $\\frac{d^2y}{dx^2} = \\frac{d}{dx}\\!\\left(\\frac{dy}{dx}\\right)$ or $f\'\'(x)$.',
    ],
    comparisonTable: {
      title: 'Standard 0606 Derivatives (Memorise — Radians Only)',
      headers: ['Function $f(x)$', 'Derivative $f\'(x)$', 'Chain Rule Form $f(ax+b)$'],
      rows: [
        ['$x^n$ ($n \\in \\mathbb{Q}$)', '$nx^{n-1}$', '$a n (ax+b)^{n-1}$'],
        ['$e^x$', '$e^x$', '$a e^{ax+b}$'],
        ['$\\ln x$', '$\\frac{1}{x}$', '$\\frac{a}{ax+b}$'],
        ['$\\sin x$', '$\\cos x$', '$a\\cos(ax+b)$'],
        ['$\\cos x$', '$-\\sin x$', '$-a\\sin(ax+b)$'],
        ['$\\tan x$', '$\\sec^2 x$', '$a\\sec^2(ax+b)$'],
      ],
    },
    rapidSummary: [
      { rule: 'Limit & second derivative', detail: '$\\frac{dy}{dx} = \\lim_{\\delta x \\to 0}\\frac{\\delta y}{\\delta x}$, and $\\frac{d^2y}{dx^2} = \\frac{d}{dx}\\!\\left(\\frac{dy}{dx}\\right)$.' },
      { rule: 'Exponential & log', detail: '$\\frac{d}{dx}(e^x) = e^x$ and $\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$.' },
      { rule: 'Trig derivatives (radians)', detail: '$(\\sin x)\' = \\cos x$, $(\\cos x)\' = -\\sin x$, $(\\tan x)\' = \\sec^2 x$.' },
    ],
    coreObjectives: [
      'Understand the idea of a derived function informally ($\\delta x \\to 0$) without differentiation from first principles.',
      'Use notations $f\'(x), f\'\'(x), \\frac{dy}{dx}, \\frac{d^2y}{dx^2} = \\frac{d}{dx}(\\frac{dy}{dx})$ and differentiate $x^n, \\sin x, \\cos x, \\tan x, e^x, \\ln x$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Algebraic, exp & log', latex: '\\frac{d}{dx}(x^n) = nx^{n-1}, \\quad \\frac{d}{dx}(e^x)=e^x, \\quad \\frac{d}{dx}(\\ln x)=\\frac{1}{x}' },
      { label: 'Trigonometric (radians)', latex: '\\frac{d}{dx}(\\sin x)=\\cos x, \\quad \\frac{d}{dx}(\\cos x)=-\\sin x, \\quad \\frac{d}{dx}(\\tan x)=\\sec^2 x' },
    ],
    studyNotes: [
      {
        heading: 'Splitting Fractions Before Differentiating',
        body: 'To differentiate $y = \\frac{2x^3 - 5x + 1}{x}$, split every numerator term over the single denominator $x$: $y = 2x^2 - 5 + x^{-1}$, then differentiate easily to $\\frac{dy}{dx} = 4x - x^{-2}$.',
      },
    ],
    workedExamples: [
      {
        title: 'Simplifying Powers & Logs Before Differentiating',
        question: 'Given $y = 4\\sqrt{x} - \\frac{3}{x^2} + \\ln(7x)$, find $\\frac{dy}{dx}$ and $\\frac{d^2y}{dx^2}$.',
        marks: 4,
        steps: [
          'Rewrite in index and split-log form: $y = 4x^{1/2} - 3x^{-2} + \\ln 7 + \\ln x$.',
          'Differentiate term by term: $\\frac{dy}{dx} = 4\\left(\\frac{1}{2}\\right)x^{-1/2} - 3(-2)x^{-3} + 0 + \\frac{1}{x} = 2x^{-1/2} + 6x^{-3} + x^{-1}$.',
          'Differentiate again: $\\frac{d^2y}{dx^2} = -x^{-3/2} - 18x^{-4} - x^{-2}$.',
        ],
        answer: '$\\frac{dy}{dx} = 2x^{-1/2} + 6x^{-3} + \\frac{1}{x}$, $\\frac{d^2y}{dx^2} = -x^{-3/2} - 18x^{-4} - x^{-2}$',
        markSchemeNotes: 'M1 for rewriting $x^{1/2}, x^{-2}$; A1 for $\\ln(7x)$ differentiating to $\\frac{1}{x}$; A1 for $\\frac{dy}{dx}$; A1 for $\\frac{d^2y}{dx^2}$.',
      },
    ],
    commonMistakes: [
      'Differentiating $\\ln(5x)$ as $\\frac{1}{5x}$ instead of $\\frac{5}{5x} = \\frac{1}{x}$.',
      'Forgetting the negative sign on $\\frac{d}{dx}(\\cos x) = -\\sin x$.',
      'Computing $\\sin(30)$ in degrees instead of radians when evaluating gradients of trig curves.',
    ],
    coursebookTip:
      'Use log laws to break apart messy logs FIRST before differentiating: $\\ln\\!\\left(\\frac{x^2}{x+1}\\right) = 2\\ln x - \\ln(x+1)$ differentiates to $\\frac{2}{x} - \\frac{1}{x+1}$ in seconds without the quotient rule!',
    quickCheck: {
      id: '0606-14.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Given $f(x) = 2x^3 - \\frac{6}{x}$, find $f\'(1)$.',
      answer: '12',
      numericAnswer: 12,
      tolerance: 0,
      hint: 'Rewrite $-\\frac{6}{x}$ as $-6x^{-1}$ before differentiating.',
      solution: '$f\'(x) = 6x^2 + 6x^{-2}$. At $x = 1$, $f\'(1) = 6(1) + 6(1) = 12$.',
    },
  },
  {
    id: '14.2',
    chapterId: 14,
    code: '14.2',
    title: 'Chain rule, product rule & quotient rule',
    tier: 'Extended',
    summary:
      'Differentiate composite functions via the chain rule $\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$, products $y = uv$ via $uv\' + vu\'$, and quotients $y = \\frac{u}{v}$ via $\\frac{vu\' - uv\'}{v^2}$.',
    bigIdea:
      'Any complicated function is built from layers (chain rule: outer derivative $\\times$ inner derivative), products (keep first $\\times$ diff second $+$ keep second $\\times$ diff first), or fractions (low $d$-high minus high $d$-low, all over low squared).',
    keyFindings: [
      {
        title: 'Product vs. Quotient Rule Shortcut',
        finding:
          'When $y = \\frac{k}{g(x)^n}$ has a constant numerator $k$, rewrite it as $k[g(x)]^{-n}$ and use the Chain Rule — it is far faster and less error-prone than the Quotient Rule!',
      },
    ],
    stepByStepMethod: [
      'Chain Rule: differentiate the outer shell leaving the inner $g(x)$ untouched, then multiply by $g\'(x)$: $\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)$.',
      'Product Rule ($y = u v$): list $u, u\', v, v\'$ clearly in the margin, then form $u v\' + v u\'$ and factor out common brackets or $e^{kx}$.',
      'Quotient Rule ($y = \\frac{u}{v}$): write $u, u\', v, v\'$, then form $\\frac{v u\' - u v\'}{v^2}$ (order of subtraction matters!).',
      'Look for factorisation opportunities (e.g. $e^{2x}$ or $(x+1)^3$) so you can solve $\\frac{dy}{dx} = 0$ cleanly.',
    ],
    rapidSummary: [
      { rule: 'Chain rule', detail: '$\\frac{d}{dx} f(g(x)) = f\'(g(x)) \\cdot g\'(x)$; e.g. $\\frac{d}{dx}e^{g(x)} = g\'(x)e^{g(x)}$ and $\\frac{d}{dx}\\ln g(x) = \\frac{g\'(x)}{g(x)}$.' },
      { rule: 'Product rule', detail: '$\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}$.' },
      { rule: 'Quotient rule', detail: '$\\frac{d}{dx}\\!\\left(\\frac{u}{v}\\right) = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}$.' },
    ],
    coreObjectives: [
      'Differentiate composite functions using the chain rule (including powers, $e^{f(x)}$, $\\ln f(x)$, and trig composites).',
      'Differentiate products and quotients of functions and simplify the result.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Chain rule', latex: '\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}' },
      { label: 'Product rule', latex: '\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}' },
      { label: 'Quotient rule', latex: '\\frac{d}{dx}\\!\\left(\\frac{u}{v}\\right) = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}' },
    ],
    studyNotes: [
      {
        heading: 'Watch Out for Powers on Trig Functions',
        body: 'Notation $\\sin^3(2x)$ means $[\\sin(2x)]^3$, which has THREE nested layers! Chain rule gives $3\\sin^2(2x) \\cdot \\cos(2x) \\cdot 2 = 6\\sin^2(2x)\\cos(2x)$.',
      },
    ],
    workedExamples: [
      {
        title: 'Quotient Rule with Simplification',
        question: 'Differentiate $y = \\frac{e^{2x}}{x + 3}$, giving your answer as a single simplified fraction.',
        marks: 3,
        steps: [
          'Set $u = e^{2x} \\implies u\' = 2e^{2x}$, and $v = x + 3 \\implies v\' = 1$.',
          'Apply Quotient Rule: $\\frac{dy}{dx} = \\frac{(x+3)(2e^{2x}) - e^{2x}(1)}{(x+3)^2}$.',
          'Factor out $e^{2x}$ in numerator: $\\frac{e^{2x}(2x + 6 - 1)}{(x + 3)^2} = \\frac{e^{2x}(2x + 5)}{(x + 3)^2}$.',
        ],
        answer: '$\\frac{e^{2x}(2x + 5)}{(x + 3)^2}$',
        markSchemeNotes: 'M1 for quotient rule structure; A1 for correct unsimplified expression; A1 for factored numerator $e^{2x}(2x+5)$.',
      },
    ],
    commonMistakes: [
      'Swapping the numerator terms in the Quotient Rule ($uv\' - vu\'$ instead of $vu\' - uv\'$), which flips the sign.',
      'Forgetting to multiply by the derivative of the inner function in the chain rule (e.g. differentiating $\\cos(3x)$ as $-\\sin(3x)$ instead of $-3\\sin(3x)$).',
      'Expanding $(x + 3)^2$ in the denominator unnecessarily — leave $v^2$ factorised!',
    ],
    coursebookTip:
      'In the Quotient Rule, chant "low d-high minus high d-low, over low squared" — starting with LOW ($v$) ensures you never get the subtraction order backwards.',
    quickCheck: {
      id: '0606-14.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Given $y = (2x - 1)^3$, find the value of $\\frac{dy}{dx}$ when $x = 2$.',
      answer: '54',
      numericAnswer: 54,
      tolerance: 0,
      hint: 'Apply the chain rule: multiply by the exponent $3$, lower the power to $2$, and multiply by the derivative of $2x - 1$.',
      solution: '$\\frac{dy}{dx} = 3(2x - 1)^2 \\cdot 2 = 6(2x - 1)^2$. At $x = 2$: $6(3)^2 = 54$.',
    },
  },
  {
    id: '14.3',
    chapterId: 14,
    code: '14.3',
    title: 'Tangents, normals, stationary points & optimisation',
    tier: 'Extended',
    summary:
      'Find equations of tangents and normals using $\\frac{dy}{dx}$ and $m_N = -\\frac{1}{m_T}$, locate stationary points ($\\frac{dy}{dx} = 0$), classify maxima and minima with full justification via first or second derivative tests, and solve practical optimisation problems.',
    bigIdea:
      'At any point $(x_0, y_0)$, $\\frac{dy}{dx}$ is the tangent’s gradient and $-1 / \\frac{dy}{dx}$ is the normal’s gradient. Turning points occur where the gradient vanishes ($\\frac{dy}{dx} = 0$), and full marks ALWAYS require proving whether the stationary point is a maximum or minimum (points of inflexion are NOT tested in 0606).',
    keyFindings: [
      {
        title: 'Justification Requirement for Maxima & Minima',
        finding:
          'Simply writing "$\\frac{d^2y}{dx^2} = -6$, max" is enough if you state "$\\frac{d^2y}{dx^2} < 0 \\implies$ maximum". If $\\frac{d^2y}{dx^2}$ is awkward to compute (e.g., messy quotient), use the First Derivative Sign Table: test $\\frac{dy}{dx}$ slightly left ($x_0 - \\epsilon$) and slightly right ($x_0 + \\epsilon$) of the stationary point ($+ \\to 0 \\to -$ is Max; $- \\to 0 \\to +$ is Min).',
      },
    ],
    stepByStepMethod: [
      'Tangents/Normals: compute $y_0 = f(x_0)$ if not given, compute $m_T = f\'(x_0)$, use $m_N = -\\frac{1}{m_T}$ for the normal, and apply $y - y_0 = m(x - x_0)$.',
      'Stationary points: solve $\\frac{dy}{dx} = 0$ for $x$, substitute back into $y = f(x)$ if coordinates are asked, then evaluate $\\frac{d^2y}{dx^2}$ (or check sign change of $\\frac{dy}{dx}$).',
      'Practical max/min problems (volumes, areas, costs): write an expression for the target quantity $Q$ in terms of TWO variables ($r, h$ or $x, y$), use the constraint equation (e.g. fixed perimeter or volume) to eliminate one variable, differentiate $\\frac{dQ}{dx} = 0$, solve, and justify max/min.',
    ],
    rapidSummary: [
      { rule: 'Tangent & Normal', detail: '$m_T = f\'(x_0)$, $m_N = -\\frac{1}{f\'(x_0)}$ ($m_T \\ne 0$).' },
      { rule: 'Second derivative test', detail: 'At $f\'(x_0)=0$: $f\'\'(x_0) < 0 \\implies$ maximum; $f\'\'(x_0) > 0 \\implies$ minimum.' },
      { rule: 'First derivative test', detail: '$f\'(x)$ changes $+ \\to 0 \\to -$ (max) or $- \\to 0 \\to +$ (min).' },
    ],
    coreObjectives: [
      'Use differentiation to find gradients, equations of tangents and normals.',
      'Find stationary points and distinguish between maxima and minima with full justification using first or second derivative tests (points of inflexion excluded).',
      'Apply differentiation to practical problems involving maxima and minima.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Normal gradient & line', latex: 'm_N = -\\frac{1}{m_T}, \\qquad y - y_0 = m(x - x_0)' },
      { label: 'Stationary point classification', latex: '\\frac{dy}{dx} = 0 \\;\\text{ and }\\; \\frac{d^2y}{dx^2} < 0 \\text{ (Max) or } > 0 \\text{ (Min)}' },
    ],
    studyNotes: [
      {
        heading: 'Increasing & Decreasing Functions',
        body: 'A curve is increasing where $\\frac{dy}{dx} > 0$ and decreasing where $\\frac{dy}{dx} < 0$. Finding the set of $x$-values where $f$ is increasing reduces directly to solving the inequality $f\'(x) > 0$.',
      },
    ],
    workedExamples: [
      {
        title: 'Practical Optimisation of an Open-Top Cylinder/Box',
        question:
          'A closed rectangular box with a square base of side $x\\text{ cm}$ and height $h\\text{ cm}$ has volume $500\\text{ cm}^3$. (a) Show that its total surface area $A = 2x^2 + \\frac{2000}{x}$. (b) Find the value of $x$ that minimises $A$, justifying that it is a minimum.',
        marks: 6,
        steps: [
          '(a) Volume $V = x^2 h = 500 \\implies h = \\frac{500}{x^2}$.',
          'Surface area $A = 2x^2 + 4xh = 2x^2 + 4x\\!\\left(\\frac{500}{x^2}\\right) = 2x^2 + \\frac{2000}{x}$.',
          '(b) Differentiate: $\\frac{dA}{dx} = 4x - 2000x^{-2}$. Set $\\frac{dA}{dx} = 0 \\implies 4x = \\frac{2000}{x^2} \\implies x^3 = 500 \\implies x = \\sqrt[3]{500} \\approx 7.94\\text{ cm}$.',
          'Second derivative: $\\frac{d^2A}{dx^2} = 4 + 4000x^{-3}$. Since $x > 0$, $\\frac{d^2A}{dx^2} > 0$, confirming a minimum.',
        ],
        answer: '$x = \\sqrt[3]{500} \\approx 7.94\\text{ cm}$ (minimum since $\\frac{d^2A}{dx^2} > 0$)',
        markSchemeNotes: 'M1 for $h = 500/x^2$ substituted into $2x^2+4xh$; M1 for $\\frac{dA}{dx}$; M1 for solving $\\frac{dA}{dx}=0$; A1 for $x = 7.94$; M1,A1 for $\\frac{d^2A}{dx^2} > 0$ justification.',
      },
    ],
    commonMistakes: [
      'Solving $\\frac{d^2y}{dx^2} = 0$ instead of $\\frac{dy}{dx} = 0$ to find stationary points!',
      'Using $\\frac{d^2y}{dx^2} > 0$ to mean "maximum" (think backwards: $> 0$ means gradient is increasing from negative to positive, forming a valley $\\cup$ = MINIMUM; $< 0$ forms a hill $\\cap$ = MAXIMUM).',
      'Forgetting to justify max/min in a practical optimisation question — that last $2$ marks is nearly automatic if you check $\\frac{d^2Q}{dx^2}$.',
    ],
    coursebookTip:
      'Think of a smiley face vs sad face: positive second derivative ($> 0$, $\\cup$) = Minimum; negative second derivative ($< 0$, $\\cap$) = Maximum!',
    quickCheck: {
      id: '0606-14.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Find the $x$-coordinate of the minimum point on the curve $y = x^2 - 8x + 5$.',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: 'Set $\\frac{dy}{dx} = 0$ and solve for $x$.',
      solution: '$\\frac{dy}{dx} = 2x - 8 = 0 \\implies x = 4$ (and $\\frac{d^2y}{dx^2} = 2 > 0$, confirming a minimum).',
    },
  },
  {
    id: '14.4',
    chapterId: 14,
    code: '14.4',
    title: 'Connected rates of change & small increments',
    tier: 'Extended',
    summary:
      'Link rates of change with respect to time using the chain rule $\\frac{dy}{dt} = \\frac{dy}{dx} \\cdot \\frac{dx}{dt}$ and estimate small changes using $\\delta y \\approx \\left(\\frac{dy}{dx}\\right)_{x=x_0} \\delta x$.',
    bigIdea:
      'Treat derivatives like fractions that cancel along a chain: $\\frac{dV}{dt} = \\frac{dV}{dr} \\cdot \\frac{dr}{dt}$. Over a tiny change $\\delta x$, a smooth curve stays almost straight, so $\\delta y \\approx \\frac{dy}{dx} \\cdot \\delta x$.',
    keyFindings: [
      {
        title: 'Rate Sign Convention ("Decreasing at...")',
        finding:
          'If water leaks out at $4\\text{ cm}^3/\\text{s}$ or radius decreases at $0.2\\text{ cm/s}$, attach a MINUS sign: $\\frac{dV}{dt} = -4$ or $\\frac{dr}{dt} = -0.2$!',
      },
    ],
    stepByStepMethod: [
      'List what rate is GIVEN (e.g. $\\frac{dV}{dt} = 12$) and what rate is WANTED (e.g. $\\frac{dr}{dt}$).',
      'Write the formula linking the two variables ($V = \\frac{4}{3}\\pi r^3$), differentiate to get $\\frac{dV}{dr}$, then link via $\\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt}$.',
      'Substitute the instantaneous variable value AFTER differentiating — NEVER before!',
      'For small changes, write $\\delta y \\approx \\frac{dy}{dx}\\big|_{x_0} \\times \\delta x$; if $\\delta x$ is a percentage change (e.g. $+2\\%$), set $\\delta x = 0.02 x_0$.',
    ],
    rapidSummary: [
      { rule: 'Connected rates', detail: '$\\frac{dy}{dt} = \\frac{dy}{dx} \\cdot \\frac{dx}{dt}$ (remember $\\frac{dx}{dy} = 1 / \\frac{dy}{dx}$).' },
      { rule: 'Small increment', detail: '$\\delta y \\approx \\frac{dy}{dx}\\big|_{x_0} \\delta x$.' },
      { rule: 'Percentage change', detail: '$\\frac{\\delta y}{y} \\times 100\\%$ using $\\delta y$ above.' },
    ],
    coreObjectives: [
      'Apply differentiation to connected rates of change involving two or more variables.',
      'Apply differentiation to small increments and linear approximations ($\\delta y \\approx \\frac{dy}{dx}\\delta x$).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Connected rates chain rule', latex: '\\frac{dy}{dt} = \\frac{dy}{dx} \\cdot \\frac{dx}{dt}' },
      { label: 'Small increment approximation', latex: '\\delta y \\approx \\left(\\frac{dy}{dx}\\right)_{x = x_0} \\!\\delta x' },
    ],
    studyNotes: [
      {
        heading: 'Cones & Similar Triangles in Connected Rates',
        body: 'For a conical tank of total height $H$ and radius $R$ filled to depth $h$ with water radius $r$, eliminate $r$ BEFORE differentiating $V = \\frac{1}{3}\\pi r^2 h$ using similar triangles $\\frac{r}{h} = \\frac{R}{H} \\implies r = \\frac{R}{H}h$.',
      },
    ],
    workedExamples: [
      {
        title: 'Connected Rate of a Growing Sphere',
        question:
          'The volume $V$ of a spherical balloon increases at a constant rate of $40\\text{ cm}^3/\\text{s}$. Find the rate of increase of its radius $r$ when $r = 5\\text{ cm}$. ($V = \\frac{4}{3}\\pi r^3$.)',
        marks: 4,
        steps: [
          'Given $\\frac{dV}{dt} = 40$. Differentiate $V = \\frac{4}{3}\\pi r^3$: $\\frac{dV}{dr} = 4\\pi r^2$.',
          'At $r = 5$, $\\frac{dV}{dr} = 4\\pi(5^2) = 100\\pi$.',
          'Chain rule: $\\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt} \\implies 40 = 100\\pi \\cdot \\frac{dr}{dt}$.',
          '$\\frac{dr}{dt} = \\frac{40}{100\\pi} = \\frac{2}{5\\pi} \\approx 0.127\\text{ cm/s}$.',
        ],
        answer: '$\\frac{2}{5\\pi}\\text{ cm/s}$ ($\\approx 0.127\\text{ cm/s}$)',
        markSchemeNotes: 'B1 for $\\frac{dV}{dr} = 4\\pi r^2$; M1 for chain rule; A1 for $100\\pi$; A1 for $\\frac{2}{5\\pi}$ or $0.127$.',
      },
    ],
    commonMistakes: [
      'Substituting $r = 5$ into $V$ before differentiating (yielding $V = \\text{constant} \\implies \\frac{dV}{dr} = 0$!).',
      'Using a calculator to compute $f(x_0 + \\delta x) - f(x_0)$ directly when the question asks to "use differentiation / small increments" — you MUST show $\\frac{dy}{dx}\\delta x$.',
      'Leaving $\\delta y$ negative or positive wrongly when $x$ decreases (if $x$ decreases from $4$ to $3.98$, $\\delta x = -0.02$).',
    ],
    coursebookTip:
      'Always verify units: $\\frac{dV}{dt} \\;\\left(\\frac{\\text{cm}^3}{\\text{s}}\\right) = \\frac{dV}{dr}\\;\\left(\\frac{\\text{cm}^3}{\\text{cm}}\\right) \\times \\frac{dr}{dt}\\;\\left(\\frac{\\text{cm}}{\\text{s}}\\right)$. The $\\text{cm}$ cancels cleanly!',
    quickCheck: {
      id: '0606-14.4-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Given $y = x^3 + 2x$ and $x$ increases from $2$ to $2.01$, use $\\delta y \\approx \\frac{dy}{dx}\\delta x$ to find the approximate change $\\delta y$.',
      answer: '0.14',
      numericAnswer: 0.14,
      tolerance: 0.002,
      hint: 'Evaluate $\\frac{dy}{dx} = 3x^2 + 2$ at $x = 2$, then multiply by $\\delta x = 0.01$.',
      solution: 'At $x = 2$, $\\frac{dy}{dx} = 3(2)^2 + 2 = 14$. With $\\delta x = 0.01$, $\\delta y \\approx 14 \\times 0.01 = 0.14$.',
    },
  },
  {
    id: '14.5',
    chapterId: 14,
    code: '14.5',
    title: 'Indefinite integration & finding the constant +c',
    tier: 'Extended',
    summary:
      'Perform indefinite integration as the reverse of differentiation (always including $+c$) for $x^n$ ($n \\ne -1$), $\\frac{1}{x}$, $(ax+b)^n$, $\\frac{1}{ax+b}$, $e^{ax+b}$, $\\sin(ax+b)$, $\\cos(ax+b)$, and $\\sec^2(ax+b)$, and determine $+c$ from a curve point or boundary condition.',
    bigIdea:
      'Integration undoes differentiation: instead of multiplying by the inner coefficient $a$, every linear chain-rule integral DIVIDES by $a$. Never forget the arbitrary constant $+c$ on indefinite integrals — and differentiate your answer mentally to double-check every sign and coefficient!',
    keyFindings: [
      {
        title: 'The $\\frac{1}{a}$ Reverse-Chain Rule (Linear Inner Functions Only)',
        finding:
          'If $\\int f(x)\\,dx = F(x) + c$, then $\\int f(ax + b)\\,dx = \\frac{1}{a}F(ax + b) + c$. Notice the denominator is ONLY for linear $ax + b$ — you cannot integrate $(x^2 + 1)^3$ that way without expanding first!',
      },
    ],
    stepByStepMethod: [
      'Rewrite products, brackets, roots, and fractions as sums of standard integrable terms first (e.g. $(x+2)^2 = x^2+4x+4$).',
      'Integrate term by term using the standard rules; for $\\int (ax+b)^{-1}\\,dx$, remember the power rule fails at $n = -1$ and the integral is $\\frac{1}{a}\\ln|ax + b| + c$.',
      'ALWAYS write $+ c$ on indefinite integrals.',
      'When given a point $(x_0, y_0)$ on the curve (or $f\'(x)$ and a point), substitute to solve for $c$ (or $c_1, c_2$ when integrating twice from $f\'\'(x)$!).',
    ],
    comparisonTable: {
      title: 'Standard 0606 Indefinite Integrals (Memorise — Radians Only)',
      headers: ['Integrand', 'Integral ($+ c$)', 'Watch-Out'],
      rows: [
        ['$x^n$ ($n \\ne -1$)', '$\\frac{x^{n+1}}{n+1} + c$', 'Also $\\int (ax+b)^n\\,dx = \\frac{(ax+b)^{n+1}}{a(n+1)} + c$'],
        ['$\\frac{1}{x}$ or $\\frac{1}{ax+b}$', '$\\ln|x| + c$ or $\\frac{1}{a}\\ln|ax+b| + c$', 'Never write $\\frac{x^0}{0}$!'],
        ['$e^{ax+b}$', '$\\frac{1}{a}e^{ax+b} + c$', 'Divide by $a$, exponent unchanged'],
        ['$\\sin(ax+b)$', '$-\\frac{1}{a}\\cos(ax+b) + c$', 'MINUS sign! (Since $(\\cos)\' = -\\sin$)'],
        ['$\\cos(ax+b)$', '$\\frac{1}{a}\\sin(ax+b) + c$', 'Positive sign'],
        ['$\\sec^2(ax+b)$', '$\\frac{1}{a}\\tan(ax+b) + c$', 'Directly reverses $(\\tan)\' = \\sec^2$'],
      ],
    },
    rapidSummary: [
      { rule: 'Power rule ($n \\ne -1$)', detail: '$\\int (ax+b)^n\\,dx = \\frac{(ax+b)^{n+1}}{a(n+1)} + c$.' },
      { rule: 'Logarithmic integral ($n=-1$)', detail: '$\\int \\frac{1}{ax+b}\\,dx = \\frac{1}{a}\\ln|ax+b| + c$.' },
      { rule: 'Reverse chain check', detail: 'Differentiate your answer: if you don’t recover the exact integrand, fix the sign or factor $\\frac{1}{a}$.' },
    ],
    coreObjectives: [
      'Understand integration as the reverse process of differentiation and include $+c$ in indefinite integrals.',
      'Integrate sums of powers of $x$ (including $\\frac{1}{x}$ and $\\frac{1}{ax+b}$) and functions of the form $(ax+b)^n$, $\\sin(ax+b)$, $\\cos(ax+b)$, $\\sec^2(ax+b)$, and $e^{ax+b}$ (trig in radians).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Linear power & log rule', latex: '\\int (ax+b)^n\\,dx = \\frac{(ax+b)^{n+1}}{a(n+1)} + c \\; (n\\ne -1), \\quad \\int \\frac{1}{ax+b}\\,dx = \\frac{1}{a}\\ln|ax+b| + c' },
      { label: 'Exp & trig integrals (radians)', latex: '\\int e^{ax+b}\\,dx = \\frac{1}{a}e^{ax+b}+c, \\quad \\int \\sin(ax+b)\\,dx = -\\frac{1}{a}\\cos(ax+b)+c' },
    ],
    studyNotes: [
      {
        heading: '"Hence Integrate..." Questions',
        body: 'When part (i) asks you to differentiate $x\\sin x$ (or $\\frac{x}{\\sqrt{x^2+1}}$) and part (ii) says "Hence find $\\int x\\cos x\\,dx$", use the result of part (i) directly: integrate both sides of $\\frac{d}{dx}[x\\sin x] = \\sin x + x\\cos x$, giving $x\\sin x = \\int \\sin x\\,dx + \\int x\\cos x\\,dx \\implies \\int x\\cos x\\,dx = x\\sin x + \\cos x + c$.',
      },
    ],
    workedExamples: [
      {
        title: 'Integrating Trig & Exponential Functions with Boundary Value',
        question: 'A curve has gradient $\\frac{dy}{dx} = 4\\cos(2x) - 3e^{-x}$ and passes through $(0, 5)$. Find its equation.',
        marks: 4,
        steps: [
          'Integrate term by term: $y = \\int (4\\cos 2x - 3e^{-x})\\,dx = \\frac{4}{2}\\sin(2x) - \\frac{3}{-1}e^{-x} + c = 2\\sin(2x) + 3e^{-x} + c$.',
          'Substitute $(0, 5)$: $5 = 2\\sin(0) + 3e^0 + c = 0 + 3 + c \\implies c = 2$.',
          'Equation: $y = 2\\sin(2x) + 3e^{-x} + 2$.',
        ],
        answer: '$y = 2\\sin(2x) + 3e^{-x} + 2$',
        markSchemeNotes: 'B1 for $2\\sin(2x)$; B1 for $+3e^{-x}$; M1 for $+c$ and substituting $(0,5)$; A1 for $c = 2$ and full equation.',
      },
    ],
    commonMistakes: [
      'Integrating $\\sin(2x)$ as $+\\frac{1}{2}\\cos(2x)$ (wrong sign!) or differentiating instead of integrating ($2\\cos(2x)$).',
      'Writing $\\int \\frac{1}{2x+1}\\,dx = \\ln(2x+1)$ without dividing by $2$.',
      'Assuming $c = y_0$ automatically at $x = 0$ — watch out for $e^0 = 1$ and $\\cos 0 = 1$!',
    ],
    coursebookTip:
      'Every time you compute an integral, take 3 seconds to differentiate your answer in your head — it catches 99% of sign errors and missing $\\frac{1}{a}$ factors.',
    quickCheck: {
      id: '0606-14.5-qc',
      marks: 3,
      paperType: 'Non-Calculator',
      prompt: 'A curve satisfies $\\frac{dy}{dx} = 6x^2 - 4$ and passes through $(1, 5)$. Find the value of $y$ when $x = 2$.',
      answer: '15',
      numericAnswer: 15,
      tolerance: 0,
      hint: 'Integrate to find $y = 2x^3 - 4x + c$, use $(1, 5)$ to find $c$, then evaluate at $x = 2$.',
      solution: '$y = 2x^3 - 4x + c$. Substituting $(1, 5)$: $2 - 4 + c = 5 \\implies c = 7$. At $x = 2$: $y = 2(8) - 4(2) + 7 = 16 - 8 + 7 = 15$.',
    },
  },
  {
    id: '14.6',
    chapterId: 14,
    code: '14.6',
    title: 'Definite integrals & plane areas',
    tier: 'Extended',
    summary:
      'Evaluate definite integrals $\\int_a^b f(x)\\,dx = F(b) - F(a)$ and compute plane areas bounded by curves, axes, and lines — including regions below the $x$-axis, areas between two curves, and shaded sums of two regions.',
    bigIdea:
      'Definite integration gives SIGNED area: regions above the $x$-axis are positive, and regions below the $x$-axis are negative. To find a true geometric AREA between two boundaries from $x = a$ to $x = b$, always integrate $(\\text{Upper curve} - \\text{Lower curve})\\,dx$ — and split the integral wherever the curves cross!',
    keyFindings: [
      {
        title: 'Negative Signed Area Trap',
        finding:
          'If a curve crosses the $x$-axis at $x = c$ inside $[a, b]$, computing $\\int_a^b y\\,dx$ directly will partially cancel the positive and negative areas! Always find $x$-intercepts first and split into $|\\int_a^c y\\,dx| + |\\int_c^b y\\,dx|$.',
      },
    ],
    stepByStepMethod: [
      'Evaluate $\\int_a^b f(x)\\,dx = [F(x)]_a^b = F(b) - F(a)$ (no $+c$ needed; careful with brackets around $F(a)$).',
      'For area problems, SKETCH or inspect the region and find intersection $x$-coordinates by solving $y_1 = y_2$ (or $y = 0$ for axis crossings).',
      'If two curves share an enclosed loop from $a$ to $b$, integrate $\\int_a^b (y_{\\text{top}} - y_{\\text{bottom}})\\,dx$.',
      'If a shaded region sits beside a right triangle or rectangle bounded by a tangent/normal or vertical line, splitting into $(\\text{triangle/trapezium area}) \\pm \\int \\text{curve}\\,dx$ is often simpler.',
    ],
    rapidSummary: [
      { rule: 'Definite integral', detail: '$\\int_a^b f(x)\\,dx = F(b) - F(a)$, and $\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx$.' },
      { rule: 'Area between curves', detail: '$\\text{Area} = \\int_a^b (y_{\\text{upper}} - y_{\\text{lower}})\\,dx$.' },
      { rule: 'Below $x$-axis', detail: 'True area $= -\\int_a^b y\\,dx = \\left|\\int_a^b y\\,dx\\right| > 0$.' },
    ],
    coreObjectives: [
      'Evaluate definite integrals.',
      'Apply integration to find plane areas: under a curve, between a line and a curve, between two curves, and as a sum of two areas.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Fundamental theorem', latex: '\\int_a^b f\'(x)\\,dx = f(b) - f(a)' },
      { label: 'Area between two curves', latex: 'A = \\int_a^b (y_{\\text{upper}} - y_{\\text{lower}})\\,dx' },
    ],
    studyNotes: [
      {
        heading: 'Substituting Limits with Exponential & Trig Functions',
        body: 'Do NOT assume $F(0) = 0$! Remember $e^0 = 1$ and $\\cos(0) = 1$, so $\\int_0^{\\ln 3} e^x\\,dx = e^{\\ln 3} - e^0 = 3 - 1 = 2$, NOT $3$.',
      },
    ],
    workedExamples: [
      {
        title: 'Area Enclosed Between a Line and a Curve',
        question: 'Find the area of the finite region enclosed by the curve $y = x^2 + 1$ and the line $y = 2x + 4$.',
        marks: 5,
        steps: [
          'Find intersections: $x^2 + 1 = 2x + 4 \\implies x^2 - 2x - 3 = 0 \\implies (x - 3)(x + 1) = 0$, so $x = -1$ and $x = 3$.',
          'Check which is on top at $x = 0$: line gives $4$, curve gives $1$, so line is upper.',
          'Area $= \\int_{-1}^{3} [(2x + 4) - (x^2 + 1)]\\,dx = \\int_{-1}^{3} (-x^2 + 2x + 3)\\,dx$.',
          'Integrate: $\\left[-\\frac{x^3}{3} + x^2 + 3x\\right]_{-1}^{3} = \\left(-9 + 9 + 9\\right) - \\left(\\frac{1}{3} + 1 - 3\\right) = 9 - \\left(-\\frac{5}{3}\\right) = \\frac{32}{3}$.',
        ],
        answer: '$\\frac{32}{3}$ ($10\\frac{2}{3}$) square units',
        markSchemeNotes: 'M1 for $x^2 + 1 = 2x + 4$; A1 for limits $-1, 3$; M1 for $\\int (y_{\\text{line}} - y_{\\text{curve}})\\,dx$; M1 for applying limits; A1 for $\\frac{32}{3}$.',
      },
    ],
    commonMistakes: [
      'Assuming the lower limit $x = 0$ evaluates to $0$ when the antiderivative contains $e^{ax}$ or $\\cos(ax)$.',
      'Integrating $\\int (y_1^2 - y_2^2)\\,dx$ or forgetting to flip signs when subtracting $F(a)$.',
      'Adding a negative integral value to a positive integral value without taking absolute value for the region below the $x$-axis.',
    ],
    coursebookTip:
      'For the area between a quadratic parabola $y = ax^2+bx+c$ and a line crossing at $x=\\alpha, \\beta$, your answer can be sanity-checked with Archimedes’ secret shortcut: Area $= \\frac{|a|}{6}(\\beta - \\alpha)^3$. Here $\\frac{1}{6}(3 - (-1))^3 = \\frac{64}{6} = \\frac{32}{3}$!',
    quickCheck: {
      id: '0606-14.6-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Evaluate the definite integral $\\int_0^2 (3x^2 + 4x)\\,dx$.',
      answer: '16',
      numericAnswer: 16,
      tolerance: 0,
      hint: 'Find an antiderivative $[x^3 + 2x^2]_0^2$ and substitute the upper and lower limits.',
      solution: '$[x^3 + 2x^2]_0^2 = (2^3 + 2(2)^2) - (0) = 8 + 8 = 16$.',
    },
  },
  {
    id: '14.7',
    chapterId: 14,
    code: '14.7',
    title: 'Kinematics & motion graphs (s-t, distance-t, v-t, speed-t, a-t)',
    tier: 'Extended',
    summary:
      'Model straight-line motion with variable or constant acceleration via $v = \\frac{ds}{dt}, a = \\frac{dv}{dt}$ and $s = \\int v\\,dt, v = \\int a\\,dt$, find total distance travelled when velocity reverses sign, and sketch/interpret $s\\text{-}t$, distance$-t$, $v\\text{-}t$, speed$-t$, and $a\\text{-}t$ graphs.',
    bigIdea:
      'Moving forward down the calculus ladder uses differentiation ($s \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a$); climbing back up uses integration ($a \\xrightarrow{\\int dt} v \\xrightarrow{\\int dt} s$, with initial conditions giving $+c$). Remember the vital distinction between signed vectors (displacement $s$, velocity $v$) and non-negative scalars (distance, speed $= |v|$)!',
    keyFindings: [
      {
        title: 'Total Distance vs. Displacement When Velocity Changes Sign',
        finding:
          'Displacement at $t = T$ is simply $s(T) - s(0) = \\int_0^T v\\,dt$. TOTAL DISTANCE travelled over $[0, T]$ requires finding every time $t_0 \\in (0, T)$ where the particle comes to instantaneous rest ($v = 0$) and summing $|s(t_0) - s(0)| + |s(T) - s(t_0)|$!',
      },
    ],
    stepByStepMethod: [
      'Translate kinematics phrases immediately: "initially" $\\implies t = 0$; "at rest" / "reverses direction" $\\implies v = 0$; "returns to $O$" $\\implies s = 0$; "constant velocity" / "maximum or minimum velocity" $\\implies a = 0$.',
      'To go $s \\to v \\to a$, differentiate with respect to $t$.',
      'To go $a \\to v \\to s$, integrate with respect to $t$ and find $+c$ immediately from initial $v$ or $s$ before integrating a second time.',
      'Sketching graphs: a **speed–time** graph is the modulus $|v(t)|$ of the **velocity–time** graph (reflect any $v < 0$ portion above the $t$-axis!). A **distance–time** graph NEVER decreases (reflect downward slopes upward continuously so total distance only climbs).',
    ],
    comparisonTable: {
      title: 'Five Kinematics Graphs in Syllabus 14.15',
      headers: ['Graph', 'Vertical Axis Sign', 'Gradient Represents', 'Area Under Graph Represents'],
      rows: [
        ['Displacement–time ($s$-$t$)', 'Signed ($\\pm$)', 'Velocity $v$', 'Not used'],
        ['Distance–time', 'Non-negative ($\\ge 0$), non-decreasing', 'Speed $|v|$', 'Not used'],
        ['Velocity–time ($v$-$t$)', 'Signed ($\\pm$)', 'Acceleration $a$', 'Change in displacement $\\Delta s$'],
        ['Speed–time', 'Non-negative ($|v| \\ge 0$)', '$\\pm a$ (with cusps where $v=0$)', 'Total distance travelled'],
        ['Acceleration–time ($a$-$t$)', 'Signed ($\\pm$)', 'Rate of change of $a$', 'Change in velocity $\\Delta v$'],
      ],
    },
    rapidSummary: [
      { rule: 'Differentiate down', detail: '$v = \\frac{ds}{dt}$, $a = \\frac{dv}{dt} = \\frac{d^2s}{dt^2}$.' },
      { rule: 'Integrate up', detail: '$v = \\int a\\,dt + c_1$, $s = \\int v\\,dt + c_2$.' },
      { rule: 'Speed & Distance', detail: '$\\text{Speed} = |v(t)|$; total distance splits at roots of $v(t) = 0$.' },
    ],
    coreObjectives: [
      'Apply differentiation and integration to kinematics problems involving displacement, velocity, and acceleration of a particle moving in a straight line with variable or constant acceleration.',
      'Draw and use displacement–time, distance–time, velocity–time, speed–time, and acceleration–time graphs.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Kinematics derivatives', latex: 'v = \\frac{ds}{dt}, \\qquad a = \\frac{dv}{dt} = \\frac{d^2s}{dt^2}' },
      { label: 'Total distance on [0, T]', latex: '\\text{Distance} = \\int_0^T |v(t)|\\,dt' },
    ],
    studyNotes: [
      {
        heading: 'Interpreting Stationary Points on Kinematics Graphs',
        body: 'When $v = 0$ and the particle reverses direction, the $s\\text{-}t$ graph has a smooth turning point (horizontal tangent), the $v\\text{-}t$ graph crosses the $t$-axis, and BOTH the distance–time graph (flat inflection) and speed–time graph (sharp V-shaped cusp touching $0$) stay non-negative.',
      },
    ],
    workedExamples: [
      {
        title: 'Displacement vs. Total Distance with Turning Back',
        question:
          'A particle starts from $O$ with velocity $v = 3t^2 - 12t + 9\\text{ m/s}$ ($t \\ge 0$). Find (a) its acceleration at $t = 2$, (b) the times when it is instantaneously at rest, and (c) the total distance travelled in the first $4$ seconds.',
        marks: 6,
        steps: [
          '(a) $a = \\frac{dv}{dt} = 6t - 12$. At $t = 2$, $a = 6(2) - 12 = 0\\text{ m/s}^2$.',
          '(b) Instantaneously at rest when $v = 0$: $3(t^2 - 4t + 3) = 0 \\implies 3(t - 1)(t - 3) = 0 \\implies t = 1\\text{ s}$ and $t = 3\\text{ s}$.',
          '(c) Displacement from $O$: $s = \\int (3t^2 - 12t + 9)\\,dt = t^3 - 6t^2 + 9t + c$. Since $s(0) = 0$, $c = 0$.',
          'Evaluate $s(t)$ at $t = 0, 1, 3, 4$: $s(0) = 0$, $s(1) = 1 - 6 + 9 = 4$, $s(3) = 27 - 54 + 27 = 0$, $s(4) = 64 - 96 + 36 = 4$.',
          'Total distance $= |4 - 0| + |0 - 4| + |4 - 0| = 4 + 4 + 4 = 12\\text{ m}$.',
        ],
        answer: '(a) $0\\text{ m/s}^2$, (b) $t = 1\\text{ s}, 3\\text{ s}$, (c) $12\\text{ m}$',
        markSchemeNotes: 'B1 for $a = 6t - 12$ and $0$; M1,A1 for $t=1, 3$; M1 for $s(t) = t^3 - 6t^2 + 9t$; M1 for evaluating at $0,1,3,4$; A1 for $12\\text{ m}$.',
      },
    ],
    commonMistakes: [
      'Finding only $s(4) - s(0) = 4\\text{ m}$ when the question asks for TOTAL DISTANCE ($12\\text{ m}$) instead of displacement!',
      'Using SUVAT equations ($v = u + at$, $s = ut + \\frac{1}{2}at^2$) when acceleration $a(t)$ depends on $t$ — SUVAT is ONLY valid for CONSTANT acceleration!',
      'Drawing negative values on a speed–time or distance–time graph.',
    ],
    coursebookTip:
      'Whenever you see $v(t)$ or $a(t)$ as a function of $t$, ban SUVAT from your head and immediately reach for differentiation and integration.',
    quickCheck: {
      id: '0606-14.7-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A particle moves in a straight line with velocity $v = 3t^2 - 12t + 9\\text{ m/s}$. Find its acceleration (in $\\text{m/s}^2$) when $t = 4\\text{ s}$.',
      answer: '12',
      numericAnswer: 12,
      tolerance: 0,
      hint: 'Differentiate $v$ with respect to $t$ to get $a = \\frac{dv}{dt}$, then substitute $t = 4$.',
      solution: '$a = \\frac{dv}{dt} = 6t - 12$. At $t = 4$: $a = 6(4) - 12 = 12\\text{ m/s}^2$.',
    },
  },
];
