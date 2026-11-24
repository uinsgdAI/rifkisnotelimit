import { TOPICAL_PAPERS_0580, type TopicalPaperPack } from '../data/topicalPapers0580';
import {
  buildPdfByteCandidateUrls,
  fetchPdfBytesWithFallback,
  hasActiveHighPriorityPdfFetch,
  hasCachedPdfBytes,
  waitForHighPriorityPdfFetches,
} from './pdfAnnotations';
import { getTopicalPdfBytesUrl } from './topicalPapers';

export interface WarmupQueueItem {
  packId: string;
  kind: 'Q' | 'A';
  candidates: string[];
}

export function buildTopicalWarmupQueue(
  packs: TopicalPaperPack[] = TOPICAL_PAPERS_0580,
  activeTopicId?: string
): WarmupQueueItem[] {
  const queue: WarmupQueueItem[] = [];
  const seen = new Set<string>();

  const pushUrl = (packId: string, kind: 'Q' | 'A', url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    queue.push({
      packId,
      kind,
      candidates: buildPdfByteCandidateUrls(getTopicalPdfBytesUrl(url), url),
    });
  };

  if (activeTopicId) {
    for (const pack of packs) {
      if (pack.topicIds.includes(activeTopicId)) {
        pushUrl(pack.id, 'Q', pack.questionsUrl);
        pushUrl(pack.id, 'A', pack.answersUrl);
      }
    }
  }

  for (const pack of packs) {
    pushUrl(pack.id, 'Q', pack.questionsUrl);
  }
  for (const pack of packs) {
    pushUrl(pack.id, 'A', pack.answersUrl);
  }

  return queue;
}

const PDFJS_WARM_ASSETS = [
  '/pdfjs/wasm/openjpeg.wasm',
  '/pdfjs/wasm/openjpeg_nowasm_fallback.js',
  '/pdfjs/wasm/qcms_bg.wasm',
];

const API_WARM_ENDPOINTS = [
  '/api/papacambridge/sessions',
  '/api/papacambridge/papers?session=2024-may-june',
];

let warmupStarted = false;
let warmupPaused = false;
const warmupResumeResolvers: Array<() => void> = [];

export function setBackgroundWarmupPaused(paused: boolean): void {
  warmupPaused = paused;
  if (!paused) {
    while (warmupResumeResolvers.length > 0) {
      const resolve = warmupResumeResolvers.shift();
      resolve?.();
    }
  }
}

export function isBackgroundWarmupPaused(): boolean {
  return warmupPaused;
}

function waitWhileBackgroundWarmupPaused(): Promise<void> {
  if (!warmupPaused) return Promise.resolve();
  return new Promise((resolve) => {
    warmupResumeResolvers.push(resolve);
  });
}

function scheduleIdleWork(task: () => void, timeoutMs: number): () => void {
  if (typeof window === 'undefined') return () => {};
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof win.requestIdleCallback === 'function') {
    const idleId = win.requestIdleCallback(task, { timeout: timeoutMs });
    return () => win.cancelIdleCallback?.(idleId);
  }
  const timer = window.setTimeout(task, Math.min(timeoutMs, 250));
  return () => window.clearTimeout(timer);
}

function isDataSaverEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  return Boolean(nav.connection?.saveData);
}

export function startBackgroundAppWarmup(options: {
  activeTopicId?: string;
  preloadViews: () => Promise<void>;
}): () => void {
  if (typeof window === 'undefined' || warmupStarted) {
    return () => {};
  }
  warmupStarted = true;
  let cancelled = false;

  const cancelIdle = scheduleIdleWork(() => {
    if (cancelled) return;

    // 1. Preload all route/modal JS chunks & shared PDF.js worker
    void options.preloadViews().catch(() => undefined);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }

    // 2. Warm PDF.js WASM decoders and recent PapaCambridge session JSON
    for (const assetUrl of PDFJS_WARM_ASSETS) {
      void fetch(assetUrl, { cache: 'force-cache' }).catch(() => undefined);
    }
    for (const apiUrl of API_WARM_ENDPOINTS) {
      void fetch(apiUrl).catch(() => undefined);
    }

    // 3. Gently preload and persist all 78 topical Q + A PDFs into browser Cache API
    if (isDataSaverEnabled()) {
      return;
    }

    const queue = buildTopicalWarmupQueue(TOPICAL_PAPERS_0580, options.activeTopicId);
    let cursor = 0;
    const CONCURRENCY = 3;

    const runWorker = async () => {
      while (!cancelled && cursor < queue.length) {
        if (warmupPaused) {
          await waitWhileBackgroundWarmupPaused();
        }
        if (hasActiveHighPriorityPdfFetch()) {
          await waitForHighPriorityPdfFetches();
        }
        if (cancelled) return;
        const item = queue[cursor++];
        if (!item) return;

        try {
          const alreadyCached = await hasCachedPdfBytes(item.candidates);
          if (!alreadyCached && !cancelled && !warmupPaused) {
            await fetchPdfBytesWithFallback(item.candidates, {
              priority: 'background',
            });
          }
        } catch {
          // ignore transient background prefetch errors silently
        }

        await new Promise((r) => window.setTimeout(r, 15));
      }
    };

    window.setTimeout(() => {
      if (cancelled) return;
      for (let i = 0; i < CONCURRENCY; i++) {
        void runWorker();
      }
    }, 120);
  }, 200);

  return () => {
    cancelled = true;
    cancelIdle();
  };
}
