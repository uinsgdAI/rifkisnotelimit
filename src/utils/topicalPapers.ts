import { TOPICAL_PAPERS_0580, type TopicalPaperPack } from '../data/topicalPapers0580';

export interface TopicalPaperFilterOptions {
  chapterId?: number | 'all';
  query?: string;
  paperMode?: 'all' | TopicalPaperPack['paperMode'];
}

export function filterTopicalPapers(
  packs: TopicalPaperPack[] = TOPICAL_PAPERS_0580,
  options: TopicalPaperFilterOptions = {}
): TopicalPaperPack[] {
  const { chapterId = 'all', query = '', paperMode = 'all' } = options;
  const trimmed = query.trim().toLowerCase();

  return packs.filter((pack) => {
    const matchesChapter =
      chapterId === 'all' ||
      pack.chapterId === chapterId ||
      pack.topicIds.some((tid) => Number(tid.split('.')[0]) === chapterId);
    if (!matchesChapter) return false;

    if (paperMode !== 'all' && pack.paperMode !== paperMode) {
      return false;
    }

    if (!trimmed) return true;

    return (
      pack.title.toLowerCase().includes(trimmed) ||
      pack.topicIds.some((tid) => tid.toLowerCase().includes(trimmed)) ||
      pack.questionsFilename.toLowerCase().includes(trimmed)
    );
  });
}

export function findTopicalPapersForTopic(
  topicId: string,
  packs: TopicalPaperPack[] = TOPICAL_PAPERS_0580
): TopicalPaperPack[] {
  return packs.filter((pack) => pack.topicIds.includes(topicId));
}

export function countTopicalPapersByChapter(
  packs: TopicalPaperPack[] = TOPICAL_PAPERS_0580
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let ch = 1; ch <= 9; ch += 1) {
    counts[ch] = 0;
  }
  for (const pack of packs) {
    counts[pack.chapterId] = (counts[pack.chapterId] || 0) + 1;
  }
  return counts;
}

export function getTopicalPdfBytesUrl(rawUrl: string): string {
  return `/api/papacambridge/pdf?url=${encodeURIComponent(rawUrl)}`;
}
