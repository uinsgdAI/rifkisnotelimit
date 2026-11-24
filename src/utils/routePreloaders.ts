export const loadFormulaSheetModal = () =>
  import('../components/FormulaSheetModal').then((m) => ({
    default: m.FormulaSheetModal,
  }));

export const loadGraphCalculatorModal = () =>
  import('../components/GraphCalculatorModal').then((m) => ({
    default: m.GraphCalculatorModal,
  }));

export const loadPastPapersView = () =>
  import('../components/PastPapersView').then((m) => ({
    default: m.PastPapersView,
  }));

export const loadPracticeExamView = () =>
  import('../components/PracticeExamView').then((m) => ({
    default: m.PracticeExamView,
  }));

let preloadedAll = false;

export function preloadAllAppViews(): Promise<void> {
  if (preloadedAll) return Promise.resolve();
  preloadedAll = true;
  return Promise.allSettled([
    loadPracticeExamView(),
    loadPastPapersView(),
    loadFormulaSheetModal(),
    loadGraphCalculatorModal(),
    import('./pdfJsCache').then((m) => m.warmSharedPdfWorker()),
  ]).then(() => undefined);
}

export function preloadRouteView(
  target: 'past-papers' | 'practice' | 'formula' | 'graph'
): void {
  if (target === 'past-papers') {
    void loadPastPapersView().catch(() => undefined);
  } else if (target === 'practice') {
    void loadPracticeExamView().catch(() => undefined);
  } else if (target === 'formula') {
    void loadFormulaSheetModal().catch(() => undefined);
  } else if (target === 'graph') {
    void loadGraphCalculatorModal().catch(() => undefined);
  }
}
