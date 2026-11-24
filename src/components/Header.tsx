import React from 'react';
import { Menu, X } from 'lucide-react';
import type { AppRoute } from '../types/syllabus';
import { preloadRouteView } from '../utils/routePreloaders';
import { triggerSakugaBurst } from '../utils/sakugaVfx';

interface HeaderProps {
  activeView: AppRoute['view'];
  onNavigate: (route: AppRoute) => void;
  onGoHome: () => void;
  onOpenFormulaSheet: () => void;
  onOpenGraphTool: () => void;
  onStartQuickMock: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onGoHome,
  onOpenFormulaSheet,
  onOpenGraphTool,
  onStartQuickMock,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b-[1.5px] border-[#DCDAF0]">
      <div className="max-w-[1440px] mx-auto pl-4 pr-14 sm:pl-6 sm:pr-14 h-16 flex items-center justify-between gap-3 lg:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="font-display text-lg font-extrabold tracking-tight text-[#1D1A4A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#6D69F2] rounded"
        >
          Rifki&apos;s Notes
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-3.5 lg:gap-6 text-xs lg:text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() => onNavigate({ view: 'notes', chapterId: 1, topicId: '1.1' })}
            className={`py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] transition-colors cursor-pointer ${
              activeView === 'notes'
                ? 'border-[#FF5FA8] text-[#1D1A4A]'
                : 'border-transparent text-[#5E588C] hover:text-[#1D1A4A]'
            }`}
          >
            Study Notes
          </button>
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('past-papers')}
            onFocus={() => preloadRouteView('past-papers')}
            onClick={() => onNavigate({ view: 'past-papers' })}
            className={`py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] transition-colors cursor-pointer ${
              activeView === 'past-papers'
                ? 'border-[#FF5FA8] text-[#1D1A4A]'
                : 'border-transparent text-[#5E588C] hover:text-[#1D1A4A]'
            }`}
          >
            Past Papers
          </button>
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('practice')}
            onFocus={() => preloadRouteView('practice')}
            onClick={() => onNavigate({ view: 'practice' })}
            className={`py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] transition-colors cursor-pointer ${
              activeView === 'practice'
                ? 'border-[#FF5FA8] text-[#1D1A4A]'
                : 'border-transparent text-[#5E588C] hover:text-[#1D1A4A]'
            }`}
          >
            Practice Test
          </button>
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('graph')}
            onFocus={() => preloadRouteView('graph')}
            onClick={onOpenGraphTool}
            className="py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] border-transparent text-[#5E588C] hover:text-[#1D1A4A] transition-colors cursor-pointer"
          >
            Graph Tool
          </button>
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('formula')}
            onFocus={() => preloadRouteView('formula')}
            onClick={onOpenFormulaSheet}
            className="py-1.5 whitespace-nowrap shrink-0 border-b-[2.5px] border-transparent text-[#5E588C] hover:text-[#1D1A4A] transition-colors cursor-pointer"
          >
            Formula Sheet
          </button>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onPointerEnter={() => preloadRouteView('practice')}
            onFocus={() => preloadRouteView('practice')}
            onClick={(e) => {
              triggerSakugaBurst(e, 'indigo', 'GO!');
              onStartQuickMock();
            }}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold sk-btn-primary whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D1A4A]"
          >
            Start Mock Exam
          </button>
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-xl border-[1.5px] border-[#DCDAF0] text-[#1D1A4A] hover:bg-[#F4F3FC] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t-[1.5px] border-[#DCDAF0] bg-white px-4 py-3 space-y-1">
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'notes', chapterId: 1, topicId: '1.1' });
              onToggleMobileMenu();
            }}
            className={`block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl cursor-pointer ${
              activeView === 'notes' ? 'bg-[#F4F3FC] text-[#1D1A4A]' : 'text-[#393469] hover:bg-[#F4F3FC]'
            }`}
          >
            Study Notes
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'past-papers' });
              onToggleMobileMenu();
            }}
            className={`block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl cursor-pointer ${
              activeView === 'past-papers' ? 'bg-[#F4F3FC] text-[#1D1A4A]' : 'text-[#393469] hover:bg-[#F4F3FC]'
            }`}
          >
            Past Papers
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'practice' });
              onToggleMobileMenu();
            }}
            className={`block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl cursor-pointer ${
              activeView === 'practice' ? 'bg-[#F4F3FC] text-[#1D1A4A]' : 'text-[#393469] hover:bg-[#F4F3FC]'
            }`}
          >
            Practice Test
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenGraphTool();
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl text-[#393469] hover:bg-[#F4F3FC] cursor-pointer"
          >
            Graph Tool
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenFormulaSheet();
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl text-[#393469] hover:bg-[#F4F3FC] cursor-pointer"
          >
            Formula Sheet
          </button>
          <button
            type="button"
            onClick={(e) => {
              triggerSakugaBurst(e, 'indigo', 'GO!');
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
