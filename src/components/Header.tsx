import React from 'react';
import { Menu, X } from 'lucide-react';
import type { AppRoute } from '../types/syllabus';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto pl-4 pr-14 sm:pl-6 sm:pr-14 h-16 flex items-center justify-between gap-3 lg:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
        >
          Rifki&apos;s Notes
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-3.5 lg:gap-6 text-xs lg:text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => onNavigate({ view: 'notes', chapterId: 1, topicId: '1.1' })}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              activeView === 'notes'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Notes
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'past-papers' })}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              activeView === 'past-papers'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Papers
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'practice' })}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              activeView === 'practice'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Practice Test
          </button>
          <button
            type="button"
            onClick={onOpenGraphTool}
            className="py-1 whitespace-nowrap shrink-0 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Graph Tool
          </button>
          <button
            type="button"
            onClick={onOpenFormulaSheet}
            className="py-1 whitespace-nowrap shrink-0 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Formula Sheet
          </button>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartQuickMock}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Start Mock Exam
          </button>
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'notes', chapterId: 1, topicId: '1.1' });
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Study Notes
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'past-papers' });
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Past Papers
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate({ view: 'practice' });
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Practice Test
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenGraphTool();
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Graph Tool
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenFormulaSheet();
              onToggleMobileMenu();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg text-slate-800 hover:bg-slate-100"
          >
            Formula Sheet
          </button>
        </div>
      )}
    </header>
  );
};
