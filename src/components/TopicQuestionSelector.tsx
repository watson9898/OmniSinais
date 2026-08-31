import React from 'react';
import { SubjectCategory } from '../types';
import {
  Layers,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Zap,
  Activity,
  Waves,
  Cpu,
  Radio,
  MousePointerClick
} from 'lucide-react';
import { smoothScrollToElement } from '../utils/doubleTap';

export interface SelectorProblemItem {
  id: string;
  title: string;
  chapter: number;
  chapterName: string;
  category: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  xpReward: number;
  stepsCount?: number;
}

interface TopicQuestionSelectorProps {
  problems: SelectorProblemItem[];
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
  completedIds: string[];
  selectedCategory: SubjectCategory;
  onSelectCategory: (category: SubjectCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDifficulty: 'all' | 'Iniciante' | 'Intermediário' | 'Avançado';
  onSelectDifficulty: (d: 'all' | 'Iniciante' | 'Intermediário' | 'Avançado') => void;
}

export const TOPIC_CATEGORIES: {
  id: SubjectCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: 'all',
    label: 'Todos os Assuntos',
    icon: <Layers className="w-4 h-4" />,
    color: 'from-indigo-600 to-sky-600',
  },
  {
    id: 'signals',
    label: 'Cap. 1: Sinais & Sistemas',
    icon: <Activity className="w-4 h-4" />,
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'fourier',
    label: 'Cap. 2: Análise de Fourier',
    icon: <Waves className="w-4 h-4" />,
    color: 'from-sky-600 to-blue-600',
  },
  {
    id: 'laplace',
    label: 'Cap. 3: Laplace & Polos/Zeros',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 'differential_equations',
    label: 'Cap. 4: EDOs & Resposta Temporal',
    icon: <Cpu className="w-4 h-4" />,
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'electrical_engineering',
    label: 'Cap. 5: Engenharia Elétrica & Circuitos',
    icon: <Radio className="w-4 h-4" />,
    color: 'from-cyan-600 to-blue-600',
  },
];

export const TopicQuestionSelector: React.FC<TopicQuestionSelectorProps> = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  completedIds,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  // Filter problems
  const filteredProblems = problems.filter((problem) => {
    // Category match
    const categoryMatch =
      selectedCategory === 'all'
        ? true
        : problem.category === selectedCategory;

    // Difficulty match
    const difficultyMatch =
      selectedDifficulty === 'all' ? true : problem.difficulty === selectedDifficulty;

    // Search query match
    const searchMatch =
      !searchQuery.trim() ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.chapterName.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && difficultyMatch && searchMatch;
  });

  const currentIndex = filteredProblems.findIndex((p) => p.id === selectedProblemId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectProblem(filteredProblems[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredProblems.length - 1) {
      onSelectProblem(filteredProblems[currentIndex + 1].id);
    }
  };

  // Double click / double tap handlers
  const handleOpenAndScrollToProblem = (problemId: string) => {
    onSelectProblem(problemId);
    smoothScrollToElement('problem-solver-workspace', 70);
  };

  const handleDoubleClickCategory = (catId: SubjectCategory) => {
    onSelectCategory(catId);
    const matchingFirst = catId === 'all' ? problems[0] : problems.find((p) => p.category === catId);
    if (matchingFirst) {
      onSelectProblem(matchingFirst.id);
      smoothScrollToElement('problem-solver-workspace', 70);
    }
  };

  return (
    <div className="space-y-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl transition-colors">
      {/* 1. Category Hub (Horizontal Pills) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            1. Escolha o Assunto / Matéria:
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline-flex items-center gap-1">
              <MousePointerClick className="w-3 h-3 text-indigo-500" /> Clique duplo abre direto
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              {completedIds.length} / {problems.length} Resolvidos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TOPIC_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? problems.length
                : problems.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                onDoubleClick={() => handleDoubleClickCategory(cat.id)}
                title="Clique para filtrar ou clique duplo para abrir o primeiro exercício da matéria"
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                  isSelected
                    ? `bg-gradient-to-r ${cat.color} text-white border-white/30 shadow-md ring-2 ring-indigo-500/30 scale-[1.02]`
                    : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {cat.icon}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por palavra-chave (ex: Laplace, Fourier, Convolução, EDO)..."
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Nível:
          </span>
          {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => onSelectDifficulty(diff)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {diff === 'all' ? 'Todos' : diff}
            </button>
          ))}
        </div>

        {/* Prev / Next Pagination Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Questão Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
            {currentIndex >= 0 ? currentIndex + 1 : 1} de {filteredProblems.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= filteredProblems.length - 1}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Próxima Questão"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Direct Question Cards Carousel / List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            2. Selecione a Questão para Resolver:
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hidden sm:inline">
            Clique simples seleciona • Clique duplo abre o caderno
          </span>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            Nenhuma questão encontrada para este filtro. Tente mudar o assunto ou a busca.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {filteredProblems.map((p, idx) => {
              const isSelected = p.id === selectedProblemId;
              const isDone = completedIds.includes(p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProblem(p.id)}
                  onDoubleClick={() => handleOpenAndScrollToProblem(p.id)}
                  title="Clique para selecionar ou clique duplo para rolar direto para a resolução desta questão"
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 group cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40 shadow-md dark:shadow-lg dark:shadow-indigo-950 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-800">
                      Q{idx + 1} • {p.difficulty}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/50">
                          <CheckCircle2 className="w-3 h-3" /> Feito
                        </span>
                      )}
                      <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        +{p.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-200">
                    {p.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="truncate max-w-[140px]">{p.chapterName.split('–')[0]}</span>
                    {p.stepsCount ? (
                      <span className="font-semibold text-slate-500 dark:text-slate-400 font-mono">{p.stepsCount} etapas</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicQuestionSelector;
