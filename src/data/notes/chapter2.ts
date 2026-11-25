import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_2_NOTES: SubtopicNote[] = [
  {
    id: '2.1',
    chapterId: 2,
    code: '2.1',
    title: 'Introduction to algebra',
    tier: 'Core & Extended',
    summary: 'Write algebraic expressions from word descriptions, collect like terms, substitute values, and rearrange simple formulae.',
    coreObjectives: [
      'Use letters to express generalised numbers and express basic arithmetic processes algebraically.',
      'Substitute numbers for words and letters in formulae and rearrange simple formulae.',
    ],
    extendedObjectives: [
      'Rearrange complicated formulae where the subject appears twice or inside roots/fractions.',
    ],
    keyFormulas: [
      { label: 'Substitution discipline', latex: '\\text{Always wrap negative substitutions in brackets: } x = -3 \\implies x^2 = (-3)^2 = 9' },
    ],
    studyNotes: [
      {
        heading: 'Changing the subject when the variable appears twice (Extended)',
        body: 'Collect all terms containing the target subject on one side of the equals sign, factorise the subject out into a single bracket, and then divide by the remaining bracket.',
      },
    ],
    workedExamples: [
      {
        title: 'Rearranging when subject appears twice (Extended)',
        question: 'Make $x$ the subject of $y = \\frac{3x + 1}{x - 2}$.',
        marks: 4,
        steps: [
          'Multiply both sides by $(x - 2)$: $y(x - 2) = 3x + 1$.',
          'Expand: $xy - 2y = 3x + 1$.',
          'Collect $x$-terms on left: $xy - 3x = 2y + 1$.',
          'Factorise $x$: $x(y - 3) = 2y + 1 \\implies x = \\frac{2y + 1}{y - 3}$.',
        ],
        answer: '$x = \\frac{2y + 1}{y - 3}$',
        markSchemeNotes: 'M1 for clearing denominator, M1 for expanding & collecting $x$ terms, M1 for factorising $x$, A1 final.',
      },
    ],
    commonMistakes: [
      'Writing $-3^2 = -9$ instead of $(-3)^2 = +9$ when substituting negative numbers.',
      'Leaving the target variable on both sides when changing the subject.',
    ],
    quickCheck: {
      id: 'qc-2.1',
      prompt: 'Evaluate $2x^2 - 5x$ when $x = -3$.',
      answer: '33',
      numericAnswer: 33,
      tolerance: 0,
      hint: '$2(-3)^2 - 5(-3) = 2(9) + 15$.',
      solution: '$18 + 15 = 33$.',
    },
  },
  {
    id: '2.2',
    chapterId: 2,
    code: '2.2',
    title: 'Algebraic manipulation',
    tier: 'Core & Extended',
    summary: 'Expand single, double, and triple brackets; factorise by common factors, grouping, quadratics, and difference of two squares.',
    coreObjectives: [
      'Manipulate directed numbers, use brackets and extract common factors.',
      'Expand products of algebraic expressions like $3x(2x - 5)$ and $(x + 4)(x - 7)$.',
      'Factorise expressions of the form $ax + bx$, $x^2 + bx + c$, and $a^2 - b^2$.',
    ],
    extendedObjectives: [
      'Expand products of three binomials such as $(x + 2)(x - 3)(2x + 1)$.',
      'Factorise quadratics $ax^2 + bx + c$ ($a > 1$) and four-term expressions by grouping.',
    ],
    keyFormulas: [
      { label: 'Difference of two squares', latex: 'a^2 - b^2 = (a - b)(a + b)' },
      { label: 'Perfect square trinomial', latex: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2' },
    ],
    studyNotes: [
      {
        heading: 'Four-step Factorisation Checklist',
        body: 'When asked to "factorise completely", always check in this exact order:',
        bullets: [
          '1. Highest Common Factor (HCF) first — e.g. $2x^2 - 18 = 2(x^2 - 9)$.',
          '2. Difference of two squares — $2(x^2 - 9) = 2(x - 3)(x + 3)$.',
          '3. Quadratic trinomial $ax^2 + bx + c$ — split the middle term into two numbers multiplying to $ac$ and adding to $b$.',
          '4. Four-term grouping — factorise first pair and second pair to reveal a common bracket.',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Factorising completely (Extended)',
        question: 'Factorise completely $3x^2 - 75y^2$.',
        marks: 2,
        steps: [
          'Extract common factor $3$: $3(x^2 - 25y^2)$.',
          'Apply difference of two squares: $3(x - 5y)(x + 5y)$.',
        ],
        answer: '$3(x - 5y)(x + 5y)$',
        markSchemeNotes: 'M1 for $3(x^2 - 25y^2)$, A1 for $3(x - 5y)(x + 5y)$.',
      },
    ],
    commonMistakes: [
      'Expanding $(x + 5)^2$ as $x^2 + 25$ and forgetting the middle $+10x$ term.',
      'Stopping after extracting a numerical factor without finishing the difference of two squares.',
    ],
    quickCheck: {
      id: 'qc-2.2',
      prompt: 'When $2x^2 + 7x + 3$ is factorised as $(2x + a)(x + b)$, what is the value of $a + b$?',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: '$2x^2 + 7x + 3 = (2x + 1)(x + 3)$.',
      solution: '$a = 1$ and $b = 3$, so $a + b = 4$.',
    },
  },
  {
    id: '2.3',
    chapterId: 2,
    code: '2.3',
    title: 'Algebraic fractions',
    tier: 'Extended',
    summary: 'Simplify, add, subtract, multiply, and divide algebraic fractions by factorising numerators and denominators.',
    coreObjectives: [
      'Recall arithmetic rules for numerical fractions.',
    ],
    extendedObjectives: [
      'Manipulate algebraic fractions and factorise and simplify rational expressions such as $\\frac{x^2 - 2x}{x^2 - 5x + 6}$.',
    ],
    keyFormulas: [
      { label: 'Adding fractions', latex: '\\frac{A}{B} \\pm \\frac{C}{D} = \\frac{AD \\pm BC}{BD}' },
    ],
    studyNotes: [
      {
        heading: 'Never cancel individual terms across $+$ or $-$ signs',
        body: 'In $\\frac{x^2 - 9}{x^2 + 5x + 6}$, you CANNOT cancel $x^2$. You MUST factorise top and bottom completely first: $\\frac{(x - 3)(x + 3)}{(x + 2)(x + 3)} = \\frac{x - 3}{x + 2}$.',
      },
    ],
    workedExamples: [
      {
        title: 'Subtracting algebraic fractions (Extended)',
        question: 'Write as a single fraction in its simplest form: $\\frac{3}{x - 1} - \\frac{2}{x + 4}$.',
        marks: 3,
        steps: [
          'Common denominator is $(x - 1)(x + 4)$.',
          'Numerator: $3(x + 4) - 2(x - 1) = 3x + 12 - 2x + 2 = x + 14$.',
          'Final single fraction: $\\frac{x + 14}{(x - 1)(x + 4)}$.',
        ],
        answer: '$\\frac{x + 14}{(x - 1)(x + 4)}$',
        markSchemeNotes: 'M1 for common denominator, M1 for $3(x+4) - 2(x-1)$, A1 for $\\frac{x+14}{(x-1)(x+4)}$.',
      },
    ],
    commonMistakes: [
      'Writing $-2(x - 1) = -2x - 2$ instead of $-2x + 2$.',
      'Cancelling terms inside sums instead of common factors.',
    ],
    quickCheck: {
      id: 'qc-2.3',
      prompt: 'Simplify $\\frac{x^2 - 16}{x^2 + 4x}$. Evaluate the simplified expression when $x = 6$ (as a decimal or a/b).',
      answer: '1/3',
      acceptedAnswers: ['1/3', '0.333'],
      numericAnswer: 1 / 3,
      tolerance: 0.01,
      hint: '$\\frac{(x-4)(x+4)}{x(x+4)} = \\frac{x-4}{x}$.',
      solution: 'At $x = 6$, $\\frac{6 - 4}{6} = \\frac{2}{6} = \\frac{1}{3}$.',
    },
  },
  {
    id: '2.4',
    chapterId: 2,
    code: '2.4',
    title: 'Indices II',
    tier: 'Core & Extended',
    summary: 'Apply the laws of indices to algebraic terms and solve exponential equations by equating powers of a common base.',
    coreObjectives: [
      'Understand and use indices (positive, zero, negative) with algebraic expressions.',
    ],
    extendedObjectives: [
      'Simplify algebraic expressions with fractional and negative indices and solve equations such as $2^{3x-1} = 32$.',
    ],
    keyFormulas: [
      { label: 'Power of a product/power', latex: '(ax^m)^n = a^n x^{mn}' },
      { label: 'Equating bases', latex: 'a^{f(x)} = a^{g(x)} \\implies f(x) = g(x) \\quad (a > 0, a \\neq 1)' },
    ],
    studyNotes: [
      {
        heading: 'Raising coefficients inside brackets',
        body: 'In $(3x^4)^2$, remember the exponent $2$ applies to BOTH the coefficient $3$ AND $x^4$: $3^2 x^{4 \\times 2} = 9x^8$, NOT $3x^8$ or $6x^8$.',
      },
    ],
    workedExamples: [
      {
        title: 'Solving an exponential equation (Extended)',
        question: 'Solve $4^{2x - 1} = 8^{x + 2}$.',
        marks: 3,
        steps: [
          'Rewrite both sides with base $2$: $4 = 2^2$ and $8 = 2^3$.',
          '$(2^2)^{2x - 1} = (2^3)^{x + 2} \\implies 2^{4x - 2} = 2^{3x + 6}$.',
          'Equate exponents: $4x - 2 = 3x + 6 \\implies x = 8$.',
        ],
        answer: '$x = 8$',
        markSchemeNotes: 'M1 for base $2$ conversion, M1 for $4x - 2 = 3x + 6$, A1 for $x = 8$.',
      },
    ],
    commonMistakes: [
      'Forgetting to raise numerical coefficients inside parentheses to the outer power.',
    ],
    quickCheck: {
      id: 'qc-2.4',
      prompt: 'Solve $3^{2x - 1} = 27$.',
      answer: '2',
      numericAnswer: 2,
      tolerance: 0,
      hint: 'Write $27 = 3^3$, so $2x - 1 = 3$.',
      solution: '$2x - 1 = 3 \\implies 2x = 4 \\implies x = 2$.',
    },
  },
  {
    id: '2.5',
    chapterId: 2,
    code: '2.5',
    title: 'Equations',
    tier: 'Core & Extended',
    summary: 'Solve linear, fractional, simultaneous (linear & non-linear), and quadratic equations by factorising, quadratic formula, or completing the square.',
    coreObjectives: [
      'Solve simple linear equations and simultaneous linear equations in two unknowns.',
      'Construct and solve linear equations from word problems.',
    ],
    extendedObjectives: [
      'Solve quadratic equations by factorisation, completing the square, and the quadratic formula.',
      'Solve simultaneous equations with one linear and one quadratic equation.',
    ],
    keyFormulas: [
      { label: 'Quadratic Formula (Provided in 2025+)', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Completing the Square', latex: 'x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 + c' },
    ],
    studyNotes: [
      {
        heading: 'When to use which quadratic method',
        body: 'If the question says "give your answers correct to $2$ decimal places" or "3 significant figures", it will NOT factorise cleanly — go straight to the quadratic formula and show the substitution line clearly to guarantee method marks.',
      },
    ],
    workedExamples: [
      {
        title: 'Linear & quadratic simultaneous equations (Extended)',
        question: 'Solve simultaneously: $y = 2x + 1$ and $x^2 + y^2 = 13$.',
        marks: 5,
        steps: [
          'Substitute $y = 2x + 1$ into $x^2 + y^2 = 13$: $x^2 + (2x + 1)^2 = 13$.',
          'Expand: $x^2 + 4x^2 + 4x + 1 = 13 \\implies 5x^2 + 4x - 12 = 0$.',
          'Factorise: $(5x - 6)(x + 2) = 0 \\implies x = 1.2$ or $x = -2$.',
          'Find matching $y$ values: when $x = 1.2, y = 3.4$; when $x = -2, y = -3$.',
        ],
        answer: '$(1.2, 3.4)$ and $(-2, -3)$',
        markSchemeNotes: 'M1 substitution, M1 $5x^2 + 4x - 12 = 0$, M1 factorising/formula, A1 $x$-values, A1 $y$-values.',
      },
    ],
    commonMistakes: [
      'Writing $-b$ wrong when $b$ itself is negative (if $b = -5$, $-b = +5$).',
      'Forgetting to pair each $x$ solution with its corresponding $y$ value.',
    ],
    quickCheck: {
      id: 'qc-2.5',
      prompt: 'What is the positive root of $x^2 - 5x - 14 = 0$?',
      answer: '7',
      numericAnswer: 7,
      tolerance: 0,
      hint: 'Factorise into $(x - 7)(x + 2) = 0$.',
      solution: '$x = 7$ or $x = -2$, so the positive root is $7$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.6',
    chapterId: 2,
    code: '2.6',
    title: 'Inequalities',
    tier: 'Core & Extended',
    summary: 'Solve linear inequalities, illustrate solution sets on number lines, and represent graphical inequality regions (linear programming).',
    coreObjectives: [
      'Solve linear inequalities and represent them on a number line.',
    ],
    extendedObjectives: [
      'Represent and interpret linear inequalities in two variables graphically, including shading unwanted regions and finding integer solutions.',
    ],
    keyFormulas: [
      { label: 'Sign reversal rule', latex: 'ax < b \\ (a < 0) \\implies x > \\frac{b}{a}', note: 'Flip the inequality sign when multiplying or dividing by a negative number.' },
    ],
    studyNotes: [
      {
        heading: 'Graphical inequalities conventions',
        body: 'Solid line for $\\le$ or $\\ge$; dashed line for $<$ or $>$. Always read carefully whether Cambridge asks you to shade the WANTED region or leave the required region UNSHADED (most Cambridge questions ask you to shade the UNWANTED regions and label the unshaded region $R$).',
      },
    ],
    workedExamples: [
      {
        title: 'Double inequality integer solutions',
        question: 'Find all integer values of $n$ that satisfy $-3 < 2n + 1 \\le 9$.',
        marks: 3,
        steps: [
          'Subtract $1$ across all parts: $-4 < 2n \\le 8$.',
          'Divide by $2$: $-2 < n \\le 4$.',
          'List integers strictly greater than $-2$ up to $4$: $-1, 0, 1, 2, 3, 4$.',
        ],
        answer: '$-1, 0, 1, 2, 3, 4$',
        markSchemeNotes: 'M1 for $-4 < 2n \\le 8$, A1 for $-2 < n \\le 4$, A1 for complete integer list.',
      },
    ],
    commonMistakes: [
      'Forgetting to flip the inequality sign when dividing by a negative coefficient.',
      'Including the boundary integer on a strict $<$ or $>$ inequality.',
    ],
    quickCheck: {
      id: 'qc-2.6',
      prompt: 'Solve $11 - 2x \\le 3$. Enter the minimum integer value of $x$.',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: '$-2x \\le -8 \\implies x \\ge 4$.',
      solution: '$11 - 3 \\le 2x \\implies 8 \\le 2x \\implies x \\ge 4$, so minimum integer is $4$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.7',
    chapterId: 2,
    code: '2.7',
    title: 'Sequences',
    tier: 'Core & Extended',
    summary: 'Master linear, quadratic ($an^2 + bn + c$), cubic ($an^3 + bn^2 + cn + d$), geometric ($ar^{n-1}$), fraction, and recurrence sequences using both difference-table subtraction and fast leading-column formulas ($2a, 3a+b, a+b+c$ and $6a, 12a+2b, 7a+3b+c, a+b+c+d$).',
    aims: [
      'Find general $n\\text{th}$ term formulas $u_n$ for linear, quadratic, cubic, geometric, and fraction sequences in Paper 2 & Paper 4.',
      'Apply the fast leading-column equations ($a+b+c$ for quadratic, $a+b+c+d$ for cubic) and 0th-term verification under exam time pressure.',
    ],
    coreObjectives: [
      'Continue a given number sequence or pattern and recognise patterns in sequences.',
      'Find and use the $n\\text{th}$ term of linear sequences and test whether a given number belongs to a sequence.',
    ],
    extendedObjectives: [
      'Find the $n\\text{th}$ term of quadratic ($an^2 + bn + c$), cubic ($an^3 + bn^2 + cn + d$), geometric ($a \\cdot r^{n-1}$), and combined fraction sequences.',
      'Use first, second, and third differences (including fast coefficient equations from $u_1$) and solve equations like $u_n = K$ for term position $n$.',
    ],
    keyFormulas: [
      {
        label: 'Linear $n\\text{th}$ term',
        latex: 'u_n = dn + c \\quad (d = u_2 - u_1,\\ c = u_1 - d = u_0)',
        note: 'Constant 1st difference $d$; step back once to $n=0$ for $c$.',
      },
      {
        label: 'Quadratic Fast Method ($a+b+c$)',
        latex: '2a = D_2,\\qquad 3a + b = d_1,\\qquad a + b + c = u_1',
        note: '<u>Fastest Paper 2/4 method</u>: solve $a$, then $b$, then $c$ top-down from $D_2$ (constant 2nd difference), $d_1 = u_2 - u_1$, and $u_1$!',
      },
      {
        label: 'Cubic Fast Method ($a+b+c+d$)',
        latex: '6a = D_3,\\quad 12a + 2b = d_2(1),\\quad 7a + 3b + c = d_1(1),\\quad a + b + c + d = u_1',
        note: '<u>Extended Cubic shortcut</u>: $D_3$ is constant 3rd difference; $d_2(1)$ is first 2nd-difference; $d_1(1) = u_2 - u_1$; $u_1$ is Term 1.',
      },
      {
        label: 'Geometric & 0th-Term Check',
        latex: 'u_n = a r^{n-1},\\qquad u_0 = \\begin{cases} c & \\text{(quadratic)} \\\\ d & \\text{(cubic)} \\end{cases}',
        note: 'For geometric sequences given non-consecutive terms $u_p, u_q$, divide: $\\frac{u_q}{u_p} = r^{q - p}$.',
      },
    ],
    keyFindings: [
      {
        title: '1. Fast Quadratic Method — Leading Column Equations ($2a, 3a+b, a+b+c$)',
        finding: 'Write the first $4$ terms, the 1st differences, and the constant 2nd difference $D_2$. Circle the **leading diagonal** under $u_1$ (`Term 1`) and match top-to-bottom: $2a = D_2 \\implies a$; then $3a + b = d_1 \\implies b$; then $a + b + c = u_1 \\implies c$.',
        noteBox: '<u>Why this always works</u>: substituting $n = 1, 2, 3$ into $an^2 + bn + c$ gives $u_1 = a+b+c$, $u_2 = 4a+2b+c$, $u_3 = 9a+3b+c$, so $d_1 = u_2 - u_1 = 3a + b$ and $D_2 = (5a+b) - (3a+b) = 2a$! <u>ALWAYS check $u_4$</u> (or step backwards once to $u_0 = c$) before moving on.',
      },
      {
        title: '2. Fast Cubic Method — Leading Column Equations ($6a, 12a+2b, 7a+3b+c, a+b+c+d$)',
        finding: 'When 2nd differences are NOT constant, take a **3rd difference row**. If $D_3$ is constant, the sequence is **cubic** $u_n = an^3 + bn^2 + cn + d$. Solve the four leading-column equations from bottom to top: $6a = D_3$, $12a + 2b = d_2(1)$, $7a + 3b + c = d_1(1)$, and $a + b + c + d = u_1$.',
        noteBox: '<u>Alternative safety check</u>: once you get $a = \\frac{D_3}{6}$, you can also subtract $an^3$ from every term ($n^3 = 1, 8, 27, 64, 125$) to reduce the sequence to a simpler quadratic $bn^2 + cn + d$ and confirm $b, c, d$!',
      },
      {
        title: '3. Geometric, Fraction & Term-Position Equations',
        finding: 'If consecutive ratios $\\frac{u_2}{u_1} = \\frac{u_3}{u_2} = r$ are constant, use $u_n = u_1 r^{n-1}$ (watch for negative alternating ratios like $r = -2$). For **fraction sequences**, solve the numerator sequence and denominator sequence **independently**. To test if $K$ is in a sequence, solve $u_n = K$: $n$ <u>MUST be a positive integer</u> ($n \\in \\mathbb{Z}^+$).',
        noteBox: 'Never confuse geometric growth ($r^n$, constant ratio) with polynomial growth ($n^2$ or $n^3$, constant 2nd/3rd difference). If $r$ is a fraction ($0 < r < 1$), terms decay toward $0$.',
      },
    ],
    studyNotes: [
      {
        heading: 'Quadratic Sequences: Fast $a+b+c$ Method vs Subtracting $an^2$',
        body: 'In Paper 2 and Paper 4, the **Fast Leading-Column Method** finds $a, b, c$ in under $30$ seconds without building an extra subtraction table, while subtracting $an^2$ acts as a foolproof backup when coefficients are fractions like $\\frac{1}{2}n^2$.',
        bullets: [
          'Step 1 (2nd difference): $2a = D_2 \\implies a = \\frac{D_2}{2}$. (Example: $D_2 = 4 \\implies a = 2$.)',
          'Step 2 (First 1st-difference): $3a + b = d_1 = u_2 - u_1 \\implies b = d_1 - 3a$.',
          'Step 3 (First term): $a + b + c = u_1 \\implies c = u_1 - a - b$.',
          '0th-term cross-check: continue the difference pattern backward one step to $n = 0$: $d_0 = d_1 - D_2$, then $u_0 = u_1 - d_0$. That $u_0$ MUST equal $c$!',
        ],
        noteBox: 'Always substitute $n = 4$ into your final $an^2 + bn + c$ formula to verify it reproduces $u_4$ identically.',
      },
      {
        heading: 'Cubic Sequences: Fast $6a, 12a+2b, 7a+3b+c, a+b+c+d$ Method',
        body: 'For any cubic $u_n = an^3 + bn^2 + cn + d$, substituting $n = 1, 2, 3, 4$ creates the universal leading-column coefficients down the left edge of the difference pyramid:',
        bullets: [
          'Row 3 (Constant 3rd difference): $6a = D_3 \\implies a = \\frac{D_3}{6}$. (If $D_3 = 6$, $a = 1$; if $D_3 = 12$, $a = 2$.)',
          'Row 2 (First 2nd difference $d_2(1) = u_3 - 2u_2 + u_1$): $12a + 2b = d_2(1) \\implies b = \\frac{d_2(1) - 12a}{2}$.',
          'Row 1 (First 1st difference $d_1(1) = u_2 - u_1$): $7a + 3b + c = d_1(1) \\implies c = d_1(1) - 7a - 3b$.',
          'Row 0 (First term $u_1$): $a + b + c + d = u_1 \\implies d = u_1 - a - b - c$. Finally check $u_5$!',
        ],
        noteBox: 'Shortcut for simple shifted cubes: always keep $n^3 = 1, 8, 27, 64, 125$ in mind! If your terms are $0, 7, 26, 63, 124$, you can spot $u_n = n^3 - 1$ immediately without writing a full pyramid.',
      },
    ],
    workedExamples: [
      {
        title: 'Quadratic sequence using the Fast $a+b+c$ Method (Extended)',
        question: 'Find the $n\\text{th}$ term of the quadratic sequence $3, 8, 17, 30, 47, \\dots$ using the $2a, 3a+b, a+b+c$ method, and find which term equals $278$.',
        marks: 5,
        steps: [
          'First differences: $5, 9, 13, 17$. Second differences: constant $D_2 = 4$.',
          'Solve the leading-column equations: $2a = 4 \\implies a = 2$; $3a + b = d_1 = 5 \\implies 6 + b = 5 \\implies b = -1$; $a + b + c = u_1 = 3 \\implies 2 - 1 + c = 3 \\implies c = 2$.',
          'Formula: $u_n = 2n^2 - n + 2$. (Cross-check $n = 4$: $2(16) - 4 + 2 = 30$; 0th-term check: $d_0 = 5 - 4 = 1$, $u_0 = 3 - 1 = 2 = c$.)',
          'Set $2n^2 - n + 2 = 278 \\implies 2n^2 - n - 276 = 0 \\implies (n - 12)(2n + 23) = 0$. Since $n$ is a positive integer, $n = 12$.',
        ],
        answer: '$u_n = 2n^2 - n + 2$; $278$ is the $12$th term',
        markSchemeNotes: 'M1 for $D_2 = 4 \\implies a = 2$, M1 for $3a + b = 5$ and $a + b + c = 3$, A1 for $2n^2 - n + 2$, M1 setting $= 278$, A1 for $n = 12$.',
      },
      {
        title: 'Cubic sequence using the Fast $6a, 12a+2b, 7a+3b+c, a+b+c+d$ Method (Extended)',
        question: 'Find the $n\\text{th}$ term of the cubic sequence $2, 11, 38, 95, 194, \\dots$.',
        marks: 4,
        steps: [
          '1st differences: $9, 27, 57, 99$ (so $d_1(1) = 9$).',
          '2nd differences: $18, 30, 42$ (so $d_2(1) = 18$).',
          '3rd differences: constant $D_3 = 12$.',
          'Solve leading column: $6a = 12 \\implies a = 2$; $12(2) + 2b = 18 \\implies 2b = -6 \\implies b = -3$; $7(2) + 3(-3) + c = 9 \\implies 14 - 9 + c = 9 \\implies c = 4$; $2 + (-3) + 4 + d = 2 \\implies d = -1$.',
          'Check $n = 5$: $2(125) - 3(25) + 4(5) - 1 = 250 - 75 + 20 - 1 = 194$ ✓.',
        ],
        answer: '$u_n = 2n^3 - 3n^2 + 4n - 1$',
        markSchemeNotes: 'B1 for 3rd difference $12$, M1 for $a = 2$ and $b = -3$, M1 for $c = 4, d = -1$, A1 for $2n^3 - 3n^2 + 4n - 1$.',
      },
    ],
    commonMistakes: [
      'Using $a = D_2$ instead of $a = \\frac{D_2}{2}$ for quadratic sequences, or $a = D_3$ instead of $a = \\frac{D_3}{6}$ for cubic sequences.',
      'In $3a + b = d_1$ and $7a + 3b + c = d_1$, using the 2nd difference instead of the 1st difference $u_2 - u_1$.',
      'Forgetting that $n$ must be a positive whole number ($n \\ge 1$) when testing whether a value is in the sequence.',
    ],
    quickCheck: {
      id: 'qc-2.7',
      prompt: 'A quadratic sequence begins $4, 11, 22, 37, \\dots$. Using $2a = D_2,\\ 3a+b = d_1,\\ a+b+c = u_1$, find the $10$th term.',
      answer: '211',
      numericAnswer: 211,
      tolerance: 0,
      hint: '$D_2 = 4 \\implies a = 2$; $3(2)+b = 7 \\implies b = 1$; $2+1+c = 4 \\implies c = 1$. So $u_n = 2n^2 + n + 1$.',
      solution: '$u_n = 2n^2 + n + 1 \\implies u_{10} = 2(100) + 10 + 1 = 211$.',
    },
    sandbox: 'sequence-explorer',
  },
  {
    id: '2.8',
    chapterId: 2,
    code: '2.8',
    title: 'Proportion',
    tier: 'Extended',
    summary: 'Express direct and inverse variation algebraically ($y \\propto x^n$, $y \\propto \\frac{1}{x^n}$) and calculate unknown values.',
    coreObjectives: [
      'Understand basic direct proportion in ratio tables.',
    ],
    extendedObjectives: [
      'Express direct and inverse proportion in algebraic terms and use this form of expression to find unknown quantities.',
    ],
    keyFormulas: [
      { label: 'Direct proportion', latex: 'y \\propto x^n \\implies y = k x^n' },
      { label: 'Inverse proportion', latex: 'y \\propto \\frac{1}{x^n} \\implies y = \\frac{k}{x^n}' },
    ],
    studyNotes: [
      {
        heading: 'Three-step proportionality method',
        body: '1. Write the proportional equation with constant $k$ (e.g. $y = \\frac{k}{\\sqrt{x}}$). 2. Substitute the given pair $(x, y)$ to solve for $k$. 3. Write the full formula with your numeric $k$ and evaluate at the new value.',
      },
    ],
    workedExamples: [
      {
        title: 'Inverse square proportion (Extended)',
        question: '$y$ is inversely proportional to the square of $x$. When $x = 3$, $y = 8$. Find $y$ when $x = 6$.',
        marks: 3,
        steps: [
          'Write $y = \\frac{k}{x^2}$.',
          'Substitute $x = 3, y = 8$: $8 = \\frac{k}{9} \\implies k = 72$.',
          'When $x = 6$: $y = \\frac{72}{6^2} = \\frac{72}{36} = 2$.',
        ],
        answer: '$y = 2$',
        markSchemeNotes: 'M1 for $y = \\frac{k}{x^2}$, A1 for $k = 72$, A1 for $y = 2$.',
      },
    ],
    commonMistakes: [
      'Forgetting to square or take the square root of $x$ when translating wording like "square of $x$" or "square root of $x$".',
    ],
    quickCheck: {
      id: 'qc-2.8',
      prompt: '$P$ is directly proportional to $t^2$. When $t = 2$, $P = 20$. Find $P$ when $t = 5$.',
      answer: '125',
      numericAnswer: 125,
      tolerance: 0,
      hint: '$P = kt^2 \\implies 20 = 4k \\implies k = 5$.',
      solution: '$P = 5t^2 \\implies P = 5(5^2) = 125$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.9',
    chapterId: 2,
    code: '2.9',
    title: 'Graphs in practical situations',
    tier: 'Core & Extended',
    summary: 'Interpret and draw conversion graphs, distance–time graphs, and speed–time graphs (calculating acceleration and distance travelled).',
    coreObjectives: [
      'Interpret and use graphs in practical situations including travel graphs and conversion graphs.',
      'Draw graphs from given data.',
    ],
    extendedObjectives: [
      'Apply the idea of rate of change to easy kinematics involving distance–time and speed–time graphs, acceleration and deceleration.',
      'Calculate distance travelled as area under a speed–time graph.',
    ],
    keyFormulas: [
      { label: 'Distance–Time Graph', latex: '\\text{Gradient} = \\text{Speed}' },
      { label: 'Speed–Time Graph', latex: '\\text{Gradient} = \\text{Acceleration}, \\qquad \\text{Area under graph} = \\text{Distance}' },
    ],
    studyNotes: [
      {
        heading: 'Always check which graph is plotted!',
        body: 'Students frequently confuse Distance–Time and Speed–Time graphs. A horizontal line on a Distance–Time graph means STATIONARY ($v = 0$), whereas a horizontal line on a Speed–Time graph means CONSTANT SPEED (acceleration $= 0$). Break speed–time areas into triangles, rectangles, and trapeziums.',
      },
    ],
    workedExamples: [
      {
        title: 'Area under a speed–time graph (Extended)',
        question: 'A train accelerates uniformly from rest to $24\\text{ m/s}$ in $12\\text{ s}$, maintains $24\\text{ m/s}$ for $30\\text{ s}$, then decelerates uniformly to rest in $8\\text{ s}$. Calculate the total distance travelled.',
        marks: 3,
        steps: [
          'The shape is a trapezium with parallel sides $30\\text{ s}$ and $(12 + 30 + 8) = 50\\text{ s}$, and height $24\\text{ m/s}$.',
          'Area $= \\frac{1}{2}(30 + 50) \\times 24 = 40 \\times 24 = 960\\text{ m}$.',
        ],
        answer: '$960\\text{ m}$',
        markSchemeNotes: 'M1 for splitting into triangle + rectangle + triangle or trapezium, M1 for correct dimensions, A1 for $960$.',
      },
    ],
    commonMistakes: [
      'Reading speed off a distance–time graph without computing gradient, or forgetting the $\\frac{1}{2}$ in triangular areas.',
    ],
    quickCheck: {
      id: 'qc-2.9',
      prompt: 'On a speed–time graph, a car slows uniformly from $30\\text{ m/s}$ to $10\\text{ m/s}$ in $5\\text{ seconds}$. What is its deceleration in $\\text{m/s}^2$?',
      answer: '4',
      numericAnswer: 4,
      tolerance: 0,
      hint: 'Acceleration $= \\frac{10 - 30}{5} = -4\\text{ m/s}^2$. Deceleration is positive.',
      solution: 'Deceleration $= \\frac{30 - 10}{5} = 4\\text{ m/s}^2$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.10',
    chapterId: 2,
    code: '2.10',
    title: 'Graphs of functions',
    tier: 'Core & Extended',
    summary: 'Construct tables of values, plot linear, quadratic, cubic, reciprocal, and exponential graphs, estimate gradients via tangents, and solve equations graphically.',
    coreObjectives: [
      'Construct tables of values for functions of the form $ax + b$, $\\pm x^2 + ax + b$, $\\frac{a}{x}$ ($x \\neq 0$).',
      'Draw and interpret these graphs and solve linear and quadratic equations approximately by graphical methods.',
    ],
    extendedObjectives: [
      'Construct and plot cubic and exponential ($a^x$) graphs, draw tangents to estimate gradients, and solve $f(x) = g(x)$ by drawing an appropriate straight line.',
    ],
    keyFormulas: [
      { label: 'Graphical solution rearrangement', latex: '\\text{To solve } f(x) = 0 \\text{ using plotted } y = g(x), \\text{ draw } y = g(x) - f(x)' },
    ],
    studyNotes: [
      {
        heading: 'Solving a different equation using an existing graph',
        body: 'If you have plotted $y = x^2 - 3x + 1$ and need to solve $x^2 - 5x - 2 = 0$, rearrange the new equation so the left-hand side matches your plotted curve: $x^2 - 3x + 1 = 2x + 3$. Then draw the straight line $y = 2x + 3$ and read the $x$-coordinates of the intersection points!',
      },
    ],
    workedExamples: [
      {
        title: 'Matching a plotted curve to a new equation (Extended)',
        question: 'The graph of $y = x^2 + 2x - 5$ is drawn. State the equation of the straight line you should draw to solve $x^2 - x - 7 = 0$.',
        marks: 2,
        steps: [
          'Subtract the target equation from $y = x^2 + 2x - 5$, or isolate $x^2 + 2x - 5$:',
          '$x^2 + 2x - 5 = 3x + 2$.',
          'So draw $y = 3x + 2$.',
        ],
        answer: '$y = 3x + 2$',
        markSchemeNotes: 'M1 for $x^2 + 2x - 5 = 3x + 2$, A1 for $y = 3x + 2$.',
      },
    ],
    commonMistakes: [
      'Connecting quadratic or reciprocal points with straight ruler segments instead of a smooth curve.',
      'Drawing a line across the $x = 0$ asymptote of a reciprocal graph $y = \\frac{a}{x}$.',
    ],
    quickCheck: {
      id: 'qc-2.10',
      prompt: 'For $y = x^2 - 4x + 1$, what is the $y$-value when $x = -2$?',
      answer: '13',
      numericAnswer: 13,
      tolerance: 0,
      hint: '$(-2)^2 - 4(-2) + 1 = 4 + 8 + 1$.',
      solution: '$4 + 8 + 1 = 13$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.11',
    chapterId: 2,
    code: '2.11',
    title: 'Sketching curves',
    tier: 'Core & Extended',
    summary: 'Recognise and sketch linear, quadratic, cubic, and reciprocal curves with intercepts, turning points, and asymptotes.',
    coreObjectives: [
      'Recognise, sketch and interpret graphs of linear and quadratic functions.',
    ],
    extendedObjectives: [
      'Recognise, sketch and interpret cubic ($ax^3 + bx^2 + cx + d$), reciprocal ($\\frac{a}{x}, \\frac{a}{x^2}$), and exponential ($ka^x$) curves and identify asymptotes.',
    ],
    keyFormulas: [
      { label: 'Vertex from completed square', latex: 'y = (x - h)^2 + k \\implies \\text{Minimum at } (h, k)' },
    ],
    studyNotes: [
      {
        heading: 'What Cambridge expects on a sketch',
        body: 'A sketch does not need plotted grid squares, but MUST show: (1) correct overall shape and end behaviour, (2) all $x$-intercepts (roots) and $y$-intercept labelled clearly, (3) turning point coordinates (for quadratics), and (4) dashed asymptote lines if reciprocal or exponential.',
      },
    ],
    workedExamples: [
      {
        title: 'Turning point and intercepts of a quadratic',
        question: 'State the coordinates of the turning point and $y$-intercept of $y = (x - 3)^2 - 5$.',
        marks: 2,
        steps: [
          'Minimum occurs when $(x - 3)^2 = 0$, i.e. $x = 3$, giving $y = -5$. Turning point: $(3, -5)$.',
          '$y$-intercept when $x = 0$: $y = (-3)^2 - 5 = 4$. Intercept: $(0, 4)$.',
        ],
        answer: 'Turning point $(3, -5)$, $y$-intercept $(0, 4)$',
        markSchemeNotes: 'B1 for $(3, -5)$, B1 for $(0, 4)$.',
      },
    ],
    commonMistakes: [
      'Writing the turning point of $(x - 3)^2 - 5$ as $(-3, -5)$ instead of $(+3, -5)$.',
    ],
    quickCheck: {
      id: 'qc-2.11',
      prompt: 'For the curve $y = (x + 4)^2 - 9$, what is the $x$-coordinate of the minimum turning point?',
      answer: '-4',
      numericAnswer: -4,
      tolerance: 0,
      hint: 'Set $x + 4 = 0$.',
      solution: '$x + 4 = 0 \\implies x = -4$ (vertex is at $(-4, -9)$).',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.12',
    chapterId: 2,
    code: '2.12',
    title: 'Differentiation',
    tier: 'Extended',
    summary: 'Differentiate polynomials $ax^n$, find gradients and tangent/normal equations, and classify stationary points.',
    coreObjectives: [
      'Connect gradient of a curve to rate of change.',
    ],
    extendedObjectives: [
      'Estimate gradients of curves by drawing tangents.',
      'Use the derivatives of functions of the form $ax^n$ ($n$ a positive integer or zero), and simple sums of these.',
      'Apply differentiation to gradients and turning points (stationary points) and discriminate between maxima and minima.',
    ],
    keyFormulas: [
      { label: 'Power rule', latex: 'y = ax^n \\implies \\frac{\\mathrm{d}y}{\\mathrm{d}x} = anx^{n-1}' },
      { label: 'Stationary points', latex: '\\frac{\\mathrm{d}y}{\\mathrm{d}x} = 0' },
      { label: 'Second derivative test', latex: '\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} > 0 \\text{ (Minimum)}, \\qquad \\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} < 0 \\text{ (Maximum)}' },
    ],
    studyNotes: [
      {
        heading: 'Finding and classifying turning points (Derived function $\\mathrm{f}\'(x)$)',
        body: 'Both $\\frac{\\mathrm{d}y}{\\mathrm{d}x}$ and derived-function notation $\\mathrm{f}\'(x)$ represent the gradient function. Step 1: Differentiate to find $\\frac{\\mathrm{d}y}{\\mathrm{d}x}$. Step 2: Solve $\\frac{\\mathrm{d}y}{\\mathrm{d}x} = 0$ for stationary $x$-values. Step 3: Substitute back into the ORIGINAL $y$ equation to get the $y$-coordinates. Step 4: Use $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2}$ (or check gradient sign either side) to justify maximum vs minimum.',
      },
    ],
    workedExamples: [
      {
        title: 'Turning points of a cubic (Extended)',
        question: 'Find the coordinates of the stationary points of $y = x^3 - 3x^2 - 9x + 4$ and determine their nature.',
        marks: 5,
        steps: [
          'Differentiate: $\\frac{\\mathrm{d}y}{\\mathrm{d}x} = 3x^2 - 6x - 9$.',
          'Set to zero: $3(x^2 - 2x - 3) = 0 \\implies (x - 3)(x + 1) = 0 \\implies x = 3$ or $x = -1$.',
          'At $x = 3$: $y = 27 - 27 - 27 + 4 = -23$. At $x = -1$: $y = -1 - 3 + 9 + 4 = 9$.',
          'Second derivative: $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} = 6x - 6$. At $x = 3$, $+12 > 0$ (minimum); at $x = -1$, $-12 < 0$ (maximum).',
        ],
        answer: '$(-1, 9)$ Maximum, $(3, -23)$ Minimum',
        markSchemeNotes: 'M1 $\\frac{\\mathrm{d}y}{\\mathrm{d}x}$, M1 setting $=0$, A1 $(3,-23)$ and $(-1,9)$, M1A1 classifying.',
      },
    ],
    commonMistakes: [
      'Forgetting that the derivative of a constant is $0$, or writing $\\frac{\\mathrm{d}}{\\mathrm{d}x}(5x) = 0$ instead of $5$.',
      'Giving only $x$-values when the question asks for coordinates $(x, y)$.',
    ],
    quickCheck: {
      id: 'qc-2.12',
      prompt: 'For $y = 2x^3 - 6x + 5$, find the gradient of the curve at $x = 2$.',
      answer: '18',
      numericAnswer: 18,
      tolerance: 0,
      hint: '$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = 6x^2 - 6$. Substitute $x = 2$.',
      solution: '$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = 6(2)^2 - 6 = 24 - 6 = 18$.',
    },
    sandbox: 'geogebra-graph',
  },
  {
    id: '2.13',
    chapterId: 2,
    code: '2.13',
    title: 'Functions',
    tier: 'Extended',
    summary: 'Evaluate function notation $\\mathrm{f}(x)$, form composite functions $\\mathrm{fg}(x)$, and find inverse functions $\\mathrm{f}^{-1}(x)$.',
    coreObjectives: [
      'Evaluate linear algebraic expressions for given inputs.',
    ],
    extendedObjectives: [
      'Use function notation, e.g. $\\mathrm{f}(x) = 3x - 5$, $\\mathrm{f}: x \\mapsto 3x - 5$, and identify the domain (allowed inputs) and range (resulting outputs).',
      'Find inverse functions $\\mathrm{f}^{-1}(x)$ and form composite functions $\\mathrm{gf}(x) = \\mathrm{g}(\\mathrm{f}(x))$.',
    ],
    keyFormulas: [
      { label: 'Composite function order', latex: '\\mathrm{fg}(x) = \\mathrm{f}(\\mathrm{g}(x)) \\quad \\text{(apply } \\mathrm{g} \\text{ first, then } \\mathrm{f}\\text{)}' },
      { label: 'Inverse symmetry', latex: '\\mathrm{f}(\\mathrm{f}^{-1}(x)) = x' },
    ],
    studyNotes: [
      {
        heading: 'Three-step method for $\\mathrm{f}^{-1}(x)$ & excluded domain values',
        body: '1. Write $y = \\mathrm{f}(x)$. 2. Swap $x$ and $y$ (or rearrange directly for $x$). 3. Solve for $y$ and replace $y$ with $\\mathrm{f}^{-1}(x)$. Watch out for denominators ($\\frac{1}{x - 3} \\implies x \\neq 3$) or square roots ($\\sqrt{x} \\implies x \\ge 0$) when stating domain restrictions.',
      },
    ],
    workedExamples: [
      {
        title: 'Composite and inverse functions (Extended)',
        question: 'Given $\\mathrm{f}(x) = 2x - 3$ and $\\mathrm{g}(x) = x^2 + 1$, find (a) $\\mathrm{gf}(4)$ and (b) $\\mathrm{f}^{-1}(x)$.',
        marks: 4,
        steps: [
          '(a) Compute inner function first: $\\mathrm{f}(4) = 2(4) - 3 = 5$. Then $\\mathrm{g}(5) = 5^2 + 1 = 26$.',
          '(b) Let $y = 2x - 3$. Swap $x$ and $y$: $x = 2y - 3 \\implies 2y = x + 3 \\implies y = \\frac{x + 3}{2}$.',
          'Write $\\mathrm{f}^{-1}(x) = \\frac{x + 3}{2}$.',
        ],
        answer: '(a) $26$, (b) $\\mathrm{f}^{-1}(x) = \\frac{x + 3}{2}$',
        markSchemeNotes: 'B1 for $\\mathrm{f}(4)=5$, A1 for $26$, M1 for rearranging $y=2x-3$, A1 for $\\frac{x+3}{2}$.',
      },
    ],
    commonMistakes: [
      'Computing $\\mathrm{fg}(x)$ when asked for $\\mathrm{gf}(x)$ — always work from the inside (right) to the outside (left).',
      'Confusing $\\mathrm{f}^{-1}(x)$ with the reciprocal $\\frac{1}{\\mathrm{f}(x)}$.',
    ],
    quickCheck: {
      id: 'qc-2.13',
      prompt: 'If $\\mathrm{f}(x) = 3x + 2$ and $\\mathrm{g}(x) = x - 5$, calculate $\\mathrm{fg}(7)$.',
      answer: '8',
      numericAnswer: 8,
      tolerance: 0,
      hint: 'Find $\\mathrm{g}(7)$ first, then plug into $\\mathrm{f}$.',
      solution: '$\\mathrm{g}(7) = 7 - 5 = 2$, so $\\mathrm{f}(2) = 3(2) + 2 = 8$.',
    },
    sandbox: 'geogebra-graph',
  },
];
