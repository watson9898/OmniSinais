import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StepByStepProblem, StepItem } from '../types';
import { MathView } from './MathView';
import { MathKeypad } from './MathKeypad';
import { EquationBlackboardModal } from './EquationBlackboardModal';
import { QuestionInterpretationCard } from './QuestionInterpretationCard';
import { QuestionFormulaGuideCard } from './QuestionFormulaGuideCard';
import { SolutionGraphVisualizer } from './SolutionGraphVisualizer';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Undo2,
  Redo2,
  BookOpen,
  Award,
  PenTool,
  Lightbulb,
  Check,
  Send,
  Compass,
  FileSpreadsheet,
  Target,
  ListOrdered,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Calculator,
  FileCode,
  Activity,
  BarChart2,
  Box,
  ClipboardPaste,
  Copy,
  Boxes,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StepByStepSolverProps {
  problem: StepByStepProblem;
  onProblemCompleted: (problemId: string, earnedXp: number, scratchpadNote?: string) => void;
  onOpenScratchpad: () => void;
  savedScratchpad?: string;
  onSaveScratchpad?: (problemId: string, note: string) => void;
}

export const StepByStepSolver: React.FC<StepByStepSolverProps> = ({
  problem,
  onProblemCompleted,
  onOpenScratchpad,
  savedScratchpad,
  onSaveScratchpad,
}) => {
  const [activeTab, setActiveTab] = useState<'solver' | 'interpretation' | 'formula' | 'graph'>('solver');
  const [graphMode, setGraphMode] = useState<'2d' | '3d'>('2d');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [stepStatuses, setStepStatuses] = useState<Record<number, 'pending' | 'correct' | 'error'>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [showTeachMe, setShowTeachMe] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBlackboardOpen, setIsBlackboardOpen] = useState(false);
  const [blackboardInitialEquation, setBlackboardInitialEquation] = useState<string>('');
  const [stepClipboardFeedback, setStepClipboardFeedback] = useState<string | null>(null);

  // Undo / Redo History per step
  const [inputHistories, setInputHistories] = useState<Record<number, string[]>>({});
  const [historyPointers, setHistoryPointers] = useState<Record<number, number>>({});
  const [undoFeedback, setUndoFeedback] = useState<string | null>(null);

  // Scratchpad
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [isScratchpadSaved, setIsScratchpadSaved] = useState(false);
  const [showScratchpadPreview, setShowScratchpadPreview] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentStep = problem.steps[currentStepIndex];
  const totalSteps = problem.steps.length;

  // Step target detector: identifies the exact operator/variable being requested (Laplace, Inverse Laplace, Transfer Func, etc.)
  interface StepTargetInfo {
    category: 'laplace_direct' | 'laplace_inverse' | 'transfer_func' | 'laplace_output' | 'laplace_input' | 'time_output' | 'fourier' | 'partial_fractions' | 'generic';
    label: string;
    badgeLatex: string;
    suggestedPrefix: string;
    instructionTip: string;
  }

  const getStepTargetInfo = (step: StepItem): StepTargetInfo => {
    if (!step) {
      return {
        category: 'generic',
        label: 'Equação do Domínio',
        badgeLatex: 'f(s) = \\dots',
        suggestedPrefix: '',
        instructionTip: 'Escreva a equação correspondente ao passo.',
      };
    }

    const text = `${step.instruction} ${step.expectedAnswer} ${step.formulaHelper || ''} ${step.acceptableAnswers.join(' ')}`.toLowerCase();

    if (
      text.includes('inversa') ||
      text.includes('\\mathcal{l}^{-1}') ||
      text.includes('l^-1') ||
      text.includes('domínio do tempo') ||
      text.includes('y(t)')
    ) {
      return {
        category: 'laplace_inverse',
        label: 'Transformada Inversa de Laplace',
        badgeLatex: '\\mathcal{L}^{-1}\\{Y(s)\\} = y(t)',
        suggestedPrefix: 'y(t) = ',
        instructionTip: 'Calcule a resposta no tempo y(t) aplicando a inversa nos termos parciais.',
      };
    }

    if (
      text.includes('função de transferência') ||
      text.includes('h(s)') ||
      text.includes('resposta ao impulso') ||
      text.includes('y(s)/x(s)')
    ) {
      return {
        category: 'transfer_func',
        label: 'Função de Transferência',
        badgeLatex: 'H(s) = \\frac{Y(s)}{X(s)}',
        suggestedPrefix: 'H(s) = ',
        instructionTip: 'Determine a relação saída/entrada H(s) no domínio complexo s.',
      };
    }

    if (
      text.includes('frações parciais') ||
      text.includes('heaviside') ||
      text.includes('coeficiente') ||
      text.includes('a =') ||
      text.includes('b =')
    ) {
      return {
        category: 'partial_fractions',
        label: 'Decomposição em Frações Parciais',
        badgeLatex: 'Y(s) = \\frac{A}{s-p_1} + \\frac{B}{s-p_2}',
        suggestedPrefix: 'A = , B = ',
        instructionTip: 'Encontre os coeficientes dos polos simples usando o método de Heaviside.',
      };
    }

    if (
      text.includes('isole y(s)') ||
      text.includes('y(s) =') ||
      (text.includes('y(s)') && !text.includes('y\'(t)') && !text.includes('l{'))
    ) {
      return {
        category: 'laplace_output',
        label: 'Saída no Domínio de Laplace',
        badgeLatex: 'Y(s) = \\frac{N(s)}{D(s)}',
        suggestedPrefix: 'Y(s) = ',
        instructionTip: 'Agrupe os termos algébricos e isole a função racional Y(s).',
      };
    }

    if (
      text.includes('fourier') ||
      text.includes('\\mathcal{f}') ||
      text.includes('x(jw)') ||
      text.includes('h(jw)')
    ) {
      return {
        category: 'fourier',
        label: 'Transformada de Fourier',
        badgeLatex: '\\mathcal{F}\\{x(t)\\} = X(j\\omega)',
        suggestedPrefix: 'X(j\\omega) = ',
        instructionTip: 'Obtenha a representação espectral no domínio da frequência contínua.',
      };
    }

    if (
      text.includes('aplique a transformada de laplace') ||
      text.includes('transformada de laplace') ||
      text.includes('\\mathcal{l}') ||
      text.includes('sy(s)') ||
      text.includes('l{')
    ) {
      return {
        category: 'laplace_direct',
        label: 'Transformada Direta de Laplace',
        badgeLatex: '\\mathcal{L}\\{y\'(t) + ay(t)\\} = \\mathcal{L}\\{x(t)\\}',
        suggestedPrefix: 'sY(s) - y(0)',
        instructionTip: 'Aplique o operador de Laplace termo a termo usando a propriedade da derivada.',
      };
    }

    return {
      category: 'generic',
      label: 'Equação de Sinais & Sistemas',
      badgeLatex: 'f(s) = \\dots',
      suggestedPrefix: '',
      instructionTip: 'Escreva a relação matemática correspondente.',
    };
  };

  const targetInfo = getStepTargetInfo(currentStep);

  // Extract relevant symbols specifically used in this step
  const getContextSymbolsForStep = (step: StepItem): string[] => {
    if (!step) return ['ℒ{·}', 'ℒ⁻¹{·}', 'Y(s) =', 'y(t) =', 's', 't', '+', '-', '*', '/', '=', '(', ')'];
    const fullText = `${step.expectedAnswer} ${step.acceptableAnswers.join(' ')} ${step.formulaHelper || ''} ${step.instruction}`;
    
    const candidateList = [
      'L{', 'L^-1{', 'Y(s) = ', 'y(t) = ', 'H(s) = ', 'X(s) = ',
      's', 't', 'Y(s)', 'y(t)', 'H(s)', 'X(s)', 'x(t)', 'h(t)', 'u(t)', 'δ(t)', 'r(t)',
      '1/s', '1/(s-a)', '1/(s+a)', '1/(s-5)', '1/(s-2)', '1/(s+2)', '1/(s+3)',
      'e^(-at)', 'e^(-3t)', 'e^(-2t)', 'e^(-t)', 'e^(2t)', 'e^(5t)', 'e^(3t)', 'e^(s*t)', 'j*w', 'pi',
      'sin(w*t)', 'cos(w*t)', 'sin(', 'cos(', 'sen(', 's^2', 's^3', 's+1', 's+2', 's+3', 's+4', 's+5', 's-2', 's-5',
      '+', '-', '*', '/', '=', '(', ')'
    ];

    const result: string[] = [];
    for (const item of candidateList) {
      if (fullText.includes(item) || fullText.toLowerCase().includes(item.toLowerCase())) {
        if (!result.includes(item)) result.push(item);
      }
    }

    // Extract numbers in expected answer
    const numbers = step.expectedAnswer.match(/\b\d+\b/g) || [];
    for (const num of numbers) {
      if (!result.includes(num) && result.length < 20) {
        result.push(num);
      }
    }

    return result.length > 0 ? result : ['L{', 'L^-1{', 'Y(s) = ', 'y(t) = ', 's', 't', '1/s', '+', '-', '*', '/', '(', ')'];
  };

  const convertRawToLatexPreview = (raw: string, suggestedPrefix: string): string => {
    if (!raw || !raw.trim()) return '';
    let str = raw.trim();

    // Auto-prefix if user just entered the right-hand side
    if (!str.includes('=') && suggestedPrefix && suggestedPrefix.includes('=')) {
      str = `${suggestedPrefix}${str}`;
    }

    return str
      .replace(/L\^\{-1\}\{/gi, '\\mathcal{L}^{-1}\\{')
      .replace(/L\^-1\{/gi, '\\mathcal{L}^{-1}\\{')
      .replace(/L\{/gi, '\\mathcal{L}\\{')
      .replace(/F\^\{-1\}\{/gi, '\\mathcal{F}^{-1}\\{')
      .replace(/F\^-1\{/gi, '\\mathcal{F}^{-1}\\{')
      .replace(/F\{/gi, '\\mathcal{F}\\{')
      .replace(/e\^\(([^)]+)\)/g, 'e^{$1}')
      .replace(/e\^(-?[0-9a-zA-Z\*\+\-]+)/g, 'e^{$1}')
      .replace(/exp\(([^)]+)\)/g, 'e^{$1}')
      .replace(/\^([0-9a-zA-Z]+)/g, '^{$1}')
      .replace(/\bpi\b/g, '\\pi')
      .replace(/\bomega\b/g, '\\omega')
      .replace(/\bdelta\(([^)]+)\)/g, '\\delta($1)')
      .replace(/\bu\(([^)]+)\)/g, 'u($1)')
      .replace(/\*/g, ' \\cdot ')
      .replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}')
      .replace(/([0-9a-zA-Z\^\{\}\\\-]+)\/\(([^()]+)\)/g, '\\frac{$1}{$2}')
      .replace(/\(([^()]+)\)\/([0-9a-zA-Z\^\{\}\\\-]+)/g, '\\frac{$1}{$2}')
      .replace(/\b([0-9]+)\/([0-9]+)\b/g, '\\frac{$1}{$2}');
  };

  useEffect(() => {
    const existing =
      savedScratchpad ||
      localStorage.getItem(`omnisinais_scratchpad_${problem.id}`) ||
      '';
    setScratchpadNote(existing);
  }, [problem.id, savedScratchpad]);

  const updateCurrentInput = useCallback(
    (newVal: string, addToHistory: boolean = true) => {
      setUserInputs((prev) => ({ ...prev, [currentStepIndex]: newVal }));
      setErrorMessage(null);

      if (addToHistory) {
        setInputHistories((prev) => {
          const currentStack = prev[currentStepIndex] || [''];
          const currentPointer = historyPointers[currentStepIndex] ?? (currentStack.length - 1);
          const newStack = currentStack.slice(0, currentPointer + 1);

          if (newStack[newStack.length - 1] !== newVal) {
            newStack.push(newVal);
            if (newStack.length > 30) newStack.shift();
          }

          setHistoryPointers((p) => ({ ...p, [currentStepIndex]: newStack.length - 1 }));
          return { ...prev, [currentStepIndex]: newStack };
        });
      }
    },
    [currentStepIndex, historyPointers]
  );

  const canUndo = (historyPointers[currentStepIndex] ?? 0) > 0;
  const canRedo =
    (historyPointers[currentStepIndex] ?? 0) < ((inputHistories[currentStepIndex]?.length ?? 1) - 1);

  const handleUndo = useCallback(() => {
    const currentStack = inputHistories[currentStepIndex] || [''];
    const currentPointer = historyPointers[currentStepIndex] ?? (currentStack.length - 1);
    if (currentPointer > 0) {
      const nextPointer = currentPointer - 1;
      const prevVal = currentStack[nextPointer] || '';
      setHistoryPointers((p) => ({ ...p, [currentStepIndex]: nextPointer }));
      setUserInputs((prev) => ({ ...prev, [currentStepIndex]: prevVal }));
      setUndoFeedback('Desfazer (Ctrl+Z)');
      setTimeout(() => setUndoFeedback(null), 1500);
    }
  }, [currentStepIndex, inputHistories, historyPointers]);

  const handleRedo = useCallback(() => {
    const currentStack = inputHistories[currentStepIndex] || [''];
    const currentPointer = historyPointers[currentStepIndex] ?? 0;
    if (currentPointer < currentStack.length - 1) {
      const nextPointer = currentPointer + 1;
      const nextVal = currentStack[nextPointer] || '';
      setHistoryPointers((p) => ({ ...p, [currentStepIndex]: nextPointer }));
      setUserInputs((prev) => ({ ...prev, [currentStepIndex]: nextVal }));
      setUndoFeedback('Refazer (Ctrl+Y)');
      setTimeout(() => setUndoFeedback(null), 1500);
    }
  }, [currentStepIndex, inputHistories, historyPointers]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setErrorMessage(null);
      setUndoFeedback(`Voltou para o Passo ${currentStepIndex}`);
      setTimeout(() => setUndoFeedback(null), 1500);
    }
  }, [currentStepIndex]);

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setErrorMessage(null);
      setUndoFeedback(`Avançou para o Passo ${currentStepIndex + 2}`);
      setTimeout(() => setUndoFeedback(null), 1500);
    }
  }, [currentStepIndex, totalSteps]);

  // Global Keyboard Shortcuts (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z / Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in textarea or if blackboard modal is open
      if (isBlackboardOpen) return;
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlackboardOpen, handleUndo, handleRedo]);

  const handleInsertSymbol = (symbol: string) => {
    const currentVal = userInputs[currentStepIndex] || '';
    const updatedVal = currentVal + symbol;
    updateCurrentInput(updatedVal, true);
  };

  const handleClearInput = () => {
    updateCurrentInput('', true);
  };

  const handleBackspaceInput = () => {
    const currentVal = userInputs[currentStepIndex] || '';
    updateCurrentInput(currentVal.slice(0, -1), true);
  };

  const handleInsertFromBlackboard = (equationText: string) => {
    updateCurrentInput(equationText, true);
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePasteFromClipboardToStep = async () => {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      } else {
        text = prompt('Cole aqui o texto ou cálculo:') || '';
      }
      if (text && text.trim()) {
        const cleaned = text.replace(/^\$\$|\$\$$|^\$|\$$/g, '').trim();
        updateCurrentInput(cleaned, true);
        setErrorMessage(null);
        setStepClipboardFeedback('Texto/cálculo colado no campo com sucesso!');
        setTimeout(() => setStepClipboardFeedback(null), 2500);
      }
    } catch {
      const fallback = prompt('Cole aqui o texto ou cálculo:');
      if (fallback && fallback.trim()) {
        updateCurrentInput(fallback.trim(), true);
        setErrorMessage(null);
      }
    }
  };

  const handleCopyStepExpectedAnswer = () => {
    if (!currentStep) return;
    const formulaToCopy = currentStep.expectedAnswer || currentStep.instruction;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(formulaToCopy);
        setStepClipboardFeedback(`Copiado: "${formulaToCopy}"`);
        setTimeout(() => setStepClipboardFeedback(null), 2500);
      }
    } catch {
      // ignore
    }
  };

  const handleOpenSimulatorWithStepFormula = (customEq?: string) => {
    const rawEq = customEq || userInputs[currentStepIndex] || currentStep?.expectedAnswer || problem.finalSolutionLatex || '';
    setBlackboardInitialEquation(rawEq);
    setIsBlackboardOpen(true);
  };

  const handleSaveScratchpad = () => {
    if (onSaveScratchpad) {
      onSaveScratchpad(problem.id, scratchpadNote);
    }
    localStorage.setItem(`omnisinais_scratchpad_${problem.id}`, scratchpadNote);
    setIsScratchpadSaved(true);
    setTimeout(() => setIsScratchpadSaved(false), 2000);
  };

  const handleInsertScratchpadTemplate = () => {
    const template = `=== ROTEIRO DE DEDUÇÃO E CÁLCULO ===
1. Dados do Enunciado e Condições:
   - 

2. Fórmulas e Propriedades Aplicadas:
   - 

3. Desenvolvimento dos Passos Algébricos:
   - 

4. Resposta Final:
   - `;
    if (!scratchpadNote.trim()) {
      setScratchpadNote(template);
    } else {
      setScratchpadNote((prev) => `${prev}\n\n${template}`);
    }
    setIsScratchpadSaved(false);
  };

  const handleInsertSymbolToScratchpad = (symbol: string) => {
    setScratchpadNote((prev) => prev + symbol);
    setIsScratchpadSaved(false);
  };

  const normalizeMathString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '') // remove all whitespace
      .replace(/\\mathcal\{l\}/g, 'l')
      .replace(/\\mathcal\{f\}/g, 'f')
      .replace(/\\mathcal\{z\}/g, 'z')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\cdot/g, '')
      .replace(/\\/g, '') // remove remaining backslashes
      .replace(/[\*\·]/g, '') // ignore multiplication asterisks / dots
      .replace(/\^/g, '') // allow e^(-3t) or e-3t
      .replace(/exp/g, 'e')
      .replace(/sin/g, 'sen')
      .replace(/omega/g, 'w')
      .replace(/tau/g, 't')
      .replace(/pi/g, 'pi')
      .replace(/delta/g, 'delta')
      .replace(/l-1\{/g, '')
      .replace(/l\^\{-1\}\{/g, '')
      .replace(/l\^-1\{/g, '')
      .replace(/l\{/g, '')
      .replace(/f-1\{/g, '')
      .replace(/f\{/g, '')
      .replace(/y\(t\)=/g, '')
      .replace(/y\(s\)=/g, '')
      .replace(/x\(t\)=/g, '')
      .replace(/x\(s\)=/g, '')
      .replace(/h\(t\)=/g, '')
      .replace(/h\(s\)=/g, '')
      .replace(/f\(t\)=/g, '')
      .replace(/f\(s\)=/g, '')
      .replace(/i=/g, '')
      .replace(/t0=/g, '')
      .replace(/c=/g, '');
  };

  const validateAnswer = (input: string, step: StepItem): boolean => {
    if (!input || !input.trim()) return false;

    const cleanInput = input.trim();
    const normInput = normalizeMathString(cleanInput);

    // Direct check
    if (cleanInput.toLowerCase() === step.expectedAnswer.toLowerCase()) {
      return true;
    }

    const normExpected = normalizeMathString(step.expectedAnswer);
    if (normInput === normExpected) {
      return true;
    }

    // Check acceptable answers
    for (const alt of step.acceptableAnswers) {
      if (cleanInput.toLowerCase() === alt.toLowerCase()) return true;
      if (normInput === normalizeMathString(alt)) return true;
    }

    // Numeric comparison if both are valid numbers
    const numInput = parseFloat(cleanInput.replace(',', '.'));
    const numExpected = parseFloat(step.expectedAnswer.replace(',', '.'));
    if (!isNaN(numInput) && !isNaN(numExpected)) {
      if (Math.abs(numInput - numExpected) < 0.05) return true;
    }

    return false;
  };

  const handleStepSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputVal = userInputs[currentStepIndex] || '';

    if (!inputVal.trim()) {
      setErrorMessage('Por favor, digite sua resposta ou equação antes de verificar.');
      return;
    }

    const isCorrect = validateAnswer(inputVal, currentStep);

    if (isCorrect) {
      setErrorMessage(null);
      const nextStatuses = { ...stepStatuses, [currentStepIndex]: 'correct' as const };
      setStepStatuses(nextStatuses);

      // If last step
      if (currentStepIndex === totalSteps - 1) {
        setIsFinished(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onProblemCompleted(problem.id, problem.xpReward, scratchpadNote);
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    } else {
      setStepStatuses({ ...stepStatuses, [currentStepIndex]: 'error' as const });
      setErrorMessage('Resposta não corresponde ao esperado para esta etapa. Clique em "Ensinar Passo" para ver a demonstração guiada ou use a Dica!');
    }
  };

  const handleTeachMeStep = () => {
    setShowTeachMe({ ...showTeachMe, [currentStepIndex]: true });
    // Pre-fill expected answer nicely for student to learn and proceed
    setUserInputs({ ...userInputs, [currentStepIndex]: currentStep.expectedAnswer });
    setErrorMessage(null);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setUserInputs({});
    setStepStatuses({});
    setShowHint({});
    setShowTeachMe({});
    setIsFinished(false);
    setErrorMessage(null);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md transition-colors">
      {/* Problem Header */}
      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              {problem.chapterName}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              +{problem.xpReward} XP
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {problem.difficulty}
            </span>
          </div>

          <button
            onClick={onOpenScratchpad}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <PenTool className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            Lousa Flutuante
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {problem.title}
        </h2>

        {/* Statement Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl my-3">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            Enunciado da Questão:
          </span>
          <MathView math={problem.statement} block={true} className="text-slate-900 dark:text-slate-100 text-base" />
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('solver')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'solver'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-transparent'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Resolução Passo a Passo ({totalSteps} Etapas)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interpretation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'interpretation'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            Como Interpretar & Saber Fazer
            {problem.interpretationGuide && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'formula'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            Formulário da Questão & Como Usá-lo
            {problem.formulaGuide && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                : currentStepIndex >= totalSteps
                ? 'bg-gradient-to-r from-purple-950/80 to-indigo-950/80 text-purple-200 hover:text-white border-2 border-purple-500/60 shadow-md shadow-purple-900/20'
                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-transparent'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${currentStepIndex >= totalSteps ? 'text-purple-300 animate-pulse' : 'text-purple-400'}`} />
            <span>Gráfico da Resposta (2D & 3D)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
              currentStepIndex >= totalSteps
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-sm animate-bounce'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {currentStepIndex >= totalSteps ? '✨ 2D & 3D Pronto!' : '2D / 3D'}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interpretation Guide */}
      {activeTab === 'interpretation' && (
        <div className="p-4 sm:p-6 space-y-4">
          <QuestionInterpretationCard guide={problem.interpretationGuide} defaultExpanded={true} />
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('solver')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              Ir para Resolução Prática
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Formula Guide */}
      {activeTab === 'formula' && (
        <div className="p-4 sm:p-6 space-y-4">
          <QuestionFormulaGuideCard guide={problem.formulaGuide} defaultExpanded={true} />
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('solver')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              Aplicar Fórmulas na Resolução
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Solution Graph Visualizer 2D / 3D */}
      {activeTab === 'graph' && (
        <div className="p-4 sm:p-6 space-y-4">
          <SolutionGraphVisualizer
            problemTitle={problem.title}
            finalSolutionLatex={problem.finalSolutionLatex}
            statement={problem.statement}
            category={problem.category}
            initialMode={graphMode}
          />
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('solver')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              Voltar à Resolução do Exercício
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Interactive Step-by-Step Solver */}
      {activeTab === 'solver' && (
        <>
          {/* Quick Guide Previews if available */}
          <div className="p-4 sm:p-6 pb-0 grid grid-cols-1 md:grid-cols-2 gap-3">
            {problem.interpretationGuide && (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px] sm:max-w-[280px]">
                    {problem.interpretationGuide.objective}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('interpretation')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
                >
                  Ver Guia
                </button>
              </div>
            )}

            {problem.formulaGuide && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px] sm:max-w-[280px]">
                    {problem.formulaGuide.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('formula')}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                >
                  Ver Fórmulas
                </button>
              </div>
            )}
          </div>

          {/* Steps Progress Bar */}
          <div className="px-4 sm:px-6 py-3 bg-slate-100/80 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto mt-4">
            <div className="flex items-center gap-2">
              {problem.steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = stepStatuses[idx] === 'correct';
                const isErr = stepStatuses[idx] === 'error';

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (idx <= currentStepIndex || stepStatuses[idx] === 'correct') {
                        setCurrentStepIndex(idx);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isDone
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        : isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                        : isErr
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                        : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <span>Passo {step.stepNumber}</span>}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
              Etapa {currentStepIndex + 1} de {totalSteps}
            </span>
          </div>

          {/* Active Step Workspace */}
          <div className="p-4 sm:p-6 space-y-6">
            {!isFinished ? (
              <div className="space-y-4">
                {/* Step Instruction Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      Objetivo do Passo {currentStep.stepNumber}:
                    </div>

                    {/* Target Laplace / Signal Operator Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-300/80 dark:border-indigo-700/80 text-xs text-indigo-900 dark:text-indigo-200 font-bold shadow-2xs">
                      <span className="text-[10px] text-indigo-500 uppercase tracking-wider">Alvo:</span>
                      <MathView math={targetInfo.badgeLatex} />
                    </div>
                  </div>

                  <div className="text-slate-800 dark:text-slate-200 text-sm sm:text-base font-medium leading-relaxed">
                    <MathView math={currentStep.instruction} />
                  </div>

                  {/* Formula Helper / Definition */}
                  {currentStep.formulaHelper && (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-indigo-700 dark:text-indigo-300 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">Fórmula de Apoio Deste Passo:</span>
                      <div className="p-1 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800">
                        <MathView math={currentStep.formulaHelper} />
                      </div>
                    </div>
                  )}

                  {/* Suggested Operator Notation Insert Pill */}
                  {targetInfo.suggestedPrefix && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {targetInfo.instructionTip}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = userInputs[currentStepIndex] || '';
                          if (!currentVal.startsWith(targetInfo.suggestedPrefix)) {
                            setUserInputs({ ...userInputs, [currentStepIndex]: targetInfo.suggestedPrefix + currentVal });
                          }
                          if (inputRef.current) inputRef.current.focus();
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-300 dark:border-indigo-700/60 transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
                        title="Inserir o operador/variável formal no campo de texto"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Inserir Prefixo <strong>{targetInfo.suggestedPrefix}</strong></span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Math Keypad & Scientific Characters */}
                <MathKeypad
                  onInsert={handleInsertSymbol}
                  contextSymbols={getContextSymbolsForStep(currentStep)}
                  onClear={handleClearInput}
                  onBackspace={handleBackspaceInput}
                  currentInput={userInputs[currentStepIndex] || ''}
                />

                {/* Input & Form */}
                <form onSubmit={handleStepSubmit} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Digite sua resposta do cálculo para esta etapa ({targetInfo.label}):
                    </label>

                    {/* Action Tools for Current Step */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Undo Button (Ctrl+Z) */}
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                          canUndo
                            ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 border-sky-300 dark:border-sky-700/60 cursor-pointer active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                        }`}
                        title="Desfazer digitação ou inserção (Atalho: Ctrl+Z)"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Desfazer</span>
                      </button>

                      {/* Redo Button (Ctrl+Y) */}
                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                          canRedo
                            ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 border-sky-300 dark:border-sky-700/60 cursor-pointer active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                        }`}
                        title="Refazer digitação (Atalho: Ctrl+Y)"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                        <span>Refazer</span>
                      </button>

                      {/* Previous Step Button */}
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        disabled={currentStepIndex === 0}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                          currentStepIndex > 0
                            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 cursor-pointer active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
                        }`}
                        title="Voltar para a etapa anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Voltar Passo</span>
                      </button>

                      {/* Next Step Button */}
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={currentStepIndex >= totalSteps - 1}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
                          currentStepIndex < totalSteps - 1
                            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 cursor-pointer active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
                        }`}
                        title="Avançar para a próxima etapa"
                      >
                        <span>Avançar Passo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Paste Button */}
                      <button
                        type="button"
                        onClick={handlePasteFromClipboardToStep}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Colar texto ou cálculo da área de transferência (Ctrl+V)"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Colar</span>
                      </button>

                      {/* Copy Step Formula */}
                      <button
                        type="button"
                        onClick={handleCopyStepExpectedAnswer}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Copiar fórmula de referência desta etapa"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Copiar Fórmula</span>
                      </button>

                      {/* Open in 2D/3D Simulator */}
                      <button
                        type="button"
                        onClick={() => handleOpenSimulatorWithStepFormula()}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                        title="Simular e plotar esta etapa no gráfico 2D e superfície 3D"
                      >
                        <Boxes className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Simular no Gráfico</span>
                      </button>

                      {/* Blackboard quick launcher */}
                      <button
                        type="button"
                        onClick={() => {
                          setBlackboardInitialEquation(userInputs[currentStepIndex] || currentStep.expectedAnswer);
                          setIsBlackboardOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-700/60 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                        title="Escrever com giz digital e reconhecimento OCR por IA"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Lousa (OCR)</span>
                      </button>
                    </div>
                  </div>

                  {/* Toast Feedback for Step Copy/Paste or Undo/Redo */}
                  {(stepClipboardFeedback || undoFeedback) && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-medium animate-fade-in">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{stepClipboardFeedback || undoFeedback}</span>
                    </div>
                  )}

                  <div className="relative flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInputs[currentStepIndex] || ''}
                      onChange={(e) => {
                        updateCurrentInput(e.target.value, true);
                      }}
                      placeholder={`Ex: ${targetInfo.suggestedPrefix ? targetInfo.suggestedPrefix + '...' : currentStep.expectedAnswer}`}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Verificar
                    </button>
                  </div>

                  {/* Real-time Math Preview of typed formula with Laplace / Operator formatting */}
                  {userInputs[currentStepIndex] && (
                    <div className="p-3 bg-slate-100/90 dark:bg-slate-950/90 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center gap-2 text-xs shadow-inner">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Prévia Matemática & Interpretação:</span>
                      </div>
                      <div className="overflow-x-auto text-indigo-900 dark:text-indigo-200 font-semibold py-0.5 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <MathView
                          math={convertRawToLatexPreview(userInputs[currentStepIndex], targetInfo.suggestedPrefix)}
                        />
                      </div>
                    </div>
                  )}
                </form>

                {/* Error message */}
                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Helper Action Buttons: Hint & Teach Me */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHint({ ...showHint, [currentStepIndex]: !showHint[currentStepIndex] })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHint[currentStepIndex] ? 'Ocultar Dica' : 'Ver Dica Teórica'}
                  </button>

                  <button
                    type="button"
                    onClick={handleTeachMeStep}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    Ensinar Passo (Demonstração Guiada)
                  </button>
                </div>

                {/* Hint Box */}
                {showHint[currentStepIndex] && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-800 dark:text-amber-300">Dica da Etapa: </strong>
                      <MathView math={currentStep.hint} />
                    </div>
                  </div>
                )}

                {/* Teach Me Box */}
                {showTeachMe[currentStepIndex] && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-700/50 rounded-xl space-y-2 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                      <Sparkles className="w-4 h-4" />
                      Como resolver esta etapa passo a passo:
                    </div>
                    <p className="leading-relaxed">
                      <MathView math={currentStep.explanationOnCorrect} />
                    </p>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      Resposta formatada inserida: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentStep.expectedAnswer}</span>
                    </div>
                  </div>
                )}

                {/* Quick Scratchpad Note for this problem */}
                <div className="p-4 bg-indigo-50/50 dark:bg-slate-950/70 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl space-y-3 mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Espaço para Solucionar o Exercício (Caderno de Rascunho & Deduções):
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleInsertScratchpadTemplate}
                        className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Inserir estrutura de deduções"
                      >
                        <FileCode className="w-3 h-3 text-indigo-500" />
                        Roteiro Padrão
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowScratchpadPreview(!showScratchpadPreview)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors border flex items-center gap-1 cursor-pointer ${
                          showScratchpadPreview
                            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                        title="Alternar pré-visualização formatada de fórmulas"
                      >
                        {showScratchpadPreview ? <EyeOff className="w-3 h-3 text-sky-500" /> : <Eye className="w-3 h-3 text-sky-500" />}
                        {showScratchpadPreview ? 'Ocultar Prévia' : 'Prévia'}
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveScratchpad}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        Salvar Rascunho
                      </button>
                    </div>
                  </div>

                  {/* Math Symbols Toolbar for Scratchpad */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Símbolos:
                    </span>
                    {['ℒ{f(t)}', 'ℒ⁻¹', 'δ(t)', 'u(t)', 'ω', 'jω', 'H(s)', 'Y(s)', 'y(t)', 's', '∫', '√x', 'a/b', 'π'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleInsertSymbolToScratchpad(sym)}
                        className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 rounded border border-slate-200 dark:border-slate-700 font-sans cursor-pointer transition-colors text-[11px]"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={scratchpadNote}
                    onChange={(e) => {
                      setScratchpadNote(e.target.value);
                      setIsScratchpadSaved(false);
                    }}
                    placeholder="Anote suas contas ou deduções desta questão aqui (salvo automaticamente no seu caderno)..."
                    rows={3}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y"
                  />

                  {/* Live Math Render Preview */}
                  {showScratchpadPreview && scratchpadNote.trim() && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-900/50 space-y-1 animate-fade-in">
                      <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Pré-visualização Matemática Formatada:
                      </div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        <MathView math={scratchpadNote} />
                      </div>
                    </div>
                  )}

                  {isScratchpadSaved && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block animate-fade-in">
                      ✓ Rascunho salvo no seu caderno de estudos!
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Finished State */
              <div className="p-6 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-950 border border-emerald-200 dark:border-emerald-600/40 rounded-3xl text-center space-y-4 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  Excelente Trabalho! Exercício Concluído com Sucesso!
                </h3>

                <p className="text-slate-700 dark:text-slate-300 text-sm max-w-lg mx-auto">
                  Você completou todas as {totalSteps} etapas de cálculo guiado e acumulou{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">+{problem.xpReward} XP</strong> no seu cadastro acadêmico.
                </p>

                <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Solução Final Consolidada:
                  </span>
                  <MathView math={problem.finalSolutionLatex} block={true} className="text-emerald-700 dark:text-emerald-300 text-base" />
                </div>

                {/* Interactive 2D & 3D Solution Graph Callout & Visualizer upon Completion */}
                <div className="text-left pt-3 space-y-4">
                  {/* Standout 2D & 3D Feature Discovery Hub */}
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
                          <span>Explore Esta Resposta em Gráficos 2D e Superfície 3D</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          Veja a resposta temporal <strong className="text-sky-300">y(t)</strong>, a localização de polos no plano complexo <strong className="text-purple-300">s</strong> e gire a superfície tridimensional <strong className="text-emerald-300">|H(s)|</strong> calculada para esta solução.
                        </p>
                      </div>

                      {/* Quick Action Mode Buttons */}
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
                          onClick={() => handleOpenSimulatorWithStepFormula(problem.finalSolutionLatex)}
                          className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold rounded-2xl border border-emerald-500/40 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          title="Abrir no Simulador de Equações 2D/3D & Lousa Aberta"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>Lousa Aberta (OCR)</span>
                        </button>
                      </div>
                    </div>

                    {/* Visual capability badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-medium text-slate-300 relative z-10 border-t border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-black text-slate-400 mr-1">Modos Incluídos:</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-indigo-300 font-semibold">
                          📈 Resposta Temporal y(t)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-purple-300 font-semibold">
                          ⚡ Polos & Zeros no Plano s
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-sky-300 font-semibold">
                          🪐 Superfície 3D |H(s)| Giratória
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

                  {/* Embedded Visualizer */}
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <SolutionGraphVisualizer
                      problemId={problem.id}
                      problemTitle={`Gráfico da Resposta: ${problem.title}`}
                      finalSolutionLatex={problem.finalSolutionLatex}
                      statement={problem.statement}
                      category={problem.category}
                      initialMode={graphMode}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refazer Exercício
                  </button>
                </div>
              </div>
            )}

            {/* History of Completed Steps */}
            {currentStepIndex > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Etapas Anteriores Resolvidas:
                </h4>
                {problem.steps.slice(0, currentStepIndex).map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3 bg-slate-50/80 dark:bg-slate-950/40 border border-emerald-200 dark:border-emerald-900/30 rounded-xl flex items-start gap-3 text-xs sm:text-sm"
                  >
                    <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Passo {step.stepNumber}: <MathView math={step.instruction} />
                      </div>
                      <div className="font-mono text-emerald-700 dark:text-emerald-300">
                        Resposta: <MathView math={userInputs[idx] || step.expectedAnswer} />
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs">
                        <MathView math={step.explanationOnCorrect} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {/* Blackboard & Equation OCR Modal */}
      <EquationBlackboardModal
        isOpen={isBlackboardOpen}
        onClose={() => {
          setIsBlackboardOpen(false);
          setBlackboardInitialEquation('');
        }}
        onInsertToInput={handleInsertFromBlackboard}
        currentExerciseContext={`${problem.title} - Passo ${currentStep?.stepNumber}: ${currentStep?.instruction}`}
        initialEquation={blackboardInitialEquation}
      />
    </div>
  );
};

export default StepByStepSolver;
