import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Columns2,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Play,
  Table2,
  Zap,
} from 'lucide-react';
import type {
  AppRoute,
  SubjectCode,
  SubtopicNote,
  SyllabusChapter,
  TopicalPaperPack,
} from '../types/syllabus';
import {
  getAdjacentSubtopicsFromSyllabus,
  gradeStudentAnswer,
  parsePaperReference,
} from '../utils/examLogic';
import { KaTeXFormula, MathText } from './MathText';
import { SyllabusSidebar } from './SyllabusSidebar';
import { TopicSandbox } from './TopicSandbox';
import { TransformationDiagrams } from './TransformationDiagrams';
import { TopicIllustrations } from './TopicIllustrations';
import { getKeyFindingsForNote, highlightImportantText } from '../utils/noteKeyFindings';
import { getActiveSubjectVfxVariant, triggerSakugaBurst } from '../utils/sakugaVfx';

interface NotesViewProps {
  subject: SubjectCode;
  syllabus: SyllabusChapter[];
  chapterId: number;
  topicId: string;
  note: SubtopicNote;
  studiedTopicIds: string[];
  weakTopicIds: string[];
  onToggleStudied: (topicId: string) => void;
  onClearWeakTopic: (topicId: string) => void;
  onNavigate: (route: AppRoute) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  subject,
  syllabus,
  chapterId,
  topicId,
  note,
  studiedTopicIds,
  weakTopicIds,
  onToggleStudied,
  onClearWeakTopic,
  onNavigate,
}) => {
  const [studyMode, setStudyMode] = useState<'conceptual' | 'detailed'>('detailed');
  const [quickInput, setQuickInput] = useState('');
  const [quickStatus, setQuickStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [revealedMarkSchemes, setRevealedMarkSchemes] = useState<number[]>([]);
  const [matchingTopicalPacks, setMatchingTopicalPacks] = useState<TopicalPaperPack[]>([]);

  useEffect(() => {
    setQuickInput('');
    setQuickStatus('idle');
    setShowHint(false);
    setShowSolution(false);
    setRevealedMarkSchemes([]);
  }, [topicId, subject]);

  useEffect(() => {
    let cancelled = false;
    const packsLoader =
      subject === '0606'
        ? import('../data/topicalPapers0606').then((m) => m.TOPICAL_PAPERS_0606)
        : import('../data/topicalPapers0580').then((m) => m.TOPICAL_PAPERS_0580);

    Promise.all([import('../utils/topicalPapers'), packsLoader])
      .then(([{ findTopicalPapersForTopic }, packs]) => {
        if (!cancelled) {
          setMatchingTopicalPacks(findTopicalPapersForTopic(note.id, packs));
        }
      })
      .catch(() => {
        if (!cancelled) setMatchingTopicalPacks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [subject, note.id]);

  const chapter = syllabus.find((c) => c.id === chapterId);
  const isStudied = studiedTopicIds.includes(note.id);
  const isFlaggedForReview = weakTopicIds.includes(note.id);
  const { prev, next } = getAdjacentSubtopicsFromSyllabus(syllabus, note.id);
  const parsedPaper = note.quickCheck.paperCode
    ? parsePaperReference(note.quickCheck.paperCode)
    : null;
  const otherWeakIds = weakTopicIds.filter((id) => id !== note.id);
  const nextWeakNote =
    otherWeakIds.length > 0
      ? syllabus.flatMap((c) => c.subtopics).find((t) => t.id === otherWeakIds[0])
      : undefined;
  const keyFindings = getKeyFindingsForNote(note);

  const handleQuickSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const result = gradeStudentAnswer(quickInput, {
      questionType: typeof note.quickCheck.numericAnswer === 'number' ? 'numeric' : 'text',
      correctAnswer: note.quickCheck.answer,
      acceptedAnswers: note.quickCheck.acceptedAnswers,
      numericAnswer: note.quickCheck.numericAnswer,
      tolerance: note.quickCheck.tolerance,
      marks: note.quickCheck.marks,
      question: note.quickCheck.prompt,
    });
    const ok = result.isCorrect || result.isPartial;
    setQuickStatus(ok ? 'correct' : 'incorrect');
    if (ok) {
      const submitBtn = e.currentTarget.querySelector('button[type="submit"]') as HTMLElement | null;
      triggerSakugaBurst(submitBtn, 'emerald', 'NICE!');
    }
  };

  const toggleMarkScheme = (idx: number) => {
    setRevealedMarkSchemes((prevList) =>
      prevList.includes(idx) ? prevList.filter((i) => i !== idx) : [...prevList, idx]
    );
  };

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
      <SyllabusSidebar
        subject={subject}
        syllabus={syllabus}
        activeChapterId={chapterId}
        activeTopicId={topicId}
        studiedTopicIds={studiedTopicIds}
        weakTopicIds={weakTopicIds}
        onSelectTopic={(ch, tp) =>
          onNavigate({ view: 'notes', subject, chapterId: ch, topicId: tp })
        }
      />

      <main className="flex-1 min-w-0 max-w-full w-full space-y-6">
        {/* Topic Header Card */}
        <section className="p-6 sk-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sk-dim)]">
              <span>
                {subject === '0606'
                  ? 'IGCSE Additional Mathematics (0606)'
                  : 'IGCSE Mathematics (0580)'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Chapter {chapterId}: {chapter?.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[var(--sk-ink)] font-semibold">{note.code}</span>
              <span aria-hidden="true">·</span>
              <span className={note.tier === 'Extended' ? 'text-[var(--sk-acc-ink)] font-semibold' : 'text-[var(--sk-body)]'}>
                {subject === '0606' ? '0606 (Grades A*–E)' : note.tier}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  if (!isStudied) {
                    triggerSakugaBurst(e, 'emerald', 'STUDIED!');
                  }
                  onToggleStudied(note.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                  isStudied
                    ? 'rounded-xl border-2 border-[#16A34A] bg-emerald-50 text-emerald-900 shadow-[3px_3px_0_#BBF7D0]'
                    : 'sk-btn-secondary'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isStudied ? 'Studied' : 'Mark as Studied'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'PRACTICE!');
                  onNavigate({ view: 'practice', subject, mode: 'topical', topicId: note.id });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold sk-btn-primary cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Practice {note.code}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--sk-ink)] tracking-tight text-balance">
                <span className="font-mono text-[var(--sk-pri-hover)] mr-2">{note.code}</span>{' '}
                <MathText text={note.title} />
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--sk-body)] leading-relaxed max-w-3xl">
                <MathText text={highlightImportantText(note.summary)} />
              </p>
              {note.aims && note.aims.length > 0 && (
                <div className="mt-3 p-3.5 rounded-xl bg-[var(--sk-surface)] border-[1.5px] border-[var(--sk-ink)] shadow-[2px_3px_0_var(--sk-soft)] max-w-3xl space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wide text-[var(--sk-pri-hover)]">
                    Aim · Learning Target
                  </div>
                  <ul className="space-y-1 text-xs sm:text-sm text-[var(--sk-ink)] list-disc pl-4">
                    {note.aims.map((aim, ai) => (
                      <li key={ai}>
                        <MathText text={highlightImportantText(aim)} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {note.coursebookRef && (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--sk-dim)]">
                  <span className="font-semibold text-[var(--sk-ink)]">
                    Morrison &amp; Hamshaw Coursebook (2nd Ed.)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {note.coursebookRef.unitTitle}, Ch. {note.coursebookRef.chapter}:{' '}
                    <MathText text={note.coursebookRef.chapterTitle} />
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Sections {note.coursebookRef.sections}</span>
                </div>
              )}
              {note.coursebookRef?.editionNote && (
                <p className="mt-1 text-xs font-medium text-[var(--sk-acc-ink)]">
                  <MathText text={note.coursebookRef.editionNote} />
                </p>
              )}
            </div>

            <div
              className="inline-flex items-center gap-1 sk-tabs shrink-0 self-start md:self-auto"
              role="group"
              aria-label="Study depth mode"
            >
              <button
                type="button"
                aria-pressed={studyMode === 'conceptual'}
                data-active={studyMode === 'conceptual'}
                onClick={(e) => {
                  triggerSakugaBurst(e, getActiveSubjectVfxVariant('accent'));
                  setStudyMode('conceptual');
                }}
                className="px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
              >
                Quick Concept
              </button>
              <button
                type="button"
                aria-pressed={studyMode === 'detailed'}
                data-active={studyMode === 'detailed'}
                onClick={(e) => {
                  triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'));
                  setStudyMode('detailed');
                }}
                className="px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
              >
                {subject === '0606' ? 'Detailed Syllabus' : 'Detailed Coursebook'}
              </button>
            </div>
          </div>

          {isFlaggedForReview && (
            <div className="p-3.5 rounded-xl bg-[var(--sk-acc-soft)] border-[1.5px] border-[var(--sk-acc)]/50 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--sk-acc-ink)]">
              <span>
                Flagged for revision from a missed practice or past paper question. Review the rules below, then click <strong>Mark as Studied</strong> once mastered.
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {nextWeakNote && (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        view: 'notes',
                        subject,
                        chapterId: nextWeakNote.chapterId,
                        topicId: nextWeakNote.id,
                      })
                    }
                    className="px-2.5 py-1 font-semibold sk-btn-subtle text-[var(--sk-acc-ink)] cursor-pointer"
                  >
                    Next Flagged: {nextWeakNote.code} →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onClearWeakTopic(note.id)}
                  className="px-2.5 py-1 font-semibold text-[var(--sk-acc-ink)] hover:text-[var(--sk-ink)] cursor-pointer"
                >
                  Dismiss Flag
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Core Intuition & Quick Concept Summary */}
        {note.bigIdea && (
          <section className="p-5 sm:p-6 sk-card-accent space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[var(--sk-pri-hover)] shrink-0" />
                <h2 className="font-display text-sm font-bold text-[var(--sk-ink)]">
                  {studyMode === 'conceptual' ? 'Quick Concept — Core Intuition' : 'Big Idea & Core Intuition'}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--sk-ink)] leading-relaxed max-w-3xl">
                <MathText text={highlightImportantText(note.bigIdea)} />
              </p>
            </div>

            {studyMode === 'conceptual' && note.rapidSummary && note.rapidSummary.length > 0 && (
              <div className="pt-3 border-t border-[var(--sk-line)] space-y-2.5">
                <div className="text-xs font-bold text-[var(--sk-ink)]">
                  Key Takeaways at a Glance
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {note.rapidSummary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border-[1.5px] border-[var(--sk-line)] space-y-1"
                    >
                      <div className="font-display text-xs font-bold text-[var(--sk-ink)]">
                        <MathText text={highlightImportantText(item.rule)} />
                      </div>
                      <p className="text-xs text-[var(--sk-body)] leading-relaxed">
                        <MathText text={highlightImportantText(item.detail)} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Key Findings & Boxed Notes */}
        {keyFindings.length > 0 && (
          <section
            aria-label="Key Findings and Underlined Rules"
            className="p-5 sm:p-6 sk-card space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--sk-acc)] shrink-0" />
                <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                  Key Findings &amp; Underlined Essentials (Temuan Kunci)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-[var(--sk-dim)]">
                Underlined rules = must-state exam requirements
              </span>
            </div>

            <div className="grid gap-3.5">
              {keyFindings.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-[16px] bg-[var(--sk-surface)] border-[1.5px] border-[var(--sk-line)] space-y-2.5"
                >
                  <div className="font-display text-sm font-bold text-[var(--sk-ink)]">
                    <MathText text={item.title} />
                  </div>
                  <p className="text-sm text-[var(--sk-body)] leading-relaxed">
                    <MathText text={item.finding} />
                  </p>
                  {item.noteBox && (
                    <div className="p-3 rounded-xl bg-[var(--sk-acc-soft)] border-[1.5px] border-[var(--sk-ink)] shadow-[2px_3px_0_var(--sk-soft)] text-xs sm:text-sm text-[var(--sk-ink)] leading-relaxed">
                      <span className="font-bold mr-1.5">Note:</span>
                      <MathText text={item.noteBox} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dedicated Graph-Paper Diagrams for 0580 7.1 Transformations */}
        {subject === '0580' && note.id === '7.1' && <TransformationDiagrams />}

        {/* Visual Notebook Diagrams for Bearings & Visual Syllabus Topics */}
        {subject === '0580' && <TopicIllustrations topicId={note.id} />}

        {/* Coursebook / Exam Margin Pedagogy: Tip & Fast Forward */}
        {(note.coursebookTip || (studyMode === 'detailed' && note.fastForward)) && (
          <section
            aria-label="Exam Tip and Fast Forward"
            className={`grid gap-4 ${
              studyMode === 'detailed' && note.fastForward && note.coursebookTip
                ? 'md:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {note.coursebookTip && (
              <div className="p-4 sm:p-5 rounded-[18px] bg-[var(--sk-acc-soft)] border-[1.5px] border-[var(--sk-acc-line)] space-y-1.5">
                <div className="text-xs font-bold text-[var(--sk-acc-ink)]">
                  {subject === '0606'
                    ? 'Exam Tip · Additional Mathematics (0606)'
                    : 'Coursebook Tip · Morrison & Hamshaw'}
                </div>
                <p className="text-sm text-[var(--sk-body)] leading-relaxed">
                  <MathText text={note.coursebookTip} />
                </p>
              </div>
            )}
            {studyMode === 'detailed' && note.fastForward && (
              <div className="p-4 sm:p-5 sk-card-soft space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--sk-ink)]">
                  <Compass className="w-3.5 h-3.5 text-[var(--sk-pri-hover)] shrink-0" />
                  <span>Fast Forward · Where This Connects Next</span>
                </div>
                <p className="text-sm text-[var(--sk-body)] leading-relaxed">
                  <MathText text={note.fastForward} />
                </p>
              </div>
            )}
          </section>
        )}

        {/* Syllabus Objectives (Detailed mode) */}
        {studyMode === 'detailed' && (
          <section className="p-6 sk-card space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--sk-pri-hover)]" />
              <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                Curriculum Learning Objectives (2025–2027)
              </h2>
            </div>

            <div className={`grid gap-6 ${note.extendedObjectives && note.extendedObjectives.length > 0 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <h3 className="text-xs font-semibold text-[var(--sk-dim)] mb-2">
                  {subject === '0606' ? '0606 Syllabus Objectives' : 'Core Curriculum'}
                </h3>
                <ul className="space-y-2 text-sm text-[var(--sk-body)] leading-relaxed list-disc pl-5">
                  {note.coreObjectives.map((obj, idx) => (
                    <li key={idx}>
                      <MathText text={obj} />
                    </li>
                  ))}
                </ul>
              </div>

              {subject !== '0606' && note.extendedObjectives && note.extendedObjectives.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--sk-acc-ink)] mb-2">
                    Extended Supplement
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--sk-body)] leading-relaxed list-disc pl-5">
                    {note.extendedObjectives.map((obj, idx) => (
                      <li key={idx}>
                        <MathText text={obj} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Key Formulae */}
        <section className="p-6 sk-card space-y-4">
          <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
            Key Rules &amp; Formulae
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {note.keyFormulas.map((f) => (
              <div
                key={f.label}
                className="p-4 sk-card-soft space-y-2"
              >
                <div className="text-xs font-semibold text-[var(--sk-ink)]">
                  <MathText text={f.label} />
                </div>
                <div className="overflow-x-auto text-[var(--sk-ink)]">
                  <KaTeXFormula latex={f.latex} />
                </div>
                {f.note && (
                  <p className="text-xs text-[var(--sk-dim)]">
                    <MathText text={highlightImportantText(f.note)} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Exam Method (Detailed mode) */}
        {studyMode === 'detailed' && note.stepByStepMethod && note.stepByStepMethod.length > 0 && (
          <section className="p-6 sk-card space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[var(--sk-pri-hover)] shrink-0" />
              <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                Step-by-Step Exam Method
              </h2>
            </div>
            <ol className="space-y-3">
              {note.stepByStepMethod.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[var(--sk-body)] leading-relaxed max-w-3xl">
                  <span className="w-6 h-6 rounded-lg bg-[var(--sk-chip)] border-[1.5px] border-[var(--sk-ink)] text-[var(--sk-ink)] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-[2px_2px_0_var(--sk-soft)]">
                    {idx + 1}
                  </span>
                  <span>
                    <MathText text={highlightImportantText(step)} />
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Structured Reference Table (Detailed mode) */}
        {studyMode === 'detailed' && note.comparisonTable && (
          <section className="p-6 sk-card min-w-0 w-full max-w-full overflow-x-clip space-y-4">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-[var(--sk-pri-hover)] shrink-0" />
              <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                <MathText text={note.comparisonTable.title} />
              </h2>
            </div>
            <div className="w-full max-w-full overflow-x-auto border-[1.5px] border-[var(--sk-line)] rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[var(--sk-chip)] border-b-[1.5px] border-[var(--sk-line)]">
                    {note.comparisonTable.headers.map((header, hi) => (
                      <th
                        key={hi}
                        scope="col"
                        className="px-4 py-2.5 text-xs font-bold text-[var(--sk-ink)] whitespace-nowrap"
                      >
                        <MathText text={header} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sk-line)]/70">
                  {note.comparisonTable.rows.map((row, ri) => (
                    <tr key={ri} className="bg-white hover:bg-[var(--sk-surface)]">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`px-4 py-2.5 text-[var(--sk-body)] align-top ${
                            ci === 0 ? 'font-semibold text-[var(--sk-ink)]' : ''
                          }`}
                        >
                          <MathText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Interactive Sandbox if present */}
        {subject === '0580' && note.sandbox && note.sandbox !== 'none' && (
          <TopicSandbox type={note.sandbox} topicId={note.id} />
        )}

        {/* Detailed Revision Notes */}
        {studyMode === 'detailed' && (
          <section className="p-6 sk-card space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                {subject === '0606' ? 'Detailed 0606 Study Notes' : 'Detailed Coursebook Study Notes'}
              </h2>
              {note.coursebookRef && (
                <span className="text-xs text-[var(--sk-dim)]">
                  Aligned with Chapter {note.coursebookRef.chapter}: <MathText text={note.coursebookRef.chapterTitle} />
                </span>
              )}
            </div>
            <div className="space-y-6 divide-y divide-[var(--sk-line)]/70">
              {note.studyNotes.map((sec, idx) => (
                <div key={idx} className={idx > 0 ? 'pt-6' : ''}>
                  <h3 className="font-display text-sm font-bold text-[var(--sk-ink)] mb-2">
                    <MathText text={sec.heading} />
                  </h3>
                  <p className="text-sm text-[var(--sk-body)] leading-relaxed max-w-3xl">
                    <MathText text={highlightImportantText(sec.body)} />
                  </p>
                  {sec.bullets && (
                    <ul className="mt-3 space-y-2 text-sm text-[var(--sk-body)] leading-relaxed list-disc pl-5 max-w-3xl">
                      {sec.bullets.map((b, bi) => (
                        <li key={bi}>
                          <MathText text={highlightImportantText(b)} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.noteBox && (
                    <div className="mt-3 p-3 rounded-xl bg-[var(--sk-acc-soft)] border-[1.5px] border-[var(--sk-ink)] shadow-[2px_3px_0_var(--sk-soft)] text-xs sm:text-sm text-[var(--sk-ink)] leading-relaxed max-w-3xl">
                      <span className="font-bold mr-1.5">Note:</span>
                      <MathText text={highlightImportantText(sec.noteBox)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Worked Examples */}
        <section className="p-6 sk-card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
              {studyMode === 'conceptual' ? 'Quick Walkthrough Example' : 'Worked Exam Examples'}
            </h2>
            {studyMode === 'conceptual' && (
              <button
                type="button"
                onClick={() => setStudyMode('detailed')}
                className="text-xs font-bold text-[var(--sk-pri-hover)] hover:text-[var(--sk-ink)] cursor-pointer"
              >
                Show full objectives, tables &amp; all {note.workedExamples.length} examples →
              </button>
            )}
          </div>
          <div className="space-y-5">
            {(studyMode === 'conceptual'
              ? note.workedExamples.slice(0, 1)
              : note.workedExamples
            ).map((ex, idx) => {
              const showMs = revealedMarkSchemes.includes(idx);
              return (
                <article
                  key={idx}
                  className="p-5 sk-card-soft space-y-4"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-sm font-bold text-[var(--sk-ink)]">
                      Example {idx + 1}: <MathText text={ex.title} />
                    </h3>
                    <span className="font-mono text-xs tabular-nums text-[var(--sk-dim)] shrink-0">
                      [{ex.marks} {ex.marks === 1 ? 'mark' : 'marks'}]
                    </span>
                  </div>

                  <p className="text-sm text-[var(--sk-ink)] leading-relaxed">
                    <MathText text={ex.question} />
                  </p>

                  <ol className="space-y-2 text-sm text-[var(--sk-body)] list-decimal pl-5">
                    {ex.steps.map((s, si) => (
                      <li key={si}>
                        <MathText text={s} />
                      </li>
                    ))}
                  </ol>

                  <div className="pt-3 border-t border-[var(--sk-line)] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-bold text-[var(--sk-pri-hover)]">
                      Answer: <MathText text={ex.answer} />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMarkScheme(idx)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sk-dim)] hover:text-[var(--sk-ink)] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showMs ? 'Hide Mark Scheme' : 'Show Mark Scheme'}
                    </button>
                  </div>

                  {showMs && (
                    <div className="p-3 rounded-xl bg-white border-[1.5px] border-[var(--sk-line)] text-xs text-[var(--sk-body)] font-mono">
                      <MathText text={ex.markSchemeNotes} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Rapid Exam Summary Table */}
        {studyMode === 'detailed' && note.rapidSummary && note.rapidSummary.length > 0 && (
          <section className="p-6 sk-card min-w-0 w-full max-w-full overflow-x-clip space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--sk-acc)] shrink-0" />
              <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                Rapid Exam Summary
              </h2>
            </div>
            <div className="w-full max-w-full overflow-x-auto border-[1.5px] border-[var(--sk-line)] rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[var(--sk-chip)] border-b-[1.5px] border-[var(--sk-line)]">
                    <th scope="col" className="px-4 py-2.5 text-xs font-bold text-[var(--sk-ink)] w-1/3">
                      Must Remember
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-xs font-bold text-[var(--sk-ink)]">
                      Rule &amp; Application
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sk-line)]/70">
                  {note.rapidSummary.map((item, ri) => (
                    <tr key={ri} className="bg-white">
                      <td className="px-4 py-2.5 font-semibold text-[var(--sk-ink)] align-top">
                        <MathText text={item.rule} />
                      </td>
                      <td className="px-4 py-2.5 text-[var(--sk-body)] align-top">
                        <MathText text={item.detail} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Common Mistakes & Quick Concept Check */}
        <div className={`grid gap-6 ${studyMode === 'detailed' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {studyMode === 'detailed' && (
            <section className="p-6 sk-card space-y-3">
              <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                Common Exam Pitfalls
              </h2>
              <ul className="space-y-2.5 text-sm text-[var(--sk-body)] list-disc pl-5 leading-relaxed">
                {note.commonMistakes.map((m, i) => (
                  <li key={i}>
                    <MathText text={m} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section
            aria-label={parsedPaper ? 'Topical Past Paper Question' : 'Topical Concept Check'}
            className="p-6 sk-card space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[var(--sk-ink)]">
                  {parsedPaper ? 'Topical Past Paper Question' : 'Topical Concept Check'}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[var(--sk-dim)]">
                  {parsedPaper && note.quickCheck.paperCode ? (
                    <>
                      <span className="font-mono font-semibold text-[var(--sk-pri-hover)]">
                        {note.quickCheck.paperCode}
                        {note.quickCheck.questionNumber ? ` · ${note.quickCheck.questionNumber}` : ''}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Paper {parsedPaper.paperNumber} ({parsedPaper.tier}) · {parsedPaper.sessionLabel}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono font-semibold text-[var(--sk-ink)]">
                        Syllabus {note.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{subject === '0606' ? '0606 Add Maths' : note.tier}</span>
                      <span aria-hidden="true">·</span>
                      <span>{note.quickCheck.paperType ?? 'Non-Calculator'}</span>
                    </>
                  )}
                  {typeof note.quickCheck.marks === 'number' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[var(--sk-dim)]">
                        [{note.quickCheck.marks} {note.quickCheck.marks === 1 ? 'mark' : 'marks'}]
                      </span>
                    </>
                  )}
                </div>
              </div>

              {parsedPaper ? (
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({
                      view: 'past-papers',
                      subject,
                      sessionSlug: parsedPaper.sessionSlug,
                      paperFilename: parsedPaper.qpFilename,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold sk-btn-subtle text-[var(--sk-pri-hover)] cursor-pointer shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View {parsedPaper.paperCode} in Past Papers
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'past-papers', subject })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold sk-btn-subtle text-[var(--sk-pri-hover)] cursor-pointer shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Browse {subject} Past Papers
                </button>
              )}
            </div>

            <p className="text-sm text-[var(--sk-body)] leading-relaxed">
              <MathText text={note.quickCheck.prompt} />
            </p>

            <form onSubmit={handleQuickSubmit} className="flex gap-2.5">
              <label htmlFor={`qc-${note.id}`} className="sr-only">
                Your answer
              </label>
              <input
                id={`qc-${note.id}`}
                type="text"
                value={quickInput}
                onChange={(e) => {
                  setQuickInput(e.target.value);
                  setQuickStatus('idle');
                }}
                placeholder={
                  note.quickCheck.unit
                    ? `Enter value (${note.quickCheck.unit})`
                    : 'Type your answer'
                }
                className="flex-1 px-3 py-2 text-sm sk-input font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold sk-btn-ink cursor-pointer shrink-0"
              >
                Check
              </button>
            </form>

            {quickStatus === 'correct' && (
              <div className="text-xs font-semibold text-emerald-700">
                Correct — full marks!
              </div>
            )}
            {quickStatus === 'incorrect' && (
              <div className="text-xs font-semibold text-rose-700">
                Not quite. Try the hint or reveal the worked solution below.
              </div>
            )}

            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--sk-dim)] hover:text-[var(--sk-ink)] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              <button
                type="button"
                onClick={() => setShowSolution((s) => !s)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--sk-pri-hover)] hover:text-[var(--sk-ink)] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                {showSolution ? 'Hide Solution' : 'Reveal Solution'}
              </button>
            </div>

            {showHint && (
              <p className="text-xs text-[var(--sk-body)] p-3 sk-card-soft">
                <MathText text={note.quickCheck.hint} />
              </p>
            )}
            {showSolution && (
              <p className="text-xs text-[var(--sk-ink)] p-3 rounded-xl bg-[var(--sk-chip)] border-[1.5px] border-[var(--sk-pri-bright)]">
                <MathText text={note.quickCheck.solution} />
              </p>
            )}
          </section>
        </div>

        {/* Linked Topical Past Paper PDFs for Annotation */}
        {matchingTopicalPacks.length > 0 && (
          <section
            aria-label="Topical Past Paper PDFs for this topic"
            className="p-5 sk-card space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm font-bold text-[var(--sk-ink)]">
                  Annotatable Topical Past Paper Sheets for {note.code} {note.title}
                </h2>
                <p className="text-xs text-[var(--sk-dim)] mt-0.5">
                  {subject === '0606'
                    ? 'Solve real PapaCambridge 0606 topical past paper PDFs directly in the browser using Pen, Highlighter, and Ruler.'
                    : 'Solve full exam-style topical PDFs side-by-side with worked solutions using Pen, Highlighter, and Ruler.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {matchingTopicalPacks.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={(e) => {
                    triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'));
                    onNavigate({
                      view: 'practice',
                      subject,
                      mode: 'topical-paper',
                      topicalPackId: pack.id,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold sk-btn-secondary cursor-pointer"
                >
                  <Columns2 className="w-3.5 h-3.5 text-[var(--sk-pri-hover)]" />
                  <span>{pack.title}</span>
                  {subject === '0580' && (
                    <span className="font-mono text-[11px] text-[var(--sk-dim)]">({pack.paperMode})</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--sk-acc)]" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Prev / Next & Past Paper Quick Links */}
        <footer className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {prev && (
              <button
                type="button"
                onClick={() =>
                  onNavigate({
                    view: 'notes',
                    subject,
                    chapterId: prev.chapterId,
                    topicId: prev.id,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold sk-btn-subtle cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {prev.code} {prev.title}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ view: 'past-papers', subject })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold sk-btn-subtle cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--sk-pri-hover)]" />
              {subject} Past Papers
            </button>
            {next && (
              <button
                type="button"
                onClick={() =>
                  onNavigate({
                    view: 'notes',
                    subject,
                    chapterId: next.chapterId,
                    topicId: next.id,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold sk-btn-ink cursor-pointer"
              >
                <span>
                  Next: {next.code} {next.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};
