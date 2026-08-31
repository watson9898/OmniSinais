import React from 'react';
import { AppViewMode } from './NavigationStepper';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { StepByStepProblem, MultipleChoiceProblem } from '../types';
import {
  ChevronRight,
  Layers,
  BookOpen,
  ListFilter,
  PenTool,
  Home,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface StackedDeckContainerProps {
  currentView: AppViewMode;
  selectedChapterNum: number;
  selectedStepProblemId?: string;
  selectedQuizProblemId?: string;
  activeMode: 'step_by_step' | 'multiple_choice';
  stepProblems: StepByStepProblem[];
  quizProblems: MultipleChoiceProblem[];
  onNavigate: (view: AppViewMode, chapterNum?: number) => void;
  children: React.ReactNode;
}

export const StackedDeckContainer: React.FC<StackedDeckContainerProps> = ({
  currentView,
  selectedChapterNum,
  selectedStepProblemId,
  selectedQuizProblemId,
  activeMode,
  stepProblems,
  quizProblems,
  onNavigate,
  children,
}) => {
  const currentChapter = CHAPTERS_DATA.find((c) => c.num === selectedChapterNum) || CHAPTERS_DATA[0];

  const currentStep = stepProblems.find((p) => p.id === selectedStepProblemId);
  const currentQuiz = quizProblems.find((p) => p.id === selectedQuizProblemId);
  const currentProblemTitle = activeMode === 'step_by_step' ? currentStep?.title : currentQuiz?.title;

  const isCoreLinearView =
    currentView === 'chapter_selection' ||
    currentView === 'question_selection' ||
    currentView === 'problem_solving';

  if (!isCoreLinearView) {
    return <>{children}</>;
  }

  // Determine current layer number
  let layerNumber = 1;
  if (currentView === 'question_selection') layerNumber = 2;
  if (currentView === 'problem_solving') layerNumber = 3;

  return (
    <div className="relative w-full space-y-3">
      {/* Visual Stacked Backdrop Deck (Cards Sobrepostos no Topo) */}
      <div className="relative pt-2">
        {/* Layer 0 Backdrop (Início) - Shown when in layer 1, 2 or 3 */}
        <div
          onClick={() => onNavigate('presentation')}
          className="mx-auto w-[96%] sm:w-[98%] bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 rounded-t-2xl px-4 py-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs group"
          title="Clique para voltar à Camada Base (Página Inicial)"
        >
          <div className="flex items-center gap-2 font-semibold">
            <Home className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Camada Base • Apresentação OmniSinais
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            Voltar ao Início
          </span>
        </div>

        {/* Layer 1 Stack (Capítulo) - Shown when in layer 2 or 3 */}
        {(layerNumber === 2 || layerNumber === 3) && (
          <div
            onClick={() => onNavigate('chapter_selection')}
            className="-mt-1 mx-auto w-[98%] sm:w-[99%] bg-indigo-100/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-t-2xl px-4 py-2 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 cursor-pointer hover:bg-indigo-200/80 dark:hover:bg-indigo-900/60 transition-colors shadow-xs group"
            title="Clique para trocar de Tema / Capítulo"
          >
            <div className="flex items-center gap-2 font-bold truncate">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
                Camada 1 • Tema:
              </span>
              <span className="truncate text-slate-900 dark:text-white font-black">
                Capítulo {currentChapter.num}: {currentChapter.title}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
              Trocar Tema
            </span>
          </div>
        )}

        {/* Layer 2 Stack (Questão) - Shown when in layer 3 */}
        {layerNumber === 3 && (
          <div
            onClick={() => onNavigate('question_selection', selectedChapterNum)}
            className="-mt-1 mx-auto w-[99%] sm:w-[99.5%] bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-t-2xl px-4 py-2 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-200/80 dark:hover:bg-emerald-900/60 transition-colors shadow-xs group"
            title="Clique para trocar a questão selecionada"
          >
            <div className="flex items-center gap-2 font-bold truncate">
              <ListFilter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">
                Camada 2 • Questão:
              </span>
              <span className="truncate text-slate-900 dark:text-white font-black">
                {currentProblemTitle || 'Questão Selecionada'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              Trocar Questão
            </span>
          </div>
        )}

        {/* Main Active Overlay Deck Card (A Camada Ativa Sobreposta) */}
        <div className={`relative -mt-1 z-10 rounded-3xl bg-slate-50 dark:bg-slate-950 border transition-all duration-300 shadow-xl ${
          layerNumber === 1
            ? 'border-indigo-300 dark:border-indigo-700/60 shadow-indigo-500/5'
            : layerNumber === 2
            ? 'border-indigo-400 dark:border-indigo-600/80 shadow-indigo-500/10'
            : 'border-emerald-400 dark:border-emerald-600/80 shadow-emerald-500/10'
        }`}>
          {/* Layer Indicator Banner */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-3xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-mono font-black shadow-xs">
                {layerNumber}
              </div>
              <div>
                <span className="text-slate-900 dark:text-white font-black text-sm">
                  {layerNumber === 1 && 'Etapa 1 de 3: Selecione o Tema'}
                  {layerNumber === 2 && `Etapa 2 de 3: Selecione a Questão (Cap. ${currentChapter.num})`}
                  {layerNumber === 3 && `Etapa 3 de 3: Resolução Ativa da Questão`}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {layerNumber === 1 && 'Clique em um capítulo para avançar para a lista de questões.'}
                  {layerNumber === 2 && 'Clique na questão desejada para abrir a mesa de resolução.'}
                  {layerNumber === 3 && 'Resolva passo a passo com auxílio de fórmulas e lousa digital.'}
                </p>
              </div>
            </div>

            {/* Step navigation dots / badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${layerNumber >= 1 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span className={`w-2.5 h-2.5 rounded-full ${layerNumber >= 2 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span className={`w-2.5 h-2.5 rounded-full ${layerNumber >= 3 ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 ml-1">
                {layerNumber}/3
              </span>
            </div>
          </div>

          {/* Layer Content */}
          <div className="p-3 sm:p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
