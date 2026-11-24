import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { ALL_SUBTOPICS_0580, SYLLABUS_0580 } from '../data/syllabus0580';

interface SyllabusSidebarProps {
  activeChapterId: number;
  activeTopicId: string;
  studiedTopicIds: string[];
  weakTopicIds?: string[];
  onSelectTopic: (chapterId: number, topicId: string) => void;
}

export const SyllabusSidebar: React.FC<SyllabusSidebarProps> = ({
  activeChapterId,
  activeTopicId,
  studiedTopicIds,
  weakTopicIds = [],
  onSelectTopic,
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'core' | 'extended' | 'review'>('all');
  const [expandedChapters, setExpandedChapters] = useState<number[]>(() => [activeChapterId]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
  };

  const studiedSet = useMemo(() => new Set(studiedTopicIds), [studiedTopicIds]);
  const weakSet = useMemo(() => new Set(weakTopicIds), [weakTopicIds]);

  const filteredChapters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SYLLABUS_0580.map((ch) => {
      const subtopics = ch.subtopics.filter((t) => {
        const matchesTier =
          tierFilter === 'all' ||
          (tierFilter === 'core' && t.tier === 'Core & Extended') ||
          (tierFilter === 'extended' && t.tier === 'Extended') ||
          (tierFilter === 'review' && weakSet.has(t.id));
        const matchesSearch =
          !q ||
          t.code.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q);
        return matchesTier && matchesSearch;
      });
      return { ...ch, subtopics };
    }).filter((ch) => ch.subtopics.length > 0);
  }, [search, tierFilter, weakSet]);

  const isSearching = search.trim().length > 0 || tierFilter !== 'all';

  const studiedPct = Math.round(
    (studiedTopicIds.length / Math.max(1, ALL_SUBTOPICS_0580.length)) * 100
  );

  return (
    <aside
      aria-label="0580 Syllabus Curriculum"
      className="w-full lg:w-80 shrink-0 sk-card flex flex-col overflow-hidden"
    >
      <button
        type="button"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
        className="lg:hidden w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-white hover:bg-[#F4F3FC] cursor-pointer"
      >
        <span className="font-display text-xs font-bold text-[#1D1A4A]">
          0580 Syllabus Topics · Active: {activeTopicId}
        </span>
        <span className="text-xs font-semibold text-[#6D69F2]">
          {mobileOpen ? 'Hide' : 'Browse (72)'}
        </span>
      </button>

      <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block`}>
      <div className="p-4 border-t lg:border-t-0 border-b-[1.5px] border-[#DCDAF0] space-y-3">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-sm font-bold text-[#1D1A4A]">
              0580 Syllabus (2025–2027)
            </h2>
            <span className="font-mono text-xs font-semibold tabular-nums text-[#5E588C]">
              {studiedTopicIds.length}/{ALL_SUBTOPICS_0580.length} studied
            </span>
          </div>
          <div
            className="h-2.5 w-full sk-progress-track"
            role="progressbar"
            aria-valuenow={studiedPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Syllabus study progress"
          >
            <div
              className="h-full sk-progress-fill rounded-full"
              style={{ width: `${Math.max(studiedTopicIds.length > 0 ? 4 : 0, studiedPct)}%` }}
            />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="syllabus-search" className="sr-only">
            Search 0580 topics
          </label>
          <Search className="w-4 h-4 text-[#5E588C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="syllabus-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by code or topic (e.g. 1.16, surds)"
            className="w-full pl-9 pr-3 py-2 text-xs sk-input"
          />
        </div>

        <div
          role="group"
          aria-label="Filter by syllabus tier"
          className="grid grid-cols-3 gap-1 sk-tabs"
        >
          <button
            type="button"
            data-active={tierFilter === 'all'}
            onClick={() => setTierFilter('all')}
            className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer sk-tab"
          >
            All (72)
          </button>
          <button
            type="button"
            data-active={tierFilter === 'core'}
            onClick={() => setTierFilter('core')}
            className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer sk-tab"
          >
            Core
          </button>
          <button
            type="button"
            data-active={tierFilter === 'extended'}
            onClick={() => setTierFilter('extended')}
            className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer sk-tab"
          >
            Extended
          </button>
        </div>

        {weakTopicIds.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setTierFilter((f) => (f === 'review' ? 'all' : 'review'))
            }
            className={`w-full px-3 py-1.5 text-xs font-semibold rounded-xl border-[1.5px] flex items-center justify-between cursor-pointer transition-colors ${
              tierFilter === 'review'
                ? 'bg-[#FFF0F6] border-[#FF5FA8] text-[#9D174D]'
                : 'bg-[#FFF7FA] border-[#FBCFE8] text-[#9D174D] hover:bg-[#FFF0F6]'
            }`}
          >
            <span>Flagged from Wrong Answers</span>
            <span className="font-mono tabular-nums">{weakTopicIds.length}</span>
          </button>
        )}
      </div>

      <nav className="overflow-y-auto max-h-[68vh] lg:max-h-[calc(100vh-14rem)] divide-y divide-[#ECEBF8]">
        {filteredChapters.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#5E588C]">
            No syllabus topics match &quot;{search}&quot;.
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const isExpanded =
              isSearching ||
              expandedChapters.includes(chapter.id) ||
              chapter.id === activeChapterId;

            return (
              <div key={chapter.id}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-[#FAF9FF] transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="font-display text-xs font-bold text-[#1D1A4A] truncate">
                      {chapter.id}. {chapter.title}
                    </div>
                    <div className="text-[11px] text-[#5E588C] tabular-nums mt-0.5">
                      {chapter.subtopics.length} subtopics
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#5E588C] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#5E588C] shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <ul className="pb-2 px-2 space-y-0.5">
                    {chapter.subtopics.map((topic) => {
                      const isActive = topic.id === activeTopicId;
                      const isStudied = studiedSet.has(topic.id);

                      return (
                        <li key={topic.id}>
                          <button
                            type="button"
                            aria-current={isActive ? 'page' : undefined}
                            onClick={() => {
                              onSelectTopic(chapter.id, topic.id);
                              setMobileOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer border ${
                              isActive
                                ? 'bg-[#F4F3FC] border-[#1D1A4A] text-[#1D1A4A] font-semibold shadow-[2px_2px_0_#B8B3FF]'
                                : 'border-transparent text-[#393469] hover:bg-[#FAF9FF] hover:text-[#1D1A4A]'
                            }`}
                          >
                            <div className="flex items-baseline gap-2 min-w-0">
                              <span
                                className={`font-mono text-xs tabular-nums shrink-0 ${
                                  isActive ? 'text-[#5B57E8] font-bold' : 'text-[#5E588C]'
                                }`}
                              >
                                {topic.code}
                              </span>
                              <span className="text-xs truncate">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {weakSet.has(topic.id) && (
                                <span
                                  className="w-2 h-2 rounded-full bg-[#FF5FA8]"
                                  title="Flagged for revision"
                                  aria-label="Flagged for revision"
                                />
                              )}
                              {topic.tier === 'Extended' && (
                                <span className="text-[10px] font-mono font-semibold text-[#C0266B]">
                                  EXT
                                </span>
                              )}
                              {isStudied && (
                                <CheckCircle2
                                  className="w-3.5 h-3.5 text-emerald-600"
                                  aria-label="Studied"
                                />
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </nav>
      </div>
    </aside>
  );
};
