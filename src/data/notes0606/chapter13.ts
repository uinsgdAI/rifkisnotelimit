import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_13_NOTES_0606: SubtopicNote[] = [
  {
    id: '13.1',
    chapterId: 13,
    code: '13.1',
    title: 'Vector notation, position vectors, magnitude & unit vectors',
    tier: 'Extended',
    summary:
      'Use column vectors $\\binom{a}{b}$, component vectors $a\\mathbf{i} - b\\mathbf{j}$, and directed segments $\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a}$, compute vector magnitude $|\\mathbf{v}|$, and construct unit vectors $\\hat{\\mathbf{v}} = \\frac{\\mathbf{v}}{|\\mathbf{v}|}$.',
    bigIdea:
      'A 2D vector stores an $x$-step and a $y$-step simultaneously. Its magnitude $|\\mathbf{a}| = \\sqrt{x^2 + y^2}$ is just Pythagoras on its components, and dividing $\\mathbf{a}$ by $|\\mathbf{a}|$ scales its length to exactly $1$ without changing its direction.',
    keyFindings: [
      {
        title: 'Vector of Given Magnitude $k$ in the Direction of $\\mathbf{a}$',
        finding:
          'First normalise $\\mathbf{a}$ into its unit vector $\\hat{\\mathbf{a}} = \\frac{\\mathbf{a}}{|\\mathbf{a}|}$, then multiply by $k$: $\\mathbf{v} = k \\cdot \\frac{\\mathbf{a}}{|\\mathbf{a}|}$.',
      },
    ],
    stepByStepMethod: [
      'Convert any point $P(x, y)$ into its position vector $\\overrightarrow{OP} = \\begin{pmatrix} x \\\\ y \\end{pmatrix} = x\\mathbf{i} + y\\mathbf{j}$.',
      'Find displacement from $A$ to $B$ via the tip-minus-tail rule: $\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA}$.',
      'Calculate magnitude $|\\mathbf{v}| = \\sqrt{x^2 + y^2}$ (always $\\ge 0$, leave as an exact simplified surd if required).',
      'To build a unit vector, compute $\\frac{1}{|\\mathbf{v}|}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$; to build a vector of length $k$ parallel to $\\mathbf{v}$, multiply by $\\frac{k}{|\\mathbf{v}|}$.',
    ],
    rapidSummary: [
      { rule: 'Tip minus tail', detail: '$\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA} = \\mathbf{b} - \\mathbf{a}$.' },
      { rule: 'Magnitude', detail: '$|x\\mathbf{i} + y\\mathbf{j}| = \\sqrt{x^2 + y^2}$.' },
      { rule: 'Unit vector', detail: '$\\hat{\\mathbf{a}} = \\frac{\\mathbf{a}}{|\\mathbf{a}|}$ (has magnitude $1$).' },
    ],
    coreObjectives: [
      'Understand and use vector notation including column vectors $\\binom{a}{b}$, $\\overrightarrow{AB}$, $\\mathbf{p}$, and $a\\mathbf{i} - b\\mathbf{j}$.',
      'Know and use position vectors and unit vectors, and calculate the magnitude of a vector.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Position & displacement', latex: '\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA}' },
      { label: 'Magnitude & unit vector', latex: '|\\mathbf{a}| = \\sqrt{x^2 + y^2}, \\qquad \\hat{\\mathbf{a}} = \\frac{\\mathbf{a}}{|\\mathbf{a}|}' },
    ],
    studyNotes: [
      {
        heading: 'Midpoint & Ratio Division Using Position Vectors',
        body: 'If $M$ divides segment $AB$ in the ratio $m : n$ (so $\\overrightarrow{AM} = \\frac{m}{m+n}\\overrightarrow{AB}$), then $\\overrightarrow{OM} = \\overrightarrow{OA} + \\frac{m}{m+n}(\\overrightarrow{OB} - \\overrightarrow{OA}) = \\frac{n\\mathbf{a} + m\\mathbf{b}}{m+n}$. For the midpoint ($1:1$), $\\overrightarrow{OM} = \\frac{1}{2}(\\mathbf{a} + \\mathbf{b})$.',
      },
    ],
    workedExamples: [
      {
        title: 'Finding a Vector of Specified Magnitude',
        question:
          'Points $A$ and $B$ have position vectors $2\\mathbf{i} - \\mathbf{j}$ and $8\\mathbf{i} + 7\\mathbf{j}$ respectively. Find the vector $\\mathbf{p}$ of magnitude $20$ in the direction of $\\overrightarrow{AB}$.',
        marks: 4,
        steps: [
          '$\\overrightarrow{AB} = \\overrightarrow{OB} - \\overrightarrow{OA} = (8\\mathbf{i} + 7\\mathbf{j}) - (2\\mathbf{i} - \\mathbf{j}) = 6\\mathbf{i} + 8\\mathbf{j}$.',
          'Magnitude: $|\\overrightarrow{AB}| = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$.',
          'Unit vector in direction $\\overrightarrow{AB}$: $\\frac{1}{10}(6\\mathbf{i} + 8\\mathbf{j})$.',
          'Scale to magnitude $20$: $\\mathbf{p} = 20 \\times \\frac{1}{10}(6\\mathbf{i} + 8\\mathbf{j}) = 12\\mathbf{i} + 16\\mathbf{j}$.',
        ],
        answer: '$12\\mathbf{i} + 16\\mathbf{j}$',
        markSchemeNotes: 'M1 for $\\overrightarrow{OB} - \\overrightarrow{OA}$; A1 for $6\\mathbf{i} + 8\\mathbf{j}$; M1 for dividing by $|\\overrightarrow{AB}| = 10$ and multiplying by $20$; A1 for $12\\mathbf{i} + 16\\mathbf{j}$.',
      },
    ],
    commonMistakes: [
      'Computing $\\overrightarrow{AB}$ backwards as $\\overrightarrow{OA} - \\overrightarrow{OB}$.',
      'Squaring $-y$ incorrectly inside $\\sqrt{x^2 + y^2}$ (writing $-y^2$ instead of $(-y)^2$).',
      'Writing arrows/underlines inconsistently — in written exams, underline vector letters like $\\underline{p}$ or $\\underline{i}, \\underline{j}$ so examiners can distinguish vectors from scalars.',
    ],
    coursebookTip:
      'Think "end minus start": $\\overrightarrow{PQ}$ always means $\\overrightarrow{OQ} - \\overrightarrow{OP}$. Check with a quick numerical coordinate sketch if unsure.',
    quickCheck: {
      id: '0606-13.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'The vector $\\mathbf{v} = \\begin{pmatrix} k \\\\ 8 \\end{pmatrix}$ has magnitude $10$ and $k > 0$. Find the value of $k$.',
      answer: '6',
      numericAnswer: 6,
      tolerance: 0,
      hint: 'Set $\\sqrt{k^2 + 8^2} = 10$ and square both sides.',
      solution: '$k^2 + 64 = 100 \\implies k^2 = 36 \\implies k = 6$ (since $k > 0$).',
    },
  },
  {
    id: '13.2',
    chapterId: 13,
    code: '13.2',
    title: 'Equating like vectors, parallel vectors & geometry proofs',
    tier: 'Extended',
    summary:
      'Add, subtract, and scale vectors, equate coefficients of non-parallel base vectors $\\mathbf{a}$ and $\\mathbf{b}$ (or $\\mathbf{i}$ and $\\mathbf{j}$), prove points are collinear, and solve vector geometry ratio problems.',
    bigIdea:
      'If two non-parallel vectors $\\mathbf{a}$ and $\\mathbf{b}$ satisfy $\\lambda \\mathbf{a} + \\mu \\mathbf{b} = p\\mathbf{a} + q\\mathbf{b}$, then their components MUST match independently: $\\lambda = p$ and $\\mu = q$. Expressing the same point $X$ via TWO different geometric paths lets you equate coefficients and lock down unknown ratios!',
    keyFindings: [
      {
        title: 'Two-Path Intersection Strategy',
        finding:
          'To find where lines $OAB$ and $PQR$ intersect at $X$: express $\\overrightarrow{OX}$ along line 1 using scalar $\\lambda$, express $\\overrightarrow{OX}$ along line 2 using scalar $\\mu$, equate the $\\mathbf{a}$-coefficients and $\\mathbf{b}$-coefficients to solve for $\\lambda$ and $\\mu$.',
      },
    ],
    stepByStepMethod: [
      'Draw and label a rough vector triangle or quadrilateral diagram showing arrows.',
      'To prove two vectors $\\mathbf{u}$ and $\\mathbf{v}$ are parallel, show $\\mathbf{u} = k\\mathbf{v}$ for a scalar $k$.',
      'To prove three points $A, B, C$ are collinear, show $\\overrightarrow{AB} = k\\overrightarrow{BC}$ (parallel) AND state explicitly that they share point $B$!',
      'To solve for unknown ratios $\\lambda, \\mu$ at an intersection point $X$, write $\\overrightarrow{OX}$ in two distinct ways and equate coefficients of $\\mathbf{a}$ and $\\mathbf{b}$.',
    ],
    rapidSummary: [
      { rule: 'Equating like vectors', detail: 'If $\\mathbf{a} \\nparallel \\mathbf{b}$ and $\\lambda\\mathbf{a} + \\mu\\mathbf{b} = p\\mathbf{a} + q\\mathbf{b}$, then $\\lambda = p$ and $\\mu = q$.' },
      { rule: 'Parallel & collinear', detail: '$\\overrightarrow{AB} = k\\overrightarrow{AC}$ (shared point $A$) $\\implies A, B, C$ collinear and $|AB|:|AC| = |k|:1$.' },
    ],
    coreObjectives: [
      'Add and subtract vectors and multiply vectors by scalars.',
      'Equate like vectors and solve vector geometry problems, including collinearity and intersection ratios.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Equating non-parallel vectors', latex: '\\lambda\\mathbf{a} + \\mu\\mathbf{b} = p\\mathbf{a} + q\\mathbf{b} \\implies \\lambda = p,\\; \\mu = q' },
      { label: 'Parallel condition', latex: '\\mathbf{u} \\parallel \\mathbf{v} \\iff \\mathbf{u} = k\\mathbf{v} \\quad (k \\ne 0)' },
    ],
    studyNotes: [
      {
        heading: 'Column & $\\mathbf{i}, \\mathbf{j}$ Parallelism Test',
        body: 'Two column vectors $\\binom{x_1}{y_1}$ and $\\binom{x_2}{y_2}$ are parallel if and only if $x_1 y_2 = x_2 y_1$ (the gradient $\\frac{y}{x}$ is equal).',
      },
    ],
    workedExamples: [
      {
        title: 'Two-Path Ratio Problem in a Triangle',
        question:
          'In $\\triangle OAB$, $\\overrightarrow{OA} = \\mathbf{a}$ and $\\overrightarrow{OB} = \\mathbf{b}$. Point $M$ is the midpoint of $OB$ and $N$ lies on $AB$ such that $AN:NB = 2:1$. Lines $AM$ and $ON$ intersect at $X$. Find the ratio $OX:XN$.',
        marks: 5,
        steps: [
          'First find $\\overrightarrow{ON} = \\overrightarrow{OA} + \\frac{2}{3}\\overrightarrow{AB} = \\mathbf{a} + \\frac{2}{3}(\\mathbf{b} - \\mathbf{a}) = \\frac{1}{3}\\mathbf{a} + \\frac{2}{3}\\mathbf{b}$.',
          'Since $X$ lies on $ON$, $\\overrightarrow{OX} = \\lambda\\overrightarrow{ON} = \\frac{\\lambda}{3}\\mathbf{a} + \\frac{2\\lambda}{3}\\mathbf{b}$.',
          'Also $X$ lies on $AM$, where $\\overrightarrow{AM} = \\frac{1}{2}\\mathbf{b} - \\mathbf{a}$. Thus $\\overrightarrow{OX} = \\overrightarrow{OA} + \\mu\\overrightarrow{AM} = (1 - \\mu)\\mathbf{a} + \\frac{\\mu}{2}\\mathbf{b}$.',
          'Equate coefficients of $\\mathbf{a}$ and $\\mathbf{b}$: $\\frac{\\lambda}{3} = 1 - \\mu$ and $\\frac{2\\lambda}{3} = \\frac{\\mu}{2} \\implies \\mu = \\frac{4\\lambda}{3}$.',
          'Substitute: $\\frac{\\lambda}{3} = 1 - \\frac{4\\lambda}{3} \\implies \\frac{5\\lambda}{3} = 1 \\implies \\lambda = \\frac{3}{5}$. So $\\overrightarrow{OX} = \\frac{3}{5}\\overrightarrow{ON}$, giving $OX:XN = 3:2$.',
        ],
        answer: '$3 : 2$',
        markSchemeNotes: 'B1 for $\\overrightarrow{ON}$; M1 for two expressions for $\\overrightarrow{OX}$; M1 for equating $\\mathbf{a},\\mathbf{b}$ coefficients; A1 for $\\lambda = \\frac{3}{5}$; A1 for ratio $3:2$.',
      },
    ],
    commonMistakes: [
      'Stating $OX = \\frac{3}{5} ON$ as ratio $3:5$ instead of $OX:XN = 3:2$ (remember $XN = 1 - \\frac{3}{5} = \\frac{2}{5}$ of $ON$!).',
      'Equating $\\mathbf{a}$ and $\\mathbf{b}$ coefficients WITHOUT checking that the vectors are non-parallel.',
    ],
    coursebookTip:
      'Always verify your $\\lambda$ and $\\mu$ values by plugging them BOTH back into your two expressions for $\\overrightarrow{OX}$ — if they produce the exact same combination of $\\mathbf{a}$ and $\\mathbf{b}$, your algebra is 100% error-free.',
    quickCheck: {
      id: '0606-13.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Given $p\\mathbf{i} + 6\\mathbf{j} = 2(4\\mathbf{i} + q\\mathbf{j})$, find the value of $p + q$.',
      answer: '11',
      numericAnswer: 11,
      tolerance: 0,
      hint: 'Expand the right-hand side and equate the $\\mathbf{i}$-components and $\\mathbf{j}$-components separately.',
      solution: 'Right-hand side $= 8\\mathbf{i} + 2q\\mathbf{j}$. Comparing components: $p = 8$ and $2q = 6 \\implies q = 3$. Thus $p + q = 8 + 3 = 11$.',
    },
  },
  {
    id: '13.3',
    chapterId: 13,
    code: '13.3',
    title: 'Resultant velocities & constant-velocity motion',
    tier: 'Extended',
    summary:
      'Compose and resolve velocity vectors, relate bearings to $(x, y)$ components via $\\sin$ and $\\cos$, calculate speed as $|\\mathbf{v}|$, and use $\\mathbf{r}(t) = \\mathbf{r}_0 + \\mathbf{v}t$ to solve particle collision and closest-approach problems.',
    bigIdea:
      'For a particle moving at constant velocity $\\mathbf{v}$ from initial position $\\mathbf{r}_0$, its position at time $t$ is simply $\\mathbf{r}(t) = \\mathbf{r}_0 + \\mathbf{v}t$. Two particles collide if and only if BOTH their $\\mathbf{i}$-coordinates AND their $\\mathbf{j}$-coordinates match at the exact same time $t \\ge 0$.',
    keyFindings: [
      {
        title: 'Bearings to $\\mathbf{i}, \\mathbf{j}$ Components',
        finding:
          'Remember bearings are measured clockwise from North ($+\\mathbf{j}$)! A speed $V$ on bearing $\\theta$ gives velocity $\\mathbf{v} = (V\\sin\\theta)\\mathbf{i} + (V\\cos\\theta)\\mathbf{j}$ — notice $\\sin$ goes on $\\mathbf{i}$ (East) and $\\cos$ goes on $\\mathbf{j}$ (North)!',
      },
    ],
    stepByStepMethod: [
      'Align axes: East $= +\\mathbf{i}$ ($+x$), North $= +\\mathbf{j}$ ($+y$). Resolve any bearing/speed into $\\binom{V\\sin\\theta}{V\\cos\\theta}$.',
      'Resultant velocity (e.g., boat in current or plane in wind): add velocity vectors component-wise: $\\mathbf{v}_{\\text{res}} = \\mathbf{v}_{\\text{craft}} + \\mathbf{v}_{\\text{medium}}$.',
      'Write position at time $t$: $\\mathbf{r}(t) = \\mathbf{r}_0 + t\\mathbf{v}$. Speed $= |\\mathbf{v}|$.',
      'To test for collision, set $\\mathbf{r}_A(t) = \\mathbf{r}_B(t)$, solve the $\\mathbf{i}$-equation for $t$, and substitute into the $\\mathbf{j}$-equation to check if both match simultaneously.',
    ],
    rapidSummary: [
      { rule: 'Position at time t', detail: '$\\mathbf{r}(t) = \\mathbf{r}_0 + \\mathbf{v}t$.' },
      { rule: 'Speed from velocity', detail: '$\\text{Speed} = |\\mathbf{v}| = \\sqrt{v_x^2 + v_y^2}$.' },
      { rule: 'Velocity from speed & direction', detail: '$\\mathbf{v} = \\text{speed} \\times \\hat{\\mathbf{d}} = V\\frac{\\mathbf{d}}{|\\mathbf{d}|}$.' },
    ],
    coreObjectives: [
      'Compose and resolve velocities and determine a resultant vector by adding two or more vectors.',
      'Use velocity vectors to determine position $\\mathbf{r} = \\mathbf{r}_0 + \\mathbf{v}t$ and solve contextual problems such as particles colliding or crossing a river.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Constant-velocity position', latex: '\\mathbf{r}(t) = \\mathbf{r}_0 + \\mathbf{v}t' },
      { label: 'Bearing resolution (from North)', latex: '\\mathbf{v} = (V\\sin\\theta)\\mathbf{i} + (V\\cos\\theta)\\mathbf{j}' },
    ],
    studyNotes: [
      {
        heading: 'Crossing a River Directly Across (Zero Drift)',
        body: 'To travel due North across a river whose current flows East at $u\\mathbf{i}$, the swimmer or boat must steer slightly upstream so that its resultant velocity has $\\mathbf{i}$-component equal to $0$: $V_{\\text{boat}, x} + u = 0$.',
      },
    ],
    workedExamples: [
      {
        title: 'Position Vector & Collision Check',
        question:
          'At $t = 0$, particle $P$ is at $(2\\mathbf{i} - 5\\mathbf{j})\\text{ m}$ moving with velocity $(3\\mathbf{i} + 4\\mathbf{j})\\text{ m/s}$, and particle $Q$ is at $(10\\mathbf{i} + 3\\mathbf{j})\\text{ m}$ moving at speed $2\\sqrt{5}\\text{ m/s}$ parallel to $\\mathbf{i} + 2\\mathbf{j}$. Determine whether $P$ and $Q$ collide.',
        marks: 5,
        steps: [
          'Find $Q$’s velocity vector: unit vector parallel to $\\mathbf{i} + 2\\mathbf{j}$ is $\\frac{1}{\\sqrt{1^2+2^2}}(\\mathbf{i} + 2\\mathbf{j}) = \\frac{1}{\\sqrt{5}}(\\mathbf{i} + 2\\mathbf{j})$.',
          'Multiply by speed $2\\sqrt{5}$: $\\mathbf{v}_Q = 2(\\mathbf{i} + 2\\mathbf{j}) = 2\\mathbf{i} + 4\\mathbf{j}$.',
          'Positions at time $t$: $\\mathbf{r}_P(t) = (2 + 3t)\\mathbf{i} + (-5 + 4t)\\mathbf{j}$ and $\\mathbf{r}_Q(t) = (10 + 2t)\\mathbf{i} + (3 + 4t)\\mathbf{j}$.',
          'Equate $\\mathbf{i}$-components: $2 + 3t = 10 + 2t \\implies t = 8\\text{ s}$.',
          'Check $\\mathbf{j}$-components at $t = 8$: $y_P = -5 + 32 = 27$, whereas $y_Q = 3 + 32 = 35 \\ne 27$. Hence they do NOT collide.',
        ],
        answer: 'No, they do not collide ($t = 8\\text{ s}$ gives different $\\mathbf{j}$-positions: $27\\mathbf{j}$ vs $35\\mathbf{j}$).',
        markSchemeNotes: 'M1 for $\\mathbf{v}_Q = 2\\mathbf{i}+4\\mathbf{j}$; M1 for both $\\mathbf{r}(t)$; A1 for $t = 8$; M1 for checking $\\mathbf{j}$ at $t=8$; A1 for correct conclusion.',
      },
    ],
    commonMistakes: [
      'Resolving a bearing $\\theta$ from North as $(V\\cos\\theta)\\mathbf{i} + (V\\sin\\theta)\\mathbf{j}$ (swapping $\\sin$ and $\\cos$!). Always sketch the North line and right triangle first.',
      'Concluding two particles collide after matching only the $\\mathbf{i}$-component without verifying the $\\mathbf{j}$-component at that same $t$.',
    ],
    coursebookTip:
      'Whenever a question says "speed $V$ in the direction of $a\\mathbf{i} + b\\mathbf{j}$", NEVER write $\\mathbf{v} = V(a\\mathbf{i} + b\\mathbf{j})$ — always divide by $\\sqrt{a^2 + b^2}$ first!',
    quickCheck: {
      id: '0606-13.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A boat moves with resultant velocity $(9\\mathbf{i} + 12\\mathbf{j})\\text{ km/h}$. Find its speed in $\\text{km/h}$.',
      answer: '15',
      numericAnswer: 15,
      tolerance: 0,
      unit: 'km/h',
      hint: 'Speed is the magnitude of the velocity vector: $\\sqrt{9^2 + 12^2}$.',
      solution: 'Speed $= \\sqrt{9^2 + 12^2} = \\sqrt{81 + 144} = \\sqrt{225} = 15\\text{ km/h}$.',
    },
  },
];
