export interface MathTextSegment {
  type: 'text' | 'inline' | 'display' | 'code' | 'bold' | 'italic' | 'underline';
  content: string;
}

function hasBalancedDollars(text: string): boolean {
  let count = 0;
  for (let idx = 0; idx < text.length; idx++) {
    if (text[idx] === '$' && (idx === 0 || text[idx - 1] !== '\\')) {
      count += 1;
    }
  }
  return count % 2 === 0;
}

export function tokenizeMathText(input: string): MathTextSegment[] {
  const segments: MathTextSegment[] = [];
  let i = 0;
  let textBuf = '';

  const flushText = () => {
    if (textBuf.length > 0) {
      segments.push({ type: 'text', content: textBuf });
      textBuf = '';
    }
  };

  while (i < input.length) {
    // Check inline code `...`
    if (input[i] === '`') {
      const end = input.indexOf('`', i + 1);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'code', content: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Check underline <u>...</u>
    if (input.startsWith('<u>', i)) {
      const end = input.indexOf('</u>', i + 3);
      if (end !== -1) {
        const inner = input.slice(i + 3, end);
        if (inner.length > 0 && hasBalancedDollars(inner)) {
          flushText();
          segments.push({ type: 'underline', content: inner });
          i = end + 4;
          continue;
        }
      }
    }

    // Check bold **...**
    if (input[i] === '*' && input[i + 1] === '*') {
      const end = input.indexOf('**', i + 2);
      if (end !== -1) {
        const inner = input.slice(i + 2, end);
        if (
          inner.length > 0 &&
          !inner.startsWith(' ') &&
          !inner.endsWith(' ') &&
          hasBalancedDollars(inner)
        ) {
          flushText();
          segments.push({ type: 'bold', content: inner });
          i = end + 2;
          continue;
        }
      }
    }

    // Check italic *...*
    if (input[i] === '*' && input[i + 1] !== '*') {
      const end = input.indexOf('*', i + 1);
      if (end !== -1 && input[end + 1] !== '*') {
        const inner = input.slice(i + 1, end);
        if (
          inner.length > 0 &&
          !inner.startsWith(' ') &&
          !inner.endsWith(' ') &&
          hasBalancedDollars(inner)
        ) {
          flushText();
          segments.push({ type: 'italic', content: inner });
          i = end + 1;
          continue;
        }
      }
    }

    // Check display math $$...$$
    if (input[i] === '$' && input[i + 1] === '$') {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'display', content: input.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }

    // Check inline math $...$
    if (input[i] === '$' && (i === 0 || input[i - 1] !== '\\')) {
      let end = -1;
      for (let j = i + 1; j < input.length; j++) {
        if (input[j] === '$' && input[j - 1] !== '\\') {
          end = j;
          break;
        }
      }
      if (end !== -1) {
        const inner = input.slice(i + 1, end);
        if (inner.length > 0 && !inner.startsWith(' ')) {
          flushText();
          segments.push({ type: 'inline', content: inner });
          i = end + 1;
          continue;
        }
      }
    }

    textBuf += input[i];
    i++;
  }

  flushText();
  return segments;
}
