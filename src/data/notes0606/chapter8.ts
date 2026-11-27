import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_8_NOTES_0606: SubtopicNote[] = [
  {
    id: '8.1',
    chapterId: 8,
    code: '8.1',
    title: 'Equation of a circle: standard & general forms',
    tier: 'Extended',
    summary:
      'Use $(x - a)^2 + (y - b)^2 = r^2$ and $x^2 + y^2 + 2gx + 2fy + c = 0$ (new in 2025–2027 0606 syllabus) to find centres, radii, and circle equations from diameter endpoints or symmetry.',
    bigIdea:
      'Every point $(x, y)$ on a circle sits at fixed distance $r$ from centre $(a, b)$. Completing the square in $x$ and $y$ turns the expanded general form straight back into $(x - a)^2 + (y - b)^2 = r^2$.',
    keyFindings: [
      {
        title: 'Completing the Square on General Circle Equations',
        finding: '$x^2 + y^2 + 2gx + 2fy + c = 0$ has centre $(-g, -f)$ and radius $r = \\sqrt{g^2 + f^2 - c}$ (provided $g^2 + f^2 - c > 0$).',
        noteBox:
          'Notice the signs! In $(x - 3)^2 + (y + 5)^2 = 16$, the centre is $(+3, -5)$ — opposite signs to the numbers inside the brackets.',
      },
    ],
    stepByStepMethod: [
      'If given $kx^2 + ky^2 + \\dots = 0$, divide the entire equation by $k$ first so $x^2$ and $y^2$ both have coefficient $1$.',
      'Group $x$-terms and $y$-terms: $(x^2 + 2gx) + (y^2 + 2fy) = -c$.',
      'Complete the square separately for $x$ and $y$: $(x + g)^2 - g^2 + (y + f)^2 - f^2 = -c$.',
      'Move constants to the RHS to read $(a, b) = (-g, -f)$ and $r = \\sqrt{r^2}$.',
    ],
    rapidSummary: [
      { rule: 'Standard form', detail: '$(x - a)^2 + (y - b)^2 = r^2$: centre $(a, b)$, radius $r$.' },
      { rule: 'General form', detail: '$x^2 + y^2 + 2gx + 2fy + c = 0$: centre $(-g, -f)$, $r = \\sqrt{g^2+f^2-c}$.' },
      { rule: 'Diameter endpoints $A, B$', detail: 'Centre is midpoint of $AB$; radius is $\\frac{1}{2}|AB|$; angle in a semicircle is $90^\\circ$ ($m_{AP} \\cdot m_{BP} = -1$).' },
    ],
    coreObjectives: [
      'Know and use the equation of a circle with radius $r$ and centre $(a, b)$: $(x - a)^2 + (y - b)^2 = r^2$ and $x^2 + y^2 + 2gx + 2fy + c = 0$.',
      'Find the centre and radius from the equation of a circle, and form the equation of a circle given geometric conditions such as diameter endpoints or three points.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Standard circle equation', latex: '(x - a)^2 + (y - b)^2 = r^2' },
      { label: 'General circle equation', latex: 'x^2 + y^2 + 2gx + 2fy + c = 0 \\implies C(-g,-f),\\; r = \\sqrt{g^2+f^2-c}' },
    ],
    studyNotes: [
      {
        heading: 'Finding a Circle Through Given Conditions',
        body: 'In 0606 Paper 1 and Paper 2, circles are often defined indirectly:',
        bullets: [
          'Diameter endpoints $P(x_1, y_1)$ and $Q(x_2, y_2)$: centre is midpoint $\\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$ and $r^2 = \\frac{1}{4}[(x_2-x_1)^2+(y_2-y_1)^2]$.',
          'Circle touches the $x$-axis at $(a, 0)$: centre is $(a, \\pm r)$, so radius $|b| = r$.',
          'Circle passes through three points $A, B, C$: centre lies at the intersection of the perpendicular bisectors of chords $AB$ and $BC$!',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Centre and radius after dividing by a leading coefficient',
        question: 'Find the centre and radius of the circle $2x^2 + 2y^2 - 12x + 8y + 9 = 0$.',
        marks: 4,
        steps: [
          'Divide through by $2$: $x^2 + y^2 - 6x + 4y + \\frac{9}{2} = 0$.',
          'Complete the square: $(x - 3)^2 - 9 + (y + 2)^2 - 4 + \\frac{9}{2} = 0$.',
          'Combine constants: $(x - 3)^2 + (y + 2)^2 = 13 - \\frac{9}{2} = \\frac{17}{2}$.',
          'Centre is $(3, -2)$ and radius is $r = \\sqrt{\\frac{17}{2}} = \\frac{\\sqrt{34}}{2}$.',
        ],
        answer: 'Centre $(3, -2)$, radius $\\sqrt{\\frac{17}{2}}$',
        markSchemeNotes: 'M1 dividing by $2$, M1 completing the square, A1 centre $(3, -2)$, A1 radius $\\sqrt{17/2}$.',
      },
    ],
    commonMistakes: [
      'Forgetting to divide by $2$ before reading $-g$ and $-f$ on $2x^2 + 2y^2 - 12x + 8y + 9 = 0$.',
      'Reading $r$ directly from $r^2$ without taking the square root.',
    ],
    coursebookTip: 'Remember that any chord’s perpendicular bisector passes straight through the centre of the circle — a huge time-saver on 3-point circle questions.',
    sandbox: 'geogebra-graph',
    quickCheck: {
      id: '0606-8.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Find the radius of the circle $x^2 + y^2 + 8x - 10y + 5 = 0$.',
      answer: '6',
      numericAnswer: 6,
      tolerance: 0,
      hint: 'Complete the square: $(x + 4)^2 + (y - 5)^2 = 16 + 25 - 5$.',
      solution: '$(x + 4)^2 + (y - 5)^2 = 16 + 25 - 5 = 36 \\implies r = \\sqrt{36} = 6$.',
    },
  },
  {
    id: '8.2',
    chapterId: 8,
    code: '8.2',
    title: 'Line–circle intersections & tangent equations',
    tier: 'Extended',
    summary:
      'Find intersections of a line and circle (or tangent conditions via $b^2 - 4ac = 0$), and find equations of tangents and normals using perpendicularity $m_{\\text{radius}} \\cdot m_{\\text{tangent}} = -1$.',
    bigIdea:
      'At any point $P$ on a circle with centre $C$, the tangent at $P$ is perpendicular to radius $CP$ ($m_{\\text{tan}} = -\\frac{1}{m_{CP}}$). Implicit calculus is NOT required in 0606 — geometry + discriminant handle everything.',
    keyFindings: [
      {
        title: 'Two Ways to Handle Line & Circle Contact',
        finding: 'Given a point $P$ ON the circle, use **perpendicular radius** ($m_{\\text{tan}} = -1/m_{CP}$). Given a line with an unknown constant $k$, substitute into the circle and use **discriminant** $\\Delta = 0$.',
      },
    ],
    stepByStepMethod: [
      'To find where line $y = mx + c$ meets $(x - a)^2 + (y - b)^2 = r^2$, substitute $y = mx + c$ into the circle equation.',
      'Expand into $Ax^2 + Bx + C = 0$ and solve for $x$ (or use $B^2 - 4AC$ to test chord vs tangent vs misses).',
      'To find the tangent AT a given point $P(x_0, y_0)$ on the circle, compute radius gradient $m_{CP} = \\frac{y_0 - b}{x_0 - a}$, then set $m_{\\text{tan}} = -\\frac{1}{m_{CP}}$.',
      'Write the tangent as $y - y_0 = m_{\\text{tan}}(x - x_0)$ (check horizontal/vertical edge cases where $x_0 = a$ or $y_0 = b$!).',
    ],
    rapidSummary: [
      { rule: 'Tangent at $P$', detail: '$m_{\\text{tan}} \\times m_{CP} = -1$ (perpendicular to radius $CP$).' },
      { rule: 'Line–circle test', detail: 'Substitute line into circle: $\\Delta > 0$ (2 pts / chord), $\\Delta = 0$ (tangent), $\\Delta < 0$ (no contact).' },
      { rule: 'Tangent length from external $T$', detail: 'By Pythagoras in right $\\triangle CPT$, $PT = \\sqrt{CT^2 - r^2}$.' },
    ],
    coreObjectives: [
      'Solve problems involving the intersection of a circle and a straight line.',
      'Solve problems involving tangents to a circle (differentiation of implicit functions is not required).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Radius–tangent perpendicularity', latex: 'm_{CP} \\cdot m_{\\text{tan}} = -1' },
      { label: 'External tangent length', latex: 'PT = \\sqrt{CT^2 - r^2}' },
    ],
    studyNotes: [
      {
        heading: 'External Tangents & Chord Midpoints',
        body: 'Two classic circle-geometry shortcuts from $O$-level carry straight into 0606 coordinates: (1) from an external point $T$, the two tangents have equal length $PT = QT = \\sqrt{CT^2 - r^2}$; (2) if a chord $AB$ has midpoint $M$, then $CM \\perp AB$ and half-chord length is $\\sqrt{r^2 - CM^2}$.',
      },
    ],
    workedExamples: [
      {
        title: 'Tangent to a circle at a given point',
        question: 'Find the equation of the tangent to the circle $(x - 2)^2 + (y + 1)^2 = 25$ at the point $P(5, 3)$.',
        marks: 4,
        steps: [
          'Check centre $C = (2, -1)$. (Verify $P$ lies on circle: $(5 - 2)^2 + (3 + 1)^2 = 9 + 16 = 25$.)',
          'Radius gradient: $m_{CP} = \\frac{3 - (-1)}{5 - 2} = \\frac{4}{3}$.',
          'Tangent is perpendicular to $CP$: $m_{\\text{tan}} = -\\frac{3}{4}$.',
          'Line through $(5, 3)$: $y - 3 = -\\frac{3}{4}(x - 5) \\implies 4y - 12 = -3x + 15 \\implies 3x + 4y = 27$.',
        ],
        answer: '$3x + 4y = 27$',
        markSchemeNotes: 'B1 centre $(2, -1)$, M1 $m_{CP} = 4/3$, M1 $m_{\\text{tan}} = -3/4$, A1 for $3x + 4y = 27$.',
      },
    ],
    commonMistakes: [
      'Using the radius gradient $4/3$ directly as the tangent gradient instead of taking the negative reciprocal $-3/4$.',
      'Forgetting that vertical/horizontal radii ($y_0 = b$ or $x_0 = a$) give vertical tangents $x = x_0$ or horizontal tangents $y = y_0$.',
    ],
    coursebookTip: 'Instead of substituting $y = mx + c$ into a circle to prove a line is tangent, you can also compare the perpendicular distance from centre $C$ to the line against radius $r$!',
    quickCheck: {
      id: '0606-8.2-qc',
      marks: 3,
      paperType: 'Non-Calculator',
      prompt: 'A circle has centre $C(1, 2)$ and radius $r = 3$. Point $T(5, 5)$ lies outside the circle, and $TP$ is a tangent to the circle at $P$. Find the length $TP$.',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: 'Find distance $CT$ first, then use Pythagoras in right-angled $\\triangle CPT$ ($\\angle CPT = 90^\\circ$).',
      solution: '$CT^2 = (5 - 1)^2 + (5 - 2)^2 = 16 + 9 = 25$. Since $\\angle CPT = 90^\\circ$, $TP = \\sqrt{CT^2 - r^2} = \\sqrt{25 - 9} = 4$.',
    },
  },
  {
    id: '8.3',
    chapterId: 8,
    code: '8.3',
    title: 'Two circles: intersections, touching & common chords',
    tier: 'Extended',
    summary:
      'Classify whether two circles intersect at two points, touch externally/internally, or do not meet by comparing centre distance $d$ with $r_1 + r_2$ and $|r_1 - r_2|$, and find the common chord or intersection points.',
    bigIdea:
      'Subtracting the general equations of two circles kills both $x^2$ and $y^2$ immediately, leaving the linear **radical axis / common chord** line, which can then be solved simultaneously with either circle.',
    keyFindings: [
      {
        title: 'Centre Distance $d = |C_1 C_2|$ Classifier',
        finding: 'Two points: $|r_1 - r_2| < d < r_1 + r_2$. Touch externally: $d = r_1 + r_2$. Touch internally: $d = |r_1 - r_2|$. Separate/nested: $d > r_1 + r_2$ or $d < |r_1 - r_2|$.',
      },
    ],
    stepByStepMethod: [
      'Find centres $C_1, C_2$ and radii $r_1, r_2$ of both circles, then compute $d = |C_1 C_2|$.',
      'Compare $d$ against $r_1 + r_2$ and $|r_1 - r_2|$ to classify intersection/tangency/disjoint.',
      'To find the exact intersection points of two circles, write BOTH in expanded form $x^2 + y^2 + 2gx + 2fy + c = 0$ and subtract Equation 2 from Equation 1 to get a **linear equation** (the common chord).',
      'Solve that linear equation simultaneously with the simpler circle.',
    ],
    comparisonTable: {
      title: 'Two-Circle Distance Classification',
      headers: ['Distance Relation', 'Geometric Arrangement', 'Intersection Points'],
      rows: [
        ['$d > r_1 + r_2$', 'Completely external (disjoint)', '$0$'],
        ['$d = r_1 + r_2$', 'Touch externally', '$1$ (tangent point)'],
        ['$|r_1 - r_2| < d < r_1 + r_2$', 'Intersect properly', '$2$ (common chord)'],
        ['$d = |r_1 - r_2|$ ($d > 0$)', 'Touch internally', '$1$ (tangent point)'],
        ['$d < |r_1 - r_2|$', 'One strictly inside the other', '$0$'],
      ],
    },
    rapidSummary: [
      { rule: 'Eliminate $x^2 + y^2$', detail: 'Subtract the two expanded circle equations to obtain the linear common chord.' },
      { rule: 'External touch', detail: '$|C_1 C_2| = r_1 + r_2$.' },
      { rule: 'Internal touch', detail: '$|C_1 C_2| = |r_1 - r_2|$.' },
    ],
    coreObjectives: [
      'Solve problems involving the intersection of two circles (including determining whether circles intersect, touch, or are disjoint, and finding points of intersection).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Two-circle overlap condition', latex: '|r_1 - r_2| < |C_1 C_2| < r_1 + r_2' },
    ],
    studyNotes: [
      {
        heading: 'External vs Internal Tangency',
        body: 'If a question says two circles "touch" without specifying externally or internally, remember BOTH $d = r_1 + r_2$ (outside each other) and $d = |r_1 - r_2|$ (one nested inside the other) satisfy tangency — check if both produce valid positive radii!',
      },
    ],
    workedExamples: [
      {
        title: 'Common chord and intersections of two circles',
        question: 'Find the equation of the common chord of the circles $x^2 + y^2 = 25$ and $x^2 + y^2 - 10x - 10y + 41 = 0$, and verify they intersect.',
        marks: 4,
        steps: [
          'Circle 1 has $C_1(0, 0), r_1 = 5$. Circle 2 completes to $(x - 5)^2 + (y - 5)^2 = 25 + 25 - 41 = 9$, so $C_2(5, 5), r_2 = 3$.',
          'Distance $d = \\sqrt{5^2 + 5^2} = \\sqrt{50} \\approx 7.07$. Since $5 - 3 = 2 < 7.07 < 5 + 3 = 8$, the circles intersect at two points.',
          'Subtract Circle 2 from Circle 1 to cancel $x^2 + y^2$: $0 - (-10x - 10y + 41) = 25 \\implies 10x + 10y - 41 = 25 \\implies 10x + 10y = 66 \\implies 5x + 5y = 33$.',
        ],
        answer: 'Circles intersect since $2 < \\sqrt{50} < 8$; common chord $5x + 5y = 33$',
        markSchemeNotes: 'B1 centres & radii, M1 comparing $d = \\sqrt{50}$ with $r_1 \\pm r_2$, M1 subtracting equations, A1 $5x + 5y = 33$.',
      },
    ],
    commonMistakes: [
      'Checking only $d < r_1 + r_2$ and forgetting $d > |r_1 - r_2|$ (so failing to notice when a tiny circle sits entirely inside a big circle without touching!).',
      'Subtracting $(x - a)^2$ brackets incorrectly instead of expanding to $x^2 + y^2 + \\dots$ first.',
    ],
    coursebookTip: 'When two circles touch, the point of contact lies on the straight line segment joining their centres $C_1$ and $C_2$ in the exact ratio $r_1 : r_2$!',
    quickCheck: {
      id: '0606-8.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Circle 1 has centre $(0, 0)$ and radius $4$. Circle 2 has centre $(6, 8)$ and radius $r$. If the circles touch externally, find $r$.',
      answer: '6',
      numericAnswer: 6,
      tolerance: 0,
      hint: 'Compute centre distance $d = \\sqrt{6^2 + 8^2}$ and set $d = r_1 + r_2$.',
      solution: '$d = \\sqrt{36 + 64} = 10$. External touch gives $4 + r = 10 \\implies r = 6$.',
    },
  },
];
