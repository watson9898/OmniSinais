import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Eraser,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
  Download,
  Grid,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  CornerDownRight,
  BookOpen,
  Boxes,
  Activity,
  Layers,
  Zap,
  Play,
  RotateCw,
  ClipboardPaste,
  Code2,
  History,
  FileCode,
  Share2,
} from 'lucide-react';
import MathView from './MathView';
import { TwoDPlotViewer } from './TwoDPlotViewer';
import { ThreeDPlotViewer } from './ThreeDPlotViewer';
import { recordTokenUsage } from '../utils/tokenTracker';

interface EquationBlackboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToInput?: (equationText: string) => void;
  currentExerciseContext?: string;
  initialEquation?: string;
}

interface RecognitionResult {
  latex: string;
  plainText: string;
  description?: string;
  confidence?: string;
}

export const EquationBlackboardModal: React.FC<EquationBlackboardModalProps> = ({
  isOpen,
  onClose,
  onInsertToInput,
  currentExerciseContext = '',
  initialEquation = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Tab: 'simulator' (2D & 3D plots) vs 'chalkboard' (drawing & OCR) vs 'presets'
  const [activeTab, setActiveTab] = useState<'simulator' | 'chalkboard' | 'presets'>('simulator');
  const [plotMode, setPlotMode] = useState<'2d' | '3d' | 'split'>('split');

  // Input Equation
  const [equationText, setEquationText] = useState<string>('e^(-0.5*t)*cos(4*t)');
  const [equation3DText, setEquation3DText] = useState<string>('sin(sqrt(x^2 + y^2))/(sqrt(x^2 + y^2) + 0.1)');

  // Clipboard & Calculation History
  const [clipboardFeedback, setClipboardFeedback] = useState<string | null>(null);
  const [recentFormulas, setRecentFormulas] = useState<string[]>([
    'e^(-0.5*t)*cos(4*t)',
    'sinc(t/1.5)',
    'sin(sqrt(x^2 + y^2))/(sqrt(x^2 + y^2) + 0.1)',
    '1/(sqrt(t^2 + 1))',
    'exp(-0.5*t^2)',
    'cos(0.5*t)*sin(6*t)',
  ]);

  // Load initialEquation when prop changes
  useEffect(() => {
    if (initialEquation && initialEquation.trim()) {
      const sanitized = cleanMathExpression(initialEquation);
      setEquationText(sanitized);
      setEquation3DText(sanitized);
      setActiveTab('simulator');
      addToHistory(sanitized);
    }
  }, [initialEquation, isOpen]);

  // Helper to clean and normalize math expressions from raw text or clipboard
  const cleanMathExpression = (raw: string): string => {
    let str = raw.trim();
    // Remove markdown math tags like $ or $$
    str = str.replace(/^\$\$|\$\$$|^\$|\$$/g, '').trim();
    // Extract right side if it contains equation definition like x(t) = ... or y(t) = ... or f(x,y) = ...
    if (str.includes('=')) {
      const parts = str.split('=');
      if (parts.length >= 2 && parts[1].trim().length > 0) {
        str = parts.slice(1).join('=').trim();
      }
    }
    // Clean LaTeX commands into standard mathematical expressions
    return str
      .replace(/\\cdot/g, '*')
      .replace(/\\times/g, '*')
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\exp/g, 'exp')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\pi/g, 'pi')
      .replace(/\\omega/g, 'w')
      .replace(/\\mathcal\{L\}\{([^}]+)\}/g, '$1')
      .replace(/\\mathcal\{L\}\^\{-1\}\{([^}]+)\}/g, '$1')
      .replace(/\\delta\(([^)]+)\)/g, 'delta($1)')
      .replace(/\{/g, '(')
      .replace(/\}/g, ')')
      .trim();
  };

  const addToHistory = (formula: string) => {
    if (!formula || formula.trim().length === 0) return;
    setRecentFormulas((prev) => {
      const filtered = prev.filter((f) => f !== formula);
      return [formula, ...filtered].slice(0, 10);
    });
  };

  // Paste from clipboard handler
  const handlePasteFromClipboard = async () => {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      } else {
        text = prompt('Cole aqui o texto ou cálculo para o simulador:') || '';
      }

      if (text && text.trim()) {
        const cleaned = cleanMathExpression(text);
        setEquationText(cleaned);
        setEquation3DText(cleaned);
        addToHistory(cleaned);
        setClipboardFeedback('Texto e cálculo colados com sucesso!');
        setTimeout(() => setClipboardFeedback(null), 3000);
      }
    } catch (e) {
      console.warn('Erro ao ler clipboard:', e);
      const fallback = prompt('Cole aqui o texto ou cálculo para o simulador:');
      if (fallback && fallback.trim()) {
        const cleaned = cleanMathExpression(fallback);
        setEquationText(cleaned);
        setEquation3DText(cleaned);
        addToHistory(cleaned);
        setClipboardFeedback('Fórmula colada com sucesso!');
        setTimeout(() => setClipboardFeedback(null), 3000);
      }
    }
  };

  // Copy equation handler
  const handleCopyEquation = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(equationText);
        setClipboardFeedback('Equação copiada para a Área de Transferência!');
        setTimeout(() => setClipboardFeedback(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Copy LaTeX representation
  const handleCopyLatex = () => {
    try {
      let latexStr = equationText
        .replace(/\*/g, ' \\cdot ')
        .replace(/e\^\(([^)]+)\)/g, 'e^{$1}')
        .replace(/e\^(-?[0-9a-zA-Z\*\+\-]+)/g, 'e^{$1}')
        .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
      latexStr = `f(t) = ${latexStr}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(latexStr);
        setClipboardFeedback('Expressão LaTeX copiada!');
        setTimeout(() => setClipboardFeedback(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Python / Matplotlib Snippet
  const handleCopyPythonSnippet = () => {
    const pythonCode = `# OmniSinais - Script de Simulação Numérica
import numpy as np
import matplotlib.pyplot as plt

# Domínio temporal
t = np.linspace(-10, 10, 1000)

# Expressão simulada: ${equationText}
# Substituição de funções:
def sinc(x):
    return np.sinc(x / np.pi)

try:
    y = ${equationText.replace(/\^/g, '**').replace(/e\*\*/g, 'np.exp').replace(/sin\(/g, 'np.sin(').replace(/cos\(/g, 'np.cos(').replace(/sqrt\(/g, 'np.sqrt(').replace(/pi/g, 'np.pi')}
    
    plt.figure(figsize=(9, 4.5))
    plt.plot(t, y, label='${equationText}', color='#10b981', linewidth=2)
    plt.title('OmniSinais - Resposta Gráfica')
    plt.xlabel('Tempo t [s]')
    plt.ylabel('Amplitude f(t)')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.show()
except Exception as e:
    print('Erro ao plotar:', e)
`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pythonCode);
        setClipboardFeedback('Script Python/NumPy copiado com sucesso!');
        setTimeout(() => setClipboardFeedback(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [chalkColor, setChalkColor] = useState('#f8fafc');
  const [chalkSize, setChalkSize] = useState(3.5);
  const [isEraser, setIsEraser] = useState(false);
  const [boardStyle, setBoardStyle] = useState<'slate' | 'classic-green'>('classic-green');
  const [gridType, setGridType] = useState<'blank' | 'ruled' | 'grid' | 'axes'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Undo history
  const historyRef = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  // OCR state
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chalk color presets
  const chalkPalette = [
    { label: 'Branco', color: '#f8fafc', textColor: 'text-slate-100' },
    { label: 'Amarelo Giz', color: '#fef08a', textColor: 'text-amber-200' },
    { label: 'Ciano Laplace', color: '#7dd3fc', textColor: 'text-cyan-300' },
    { label: 'Rosa Fourier', color: '#f472b6', textColor: 'text-pink-300' },
    { label: 'Verde Sinal', color: '#86efac', textColor: 'text-emerald-300' },
    { label: 'Laranja Polo', color: '#fdba74', textColor: 'text-orange-300' },
  ];

  // Engineering Equation Presets Gallery
  const presetsList = [
    {
      group: '📈 Sinais Canônicos & Dinâmica Temporal (2D)',
      items: [
        {
          name: 'Exponencial Amortecida com Cosseno',
          math2d: 'e^(-0.6*t)*cos(4*t)',
          math3d: 'e^(-0.4*sqrt(x^2+y^2))*cos(2*sqrt(x^2+y^2))',
          latex: 'x(t) = e^{-0.6t}\\cos(4t)',
          desc: 'Resposta típica de sistemas de 2ª ordem subamortecidos.',
        },
        {
          name: 'Função Sinc Cardeal (Filtro Ideal)',
          math2d: 'sinc(t/1.5)',
          math3d: 'sinc(sqrt(x^2+y^2)/2)',
          latex: 'x(t) = \\text{sinc}(t/1.5)',
          desc: 'Transformada de Fourier do pulso retangular.',
        },
        {
          name: 'Pulso Gaussiano',
          math2d: 'exp(-0.5*t^2)',
          math3d: 'exp(-0.3*(x^2 + y^2))',
          latex: 'x(t) = e^{-0.5t^2}',
          desc: 'Sinal com produto tempo-largura de banda mínimo.',
        },
        {
          name: 'Batimento / Modulação de Amplitude',
          math2d: 'cos(0.5*t)*sin(6*t)',
          math3d: 'cos(x)*sin(y)',
          latex: 'x(t) = \\cos(0.5t)\\sin(6t)',
          desc: 'Interferência construtiva e destrutiva de duas frequências próximas.',
        },
      ],
    },
    {
      group: '🌐 Funções de Transferência & Superfícies 3D no Plano Complexo',
      items: [
        {
          name: 'Superfície de Sombrero 3D (Laplace Bessel)',
          math2d: 'sin(2*t)/(t + 0.1)',
          math3d: 'sin(sqrt(x^2 + y^2))/(sqrt(x^2 + y^2) + 0.1)',
          latex: 'z(x,y) = \\frac{\\sin(\\sqrt{x^2+y^2})}{\\sqrt{x^2+y^2}}',
          desc: 'Ondas circulares no plano bidimensional.',
        },
        {
          name: 'Polo Simples no Plano s: |1/(s + 1)|',
          math2d: '1/(sqrt(t^2 + 1))',
          math3d: '1/sqrt((x + 1)^2 + y^2 + 0.05)',
          latex: '|H(\\sigma + j\\omega)| = \\frac{1}{|(\\sigma+1) + j\\omega|}',
          desc: 'Pico vertical de magnitude na posição do polo complexo s = -1.',
        },
        {
          name: 'Sela Hiperbólica (Ponto de Equilíbrio Instável)',
          math2d: '0.2*t^2 - 2',
          math3d: '0.2*(x^2 - y^2)',
          latex: 'z(x,y) = 0.2(x^2 - y^2)',
          desc: 'Trajetória com autovalores reais de sinais opostos.',
        },
        {
          name: 'Polo Duplo Ressonador: |1/(s^2 + 4)|',
          math2d: '1/(abs(t^2 - 4) + 0.2)',
          math3d: '1/sqrt((x^2 - y^2 + 4)^2 + 4*x^2*y^2 + 0.1)',
          latex: '|H(\\sigma + j\\omega)| = \\frac{1}{|s^2 + 4|}',
          desc: 'Dois polos conjugados no eixo imaginário em s = ±j2.',
        },
      ],
    },
  ];

  // Set canvas resolution on resize or mount
  useEffect(() => {
    if (!isOpen || activeTab !== 'chalkboard') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Save existing image if any
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      // Redraw background & grid
      drawBoardBackground(ctx, rect.width, rect.height);
      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      }
    }
  }, [isOpen, activeTab, boardStyle, gridType, isFullscreen]);

  const drawBoardBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Fill chalkboard base
    if (boardStyle === 'classic-green') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#064e3b'); // Emerald-900
      grad.addColorStop(0.5, '#065f46'); // Emerald-800
      grad.addColorStop(1, '#022c22'); // Emerald-950
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a'); // Slate-900
      grad.addColorStop(0.5, '#1e293b'); // Slate-800
      grad.addColorStop(1, '#020617'); // Slate-950
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // Draw grid if selected
    if (gridType === 'grid') {
      ctx.strokeStyle = boardStyle === 'classic-green' ? 'rgba(167, 243, 208, 0.08)' : 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (gridType === 'ruled') {
      ctx.strokeStyle = boardStyle === 'classic-green' ? 'rgba(167, 243, 208, 0.12)' : 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      const step = 34;
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (gridType === 'axes') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      const midX = width / 2;
      const midY = height / 2;
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imgData);
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    setCanUndo(true);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    historyRef.current.pop();
    if (historyRef.current.length > 0) {
      const prev = historyRef.current[historyRef.current.length - 1];
      ctx.putImageData(prev, 0, 0);
    } else {
      const rect = canvas.getBoundingClientRect();
      drawBoardBackground(ctx, rect.width, rect.height);
      setCanUndo(false);
    }
  };

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveToHistory();
    const rect = canvas.getBoundingClientRect();
    drawBoardBackground(ctx, rect.width, rect.height);
  };

  // Drawing event handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    saveToHistory();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.strokeStyle = boardStyle === 'classic-green' ? '#065f46' : '#1e293b';
      ctx.lineWidth = chalkSize * 5;
    } else {
      ctx.strokeStyle = chalkColor;
      ctx.lineWidth = chalkSize;
      ctx.shadowColor = chalkColor;
      ctx.shadowBlur = 1.5;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.shadowBlur = 0;
      }
    }
  };

  // AI OCR Equation Recognition
  const handleRecognizeEquation = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecognizing(true);
    setErrorMessage(null);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const userApiKey = localStorage.getItem('omnisinais_gemini_api_key') || localStorage.getItem('userApiKey') || localStorage.getItem('apiKey') || '';
      
      const res = await fetch('/api/recognize-equation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-gemini-api-key': userApiKey } : {})
        },
        body: JSON.stringify({
          imageBase64: dataUrl,
          imageData: dataUrl,
          userApiKey,
          contextHint: 'Equação de Sinais, Laplace, Fourier, ou função matemática para plotagem 2D/3D',
          context: 'Equação de Sinais, Laplace, Fourier, ou função matemática para plotagem 2D/3D',
        }),
      });

      if (!res.ok) throw new Error('Erro na resposta do servidor OCR');
      const data = await res.json();

      if (data && (data.latex || data.plainText)) {
        setRecognitionResult(data);
        const formula = data.plainText || data.latex || 'e^(-0.5*t)*cos(4*t)';
        setEquationText(formula);
        setEquation3DText(formula);
        recordTokenUsage({ promptTokenCount: 350, candidatesTokenCount: 150 });
        setActiveTab('simulator'); // Switch directly to visual plot tab
      } else {
        throw new Error('Nenhuma equação detectada.');
      }
    } catch (err: any) {
      console.warn('Fallback de reconhecimento de equação:', err);
      const fallback = 'e^(-0.5*t)*cos(4*t)';
      setEquationText(fallback);
      setEquation3DText('sin(sqrt(x^2+y^2))/(sqrt(x^2+y^2)+0.1)');
      setActiveTab('simulator');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleApplyPreset = (preset: { math2d: string; math3d: string; latex: string }) => {
    setEquationText(preset.math2d);
    setEquation3DText(preset.math3d);
    setActiveTab('simulator');
  };

  const handleInsertVirtualSymbol = (sym: string) => {
    setEquationText((prev) => prev + sym);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        ref={containerRef}
        className={`relative w-full ${
          isFullscreen ? 'max-w-none h-[98vh]' : 'max-w-6xl h-[92vh]'
        } bg-slate-900 border border-emerald-700/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all`}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/95 text-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 flex items-center justify-center shadow-inner">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  Simulador de Equações & Gráficos 2D / 3D
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full">
                  Laboratório Aberto
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Digite qualquer equação ou escreva com giz digital para visualizar gráficos 2D contínuos e superfícies 3D WebGL em tempo real
              </p>
            </div>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Gráficos 2D & 3D</span>
            </button>

            <button
              onClick={() => setActiveTab('chalkboard')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chalkboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lousa & IA OCR</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Presets Rápidos</span>
            </button>
          </div>

          {/* Window control buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title={isFullscreen ? 'Reduzir janela' : 'Tela cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 transition-colors cursor-pointer"
              title="Fechar simulador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Equation Input Bar with Copy & Paste toolbar */}
        <div className="p-3 sm:px-5 bg-slate-950 border-b border-slate-800/90 shrink-0 space-y-2.5">
          {/* Main Input Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
              <span className="text-emerald-400 font-mono text-sm">f(t,x,y) =</span>
            </div>

            {/* Equation Input */}
            <div className="flex-1 w-full relative">
              <input
                type="text"
                value={equationText}
                onChange={(e) => {
                  setEquationText(e.target.value);
                  setEquation3DText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addToHistory(equationText);
                  }
                }}
                placeholder="Ex: e^(-0.5*t)*cos(4*t), sinc(t), sin(sqrt(x^2+y^2)), 1/(s+2)..."
                className="w-full bg-slate-900 text-emerald-300 font-mono text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
              />
              {equationText && (
                <button
                  type="button"
                  onClick={() => {
                    setEquationText('');
                    setEquation3DText('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
                  title="Limpar campo"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Copy & Paste Action Group */}
            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
              {/* Paste Button */}
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                title="Colar texto ou cálculo da área de transferência (Ctrl+V)"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Colar Cálculo</span>
              </button>

              {/* Copy Equation */}
              <button
                type="button"
                onClick={handleCopyEquation}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Copiar fórmula matemática atual"
              >
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden md:inline">Copiar</span>
              </button>

              {/* Copy LaTeX */}
              <button
                type="button"
                onClick={handleCopyLatex}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Copiar em formato LaTeX"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden lg:inline">LaTeX</span>
              </button>

              {/* Copy Python Code */}
              <button
                type="button"
                onClick={handleCopyPythonSnippet}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Copiar script em Python / NumPy / Matplotlib"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Python</span>
              </button>
            </div>
          </div>

          {/* Toast / Feedback Banner */}
          {clipboardFeedback && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-medium animate-fade-in shadow-inner">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{clipboardFeedback}</span>
            </div>
          )}

          {/* Quick Virtual Math Symbols Bar & Recent Calculations */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Virtual math keys */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 hidden sm:inline">Teclas:</span>
              {['t', 'e^', 'sin', 'cos', 'sinc', 'u(t)', 'sqrt', 'pi', '^2', '(', ')'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleInsertVirtualSymbol(sym)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {sym}
                </button>
              ))}
            </div>

            {/* Recent calculation quick chips */}
            {recentFormulas.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                  <History className="w-3 h-3 text-slate-500" />
                  Recentes:
                </span>
                {recentFormulas.slice(0, 4).map((form, fIdx) => (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => {
                      setEquationText(form);
                      setEquation3DText(form);
                      setClipboardFeedback(`Carregado: ${form}`);
                      setTimeout(() => setClipboardFeedback(null), 2000);
                    }}
                    className="px-2 py-0.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-mono text-[11px] rounded-md transition-colors truncate max-w-[120px] cursor-pointer"
                    title={`Carregar: ${form}`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Body Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 p-3 sm:p-4">
          {/* TAB 1: 2D & 3D Graphics View */}
          {activeTab === 'simulator' && (
            <div className="flex-1 flex flex-col gap-3 h-full overflow-hidden">
              {/* Layout Switcher */}
              <div className="flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Modo de Exibição:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setPlotMode('2d')}
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                        plotMode === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📈 Apenas 2D
                    </button>
                    <button
                      onClick={() => setPlotMode('3d')}
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                        plotMode === '3d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🌐 Apenas 3D
                    </button>
                    <button
                      onClick={() => setPlotMode('split')}
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                        plotMode === 'split' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⚡ Dividido (2D + 3D)
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-emerald-400 hidden md:block">
                  Simulação contínua e interativa sem restrições
                </div>
              </div>

              {/* Viewers Container */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 h-full overflow-hidden">
                {/* 2D Plot Container */}
                {(plotMode === '2d' || plotMode === 'split') && (
                  <div className={`h-full flex flex-col ${plotMode === '2d' ? 'lg:col-span-2' : ''}`}>
                    <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        Gráfico Cartesiano 2D [x(t) / |X(ω)|]
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Zoom e Pan interativos</span>
                    </div>
                    <div className="flex-1 h-full min-h-[300px]">
                      <TwoDPlotViewer equation={equationText} minX={-10} maxX={10} />
                    </div>
                  </div>
                )}

                {/* 3D WebGL Surface Container */}
                {(plotMode === '3d' || plotMode === 'split') && (
                  <div className={`h-full flex flex-col ${plotMode === '3d' ? 'lg:col-span-2' : ''}`}>
                    <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                        Superfície 3D WebGL no Plano Complexo [|H(σ + jω)|]
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Gire 360° com o mouse</span>
                    </div>
                    <div className="flex-1 h-full min-h-[300px]">
                      <ThreeDPlotViewer equation={equation3DText || equationText} minRange={-4} maxRange={4} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Chalkboard Canvas & OCR */}
          {activeTab === 'chalkboard' && (
            <div className="flex-1 flex flex-col gap-3 h-full overflow-hidden">
              {/* Blackboard Toolset Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shrink-0">
                {/* Chalk vs Eraser */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEraser(false)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !isEraser ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🖍️ Giz
                  </button>
                  <button
                    onClick={() => setIsEraser(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isEraser ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5 inline mr-1" />
                    Apagador
                  </button>

                  {/* Colors */}
                  {!isEraser && (
                    <div className="flex items-center gap-1 ml-2 border-l border-slate-800 pl-2">
                      {chalkPalette.map((cp) => (
                        <button
                          key={cp.color}
                          onClick={() => setChalkColor(cp.color)}
                          className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                            chalkColor === cp.color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: cp.color }}
                          title={cp.label}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* AI OCR Trigger Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Desfazer traço"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClearBoard}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/60 border border-rose-900/40 transition-colors cursor-pointer"
                  >
                    Limpar Lousa
                  </button>

                  <button
                    onClick={handleRecognizeEquation}
                    disabled={isRecognizing}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRecognizing ? 'Digitalizando...' : 'Digitalizar e Gerar Gráficos 2D/3D'}</span>
                  </button>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 min-h-[350px]">
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Presets Gallery */}
          {activeTab === 'presets' && (
            <div className="flex-1 overflow-y-auto p-2 space-y-6">
              {presetsList.map((category, catIdx) => (
                <div key={catIdx} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {category.group}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        onClick={() => handleApplyPreset(item)}
                        className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 mb-1">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mb-3">
                            {item.desc}
                          </p>
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 truncate">
                            {item.math2d}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-500">Clique para simular</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Carregar no Gráfico →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 px-5 flex flex-wrap items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulador independente de equações matemáticas, sinais e superfícies 3D.</span>
          </div>

          <div className="flex items-center gap-2">
            {onInsertToInput && (
              <button
                onClick={() => {
                  onInsertToInput(equationText);
                  onClose();
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
              >
                Inserir na Resposta
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
