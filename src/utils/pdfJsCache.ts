import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export interface CachedPdfDocumentResult {
  doc: pdfjsLib.PDFDocumentProxy;
  firstPageDims: { width: number; height: number };
  fromCache: boolean;
  dispose: () => void;
}

interface CompletedPdfDocEntry {
  loadingTask: pdfjsLib.PDFDocumentLoadingTask;
  doc: pdfjsLib.PDFDocumentProxy;
  firstPageDims: { width: number; height: number };
}

const PDF_DOC_CACHE_MAX_ENTRIES = 4;
const completedPdfDocCache = new Map<string, CompletedPdfDocEntry>();
let sharedPdfWorker: pdfjsLib.PDFWorker | null = null;

export function getSharedPdfWorker(): pdfjsLib.PDFWorker | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedPdfWorker || sharedPdfWorker.destroyed) {
      sharedPdfWorker = pdfjsLib.PDFWorker.create({
        name: 'cambridge-0580-pdf-worker',
      });
    }
    return sharedPdfWorker;
  } catch {
    return null;
  }
}

export function warmSharedPdfWorker(): void {
  getSharedPdfWorker();
}

function getCachedEntry(cacheKey: string): CompletedPdfDocEntry | null {
  const existing = completedPdfDocCache.get(cacheKey);
  if (!existing) return null;
  if (existing.loadingTask.destroyed) {
    completedPdfDocCache.delete(cacheKey);
    return null;
  }
  completedPdfDocCache.delete(cacheKey);
  completedPdfDocCache.set(cacheKey, existing);
  return existing;
}

function writeCachedEntry(cacheKey: string, entry: CompletedPdfDocEntry): void {
  const existing = completedPdfDocCache.get(cacheKey);
  if (existing && existing !== entry) {
    completedPdfDocCache.delete(cacheKey);
    void existing.loadingTask.destroy().catch(() => undefined);
  }
  while (completedPdfDocCache.size >= PDF_DOC_CACHE_MAX_ENTRIES) {
    const oldestKey = completedPdfDocCache.keys().next().value;
    if (!oldestKey) break;
    const oldest = completedPdfDocCache.get(oldestKey);
    completedPdfDocCache.delete(oldestKey);
    if (oldest) {
      void oldest.loadingTask.destroy().catch(() => undefined);
    }
  }
  completedPdfDocCache.set(cacheKey, entry);
}

export async function loadPdfDocumentFast(options: {
  cacheKey: string;
  useCache: boolean;
  getBytes: () => Promise<Uint8Array>;
  signal?: AbortSignal;
}): Promise<CachedPdfDocumentResult> {
  const { cacheKey, useCache, getBytes, signal } = options;

  if (useCache) {
    const cached = getCachedEntry(cacheKey);
    if (cached) {
      return {
        doc: cached.doc,
        firstPageDims: cached.firstPageDims,
        fromCache: true,
        dispose: () => {},
      };
    }
  }

  const bytes = await getBytes();
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const worker = getSharedPdfWorker();
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    ...(worker ? { worker } : {}),
    wasmUrl: '/pdfjs/wasm/',
    standardFontDataUrl: '/pdfjs/standard_fonts/',
  });

  const onAbort = () => {
    void loadingTask.destroy().catch(() => undefined);
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const doc = await loadingTask.promise;
    if (signal?.aborted) {
      void loadingTask.destroy().catch(() => undefined);
      throw new DOMException('Aborted', 'AbortError');
    }

    const firstPage = await doc.getPage(1);
    const firstVp = firstPage.getViewport({ scale: 1 });
    if (signal?.aborted) {
      void loadingTask.destroy().catch(() => undefined);
      throw new DOMException('Aborted', 'AbortError');
    }

    const firstPageDims = { width: firstVp.width, height: firstVp.height };

    if (useCache) {
      writeCachedEntry(cacheKey, {
        loadingTask,
        doc,
        firstPageDims,
      });
    }

    return {
      doc,
      firstPageDims,
      fromCache: false,
      dispose: useCache
        ? () => {}
        : () => {
            void loadingTask.destroy().catch(() => undefined);
          },
    };
  } catch (err) {
    void loadingTask.destroy().catch(() => undefined);
    throw err;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}
