import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Eraser, RotateCcw, PenTool, Download, Undo2, Redo2 } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#38bdf8');
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Undo/Redo history stack of ImageData snapshots
  const historyRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Slice off any redo history if we draw a new stroke
    const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
    newHistory.push(imageData);
    // Limit history stack size to 25 to preserve memory
    if (newHistory.length > 25) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyStepRef.current = newHistory.length - 1;
    setCanUndo(historyStepRef.current > 0);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyStepRef.current <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyStepRef.current -= 1;
    const prevState = historyRef.current[historyStepRef.current];
    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
    }
    setCanUndo(historyStepRef.current > 0);
    setCanRedo(historyStepRef.current < historyRef.current.length - 1);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyStepRef.current >= historyRef.current.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyStepRef.current += 1;
    const nextState = historyRef.current[historyStepRef.current];
    if (nextState) {
      ctx.putImageData(nextState, 0, 0);
    }
    setCanUndo(historyStepRef.current > 0);
    setCanRedo(historyStepRef.current < historyRef.current.length - 1);
  }, []);

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isOpen, handleUndo, handleRedo]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Dark grid background
    drawGrid(ctx, rect.width, rect.height);

    // Initialize history with clean grid state
    const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [initialImageData];
    historyStepRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  }, [isOpen]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const gridSize = 24;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#090d16' : penColor;
    ctx.lineWidth = isEraser ? penSize * 4 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawGrid(ctx, rect.width, rect.height);
    saveCanvasState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Lousa de Rascunho & Cálculo Manual</h3>
              <p className="text-xs text-slate-400">Esboce contas, matrizes, frações e gráficos livremente</p>
            </div>
          </div>

          {/* Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Palette */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              {['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setPenColor(c);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full mx-1 transition-transform ${
                    !isEraser && penColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Eraser */}
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                isEraser
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eraser className="w-4 h-4" />
              Borracha
            </button>

            {/* Undo (Ctrl+Z) */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                canUndo
                  ? 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700 hover:text-sky-300 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title="Desfazer traço (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Desfazer</span>
            </button>

            {/* Redo (Ctrl+Y) */}
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                canRedo
                  ? 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700 hover:text-sky-300 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title="Refazer traço (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Refazer</span>
            </button>

            {/* Clear Canvas */}
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 border border-slate-700 text-slate-300 hover:text-rose-300 transition-colors"
              title="Limpar lousa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 bg-slate-950 touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>
      </div>
    </div>
  );
};

export default ScratchpadModal;
