import React, { useState } from 'react';
import { StepByStepProblem, MultipleChoiceProblem, StudentProfile, ResolvedRecord } from '../types';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { StepByStepSolver } from './StepByStepSolver';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PenTool,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ProblemSolvingViewProps {
  chapterNum: number;
  activeMode: 'step_by_step' | 'multiple_choice';
  currentStepProblem: StepByStepProblem;
  currentQuizProblem?: MultipleChoiceProblem;
  allChapterStepProblems: StepByStepProblem[];
  allChapterQuizProblems: MultipleChoiceProblem[];
  profile: StudentProfile;
  onSelectStepProblem: (id: string) => void;
  onSelectQuizProblem: (id: string) => void;
  onChangeMode: (mode: 'step_by_step' | 'multiple_choice') => void;
  onProblemCompleted: (problemId: string, earnedXp: number, scratchpadNote?: string) => void;
  onQuizCompleted: (quizId: string, earnedXp: number, scratchpadNote?: string) => void;
  onSaveScratchpad: (problemId: string, note: string) => void;
  onOpenScratchpadModal: () => void;
  onBackToQuestions: () => void;
  onBackToChapters: () => void;
}

export const ProblemSolvingView: React.FC<ProblemSolvingViewProps> = ({
  chapterNum,
  activeMode,
  currentStepProblem,
  currentQuizProblem,
  allChapterStepProblems,
  allChapterQuizProblems,
  profile,
  onSelectStepProblem,
  onSelectQuizProblem,
  onChangeMode,
  onProblemCompleted,
  onQuizCompleted,
  onSaveScratchpad,
  onOpenScratchpadModal,
  onBackToQuestions,
  onBackToChapters,
}) => {
  const chapterMeta = CHAPTERS_DATA.find((c) => c.num === chapterNum) || CHAPTERS_DATA[0];

  // Indices for navigation
  const stepIndex = allChapterStepProblems.findIndex((p) => p.id === currentStepProblem.id);
  const quizIndex = currentQuizProblem
    ? allChapterQuizProblems.findIndex((p) => p.id === currentQuizProblem.id)
    : 0;

  const hasPrevStep = stepIndex > 0;
  const hasNextStep = stepIndex < allChapterStepProblems.length - 1;

  const hasPrevQuiz = quizIndex > 0;
  const hasNextQuiz = quizIndex < allChapterQuizProblems.length - 1;

  const handlePrev = () => {
    if (activeMode === 'step_by_step') {
      if (hasPrevStep) {
        onSelectStepProblem(allChapterStepProblems[stepIndex - 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (hasPrevQuiz) {
        onSelectQuizProblem(allChapterQuizProblems[quizIndex - 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNext = () => {
    if (activeMode === 'step_by_step') {
      if (hasNextStep) {
        onSelectStepProblem(allChapterStepProblems[stepIndex + 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (hasNextQuiz) {
        onSelectQuizProblem(allChapterQuizProblems[quizIndex + 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isStepCompleted = profile.completedProblems.includes(currentStepProblem.id);
  const isQuizCompleted = currentQuizProblem
    ? profile.completedQuizIds.includes(currentQuizProblem.id)
    : false;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Breadcrumb & Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Navigation Path */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <button
                onClick={onBackToChapters}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                1. Capítulos
              </button>
              <span>/</span>
              <button
                onClick={onBackToQuestions}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                2. {chapterMeta.shortTitle}
              </button>
              <span>/</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">
                3. {activeMode === 'step_by_step' ? currentStepProblem.title : currentQuizProblem?.title}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Capítulo {chapterNum}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeMode === 'step_by_step'
                  ? `Questão ${stepIndex + 1} de ${allChapterStepProblems.length}`
                  : `Questão ${quizIndex + 1} de ${allChapterQuizProblems.length}`}
              </span>
            </div>
          </div>

          {/* Quick Actions & Prev/Next buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => onChangeMode('step_by_step')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMode === 'step_by_step'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Passo a Passo</span>
              </button>

              <button
                onClick={() => onChangeMode('multiple_choice')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMode === 'multiple_choice'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quizzes</span>
              </button>
            </div>

            {/* Back to list */}
            <button
              onClick={onBackToQuestions}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Voltar para a Lista de Questões"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={activeMode === 'step_by_step' ? !hasPrevStep : !hasPrevQuiz}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="Questão Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={activeMode === 'step_by_step' ? !hasNextStep : !hasNextQuiz}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="Próxima Questão"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Resolution Area */}
      {activeMode === 'step_by_step' && (
        <div id="step-by-step-active-workspace" className="space-y-6">
          <StepByStepSolver
            key={currentStepProblem.id}
            problem={currentStepProblem}
            onProblemCompleted={onProblemCompleted}
            onOpenScratchpad={onOpenScratchpadModal}
            savedScratchpad={profile.resolvedRecords?.[currentStepProblem.id]?.scratchpadNote}
            onSaveScratchpad={onSaveScratchpad}
          />
        </div>
      )}

      {activeMode === 'multiple_choice' && (
        <div id="quiz-active-workspace" className="space-y-6">
          <MultipleChoiceQuiz
            problems={allChapterQuizProblems.length > 0 ? allChapterQuizProblems : [currentStepProblem as any]}
            completedQuizIds={profile.completedQuizIds}
            onQuizCompleted={onQuizCompleted}
            savedScratchpads={
              Object.fromEntries(
                Object.entries(profile.resolvedRecords || {}).map(([k, v]) => [
                  k,
                  (v as ResolvedRecord)?.scratchpadNote || '',
                ])
              )
            }
            onSaveScratchpad={onSaveScratchpad}
            initialProblemId={currentQuizProblem?.id || allChapterQuizProblems[0]?.id}
          />
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToQuestions}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Índice de Questões
          </button>
        </div>

        <div className="flex items-center gap-2">
          {((activeMode === 'step_by_step' && hasNextStep) || (activeMode === 'multiple_choice' && hasNextQuiz)) && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Próxima Questão do Capítulo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
