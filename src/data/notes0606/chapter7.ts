import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_7_NOTES_0606: SubtopicNote[] = [
  {
    id: '7.1',
    chapterId: 7,
    code: '7.1',
    title: 'Coordinate geometry: lines, midpoints & perpendicular bisectors',
    tier: 'Extended',
    summary:
      'Find equations of straight lines, perpendicular bisectors, triangle areas from vertices, and solve collinearity or intersection geometry problems.',
    bigIdea:
      'Every straight line needs just one point $(x_1, y_1)$ and a gradient $m$. Two non-vertical lines are parallel iff $m_1 = m_2$ and perpendicular iff $m_1 m_2 = -1$.',
    keyFindings: [
      {
        title: 'Perpendicular Bisector Recipe',
        finding: 'Passes through the **midpoint** $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$ with negative reciprocal gradient $m_{\\perp} = -\\frac{1}{m_{AB}}$.',
      },
    ],
    stepByStepMethod: [
      'Find gradient $m = \\frac{y_2 - y_1}{x_2 - x_1}$ and midpoint $M$ if bisecting a segment.',
      'For a perpendicular line, flip the gradient fraction and reverse its sign: $m_{\\perp} = -\\frac{1}{m}$.',
      'Use $y - y_1 = m(x - x_1)$ and rearrange to $y = mx + c$ or $ax + by + c = 0$ as requested.',
      'To find intersection points (e.g. circumcentre or rectangle corners), solve the two line equations simultaneously.',
    ],
    rapidSummary: [
      { rule: 'Midpoint & length', detail: '$M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$, $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$.' },
      { rule: 'Perpendicular gradients', detail: '$m_1 m_2 = -1 \\iff m_2 = -\\frac{1}{m_1}$.' },
      { rule: 'Parallelogram / Rhombus 4th vertex', detail: 'Use equal midpoint of diagonals OR vector step $\\overrightarrow{AB} = \\overrightarrow{DC}$.' },
    ],
    coreObjectives: [
      'Interpret the equation of a straight-line graph in the form $y = mx + c$.',
      'Solve questions involving mid-point and length of a line, parallel and perpendicular lines, and perpendicular bisectors.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Point–slope line', latex: 'y - y_1 = m(x - x_1)' },
      { label: 'Perpendicular relation', latex: 'm_1 m_2 = -1' },
      { label: 'Section / Midpoint', latex: 'M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)' },
    ],
    studyNotes: [
      {
        heading: 'Finding the Area of a Triangle or Quadrilateral',
        body: 'In 0606 coordinate geometry, you often prove a triangle is right-angled ($m_{AB} m_{BC} = -1$) and compute $\\frac{1}{2} \\times AB \\times BC$, OR use the perpendicular height from a vertex to the opposite side, OR use the shoelace formula on ordered vertices.',
      },
    ],
    workedExamples: [
      {
        title: 'Equation of a perpendicular bisector',
        question: 'Points $A(1, 7)$ and $B(5, -1)$ are joined by line segment $AB$. Find the equation of the perpendicular bisector of $AB$ in the form $ax + by = c$.',
        marks: 4,
        steps: [
          'Midpoint of $AB$: $M = \\left(\\frac{1 + 5}{2}, \\frac{7 + (-1)}{2}\\right) = (3, 3)$.',
          'Gradient of $AB$: $m_{AB} = \\frac{-1 - 7}{5 - 1} = \\frac{-8}{4} = -2$.',
          'Perpendicular gradient: $m_{\\perp} = -\\frac{1}{-2} = \\frac{1}{2}$.',
          'Line through $(3, 3)$: $y - 3 = \\frac{1}{2}(x - 3) \\implies 2y - 6 = x - 3 \\implies x - 2y = -3$.',
        ],
        answer: '$x - 2y = -3$',
        markSchemeNotes: 'B1 midpoint $(3, 3)$, B1 $m_{AB} = -2$, M1 $m_{\\perp} = 1/2$, A1 for $x - 2y = -3$.',
      },
    ],
    commonMistakes: [
      'Using the endpoint $A$ or $B$ instead of the midpoint $M$ for a perpendicular bisector.',
      'Taking the reciprocal $\\frac{1}{m}$ without flipping the sign for a perpendicular line.',
    ],
    coursebookTip: 'For parallelogram vertex $D$ given $A, B, C$ in order $ABCD$, vector shifts beat simultaneous line equations every time: $D = A + (C - B)$.',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-7.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'The line $2x + ky = 7$ is perpendicular to $3x - 4y = 12$. Find $k$.',
      answer: '1.5',
      acceptedAnswers: ['3/2', '1.5'],
      numericAnswer: 1.5,
      tolerance: 0.01,
      hint: 'Write both lines in $y = mx + c$ form and solve $m_1 m_2 = -1$.',
      solution: 'Line 1 gradient is $-\\frac{2}{k}$; Line 2 is $y = \\frac{3}{4}x - 3$ so gradient is $\\frac{3}{4}$. Thus $(-\\frac{2}{k})(\\frac{3}{4}) = -1 \\implies \\frac{6}{4k} = 1 \\implies k = \\frac{3}{2} = 1.5$.',
    },
  },
  {
    id: '7.2',
    chapterId: 7,
    code: '7.2',
    title: 'Transforming non-linear equations to linear form (Linear Law)',
    tier: 'Extended',
    summary:
      'Reduce curved equations like $y = Ax^n$, $y = Ab^x$, $y^2 = Ax^3 + B$, $e^{2y} = Ax^2 + B$, and $y^3 = A\\ln x + B$ into $Y = mX + c$ to identify exact axes, gradient, and intercept.',
    bigIdea:
      'The variables on your straight-line axes ($Y$ and $X$) MUST NOT contain any unknown constants ($A, B, n, b$). Match your rearranged equation directly to $Y = mX + c$ so the constants sit strictly inside $m$ and $c$.',
    keyFindings: [
      {
        title: 'Two Fundamental Linearisation Families',
        finding: 'Additive relations ($y^2 = Ax^3 + B$) are ALREADY linear in $(X=x^3, Y=y^2)$; multiplicative power/exponential relations ($y = Ax^n, y = Ab^x$) require taking $\\ln$ or $\\lg$ on both sides first.',
      },
    ],
    stepByStepMethod: [
      'Inspect the target equation: if it is a product/power ($y = Ax^n$ or $y = Ab^x$), take $\\lg$ (or $\\ln$) of both sides.',
      'If it contains a sum or fraction ($y = \\frac{a}{x} + bx$), multiply/divide algebraically so one side matches the desired vertical variable $Y$ and the right side splits into $(\\text{constant}) \\cdot X + (\\text{constant})$.',
      'Align explicitly beneath $Y = mX + c$ to read off what $Y$, $X$, $m$, and $c$ represent.',
      'Use any two points on the line $(X_1, Y_1)$ and $(X_2, Y_2)$ to compute $m = \\frac{Y_2 - Y_1}{X_2 - X_1}$ and $c = Y_1 - mX_1$.',
    ],
    comparisonTable: {
      title: 'Linear Law Transformations (Y = mX + c)',
      headers: ['Non-linear Model', 'Linearised Form $Y = mX + c$', 'Plot $Y$ vs $X$', 'Gradient $m$ & Intercept $c$'],
      rows: [
        ['$y = Ax^n$', '$\\lg y = n\\lg x + \\lg A$', '$\\lg y$ vs $\\lg x$', '$m = n,\\; c = \\lg A$'],
        ['$y = Ab^x$', '$\\ln y = (\\ln b)x + \\ln A$', '$\\ln y$ vs $x$', '$m = \\ln b,\\; c = \\ln A$'],
        ['$y^2 = Ax^3 + B$', '$y^2 = A(x^3) + B$', '$y^2$ vs $x^3$', '$m = A,\\; c = B$'],
        ['$e^{2y} = Ax^2 + B$', '$e^{2y} = A(x^2) + B$', '$e^{2y}$ vs $x^2$', '$m = A,\\; c = B$'],
        ['$y^3 = A\\ln x + B$', '$y^3 = A(\\ln x) + B$', '$y^3$ vs $\\ln x$', '$m = A,\\; c = B$'],
      ],
    },
    rapidSummary: [
      { rule: 'Never put constants in axes', detail: '$Y$ and $X$ can only contain $x, y$ and known functions ($\\ln, x^2, \\frac{1}{x}$).' },
      { rule: 'Check which variable is $x$ in $y = Ab^x$', detail: 'Here $x$ stays linear ($X = x$), whereas in $y = Ax^n$ you plot $\\lg x$ ($X = \\lg x$)!' },
    ],
    coreObjectives: [
      'Transform given relationships, including $y = Ax^n$, $y = Ab^x$, $y^2 = Ax^3 + B$, $e^{2y} = Ax^2 + B$, and $y^3 = A\\ln x + B$, to straight-line form and vice versa.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Power law linearisation', latex: 'y = Ax^n \\iff \\lg y = n\\lg x + \\lg A' },
      { label: 'Exponential linearisation', latex: 'y = Ab^x \\iff \\ln y = (\\ln b)x + \\ln A' },
    ],
    studyNotes: [
      {
        heading: 'Going Backwards: Straight Line Graph $\\to$ Non-Linear Equation',
        body: 'Suppose a straight line is plotted with vertical axis $\\frac{y}{x}$ and horizontal axis $x^2$, having gradient $3$ and vertical intercept $-5$. Immediately write $\\frac{y}{x} = 3x^2 - 5$, then multiply by $x$ to recover $y = 3x^3 - 5x$!',
      },
    ],
    workedExamples: [
      {
        title: 'Recovering an original non-linear curve from its linear plot',
        question: 'When $\\ln y$ is plotted against $x^2$, a straight line passes through $(1, 3)$ and $(4, 9)$. Express $y$ explicitly in terms of $x$.',
        marks: 4,
        steps: [
          'Find the gradient: $m = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2$.',
          'Find the vertical intercept $c$: $3 = 2(1) + c \\implies c = 1$.',
          'Write the linear equation in $Y = \\ln y$ and $X = x^2$: $\\ln y = 2x^2 + 1$.',
          'Exponentiate both sides: $y = e^{2x^2 + 1}$.',
        ],
        answer: '$y = e^{2x^2 + 1}$ (or $y = e \\cdot e^{2x^2}$)',
        markSchemeNotes: 'M1 gradient $2$, M1 intercept $1$, A1 $\\ln y = 2x^2 + 1$, A1 for $y = e^{2x^2 + 1}$.',
      },
    ],
    commonMistakes: [
      'Reading $x$ and $y$ directly off the straight-line graph without remembering the axes are transformed (e.g. $\\ln y$ and $x^2$).',
      'Assuming $y$-intercept $= A$ when the vertical axis is $\\lg y$ (it is $\\lg A$, so $A = 10^c$, or $e^c$ for $\\ln$).',
    ],
    coursebookTip: 'Write the axis labels at the top of your working as $Y = \\dots$ and $X = \\dots$ and verify that every given coordinate pair is $(X, Y)$, not $(x, y)$, unless stated otherwise.',
    quickCheck: {
      id: '0606-7.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A straight line of $\\frac{1}{y}$ against $\\frac{1}{x}$ has gradient $2$ and passes through $(3, 8)$. Find the $\\frac{1}{y}$-intercept.',
      answer: '2',
      numericAnswer: 2,
      tolerance: 0,
      hint: 'Use $Y = mX + c$ with $X = 3, Y = 8, m = 2$.',
      solution: '$8 = 2(3) + c \\implies c = 2$.',
    },
  },
  {
    id: '7.3',
    chapterId: 7,
    code: '7.3',
    title: 'Experimental data & finding constants from linear graphs',
    tier: 'Extended',
    summary:
      'Compute transformed data tables, use gradient and vertical-axis intercept (never forgetting the base $e$ or $10$ when inverting $\\ln A$ or $\\lg A$) to determine constants, and estimate unknowns.',
    bigIdea:
      'Whether given an experimental data table or two graph points, convert into $(X, Y)$ first, find $m$ and $c$ on the line, and finally undo any logarithms ($A = 10^c$ or $A = e^c$).',
    keyFindings: [
      {
        title: 'Match the Log Base Carefully',
        finding: 'If the vertical axis is $\\lg y$ (base 10), then $\\lg A = c \\implies A = 10^c$. If the axis is $\\ln y$ (base $e$), then $\\ln A = c \\implies A = e^c$.',
      },
    ],
    stepByStepMethod: [
      'Check whether the given values are raw $(x, y)$ or already transformed $(X, Y)$.',
      'If $X = 0$ is not shown on the graph, DO NOT read the $Y$-intercept from the left edge of a truncated axis! Calculate $c = Y_1 - mX_1$ algebraically instead.',
      'Solve $m$ and $c$ into your target constants ($A, b, n, B$).',
      'To predict $y$ for a new $x$ (or vice versa), substitute into your solved equation (or read off the linear equation $Y = mX + c$ and invert).',
    ],
    rapidSummary: [
      { rule: 'Truncated axis trap', detail: 'Always check whether the horizontal axis starts at $X = 0$ before reading $c$ visually!' },
      { rule: 'Invert $\\lg A = c$', detail: '$A = 10^c$.' },
      { rule: 'Invert $\\ln A = c$', detail: '$A = e^c$.' },
    ],
    coreObjectives: [
      'Determine unknown constants from the gradient and intercept of a straight-line graph formed from non-linear variables.',
      'Estimate values of $x$ or $y$ using a linearised equation or graph.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Algebraic intercept', latex: 'c = Y_1 - m X_1, \\qquad m = \\frac{Y_2 - Y_1}{X_2 - X_1}' },
    ],
    studyNotes: [
      {
        heading: 'What to Watch in Paper 2 Calculator Data Questions',
        body: 'In experimental questions, compute transformed table values to $2$ or $3$ decimal places consistently, plot points accurately, and pick two well-separated points **on your drawn line of best fit** (not necessarily data points that lie slightly off the line!) to calculate $m = \\frac{\\Delta Y}{\\Delta X}$.',
      },
    ],
    workedExamples: [
      {
        title: 'Finding $A$ and $b$ in $y = Ab^x$ from two graph points',
        question: 'The variables $x$ and $y$ satisfy $y = Ab^x$. Plotting $\\lg y$ against $x$ gives a straight line passing through $(2, 0.7)$ and $(6, 1.9)$. Find the exact values of $A$ and $b$ in the form $10^k$.',
        marks: 4,
        steps: [
          'Take $\\lg$ of both sides: $\\lg y = (\\lg b)x + \\lg A$.',
          'Gradient: $m = \\frac{1.9 - 0.7}{6 - 2} = \\frac{1.2}{4} = 0.3$. So $\\lg b = 0.3 \\implies b = 10^{0.3}$.',
          'Substitute $(2, 0.7)$: $0.7 = 0.3(2) + \\lg A \\implies \\lg A = 0.1 \\implies A = 10^{0.1}$.',
        ],
        answer: '$A = 10^{0.1} \\;(\\approx 1.26), \\quad b = 10^{0.3} \\;(\\approx 2.00)$',
        markSchemeNotes: 'M1 linearising $\\lg y = (\\lg b)x + \\lg A$, M1 gradient $0.3$, A1 $b = 10^{0.3}$, A1 $A = 10^{0.1}$.',
      },
    ],
    commonMistakes: [
      'Taking $e^c$ when the axis was $\\lg y$, or $10^c$ when the axis was $\\ln y$.',
      'Reading a false intercept off a graph whose horizontal axis starts at $x = 2$ instead of $x = 0$.',
    ],
    coursebookTip: 'If a question gives $(X, Y)$ points where $X = 0$ is NOT on the axis, always compute $c = Y_1 - mX_1$ algebraically.',
    quickCheck: {
      id: '0606-7.3-qc',
      marks: 2,
      paperType: 'Calculator',
      prompt: 'For $y = Ax^n$, plotting $\\ln y$ against $\\ln x$ gives a line through $(1, 3.2)$ and $(3, 6.2)$. Find $n$.',
      answer: '1.5',
      numericAnswer: 1.5,
      tolerance: 0.01,
      hint: '$\\ln y = n\\ln x + \\ln A$, so $n$ equals the gradient of the line.',
      solution: '$n = \\frac{6.2 - 3.2}{3 - 1} = \\frac{3.0}{2} = 1.5$.',
    },
  },
];
