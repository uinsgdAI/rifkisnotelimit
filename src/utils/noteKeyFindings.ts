import type { KeyFindingItem, SubtopicNote } from '../types/syllabus';
import { tokenizeMathText } from './mathTextParser';

const KEY_PHRASE_PATTERNS: RegExp[] = [
  /\b(?:ALWAYS|NEVER|MUST|ONLY|NOT|EXACTLY)\b/g,
  /\b(?:perpendicular bisector|scale factor|centre of enlargement|centre of rotation|mirror line|column vector|clockwise|anticlockwise|included angle|opposite direction|same direction|equal distance|frequency density|cumulative frequency|upper bound|lower bound|prime factorisation|highest common factor|lowest common multiple|significant figures|decimal places|three-figure bearing|line of best fit|common point|opposite sides|alternate segment|cyclic quadrilateral|reciprocal|gradient|y-intercept|completing the square|discriminant|asymptotes?)\b/gi,
];

function underlinePlainSegment(plainText: string): string {
  // Collect non-overlapping matches across patterns
  const spans: { start: number; end: number }[] = [];

  for (const baseRegex of KEY_PHRASE_PATTERNS) {
    const regex = new RegExp(baseRegex.source, baseRegex.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(plainText)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const overlaps = spans.some((s) => !(end <= s.start || start >= s.end));
      if (!overlaps && end > start) {
        spans.push({ start, end });
      }
    }
  }

  if (spans.length === 0) return plainText;
  spans.sort((a, b) => a.start - b.start);

  let out = '';
  let cursor = 0;
  for (const span of spans) {
    out += plainText.slice(cursor, span.start);
    out += `<u>${plainText.slice(span.start, span.end)}</u>`;
    cursor = span.end;
  }
  out += plainText.slice(cursor);
  return out;
}

/**
 * Wraps high-signal exam keywords and critical rules in <u>...</u> without
 * touching LaTeX math ($...$ / $$...$$), code (`...`), or existing <u>...</u> tags.
 */
export function highlightImportantText(text: string): string {
  if (!text) return text;
  const segments = tokenizeMathText(text);

  return segments
    .map((seg) => {
      if (seg.type === 'inline') return `$${seg.content}$`;
      if (seg.type === 'display') return `$$${seg.content}$$`;
      if (seg.type === 'code') return `\`${seg.content}\``;
      if (seg.type === 'underline') return `<u>${seg.content}</u>`;
      if (seg.type === 'bold') return `**${highlightImportantText(seg.content)}**`;
      if (seg.type === 'italic') return `*${highlightImportantText(seg.content)}*`;
      return underlinePlainSegment(seg.content);
    })
    .join('');
}

/**
 * Produces structured "Key Findings" (Temuan Kunci) with underlined critical
 * rules and boxed "Note:" reminders for every 0580 syllabus topic.
 */
export function getKeyFindingsForNote(note: SubtopicNote): KeyFindingItem[] {
  if (note.keyFindings && note.keyFindings.length > 0) {
    return note.keyFindings;
  }

  const findings: KeyFindingItem[] = [];

  if (note.rapidSummary && note.rapidSummary.length > 0) {
    note.rapidSummary.slice(0, 3).forEach((item, idx) => {
      const titleText = item.rule.includes('<u>') ? item.rule : `<u>${item.rule}</u>`;
      const detailText = highlightImportantText(item.detail);
      const pitfall = idx === 0 ? note.commonMistakes[0] : undefined;
      findings.push({
        title: titleText,
        finding: detailText,
        ...(pitfall ? { noteBox: highlightImportantText(pitfall) } : {}),
      });
    });
  }

  if (findings.length < 2 && note.stepByStepMethod && note.stepByStepMethod.length > 0) {
    note.stepByStepMethod.slice(0, 3 - findings.length).forEach((step, idx) => {
      findings.push({
        title: `<u>Key Method ${findings.length + idx + 1}</u>`,
        finding: highlightImportantText(step),
      });
    });
  }

  if (findings.length === 0 && note.studyNotes.length > 0) {
    findings.push({
      title: `<u>${note.studyNotes[0].heading}</u>`,
      finding: highlightImportantText(note.studyNotes[0].body),
      ...(note.commonMistakes[0]
        ? { noteBox: highlightImportantText(note.commonMistakes[0]) }
        : {}),
    });
  }

  // Ensure at least one boxed Note reminder is visible if pitfalls or tips exist
  if (findings.length > 0 && !findings.some((f) => Boolean(f.noteBox))) {
    const fallbackBox = note.commonMistakes[0] || note.coursebookTip;
    if (fallbackBox) {
      findings[findings.length - 1] = {
        ...findings[findings.length - 1],
        noteBox: highlightImportantText(fallbackBox),
      };
    }
  }

  return findings;
}
