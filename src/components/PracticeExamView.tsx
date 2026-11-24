import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Play,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { SYLLABUS_0580 } from '../data/syllabus0580';
import type { AppRoute, PracticeQuestion } from '../types/syllabus';
import {
  estimateCambridgeGrade,
  evaluateStudentAnswer,
  extractWeakTopicsFromResults,
  formatCountdown,
} from '../utils/examLogic';
import {
  generateMockExamQuestions,
  type MockPaperMode,
} from '../utils/questionGenerator';
import { MathText } from './MathText';
import { TopicalPastPapersSection } from './TopicalPastPapersSection';
import { triggerSakugaBurst } from '../utils/sakugaVfx';

interface PracticeExamViewProps {
  initialMode?: string;
  initialTopicId?: string;
  initialTopicalPackId?: string;
  onOpenFormulaSheet: () => void;
  onFlagWeakTopics?: (topicIds: string[]) => void;
  onNavigate: (route: AppRoute) => void;
}

interface PresetMetadata {
  id: string;
  mode: MockPaperMode;
  title: string;
  subtitle: string;
  tier: 'Core' | 'Extended';
  durationSeconds: number;
  questionCountLabel: string;
  formatLabel: string;
}

interface ActiveExamSession {
  id: string;
  mode: MockPaperMode;
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
  initialMode,
  initialTopicId,
  initialTopicalPackId,
  onOpenFormulaSheet,
  onFlagWeakTopics,
  onNavigate,
}) => {
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'all'>('all');
  const [activeExam, setActiveExam] = useState<ActiveExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showWrongOnly, setShowWrongOnly] = useState(false);

  // Track prompt signatures already seen across retries in this session so "Retry with New Questions" stays fresh
  const seenSignaturesRef = useRef<Set<string>>(new Set());
  const handledRouteKeyRef = useRef<string>('');

  const presets: PresetMetadata[] = useMemo(
    () => [
      {
        id: 'mock-core-p1',
        mode: 'mock-core-p1',
        title: 'Paper 1 — Core Non-Calculator Mock',
        subtitle:
          'Mixed Multiple Choice, Numeric & Fraction drill on Number, HCF/LCM, Simultaneous Equations, Polygon Angles, and Probability.',
        tier: 'Core',
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
        durationSeconds: 40 * 60,
        questionCountLabel: '12 Qs · ~31 marks · 40 min',
        formatLabel: 'All 3 Question Types · Fresh on Every Retry',
      },
    ],
    []
  );

  const launchGeneratedSession = useCallback(
    (config: {
      id: string;
      mode: MockPaperMode;
      title: string;
      subtitle: string;
      tier: 'Core' | 'Extended';
      durationSeconds: number;
      attemptNumber: number;
      chapterId?: number | 'all';
      topicId?: string;
    }) => {
      const generated = generateMockExamQuestions({
        mode: config.mode,
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
    []
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
          ? 'All 9 Chapters'
          : `Chapter ${chapterId}: ${SYLLABUS_0580.find((c) => c.id === chapterId)?.title}`;
      launchGeneratedSession({
        id: `chapter-${chapterId}`,
        mode: 'topical',
        title: `Topical Practice — ${chTitle}`,
        subtitle: 'Fresh multi-format Cambridge 0580 problems with M1/A1/B1 mark schemes',
        tier: 'Extended',
        durationSeconds: chapterId === 'all' ? 24 * 60 : 15 * 60,
        attemptNumber,
        chapterId,
      });
    },
    [launchGeneratedSession]
  );

  useEffect(() => {
    if (initialTopicalPackId) {
      setActiveExam(null);
      return;
    }
    const routeKey = `${initialMode || ''}:${initialTopicId || ''}`;
    if (!initialMode) {
      handledRouteKeyRef.current = '';
      return;
    }
    if (handledRouteKeyRef.current === routeKey) return;
    handledRouteKeyRef.current = routeKey;

    if (initialMode === 'topical' && initialTopicId) {
      const fallbackChapter = Number(initialTopicId.split('.')[0]) || 1;
      launchGeneratedSession({
        id: `topical-${initialTopicId}`,
        mode: 'topical',
        title: `Topical Practice — Syllabus ${initialTopicId}`,
        subtitle: `Focused Cambridge 0580 questions aligned to Topic ${initialTopicId} & Chapter ${fallbackChapter}`,
        tier: 'Extended',
        durationSeconds: 15 * 60,
        attemptNumber: 1,
        chapterId: fallbackChapter,
        topicId: initialTopicId,
      });
    } else if (initialMode === 'mock-extended') {
      const ext = presets.find((p) => p.id === 'mock-ext-p2');
      if (ext) startPreset(ext);
    }
  }, [initialMode, initialTopicId, initialTopicalPackId, presets, launchGeneratedSession, startPreset]);

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
      .filter((q) => !evaluateStudentAnswer(answers[q.id] || '', q))
      .map((q) => q.topicId);
    if (wrongTopicIds.length > 0) {
      onFlagWeakTopics(wrongTopicIds);
    }
  }, [submitted, activeExam, answers, onFlagWeakTopics]);

  if (!activeExam) {
    const previewSample = generateMockExamQuestions({
      mode: 'topical',
      attemptNumber: 1,
      chapterId: selectedChapterFilter,
    });

    return (
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-8">
        <section className="p-6 sk-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#5E588C] mb-1">
              Cambridge IGCSE Mathematics (0580) · Timed Exam &amp; Topical Drills
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1D1A4A]">
              IGCSE 0580 Practice Tests
            </h1>
            <p className="text-sm text-[#393469] mt-1 max-w-2xl">
              Practise with Multiple Choice, Numeric, and Exact Fraction questions under Non-Calculator (Papers 1/2) or Calculator (Papers 3/4) rules. Every retry generates fresh questions with new numbers and scenarios.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFormulaSheet}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold sk-btn-secondary cursor-pointer shrink-0 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#5B57E8]" />
            View 0580 Formula Sheet
          </button>
        </section>

        {/* Timed Mock Exam Presets */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-bold text-[#1D1A4A]">
              Timed IGCSE Mock Papers
            </h2>
            <span className="text-xs text-[#5E588C]">
              Unlimited retries — every retake swaps in brand-new questions
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <article
                key={preset.id}
                className={`p-5 flex flex-col justify-between gap-4 ${
                  preset.id === 'mock-full'
                    ? 'md:col-span-2 lg:col-span-2 sk-card-accent'
                    : 'sk-card'
                }`}
              >
                <div className="space-y-2">
                  <div
                    className={`flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#5E588C] ${
                      preset.id === 'mock-full' ? 'items-center justify-between' : 'flex-col'
                    }`}
                  >
                    <span
                      className={
                        preset.tier === 'Extended'
                          ? 'text-[#C0266B] font-bold'
                          : 'text-[#1D1A4A] font-bold'
                      }
                    >
                      {preset.tier} Tier · {preset.formatLabel}
                    </span>
                    <span className="font-mono tabular-nums">{preset.questionCountLabel}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#1D1A4A]">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-[#393469] leading-relaxed">{preset.subtitle}</p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      triggerSakugaBurst(e, 'indigo', 'GO!');
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
              <h2 className="font-display text-base font-bold text-[#1D1A4A]">
                Topical Practice by Syllabus Chapter
              </h2>
              <p className="text-xs text-[#5E588C] mt-0.5">
                Target a specific chapter from the 0580 curriculum with non-repeating variants
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                triggerSakugaBurst(e, 'sakura', 'DRILL!');
                startChapterDrill(selectedChapterFilter, 1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold sk-btn-ink cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              Start Drill ({previewSample.questions.length} Fresh Questions)
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedChapterFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border-[1.5px] cursor-pointer transition-colors ${
                selectedChapterFilter === 'all'
                  ? 'bg-[#F4F3FC] border-[#1D1A4A] text-[#1D1A4A] shadow-[2px_2px_0_#B8B3FF]'
                  : 'bg-[#FAF9FF] border-[#DCDAF0] text-[#393469] hover:border-[#1D1A4A]'
              }`}
            >
              All Chapters
            </button>
            {SYLLABUS_0580.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChapterFilter(ch.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border-[1.5px] cursor-pointer transition-colors ${
                  selectedChapterFilter === ch.id
                    ? 'bg-[#F4F3FC] border-[#1D1A4A] text-[#1D1A4A] shadow-[2px_2px_0_#B8B3FF]'
                    : 'bg-[#FAF9FF] border-[#DCDAF0] text-[#393469] hover:border-[#1D1A4A]'
                }`}
              >
                {ch.id}. {ch.title}
              </button>
            ))}
          </div>
        </section>

        {/* Topical Past Papers & Worked Solutions (Annotatable Q + Answers) */}
        <TopicalPastPapersSection
          selectedChapterFilter={selectedChapterFilter}
          initialPackId={initialTopicalPackId}
          onNavigate={onNavigate}
        />
      </main>
    );
  }

  // Active Exam or Results View
  const currentQ = activeExam.questions[currentIdx];
  const totalMarks = activeExam.questions.reduce((acc, q) => acc + q.marks, 0);
  const scoredResults = activeExam.questions.map((q, qIdx) => {
    const userVal = answers[q.id] || '';
    const isCorrect = evaluateStudentAnswer(userVal, q);
    return {
      question: q,
      questionNumber: qIdx + 1,
      userVal,
      isCorrect,
      marksEarned: isCorrect ? q.marks : 0,
    };
  });
  const earnedMarks = scoredResults.reduce((acc, r) => acc + r.marksEarned, 0);
  const gradeInfo = estimateCambridgeGrade(earnedMarks, totalMarks, activeExam.tier);
  const weakTopics = extractWeakTopicsFromResults(scoredResults, SYLLABUS_0580);
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
            <div className="text-xs text-[#5E588C]">
              {activeExam.title} · Attempt #{activeExam.attemptNumber} · {activeExam.tier} Tier Grading
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1D1A4A]">
              Examination Results &amp; Mark Scheme
            </h1>
            <p className="text-sm text-[#393469]">{gradeInfo.descriptor}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-xs text-[#5E588C]">Total Score</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-[#1D1A4A]">
                {earnedMarks} / {totalMarks}{' '}
                <span className="text-sm font-normal text-[#5E588C]">
                  ({gradeInfo.percentage}%)
                </span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#F4F3FC] border-2 border-[#1D1A4A] shadow-[3px_3px_0_#B8B3FF] text-center">
              <div className="text-[11px] font-semibold text-[#5B57E8]">Est. Grade</div>
              <div className="font-display text-2xl font-extrabold text-[#1D1A4A]">
                {gradeInfo.grade}
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Recommended Notes Panel */}
        {weakTopics.length > 0 ? (
          <section
            aria-label="Topics to Revise Based on Wrong Answers"
            className="p-6 rounded-[18px] bg-white border-2 border-[#FF5FA8] shadow-[4px_5px_0_#FBCFE8] space-y-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-[#1D1A4A]">
                  Topics to Study Based on Your Wrong Answers
                </h2>
                <p className="text-xs text-[#393469] mt-0.5">
                  You missed {wrongCount} {wrongCount === 1 ? 'question' : 'questions'} across{' '}
                  {weakTopics.length} syllabus {weakTopics.length === 1 ? 'topic' : 'topics'}. Jump directly to the corresponding 0580 study notes to fix each gap:
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
                    <div className="text-[11px] font-medium text-[#5E588C]">
                      Chapter {wt.chapterId}: {wt.chapterTitle}
                    </div>
                    <div className="font-display text-sm font-bold text-[#1D1A4A] truncate">
                      <span className="font-mono text-[#5B57E8] mr-1.5">{wt.topicId}</span>
                      {wt.topicTitle}
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#C0266B] mt-0.5 tabular-nums">
                      {wt.marksLost} {wt.marksLost === 1 ? 'mark' : 'marks'} missed
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        view: 'notes',
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
                triggerSakugaBurst(e, 'indigo', 'FRESH!');
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
              onNavigate({ view: 'practice' });
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
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5E588C]">
                  <span className="font-mono font-bold text-[#1D1A4A]">
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
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <XCircle className="w-4 h-4" />
                      0/{res.question.marks} marks
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#1D1A4A] leading-relaxed">
                <MathText text={res.question.question} />
              </p>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 sk-card-soft">
                  <span className="text-[#5E588C] block mb-0.5">Your Answer</span>
                  <span className="font-mono font-semibold text-[#1D1A4A]">
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
                <div className="text-xs font-bold text-[#1D1A4A]">
                  Cambridge Mark Scheme &amp; Working
                </div>
                <ul className="space-y-1 text-xs text-[#393469]">
                  {res.question.markScheme.map((ms, mi) => (
                    <li key={mi} className="flex gap-2">
                      <span className="font-mono font-bold text-[#5B57E8] shrink-0">
                        {ms.code}
                      </span>
                      <span>
                        <MathText text={ms.detail} />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[#5E588C] pt-1 border-t border-[#DCDAF0]">
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
                        chapterId: res.question.chapterId,
                        topicId: res.question.topicId,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B57E8] hover:text-[#1D1A4A] cursor-pointer"
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
            <h1 className="font-display text-base font-bold text-[#1D1A4A]">
              {activeExam.title}
            </h1>
            <div className="text-xs text-[#5E588C] flex flex-wrap items-center gap-2 mt-0.5">
              <span>
                Question {currentIdx + 1} of {activeExam.questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-semibold text-[#1D1A4A]">
                Attempt #{activeExam.attemptNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-[#5B57E8]" />
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F3FC] border-[1.5px] border-[#1D1A4A] font-mono text-xs font-bold tabular-nums text-[#1D1A4A]">
              <Clock className="w-3.5 h-3.5 text-[#5B57E8]" />
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
          <span className="font-mono text-[11px] font-semibold tabular-nums text-[#5E588C] shrink-0">
            {answeredCount}/{activeExam.questions.length} answered
          </span>
        </div>
      </section>

      {/* Question Card */}
      <section className="p-6 sk-card space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="text-xs text-[#5E588C] flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-[#1D1A4A]">
              Question {currentIdx + 1}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {currentQ.topicId} {currentQ.topicTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentQ.tier}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#5B57E8]">
              {getQuestionFormatLabel(currentQ.questionType)}
            </span>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums text-[#5E588C]">
            [{currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}]
          </span>
        </div>

        <p className="text-base text-[#1D1A4A] leading-relaxed">
          <MathText text={currentQ.question} />
        </p>

        {currentQ.questionType === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
          <fieldset className="pt-2 space-y-2.5">
            <legend className="text-xs font-semibold text-[#5E588C] mb-2">
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
                        ? 'bg-[#F4F3FC] border-[#1D1A4A] text-[#1D1A4A] shadow-[3px_3px_0_#B8B3FF]'
                        : 'bg-[#FAF9FF] border-[#DCDAF0] text-[#393469] hover:border-[#8F8DF7] hover:bg-white'
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
                          ? 'bg-[#6D69F2] text-white border-[#1D1A4A]'
                          : 'bg-white text-[#1D1A4A] border-[#DCDAF0]'
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
              className="block text-xs font-semibold text-[#5E588C] mb-1.5"
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

        <div className="pt-4 border-t border-[#DCDAF0] flex items-center justify-between gap-4">
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
        <div className="text-xs font-semibold text-[#5E588C] mb-2.5">
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
                    ? 'bg-[#6D69F2] text-white border-[#1D1A4A] shadow-[2px_2px_0_#B8B3FF]'
                    : answered
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                      : 'bg-[#FAF9FF] text-[#393469] border-[#DCDAF0] hover:border-[#1D1A4A]'
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
