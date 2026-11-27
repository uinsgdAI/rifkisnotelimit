import type { SubtopicNote, SyllabusChapter } from '../types/syllabus';
import { CHAPTER_1_NOTES_0606 } from './notes0606/chapter1';
import { CHAPTER_2_NOTES_0606 } from './notes0606/chapter2';
import { CHAPTER_3_NOTES_0606 } from './notes0606/chapter3';
import { CHAPTER_4_NOTES_0606 } from './notes0606/chapter4';
import { CHAPTER_5_NOTES_0606 } from './notes0606/chapter5';
import { CHAPTER_6_NOTES_0606 } from './notes0606/chapter6';
import { CHAPTER_7_NOTES_0606 } from './notes0606/chapter7';
import { CHAPTER_8_NOTES_0606 } from './notes0606/chapter8';
import { CHAPTER_9_NOTES_0606 } from './notes0606/chapter9';
import { CHAPTER_10_NOTES_0606 } from './notes0606/chapter10';
import { CHAPTER_11_NOTES_0606 } from './notes0606/chapter11';
import { CHAPTER_12_NOTES_0606 } from './notes0606/chapter12';
import { CHAPTER_13_NOTES_0606 } from './notes0606/chapter13';
import { CHAPTER_14_NOTES_0606 } from './notes0606/chapter14';

export const SYLLABUS_0606: SyllabusChapter[] = [
  {
    id: 1,
    title: 'Functions',
    description:
      'Mappings, domain and range, one-to-one functions, inverse functions, composite functions, and modulus graphs.',
    subtopics: CHAPTER_1_NOTES_0606,
  },
  {
    id: 2,
    title: 'Quadratic functions',
    description:
      'Completing the square, maximum and minimum values, the discriminant b² - 4ac, and quadratic inequalities.',
    subtopics: CHAPTER_2_NOTES_0606,
  },
  {
    id: 3,
    title: 'Factors of polynomials',
    description:
      'Remainder theorem, factor theorem, polynomial division, and factorising or solving cubic equations.',
    subtopics: CHAPTER_3_NOTES_0606,
  },
  {
    id: 4,
    title: 'Equations, inequalities and graphs',
    description:
      'Modulus equations and inequalities, hidden quadratics via substitution, cubic graphs, and graphical solutions.',
    subtopics: CHAPTER_4_NOTES_0606,
  },
  {
    id: 5,
    title: 'Simultaneous equations',
    description:
      'Solving simultaneous equations in two unknowns where one is linear and one is quadratic or non-linear.',
    subtopics: CHAPTER_5_NOTES_0606,
  },
  {
    id: 6,
    title: 'Logarithmic and exponential functions',
    description:
      'Properties and asymptotes of ln x and e^x, laws of logarithms, change of base, and exponential equations.',
    subtopics: CHAPTER_6_NOTES_0606,
  },
  {
    id: 7,
    title: 'Straight-line graphs',
    description:
      'Midpoints, perpendicular bisectors, and transforming non-linear laws into straight-line form Y = mX + c.',
    subtopics: CHAPTER_7_NOTES_0606,
  },
  {
    id: 8,
    title: 'Coordinate geometry of the circle',
    description:
      'Standard and general circle equations, line-circle intersections, tangents, and intersecting or touching circles (2025–2027).',
    subtopics: CHAPTER_8_NOTES_0606,
  },
  {
    id: 9,
    title: 'Circular measure',
    description:
      'Radian measure, arc length s = rθ, sector area A = ½r²θ, segments, and compound circular regions.',
    subtopics: CHAPTER_9_NOTES_0606,
  },
  {
    id: 10,
    title: 'Trigonometry',
    description:
      'Six trigonometric functions, exact values, amplitude and period of graphs, Pythagorean identities, and solving trig equations.',
    subtopics: CHAPTER_10_NOTES_0606,
  },
  {
    id: 11,
    title: 'Permutations and combinations',
    description:
      'Factorial notation (0! = 1), counting principles, ordered arrangements (^nP_r), and unordered selections (^nC_r).',
    subtopics: CHAPTER_11_NOTES_0606,
  },
  {
    id: 12,
    title: 'Series',
    description:
      'Binomial expansion of (a + b)^n, general term, arithmetic progressions (AP), and geometric progressions (GP) including S_∞.',
    subtopics: CHAPTER_12_NOTES_0606,
  },
  {
    id: 13,
    title: 'Vectors in two dimensions',
    description:
      'Column and i/j vectors, position and unit vectors, equating components, vector geometry, and resultant velocities.',
    subtopics: CHAPTER_13_NOTES_0606,
  },
  {
    id: 14,
    title: 'Calculus',
    description:
      'Differentiation (chain, product, quotient, trig, e^x, ln x), stationary points, connected rates, integration, plane areas, and kinematics.',
    subtopics: CHAPTER_14_NOTES_0606,
  },
];

export const ALL_SUBTOPICS_0606: SubtopicNote[] = SYLLABUS_0606.flatMap((c) => c.subtopics);
