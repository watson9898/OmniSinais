import React, { useState, useEffect, useRef } from 'react';
import { MathView } from './MathView';
import { Activity, Sliders, Layers, Compass, Zap, Info } from 'lucide-react';

export const InteractiveSignalVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transformations' | 'fourier' | 'laplace_poles'>('transformations');

  // Transformations state
  const [signalType, setSignalType] = useState<'pulse' | 'step' | 'ramp' | 'exponential'>('pulse');
  const [scaleA, setScaleA] = useState<number>(1);
  const [shiftB, setShiftB] = useState<number>(0);
  const [ampC, setAmpC] = useState<number>(1);

  // Fourier state
  const [fourierHarmonics, setFourierHarmonics] = useState<number>(5);
  const [fourierWaveform, setFourierWaveform] = useState<'square' | 'sawtooth' | 'triangle'>('square');

  // Laplace Poles state
  const [poleSigma, setPoleSigma] = useState<number>(-1); // Real part
  const [poleOmega, setPoleOmega] = useState<number>(2);  // Imag part

  const transformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fourierCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const polesCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const responseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw Transformations
  useEffect(() => {
    if (activeTab !== 'transformations') return;
    const canvas = transformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2 + 20;
    const scaleX = 35;
    const scaleY = 45;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = -6; x <= 6; x++) {
      const cx = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`${x}`, cx - 3, originY + 14);
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('t (s)', width - 25, originY - 6);
    ctx.fillText('r(t)', originX + 8, 15);

    // Function evaluate f(t)
    const baseF = (t: number): number => {
      if (signalType === 'pulse') return t >= 0 && t <= 2 ? 1 : 0;
      if (signalType === 'step') return t >= 0 ? 1 : 0;
      if (signalType === 'ramp') return t >= 0 ? t : 0;
      if (signalType === 'exponential') return t >= 0 ? Math.exp(-t) : 0;
      return 0;
    };

    // Plot original f(t) (ghost line)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < width; px += 2) {
      const t = (px - originX) / scaleX;
      const y = baseF(t);
      const py = originY - y * scaleY;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot transformed r(t) = c * f(a*t - b)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px < width; px += 2) {
      const t = (px - originX) / scaleX;
      const arg = scaleA * t - shiftB;
      const y = ampC * baseF(arg);
      const py = originY - y * scaleY;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [activeTab, signalType, scaleA, shiftB, ampC]);

  // Draw Fourier Synthesis
  useEffect(() => {
    if (activeTab !== 'fourier') return;
    const canvas = fourierCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const originX = 40;
    const originY = height / 2;
    const scaleX = (width - 60) / (4 * Math.PI);
    const scaleY = 40;

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 10);
    ctx.lineTo(originX, height - 10);
    ctx.stroke();

    // Plot Fourier series sum
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const omega0 = 1; // fundamental

    for (let px = originX; px < width; px += 2) {
      const t = (px - originX) / scaleX;
      let sum = 0;

      if (fourierWaveform === 'square') {
        // Square wave: sum (4 / (n * pi)) * sin(n * omega0 * t) for n odd
        for (let k = 1; k <= fourierHarmonics; k++) {
          const n = 2 * k - 1;
          sum += (4 / (n * Math.PI)) * Math.sin(n * omega0 * t);
        }
      } else if (fourierWaveform === 'sawtooth') {
        // Sawtooth: sum (2 / (n * pi)) * (-1)^(n+1) * sin(n * omega0 * t)
        for (let n = 1; n <= fourierHarmonics; n++) {
          sum += (2 / (n * Math.PI)) * Math.pow(-1, n + 1) * Math.sin(n * omega0 * t);
        }
      } else if (fourierWaveform === 'triangle') {
        // Triangle wave: sum (8 / (pi^2 * n^2)) * (-1)^((n-1)/2) * sin(n * omega0 * t)
        for (let k = 1; k <= fourierHarmonics; k++) {
          const n = 2 * k - 1;
          const sign = ((k - 1) % 2 === 0) ? 1 : -1;
          sum += (8 / (Math.PI * Math.PI * n * n)) * sign * Math.sin(n * omega0 * t);
        }
      }

      const py = originY - sum * scaleY;
      if (px === originX) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Harmônicos ativos: N = ${fourierHarmonics}`, originX + 10, 25);
  }, [activeTab, fourierHarmonics, fourierWaveform]);

  // Draw Laplace S-Plane and Time Response
  useEffect(() => {
    if (activeTab !== 'laplace_poles') return;

    // 1. Draw S-Plane
    const sCanvas = polesCanvasRef.current;
    if (sCanvas) {
      const ctx = sCanvas.getContext('2d');
      if (ctx) {
        const w = sCanvas.width;
        const h = sCanvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);

        const ox = w / 2;
        const oy = h / 2;
        const scale = 25;

        // Left half-plane (Stable region)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(0, 0, ox, h);

        // Right half-plane (Unstable region)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
        ctx.fillRect(ox, 0, ox, h);

        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, oy);
        ctx.lineTo(w, oy);
        ctx.moveTo(ox, 0);
        ctx.lineTo(ox, h);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('Re (σ)', w - 40, oy - 6);
        ctx.fillText('Im (jω)', ox + 6, 15);

        // Draw conjugate poles (x)
        const px = ox + poleSigma * scale;
        const py1 = oy - poleOmega * scale;
        const py2 = oy + poleOmega * scale;

        const drawPoleX = (x: number, y: number) => {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x - 6, y - 6);
          ctx.lineTo(x + 6, y + 6);
          ctx.moveTo(x + 6, y - 6);
          ctx.lineTo(x - 6, y + 6);
          ctx.stroke();
        };

        drawPoleX(px, py1);
        if (poleOmega !== 0) drawPoleX(px, py2);
      }
    }

    // 2. Draw Impulse Response h(t) = e^(sigma*t)*cos(omega*t)
    const rCanvas = responseCanvasRef.current;
    if (rCanvas) {
      const ctx = rCanvas.getContext('2d');
      if (ctx) {
        const w = rCanvas.width;
        const h = rCanvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);

        const ox = 30;
        const oy = h / 2;
        const scaleX = (w - 50) / 6;
        const scaleY = 35;

        // Axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(w, oy);
        ctx.moveTo(ox, 10);
        ctx.lineTo(ox, h - 10);
        ctx.stroke();

        // Response curve
        ctx.strokeStyle = poleSigma < 0 ? '#10b981' : poleSigma === 0 ? '#fbbf24' : '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let px = ox; px < w; px += 2) {
          const t = (px - ox) / scaleX;
          // y(t) = e^(sigma*t) * cos(omega*t)
          const envelope = Math.exp(poleSigma * t);
          const y = Math.min(Math.max(envelope * Math.cos(poleOmega * t), -3), 3);
          const py = oy - y * scaleY;
          if (px === ox) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  }, [activeTab, poleSigma, poleOmega]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/80 p-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('transformations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'transformations'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          1. Operações de Sinais $r(t) = c \\cdot f(at - b)$
        </button>

        <button
          onClick={() => setActiveTab('fourier')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'fourier'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          2. Síntese da Série de Fourier
        </button>

        <button
          onClick={() => setActiveTab('laplace_poles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'laplace_poles'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          3. Plano s: Polos, Zeros & Estabilidade
        </button>
      </div>

      {/* Content Panes */}
      <div className="p-4 sm:p-6">
        {activeTab === 'transformations' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Transformações no Eixo do Tempo e Amplitude
                </h3>
                <p className="text-xs text-slate-400">
                  Observe como os parâmetros <strong className="text-sky-400">a</strong> (escala/compressão),{' '}
                  <strong className="text-purple-400">b</strong> (deslocamento/atraso) e <strong className="text-emerald-400">c</strong> alteram a forma de onda.
                </p>
              </div>

              {/* Signal Type Picker */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['pulse', 'step', 'ramp', 'exponential'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSignalType(type)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      signalType === type
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type === 'pulse' && 'Pulso'}
                    {type === 'step' && 'Degrau u(t)'}
                    {type === 'ramp' && 'Rampa r(t)'}
                    {type === 'exponential' && 'Exponencial e⁻ᵗ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center">
              <canvas
                ref={transformCanvasRef}
                width={700}
                height={260}
                className="w-full max-w-2xl h-auto"
              />
            </div>

            {/* Controls Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-sky-400">Escala de Tempo (a):</span>
                  <span className="font-mono text-slate-200">{scaleA.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.5"
                  value={scaleA}
                  onChange={(e) => setScaleA(parseFloat(e.target.value) || 1)}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  {scaleA < 0 ? 'Reflexão f(-t)' : scaleA > 1 ? 'Compressão temporal' : 'Expansão temporal'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-purple-400">Deslocamento (b):</span>
                  <span className="font-mono text-slate-200">{shiftB.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.5"
                  value={shiftB}
                  onChange={(e) => setShiftB(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  {shiftB > 0 ? 'Atraso (desloca para direita)' : shiftB < 0 ? 'Avanço (desloca para esquerda)' : 'Sem atraso'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Escala de Amplitude (c):</span>
                  <span className="font-mono text-slate-200">{ampC.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="3"
                  step="0.5"
                  value={ampC}
                  onChange={(e) => setAmpC(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block">
                  Multiplicador vertical da função
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fourier' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Síntese Harmônica da Série Trigonométrica de Fourier
                </h3>
                <p className="text-xs text-slate-400">
                  Veja o Teorema de Fourier em ação: somando harmônicos senoidais $b_n \\sin(n\\omega_0 t)$ para construir ondas arbitrárias.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['square', 'sawtooth', 'triangle'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setFourierWaveform(w)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      fourierWaveform === w
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {w === 'square' && 'Onda Quadrada'}
                    {w === 'sawtooth' && 'Dente de Serra'}
                    {w === 'triangle' && 'Triangular'}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center">
              <canvas
                ref={fourierCanvasRef}
                width={700}
                height={260}
                className="w-full max-w-2xl h-auto"
              />
            </div>

            {/* Harmonic Slider */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-400">Número de Termos Harmônicos (N):</span>
                <span className="font-mono text-indigo-300 font-bold">{fourierHarmonics} harmônicos</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={fourierHarmonics}
                onChange={(e) => setFourierHarmonics(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="text-xs text-slate-400 pt-1 flex items-center justify-between">
                <span>N=1 (Apenas fundamental $\\omega_0$)</span>
                <span>N=25 (Aproximação quase perfeita com Fenômeno de Gibbs)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'laplace_poles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                <MathView math="Mapeamento no Plano s e Resposta Dinâmica ao Impulso $h(t)$" />
              </h3>
              <div className="text-xs text-slate-400">
                <MathView math="Pólos no semiplano esquerdo ($\sigma < 0$) garantem estabilidade BIBO. No semiplano direito ($\sigma > 0$) geram respostas divergentes/instáveis." />
              </div>
            </div>

            {/* Two canvas comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Plano Complexo s: Pólos (<MathView math="s = \sigma \pm j\omega" />)</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] ${
                    poleSigma < 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {poleSigma < 0 ? 'Estável (BIBO)' : poleSigma === 0 ? 'Marginalmente Estável' : 'Instável'}
                  </span>
                </div>
                <div className="flex justify-center">
                  <canvas ref={polesCanvasRef} width={320} height={200} className="w-full max-w-xs h-auto" />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Resposta Temporal <MathView math="h(t) = e^{\sigma t}\cos(\omega t)" /></span>
                  <span className="text-[11px] font-mono text-slate-400">t &gt; 0</span>
                </div>
                <div className="flex justify-center">
                  <canvas ref={responseCanvasRef} width={320} height={200} className="w-full max-w-xs h-auto" />
                </div>
              </div>
            </div>

            {/* Pole position sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Parte Real (σ - Amortecimento):</span>
                  <span className="font-mono text-slate-200">{poleSigma.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="1.5"
                  step="0.25"
                  value={poleSigma}
                  onChange={(e) => setPoleSigma(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-sky-400">Parte Imaginária (ω - Frequência Oscilatória):</span>
                  <span className="font-mono text-slate-200">{poleOmega.toFixed(1)} rad/s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={poleOmega}
                  onChange={(e) => setPoleOmega(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveSignalVisualizer;
