import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_9_NOTES_0606: SubtopicNote[] = [
  {
    id: '9.1',
    chapterId: 9,
    code: '9.1',
    title: 'Radian measure & arc length s = rθ',
    tier: 'Extended',
    summary:
      'Convert fluently between degrees and radians ($\\pi\\text{ rad} = 180^\\circ$) and use $s = r\\theta$ to compute arc lengths and perimeters of compound circular shapes.',
    bigIdea:
      'One radian is the angle subtended when the arc length equals the radius ($s = r$). Because a full circle has circumference $2\\pi r$, $360^\\circ = 2\\pi\\text{ rad}$ and every arc length shrinks to $s = r\\theta$.',
    keyFindings: [
      {
        title: 'Calculator Mode Alert!',
        finding: 'Whenever $\\theta$ is in radians inside $\\sin\\theta, \\cos\\theta, \\tan\\theta$, your calculator MUST be in **RAD** mode — NEVER **DEG** mode!',
      },
    ],
    stepByStepMethod: [
      'Convert degrees to radians by multiplying by $\\frac{\\pi}{180}$; convert radians to degrees by multiplying by $\\frac{180}{\\pi}$.',
      'Check whether an angle refers to the minor sector ($\\theta$) or major sector ($2\\pi - \\theta$).',
      'Compute curved edges with $s = r\\theta$ and straight chords using cosine rule $c = \\sqrt{r^2 + r^2 - 2r^2\\cos\\theta} = 2r\\sin(\\frac{\\theta}{2})$.',
      'Sum EVERY outer boundary edge (curved arcs + straight radii/chords/tangents) when asked for perimeter.',
    ],
    comparisonTable: {
      title: 'Common Degree–Radian Equivalents',
      headers: ['Degrees', 'Radians (Exact)', 'Radians (Approx.)'],
      rows: [
        ['$30^\\circ$', '$\\frac{\\pi}{6}$', '$0.524\\text{ rad}$'],
        ['$45^\\circ$', '$\\frac{\\pi}{4}$', '$0.785\\text{ rad}$'],
        ['$60^\\circ$', '$\\frac{\\pi}{3}$', '$1.047\\text{ rad}$'],
        ['$90^\\circ$', '$\\frac{\\pi}{2}$', '$1.571\\text{ rad}$'],
        ['$180^\\circ$', '$\\pi$', '$3.142\\text{ rad}$'],
      ],
    },
    rapidSummary: [
      { rule: 'Deg $\\to$ Rad', detail: '$\\times \\frac{\\pi}{180}$' },
      { rule: 'Rad $\\to$ Deg', detail: '$\\times \\frac{180}{\\pi}$' },
      { rule: 'Arc length', detail: '$s = r\\theta$ ($\\theta$ MUST be in radians).' },
    ],
    coreObjectives: [
      'Solve problems involving the arc length and sector area of a circle, including knowledge and use of radian measure.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Radian conversion', latex: '\\pi\\text{ radians} = 180^\\circ' },
      { label: 'Arc length', latex: 's = r\\theta \\quad (\\theta \\text{ in radians})' },
      { label: 'Chord length', latex: 'AB = 2r\\sin\\!\\left(\\frac{\\theta}{2}\\right) = \\sqrt{2r^2(1 - \\cos\\theta)}' },
    ],
    studyNotes: [
      {
        heading: 'Finding Perimeters of Segments and Sectors',
        body: 'In Paper 2, diagram perimeters combine curved arcs with straight edges found via right-angled trigonometry (for tangent kite shapes: $AT = r\\tan(\\frac{\\theta}{2})$) or isosceles chord geometry ($AB = 2r\\sin(\\frac{\\theta}{2})$). Always list every edge explicitly before adding!',
      },
    ],
    workedExamples: [
      {
        title: 'Perimeter of a sector',
        question: 'A sector of radius $12\\text{ cm}$ has arc length $18\\text{ cm}$. Find the angle of the sector in radians and the total perimeter of the sector.',
        marks: 3,
        steps: [
          'Use $s = r\\theta$: $18 = 12\\theta \\implies \\theta = \\frac{18}{12} = 1.5\\text{ radians}$.',
          'Perimeter includes TWO straight radii plus the curved arc: $P = 12 + 12 + 18 = 42\\text{ cm}$.',
        ],
        answer: '$\\theta = 1.5\\text{ rad}$, Perimeter $= 42\\text{ cm}$',
        markSchemeNotes: 'M1 for $18 = 12\\theta$, A1 $\\theta = 1.5$, A1 for $42\\text{ cm}$.',
      },
    ],
    commonMistakes: [
      'Forgetting the two straight radii when computing the perimeter of a sector ($s + 2r$, not just $s$).',
      'Using $\\theta$ in degrees inside $s = r\\theta$.',
    ],
    coursebookTip: 'Keep exact multiples of $\\pi$ whenever the question asks for "exact perimeter in terms of $\\pi$" (common in Paper 1 Non-Calculator!).',
    quickCheck: {
      id: '0606-9.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A sector has perimeter $28\\text{ cm}$ and radius $8\\text{ cm}$. Find the angle $\\theta$ of the sector in radians.',
      answer: '1.5',
      numericAnswer: 1.5,
      tolerance: 0.01,
      hint: 'Perimeter $= 2r + r\\theta$.',
      solution: '$2(8) + 8\\theta = 28 \\implies 16 + 8\\theta = 28 \\implies 8\\theta = 12 \\implies \\theta = 1.5\\text{ rad}$.',
    },
  },
  {
    id: '9.2',
    chapterId: 9,
    code: '9.2',
    title: 'Sector area, segments & compound circular regions',
    tier: 'Extended',
    summary:
      'Calculate sector area $A = \\frac{1}{2}r^2\\theta$, minor/major segment area $\\frac{1}{2}r^2(\\theta - \\sin\\theta)$, and overlapping-circle shaded areas.',
    bigIdea:
      'Subtracting the central triangle $\\frac{1}{2}r^2\\sin\\theta$ from the sector $\\frac{1}{2}r^2\\theta$ isolates the curved segment immediately.',
    keyFindings: [
      {
        title: 'Segment Formula (Radians Only)',
        finding: 'Area of minor segment $= \\text{Sector} - \\text{Triangle} = \\frac{1}{2}r^2\\theta - \\frac{1}{2}r^2\\sin\\theta = \\frac{1}{2}r^2(\\theta - \\sin\\theta)$.',
      },
    ],
    stepByStepMethod: [
      'Decompose the shaded region cleanly using addition/subtraction of known shapes (sectors, triangles, rectangles, semicircles).',
      'Check every angle is in radians before applying $\\frac{1}{2}r^2\\theta$ or $\\frac{1}{2}r^2\\sin\\theta$.',
      'If two identical circles pass through each other’s centres, draw the equilateral triangle(s) joining centres and intersections to see $\\theta = \\frac{\\pi}{3}$ ($60^\\circ$) immediately!',
      'Keep full intermediate precision (or exact $\\pi$ and surd forms) until the final 3 s.f. rounding.',
    ],
    rapidSummary: [
      { rule: 'Sector area', detail: '$A = \\frac{1}{2}r^2\\theta = \\frac{1}{2}rs$ ($\\theta$ in radians).' },
      { rule: 'Segment area', detail: '$A_{\\text{seg}} = \\frac{1}{2}r^2(\\theta - \\sin\\theta)$.' },
      { rule: 'Equilateral overlap', detail: 'Centres distance $= r \\implies$ angle at centre $= \\frac{2\\pi}{3}$ across the lens.' },
    ],
    coreObjectives: [
      'Calculate sector area $A = \\frac{1}{2}r^2\\theta$ and apply it to minor/major sectors, segments, and composite shaded regions.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Sector area', latex: 'A = \\frac{1}{2}r^2\\theta = \\frac{1}{2}r s' },
      { label: 'Minor segment area', latex: 'A_{\\text{segment}} = \\frac{1}{2}r^2(\\theta - \\sin\\theta)' },
    ],
    studyNotes: [
      {
        heading: 'Maximising Sector Area for Fixed Perimeter',
        body: 'In a classic 0606 link with Chapter 2/14: if perimeter $P = 2r + r\\theta$ is fixed, then $r\\theta = P - 2r$, so area $A = \\frac{1}{2}r(r\\theta) = \\frac{1}{2}r(P - 2r) = \\frac{1}{2}Pr - r^2$. Completing the square or differentiating gives maximum area when $r = \\frac{P}{4}$ and $\\theta = 2\\text{ radians}$!',
      },
    ],
    workedExamples: [
      {
        title: 'Exact segment area in terms of π and surds',
        question: 'A chord $AB$ of a circle of radius $6\\text{ cm}$ subtends an angle of $\\frac{\\pi}{3}\\text{ rad}$ at the centre $O$. Find the exact area of the minor segment.',
        marks: 3,
        steps: [
          'Sector area: $A_{\\text{sec}} = \\frac{1}{2}(6^2)\\left(\\frac{\\pi}{3}\\right) = 6\\pi$.',
          'Triangle area: $A_{\\triangle OAB} = \\frac{1}{2}(6)(6)\\sin\\!\\left(\\frac{\\pi}{3}\\right) = 18 \\cdot \\frac{\\sqrt{3}}{2} = 9\\sqrt{3}$.',
          'Minor segment area: $6\\pi - 9\\sqrt{3}\\text{ cm}^2$.',
        ],
        answer: '$(6\\pi - 9\\sqrt{3})\\text{ cm}^2$',
        markSchemeNotes: 'M1 sector $6\\pi$, M1 triangle $9\\sqrt{3}$, A1 exact subtraction $6\\pi - 9\\sqrt{3}$.',
      },
    ],
    commonMistakes: [
      'Subtracting $\\frac{1}{2}r^2\\sin\\theta$ with the calculator left in DEG mode when $\\theta$ is in radians.',
      'Forgetting the $\\frac{1}{2}$ in $A = \\frac{1}{2}r^2\\theta$.',
    ],
    coursebookTip: 'In Paper 1 (Non-Calculator), circular measure angles are almost always $\\frac{\\pi}{6}, \\frac{\\pi}{4}, \\frac{\\pi}{3}, \\frac{\\pi}{2}, \\frac{2\\pi}{3}$ so you can compute $\\sin\\theta$ and $\\cos\\theta$ exactly!',
    quickCheck: {
      id: '0606-9.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A sector has radius $5\\text{ cm}$ and arc length $12\\text{ cm}$. Find its area in $\\text{cm}^2$.',
      answer: '30',
      numericAnswer: 30,
      tolerance: 0,
      hint: 'Use $A = \\frac{1}{2}r^2\\theta = \\frac{1}{2}r(r\\theta) = \\frac{1}{2}rs$.',
      solution: '$A = \\frac{1}{2} \\times 5 \\times 12 = 30\\text{ cm}^2$.',
    },
  },
];
