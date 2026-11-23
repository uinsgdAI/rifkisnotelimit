import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Columns2,
  Download,
  ExternalLink,
  Pen,
  Search,
} from 'lucide-react';
import { SYLLABUS_0580 } from '../data/syllabus0580';
import { TOPICAL_PAPERS_0580, type TopicalPaperPack } from '../data/topicalPapers0580';
import type { AppRoute } from '../types/syllabus';
import { resolvePdfIframeUrl } from '../utils/papacambridge';
import {
  countTopicalPapersByChapter,
  filterTopicalPapers,
  getTopicalPdfBytesUrl,
} from '../utils/topicalPapers';
import { PdfAnnotator } from './PdfAnnotator';

interface TopicalPastPapersSectionProps {
  selectedChapterFilter: number | 'all';
  initialPackId?: string;
  onNavigate: (route: AppRoute) => void;
}

async function checkProxyHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('application/json')) return false;
    const json = (await res.json()) as { ok?: boolean };
    return Boolean(json?.ok);
  } catch {
    return false;
  }
}

export const TopicalPastPapersSection: React.FC<TopicalPastPapersSectionProps> = ({
  selectedChapterFilter,
  initialPackId,
  onNavigate,
}) => {
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>(selectedChapterFilter);
  const [paperModeFilter, setPaperModeFilter] = useState<'all' | TopicalPaperPack['paperMode']>('all');
  const [query, setQuery] = useState('');
  const [apiProxyAvailable, setApiProxyAvailable] = useState(true);
  const [viewerMode, setViewerMode] = useState<'annotate' | 'proxy' | 'web'>('annotate');
  const [activePack, setActivePack] = useState<TopicalPaperPack | null>(() =>
    initialPackId ? TOPICAL_PAPERS_0580.find((p) => p.id === initialPackId) || null : null
  );
  const [splitAnswers, setSplitAnswers] = useState(true);
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setChapterFilter(selectedChapterFilter);
  }, [selectedChapterFilter]);

  useEffect(() => {
    if (!initialPackId) return;
    const match = TOPICAL_PAPERS_0580.find((p) => p.id === initialPackId);
    if (match) {
      setActivePack(match);
      setSplitAnswers(true);
      window.setTimeout(() => {
        viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }, [initialPackId]);

  useEffect(() => {
    let cancelled = false;
    checkProxyHealth().then((ok) => {
      if (cancelled) return;
      setApiProxyAvailable(ok);
      if (!ok) {
        setViewerMode((prev) => (prev === 'annotate' ? 'web' : prev));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const chapterCounts = useMemo(() => countTopicalPapersByChapter(TOPICAL_PAPERS_0580), []);

  const filteredPacks = useMemo(
    () =>
      filterTopicalPapers(TOPICAL_PAPERS_0580, {
        chapterId: chapterFilter,
        query,
        paperMode: paperModeFilter,
      }),
    [chapterFilter, query, paperModeFilter]
  );

  const openPack = (pack: TopicalPaperPack, withSplitAnswers: boolean) => {
    setActivePack(pack);
    setSplitAnswers(withSplitAnswers);
    if (apiProxyAvailable) {
      setViewerMode('annotate');
    }
    window.setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const pdfIframeUrl = (rawUrl: string) =>
    resolvePdfIframeUrl(rawUrl, {
      apiProxyAvailable,
      viewerMode: viewerMode === 'web' ? 'web' : 'proxy',
    });

  const downloadHref = (rawUrl: string) =>
    apiProxyAvailable ? getTopicalPdfBytesUrl(rawUrl) : rawUrl;

  return (
    <section
      aria-label="Topical Past Paper Questions and Worked Solutions"
      data-testid="topical-past-papers-section"
      className="space-y-4"
    >
      {/* Section Header & Filters */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              Cambridge IGCSE 0580 · Topical Past Paper Archive ({TOPICAL_PAPERS_0580.length} Topic Packs)
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Topical Past Papers &amp; Worked Solutions (Annotate Q + Answers)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Practise real exam-style topical PDF sheets with step-by-step worked solutions. Open any topic directly in the PDF annotator (Pen, Highlighter, Ruler, Split Questions + Answers) or jump back to its 0580 study notes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative w-full sm:w-72">
              <label htmlFor="topical-papers-search" className="sr-only">
                Search topical past paper packs
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="topical-papers-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topic or code (e.g. Surds, 2.5, Vectors)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div
              role="group"
              aria-label="Filter by calculator rule"
              className="flex gap-1 p-1 bg-slate-100 rounded-lg"
            >
              {(['all', 'Non-Calc', 'Calc', 'Mixed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaperModeFilter(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    paperModeFilter === mode
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'all' ? 'All Modes' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setChapterFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                chapterFilter === 'all'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Topics ({TOPICAL_PAPERS_0580.length})
            </button>
            {SYLLABUS_0580.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChapterFilter(ch.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                  chapterFilter === ch.id
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {ch.id}. {ch.title} ({chapterCounts[ch.id] || 0})
              </button>
            ))}
          </div>

          <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
            Showing {filteredPacks.length} of {TOPICAL_PAPERS_0580.length} packs
          </span>
        </div>
      </div>

      {/* Active Topical PDF Annotator / Split Viewer */}
      {activePack && (
        <section
          ref={viewerRef}
          aria-label={`Topical PDF Viewer for ${activePack.title}`}
          data-testid="topical-pdf-viewer"
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-display font-bold text-slate-900">
                  #{activePack.order} · {activePack.title}
                </span>
                <span className="font-mono text-slate-500">({activePack.paperMode})</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-slate-600">
                <span>{activePack.questionsFilename}</span>
                {splitAnswers && (
                  <>
                    <span aria-hidden="true">+</span>
                    <span className="text-emerald-800 font-semibold">
                      {activePack.answersFilename}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activePack.topicIds[0] && (
                <button
                  type="button"
                  onClick={() => {
                    const targetTopic = activePack.topicIds[0];
                    const targetChapter = Number(targetTopic.split('.')[0]) || activePack.chapterId;
                    onNavigate({
                      view: 'notes',
                      chapterId: targetChapter,
                      topicId: targetTopic,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study {activePack.topicIds.join(', ')} Notes
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSplitAnswers((s) => !s)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg cursor-pointer ${
                  splitAnswers
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                {splitAnswers ? 'Showing Q + Answers' : 'Show Worked Answers'}
              </button>

              <div
                role="group"
                aria-label="Topical PDF viewer engine"
                className="inline-flex p-0.5 bg-slate-200/80 rounded-lg"
              >
                {apiProxyAvailable && (
                  <button
                    type="button"
                    onClick={() => setViewerMode('annotate')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                      viewerMode === 'annotate'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Pen className="w-3 h-3" />
                    Annotate (Draw)
                  </button>
                )}
                {apiProxyAvailable && (
                  <button
                    type="button"
                    onClick={() => setViewerMode('proxy')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                      viewerMode === 'proxy'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Native PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewerMode('web')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    viewerMode === 'web'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Web Viewer
                </button>
              </div>

              <a
                href={activePack.questionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Q
              </a>

              {splitAnswers && (
                <a
                  href={activePack.answersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-emerald-200 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Answers
                </a>
              )}

              <button
                type="button"
                onClick={() => setActivePack(null)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>

          <div
            className={`grid gap-px bg-slate-200 ${
              splitAnswers ? 'lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <div className="bg-white min-w-0" data-testid="topical-qp-pane">
              <div className="px-3 py-1.5 text-[11px] font-medium text-slate-500 border-b border-slate-200 flex items-center justify-between gap-2">
                <span>Questions — {activePack.questionsFilename}</span>
                <a
                  href={activePack.questionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline shrink-0"
                >
                  Open in new tab
                </a>
              </div>
              {viewerMode === 'annotate' ? (
                <PdfAnnotator
                  sourceUrl={getTopicalPdfBytesUrl(activePack.questionsUrl)}
                  externalUrl={activePack.questionsUrl}
                  paperKey={`topical:${activePack.questionsFilename}`}
                  paperTitle={`${activePack.title} — Questions`}
                  onFallbackViewer={() => setViewerMode('web')}
                />
              ) : (
                <iframe
                  title={activePack.questionsFilename}
                  src={pdfIframeUrl(activePack.questionsUrl)}
                  className="w-full h-[640px] border-0 bg-slate-50"
                />
              )}
            </div>

            {splitAnswers && (
              <div className="bg-white min-w-0" data-testid="topical-ms-pane">
                <div className="px-3 py-1.5 text-[11px] font-medium text-emerald-700 border-b border-slate-200 flex items-center justify-between gap-2">
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
                {viewerMode === 'annotate' ? (
                  <PdfAnnotator
                    sourceUrl={getTopicalPdfBytesUrl(activePack.answersUrl)}
                    externalUrl={activePack.answersUrl}
                    paperKey={`topical:${activePack.answersFilename}`}
                    paperTitle={`${activePack.title} — Worked Answers`}
                    initialPenColorHex="#dc2626"
                    onFallbackViewer={() => setViewerMode('web')}
                  />
                ) : (
                  <iframe
                    title={activePack.answersFilename}
                    src={pdfIframeUrl(activePack.answersUrl)}
                    className="w-full h-[640px] border-0 bg-slate-50"
                  />
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Topical Papers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredPacks.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No topical packs match "{query}". Try clearing your search or switching back to All Topics.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                <tr className="text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Topical Question Pack</th>
                  <th className="py-3 px-4">Syllabus Coverage</th>
                  <th className="py-3 px-4">Paper Mode</th>
                  <th className="py-3 px-4 text-right">Study &amp; Annotate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPacks.map((pack) => {
                  const isActive = activePack?.id === pack.id;
                  const chTitle =
                    SYLLABUS_0580.find((c) => c.id === pack.chapterId)?.title || `Ch. ${pack.chapterId}`;
                  const primaryTopic = pack.topicIds[0];
                  const primaryChapter = primaryTopic
                    ? Number(primaryTopic.split('.')[0]) || pack.chapterId
                    : pack.chapterId;

                  return (
                    <tr
                      key={pack.id}
                      data-testid={`topical-row-${pack.id}`}
                      className={`transition-colors ${
                        isActive ? 'bg-blue-50/70' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-400">
                        {pack.order}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900">
                          {pack.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Ch. {pack.chapterId}: {chTitle}
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
                                    chapterId: ch,
                                    topicId: tid,
                                  })
                                }
                                title={`Open Study Notes for ${tid}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-blue-700 cursor-pointer"
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
                              ? 'font-medium text-amber-800'
                              : pack.paperMode === 'Calc'
                                ? 'font-medium text-slate-700'
                                : 'text-slate-600'
                          }
                        >
                          {pack.paperMode}
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
                                  chapterId: primaryChapter,
                                  topicId: primaryTopic,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                              Notes
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openPack(pack, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                          >
                            <Pen className="w-3.5 h-3.5" />
                            Annotate Q
                          </button>
                          <button
                            type="button"
                            onClick={() => openPack(pack, true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
                          >
                            <Columns2 className="w-3.5 h-3.5" />
                            Split Q + Ans
                          </button>
                          <a
                            href={downloadHref(pack.questionsUrl)}
                            target={apiProxyAvailable ? undefined : '_blank'}
                            rel={apiProxyAvailable ? undefined : 'noopener noreferrer'}
                            download={pack.questionsFilename}
                            aria-label={`Download ${pack.questionsFilename}`}
                            title="Download Questions PDF"
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
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
      </div>
    </section>
  );
};
