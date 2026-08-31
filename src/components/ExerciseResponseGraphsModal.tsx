import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sliders,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  Compass,
  Boxes,
  Zap,
  Info,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { MathView } from './MathView';
import { SolutionGraphVisualizer } from './SolutionGraphVisualizer';
import { StepByStepProblem, MultipleChoiceProblem } from '../types';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { getQuestionGraphProfile } from '../utils/questionGraphProfiles';

interface ExerciseResponseGraphsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepProblems: StepByStepProblem[];
  quizProblems: MultipleChoiceProblem[];
  onSelectProblemToSolve?: (problemId: string, type: 'step' | 'quiz', chapterNum: number) => void;
}

export const ExerciseResponseGraphsModal: React.FC<ExerciseResponseGraphsModalProps> = ({
  isOpen,
  onClose,
  stepProblems,
  quizProblems,
  onSelectProblemToSolve,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'step' | 'quiz'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pre_calc' | 'post_calc'>('pre_calc');
  const [visualizerTab, setVisualizerTab] = useState<'2d' | '3d'>('2d');

  // Selected problem id
  const [selectedProblemId, setSelectedProblemId] = useState<string>(() => {
    return stepProblems[0]?.id || '';
  });

  // Combine and map all problems with metadata
  const allProblems = useMemo(() => {
    const steps = stepProblems.map((p) => ({
      id: p.id,
      type: 'step' as const,
      title: p.title,
      chapter: p.chapter,
      chapterName: p.chapterName,
      difficulty: p.difficulty,
      category: p.category,
      statement: p.statement,
      finalSolutionLatex: p.finalSolutionLatex,
      interpretationGuide: p.interpretationGuide,
      formulaGuide: p.formulaGuide,
      xpReward: p.xpReward,
    }));

    const quizzes = quizProblems.map((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect) || q.options[0];
      return {
        id: q.id,
        type: 'quiz' as const,
        title: q.title,
        chapter: q.chapter,
        chapterName: q.chapterName,
        difficulty: q.difficulty,
        category: q.category,
        statement: q.statement,
        finalSolutionLatex: correctOpt?.text || 'y(t) = \\text{Solução}',
        interpretationGuide: q.interpretationGuide || {
          objective: q.guidedHint || 'Análise da resposta em frequência ou dinâmica de polos e zeros.',
          givenData: [],
          strategy: [correctOpt?.explanation || q.stepByStepSolution || 'Aplicação das propriedades fundamentais da disciplina.'],
          pitfalls: 'Atenção aos sinais dos polos no plano s e à relação de fase das harmônicas.',
        },
        formulaGuide: q.formulaGuide,
        xpReward: q.xpReward,
      };
    });

    return [...steps, ...quizzes];
  }, [stepProblems, quizProblems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      if (selectedChapter !== 'all' && p.chapter !== selectedChapter) return false;
      if (selectedMode !== 'all' && p.type !== selectedMode) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesStatement = p.statement.toLowerCase().includes(q);
        const matchesSolution = p.finalSolutionLatex.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesStatement && !matchesSolution && !matchesId) return false;
      }
      return true;
    });
  }, [allProblems, selectedChapter, selectedMode, searchQuery]);

  // Currently active selected problem object
  const currentProblem = useMemo(() => {
    return (
      filteredProblems.find((p) => p.id === selectedProblemId) ||
      allProblems.find((p) => p.id === selectedProblemId) ||
      filteredProblems[0] ||
      allProblems[0]
    );
  }, [selectedProblemId, filteredProblems, allProblems]);

  // Question graph profile for current problem
  const questionProfile = useMemo(() => {
    if (!currentProblem) return null;
    return getQuestionGraphProfile({
      id: currentProblem.id,
      title: currentProblem.title,
      statement: currentProblem.statement,
      finalSolutionLatex: currentProblem.finalSolutionLatex,
      category: currentProblem.category as any,
    });
  }, [currentProblem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-7xl h-[94vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Gabarito Gráfico & Consulta Pré-Cálculo</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                    {allProblems.length} Exercícios Mapeados
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Consulte o comportamento gráfico esperado antes de resolver e confira o gabarito visual após seus cálculos manuais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode 2D / 3D Switch */}
            <div className="flex items-center p-1 bg-slate-800/80 border border-slate-700 rounded-xl">
              <button
                onClick={() => setVisualizerTab('2d')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  visualizerTab === '2d'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2D Gráficos
              </button>
              <button
                onClick={() => setVisualizerTab('3d')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  visualizerTab === '3d'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3D Superfície
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar Janela de Gráficos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Left Sidebar (Problem Catalog & Filters) + Right Panel (Visualizer & Checkers) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Panel: Filter & Exercise List */}
          <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/50 shrink-0 h-72 lg:h-auto overflow-hidden">
            {/* Search & Filter Controls */}
            <div className="p-3 space-y-2.5 border-b border-slate-800/80 bg-slate-900/60">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar questão, título ou fórmula..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Chapter Pill Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  onClick={() => setSelectedChapter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    selectedChapter === 'all'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  Todos Capítulos
                </button>
                {CHAPTERS_DATA.map((ch) => (
                  <button
                    key={ch.num}
                    onClick={() => setSelectedChapter(ch.num)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                      selectedChapter === ch.num
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Cap. {ch.num}
                  </button>
                ))}
              </div>

              {/* Mode Filter Pills */}
              <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-400">
                <span>Tipo:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedMode('all')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      selectedMode === 'all' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'
                    }`}
                  >
                    Todos ({allProblems.length})
                  </button>
                  <button
                    onClick={() => setSelectedMode('step')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      selectedMode === 'step' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'hover:bg-slate-800'
                    }`}
                  >
                    Passo a Passo ({stepProblems.length})
                  </button>
                  <button
                    onClick={() => setSelectedMode('quiz')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      selectedMode === 'quiz' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'hover:bg-slate-800'
                    }`}
                  >
                    Quizzes ({quizProblems.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Problem List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredProblems.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Nenhum exercício encontrado para os filtros aplicados.
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const isSelected = currentProblem?.id === prob.id;
                  return (
                    <div
                      key={prob.id}
                      onClick={() => setSelectedProblemId(prob.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500/70 shadow-md ring-1 ring-sky-500/30'
                          : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            prob.type === 'step'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {prob.type === 'step' ? 'Passo a Passo' : 'Quiz'} • Cap. {prob.chapter}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prob.difficulty}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold leading-snug line-clamp-2 ${
                          isSelected ? 'text-sky-200' : 'text-slate-200'
                        }`}
                      >
                        {prob.title}
                      </h4>

                      <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/50">
                        {prob.finalSolutionLatex}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Problem Hub & Integrated Visualizer */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/80 p-4 sm:p-5 space-y-4">
            {currentProblem ? (
              <>
                {/* Header of Active Selected Problem */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                          Capítulo {currentProblem.chapter} • {currentProblem.chapterName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {currentProblem.difficulty} • {currentProblem.type === 'step' ? 'Dedução Guiada' : 'Múltipla Escolha'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {currentProblem.title}
                      </h3>
                    </div>

                    {/* Button to Solve this Problem */}
                    {onSelectProblemToSolve && (
                      <button
                        onClick={() => {
                          onSelectProblemToSolve(currentProblem.id, currentProblem.type, currentProblem.chapter);
                          onClose();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Resolver Esta Questão</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Statement Box */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed overflow-x-auto">
                    <MathView math={currentProblem.statement} />
                  </div>
                </div>

                {/* Consultation Tab Navigator: Pré-Cálculo vs Conferência Gabarito */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setActiveTab('pre_calc')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'pre_calc'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-sky-400" />
                    <span>1. Consulta Pré-Cálculo (O que esperar do Gráfico)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('post_calc')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'post_calc'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2. Gabarito Analítico & Checklist Pós-Cálculo</span>
                  </button>
                </div>

                {/* Tab 1: Pre-Calculation Contextual Insights */}
                {activeTab === 'pre_calc' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-sky-950/20 border border-sky-800/40 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                        🎯 Resposta Transitória Esperada:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Observe a forma de onda do sinal $y(t)$: verifique se há oscilação senoidal (subamortecido), decaimento puro (superamortecido) ou chaveamento por degrau unitário.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                        📐 Localização dos Polos no Plano s:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {questionProfile?.poleZero?.poles?.[0] ? (
                          <>
                            Polos em $s = {questionProfile.poleZero.poles[0].sigma} \pm j{questionProfile.poleZero.poles[0].omega}$. 
                            {questionProfile.poleZero.poles[0].sigma < 0 ? ' Parte real negativa indica sistema Estável (SPE).' : ' Atenção à margem de estabilidade.'}
                          </>
                        ) : (
                          'Polos ditam a velocidade de decaimento e a frequência angular de ressonância natural.'
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                        💡 Intuição Espectral & 3D:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        Use as abas 2D/3D abaixo para rotacionar o relevo tridimensional da função de transferência e antecipar o resultado do seu desenvolvimento algébrico.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Post-Calculation Verification Checklist */}
                {activeTab === 'post_calc' && (
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Gabarito da Equação Resolvida:
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Compare seus cálculos passo a passo com a forma final abaixo
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-200 text-sm font-mono overflow-x-auto">
                      <MathView math={`$$${currentProblem.finalSolutionLatex}$$`} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Condição Inicial y(0):</span>
                        <strong className="text-white font-mono">Conforme Enunciado</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Tempo de Acomodação ts:</span>
                        <strong className="text-white font-mono">~4τ segundos</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Regime Permanente y(∞):</span>
                        <strong className="text-white font-mono">Teorema do Valor Final</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Estabilidade BIBO:</span>
                        <strong className="text-emerald-400 font-bold">✔ Sistema Estável</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Embedded Full Interactive 2D/3D Visualizer for Current Problem */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                  <SolutionGraphVisualizer
                    key={`${currentProblem.id}-${visualizerTab}`}
                    problemId={currentProblem.id}
                    problemTitle={currentProblem.title}
                    finalSolutionLatex={currentProblem.finalSolutionLatex}
                    statement={currentProblem.statement}
                    category={currentProblem.category as any}
                    initialMode={visualizerTab}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-center">
                Selecione uma questão no catálogo lateral para carregar seus gráficos e gabarito correspondente.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
