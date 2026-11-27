import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Columns2,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Pen,
  Search,
  Upload,
  X,
} from 'lucide-react';
import type {
  AppRoute,
  PastPaperFile,
  PastPaperSession,
  SubjectCode,
  SyllabusChapter,
} from '../types/syllabus';
import { findMatchingSyllabusTopics } from '../utils/examLogic';
import {
  generateSessionPaperFallback,
  getFallbackSessions,
  resolvePdfIframeUrl,
} from '../utils/papacambridge';
import {
  acquireFullscreenBodyLock,
  buildPdfByteCandidateUrls,
  prefetchPdfBytes,
} from '../utils/pdfAnnotations';
import { setBackgroundWarmupPaused } from '../utils/backgroundPreloader';
import { warmSharedPdfWorker } from '../utils/pdfJsCache';
import { MathText } from './MathText';
import { PdfAnnotator } from './PdfAnnotator';
import { getActiveSubjectVfxVariant, triggerSakugaBurst } from '../utils/sakugaVfx';

const cachedSessionsBySubject = new Map<SubjectCode, PastPaperSession[]>();
const cachedPapersByKey = new Map<string, PastPaperFile[]>();

interface PastPapersViewProps {
  subject: SubjectCode;
  syllabus: SyllabusChapter[];
  initialSessionSlug?: string;
  initialPaperFilename?: string;
  weakTopicIds: string[];
  onFlagWeakTopics: (topicIds: string[]) => void;
  onClearWeakTopic: (topicId: string) => void;
  onNavigate: (route: AppRoute) => void;
}

async function fetchJsonSafe<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('Non-JSON response (static host without API functions)');
  }
  return (await res.json()) as T;
}

const DOC_TYPE_ORDER: Record<PastPaperFile['docType'], number> = {
  QP: 0,
  MS: 1,
  IN: 2,
  ER: 3,
  GT: 4,
  OTHER: 5,
};

const QUICK_TROUBLE_TOPICS_0580 = [
  { label: 'Polygon angles', query: 'polygon' },
  { label: 'Statistics & averages', query: 'statistics' },
  { label: 'Histograms', query: 'histogram' },
  { label: 'Cumulative frequency', query: 'cumulative' },
  { label: 'Circle theorems', query: 'circle theorem' },
  { label: 'Trigonometry', query: 'trigonometry' },
  { label: 'Bearings', query: 'bearing' },
];

const QUICK_TROUBLE_TOPICS_0606 = [
  { label: 'Functions', query: 'functions' },
  { label: 'Quadratic functions', query: 'quadratic' },
  { label: 'Logarithms & exponentials', query: 'logarithmic' },
  { label: 'Circular measure', query: 'circular' },
  { label: 'Trigonometry', query: 'trigonometry' },
  { label: 'Permutations & combinations', query: 'permutations' },
  { label: 'Calculus', query: 'calculus' },
];

export const PastPapersView: React.FC<PastPapersViewProps> = ({
  subject,
  syllabus,
  initialSessionSlug,
  initialPaperFilename,
  weakTopicIds,
  onFlagWeakTopics,
  onClearWeakTopic,
  onNavigate,
}) => {
  const allSubtopics = useMemo(
    () => syllabus.flatMap((c) => c.subtopics),
    [syllabus]
  );

  const [sessions, setSessions] = useState<PastPaperSession[]>(
    () => cachedSessionsBySubject.get(subject) || getFallbackSessions(subject)
  );
  const [selectedSession, setSelectedSession] = useState<string>(
    initialSessionSlug || '2024-may-june'
  );
  const [papers, setPapers] = useState<PastPaperFile[]>(() => {
    const slug = initialSessionSlug || '2024-may-june';
    return (
      cachedPapersByKey.get(`${subject}:${slug}`) ||
      generateSessionPaperFallback(slug, subject)
    );
  });
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [apiProxyAvailable, setApiProxyAvailable] = useState(true);
  const [viewerMode, setViewerMode] = useState<'annotate' | 'proxy' | 'web'>('proxy');
  const [localPdf, setLocalPdf] = useState<{ url: string; filename: string } | null>(null);
  const localFileInputRef = useRef<HTMLInputElement | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [eraFilter, setEraFilter] = useState<'all' | '2020-2026' | '2010-2019' | '2002-2009'>('all');
  const [paperFilter, setPaperFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [docFilter, setDocFilter] = useState<'all' | 'QP' | 'MS' | 'ER' | 'GT'>('all');
  const [paperSearchQuery, setPaperSearchQuery] = useState('');
  const [activePrimaryPdf, setActivePrimaryPdf] = useState<PastPaperFile | null>(null);
  const [activeSecondaryPdf, setActiveSecondaryPdf] = useState<PastPaperFile | null>(null);
  const [topicQuery, setTopicQuery] = useState('');
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);
  const enteredNativeViewerFsRef = useRef(false);

  useEffect(() => {
    setActivePrimaryPdf(null);
    setActiveSecondaryPdf(null);
    setLocalPdf(null);
    setPaperFilter('all');
    setDocFilter('all');
    setPaperSearchQuery('');
    setTopicQuery('');
  }, [subject]);

  useEffect(() => {
    setBackgroundWarmupPaused(true);
    return () => {
      setBackgroundWarmupPaused(false);
    };
  }, []);

  useEffect(() => {
    if (viewerMode !== 'annotate') return;
    const timer = window.setTimeout(() => warmSharedPdfWorker(), 120);
    return () => window.clearTimeout(timer);
  }, [viewerMode]);

  const exitViewerFullscreen = () => {
    setIsViewerFullscreen(false);
    if (
      enteredNativeViewerFsRef.current &&
      typeof document !== 'undefined' &&
      document.fullscreenElement === viewerRef.current &&
      typeof document.exitFullscreen === 'function'
    ) {
      document.exitFullscreen().catch(() => undefined);
    }
    enteredNativeViewerFsRef.current = false;
  };

  const toggleViewerFullscreen = () => {
    if (isViewerFullscreen) {
      exitViewerFullscreen();
      return;
    }
    setIsViewerFullscreen(true);
    const el = viewerRef.current;
    if (
      el &&
      typeof el.requestFullscreen === 'function' &&
      typeof document !== 'undefined' &&
      !document.fullscreenElement
    ) {
      try {
        Promise.resolve(el.requestFullscreen())
          .then(() => {
            enteredNativeViewerFsRef.current = true;
          })
          .catch(() => {
            enteredNativeViewerFsRef.current = false;
          });
      } catch {
        enteredNativeViewerFsRef.current = false;
      }
    }
  };

  useEffect(() => {
    if (!isViewerFullscreen) return;
    const releaseLock = acquireFullscreenBodyLock();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsViewerFullscreen(false);
        if (
          enteredNativeViewerFsRef.current &&
          typeof document !== 'undefined' &&
          document.fullscreenElement === viewerRef.current &&
          typeof document.exitFullscreen === 'function'
        ) {
          document.exitFullscreen().catch(() => undefined);
        }
        enteredNativeViewerFsRef.current = false;
      }
    };
    const onFsChange = () => {
      if (enteredNativeViewerFsRef.current && !document.fullscreenElement) {
        enteredNativeViewerFsRef.current = false;
        setIsViewerFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      releaseLock();
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [isViewerFullscreen]);

  useEffect(() => {
    return () => {
      if (
        enteredNativeViewerFsRef.current &&
        typeof document !== 'undefined' &&
        document.fullscreenElement === viewerRef.current &&
        typeof document.exitFullscreen === 'function'
      ) {
        document.exitFullscreen().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (localPdf?.url) {
        URL.revokeObjectURL(localPdf.url);
      }
    };
  }, [localPdf]);

  useEffect(() => {
    const cachedList = cachedSessionsBySubject.get(subject);
    if (cachedList) {
      setSessions(cachedList);
      return;
    }
    const fallbackList = getFallbackSessions(subject);
    setSessions(fallbackList);
    let cancelled = false;
    setLoadingSessions(true);
    fetchJsonSafe<{ sessions?: PastPaperSession[] }>(
      `/api/papacambridge/sessions?subject=${encodeURIComponent(subject)}`
    )
      .then((data) => {
        if (cancelled) return;
        const list =
          Array.isArray(data.sessions) && data.sessions.length > 0
            ? data.sessions
            : fallbackList;
        cachedSessionsBySubject.set(subject, list);
        setSessions(list);
        setApiProxyAvailable(true);
        if (!initialSessionSlug && list.length > 0) {
          const defaultSess =
            list.find((s) => s.slug === '2024-may-june')?.slug || list[0].slug;
          setSelectedSession(defaultSess);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setApiProxyAvailable(false);
        setViewerMode((prev) => (prev === 'proxy' || prev === 'annotate' ? 'web' : prev));
        setSessions(fallbackList);
      })
      .finally(() => {
        if (!cancelled) setLoadingSessions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialSessionSlug, subject]);

  useEffect(() => {
    if (!selectedSession) return;
    const cacheKey = `${subject}:${selectedSession}`;
    const cachedList = cachedPapersByKey.get(cacheKey);
    if (cachedList) {
      setPapers(cachedList);
      setLoadingPapers(false);
      return;
    }

    // Show immediate fallback list while refreshing live PapaCambridge listing in the background
    const fallbackPapers = generateSessionPaperFallback(selectedSession, subject);
    setPapers(fallbackPapers);
    let cancelled = false;
    setLoadingPapers(true);
    fetchJsonSafe<{ papers?: PastPaperFile[] }>(
      `/api/papacambridge/papers?session=${encodeURIComponent(selectedSession)}&subject=${encodeURIComponent(subject)}`
    )
      .then((data) => {
        if (cancelled) return;
        const list =
          Array.isArray(data.papers) && data.papers.length > 0
            ? data.papers
            : fallbackPapers;
        cachedPapersByKey.set(cacheKey, list);
        setPapers(list);
        setApiProxyAvailable(true);
      })
      .catch(() => {
        if (cancelled) return;
        setApiProxyAvailable(false);
        setViewerMode((prev) => (prev === 'proxy' || prev === 'annotate' ? 'web' : prev));
        setPapers(fallbackPapers);
      })
      .finally(() => {
        if (!cancelled) setLoadingPapers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSession, subject]);

  useEffect(() => {
    if (initialSessionSlug && initialSessionSlug !== selectedSession) {
      setSelectedSession(initialSessionSlug);
    }
  }, [initialSessionSlug, selectedSession]);

  useEffect(() => {
    if (!initialPaperFilename) return;
    const match = papers.find(
      (p) => p.filename.toLowerCase() === initialPaperFilename.toLowerCase()
    );
    if (match) {
      setActivePrimaryPdf(match);
      const ms = papers.find(
        (p) =>
          p.docType === 'MS' &&
          p.paperNumber === match.paperNumber &&
          p.variant === match.variant
      );
      setActiveSecondaryPdf(ms || null);
    }
  }, [initialPaperFilename, papers]);

  const visibleSessions = useMemo(() => {
    if (eraFilter === 'all') return sessions;
    return sessions.filter((s) => {
      if (eraFilter === '2020-2026') return s.year >= 2020;
      if (eraFilter === '2010-2019') return s.year >= 2010 && s.year <= 2019;
      return s.year >= 2002 && s.year <= 2009;
    });
  }, [sessions, eraFilter]);

  const handleSessionChange = (slug: string) => {
    setSelectedSession(slug);
    setActivePrimaryPdf(null);
    setActiveSecondaryPdf(null);
    onNavigate({ view: 'past-papers', subject, sessionSlug: slug });
  };

  const handleEraChange = (era: 'all' | '2020-2026' | '2010-2019' | '2002-2009') => {
    setEraFilter(era);
    const matching =
      era === 'all'
        ? sessions
        : sessions.filter((s) =>
            era === '2020-2026'
              ? s.year >= 2020
              : era === '2010-2019'
                ? s.year >= 2010 && s.year <= 2019
                : s.year >= 2002 && s.year <= 2009
          );
    if (matching.length > 0 && !matching.some((s) => s.slug === selectedSession)) {
      handleSessionChange(matching[0].slug);
    }
  };

  const filteredPapers = useMemo(() => {
    const q = paperSearchQuery.trim().toLowerCase();
    return papers
      .filter((p) => {
        const okPaper = paperFilter === 'all' || p.paperNumber === paperFilter;
        const okDoc = docFilter === 'all' || p.docType === docFilter;
        const okSearch =
          !q ||
          p.filename.toLowerCase().includes(q) ||
          p.docTypeLabel.toLowerCase().includes(q) ||
          p.tier.toLowerCase().includes(q) ||
          `paper ${p.paperNumber}`.includes(q) ||
          `variant ${p.variant}`.includes(q);
        return okPaper && okDoc && okSearch;
      })
      .sort((a, b) => {
        const docDiff = DOC_TYPE_ORDER[a.docType] - DOC_TYPE_ORDER[b.docType];
        if (docDiff !== 0) return docDiff;
        const paperA = a.paperNumber === '-' ? 99 : Number(a.paperNumber);
        const paperB = b.paperNumber === '-' ? 99 : Number(b.paperNumber);
        if (paperA !== paperB) return paperA - paperB;
        const varA = a.variant === '-' ? 99 : Number(a.variant);
        const varB = b.variant === '-' ? 99 : Number(b.variant);
        if (varA !== varB) return varA - varB;
        return a.filename.localeCompare(b.filename);
      });
  }, [papers, paperFilter, docFilter, paperSearchQuery]);

  const findMatchingMarkScheme = (qp: PastPaperFile): PastPaperFile | undefined => {
    return papers.find(
      (p) =>
        p.docType === 'MS' &&
        p.paperNumber === qp.paperNumber &&
        p.variant === qp.variant
    );
  };

  const openSplitView = (qp: PastPaperFile) => {
    if (localPdf) setLocalPdf(null);
    setActivePrimaryPdf(qp);
    const ms = findMatchingMarkScheme(qp);
    setActiveSecondaryPdf(ms || null);
    setViewerMode(apiProxyAvailable ? 'proxy' : 'web');
    window.requestAnimationFrame(() => {
      viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleOpenLocalPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setLocalPdf({ url: blobUrl, filename: file.name });
    setActivePrimaryPdf(null);
    setActiveSecondaryPdf(null);
    setViewerMode('annotate');
    e.target.value = '';
  };

  const pdfBytesUrl = (file: PastPaperFile) =>
    `/api/papacambridge/pdf?url=${encodeURIComponent(file.url)}`;

  const pdfDownloadUrl = (file: PastPaperFile) =>
    apiProxyAvailable ? pdfBytesUrl(file) : file.url;

  const pdfIframeUrl = (file: PastPaperFile) =>
    resolvePdfIframeUrl(file.url, {
      apiProxyAvailable,
      viewerMode: viewerMode === 'web' ? 'web' : 'proxy',
    });

  const topicMatches = useMemo(
    () => findMatchingSyllabusTopics(topicQuery, syllabus, 6),
    [topicQuery, syllabus]
  );

  const flaggedTopics = useMemo(
    () =>
      weakTopicIds
        .map((id) => allSubtopics.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [weakTopicIds, allSubtopics]
  );

  const quickTroubleTopics =
    subject === '0606' ? QUICK_TROUBLE_TOPICS_0606 : QUICK_TROUBLE_TOPICS_0580;

  const componentFilterOptions: ReadonlyArray<'all' | '1' | '2' | '3' | '4'> =
    subject === '0606' ? ['all', '1', '2'] : ['all', '1', '2', '3', '4'];

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <section className="p-6 sk-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[var(--sk-dim)] flex items-center gap-2 mb-1">
            <span>
              {subject === '0606'
                ? 'Cambridge IGCSE Additional Mathematics (0606)'
                : 'Cambridge IGCSE Mathematics (0580)'}
            </span>
            <span aria-hidden="true">·</span>
            <span>PapaCambridge Archive</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--sk-ink)]">
            Past Papers, Mark Schemes &amp; Grade Thresholds
          </h1>
          <p className="text-sm text-[var(--sk-body)] mt-1 max-w-2xl">
            Browse Cambridge {subject} Question Papers, Mark Schemes, Examiner Reports, and Grade Thresholds from 2002 to 2026 via PapaCambridge, and view QP + MS side-by-side.
          </p>
        </div>

        <div className="text-xs text-[var(--sk-body)] sk-card-soft p-3.5 space-y-1 shrink-0">
          <div className="font-bold text-[var(--sk-ink)]">2025–2027 Paper Structure</div>
          {subject === '0606' ? (
            <>
              <div>Paper 1: Non-Calculator (2h, 80 marks · 50%)</div>
              <div>Paper 2: Calculator (2h, 80 marks · 50%)</div>
            </>
          ) : (
            <>
              <div>Core: Paper 1 (Non-Calc, 1h 30m) · Paper 3 (Calc, 1h 30m)</div>
              <div>Extended: Paper 2 (Non-Calc, 2h) · Paper 4 (Calc, 2h)</div>
            </>
          )}
        </div>
      </section>

      {/* Controls Bar */}
      <section className="p-4 sk-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-[11px] font-semibold text-[var(--sk-dim)] mb-1">Archive Era</div>
            <div role="group" aria-label="Filter archive by era" className="flex gap-1 sk-tabs">
              {(
                [
                  { id: 'all', label: 'All (02–26)' },
                  { id: '2020-2026', label: '2020–26' },
                  { id: '2010-2019', label: '2010–19' },
                  { id: '2002-2009', label: '2002–09' },
                ] as const
              ).map((era) => (
                <button
                  key={era.id}
                  type="button"
                  data-active={eraFilter === era.id}
                  onClick={() => handleEraChange(era.id)}
                  className="px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="session-select" className="block text-[11px] font-semibold text-[var(--sk-dim)] mb-1">
              Exam Session ({visibleSessions.length})
            </label>
            <select
              id="session-select"
              value={selectedSession}
              disabled={loadingSessions}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="min-w-[190px] px-3 py-2 text-xs font-semibold sk-input cursor-pointer"
            >
              {!visibleSessions.some((s) => s.slug === selectedSession) && (
                <option value={selectedSession}>{selectedSession}</option>
              )}
              {visibleSessions.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[var(--sk-dim)] mb-1">Component Paper</div>
            <div role="group" aria-label="Filter by paper component" className="flex gap-1 sk-tabs">
              {componentFilterOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  data-active={paperFilter === p}
                  onClick={() => setPaperFilter(p)}
                  className="px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
                >
                  {p === 'all' ? 'All Papers' : `Paper ${p}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[var(--sk-dim)] mb-1">Document Type</div>
            <div role="group" aria-label="Filter by document type" className="flex gap-1 sk-tabs">
              {(['all', 'QP', 'MS', 'ER', 'GT'] as const).map((dt) => (
                <button
                  key={dt}
                  type="button"
                  data-active={docFilter === dt}
                  onClick={() => setDocFilter(dt)}
                  className="px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
                >
                  {dt === 'all' ? 'All' : dt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <label htmlFor="past-papers-search" className="sr-only">
              Search past paper files
            </label>
            <Search className="w-3.5 h-3.5 text-[var(--sk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              id="past-papers-search"
              type="search"
              value={paperSearchQuery}
              onChange={(e) => setPaperSearchQuery(e.target.value)}
              placeholder={subject === '0606' ? 'Search file (e.g. qp_12, ms)' : 'Search file (e.g. qp_42, ms)'}
              className="w-full pl-8 pr-3 py-1.5 text-xs sk-input"
            />
          </div>

          <input
            ref={localFileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleOpenLocalPdf}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => localFileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold sk-btn-secondary cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--sk-pri-hover)]" />
            Annotate Local PDF
          </button>
          <div className="text-xs font-mono font-semibold tabular-nums text-[var(--sk-dim)]">
            {filteredPapers.length} files available
            {loadingPapers ? ' (syncing...)' : ''}
          </div>
        </div>
      </section>

      {/* Stuck on a Past Paper Question? Bridge directly to Topic Notes */}
      <section
        aria-label="Jump to Study Notes from Past Paper Mistakes"
        className="p-5 sk-card space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--sk-pri-hover)] shrink-0" />
              <h2 className="font-display text-sm font-bold text-[var(--sk-ink)]">
                Got a Question Wrong in This Past Paper? Jump to Its Notes
              </h2>
            </div>
            <p className="text-xs text-[var(--sk-body)] mt-1">
              {subject === '0606'
                ? 'Type the topic you struggled with while marking (for example, functions, logarithms, circle geometry, trigonometry, or calculus) to open the matching 0606 notes or save it to your revision queue.'
                : 'Type the topic you struggled with while marking (for example, polygon angles, statistics, histogram, or circle theorems) to open the exact 0580 notes or save it to your revision queue.'}
            </p>
          </div>

          <div className="relative w-full lg:w-96 shrink-0">
            <label htmlFor="pastpaper-topic-finder" className="sr-only">
              Find {subject} notes for a past paper question topic
            </label>
            <Search className="w-4 h-4 text-[var(--sk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              id="pastpaper-topic-finder"
              type="search"
              value={topicQuery}
              onChange={(e) => setTopicQuery(e.target.value)}
              placeholder={
                subject === '0606'
                  ? 'What topic did you miss? (e.g. calculus, vectors)'
                  : 'What topic did you miss? (e.g. polygon, statistics)'
              }
              className="w-full pl-9 pr-3 py-2 text-xs sk-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[var(--sk-dim)]">Common topics:</span>
          {quickTroubleTopics.map((item) => {
            const active = topicQuery.trim().toLowerCase() === item.query;
            return (
              <button
                key={item.query}
                type="button"
                onClick={() => setTopicQuery(active ? '' : item.query)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-xl border-[1.5px] cursor-pointer transition-colors ${
                  active
                    ? 'bg-[var(--sk-chip)] border-[var(--sk-ink)] text-[var(--sk-ink)] shadow-[2px_2px_0_var(--sk-soft)]'
                    : 'bg-[var(--sk-surface)] border-[var(--sk-line)] text-[var(--sk-body)] hover:border-[var(--sk-ink)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {topicQuery.trim().length > 0 && (
          <div className="pt-2 border-t border-[var(--sk-line)]">
            {topicMatches.length === 0 ? (
              <div className="text-xs text-[var(--sk-dim)] py-2">
                No syllabus notes matched &quot;{topicQuery}&quot;.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {topicMatches.map((m) => {
                  const isFlagged = weakTopicIds.includes(m.topic.id);
                  return (
                    <div
                      key={m.topic.id}
                      className="p-3.5 sk-card-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] text-[var(--sk-dim)]">
                          Chapter {m.chapterId}: {m.chapterTitle} · {m.matchReason}
                        </div>
                        <div className="font-display text-sm font-bold text-[var(--sk-ink)]">
                          <span className="font-mono text-[var(--sk-pri-hover)] mr-1.5">{m.topic.code}</span>
                          {m.topic.title}
                        </div>
                        <p className="text-xs text-[var(--sk-body)] line-clamp-1 mt-0.5">
                          <MathText text={m.topic.summary} />
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            isFlagged
                              ? onClearWeakTopic(m.topic.id)
                              : onFlagWeakTopics([m.topic.id])
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border-[1.5px] cursor-pointer ${
                            isFlagged
                              ? 'bg-[var(--sk-acc-soft)] border-[var(--sk-acc)] text-[var(--sk-acc-ink)]'
                              : 'sk-btn-subtle'
                          }`}
                        >
                          {isFlagged && <Check className="w-3.5 h-3.5" />}
                          {isFlagged ? 'Flagged' : 'Flag Missed'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onFlagWeakTopics([m.topic.id]);
                            onNavigate({
                              view: 'notes',
                              subject,
                              chapterId: m.chapterId,
                              topicId: m.topic.id,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold sk-btn-primary cursor-pointer"
                        >
                          Study {m.topic.code} Notes
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {flaggedTopics.length > 0 && (
          <div className="pt-3 border-t border-[var(--sk-line)] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[var(--sk-ink)] mr-1">
              Revision Queue ({flaggedTopics.length}):
            </span>
            {flaggedTopics.map((ft) => (
              <div
                key={ft.id}
                className="inline-flex items-center bg-[var(--sk-acc-soft)] border-[1.5px] border-[var(--sk-acc)] rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    onNavigate({
                      view: 'notes',
                      subject,
                      chapterId: ft.chapterId,
                      topicId: ft.id,
                    })
                  }
                  className="px-2.5 py-1 text-xs font-semibold text-[var(--sk-acc-ink)] hover:bg-[var(--sk-chip)] cursor-pointer"
                >
                  Study {ft.code} {ft.title} →
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${ft.code} ${ft.title} from revision queue`}
                  onClick={() => onClearWeakTopic(ft.id)}
                  className="px-1.5 py-1 text-[var(--sk-acc-ink)] hover:text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] border-l border-[var(--sk-acc)]/40 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Split-Screen PDF Viewer & Annotator when active */}
      {(activePrimaryPdf || localPdf) && (
        <section
          ref={viewerRef}
          aria-label="Past Paper Document Viewer"
          data-fullscreen={isViewerFullscreen}
          className={
            isViewerFullscreen
              ? 'fixed inset-0 z-[65] w-screen h-screen h-[100dvh] bg-white flex flex-col overflow-hidden'
              : 'sk-card border-2 border-[var(--sk-ink)] shadow-[4px_5px_0_var(--sk-soft)] overflow-hidden scroll-mt-20'
          }
        >
          <div
            className={`${
              isViewerFullscreen ? 'px-3 py-1.5 gap-2' : 'px-4 py-2.5 gap-2.5'
            } border-b-[1.5px] border-[var(--sk-line)] bg-[var(--sk-surface)] flex flex-wrap items-center justify-between shrink-0`}
          >
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--sk-ink)] min-w-0 truncate">
              <span className="font-bold truncate">
                {localPdf ? localPdf.filename : activePrimaryPdf?.filename}
              </span>
              {activeSecondaryPdf && (
                <>
                  <span aria-hidden="true">+</span>
                  <span className="font-bold text-emerald-800 truncate">
                    {activeSecondaryPdf.filename}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {!localPdf && (
                <div
                  role="group"
                  aria-label="PDF viewer engine"
                  className="inline-flex gap-1 sk-tabs"
                >
                  {apiProxyAvailable && (
                    <button
                      type="button"
                      data-active={viewerMode === 'proxy'}
                      onClick={() => setViewerMode('proxy')}
                      className="px-2.5 py-1 text-xs font-semibold cursor-pointer sk-tab"
                    >
                      PapaCambridge API PDF
                    </button>
                  )}
                  {apiProxyAvailable && (
                    <button
                      type="button"
                      data-active={viewerMode === 'annotate'}
                      onClick={() => setViewerMode('annotate')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer sk-tab"
                    >
                      <Pen className="w-3 h-3" />
                      Annotate (Draw)
                    </button>
                  )}
                  <button
                    type="button"
                    data-active={viewerMode === 'web'}
                    onClick={() => setViewerMode('web')}
                    className="px-2.5 py-1 text-xs font-semibold cursor-pointer sk-tab"
                  >
                    Web Viewer
                  </button>
                </div>
              )}
              {!isViewerFullscreen && activePrimaryPdf && (
                <a
                  href={activePrimaryPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold sk-btn-subtle"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open QP
                </a>
              )}
              {!isViewerFullscreen && activeSecondaryPdf && (
                <a
                  href={activeSecondaryPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border-[1.5px] border-emerald-600 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open MS
                </a>
              )}
              {(Boolean(activeSecondaryPdf) || (!localPdf && viewerMode !== 'annotate')) && (
                <button
                  type="button"
                  data-testid="pastpapers-viewer-fullscreen-btn"
                  onClick={toggleViewerFullscreen}
                  aria-pressed={isViewerFullscreen}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                    isViewerFullscreen ? 'sk-btn-secondary' : 'sk-btn-subtle'
                  }`}
                >
                  {isViewerFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      {activeSecondaryPdf ? 'Fullscreen Split' : 'Fullscreen'}
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  exitViewerFullscreen();
                  setLocalPdf(null);
                  setActivePrimaryPdf(null);
                  setActiveSecondaryPdf(null);
                }}
                className="px-3 py-1.5 text-xs font-bold sk-btn-ink cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>

          <div
            className={`grid gap-px bg-[var(--sk-line)] ${
              isViewerFullscreen ? 'flex-1 min-h-0' : ''
            } ${
              activeSecondaryPdf
                ? isViewerFullscreen
                  ? 'grid-rows-2 lg:grid-rows-1 lg:grid-cols-2'
                  : 'lg:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            <div className="bg-white min-w-0 min-h-0 flex flex-col" data-testid="qp-pane">
              {!isViewerFullscreen && (
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--sk-dim)] border-b border-[var(--sk-line)] flex items-center justify-between gap-2 shrink-0">
                  <span>
                    {localPdf
                      ? `Local PDF Annotation — ${localPdf.filename}`
                      : `${activePrimaryPdf?.docTypeLabel} — ${activePrimaryPdf?.filename}`}
                  </span>
                  {activePrimaryPdf && (
                    <a
                      href={activePrimaryPdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--sk-pri-hover)] hover:underline shrink-0"
                    >
                      Open in new tab
                    </a>
                  )}
                </div>
              )}
              {localPdf ? (
                <PdfAnnotator
                  sourceUrl={localPdf.url}
                  paperKey={`local:${localPdf.filename}`}
                  paperTitle={localPdf.filename}
                  isParentFullscreen={isViewerFullscreen}
                  initialTool="pen"
                  initialWidthPreset="fine"
                />
              ) : activePrimaryPdf && viewerMode === 'annotate' ? (
                <PdfAnnotator
                  sourceUrl={pdfBytesUrl(activePrimaryPdf)}
                  paperKey={activePrimaryPdf.filename}
                  paperTitle={activePrimaryPdf.filename}
                  isParentFullscreen={isViewerFullscreen}
                  initialTool={activePrimaryPdf.docType === 'MS' ? 'pan' : 'pen'}
                  initialWidthPreset="fine"
                  onFallbackViewer={() => setViewerMode('proxy')}
                />
              ) : activePrimaryPdf ? (
                <iframe
                  title={activePrimaryPdf.filename}
                  src={pdfIframeUrl(activePrimaryPdf)}
                  className={`w-full border-0 bg-[var(--sk-surface)] ${
                    isViewerFullscreen ? 'flex-1 min-h-0' : 'h-[640px]'
                  }`}
                />
              ) : null}
            </div>

            {activeSecondaryPdf && (
              <div className="bg-white min-w-0 min-h-0 flex flex-col" data-testid="ms-pane">
                {!isViewerFullscreen && (
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-800 border-b border-[var(--sk-line)] flex items-center justify-between gap-2 shrink-0">
                    <span>Mark Scheme — {activeSecondaryPdf.filename}</span>
                    <a
                      href={activeSecondaryPdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline shrink-0"
                    >
                      Open in new tab
                    </a>
                  </div>
                )}
                {viewerMode === 'annotate' ? (
                  <PdfAnnotator
                    sourceUrl={pdfBytesUrl(activeSecondaryPdf)}
                    paperKey={activeSecondaryPdf.filename}
                    paperTitle={activeSecondaryPdf.filename}
                    isParentFullscreen={isViewerFullscreen}
                    initialTool="pan"
                    initialPenColorHex="#dc2626"
                    initialWidthPreset="fine"
                    onFallbackViewer={() => setViewerMode('proxy')}
                  />
                ) : (
                  <iframe
                    title={activeSecondaryPdf.filename}
                    src={pdfIframeUrl(activeSecondaryPdf)}
                    className={`w-full border-0 bg-[var(--sk-surface)] ${
                      isViewerFullscreen ? 'flex-1 min-h-0' : 'h-[640px]'
                    }`}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Papers List */}
      <section className="sk-card overflow-hidden">
        {loadingPapers && papers.length === 0 ? (
          <div className="p-12 flex items-center justify-center gap-3 text-sm text-[var(--sk-dim)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--sk-pri)]" />
            Loading {subject} papers from PapaCambridge...
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--sk-dim)]">
            No papers match the selected filter in this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-[1.5px] border-[var(--sk-line)] bg-[var(--sk-chip)] text-xs font-bold text-[var(--sk-ink)]">
                  <th className="py-3 px-4">File</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Paper / Variant</th>
                  <th className="py-3 px-4">{subject === '0606' ? 'Calculator Rule' : 'Tier'}</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sk-line)]/70">
                {filteredPapers.map((file) => {
                  const hasMs = file.docType === 'QP' && Boolean(findMatchingMarkScheme(file));
                  const isActiveRow = activePrimaryPdf?.filename === file.filename;
                  return (
                    <tr
                      key={file.filename}
                      className={`transition-colors ${
                        isActiveRow ? 'bg-[var(--sk-chip)]' : 'hover:bg-[var(--sk-surface)]'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-[var(--sk-ink)] font-semibold">
                        {file.filename}
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--sk-body)]">
                        {file.docTypeLabel}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-[var(--sk-dim)]">
                        {file.paperNumber !== '-'
                          ? file.variant !== '-'
                            ? `Paper ${file.paperNumber} · Variant ${file.variant}`
                            : `Paper ${file.paperNumber} · All Zones`
                          : 'Session Document'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {subject === '0606' ? (
                          <span className="text-[var(--sk-body)]">
                            {file.paperNumber === '1'
                              ? 'Non-Calc'
                              : file.paperNumber === '2'
                                ? 'Calculator'
                                : 'Session'}
                          </span>
                        ) : (
                          <span
                            className={
                              file.tier === 'Extended'
                                ? 'text-[var(--sk-acc-ink)] font-semibold'
                                : 'text-[var(--sk-body)]'
                            }
                          >
                            {file.tier}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              triggerSakugaBurst(e, getActiveSubjectVfxVariant('accent'));
                              setLocalPdf(null);
                              setActivePrimaryPdf(file);
                              setActiveSecondaryPdf(null);
                              setViewerMode(apiProxyAvailable ? 'proxy' : 'web');
                              window.requestAnimationFrame(() => {
                                viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold sk-btn-secondary cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View PDF
                          </button>
                          <button
                            type="button"
                            onPointerEnter={() => {
                              if (apiProxyAvailable && viewerMode === 'annotate') {
                                prefetchPdfBytes(buildPdfByteCandidateUrls(pdfBytesUrl(file)));
                              }
                            }}
                            onClick={(e) => {
                              triggerSakugaBurst(e, getActiveSubjectVfxVariant('accent'));
                              setLocalPdf(null);
                              setActivePrimaryPdf(file);
                              setActiveSecondaryPdf(null);
                              setViewerMode(apiProxyAvailable ? 'annotate' : 'web');
                              window.requestAnimationFrame(() => {
                                viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold sk-btn-subtle cursor-pointer"
                          >
                            <Pen className="w-3.5 h-3.5" />
                            Annotate
                          </button>
                          {hasMs && (
                            <button
                              type="button"
                              onClick={(e) => {
                                triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'OPEN!');
                                openSplitView(file);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold sk-btn-primary cursor-pointer"
                            >
                              <Columns2 className="w-3.5 h-3.5" />
                              Split QP + MS
                            </button>
                          )}
                          <a
                            href={pdfDownloadUrl(file)}
                            target={apiProxyAvailable ? undefined : '_blank'}
                            rel={apiProxyAvailable ? undefined : 'noopener noreferrer'}
                            download={file.filename}
                            aria-label={`Download ${file.filename}`}
                            className="p-1.5 text-[var(--sk-dim)] hover:text-[var(--sk-ink)] rounded-lg hover:bg-[var(--sk-chip)]"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};
