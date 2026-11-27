import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_12_NOTES_0606: SubtopicNote[] = [
  {
    id: '12.1',
    chapterId: 12,
    code: '12.1',
    title: 'Binomial theorem for (a + b)ⁿ',
    tier: 'Extended',
    summary:
      'Expand $(a + b)^n$ for positive integer $n$, use the general term $\\binom{n}{r} a^{n-r} b^r$ ($0 \\le r \\le n$) to extract specific coefficients or the term independent of $x$, and multiply two expansions to find a target term.',
    bigIdea:
      'Every term in $(a + b)^n$ has total exponent $n$ split as $a^{n-r}b^r$, weighted by $\\binom{n}{r}$. Rather than expanding all $n+1$ terms, jump straight to the single term you need using $T_{r+1} = \\binom{n}{r}a^{n-r}b^r$.',
    keyFindings: [
      {
        title: 'Exponent-Matching Shortcut for "Term Independent of $x$"',
        finding:
          'Write $T_{r+1} = \\binom{n}{r} a^{n-r} b^r$, collect ALL numerical coefficients together and ALL powers of $x$ into a single $x^{p(r)}$, then solve $p(r) = 0$ (or $p(r) = k$ for the $x^k$ term).',
      },
    ],
    stepByStepMethod: [
      'Identify $a$, $b$ (KEEP any minus sign inside $b$, e.g. $(2 - 3x)^6$ has $b = -3x$), and $n$.',
      'For the full expansion (or first 3–4 terms in ascending powers of $x$), apply $\\binom{n}{0}a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\dots$ and simplify carefully.',
      'To find a specific power $x^k$ or the constant term ($x^0$), write $T_{r+1} = \\binom{n}{r}a^{n-r}b^r$, combine exponents of $x$, and solve for integer $r \\in \\{0, 1, \\dots, n\\}$.',
      'For products like $(1 + cx)(a + bx)^n$, expand $(a + bx)^n$ only up to the powers needed, then multiply only the pairs whose powers sum to the requested degree.',
    ],
    rapidSummary: [
      { rule: 'General term', detail: '$T_{r+1} = \\binom{n}{r}a^{n-r}b^r$ for $0 \\le r \\le n$.' },
      { rule: 'Given in Exam Formula Sheet', detail: 'Both $(a+b)^n$ expansion and $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$ are printed on page 2.' },
      { rule: 'Constant / independent term', detail: 'Set the combined power of $x$ equal to $0$ and verify $r$ is a whole number with $0 \\le r \\le n$.' },
    ],
    coreObjectives: [
      'Use the binomial theorem for expansion of $(a+b)^n$ for positive integer $n$, including simplification of coefficients.',
      'Use the general term $\\binom{n}{r}a^{n-r}b^r$ ($0 \\le r \\le n$) to find a specific term or the term independent of $x$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      {
        label: 'Binomial Theorem (Given)',
        latex: '(a+b)^n = a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\dots + \\binom{n}{r}a^{n-r}b^r + \\dots + b^n',
      },
      { label: 'General term (r+1)th', latex: 'T_{r+1} = \\binom{n}{r}a^{n-r}b^r, \\qquad 0 \\le r \\le n' },
    ],
    studyNotes: [
      {
        heading: 'Multiplying a Binomial Expansion by a Bracket',
        body: 'To find the coefficient of $x^2$ in $(3 - 2x)(1 + 4x)^5$, you only need $(1 + 4x)^5 = 1 + 20x + 160x^2 + \\dots$. Then the $x^2$ terms come strictly from $3(160x^2) + (-2x)(20x) = (480 - 40)x^2 = 440x^2$.',
      },
    ],
    workedExamples: [
      {
        title: 'Term Independent of x',
        question: 'Find the term independent of $x$ in the expansion of $\\left(2x - \\frac{1}{x^2}\\right)^9$.',
        marks: 4,
        steps: [
          'Write the general term with $a = 2x$ and $b = -x^{-2}$: $T_{r+1} = \\binom{9}{r}(2x)^{9-r}(-x^{-2})^r$.',
          'Separate numbers and $x$-powers: $\\binom{9}{r} 2^{9-r} (-1)^r \\cdot x^{9 - r - 2r} = \\binom{9}{r} 2^{9-r} (-1)^r x^{9 - 3r}$.',
          'For the term independent of $x$, set the exponent to $0$: $9 - 3r = 0 \\implies r = 3$.',
          'Evaluate at $r = 3$: $\\binom{9}{3} 2^6 (-1)^3 = 84 \\times 64 \\times (-1) = -5376$.',
        ],
        answer: '$-5376$',
        markSchemeNotes: 'M1 for general term structure; M1 for setting $9 - 3r = 0$; A1 for $r = 3$; A1 for $-5376$.',
      },
    ],
    commonMistakes: [
      'Forgetting to raise the coefficient inside $a$ or $b$ to the power, e.g. writing $(2x)^4 = 2x^4$ instead of $16x^4$.',
      'Dropping the negative sign on $(-\\frac{1}{x^2})^r$ or ignoring $(-1)^r$ when $r$ is odd.',
      'Confusing "coefficient of $x^2$" (a number, e.g. $80$) with "term in $x^2$" (includes $x^2$, e.g. $80x^2$).',
    ],
    coursebookTip:
      'Notice the pattern: in $(a + b)^n$, the powers of $a$ step down ($n, n-1, \\dots$) while the powers of $b$ step up ($0, 1, \\dots$), and the two exponents ALWAYS sum to $n$.',
    quickCheck: {
      id: '0606-12.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'Find the coefficient of $x^2$ in the expansion of $(2 + x)^5$.',
      answer: '80',
      numericAnswer: 80,
      tolerance: 0,
      hint: 'Use $T_{r+1} = \\binom{5}{r}2^{5-r}x^r$ with $r = 2$.',
      solution: '$\\binom{5}{2} \\cdot 2^{5-2} = 10 \\times 8 = 80$.',
    },
  },
  {
    id: '12.2',
    chapterId: 12,
    code: '12.2',
    title: 'Arithmetic progressions (AP)',
    tier: 'Extended',
    summary:
      'Recognise arithmetic progressions with constant common difference $d = u_{n+1} - u_n$, use $u_n = a + (n-1)d$ and $S_n = \\frac{n}{2}[2a + (n-1)d] = \\frac{n}{2}(a + l)$, and link $S_n$ back to terms via $u_n = S_n - S_{n-1}$.',
    bigIdea:
      'An arithmetic progression grows linearly: every step adds the exact same number $d$. Therefore any two equations about terms or partial sums reduce to simultaneous linear equations in $(a, d)$.',
    keyFindings: [
      {
        title: 'AP Test & $S_n$ Recovery Trick',
        finding:
          'Three consecutive terms $A, B, C$ form an AP if and only if $B - A = C - B$ (equivalently $2B = A + C$). Also, for ANY series, $u_n = S_n - S_{n-1}$ for $n \\ge 2$ and $u_1 = S_1$.',
      },
    ],
    stepByStepMethod: [
      'Translate every word clue into $a$ (first term) and $d$ (common difference): e.g., "$5$th term is $19$" $\\implies a + 4d = 19$.',
      'If the last term $l$ is known (or easily found), use $S_n = \\frac{n}{2}(a + l)$; otherwise use $S_n = \\frac{n}{2}[2a + (n-1)d]$.',
      'To sum terms strictly from $u_k$ to $u_m$ (e.g. $11$th to $25$th term), compute $S_m - S_{k-1}$ (be careful: subtract $S_{k-1}$, NOT $S_k$!).',
      'For worded AP problems ("total distance run in $n$ days exceeds $100\\text{ km}$"), form the inequality in $n$ and solve for the smallest integer $n$.',
    ],
    rapidSummary: [
      { rule: '$n$th term', detail: '$u_n = a + (n - 1)d$ (given in formula sheet).' },
      { rule: 'Sum of $n$ terms', detail: '$S_n = \\frac{n}{2}(a + l) = \\frac{n}{2}[2a + (n - 1)d]$ (given in formula sheet).' },
      { rule: 'Consecutive AP test', detail: '$u_2 - u_1 = u_3 - u_2$.' },
    ],
    coreObjectives: [
      'Recognise arithmetic progressions and distinguish them from geometric progressions.',
      'Use the formulas for $u_n$ and $S_n$ to solve algebraic and contextual problems involving arithmetic progressions.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'AP nth term (Given)', latex: 'u_n = a + (n - 1)d' },
      { label: 'AP sum of n terms (Given)', latex: 'S_n = \\frac{n}{2}(a + l) = \\frac{n}{2}[2a + (n - 1)d]' },
    ],
    studyNotes: [
      {
        heading: 'Finding $d$ When Given $S_n$',
        body: 'If a question gives a formula for $S_n$ (e.g. $S_n = 3n^2 + 2n$), find $a = S_1 = 3(1)^2 + 2(1) = 5$, then $S_2 = 3(4) + 4 = 16$, so $u_2 = S_2 - S_1 = 11$, hence $d = u_2 - u_1 = 11 - 5 = 6$.',
      },
    ],
    workedExamples: [
      {
        title: 'Simultaneous Equations for AP Terms & Partial Sum Range',
        question:
          'In an arithmetic progression, the $4$th term is $11$ and the sum of the first $10$ terms is $145$. Find $a$, $d$, and the sum of the terms from the $11$th term to the $20$th term inclusive.',
        marks: 5,
        steps: [
          'From $u_4 = 11$: $a + 3d = 11$.',
          'From $S_{10} = 145$: $\\frac{10}{2}(2a + 9d) = 145 \\implies 2a + 9d = 29$.',
          'Double the first equation: $2a + 6d = 22$. Subtract from $2a + 9d = 29 \\implies 3d = 7 \\implies d = \\frac{7}{3}$? Wait — check clean numbers: let us solve carefully: $d = \\frac{7}{3}$ gives $a = 11 - 7 = 4$. Verify: $S_{10} = 5(8 + 21) = 5(29) = 145$!',
          'Sum from $11$th to $20$th term $= S_{20} - S_{10}$. $S_{20} = \\frac{20}{2}\\left(2(4) + 19 \\cdot \\frac{7}{3}\\right) = 10\\left(8 + \\frac{133}{3}\\right) = 10 \\cdot \\frac{157}{3} = \\frac{1570}{3}$.',
          '$S_{20} - S_{10} = \\frac{1570}{3} - 145 = \\frac{1135}{3} = 378\\frac{1}{3}$.',
        ],
        answer: '$a = 4,\\; d = \\frac{7}{3}$, sum $= \\frac{1135}{3}$',
        markSchemeNotes: 'M1 for both equations in $a, d$; A1 for $d = \\frac{7}{3}, a = 4$; M1 for $S_{20} - S_{10}$; A1 for $S_{20}$; A1 for $\\frac{1135}{3}$.',
      },
    ],
    commonMistakes: [
      'Writing $u_n = a + nd$ instead of $a + (n-1)d$.',
      'Computing the sum from $u_{11}$ to $u_{20}$ as $S_{20} - S_{11}$ instead of $S_{20} - S_{10}$ (subtracting $S_{11}$ deletes the $11$th term!).',
    ],
    coursebookTip:
      'On every AP question, double-check whether the problem states the "$n$th term" ($u_n$) or the "sum of the first $n$ terms" ($S_n$) — mixing up $u_{10}$ and $S_{10}$ is the most frequent slip.',
    quickCheck: {
      id: '0606-12.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'An arithmetic progression has first term $a = 5$ and common difference $d = 3$. Find the sum of the first $10$ terms, $S_{10}$.',
      answer: '185',
      numericAnswer: 185,
      tolerance: 0,
      hint: 'Use $S_n = \\frac{n}{2}[2a + (n - 1)d]$ with $n = 10$.',
      solution: '$S_{10} = \\frac{10}{2}[2(5) + 9(3)] = 5(10 + 27) = 5 \\times 37 = 185$.',
    },
  },
  {
    id: '12.3',
    chapterId: 12,
    code: '12.3',
    title: 'Geometric progressions (GP), convergence & sum to infinity',
    tier: 'Extended',
    summary:
      'Identify geometric progressions via constant common ratio $r = \\frac{u_{n+1}}{u_n}$, use $u_n = ar^{n-1}$ and $S_n = \\frac{a(1-r^n)}{1-r}$, justify convergence via $|r| < 1$, and apply $S_\\infty = \\frac{a}{1 - r}$.',
    bigIdea:
      'A geometric progression multiplies by the same constant $r$ at every step. If $|r| < 1$ ($-1 < r < 1$), successive terms shrink toward $0$, so the infinite sum locks onto the finite limit $S_\\infty = \\frac{a}{1-r}$; if $|r| \\ge 1$, the series diverges and has no finite sum to infinity.',
    keyFindings: [
      {
        title: 'Mandatory Convergence Justification',
        finding:
          'When Cambridge asks "Explain why this geometric progression has (or does not have) a sum to infinity", state BOTH the numerical value of $r$ AND the exact condition $|r| < 1$ (or $-1 < r < 1$ vs $|r| \\ge 1$), plus noting $r^n \\to 0$ as $n \\to \\infty$ when $|r| < 1$.',
      },
    ],
    stepByStepMethod: [
      'Divide adjacent terms to test for a GP: $r = \\frac{u_2}{u_1} = \\frac{u_3}{u_2}$.',
      'Divide one term equation by another to eliminate $a$ and solve for $r$: e.g., $\\frac{u_5}{u_2} = \\frac{ar^4}{ar} = r^3$. (Remember $\\pm$ if taking an even root, e.g. $r^2 = \\frac{1}{4} \\implies r = \\pm\\frac{1}{2}$!)',
      'Solve inequalities like $u_n < 0.001$ or $S_\\infty - S_n < 0.01$ by rearranging for $r^n$ and taking $\\ln$ or $\\lg$ (watch sign flip when dividing by $\\ln r < 0$!).',
      'Check convergence ($|r| < 1$) before computing $S_\\infty = \\frac{a}{1 - r}$.',
    ],
    rapidSummary: [
      { rule: '$n$th term', detail: '$u_n = ar^{n-1}$ (given in formula sheet).' },
      { rule: 'Finite sum', detail: '$S_n = \\frac{a(1 - r^n)}{1 - r} = \\frac{a(r^n - 1)}{r - 1}$ ($r \\ne 1$, given).' },
      { rule: 'Sum to infinity', detail: '$S_\\infty = \\frac{a}{1 - r}$ valid ONLY when $|r| < 1$ ($-1 < r < 1$).' },
    ],
    coreObjectives: [
      'Recognise geometric progressions and use $u_n = ar^{n-1}$ and $S_n = \\frac{a(1-r^n)}{1-r}$.',
      'Use the convergence condition $|r| < 1$, explain why a GP does or does not have a sum to infinity, and calculate $S_\\infty = \\frac{a}{1-r}$.',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'GP nth term (Given)', latex: 'u_n = ar^{n-1}' },
      { label: 'GP finite sum (Given)', latex: 'S_n = \\frac{a(1 - r^n)}{1 - r}, \\quad r \\ne 1' },
      { label: 'GP sum to infinity (Given)', latex: 'S_\\infty = \\frac{a}{1 - r}, \\quad |r| < 1' },
    ],
    studyNotes: [
      {
        heading: 'Comparing Arithmetic and Geometric Models in Context',
        body: 'In worded questions, repeated constant increments ($+50\\text{ m}$ per lap) form an AP, whereas constant percentage changes (e.g. a ball bouncing to $80\\%$ of its previous height, or compounding by $4\\%$ annually) form a GP with $r = 0.8$ or $r = 1.04$.',
      },
    ],
    workedExamples: [
      {
        title: 'Using Logarithms to Find $n$ When $r$ is a Fraction',
        question:
          'A geometric progression has $a = 120$ and $r = 0.75$. (a) Find $S_\\infty$. (b) Find the smallest integer $n$ for which $S_\\infty - S_n < 1$.',
        marks: 4,
        steps: [
          '(a) Since $|0.75| < 1$, $S_\\infty = \\frac{120}{1 - 0.75} = \\frac{120}{0.25} = 480$.',
          '(b) Notice $S_\\infty - S_n = \\frac{a}{1 - r} - \\frac{a(1 - r^n)}{1 - r} = \\frac{a r^n}{1 - r} = S_\\infty r^n$.',
          'So $480(0.75)^n < 1 \\implies (0.75)^n < \\frac{1}{480}$.',
          'Take $\\ln$ on both sides: $n\\ln(0.75) < \\ln\\!\\left(\\frac{1}{480}\\right)$. Since $\\ln(0.75) < 0$, dividing reverses the inequality: $n > \\frac{\\ln(1/480)}{\\ln(0.75)} \\approx 21.45$. Smallest integer $n = 22$.',
        ],
        answer: '(a) $480$, (b) $n = 22$',
        markSchemeNotes: 'B1 for $480$; M1 for setting up $480(0.75)^n < 1$; M1 for taking logs and reversing sign; A1 for $n = 22$.',
      },
    ],
    commonMistakes: [
      'Dividing an inequality by $\\ln(0.75)$ without flipping $<$ to $>$ (remember $\\ln(r) < 0$ whenever $0 < r < 1$!).',
      'Accepting a root $|r| \\ge 1$ when computing $S_\\infty$ (if two values of $r$ arise from a quadratic, reject any $|r| \\ge 1$ for convergence).',
      'Writing $S_n = \\frac{a(1-r^n)}{1-r}$ with $(1-r^n)$ confused with $(1-r)^n$.',
    ],
    coursebookTip:
      'Remember the super-clean identity $S_\\infty - S_n = S_\\infty r^n$: it turns "difference between sum to infinity and first $n$ terms" into a single 1-line equation.',
    quickCheck: {
      id: '0606-12.3-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A geometric progression has first term $18$ and second term $6$. Find its sum to infinity $S_\\infty$.',
      answer: '27',
      numericAnswer: 27,
      tolerance: 0,
      hint: 'Find the common ratio $r = \\frac{6}{18}$ first, verify $|r| < 1$, then apply $S_\\infty = \\frac{a}{1 - r}$.',
      solution: '$r = \\frac{6}{18} = \\frac{1}{3}$ (so $|r| < 1$). Then $S_\\infty = \\frac{18}{1 - 1/3} = \\frac{18}{2/3} = 27$.',
    },
  },
];
