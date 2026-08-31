import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Calculator,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Sliders,
  History,
  Trash2,
  Compass,
  ArrowRight,
  Eye,
  Info,
  Play,
  RotateCw,
  CornerDownLeft,
  ChevronRight,
  Divide,
  Percent,
} from 'lucide-react';
import MathView from './MathView';
import { TwoDPlotViewer } from './TwoDPlotViewer';
import { ThreeDPlotViewer } from './ThreeDPlotViewer';
import { sanitizeMathExpression } from '../utils/mathPlotEvaluator';

interface ScientificGraphingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpression?: string;
}

interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const ScientificGraphingCalculatorModal: React.FC<ScientificGraphingCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialExpression = 'e^(-0.5*t)*cos(4*t)',
}) => {
  // Main expression being typed
  const [expression, setExpression] = useState<string>(initialExpression);
  const [numericResult, setNumericResult] = useState<string>('');
  const [calcError, setCalcError] = useState<string | null>(null);

  // Active Visualizer Tab: '2d' | '3d' | 'both'
  const [plotMode, setPlotMode] = useState<'2d' | '3d' | 'both'>('2d');
  const [activePadTab, setActivePadTab] = useState<'basic' | 'scientific' | 'signals' | 'history'>('scientific');

  // Calculation History
  const [history, setHistory] = useState<CalcHistoryItem[]>([
    {
      id: '1',
      expression: 'e^(-0.5*t)*cos(4*t)',
      result: 'Oscilação Subamortecida (ζ < 1)',
      timestamp: 'Padrão',
    },
    {
      id: '2',
      expression: 'sinc(t/2)',
      result: 'Filtro Passa-Baixas Ideal',
      timestamp: 'Padrão',
    },
    {
      id: '3',
      expression: '2*pi*60',
      result: '376.9911 rad/s',
      timestamp: 'Frequência da Rede',
    },
  ]);

  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 2D Plot range configuration
  const [range2D, setRange2D] = useState<{ min: number; max: number }>({ min: -6, max: 6 });

  // 3D equation (can differ if using (x,y))
  const expression3D = useMemo(() => {
    let expr = expression;
    // Replace variable t with sqrt(x^2 + y^2) or replace t with x if only t is used
    if (expr.includes('t') && !expr.includes('x') && !expr.includes('y')) {
      // If single variable t, map t -> sqrt(x^2 + y^2) for symmetric radial 3D or map t -> x
      return expr.replace(/\bt\b/g, '(sqrt(x^2 + y^2) + 0.001)');
    }
    return expr;
  }, [expression]);

  // Safe numerical evaluation function
  const evaluateNumeric = (exprStr: string): { result: string; isNumeric: boolean; error: string | null } => {
    try {
      if (!exprStr.trim()) return { result: '', isNumeric: false, error: null };

      const sanitized = sanitizeMathExpression(exprStr);

      // Check if expression contains variables (t, x, y, s, w)
      const hasVariables = /[txyswTXYSW]/.test(sanitized.replace(/Math\.[a-zA-Z]+/g, ''));

      if (hasVariables) {
        // Symbolic / signal mode: evaluate at t=0 and t=1 to show initial values
        const fn = new Function(
          't',
          'x',
          'y',
          `
          const sin = Math.sin;
          const cos = Math.cos;
          const tan = Math.tan;
          const exp = Math.exp;
          const sqrt = Math.sqrt;
          const abs = Math.abs;
          const log = Math.log;
          const log10 = Math.log10;
          const PI = Math.PI;
          const sincHelper = (v) => (Math.abs(v) < 1e-6 ? 1 : Math.sin(Math.PI * v) / (Math.PI * v));
          const u = (v) => (v >= 0 ? 1 : 0);
          try {
            return ${sanitized};
          } catch(e) {
            return NaN;
          }
        `
        );

        const val0 = fn(0, 0, 0);
        const val1 = fn(1, 1, 1);

        if (!isNaN(val0) && isFinite(val0)) {
          const formatted0 = Math.abs(val0) < 1e-4 && val0 !== 0 ? val0.toExponential(4) : Number(val0.toFixed(4)).toString();
          return {
            result: `f(0) = ${formatted0} | f(1) = ${Number(val1.toFixed(4))}`,
            isNumeric: false,
            error: null,
          };
        }
        return { result: 'Expressão de Sinal Contínuo', isNumeric: false, error: null };
      }

      // Pure numeric calculation
      const fn = new Function(`
        const sin = (x) => Math.sin(x);
        const cos = (x) => Math.cos(x);
        const tan = (x) => Math.tan(x);
        const asin = (x) => Math.asin(x);
        const acos = (x) => Math.acos(x);
        const atan = (x) => Math.atan(x);
        const sinh = (x) => Math.sinh(x);
        const cosh = (x) => Math.cosh(x);
        const tanh = (x) => Math.tanh(x);
        const exp = (x) => Math.exp(x);
        const sqrt = (x) => Math.sqrt(x);
        const abs = (x) => Math.abs(x);
        const log = (x) => Math.log(x);
        const log10 = (x) => Math.log10(x);
        const PI = Math.PI;
        const E = Math.E;
        return (${sanitized});
      `);

      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const formatted = Math.abs(val) > 1e6 || (Math.abs(val) < 1e-4 && val !== 0)
          ? val.toExponential(6)
          : Number(val.toFixed(6)).toString();
        return { result: formatted, isNumeric: true, error: null };
      } else {
        return { result: '', isNumeric: false, error: 'Indefinição Matemática' };
      }
    } catch (err: any) {
      return { result: '', isNumeric: false, error: 'Sintaxe inválida' };
    }
  };

  // Update calculation whenever expression changes
  useEffect(() => {
    const { result, error } = evaluateNumeric(expression);
    setNumericResult(result);
    setCalcError(error);
  }, [expression]);

  // Insert token at cursor or append
  const handleInsert = (token: string) => {
    setExpression((prev) => {
      if (prev === '0') return token;
      return prev + token;
    });
    inputRef.current?.focus();
  };

  // Backspace
  const handleBackspace = () => {
    setExpression((prev) => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
    inputRef.current?.focus();
  };

  // Clear
  const handleClear = () => {
    setExpression('');
    setNumericResult('');
    setCalcError(null);
    inputRef.current?.focus();
  };

  // Execute / Save to history
  const handleCalculate = () => {
    const { result, error } = evaluateNumeric(expression);
    if (!error && result) {
      setHistory((prev) => [
        {
          id: Date.now().toString(),
          expression,
          result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 19),
      ]);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!isOpen) return null;

  // Signal & surface presets
  const presets2D = [
    { label: 'Oscilação Subamortecida', expr: 'e^(-0.5*t)*cos(4*t)', desc: 'y(t) com envelope exponencial' },
    { label: 'Pulso Sinc (Filtro)', expr: 'sinc(t/1.5)', desc: 'X(jω) retangular no domínio do tempo' },
    { label: 'Batimento / Ressonância', expr: 'cos(3*t) + cos(3.6*t)', desc: 'Interferência de frequências próximas' },
    { label: 'Decaimento Crítico', expr: 't*exp(-2*t)', desc: 'Resposta transitória mais rápida sem overshoot' },
    { label: 'Degrau Amortecido', expr: '1 - e^(-t)*cos(3*t)', desc: 'Resposta ao degrau de 2ª ordem' },
    { label: 'Onda AM Modulada', expr: '(1 + 0.5*cos(t))*cos(10*t)', desc: 'Modulação em amplitude' },
  ];

  const presets3D = [
    { label: 'Superfície de Laplace 3D', expr: '1/sqrt((x+1)^2 + y^2 + 0.05)', desc: '|H(σ + jω)| com polo em s = -1' },
    { label: 'Sombrero / Bessel 3D', expr: 'sin(sqrt(x^2 + y^2))/(sqrt(x^2 + y^2) + 0.1)', desc: 'Ondulação radial em coordenadas polares' },
    { label: 'Sela Hiperbólica', expr: 'x^2 - y^2', desc: 'Ponto de sela clássico z = f(x,y)' },
    { label: 'Parabolóide Elíptico', expr: '0.5*(x^2 + y^2)', desc: 'Superfície quadrática convexa' },
    { label: 'Ondas Cruzadas 3D', expr: 'sin(x)*cos(y)', desc: 'Padrão bidimensional de interferência' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-7xl h-[94vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Calculadora Científica & Gráfica</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    2D & 3D em Tempo Real
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Calcule equações, sinais e funções matemáticas com visualização instantânea de curvas 2D e superfícies 3D.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-800/80 border border-slate-700 rounded-xl">
              <button
                onClick={() => setPlotMode('2d')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  plotMode === '2d'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Curva 2D
              </button>
              <button
                onClick={() => setPlotMode('3d')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  plotMode === '3d'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Superfície 3D
              </button>
              <button
                onClick={() => setPlotMode('both')}
                className={`hidden md:block px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  plotMode === 'both'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2D + 3D
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar Calculadora"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left side (Calculator Screen & Keypads) + Right side (2D / 3D Visualizer) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Interactive Calculator (Width fixed on desktop) */}
          <div className="w-full lg:w-[460px] xl:w-[500px] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0 overflow-y-auto">
            
            {/* Display Screen */}
            <div className="p-4 bg-slate-950 border-b border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Expressão f(t, x, y):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(expression)}
                    className="hover:text-sky-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copiar Expressão"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-bold"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Formula input box */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCalculate();
                  }}
                  placeholder="Ex: e^(-0.5*t)*cos(4*t) ou sin(x)*cos(y)"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-base font-mono text-amber-300 placeholder-slate-600 focus:outline-hidden focus:border-amber-500 shadow-inner transition-colors"
                />
              </div>

              {/* Math formatted preview & result */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between min-h-[44px]">
                <div className="text-xs font-mono text-slate-300 overflow-x-auto scrollbar-none py-1">
                  {expression.trim() ? (
                    <MathView math={`f(t) = ${expression}`} />
                  ) : (
                    <span className="text-slate-500 italic">Digite uma fórmula ou use o teclado abaixo...</span>
                  )}
                </div>

                {numericResult && (
                  <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono shrink-0 ml-2">
                    {numericResult}
                  </div>
                )}
                {calcError && (
                  <div className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono shrink-0 ml-2">
                    {calcError}
                  </div>
                )}
              </div>
            </div>

            {/* Keypad Category Tabs */}
            <div className="flex items-center px-4 pt-3 pb-2 gap-1 border-b border-slate-800/80 bg-slate-900/50 text-xs">
              <button
                onClick={() => setActivePadTab('scientific')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activePadTab === 'scientific'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Científica
              </button>
              <button
                onClick={() => setActivePadTab('signals')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activePadTab === 'signals'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Sinais & Variáveis
              </button>
              <button
                onClick={() => setActivePadTab('basic')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activePadTab === 'basic'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Básica
              </button>
              <button
                onClick={() => setActivePadTab('history')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ml-auto flex items-center gap-1 ${
                  activePadTab === 'history'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Histórico ({history.length})</span>
              </button>
            </div>

            {/* Keypads */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              {activePadTab === 'scientific' && (
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  {/* Scientific Functions */}
                  <button onClick={() => handleInsert('sin(')} className="calc-btn-fn">sin</button>
                  <button onClick={() => handleInsert('cos(')} className="calc-btn-fn">cos</button>
                  <button onClick={() => handleInsert('tan(')} className="calc-btn-fn">tan</button>
                  <button onClick={() => handleInsert('sinc(')} className="calc-btn-accent font-bold">sinc(t)</button>

                  <button onClick={() => handleInsert('asin(')} className="calc-btn-fn">sin⁻¹</button>
                  <button onClick={() => handleInsert('acos(')} className="calc-btn-fn">cos⁻¹</button>
                  <button onClick={() => handleInsert('atan(')} className="calc-btn-fn">tan⁻¹</button>
                  <button onClick={() => handleInsert('exp(')} className="calc-btn-fn">eˣ</button>

                  <button onClick={() => handleInsert('sqrt(')} className="calc-btn-fn">√x</button>
                  <button onClick={() => handleInsert('^2')} className="calc-btn-fn">x²</button>
                  <button onClick={() => handleInsert('^')} className="calc-btn-fn">xʸ</button>
                  <button onClick={() => handleInsert('log(')} className="calc-btn-fn">ln(x)</button>

                  {/* Variables */}
                  <button onClick={() => handleInsert('t')} className="calc-btn-var">t</button>
                  <button onClick={() => handleInsert('x')} className="calc-btn-var">x</button>
                  <button onClick={() => handleInsert('y')} className="calc-btn-var">y</button>
                  <button onClick={() => handleInsert('pi')} className="calc-btn-var">π</button>

                  {/* Numbers & Operators */}
                  <button onClick={() => handleInsert('7')} className="calc-btn-num">7</button>
                  <button onClick={() => handleInsert('8')} className="calc-btn-num">8</button>
                  <button onClick={() => handleInsert('9')} className="calc-btn-num">9</button>
                  <button onClick={() => handleInsert('/')} className="calc-btn-op">÷</button>

                  <button onClick={() => handleInsert('4')} className="calc-btn-num">4</button>
                  <button onClick={() => handleInsert('5')} className="calc-btn-num">5</button>
                  <button onClick={() => handleInsert('6')} className="calc-btn-num">6</button>
                  <button onClick={() => handleInsert('*')} className="calc-btn-op">×</button>

                  <button onClick={() => handleInsert('1')} className="calc-btn-num">1</button>
                  <button onClick={() => handleInsert('2')} className="calc-btn-num">2</button>
                  <button onClick={() => handleInsert('3')} className="calc-btn-num">3</button>
                  <button onClick={() => handleInsert('-')} className="calc-btn-op">−</button>

                  <button onClick={() => handleInsert('0')} className="calc-btn-num">0</button>
                  <button onClick={() => handleInsert('.')} className="calc-btn-num">.</button>
                  <button onClick={handleBackspace} className="calc-btn-del">DEL</button>
                  <button onClick={() => handleInsert('+')} className="calc-btn-op">+</button>
                </div>
              )}

              {activePadTab === 'signals' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                    <button onClick={() => handleInsert('u(t)')} className="calc-btn-accent">u(t) Degrau</button>
                    <button onClick={() => handleInsert('sinc(t)')} className="calc-btn-accent">sinc(t)</button>
                    <button onClick={() => handleInsert('abs(')} className="calc-btn-fn">|x| Módulo</button>
                    <button onClick={() => handleInsert('w')} className="calc-btn-var">ω (Omega)</button>
                    <button onClick={() => handleInsert('s')} className="calc-btn-var">s (Laplace)</button>
                    <button onClick={() => handleInsert('2*pi*')} className="calc-btn-var">2πf</button>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Presets Rápidos de Sinais (2D):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {presets2D.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setExpression(p.expr)}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 text-left transition-all cursor-pointer group"
                        >
                          <div className="text-[11px] font-bold text-slate-200 group-hover:text-sky-300 truncate">
                            {p.label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">{p.expr}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Superfícies & Campos 3D:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {presets3D.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setExpression(p.expr)}
                          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 text-left transition-all cursor-pointer group"
                        >
                          <div className="text-[11px] font-bold text-slate-200 group-hover:text-purple-300 truncate">
                            {p.label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">{p.expr}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activePadTab === 'basic' && (
                <div className="grid grid-cols-4 gap-2 text-sm font-mono">
                  <button onClick={handleClear} className="calc-btn-del font-bold">AC</button>
                  <button onClick={() => handleInsert('(')} className="calc-btn-fn">(</button>
                  <button onClick={() => handleInsert(')')} className="calc-btn-fn">)</button>
                  <button onClick={() => handleInsert('/')} className="calc-btn-op">÷</button>

                  <button onClick={() => handleInsert('7')} className="calc-btn-num">7</button>
                  <button onClick={() => handleInsert('8')} className="calc-btn-num">8</button>
                  <button onClick={() => handleInsert('9')} className="calc-btn-num">9</button>
                  <button onClick={() => handleInsert('*')} className="calc-btn-op">×</button>

                  <button onClick={() => handleInsert('4')} className="calc-btn-num">4</button>
                  <button onClick={() => handleInsert('5')} className="calc-btn-num">5</button>
                  <button onClick={() => handleInsert('6')} className="calc-btn-num">6</button>
                  <button onClick={() => handleInsert('-')} className="calc-btn-op">−</button>

                  <button onClick={() => handleInsert('1')} className="calc-btn-num">1</button>
                  <button onClick={() => handleInsert('2')} className="calc-btn-num">2</button>
                  <button onClick={() => handleInsert('3')} className="calc-btn-num">3</button>
                  <button onClick={() => handleInsert('+')} className="calc-btn-op">+</button>

                  <button onClick={() => handleInsert('0')} className="calc-btn-num col-span-2">0</button>
                  <button onClick={() => handleInsert('.')} className="calc-btn-num">.</button>
                  <button onClick={handleCalculate} className="calc-btn-calc">=</button>
                </div>
              )}

              {activePadTab === 'history' && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Histórico de Cálculos</span>
                    {history.length > 0 && (
                      <button
                        onClick={() => setHistory([])}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Limpar</span>
                      </button>
                    )}
                  </div>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setExpression(item.expression)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="text-xs font-mono font-bold text-amber-300 truncate">
                          {item.expression}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          = {item.result}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Quick Action Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={handleCalculate}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Calcular & Atualizar Gráfico</span>
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer Hub (2D Chart and/or 3D WebGL Surface) */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/80 p-4 sm:p-5 space-y-4">
            
            {/* Visualizer Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Gráfico Dinâmico:</span>
                    <span className="font-mono text-amber-300">{expression || 'f(t)'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {plotMode === '2d'
                      ? 'Resposta no Domínio do Tempo f(t) ou f(x)'
                      : plotMode === '3d'
                      ? 'Superfície de Magnitude Tridimensional z = f(x,y)'
                      : 'Visualização Simultânea 2D + 3D'}
                  </p>
                </div>
              </div>

              {/* 2D Range Quick Adjust */}
              {plotMode === '2d' && (
                <div className="flex items-center gap-1.5 text-[11px] bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Intervalo t:</span>
                  <button
                    onClick={() => setRange2D({ min: -5, max: 5 })}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      range2D.max === 5 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    [-5, 5]
                  </button>
                  <button
                    onClick={() => setRange2D({ min: 0, max: 10 })}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      range2D.min === 0 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    [0, 10]
                  </button>
                  <button
                    onClick={() => setRange2D({ min: -10, max: 10 })}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      range2D.max === 10 && range2D.min === -10 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    [-10, 10]
                  </button>
                </div>
              )}
            </div>

            {/* 2D Plot Container */}
            {(plotMode === '2d' || plotMode === 'both') && (
              <div className="flex-1 min-h-[340px] rounded-2xl bg-slate-950 border border-slate-800 p-3 shadow-lg flex flex-col relative">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Curva Bidimensional 2D
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Amostragem: 500 pontos • Interativo
                  </span>
                </div>
                <div className="flex-1 w-full h-full min-h-[280px]">
                  <TwoDPlotViewer
                    equation={expression}
                    minX={range2D.min}
                    maxX={range2D.max}
                  />
                </div>
              </div>
            )}

            {/* 3D WebGL Plot Container */}
            {(plotMode === '3d' || plotMode === 'both') && (
              <div className="flex-1 min-h-[340px] rounded-2xl bg-slate-950 border border-slate-800 p-3 shadow-lg flex flex-col relative">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Superfície Tridimensional WebGL 3D (Arraste para rotacionar)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    z = f(x, y) • Malha 48×48
                  </span>
                </div>
                <div className="flex-1 w-full h-full min-h-[280px] rounded-xl overflow-hidden">
                  <ThreeDPlotViewer
                    equation={expression3D}
                    gridSize={48}
                    minRange={-4}
                    maxRange={4}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .calc-btn-num {
          background-color: #0f172a;
          color: #f8fafc;
          border: 1px solid #1e293b;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-num:hover {
          background-color: #1e293b;
          border-color: #334155;
        }
        .calc-btn-num:active {
          transform: scale(0.96);
        }

        .calc-btn-fn {
          background-color: #1e1b4b;
          color: #c7d2fe;
          border: 1px solid #312e81;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-fn:hover {
          background-color: #312e81;
          color: #ffffff;
        }
        .calc-btn-fn:active {
          transform: scale(0.96);
        }

        .calc-btn-var {
          background-color: #082f49;
          color: #7dd3fc;
          border: 1px solid #0369a1;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-var:hover {
          background-color: #0369a1;
          color: #ffffff;
        }

        .calc-btn-accent {
          background-color: #0369a1;
          color: #ffffff;
          border: 1px solid #38bdf8;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-accent:hover {
          background-color: #0284c7;
        }

        .calc-btn-op {
          background-color: #451a03;
          color: #fdba74;
          border: 1px solid #9a3412;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-op:hover {
          background-color: #9a3412;
          color: #ffffff;
        }

        .calc-btn-del {
          background-color: #4c0519;
          color: #fda4af;
          border: 1px solid #9f1239;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-del:hover {
          background-color: #9f1239;
          color: #ffffff;
        }

        .calc-btn-calc {
          background-color: #f59e0b;
          color: #000000;
          border: 1px solid #fbbf24;
          border-radius: 0.75rem;
          padding: 0.6rem 0.2rem;
          text-align: center;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.15s;
        }
        .calc-btn-calc:hover {
          background-color: #fbbf24;
        }
      `}</style>
    </div>
  );
};
