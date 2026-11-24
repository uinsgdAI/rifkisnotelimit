import { fetchUpstreamPdfWithFallback, isAllowedPdfProxyUrl } from '../../../src/utils/papacambridge';

function getEdgeCache(): Cache | null {
  try {
    if (typeof caches !== 'undefined' && 'default' in caches) {
      return (caches as unknown as { default: Cache }).default;
    }
  } catch {
    // ignore outside Cloudflare runtime
  }
  return null;
}

export async function onRequestGet(context: {
  request: Request;
  waitUntil?: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const reqUrl = new URL(context.request.url);
  const rawUrl = reqUrl.searchParams.get('url') || '';
  const parsed = isAllowedPdfProxyUrl(rawUrl);

  if (!parsed) {
    return new Response(
      JSON.stringify({ error: 'Invalid or disallowed PDF archive URL' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }

  const edgeCache = getEdgeCache();
  const cacheKey = new Request(reqUrl.toString(), { method: 'GET' });
  if (edgeCache) {
    const cached = await edgeCache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const upstream = await fetchUpstreamPdfWithFallback(parsed);

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${upstream.status}` }),
        {
          status: upstream.status,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    const contentType = upstream.headers.get('content-type') || 'application/pdf';
    const buf = await upstream.arrayBuffer();
    const head = new TextDecoder('latin1').decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 1024)));

    if (!head.includes('%PDF-')) {
      return new Response(
        JSON.stringify({
          error: `Upstream returned ${contentType} instead of a PDF (this file may not exist in the archive).`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }
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
      const putPromise = edgeCache.put(cacheKey, response.clone()).catch(() => undefined);
      if (typeof context.waitUntil === 'function') {
        context.waitUntil(putPromise);
      } else {
        await putPromise;
      }
    }

    return response;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve PDF from upstream archive' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}
