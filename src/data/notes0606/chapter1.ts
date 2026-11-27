import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_1_NOTES_0606: SubtopicNote[] = [
  {
    id: '1.1',
    chapterId: 1,
    code: '1.1',
    title: 'Function notation, domain and range',
    tier: 'Extended',
    summary:
      'Identify valid functions versus one-many relations, determine maximal domains (avoiding zero denominators, negative even roots, and non-positive log arguments), and find exact ranges.',
    bigIdea:
      'A function assigns each permitted input $x$ (the domain) to exactly one output $f(x)$ (in the range). Sketching the graph or checking turning points over the restricted domain reveals the true range.',
    keyFindings: [
      {
        title: 'Domain restrictions in 0606',
        finding: 'Check denominators ($\\neq 0$), square roots ($\\ge 0$), and logarithms ($> 0$).',
        noteBox:
          'For example, $f(x) = \\ln(2x - 6)$ requires $2x - 6 > 0 \\implies x > 3$, while $g(x) = \\frac{1}{\\sqrt{x - 1}}$ requires $x > 1$.',
      },
      {
        title: 'Vertical Line Test',
        finding: 'A curve represents a function iff every vertical line $x = k$ cuts it at most once.',
      },
    ],
    stepByStepMethod: [
      'Read any stated domain restriction carefully (e.g. $x \\ge 2$ or $x \\in \\mathbb{R}, x \\neq 3$).',
      'To find the range, sketch $y = f(x)$ across that exact domain and find the minimum and maximum $y$-values.',
      'For a quadratic over a restricted interval, check whether the vertex lies inside the domain or only at an endpoint.',
      'Use open brackets/strict inequalities ($>$) for asymptotes or excluded endpoints and $\\ge / \\le$ for attained extrema.',
    ],
    comparisonTable: {
      title: 'Common Domain & Range Reference',
      headers: ['Function Type', 'Natural Domain Constraint', 'Typical Range ($x \\in \\mathbb{R}$)'],
      rows: [
        ['$f(x) = a(x - p)^2 + q$, $a > 0$', '$x \\in \\mathbb{R}$', '$f(x) \\ge q$'],
        ['$f(x) = 2e^x + c$', '$x \\in \\mathbb{R}$', '$f(x) > c$ (asymptote $y = c$)'],
        ['$f(x) = \\lg(ax + b)$', '$ax + b > 0$', '$f(x) \\in \\mathbb{R}$'],
        ['$f(x) = \\frac{k}{x - a} + c$', '$x \\neq a$', '$f(x) \\neq c$'],
      ],
    },
    rapidSummary: [
      { rule: 'Function test', detail: 'Every input $x$ maps to a unique output $y$ (one-one or many-one).' },
      { rule: 'Range of $y = ke^{ax} + c$', detail: 'Since $e^{ax} > 0$, range is $y > c$ when $k > 0$.' },
      { rule: 'Strict inequality for $\\ln$', detail: '$\\ln u$ is only defined for $u > 0$, never $u = 0$.' },
    ],
    coreObjectives: [
      'Understand the terms: function, domain, range (image set), one-one function, inverse function and composition of functions.',
      'Use the notation $f(x) = 2x + 1$, $f: x \\mapsto 2x + 1$, including algebraic, $e^x$, and logarithmic functions such as $f(x) = \\lg x$.',
      'Find the domain and range for a given function, accounting for stated restrictions or natural singularities.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Exponential range', latex: 'f(x) = ke^{ax} + c \\;(k > 0) \\implies f(x) > c' },
      { label: 'Logarithm domain', latex: 'f(x) = \\ln(g(x)) \\implies g(x) > 0' },
      { label: 'Mapping notation', latex: 'f: x \\mapsto f(x), \\quad x \\in D' },
    ],
    studyNotes: [
      {
        heading: 'Functions vs Non-Functions',
        body: 'In Cambridge 0606, a relation is only a function if each element in the domain has **one unique image**. Both one-one ($y = 2x + 1$) and many-one ($y = x^2$) relations are functions, whereas a one-many curve ($x = y^2$) is **not** a function unless its branch ($y = +\\sqrt{x}$) is specified.',
      },
      {
        heading: 'Finding Range from a Restricted Domain',
        body: 'Never find the range of a non-monotonic function simply by plugging in the endpoints! Always locate the turning point first.',
        noteBox:
          'Example trap: If $f(x) = x^2 - 4x + 7$ for $0 \\le x \\le 5$, the endpoints give $f(0) = 7$ and $f(5) = 12$, yet the minimum lies at the vertex $x = 2$, where $f(2) = 3$. Therefore the true range is $3 \\le f(x) \\le 12$.',
      },
    ],
    workedExamples: [
      {
        title: 'Range of a quadratic on a restricted domain',
        question: 'The function $f$ is defined by $f(x) = 2(x - 3)^2 - 5$ for $1 \\le x \\le 6$. State the range of $f$.',
        marks: 3,
        steps: [
          'The parabola opens upward with vertex at $x = 3$, which lies inside the domain $1 \\le x \\le 6$. So $f_{\\min} = -5$.',
          'Check both endpoints: $f(1) = 2(-2)^2 - 5 = 3$, and $f(6) = 2(3)^2 - 5 = 13$.',
          'The maximum value on the interval is $13$.',
        ],
        answer: '$-5 \\le f(x) \\le 13$',
        markSchemeNotes: 'B1 for minimum $-5$, M1 for checking $x = 6$, A1 for $-5 \\le f(x) \\le 13$.',
      },
      {
        title: 'Domain & range of an exponential shift',
        question: 'Given $g(x) = 4 - 3e^{2x}$ for $x \\ge 0$, find the range of $g$.',
        marks: 2,
        steps: [
          'Since $x \\ge 0$, $e^{2x} \\ge e^0 = 1$.',
          'Multiplying by $-3$ reverses the inequality: $-3e^{2x} \\le -3$.',
          'Adding $4$: $g(x) = 4 - 3e^{2x} \\le 1$. Since $e^{2x}$ grows without bound, there is no lower limit.',
        ],
        answer: '$g(x) \\le 1$',
        markSchemeNotes: 'M1 for $g(0) = 1$ with decreasing exponential behaviour, A1 for $g(x) \\le 1$.',
      },
    ],
    commonMistakes: [
      'Evaluating endpoints only for a quadratic range instead of checking whether the vertex falls inside the domain.',
      'Writing $x > 0$ for the range instead of $f(x) > 0$ or $y > 0$ — range always describes output values.',
    ],
    coursebookTip: 'Sketch a quick 2 cm parabola or exponential curve beside the question so you immediately see whether the function attains a turning point inside the domain.',
    fastForward: 'Chapter 2 uses completing the square to locate quadratic turning points rapidly.',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-1.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'For $f(x) = (x - 2)^2 + 6$ with domain $0 \\le x \\le 5$, what is the minimum value in the range of $f$?',
      answer: '6',
      numericAnswer: 6,
      tolerance: 0,
      hint: 'Check whether the vertex $x = 2$ lies between $0$ and $5$.',
      solution: 'Since $x = 2 \\in [0, 5]$, the vertex $(2, 6)$ is attained, so the minimum value is $6$.',
    },
  },
  {
    id: '1.2',
    chapterId: 1,
    code: '1.2',
    title: 'One-one functions & inverse functions',
    tier: 'Extended',
    summary:
      'Explain why only one-one functions possess inverses, compute $f^{-1}(x)$ algebraically, swap domain and range cleanly, and sketch $y = f^{-1}(x)$ by reflecting in $y = x$.',
    bigIdea:
      'An inverse function undoes $f$: if $f$ maps $a \\to b$, then $f^{-1}$ maps $b \\to a$. Therefore the domain of $f^{-1}$ equals the range of $f$, and the range of $f^{-1}$ equals the domain of $f$.',
    keyFindings: [
      {
        title: 'Horizontal Line Test for One-One',
        finding: 'If any horizontal line $y = k$ intersects $y = f(x)$ more than once, $f$ is many-one and has NO inverse unless the domain is restricted.',
        noteBox:
          'For $f(x) = (x - p)^2 + q$, restricting the domain to $x \\ge p$ (or $x \\le p$) makes $f$ strictly monotonic and therefore one-one.',
      },
    ],
    stepByStepMethod: [
      'Write $y = f(x)$ (or use $f(x) = a(x-p)^2 + q$ if $f$ is a restricted quadratic).',
      'Rearrange algebraically to make $x$ the subject in terms of $y$.',
      'When taking $\\pm\\sqrt{\\dots}$, choose $+$ or $-$ to match the domain of $f$ (which becomes the range of $f^{-1}$).',
      'Swap $x$ and $y$ to write $f^{-1}(x) = \\dots$, and state the domain of $f^{-1}$ (= range of $f$).',
    ],
    rapidSummary: [
      { rule: 'Inverse condition', detail: 'Only **one-one** functions have an inverse.' },
      { rule: 'Domain–Range swap', detail: '$\\text{Domain}(f^{-1}) = \\text{Range}(f)$ and $\\text{Range}(f^{-1}) = \\text{Domain}(f)$.' },
      { rule: 'Graphical reflection', detail: '$y = f^{-1}(x)$ is the reflection of $y = f(x)$ in the line $y = x$.' },
    ],
    coreObjectives: [
      'Understand why a function must be one-one to have an inverse, and find the largest/smallest domain cut-off making a quadratic one-one.',
      'Find an inverse function $f^{-1}$ algebraically and state its domain and range.',
      'Understand and use the geometrical symmetry between $y = f(x)$ and $y = f^{-1}(x)$ across $y = x$, including solving $f(x) = f^{-1}(x)$ via $f(x) = x$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Inverse identity', latex: 'f(f^{-1}(x)) = x, \\qquad f^{-1}(f(x)) = x' },
      { label: 'Self-inverse property', latex: 'f = f^{-1} \\iff f(f(x)) = x' },
      { label: 'Intersection shortcut', latex: 'f(x) = f^{-1}(x) \\text{ often lies on } y = x \\text{ for increasing } f' },
    ],
    studyNotes: [
      {
        heading: 'Choosing the Correct Square Root Sign',
        body: 'When inverting a restricted quadratic $f(x) = (x - 3)^2 + 1$, rearrange to $(x - 3)^2 = y - 1 \\implies x = 3 \\pm \\sqrt{y - 1}$.',
        bullets: [
          'If the stated domain of $f$ is $x \\ge 3$, then $f^{-1}(x)$ must output values $\\ge 3$, so choose the $+$ sign: $f^{-1}(x) = 3 + \\sqrt{x - 1}$ for $x \\ge 1$.',
          'If the stated domain of $f$ is $x \\le 3$, choose the $-$ sign: $f^{-1}(x) = 3 - \\sqrt{x - 1}$ for $x \\ge 1$.',
        ],
      },
      {
        heading: 'Inverting Exponential and Logarithmic Functions',
        body: 'To invert $f(x) = 2e^{3x} - 5$, isolate $e^{3x} = \\frac{y + 5}{2}$, take natural logs to get $3x = \\ln\\!\\left(\\frac{y + 5}{2}\\right)$, and swap variables: $f^{-1}(x) = \\frac{1}{3}\\ln\\!\\left(\\frac{x + 5}{2}\\right)$ with domain $x > -5$.',
      },
    ],
    workedExamples: [
      {
        title: 'Domain restriction and inverse of a quadratic',
        question: 'The function $f$ is defined by $f(x) = x^2 - 6x + 11$ for $x \\ge k$. State the least value of $k$ for which $f^{-1}$ exists, and for this value of $k$ find $f^{-1}(x)$ and its domain.',
        marks: 4,
        steps: [
          'Complete the square: $f(x) = (x - 3)^2 + 2$. The line of symmetry is $x = 3$, so $f$ is one-one for $x \\ge 3$, giving least $k = 3$.',
          'For $x \\ge 3$, $(x - 3)^2 \\ge 0$, so the range of $f$ is $f(x) \\ge 2$.',
          'Set $y = (x - 3)^2 + 2 \\implies (x - 3)^2 = y - 2 \\implies x = 3 + \\sqrt{y - 2}$ (taking $+$ since $x \\ge 3$).',
          'Swap $x$ and $y$: $f^{-1}(x) = 3 + \\sqrt{x - 2}$, domain $x \\ge 2$.',
        ],
        answer: '$k = 3$; $f^{-1}(x) = 3 + \\sqrt{x - 2}$, domain $x \\ge 2$',
        markSchemeNotes: 'B1 for $k = 3$, M1 for completing square/isolating $x$, A1 for $+\\sqrt{x - 2}$ branch, B1 for domain $x \\ge 2$.',
      },
    ],
    commonMistakes: [
      'Leaving $\\pm$ in $f^{-1}(x)$ — an inverse function can only have ONE sign, dictated by the original domain of $f$.',
      'Giving the domain of $f^{-1}$ as the domain of $f$ instead of the range of $f$.',
    ],
    coursebookTip: 'On sketch questions, always draw the dashed line $y = x$ first and plot where $y = f(x)$ crosses axes: $(0, c)$ reflects cleanly to $(c, 0)$.',
    quickCheck: {
      id: '0606-1.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'If $f(x) = \\frac{2x + 3}{x - 1}$ ($x \\neq 1$), evaluate $f^{-1}(4)$.',
      answer: '3.5',
      acceptedAnswers: ['7/2', '3.5'],
      numericAnswer: 3.5,
      tolerance: 0.01,
      hint: 'You do not need the full formula for $f^{-1}(x)$: just solve $f(x) = 4$.',
      solution: '$\\frac{2x + 3}{x - 1} = 4 \\implies 2x + 3 = 4x - 4 \\implies 2x = 7 \\implies x = \\frac{7}{2} = 3.5$.',
    },
  },
  {
    id: '1.3',
    chapterId: 1,
    code: '1.3',
    title: 'Composite functions & restricted domains',
    tier: 'Extended',
    summary:
      'Form and evaluate $fg(x)$, $gf(x)$, and $f^2(x)$ (not including trig compositions in 0606), test existence of $fg$ via $\\text{Range}(g) \\subseteq \\text{Domain}(f)$, and determine composite ranges.',
    bigIdea:
      '$fg(x)$ means $f(g(x))$: apply the inner (right-hand) function $g$ first, then feed its output into $f$. In general $fg(x) \\neq gf(x)$.',
    keyFindings: [
      {
        title: 'Existence condition for $fg$',
        finding: '$fg$ exists only if every output of $g$ is a valid input to $f$: $\\text{Range}(g) \\subseteq \\text{Domain}(f)$.',
        noteBox:
          'When finding the range of $fg(x)$, feed the **range of $g$** as the effective input interval into $f$, rather than blindly finding the unrestricted range of the simplified algebraic expression.',
      },
    ],
    stepByStepMethod: [
      'Identify the inner function $g(x)$ (right) and outer function $f(x)$ (left).',
      'To evaluate $fg(a)$ numerically, compute $u = g(a)$ first, then $f(u)$.',
      'To form the expression $fg(x)$, replace every $x$ inside $f$ with the entire expression $g(x)$.',
      'Check if $\\text{Range}(g) \\subseteq \\text{Domain}(f)$; if not, restrict $\\text{Domain}(g)$ so all outputs satisfy $f$’s domain.',
    ],
    rapidSummary: [
      { rule: 'Order of evaluation', detail: '$fg(x) = f(g(x))$ — work from right to left.' },
      { rule: 'Existence of $fg$', detail: '$\\text{Range}(g) \\subseteq \\text{Domain}(f)$.' },
      { rule: 'Inverse of composite', detail: '$(fg)^{-1}(x) = g^{-1}f^{-1}(x)$ (socks and shoes rule).' },
    ],
    coreObjectives: [
      'Form composite functions (excluding trigonometric compositions) and recognise $f^2(x)$ as $f(f(x))$.',
      'Understand why $fg$ may fail to exist unless domains are restricted, and find the domain and range of $fg$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Composition', latex: 'fg(x) = f(g(x)), \\qquad f^2(x) = f(f(x))' },
      { label: 'Existence condition', latex: 'fg \\text{ defined } \\iff \\text{Range}(g) \\subseteq \\text{Domain}(f)' },
    ],
    studyNotes: [
      {
        heading: 'Why $fg$ Can Fail to Exist',
        body: 'Suppose $f(x) = \\ln x$ ($x > 0$) and $g(x) = x - 4$ ($x \\in \\mathbb{R}$). Since $g$ can output negative numbers (when $x \\le 4$), $fg$ cannot be formed on all of $\\mathbb{R}$. To make $fg$ exist, restrict the domain of $g$ so $x - 4 > 0 \\implies x > 4$.',
      },
    ],
    workedExamples: [
      {
        title: 'Forming $fg$ and finding its range',
        question: 'Given $f(x) = 3x + 2$ ($x \\in \\mathbb{R}$) and $g(x) = e^x - 1$ ($x \\ge 0$), find $fg(x)$ and state its range.',
        marks: 3,
        steps: [
          '$fg(x) = f(e^x - 1) = 3(e^x - 1) + 2 = 3e^x - 1$.',
          'For $x \\ge 0$, $e^x \\ge 1$, so the range of $g$ is $g(x) \\ge 0$.',
          'Feeding $u \\ge 0$ into $f(u) = 3u + 2$ gives $fg(x) \\ge 3(0) + 2 = 2$.',
        ],
        answer: '$fg(x) = 3e^x - 1$, range $fg(x) \\ge 2$',
        markSchemeNotes: 'M1 for substituting $g$ into $f$, A1 for $3e^x - 1$, B1 for range $fg(x) \\ge 2$.',
      },
    ],
    commonMistakes: [
      'Evaluating $fg(x)$ in left-to-right order $g(f(x))$ instead of right-to-left $f(g(x))$.',
      'Misreading $f^2(x)$ as $[f(x)]^2$ instead of $f(f(x))$.',
    ],
    coursebookTip: 'Always double-check whether the question specifies $fg$ or $gf$, and remember $f^2(x)$ means apply $f$ twice, never square $f(x)$.',
    quickCheck: {
      id: '0606-1.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Given $f(x) = 2x - 5$ and $g(x) = x^2 + 1$, find $fg(3)$.',
      answer: '15',
      numericAnswer: 15,
      tolerance: 0,
      hint: 'Compute $g(3)$ first, then substitute that number into $f$.',
      solution: '$g(3) = 3^2 + 1 = 10$, then $fg(3) = f(10) = 2(10) - 5 = 15$.',
    },
  },
  {
    id: '1.4',
    chapterId: 1,
    code: '1.4',
    title: 'Modulus functions & transformations |f(x)|',
    tier: 'Extended',
    summary:
      'Sketch and interpret $y = |f(x)|$ for linear, quadratic, cubic, and trigonometric functions by reflecting negative portions across the $x$-axis.',
    bigIdea:
      'The modulus operator $|u|$ keeps non-negative outputs unchanged and flips negative outputs ($u < 0$) upward to $-u$, turning smooth $x$-axis crossings into sharp V-shaped cusps.',
    keyFindings: [
      {
        title: 'Graph of $y = |f(x)|$',
        finding: 'Draw $y = f(x)$ lightly first; keep parts above/on the $x$-axis and reflect every part below the $x$-axis upwards.',
        noteBox:
          'At any simple root $x = r$ where $f(r) = 0$, the graph of $y = |f(x)|$ forms a sharp corner (cusp) touching the $x$-axis at $(r, 0)$.',
      },
    ],
    stepByStepMethod: [
      'Sketch the underlying curve $y = f(x)$ lightly with axes intercepts and turning points marked.',
      'Highlight all sections where $f(x) \\ge 0$ (they stay identical).',
      'Reflect every section where $f(x) < 0$ across the $x$-axis (turning $(x, -k)$ into $(x, +k)$).',
      'Re-label reflected local maxima/minima and $y$-intercepts (e.g. $(0, -5)$ becomes $(0, 5)$).',
    ],
    rapidSummary: [
      { rule: 'Definition of $|u|$', detail: '$|u| = u$ if $u \\ge 0$, and $|u| = -u$ if $u < 0$.' },
      { rule: 'Reflection rule', detail: 'To graph $y = |f(x)|$, reflect parts with $y < 0$ in the $x$-axis.' },
      { rule: 'Range of $|f(x)|$', detail: '$|f(x)| \\ge 0$ always.' },
    ],
    coreObjectives: [
      'Understand the relationship between $y = f(x)$ and $y = |f(x)|$, where $f(x)$ may be linear, quadratic, cubic, or trigonometric.',
      'Identify coordinates of vertices, cusps, and axes intercepts of modulus graphs.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Piecewise modulus', latex: '|f(x)| = \\begin{cases} f(x) & \\text{if } f(x) \\ge 0 \\\\ -f(x) & \\text{if } f(x) < 0 \\end{cases}' },
      { label: 'Linear V-vertex', latex: 'y = |ax + b| + c \\implies \\text{vertex at } \\left(-\\frac{b}{a}, c\\right)' },
    ],
    studyNotes: [
      {
        heading: 'Modulus of Quadratics and Trig Curves',
        body: 'For $y = |x^2 - 4|$, the inverted parabola section between $x = -2$ and $x = 2$ reflects above the $x$-axis to form a W-shaped curve with a local maximum at $(0, 4)$ and cusps at $(-2, 0)$ and $(2, 0)$. Similarly, $y = |\\sin x|$ creates positive arches of height $1$ with period $\\pi$ (or $180^\\circ$).',
      },
    ],
    workedExamples: [
      {
        title: 'Vertex and intercepts of a modulus linear graph',
        question: 'Sketch $y = |2x - 6| - 2$ and state the coordinates of its vertex and axes intercepts.',
        marks: 4,
        steps: [
          'The vertex occurs where the modulus equals $0$: $2x - 6 = 0 \\implies x = 3$, giving $y = -2$. Vertex is $(3, -2)$.',
          'For the $y$-intercept, set $x = 0$: $y = |-6| - 2 = 6 - 2 = 4$, giving $(0, 4)$.',
          'For $x$-intercepts, solve $|2x - 6| = 2$: $2x - 6 = 2 \\implies x = 4$, or $2x - 6 = -2 \\implies x = 2$. Intercepts are $(2, 0)$ and $(4, 0)$.',
        ],
        answer: 'Vertex $(3, -2)$; $y$-intercept $(0, 4)$; $x$-intercepts $(2, 0)$ and $(4, 0)$',
        markSchemeNotes: 'B1 vertex $(3, -2)$, B1 $y$-int $(0, 4)$, B1+B1 for $x$-ints $(2, 0)$ and $(4, 0)$.',
      },
    ],
    commonMistakes: [
      'Rounding off the cusp of $y = |f(x)|$ at the $x$-axis like a smooth parabola — modulus corners must look sharp.',
      'Forgetting that $y = |f(x)| + c$ shifts the V vertically by $c$, so $y$ can be negative if $c < 0$.',
    ],
    coursebookTip: 'When a question asks for the number of solutions to $|f(x)| = k$, draw $y = |f(x)|$ accurately with key turning-point heights labelled, then count horizontal line intersections with $y = k$.',
    quickCheck: {
      id: '0606-1.4-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'For the curve $y = |x^2 - 9|$, find the $y$-coordinate of the local maximum turning point.',
      answer: '9',
      numericAnswer: 9,
      tolerance: 0,
      hint: 'Find the minimum of $y = x^2 - 9$, then reflect it across the $x$-axis.',
      solution: '$y = x^2 - 9$ has its vertex at $(0, -9)$, which reflects to a local maximum at $(0, 9)$, so $y = 9$.',
    },
  },
];
