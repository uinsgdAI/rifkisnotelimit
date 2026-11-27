import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GeoGebraGraphTool } from './GeoGebraGraphTool';

interface GraphCalculatorModalProps {
  open: boolean;
  initialTopicId?: string;
  onClose: () => void;
}

export const GraphCalculatorModal: React.FC<GraphCalculatorModalProps> = ({
  open,
  initialTopicId,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="graph-calculator-title"
    >
      <div className="bg-white border-2 border-[var(--sk-ink)] rounded-[20px] max-w-6xl w-full max-h-[92vh] flex flex-col shadow-[6px_7px_0_var(--sk-soft)]">
        <div className="px-5 py-3.5 border-b-[1.5px] border-[var(--sk-line)] flex items-center justify-between gap-4">
          <div>
            <h2 id="graph-calculator-title" className="font-display text-base sm:text-lg font-bold text-[var(--sk-ink)]">
              GeoGebra-Style Graphing &amp; Geometry Tool
            </h2>
            <p className="text-xs text-[var(--sk-dim)] mt-0.5">
              Plot functions, inequalities, gradients, tangents, vectors, segments, and circles
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close graphing tool"
            className="p-2 rounded-xl text-[var(--sk-dim)] hover:text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] border border-transparent hover:border-[var(--sk-line)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto">
          <GeoGebraGraphTool
            topicId={initialTopicId}
            allowPresetSwitch={true}
            heightClassName="h-[300px] sm:h-[360px] lg:h-[450px]"
          />
        </div>
      </div>
    </div>
  );
};
