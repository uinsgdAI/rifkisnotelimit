import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SUBTOPICS_0580, SYLLABUS_0580 } from '../data/syllabus0580';
import { TOPICAL_PAPERS_0580 } from '../data/topicalPapers0580';
import { parseAppRoute, buildAppRoutePath } from './examLogic';
import { getPdfUpstreamHeaders, isAllowedPdfProxyUrl } from './papacambridge';
import {
  countTopicalPapersByChapter,
  filterTopicalPapers,
  findTopicalPapersForTopic,
  getTopicalPdfBytesUrl,
} from './topicalPapers';
import { handleApiRequest } from './workerApi';

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
    assert.ok(isAllowedPdfProxyUrl(pack.answersUrl), `Answers URL rejected by proxy: ${pack.answersUrl}`);
    assert.match(pack.questionsFilename, /^Q-.*\.pdf$/i);
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

  const topic118Packs = findTopicalPapersForTopic('1.18');
  assert.equal(topic118Packs.length, 1);
  assert.equal(topic118Packs[0].questionsFilename, 'Q-Surds-Non-Calc.pdf');

  assert.equal(
    getTopicalPdfBytesUrl('https://pastpaperpenguin.com/wp-content/uploads/2026/09/Q-Surds-Non-Calc.pdf'),
    '/api/papacambridge/pdf?url=https%3A%2F%2Fpastpaperpenguin.com%2Fwp-content%2Fuploads%2F2026%2F09%2FQ-Surds-Non-Calc.pdf'
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
