import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_7_NOTES: SubtopicNote[] = [
  {
    id: '7.1',
    chapterId: 7,
    code: '7.1',
    title: 'Transformations',
    tier: 'Core & Extended',
    summary: 'Changing plane / shape: master both finding the image and describing the single transformation across Translation, Reflection, Enlargement, and Rotation.',
    aims: [
      'Finding the image (menentukan bayangan $A\'$ dari objek $A$ dan aturan transformasinya)',
      'Finding the type of transformation (mendeskripsikan transformasi tunggal secara lengkap dari objek ke bayangan)',
    ],
    coreObjectives: [
      'Translate plane figures using a column vector $T\\binom{a}{b}$ and find the vector mapping $A \\to A\'$.',
      'Reflect simple plane figures in horizontal, vertical, or diagonal mirror lines ($y = \\pm x$, $x = c$, $y = c$).',
      'Enlarge plane figures by positive or fractional scale factors from a given centre of enlargement.',
      'Rotate simple plane figures about a centre by multiples of $90^\\circ$ ($90^\\circ$ CW, $90^\\circ$ ACW, $180^\\circ$).',
    ],
    extendedObjectives: [
      'Perform and describe enlargements with negative scale factors ($k < 0$), where the image lies on the opposite side of the centre.',
      'Find centres of enlargement via corresponding-point rays and centres of rotation via perpendicular bisectors.',
    ],
    keyFormulas: [
      {
        label: '1. Translation',
        latex: 'A \\xrightarrow{T\\binom{a}{b}} A\' \\quad (a: +\\to / -\\leftarrow,\\ \\ b: +\\uparrow / -\\downarrow)',
        note: 'To describe: state **Translation** + <u>column vector</u> $\\binom{a}{b}$.',
      },
      {
        label: '2. Reflection',
        latex: '\\text{Object distance to mirror} = \\text{Image distance to mirror}',
        note: 'To describe: state **Reflection** + <u>mirror line equation</u> (e.g. $y = \\frac{1}{2}$, $y = -x$, $x = 0$).',
      },
      {
        label: '3. Enlargement',
        latex: 'k = \\frac{\\text{unit of image}}{\\text{unit of object}} \\quad (k > 1 \\text{ upscale},\\ 0 < k < 1 \\text{ downscale},\\ k < 0 \\text{ opposite side})',
        note: 'To describe: state **Enlargement** + <u>scale factor $k$</u> + <u>centre $(x, y)$</u>.',
      },
      {
        label: '4. Rotation',
        latex: '\\binom{dx}{dy} \\xrightarrow{90^\\circ\\text{ CW}} \\binom{dy}{-dx},\\quad \\xrightarrow{90^\\circ\\text{ ACW}} \\binom{-dy}{dx},\\quad \\xrightarrow{180^\\circ} \\binom{-dx}{-dy}',
        note: 'To describe: state **Rotation** + <u>angle</u> + <u>direction (CW/ACW)</u> + <u>centre $(x, y)$</u>.',
      },
    ],
    keyFindings: [
      {
        title: '1. Translation — Moving or Shifting the Object',
        finding: '**Finding the image**: use $A \\xrightarrow{T\\binom{a}{b}} A\'$ where $a$ is <u>horizontal movement</u> ($+\\to$ right, $-\\leftarrow$ left) and $b$ is <u>vertical movement</u> ($+\\uparrow$ up, $-\\downarrow$ down). **Finding the single transformation**: we must <u>find</u> the <u>column vector</u> (e.g. $B$ to $B\'$ is translation by $\\binom{-6}{3}$).',
        noteBox: 'Pick one clear vertex on the object and count horizontal steps ($a$) then vertical steps ($b$) to the corresponding vertex on the image. Never write a fraction line inside a column vector!',
      },
      {
        title: '2. Reflection — Mirroring the Object',
        finding: '**Finding the image**: reflect across the given mirror line ($y$-axis, $x = 2$, $y = x$, $y = \\frac{1}{2}$, $y = -x$). **Finding the single transformation**: we must <u>find</u> the <u>mirror line equation</u> (e.g. $A \\to B$: $y = \\frac{1}{2}$; $A \\to C$: $y = -x$; $A \\to D$: $x = 0$ or $y$-axis).',
        noteBox: '<u>Object and image should have equal perpendicular distance to the mirror</u>. To find an unknown mirror line, construct the <u>perpendicular bisector of corresponding points</u> ($A$ and $A\'$).',
      },
      {
        title: '3. Enlargement — Upscale or Downscale an Object',
        finding: '**Finding the image**: use <u>scale factor</u> $k$ and <u>centre of enlargement</u>. If $k > 1$, the object <u>enlarges with the same direction</u>; if $0 < k < 1$, it <u>downscales with the same direction</u>; if $k < 0$, it moves to the <u>opposite direction from the centre</u>. **Finding single transformation**: we must find the <u>scale factor</u> and the <u>centre of enlargement</u>.',
        noteBox: 'To find the <u>centre</u>: <u>connect at least two corresponding points</u> with straight rays until they meet. To find the <u>scale factor</u>: $k = \\frac{\\text{unit of image}}{\\text{unit of object}}$ (make $k$ negative if the image is on the opposite side of the centre).',
      },
      {
        title: '4. Rotation — Turning the Object About a Fixed Point',
        finding: '**Finding the image**: apply <u>angle</u> ($90^\\circ$ or $180^\\circ$), <u>direction</u> (<u>clockwise</u> CW or <u>anticlockwise</u> ACW), and <u>centre of rotation</u> $(c_x, c_y)$ using vector turn rules from the centre. **Finding single transformation**: we must find <u>angle</u>, <u>direction</u> (omit only for $180^\\circ$), and <u>centre of rotation</u>.',
        noteBox: '<u>Distance from the centre to every corresponding vertex stays equal</u>. To locate the <u>centre of rotation</u>, draw the <u>perpendicular bisector of at least two pairs of corresponding points</u> ($A \\to A\'$ and $B \\to B\'$); their intersection is the exact centre (for $180^\\circ$, simply find the midpoint of $AA\'$).',
      },
    ],
    studyNotes: [
      {
        heading: '1. Translation & 2. Reflection — Notebook Worked Reference',
        body: 'In Cambridge 0580, every transformation question asks either to draw the image from given parameters or to state the **single transformation** from object to image. Never mix two transformations in one answer.',
        bullets: [
          'Translation example: $A \\xrightarrow{T\\binom{3}{-2}} A\'$ shifts every vertex $3$ units right and $2$ units down; $B$ to $B\'$ going $6$ left and $3$ up is **Translation by $\\binom{-6}{3}$**.',
          'Reflection image examples: $A \\xrightarrow{R\\ y\\text{-axis}} B$, $A \\xrightarrow{R\\ x=2} C$, and $A \\xrightarrow{R\\ y=x} D$ (swapping $(x, y) \\mapsto (y, x)$).',
          'Reflection reverse examples: (i) $A$ to $B$: Reflection by $y = \\frac{1}{2}$; (ii) $A$ to $C$: Reflection by $y = -x$; (iii) $A$ to $D$: Reflection at $x = 0$ (or $y$-axis).',
        ],
        noteBox: 'Always check perpendicular distance on BOTH sides of the mirror line: if $A$ is $2$ units right of $x = 2$, its image $C$ must be $2$ units left of $x = 2$ (at $x = 0$).',
      },
      {
        heading: '3. Enlargement & 4. Rotation — Ray Lines, Bisectors & Coordinate Turns',
        body: 'For scale factor and rotation turns, always measure vectors **from the centre $(c_x, c_y)$ to each object vertex**, transform that vector, and add it back to $(c_x, c_y)$.',
        bullets: [
          'Enlargement examples (finding image): (i) $A \\xrightarrow{\\text{Enl. s.f. } 2,\\text{ centre }(5,4)} B$; (ii) $A \\xrightarrow{\\text{Enl. s.f. } \\frac{1}{2},\\text{ centre }(10,3)} C$; (iii) $A \\xrightarrow{\\text{Enl. s.f. } -\\frac{1}{2},\\text{ centre }(4,-1)} D$.',
          'Enlargement reverse examples (finding centre & $k$): (i) $A$ to $B$: Enlargement, s.f. $\\frac{1}{2}$, centre $(6, 6)$; (ii) $A$ to $C$: Enlargement, s.f. $-\\frac{1}{2}$, centre $(2, 1)$; (iii) $A$ to $D$: Enlargement, s.f. $-2$, centre $(5, 0)$.',
          'Rotation step-by-step from centre $(c_x, c_y)$: let $dx = x - c_x$ and $dy = y - c_y$. For <u>$90^\\circ$ clockwise</u> ($= 270^\\circ$ ACW), new offset is $(dy, -dx)$; for <u>$90^\\circ$ anticlockwise</u> ($= 270^\\circ$ CW), new offset is $(-dy, dx)$; for <u>$180^\\circ$</u>, new offset is $(-dx, -dy)$.',
          'Rotation verification: trace the L-shape from centre to vertex on tracing paper or grid squares—if the L goes $3$ right and $1$ up, a $90^\\circ$ clockwise turn makes it go $3$ down and $1$ right!',
        ],
        noteBox: 'For Rotation, $90^\\circ$ clockwise is identical to $270^\\circ$ anticlockwise, and $180^\\circ$ clockwise is identical to $180^\\circ$ anticlockwise (so Cambridge awards full marks without CW/ACW on $180^\\circ$).',
      },
    ],
    workedExamples: [
      {
        title: 'Negative scale factor enlargement (Extended)',
        question: 'Triangle $A$ has vertex $P(3, 2)$. It is enlarged by scale factor $-2$ about centre $(1, 1)$. Find the image $P\'$.',
        marks: 2,
        steps: [
          'Vector from centre $(1, 1)$ to $P(3, 2)$ is $\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$.',
          'Multiply by $-2$: $\\begin{pmatrix} -4 \\\\ -2 \\end{pmatrix}$ (opposite direction from centre).',
          'Add to centre: $(1 - 4, 1 - 2) = (-3, -1)$.',
        ],
        answer: '$(-3, -1)$',
        markSchemeNotes: 'M1 for vector from centre $\\times (-2)$, A1 for $(-3, -1)$.',
      },
      {
        title: 'Rotation 90° clockwise & anticlockwise about a non-origin centre',
        question: 'Triangle $P$ has vertex $V(4, 3)$. Rotate $V$ (a) $90^\\circ$ clockwise about centre $(1, 1)$, and (b) $90^\\circ$ anticlockwise about centre $(1, 1)$.',
        marks: 4,
        steps: [
          'Offset from centre $(1, 1)$ to $V(4, 3)$ is $\\begin{pmatrix} dx \\\\ dy \\end{pmatrix} = \\begin{pmatrix} 4 - 1 \\\\ 3 - 1 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$.',
          '(a) $90^\\circ$ clockwise maps $\\begin{pmatrix} dx \\\\ dy \\end{pmatrix} \\mapsto \\begin{pmatrix} dy \\\\ -dx \\end{pmatrix} = \\begin{pmatrix} 2 \\\\ -3 \\end{pmatrix}$. Add to centre $(1, 1)$: $(1 + 2, 1 - 3) = (3, -2)$.',
          '(b) $90^\\circ$ anticlockwise maps $\\begin{pmatrix} dx \\\\ dy \\end{pmatrix} \\mapsto \\begin{pmatrix} -dy \\\\ dx \\end{pmatrix} = \\begin{pmatrix} -2 \\\\ 3 \\end{pmatrix}$. Add to centre $(1, 1)$: $(1 - 2, 1 + 3) = (-1, 4)$.',
        ],
        answer: '(a) $(3, -2)$, (b) $(-1, 4)$',
        markSchemeNotes: 'B1 offset $(3, 2)$, B1 $(3, -2)$, B1 $(-1, 4)$, B1 valid centre addition.',
      },
    ],
    commonMistakes: [
      'Giving two transformations when the question states "Describe fully the SINGLE transformation".',
      'Forgetting the direction (clockwise or anticlockwise) on a $90^\\circ$ rotation, or forgetting the centre $(x, y)$.',
      'Measuring enlargement rays from $(0, 0)$ instead of the stated centre of enlargement.',
    ],
    quickCheck: {
      id: 'qc-7.1',
      prompt: 'Point $(4, 1)$ is rotated $90^\\circ$ clockwise about centre $(1, 2)$. What is the $y$-coordinate of its image?',
      answer: '-1',
      numericAnswer: -1,
      tolerance: 0,
      hint: 'Vector from centre $(1, 2)$ to $(4, 1)$ is $\\binom{3}{-1}$. Under $90^\\circ$ CW, $\\binom{dx}{dy} \\mapsto \\binom{dy}{-dx} = \\binom{-1}{-3}$. Add back to $(1, 2)$.',
      solution: 'Offset $\\binom{3}{-1}$ turns $90^\\circ$ CW to $\\binom{-1}{-3}$. Image is $(1 - 1, 2 - 3) = (0, -1)$, so its $y$-coordinate is $-1$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '7.2',
    chapterId: 7,
    code: '7.2',
    title: 'Vectors in two dimensions',
    tier: 'Extended',
    summary: 'Describe translations using column vectors, add and subtract vectors, and multiply vectors by scalars.',
    coreObjectives: [
      'Describe translations using column vectors.',
    ],
    extendedObjectives: [
      'Add and subtract vectors and multiply a vector by a scalar.',
      'Understand position vectors $\\vec{OA} = \\mathbf{a}$ and displacement vectors $\\vec{AB} = \\mathbf{b} - \\mathbf{a}$.',
    ],
    keyFormulas: [
      { label: 'Column vector arithmetic', latex: '\\begin{pmatrix} x_1 \\\\ y_1 \\end{pmatrix} + \\begin{pmatrix} x_2 \\\\ y_2 \\end{pmatrix} = \\begin{pmatrix} x_1 + x_2 \\\\ y_1 + y_2 \\end{pmatrix}' },
      { label: 'Displacement vector', latex: '\\vec{AB} = \\vec{OB} - \\vec{OA} = \\mathbf{b} - \\mathbf{a}' },
    ],
    studyNotes: [
      {
        heading: 'Column vectors are NOT fractions!',
        body: 'Never draw a horizontal fraction line inside $\\begin{pmatrix} 3 \\\\ -5 \\end{pmatrix}$. Remember the top number is horizontal ($x$: right $+$ / left $-$) and the bottom number is vertical ($y$: up $+$ / down $-$).',
      },
    ],
    workedExamples: [
      {
        title: 'Vector linear combination (Extended)',
        question: 'Given $\\mathbf{p} = \\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ and $\\mathbf{q} = \\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$, calculate $2\\mathbf{p} - 3\\mathbf{q}$.',
        marks: 2,
        steps: [
          '$2\\mathbf{p} = \\begin{pmatrix} 6 \\\\ -4 \\end{pmatrix}$ and $3\\mathbf{q} = \\begin{pmatrix} -3 \\\\ 12 \\end{pmatrix}$.',
          'Subtract: $\\begin{pmatrix} 6 - (-3) \\\\ -4 - 12 \\end{pmatrix} = \\begin{pmatrix} 9 \\\\ -16 \\end{pmatrix}$.',
        ],
        answer: '$\\begin{pmatrix} 9 \\\\ -16 \\end{pmatrix}$',
        markSchemeNotes: 'M1 for either scalar multiple, A1 for $\\begin{pmatrix} 9 \\\\ -16 \\end{pmatrix}$.',
      },
    ],
    commonMistakes: [
      'Computing $\\vec{AB}$ as $\\mathbf{a} - \\mathbf{b}$ instead of $\\mathbf{b} - \\mathbf{a}$.',
    ],
    quickCheck: {
      id: 'qc-7.2',
      prompt: 'If $\\vec{OA} = \\begin{pmatrix} 2 \\\\ 7 \\end{pmatrix}$ and $\\vec{OB} = \\begin{pmatrix} 6 \\\\ 1 \\end{pmatrix}$, what is the top ($x$) component of $\\vec{AB}$?',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: '$\\vec{AB} = \\vec{OB} - \\vec{OA}$.',
      solution: '$\\vec{AB} = \\begin{pmatrix} 6 - 2 \\\\ 1 - 7 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ -6 \\end{pmatrix}$, so top component is $4$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '7.3',
    chapterId: 7,
    code: '7.3',
    title: 'Magnitude of a vector',
    tier: 'Extended',
    summary: 'Calculate the magnitude $|\\mathbf{v}|$ of a two-dimensional vector using Pythagoras’ theorem.',
    coreObjectives: [
      'Relate horizontal and vertical vector components to a right-angled triangle.',
    ],
    extendedObjectives: [
      'Calculate the magnitude of a vector $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ as $\\sqrt{x^2 + y^2}$.',
    ],
    keyFormulas: [
      { label: 'Vector magnitude', latex: '\\left|\\begin{pmatrix} x \\\\ y \\end{pmatrix}\\right| = \\sqrt{x^2 + y^2}' },
    ],
    studyNotes: [
      {
        heading: 'Squaring negative components',
        body: 'Magnitude is a length and is ALWAYS non-negative. When a component is negative, e.g. $\\begin{pmatrix} -5 \\\\ 12 \\end{pmatrix}$, $(-5)^2 = +25$, so $|\\mathbf{v}| = \\sqrt{25 + 144} = 13$.',
      },
    ],
    workedExamples: [
      {
        title: 'Magnitude of a displacement vector (Extended)',
        question: 'Points $P$ and $Q$ have position vectors $\\begin{pmatrix} 1 \\\\ 5 \\end{pmatrix}$ and $\\begin{pmatrix} 7 \\\\ -3 \\end{pmatrix}$. Find $|\\vec{PQ}|$.',
        marks: 3,
        steps: [
          '$\\vec{PQ} = \\begin{pmatrix} 7 - 1 \\\\ -3 - 5 \\end{pmatrix} = \\begin{pmatrix} 6 \\\\ -8 \\end{pmatrix}$.',
          '$|\\vec{PQ}| = \\sqrt{6^2 + (-8)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.',
        ],
        answer: '$10$',
        markSchemeNotes: 'B1 for $\\begin{pmatrix} 6 \\\\ -8 \\end{pmatrix}$, M1 for $\\sqrt{6^2 + (-8)^2}$, A1 for $10$.',
      },
    ],
    commonMistakes: [
      'Evaluating $(-8)^2$ as $-64$ on a calculator without brackets.',
    ],
    quickCheck: {
      id: 'qc-7.3',
      prompt: 'Find the magnitude of $\\mathbf{v} = \\begin{pmatrix} 8 \\\\ -15 \\end{pmatrix}$.',
      answer: '17',
      numericAnswer: 17,
      tolerance: 0,
      hint: '$\\sqrt{8^2 + (-15)^2}$.',
      solution: '$\\sqrt{64 + 225} = \\sqrt{289} = 17$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '7.4',
    chapterId: 7,
    code: '7.4',
    title: 'Vector geometry',
    tier: 'Extended',
    summary: 'Express geometric paths in terms of given base vectors $\\mathbf{a}$ and $\\mathbf{b}$, split segments in ratios, and prove parallelism and collinearity.',
    coreObjectives: [
      'Follow directed line segments along polygon edges.',
    ],
    extendedObjectives: [
      'Represent vectors by directed line segments and use the sum and difference of two vectors to express given vectors in terms of two coplanar vectors.',
      'Use vector properties to show that two vectors are parallel or three points are collinear.',
    ],
    keyFormulas: [
      { label: 'Parallel & Collinear criterion', latex: '\\vec{PQ} = k\\vec{PR} \\implies PQ \\parallel PR \\text{ (and } P, Q, R \\text{ collinear)}' },
    ],
    studyNotes: [
      {
        heading: 'Proving collinearity in 2 sentences',
        body: 'To show points $A, B, C$ lie on a straight line (are collinear): (1) Find simplified expressions for $\\vec{AB}$ and $\\vec{BC}$ (or $\\vec{AC}$). (2) Show $\\vec{AC} = k\\vec{AB}$ (stating they are scalar multiples / parallel) AND explicitly state that they share a common point ($A$ or $B$). Without mentioning the common point, you lose the final explanation mark!',
      },
    ],
    workedExamples: [
      {
        title: 'Vector path with ratio point (Extended)',
        question: 'In $\\triangle OAB$, $\\vec{OA} = \\mathbf{a}$ and $\\vec{OB} = \\mathbf{b}$. $M$ lies on $AB$ such that $AM : MB = 1 : 2$. Find $\\vec{OM}$ in terms of $\\mathbf{a}$ and $\\mathbf{b}$.',
        marks: 3,
        steps: [
          'Find $\\vec{AB} = \\vec{AO} + \\vec{OB} = -\\mathbf{a} + \\mathbf{b}$.',
          'Since $AM : MB = 1 : 2$, $\\vec{AM} = \\frac{1}{3}\\vec{AB} = \\frac{1}{3}(\\mathbf{b} - \\mathbf{a})$.',
          '$\\vec{OM} = \\vec{OA} + \\vec{AM} = \\mathbf{a} + \\frac{1}{3}\\mathbf{b} - \\frac{1}{3}\\mathbf{a} = \\frac{2}{3}\\mathbf{a} + \\frac{1}{3}\\mathbf{b}$.',
        ],
        answer: '$\\frac{2}{3}\\mathbf{a} + \\frac{1}{3}\\mathbf{b}$',
        markSchemeNotes: 'B1 for $\\vec{AB} = \\mathbf{b} - \\mathbf{a}$, M1 for $\\mathbf{a} + \\frac{1}{3}(\\mathbf{b} - \\mathbf{a})$, A1 simplified.',
      },
    ],
    commonMistakes: [
      'Using $\\frac{1}{2}$ instead of $\\frac{1}{3}$ when given ratio $1 : 2$ (total parts $= 1 + 2 = 3$).',
      'Proving two vectors are parallel without noting the shared point for collinearity.',
    ],
    quickCheck: {
      id: 'qc-7.4',
      prompt: 'If $\\vec{PQ} = 2\\mathbf{a} + 6\\mathbf{b}$ and $\\vec{QR} = 3\\mathbf{a} + 9\\mathbf{b}$, then $\\vec{QR} = k\\vec{PQ}$. What is $k$?',
      answer: '1.5',
      acceptedAnswers: ['1.5', '3/2'],
      numericAnswer: 1.5,
      tolerance: 0.001,
      hint: 'Factor out $2$ from $\\vec{PQ}$ and $3$ from $\\vec{QR}$.',
      solution: '$\\vec{PQ} = 2(\\mathbf{a} + 3\\mathbf{b})$ and $\\vec{QR} = 3(\\mathbf{a} + 3\\mathbf{b})$, so $k = \\frac{3}{2} = 1.5$.',
    },
  },
];
