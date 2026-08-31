import React from 'react';
import { CHAPTERS_DATA, ChapterMeta } from '../data/chaptersData';
import { StepByStepProblem, MultipleChoiceProblem, StudentProfile } from '../types';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Waves,
  Radio,
  Activity,
  Layers,
  Cpu,
  Sparkles,
  Award,
  PenTool,
} from 'lucide-react';
import { MathView } from './MathView';

interface ChapterSelectionViewProps {
  stepProblems: StepByStepProblem[];
  quizProblems: MultipleChoiceProblem[];
  profile: StudentProfile;
  onSelectChapter: (chapterNum: number) => void;
  onBackToHome: () => void;
}

export const ChapterSelectionView: React.FC<ChapterSelectionViewProps> = ({
  stepProblems,
  quizProblems,
  profile,
  onSelectChapter,
  onBackToHome,
}) => {
  const getChapterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Waves':
        return <Waves className="w-6 h-6" />;
      case 'Radio':
        return <Radio className="w-6 h-6" />;
      case 'Activity':
        return <Activity className="w-6 h-6" />;
      case 'Layers':
        return <Layers className="w-6 h-6" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const getChapterStats = (chapterNum: number) => {
    const chStep = stepProblems.filter((p) => p.chapter === chapterNum);
    const chQuiz = quizProblems.filter((p) => p.chapter === chapterNum);
    const resolvedStep = chStep.filter((p) => profile.completedProblems.includes(p.id)).length;
    const resolvedQuiz = chQuiz.filter((p) => profile.completedQuizIds.includes(p.id)).length;

    const totalInChapter = chStep.length + chQuiz.length;
    const totalResolvedInChapter = resolvedStep + resolvedQuiz;
    const percent = totalInChapter > 0 ? Math.round((totalResolvedInChapter / totalInChapter) * 100) : 0;

    return {
      stepCount: chStep.length,
      quizCount: chQuiz.length,
      totalCount: totalInChapter,
      resolvedCount: totalResolvedInChapter,
      percent,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Voltar para a Página Inicial"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              1ª Etapa • Escolha de Módulo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Escolha o Tema ou Capítulo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Selecione o capítulo que deseja praticar hoje para abrir a listagem detalhada de exercícios.
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors self-start sm:self-center flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </button>
      </div>

      {/* Chapters Detailed Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CHAPTERS_DATA.map((ch) => {
          const stats = getChapterStats(ch.num);

          return (
            <div
              key={ch.num}
              onClick={() => onSelectChapter(ch.num)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group select-none hover:scale-[1.008]"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${ch.gradient} text-white flex items-center justify-center shadow-md`}>
                      {getChapterIcon(ch.iconName)}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ch.badgeColor}`}>
                        Capítulo {ch.num}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                        {ch.title}
                      </h2>
                    </div>
                  </div>

                  {/* Completion Pill */}
                  {stats.resolvedCount > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {stats.resolvedCount} resolvidas ({stats.percent}%)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold shrink-0">
                      Não iniciado
                    </span>
                  )}
                </div>

                {/* Subtitle & Description */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {ch.subtitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Domínio do Capítulo</span>
                    <span>{stats.resolvedCount} de {stats.totalCount} questões</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${ch.gradient} transition-all duration-500`}
                      style={{ width: `${Math.max(stats.percent, 3)}%` }}
                    />
                  </div>
                </div>

                {/* Key topics list */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Conteúdo Programático:
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {ch.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Formula Spotlight */}
                {ch.keyFormulas.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      Fórmula Central:
                    </span>
                    <div className="text-xs text-slate-800 dark:text-slate-200 font-mono overflow-x-auto py-1">
                      <MathView math={ch.keyFormulas[0]} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <PenTool className="w-3.5 h-3.5 text-indigo-500" />
                    {stats.stepCount} Passo a Passo
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                    {stats.quizCount} Quizzes
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectChapter(ch.num);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 group-hover:scale-105 cursor-pointer"
                >
                  <span>Abrir Questões</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
