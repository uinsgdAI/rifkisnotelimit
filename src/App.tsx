import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { SakugaCanvasOverlay } from './components/SakugaCanvasOverlay';
import { UniversalPageScroller } from './components/UniversalPageScroller';
import type { AppRoute, SubjectCode, SyllabusChapter } from './types/syllabus';
import {
  buildAppRoutePath,
  findSubtopicInSyllabus,
  parseAppRoute,
  resolvePracticeSection,
  resolveRouteSubject,
} from './utils/examLogic';
import { startBackgroundAppWarmup, setBackgroundWarmupPaused } from './utils/backgroundPreloader';
import {
  loadFormulaSheetModal,
  loadGraphCalculatorModal,
  loadNotesView,
  loadPastPapersView,
  loadPracticeExamView,
  loadSubjectSyllabus,
  preloadAllAppViews,
} from './utils/routePreloaders';

const NotesView = lazy(loadNotesView);
const PastPapersView = lazy(loadPastPapersView);
const PracticeExamView = lazy(loadPracticeExamView);
const FormulaSheetModal = lazy(loadFormulaSheetModal);
const GraphCalculatorModal = lazy(loadGraphCalculatorModal);

const STORAGE_KEYS: Record<SubjectCode, { studied: string; weak: string }> = {
  '0580': {
    studied: 'cambridge_0580_studied_topics_v1',
    weak: 'cambridge_0580_weak_topics_v1',
  },
  '0606': {
    studied: 'cambridge_0606_studied_topics_v1',
    weak: 'cambridge_0606_weak_topics_v1',
  },
};

function readStoredTopicList(key: string): string[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTopicList(key: string, items: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

const ViewLoadingFallback: React.FC<{ subject: SubjectCode }> = ({ subject }) => (
  <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
    <div
      role="status"
      aria-live="polite"
      className="p-8 sk-card flex items-center justify-center text-sm font-semibold text-[var(--sk-dim)]"
    >
      Loading Cambridge IGCSE {subject} resources...
    </div>
  </main>
);

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseAppRoute(window.location.pathname, window.location.search)
  );
  const activeSubject = resolveRouteSubject(route);

  const [syllabusBySubject, setSyllabusBySubject] = useState<
    Partial<Record<SubjectCode, SyllabusChapter[]>>
  >({});
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practiceNavNonce, setPracticeNavNonce] = useState(0);
  const [sakugaToast, setSakugaToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [studiedBySubject, setStudiedBySubject] = useState<Record<SubjectCode, string[]>>(() => ({
    '0580': readStoredTopicList(STORAGE_KEYS['0580'].studied),
    '0606': readStoredTopicList(STORAGE_KEYS['0606'].studied),
  }));
  const [weakBySubject, setWeakBySubject] = useState<Record<SubjectCode, string[]>>(() => ({
    '0580': readStoredTopicList(STORAGE_KEYS['0580'].weak),
    '0606': readStoredTopicList(STORAGE_KEYS['0606'].weak),
  }));

  const studiedTopicIds = studiedBySubject[activeSubject];
  const weakTopicIds = weakBySubject[activeSubject];
  const activeSyllabus = syllabusBySubject[activeSubject];

  useEffect(() => {
    if (syllabusBySubject[activeSubject]) return;
    let cancelled = false;
    loadSubjectSyllabus(activeSubject)
      .then((chapters) => {
        if (cancelled) return;
        setSyllabusBySubject((prev) =>
          prev[activeSubject] ? prev : { ...prev, [activeSubject]: chapters }
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [activeSubject, syllabusBySubject]);

  useLayoutEffect(() => {
    document.documentElement.dataset.subject = activeSubject;
  }, [activeSubject]);

  useEffect(() => {
    document.title =
      activeSubject === '0606'
        ? "Rifki's Notes — Cambridge IGCSE Additional Mathematics (0606) | Study Notes, Practice & Past Papers"
        : "Rifki's Notes — Cambridge IGCSE Mathematics (0580) | Study Notes, Mock Exams & Past Papers";
  }, [activeSubject]);

  useEffect(() => {
    setBackgroundWarmupPaused(route.view === 'past-papers');
  }, [route.view]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseAppRoute(window.location.pathname, window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    setBackgroundWarmupPaused(route.view === 'past-papers');
    const stopWarmup = startBackgroundAppWarmup({
      activeSubject,
      activeTopicId: route.view === 'notes' ? route.topicId : undefined,
      preloadViews: preloadAllAppViews,
    });
    return () => {
      stopWarmup();
      window.removeEventListener('popstate', handlePopState);
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
    // Run background warmup once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((message: string) => {
    setSakugaToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setSakugaToast(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  const navigate = useCallback((nextRoute: AppRoute, explicitPath?: string) => {
    const nextPath = explicitPath ?? buildAppRoutePath(nextRoute);
    const currentFull = `${window.location.pathname}${window.location.search}`;
    if (currentFull !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
    setRoute(nextRoute);
    if (nextRoute.view === 'practice') {
      setPracticeNavNonce((n) => n + 1);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSwitchSubject = useCallback(
    (nextSubject: SubjectCode) => {
      void loadSubjectSyllabus(nextSubject).catch(() => undefined);
      if (route.view === 'past-papers') {
        navigate({ view: 'past-papers', subject: nextSubject });
      } else if (route.view === 'practice') {
        const section = resolvePracticeSection(route.mode, route.topicalPackId);
        navigate({ view: 'practice', subject: nextSubject, mode: section });
      } else {
        navigate({
          view: 'notes',
          subject: nextSubject,
          chapterId: 1,
          topicId: '1.1',
        });
      }
    },
    [route, navigate]
  );

  const flagWeakTopics = useCallback(
    (topicIds: string[]) => {
      if (topicIds.length === 0) return;
      const targetSubject = activeSubject;
      setWeakBySubject((prev) => {
        const current = prev[targetSubject];
        const nextList = Array.from(new Set([...current, ...topicIds]));
        writeStoredTopicList(STORAGE_KEYS[targetSubject].weak, nextList);
        return { ...prev, [targetSubject]: nextList };
      });
    },
    [activeSubject]
  );

  const clearWeakTopic = useCallback(
    (topicId: string) => {
      const targetSubject = activeSubject;
      setWeakBySubject((prev) => {
        const current = prev[targetSubject];
        if (!current.includes(topicId)) return prev;
        const nextList = current.filter((id) => id !== topicId);
        writeStoredTopicList(STORAGE_KEYS[targetSubject].weak, nextList);
        return { ...prev, [targetSubject]: nextList };
      });
    },
    [activeSubject]
  );

  const toggleStudied = useCallback(
    (topicId: string) => {
      const targetSubject = activeSubject;
      const totalCount =
        syllabusBySubject[targetSubject]?.flatMap((c) => c.subtopics).length ||
        (targetSubject === '0606' ? 14 : 72);

      setStudiedBySubject((prev) => {
        const current = prev[targetSubject];
        const willBeStudied = !current.includes(topicId);
        const nextList = willBeStudied
          ? [...current, topicId]
          : current.filter((id) => id !== topicId);
        writeStoredTopicList(STORAGE_KEYS[targetSubject].studied, nextList);
        if (willBeStudied) {
          clearWeakTopic(topicId);
          showToast(
            `${targetSubject} Topic ${topicId} marked as studied (${nextList.length}/${totalCount})`
          );
        }
        return { ...prev, [targetSubject]: nextList };
      });
    },
    [activeSubject, syllabusBySubject, clearWeakTopic, showToast]
  );

  const activeNote = activeSyllabus
    ? (route.view === 'notes'
        ? findSubtopicInSyllabus(activeSyllabus, route.chapterId, route.topicId)
        : undefined) ||
      findSubtopicInSyllabus(activeSyllabus, 1, '1.1') ||
      activeSyllabus[0]?.subtopics[0]
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sk-page)] text-[var(--sk-ink)] overflow-x-clip">
      <Header
        activeSubject={activeSubject}
        activeView={route.view}
        activePracticeSection={
          route.view === 'practice'
            ? resolvePracticeSection(route.mode, route.topicalPackId)
            : undefined
        }
        onSwitchSubject={handleSwitchSubject}
        onNavigate={navigate}
        onGoHome={() =>
          navigate(
            { view: 'notes', subject: activeSubject, chapterId: 1, topicId: '1.1' },
            activeSubject === '0606' ? '/0606' : '/'
          )
        }
        onOpenFormulaSheet={() => setFormulaModalOpen(true)}
        onOpenGraphTool={() => setGraphModalOpen(true)}
        onStartQuickMock={() =>
          navigate({
            view: 'practice',
            subject: activeSubject,
            mode: activeSubject === '0606' ? 'practice-test' : 'mock-extended',
          })
        }
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
      />

      <div className="flex-1 w-full min-w-0">
        {!activeSyllabus ? (
          <ViewLoadingFallback subject={activeSubject} />
        ) : (
          <Suspense fallback={<ViewLoadingFallback subject={activeSubject} />}>
            {route.view === 'notes' && activeNote && (
              <NotesView
                subject={activeSubject}
                syllabus={activeSyllabus}
                chapterId={activeNote.chapterId}
                topicId={activeNote.id}
                note={activeNote}
                studiedTopicIds={studiedTopicIds}
                weakTopicIds={weakTopicIds}
                onToggleStudied={toggleStudied}
                onClearWeakTopic={clearWeakTopic}
                onNavigate={navigate}
              />
            )}

            {route.view === 'past-papers' && (
              <PastPapersView
                subject={activeSubject}
                syllabus={activeSyllabus}
                initialSessionSlug={route.sessionSlug}
                initialPaperFilename={route.paperFilename}
                weakTopicIds={weakTopicIds}
                onFlagWeakTopics={flagWeakTopics}
                onClearWeakTopic={clearWeakTopic}
                onNavigate={navigate}
              />
            )}

            {route.view === 'practice' && (
              <PracticeExamView
                subject={activeSubject}
                syllabus={activeSyllabus}
                initialMode={route.mode}
                initialTopicId={route.topicId}
                initialTopicalPackId={route.topicalPackId}
                navNonce={practiceNavNonce}
                onOpenFormulaSheet={() => setFormulaModalOpen(true)}
                onFlagWeakTopics={flagWeakTopics}
                onNavigate={navigate}
              />
            )}
          </Suspense>
        )}
      </div>

      <footer className="border-t-[1.5px] border-[var(--sk-line)] bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--sk-dim)]">
          <div>
            {activeSubject === '0606'
              ? 'Cambridge IGCSE Additional Mathematics (0606) · 2025–2027 Syllabus · Free Study Notes, Practice & Past Papers'
              : 'Cambridge IGCSE Mathematics (0580) · 2025–2027 Syllabus · Free Study Notes & Practice'}
          </div>
          <div className="flex items-center gap-5">
            {activeSubject === '0606' ? (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    view: 'notes',
                    subject: '0606',
                    chapterId: 14,
                    topicId: '14.1',
                  })
                }
                className="hover:text-[var(--sk-ink)] font-medium cursor-pointer"
              >
                14.1 Calculus
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate({ view: 'notes', subject: '0580', chapterId: 1, topicId: '1.16' })
                }
                className="hover:text-[var(--sk-ink)] font-medium cursor-pointer"
              >
                1.16 Money
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate({ view: 'past-papers', subject: activeSubject })}
              className="hover:text-[var(--sk-ink)] font-medium cursor-pointer"
            >
              PapaCambridge {activeSubject} Papers
            </button>
            <button
              type="button"
              onClick={() => navigate({ view: 'practice', subject: activeSubject })}
              className="hover:text-[var(--sk-ink)] font-medium cursor-pointer"
            >
              Practice Exams
            </button>
          </div>
        </div>
      </footer>

      {sakugaToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-[var(--sk-ink)] text-white text-xs font-semibold rounded-xl border-2 border-[var(--sk-ink)] shadow-[3px_4px_0_var(--sk-soft)] pointer-events-none"
        >
          {sakugaToast}
        </div>
      )}

      {formulaModalOpen && (
        <Suspense fallback={null}>
          <FormulaSheetModal
            open={formulaModalOpen}
            subject={activeSubject}
            onClose={() => setFormulaModalOpen(false)}
          />
        </Suspense>
      )}
      {graphModalOpen && (
        <Suspense fallback={null}>
          <GraphCalculatorModal
            open={graphModalOpen}
            initialTopicId={route.view === 'notes' && activeNote ? activeNote.id : 'general'}
            onClose={() => setGraphModalOpen(false)}
          />
        </Suspense>
      )}
      <UniversalPageScroller />
      <SakugaCanvasOverlay />
    </div>
  );
}
