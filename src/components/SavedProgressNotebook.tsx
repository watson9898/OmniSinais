import React, { useState, useMemo } from 'react';
import { StudentProfile, StepByStepProblem, MultipleChoiceProblem } from '../types';
import { MathView } from './MathView';
import {
  CheckCircle2,
  BookOpen,
  Award,
  Filter,
  Search,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText,
  PenTool,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Trash2
} from 'lucide-react';

interface SavedProgressNotebookProps {
  profile: StudentProfile;
  allStepProblems: StepByStepProblem[];
  allQuizProblems: MultipleChoiceProblem[];
  onSelectStepProblem: (problemId: string) => void;
  onSelectQuizProblem: (problemId: string) => void;
  onResetProblemProgress: (problemId: string, type: 'step' | 'quiz') => void;
  onUpdateScratchpadNote: (problemId: string, newNote: string) => void;
}

export const SavedProgressNotebook: React.FC<SavedProgressNotebookProps> = ({
  profile,
  allStepProblems,
  allQuizProblems,
  onSelectStepProblem,
  onSelectQuizProblem,
  onResetProblemProgress,
  onUpdateScratchpadNote,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'step' | 'quiz'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Iniciante' | 'Intermediário' | 'Avançado'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  // Index problems for fast lookup
  const stepMap = useMemo(() => {
    const map = new Map<string, StepByStepProblem>();
    allStepProblems.forEach((p) => map.set(p.id, p));
    return map;
  }, [allStepProblems]);

  const quizMap = useMemo(() => {
    const map = new Map<string, MultipleChoiceProblem>();
    allQuizProblems.forEach((p) => map.set(p.id, p));
    return map;
  }, [allQuizProblems]);

  // Solved items array
  const solvedItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'step' | 'quiz';
      title: string;
      chapter: number;
      chapterName: string;
      difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
      xp: number;
      statement: string;
      solutionText: string;
      scratchpadNote?: string;
      resolvedAt?: string;
      rawProblem: StepByStepProblem | MultipleChoiceProblem;
    }> = [];

    // Step-by-step solved
    profile.completedProblems.forEach((id) => {
      const p = stepMap.get(id);
      if (p) {
        const record = profile.resolvedRecords?.[id];
        items.push({
          id: p.id,
          type: 'step',
          title: p.title,
          chapter: p.chapter,
          chapterName: p.chapterName,
          difficulty: p.difficulty,
          xp: p.xpReward,
          statement: p.statement,
          solutionText: p.finalSolutionLatex,
          scratchpadNote: record?.scratchpadNote,
          resolvedAt: record?.resolvedAt,
          rawProblem: p,
        });
      }
    });

    // Quiz solved
    profile.completedQuizIds.forEach((id) => {
      const q = quizMap.get(id);
      if (q) {
        const record = profile.resolvedRecords?.[id];
        items.push({
          id: q.id,
          type: 'quiz',
          title: q.title,
          chapter: q.chapter,
          chapterName: q.chapterName,
          difficulty: q.difficulty,
          xp: q.xpReward,
          statement: q.statement,
          solutionText: q.stepByStepSolution,
          scratchpadNote: record?.scratchpadNote,
          resolvedAt: record?.resolvedAt,
          rawProblem: q,
        });
      }
    });

    return items;
  }, [profile.completedProblems, profile.completedQuizIds, profile.resolvedRecords, stepMap, quizMap]);

  // Filter items
  const filteredSolved = useMemo(() => {
    return solvedItems.filter((item) => {
      const matchChapter = selectedChapter === 'all' || item.chapter === selectedChapter;
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchDiff = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.scratchpadNote && item.scratchpadNote.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchChapter && matchType && matchDiff && matchSearch;
    });
  }, [solvedItems, selectedChapter, selectedType, selectedDifficulty, searchQuery]);

  // Chapter statistics
  const chapterStats = useMemo(() => {
    const chapters = [
      { num: 1, name: 'Cap. 1 – Sinais & Sistemas' },
      { num: 2, name: 'Cap. 2 – Análise & Série de Fourier' },
      { num: 3, name: 'Cap. 3 – Transformada de Laplace' },
      { num: 4, name: 'Cap. 4 – EDOs & Sistemas LTI' },
      { num: 5, name: 'Cap. 5 – Engenharia Elétrica & Circuitos' },
    ];

    return chapters.map((c) => {
      const totalAvailableInChapter =
        allStepProblems.filter((p) => p.chapter === c.num).length +
        allQuizProblems.filter((p) => p.chapter === c.num).length;
      
      const solvedInChapter = solvedItems.filter((item) => item.chapter === c.num).length;
      const percentage = totalAvailableInChapter > 0 ? Math.round((solvedInChapter / totalAvailableInChapter) * 100) : 0;

      return {
        ...c,
        totalAvailable: totalAvailableInChapter,
        solved: solvedInChapter,
        percentage,
      };
    });
  }, [allStepProblems, allQuizProblems, solvedItems]);

  const handleStartEditingNote = (id: string, currentNote?: string) => {
    setEditingNoteId(id);
    setNoteDraft(currentNote || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateScratchpadNote(id, noteDraft);
    setEditingNoteId(null);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <BookOpen className="w-3.5 h-3.5" />
              Histórico & Caderno de Estudos Salvo
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Caderno de Exercícios Resolvidos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Acompanhe todas as questões que você já resolveu com seus rascunhos, fórmulas aplicadas e demonstrações completas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-2 shadow-sm"
              title="Exportar ou Imprimir Relatório de Exercícios"
            >
              <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        {/* Global Progress Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {solvedItems.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Questões Concluídas
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                {profile.xp} XP
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Nível {profile.level} ({profile.name ? profile.name.split(' ')[0] : 'Estudante'})
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-lg">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {profile.completedProblems.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Passo a Passo
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {profile.completedQuizIds.length}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Múltipla Escolha
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Mastery Progress Bars */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Taxa de Domínio e Cobertura por Capítulo:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chapterStats.map((ch) => (
              <div
                key={ch.num}
                onClick={() => setSelectedChapter(selectedChapter === ch.num ? 'all' : ch.num)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedChapter === ch.num
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{ch.name}</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 ml-2">
                    {ch.solved}/{ch.totalAvailable}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500"
                    style={{ width: `${Math.max(ch.percentage, ch.solved > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Chapter Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar:
            </span>
            <button
              onClick={() => setSelectedChapter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedChapter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos os Capítulos ({solvedItems.length})
            </button>
            {[1, 2, 3, 4, 5].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedChapter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedChapter === c
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Cap. {c}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('step')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === 'step'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Passo a Passo
            </button>
            <button
              onClick={() => setSelectedType('quiz')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === 'quiz'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Múltipla Escolha
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar nos exercícios resolvidos por título, equação, rascunho..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Solved Problems List / Cards */}
      {filteredSolved.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {solvedItems.length === 0
                ? 'Nenhum exercício resolvido ainda'
                : 'Nenhum exercício encontrado com esses filtros'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {solvedItems.length === 0
                ? 'Resolva questões na aba "1. Resolução Passo a Passo" ou "2. Múltipla Escolha" para que elas sejam salvas automaticamente no seu caderno com seus rascunhos!'
                : 'Tente alterar os filtros de capítulo ou limpar a busca textual para visualizar seus exercícios.'}
            </p>
          </div>

          {solvedItems.length === 0 && (
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onSelectStepProblem(allStepProblems[0]?.id || '')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Começar Exercício Passo a Passo (Cap. 1)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>Mostrando {filteredSolved.length} exercício(s) concluído(s)</span>
          </div>

          {filteredSolved.map((item) => {
            const isExpanded = expandedCardId === item.id;
            const isEditingThisNote = editingNoteId === item.id;

            return (
              <div
                key={item.id}
                onDoubleClick={() => {
                  if (item.type === 'step') {
                    onSelectStepProblem(item.id);
                  } else {
                    onSelectQuizProblem(item.id);
                  }
                }}
                title="Clique simples para ver detalhes ou clique duplo para abrir este exercício no caderno interativo"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-all select-none"
              >
                {/* Header Row */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800 cursor-pointer"
                  onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                          {item.chapterName.split('–')[0]}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            item.type === 'step'
                              ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50'
                              : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50'
                          }`}
                        >
                          {item.type === 'step' ? 'Passo a Passo Guiado' : 'Múltipla Escolha'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.difficulty}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 ml-auto sm:ml-0">
                          +{item.xp} XP
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (item.type === 'step') {
                          onSelectStepProblem(item.id);
                        } else {
                          onSelectQuizProblem(item.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Ir para Questão
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir resolução & rascunho'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question Statement Preview */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl leading-relaxed text-xs sm:text-sm">
                    <MathView math={item.statement} block={true} />
                  </div>

                  {/* Student Saved Scratchpad / Notes Section */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Seu Rascunho / Anotações de Resolução:
                      </span>
                      {!isEditingThisNote && (
                        <button
                          onClick={() => handleStartEditingNote(item.id, item.scratchpadNote)}
                          className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                        >
                          {item.scratchpadNote ? 'Editar Anotação' : '+ Adicionar Rascunho'}
                        </button>
                      )}
                    </div>

                    {isEditingThisNote ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Digite aqui seu rascunho de cálculo, fórmulas intermediárias ou anotações para este exercício..."
                          rows={3}
                          className="w-full p-2.5 bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-700/60 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNote(item.id)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Salvar Rascunho
                          </button>
                        </div>
                      </div>
                    ) : item.scratchpadNote ? (
                      <div className="p-3 bg-white dark:bg-slate-950/80 rounded-lg border border-amber-200 dark:border-amber-900/30 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        <MathView math={item.scratchpadNote} />
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-700/70 dark:text-amber-400/60 italic">
                        Nenhum rascunho digitado durante a resolução desta questão.
                      </p>
                    )}
                  </div>

                  {/* Expanded Full Theoretical Solution */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          Gabarito & Demonstração Completa da Solução:
                        </div>
                        <button
                          onClick={() => onResetProblemProgress(item.id, item.type)}
                          className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold flex items-center gap-1"
                          title="Remover do histórico para praticar novamente do zero"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Praticar Novamente (Resetar)
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                        <MathView math={item.solutionText} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
