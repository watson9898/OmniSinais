import React, { useState, useMemo } from 'react';
import { CHAPTERS_DATA, ChapterMeta } from '../data/chaptersData';
import { StepByStepProblem, MultipleChoiceProblem, StudentProfile } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CheckCircle2,
  PenTool,
  Clock,
  Award,
  Filter,
  Sparkles,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { MathView } from './MathView';

interface QuestionSelectionViewProps {
  chapterNum: number;
  stepProblems: StepByStepProblem[];
  quizProblems: MultipleChoiceProblem[];
  profile: StudentProfile;
  activeMode: 'step_by_step' | 'multiple_choice';
  onChangeMode: (mode: 'step_by_step' | 'multiple_choice') => void;
  onSelectStepProblem: (problemId: string) => void;
  onSelectQuizProblem: (quizId: string) => void;
  onBackToChapters: () => void;
}

export const QuestionSelectionView: React.FC<QuestionSelectionViewProps> = ({
  chapterNum,
  stepProblems,
  quizProblems,
  profile,
  activeMode,
  onChangeMode,
  onSelectStepProblem,
  onSelectQuizProblem,
  onBackToChapters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Iniciante' | 'Intermediário' | 'Avançado'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const chapterMeta = CHAPTERS_DATA.find((c) => c.num === chapterNum) || CHAPTERS_DATA[0];

  // Filter problems for this chapter
  const currentChapterStepProblems = useMemo(() => {
    return stepProblems.filter((p) => p.chapter === chapterNum);
  }, [stepProblems, chapterNum]);

  const currentChapterQuizProblems = useMemo(() => {
    return quizProblems.filter((p) => p.chapter === chapterNum);
  }, [quizProblems, chapterNum]);

  // Apply search and filters
  const filteredStepProblems = useMemo(() => {
    return currentChapterStepProblems.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.statement.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;

      const isCompleted = profile.completedProblems.includes(p.id);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && isCompleted) ||
        (statusFilter === 'pending' && !isCompleted);

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [currentChapterStepProblems, searchQuery, difficultyFilter, statusFilter, profile.completedProblems]);

  const filteredQuizProblems = useMemo(() => {
    return currentChapterQuizProblems.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.statement.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;

      const isCompleted = profile.completedQuizIds.includes(p.id);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && isCompleted) ||
        (statusFilter === 'pending' && !isCompleted);

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [currentChapterQuizProblems, searchQuery, difficultyFilter, statusFilter, profile.completedQuizIds]);

  const stepCompletedCount = currentChapterStepProblems.filter((p) =>
    profile.completedProblems.includes(p.id)
  ).length;

  const quizCompletedCount = currentChapterQuizProblems.filter((p) =>
    profile.completedQuizIds.includes(p.id)
  ).length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Chapter Overview Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToChapters}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Voltar para a Escolha de Capítulos"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                2ª Etapa • Seleção da Questão
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {chapterMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {chapterMeta.subtitle}
            </p>
          </div>

          <button
            onClick={onBackToChapters}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors self-start sm:self-center flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trocar de Capítulo
          </button>
        </div>

        {/* Mode Selector Tabs (Passo a Passo vs Quizzes) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeMode('step_by_step')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'step_by_step'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>1. Resolução Passo a Passo</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {stepCompletedCount}/{currentChapterStepProblems.length}
              </span>
            </button>

            <button
              onClick={() => onChangeMode('multiple_choice')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeMode === 'multiple_choice'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Múltipla Escolha / Quizzes</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {quizCompletedCount}/{currentChapterQuizProblems.length}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {activeMode === 'step_by_step'
              ? `${filteredStepProblems.length} questões disponíveis`
              : `${filteredQuizProblems.length} questões disponíveis`}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por termo ou equação na questão..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff === 'all' ? 'Todas' : diff}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Status: Todos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Resolvidas
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Step By Step Problems List */}
      {activeMode === 'step_by_step' && (
        <div className="space-y-3">
          {filteredStepProblems.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Nenhum exercício encontrado com os filtros atuais
              </h3>
              <p className="text-xs text-slate-500">
                Tente redefinir a busca ou os filtros de dificuldade para ver as questões deste capítulo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredStepProblems.map((prob, idx) => {
                const isCompleted = profile.completedProblems.includes(prob.id);

                return (
                  <div
                    key={prob.id}
                    onClick={() => onSelectStepProblem(prob.id)}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md select-none hover:scale-[1.008] ${
                      isCompleted
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              prob.difficulty === 'Iniciante'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : prob.difficulty === 'Intermediário'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            +{prob.xpReward} XP
                          </span>
                          {isCompleted && (
                            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400" title="Resolvida">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {prob.title}
                      </h3>

                      <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        <MathView math={prob.statement.replace(/\$\$/g, '$')} />
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {prob.steps.length} etapas guiadas
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStepProblem(prob.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{isCompleted ? 'Revisar Resolução' : 'Resolver Passo a Passo'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Multiple Choice Quizzes List */}
      {activeMode === 'multiple_choice' && (
        <div className="space-y-3">
          {filteredQuizProblems.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Nenhum quiz encontrado com os filtros atuais
              </h3>
              <p className="text-xs text-slate-500">
                Tente redefinir a busca ou os filtros de dificuldade para ver as questões deste capítulo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredQuizProblems.map((quiz, idx) => {
                const isCompleted = profile.completedQuizIds.includes(quiz.id);

                return (
                  <div
                    key={quiz.id}
                    onClick={() => onSelectQuizProblem(quiz.id)}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md select-none hover:scale-[1.008] ${
                      isCompleted
                        ? 'border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              quiz.difficulty === 'Iniciante'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : quiz.difficulty === 'Intermediário'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {quiz.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                            +{quiz.xpReward} XP
                          </span>
                          {isCompleted && (
                            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400" title="Quiz Resolvido">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {quiz.title}
                      </h3>

                      <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        <MathView math={quiz.statement.replace(/\$\$/g, '$')} />
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {quiz.options.length} alternativas com rascunho
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuizProblem(quiz.id);
                        }}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{isCompleted ? 'Revisar Quiz' : 'Responder Quiz'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
