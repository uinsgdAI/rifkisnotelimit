import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Columns2,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Pen,
  Search,
} from 'lucide-react';
import type { AppRoute, SubjectCode, SyllabusChapter, TopicalPaperPack } from '../types/syllabus';
import { buildGoogleDocsViewerUrl } from '../utils/papacambridge';
import {
  acquireFullscreenBodyLock,
  buildPdfByteCandidateUrls,
  fetchPdfBytesWithFallback,
  prefetchPdfBytes,
} from '../utils/pdfAnnotations';
import {
  countTopicalPapersByChapter,
  filterTopicalPapers,
  getTopicalPdfBytesUrl,
} from '../utils/topicalPapers';
import { PdfAnnotator } from './PdfAnnotator';
import { warmSharedPdfWorker } from '../utils/pdfJsCache';
import { getActiveSubjectVfxVariant, triggerSakugaBurst } from '../utils/sakugaVfx';

interface TopicalPastPapersSectionProps {
  subject: SubjectCode;
  syllabus: SyllabusChapter[];
  selectedChapterFilter: number | 'all';
  initialPackId?: string;
  onNavigate: (route: AppRoute) => void;
}

interface NativePdfFrameProps {
  externalUrl: string;
  title: string;
  fullHeight?: boolean;
  onSwitchToAnnotate: () => void;
  onSwitchToWeb: () => void;
}

const NativePdfFrame: React.FC<NativePdfFrameProps> = ({
  externalUrl,
  title,
  fullHeight = false,
  onSwitchToAnnotate,
  onSwitchToWeb,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    const abortController = new AbortController();

    setLoading(true);
    setError(null);
    setBlobUrl(null);

    const candidates = buildPdfByteCandidateUrls(
      getTopicalPdfBytesUrl(externalUrl),
      externalUrl
    );

    fetchPdfBytesWithFallback(candidates, { signal: abortController.signal })
      .then(({ bytes }) => {
        if (cancelled) return;
        const copy = new Uint8Array(bytes.byteLength);
        copy.set(bytes);
        objectUrl = URL.createObjectURL(new Blob([copy], { type: 'application/pdf' }));
        setBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        setError(err instanceof Error && err.message ? err.message : 'Unable to load native PDF.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      abortController.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [externalUrl]);

  if (loading) {
    return (
      <div
        className={`w-full ${
          fullHeight ? 'flex-1 min-h-0' : 'h-[640px]'
        } flex flex-col items-center justify-center gap-3 text-sm text-[var(--sk-dim)] bg-[var(--sk-surface)]`}
      >
        <Loader2 className="w-5 h-5 animate-spin text-[var(--sk-pri)]" />
        <span>Loading native PDF viewer...</span>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div
        className={`w-full ${
          fullHeight ? 'flex-1 min-h-0' : 'h-[640px]'
        } flex flex-col items-center justify-center gap-3 p-6 text-center bg-[var(--sk-surface)]`}
      >
        <p className="text-sm text-[var(--sk-body)] max-w-md">
          Native browser PDF could not be embedded ({error || 'blocked by network'}).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onSwitchToAnnotate}
            className="px-3.5 py-2 text-xs font-bold sk-btn-primary cursor-pointer"
          >
            Open in Annotate (Draw)
          </button>
          <button
            type="button"
            onClick={onSwitchToWeb}
            className="px-3.5 py-2 text-xs font-semibold sk-btn-subtle cursor-pointer"
          >
            Switch to Web Viewer
          </button>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold sk-btn-subtle"
          >
            Open PDF Directly
          </a>
        </div>
      </div>
    );
  }

  return (
    <object
      aria-label={title}
      data={blobUrl}
      type="application/pdf"
      className={`w-full block bg-[var(--sk-surface)] ${fullHeight ? 'flex-1 min-h-0' : 'h-[640px]'}`}
    >
      <div
        className={`w-full ${
          fullHeight ? 'flex-1 min-h-0' : 'h-[640px]'
        } flex flex-col items-center justify-center gap-3 p-6 text-center bg-[var(--sk-surface)]`}
      >
        <p className="text-sm text-[var(--sk-body)] max-w-md">
          This browser does not embed Native PDF plugins inline. Use Annotate (Draw) to view &amp; scribble directly on every page, or open the PDF in a new tab.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onSwitchToAnnotate}
            className="px-3.5 py-2 text-xs font-bold sk-btn-primary cursor-pointer"
          >
            Switch to Annotate (Draw)
          </button>
          <button
            type="button"
            onClick={onSwitchToWeb}
            className="px-3.5 py-2 text-xs font-semibold sk-btn-subtle cursor-pointer"
          >
            Switch to Web Viewer
          </button>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold sk-btn-subtle"
          >
            Open PDF Directly
          </a>
        </div>
      </div>
    </object>
  );
};

export const TopicalPastPapersSection: React.FC<TopicalPastPapersSectionProps> = ({
  subject,
  syllabus,
  selectedChapterFilter,
  initialPackId,
  onNavigate,
}) => {
  const [packs, setPacks] = useState<TopicalPaperPack[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>(selectedChapterFilter);
  const [paperModeFilter, setPaperModeFilter] = useState<'all' | TopicalPaperPack['paperMode']>('all');
  const [query, setQuery] = useState('');
  const [viewerMode, setViewerMode] = useState<'annotate' | 'proxy' | 'web'>('annotate');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activePack, setActivePack] = useState<TopicalPaperPack | null>(null);
  const [splitAnswers, setSplitAnswers] = useState(true);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);
  const enteredNativeViewerFsRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingPacks(true);
    setActivePack(null);
    setPaperModeFilter('all');
    setQuery('');

    const loader =
      subject === '0606'
        ? import('../data/topicalPapers0606').then((m) => m.TOPICAL_PAPERS_0606)
        : import('../data/topicalPapers0580').then((m) => m.TOPICAL_PAPERS_0580);

    loader
      .then((loadedPacks) => {
        if (cancelled) return;
        setPacks(loadedPacks);
        setLoadingPacks(false);
      })
      .catch(() => {
        if (cancelled) return;
        setPacks([]);
        setLoadingPacks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subject]);

  const exitViewerFullscreen = useCallback(() => {
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
  }, []);

  const toggleViewerFullscreen = useCallback(() => {
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
  }, [isViewerFullscreen, exitViewerFullscreen]);

  useEffect(() => {
    if (!isViewerFullscreen) return;
    const releaseLock = acquireFullscreenBodyLock();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitViewerFullscreen();
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
  }, [isViewerFullscreen, exitViewerFullscreen]);

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
    setChapterFilter(selectedChapterFilter);
  }, [selectedChapterFilter]);

  useEffect(() => {
    if (!initialPackId || packs.length === 0) return;
    const match = packs.find((p) => p.id === initialPackId);
    if (match) {
      setActivePack(match);
      setSplitAnswers(Boolean(match.answersUrl));
      setViewerMode('annotate');
      const raf = window.requestAnimationFrame(() => {
        viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => window.cancelAnimationFrame(raf);
    }
  }, [initialPackId, packs]);

  const chapterCounts = useMemo(
    () => countTopicalPapersByChapter(packs, syllabus.length),
    [packs, syllabus.length]
  );
  const chapterTitleMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const ch of syllabus) map[ch.id] = ch.title;
    return map;
  }, [syllabus]);

  const hasMultiplePaperModes = useMemo(
    () => new Set(packs.map((p) => p.paperMode)).size > 1,
    [packs]
  );

  const filteredPacks = useMemo(
    () =>
      filterTopicalPapers(packs, {
        chapterId: chapterFilter,
        query,
        paperMode: hasMultiplePaperModes ? paperModeFilter : 'all',
      }),
    [packs, chapterFilter, query, paperModeFilter, hasMultiplePaperModes]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => warmSharedPdfWorker(), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const openPack = useCallback((pack: TopicalPaperPack, withSplitAnswers: boolean) => {
    setActivePack(pack);
    setSplitAnswers(withSplitAnswers && Boolean(pack.answersUrl));
    setViewerMode('annotate');
    window.requestAnimationFrame(() => {
      viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const prefetchPack = useCallback((pack: TopicalPaperPack, includeAnswers: boolean) => {
    warmSharedPdfWorker();
    prefetchPdfBytes(
      buildPdfByteCandidateUrls(getTopicalPdfBytesUrl(pack.questionsUrl), pack.questionsUrl)
    );
    if (includeAnswers && pack.answersUrl) {
      prefetchPdfBytes(
        buildPdfByteCandidateUrls(getTopicalPdfBytesUrl(pack.answersUrl), pack.answersUrl)
      );
    }
  }, []);

  const handleDownloadPackPdf = useCallback(async (packId: string, url: string, filename: string) => {
    setDownloadingId(packId);
    try {
      const candidates = buildPdfByteCandidateUrls(getTopicalPdfBytesUrl(url), url);
      const { bytes } = await fetchPdfBytesWithFallback(candidates);
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const blobUrl = URL.createObjectURL(new Blob([copy], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return (
    <section
      aria-label="Topical Past Paper Questions and Worked Solutions"
      data-testid="topical-past-papers-section"
      className="space-y-4"
    >
      {/* Section Header & Filters */}
      <div className="p-6 sk-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[var(--sk-dim)] mb-1">
              {subject === '0606'
                ? `Cambridge IGCSE Additional Mathematics (0606) · PapaCambridge Topical Archive (${packs.length} Topic Packs)`
                : `Cambridge IGCSE 0580 · Topical Past Paper Archive (${packs.length} Topic Packs)`}
            </div>
            <h2 className="font-display text-lg font-bold text-[var(--sk-ink)]">
              {subject === '0606'
                ? '0606 Topical Past Papers (PapaCambridge · Annotate PDF)'
                : 'Topical Past Papers & Worked Solutions (Annotate Q + Answers)'}
            </h2>
            <p className="text-xs text-[var(--sk-body)] mt-1 max-w-2xl">
              {subject === '0606'
                ? 'Practise real 0606 Additional Mathematics topical exam PDFs sourced from PapaCambridge. Open any topic directly in the S Pen PDF annotator (Pen, Highlighter, Ruler) or jump straight to its 0606 study notes.'
                : 'Practise real exam-style topical PDF sheets with step-by-step worked solutions. Open any topic directly in the PDF annotator (Pen, Highlighter, Ruler, Split Questions + Answers) or jump back to its 0580 study notes.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="relative w-full sm:w-72">
              <label htmlFor="topical-papers-search" className="sr-only">
                Search topical past paper packs
              </label>
              <Search className="w-4 h-4 text-[var(--sk-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                id="topical-papers-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  subject === '0606'
                    ? 'Search topic or code (e.g. Vectors, 14.3, Series)'
                    : 'Search topic or code (e.g. Surds, 2.5, Vectors)'
                }
                className="w-full pl-9 pr-3 py-2 text-xs sk-input"
              />
            </div>

            {hasMultiplePaperModes && (
              <div
                role="group"
                aria-label="Filter by calculator rule"
                className="flex gap-1 sk-tabs"
              >
                {(['all', 'Non-Calc', 'Calc', 'Mixed'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    data-active={paperModeFilter === mode}
                    onClick={() => setPaperModeFilter(mode)}
                    className="px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
                  >
                    {mode === 'all' ? 'All Modes' : mode}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div
            role="tablist"
            aria-label="Filter topical papers by chapter"
            className="flex flex-wrap gap-1 sk-tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={chapterFilter === 'all'}
              data-active={chapterFilter === 'all'}
              onClick={() => setChapterFilter('all')}
              className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
            >
              All Topics ({packs.length})
            </button>
            {syllabus.map((ch) => (
              <button
                key={ch.id}
                type="button"
                role="tab"
                aria-selected={chapterFilter === ch.id}
                data-active={chapterFilter === ch.id}
                onClick={() => setChapterFilter(ch.id)}
                className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap sk-tab"
              >
                {ch.id}. {ch.title} ({chapterCounts[ch.id] || 0})
              </button>
            ))}
          </div>

          <span className="text-xs font-mono font-semibold tabular-nums text-[var(--sk-dim)] shrink-0">
            Showing {filteredPacks.length} of {packs.length} packs
          </span>
        </div>
      </div>

      {/* Active Topical PDF Annotator / Split Viewer */}
      {activePack && (
        <section
          ref={viewerRef}
          aria-label={`Topical PDF Viewer for ${activePack.title}`}
          data-testid="topical-pdf-viewer"
          data-fullscreen={isViewerFullscreen}
          className={
            isViewerFullscreen
              ? 'fixed inset-0 z-[65] w-screen h-screen h-[100dvh] bg-white flex flex-col overflow-hidden'
              : 'sk-card overflow-hidden border-2 border-[var(--sk-ink)] shadow-[4px_5px_0_var(--sk-soft)] scroll-mt-20'
          }
        >
          <div
            className={`${
              isViewerFullscreen ? 'px-3 py-1.5 gap-2' : 'px-4 py-2.5 gap-2.5'
            } border-b-[1.5px] border-[var(--sk-line)] bg-[var(--sk-surface)] flex flex-wrap items-center justify-between shrink-0`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-display font-bold text-[var(--sk-ink)] truncate">
                  #{activePack.order} · {activePack.title}
                </span>
                <span className="font-mono text-[var(--sk-dim)]">({activePack.paperMode})</span>
              </div>
              {!isViewerFullscreen && (
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-[var(--sk-dim)]">
                  <span>{activePack.questionsFilename}</span>
                  {splitAnswers && activePack.answersFilename && (
                    <>
                      <span aria-hidden="true">+</span>
                      <span className="text-emerald-800 font-semibold">
                        {activePack.answersFilename}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {activePack.topicIds[0] && (
                <button
                  type="button"
                  onClick={() => {
                    const targetTopic = activePack.topicIds[0];
                    const targetChapter = Number(targetTopic.split('.')[0]) || activePack.chapterId;
                    onNavigate({
                      view: 'notes',
                      subject,
                      chapterId: targetChapter,
                      topicId: targetTopic,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold sk-btn-subtle text-[var(--sk-pri)] cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study {activePack.topicIds.join(', ')} Notes
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {activePack.answersUrl && (
                <button
                  type="button"
                  onClick={() => setSplitAnswers((s) => !s)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border-[1.5px] cursor-pointer ${
                    splitAnswers
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'sk-btn-subtle'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  {splitAnswers ? 'Showing Q + Answers' : 'Show Worked Answers'}
                </button>
              )}

              <div
                role="group"
                aria-label="Topical PDF viewer engine"
                className="inline-flex gap-1 sk-tabs"
              >
                <button
                  type="button"
                  data-active={viewerMode === 'annotate'}
                  onClick={() => setViewerMode('annotate')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer sk-tab"
                >
                  <Pen className="w-3 h-3" />
                  Annotate (Draw)
                </button>
                <button
                  type="button"
                  data-active={viewerMode === 'proxy'}
                  onClick={() => setViewerMode('proxy')}
                  className="px-2.5 py-1 text-xs font-semibold cursor-pointer sk-tab"
                >
                  Native PDF
                </button>
                <button
                  type="button"
                  data-active={viewerMode === 'web'}
                  onClick={() => setViewerMode('web')}
                  className="px-2.5 py-1 text-xs font-semibold cursor-pointer sk-tab"
                >
                  Web Viewer
                </button>
              </div>

              {!isViewerFullscreen && (
                <a
                  href={activePack.questionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold sk-btn-subtle"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {activePack.answersUrl ? 'Open Q' : 'Open PDF'}
                </a>
              )}

              {!isViewerFullscreen && splitAnswers && activePack.answersUrl && (
                <a
                  href={activePack.answersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border-[1.5px] border-emerald-600 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Answers
                </a>
              )}

              {(splitAnswers || viewerMode !== 'annotate') && (
                <button
                  type="button"
                  data-testid="topical-viewer-fullscreen-btn"
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
                      {splitAnswers ? 'Fullscreen Split' : 'Fullscreen'}
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  exitViewerFullscreen();
                  setActivePack(null);
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
              splitAnswers
                ? isViewerFullscreen
                  ? 'grid-rows-2 lg:grid-rows-1 lg:grid-cols-2'
                  : 'lg:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            <div className="bg-white min-w-0 min-h-0 flex flex-col" data-testid="topical-qp-pane">
              {!isViewerFullscreen && (
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--sk-dim)] border-b border-[var(--sk-line)] flex items-center justify-between gap-2 shrink-0">
                  <span>Questions — {activePack.questionsFilename}</span>
                  <a
                    href={activePack.questionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--sk-pri)] hover:underline shrink-0"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
              {viewerMode === 'annotate' ? (
                <PdfAnnotator
                  sourceUrl={getTopicalPdfBytesUrl(activePack.questionsUrl)}
                  externalUrl={activePack.questionsUrl}
                  paperKey={`topical:${activePack.questionsFilename}`}
                  paperTitle={`${activePack.title} — Questions`}
                  isParentFullscreen={isViewerFullscreen}
                  initialTool="pen"
                  initialWidthPreset="fine"
                  onFallbackViewer={() => setViewerMode('web')}
                />
              ) : viewerMode === 'proxy' ? (
                <NativePdfFrame
                  externalUrl={activePack.questionsUrl}
                  title={activePack.questionsFilename}
                  fullHeight={isViewerFullscreen}
                  onSwitchToAnnotate={() => setViewerMode('annotate')}
                  onSwitchToWeb={() => setViewerMode('web')}
                />
              ) : (
                <iframe
                  title={activePack.questionsFilename}
                  src={buildGoogleDocsViewerUrl(activePack.questionsUrl)}
                  className={`w-full border-0 bg-[var(--sk-surface)] ${
                    isViewerFullscreen ? 'flex-1 min-h-0' : 'h-[640px]'
                  }`}
                />
              )}
            </div>

            {splitAnswers && activePack.answersUrl && activePack.answersFilename && (
              <div className="bg-white min-w-0 min-h-0 flex flex-col" data-testid="topical-ms-pane">
                {!isViewerFullscreen && (
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-800 border-b border-[var(--sk-line)] flex items-center justify-between gap-2 shrink-0">
                    <span>Worked Solutions — {activePack.answersFilename}</span>
                    <a
                      href={activePack.answersUrl}
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
                    sourceUrl={getTopicalPdfBytesUrl(activePack.answersUrl)}
                    externalUrl={activePack.answersUrl}
                    paperKey={`topical:${activePack.answersFilename}`}
                    paperTitle={`${activePack.title} — Worked Answers`}
                    isParentFullscreen={isViewerFullscreen}
                    initialTool="pan"
                    initialPenColorHex="#dc2626"
                    initialWidthPreset="fine"
                    onFallbackViewer={() => setViewerMode('web')}
                  />
                ) : viewerMode === 'proxy' ? (
                  <NativePdfFrame
                    externalUrl={activePack.answersUrl}
                    title={activePack.answersFilename}
                    fullHeight={isViewerFullscreen}
                    onSwitchToAnnotate={() => setViewerMode('annotate')}
                    onSwitchToWeb={() => setViewerMode('web')}
                  />
                ) : (
                  <iframe
                    title={activePack.answersFilename}
                    src={buildGoogleDocsViewerUrl(activePack.answersUrl)}
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

      {/* Topical Papers Table */}
      <div className="sk-card overflow-hidden">
        {loadingPacks ? (
          <div className="p-8 text-center text-sm text-[var(--sk-dim)] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--sk-pri)]" />
            Loading {subject} topical packs...
          </div>
        ) : filteredPacks.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--sk-dim)]">
            No topical packs match &quot;{query}&quot;. Try clearing your search or switching back to All Topics.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--sk-chip)] border-b-[1.5px] border-[var(--sk-line)]">
                <tr className="text-xs font-bold text-[var(--sk-ink)]">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Topical Question Pack</th>
                  <th className="py-3 px-4">Syllabus Coverage</th>
                  <th className="py-3 px-4">Paper Mode</th>
                  <th className="py-3 px-4 text-right">Study &amp; Annotate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--sk-line)]">
                {filteredPacks.map((pack) => (
                  <TopicalPackRow
                    key={pack.id}
                    subject={subject}
                    pack={pack}
                    chapterTitle={chapterTitleMap[pack.chapterId] || `Ch. ${pack.chapterId}`}
                    isActive={activePack?.id === pack.id}
                    isDownloading={downloadingId === pack.id}
                    onOpenPack={openPack}
                    onPrefetchPack={prefetchPack}
                    onDownload={handleDownloadPackPdf}
                    onNavigate={onNavigate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

interface TopicalPackRowProps {
  subject: SubjectCode;
  pack: TopicalPaperPack;
  chapterTitle: string;
  isActive: boolean;
  isDownloading: boolean;
  onOpenPack: (pack: TopicalPaperPack, withSplitAnswers: boolean) => void;
  onPrefetchPack: (pack: TopicalPaperPack, includeAnswers: boolean) => void;
  onDownload: (packId: string, url: string, filename: string) => void;
  onNavigate: (route: AppRoute) => void;
}

const TopicalPackRow: React.FC<TopicalPackRowProps> = React.memo(({
  subject,
  pack,
  chapterTitle,
  isActive,
  isDownloading,
  onOpenPack,
  onPrefetchPack,
  onDownload,
  onNavigate,
}) => {
  const primaryTopic = pack.topicIds[0];
  const primaryChapter = primaryTopic
    ? Number(primaryTopic.split('.')[0]) || pack.chapterId
    : pack.chapterId;

  return (
    <tr
      data-testid={`topical-row-${pack.id}`}
      className={isActive ? 'bg-[var(--sk-chip)]' : 'hover:bg-[var(--sk-surface)]'}
    >
      <td className="py-3 px-4 font-mono text-xs tabular-nums text-[var(--sk-dim)]">
        {pack.order}
      </td>
      <td className="py-3 px-4">
        <div className="font-bold text-xs sm:text-sm text-[var(--sk-ink)]">
          {pack.title}
        </div>
        <div className="text-[11px] font-mono text-[var(--sk-dim)] mt-0.5">
          Ch. {pack.chapterId}: {chapterTitle}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1.5">
          {pack.topicIds.map((tid) => {
            const ch = Number(tid.split('.')[0]) || pack.chapterId;
            return (
              <button
                key={tid}
                type="button"
                onClick={() =>
                  onNavigate({
                    view: 'notes',
                    subject,
                    chapterId: ch,
                    topicId: tid,
                  })
                }
                title={`Open Study Notes for ${tid}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold rounded-lg border border-[var(--sk-line)] bg-[var(--sk-surface)] hover:bg-[var(--sk-chip)] hover:border-[var(--sk-ink)] text-[var(--sk-pri)] cursor-pointer"
              >
                {tid}
              </button>
            );
          })}
        </div>
      </td>
      <td className="py-3 px-4 text-xs">
        <span
          className={
            pack.paperMode === 'Non-Calc'
              ? 'font-semibold text-[var(--sk-acc-ink)]'
              : pack.paperMode === 'Calc'
                ? 'font-semibold text-[var(--sk-ink)]'
                : 'text-[var(--sk-dim)]'
          }
        >
          {pack.paperMode === 'Mixed' && subject === '0606' ? 'Paper 1 & 2' : pack.paperMode}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="inline-flex flex-wrap items-center justify-end gap-2">
          {primaryTopic && (
            <button
              type="button"
              onClick={() =>
                onNavigate({
                  view: 'notes',
                  subject,
                  chapterId: primaryChapter,
                  topicId: primaryTopic,
                })
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold sk-btn-subtle cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--sk-pri)]" />
              Notes
            </button>
          )}
          <button
            type="button"
            onPointerEnter={() => onPrefetchPack(pack, false)}
            onFocus={() => onPrefetchPack(pack, false)}
            onClick={(e) => {
              triggerSakugaBurst(e, getActiveSubjectVfxVariant('accent'));
              onOpenPack(pack, false);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
              pack.answersUrl ? 'sk-btn-secondary' : 'font-bold sk-btn-primary'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            {pack.answersUrl ? 'Annotate Q' : 'Annotate PDF'}
          </button>
          {pack.answersUrl && (
            <button
              type="button"
              onPointerEnter={() => onPrefetchPack(pack, true)}
              onFocus={() => onPrefetchPack(pack, true)}
              onClick={(e) => {
                triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'OPEN!');
                onOpenPack(pack, true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold sk-btn-primary cursor-pointer"
            >
              <Columns2 className="w-3.5 h-3.5" />
              Split Q + Ans
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              onDownload(pack.id, pack.questionsUrl, pack.questionsFilename)
            }
            disabled={isDownloading}
            aria-label={`Download ${pack.questionsFilename}`}
            title="Download Questions PDF"
            className="p-1.5 text-[var(--sk-dim)] hover:text-[var(--sk-ink)] rounded-lg hover:bg-[var(--sk-chip)] cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

