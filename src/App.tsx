import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { NotesView } from './components/NotesView';
import { PastPapersView } from './components/PastPapersView';
import { PracticeExamView } from './components/PracticeExamView';
import { SakugaCanvasOverlay } from './components/SakugaCanvasOverlay';
import { UniversalPageScroller } from './components/UniversalPageScroller';
import { ALL_SUBTOPICS_0580, findSubtopic } from './data/syllabus0580';
import type { AppRoute } from './types/syllabus';
import { buildAppRoutePath, parseAppRoute } from './utils/examLogic';
import { startBackgroundAppWarmup, setBackgroundWarmupPaused } from './utils/backgroundPreloader';
import {
  loadFormulaSheetModal,
  loadGraphCalculatorModal,
  preloadAllAppViews,
} from './utils/routePreloaders';

const FormulaSheetModal = lazy(loadFormulaSheetModal);
const GraphCalculatorModal = lazy(loadGraphCalculatorModal);

const STUDIED_STORAGE_KEY = 'cambridge_0580_studied_topics_v1';
const WEAK_STORAGE_KEY = 'cambridge_0580_weak_topics_v1';

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseAppRoute(window.location.pathname, window.location.search)
  );
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sakugaToast, setSakugaToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [studiedTopicIds, setStudiedTopicIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STUDIED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [weakTopicIds, setWeakTopicIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(WEAK_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const flagWeakTopics = useCallback((topicIds: string[]) => {
    if (topicIds.length === 0) return;
    setWeakTopicIds((prev) => {
      const next = Array.from(new Set([...prev, ...topicIds]));
      try {
        window.localStorage.setItem(WEAK_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  }, []);

  const clearWeakTopic = useCallback((topicId: string) => {
    setWeakTopicIds((prev) => {
      if (!prev.includes(topicId)) return prev;
      const next = prev.filter((id) => id !== topicId);
      try {
        window.localStorage.setItem(WEAK_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  }, []);

  const toggleStudied = useCallback((topicId: string) => {
    setStudiedTopicIds((prev) => {
      const willBeStudied = !prev.includes(topicId);
      const next = willBeStudied
        ? [...prev, topicId]
        : prev.filter((id) => id !== topicId);
      try {
        window.localStorage.setItem(STUDIED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      if (willBeStudied) {
        clearWeakTopic(topicId);
        showToast(`Topic ${topicId} marked as studied (${next.length}/${ALL_SUBTOPICS_0580.length})`);
      }
      return next;
    });
  }, [clearWeakTopic, showToast]);

  const activeNote =
    route.view === 'notes'
      ? findSubtopic(route.chapterId, route.topicId) ||
        findSubtopic(1, '1.1') ||
        ALL_SUBTOPICS_0580[0]
      : ALL_SUBTOPICS_0580[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#1D1A4A] overflow-x-clip">
      <Header
        activeView={route.view}
        onNavigate={navigate}
        onGoHome={() => navigate({ view: 'notes', chapterId: 1, topicId: '1.1' }, '/')}
        onOpenFormulaSheet={() => setFormulaModalOpen(true)}
        onOpenGraphTool={() => setGraphModalOpen(true)}
        onStartQuickMock={() =>
          navigate({ view: 'practice', mode: 'mock-extended' })
        }
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
      />

      <div className="flex-1 w-full min-w-0 pr-11 sm:pr-12">
        {route.view === 'notes' && (
          <NotesView
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
            initialMode={route.mode}
            initialTopicId={route.topicId}
            initialTopicalPackId={route.topicalPackId}
            onOpenFormulaSheet={() => setFormulaModalOpen(true)}
            onFlagWeakTopics={flagWeakTopics}
            onNavigate={navigate}
          />
        )}
      </div>

      <footer className="border-t-[1.5px] border-[#DCDAF0] bg-white mt-12 pr-11 sm:pr-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#5E588C]">
          <div>
            Cambridge IGCSE Mathematics (0580) · 2025–2027 Syllabus · Free Study Notes &amp; Practice
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigate({ view: 'notes', chapterId: 1, topicId: '1.16' })}
              className="hover:text-[#1D1A4A] font-medium cursor-pointer"
            >
              1.16 Money
            </button>
            <button
              type="button"
              onClick={() => navigate({ view: 'past-papers' })}
              className="hover:text-[#1D1A4A] font-medium cursor-pointer"
            >
              PapaCambridge 0580 Papers
            </button>
            <button
              type="button"
              onClick={() => navigate({ view: 'practice' })}
              className="hover:text-[#1D1A4A] font-medium cursor-pointer"
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
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-[#1D1A4A] text-white text-xs font-semibold rounded-xl border-2 border-[#1D1A4A] shadow-[3px_4px_0_#B8B3FF] pointer-events-none"
        >
          {sakugaToast}
        </div>
      )}

      {formulaModalOpen && (
        <Suspense fallback={null}>
          <FormulaSheetModal
            open={formulaModalOpen}
            onClose={() => setFormulaModalOpen(false)}
          />
        </Suspense>
      )}
      {graphModalOpen && (
        <Suspense fallback={null}>
          <GraphCalculatorModal
            open={graphModalOpen}
            initialTopicId={route.view === 'notes' ? activeNote.id : 'general'}
            onClose={() => setGraphModalOpen(false)}
          />
        </Suspense>
      )}
      <UniversalPageScroller />
      <SakugaCanvasOverlay />
    </div>
  );
}
