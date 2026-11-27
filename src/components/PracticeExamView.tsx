import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Play,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type {
  AppRoute,
  PracticeQuestion,
  SubjectCode,
  SyllabusChapter,
} from '../types/syllabus';
import {
  estimateCambridgeGrade,
  extractWeakTopicsFromResults,
  formatCountdown,
  gradeStudentAnswer,
  resolvePracticeSection,
} from '../utils/examLogic';
import {
  generateMockExamQuestions,
  type MockPaperMode,
} from '../utils/questionGenerator';
import type { MockPaperMode0606 } from '../utils/questionGenerator0606';
import { MathText } from './MathText';
import { getActiveSubjectVfxVariant, triggerSakugaBurst } from '../utils/sakugaVfx';

const TopicalPastPapersSection = lazy(() =>
  import('./TopicalPastPapersSection').then((m) => ({
    default: m.TopicalPastPapersSection,
  }))
);

type CombinedPracticeMode = MockPaperMode | MockPaperMode0606;
type Generator0606Module = typeof import('../utils/questionGenerator0606');

interface PracticeExamViewProps {
  subject: SubjectCode;
  syllabus: SyllabusChapter[];
  initialMode?: string;
  initialTopicId?: string;
  initialTopicalPackId?: string;
  navNonce?: number;
  onOpenFormulaSheet: () => void;
  onFlagWeakTopics?: (topicIds: string[]) => void;
  onNavigate: (route: AppRoute) => void;
}

interface PresetMetadata {
  id: string;
  mode: CombinedPracticeMode;
  title: string;
  subtitle: string;
  tier: 'Core' | 'Extended';
  badgeLabel: string;
  durationSeconds: number;
  questionCountLabel: string;
  formatLabel: string;
  isFeatured?: boolean;
}

interface ActiveExamSession {
  id: string;
  mode: CombinedPracticeMode;
  title: string;
  subtitle: string;
  tier: 'Core' | 'Extended';
  durationSeconds: number;
  attemptNumber: number;
  chapterId?: number | 'all';
  topicId?: string;
  questions: PracticeQuestion[];
}

function getQuestionFormatLabel(questionType: PracticeQuestion['questionType']): string {
  if (questionType === 'mcq') return 'Multiple Choice';
  if (questionType === 'text') return 'Exact Fraction / Value';
  return 'Numeric Answer';
}

export const PracticeExamView: React.FC<PracticeExamViewProps> = ({
  subject,
  syllabus,
  initialMode,
  initialTopicId,
  initialTopicalPackId,
  navNonce = 0,
  onOpenFormulaSheet,
  onFlagWeakTopics,
  onNavigate,
}) => {
  const activeSection = resolvePracticeSection(initialMode, initialTopicalPackId);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'all'>('all');
  const [activeExam, setActiveExam] = useState<ActiveExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [gen0606Mod, setGen0606Mod] = useState<Generator0606Module | null>(null);

  // Track prompt signatures already seen across retries in this session so "Retry with New Questions" stays fresh
  const seenSignaturesRef = useRef<Set<string>>(new Set());
  const handledRouteKeyRef = useRef<string>('');

  useEffect(() => {
    setActiveExam(null);
    setSelectedChapterFilter('all');
    handledRouteKeyRef.current = '';
  }, [subject]);

  // Lazily import 0606 practice engine ONLY when subject === '0606'
  useEffect(() => {
    if (subject !== '0606' || gen0606Mod) return;
    let cancelled = false;
    import('../utils/questionGenerator0606')
      .then((mod) => {
        if (!cancelled) {
          setGen0606Mod(mod);
        }
      })
      .catch(() => {
        // Ignore transient chunk load error; user can retry navigation
      });
    return () => {
      cancelled = true;
    };
  }, [subject, gen0606Mod]);

  const presets: PresetMetadata[] = useMemo(() => {
    if (subject === '0606') {
      return [
        {
          id: 'mock-0606-p1',
          mode: 'mock-0606-p1',
          title: 'Paper 1 — 0606 Non-Calculator Mock',
          subtitle:
            '2025–2027 Paper 1 Non-Calculator format covering Functions, Quadratics, Polynomials, Logs, Circle Geometry, Trig, Counting, Binomial & Calculus.',
          tier: 'Extended',
          badgeLabel: 'Paper 1 Non-Calc',
          durationSeconds: 30 * 60,
          questionCountLabel: '8 Qs · ~22 marks · 30 min',
          formatLabel: 'MCQ + Exact Values + Numeric',
        },
        {
          id: 'mock-0606-p2',
          mode: 'mock-0606-p2',
          title: 'Paper 2 — 0606 Calculator Mock',
          subtitle:
            '2025–2027 Paper 2 Scientific Calculator format featuring Exponential Equations, Linear Law, Circular Measure, Trig Equations, GP Sums & Kinematics.',
          tier: 'Extended',
          badgeLabel: 'Paper 2 Calculator',
          durationSeconds: 30 * 60,
          questionCountLabel: '8 Qs · ~24 marks · 30 min',
          formatLabel: 'Multi-Mark Calculator Problems',
        },
        {
          id: 'mock-0606-full',
          mode: 'mock-0606-full',
          title: 'Complete 0606 Multi-Format Assessment',
          subtitle:
            '12 fresh problems spanning all 14 official Additional Mathematics chapters (Paper 1 + Paper 2) with instant Cambridge A*–E grading.',
          tier: 'Extended',
          badgeLabel: 'Full 0606 Suite',
          durationSeconds: 45 * 60,
          questionCountLabel: '12 Qs · ~35 marks · 45 min',
          formatLabel: 'All 14 Chapters · Fresh on Every Retry',
          isFeatured: true,
        },
      ];
    }

    return [
      {
        id: 'mock-core-p1',
        mode: 'mock-core-p1',
        title: 'Paper 1 — Core Non-Calculator Mock',
        subtitle:
          'Mixed Multiple Choice, Numeric & Fraction drill on Number, HCF/LCM, Simultaneous Equations, Polygon Angles, and Probability.',
        tier: 'Core',
        badgeLabel: 'Core Tier',
        durationSeconds: 18 * 60,
        questionCountLabel: '8 Qs · ~18 marks · 18 min',
        formatLabel: 'MCQ + Numeric + Fractions',
      },
      {
        id: 'mock-core-p3',
        mode: 'mock-core-p3',
        title: 'Paper 3 — Core Calculator Mock',
        subtitle:
          'Calculator practice featuring Currency Conversions, Ratio Sharing, Sector Area, Pythagoras, and Pie Chart angles.',
        tier: 'Core',
        badgeLabel: 'Core Tier',
        durationSeconds: 22 * 60,
        questionCountLabel: '8 Qs · ~20 marks · 22 min',
        formatLabel: 'MCQ + Numeric',
      },
      {
        id: 'mock-ext-p2',
        mode: 'mock-ext-p2',
        title: 'Paper 2 — Extended Non-Calculator Mock',
        subtitle:
          '2025–2027 Paper 2 format covering Surds, Fractional Indices, Quadratic Sequences, Differentiation, Vectors & Circle Theorems.',
        tier: 'Extended',
        badgeLabel: 'Extended Tier',
        durationSeconds: 25 * 60,
        questionCountLabel: '8 Qs · ~21 marks · 25 min',
        formatLabel: 'MCQ + Exact Fractions + Numeric',
      },
      {
        id: 'mock-ext-p4',
        mode: 'mock-ext-p4',
        title: 'Paper 4 — Extended Calculator Mock',
        subtitle:
          'Structured multi-mark problems: Bounds, Reverse %, Inverse Proportion, Cosine Rule, Cones, Conditional Probability & Histograms.',
        tier: 'Extended',
        badgeLabel: 'Extended Tier',
        durationSeconds: 30 * 60,
        questionCountLabel: '8 Qs · ~23 marks · 30 min',
        formatLabel: 'MCQ + Exact Fractions + Numeric',
      },
      {
        id: 'mock-full',
        mode: 'mock-full',
        title: 'Complete 0580 Multi-Format Assessment',
        subtitle:
          '12 fresh problems spanning all 9 chapters in MCQ, Numeric, and Exact Fraction formats with instant Cambridge A*–G grading.',
        tier: 'Extended',
        badgeLabel: 'Extended Tier',
        durationSeconds: 40 * 60,
        questionCountLabel: '12 Qs · ~31 marks · 40 min',
        formatLabel: 'All 3 Question Types · Fresh on Every Retry',
        isFeatured: true,
      },
    ];
  }, [subject]);

  const launchGeneratedSession = useCallback(
    (config: {
      id: string;
      mode: CombinedPracticeMode;
      title: string;
      subtitle: string;
      tier: 'Core' | 'Extended';
      durationSeconds: number;
      attemptNumber: number;
      chapterId?: number | 'all';
      topicId?: string;
    }) => {
      if (subject === '0606') {
        if (!gen0606Mod) return;
        const generated = gen0606Mod.generate0606MockQuestions({
          mode: config.mode as MockPaperMode0606,
          attemptNumber: config.attemptNumber,
          chapterId: config.chapterId,
          topicId: config.topicId,
          avoidSignatures: seenSignaturesRef.current,
        });

        for (const sig of generated.signatures) {
          seenSignaturesRef.current.add(sig);
        }

        setActiveExam({
          ...config,
          tier: 'Extended',
          questions: generated.questions,
        });
        setAnswers({});
        setCurrentIdx(0);
        setSecondsLeft(config.durationSeconds);
        setSubmitted(false);
        setShowWrongOnly(false);
        return;
      }

      const generated = generateMockExamQuestions({
        mode: config.mode as MockPaperMode,
        attemptNumber: config.attemptNumber,
        chapterId: config.chapterId,
        topicId: config.topicId,
        avoidSignatures: seenSignaturesRef.current,
      });

      for (const sig of generated.signatures) {
        seenSignaturesRef.current.add(sig);
      }

      const resolvedTier: 'Core' | 'Extended' =
        config.mode === 'topical'
          ? generated.questions.some((q) => q.tier === 'Extended')
            ? 'Extended'
            : 'Core'
          : config.tier;

      setActiveExam({
        ...config,
        tier: resolvedTier,
        questions: generated.questions,
      });
      setAnswers({});
      setCurrentIdx(0);
      setSecondsLeft(config.durationSeconds);
      setSubmitted(false);
      setShowWrongOnly(false);
    },
    [subject, gen0606Mod]
  );

  const startPreset = useCallback(
    (preset: PresetMetadata) => {
      launchGeneratedSession({
        id: preset.id,
        mode: preset.mode,
        title: preset.title,
        subtitle: preset.subtitle,
        tier: preset.tier,
        durationSeconds: preset.durationSeconds,
        attemptNumber: 1,
      });
    },
    [launchGeneratedSession]
  );

  const retakeExactExam = (exam: ActiveExamSession) => {
    setActiveExam(exam);
    setAnswers({});
    setCurrentIdx(0);
    setSecondsLeft(exam.durationSeconds);
    setSubmitted(false);
    setShowWrongOnly(false);
  };

  const retryWithNewQuestions = () => {
    if (!activeExam) return;
    launchGeneratedSession({
      id: activeExam.id,
      mode: activeExam.mode,
      title: activeExam.title,
      subtitle: activeExam.subtitle,
      tier: activeExam.tier,
      durationSeconds: activeExam.durationSeconds,
      attemptNumber: activeExam.attemptNumber + 1,
      chapterId: activeExam.chapterId,
      topicId: activeExam.topicId,
    });
  };

  const startChapterDrill = useCallback(
    (chapterId: number | 'all', attemptNumber = 1) => {
      const chTitle =
        chapterId === 'all'
          ? `All ${syllabus.length} Chapters`
          : `Chapter ${chapterId}: ${syllabus.find((c) => c.id === chapterId)?.title || ''}`;
      launchGeneratedSession({
        id: `chapter-${subject}-${chapterId}`,
        mode: 'topical',
        title: `Topical Practice — ${chTitle}`,
        subtitle: `Fresh multi-format Cambridge ${subject} problems with M1/A1/B1 mark schemes`,
        tier: 'Extended',
        durationSeconds: chapterId === 'all' ? 24 * 60 : 15 * 60,
        attemptNumber,
        chapterId,
      });
    },
    [launchGeneratedSession, syllabus, subject]
  );

  useEffect(() => {
    if (
      initialTopicalPackId ||
      initialMode === 'topical-paper' ||
      initialMode === 'practice-test'
    ) {
      setActiveExam(null);
      handledRouteKeyRef.current = '';
      return;
    }
    const routeKey = `${subject}:${initialMode || ''}:${initialTopicId || ''}`;
    if (!initialMode) {
      handledRouteKeyRef.current = '';
      return;
    }
    if (subject === '0606' && !gen0606Mod) {
      // Wait for lazy 0606 generator chunk to finish loading
      return;
    }
    if (handledRouteKeyRef.current === routeKey) return;
    handledRouteKeyRef.current = routeKey;

    if (initialMode === 'topical' && initialTopicId) {
      const fallbackChapter = Number(initialTopicId.split('.')[0]) || 1;
      launchGeneratedSession({
        id: `topical-${subject}-${initialTopicId}`,
        mode: 'topical',
        title: `Topical Practice — Syllabus ${initialTopicId}`,
        subtitle: `Focused Cambridge ${subject} questions aligned to Topic ${initialTopicId} & Chapter ${fallbackChapter}`,
        tier: 'Extended',
        durationSeconds: 15 * 60,
        attemptNumber: 1,
        chapterId: fallbackChapter,
        topicId: initialTopicId,
      });
    } else if (initialMode === 'mock-extended') {
      const targetId = subject === '0606' ? 'mock-0606-p1' : 'mock-ext-p2';
      const ext = presets.find((p) => p.id === targetId);
      if (ext) startPreset(ext);
    } else {
      const matchingPreset = presets.find((p) => p.id === initialMode || p.mode === initialMode);
      if (matchingPreset) startPreset(matchingPreset);
    }
  }, [
    subject,
    gen0606Mod,
    initialMode,
    initialTopicId,
    initialTopicalPackId,
    navNonce,
    presets,
    launchGeneratedSession,
    startPreset,
  ]);

  useEffect(() => {
    if (!activeExam || submitted) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeExam, submitted]);

  useEffect(() => {
    if (!submitted || !activeExam || !onFlagWeakTopics) return;
    const wrongTopicIds = activeExam.questions
      .filter((q) => !gradeStudentAnswer(answers[q.id] || '', q).isCorrect)
      .map((q) => q.topicId);
    if (wrongTopicIds.length > 0) {
      onFlagWeakTopics(wrongTopicIds);
    }
  }, [submitted, activeExam, answers, onFlagWeakTopics]);

  const previewQuestionCount = useMemo(() => {
    if (subject === '0606') {
      if (!gen0606Mod) return 4;
      return gen0606Mod.generate0606MockQuestions({
        mode: 'topical',
        attemptNumber: 1,
        chapterId: selectedChapterFilter,
      }).questions.length;
    }
    return generateMockExamQuestions({
      mode: 'topical',
      attemptNumber: 1,
      chapterId: selectedChapterFilter,
    }).questions.length;
  }, [subject, gen0606Mod, selectedChapterFilter]);

  if (!activeExam) {
    if (subject === '0606' && !gen0606Mod && activeSection === 'practice-test') {
      return (
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="p-8 sk-card text-center text-xs font-semibold text-[var(--sk-dim)]">
            Loading 0606 Additional Mathematics practice engine...
          </div>
        </main>
      );
    }

    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Topical Section Switcher (matches Topical nav dropdown: Practice Test & Topical Paper) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Topical section view"
            className="inline-flex sk-tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'practice-test'}
              data-active={activeSection === 'practice-test'}
              onClick={() => onNavigate({ view: 'practice', subject, mode: 'practice-test' })}
              className="px-4 py-1.5 text-xs font-bold cursor-pointer whitespace-nowrap sk-tab"
            >
              Practice Test
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'topical-paper'}
              data-active={activeSection === 'topical-paper'}
              onClick={() => onNavigate({ view: 'practice', subject, mode: 'topical-paper' })}
              className="px-4 py-1.5 text-xs font-bold cursor-pointer whitespace-nowrap sk-tab"
            >
              Topical Paper
            </button>
          </div>
          <span className="text-xs text-[var(--sk-dim)]">
            {activeSection === 'practice-test'
              ? `Timed ${subject} Mock Exams & Auto-Graded Chapter Drills`
              : subject === '0606'
                ? '14 Annotatable PapaCambridge 0606 Topical PDFs'
                : '78 Annotatable Topical Question & Worked Solution PDFs'}
          </span>
        </div>

        {activeSection === 'practice-test' ? (
          <div className="space-y-8">
            <section className="p-6 sk-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--sk-dim)] mb-1">
                  {subject === '0606'
                    ? 'Cambridge IGCSE Additional Mathematics (0606) · 2025–2027 Syllabus'
                    : 'Cambridge IGCSE Mathematics (0580) · Timed Exam & Topical Drills'}
                </div>
                <h1 className="font-display text-2xl font-bold text-[var(--sk-ink)]">
                  IGCSE {subject} Practice Tests
                </h1>
                <p className="text-sm text-[var(--sk-body)] mt-1 max-w-2xl">
                  {subject === '0606'
                    ? 'Practise Paper 1 (Non-Calculator) and Paper 2 (Calculator) style Additional Mathematics questions across all 14 chapters with M1/A1/B1 mark schemes and Cambridge A*–E grading.'
                    : 'Practise with Multiple Choice, Numeric, and Exact Fraction questions under Non-Calculator (Papers 1/2) or Calculator (Papers 3/4) rules. Every retry generates fresh questions with new numbers and scenarios.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenFormulaSheet}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold sk-btn-secondary cursor-pointer shrink-0 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-[var(--sk-pri)]" />
                View {subject} Formula Sheet
              </button>
            </section>

            {/* Timed Mock Exam Presets */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                  Timed IGCSE {subject} Mock Papers
                </h2>
                <span className="text-xs text-[var(--sk-dim)]">
                  Unlimited retries — every retake swaps in fresh question variants
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <article
                    key={preset.id}
                    className={`p-5 flex flex-col justify-between gap-4 ${
                      preset.isFeatured
                        ? 'md:col-span-2 lg:col-span-3 sk-card-accent'
                        : 'sk-card'
                    }`}
                  >
                    <div className="space-y-2">
                      <div
                        className={`flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--sk-dim)] ${
                          preset.isFeatured ? 'items-center justify-between' : 'flex-col'
                        }`}
                      >
                        <span
                          className={
                            preset.tier === 'Extended'
                              ? 'text-[var(--sk-acc-ink)] font-bold'
                              : 'text-[var(--sk-ink)] font-bold'
                          }
                        >
                          {preset.badgeLabel} · {preset.formatLabel}
                        </span>
                        <span className="font-mono tabular-nums">{preset.questionCountLabel}</span>
                      </div>
                      <h3 className="font-display text-base font-bold text-[var(--sk-ink)]">
                        {preset.title}
                      </h3>
                      <p className="text-xs text-[var(--sk-body)] leading-relaxed">{preset.subtitle}</p>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'GO!');
                          startPreset(preset);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold sk-btn-primary cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Begin Paper
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Topical Practice Builder */}
            <section className="p-6 sk-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                    Topical Practice by Syllabus Chapter
                  </h2>
                  <p className="text-xs text-[var(--sk-dim)] mt-0.5">
                    Target any chapter from the {subject} curriculum with non-repeating variants
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    triggerSakugaBurst(e, getActiveSubjectVfxVariant('accent'), 'DRILL!');
                    startChapterDrill(selectedChapterFilter, 1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold sk-btn-ink cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Drill ({previewQuestionCount} Fresh Questions)
                </button>
              </div>

              <div
                role="tablist"
                aria-label="Filter practice drill by chapter"
                className="flex flex-wrap gap-1.5 sk-tabs"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedChapterFilter === 'all'}
                  data-active={selectedChapterFilter === 'all'}
                  onClick={() => setSelectedChapterFilter('all')}
                  className="px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
                >
                  All Chapters
                </button>
                {syllabus.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedChapterFilter === ch.id}
                    data-active={selectedChapterFilter === ch.id}
                    onClick={() => setSelectedChapterFilter(ch.id)}
                    className="px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
                  >
                    {ch.id}. {ch.title}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Topical Past Papers (0580 Q+Ans + 0606 PapaCambridge Annotatable PDFs) */
          <Suspense
            fallback={
              <div className="p-8 sk-card text-center text-xs text-[var(--sk-dim)]">
                Loading {subject} topical PDF packs...
              </div>
            }
          >
            <TopicalPastPapersSection
              subject={subject}
              syllabus={syllabus}
              selectedChapterFilter={selectedChapterFilter}
              initialPackId={initialTopicalPackId}
              onNavigate={onNavigate}
            />
          </Suspense>
        )}
      </main>
    );
  }

  // Active Exam or Results View
  const currentQ = activeExam.questions[currentIdx];
  const totalMarks = activeExam.questions.reduce((acc, q) => acc + q.marks, 0);
  const scoredResults = activeExam.questions.map((q, qIdx) => {
    const userVal = answers[q.id] || '';
    const graded = gradeStudentAnswer(userVal, q);
    return {
      question: q,
      questionNumber: qIdx + 1,
      userVal,
      isCorrect: graded.isCorrect,
      isPartial: graded.isPartial,
      matchReason: graded.matchReason,
      marksEarned: graded.marksEarned,
    };
  });
  const earnedMarks = scoredResults.reduce((acc, r) => acc + r.marksEarned, 0);
  const gradeInfo = estimateCambridgeGrade(earnedMarks, totalMarks, activeExam.tier, subject);
  const weakTopics = extractWeakTopicsFromResults(scoredResults, syllabus);
  const wrongCount = scoredResults.filter((r) => !r.isCorrect).length;
  const visibleResults = showWrongOnly
    ? scoredResults.filter((r) => !r.isCorrect)
    : scoredResults;
  const answeredCount = activeExam.questions.filter((q) => Boolean((answers[q.id] || '').trim())).length;
  const progressPct = Math.round((answeredCount / Math.max(1, activeExam.questions.length)) * 100);

  if (submitted) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="p-6 sk-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs text-[var(--sk-dim)]">
              {activeExam.title} · Attempt #{activeExam.attemptNumber} ·{' '}
              {subject === '0606' ? '0606 (A*–E Grading)' : `${activeExam.tier} Tier Grading`}
            </div>
            <h1 className="font-display text-2xl font-bold text-[var(--sk-ink)]">
              Examination Results &amp; Mark Scheme
            </h1>
            <p className="text-sm text-[var(--sk-body)]">{gradeInfo.descriptor}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-xs text-[var(--sk-dim)]">Total Score</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-[var(--sk-ink)]">
                {earnedMarks} / {totalMarks}{' '}
                <span className="text-sm font-normal text-[var(--sk-dim)]">
                  ({gradeInfo.percentage}%)
                </span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[var(--sk-surface)] border-2 border-[var(--sk-ink)] shadow-[3px_3px_0_var(--sk-ring)] text-center">
              <div className="text-[11px] font-semibold text-[var(--sk-pri)]">Est. Grade</div>
              <div className="font-display text-2xl font-extrabold text-[var(--sk-ink)]">
                {gradeInfo.grade}
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Recommended Notes Panel */}
        {weakTopics.length > 0 ? (
          <section
            aria-label="Topics to Revise Based on Wrong Answers"
            className="p-6 rounded-[18px] bg-white border-2 border-[var(--sk-acc)] shadow-[4px_5px_0_var(--sk-acc-line)] space-y-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                  Topics to Study Based on Your Wrong Answers
                </h2>
                <p className="text-xs text-[var(--sk-body)] mt-0.5">
                  You missed {wrongCount} {wrongCount === 1 ? 'question' : 'questions'} across{' '}
                  {weakTopics.length} syllabus {weakTopics.length === 1 ? 'topic' : 'topics'}. Jump directly to the corresponding {subject} study notes to fix each gap:
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {weakTopics.map((wt) => (
                <div
                  key={wt.topicId}
                  className="p-4 sk-card-soft flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[var(--sk-dim)]">
                      Chapter {wt.chapterId}: {wt.chapterTitle}
                    </div>
                    <div className="font-display text-sm font-bold text-[var(--sk-ink)] truncate">
                      <span className="font-mono text-[var(--sk-pri)] mr-1.5">{wt.topicId}</span>
                      {wt.topicTitle}
                    </div>
                    <div className="text-xs font-mono font-semibold text-[var(--sk-acc-ink)] mt-0.5 tabular-nums">
                      {wt.marksLost} {wt.marksLost === 1 ? 'mark' : 'marks'} missed
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        view: 'notes',
                        subject,
                        chapterId: wt.chapterId,
                        topicId: wt.topicId,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold sk-btn-primary cursor-pointer shrink-0"
                  >
                    Study {wt.topicId} Notes
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="p-4 bg-emerald-50 border-2 border-emerald-700 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900 shadow-[3px_3px_0_#BBF7D0]">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            100% accuracy on this paper — no weak syllabus topics detected.
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'FRESH!');
                retryWithNewQuestions();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold sk-btn-primary cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry with New Questions
            </button>
            <button
              type="button"
              onClick={() => retakeExactExam(activeExam)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold sk-btn-secondary cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Exact Paper
            </button>
            {wrongCount > 0 && (
              <div
                role="group"
                aria-label="Filter results"
                className="flex gap-1 sk-tabs"
              >
                <button
                  type="button"
                  data-active={!showWrongOnly}
                  onClick={() => setShowWrongOnly(false)}
                  className="px-3 py-1 text-xs font-semibold cursor-pointer sk-tab"
                >
                  All Questions ({scoredResults.length})
                </button>
                <button
                  type="button"
                  data-active={showWrongOnly}
                  onClick={() => setShowWrongOnly(true)}
                  className="px-3 py-1 text-xs font-semibold cursor-pointer sk-tab"
                >
                  Wrong Answers Only ({wrongCount})
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveExam(null);
              onNavigate({ view: 'practice', subject });
            }}
            className="px-4 py-2 text-xs font-bold sk-btn-ink cursor-pointer"
          >
            Back to All Practice Tests
          </button>
        </div>

        <section className="space-y-4">
          {visibleResults.map((res) => (
            <article
              key={res.question.id}
              className="p-5 sk-card space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sk-dim)]">
                  <span className="font-mono font-bold text-[var(--sk-ink)]">
                    Q{res.questionNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Topic {res.question.topicId} {res.question.topicTitle}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{getQuestionFormatLabel(res.question.questionType)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{res.question.sourceRef}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  {res.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      {res.marksEarned}/{res.question.marks} marks
                    </span>
                  ) : res.isPartial ? (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <CheckCircle2 className="w-4 h-4" />
                      {res.marksEarned}/{res.question.marks} marks (Partial)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <XCircle className="w-4 h-4" />
                      0/{res.question.marks} marks
                    </span>
                  )}
                </div>
              </div>
              {res.matchReason && (
                <div className="text-[11px] font-medium text-[var(--sk-dim)] bg-[var(--sk-chip)] border border-[var(--sk-line)] rounded-lg px-2.5 py-1 inline-block">
                  {res.matchReason}
                </div>
              )}

              <p className="text-sm text-[var(--sk-ink)] leading-relaxed">
                <MathText text={res.question.question} />
              </p>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 sk-card-soft">
                  <span className="text-[var(--sk-dim)] block mb-0.5">Your Answer</span>
                  <span className="font-mono font-semibold text-[var(--sk-ink)]">
                    {res.userVal ? <MathText text={res.userVal} /> : '(No answer entered)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border-[1.5px] border-emerald-200">
                  <span className="text-emerald-800 block mb-0.5">Official Answer</span>
                  <span className="font-mono font-semibold text-emerald-900">
                    {res.question.unit && ['$', '£', '€'].includes(res.question.unit) ? (
                      <>
                        {res.question.unit}
                        <MathText text={res.question.correctAnswer} />
                      </>
                    ) : (
                      <>
                        <MathText text={res.question.correctAnswer} />
                        {res.question.unit ? ` ${res.question.unit}` : ''}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3.5 sk-card-soft space-y-2">
                <div className="text-xs font-bold text-[var(--sk-ink)]">
                  Cambridge Mark Scheme &amp; Working
                </div>
                <ul className="space-y-1 text-xs text-[var(--sk-body)]">
                  {res.question.markScheme.map((ms, mi) => (
                    <li key={mi} className="flex gap-2">
                      <span className="font-mono font-bold text-[var(--sk-pri)] shrink-0">
                        {ms.code}
                      </span>
                      <span>
                        <MathText text={ms.detail} />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[var(--sk-dim)] pt-1 border-t border-[var(--sk-line)]">
                  <MathText text={res.question.fullSolution} />
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                {!res.isCorrect ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate({
                          view: 'practice',
                          subject,
                          mode: 'topical',
                          topicId: res.question.topicId,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold sk-btn-subtle cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      More Topic {res.question.topicId} Questions
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate({
                          view: 'notes',
                          subject,
                          chapterId: res.question.chapterId,
                          topicId: res.question.topicId,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold sk-btn-primary cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Study Topic {res.question.topicId} Notes to Fix This
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        view: 'notes',
                        subject,
                        chapterId: res.question.chapterId,
                        topicId: res.question.topicId,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sk-pri)] hover:text-[var(--sk-ink)] cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Revise Topic {res.question.topicId} Notes
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Exam Top Bar */}
      <section className="p-4 sk-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-base font-bold text-[var(--sk-ink)]">
              {activeExam.title}
            </h1>
            <div className="text-xs text-[var(--sk-dim)] flex flex-wrap items-center gap-2 mt-0.5">
              <span>
                Question {currentIdx + 1} of {activeExam.questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-semibold text-[var(--sk-ink)]">
                Attempt #{activeExam.attemptNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-[var(--sk-pri)]" />
                {currentQ.paperType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenFormulaSheet}
              className="px-3 py-1.5 text-xs font-semibold sk-btn-subtle cursor-pointer whitespace-nowrap"
            >
              Formula Sheet
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sk-surface)] border-[1.5px] border-[var(--sk-ink)] font-mono text-xs font-bold tabular-nums text-[var(--sk-ink)]">
              <Clock className="w-3.5 h-3.5 text-[var(--sk-pri)]" />
              {formatCountdown(secondsLeft)}
            </div>
            <button
              type="button"
              onClick={(e) => {
                triggerSakugaBurst(e, 'emerald', 'SUBMIT!');
                setSubmitted(true);
              }}
              className="px-4 py-1.5 text-xs font-bold sk-btn-primary cursor-pointer whitespace-nowrap"
            >
              Submit Paper
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2.5 flex-1 sk-progress-track">
            <div
              className="h-full sk-progress-fill rounded-full"
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--sk-dim)] shrink-0">
            {answeredCount}/{activeExam.questions.length} answered
          </span>
        </div>
      </section>

      {/* Question Card */}
      <section className="p-6 sk-card space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="text-xs text-[var(--sk-dim)] flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-[var(--sk-ink)]">
              Question {currentIdx + 1}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {currentQ.topicId} {currentQ.topicTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span>{subject === '0606' ? '0606 Syllabus' : currentQ.tier}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[var(--sk-pri)]">
              {getQuestionFormatLabel(currentQ.questionType)}
            </span>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums text-[var(--sk-dim)]">
            [{currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}]
          </span>
        </div>

        <p className="text-base text-[var(--sk-ink)] leading-relaxed">
          <MathText text={currentQ.question} />
        </p>

        {currentQ.questionType === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
          <fieldset className="pt-2 space-y-2.5">
            <legend className="text-xs font-semibold text-[var(--sk-dim)] mb-2">
              Select the correct answer
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, optIdx) => {
                const optionLetter = String.fromCharCode(65 + optIdx);
                const selected = answers[currentQ.id] === opt;
                return (
                  <label
                    key={`${currentQ.id}-opt-${optIdx}`}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selected
                        ? 'bg-[var(--sk-surface)] border-[var(--sk-ink)] text-[var(--sk-ink)] shadow-[3px_3px_0_var(--sk-ring)]'
                        : 'bg-[var(--sk-chip)] border-[var(--sk-line)] text-[var(--sk-body)] hover:border-[var(--sk-pri-bright)] hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`mcq-${currentQ.id}`}
                      value={opt}
                      checked={selected}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))
                      }
                      className="sr-only"
                    />
                    <span
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 border-[1.5px] ${
                        selected
                          ? 'bg-[var(--sk-pri-bright)] text-white border-[var(--sk-ink)]'
                          : 'bg-white text-[var(--sk-ink)] border-[var(--sk-line)]'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-sm font-semibold">
                      <MathText text={opt} />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <div className="pt-2">
            <label
              htmlFor={`exam-ans-${currentQ.id}`}
              className="block text-xs font-semibold text-[var(--sk-dim)] mb-1.5"
            >
              Your Final Answer {currentQ.unit ? `(in ${currentQ.unit})` : ''}
            </label>
            <input
              id={`exam-ans-${currentQ.id}`}
              type="text"
              value={answers[currentQ.id] || ''}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
              }
              placeholder={
                currentQ.questionType === 'text'
                  ? 'Enter simplified fraction (a/b) or exact decimal'
                  : 'Enter exact value or 3 s.f. number'
              }
              className="w-full max-w-md px-3.5 py-2.5 text-sm font-mono sk-input"
            />
          </div>
        )}

        <div className="pt-4 border-t border-[var(--sk-line)] flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="px-4 py-2 text-xs font-semibold sk-btn-subtle disabled:opacity-40 cursor-pointer"
          >
            Previous Question
          </button>

          {currentIdx < activeExam.questions.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentIdx((i) => Math.min(activeExam.questions.length - 1, i + 1))
              }
              className="px-4 py-2 text-xs font-bold sk-btn-ink cursor-pointer"
            >
              Next Question
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                triggerSakugaBurst(e, 'emerald', 'DONE!');
                setSubmitted(true);
              }}
              className="px-4 py-2 text-xs font-bold sk-btn-primary cursor-pointer"
            >
              Finish &amp; Grade Paper
            </button>
          )}
        </div>
      </section>

      {/* Question Navigator Grid */}
      <section className="p-4 sk-card">
        <div className="text-xs font-semibold text-[var(--sk-dim)] mb-2.5">
          Question Navigator
        </div>
        <div className="flex flex-wrap gap-2">
          {activeExam.questions.map((q, idx) => {
            const answered = Boolean((answers[q.id] || '').trim());
            const active = idx === currentIdx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 text-xs font-mono font-bold rounded-xl border-2 cursor-pointer transition-all ${
                  active
                    ? 'bg-[var(--sk-pri-bright)] text-white border-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-ring)]'
                    : answered
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                      : 'bg-[var(--sk-chip)] text-[var(--sk-body)] border-[var(--sk-line)] hover:border-[var(--sk-ink)]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
};
