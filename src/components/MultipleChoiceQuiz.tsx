import React, { useState, useEffect, useCallback } from 'react';
import { MultipleChoiceProblem } from '../types';
import { MathView } from './MathView';
import { QuestionInterpretationCard } from './QuestionInterpretationCard';
import { QuestionFormulaGuideCard } from './QuestionFormulaGuideCard';
import { EquationBlackboardModal } from './EquationBlackboardModal';
import { SolutionGraphVisualizer } from './SolutionGraphVisualizer';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  BookOpen,
  RotateCcw,
  Check,
  Compass,
  ListOrdered,
  PenTool,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Calculator,
  FileCode,
  Activity,
  Boxes,
  BarChart2,
  Box,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultipleChoiceQuizProps {
  problems: MultipleChoiceProblem[];
  completedQuizIds: string[];
  onQuizCompleted: (quizId: string, earnedXp: number, scratchpadNote?: string) => void;
  savedScratchpads?: Record<string, string>;
  onSaveScratchpad?: (problemId: string, note: string) => void;
  initialProblemId?: string;
}

export const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  problems,
  completedQuizIds,
  onQuizCompleted,
  savedScratchpads = {},
  onSaveScratchpad,
  initialProblemId,
}) => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterChapter, setFilterChapter] = useState<number | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Iniciante' | 'Intermediário' | 'Avançado'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'quiz' | 'interpretation' | 'formula' | 'graph'>('quiz');
  const [graphMode, setGraphMode] = useState<'2d' | '3d'>('2d');
  const [isBlackboardOpen, setIsBlackboardOpen] = useState(false);

  // Scratchpad / Solving Workspace State
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [showMathPreview, setShowMathPreview] = useState(false);
  const [isScratchpadSaved, setIsScratchpadSaved] = useState(false);

  const filteredProblems = problems.filter((p) => {
    const chapterMatch = filterChapter === 'all' ? true : p.chapter === filterChapter;
    const difficultyMatch = filterDifficulty === 'all' ? true : p.difficulty === filterDifficulty;
    const searchMatch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.statement.toLowerCase().includes(searchQuery.toLowerCase());
    return chapterMatch && difficultyMatch && searchMatch;
  });

  // Handle jumping to initialProblemId if supplied
  useEffect(() => {
    if (initialProblemId) {
      const idx = filteredProblems.findIndex((p) => p.id === initialProblemId);
      if (idx >= 0) {
        setSelectedProblemIndex(idx);
      }
    }
  }, [initialProblemId, filteredProblems]);

  const currentProblem = filteredProblems[selectedProblemIndex] || filteredProblems[0] || problems[0];

  // Load existing scratchpad note when currentProblem changes
  useEffect(() => {
    if (currentProblem) {
      const existing =
        savedScratchpads[currentProblem.id] ||
        localStorage.getItem(`omnisinais_scratchpad_${currentProblem.id}`) ||
        '';
      setScratchpadNote(existing);
      setIsScratchpadSaved(false);
    }
  }, [currentProblem?.id, savedScratchpads]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    pushHistoryState({
      problemIndex: selectedProblemIndex,
      selectedOption: idx,
      isAnswerSubmitted: false,
      showHint,
    });
  };

  const handleDoubleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    pushHistoryState({
      problemIndex: selectedProblemIndex,
      selectedOption: idx,
      isAnswerSubmitted: true,
      showHint,
    });

    if (currentProblem) {
      localStorage.setItem(`omnisinais_scratchpad_${currentProblem.id}`, scratchpadNote);
      if (onSaveScratchpad) {
        onSaveScratchpad(currentProblem.id, scratchpadNote);
      }
    }

    const isCorrect = currentProblem.options[idx].isCorrect;
    if (isCorrect) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      const xp = showHint ? Math.floor(currentProblem.xpReward * 0.8) : currentProblem.xpReward;
      onQuizCompleted(currentProblem.id, xp, scratchpadNote);
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    setScratchpadNote((prev) => prev + symbol);
    setIsScratchpadSaved(false);
  };

  const handleInsertTemplate = () => {
    const template = `[DADOS DO ENUNCIADO]\n• Sinal/Função: \n• Parâmetros: \n\n[FÓRMULA CANÔNICA]\n• Teorema: \n\n[DESENVOLVIMENTO DE CÁLCULO]\n• Passo 1: \n• Passo 2: \n\n[RESULTADO]\n• Resposta: `;
    setScratchpadNote(template);
    setIsScratchpadSaved(false);
  };

  const handleSaveScratchpad = () => {
    if (!currentProblem) return;
    if (onSaveScratchpad) {
      onSaveScratchpad(currentProblem.id, scratchpadNote);
    }
    localStorage.setItem(`omnisinais_scratchpad_${currentProblem.id}`, scratchpadNote);
    setIsScratchpadSaved(true);
    setTimeout(() => setIsScratchpadSaved(false), 2500);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    pushHistoryState({
      problemIndex: selectedProblemIndex,
      selectedOption,
      isAnswerSubmitted: true,
      showHint,
    });

    // Save scratchpad note automatically
    if (currentProblem) {
      localStorage.setItem(`omnisinais_scratchpad_${currentProblem.id}`, scratchpadNote);
      if (onSaveScratchpad) {
        onSaveScratchpad(currentProblem.id, scratchpadNote);
      }
    }

    const isCorrect = currentProblem.options[selectedOption].isCorrect;
    if (isCorrect) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      // Award XP
      const xp = showHint ? Math.floor(currentProblem.xpReward * 0.8) : currentProblem.xpReward;
      onQuizCompleted(currentProblem.id, xp, scratchpadNote);
    }
  };

  const handleNextProblem = useCallback(() => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);
    setActiveTab('quiz');
    if (selectedProblemIndex < filteredProblems.length - 1) {
      setSelectedProblemIndex(selectedProblemIndex + 1);
    } else {
      setSelectedProblemIndex(0);
    }
  }, [selectedProblemIndex, filteredProblems.length]);

  const handlePrevProblem = useCallback(() => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);
    setActiveTab('quiz');
    if (selectedProblemIndex > 0) {
      setSelectedProblemIndex(selectedProblemIndex - 1);
    } else {
      setSelectedProblemIndex(filteredProblems.length - 1);
    }
  }, [selectedProblemIndex, filteredProblems.length]);

  const handleResetCurrent = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);
  };

  // Undo / Redo History state
  const [history, setHistory] = useState<Array<{
    problemIndex: number;
    selectedOption: number | null;
    isAnswerSubmitted: boolean;
    showHint: boolean;
  }>>([
    {
      problemIndex: 0,
      selectedOption: null,
      isAnswerSubmitted: false,
      showHint: false,
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [undoToast, setUndoToast] = useState<string | null>(null);

  const pushHistoryState = useCallback((newState: {
    problemIndex: number;
    selectedOption: number | null;
    isAnswerSubmitted: boolean;
    showHint: boolean;
  }) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newState];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setSelectedProblemIndex(target.problemIndex);
      setSelectedOption(target.selectedOption);
      setIsAnswerSubmitted(target.isAnswerSubmitted);
      setShowHint(target.showHint);
      setUndoToast('↩️ Ação desfeita (Ctrl+Z)');
      setTimeout(() => setUndoToast(null), 2000);
    } else if (isAnswerSubmitted) {
      setIsAnswerSubmitted(false);
      setUndoToast('↩️ Resposta desfeita (Ctrl+Z)');
      setTimeout(() => setUndoToast(null), 2000);
    } else if (selectedOption !== null) {
      setSelectedOption(null);
      setUndoToast('↩️ Seleção desfeita (Ctrl+Z)');
      setTimeout(() => setUndoToast(null), 2000);
    }
  }, [historyIndex, history, isAnswerSubmitted, selectedOption]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setSelectedProblemIndex(target.problemIndex);
      setSelectedOption(target.selectedOption);
      setIsAnswerSubmitted(target.isAnswerSubmitted);
      setShowHint(target.showHint);
      setUndoToast('↪️ Ação refeita (Ctrl+Y)');
      setTimeout(() => setUndoToast(null), 2000);
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener (Ctrl+Z to undo, Ctrl+Y / Ctrl+Shift+Z to redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'textarea' || targetTag === 'input') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const mathShortcuts = [
    { label: '∫', value: '\\int_{-\\infty}^{\\infty} ' },
    { label: '∑', value: '\\sum_{n=-\\infty}^{\\infty} ' },
    { label: 'ℒ{}', value: '\\mathcal{L}\\{f(t)\\} = ' },
    { label: 'ℱ{}', value: '\\mathcal{F}\\{x(t)\\} = ' },
    { label: 'ω₀', value: '\\omega_0' },
    { label: 'τ', value: '\\tau' },
    { label: 'π', value: '\\pi' },
    { label: '∞', value: '\\infty' },
    { label: 'd/dt', value: '\\frac{d}{dt}' },
    { label: 'e^-st', value: 'e^{-st}' },
    { label: 'u(t)', value: 'u(t)' },
    { label: 'δ(t)', value: '\\delta(t)' },
    { label: 'jω', value: 'j\\omega' },
    { label: 's', value: 's' },
    { label: 'Z(s)', value: 'Z(s)' },
    { label: 'H(s)', value: 'H(s)' },
    { label: '√x', value: '\\sqrt{}' },
    { label: 'a/b', value: '\\frac{a}{b}' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Filter Selector: Chapter, Difficulty & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Chapter Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Matéria:</span>
            <button
              onClick={() => {
                setFilterChapter('all');
                setSelectedProblemIndex(0);
                handleResetCurrent();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterChapter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas ({problems.length})
            </button>
            <button
              onClick={() => {
                setFilterChapter(1);
                setSelectedProblemIndex(0);
                handleResetCurrent();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterChapter === 1
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cap. 1: Sinais & Sistemas
            </button>
            <button
              onClick={() => {
                setFilterChapter(2);
                setSelectedProblemIndex(0);
                handleResetCurrent();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterChapter === 2
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cap. 2: Fourier
            </button>
            <button
              onClick={() => {
                setFilterChapter(3);
                setSelectedProblemIndex(0);
                handleResetCurrent();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterChapter === 3
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cap. 3: Laplace
            </button>
            <button
              onClick={() => {
                setFilterChapter(4);
                setSelectedProblemIndex(0);
                handleResetCurrent();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterChapter === 4
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cap. 4: EDOs
            </button>
            <button
              onClick={() => {
                setFilterChapter(5);
                setSelectedProblemIndex(0);
                handleResetCurrent();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterChapter === 5
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cap. 5: Circuitos
            </button>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setFilterDifficulty(diff);
                  setSelectedProblemIndex(0);
                  handleResetCurrent();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterDifficulty === diff
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {diff === 'all' ? 'Todos os Níveis' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Pesquisar por título, fórmula ou termo (ex: convolução, parseval, ROC, degrau)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedProblemIndex(0);
              handleResetCurrent();
            }}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Main Quiz Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md transition-colors">
        {/* Header with Chapter info & Quick Navigation */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {currentProblem.chapterName}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {currentProblem.difficulty}
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                +{currentProblem.xpReward} XP
              </span>
              {completedQuizIds.includes(currentProblem.id) && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolvida & Salva
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Questão {selectedProblemIndex + 1} de {filteredProblems.length} filtradas
            </span>
          </div>

          {/* Pagination & Undo/Redo Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo / Redo Toolbar */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0 && !isAnswerSubmitted && selectedOption === null}
                title="Desfazer ação anterior (Ctrl + Z)"
                className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span>Desfazer</span>
                <kbd className="hidden sm:inline-block px-1 py-0.2 bg-slate-200 dark:bg-slate-900 rounded text-[9px] font-mono text-slate-500">Ctrl+Z</kbd>
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title="Refazer ação (Ctrl + Y)"
                className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-500 scale-x-[-1]" />
                <span>Refazer</span>
                <kbd className="hidden sm:inline-block px-1 py-0.2 bg-slate-200 dark:bg-slate-900 rounded text-[9px] font-mono text-slate-500">Ctrl+Y</kbd>
              </button>
            </div>

            {/* Previous / Next Question Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (selectedProblemIndex > 0) {
                    setSelectedProblemIndex(selectedProblemIndex - 1);
                    handleResetCurrent();
                  }
                }}
                disabled={selectedProblemIndex <= 0}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
                title="Questão anterior"
              >
                ← Anterior
              </button>
              <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800/50">
                {selectedProblemIndex + 1} / {filteredProblems.length}
              </span>
              <button
                onClick={() => {
                  if (selectedProblemIndex < filteredProblems.length - 1) {
                    setSelectedProblemIndex(selectedProblemIndex + 1);
                    handleResetCurrent();
                  }
                }}
                disabled={selectedProblemIndex >= filteredProblems.length - 1}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                title="Próxima questão"
              >
                Próxima →
              </button>
            </div>
          </div>
        </div>

        {/* Undo Toast Notification */}
        {undoToast && (
          <div className="px-4 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>{undoToast}</span>
            <span className="text-[10px] text-slate-400 font-mono">Use Ctrl+Z / Ctrl+Y a qualquer momento</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Questão & Rascunho de Solução
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interpretation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'interpretation'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            Como Interpretar & Saber Fazer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'formula'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            Formulário da Questão & Aplicação
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                : isAnswerSubmitted
                ? 'bg-gradient-to-r from-purple-950/80 to-indigo-950/80 text-purple-200 hover:text-white border-2 border-purple-500/60 shadow-md shadow-purple-900/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAnswerSubmitted ? 'text-purple-300 animate-pulse' : 'text-purple-400'}`} />
            <span>Gráfico da Resposta (2D & 3D)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
              isAnswerSubmitted 
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-sm animate-bounce' 
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {isAnswerSubmitted ? '✨ 2D & 3D Pronto!' : '2D / 3D'}
            </span>
          </button>
        </div>

        {/* Tab 1: Interpretation */}
        {activeTab === 'interpretation' && (
          <div className="p-4 sm:p-6 space-y-4">
            <QuestionInterpretationCard guide={currentProblem.interpretationGuide} defaultExpanded={true} />
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                Voltar para a Questão
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Formula Guide */}
        {activeTab === 'formula' && (
          <div className="p-4 sm:p-6 space-y-4">
            <QuestionFormulaGuideCard guide={currentProblem.formulaGuide} defaultExpanded={true} />
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                Aplicar na Questão
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Solution Graph Visualizer 2D / 3D */}
        {activeTab === 'graph' && (
          <div className="p-4 sm:p-6 space-y-4">
            <SolutionGraphVisualizer
              problemId={currentProblem.id}
              problemTitle={currentProblem.title}
              finalSolutionLatex={currentProblem.stepByStepSolution}
              statement={currentProblem.statement}
              category={currentProblem.category}
              initialMode={graphMode}
            />
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                Voltar para a Questão
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Question Body & Workspace */}
        {activeTab === 'quiz' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {currentProblem.title}
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl leading-relaxed">
                <MathView math={currentProblem.statement} block={true} className="text-slate-900 dark:text-slate-100 text-base" />
              </div>
            </div>

            {/* Guided Hint Toggle */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-500/30 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Ocultar Instrução / Dica Teórica' : '💡 Exercício Orientado: Ver Instrução & Dica'}
              </button>

              {showHint && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed animate-fade-in flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-800 dark:text-amber-300">Instrução Orientada: </strong>
                    <MathView math={currentProblem.guidedHint} />
                  </div>
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Escolha a alternativa correta:
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hidden sm:inline">
                  Clique simples seleciona • Clique duplo confirma e valida
                </span>
              </div>

              {currentProblem.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = option.isCorrect;

                let optionStyle = 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200';
                if (isSelected && !isAnswerSubmitted) {
                  optionStyle = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/40';
                } else if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/40';
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    onDoubleClick={() => handleDoubleSelectOption(idx)}
                    title="Clique para selecionar ou clique duplo para responder e validar imediatamente"
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${optionStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 text-sm sm:text-base leading-relaxed">
                        <MathView math={option.text} />
                      </div>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </div>

                    {/* Feedback on answer submitted */}
                    {isAnswerSubmitted && (isSelected || isCorrect) && (
                      <div
                        className={`mt-3 pt-3 border-t text-xs sm:text-sm pl-9 ${
                          isCorrect
                            ? 'border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                            : 'border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        <strong>{isCorrect ? 'Explicação Correta:' : 'Por que está incorreta:'} </strong>
                        <MathView math={option.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* NEW: Dedicated Solving Workspace / Scratchpad directly below question options */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-slate-950/70 p-4 sm:p-5 space-y-3 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      Espaço para Solucionar o Exercício (Caderno de Rascunho do Aluno)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Use este espaço para testar hipóteses, calcular integrais e registrar seu raciocínio. Salvo automaticamente!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setIsBlackboardOpen(true)}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-700/60 transition-colors flex items-center gap-1 shadow-2xs"
                    title="Abrir quadro negro para desenhar e reconhecer equações à mão"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Quadro Negro (OCR)
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 shadow-2xs"
                    title="Inserir estrutura de passos no rascunho"
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Roteiro Padrão
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMathPreview(!showMathPreview)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 shadow-2xs"
                    title="Alternar pré-visualização matemática"
                  >
                    {showMathPreview ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-sky-500" />}
                    {showMathPreview ? 'Ocultar Prévia' : 'Prévia LaTeX'}
                  </button>
                </div>
              </div>

              {/* Math Quick Symbols Toolbar */}
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-indigo-500" />
                  Inserir:
                </span>
                {mathShortcuts.map((sym, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleInsertSymbol(sym.value)}
                    className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    {sym.label}
                  </button>
                ))}
              </div>

              {/* Textarea Scratchpad */}
              <div className="relative">
                <textarea
                  value={scratchpadNote}
                  onChange={(e) => {
                    setScratchpadNote(e.target.value);
                    setIsScratchpadSaved(false);
                  }}
                  placeholder="Escreva seus cálculos, deduções ou anotações para este exercício (suporta texto e equações LaTeX como $X(s) = \frac{1}{s+2}$)..."
                  rows={4}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y transition-all"
                />
              </div>

              {/* Live Math Render Preview */}
              {showMathPreview && scratchpadNote.trim() && (
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-900/50 space-y-1 animate-fade-in">
                  <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Pré-visualização Matemática Formatada:
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    <MathView math={scratchpadNote} />
                  </div>
                </div>
              )}

              {/* Scratchpad Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveScratchpad}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Rascunho
                  </button>

                  {isScratchpadSaved && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                      <Check className="w-3.5 h-3.5" />
                      Rascunho salvo no seu caderno!
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setScratchpadNote('');
                    setIsScratchpadSaved(false);
                  }}
                  className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar Rascunho
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevProblem}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  title="Voltar para a questão anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar Questão</span>
                </button>

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0 && !isAnswerSubmitted && selectedOption === null}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Desfazer escolha ou reiniciar resposta (Atalho: Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Desfazer (Ctrl+Z)</span>
                </button>

                <button
                  onClick={handleResetCurrent}
                  disabled={!isAnswerSubmitted && selectedOption === null}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    Confirmar Resposta
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextProblem}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 animate-pulse cursor-pointer active:scale-95"
                  >
                    Próxima Questão
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleNextProblem}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  title="Avançar para a próxima questão"
                >
                  <span>Avançar Questão</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2D & 3D Interactive Visual Discovery Card after submission */}
            {isAnswerSubmitted && (
              <div className="space-y-4 animate-scale-up">
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-indigo-500/80 shadow-2xl shadow-indigo-950/60 space-y-4 relative overflow-hidden ring-4 ring-indigo-500/20">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                          Ferramenta 2D & 3D Liberada
                        </span>
                        <span className="text-xs text-sky-300 font-bold flex items-center gap-1">
                          <Boxes className="w-3.5 h-3.5 text-sky-400" />
                          Simulação Física em Tempo Real
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
                        <span>Explore a Resposta em Gráficos 2D e Superfície 3D</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        Veja o sinal no tempo <strong className="text-sky-300">y(t)</strong>, os polos e zeros no plano <strong className="text-purple-300">s</strong> e gire a superfície tridimensional <strong className="text-emerald-300">|H(s)|</strong> calculada para esta questão.
                      </p>
                    </div>

                    {/* Direct High-Visibility Switcher & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setGraphMode('2d')}
                        className={`px-4 py-2.5 text-xs font-black rounded-2xl border transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer ${
                          graphMode === '2d'
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-300 shadow-indigo-500/40 ring-2 ring-indigo-400'
                            : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <Activity className="w-4 h-4 text-indigo-300" />
                        <span>📈 Gráfico 2D</span>
                        {graphMode === '2d' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGraphMode('3d')}
                        className={`px-4 py-2.5 text-xs font-black rounded-2xl border transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer ${
                          graphMode === '3d'
                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white border-pink-300 shadow-purple-500/40 ring-2 ring-purple-400'
                            : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <Boxes className="w-4 h-4 text-cyan-300 animate-bounce" />
                        <span>🪐 Superfície 3D</span>
                        {graphMode === '3d' && (
                          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsBlackboardOpen(true)}
                        className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold rounded-2xl border border-emerald-500/40 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        title="Abrir no Simulador de Equações 2D/3D & Lousa Aberta"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Lousa (OCR)</span>
                      </button>
                    </div>
                  </div>

                  {/* Capability Badges & Interaction tips */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-medium text-slate-300 relative z-10 border-t border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-black text-slate-400 mr-1">Visualizações:</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-indigo-300 font-semibold">
                        📈 Resposta Temporal y(t)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-purple-300 font-semibold">
                        ⚡ Diagrama de Polos (Plano s)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-sky-300 font-semibold">
                        🪐 Superfície 3D Giratória
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-amber-300 font-semibold">
                        ✂️ Cortina Antes vs Depois
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
                      <span>💡 <strong>Dica:</strong> Arraste o mouse no gráfico 3D para girar em qualquer ângulo.</span>
                    </div>
                  </div>
                </div>

                {/* Embedded Interactive 2D / 3D Solution Graph Visualizer */}
                <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                  <SolutionGraphVisualizer
                    problemId={currentProblem.id}
                    problemTitle={currentProblem.title}
                    finalSolutionLatex={currentProblem.stepByStepSolution}
                    statement={currentProblem.statement}
                    category={currentProblem.category}
                    initialMode={graphMode}
                  />
                </div>
              </div>
            )}

            {/* Step-by-Step Solution Breakdown after submission */}
            {isAnswerSubmitted && (
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  Resolução e Demonstração Completa da Questão:
                </div>
                <div className="text-slate-800 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  <MathView math={currentProblem.stepByStepSolution} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Blackboard & Equation OCR Modal */}
      <EquationBlackboardModal
        isOpen={isBlackboardOpen}
        onClose={() => setIsBlackboardOpen(false)}
        onInsertToInput={(eq) => {
          setScratchpadNote((prev) => (prev ? `${prev}\n${eq}` : eq));
          setIsScratchpadSaved(false);
        }}
        currentExerciseContext={`${currentProblem?.title} - ${currentProblem?.statement}`}
      />
    </div>
  );
};

export default MultipleChoiceQuiz;
