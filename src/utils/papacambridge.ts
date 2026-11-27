import type { PastPaperFile, PastPaperSession, SubjectCode } from '../types/syllabus';
import { parsePapaCambridgeFilename } from './examLogic';

export const PAPACAMBRIDGE_BASE = 'https://pastpapers.papacambridge.com';
export const SUBJECT_PATHS: Record<SubjectCode, string> = {
  '0580': '/papers/caie/igcse-mathematics-0580',
  '0606': '/papers/caie/igcse-mathematics-additional-0606',
};
export const SUBJECT_PATH = SUBJECT_PATHS['0580'];

const SECONDARY_SUBJECT_PATHS: Partial<Record<SubjectCode, string[]>> = {
  '0606': ['/papers/caie/igcse-additional-mathematics-0606'],
};

function buildFallbackSessions(subject: SubjectCode = '0580'): PastPaperSession[] {
  const subjectPath = SUBJECT_PATHS[subject];
  const list: PastPaperSession[] = [
    {
      slug: '2026-may-june',
      label: 'May / June 2026',
      year: 2026,
      series: 'May/June',
      url: `${PAPACAMBRIDGE_BASE}${subjectPath}-2026-may-june`,
    },
    {
      slug: '2026-march',
      label: 'Feb / March 2026',
      year: 2026,
      series: 'March',
      url: `${PAPACAMBRIDGE_BASE}${subjectPath}-2026-march`,
    },
  ];

  for (let year = 2025; year >= 2002; year -= 1) {
    if (year === 2002) {
      list.push({
        slug: '2002-nov',
        label: 'Oct / Nov 2002',
        year: 2002,
        series: 'Oct/Nov',
        url: `${PAPACAMBRIDGE_BASE}${subjectPath}-2002-nov`,
      });
      continue;
    }

    const useShortSlugs = year <= 2017;
    const novSlug = useShortSlugs ? `${year}-nov` : `${year}-oct-nov`;
    const junSlug =
      year === 2020
        ? 'may-june-2020'
        : useShortSlugs
          ? `${year}-jun`
          : `${year}-may-june`;
    const marSlug =
      year === 2022
        ? '2022-feb-march'
        : useShortSlugs
          ? `${year}-mar`
          : `${year}-march`;

    list.push({
      slug: novSlug,
      label: `Oct / Nov ${year}`,
      year,
      series: 'Oct/Nov',
      url: `${PAPACAMBRIDGE_BASE}${subjectPath}-${novSlug}`,
    });
    list.push({
      slug: junSlug,
      label: `May / June ${year}`,
      year,
      series: 'May/June',
      url: `${PAPACAMBRIDGE_BASE}${subjectPath}-${junSlug}`,
    });
    if (year >= 2016) {
      list.push({
        slug: marSlug,
        label: `Feb / March ${year}`,
        year,
        series: 'March',
        url: `${PAPACAMBRIDGE_BASE}${subjectPath}-${marSlug}`,
      });
    }
  }

  return list;
}

export const FALLBACK_SESSIONS: PastPaperSession[] = buildFallbackSessions('0580');
export const FALLBACK_SESSIONS_0606: PastPaperSession[] = buildFallbackSessions('0606');

export function getFallbackSessions(subject: SubjectCode = '0580'): PastPaperSession[] {
  return subject === '0606' ? FALLBACK_SESSIONS_0606 : FALLBACK_SESSIONS;
}

export function formatSessionMetadata(
  slug: string,
  subject: SubjectCode = '0580'
): PastPaperSession {
  const yearMatch = slug.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : 2024;
  let series: PastPaperSession['series'] = 'May/June';
  let label = slug.replace(/-/g, ' ');

  if (slug.includes('topical')) {
    series = 'Topical';
    label = 'Topical Past Papers';
  } else if (slug.includes('specimen')) {
    series = 'Specimen';
    label = `${year} Specimen Papers`;
  } else if (slug.includes('may-june') || /(?:^|-)jun(?:e)?$/.test(slug)) {
    series = 'May/June';
    label = `May / June ${year}`;
  } else if (slug.includes('oct-nov') || /(?:^|-)nov(?:ember)?$/.test(slug)) {
    series = 'Oct/Nov';
    label = `Oct / Nov ${year}`;
  } else if (slug.includes('march') || /(?:^|-)mar(?:ch)?$/.test(slug)) {
    series = 'March';
    label = `Feb / March ${year}`;
  }

  return {
    slug,
    label,
    year,
    series,
    url: `${PAPACAMBRIDGE_BASE}${SUBJECT_PATHS[subject]}-${slug}`,
  };
}

export function generateSessionPaperFallback(
  slug: string,
  subject: SubjectCode = '0580'
): PastPaperFile[] {
  const yearMatch = slug.match(/(\d{4})/);
  if (!yearMatch) return [];
  const year = Number(yearMatch[1]);
  const yy = yearMatch[1].slice(2);
  const code =
    slug.includes('march') || /(?:^|-)mar(?:ch)?$/.test(slug)
      ? 'm'
      : slug.includes('oct-nov') || /(?:^|-)nov(?:ember)?$/.test(slug)
        ? 'w'
        : 's';
  const papers = subject === '0606' ? ['1', '2'] : ['1', '2', '3', '4'];
  const files: PastPaperFile[] = [];

  // Cambridge introduced numbered zone variants in Oct/Nov 2009; earlier sessions (2002 – May/June 2009) used _1.._4
  const isSingleVariantEra = year < 2009 || (year === 2009 && code === 's');

  if (isSingleVariantEra) {
    for (const p of papers) {
      for (const kind of ['qp', 'ms']) {
        const fn = `${subject}_${code}${yy}_${kind}_${p}.pdf`;
        files.push(
          parsePapaCambridgeFilename(
            fn,
            `${PAPACAMBRIDGE_BASE}/directories/CAIE/CAIE-pastpapers/upload/${fn}`,
            slug
          )
        );
      }
    }
  } else {
    const variants = code === 'm' ? ['2'] : ['1', '2', '3'];
    for (const p of papers) {
      for (const v of variants) {
        for (const kind of ['qp', 'ms']) {
          const fn = `${subject}_${code}${yy}_${kind}_${p}${v}.pdf`;
          files.push(
            parsePapaCambridgeFilename(
              fn,
              `${PAPACAMBRIDGE_BASE}/directories/CAIE/CAIE-pastpapers/upload/${fn}`,
              slug
            )
          );
        }
      }
    }
  }

  if (year >= 2008) {
    const gtFn = `${subject}_${code}${yy}_gt.pdf`;
    files.push(
      parsePapaCambridgeFilename(
        gtFn,
        `${PAPACAMBRIDGE_BASE}/directories/CAIE/CAIE-pastpapers/upload/${gtFn}`,
        slug
      )
    );
  }

  const erFn = `${subject}_${code}${yy}_er.pdf`;
  files.push(
    parsePapaCambridgeFilename(
      erFn,
      `${PAPACAMBRIDGE_BASE}/directories/CAIE/CAIE-pastpapers/upload/${erFn}`,
      slug
    )
  );
  return files;
}

export function parseSessionsFromHtml(
  html: string,
  subject: SubjectCode = '0580'
): PastPaperSession[] {
  const regex =
    subject === '0606'
      ? /href="(?:https:\/\/pastpapers\.papacambridge\.com)?\/?(?:papers\/caie|directories\/CAIE\/CAIE\/igcse)\/(?:igcse-mathematics-additional-0606|igcse-additional-mathematics-0606|mathematics-additional-0606)-([a-z0-9-]+)"/gi
      : /href="(?:https:\/\/pastpapers\.papacambridge\.com)?\/?papers\/caie\/igcse-mathematics-0580-([a-z0-9-]+)"/gi;

  const seenKeys = new Set<string>();
  const sessions: PastPaperSession[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1].toLowerCase();
    if (
      slug.includes('syllabus') ||
      slug.includes('timetable') ||
      !/^(?:\d{4}-(may-june|oct-nov|march|feb-march|jun|nov|mar|specimen)|may-june-\d{4})$/.test(slug)
    ) {
      continue;
    }
    const meta = formatSessionMetadata(slug, subject);
    const canonicalKey = `${meta.year}-${meta.series}`;
    if (!seenKeys.has(canonicalKey)) {
      seenKeys.add(canonicalKey);
      sessions.push(meta);
    }
  }

  return sessions;
}

export function parsePapersFromHtml(
  html: string,
  sessionSlug: string,
  subject: SubjectCode = '0580'
): PastPaperFile[] {
  const pdfRegex =
    /(?:files=|href=")(https:\/\/pastpapers\.papacambridge\.com\/[^"&]+\.pdf|\/directories\/CAIE\/[^"&]+\.pdf)/gi;
  const seen = new Set<string>();
  const files: PastPaperFile[] = [];
  const prefixPattern = subject === '0606' ? /^0606[_-]/i : /^0580[_-]/i;

  let match: RegExpExecArray | null;
  while ((match = pdfRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const pdfUrl = rawUrl.startsWith('/') ? `${PAPACAMBRIDGE_BASE}${rawUrl}` : rawUrl;
    const filename = pdfUrl.split('/').pop() || '';
    if (!prefixPattern.test(filename)) {
      continue;
    }
    if (!seen.has(pdfUrl)) {
      seen.add(pdfUrl);
      files.push(parsePapaCambridgeFilename(filename, pdfUrl, sessionSlug));
    }
  }

  return files;
}

export function isAllowedPapaCambridgePdfUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    if (
      parsed.protocol !== 'https:' ||
      Boolean(parsed.username || parsed.password) ||
      (host !== 'pastpapers.papacambridge.com' && host !== 'www.pastpapers.papacambridge.com') ||
      parsed.pathname.includes('..') ||
      !parsed.pathname.toLowerCase().endsWith('.pdf')
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const ALLOWED_PDF_PROXY_HOSTS = new Set([
  'pastpapers.papacambridge.com',
  'www.pastpapers.papacambridge.com',
  'pastpaperpenguin.com',
  'www.pastpaperpenguin.com',
]);

export function isAllowedPdfProxyUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const decodedPath = decodeURIComponent(parsed.pathname).toLowerCase();
    if (
      parsed.protocol !== 'https:' ||
      Boolean(parsed.username || parsed.password) ||
      !ALLOWED_PDF_PROXY_HOSTS.has(host) ||
      decodedPath.includes('..') ||
      !decodedPath.endsWith('.pdf')
    ) {
      return null;
    }

    // Strict archive path checks per domain while supporting both 0580 and 0606 PDFs
    if (host.includes('papacambridge.com')) {
      const validPapaPath =
        decodedPath.startsWith('/directories/caie/') ||
        decodedPath.startsWith('/papers/caie/') ||
        /(?:^|\/)(?:0580|0606)[_-][^/]+\.pdf$/.test(decodedPath);
      if (!validPapaPath) return null;
    }

    parsed.hash = '';
    return parsed;
  } catch {
    return null;
  }
}

const DIRECT_CORS_PDF_HOSTS = new Set([
  'pastpaperpenguin.com',
  'www.pastpaperpenguin.com',
]);

export function isDirectCorsPdfUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === 'https:' &&
      DIRECT_CORS_PDF_HOSTS.has(parsed.hostname.toLowerCase()) &&
      parsed.pathname.toLowerCase().endsWith('.pdf')
    );
  } catch {
    return false;
  }
}

export function getPdfUpstreamHeaders(
  parsed: URL,
  variant: 'browser' | 'minimal' = 'browser'
): Record<string, string> {
  if (variant === 'minimal') {
    return {
      Accept: 'application/pdf,application/octet-stream,*/*;q=0.8',
    };
  }
  const host = parsed.hostname.toLowerCase();
  const referer = host.includes('pastpaperpenguin.com')
    ? 'https://pastpaperpenguin.com/'
    : 'https://pastpapers.papacambridge.com/';
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'application/pdf,application/octet-stream,*/*;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: referer,
  };
}

export async function fetchUpstreamPdfWithFallback(
  parsed: URL,
  fetchImpl: typeof fetch = fetch
): Promise<Response> {
  const urlStr = parsed.toString();
  const isPenguin = parsed.hostname.toLowerCase().includes('pastpaperpenguin.com');
  const firstVariant: 'browser' | 'minimal' = isPenguin ? 'minimal' : 'browser';
  const secondVariant: 'browser' | 'minimal' = isPenguin ? 'browser' : 'minimal';

  let upstream = await fetchImpl(urlStr, {
    headers: getPdfUpstreamHeaders(parsed, firstVariant),
    redirect: 'follow',
    signal: AbortSignal.timeout(9000),
  });

  if (upstream.status === 403 || upstream.status === 406) {
    upstream = await fetchImpl(urlStr, {
      headers: getPdfUpstreamHeaders(parsed, secondVariant),
      redirect: 'follow',
      signal: AbortSignal.timeout(9000),
    });
  }

  return upstream;
}

export function buildGoogleDocsViewerUrl(pdfUrl: string): string {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
}

export function resolvePdfIframeUrl(
  pdfUrl: string,
  options: { apiProxyAvailable: boolean; viewerMode: 'proxy' | 'web' }
): string {
  if (options.apiProxyAvailable && options.viewerMode === 'proxy') {
    return `/api/papacambridge/pdf?url=${encodeURIComponent(pdfUrl)}`;
  }
  return buildGoogleDocsViewerUrl(pdfUrl);
}

const sessionCache = new Map<SubjectCode, { data: PastPaperSession[]; expiresAt: number }>();
const papersCache = new Map<string, { data: PastPaperFile[]; expiresAt: number }>();

export async function fetchPapaCambridgeSessions(
  subject: SubjectCode = '0580',
  fetchImpl: typeof fetch = fetch
): Promise<{
  sessions: PastPaperSession[];
  source: 'live' | 'fallback';
}> {
  const cached = fetchImpl === fetch ? sessionCache.get(subject) : undefined;
  if (cached && cached.data.length > 0 && Date.now() < cached.expiresAt) {
    return { sessions: cached.data, source: 'live' };
  }

  const candidatePaths = [
    SUBJECT_PATHS[subject],
    ...(SECONDARY_SUBJECT_PATHS[subject] || []),
  ];

  for (const subjectPath of candidatePaths) {
    try {
      const resp = await fetchImpl(`${PAPACAMBRIDGE_BASE}${subjectPath}`, {
        headers: {
          'User-Agent': `Mozilla/5.0 (compatible; Cambridge${subject}StudyAssistant/1.0)`,
        },
        signal: AbortSignal.timeout(4500),
      });

      if (!resp.ok) {
        continue;
      }

      const html = await resp.text();
      const sessions = parseSessionsFromHtml(html, subject);

      if (sessions.length > 0) {
        const fallbackList = getFallbackSessions(subject);
        const existingKeys = new Set(sessions.map((s) => `${s.year}-${s.series}`));
        const seriesRank: Record<PastPaperSession['series'], number> = {
          'Oct/Nov': 3,
          'May/June': 2,
          March: 1,
          Specimen: 0,
          Topical: -1,
        };
        const merged = [
          ...sessions,
          ...fallbackList.filter((fs) => !existingKeys.has(`${fs.year}-${fs.series}`)),
        ].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return (seriesRank[b.series] ?? 0) - (seriesRank[a.series] ?? 0);
        });
        sessionCache.set(subject, {
          data: merged,
          expiresAt: Date.now() + 1000 * 60 * 30,
        });
        return { sessions: merged, source: 'live' };
      }
    } catch {
      // Try next candidate path or fall back cleanly
    }
  }

  return { sessions: getFallbackSessions(subject), source: 'fallback' };
}

export async function fetchPapaCambridgePapers(
  slug: string,
  subject: SubjectCode = '0580',
  fetchImpl: typeof fetch = fetch
): Promise<{
  papers: PastPaperFile[];
  source: 'live' | 'fallback';
}> {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '');
  const cacheKey = `${subject}:${safeSlug}`;
  const cached = fetchImpl === fetch ? papersCache.get(cacheKey) : undefined;
  if (cached && Date.now() < cached.expiresAt) {
    return { papers: cached.data, source: 'live' };
  }

  const candidatePaths = [
    SUBJECT_PATHS[subject],
    ...(SECONDARY_SUBJECT_PATHS[subject] || []),
  ];

  for (const subjectPath of candidatePaths) {
    try {
      const targetUrl = `${PAPACAMBRIDGE_BASE}${subjectPath}-${safeSlug}`;
      const resp = await fetchImpl(targetUrl, {
        headers: {
          'User-Agent': `Mozilla/5.0 (compatible; Cambridge${subject}StudyAssistant/1.0)`,
        },
        signal: AbortSignal.timeout(4500),
      });

      if (!resp.ok) {
        continue;
      }

      const html = await resp.text();
      const files = parsePapersFromHtml(html, safeSlug, subject);

      if (files.length > 0) {
        papersCache.set(cacheKey, {
          data: files,
          expiresAt: Date.now() + 1000 * 60 * 30,
        });
        return { papers: files, source: 'live' };
      }
    } catch {
      // Try next candidate path or fall back cleanly
    }
  }

  return {
    papers: generateSessionPaperFallback(safeSlug, subject),
    source: 'fallback',
  };
}
