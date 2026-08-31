import React from 'react';
import { Home, BookOpen, ListFilter, PenTool, ChevronRight, Sliders, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { CHAPTERS_DATA } from '../data/chaptersData';

export type AppViewMode =
  | 'presentation'
  | 'chapter_selection'
  | 'question_selection'
  | 'problem_solving'
  | 'visualizer'
  | 'resolved_notebook'
  | 'leaderboard';

interface NavigationStepperProps {
  currentView: AppViewMode;
  selectedChapterNum?: number;
  selectedProblemTitle?: string;
  onNavigate: (view: AppViewMode, chapterNum?: number) => void;
  resolvedCount: number;
}

export const NavigationStepper: React.FC<NavigationStepperProps> = ({
  currentView,
  selectedChapterNum,
  selectedProblemTitle,
  onNavigate,
  resolvedCount,
}) => {
  const currentChapter = selectedChapterNum
    ? CHAPTERS_DATA.find((c) => c.num === selectedChapterNum)
    : null;

  const isCoreStep =
    currentView === 'presentation' ||
    currentView === 'chapter_selection' ||
    currentView === 'question_selection' ||
    currentView === 'problem_solving';

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors sticky top-[61px] z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Core Linear Stepper Flow */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none text-xs sm:text-sm">
          {/* Step 0: Home / Apresentação */}
          <button
            id="nav-step-presentation"
            onClick={() => onNavigate('presentation')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              currentView === 'presentation'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Página de Apresentação Inicial"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </button>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

          {/* Step 1: Escolha do Tema */}
          <button
            id="nav-step-chapter-selection"
            onClick={() => onNavigate('chapter_selection')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              currentView === 'chapter_selection'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                : selectedChapterNum
                ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Escolha o Tema ou Capítulo de Estudo"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1.</span>
            <span>{currentChapter ? `Capítulo ${currentChapter.num}` : '1. Escolher Tema'}</span>
          </button>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

          {/* Step 2: Seleção da Questão */}
          <button
            id="nav-step-question-selection"
            onClick={() => {
              if (selectedChapterNum) {
                onNavigate('question_selection', selectedChapterNum);
              } else {
                onNavigate('chapter_selection');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              currentView === 'question_selection'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Selecionar Questão do Tema Escolhido"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2.</span>
            <span>2. Escolher Questão</span>
          </button>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

          {/* Step 3: Resolução da Questão */}
          <button
            id="nav-step-problem-solving"
            onClick={() => {
              if (currentView !== 'problem_solving') {
                onNavigate('problem_solving', selectedChapterNum || 1);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              currentView === 'problem_solving'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Área de Resolução da Questão"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3.</span>
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {currentView === 'problem_solving' ? '3. Resolvendo Questão' : '3. Resolver'}
            </span>
          </button>
        </div>

        {/* Supplementary Tools Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 border-t md:border-t-0 border-slate-200/80 dark:border-slate-800/80">
          <button
            id="nav-tool-visualizer"
            onClick={() => onNavigate('visualizer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              currentView === 'visualizer'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Simulador Visual de Sinais & Polos"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden lg:inline">Simulador</span>
          </button>

          <button
            id="nav-tool-resolved-notebook"
            onClick={() => onNavigate('resolved_notebook')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              currentView === 'resolved_notebook'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Caderno de Exercícios Resolvidos & Rascunhos"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Caderno Salvo</span>
            {resolvedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                {resolvedCount}
              </span>
            )}
          </button>

          <button
            id="nav-tool-leaderboard"
            onClick={() => onNavigate('leaderboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              currentView === 'leaderboard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="Ranking Mundial Online"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Ranking</span>
          </button>
        </div>
      </div>
    </div>
  );
};
