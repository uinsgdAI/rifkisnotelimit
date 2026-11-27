import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SUBTOPICS_0580, SYLLABUS_0580 } from '../data/syllabus0580';
import { ALL_SUBTOPICS_0606 } from '../data/syllabus0606';
import { TOPICAL_PAPERS_0580 } from '../data/topicalPapers0580';
import { TOPICAL_PAPERS_0606 } from '../data/topicalPapers0606';
import { parseAppRoute, buildAppRoutePath } from './examLogic';
import {
  fetchUpstreamPdfWithFallback,
  getPdfUpstreamHeaders,
  isAllowedPdfProxyUrl,
  isDirectCorsPdfUrl,
} from './papacambridge';
import {
  buildPdfByteCandidateUrls,
  clearPdfBytesCache,
  fetchPdfBytesWithFallback,
} from './pdfAnnotations';
import {
  countTopicalPapersByChapter,
  filterTopicalPapers,
  findTopicalPapersForTopic,
  getTopicalPdfBytesUrl,
} from './topicalPapers';
import { buildTopicalWarmupQueue } from './backgroundPreloader';
import {
  buildR2PdfObjectKey,
  handleApiRequest,
  type R2BucketBinding,
  type WorkerExecutionContext,
} from './workerApi';
import workerEntry from '../worker';

test('All 78 Past Paper Penguin topical packs have valid URLs and map to real 0580 syllabus topics', () => {
  assert.equal(TOPICAL_PAPERS_0580.length, 78);

  const validTopicIds = new Set(ALL_SUBTOPICS_0580.map((t) => t.id));
  const seenIds = new Set<string>();

  for (const pack of TOPICAL_PAPERS_0580) {
    assert.ok(pack.id.length > 0);
    assert.equal(seenIds.has(pack.id), false, `Duplicate pack id ${pack.id}`);
    seenIds.add(pack.id);

    assert.ok(pack.chapterId >= 1 && pack.chapterId <= 9, `Invalid chapterId on ${pack.title}`);
    assert.ok(pack.topicIds.length >= 1, `Missing topicIds on ${pack.title}`);
    for (const tid of pack.topicIds) {
      assert.ok(validTopicIds.has(tid), `Unknown syllabus topic ${tid} on ${pack.title}`);
    }

    assert.ok(isAllowedPdfProxyUrl(pack.questionsUrl), `Questions URL rejected by proxy: ${pack.questionsUrl}`);
    assert.ok(pack.answersUrl, `Missing answersUrl on 0580 pack ${pack.title}`);
    assert.ok(isAllowedPdfProxyUrl(pack.answersUrl), `Answers URL rejected by proxy: ${pack.answersUrl}`);
    assert.match(pack.questionsFilename, /^Q-.*\.pdf$/i);
    assert.ok(pack.answersFilename, `Missing answersFilename on 0580 pack ${pack.title}`);
    assert.match(pack.answersFilename, /^A-.*\.pdf$/i);
  }
});

test('Topical filtering, chapter counts, and syllabus lookup return accurate packs', () => {
  const counts = countTopicalPapersByChapter(TOPICAL_PAPERS_0580);
  const totalCounted = Object.values(counts).reduce((acc, n) => acc + n, 0);
  assert.equal(totalCounted, 78);

  const surdMatches = filterTopicalPapers(TOPICAL_PAPERS_0580, { query: 'Surds' });
  assert.equal(surdMatches.length, 1);
  assert.equal(surdMatches[0].id, 'surds-non-calc');
  assert.equal(surdMatches[0].paperMode, 'Non-Calc');

  const ch3Matches = filterTopicalPapers(TOPICAL_PAPERS_0580, { chapterId: 3 });
  assert.equal(ch3Matches.length, 2);

  const topic118Packs = findTopicalPapersForTopic('1.18', TOPICAL_PAPERS_0580);
  assert.equal(topic118Packs.length, 1);
  assert.equal(topic118Packs[0].questionsFilename, 'Q-Surds-Non-Calc.pdf');

  assert.equal(
    getTopicalPdfBytesUrl('https://pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Surds-Non-Calc.pdf'),
    '/api/papacambridge/pdf?url=https%3A%2F%2Fpastpaperpenguin.com%2Fwp-content%2Fuploads%2F2026%2F09%2FQ-Surds-Non-Calc.pdf'
  );
  assert.equal(
    getTopicalPdfBytesUrl(
      'https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/2023-Vectors-in-two-dimensions-Add-Math-0606.pdf#view=FitH'
    ),
    '/api/papacambridge/pdf?url=https%3A%2F%2Fpastpapers.papacambridge.com%2Fdirectories%2FCAIE%2FCAIE-pastpapers%2Fupload%2F2023-Vectors-in-two-dimensions-Add-Math-0606.pdf'
  );
});

test('PDF proxy allowlist and upstream headers support PapaCambridge and PastPaperPenguin securely', async () => {
  const penguinQ = 'https://pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Surds-Non-Calc.pdf';
  const papaQp = 'https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0580_s24_qp_42.pdf';

  const parsedPenguin = isAllowedPdfProxyUrl(penguinQ);
  const parsedPapa = isAllowedPdfProxyUrl(papaQp);
  assert.ok(parsedPenguin);
  assert.ok(parsedPapa);
  assert.equal(getPdfUpstreamHeaders(parsedPenguin).Referer, 'https://pastpaperpenguin.com/');
  assert.equal(getPdfUpstreamHeaders(parsedPapa).Referer, 'https://pastpapers.papacambridge.com/');

  assert.equal(isAllowedPdfProxyUrl('http://pastpaperpenguin.com/Q-Surds-Non-Calc.pdf'), null);
  assert.equal(isAllowedPdfProxyUrl('https://pastpaperpenguin.com/igcse-questions-by-topic/'), null);
  assert.equal(isAllowedPdfProxyUrl('https://evil.example.com/Q-Surds-Non-Calc.pdf'), null);

  const workerRes = await handleApiRequest(
    new Request(`https://igcse.rifkisnote.my.id/api/papacambridge/pdf?url=${encodeURIComponent(penguinQ)}`),
    async () =>
      new Response(new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj'), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })
  );
  assert.ok(workerRes);
  assert.equal(workerRes.status, 200);
  assert.equal(workerRes.headers.get('content-type'), 'application/pdf');
  assert.match(workerRes.headers.get('content-disposition') || '', /Q-Surds-Non-Calc\.pdf/);
});

test('Syllabus notes explicitly cover all strengthened topical sub-skills and ?pack= route roundtrips', () => {
  const getCombinedText = (id: string) => {
    const t = SYLLABUS_0580.flatMap((c) => c.subtopics).find((s) => s.id === id);
    assert.ok(t, `Missing topic ${id}`);
    return (
      t.studyNotes.map((n) => `${n.heading} ${n.body} ${(n.bullets || []).join(' ')}`).join(' ') +
      ' ' +
      t.workedExamples.map((w) => `${w.title} ${w.question} ${w.steps.join(' ')}`).join(' ')
    );
  };

  assert.match(getCombinedText('1.6'), /decimals/i);
  assert.match(getCombinedText('2.3'), /Solving Equations with Algebraic Fractions/i);
  assert.match(getCombinedText('2.5'), /Completing the Square.*a > 1/i);
  assert.match(getCombinedText('2.7'), /Cubic.*Fraction Sequences/i);
  assert.match(getCombinedText('2.10'), /Drawing a Tangent/i);
  assert.match(getCombinedText('5.3'), /Minor Sector/i);
  assert.match(getCombinedText('5.3'), /Major Sector/i);
  assert.match(getCombinedText('5.3'), /360\^\\circ - \\theta/i);

  const parsedPackRoute = parseAppRoute('/practice/0580', '?pack=surds-non-calc');
  assert.deepEqual(parsedPackRoute, {
    view: 'practice',
    mode: undefined,
    topicId: undefined,
    topicalPackId: 'surds-non-calc',
  });
  assert.equal(
    buildAppRoutePath({ view: 'practice', topicalPackId: 'surds-non-calc' }),
    '/practice/0580?pack=surds-non-calc'
  );
});

test('Direct-CORS ordering and multi-source PDF byte fallback bypass proxy 403 errors', async () => {
  const penguinQ =
    'https://pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Calculations-with-Negatives-Decimals-etc-Non-Calc.pdf';
  const proxyQ = getTopicalPdfBytesUrl(penguinQ);
  const papaQp =
    'https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0580_s24_qp_42.pdf';
  const proxyPapa = getTopicalPdfBytesUrl(papaQp);

  assert.equal(isDirectCorsPdfUrl(penguinQ), true);
  assert.equal(isDirectCorsPdfUrl(papaQp), false);

  // Past Paper Penguin prefers direct browser CORS fetch first, proxy second
  assert.deepEqual(buildPdfByteCandidateUrls(proxyQ, penguinQ), [penguinQ, proxyQ]);
  // PapaCambridge keeps same-origin proxy first
  assert.deepEqual(buildPdfByteCandidateUrls(proxyPapa, papaQp), [proxyPapa, papaQp]);
  // Local blob PDFs stay single-source
  assert.deepEqual(buildPdfByteCandidateUrls('blob:http://localhost:3000/abc'), [
    'blob:http://localhost:3000/abc',
  ]);

  // If primary candidate returns 403, fallback candidate succeeds seamlessly
  const calls: string[] = [];
  const res = await fetchPdfBytesWithFallback([proxyQ, penguinQ], {
    fetchImpl: (async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url === proxyQ) {
        return new Response(JSON.stringify({ error: 'Upstream returned 403' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(new TextEncoder().encode('%PDF-1.4\n%%EOF'), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      });
    }) as typeof fetch,
  });

  assert.deepEqual(calls, [proxyQ, penguinQ]);
  assert.equal(res.loadedFrom, penguinQ);
  assert.equal(new TextDecoder('latin1').decode(res.bytes.slice(0, 5)), '%PDF-');

  // Server/Worker proxy also retries with alternate header profile on upstream 403
  let attempt = 0;
  const parsedPenguin = isAllowedPdfProxyUrl(penguinQ)!;
  const upstreamRes = await fetchUpstreamPdfWithFallback(parsedPenguin, (async () => {
    attempt += 1;
    if (attempt === 1) {
      return new Response('Forbidden', { status: 403 });
    }
    return new Response(new TextEncoder().encode('%PDF-1.4\n'), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    });
  }) as typeof fetch);

  assert.equal(attempt, 2);
  assert.equal(upstreamRes.status, 200);
});

test('PDF byte cache deduplicates concurrent fetches and returns isolated byte copies', async () => {
  clearPdfBytesCache();
  let networkHits = 0;
  const fakeUrl = 'https://pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Cache-Test.pdf';
  const mockFetch = (async () => {
    networkHits += 1;
    await new Promise((r) => setTimeout(r, 10));
    return new Response(new TextEncoder().encode('%PDF-1.7\n%cached-bytes'), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    });
  }) as typeof fetch;

  // Two simultaneous requests deduplicate into 1 network fetch
  const [r1, r2] = await Promise.all([
    fetchPdfBytesWithFallback([fakeUrl], { fetchImpl: mockFetch }),
    fetchPdfBytesWithFallback([fakeUrl], { fetchImpl: mockFetch }),
  ]);
  assert.equal(networkHits, 1);
  assert.notEqual(r1.bytes.buffer, r2.bytes.buffer);

  // Mutating r1.bytes simulates worker transfer/corruption without affecting cached hits
  r1.bytes[0] = 0;
  const r3 = await fetchPdfBytesWithFallback([fakeUrl], { fetchImpl: mockFetch });
  assert.equal(networkHits, 1);
  assert.equal(new TextDecoder('latin1').decode(r3.bytes.slice(0, 5)), '%PDF-');

  clearPdfBytesCache();
});

test('buildTopicalWarmupQueue only queues Q + A PDFs for activeTopicId and skips full-catalog preloading', () => {
  assert.deepEqual(buildTopicalWarmupQueue(TOPICAL_PAPERS_0580), []);

  const queue = buildTopicalWarmupQueue(TOPICAL_PAPERS_0580, '7.1');
  const expectedPack = TOPICAL_PAPERS_0580.find((p) => p.topicIds.includes('7.1'))!;
  assert.equal(queue.length, 2);
  assert.equal(queue[0].packId, expectedPack.id);
  assert.equal(queue[0].kind, 'Q');
  assert.equal(queue[1].packId, expectedPack.id);
  assert.equal(queue[1].kind, 'A');
});

test('All 14 PapaCambridge 0606 topical packs map cleanly to 0606 syllabus topics and strip URL hashes', () => {
  assert.equal(TOPICAL_PAPERS_0606.length, 14);

  const validTopicIds = new Set(ALL_SUBTOPICS_0606.map((t) => t.id));
  const seenIds = new Set<string>();

  for (const pack of TOPICAL_PAPERS_0606) {
    assert.ok(pack.id.length > 0);
    assert.equal(seenIds.has(pack.id), false, `Duplicate 0606 pack id ${pack.id}`);
    seenIds.add(pack.id);

    assert.ok(pack.chapterId >= 1 && pack.chapterId <= 14, `Invalid 0606 chapterId on ${pack.title}`);
    assert.ok(pack.topicIds.length >= 1, `Missing topicIds on ${pack.title}`);
    for (const tid of pack.topicIds) {
      assert.ok(validTopicIds.has(tid), `Unknown 0606 syllabus topic ${tid} on ${pack.title}`);
    }

    assert.ok(isAllowedPdfProxyUrl(pack.questionsUrl), `0606 URL rejected by proxy: ${pack.questionsUrl}`);
    assert.match(pack.questionsFilename, /^2023-.*-Add-Math-0606\.pdf$/i);
    assert.equal(pack.answersUrl, undefined);
  }

  const parsedWithHash = isAllowedPdfProxyUrl(
    'https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/2023-Vectors-in-two-dimensions-Add-Math-0606.pdf#view=FitH'
  );
  assert.ok(parsedWithHash);
  assert.equal(parsedWithHash.hash, '');

  const counts = countTopicalPapersByChapter(TOPICAL_PAPERS_0606, 14);
  const totalCounted = Object.values(counts).reduce((acc, n) => acc + n, 0);
  assert.equal(totalCounted, 14);

  const vectorsPacks = findTopicalPapersForTopic('13.1', TOPICAL_PAPERS_0606);
  assert.equal(vectorsPacks.length, 1);
  assert.equal(vectorsPacks[0].id, '2023-vectors-in-two-dimensions-0606');

  const warmupQueue0606 = buildTopicalWarmupQueue(TOPICAL_PAPERS_0606, '13.1');
  assert.equal(warmupQueue0606.length, 1);
  assert.equal(warmupQueue0606[0].kind, 'Q');
  assert.equal(warmupQueue0606[0].packId, '2023-vectors-in-two-dimensions-0606');
});

test('/api/papacambridge/pdf follows Edge Cache -> R2 bucket -> Upstream -> async R2 mirror flow', async () => {
  const penguinPdf =
    'https://pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Surds-Non-Calc.pdf';
  const expectedKey = buildR2PdfObjectKey(isAllowedPdfProxyUrl(penguinPdf)!);
  assert.equal(
    expectedKey,
    'mirror/pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Surds-Non-Calc.pdf'
  );

  const edgeStore = new Map<string, Response>();
  const mockEdgeCache = {
    async match(req: RequestInfo | URL) {
      const key = typeof req === 'string' ? req : req instanceof URL ? req.toString() : req.url;
      return edgeStore.get(key)?.clone() ?? undefined;
    },
    async put(req: RequestInfo | URL, res: Response) {
      const key = typeof req === 'string' ? req : req instanceof URL ? req.toString() : req.url;
      edgeStore.set(key, res);
    },
  } as unknown as Cache;

  const r2Store = new Map<
    string,
    { bytes: Uint8Array; contentType?: string }
  >();
  let r2GetCalls = 0;
  let r2PutCalls = 0;

  const mockR2Bucket: R2BucketBinding = {
    async get(key: string) {
      r2GetCalls += 1;
      const entry = r2Store.get(key);
      if (!entry) return null;
      return {
        body: entry.bytes,
        size: entry.bytes.byteLength,
        httpMetadata: { contentType: entry.contentType },
      };
    },
    async put(key: string, value: ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string, options) {
      r2PutCalls += 1;
      const bytes =
        value instanceof ArrayBuffer
          ? new Uint8Array(value.slice(0))
          : ArrayBuffer.isView(value)
            ? new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength))
            : new TextEncoder().encode(String(value));
      r2Store.set(key, {
        bytes,
        contentType: options?.httpMetadata?.contentType,
      });
    },
  };

  let upstreamCalls = 0;
  const mockUpstreamFetch = (async () => {
    upstreamCalls += 1;
    return new Response(new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<<>>\nendobj'), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
    });
  }) as typeof fetch;

  const pendingWaitUntil: Promise<unknown>[] = [];
  const mockCtx: WorkerExecutionContext = {
    waitUntil(p) {
      pendingWaitUntil.push(p);
    },
  };

  const apiUrl = `https://igcse.rifkisnote.my.id/api/papacambridge/pdf?url=${encodeURIComponent(penguinPdf)}`;

  // 1. Cold miss: hits upstream once, stores in Edge Cache + async R2 via ctx.waitUntil
  const res1 = await handleApiRequest(
    new Request(apiUrl),
    mockUpstreamFetch,
    { PDF_BUCKET: mockR2Bucket },
    mockCtx,
    mockEdgeCache
  );
  assert.ok(res1);
  assert.equal(res1.status, 200);
  assert.equal(res1.headers.get('cache-control'), 'public, max-age=604800, stale-while-revalidate=86400');
  assert.equal(upstreamCalls, 1);
  assert.equal(r2GetCalls, 1);

  await Promise.all(pendingWaitUntil.splice(0));
  assert.equal(r2PutCalls, 1);
  assert.equal(r2Store.get(expectedKey)?.contentType, 'application/pdf');
  assert.ok(edgeStore.has(apiUrl));

  // 2. Warm Edge Cache hit: does NOT read R2 or hit upstream
  const res2 = await handleApiRequest(
    new Request(apiUrl),
    mockUpstreamFetch,
    { PDF_BUCKET: mockR2Bucket },
    mockCtx,
    mockEdgeCache
  );
  assert.ok(res2);
  assert.equal(res2.status, 200);
  assert.equal(upstreamCalls, 1);
  assert.equal(r2GetCalls, 1);

  // 3. Edge Cache evicted, R2 warm hit: serves from R2, re-populates Edge Cache, never hits upstream
  edgeStore.clear();
  const res3 = await handleApiRequest(
    new Request(apiUrl),
    mockUpstreamFetch,
    { PDF_BUCKET: mockR2Bucket },
    mockCtx,
    mockEdgeCache
  );
  assert.ok(res3);
  assert.equal(res3.status, 200);
  assert.equal(res3.headers.get('content-type'), 'application/pdf');
  assert.equal(res3.headers.get('cache-control'), 'public, max-age=604800, stale-while-revalidate=86400');
  assert.equal(new TextDecoder('latin1').decode((await res3.arrayBuffer()).slice(0, 5)), '%PDF-');
  assert.equal(upstreamCalls, 1);
  assert.equal(r2GetCalls, 2);
  await Promise.all(pendingWaitUntil.splice(0));
  assert.ok(edgeStore.has(apiUrl));

  // 4. Non-PDF upstream HTML never gets mirrored to R2
  const badUrl = 'https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0606_s99_qp_1.pdf';
  const htmlUpstream = (async () =>
    new Response('<html>404</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })) as typeof fetch;
  const badRes = await handleApiRequest(
    new Request(`https://igcse.rifkisnote.my.id/api/papacambridge/pdf?url=${encodeURIComponent(badUrl)}`),
    htmlUpstream,
    { PDF_BUCKET: mockR2Bucket },
    mockCtx,
    mockEdgeCache
  );
  assert.equal(badRes?.status, 404);
  await Promise.all(pendingWaitUntil.splice(0));
  assert.equal(r2PutCalls, 1);

  // 5. Oversized (> 25MB) PDF returns 200 to user but skips R2 put
  const largeBuf = new Uint8Array(25 * 1024 * 1024 + 64);
  largeBuf.set(new TextEncoder().encode('%PDF-1.7\n'), 0);
  const largePdfUrl =
    'https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/0606_huge.pdf';
  const largeRes = await handleApiRequest(
    new Request(`https://igcse.rifkisnote.my.id/api/papacambridge/pdf?url=${encodeURIComponent(largePdfUrl)}`),
    (async () =>
      new Response(largeBuf, {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })) as typeof fetch,
    { PDF_BUCKET: mockR2Bucket },
    mockCtx,
    mockEdgeCache
  );
  assert.equal(largeRes?.status, 200);
  await Promise.all(pendingWaitUntil.splice(0));
  assert.equal(r2PutCalls, 1);

  // 6. Worker entrypoint works with optional PDF_BUCKET and routes non-API paths to ASSETS
  let assetsFetchCalled = false;
  const assetRes = await workerEntry.fetch(
    new Request('https://igcse.rifkisnote.my.id/0606'),
    {
      ASSETS: {
        async fetch() {
          assetsFetchCalled = true;
          return new Response('<html>SPA</html>', { status: 200 });
        },
      },
    },
    mockCtx
  );
  assert.equal(assetsFetchCalled, true);
  assert.equal(assetRes.status, 200);
});




