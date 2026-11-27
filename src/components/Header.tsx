import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ClipboardCheck, FileText, Menu, X } from 'lucide-react';
import type { AppRoute, SubjectCode } from '../types/syllabus';
import type { PracticeSectionMode } from '../utils/examLogic';
import { loadSubjectSyllabus, preloadRouteView } from '../utils/routePreloaders';
import { getActiveSubjectVfxVariant, triggerSakugaBurst } from '../utils/sakugaVfx';

interface HeaderProps {
  activeSubject: SubjectCode;
  activeView: AppRoute['view'];
  activePracticeSection?: PracticeSectionMode;
  onSwitchSubject: (subject: SubjectCode) => void;
  onNavigate: (route: AppRoute) => void;
  onGoHome: () => void;
  onOpenFormulaSheet: () => void;
  onOpenGraphTool: () => void;
  onStartQuickMock: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSubject,
  activeView,
  activePracticeSection,
  onSwitchSubject,
  onNavigate,
  onGoHome,
  onOpenFormulaSheet,
  onOpenGraphTool,
  onStartQuickMock,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [topicalMenuOpen, setTopicalMenuOpen] = useState(false);
  const topicalDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!topicalMenuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        topicalDropdownRef.current &&
        !topicalDropdownRef.current.contains(e.target as Node)
      ) {
        setTopicalMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTopicalMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [topicalMenuOpen]);

  const navigateTopical = (mode: PracticeSectionMode) => {
    setTopicalMenuOpen(false);
    onNavigate({ view: 'practice', subject: activeSubject, mode });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b-[1.5px] border-[var(--sk-line)]">
      <div className="max-w-[1440px] mx-auto pl-4 pr-14 sm:pl-6 sm:pr-14 h-16 flex items-center justify-between gap-2.5 lg:gap-6">
        {/* Zone 1: Single text element wordmark */}
        <a
          href={activeSubject === '0606' ? '/0606' : '/'}
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="font-display text-lg font-extrabold tracking-tight text-[var(--sk-ink)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--sk-pri)] rounded"
        >
          Rifki&apos;s Notes
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-3 lg:gap-5 text-xs lg:text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() =>
              onNavigate({ view: 'notes', subject: activeSubject, chapterId: 1, topicId: '1.1' })
            }
            className={`py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] transition-colors cursor-pointer ${
              activeView === 'notes'
                ? 'border-[var(--sk-pri)] text-[var(--sk-ink)]'
                : 'border-transparent text-[var(--sk-dim)] hover:text-[var(--sk-ink)]'
            }`}
          >
            Study Notes
          </button>
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('past-papers')}
            onFocus={() => preloadRouteView('past-papers')}
            onClick={() => onNavigate({ view: 'past-papers', subject: activeSubject })}
            className={`py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] transition-colors cursor-pointer ${
              activeView === 'past-papers'
                ? 'border-[var(--sk-pri)] text-[var(--sk-ink)]'
                : 'border-transparent text-[var(--sk-dim)] hover:text-[var(--sk-ink)]'
            }`}
          >
            Past Papers
          </button>

          {/* Topical hover/click dropdown: Practice Test & Topical Paper */}
          <div
            ref={topicalDropdownRef}
            className="relative"
            onMouseEnter={() => {
              preloadRouteView('practice');
              setTopicalMenuOpen(true);
            }}
            onMouseLeave={() => setTopicalMenuOpen(false)}
          >
            <button
              type="button"
              aria-expanded={topicalMenuOpen}
              aria-controls="topical-nav-dropdown"
              onPointerEnter={() => preloadRouteView('practice')}
              onFocus={() => preloadRouteView('practice')}
              onClick={() => {
                preloadRouteView('practice');
                setTopicalMenuOpen((open) => !open);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setTopicalMenuOpen(true);
                }
              }}
              className={`inline-flex items-center gap-1 py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] transition-colors cursor-pointer ${
                activeView === 'practice'
                  ? 'border-[var(--sk-pri)] text-[var(--sk-ink)]'
                  : 'border-transparent text-[var(--sk-dim)] hover:text-[var(--sk-ink)]'
              }`}
            >
              <span>Topical</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  topicalMenuOpen ? 'rotate-180 text-[var(--sk-pri)]' : ''
                }`}
              />
            </button>

            {topicalMenuOpen && (
              <div
                id="topical-nav-dropdown"
                data-testid="topical-nav-dropdown"
                className="absolute left-0 top-full pt-1.5 w-64 z-50"
              >
                <div className="bg-white border-2 border-[var(--sk-ink)] rounded-2xl shadow-[4px_5px_0_var(--sk-soft)] p-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => navigateTopical('practice-test')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                      activeView === 'practice' && activePracticeSection === 'practice-test'
                        ? 'bg-[var(--sk-chip)] text-[var(--sk-ink)] border border-[var(--sk-pri-bright)]'
                        : 'text-[var(--sk-ink)] hover:bg-[var(--sk-surface)] border border-transparent'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4 mt-0.5 text-[var(--sk-pri)] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Practice Test</div>
                      <div className="text-[11px] font-normal text-[var(--sk-dim)] mt-0.5">
                        {activeSubject === '0606'
                          ? 'Paper 1 Non-Calc & Paper 2 Calc drills'
                          : 'Timed mocks & chapter drills'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTopical('topical-paper')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                      activeView === 'practice' && activePracticeSection === 'topical-paper'
                        ? 'bg-[var(--sk-acc-soft)] text-[var(--sk-ink)] border border-[var(--sk-acc)]'
                        : 'text-[var(--sk-ink)] hover:bg-[var(--sk-surface)] border border-transparent'
                    }`}
                  >
                    <FileText className="w-4 h-4 mt-0.5 text-[var(--sk-acc)] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Topical Paper</div>
                      <div className="text-[11px] font-normal text-[var(--sk-dim)] mt-0.5">
                        {activeSubject === '0606'
                          ? '14 annotatable 0606 topical PDFs'
                          : '78 annotatable Q + MS PDFs'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onPointerEnter={() => preloadRouteView('graph')}
            onFocus={() => preloadRouteView('graph')}
            onClick={onOpenGraphTool}
            className="py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] border-transparent text-[var(--sk-dim)] hover:text-[var(--sk-ink)] transition-colors cursor-pointer"
          >
            Graph Tool
          </button>
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('formula')}
            onFocus={() => preloadRouteView('formula')}
            onClick={onOpenFormulaSheet}
            className="py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] border-transparent text-[var(--sk-dim)] hover:text-[var(--sk-ink)] transition-colors cursor-pointer"
          >
            Formula Sheet
          </button>
        </nav>

        {/* Zone 3: Subject switcher + 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <div
            role="group"
            aria-label="Select Cambridge IGCSE subject"
            data-testid="subject-switcher"
            className="inline-flex items-center gap-0.5 sk-tabs shrink-0"
          >
            {(['0580', '0606'] as const).map((code) => (
              <button
                key={code}
                type="button"
                data-testid={`subject-btn-${code}`}
                data-active={activeSubject === code}
                aria-pressed={activeSubject === code}
                onPointerEnter={() => void loadSubjectSyllabus(code).catch(() => undefined)}
                onFocus={() => void loadSubjectSyllabus(code).catch(() => undefined)}
                onClick={() => {
                  if (activeSubject !== code) {
                    onSwitchSubject(code);
                  }
                }}
                title={
                  code === '0580'
                    ? 'Cambridge IGCSE Mathematics (0580) · Blue Theme'
                    : 'Cambridge IGCSE Additional Mathematics (0606) · Red Theme'
                }
                className="px-2 sm:px-2.5 py-1 text-[11px] lg:text-xs font-mono font-bold cursor-pointer whitespace-nowrap shrink-0 sk-tab"
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onPointerEnter={() => preloadRouteView('practice')}
            onFocus={() => preloadRouteView('practice')}
            onClick={(e) => {
              triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'GO!');
              onStartQuickMock();
            }}
            className="hidden lg:inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold sk-btn-primary whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sk-ink)]"
          >
            Start Mock Exam
          </button>
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-xl border-[1.5px] border-[var(--sk-line)] text-[var(--sk-ink)] hover:bg-[var(--sk-chip)] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t-[1.5px] border-[var(--sk-line)] bg-white px-4 py-3 space-y-1">
          <div className="pb-2 mb-1 border-b border-[var(--sk-line)]">
            <div className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--sk-dim)]">
              Syllabus Subject
            </div>
            <div className="grid grid-cols-2 gap-1.5 sk-tabs">
              <button
                type="button"
                data-active={activeSubject === '0580'}
                onClick={() => {
                  if (activeSubject !== '0580') onSwitchSubject('0580');
                  onToggleMobileMenu();
                }}
                className="px-2.5 py-1.5 text-xs font-bold sk-tab cursor-pointer whitespace-nowrap"
              >
                0580 Maths
              </button>
              <button
                type="button"
                data-active={activeSubject === '0606'}
                onClick={() => {
                  if (activeSubject !== '0606') onSwitchSubject('0606');
                  onToggleMobileMenu();
                }}
                className="px-2.5 py-1.5 text-xs font-bold sk-tab cursor-pointer whitespace-nowrap"
              >
                0606 Add Maths
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'notes', subject: activeSubject, chapterId: 1, topicId: '1.1' });
              onToggleMobileMenu();
            }}
            className={`block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl cursor-pointer ${
              activeView === 'notes'
                ? 'bg-[var(--sk-chip)] text-[var(--sk-ink)]'
                : 'text-[var(--sk-body)] hover:bg-[var(--sk-chip)]'
            }`}
          >
            Study Notes
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'past-papers', subject: activeSubject });
              onToggleMobileMenu();
            }}
            className={`block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl cursor-pointer ${
              activeView === 'past-papers'
                ? 'bg-[var(--sk-chip)] text-[var(--sk-ink)]'
                : 'text-[var(--sk-body)] hover:bg-[var(--sk-chip)]'
            }`}
          >
            Past Papers
          </button>

          <div className="pt-1 pb-0.5">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--sk-dim)]">
              Topical
            </div>
            <div className="pl-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onNavigate({ view: 'practice', subject: activeSubject, mode: 'practice-test' });
                  onToggleMobileMenu();
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-semibold rounded-xl cursor-pointer ${
                  activeView === 'practice' && activePracticeSection === 'practice-test'
                    ? 'bg-[var(--sk-chip)] text-[var(--sk-ink)]'
                    : 'text-[var(--sk-body)] hover:bg-[var(--sk-chip)]'
                }`}
              >
                Practice Test
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate({ view: 'practice', subject: activeSubject, mode: 'topical-paper' });
                  onToggleMobileMenu();
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-semibold rounded-xl cursor-pointer ${
                  activeView === 'practice' && activePracticeSection === 'topical-paper'
                    ? 'bg-[var(--sk-acc-soft)] text-[var(--sk-ink)]'
                    : 'text-[var(--sk-body)] hover:bg-[var(--sk-chip)]'
                }`}
              >
                Topical Paper
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenGraphTool();
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl text-[var(--sk-body)] hover:bg-[var(--sk-chip)] cursor-pointer"
          >
            Graph Tool
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenFormulaSheet();
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl text-[var(--sk-body)] hover:bg-[var(--sk-chip)] cursor-pointer"
          >
            Formula Sheet
          </button>
          <button
            type="button"
            onClick={(e) => {
              triggerSakugaBurst(e, getActiveSubjectVfxVariant('primary'), 'GO!');
              onStartQuickMock();
              onToggleMobileMenu();
            }}
            className="block w-full text-center mt-2 px-4 py-2.5 text-xs font-bold sk-btn-primary cursor-pointer"
          >
            Start Mock Exam
          </button>
        </div>
      )}
    </header>
  );
};
