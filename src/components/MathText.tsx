import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { tokenizeMathText } from '../utils/mathTextParser';

interface MathInlineProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const KaTeXFormula: React.FC<MathInlineProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(latex, containerRef.current, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      if (containerRef.current) {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, displayMode]);

  return <span ref={containerRef} className={className} />;
};

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const segments = tokenizeMathText(text);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'display') {
          return (
            <KaTeXFormula
              key={idx}
              latex={seg.content}
              displayMode={true}
              className="block my-2"
            />
          );
        }
        if (seg.type === 'inline') {
          return <KaTeXFormula key={idx} latex={seg.content} displayMode={false} />;
        }
        if (seg.type === 'underline') {
          return (
            <span
              key={idx}
              className="underline decoration-[#FF5FA8] decoration-2 underline-offset-[3px] font-semibold text-[#1D1A4A] bg-[#FFF5FA]/80 px-0.5 rounded-sm"
            >
              <MathText text={seg.content} />
            </span>
          );
        }
        if (seg.type === 'bold') {
          return (
            <strong key={idx} className="font-semibold text-[#1D1A4A]">
              <MathText text={seg.content} />
            </strong>
          );
        }
        if (seg.type === 'italic') {
          return (
            <em key={idx} className="italic">
              <MathText text={seg.content} />
            </em>
          );
        }
        if (seg.type === 'code') {
          return (
            <span
              key={idx}
              className="font-mono text-[0.9em] font-semibold text-[#1D1A4A] bg-[#F4F3FC] border border-[#DCDAF0] px-1.5 py-0.5 rounded-md"
            >
              {seg.content}
            </span>
          );
        }
        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};
