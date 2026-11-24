import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SUBTOPICS_0580 } from '../data/syllabus0580';
import { tokenizeMathText } from './mathTextParser';
import { getKeyFindingsForNote, highlightImportantText } from './noteKeyFindings';

test('tokenizeMathText parses <u>...</u> underline segments without corrupting LaTeX or bold spans', () => {
  const tokens = tokenizeMathText(
    'State **Rotation** + <u>angle</u> + <u>direction</u> + $90^\\circ$ CW.'
  );
  assert.ok(tokens.some((t) => t.type === 'bold' && t.content === 'Rotation'));
  assert.ok(tokens.some((t) => t.type === 'underline' && t.content === 'angle'));
  assert.ok(tokens.some((t) => t.type === 'underline' && t.content === 'direction'));
  assert.ok(tokens.some((t) => t.type === 'inline' && t.content === '90^\\circ'));
});

test('highlightImportantText underlines key exam terms outside LaTeX and avoids double-wrapping', () => {
  const input = 'ALWAYS check <u>mirror line</u> and perpendicular bisector, never $\\text{ALWAYS} + x^2$ inside math.';
  const highlighted = highlightImportantText(input);
  assert.match(highlighted, /<u>ALWAYS<\/u>/);
  assert.match(highlighted, /<u>mirror line<\/u>/);
  assert.match(highlighted, /<u>perpendicular bisector<\/u>/);
  assert.equal(highlighted.includes('<u><u>'), false);
  // Math expression stays untouched
  assert.ok(highlighted.includes('$\\text{ALWAYS} + x^2$'));
});

test('All 72 subtopics produce structured Key Findings and 7.1 Transformations covers Translation through Rotation', () => {
  assert.equal(ALL_SUBTOPICS_0580.length, 72);

  for (const topic of ALL_SUBTOPICS_0580) {
    const findings = getKeyFindingsForNote(topic);
    assert.ok(findings.length >= 1, `Expected >=1 key finding for ${topic.id}`);
    assert.ok(
      findings.some((f) => Boolean(f.noteBox)),
      `Expected at least one boxed Note callout for ${topic.id}`
    );
  }

  const t71 = ALL_SUBTOPICS_0580.find((t) => t.id === '7.1');
  assert.ok(t71);
  assert.ok(t71.aims && t71.aims.length === 2);
  assert.ok(t71.keyFindings && t71.keyFindings.length === 4);
  const joined = t71.keyFindings.map((k) => `${k.title} ${k.finding} ${k.noteBox || ''}`).join(' ');
  assert.match(joined, /Translation/i);
  assert.match(joined, /Reflection/i);
  assert.match(joined, /Enlargement/i);
  assert.match(joined, /Rotation/i);
  assert.match(joined, /perpendicular bisector/i);
  assert.match(joined, /<u>.*<\/u>/);
});

test('Geometry 4.2 Example 1 title and all 72 subtopic text fields tokenize math cleanly without raw $ LaTeX', () => {
  const t42 = ALL_SUBTOPICS_0580.find((t) => t.id === '4.2');
  assert.ok(t42);
  assert.ok(t42.workedExamples.length >= 1);
  const ex1Tokens = tokenizeMathText(t42.workedExamples[0].title);
  assert.ok(
    ex1Tokens.some((seg) => seg.type === 'inline' && seg.content.includes('\\text{ cm}')),
    'Expected Geometry 4.2 Example 1 title to parse measurements into inline math'
  );
  for (const seg of ex1Tokens) {
    if (seg.type !== 'inline' && seg.type !== 'display') {
      assert.equal(seg.content.includes('$'), false, `Unexpected raw $ in segment: ${seg.content}`);
    }
  }

  const assertCleanField = (loc: string, val?: string) => {
    if (!val || !val.includes('$')) return;
    const segs = tokenizeMathText(val);
    for (const seg of segs) {
      if (seg.type === 'underline' || seg.type === 'bold' || seg.type === 'italic') {
        assertCleanField(`${loc}[${seg.type}]`, seg.content);
      } else if (seg.type === 'code') {
        assert.equal(
          seg.content.includes('$'),
          false,
          `Backtick code span contains raw LaTeX $ at ${loc}: ${seg.content}`
        );
      } else if (seg.type === 'text') {
        const withoutCurrency = seg.content.replace(/\\\$/g, '').replace(/\$\d[\d,.]*/g, '');
        assert.equal(
          withoutCurrency.includes('$'),
          false,
          `Unpaired or unparsed $ in text segment at ${loc}: ${seg.content}`
        );
      }
    }
  };

  for (const note of ALL_SUBTOPICS_0580) {
    assertCleanField(`${note.id}.title`, note.title);
    assertCleanField(`${note.id}.summary`, note.summary);
    assertCleanField(`${note.id}.bigIdea`, note.bigIdea);
    assertCleanField(`${note.id}.coursebookTip`, note.coursebookTip);
    assertCleanField(`${note.id}.fastForward`, note.fastForward);
    note.aims?.forEach((a, i) => assertCleanField(`${note.id}.aim[${i}]`, a));
    note.keyFindings?.forEach((k, i) => {
      assertCleanField(`${note.id}.keyFinding[${i}].title`, k.title);
      assertCleanField(`${note.id}.keyFinding[${i}].finding`, k.finding);
      assertCleanField(`${note.id}.keyFinding[${i}].noteBox`, k.noteBox);
    });
    note.keyFormulas.forEach((f, i) => {
      assertCleanField(`${note.id}.keyFormula[${i}].label`, f.label);
      assertCleanField(`${note.id}.keyFormula[${i}].note`, f.note);
    });
    if (note.comparisonTable) {
      assertCleanField(`${note.id}.table.title`, note.comparisonTable.title);
      note.comparisonTable.headers.forEach((h, i) => assertCleanField(`${note.id}.table.h[${i}]`, h));
      note.comparisonTable.rows.forEach((row, ri) =>
        row.forEach((cell, ci) => assertCleanField(`${note.id}.table.r[${ri}][${ci}]`, cell))
      );
    }
    note.studyNotes.forEach((sec, i) => {
      assertCleanField(`${note.id}.studyNote[${i}].heading`, sec.heading);
      assertCleanField(`${note.id}.studyNote[${i}].body`, sec.body);
      sec.bullets?.forEach((b, bi) => assertCleanField(`${note.id}.studyNote[${i}].b[${bi}]`, b));
      assertCleanField(`${note.id}.studyNote[${i}].noteBox`, sec.noteBox);
    });
    note.workedExamples.forEach((ex, i) => {
      assertCleanField(`${note.id}.workedExample[${i}].title`, ex.title);
      assertCleanField(`${note.id}.workedExample[${i}].question`, ex.question);
      ex.steps.forEach((st, si) => assertCleanField(`${note.id}.workedExample[${i}].step[${si}]`, st));
      assertCleanField(`${note.id}.workedExample[${i}].answer`, ex.answer);
      assertCleanField(`${note.id}.workedExample[${i}].ms`, ex.markSchemeNotes);
    });
    note.rapidSummary?.forEach((r, i) => {
      assertCleanField(`${note.id}.rapid[${i}].rule`, r.rule);
      assertCleanField(`${note.id}.rapid[${i}].detail`, r.detail);
    });
    note.commonMistakes.forEach((m, i) => assertCleanField(`${note.id}.mistake[${i}]`, m));
  }
});

