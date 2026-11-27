import type { SubtopicNote } from '../../types/syllabus';

export const CHAPTER_11_NOTES_0606: SubtopicNote[] = [
  {
    id: '11.1',
    chapterId: 11,
    code: '11.1',
    title: 'Counting principles, factorials & permutations (ⁿPᵣ)',
    tier: 'Extended',
    summary:
      'Apply the multiplication and addition counting rules, use factorial notation $n!$ including $0! = 1$, and solve ordered arrangement problems ($^nP_r$) with restrictions such as grouped or separated items.',
    bigIdea:
      'A permutation counts arrangements where ORDER matters (e.g., codes, podium finishes, seating in a row). Whenever items must stay together, glue them into a single block first; whenever items must NOT sit together, place everything else first and drop them into the gaps.',
    keyFindings: [
      {
        title: 'Glue Method vs. Gap Method',
        finding:
          'Items TOGETHER: bundle the $k$ items into $1$ super-item, arrange all blocks, then multiply by $k!$ internal arrangements. Items SEPARATED (no two together): arrange the $m$ unconstrained items in $m!$ ways creating $m + 1$ gaps, then place the $k$ restricted items into those gaps in $^{m+1}P_k$ ways.',
        noteBox:
          'Do NOT subtract from the total when 3 or more items must all be separated ("no two next to each other") — subtracting "all together" only removes the case where ALL 3 are adjacent, leaving pairs adjacent! Always use the Gap Method for "no two together".',
      },
    ],
    stepByStepMethod: [
      'Check if order matters. If swapping two chosen items creates a different outcome (e.g., digits of a number, chairs in a line), use permutations ($^nP_r$).',
      'Always fill the MOST RESTRICTED positions first (e.g., first digit $\\ne 0$, last digit even, fixed ends).',
      'For grouped items, treat the group as one block and multiply by the internal permutations of the block.',
      'For separated items ("no two adjacent"), seat the other $m$ items first ($m!$ ways) and choose/arrange the separated items in the $m+1$ gaps ($^{m+1}P_k$).',
    ],
    rapidSummary: [
      { rule: 'Factorial & zero factorial', detail: '$n! = n(n-1)\\cdots 2 \\cdot 1$, with $0! = 1$.' },
      { rule: 'Permutations formula', detail: '$^nP_r = \\frac{n!}{(n - r)!}$ ways to arrange $r$ distinct items from $n$.' },
      { rule: 'No two together', detail: 'Seat $m$ others ($m!$) $\\times$ place $k$ items in $m+1$ gaps ($^{m+1}P_k$).' },
    ],
    coreObjectives: [
      'Recognise when a counting problem requires permutations (ordered arrangements).',
      'Know and use the notation $n!$ (including $0! = 1$) and $^nP_r = \\frac{n!}{(n-r)!}$.',
      'Solve arrangement problems in everyday or algebraic contexts with distinct items and restrictions (excluding repetition of objects and circular arrangements).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Factorial definition', latex: 'n! = n(n-1)(n-2)\\cdots 1, \\qquad 0! = 1' },
      { label: 'Permutations of r from n', latex: '^nP_r = \\frac{n!}{(n - r)!}' },
    ],
    studyNotes: [
      {
        heading: 'Permutations vs. Digit Restrictions',
        body: 'In Cambridge 0606 (2025–2027), all objects in permutation problems are distinct (no repeated identical letters or circular tables). When forming numbers from a set of digits, handle the most constrained position first:',
        bullets: [
          'Greater than a threshold (e.g., $> 4000$): fix the leading digit first.',
          'Even or odd numbers, or divisible by $5$: fix the units digit first.',
          'If BOTH leading digit AND units digit are constrained and share digits (e.g., even number $> 3000$ from $1, 2, 3, 4, 5$), split into mutually exclusive cases (e.g., Case 1: starts with even digit; Case 2: starts with odd digit) and add the counts.',
        ],
      },
      {
        heading: 'Algebraic Factorial Equations',
        body: 'Simplify ratios of factorials by expanding the larger factorial down to the smaller one until they cancel: for example, $\\frac{(n+1)!}{(n-1)!} = (n+1)n$.',
      },
    ],
    workedExamples: [
      {
        title: 'Mutually Exclusive Cases in Digit Permutations',
        question:
          'Find how many $4$-digit even numbers greater than $3000$ can be formed using the digits $1, 2, 3, 4, 5$ with no digit repeated.',
        marks: 4,
        steps: [
          'Split by whether the thousands digit is even ($4$) or odd ($3$ or $5$), because $4$ could also be used as the units digit.',
          'Case 1 (starts with $4$, 1 choice): units digit must be $2$ ($1$ choice); middle two digits chosen from remaining $3$ digits in $^3P_2 = 3 \\times 2 = 6$ ways $\\implies 1 \\times 6 \\times 1 = 6$.',
          'Case 2 (starts with $3$ or $5$, $2$ choices): units digit can be $2$ or $4$ ($2$ choices); middle two digits from remaining $3$ digits in $^3P_2 = 6$ ways $\\implies 2 \\times 6 \\times 2 = 24$.',
          'Total $= 6 + 24 = 30$.',
        ],
        answer: '$30$',
        markSchemeNotes: 'M1 for splitting into valid disjoint cases; A1 for Case 1 ($6$); A1 for Case 2 ($24$); A1 for total $30$.',
      },
      {
        title: 'Grouped & Separated Arrangements',
        question:
          '$4$ Maths books and $3$ Physics books (all different) are placed on a shelf. Find the number of arrangements if (a) all Physics books are together, and (b) no two Physics books are next to each other.',
        marks: 4,
        steps: [
          '(a) Bundle the $3$ Physics books as $1$ block. Together with $4$ Maths books there are $5$ items, giving $5! = 120$ ways. Inside the block, arrange the $3$ Physics books in $3! = 6$ ways. Total $= 5! \\times 3! = 720$.',
          '(b) Arrange the $4$ Maths books first in $4! = 24$ ways. This creates $5$ gaps: $\\_ M \\_ M \\_ M \\_ M \\_$.',
          'Place the $3$ Physics books in $3$ of the $5$ gaps in $^5P_3 = 5 \\times 4 \\times 3 = 60$ ways. Total $= 24 \\times 60 = 1440$.',
        ],
        answer: '(a) $720$, (b) $1440$',
        markSchemeNotes: 'B1 for $5! \\times 3!$, A1 for $720$; M1 for $4! \\times {}^5P_3$, A1 for $1440$.',
      },
    ],
    commonMistakes: [
      'Forgetting to multiply by $k!$ for the internal rearrangements inside a "together" block.',
      'Subtracting $5!3!$ from $7!$ to try to count "no two Physics books together" — that still allows two Physics books to sit side by side while the third is separated!',
      'Using $^nP_r$ when choices overlap between the first and last digit without splitting into disjoint cases.',
    ],
    coursebookTip:
      'Draw little boxes for each position (e.g. $[\\;\\;][\\;\\;][\\;\\;][\\;\\;]$) and write the number of available choices inside each box, starting with the most restricted box.',
    quickCheck: {
      id: '0606-11.1-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'How many $3$-digit even numbers with distinct digits can be formed from the digits $1, 2, 3, 4, 5$?',
      answer: '24',
      numericAnswer: 24,
      tolerance: 0,
      hint: 'Fill the units digit first ($2$ or $4$), then the hundreds and tens digits.',
      solution: 'Units digit has $2$ choices ($2$ or $4$). Hundreds digit has $4$ remaining choices, tens digit has $3$ remaining choices: $4 \\times 3 \\times 2 = 24$.',
    },
  },
  {
    id: '11.2',
    chapterId: 11,
    code: '11.2',
    title: 'Combinations (ⁿCᵣ) & restricted selections',
    tier: 'Extended',
    summary:
      'Use combinations $^nC_r = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$ when selecting unordered groups such as committees, teams, and hands, including "at least", "at most", and exclusion conditions.',
    bigIdea:
      'A combination counts selections where ORDER DOES NOT MATTER: choosing $\{A, B, C\}$ for a committee is identical to $\{C, B, A\}$, so we divide $^nP_r$ by $r!$ to remove duplicate orderings. Note that in 0606 (2025–2027), problems will NOT require combining both permutations and combinations in the same question.',
    keyFindings: [
      {
        title: 'Complementary Counting ("At Least One")',
        finding:
          'When asked for selections containing "at least one" of a group, it is often faster to compute $\\text{Total unrestricted} - \\text{None from that group}$ rather than adding multiple cases.',
      },
    ],
    stepByStepMethod: [
      'Confirm that order does not matter (keywords: select, choose, team, committee, group, hand).',
      'Split "at least $k$" or "at most $k$" into non-overlapping sub-cases, OR subtract the forbidden complement from $^N C_r$.',
      'Within a single case, MULTIPLY independent group choices (AND rule); across separate cases, ADD the totals (OR rule).',
      'For "two particular people cannot both be included", compute Total $-$ (Both included), or add (Neither) $+$ (Only A) $+$ (Only B).',
    ],
    comparisonTable: {
      title: 'Permutations vs. Combinations Quick Selector',
      headers: ['Feature', 'Permutation ($^nP_r$)', 'Combination ($^nC_r$)'],
      rows: [
        ['Does order matter?', 'Yes ($AB \\ne BA$)', 'No ($\\{A, B\\} = \\{B, A\\}$)'],
        ['Formula', '$\\frac{n!}{(n - r)!}$', '$\\frac{n!}{r!(n - r)!}$'],
        ['Typical words', 'arrange, line up, code, digits, 1st/2nd/3rd', 'choose, select, team, committee, subset'],
        ['Symmetry', 'No simple symmetry', '$^nC_r = {}^nC_{n-r}$, $^nC_0 = {}^nC_n = 1$'],
      ],
    },
    rapidSummary: [
      { rule: 'Combinations formula', detail: '$^nC_r = \\binom{n}{r} = \\frac{n!}{r!(n - r)!} = {}^nC_{n-r}$.' },
      { rule: 'AND vs OR rule', detail: 'Multiply across sub-choices within one valid team; add across distinct cases.' },
      { rule: 'Complement shortcut', detail: 'At least $1$ girl $= \\text{Total} - \\text{All boys}$.' },
    ],
    coreObjectives: [
      'Recognise the difference between permutations and combinations and know when each should be used.',
      'Know and use $^nC_r = \\frac{n!}{r!(n-r)!}$ and solve selection problems with restrictions (excluding mixed permutation + combination problems).',
    ],
    extendedObjectives: [],
    keyFormulas: [
      { label: 'Combinations formula', latex: '^nC_r = \\binom{n}{r} = \\frac{n!}{r!(n - r)!}' },
      { label: 'Symmetry & identity', latex: '^nC_r = {}^nC_{n-r}, \\qquad ^nC_1 = n, \\qquad ^nC_0 = 1' },
    ],
    studyNotes: [
      {
        heading: 'Solving Algebraic Equations with $^nC_r$',
        body: 'In algebraic problems such as $^nC_2 = 28$ or $^nC_3 = 4 \\cdot {}^nC_2$, rewrite $^nC_r$ explicitly in terms of $n$: $^nC_2 = \\frac{n(n-1)}{2}$ and $^nC_3 = \\frac{n(n-1)(n-2)}{6}$. Since $n \\ge r$ is a positive integer, reject any negative or non-integer root.',
      },
    ],
    workedExamples: [
      {
        title: 'Committee with "At Least" and Mutual Exclusion',
        question:
          'A team of $5$ is chosen from $6$ men and $4$ women. Find how many teams contain (a) at least $3$ women, and (b) at least $3$ women given that a particular man $M$ and a particular woman $W$ cannot both be in the team.',
        marks: 5,
        steps: [
          '(a) Valid cases for women + men: ($3W, 2M$) or ($4W, 1M$).',
          'Count $= {}^4C_3 \\times {}^6C_2 + {}^4C_4 \\times {}^6C_1 = 4 \\times 15 + 1 \\times 6 = 60 + 6 = 66$.',
          '(b) Subtract from $66$ the invalid teams from part (a) that contain BOTH $M$ and $W$: remaining slots require choosing $3$ more people with at least $2$ more women from $3$ remaining women and $5$ remaining men.',
          'Both $M$ and $W$ included with $\\ge 3$ women total: ($2W, 1M$ from remaining) $+ (3W, 0M$ from remaining) $= {}^3C_2 \\times {}^5C_1 + {}^3C_3 \\times {}^5C_0 = 3 \\times 5 + 1 \\times 1 = 16$.',
          'Valid teams $= 66 - 16 = 50$.',
        ],
        answer: '(a) $66$, (b) $50$',
        markSchemeNotes: 'M1 for splitting into 3W+2M and 4W+1M, A1 for 66; M1 for counting teams containing both M and W, A1 for 16, A1 for 50.',
      },
    ],
    commonMistakes: [
      'Double-counting "at least $1$ woman" by writing $^4C_1 \\times {}^9C_4$ — choosing $W_1$ first and $W_2$ in the remaining $4$ gives the exact same team as choosing $W_2$ first and $W_1$ in the remaining $4$! Always split into disjoint cases or use $\\text{Total} - \\text{None}$.',
      'Writing $^nP_r$ instead of $^nC_r$ for committee selections.',
    ],
    coursebookTip:
      'Always sanity-check your "at least 1" answer: make sure no two cases overlap. Splitting strictly by the exact count of women (e.g. $1W, 2W, 3W$) guarantees zero overlap.',
    quickCheck: {
      id: '0606-11.2-qc',
      marks: 2,
      paperType: 'Non-Calculator',
      prompt: 'A committee of $4$ students is chosen from $5$ boys and $4$ girls. How many committees contain exactly $2$ boys and $2$ girls?',
      answer: '60',
      numericAnswer: 60,
      tolerance: 0,
      hint: 'Multiply the number of ways to pick $2$ boys from $5$ by the ways to pick $2$ girls from $4$.',
      solution: '$^5C_2 \\times {}^4C_2 = 10 \\times 6 = 60$.',
    },
  },
];
