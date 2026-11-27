export type TierLevel = 'Core & Extended' | 'Extended';

export interface WorkedExample {
  title: string;
  question: string;
  marks: number;
  steps: string[];
  answer: string;
  markSchemeNotes: string;
}

export interface QuickCheckQuestion {
  id: string;
  paperCode?: string; // Only when verified verbatim from a real 0580 past paper
  questionNumber?: string; // e.g. 'Q4'
  marks?: number;
  paperType?: 'Non-Calculator' | 'Calculator';
  prompt: string;
  answer: string;
  acceptedAnswers?: string[];
  numericAnswer?: number;
  tolerance?: number;
  unit?: string;
  hint: string;
  solution: string;
}

export type SandboxType =
  | 'money-converter'
  | 'percentage-interest'
  | 'linear-graph'
  | 'quadratic-solver'
  | 'geogebra-graph'
  | 'trigonometry-triangle'
  | 'circle-theorems'
  | 'probability-tree'
  | 'mensuration-3d'
  | 'standard-form'
  | 'sequence-explorer'
  | 'none';

export interface CoursebookRef {
  unit: number; // Units 1–6 in Morrison & Hamshaw (2nd Ed.)
  unitTitle: string; // e.g. 'Unit 1: Number'
  chapter: number; // Chapters 1–24
  chapterTitle: string; // Exact Coursebook chapter title
  sections: string; // e.g. '1.7 Rounding numbers & 5.6 Estimation'
  editionNote?: string;
}

export interface KeyFindingItem {
  title: string;
  finding: string;
  noteBox?: string;
}

export interface SubtopicNote {
  id: string; // e.g. '1.16'
  chapterId: number; // e.g. 1
  code: string; // e.g. '1.16'
  title: string; // e.g. 'Money'
  tier: TierLevel;
  summary: string;
  aims?: string[];
  coursebookRef?: CoursebookRef;
  coursebookTip?: string;
  fastForward?: string;
  bigIdea?: string;
  keyFindings?: KeyFindingItem[];
  stepByStepMethod?: string[];
  coreObjectives: string[];
  extendedObjectives?: string[];
  keyFormulas: {
    label: string;
    latex: string;
    note?: string;
  }[];
  comparisonTable?: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  studyNotes: {
    heading: string;
    body: string;
    bullets?: string[];
    noteBox?: string;
  }[];
  workedExamples: WorkedExample[];
  commonMistakes: string[];
  rapidSummary?: {
    rule: string;
    detail: string;
  }[];
  quickCheck: QuickCheckQuestion;
  sandbox?: SandboxType;
}

export interface SyllabusChapter {
  id: number;
  title: string;
  description: string;
  subtopics: SubtopicNote[];
}

export interface PracticeQuestion {
  id: string;
  chapterId: number;
  topicId: string;
  topicTitle: string;
  tier: 'Core' | 'Extended';
  paperType: 'Non-Calculator' | 'Calculator';
  marks: number;
  sourceRef: string; // e.g. '0580/22/M/J/24 Q7'
  question: string;
  questionType: 'numeric' | 'mcq' | 'text';
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  numericAnswer?: number;
  tolerance?: number;
  unit?: string;
  markScheme: {
    code: string; // e.g. 'M1', 'A1', 'B1'
    detail: string;
  }[];
  fullSolution: string;
}

export interface PastPaperSession {
  slug: string; // e.g. '2024-may-june'
  label: string; // e.g. 'May / June 2024'
  year: number;
  series: 'March' | 'May/June' | 'Oct/Nov' | 'Topical' | 'Specimen';
  url: string;
}

export interface PastPaperFile {
  filename: string;
  docType: 'QP' | 'MS' | 'ER' | 'GT' | 'IN' | 'OTHER';
  docTypeLabel: string;
  paperNumber: string; // '1', '2', '3', '4', or '-'
  variant: string; // '1', '2', '3', or '-'
  tier: 'Core' | 'Extended' | 'All';
  url: string;
  sessionSlug: string;
}

export type SubjectCode = '0580' | '0606';

export interface TopicalPaperPack {
  id: string;
  order: number;
  title: string;
  chapterId: number;
  topicIds: string[];
  paperMode: 'Non-Calc' | 'Calc' | 'Mixed';
  questionsUrl: string;
  answersUrl?: string;
  questionsFilename: string;
  answersFilename?: string;
}

export type AppRoute =
  | { view: 'notes'; subject?: SubjectCode; chapterId: number; topicId: string }
  | { view: 'past-papers'; subject?: SubjectCode; sessionSlug?: string; paperFilename?: string }
  | { view: 'practice'; subject?: SubjectCode; mode?: string; topicId?: string; topicalPackId?: string };
