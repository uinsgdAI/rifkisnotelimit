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
