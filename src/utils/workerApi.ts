import type { SubjectCode } from '../types/syllabus';
import {
  fetchPapaCambridgePapers,
  fetchPapaCambridgeSessions,
  fetchUpstreamPdfWithFallback,
  isAllowedPdfProxyUrl,
} from './papacambridge';

export interface R2ObjectBodyLike {
  body: ReadableStream<Uint8Array> | ArrayBuffer | Uint8Array | string | null;
  size?: number;
  httpMetadata?: {
    contentType?: string;
  };
}

export interface R2BucketBinding {
  get(key: string): Promise<R2ObjectBodyLike | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    }
  ): Promise<unknown>;
}

export interface WorkerApiEnv {
  PDF_BUCKET?: R2BucketBinding;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const MAX_R2_MIRROR_BYTES = 25 * 1024 * 1024;
const PDF_CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=86400';

export function buildR2PdfObjectKey(parsed: URL): string {
  const cleanPath = parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`;
  return `mirror/${parsed.hostname.toLowerCase()}${cleanPath}`;
}

function getCloudflareEdgeCache(): Cache | null {
  try {
    if (typeof caches !== 'undefined' && 'default' in caches) {
      return (caches as unknown as { default: Cache }).default;
    }
  } catch {
    // ignore outside Cloudflare Worker runtime
  }
  return null;
}

function isCacheLike(value: unknown): value is Cache {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Cache).match === 'function' &&
    typeof (value as Cache).put === 'function'
  );
}

function jsonResponse(data: unknown, status = 200, cacheControl = 'no-store'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

function parseValidatedSubjectParam(rawSubject: string | null): SubjectCode | null {
  if (rawSubject === null || rawSubject === '') return '0580';
  if (rawSubject === '0580' || rawSubject === '0606') return rawSubject;
  return null;
}

export async function handleApiRequest(
  request: Request,
  fetchImpl: typeof fetch = fetch,
  envOrEdgeCache?: WorkerApiEnv | Cache | null,
  ctx?: WorkerExecutionContext,
  edgeCacheOverride?: Cache | null
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) {
    return null;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (url.pathname === '/api/health') {
    return jsonResponse({ ok: true, runtime: 'cloudflare-worker' }, 200, 'no-store');
  }

  const resolvedEdgeCacheOverride =
    edgeCacheOverride !== undefined
      ? edgeCacheOverride
      : envOrEdgeCache === null || isCacheLike(envOrEdgeCache)
        ? envOrEdgeCache
        : undefined;

  const env =
    envOrEdgeCache && !isCacheLike(envOrEdgeCache)
      ? (envOrEdgeCache as WorkerApiEnv)
      : undefined;

  const edgeCache =
    resolvedEdgeCacheOverride !== undefined
      ? resolvedEdgeCacheOverride
      : getCloudflareEdgeCache();

  if (url.pathname === '/api/papacambridge/sessions') {
    const subject = parseValidatedSubjectParam(url.searchParams.get('subject'));
    if (!subject) {
      return jsonResponse({ error: 'Invalid subject parameter' }, 400);
    }

    const cacheKey = new Request(url.toString(), { method: 'GET' });
    if (edgeCache) {
      const cached = await edgeCache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await fetchPapaCambridgeSessions(subject, fetchImpl);
    const response = jsonResponse(
      { subject, ...result },
      200,
      'public, max-age=3600, stale-while-revalidate=86400'
    );
    if (edgeCache) {
      await edgeCache.put(cacheKey, response.clone()).catch(() => undefined);
    }
    return response;
  }

  if (url.pathname === '/api/papacambridge/papers') {
    const subject = parseValidatedSubjectParam(url.searchParams.get('subject'));
    if (!subject) {
      return jsonResponse({ error: 'Invalid subject parameter' }, 400);
    }

    const session = url.searchParams.get('session') || '2024-may-june';
    if (!/^[a-z0-9-]+$/i.test(session)) {
      return jsonResponse({ error: 'Invalid session parameter' }, 400);
    }

    const cacheKey = new Request(url.toString(), { method: 'GET' });
    if (edgeCache) {
      const cached = await edgeCache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await fetchPapaCambridgePapers(session, subject, fetchImpl);
    const response = jsonResponse(
      { subject, ...result },
      200,
      'public, max-age=3600, stale-while-revalidate=86400'
    );
    if (edgeCache) {
      await edgeCache.put(cacheKey, response.clone()).catch(() => undefined);
    }
    return response;
  }

  if (url.pathname === '/api/papacambridge/pdf') {
    const rawUrl = url.searchParams.get('url') || '';
    const parsed = isAllowedPdfProxyUrl(rawUrl);

    if (!parsed) {
      return jsonResponse({ error: 'Invalid or disallowed PDF archive URL' }, 403);
    }

    // 1. Check Cloudflare Edge Cache first for lowest latency
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    if (edgeCache) {
      const cached = await edgeCache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const safeFilename = (parsed.pathname.split('/').pop() || '0580.pdf').replace(
      /["\r\n\\]/g,
      '_'
    );
    const r2Bucket = env?.PDF_BUCKET;
    const r2Key = buildR2PdfObjectKey(parsed);

    // 2. Check Cloudflare R2 persistent mirror bucket before hitting upstream
    if (r2Bucket) {
      try {
        const r2Object = await r2Bucket.get(r2Key);
        if (r2Object && r2Object.body !== null) {
          const r2Response = new Response(r2Object.body as BodyInit, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${safeFilename}"`,
              'Cache-Control': PDF_CACHE_CONTROL,
            },
          });

          if (edgeCache) {
            const edgePutPromise = edgeCache
              .put(cacheKey, r2Response.clone())
              .catch(() => undefined);
            if (ctx) {
              ctx.waitUntil(edgePutPromise);
            } else {
              await edgePutPromise;
            }
          }

          return r2Response;
        }
      } catch {
        // R2 read error should fall through to upstream fetch gracefully
      }
    }

    // 3. Fetch from upstream archive, validate %PDF-, populate Edge Cache and R2 asynchronously
    try {
      const upstream = await fetchUpstreamPdfWithFallback(parsed, fetchImpl);

      if (!upstream.ok) {
        return jsonResponse({ error: `Upstream returned ${upstream.status}` }, upstream.status);
      }

      const contentType = upstream.headers.get('content-type') || 'application/pdf';
      const buf = await upstream.arrayBuffer();
      const head = new TextDecoder('latin1').decode(
        new Uint8Array(buf, 0, Math.min(buf.byteLength, 1024))
      );

      if (!head.includes('%PDF-')) {
        return jsonResponse(
          {
            error: `Upstream returned ${contentType} instead of a PDF (this file may not exist in the archive).`,
          },
          404
        );
      }

      const response = new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeFilename}"`,
          'Cache-Control': PDF_CACHE_CONTROL,
        },
      });

      if (edgeCache) {
        const edgePutPromise = edgeCache
          .put(cacheKey, response.clone())
          .catch(() => undefined);
        if (ctx) {
          ctx.waitUntil(edgePutPromise);
        } else {
          await edgePutPromise;
        }
      }

      if (r2Bucket && buf.byteLength > 0 && buf.byteLength <= MAX_R2_MIRROR_BYTES) {
        const r2PutPromise = r2Bucket
          .put(r2Key, buf, {
            httpMetadata: { contentType: 'application/pdf' },
          })
          .catch(() => undefined);
        if (ctx) {
          ctx.waitUntil(r2PutPromise);
        } else {
          void r2PutPromise;
        }
      }

      return response;
    } catch {
      return jsonResponse({ error: 'Failed to retrieve PDF from upstream archive' }, 502);
    }
  }

  return jsonResponse({ error: 'API route not found' }, 404);
}
