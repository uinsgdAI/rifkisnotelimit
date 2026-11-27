import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_10_NOTES_0606: SubtopicNote[] = [
  {
    id: '10.1',
    chapterId: 10,
    code: '10.1',
    title: 'Six trigonometric functions, ASTC & exact values',
    tier: 'Extended',
    summary:
      'Define $\\sin, \\cos, \\tan, \\operatorname{cosec}, \\sec, \\cot$ for any angle (positive or negative, degrees or radians), apply ASTC quadrant signs, and evaluate exact surd values without a calculator.',
    bigIdea:
      'Reciprocal trig functions pair across the third letter: $\\text{se}\\mathbf{c}\\,\\theta = \\frac{1}{\\cos\\theta}$, $\\text{cose}\\mathbf{c}\\,\\theta = \\frac{1}{\\sin\\theta}$, $\\text{co}\\mathbf{t}\\,\\theta = \\frac{1}{\\tan\\theta} = \\frac{\\cos\\theta}{\\sin\\theta}$. Quadrant ASTC tells you the sign, and the acute reference angle to the horizontal axis gives the magnitude.',
    keyFindings: [
      {
        title: 'Reference Angle Rule (Always to Horizontal $x$-Axis!)',
        finding: 'Compute related acute angle $\\alpha$ against $0^\\circ, 180^\\circ, 360^\\circ$ (or $0, \\pi, 2\\pi$) — NEVER against $90^\\circ$ or $270^\\circ$!',
      },
    ],
    stepByStepMethod: [
      'For a reciprocal function ($\\sec, \\operatorname{cosec}, \\cot$), rewrite in terms of $\\cos, \\sin, \\tan$ first.',
      'Locate the angle’s quadrant ($Q_1$: All $+$; $Q_2$: $\\sin/\\operatorname{cosec}$ $+$; $Q_3$: $\\tan/\\cot$ $+$; $Q_4$: $\\cos/\\sec$ $+$).',
      'Find the acute reference angle $\\alpha$ measured from the $x$-axis.',
      'Attach the quadrant sign to the exact value of $\\sin\\alpha, \\cos\\alpha$, or $\\tan\\alpha$.',
    ],
    comparisonTable: {
      title: 'Exact Trigonometric Values (Non-Calculator)',
      headers: ['Angle', '$\\sin\\theta$', '$\\cos\\theta$', '$\\tan\\theta$'],
      rows: [
        ['$0^\\circ$ ($0$)', '$0$', '$1$', '$0$'],
        ['$30^\\circ$ ($\\frac{\\pi}{6}$)', '$\\frac{1}{2}$', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$'],
        ['$45^\\circ$ ($\\frac{\\pi}{4}$)', '$\\frac{\\sqrt{2}}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$1$'],
        ['$60^\\circ$ ($\\frac{\\pi}{3}$)', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{2}$', '$\\sqrt{3}$'],
        ['$90^\\circ$ ($\\frac{\\pi}{2}$)', '$1$', '$0$', 'undefined'],
      ],
    },
    rapidSummary: [
      { rule: 'Reciprocal functions', detail: '$\\sec\\theta = \\frac{1}{\\cos\\theta},\\; \\operatorname{cosec}\\theta = \\frac{1}{\\sin\\theta},\\; \\cot\\theta = \\frac{1}{\\tan\\theta}$.' },
      { rule: 'Negative angles', detail: '$\\cos(-\\theta) = \\cos\\theta$, while $\\sin(-\\theta) = -\\sin\\theta$ and $\\tan(-\\theta) = -\\tan\\theta$.' },
      { rule: 'Obtuse right-triangle trick', detail: 'If $\\theta$ is obtuse ($90^\\circ < \\theta < 180^\\circ$), $\\sin\\theta > 0$ while $\\cos\\theta < 0$ and $\\tan\\theta < 0$!' },
    ],
    coreObjectives: [
      'Know the six trigonometric functions of angles of any magnitude (sine, cosine, tangent, secant, cosecant, cotangent).',
      'Understand and use exact values of trigonometric functions of $30^\\circ, 45^\\circ, 60^\\circ$ (and radian equivalents) and right-triangle ASTC relationships.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Reciprocal definitions', latex: '\\sec\\theta=\\frac{1}{\\cos\\theta}, \\quad \\operatorname{cosec}\\theta=\\frac{1}{\\sin\\theta}, \\quad \\cot\\theta=\\frac{\\cos\\theta}{\\sin\\theta}' },
    ],
    studyNotes: [
      {
        heading: 'Finding Exact Trig Values Given One Ratio & a Quadrant',
        body: 'Example: If $\\sin\\theta = -\\frac{5}{13}$ and $\\theta$ lies in Quadrant $3$ ($180^\\circ < \\theta < 270^\\circ$), draw a $5$-$12$-$13$ right triangle for reference angle $\\alpha$. Since $\\theta \\in Q_3$, cosine is negative while tangent is positive: $\\cos\\theta = -\\frac{12}{13}$ and $\\sec\\theta = -\\frac{13}{12}$, while $\\cot\\theta = +\\frac{12}{5}$.',
      },
    ],
    workedExamples: [
      {
        title: 'Evaluating exact reciprocal functions in radians (Non-Calculator)',
        question: 'Find the exact value of $\\sec\\!\\left(\\frac{5\\pi}{6}\\right) + \\cot\\!\\left(\\frac{3\\pi}{4}\\right)$.',
        marks: 3,
        steps: [
          'Angle $\\frac{5\\pi}{6}$ is in Quadrant $2$ with reference angle $\\frac{\\pi}{6}$: $\\cos\\!\\left(\\frac{5\\pi}{6}\\right) = -\\cos\\!\\left(\\frac{\\pi}{6}\\right) = -\\frac{\\sqrt{3}}{2}$, so $\\sec\\!\\left(\\frac{5\\pi}{6}\\right) = -\\frac{2}{\\sqrt{3}} = -\\frac{2\\sqrt{3}}{3}$.',
          'Angle $\\frac{3\\pi}{4}$ is in Quadrant $2$ with reference angle $\\frac{\\pi}{4}$: $\\tan\\!\\left(\\frac{3\\pi}{4}\\right) = -1 \\implies \\cot\\!\\left(\\frac{3\\pi}{4}\\right) = -1$.',
          'Add: $-\\frac{2\\sqrt{3}}{3} - 1$.',
        ],
        answer: '$-1 - \\frac{2\\sqrt{3}}{3}$',
        markSchemeNotes: 'B1 for $-\\frac{2}{\\sqrt{3}}$, B1 for $-1$, A1 for exact simplified sum.',
      },
    ],
    commonMistakes: [
      'Confusing $\\sec\\theta = \\frac{1}{\\sin\\theta}$ (wrong! Look at the 3rd letter: se**c** = $1/$**c**os, cose**c** = $1/$**s**in... third letter **s**!).',
      'Confusing $\\cos^{-1} x$ (inverse cosine) with $(\\cos x)^{-1} = \\sec x$.',
    ],
    coursebookTip: 'Memorise the $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle (sides $1, \\sqrt{3}, 2$) and $45^\\circ$-$45^\\circ$-$90^\\circ$ triangle (sides $1, 1, \\sqrt{2}$) — you can regenerate every exact value in 5 seconds during Paper 1.',
    quickCheck: {
      id: '0606-10.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'If $\\cos x = -\\frac{3}{5}$ and $180^\\circ < x < 270^\\circ$, find the exact value of $\\tan x$ as a fraction or decimal.',
      answer: '4/3',
      acceptedAnswers: ['4/3', '1.33', '1.333'],
      numericAnswer: 4 / 3,
      tolerance: 0.02,
      hint: 'Use a $3$-$4$-$5$ triangle and check whether $\\tan$ is positive or negative in Quadrant 3.',
      solution: 'In a $3$-$4$-$5$ triangle, $|\\tan x| = \\frac{4}{3}$. In Quadrant 3 ($180^\\circ < x < 270^\\circ$), $\\tan x > 0$, so $\\tan x = \\frac{4}{3}$.',
    },
  },
  {
    id: '10.2',
    chapterId: 10,
    code: '10.2',
    title: 'Trigonometric graphs, amplitude, period & asymptotes',
    tier: 'Extended',
    summary:
      'Sketch and read equations of transformed trig graphs $y = a\\sin bx + c$, $y = a\\cos bx + c$, and $y = a\\tan bx + c$ (plus $|f(x)|$), identifying amplitude, period, and asymptotes.',
    bigIdea:
      'The multiplier $a$ stretches vertically (amplitude $|a|$ for $\\sin/\\cos$), $b$ compresses horizontally (dividing the natural period by $b$), and $+c$ shifts the midline vertically to $y = c$.',
    keyFindings: [
      {
        title: 'Period & Amplitude Formulae',
        finding: 'For $y = a\\sin bx + c$ or $a\\cos bx + c$: amplitude $= |a|$, period $= \\frac{360^\\circ}{b}$ (or $\\frac{2\\pi}{b}$), range $[c - |a|, c + |a|]$. For $y = a\\tan bx + c$: period $= \\frac{180^\\circ}{b}$ (or $\\frac{\\pi}{b}$) with no amplitude.',
      },
    ],
    stepByStepMethod: [
      'Identify the midline $y = c$, maximum $c + |a|$, and minimum $c - |a|$ (for $\\sin$ and $\\cos$).',
      'Compute the period $T = \\frac{360^\\circ}{b}$ (or $\\frac{2\\pi}{b}$) for $\\sin/\\cos$, or $T = \\frac{180^\\circ}{b}$ (or $\\frac{\\pi}{b}$) for $\\tan$.',
      'Divide each period into 4 quarters ($T/4$) to mark peaks, midline crossings, and troughs cleanly.',
      'For $\\tan bx$, draw and label vertical asymptotes wherever $bx = \\frac{\\pi}{2} + k\\pi$ (e.g. $x = \\frac{90^\\circ}{b}, \\frac{270^\\circ}{b}, \\dots$).',
    ],
    rapidSummary: [
      { rule: 'Amplitude', detail: '$|a| = \\frac{y_{\\max} - y_{\\min}}{2}$; midline $c = \\frac{y_{\\max} + y_{\\min}}{2}$.' },
      { rule: 'Sine/Cosine period', detail: '$\\frac{360^\\circ}{b}$ or $\\frac{2\\pi}{b}$ ($b$ full cycles in $360^\\circ$ or $2\\pi$).' },
      { rule: 'Tangent period & asymptotes', detail: '$\\frac{180^\\circ}{b}$ or $\\frac{\\pi}{b}$; asymptotes where $\\cos(bx) = 0$.' },
    ],
    coreObjectives: [
      'Understand and use the terms amplitude and period.',
      'Sketch and use graphs of $y = a\\sin bx + c$, $y = a\\cos bx + c$, and $y = a\\tan bx + c$, where $a$ is a positive integer, $b$ is a simple fraction or integer, and $c$ is an integer.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Amplitude & midline', latex: '|a| = \\frac{y_{\\max} - y_{\\min}}{2}, \\qquad c = \\frac{y_{\\max} + y_{\\min}}{2}' },
      { label: 'Periods', latex: 'T_{\\sin/\\cos} = \\frac{360^\\circ}{b} = \\frac{2\\pi}{b}, \\qquad T_{\\tan} = \\frac{180^\\circ}{b} = \\frac{\\pi}{b}' },
    ],
    studyNotes: [
      {
        heading: 'Counting Roots Using Intersections on Trig Graphs',
        body: 'Questions frequently ask: "Sketch $y = 3\\cos(2x) + 1$ for $0 \\le x \\le 2\\pi$, and state the number of solutions to $3\\cos(2x) + 1 = \\frac{x}{\\pi}$." Simply plot the straight line $y = \\frac{x}{\\pi}$ on the same axes (passing through $(0, 0)$, $(\\pi, 1)$, $(2\\pi, 2)$) and count the crossings — notice each $2\\cos$ cycle crosses twice as long as $y$ stays between $-2$ and $4$!',
      },
    ],
    workedExamples: [
      {
        title: 'Finding amplitude, period, and equation from min/max',
        question: 'A curve has equation $y = a\\sin bx + c$ ($a > 0, b > 0$) with maximum value $7$, minimum value $-1$, and period $120^\\circ$. Find $a, b,$ and $c$.',
        marks: 3,
        steps: [
          'Amplitude $a = \\frac{7 - (-1)}{2} = 4$.',
          'Midline $c = \\frac{7 + (-1)}{2} = 3$.',
          'Period $\\frac{360^\\circ}{b} = 120^\\circ \\implies b = 3$.',
        ],
        answer: '$a = 4, \\; b = 3, \\; c = 3$',
        markSchemeNotes: 'B1 $a = 4$, B1 $c = 3$, B1 $b = 3$.',
      },
    ],
    commonMistakes: [
      'Using $\\frac{360^\\circ}{b}$ instead of $\\frac{180^\\circ}{b}$ for the period of $y = a\\tan bx + c$.',
      'Forgetting to label asymptotes on $y = a\\tan bx + c$ sketches or stopping a graph slightly short of the interval endpoint.',
    ],
    coursebookTip: 'To sketch $y = |a\\sin bx + c|$ in 0606, sketch $y = a\\sin bx + c$ in pencil first, mark its $x$-intercepts, and bounce any negative troughs strictly upwards.',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-10.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'State the period (in degrees) of $y = 5\\tan(3x) - 2$.',
      answer: '60',
      numericAnswer: 60,
      tolerance: 0,
      hint: 'Recall that $y = \\tan x$ has period $180^\\circ$, not $360^\\circ$.',
      solution: 'Period $= \\frac{180^\\circ}{3} = 60^\\circ$.',
    },
  },
  {
    id: '10.3',
    chapterId: 10,
    code: '10.3',
    title: 'Trigonometric identities & algebraic proofs',
    tier: 'Extended',
    summary:
      'Use $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ and the three Pythagorean identities ($\\sin^2\\theta+\\cos^2\\theta=1$, $\\sec^2\\theta=1+\\tan^2\\theta$, $\\operatorname{cosec}^2\\theta=1+\\cot^2\\theta$) to prove trigonometric identities.',
    bigIdea:
      'Start from the more complicated side (LHS or RHS) and never move terms across the "$=$" sign during a proof! Convert everything to $\\sin\\theta$ and $\\cos\\theta$ whenever $\\tan, \\sec, \\operatorname{cosec}, \\cot$ get tangled.',
    keyFindings: [
      {
        title: 'Proof Protocol ("Show that LHS $\\equiv$ RHS")',
        finding: 'Keep LHS and RHS strictly separate — do NOT assume they are equal by cross-multiplying or squaring both sides.',
      },
    ],
    stepByStepMethod: [
      'Inspect the more complex side (usually fractions or sums of $\\sec, \\operatorname{cosec}, \\tan, \\cot$).',
      'Try one of three high-yield moves: (a) combine fractions over a common denominator, (b) convert $\\sec/\\operatorname{cosec}/\\tan/\\cot$ into $\\sin$ & $\\cos$, or (c) apply $\\sin^2 + \\cos^2 = 1$, $\\sec^2 = 1 + \\tan^2$, $\\operatorname{cosec}^2 = 1 + \\cot^2$.',
      'Look out for Difference of Two Squares: $1 - \\cos^2\\theta = (1 - \\cos\\theta)(1 + \\cos\\theta) = \\sin^2\\theta$.',
      'Simplify cleanly step by step until it matches the other side identically.',
    ],
    rapidSummary: [
      { rule: 'Identity 1', detail: '$\\sin^2 A + \\cos^2 A = 1$' },
      { rule: 'Identity 2 ($\\div \\cos^2 A$)', detail: '$\\tan^2 A + 1 = \\sec^2 A$' },
      { rule: 'Identity 3 ($\\div \\sin^2 A$)', detail: '$1 + \\cot^2 A = \\operatorname{cosec}^2 A$' },
    ],
    coreObjectives: [
      'Know and use the identities $\\frac{\\sin A}{\\cos A} = \\tan A$, $\\frac{\\cos A}{\\sin A} = \\cot A$, $\\sin^2 A + \\cos^2 A = 1$, $\\sec^2 A = 1 + \\tan^2 A$, and $\\operatorname{cosec}^2 A = 1 + \\cot^2 A$.',
      'Prove trigonometric identities clearly by algebraic manipulation.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Pythagorean triple', latex: '\\sin^2 A + \\cos^2 A = 1, \\quad 1 + \\tan^2 A = \\sec^2 A, \\quad 1 + \\cot^2 A = \\operatorname{cosec}^2 A' },
    ],
    studyNotes: [
      {
        heading: 'Fractions With $1 \\pm \\sin\\theta$ or $1 \\pm \\cos\\theta$',
        body: 'Combining $\\frac{1}{1 - \\cos\\theta} + \\frac{1}{1 + \\cos\\theta}$ automatically forms $(1 - \\cos\\theta)(1 + \\cos\\theta) = 1 - \\cos^2\\theta = \\sin^2\\theta$ in the denominator — instant magic! Multiplying numerator and denominator of $\\frac{\\sin\\theta}{1 - \\cos\\theta}$ by the conjugate $(1 + \\cos\\theta)$ uses the same trick.',
      },
    ],
    workedExamples: [
      {
        title: 'Proving a fraction identity with sec and cosec',
        question: 'Prove the identity $\\frac{\\cos\\theta}{1 - \\sin\\theta} - \\frac{\\cos\\theta}{1 + \\sin\\theta} \\equiv 2\\tan\\theta$.',
        marks: 4,
        steps: [
          'Start from LHS over a common denominator $(1 - \\sin\\theta)(1 + \\sin\\theta) = 1 - \\sin^2\\theta$:',
          '$\\text{LHS} = \\frac{\\cos\\theta(1 + \\sin\\theta) - \\cos\\theta(1 - \\sin\\theta)}{1 - \\sin^2\\theta}$.',
          'Simplify numerator: $\\cos\\theta + \\cos\\theta\\sin\\theta - \\cos\\theta + \\cos\\theta\\sin\\theta = 2\\sin\\theta\\cos\\theta$.',
          'Replace $1 - \\sin^2\\theta = \\cos^2\\theta$: $\\frac{2\\sin\\theta\\cos\\theta}{\\cos^2\\theta} = \\frac{2\\sin\\theta}{\\cos\\theta} = 2\\tan\\theta = \\text{RHS}$.',
        ],
        answer: '$\\text{LHS} \\equiv 2\\tan\\theta = \\text{RHS}$',
        markSchemeNotes: 'M1 common denominator, M1 expanding numerator to $2\\sin\\theta\\cos\\theta$, M1 using $1 - \\sin^2\\theta = \\cos^2\\theta$, A1 complete proof.',
      },
    ],
    commonMistakes: [
      'Cross-multiplying or treating a "Prove that..." identity like an equation to solve for $\\theta$.',
      'Writing $\\sqrt{\\sin^2\\theta + \\cos^2\\theta}$ as $\\sin\\theta + \\cos\\theta$ instead of $1$.',
    ],
    coursebookTip: 'If you ever get stuck mid-proof, work backwards from the RHS on scrap paper to see what target fraction in $\\sin\\theta$ and $\\cos\\theta$ you need to reach.',
    quickCheck: {
      id: '0606-10.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Simplify $(\\sec^2\\theta - \\tan^2\\theta) + 4(\\sin^2\\theta + \\cos^2\\theta)$ to a single number.',
      answer: '5',
      numericAnswer: 5,
      tolerance: 0,
      hint: 'Both brackets are direct Pythagorean identities!',
      solution: 'Since $\\sec^2\\theta - \\tan^2\\theta = 1$ and $\\sin^2\\theta + \\cos^2\\theta = 1$, the expression equals $1 + 4(1) = 5$.',
    },
  },
  {
    id: '10.4',
    chapterId: 10,
    code: '10.4',
    title: 'Solving trigonometric equations (degrees & radians)',
    tier: 'Extended',
    summary:
      'Solve linear, quadratic, and compound-angle ($\\sin(2x - 30^\\circ)$) trigonometric equations across specified intervals without dropping solutions or dividing by $\\sin x$ or $\\cos x$.',
    bigIdea:
      'For $\\sin(kx + c) = p$, ALWAYS scale the interval FIRST ($k\\theta_{\\min} + c \\le u \\le k\\theta_{\\max} + c$), collect EVERY valid $u$ inside the extended interval using ASTC, and ONLY THEN solve $kx + c = u$ back to $x$.',
    keyFindings: [
      {
        title: 'NEVER Divide by $\\sin x$ or $\\cos x$!',
        finding: 'If $3\\sin x\\cos x = \\sin x$, factorise $\\sin x(3\\cos x - 1) = 0$! Dividing by $\\sin x$ deletes the roots $\\sin x = 0$.',
      },
    ],
    stepByStepMethod: [
      'If two trig functions appear (e.g. $\\cos^2 x$ and $\\sin x$), use a Pythagorean identity to convert the **squared** term into the linear function ($\\cos^2 x = 1 - \\sin^2 x$, or $\\sec^2 x = 1 + \\tan^2 x$).',
      'Factorise or solve the quadratic (or rewrite $a\\sin x = b\\cos x$ as $\\tan x = \\frac{b}{a}$ since $\\cos x \\neq 0$ there).',
      'Compute the transformed angle range for $u = bx + c$ BEFORE finding inverse trig values.',
      'Use ASTC and periodicity ($+360^\\circ$ / $+2\\pi$ for $\\sin, \\cos$; $+180^\\circ$ / $+\\pi$ for $\\tan$) to capture every $u$ in range, then convert back to $x$ and round to $1$ d.p. (degrees) or $3$ s.f. (radians).',
    ],
    rapidSummary: [
      { rule: 'Degrees rounding', detail: 'Cambridge standard for non-exact degree answers is **$1$ decimal place** (unless told otherwise).' },
      { rule: 'Radians rounding', detail: 'Give **exact multiples of $\\pi$** where possible, otherwise **$3$ significant figures**.' },
      { rule: 'Check endpoints', detail: 'Note whether the interval uses $\\le$ (inclusive) or $<$ (strict).' },
    ],
    coreObjectives: [
      'Solve simple trigonometric equations and quadratic/identity-reduced equations for values in a specified interval (in degrees or radians), including equations of the form $\\sin(nx + \\alpha) = k$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Tan conversion', latex: 'a\\sin x + b\\cos x = 0 \\implies \\tan x = -\\frac{b}{a}' },
      { label: 'Interval scaling', latex: '0 \\le x \\le 2\\pi \\implies c \\le bx + c \\le 2b\\pi + c' },
    ],
    studyNotes: [
      {
        heading: 'Solving $\\sin(2x - \\frac{\\pi}{6}) = \\frac{1}{2}$ for $0 \\le x \\le \\pi$',
        body: 'Let $u = 2x - \\frac{\\pi}{6}$. The range for $u$ is $-\\frac{\\pi}{6} \\le u \\le \\frac{11\\pi}{6}$. Solutions to $\\sin u = \\frac{1}{2}$ in this window are $u = \\frac{\\pi}{6}$ and $u = \\frac{5\\pi}{6}$ (note $\\frac{13\\pi}{6} > \\frac{11\\pi}{6}$). Adding $\\frac{\\pi}{6}$ and dividing by $2$ gives $x = \\frac{\\pi}{6}$ and $x = \\frac{\\pi}{2}$.',
      },
    ],
    workedExamples: [
      {
        title: 'Quadratic trig equation using $\\sin^2 x + \\cos^2 x = 1$',
        question: 'Solve $2\\cos^2 x + 3\\sin x - 3 = 0$ for $0^\\circ \\le x \\le 360^\\circ$.',
        marks: 5,
        steps: [
          'Replace $\\cos^2 x = 1 - \\sin^2 x$: $2(1 - \\sin^2 x) + 3\\sin x - 3 = 0 \\implies 2\\sin^2 x - 3\\sin x + 1 = 0$.',
          'Factorise: $(2\\sin x - 1)(\\sin x - 1) = 0$.',
          'Thus $\\sin x = \\frac{1}{2}$ or $\\sin x = 1$.',
          'From $\\sin x = \\frac{1}{2}$ ($Q_1, Q_2$): $x = 30^\\circ, 150^\\circ$. From $\\sin x = 1$: $x = 90^\\circ$.',
        ],
        answer: '$x = 30^\\circ, \\; 90^\\circ, \\; 150^\\circ$',
        markSchemeNotes: 'M1 substituting $1 - \\sin^2 x$, M1 factorising, A1 $30^\\circ$, A1 $150^\\circ$, A1 $90^\\circ$.',
      },
    ],
    commonMistakes: [
      'Solving $\\sin(2x) = k$ by finding $x_1$ first and adding $360^\\circ$ instead of finding $2x$ across $0^\\circ \\le 2x \\le 720^\\circ$ first.',
      'Cancelling $\\sin x$ or $\\cos x$ across both sides instead of factorising $= 0$.',
    ],
    coursebookTip: 'Count the expected number of roots quickly: for $0^\\circ \\le x \\le 360^\\circ$, $\\sin(bx) = k$ ($|k|<1$) normally produces $2b$ solutions!',
    quickCheck: {
      id: '0606-10.4-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'How many solutions does $\\sin(3x) = 0.5$ have in the interval $0^\\circ \\le x \\le 360^\\circ$?',
      answer: '6',
      numericAnswer: 6,
      tolerance: 0,
      hint: 'Scale the interval to $0^\\circ \\le 3x \\le 1080^\\circ$ ($3$ full periods).',
      solution: 'Each $360^\\circ$ period of $u = 3x$ contains $2$ solutions to $\\sin u = 0.5$. Over $3$ periods ($0^\\circ$ to $1080^\\circ$), there are $3 \\times 2 = 6$ solutions.',
    },
  },
];
