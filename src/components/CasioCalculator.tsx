import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowDownToLine,
  Copy,
  ClipboardPaste,
  Check,
  Delete,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Equal,
  Binary,
  Settings,
  Grid,
  BookOpen,
  Sliders,
  Database,
  HelpCircle,
  X,
  RefreshCw,
  Layers,
  Search,
  ArrowRight,
  Cpu,
  Calculator as CalcIcon,
  Activity,
  Zap,
  History as HistoryIcon,
  Trash2,
  Share2,
  Save,
  FileSpreadsheet,
} from 'lucide-react';

interface CasioCalculatorProps {
  onInsertToAnswer: (val: string) => void;
  contextSymbols?: string[];
  currentStepExpected?: string;
  className?: string;
}

export type NumberBase = 'DEC' | 'HEX' | 'BIN' | 'OCT';
export type AngleUnit = 'RAD' | 'DEG' | 'GRA';
export type InputOutputFormat = 'MathI/MathO' | 'MathI/DecimalO' | 'LineI/LineO' | 'LineI/DecimalO';
export type NumberFormatType = 'Norm1' | 'Norm2' | 'Fix' | 'Sci' | 'Eng';
export type FractionResultFormat = 'Mixed' | 'Improper';
export type ComplexFormat = 'Rectangular' | 'Polar';
export type ActiveApp = 'calculate' | 'baseN' | 'complex' | 'equation' | 'matrix' | 'table' | 'signals';

interface CalculationHistoryItem {
  id?: string;
  input: string;
  result: string;
  base: NumberBase;
  timestamp: number;
}

interface MemoryVariables {
  M: string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  x: string;
  y: string;
  z: string;
}

// Convert LaTeX or natural formulas to executable math string
function sanitizeFormulaInput(rawText: string): string {
  let s = rawText.trim();
  if (!s) return '';

  // Remove LaTeX wrappers if present
  s = s.replace(/^\$\$|\$\$$|^\$|\$$/g, '');

  // LaTeX fractions: \frac{a}{b} -> ((a)/(b))
  while (/\\frac\{([^{}]+)\}\{([^{}]+)\}/.test(s)) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  }

  // LaTeX roots: \sqrt[3]{x} -> cbrt(x), \sqrt{x} -> sqrt(x)
  s = s.replace(/\\sqrt\[3\]\{([^{}]+)\}/g, 'cbrt($1)');
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');

  // LaTeX symbols & functions
  s = s.replace(/\\cdot|\\times/g, '*');
  s = s.replace(/\\pi\b/g, 'pi');
  s = s.replace(/\\sin\b/g, 'sin');
  s = s.replace(/\\cos\b/g, 'cos');
  s = s.replace(/\\tan\b/g, 'tan');
  s = s.replace(/\\ln\b/g, 'ln');
  s = s.replace(/\\log\b/g, 'log');
  s = s.replace(/\\exp\b/g, 'exp');
  s = s.replace(/\\omega\b/g, 'w');
  s = s.replace(/\\theta\b/g, 'theta');
  s = s.replace(/\\sigma\b/g, 'sigma');
  s = s.replace(/\\tau\b/g, 'tau');
  s = s.replace(/\\left\(|\\right\)/g, (m) => (m === '\\left(' ? '(' : ')'));
  s = s.replace(/\\left\[|\\right\]/g, (m) => (m === '\\left[' ? '(' : ')'));
  s = s.replace(/\{([^{}]+)\}/g, '($1)');

  // Normalize operators
  s = s.replace(/[×✕]/g, '*');
  s = s.replace(/[÷]/g, '/');
  s = s.replace(/[−–—]/g, '-');

  return s;
}

/**
 * Pre-processes mathematical expressions to insert implicit multiplications
 */
function parseImplicitMultiplication(expr: string): string {
  let s = expr;

  // 1. Number or Ans or pi/π/e followed by (
  s = s.replace(/(\d+|Ans|π|pi|e)\s*\(/g, '$1*(');

  // 2. ) followed by (
  s = s.replace(/\)\s*\(/g, ')*(');

  // 3. ) followed by number, variable, constant, or function name
  s = s.replace(/\)\s*(\d+|[a-df-zA-DF-Zπ]|Ans)/g, ')*$1');

  // 4. Number followed by function name or constant/variable
  s = s.replace(/(\d+)\s*(sqrt|cbrt|sin|cos|tan|arcsin|arccos|arctan|ln|log|exp|pi|π|Ans|[a-df-zA-DF-Z])/g, (match, p1, p2) => {
    return `${p1}*${p2}`;
  });

  // 5. Constant (pi, π, e) followed by variable, function, or number
  s = s.replace(/(π|pi)\s*([a-zA-Z0-9(])/g, '$1*$2');

  return s;
}

/**
 * Helper to convert integer numbers between bases
 */
function convertBase(valStr: string, fromBase: NumberBase, toBase: NumberBase): string {
  const clean = valStr.trim().replace(/^0x|^0b|^0o/i, '');
  if (!clean) return '0';

  let radixFrom = 10;
  if (fromBase === 'HEX') radixFrom = 16;
  if (fromBase === 'BIN') radixFrom = 2;
  if (fromBase === 'OCT') radixFrom = 8;

  let parsed = parseInt(clean, radixFrom);
  if (Number.isNaN(parsed)) {
    parsed = parseFloat(clean);
  }
  if (Number.isNaN(parsed)) return '---';

  const intVal = Math.trunc(parsed);

  if (toBase === 'HEX') return intVal.toString(16).toUpperCase();
  if (toBase === 'BIN') {
    const rawBin = (intVal >>> 0).toString(2);
    const padded = rawBin.padStart(Math.ceil(rawBin.length / 4) * 4 || 4, '0');
    return padded.match(/.{1,4}/g)?.join(' ') || rawBin;
  }
  if (toBase === 'OCT') return intVal.toString(8);
  return intVal.toString(10);
}

export const CasioCalculator: React.FC<CasioCalculatorProps> = ({
  onInsertToAnswer,
  contextSymbols = [],
  className = '',
}) => {
  // --- Input and Cursor State ---
  const [calcInput, setCalcInput] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [calcResult, setCalcResult] = useState<string>('');
  const [ansValue, setAnsValue] = useState<string>('0');
  const [preAnsValue, setPreAnsValue] = useState<string>('0');

  // --- Active Application & Modifiers ---
  const [activeApp, setActiveApp] = useState<ActiveApp>('calculate');
  const [activeBase, setActiveBase] = useState<NumberBase>('DEC');
  const [shiftActive, setShiftActive] = useState<boolean>(false);
  const [alphaActive, setAlphaActive] = useState<boolean>(false);

  // --- Casio Setup / Settings Config ---
  const [inputOutputFormat, setInputOutputFormat] = useState<InputOutputFormat>('MathI/MathO');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('RAD');
  const [numberFormat, setNumberFormat] = useState<NumberFormatType>('Norm1');
  const [fixDigits, setFixDigits] = useState<number>(2);
  const [sciDigits, setSciDigits] = useState<number>(4);
  const [fractionResultFormat, setFractionResultFormat] = useState<FractionResultFormat>('Improper');
  const [complexFormat, setComplexFormat] = useState<ComplexFormat>('Rectangular');
  const [decimalMark, setDecimalMark] = useState<'.' | ','>('.');
  const [digitSeparator, setDigitSeparator] = useState<boolean>(false);
  const [contrastLevel, setContrastLevel] = useState<number>(5); // 1 to 10
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // --- Modals State ---
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHomeModal, setShowHomeModal] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [showToolsModal, setShowToolsModal] = useState<boolean>(false);
  const [showVariableModal, setShowVariableModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pasteModalInput, setPasteModalInput] = useState<string>('');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [memoryNotification, setMemoryNotification] = useState<string | null>(null);

  // --- Memory Variables (M, A, B, C, D, E, F, x, y, z) ---
  const [variables, setVariables] = useState<MemoryVariables>({
    M: '0',
    A: '0',
    B: '0',
    C: '0',
    D: '0',
    E: '0',
    F: '0',
    x: '0',
    y: '0',
    z: '0',
  });

  // --- History & Replay ---
  const [history, setHistory] = useState<CalculationHistoryItem[]>([
    { id: '1', input: '3*(2)^2 + 4', result: '16', base: 'DEC', timestamp: Date.now() - 60000 },
    { id: '2', input: 'e^(-2*t)*cos(4*t)', result: 'e^(-2*t)*cos(4*t)', base: 'DEC', timestamp: Date.now() - 30000 },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [savedDraft, setSavedDraft] = useState<string>('');

  // --- Feedback ---
  const [copiedState, setCopiedState] = useState<'none' | 'input' | 'result' | 'sent' | 'pasted'>('none');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const displayRef = useRef<HTMLDivElement>(null);
  const pasteInputRef = useRef<HTMLTextAreaElement>(null);

  // Ensure cursor is within bounds
  useEffect(() => {
    if (cursorPos > calcInput.length) {
      setCursorPos(calcInput.length);
    }
  }, [calcInput, cursorPos]);

  useEffect(() => {
    if (showPasteModal && pasteInputRef.current) {
      pasteInputRef.current.focus();
    }
  }, [showPasteModal]);

  // WebAudio Beep
  const playBeep = (freq: number = 880, duration: number = 0.02) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Format numbers according to Casio Setup rules
  const formatResultNumber = (num: number): string => {
    if (Number.isNaN(num)) return 'Error';
    if (!Number.isFinite(num)) return num > 0 ? '∞' : '-∞';

    if (numberFormat === 'Fix') {
      return num.toFixed(fixDigits);
    }
    if (numberFormat === 'Sci') {
      return num.toExponential(sciDigits);
    }
    if (numberFormat === 'Eng') {
      const exp = Math.floor(Math.log10(Math.abs(num || 1)));
      const engExp = Math.floor(exp / 3) * 3;
      const mantissa = num / Math.pow(10, engExp);
      return `${parseFloat(mantissa.toFixed(4))}×10^(${engExp})`;
    }
    if (numberFormat === 'Norm1') {
      if (Math.abs(num) > 0 && (Math.abs(num) < 1e-2 || Math.abs(num) >= 1e10)) {
        return num.toExponential(4);
      }
    } else if (numberFormat === 'Norm2') {
      if (Math.abs(num) > 0 && (Math.abs(num) < 1e-9 || Math.abs(num) >= 1e10)) {
        return num.toExponential(4);
      }
    }

    // Default clean float
    const rounded = parseFloat(num.toPrecision(10));
    let str = rounded.toString();
    if (decimalMark === ',') {
      str = str.replace('.', ',');
    }
    return str;
  };

  // Safe Calculator Evaluator
  const evaluateExpression = (rawExpr: string) => {
    const expr = rawExpr.trim();
    if (!expr) {
      setCalcResult('');
      return;
    }

    try {
      // 1. BASE-N MODE
      if (activeApp === 'baseN' || activeBase !== 'DEC' || /\b(AND|OR|XOR|NOT|XNOR|NAND|<<|>>)\b/.test(expr)) {
        let bitwiseExpr = expr;
        let radix = 10;
        if (activeBase === 'HEX') radix = 16;
        if (activeBase === 'BIN') radix = 2;
        if (activeBase === 'OCT') radix = 8;

        if (/^[0-9A-Fa-f]+$/.test(bitwiseExpr) && activeBase !== 'DEC') {
          const num = parseInt(bitwiseExpr, radix);
          if (!Number.isNaN(num)) {
            const formatted =
              activeBase === 'HEX'
                ? num.toString(16).toUpperCase()
                : activeBase === 'BIN'
                ? num.toString(2)
                : activeBase === 'OCT'
                ? num.toString(8)
                : num.toString(10);

            setPreAnsValue(ansValue);
            setCalcResult(formatted);
            setAnsValue(num.toString(10));
            addToHistory(expr, formatted, activeBase);
            return;
          }
        }

        bitwiseExpr = bitwiseExpr
          .replace(/\bAND\b/g, '&')
          .replace(/\bOR\b/g, '|')
          .replace(/\bXOR\b/g, '^')
          .replace(/\bNOT\s*\(([^)]+)\)/g, '(~$1)')
          .replace(/\bNOT\s*([0-9a-fA-F]+)/g, '(~$1)')
          .replace(/\bXNOR\b/g, '^ ~')
          .replace(/\bNAND\b/g, '& ~')
          .replace(/\bAns\b/g, `(${ansValue || '0'})`);

        if (activeBase === 'HEX') {
          bitwiseExpr = bitwiseExpr.replace(/\b([0-9A-Fa-f]+)\b/g, (m) => (/^[0-9]+$/.test(m) ? m : `0x${m}`));
        } else if (activeBase === 'BIN') {
          bitwiseExpr = bitwiseExpr.replace(/\b([01]+)\b/g, '0b$1');
        } else if (activeBase === 'OCT') {
          bitwiseExpr = bitwiseExpr.replace(/\b([0-7]+)\b/g, '0o$1');
        }

        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const intRes = Function(`"use strict"; return (${bitwiseExpr});`)();
        if (typeof intRes === 'number' && !Number.isNaN(intRes)) {
          const intVal = Math.trunc(intRes);
          let formatted = intVal.toString(10);
          if (activeBase === 'HEX') formatted = (intVal >>> 0).toString(16).toUpperCase();
          else if (activeBase === 'BIN') formatted = (intVal >>> 0).toString(2);
          else if (activeBase === 'OCT') formatted = (intVal >>> 0).toString(8);

          setPreAnsValue(ansValue);
          setCalcResult(formatted);
          setAnsValue(intVal.toString(10));
          addToHistory(expr, formatted, activeBase);
          return;
        }
      }

      // 2. STANDARD SCIENTIFIC EVALUATION
      let sanitized = parseImplicitMultiplication(expr);
      sanitized = sanitized
        .replace(/\bPreAns\b/g, `(${preAnsValue || '0'})`)
        .replace(/\bAns\b/g, `(${ansValue || '0'})`);

      // Replace Memory Variables A-F, x, y, z if in standard calculation mode
      if (activeApp === 'calculate') {
        Object.entries(variables).forEach(([k, v]) => {
          if (v && v !== '0') {
            const regex = new RegExp(`\\b${k}\\b`, 'g');
            sanitized = sanitized.replace(regex, `(${v})`);
          }
        });
      }

      sanitized = sanitized
        .replace(/π|pi/g, `${Math.PI}`)
        .replace(/\be\b/g, `${Math.E}`)
        .replace(/(\d+)\s*\*\s*10\^/g, '$1e')
        .replace(/10\^([0-9.-]+)/g, 'Math.pow(10, $1)')
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/cbrt\(([^)]+)\)/g, 'Math.cbrt($1)')
        .replace(/ln\(([^)]+)\)/g, 'Math.log($1)')
        .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
        .replace(/\^/g, '**');

      // Angle unit conversions for trigonometric functions
      const toRad = (arg: string) => {
        if (angleUnit === 'DEG') return `((${arg}) * Math.PI / 180)`;
        if (angleUnit === 'GRA') return `((${arg}) * Math.PI / 200)`;
        return `(${arg})`;
      };

      const fromRad = (arg: string) => {
        if (angleUnit === 'DEG') return `((${arg}) * 180 / Math.PI)`;
        if (angleUnit === 'GRA') return `((${arg}) * 200 / Math.PI)`;
        return `(${arg})`;
      };

      sanitized = sanitized
        .replace(/sin\(([^)]+)\)/g, (_, a) => `Math.sin(${toRad(a)})`)
        .replace(/cos\(([^)]+)\)/g, (_, a) => `Math.cos(${toRad(a)})`)
        .replace(/tan\(([^)]+)\)/g, (_, a) => `Math.tan(${toRad(a)})`)
        .replace(/arcsin\(([^)]+)\)/g, (_, a) => fromRad(`Math.asin(${a})`))
        .replace(/arccos\(([^)]+)\)/g, (_, a) => fromRad(`Math.acos(${a})`))
        .replace(/arctan\(([^)]+)\)/g, (_, a) => fromRad(`Math.atan(${a})`));

      // Check for symbolic mathematical variables (s, t, w, j, H(s), etc.)
      const withoutMath = sanitized.replace(/Math\.[a-zA-Z0-9]+/g, '');
      if (/[a-df-zA-DF-Z]/.test(withoutMath) && activeApp === 'signals') {
        setPreAnsValue(ansValue);
        setCalcResult(expr);
        setAnsValue(expr);
        addToHistory(expr, expr, activeBase);
        return;
      }

      // Safe JS evaluation
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const result = Function(`"use strict"; return (${sanitized});`)();

      if (typeof result === 'number' && !Number.isNaN(result)) {
        const formatted = formatResultNumber(result);
        setPreAnsValue(ansValue);
        setCalcResult(formatted);
        setAnsValue(result.toString());
        addToHistory(expr, formatted, activeBase);
      } else {
        setCalcResult(String(result));
        addToHistory(expr, String(result), activeBase);
      }
    } catch {
      setCalcResult(expr);
      setAnsValue(expr);
    }
  };

  const addToHistory = (input: string, result: string, base: NumberBase) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.input !== input);
      return [{ id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, input, result, base, timestamp: Date.now() }, ...filtered].slice(0, 50);
    });
    setHistoryIndex(-1);
    setSavedDraft('');
  };

  // ----------------------------------------------------
  // CASIO MEMORY SYSTEM (M, M+, M-, MR, MC, STO, RCL)
  // ----------------------------------------------------

  const triggerMemoryNotice = (msg: string) => {
    setMemoryNotification(msg);
    setTimeout(() => setMemoryNotification(null), 2000);
  };

  const handleMPlus = () => {
    playBeep(920, 0.03);
    const targetVal = parseFloat(ansValue || calcResult || '0');
    if (Number.isNaN(targetVal)) {
      triggerMemoryNotice('Erro: valor não numérico');
      return;
    }
    const currentM = parseFloat(variables.M || '0');
    const newM = (Number.isNaN(currentM) ? 0 : currentM) + targetVal;
    const roundedM = parseFloat(newM.toPrecision(10)).toString();
    setVariables((prev) => ({ ...prev, M: roundedM }));
    triggerMemoryNotice(`M+ [M = ${roundedM}]`);
  };

  const handleMMinus = () => {
    playBeep(880, 0.03);
    const targetVal = parseFloat(ansValue || calcResult || '0');
    if (Number.isNaN(targetVal)) {
      triggerMemoryNotice('Erro: valor não numérico');
      return;
    }
    const currentM = parseFloat(variables.M || '0');
    const newM = (Number.isNaN(currentM) ? 0 : currentM) - targetVal;
    const roundedM = parseFloat(newM.toPrecision(10)).toString();
    setVariables((prev) => ({ ...prev, M: roundedM }));
    triggerMemoryNotice(`M- [M = ${roundedM}]`);
  };

  const handleClearMemoryM = () => {
    playBeep(600, 0.03);
    setVariables((prev) => ({ ...prev, M: '0' }));
    triggerMemoryNotice('Memória M limpa (M = 0)');
  };

  const handleClearAllMemory = () => {
    playBeep(500, 0.04);
    setVariables({
      M: '0',
      A: '0',
      B: '0',
      C: '0',
      D: '0',
      E: '0',
      F: '0',
      x: '0',
      y: '0',
      z: '0',
    });
    triggerMemoryNotice('Todas as memórias foram limpas!');
  };

  const handleStoreVariable = (varKey: keyof MemoryVariables, val?: string) => {
    playBeep(980, 0.025);
    const targetVal = val || ansValue || calcResult || calcInput || '0';
    setVariables((prev) => ({ ...prev, [varKey]: targetVal }));
    triggerMemoryNotice(`STO: ${varKey} = ${targetVal}`);
  };

  const handleRecallVariable = (varKey: keyof MemoryVariables) => {
    playBeep(850, 0.02);
    const val = variables[varKey] || '0';
    setCalcInput((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + val + after;
    });
    setCursorPos((prev) => prev + val.length);
    triggerMemoryNotice(`RCL: ${varKey} (${val}) inserido`);
  };

  // Keyboard Insert Handler
  const handleKey = useCallback(
    (primaryVal: string, shiftVal?: string, alphaVal?: string) => {
      let toInsert = primaryVal;
      let freq = 750;

      if (shiftActive && shiftVal) {
        toInsert = shiftVal;
        setShiftActive(false);
        freq = 980;
      } else if (alphaActive && alphaVal) {
        toInsert = alphaVal;
        setAlphaActive(false);
        freq = 860;
      } else {
        if (shiftActive) setShiftActive(false);
        if (alphaActive) setAlphaActive(false);
      }

      playBeep(freq, 0.02);

      setCalcInput((prev) => {
        const before = prev.slice(0, cursorPos);
        const after = prev.slice(cursorPos);
        return before + toInsert + after;
      });
      setCursorPos((prev) => prev + toInsert.length);
    },
    [shiftActive, alphaActive, cursorPos, soundEnabled]
  );

  // ----------------------------------------------------
  // ARROW REPLAY & NAVIGATION HANDLERS (▲, ▼, ◀, ▶)
  // ----------------------------------------------------

  const handleMoveUp = () => {
    playBeep(800, 0.02);
    if (history.length === 0) return;

    if (historyIndex === -1) {
      setSavedDraft(calcInput);
      const nextIdx = 0;
      setHistoryIndex(nextIdx);
      setCalcInput(history[nextIdx].input);
      setCursorPos(history[nextIdx].input.length);
      setCalcResult(history[nextIdx].result);
    } else if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCalcInput(history[nextIdx].input);
      setCursorPos(history[nextIdx].input.length);
      setCalcResult(history[nextIdx].result);
    }
  };

  const handleMoveDown = () => {
    playBeep(800, 0.02);
    if (historyIndex === -1) return;

    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setCalcInput(history[nextIdx].input);
      setCursorPos(history[nextIdx].input.length);
      setCalcResult(history[nextIdx].result);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setCalcInput(savedDraft);
      setCursorPos(savedDraft.length);
      setCalcResult('');
    }
  };

  const handleMoveLeft = () => {
    playBeep(680, 0.015);
    setCursorPos((prev) => Math.max(0, prev - 1));
  };

  const handleMoveRight = () => {
    playBeep(680, 0.015);
    setCursorPos((prev) => Math.min(calcInput.length, prev + 1));
  };

  const handleMoveHome = () => {
    playBeep(820, 0.02);
    setCursorPos(0);
  };

  const handleMoveEnd = () => {
    playBeep(820, 0.02);
    setCursorPos(calcInput.length);
  };

  const handleClearAll = () => {
    playBeep(450, 0.035);
    setCalcInput('');
    setCursorPos(0);
    setCalcResult('');
    setShiftActive(false);
    setAlphaActive(false);
    setHistoryIndex(-1);
    setSavedDraft('');
  };

  const handleBackspace = () => {
    playBeep(540, 0.02);
    setShiftActive(false);
    setAlphaActive(false);
    if (cursorPos === 0) return;
    const before = calcInput.slice(0, cursorPos - 1);
    const after = calcInput.slice(cursorPos);
    setCalcInput(before + after);
    setCursorPos(cursorPos - 1);
  };

  const handleExe = () => {
    playBeep(1180, 0.035);
    setShiftActive(false);
    setAlphaActive(false);
    evaluateExpression(calcInput);
  };

  // FORMAT / S<=>D (Convert between Decimal, Fraction, Scientific, Sexagesimal)
  const handleFormatConvert = () => {
    playBeep(920, 0.025);
    if (!calcResult && !ansValue) return;
    const current = parseFloat(ansValue || calcResult);
    if (Number.isNaN(current)) return;

    // Toggle between Decimal, Scientific and Fractional representations
    if (numberFormat === 'Norm1' || numberFormat === 'Norm2') {
      setNumberFormat('Sci');
      setCalcResult(current.toExponential(sciDigits));
    } else if (numberFormat === 'Sci') {
      setNumberFormat('Eng');
      const exp = Math.floor(Math.log10(Math.abs(current || 1)));
      const engExp = Math.floor(exp / 3) * 3;
      const mantissa = current / Math.pow(10, engExp);
      setCalcResult(`${parseFloat(mantissa.toFixed(4))}×10^(${engExp})`);
    } else {
      setNumberFormat('Norm1');
      setCalcResult(current.toString());
    }
  };

  // ----------------------------------------------------
  // COPY & PASTE FUNCTIONALITY
  // ----------------------------------------------------

  const handlePasteClipboard = async () => {
    playBeep(900, 0.03);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          pasteTextAtCursor(text);
          setCopiedState('pasted');
          setTimeout(() => setCopiedState('none'), 1500);
          return;
        }
      }
    } catch {
      // Clipboard restricted
    }
    setPasteModalInput('');
    setShowPasteModal(true);
  };

  const pasteTextAtCursor = (rawText: string) => {
    const sanitized = sanitizeFormulaInput(rawText);
    if (!sanitized) return;
    const before = calcInput.slice(0, cursorPos);
    const after = calcInput.slice(cursorPos);
    setCalcInput(before + sanitized + after);
    setCursorPos(cursorPos + sanitized.length);
    setShowPasteModal(false);
    setCopiedState('pasted');
    setTimeout(() => setCopiedState('none'), 1500);
  };

  const handleCopyClipboard = (text: string, type: 'input' | 'result') => {
    if (!text) return;
    playBeep(950, 0.02);
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Fallback
    }
    setCopiedState(type);
    setTimeout(() => setCopiedState('none'), 1500);
  };

  const handleSendToAnswer = (valToSend?: string) => {
    const target = valToSend || calcResult || calcInput;
    if (!target) return;
    playBeep(1300, 0.04);
    onInsertToAnswer(target);
    setCopiedState('sent');
    setTimeout(() => setCopiedState('none'), 1800);
  };

  const handleSelectBase = (newBase: NumberBase) => {
    playBeep(880, 0.02);
    setActiveBase(newBase);
    if (calcResult && !Number.isNaN(parseFloat(ansValue))) {
      const converted = convertBase(ansValue, 'DEC', newBase);
      setCalcResult(converted);
    }
  };

  // Simultaneous multi-base values
  const simultaneousBases = useMemo(() => {
    const raw = ansValue || calcResult || calcInput || '0';
    return {
      DEC: convertBase(raw, activeBase, 'DEC'),
      HEX: convertBase(raw, activeBase, 'HEX'),
      BIN: convertBase(raw, activeBase, 'BIN'),
      OCT: convertBase(raw, activeBase, 'OCT'),
    };
  }, [ansValue, calcResult, calcInput, activeBase]);

  // Catalog items
  const catalogCategories = useMemo(
    () => [
      {
        id: 'algebra',
        title: 'Álgebra & Análise',
        items: [
          { name: 'sqrt(x)', insert: 'sqrt(', desc: 'Raiz quadrada' },
          { name: 'cbrt(x)', insert: 'cbrt(', desc: 'Raiz cúbica' },
          { name: 'x^y', insert: '^', desc: 'Exponenciação' },
          { name: 'log(x)', insert: 'log(', desc: 'Logaritmo na base 10' },
          { name: 'ln(x)', insert: 'ln(', desc: 'Logaritmo natural (base e)' },
          { name: 'e^x', insert: 'e^(', desc: 'Exponencial de Euler' },
          { name: 'abs(x)', insert: 'abs(', desc: 'Módulo / Valor absoluto' },
        ],
      },
      {
        id: 'trig',
        title: 'Trigonometria & Ângulos',
        items: [
          { name: 'sin(x)', insert: 'sin(', desc: 'Seno' },
          { name: 'cos(x)', insert: 'cos(', desc: 'Cosseno' },
          { name: 'tan(x)', insert: 'tan(', desc: 'Tangente' },
          { name: 'arcsin(x)', insert: 'arcsin(', desc: 'Arco seno (sin⁻¹)' },
          { name: 'arccos(x)', insert: 'arccos(', desc: 'Arco cosseno (cos⁻¹)' },
          { name: 'arctan(x)', insert: 'arctan(', desc: 'Arco tangente (tan⁻¹)' },
          { name: 'pi (π)', insert: 'pi', desc: 'Constante Pi = 3.14159265...' },
        ],
      },
      {
        id: 'signals',
        title: 'Sinais, Sistemas & Laplace',
        items: [
          { name: 'ℒ{f(t)}', insert: 'L{', desc: 'Transformada de Laplace' },
          { name: 'ℒ⁻¹{F(s)}', insert: 'L^-1{', desc: 'Laplace Inversa' },
          { name: 'u(t)', insert: 'u(t)', desc: 'Degrau Unitário de Heaviside' },
          { name: 'δ(t)', insert: 'delta(t)', desc: 'Impulso de Dirac' },
          { name: 'H(s)', insert: 'H(s)', desc: 'Função de Transferência' },
          { name: 'e^(-a*t)', insert: 'e^(-a*t)', desc: 'Decaimento Exponencial' },
          { name: 'jω', insert: 'j*w', desc: 'Frequência Complexa Imaginária' },
          { name: 's^2 + 2ζωn*s + ωn^2', insert: 's^2 + 2*zeta*w_n*s + w_n^2', desc: 'Polinômio Característico 2ª Ordem' },
        ],
      },
      {
        id: 'baseN',
        title: 'Operações Base-N & Bitwise',
        items: [
          { name: 'AND', insert: ' AND ', desc: 'Bitwise E lógico (&)' },
          { name: 'OR', insert: ' OR ', desc: 'Bitwise OU lógico (|)' },
          { name: 'XOR', insert: ' XOR ', desc: 'Bitwise OU Exclusivo (^)' },
          { name: 'NOT(x)', insert: 'NOT(', desc: 'Bitwise Inversão / Negação (~)' },
          { name: '<< (LSH)', insert: ' << ', desc: 'Deslocamento de bits à esquerda' },
          { name: '>> (RSH)', insert: ' >> ', desc: 'Deslocamento de bits à direita' },
        ],
      },
    ],
    []
  );

  return (
    <div
      id="casio-scientific-calculator"
      className={`w-full max-w-xl mx-auto select-none rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 border-2 border-slate-700/80 shadow-2xl relative text-slate-100 font-sans ${className}`}
    >
      {/* 1. CASIO BRANDING & MODERN TOP CONTROL BAR */}
      <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm sm:text-base font-black tracking-widest text-slate-50 uppercase">
            CASIO
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/90 text-sky-300 border border-slate-700 tracking-wider">
            ClassWiz fx-991CW 2026
          </span>
          <span className="text-[9px] text-amber-300 font-mono font-bold px-1.5 py-0.5 bg-amber-950/70 rounded border border-amber-700/70">
            {activeApp === 'baseN' ? `BASE-${activeBase}` : activeApp.toUpperCase()}
          </span>
        </div>

        {/* Top Action Icons: Sound, Settings, Manual */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-amber-300 transition-colors rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer"
            title={soundEnabled ? 'Desativar som eletrônico' : 'Ativar som de tecla eletrônico'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowManualModal(true)}
            className="p-1.5 text-slate-300 hover:text-emerald-300 transition-colors rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Manual e Guia de Uso da Calculadora Casio"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Manual</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 text-slate-300 hover:text-sky-300 transition-colors rounded-xl bg-slate-800/80 border border-slate-700 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
            title="Configurações Casio (SETUP / Calc & System Settings)"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Setup</span>
          </button>
        </div>
      </div>

      {/* 2. FUNCTIONAL NAV BUTTONS (HOME, SETTINGS, CATALOG, TOOLS, VARIABLE, HISTORY, FORMAT) */}
      <div className="grid grid-cols-7 gap-1 my-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowHomeModal(true)}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="HOME: Escolher Aplicativo (Calculate, Base-N, Complex, Matrix, etc.)"
        >
          <Grid className="w-3 h-3 text-sky-400 mb-0.5" />
          <span>HOME</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowSettingsModal(true)}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="SETTINGS: Configurações de Formato, Ângulo e Sistema"
        >
          <Sliders className="w-3 h-3 text-amber-400 mb-0.5" />
          <span>SETUP</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowCatalogModal(true)}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="CATALOG: Catálogo completo de funções e comandos matemáticos"
        >
          <BookOpen className="w-3 h-3 text-indigo-400 mb-0.5" />
          <span>CATALOG</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowToolsModal(true)}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="TOOLS: Ferramentas do aplicativo atual"
        >
          <Zap className="w-3 h-3 text-emerald-400 mb-0.5" />
          <span>TOOLS</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowVariableModal(true)}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="VARIABLE: Memória de Registradores (M, A, B, C, D, E, F, x, y, z)"
        >
          <Database className="w-3 h-3 text-rose-400 mb-0.5" />
          <span>MEMORY</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowHistoryModal(true)}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="HISTORY: Histórico de Cálculos anteriores e Replay"
        >
          <HistoryIcon className="w-3 h-3 text-amber-400 mb-0.5" />
          <span>HISTÓRICO</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleFormatConvert}
          className="py-1 px-0.5 rounded-xl text-[9px] sm:text-[10px] font-extrabold flex flex-col items-center justify-center bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-600/80 text-purple-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="FORMAT / S<=>D: Converter entre Decimal, Fração, Científica e Engenharia"
        >
          <RefreshCw className="w-3 h-3 text-purple-300 mb-0.5" />
          <span>FORMAT</span>
        </button>
      </div>

      {/* 3. CASIO CLASSWIZ HIGH-CONTRAST LCD DISPLAY */}
      <div
        style={{ filter: `contrast(${0.8 + contrastLevel * 0.05})` }}
        className="my-2 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#8ea38f] to-[#798e7b] dark:from-[#1b2b1f] dark:to-[#131f17] border-2 border-[#47574a] dark:border-[#2d4233] shadow-inner font-mono text-slate-950 dark:text-emerald-300 relative transition-all"
      >
        {/* Memory Notification Toast banner */}
        {memoryNotification && (
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-slate-950/90 text-amber-300 px-3 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/60 shadow-lg z-20 animate-in fade-in zoom-in-95">
            {memoryNotification}
          </div>
        )}

        {/* LCD Status Indicators Bar */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold tracking-wider pb-1 border-b border-black/10 dark:border-emerald-500/20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-1 py-0.2 rounded transition-all ${
                shiftActive ? 'bg-amber-500 text-black font-black shadow-xs scale-105' : 'opacity-25'
              }`}
            >
              [S] SHIFT
            </span>
            <span
              className={`px-1 py-0.2 rounded transition-all ${
                alphaActive ? 'bg-rose-500 text-white font-black shadow-xs scale-105' : 'opacity-25'
              }`}
            >
              [A] ALPHA
            </span>

            {/* M Memory Indicator */}
            <span
              className={`px-1 py-0.2 rounded transition-all ${
                variables.M && variables.M !== '0'
                  ? 'bg-rose-600 text-white font-black shadow-xs'
                  : 'opacity-20'
              }`}
              title={variables.M !== '0' ? `Memória M ativa: ${variables.M}` : 'Memória M vazia'}
            >
              [M]
            </span>

            {/* Replay History Available indicator */}
            <span
              className={`px-1 py-0.2 rounded transition-all ${
                history.length > 0 ? 'bg-sky-600 text-white font-bold' : 'opacity-20'
              }`}
              title="Histórico disponível via setas ▲ / ▼"
            >
              [▲▼]
            </span>

            <span className="bg-black/10 dark:bg-emerald-950/80 px-1 py-0.2 rounded">
              {angleUnit}
            </span>
            <span className="bg-black/10 dark:bg-emerald-950/80 px-1 py-0.2 rounded">
              {numberFormat}
            </span>
            <span className="font-extrabold px-1 rounded bg-black/15 dark:bg-emerald-950/90 text-slate-900 dark:text-amber-300">
              {activeBase}
            </span>
          </div>

          {/* Direct LCD Copy & Paste buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handlePasteClipboard}
              className="px-1.5 py-0.5 rounded bg-black/15 hover:bg-black/25 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[9px] font-bold text-slate-900 dark:text-emerald-200 flex items-center gap-0.5 border border-black/10 dark:border-emerald-700/50 shadow-xs cursor-pointer active:scale-95"
              title="Colar equação copiada direto no visor da calculadora"
            >
              <ClipboardPaste className="w-2.5 h-2.5 text-amber-600 dark:text-amber-300" />
              <span>Colar</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleCopyClipboard(calcInput, 'input')}
              disabled={!calcInput}
              className="px-1.5 py-0.5 rounded bg-black/15 hover:bg-black/25 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[9px] font-bold text-slate-900 dark:text-emerald-200 flex items-center gap-0.5 border border-black/10 dark:border-emerald-700/50 shadow-xs cursor-pointer active:scale-95"
              title="Copiar expressão do visor"
            >
              <Copy className="w-2.5 h-2.5 text-sky-700 dark:text-sky-300" />
              <span>Copiar</span>
            </button>
          </div>
        </div>

        {/* LCD Line 1: Expression Line with Real Touch & Pulsing Cursor */}
        <div
          ref={displayRef}
          onClick={(e) => {
            if (!calcInput) return;
            const rect = displayRef.current?.getBoundingClientRect();
            if (rect) {
              const clickX = e.clientX - rect.left;
              const charWidth = 9.5;
              const targetPos = Math.min(calcInput.length, Math.max(0, Math.round(clickX / charWidth)));
              setCursorPos(targetPos);
            }
          }}
          className="min-h-[30px] sm:min-h-[34px] flex items-center justify-start overflow-x-auto text-xs sm:text-sm font-semibold tracking-wide py-1 text-slate-950 dark:text-emerald-100 scrollbar-none cursor-text"
        >
          <span className="text-slate-600 dark:text-emerald-500 mr-1.5 select-none font-bold">▶</span>
          {calcInput.length === 0 ? (
            <span className="opacity-40 italic font-sans text-xs">
              Digite ou cole equações (ex: 3(2)^2, 2*pi, 0xFF, s/(s^2+4))...
            </span>
          ) : (
            <span className="whitespace-pre">
              {calcInput.slice(0, cursorPos)}
              <span className="inline-block w-1.5 sm:w-2 h-4 bg-slate-900 dark:bg-emerald-300 animate-pulse -mb-0.5 mx-px rounded-xs shadow-xs" />
              {calcInput.slice(cursorPos)}
            </span>
          )}
        </div>

        {/* LCD Line 2: Computed Result Output Line */}
        <div className="min-h-[26px] sm:min-h-[30px] flex items-center justify-between text-right pt-1 border-t border-black/10 dark:border-emerald-500/20">
          <span className="text-[10px] text-slate-700 dark:text-emerald-400/80 font-sans">
            {calcResult ? `Resultado [${activeBase}]:` : 'Pressione [EXE] para calcular'}
          </span>
          <span className="text-sm sm:text-base font-black text-slate-950 dark:text-emerald-100 tracking-wider">
            {calcResult || (ansValue !== '0' ? `Ans = ${ansValue}` : '0')}
          </span>
        </div>

        {/* LCD Line 3: Multi-Base Simultaneous Converter Preview */}
        <div className="mt-1 pt-1 border-t border-black/10 dark:border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-1 text-[9px] font-mono">
          <div
            onClick={() => handleSelectBase('DEC')}
            className={`p-0.5 px-1 rounded cursor-pointer transition-colors ${
              activeBase === 'DEC' ? 'bg-black/20 dark:bg-emerald-900/60 font-bold text-amber-800 dark:text-amber-300' : 'hover:bg-black/10'
            }`}
          >
            <span className="opacity-70">DEC:</span> {simultaneousBases.DEC}
          </div>
          <div
            onClick={() => handleSelectBase('HEX')}
            className={`p-0.5 px-1 rounded cursor-pointer transition-colors ${
              activeBase === 'HEX' ? 'bg-black/20 dark:bg-emerald-900/60 font-bold text-amber-800 dark:text-amber-300' : 'hover:bg-black/10'
            }`}
          >
            <span className="opacity-70">HEX:</span> 0x{simultaneousBases.HEX}
          </div>
          <div
            onClick={() => handleSelectBase('BIN')}
            className={`p-0.5 px-1 rounded cursor-pointer transition-colors ${
              activeBase === 'BIN' ? 'bg-black/20 dark:bg-emerald-900/60 font-bold text-amber-800 dark:text-amber-300' : 'hover:bg-black/10'
            }`}
          >
            <span className="opacity-70">BIN:</span> {simultaneousBases.BIN}
          </div>
          <div
            onClick={() => handleSelectBase('OCT')}
            className={`p-0.5 px-1 rounded cursor-pointer transition-colors ${
              activeBase === 'OCT' ? 'bg-black/20 dark:bg-emerald-900/60 font-bold text-amber-800 dark:text-amber-300' : 'hover:bg-black/10'
            }`}
          >
            <span className="opacity-70">OCT:</span> {simultaneousBases.OCT}
          </div>
        </div>
      </div>

      {/* 4. FAST ACTION BAR (PASTE, TRANSFER TO ANSWER, COPY, EXE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2 text-xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handlePasteClipboard}
          className="py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 transition-all active:scale-95 shadow-sm"
          title="Colar equação da área de transferência"
        >
          {copiedState === 'pasted' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardPaste className="w-3.5 h-3.5 text-amber-400" />}
          <span>{copiedState === 'pasted' ? 'Colado!' : 'Colar Equação'}</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleSendToAnswer(calcResult || calcInput)}
          disabled={!calcInput && !calcResult}
          className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 border ${
            copiedState === 'sent'
              ? 'bg-emerald-600 text-white border-emerald-400'
              : !calcInput && !calcResult
              ? 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400'
          }`}
          title="Transfere o resultado/expressão direto para a resposta do exercício"
        >
          {copiedState === 'sent' ? <Check className="w-3.5 h-3.5" /> : <ArrowDownToLine className="w-3.5 h-3.5" />}
          <span>{copiedState === 'sent' ? 'Transferido!' : 'Inserir na Resposta'}</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCopyClipboard(calcResult || ansValue, 'result')}
          disabled={!calcResult && ansValue === '0'}
          className={`py-1.5 px-2 rounded-xl font-medium flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all active:scale-95 ${
            !calcResult && ansValue === '0' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Copiar resultado"
        >
          {copiedState === 'result' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          <span>{copiedState === 'result' ? 'Copiado!' : 'Copiar Resultado'}</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleExe}
          className="py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 transition-all active:scale-95 shadow-md"
          title="Executar Cálculo (EXE / =)"
        >
          <Equal className="w-3.5 h-3.5" />
          <span>Calcular (EXE)</span>
        </button>
      </div>

      {/* 5. CONTEXT SYMBOLS BAR (If exercise provides specific symbols) */}
      {contextSymbols.length > 0 && (
        <div className="mb-2 p-1.5 bg-indigo-950/50 rounded-xl border border-indigo-500/40 flex flex-wrap items-center gap-1">
          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            Símbolos da Etapa:
          </span>
          {contextSymbols.map((sym, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey(sym)}
              className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-600/90 hover:bg-indigo-500 text-white rounded border border-indigo-400 shadow-xs active:scale-95"
            >
              {sym}
            </button>
          ))}
        </div>
      )}

      {/* 6. COMPLETE CASIO CLASSWIZ 4-WAY D-PAD (▲ CIMA, ▼ BAIXO, ◀ ESQ, ▶ DIR) & MODIFIERS */}
      <div className="grid grid-cols-12 gap-1 sm:gap-1.5 mb-2 items-center">
        {/* Left Side: SHIFT & ALPHA (Span 3) */}
        <div className="col-span-3 grid grid-cols-2 gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShiftActive(!shiftActive);
              if (alphaActive) setAlphaActive(false);
              playBeep(shiftActive ? 600 : 1050, 0.025);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border ${
              shiftActive
                ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 shadow-md scale-105'
                : 'bg-amber-800/80 text-amber-200 border-amber-600/80 hover:bg-amber-700'
            }`}
            title="SHIFT: Ativa segunda função amarela das teclas"
          >
            <span className="text-[8px] uppercase tracking-wider font-mono">SHIFT</span>
            <span className="text-[9px]">2nd</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setAlphaActive(!alphaActive);
              if (shiftActive) setShiftActive(false);
              playBeep(alphaActive ? 600 : 950, 0.025);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border ${
              alphaActive
                ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-400 shadow-md scale-105'
                : 'bg-rose-900/80 text-rose-200 border-rose-700/80 hover:bg-rose-800'
            }`}
            title="ALPHA: Ativa letras e registradores rosas (A, B, C, D, E, F, x, y, z)"
          >
            <span className="text-[8px] uppercase tracking-wider font-mono">ALPHA</span>
            <span className="text-[9px]">VAR</span>
          </button>
        </div>

        {/* Center: 4-WAY CASIO D-PAD REPLAY CONTROLLER (Span 6) */}
        <div className="col-span-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center justify-center relative">
          {/* UP ARROW ▲ (HISTÓRICO ANTERIOR) */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleMoveUp}
            className="w-12 h-6 rounded-t-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
            title="Histórico Anterior (▲ / REPLAY CIMA)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* MIDDLE ROW: ◀ ESQ, CENTRAL OK/EXE BUTTON, ▶ DIR */}
          <div className="flex items-center justify-between w-full px-2 gap-2 my-0.5">
            {/* LEFT ARROW ◀ */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={shiftActive ? handleMoveHome : handleMoveLeft}
              className="w-9 h-7 rounded-l-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex flex-col items-center justify-center active:scale-95 shadow-xs cursor-pointer"
              title={shiftActive ? 'Início da equação (|◀)' : 'Mover cursor para esquerda (◀)'}
            >
              {shiftActive ? <ChevronsLeft className="w-3.5 h-3.5 text-amber-400" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            {/* CENTRAL OK / EXE BUTTON */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleExe}
              className="px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-850 text-indigo-300 font-mono text-[9px] font-black border border-slate-700 flex items-center gap-0.5 cursor-pointer active:scale-95"
              title="OK / EXE: Executar ou Confirmar Seleção"
            >
              <span>OK</span>
            </button>

            {/* RIGHT ARROW ▶ */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={shiftActive ? handleMoveEnd : handleMoveRight}
              className="w-9 h-7 rounded-r-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex flex-col items-center justify-center active:scale-95 shadow-xs cursor-pointer"
              title={shiftActive ? 'Fim da equação (▶|)' : 'Mover cursor para direita (▶)'}
            >
              {shiftActive ? <ChevronsRight className="w-3.5 h-3.5 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* DOWN ARROW ▼ (HISTÓRICO SEGUINTE / RASCUNHO) */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleMoveDown}
            className="w-12 h-6 rounded-b-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
            title="Histórico Seguinte / Rascunho Atual (▼ / REPLAY BAIXO)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: DEL & ON/AC (Span 3) */}
        <div className="col-span-3 grid grid-cols-2 gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleBackspace}
            className="py-2 px-1 rounded-xl font-mono text-xs font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-700 flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-xs cursor-pointer"
            title="Apagar caractere no cursor (DEL / Backspace)"
          >
            <Delete className="w-3 h-3" />
            <span className="text-[9px]">DEL</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClearAll}
            className="py-2 px-1 rounded-xl font-mono text-xs font-black bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 cursor-pointer"
            title="Limpar tudo (AC / All Clear)"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[9px]">AC</span>
          </button>
        </div>
      </div>

      {/* 7. APP-SPECIFIC ROWS: BASE-N / PROGRAMMER VS SCIENTIFIC VS SIGNALS */}
      {activeApp === 'baseN' ? (
        <div className="space-y-1 mb-2 bg-slate-950/80 p-2.5 rounded-2xl border border-amber-800/40">
          <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono font-bold pb-1 mb-1 border-b border-slate-800">
            <span className="flex items-center gap-1">
              <Binary className="w-3 h-3 text-amber-400" />
              MODO PROGRAMADOR / BASE-N (DEC, HEX, BIN, OCT)
            </span>
            <div className="flex gap-1">
              {(['DEC', 'HEX', 'BIN', 'OCT'] as NumberBase[]).map((base) => (
                <button
                  key={base}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectBase(base)}
                  className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                    activeBase === base ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {base}
                </button>
              ))}
            </div>
          </div>

          {/* Hex Digits A-F */}
          <div className="grid grid-cols-6 gap-1">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((hexDigit) => (
              <button
                key={hexDigit}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleKey(hexDigit)}
                className="py-1.5 px-1 rounded-xl font-mono text-xs font-black bg-gradient-to-b from-rose-900 to-rose-950 text-rose-100 border border-rose-700 hover:bg-rose-800 active:scale-95 shadow-xs"
                title={`Dígito Hexadecimal ${hexDigit}`}
              >
                {hexDigit}
              </button>
            ))}
          </div>

          {/* Bitwise Logic Operators */}
          <div className="grid grid-cols-6 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey(' AND ')}
              className="py-1 px-1 rounded-lg font-mono text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-750"
            >
              AND
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey(' OR ')}
              className="py-1 px-1 rounded-lg font-mono text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-750"
            >
              OR
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey(' XOR ')}
              className="py-1 px-1 rounded-lg font-mono text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-750"
            >
              XOR
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey('NOT(')}
              className="py-1 px-1 rounded-lg font-mono text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-750"
            >
              NOT
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey(' << ')}
              className="py-1 px-1 rounded-lg font-mono text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-750"
            >
              LSH &lt;&lt;
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKey(' >> ')}
              className="py-1 px-1 rounded-lg font-mono text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-750"
            >
              RSH &gt;&gt;
            </button>
          </div>
        </div>
      ) : activeApp === 'signals' ? (
        <div className="space-y-1 mb-2 bg-slate-950/80 p-2.5 rounded-2xl border border-purple-800/40">
          <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono font-bold pb-1 mb-1 border-b border-slate-800">
            <span>SINAIS & SISTEMAS, LAPLACE & FOURIER</span>
            <span className="text-slate-400">ClassWiz Signals</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            <CasioBtn label="ℒ{·}" shiftLabel="ℒ⁻¹" alphaLabel="H(s)" primaryVal="L{" shiftVal="L^-1{" alphaVal="H(s)" onClick={handleKey} />
            <CasioBtn label="ℱ{·}" shiftLabel="ℱ⁻¹" alphaLabel="X(jω)" primaryVal="F{" shiftVal="F^-1{" alphaVal="X(j*w)" onClick={handleKey} />
            <CasioBtn label="u(t)" shiftLabel="δ(t)" alphaLabel="h(t)" primaryVal="u(t)" shiftVal="delta(t)" alphaVal="h(t)" onClick={handleKey} />
            <CasioBtn label="s" shiftLabel="1/s" alphaLabel="s+a" primaryVal="s" shiftVal="1/s" alphaVal="(s+" onClick={handleKey} />
            <CasioBtn label="e^-at" shiftLabel="e^st" alphaLabel="t" primaryVal="e^(-a*t)" shiftVal="e^(s*t)" alphaVal="t" onClick={handleKey} />
            <CasioBtn label="jω" shiftLabel="σ+jω" alphaLabel="j" primaryVal="j*w" shiftVal="sigma+j*w" alphaVal="j" onClick={handleKey} />
          </div>
        </div>
      ) : (
        /* STANDARD SCIENTIFIC KEY ROWS */
        <div className="space-y-1 mb-2">
          {/* Row 1: Fractions, Roots, Powers, Logarithms */}
          <div className="grid grid-cols-6 gap-1">
            <CasioBtn label="a/b" shiftLabel="d/dt" alphaLabel="x" primaryVal="/" shiftVal="d/dt(" alphaVal="x" onClick={handleKey} />
            <CasioBtn label="√■" shiftLabel="∛" alphaLabel="y" primaryVal="sqrt(" shiftVal="cbrt(" alphaVal="y" onClick={handleKey} />
            <CasioBtn label="x²" shiftLabel="x³" alphaLabel="z" primaryVal="^2" shiftVal="^3" alphaVal="z" onClick={handleKey} />
            <CasioBtn label="x^■" shiftLabel="ⁿ√" alphaLabel="s" primaryVal="^" shiftVal="^(1/" alphaVal="s" onClick={handleKey} />
            <CasioBtn label="log" shiftLabel="10ˣ" alphaLabel="t" primaryVal="log(" shiftVal="10^(" alphaVal="t" onClick={handleKey} />
            <CasioBtn label="ln" shiftLabel="eˣ" alphaLabel="e" primaryVal="ln(" shiftVal="e^(" alphaVal="e" onClick={handleKey} />
          </div>

          {/* Row 2: Trigonometrics, Angles & Constants */}
          <div className="grid grid-cols-6 gap-1">
            <CasioBtn label="(-)" shiftLabel="∠" alphaLabel="A" primaryVal="-" shiftVal=" ∠ " alphaVal="A" onClick={handleKey} />
            <CasioBtn label="° ' ''" shiftLabel="rad" alphaLabel="B" primaryVal="°" shiftVal=" rad" alphaVal="B" onClick={handleKey} />
            <CasioBtn label="sin" shiftLabel="sin⁻¹" alphaLabel="j" primaryVal="sin(" shiftVal="arcsin(" alphaVal="j" onClick={handleKey} />
            <CasioBtn label="cos" shiftLabel="cos⁻¹" alphaLabel="ω" primaryVal="cos(" shiftVal="arccos(" alphaVal="w" onClick={handleKey} />
            <CasioBtn label="tan" shiftLabel="tan⁻¹" alphaLabel="θ" primaryVal="tan(" shiftVal="arctan(" alphaVal="theta" onClick={handleKey} />
            <CasioBtn label="π" shiftLabel="e" alphaLabel="τ" primaryVal="pi" shiftVal="e" alphaVal="tau" onClick={handleKey} />
          </div>
        </div>
      )}

      {/* 8. NUMERIC KEYPAD & STANDARD OPERATORS */}
      <div className="grid grid-cols-5 gap-1 text-sm font-bold">
        {/* Row 1: 7, 8, 9, (, ) */}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('7')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">7</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('8')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">8</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('9')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">9</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('(')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-sky-300 border border-slate-700 shadow-sm active:scale-95">(</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey(')')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-sky-300 border border-slate-700 shadow-sm active:scale-95">)</button>

        {/* Row 2: 4, 5, 6, ×, ÷ */}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('4')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">4</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('5')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">5</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('6')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">6</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('*')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-amber-300 font-mono text-base border border-slate-700 shadow-sm active:scale-95">×</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('/')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-amber-300 font-mono text-base border border-slate-700 shadow-sm active:scale-95">÷</button>

        {/* Row 3: 1, 2, 3, +, - */}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('1')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">1</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('2')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">2</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('3')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">3</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('+')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-amber-300 font-mono text-base border border-slate-700 shadow-sm active:scale-95">+</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('-')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-amber-300 font-mono text-base border border-slate-700 shadow-sm active:scale-95">-</button>

        {/* Row 4: 0, ., ×10ˣ, Ans, = / EXE */}
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('0')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">0</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('.')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-50 border border-slate-700 shadow-sm active:scale-95">.</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('*10^(')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-indigo-300 font-mono text-xs border border-slate-700 shadow-sm active:scale-95" title="Notação Exponencial Casio ×10ˣ">×10ˣ</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleKey('Ans', 'PreAns')} className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-emerald-300 font-mono text-xs border border-slate-700 shadow-sm active:scale-95" title="Última Resposta (Ans)">Ans</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleExe} className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-base font-black border border-indigo-400 shadow-md active:scale-95">EXE</button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SETTINGS / SETUP (OFICIAL CASIO MANUAL SETTINGS)                */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-sky-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Configurações Casio (SETUP)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2 flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
            {/* 1. Calc Settings: Input/Output */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-sky-300 block mb-1">1. Entrada / Saída (Input / Output)</span>
              <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                {[
                  { id: 'MathI/MathO', label: 'MathI / MathO (Natural)' },
                  { id: 'MathI/DecimalO', label: 'MathI / DecimalO' },
                  { id: 'LineI/LineO', label: 'LineI / LineO (Linear)' },
                  { id: 'LineI/DecimalO', label: 'LineI / DecimalO' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInputOutputFormat(item.id as InputOutputFormat)}
                    className={`p-1.5 rounded-lg border text-left transition-all ${
                      inputOutputFormat === item.id
                        ? 'bg-sky-600 text-white border-sky-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Calc Settings: Angle Unit */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-300 block mb-1">2. Unidade de Ângulo (Angle Unit)</span>
              <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                {[
                  { id: 'DEG', label: '1: Degree (°)' },
                  { id: 'RAD', label: '2: Radian (rad)' },
                  { id: 'GRA', label: '3: Gradian (gra)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAngleUnit(item.id as AngleUnit)}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      angleUnit === item.id
                        ? 'bg-amber-600 text-white border-amber-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Calc Settings: Number Format */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-300 block mb-1">3. Formato Numérico (Number Format)</span>
              <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                {(['Norm1', 'Norm2', 'Fix', 'Sci', 'Eng'] as NumberFormatType[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setNumberFormat(fmt)}
                    className={`p-1 rounded-lg border text-center transition-all ${
                      numberFormat === fmt
                        ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              {numberFormat === 'Fix' && (
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span>Casas decimais Fix (0-9):</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFixDigits(n)}
                        className={`w-6 h-6 rounded ${fixDigits === n ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. System Settings: Contrast & Key Beep */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-purple-300 block">4. Configurações de Sistema (System Settings)</span>
              <div className="flex items-center justify-between">
                <span>Contraste LCD:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Claro</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={contrastLevel}
                    onChange={(e) => setContrastLevel(Number(e.target.value))}
                    className="w-24 accent-purple-500"
                  />
                  <span className="text-[10px] text-slate-400">Escuro</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Som das Teclas (Beep):</span>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-0.5 rounded-lg font-bold ${
                    soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {soundEnabled ? 'LIGADO (ON)' : 'DESLIGADO (OFF)'}
                </button>
              </div>
            </div>

            {/* 5. Reset & Initialize */}
            <div className="bg-slate-900/80 p-2 rounded-xl border border-rose-900/50 flex items-center justify-between">
              <span className="text-rose-300 font-bold">Reinicializar Configurações:</span>
              <button
                type="button"
                onClick={() => {
                  setInputOutputFormat('MathI/MathO');
                  setAngleUnit('RAD');
                  setNumberFormat('Norm1');
                  setContrastLevel(5);
                  setSoundEnabled(false);
                }}
                className="px-2 py-1 rounded bg-rose-900/70 hover:bg-rose-800 text-rose-200 text-[10px] font-bold border border-rose-700"
              >
                Restaurar Padrão Casio
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Confirmar e Voltar à Calculadora
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HOME / APP SELECTOR (CALCULATE, BASE-N, COMPLEX, SIGNALS)       */}
      {/* ========================================================================= */}
      {showHomeModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-indigo-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Menu de Aplicativos (HOME)
              </h3>
            </div>
            <button type="button" onClick={() => setShowHomeModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            {[
              { id: 'calculate', label: '1: Calculate', sub: 'Cálculo Científico Geral', icon: CalcIcon, color: 'from-blue-600 to-indigo-600' },
              { id: 'baseN', label: '2: Base-N', sub: 'DEC, HEX, BIN, OCT & Bitwise', icon: Binary, color: 'from-amber-600 to-orange-600' },
              { id: 'signals', label: '3: Signals & ℒ', sub: 'Laplace, Fourier e Sistemas', icon: Activity, color: 'from-purple-600 to-pink-600' },
              { id: 'complex', label: '4: Complex', sub: 'Retangular (a+bi) e Polar', icon: Cpu, color: 'from-teal-600 to-emerald-600' },
            ].map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  setActiveApp(app.id as ActiveApp);
                  setShowHomeModal(false);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  activeApp === app.id
                    ? 'bg-gradient-to-br ' + app.color + ' text-white border-white/50 shadow-lg scale-102 ring-2 ring-white/30'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs font-mono">{app.label}</span>
                  <app.icon className="w-4 h-4 opacity-80" />
                </div>
                <span className="text-[10px] opacity-75">{app.sub}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowHomeModal(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
          >
            Fechar Menu
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CATALOG OF FUNCTIONS (CATÁLOGO CASIO)                           */}
      {/* ========================================================================= */}
      {showCatalogModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-indigo-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Catálogo de Funções (CATALOG)
              </h3>
            </div>
            <button type="button" onClick={() => setShowCatalogModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search box */}
          <div className="my-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar função (ex: laplace, sin, log, and)..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
            {catalogCategories.map((cat) => {
              const filtered = cat.items.filter(
                (item) =>
                  item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                  item.desc.toLowerCase().includes(catalogSearch.toLowerCase())
              );
              if (filtered.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-1">
                  <span className="font-bold text-[11px] text-indigo-300 block">{cat.title}</span>
                  <div className="grid grid-cols-2 gap-1">
                    {filtered.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleKey(item.insert);
                          setShowCatalogModal(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-all flex flex-col"
                      >
                        <span className="font-mono font-bold text-xs text-slate-100">{item.name}</span>
                        <span className="text-[9px] text-slate-400 truncate">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowCatalogModal(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs mt-2"
          >
            Fechar Catálogo
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VARIABLE & REGISTER MEMORY (M, Ans, PreAns, A-F, x, y, z)        */}
      {/* ========================================================================= */}
      {showVariableModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-rose-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Gerenciador de Memória (MEMORY / VARIABLES)
              </h3>
            </div>
            <button type="button" onClick={() => setShowVariableModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick M+ and M- Bar */}
          <div className="my-1 p-2 rounded-xl bg-slate-900/90 border border-rose-800/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-600 font-mono font-black text-white text-xs">M</span>
              <span className="font-mono text-xs font-bold text-rose-200 truncate max-w-[130px]">{variables.M}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleMPlus}
                className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[10px] font-bold rounded-lg active:scale-95"
                title="Adicionar valor atual a M (M = M + Ans)"
              >
                M+
              </button>
              <button
                type="button"
                onClick={handleMMinus}
                className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[10px] font-bold rounded-lg active:scale-95"
                title="Subtrair valor atual de M (M = M - Ans)"
              >
                M-
              </button>
              <button
                type="button"
                onClick={handleClearMemoryM}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg active:scale-95"
                title="Zerar memória M (MC)"
              >
                MC (Zerar)
              </button>
            </div>
          </div>

          <div className="my-1 flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs scrollbar-thin">
            <p className="text-[11px] text-slate-400 pb-0.5">
              Registradores Casio: toque em <b>STO</b> para salvar o resultado atual ou <b>RCL</b> para inserir na equação:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['M', 'A', 'B', 'C', 'D', 'E', 'F', 'x', 'y', 'z'] as (keyof MemoryVariables)[]).map((vKey) => (
                <div
                  key={vKey}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-rose-300 text-sm">{vKey} =</span>
                    <button
                      type="button"
                      onClick={() => handleStoreVariable(vKey)}
                      className="px-1.5 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 text-[9px] font-bold border border-rose-800"
                      title={`Armazenar no registrador ${vKey}`}
                    >
                      STO
                    </button>
                  </div>
                  <span className="font-mono text-xs text-slate-100 truncate px-1 py-0.5 bg-slate-950 rounded border border-slate-850">
                    {variables[vKey]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleRecallVariable(vKey);
                      setShowVariableModal(false);
                    }}
                    className="w-full py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] font-bold"
                  >
                    RCL (Inserir)
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClearAllMemory}
              className="flex-1 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Todas Memórias</span>
            </button>
            <button
              type="button"
              onClick={() => setShowVariableModal(false)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4.5: CALCULATION HISTORY MODAL & REPLAY                            */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-amber-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Histórico de Cálculos & Replay
              </h3>
            </div>
            <button type="button" onClick={() => setShowHistoryModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search History */}
          <div className="my-1.5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar em contas anteriores..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin my-1">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <HistoryIcon className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">Nenhum cálculo no histórico ainda.</p>
                <p className="text-[10px] text-slate-600 mt-1">Realize contas na calculadora para salvá-las aqui automaticamente.</p>
              </div>
            ) : (
              history
                .filter(
                  (item) =>
                    !historySearch ||
                    item.input.toLowerCase().includes(historySearch.toLowerCase()) ||
                    item.result.toLowerCase().includes(historySearch.toLowerCase())
                )
                .map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col gap-1.5 group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 font-mono font-bold border border-amber-800/60">
                          {item.base}
                        </span>
                        <span className="font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHistory((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-rose-400"
                        title="Remover este item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Math Expression */}
                    <div className="font-mono text-xs text-slate-200 break-all font-semibold">
                      {item.input}
                    </div>

                    {/* Result Line */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono text-xs">
                      <span className="text-slate-400 text-[10px]">Resultado:</span>
                      <span className="font-bold text-amber-300">{item.result}</span>
                    </div>

                    {/* Item Action Buttons */}
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCalcInput(item.input);
                          setCursorPos(item.input.length);
                          setCalcResult(item.result);
                          setShowHistoryModal(false);
                          triggerMemoryNotice('Cálculo carregado no visor!');
                        }}
                        className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-sky-300 font-bold text-[10px] flex items-center justify-center gap-1"
                        title="Carregar expressão no visor para editar ou recalcular"
                      >
                        <ChevronUp className="w-3 h-3" />
                        <span>Replay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyClipboard(item.result, 'result')}
                        className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[10px] flex items-center justify-center gap-1"
                        title="Copiar resultado do cálculo"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copiar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSendToAnswer(item.result);
                          setShowHistoryModal(false);
                        }}
                        className="py-1 px-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold text-[10px] flex items-center justify-center gap-1"
                        title="Inserir resultado na resposta do passo"
                      >
                        <ArrowDownToLine className="w-3 h-3" />
                        <span>Inserir</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* History Footer Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                triggerMemoryNotice('Histórico limpo');
              }}
              disabled={history.length === 0}
              className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border ${
                history.length === 0
                  ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                  : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: MANUAL & GUIA DA CALCULADORA CASIO                              */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-emerald-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Manual & Atalhos Casio ClassWiz
              </h3>
            </div>
            <button type="button" onClick={() => setShowManualModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2 flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs scrollbar-thin text-slate-300 leading-relaxed">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-300 block mb-1">🎮 D-Pad e Navegação (▲, ▼, ◀, ▶)</span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li><b className="text-slate-200">Seta Cima (▲)</b>: Volta nas contas anteriores do histórico de cálculo.</li>
                <li><b className="text-slate-200">Seta Baixo (▼)</b>: Avança no histórico até voltar ao rascunho.</li>
                <li><b className="text-slate-200">Seta Esquerda/Direita (◀ / ▶)</b>: Move o cursor de edição no visor.</li>
                <li><b className="text-slate-200">SHIFT + ◀ / ▶</b>: Salta direto para o início ou fim da equação.</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-300 block mb-1">📋 Copiar e Colar Equações</span>
              <p className="text-[11px] text-slate-400">
                Você pode copiar equações do PDF, páginas web ou anotações e clicar em <b className="text-amber-300">Colar</b> no visor. A calculadora converte automaticamente LaTeX (\frac, \sqrt, \sin) para formato executável!
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-sky-300 block mb-1">🔢 Modos de Base Numérica (Base-N)</span>
              <p className="text-[11px] text-slate-400">
                Alterne instantaneamente entre <b className="text-slate-200">DEC, HEX, BIN, OCT</b>. Na base HEX, utilize as teclas A, B, C, D, E, F e operadores lógicos AND, OR, XOR, NOT, &lt;&lt; e &gt;&gt;.
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">⚡ Tecla FORMAT / S&lt;=&gt;D</span>
              <p className="text-[11px] text-slate-400">
                Converte o resultado entre fração exata, número decimal, notação científica e notação de engenharia com múltiplos de 3 (k, M, G, m, µ).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowManualModal(false)}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
          >
            Fechar Manual
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PASTE EQUATION DIRECT INPUT                                     */}
      {/* ========================================================================= */}
      {showPasteModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-amber-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Colar Equação no Visor
              </h3>
            </div>
            <button type="button" onClick={() => setShowPasteModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2 flex-1 flex flex-col">
            <p className="text-xs text-slate-400 mb-2">
              Cole sua expressão matemática ou código LaTeX abaixo (<kbd className="bg-slate-800 px-1 rounded text-slate-200">Ctrl+V</kbd>):
            </p>
            <textarea
              ref={pasteInputRef}
              rows={4}
              value={pasteModalInput}
              onChange={(e) => setPasteModalInput(e.target.value)}
              placeholder="Ex: \frac{s+3}{s^2+4s+13}, 3*(2)^2, 0xFF + 10, e^(-2*t)*cos(4*t)..."
              className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPasteModal(false)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => pasteTextAtCursor(pasteModalInput)}
              disabled={!pasteModalInput.trim()}
              className={`flex-1 py-2 font-bold rounded-xl text-xs transition-all shadow-md ${
                pasteModalInput.trim()
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Inserir no Visor
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: TOOLS MENU (OPÇÕES RÁPIDAS)                                     */}
      {/* ========================================================================= */}
      {showToolsModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-4 z-50 flex flex-col justify-between border-2 border-emerald-500/60 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Ferramentas Rápidas (TOOLS)
              </h3>
            </div>
            <button type="button" onClick={() => setShowToolsModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-2 flex-1 grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                handleKey('d/dt(');
                setShowToolsModal(false);
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex flex-col justify-between"
            >
              <span className="font-bold text-sky-300 font-mono text-xs">1: Derivada d/dt</span>
              <span className="text-[10px] text-slate-400">Derivada temporal de sinal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleKey('int_0^inf(');
                setShowToolsModal(false);
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex flex-col justify-between"
            >
              <span className="font-bold text-emerald-300 font-mono text-xs">2: Integral ∫</span>
              <span className="text-[10px] text-slate-400">Integral unilateral de Laplace</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleFormatConvert();
                setShowToolsModal(false);
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex flex-col justify-between"
            >
              <span className="font-bold text-purple-300 font-mono text-xs">3: Eng Notation</span>
              <span className="text-[10px] text-slate-400">Converter em potências de 10³</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleKey(' ∠ ');
                setShowToolsModal(false);
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex flex-col justify-between"
            >
              <span className="font-bold text-amber-300 font-mono text-xs">4: Fasor Polar ∠</span>
              <span className="text-[10px] text-slate-400">Magnitude e ângulo de fase</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowToolsModal(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

interface CasioBtnProps {
  label: string;
  shiftLabel?: string;
  alphaLabel?: string;
  primaryVal: string;
  shiftVal?: string;
  alphaVal?: string;
  onClick: (prim: string, shift?: string, alpha?: string) => void;
}

const CasioBtn: React.FC<CasioBtnProps> = ({
  label,
  shiftLabel,
  alphaLabel,
  primaryVal,
  shiftVal,
  alphaVal,
  onClick,
}) => {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onClick(primaryVal, shiftVal, alphaVal)}
      className="p-1 sm:p-1.5 rounded-xl font-mono text-xs bg-slate-850 hover:bg-slate-750 text-slate-100 border border-slate-700/90 flex flex-col items-center justify-between min-h-[38px] active:scale-95 transition-all shadow-xs group"
    >
      <div className="flex items-center justify-between w-full text-[8px] sm:text-[9px] font-bold px-0.5 pointer-events-none">
        <span className="text-amber-400 group-hover:text-amber-300 transition-colors truncate">
          {shiftLabel || ''}
        </span>
        <span className="text-rose-400 group-hover:text-rose-300 transition-colors truncate">
          {alphaLabel || ''}
        </span>
      </div>
      <span className="font-extrabold text-[11px] sm:text-xs text-slate-100">{label}</span>
    </button>
  );
};

export default CasioCalculator;
