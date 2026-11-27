import type { TopicalPaperPack } from '../types/syllabus';

export interface TopicalPaperFilterOptions {
  chapterId?: number | 'all';
  query?: string;
  paperMode?: 'all' | TopicalPaperPack['paperMode'];
}

export function filterTopicalPapers(
  packs: TopicalPaperPack[] = [],
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
  packs: TopicalPaperPack[] = []
): TopicalPaperPack[] {
  return packs.filter((pack) => pack.topicIds.includes(topicId));
}

export function countTopicalPapersByChapter(
  packs: TopicalPaperPack[] = [],
  chapterCount?: number
): Record<number, number> {
  const maxChapter = Math.max(
    chapterCount ?? 9,
    ...packs.map((pack) => pack.chapterId)
  );
  const counts: Record<number, number> = {};
  for (let ch = 1; ch <= maxChapter; ch += 1) {
    counts[ch] = 0;
  }
  for (const pack of packs) {
    counts[pack.chapterId] = (counts[pack.chapterId] || 0) + 1;
  }
  return counts;
}

export function getTopicalPdfBytesUrl(rawUrl: string): string {
  const cleanUrl = rawUrl.split('#')[0];
  return `/api/papacambridge/pdf?url=${encodeURIComponent(cleanUrl)}`;
}
