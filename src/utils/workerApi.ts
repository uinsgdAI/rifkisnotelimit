import {
  fetchPapaCambridgePapers,
  fetchPapaCambridgeSessions,
  fetchUpstreamPdfWithFallback,
  isAllowedPdfProxyUrl,
} from './papacambridge';

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

function jsonResponse(data: unknown, status = 200, cacheControl = 'no-store'): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

export async function handleApiRequest(
  request: Request,
  fetchImpl: typeof fetch = fetch
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

  if (url.pathname === '/api/papacambridge/sessions') {
    const result = await fetchPapaCambridgeSessions();
    return jsonResponse(result, 200, 'public, max-age=3600, stale-while-revalidate=86400');
  }

  if (url.pathname === '/api/papacambridge/papers') {
    const session = url.searchParams.get('session') || '2024-may-june';
    if (!/^[a-z0-9-]+$/i.test(session)) {
      return jsonResponse({ error: 'Invalid session parameter' }, 400);
    }
    const result = await fetchPapaCambridgePapers(session);
    return jsonResponse(result, 200, 'public, max-age=3600, stale-while-revalidate=86400');
  }

  if (url.pathname === '/api/papacambridge/pdf') {
    const rawUrl = url.searchParams.get('url') || '';
    const parsed = isAllowedPdfProxyUrl(rawUrl);

    if (!parsed) {
      return jsonResponse({ error: 'Invalid or disallowed PDF archive URL' }, 403);
    }

    const edgeCache = getCloudflareEdgeCache();
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    if (edgeCache) {
      const cached = await edgeCache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

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

      const filename = parsed.pathname.split('/').pop() || '0580.pdf';

      const response = new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        },
      });

      if (edgeCache) {
        await edgeCache.put(cacheKey, response.clone()).catch(() => undefined);
      }

      return response;
    } catch {
      return jsonResponse({ error: 'Failed to retrieve PDF from upstream archive' }, 502);
    }
  }

  return jsonResponse({ error: 'API route not found' }, 404);
}
