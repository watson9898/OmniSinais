import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { MathView } from './MathView';
import { getQuestionGraphProfile, QuestionGraphProfile } from '../utils/questionGraphProfiles';
import {
  Eye,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Download,
  Sliders,
  Layers,
  Sparkles,
  Info,
  Compass,
  Activity,
  Box,
  BarChart2,
  Share2
} from 'lucide-react';

export interface GraphModelData {
  title?: string;
  latexEquation?: string;
  beforeEquationLatex?: string;
  afterEquationLatex?: string;
  category?: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  // Standard Poles & Zeros
  poles?: { sigma: number; omega: number; label?: string }[];
  zeros?: { sigma: number; omega: number; label?: string }[];
  // Parameters
  defaultSigma?: number;
  defaultOmega?: number;
  defaultZeta?: number;
  defaultOmegaN?: number;
  timeRange?: [number, number];
  // Fourier harmonic params
  fourierType?: 'square' | 'sawtooth' | 'triangle' | 'pulse' | 'custom';
  harmonicsCount?: number;
  // Custom formula evaluator
  evaluatorType?: 'exp_decay' | 'underdamped' | 'overdamped' | 'step_response' | 'fourier_series' | 'laplace_poles' | 'rlc_circuit' | 'pulse';
}

interface SolutionGraphVisualizerProps {
  problemId?: string;
  problemTitle: string;
  finalSolutionLatex: string;
  beforeEquationLatex?: string;
  afterEquationLatex?: string;
  statement?: string;
  category?: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  graphModel?: GraphModelData;
  className?: string;
  initialMode?: '2d' | '3d';
}

export const SolutionGraphVisualizer: React.FC<SolutionGraphVisualizerProps> = ({
  problemId,
  problemTitle,
  finalSolutionLatex,
  beforeEquationLatex,
  afterEquationLatex,
  statement = '',
  category = 'laplace',
  graphModel,
  className = '',
  initialMode = '2d',
}) => {
  // Main view mode
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  // Dedicated Math Profile for this exact question
  const questionProfile: QuestionGraphProfile = useMemo(() => {
    return getQuestionGraphProfile({
      id: problemId || '',
      title: problemTitle,
      statement,
      finalSolutionLatex,
      category,
    });
  }, [problemId, problemTitle, statement, finalSolutionLatex, category]);

  const [active2dSubTab, setActive2dSubTab] = useState<'time' | 'poles' | 'spectrum' | 'phase'>('time');
  const [active3dSubTab, setActive3dSubTab] = useState<'laplace_surface' | 'before_after_3d' | 'phase_trajectory' | 'fourier_waterfall'>('laplace_surface');

  // Before vs After comparison modes: 'after' | 'split_curtain' | 'overlay' | 'before'
  const [comparisonMode, setComparisonMode] = useState<'split_curtain' | 'overlay' | 'after' | 'before'>('split_curtain');
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); // 0 to 100%
  const [morphProgress, setMorphProgress] = useState<number>(1.0); // 0.0 (Antes) to 1.0 (Depois)
  const isDraggingSplitRef = useRef<boolean>(false);

  // Adjustable Parameters
  const [paramSigma, setParamSigma] = useState<number>(() => graphModel?.defaultSigma ?? -1.5);
  const [paramOmega, setParamOmega] = useState<number>(() => graphModel?.defaultOmega ?? 3.0);
  const [paramZeta, setParamZeta] = useState<number>(() => graphModel?.defaultZeta ?? 0.35);
  const [paramOmegaN, setParamOmegaN] = useState<number>(() => graphModel?.defaultOmegaN ?? 4.0);
  const [timeMax, setTimeMax] = useState<number>(6);
  const [amplitude, setAmplitude] = useState<number>(1.0);
  const [harmonics, setHarmonics] = useState<number>(7);
  const [showEnvelopes, setShowEnvelopes] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // 3D Visualizer controls
  const [is3dRotating, setIs3dRotating] = useState<boolean>(true);
  const [renderStyle3d, setRenderStyle3d] = useState<'solid' | 'wireframe' | 'both'>('solid');
  const [surfaceResolution, setSurfaceResolution] = useState<number>(45);

  // 2D Cursor Hover state
  const [hoverCoord, setHoverCoord] = useState<{ t: number; y: number; dy: number; px: number; py: number } | null>(null);

  // Canvas Refs
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
  const threeMountRef = useRef<HTMLDivElement | null>(null);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRotationRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.5,
    radius: 26,
  });

  // Resolved equations for Before vs After comparison
  const resolvedBeforeLatex = beforeEquationLatex || graphModel?.beforeEquationLatex || 'x(t) = u(t) \\text{ ou } x(t) = \\cos(\\omega_0 t)';
  const resolvedAfterLatex = afterEquationLatex || graphModel?.afterEquationLatex || finalSolutionLatex;

  // Deduce model details from Latex or Category if not explicitly provided
  const resolvedModel: GraphModelData = React.useMemo(() => {
    if (graphModel) return graphModel;

    const lowerLatex = (finalSolutionLatex + ' ' + statement + ' ' + problemTitle).toLowerCase();

    // Check for Fourier
    if (category === 'fourier' || lowerLatex.includes('fourier') || lowerLatex.includes('harmôn') || lowerLatex.includes('série')) {
      let fType: 'square' | 'sawtooth' | 'triangle' = 'square';
      if (lowerLatex.includes('dente de serra') || lowerLatex.includes('sawtooth')) fType = 'sawtooth';
      if (lowerLatex.includes('triangular') || lowerLatex.includes('triangle')) fType = 'triangle';

      return {
        category: 'fourier',
        fourierType: fType,
        evaluatorType: 'fourier_series',
        harmonicsCount: 7,
        timeRange: [0, 8],
        defaultSigma: 0,
        defaultOmega: 1.0,
      };
    }

    // Parse exponential factor (e^-at or e^at)
    let parsedSigma = -1.5;
    const expMatch = lowerLatex.match(/e\^\{?(-?\d*\.?\d*)\s*t\}?/);
    if (expMatch && expMatch[1] !== undefined) {
      const rawVal = expMatch[1];
      if (rawVal === '-') parsedSigma = -1.0;
      else if (rawVal === '') parsedSigma = 1.0;
      else {
        const p = parseFloat(rawVal);
        if (!isNaN(p)) parsedSigma = p;
      }
    }

    // Parse frequency factor (cos(wt) or sin(wt))
    let parsedOmega = 3.0;
    const cosMatch = lowerLatex.match(/(?:cos|sin|sen)\(?(\d*\.?\d*)\s*t\)?/);
    if (cosMatch && cosMatch[1] !== undefined) {
      const rawVal = cosMatch[1];
      if (rawVal === '') parsedOmega = 1.0;
      else {
        const p = parseFloat(rawVal);
        if (!isNaN(p) && p > 0) parsedOmega = p;
      }
    }

    // Check for Underdamped / Oscillatory response (cos, sin, complex roots)
    if (lowerLatex.includes('cos') || lowerLatex.includes('sin') || lowerLatex.includes('sen') || lowerLatex.includes('subamortecido')) {
      const wn = Math.sqrt(parsedSigma * parsedSigma + parsedOmega * parsedOmega) || 3.5;
      const zeta = Math.min(1.0, Math.max(0.01, Math.abs(parsedSigma) / (wn || 1)));
      return {
        category: 'laplace',
        evaluatorType: 'underdamped',
        defaultSigma: parsedSigma,
        defaultOmega: parsedOmega,
        defaultZeta: parseFloat(zeta.toFixed(2)),
        defaultOmegaN: parseFloat(wn.toFixed(2)),
        poles: [
          { sigma: parsedSigma, omega: parsedOmega, label: `s₁ = ${parsedSigma.toFixed(1)} + j${parsedOmega.toFixed(1)}` },
          { sigma: parsedSigma, omega: -parsedOmega, label: `s₂ = ${parsedSigma.toFixed(1)} - j${parsedOmega.toFixed(1)}` },
        ],
        timeRange: [0, Math.max(5, Math.min(15, Math.ceil(6 / (Math.abs(parsedSigma) || 1))))],
      };
    }

    // Check for Overdamped / Exponential Real Roots
    if (lowerLatex.includes('e^') || lowerLatex.includes('exp') || lowerLatex.includes('superamortecido') || lowerLatex.includes('frações')) {
      const s1 = parsedSigma !== 0 ? parsedSigma : -2.0;
      const s2 = s1 * 2.5;
      return {
        category: 'differential_equations',
        evaluatorType: 'overdamped',
        defaultSigma: s1,
        defaultOmega: 0,
        defaultZeta: 1.5,
        defaultOmegaN: Math.abs(s1),
        poles: [
          { sigma: s1, omega: 0, label: `s₁ = ${s1.toFixed(1)}` },
          { sigma: s2, omega: 0, label: `s₂ = ${s2.toFixed(1)}` },
        ],
        timeRange: [0, Math.max(4, Math.min(12, Math.ceil(5 / (Math.abs(s1) || 1))))],
      };
    }

    // Default to general second-order dynamic response
    return {
      category: category || 'laplace',
      evaluatorType: 'underdamped',
      defaultSigma: -1.5,
      defaultOmega: 3.0,
      poles: [
        { sigma: -1.5, omega: 3.0, label: 's₁' },
        { sigma: -1.5, omega: -3.0, label: 's₂' },
      ],
      timeRange: [0, 6],
    };
  }, [category, finalSolutionLatex, statement, problemTitle, graphModel]);

  // Synchronize dynamic parameters when problem changes
  useEffect(() => {
    if (resolvedModel.defaultSigma !== undefined) {
      setParamSigma(resolvedModel.defaultSigma);
    }
    if (resolvedModel.defaultOmega !== undefined) {
      setParamOmega(resolvedModel.defaultOmega);
    }
    if (resolvedModel.defaultZeta !== undefined) {
      setParamZeta(resolvedModel.defaultZeta);
    }
    if (resolvedModel.defaultOmegaN !== undefined) {
      setParamOmegaN(resolvedModel.defaultOmegaN);
    }
    if (resolvedModel.harmonicsCount !== undefined) {
      setHarmonics(resolvedModel.harmonicsCount);
    }
    if (resolvedModel.timeRange) {
      setTimeMax(resolvedModel.timeRange[1]);
    }
  }, [resolvedModel, problemTitle]);

  const handleResetToQuestionTheory = () => {
    if (resolvedModel.defaultSigma !== undefined) setParamSigma(resolvedModel.defaultSigma);
    if (resolvedModel.defaultOmega !== undefined) setParamOmega(resolvedModel.defaultOmega);
    if (resolvedModel.defaultZeta !== undefined) setParamZeta(resolvedModel.defaultZeta);
    if (resolvedModel.defaultOmegaN !== undefined) setParamOmegaN(resolvedModel.defaultOmegaN);
    if (resolvedModel.harmonicsCount !== undefined) setHarmonics(resolvedModel.harmonicsCount);
    if (resolvedModel.timeRange) setTimeMax(resolvedModel.timeRange[1]);
    setAmplitude(1.0);
  };

  // Compute BEFORE time domain function x(t) - Excitação/Sinal Inicial sem amortecimento
  const computeBeforeTimeResponse = (t: number): { y: number; dy: number } => {
    if (questionProfile?.timeDomain?.evaluator) {
      const res = questionProfile.timeDomain.evaluator(t);
      if (res.beforeY !== undefined) {
        return { y: res.beforeY * amplitude, dy: res.dy || 0 };
      }
    }

    if (t < 0) return { y: 0, dy: 0 };

    if (resolvedModel.evaluatorType === 'fourier_series') {
      const omega0 = 1.0;
      const y = amplitude * Math.sin(omega0 * t);
      const dy = amplitude * omega0 * Math.cos(omega0 * t);
      return { y, dy };
    }

    if (resolvedModel.evaluatorType === 'overdamped') {
      // Degrau unitário puro de entrada u(t)
      const y = amplitude * 1.0;
      const dy = 0;
      return { y, dy };
    }

    // Oscilador Harmônico Puro (Sem amortecimento, sigma = 0, energia constante)
    const wn = Math.sqrt(paramSigma * paramSigma + paramOmega * paramOmega) || 3.0;
    const y = amplitude * Math.cos(wn * t);
    const dy = -amplitude * wn * Math.sin(wn * t);
    return { y, dy };
  };

  // Compute AFTER time domain function y(t) - Solução Completa Amortecida / Estabilizada
  const computeAfterTimeResponse = (t: number): { y: number; dy: number } => {
    if (questionProfile?.timeDomain?.evaluator) {
      const res = questionProfile.timeDomain.evaluator(t);
      return { y: res.y * amplitude, dy: (res.dy || 0) * amplitude };
    }

    if (t < 0) return { y: 0, dy: 0 };

    if (resolvedModel.evaluatorType === 'fourier_series') {
      const omega0 = 1.0;
      let y = 0;
      let dy = 0;
      const type = resolvedModel.fourierType || 'square';

      for (let k = 1; k <= harmonics; k++) {
        if (type === 'square') {
          const n = 2 * k - 1;
          const coeff = (4 / (n * Math.PI)) * amplitude;
          y += coeff * Math.sin(n * omega0 * t);
          dy += coeff * n * omega0 * Math.cos(n * omega0 * t);
        } else if (type === 'sawtooth') {
          const n = k;
          const coeff = (2 / (n * Math.PI)) * Math.pow(-1, n + 1) * amplitude;
          y += coeff * Math.sin(n * omega0 * t);
          dy += coeff * n * omega0 * Math.cos(n * omega0 * t);
        } else if (type === 'triangle') {
          const n = 2 * k - 1;
          const sign = ((k - 1) % 2 === 0) ? 1 : -1;
          const coeff = (8 / (Math.PI * Math.PI * n * n)) * sign * amplitude;
          y += coeff * Math.sin(n * omega0 * t);
          dy += coeff * n * omega0 * Math.cos(n * omega0 * t);
        }
      }
      return { y, dy };
    }

    if (resolvedModel.evaluatorType === 'overdamped') {
      const s1 = paramSigma;
      const s2 = paramSigma * 2.5;
      const y = amplitude * (Math.exp(s1 * t) - Math.exp(s2 * t));
      const dy = amplitude * (s1 * Math.exp(s1 * t) - s2 * Math.exp(s2 * t));
      return { y, dy };
    }

    // Default underdamped / exponential oscillatory
    const env = Math.exp(paramSigma * t);
    const wd = Math.abs(paramOmega) > 0.01 ? Math.abs(paramOmega) : 1;
    const y = amplitude * env * Math.cos(wd * t);
    const dy = amplitude * env * (paramSigma * Math.cos(wd * t) - wd * Math.sin(wd * t));
    return { y, dy };
  };

  // Compute time response according to comparison state
  const computeTimeResponse = (t: number): { y: number; dy: number } => {
    if (comparisonMode === 'before') {
      return computeBeforeTimeResponse(t);
    }
    return computeAfterTimeResponse(t);
  };

  // ----------------------------------------------------
  // 2D Canvas Renderer
  // ----------------------------------------------------
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background styling
    const isDark = document.documentElement.classList.contains('dark') || true;
    ctx.fillStyle = isDark ? '#0b1120' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (active2dSubTab === 'time') {
      render2dTimeDomain(ctx, width, height);
    } else if (active2dSubTab === 'poles') {
      render2dPoleZero(ctx, width, height);
    } else if (active2dSubTab === 'spectrum') {
      render2dFrequencySpectrum(ctx, width, height);
    } else if (active2dSubTab === 'phase') {
      render2dPhasePortrait(ctx, width, height);
    }
  }, [
    viewMode,
    active2dSubTab,
    comparisonMode,
    splitSliderPos,
    paramSigma,
    paramOmega,
    paramZeta,
    timeMax,
    amplitude,
    harmonics,
    showEnvelopes,
    showGrid,
    resolvedModel,
    hoverCoord
  ]);

  // 2D Time Domain Graph (With Before vs After Split Curtain & Overlay)
  const render2dTimeDomain = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const padLeft = 55;
    const padRight = 30;
    const padTop = 32;
    const padBottom = 45;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    // Scale calculations
    const tMin = 0;
    const tMax = timeMax;
    let yMin = -1.5 * amplitude;
    let yMax = 1.5 * amplitude;

    if (resolvedModel.evaluatorType === 'overdamped') {
      yMin = -0.2 * amplitude;
      yMax = 1.2 * amplitude;
    }

    const mapX = (t: number) => padLeft + ((t - tMin) / (tMax - tMin)) * plotWidth;
    const mapY = (y: number) => padTop + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;

    const splitPx = padLeft + (splitSliderPos / 100) * plotWidth;

    // Background Zones for Split Curtain Mode
    if (comparisonMode === 'split_curtain') {
      // Left: Antes background tint
      ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.fillRect(padLeft, padTop, splitPx - padLeft, plotHeight);

      // Right: Depois background tint
      ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.fillRect(splitPx, padTop, padLeft + plotWidth - splitPx, plotHeight);
    }

    // Background Grid
    if (showGrid) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      // Vertical grid lines
      const numXTicks = 6;
      for (let i = 0; i <= numXTicks; i++) {
        const tVal = tMin + (i / numXTicks) * (tMax - tMin);
        const gx = mapX(tVal);
        ctx.beginPath();
        ctx.moveTo(gx, padTop);
        ctx.lineTo(gx, padTop + plotHeight);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${tVal.toFixed(1)}s`, gx, padTop + plotHeight + 18);
      }

      // Horizontal grid lines
      const numYTicks = 6;
      for (let i = 0; i <= numYTicks; i++) {
        const yVal = yMin + (i / numYTicks) * (yMax - yMin);
        const gy = mapY(yVal);
        ctx.beginPath();
        ctx.moveTo(padLeft, gy);
        ctx.lineTo(padLeft + plotWidth, gy);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${yVal.toFixed(1)}`, padLeft - 8, gy + 4);
      }
    }

    // Zero Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    const yZero = mapY(0);
    if (yZero >= padTop && yZero <= padTop + plotHeight) {
      ctx.beginPath();
      ctx.moveTo(padLeft, yZero);
      ctx.lineTo(padLeft + plotWidth, yZero);
      ctx.stroke();
    }
    const xZero = mapX(0);
    ctx.beginPath();
    ctx.moveTo(xZero, padTop);
    ctx.lineTo(xZero, padTop + plotHeight);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Tempo t (s)', width - padRight, yZero - 8 > padTop ? yZero - 8 : padTop + 14);
    ctx.textAlign = 'left';
    ctx.fillText('Resposta / Sinal', padLeft + 8, padTop - 12);

    // Draw Exponential Envelope if underdamped and enabled
    if (showEnvelopes && resolvedModel.evaluatorType !== 'fourier_series' && comparisonMode !== 'before') {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Upper envelope
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += 2) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const env = amplitude * Math.exp(paramSigma * t);
        const cy = mapY(env);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();

      // Lower envelope
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += 2) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const env = -amplitude * Math.exp(paramSigma * t);
        const cy = mapY(env);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const stepPx = 1.5;

    // RENDER: OVERLAY MODE (Both curves with translucent dissipation area)
    if (comparisonMode === 'overlay') {
      // 1. Shaded area between Before and After
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const yB = computeBeforeTimeResponse(t).y;
        const cyB = mapY(yB);
        if (px === 0) ctx.moveTo(padLeft + px, cyB);
        else ctx.lineTo(padLeft + px, cyB);
      }
      for (let px = plotWidth; px >= 0; px -= stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const yA = computeAfterTimeResponse(t).y;
        const cyA = mapY(yA);
        ctx.lineTo(padLeft + px, cyA);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.fill();

      // 2. Before Curve (Dashed Amber)
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const { y } = computeBeforeTimeResponse(t);
        const cy = mapY(y);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. After Curve (Solid Cyan)
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const { y } = computeAfterTimeResponse(t);
        const cy = mapY(y);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Legend in top right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - padRight - 180, padTop + 5, 175, 52, 6);
      ctx.fill();
      ctx.stroke();

      // Amber Before line indicator
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(width - padRight - 170, padTop + 20);
      ctx.lineTo(width - padRight - 145, padTop + 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('ANTES: Excitação x(t)', width - padRight - 138, padTop + 23);

      // Cyan After line indicator
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(width - padRight - 170, padTop + 40);
      ctx.lineTo(width - padRight - 145, padTop + 40);
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.fillText('DEPOIS: Solução y(t)', width - padRight - 138, padTop + 43);

    } else if (comparisonMode === 'split_curtain') {
      // RENDER: SPLIT CURTAIN MODE (Interactive Before on Left, After on Right)
      // 1. Draw Before Curve on Left of split
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= splitPx - padLeft; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const { y } = computeBeforeTimeResponse(t);
        const cy = mapY(y);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();

      // 2. Draw After Curve on Right of split
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      let firstRight = true;
      for (let px = splitPx - padLeft; px <= plotWidth; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const { y } = computeAfterTimeResponse(t);
        const cy = mapY(y);
        if (firstRight) {
          ctx.moveTo(padLeft + px, cy);
          firstRight = false;
        } else {
          ctx.lineTo(padLeft + px, cy);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Draw Vertical Split Curtain Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(splitPx, padTop);
      ctx.lineTo(splitPx, padTop + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Handle Pill on Divider
      const pillW = 60;
      const pillH = 22;
      const pillY = padTop + plotHeight / 2 - pillH / 2;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(splitPx - pillW / 2, pillY, pillW, pillH, 11);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◀ ┃ ▶', splitPx, pillY + 14);

      // Section Header Tags
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('◀ ANTES (Entrada / Excitação)', padLeft + 10, padTop + 14);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.textAlign = 'right';
      ctx.fillText('DEPOIS (Solução / Resposta) ▶', padLeft + plotWidth - 10, padTop + 14);

    } else if (comparisonMode === 'before') {
      // RENDER: ONLY BEFORE
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const { y } = computeBeforeTimeResponse(t);
        const cy = mapY(y);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Exibindo: ESTADO ANTERIOR (Entrada Não Amortecida x(t))', padLeft + 10, padTop + 14);

    } else {
      // RENDER: ONLY AFTER (Default standard)
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += stepPx) {
        const t = tMin + (px / plotWidth) * (tMax - tMin);
        const { y } = computeAfterTimeResponse(t);
        const cy = mapY(y);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Exibindo: ESTADO FINAL RESOLVIDO (Resposta Amortecida y(t))', padLeft + 10, padTop + 14);
    }

    // Draw Question Annotations on 2D Time Domain
    if (questionProfile?.timeDomain?.annotations) {
      for (const ann of questionProfile.timeDomain.annotations) {
        if (ann.x >= tMin && ann.x <= tMax) {
          const ax = mapX(ann.x);
          const ay = mapY(ann.y);

          // Glowing pin dot
          ctx.fillStyle = ann.color || '#38bdf8';
          ctx.beginPath();
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Annotation callout box
          ctx.font = 'bold 9px sans-serif';
          const textW = ctx.measureText(ann.text).width;
          const annBoxW = textW + 14;
          const annBoxH = 20;
          let annBoxX = ax + 8;
          let annBoxY = ay - 24;
          if (annBoxX + annBoxW > width - padRight) annBoxX = ax - annBoxW - 8;
          if (annBoxY < padTop) annBoxY = ay + 8;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = ann.color || '#38bdf8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(annBoxX, annBoxY, annBoxW, annBoxH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = ann.color || '#38bdf8';
          ctx.textAlign = 'left';
          ctx.fillText(ann.text, annBoxX + 7, annBoxY + 13);
        }
      }
    }

    // Draw Interactive Cursor / Tooltip if hovering
    if (hoverCoord && hoverCoord.px >= padLeft && hoverCoord.px <= padLeft + plotWidth) {
      const hx = hoverCoord.px;
      const ht = tMin + ((hx - padLeft) / plotWidth) * (tMax - tMin);
      const isLeftOfSplit = comparisonMode === 'split_curtain' ? hx <= splitPx : false;
      const resp = isLeftOfSplit ? computeBeforeTimeResponse(ht) : computeAfterTimeResponse(ht);
      const hy = mapY(resp.y);

      // Vertical marker line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, padTop + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = isLeftOfSplit ? '#f59e0b' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip Card
      const tipText1 = `t = ${ht.toFixed(2)} s`;
      const tipText2 = isLeftOfSplit ? `x(t) = ${resp.y.toFixed(3)} (Antes)` : `y(t) = ${resp.y.toFixed(3)} (Depois)`;
      const tipText3 = `dy/dt = ${resp.dy.toFixed(3)}`;
      const boxW = 135;
      const boxH = 58;
      let boxX = hx + 12;
      let boxY = hy - 30;
      if (boxX + boxW > width - 10) boxX = hx - boxW - 12;
      if (boxY < padTop) boxY = padTop + 5;
      if (boxY + boxH > height - 10) boxY = height - boxH - 10;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = isLeftOfSplit ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isLeftOfSplit ? '#f59e0b' : '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(tipText1, boxX + 8, boxY + 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tipText2, boxX + 8, boxY + 32);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(tipText3, boxX + 8, boxY + 48);
    }
  };

  // 2D Pole-Zero Map (S-Plane) with Individual Question Poles & Zeros
  const render2dPoleZero = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const ox = width / 2;
    const oy = height / 2;
    const scale = Math.min(width, height) / 12;

    // Stable region (Left Half-Plane: Re(s) < 0)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.10)';
    ctx.fillRect(0, 0, ox, height);

    // Unstable region (Right Half-Plane: Re(s) > 0)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.fillRect(ox, 0, ox, height);

    // Grid circles for natural frequency omega_n
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 5; r++) {
      ctx.beginPath();
      ctx.arc(ox, oy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, oy);
    ctx.lineTo(width, oy);
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Eixo Real σ (Atenuação)', width - 15, oy - 10);
    ctx.textAlign = 'left';
    ctx.fillText('Eixo Imaginário jω (Frequência)', ox + 10, 20);

    // Draw Pole Crosses (X)
    const drawPole = (s: number, w: number, label: string, isUnstable?: boolean) => {
      const px = ox + s * scale;
      const py = oy - w * scale;

      ctx.strokeStyle = isUnstable ? '#f43f5e' : (s <= 0 ? '#38bdf8' : '#f43f5e');
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 8, py - 8);
      ctx.lineTo(px + 8, py + 8);
      ctx.moveTo(px + 8, py - 8);
      ctx.lineTo(px - 8, py + 8);
      ctx.stroke();

      // Label
      ctx.fillStyle = isUnstable ? '#fca5a5' : '#bae6fd';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, px + 10, py - 5);
    };

    // Draw Zero Circles (O)
    const drawZero = (s: number, w: number, label: string) => {
      const px = ox + s * scale;
      const py = oy - w * scale;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, px + 10, py - 5);
    };

    // Use specific poles from QuestionProfile if available
    const polesToRender = questionProfile?.poleZero?.poles || [
      { sigma: paramSigma, omega: paramOmega, label: `p₁ (${paramSigma.toFixed(1)} + j${paramOmega.toFixed(1)})`, isUnstable: paramSigma > 0 },
      ...(paramOmega !== 0 ? [{ sigma: paramSigma, omega: -paramOmega, label: `p₂ (${paramSigma.toFixed(1)} - j${paramOmega.toFixed(1)})`, isUnstable: paramSigma > 0 }] : [])
    ];

    for (const pole of polesToRender) {
      drawPole(pole.sigma, pole.omega, pole.label || `s = ${pole.sigma.toFixed(1)}${pole.omega !== 0 ? ` + j${pole.omega.toFixed(1)}` : ''}`, pole.isUnstable ?? (pole.sigma > 0));
    }

    if (questionProfile?.poleZero?.zeros) {
      for (const zero of questionProfile.poleZero.zeros) {
        drawZero(zero.sigma, zero.omega, zero.label || `z = ${zero.sigma.toFixed(1)}`);
      }
    }

    // Legend / Info badge
    const p1 = polesToRender[0];
    const wn = Math.sqrt(p1.sigma * p1.sigma + p1.omega * p1.omega);
    const zetaVal = wn > 0.001 ? Math.abs(p1.sigma) / wn : 0;
    const stability = questionProfile?.poleZero?.stabilityStatus || (p1.sigma < 0 ? 'stable' : p1.sigma === 0 ? 'marginally_stable' : 'unstable');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(15, 15, 240, 95, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Parâmetros Característicos do Plano s:', 25, 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`• Frequência Natural ωn = ${wn.toFixed(2)} rad/s`, 25, 48);
    ctx.fillText(`• Coef. Amortecimento ζ = ${zetaVal.toFixed(3)}`, 25, 62);
    ctx.fillText(`• Constante de Tempo τ = ${(1 / Math.max(0.01, Math.abs(p1.sigma))).toFixed(2)} s`, 25, 76);

    // Stability Tag
    ctx.font = 'bold 10px sans-serif';
    if (stability === 'stable') {
      ctx.fillStyle = '#10b981';
      ctx.fillText('✔ Sistema Estável (SPE)', 25, 92);
    } else if (stability === 'marginally_stable') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('⚠ Marginalmente Estável (Eixo jω)', 25, 92);
    } else {
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('✖ Sistema Instável (SPD)', 25, 92);
    }
  };

  // 2D Frequency Spectrum (Discrete Harmonics or Continuous Fourier Transform)
  const render2dFrequencySpectrum = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const padLeft = 55;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 45;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    // Background Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + plotHeight);
    ctx.lineTo(padLeft + plotWidth, padTop + plotHeight);
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotHeight);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Frequência Angular ω (rad/s)', width - padRight, padTop + plotHeight + 35);
    ctx.textAlign = 'left';
    ctx.fillText('Magnitude |X(jω)|', padLeft + 8, padTop - 10);

    // Check if QuestionProfile has dedicated continuous spectrum evaluator
    if (questionProfile?.frequencyDomain?.evaluatorMag) {
      const evalMag = questionProfile.frequencyDomain.evaluatorMag;
      const wMax = 15;
      const wMin = 0;
      let maxMagFound = 1.0;

      // Sample to find max
      for (let px = 0; px <= plotWidth; px += 4) {
        const w = wMin + (px / plotWidth) * (wMax - wMin);
        const m = evalMag(w);
        if (m > maxMagFound) maxMagFound = m;
      }

      // Shaded continuous spectral area
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + plotHeight);
      for (let px = 0; px <= plotWidth; px += 2) {
        const w = wMin + (px / plotWidth) * (wMax - wMin);
        const mag = evalMag(w);
        const cy = padTop + plotHeight - (mag / maxMagFound) * (plotHeight * 0.85);
        ctx.lineTo(padLeft + px, cy);
      }
      ctx.lineTo(padLeft + plotWidth, padTop + plotHeight);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();

      // Continuous Curve line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let px = 0; px <= plotWidth; px += 2) {
        const w = wMin + (px / plotWidth) * (wMax - wMin);
        const mag = evalMag(w);
        const cy = padTop + plotHeight - (mag / maxMagFound) * (plotHeight * 0.85);
        if (px === 0) ctx.moveTo(padLeft + px, cy);
        else ctx.lineTo(padLeft + px, cy);
      }
      ctx.stroke();

      // Grid markers for continuous frequencies
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 5; i++) {
        const wVal = (i / 5) * wMax;
        const gx = padLeft + (i / 5) * plotWidth;
        ctx.fillText(`${wVal.toFixed(1)}`, gx, padTop + plotHeight + 16);
      }
      return;
    }

    // Check if QuestionProfile has dedicated discrete harmonics
    if (questionProfile?.frequencyDomain?.harmonics) {
      const harmList = questionProfile.frequencyDomain.harmonics;
      const barCount = harmList.length;
      const barSlotWidth = plotWidth / (barCount + 1);

      for (let k = 0; k < barCount; k++) {
        const harm = harmList[k];
        const bx = padLeft + (k + 1) * barSlotWidth;
        const barH = (harm.amp / 4) * plotHeight;
        const by = Math.max(padTop + 10, padTop + plotHeight - barH);

        // Stem line
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, padTop + plotHeight);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Top dot
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${harm.freq} rad/s`, bx, padTop + plotHeight + 16);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`|c|=${harm.amp}`, bx, by - 8);
      }
      return;
    }

    // Fallback standard Fourier Series bars
    const barCount = Math.max(1, harmonics);
    const barSlotWidth = plotWidth / (barCount + 1);

    for (let k = 1; k <= barCount; k++) {
      let n = k;
      let amp = 0;
      const type = resolvedModel.fourierType || 'square';

      if (type === 'square') {
        n = 2 * k - 1;
        amp = (4 / (n * Math.PI)) * amplitude;
      } else if (type === 'sawtooth') {
        n = k;
        amp = (2 / (n * Math.PI)) * amplitude;
      } else if (type === 'triangle') {
        n = 2 * k - 1;
        amp = (8 / (Math.PI * Math.PI * n * n)) * amplitude;
      }

      const bx = padLeft + k * barSlotWidth;
      const barH = (amp / 1.5) * plotHeight;
      const by = padTop + plotHeight - barH;

      // Stem line
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, padTop + plotHeight);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Top dot
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Harmonics label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${n}ω₀`, bx, padTop + plotHeight + 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`${amp.toFixed(2)}`, bx, by - 8);
    }
  };

  // 2D Phase Portrait [y(t), y'(t)] with Auto-scaling and Flow Arrows
  const render2dPhasePortrait = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const ox = width / 2;
    const oy = height / 2;

    // Sample dynamic range
    let maxY = 0.5;
    let maxDy = 0.5;
    const dt = 0.01;
    const totalSteps = Math.floor(timeMax / dt);

    for (let i = 0; i <= totalSteps; i++) {
      const t = i * dt;
      const { y, dy } = computeTimeResponse(t);
      if (Math.abs(y) > maxY) maxY = Math.abs(y);
      if (Math.abs(dy) > maxDy) maxDy = Math.abs(dy);
    }

    const maxCoord = Math.max(maxY, maxDy, 0.5);
    const scale = (Math.min(width, height) * 0.4) / maxCoord;

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, oy);
    ctx.lineTo(width, oy);
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, height);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Posição y(t)', width - 15, oy - 10);
    ctx.textAlign = 'left';
    ctx.fillText('Velocidade y\'(t) = dy/dt', ox + 10, 20);

    // Phase Trajectory Curve
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    for (let i = 0; i <= totalSteps; i++) {
      const t = i * dt;
      const { y, dy } = computeTimeResponse(t);
      const px = ox + y * scale;
      const py = oy - dy * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Start point
    const start = computeTimeResponse(0);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ox + start.y * scale, oy - start.dy * scale, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Início t=0', ox + start.y * scale + 8, oy - start.dy * scale - 4);

    // Origin Attractor Point
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.font = '9px monospace';
    ctx.fillText('(0, 0)', ox + 6, oy + 12);
  };

  // ----------------------------------------------------
  // 3D Three.js WebGL Renderer
  // ----------------------------------------------------
  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = threeMountRef.current;
    if (!container) return;

    // Cleanup previous instance if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(20, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.8);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // 4. Mesh Group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Build 3D objects
    build3dScene(meshGroup);

    // 5. Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (is3dRotating && !isDraggingRef.current) {
        cameraRotationRef.current.theta += 0.3 * dt;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 6. Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [viewMode, active3dSubTab, paramSigma, paramOmega, harmonics, amplitude, renderStyle3d, surfaceResolution, is3dRotating, morphProgress]);

  // Update Camera in Spherical Coords
  const updateCameraPosition = () => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { theta, phi, radius } = cameraRotationRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
  };

  // Build 3D Geometry
  const build3dScene = (group: THREE.Group) => {
    // 3D Axes Reference
    const axesGrid = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    axesGrid.position.y = -3;
    group.add(axesGrid);

    if (active3dSubTab === 'laplace_surface') {
      // 3D Laplace Surface |H(sigma + j*omega)| with dynamic Morph (0 = Antes, 1 = Depois)
      const res = surfaceResolution;
      const sigmaMin = -4, sigmaMax = 2;
      const omegaMin = -5, omegaMax = 5;

      const geometry = new THREE.PlaneGeometry(12, 12, res, res);
      geometry.rotateX(-Math.PI / 2);

      const count = geometry.attributes.position.count;
      const colors = new Float32Array(count * 3);

      // Morph interpolated pole coordinates
      const effectiveSigma = paramSigma * morphProgress;
      const p1Sigma = effectiveSigma;
      const p1Omega = paramOmega;
      const p2Sigma = effectiveSigma;
      const p2Omega = -paramOmega;

      for (let i = 0; i < count; i++) {
        const x = geometry.attributes.position.getX(i); // maps to sigma
        const z = geometry.attributes.position.getZ(i); // maps to omega

        const s = sigmaMin + ((x + 6) / 12) * (sigmaMax - sigmaMin);
        const w = omegaMin + ((z + 6) / 12) * (omegaMax - omegaMin);

        let mag = 0;
        if (questionProfile?.surface3D?.evaluator3D) {
          mag = questionProfile.surface3D.evaluator3D(s, w) * amplitude;
        } else {
          // Magnitude of 2-pole system: |H(s)| = 1 / (|s - p1| * |s - p2|)
          const dist1 = Math.sqrt((s - p1Sigma) ** 2 + (w - p1Omega) ** 2) + 0.15;
          const dist2 = Math.sqrt((s - p2Sigma) ** 2 + (w - p2Omega) ** 2) + 0.15;
          mag = (amplitude * 2.5) / (dist1 * dist2);
        }
        mag = Math.min(Math.max(mag, 0.05), 8); // clamp pole peak

        geometry.attributes.position.setY(i, mag - 3);

        // Vertex Color Gradient (Heatmap: Cool Blue -> Emerald -> Amber -> Crimson)
        const tColor = Math.min(Math.max((mag - 0.2) / 6, 0), 1);
        const col = new THREE.Color();
        if (tColor < 0.3) {
          col.setRGB(0.1 + tColor, 0.4 + tColor * 1.5, 0.9);
        } else if (tColor < 0.7) {
          col.setRGB(0.2 + (tColor - 0.3) * 2, 0.8, 0.3);
        } else {
          col.setRGB(0.95, 0.2 + (1 - tColor) * 0.8, 0.2);
        }

        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.computeVertexNormals();

      // Solid Material
      if (renderStyle3d === 'solid' || renderStyle3d === 'both') {
        const material = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.3,
          metalness: 0.15,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      }

      // Wireframe Material
      if (renderStyle3d === 'wireframe' || renderStyle3d === 'both') {
        const wireMaterial = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: renderStyle3d === 'both' ? 0.25 : 0.8,
        });
        const wireMesh = new THREE.Mesh(geometry, wireMaterial);
        group.add(wireMesh);
      }

      // Highlight the Fourier Cross-Section (Sigma = 0 Slice)
      const fourierPoints: THREE.Vector3[] = [];
      for (let wVal = omegaMin; wVal <= omegaMax; wVal += 0.1) {
        const z = -6 + ((wVal - omegaMin) / (omegaMax - omegaMin)) * 12;
        const x = -6 + ((0 - sigmaMin) / (sigmaMax - sigmaMin)) * 12;

        let mag = 0;
        if (questionProfile?.surface3D?.evaluator3D) {
          mag = questionProfile.surface3D.evaluator3D(0, wVal) * amplitude;
        } else {
          const dist1 = Math.sqrt((0 - p1Sigma) ** 2 + (wVal - p1Omega) ** 2) + 0.15;
          const dist2 = Math.sqrt((0 - p2Sigma) ** 2 + (wVal - p2Omega) ** 2) + 0.15;
          mag = (amplitude * 2.5) / (dist1 * dist2);
        }
        mag = Math.min(mag, 8);

        fourierPoints.push(new THREE.Vector3(x, mag - 2.9, z));
      }

      const fourierGeo = new THREE.BufferGeometry().setFromPoints(fourierPoints);
      const fourierMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 });
      const fourierLine = new THREE.Line(fourierGeo, fourierMat);
      group.add(fourierLine);

      // Render 3D Peak Pole Markers if available
      if (questionProfile?.surface3D?.peaks) {
        for (const pk of questionProfile.surface3D.peaks) {
          const px = -6 + ((pk.sigma - sigmaMin) / (sigmaMax - sigmaMin)) * 12;
          const pz = -6 + ((pk.omega - omegaMin) / (omegaMax - omegaMin)) * 12;
          const py = Math.min(pk.height || 6, 7.5) - 3;

          // Vertical Pole Stem
          const stemGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(px, -3, pz),
            new THREE.Vector3(px, py, pz)
          ]);
          const stemMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
          const stemLine = new THREE.Line(stemGeo, stemMat);
          group.add(stemLine);

          // Glowing Sphere at peak
          const sphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
          const sphereMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239 });
          const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
          sphereMesh.position.set(px, py, pz);
          group.add(sphereMesh);
        }
      }

    } else if (active3dSubTab === 'before_after_3d') {
      // DUAL 3D COMPARATIVE SURFACES (ANTES em Âmbar vs DEPOIS em Ciano)
      const res = surfaceResolution;
      const sigmaMin = -4, sigmaMax = 2;
      const omegaMin = -5, omegaMax = 5;

      // 1. BEFORE Surface (Un-damped excitation or original input)
      const geoBefore = new THREE.PlaneGeometry(12, 12, res, res);
      geoBefore.rotateX(-Math.PI / 2);
      const countB = geoBefore.attributes.position.count;
      for (let i = 0; i < countB; i++) {
        const x = geoBefore.attributes.position.getX(i);
        const z = geoBefore.attributes.position.getZ(i);
        const s = sigmaMin + ((x + 6) / 12) * (sigmaMax - sigmaMin);
        const w = omegaMin + ((z + 6) / 12) * (omegaMax - omegaMin);

        // Before: poles on jw axis (sigma = 0) or unforced spectrum
        let mag = 0;
        if (questionProfile?.surface3D?.evaluator3D) {
          mag = questionProfile.surface3D.evaluator3D(0, w) * amplitude;
        } else {
          const dist1 = Math.sqrt(s ** 2 + (w - paramOmega) ** 2) + 0.18;
          const dist2 = Math.sqrt(s ** 2 + (w + paramOmega) ** 2) + 0.18;
          mag = (amplitude * 2.2) / (dist1 * dist2);
        }
        mag = Math.min(mag, 7.5);
        geoBefore.attributes.position.setY(i, mag - 3);
      }
      geoBefore.computeVertexNormals();

      const matBefore = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
        roughness: 0.4,
      });
      const meshBefore = new THREE.Mesh(geoBefore, matBefore);
      group.add(meshBefore);

      // 2. AFTER Surface (Poles at sigma = paramSigma, damped stable or complete solution)
      const geoAfter = new THREE.PlaneGeometry(12, 12, res, res);
      geoAfter.rotateX(-Math.PI / 2);
      const countA = geoAfter.attributes.position.count;
      const colorsA = new Float32Array(countA * 3);

      for (let i = 0; i < countA; i++) {
        const x = geoAfter.attributes.position.getX(i);
        const z = geoAfter.attributes.position.getZ(i);
        const s = sigmaMin + ((x + 6) / 12) * (sigmaMax - sigmaMin);
        const w = omegaMin + ((z + 6) / 12) * (omegaMax - omegaMin);

        let mag = 0;
        if (questionProfile?.surface3D?.evaluator3D) {
          mag = questionProfile.surface3D.evaluator3D(s, w) * amplitude;
        } else {
          const dist1 = Math.sqrt((s - paramSigma) ** 2 + (w - paramOmega) ** 2) + 0.15;
          const dist2 = Math.sqrt((s - paramSigma) ** 2 + (w + paramOmega) ** 2) + 0.15;
          mag = (amplitude * 2.5) / (dist1 * dist2);
        }
        mag = Math.min(mag, 8);
        geoAfter.attributes.position.setY(i, mag - 3);

        const tColor = Math.min(Math.max((mag - 0.2) / 6, 0), 1);
        const col = new THREE.Color();
        col.setRGB(0.1 + tColor * 0.2, 0.4 + tColor * 0.6, 0.95);
        colorsA[i * 3] = col.r;
        colorsA[i * 3 + 1] = col.g;
        colorsA[i * 3 + 2] = col.b;
      }
      geoAfter.setAttribute('color', new THREE.BufferAttribute(colorsA, 3));
      geoAfter.computeVertexNormals();

      const matAfter = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.25,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const meshAfter = new THREE.Mesh(geoAfter, matAfter);
      group.add(meshAfter);

      // Trajectory arrow indicating shift into Left Half Plane
      const pBeforeX = -6 + ((0 - sigmaMin) / (sigmaMax - sigmaMin)) * 12;
      const pAfterX = -6 + ((paramSigma - sigmaMin) / (sigmaMax - sigmaMin)) * 12;
      const pZ = -6 + ((paramOmega - omegaMin) / (omegaMax - omegaMin)) * 12;

      const arrowGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pBeforeX, 4.5, pZ),
        new THREE.Vector3(pAfterX, 4.5, pZ),
      ]);
      const arrowMat = new THREE.LineDashedMaterial({ color: 0x10b981, dashSize: 0.3, gapSize: 0.15 });
      const arrowLine = new THREE.Line(arrowGeo, arrowMat);
      arrowLine.computeLineDistances();
      group.add(arrowLine);

    } else if (active3dSubTab === 'phase_trajectory') {
      // 3D State-Space Trajectory Curve [t, y(t), y'(t)]
      // Curve 1: AFTER Trajectory (Damped Convergent Spiral in Cyan)
      const curvePointsAfter: THREE.Vector3[] = [];
      const totalSteps = 400;
      const maxT = timeMax;

      // Sample bounds for normalization
      let maxVal = 1.0;
      for (let i = 0; i <= totalSteps; i++) {
        const t = (i / totalSteps) * maxT;
        const { y, dy } = computeAfterTimeResponse(t);
        if (Math.abs(y) > maxVal) maxVal = Math.abs(y);
        if (Math.abs(dy) > maxVal) maxVal = Math.abs(dy);
      }
      const normScale = 3.5 / Math.max(0.5, maxVal);

      for (let i = 0; i <= totalSteps; i++) {
        const t = (i / totalSteps) * maxT;
        const { y, dy } = computeAfterTimeResponse(t);

        const cx = -6 + (t / maxT) * 12;
        const cy = y * normScale;
        const cz = dy * normScale;
        curvePointsAfter.push(new THREE.Vector3(cx, cy, cz));
      }

      const curvePathAfter = new THREE.CatmullRomCurve3(curvePointsAfter);
      const tubeGeoAfter = new THREE.TubeGeometry(curvePathAfter, 200, 0.1, 8, false);
      const tubeMatAfter = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0369a1,
        roughness: 0.2,
        metalness: 0.4,
      });
      const tubeMeshAfter = new THREE.Mesh(tubeGeoAfter, tubeMatAfter);
      group.add(tubeMeshAfter);

      // Curve 2: BEFORE Trajectory (Undamped limit cycle / cylinder in Amber)
      const curvePointsBefore: THREE.Vector3[] = [];
      for (let i = 0; i <= totalSteps; i++) {
        const t = (i / totalSteps) * maxT;
        const { y, dy } = computeBeforeTimeResponse(t);
        const cx = -6 + (t / maxT) * 12;
        const cy = y * normScale;
        const cz = dy * normScale;
        curvePointsBefore.push(new THREE.Vector3(cx, cy, cz));
      }

      const curveGeoBefore = new THREE.BufferGeometry().setFromPoints(curvePointsBefore);
      const curveMatBefore = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
      const curveLineBefore = new THREE.Line(curveGeoBefore, curveMatBefore);
      group.add(curveLineBefore);

      // Start Marker Sphere
      const startSphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const startSphereMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239 });
      const startMesh = new THREE.Mesh(startSphereGeo, startSphereMat);
      startMesh.position.copy(curvePointsAfter[0]);
      group.add(startMesh);

    } else if (active3dSubTab === 'fourier_waterfall') {
      // 3D Fourier Harmonic Waterfall with Question Individual Harmonics
      if (questionProfile?.frequencyDomain?.harmonics && questionProfile.frequencyDomain.harmonics.length > 0) {
        const harmList = questionProfile.frequencyDomain.harmonics;
        const hCount = harmList.length;

        for (let k = 0; k < hCount; k++) {
          const harm = harmList[k];
          const harmonicPoints: THREE.Vector3[] = [];
          const zLayer = -5 + ((k + 1) / (hCount + 1)) * 10;

          for (let px = 0; px <= 150; px++) {
            const t = (px / 150) * timeMax;
            const x = -6 + (t / timeMax) * 12;
            const y = harm.amp * Math.sin(harm.freq * t + (harm.phase * Math.PI) / 180) * 1.5;
            harmonicPoints.push(new THREE.Vector3(x, y, zLayer));
          }

          const hGeo = new THREE.BufferGeometry().setFromPoints(harmonicPoints);
          const col = new THREE.Color().setHSL(0.55 + (k / hCount) * 0.35, 0.9, 0.55);
          const hMat = new THREE.LineBasicMaterial({ color: col, linewidth: 2.5 });
          const hLine = new THREE.Line(hGeo, hMat);
          group.add(hLine);
        }
      } else {
        const barCount = Math.max(1, harmonics);
        const omega0 = 1.0;
        const type = resolvedModel.fourierType || 'square';

        for (let k = 1; k <= barCount; k++) {
          let n = k;
          let amp = 0;
          if (type === 'square') {
            n = 2 * k - 1;
            amp = (4 / (n * Math.PI)) * amplitude;
          } else if (type === 'sawtooth') {
            n = k;
            amp = (2 / (n * Math.PI)) * amplitude;
          } else if (type === 'triangle') {
            n = 2 * k - 1;
            amp = (8 / (Math.PI * Math.PI * n * n)) * amplitude;
          }

          const harmonicPoints: THREE.Vector3[] = [];
          const zLayer = -5 + (k / barCount) * 10;

          for (let px = 0; px <= 150; px++) {
            const t = (px / 150) * 8;
            const x = -6 + (t / 8) * 12;
            const y = amp * Math.sin(n * omega0 * t) * 2;
            harmonicPoints.push(new THREE.Vector3(x, y, zLayer));
          }

          const hGeo = new THREE.BufferGeometry().setFromPoints(harmonicPoints);
          const col = new THREE.Color().setHSL(0.55 + (k / barCount) * 0.35, 0.9, 0.55);
          const hMat = new THREE.LineBasicMaterial({ color: col, linewidth: 2 });
          const hLine = new THREE.Line(hGeo, hMat);
          group.add(hLine);
        }
      }
    }
  };

  // Mouse Interaction for 3D Camera Controls
  const handle3dMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handle3dMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraRotationRef.current.theta -= dx * 0.008;
    cameraRotationRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2 - 0.05, cameraRotationRef.current.phi - dy * 0.008)
    );
    updateCameraPosition();
  };

  const handle3dMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handle3dWheel = (e: React.WheelEvent) => {
    cameraRotationRef.current.radius = Math.max(
      10,
      Math.min(60, cameraRotationRef.current.radius + e.deltaY * 0.02)
    );
    updateCameraPosition();
  };

  const handleResetCamera = () => {
    cameraRotationRef.current = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.5,
      radius: 26,
    };
    updateCameraPosition();
  };

  // Download High-Res Screenshot PNG
  const handleExportPNG = () => {
    if (viewMode === '2d') {
      const canvas = canvas2dRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `grafico-2d-${problemTitle.slice(0, 20).replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return;
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `grafico-3d-${problemTitle.slice(0, 20).replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className={`w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-slate-100 ${className}`}>
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-400" />
              Visualização Gráfica da Solução
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Ambiente Pedagógico de Análise Dinâmica
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>{problemTitle}</span>
          </h3>
        </div>

        {/* 2D vs 3D Main Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border-2 border-indigo-500/40 shadow-lg shadow-indigo-950/50">
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/40 border border-indigo-400/50 scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <BarChart2 className={`w-4 h-4 ${viewMode === '2d' ? 'text-indigo-200' : 'text-slate-400'}`} />
            <span>Gráfico 2D</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${viewMode === '2d' ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
              Plano
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/40 border border-sky-400/50 scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Box className={`w-4 h-4 ${viewMode === '3d' ? 'text-cyan-200 animate-spin-slow' : 'text-slate-400'}`} />
            <span>Superfície 3D</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${viewMode === '3d' ? 'bg-sky-700/60 text-sky-100' : 'bg-slate-800 text-slate-400'}`}>
              3D Real
            </span>
          </button>
        </div>
      </div>

      {/* Formula & Equation Banner: ANTES vs DEPOIS */}
      <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 overflow-x-auto py-1">
          {/* Antes Box */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-500/40 rounded-xl shadow-xs">
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              ANTES (Entrada / Equação Inicial)
            </span>
            <div className="text-amber-200 font-mono text-xs">
              <MathView math={resolvedBeforeLatex} />
            </div>
          </div>

          <span className="text-slate-500 font-bold px-1 text-sm">➔</span>

          {/* Depois Box */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/40 border border-sky-500/40 rounded-xl shadow-xs">
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
              DEPOIS (Solução / Resposta Final)
            </span>
            <div className="text-sky-200 font-mono text-xs">
              <MathView math={resolvedAfterLatex} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPNG}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Baixar imagem PNG de alta resolução para relatório ou slide de aula"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exportar PNG</span>
          </button>
        </div>
      </div>

      {/* Viewport Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left / Center: Interactive Canvas / 3D Stage */}
        <div className="lg:col-span-8 p-4 flex flex-col justify-between relative bg-slate-950/40">
          {/* Sub Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            {viewMode === '2d' ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActive2dSubTab('time')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active2dSubTab === 'time'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Resposta Temporal y(t)
                </button>
                <button
                  type="button"
                  onClick={() => setActive2dSubTab('poles')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active2dSubTab === 'poles'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Plano s (Polos & Zeros)
                </button>
                <button
                  type="button"
                  onClick={() => setActive2dSubTab('spectrum')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active2dSubTab === 'spectrum'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Espectro Harmônico
                </button>
                <button
                  type="button"
                  onClick={() => setActive2dSubTab('phase')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active2dSubTab === 'phase'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Retrato de Fase [y, y']
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActive3dSubTab('laplace_surface')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active3dSubTab === 'laplace_surface'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Superfície 3D |H(s)|
                </button>
                <button
                  type="button"
                  onClick={() => setActive3dSubTab('before_after_3d')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active3dSubTab === 'before_after_3d'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Comparação 3D Antes vs Depois
                </button>
                <button
                  type="button"
                  onClick={() => setActive3dSubTab('phase_trajectory')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active3dSubTab === 'phase_trajectory'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Trajetória Espacial 3D [t, y, y']
                </button>
                <button
                  type="button"
                  onClick={() => setActive3dSubTab('fourier_waterfall')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    active3dSubTab === 'fourier_waterfall'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Cascata Harmônica 3D
                </button>
              </div>
            )}

            {/* Quick 3D Toggles */}
            {viewMode === '3d' && (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setIs3dRotating(!is3dRotating)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    is3dRotating
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title={is3dRotating ? 'Pausar rotação automática' : 'Iniciar rotação automática'}
                >
                  {is3dRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleResetCamera}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                  title="Restaurar ângulo de câmera padrão"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRenderStyle3d('solid')}
                    className={`px-2 py-0.5 rounded ${
                      renderStyle3d === 'solid' ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Sólido
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenderStyle3d('wireframe')}
                    className={`px-2 py-0.5 rounded ${
                      renderStyle3d === 'wireframe' ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Aramado
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenderStyle3d('both')}
                    className={`px-2 py-0.5 rounded ${
                      renderStyle3d === 'both' ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Misto
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comparador Toolbar: Antes vs Depois Modes */}
          <div className="mb-2 p-2 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            {viewMode === '2d' ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Modo Comparativo 2D:
                </span>
                <button
                  type="button"
                  onClick={() => setComparisonMode('split_curtain')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    comparisonMode === 'split_curtain'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ✂️ Cortina Deslizante (Antes | Depois)
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonMode('overlay')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    comparisonMode === 'overlay'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🔀 Sobreposição (Overlay)
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonMode('before')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    comparisonMode === 'before'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  ◀ Apenas Antes
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonMode('after')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    comparisonMode === 'after'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  ▶ Apenas Depois
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Deformação Contínua 3D (Morph Antes ➔ Depois):
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={morphProgress}
                    onChange={(e) => setMorphProgress(parseFloat(e.target.value))}
                    className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="font-mono text-amber-300 text-[11px] font-bold">
                    {(morphProgress * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setMorphProgress(0)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                  >
                    0% (Antes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMorphProgress(0.5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    50% (Transitório)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMorphProgress(1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
                  >
                    100% (Depois)
                  </button>
                </div>
              </div>
            )}

            {/* Split Curtain Slider for 2D */}
            {viewMode === '2d' && comparisonMode === 'split_curtain' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] text-slate-400">Divisor da Cortina:</span>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="1"
                  value={splitSliderPos}
                  onChange={(e) => setSplitSliderPos(parseInt(e.target.value, 10))}
                  className="w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="font-mono text-amber-300 text-[11px] w-8 text-right">{splitSliderPos}%</span>
              </div>
            )}
          </div>

          {/* Active Canvas / Three.js Container */}
          <div className="relative w-full h-[360px] sm:h-[400px] rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {viewMode === '2d' ? (
              <canvas
                ref={canvas2dRef}
                className="w-full h-full cursor-crosshair block"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const px = e.clientX - rect.left;
                  const py = e.clientY - rect.top;
                  setHoverCoord({ t: 0, y: 0, dy: 0, px, py });
                }}
                onMouseLeave={() => setHoverCoord(null)}
              />
            ) : (
              <div
                ref={threeMountRef}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
                onMouseDown={handle3dMouseDown}
                onMouseMove={handle3dMouseMove}
                onMouseUp={handle3dMouseUp}
                onWheel={handle3dWheel}
              />
            )}

            {/* Instruction Floating Badge */}
            <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs border border-slate-800 text-[11px] text-slate-400 pointer-events-none flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-indigo-400" />
              <span>
                {viewMode === '2d'
                  ? 'Mova o cursor sobre a curva para inspecionar pontos instantâneos (t, y, dy/dt) ou ajuste a cortina'
                  : 'Arraste com o mouse/toque para girar em 3D • Use o scroll para Zoom'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Educational Parameters & Physics Explanation */}
        <div className="lg:col-span-4 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Painel de Controle e Análise
              </span>
              <button
                type="button"
                onClick={handleResetToQuestionTheory}
                className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Restaurar parâmetros para a teoria exata desta questão"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Resetar Teoria</span>
              </button>
            </div>

            {/* Before vs After Summary Comparison Card */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Tabela Comparativa: Antes vs Depois
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px] border-b border-slate-800 pb-1 font-bold text-slate-400">
                <span>Propriedade</span>
                <span className="text-amber-400">ANTES</span>
                <span className="text-sky-400">DEPOIS</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Amortecimento (ζ):</span>
                  <span className="text-amber-300 font-mono">0.00 (Nenhum)</span>
                  <span className="text-sky-300 font-mono">{paramZeta.toFixed(2)} (Subamort.)</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Estabilidade:</span>
                  <span className="text-amber-300">Marginal / Neutro</span>
                  <span className="text-emerald-400">Assintótico</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Envoltória:</span>
                  <span className="text-amber-300">Constante (1.0)</span>
                  <span className="text-sky-300 font-mono">e^({paramSigma.toFixed(1)}t)</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Polos s:</span>
                  <span className="text-amber-300 font-mono">0 ± j{paramOmega.toFixed(1)}</span>
                  <span className="text-sky-300 font-mono">{paramSigma.toFixed(1)} ± j{paramOmega.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Sliders and Controls */}
            <div className="space-y-3 text-xs">
              {/* Sigma Slider (Damping/Decay) */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Atenuação / Polo Real (σ):</span>
                  <span className="text-amber-400 font-mono">{paramSigma.toFixed(2)} Np/s</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="0.5"
                  step="0.1"
                  value={paramSigma}
                  onChange={(e) => setParamSigma(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] text-slate-500 block">
                  {paramSigma < 0 ? '✓ Estável (Decaimento no semiplano esquerdo)' : '⚠ Instável (Crescimento exponencial)'}
                </span>
              </div>

              {/* Omega Slider (Frequency) */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Frequência Amortecida (ω):</span>
                  <span className="text-sky-400 font-mono">{paramOmega.toFixed(2)} rad/s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.2"
                  value={paramOmega}
                  onChange={(e) => setParamOmega(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Time Span Slider */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Janela Temporal (tₘₐₓ):</span>
                  <span className="text-emerald-400 font-mono">{timeMax} s</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={timeMax}
                  onChange={(e) => setTimeMax(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Fourier Harmonics if Fourier */}
              {resolvedModel.evaluatorType === 'fourier_series' && (
                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Harmônicos de Fourier (N):</span>
                    <span className="text-purple-400 font-mono">{harmonics} termos</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={harmonics}
                    onChange={(e) => setHarmonics(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              )}

              {/* Toggle Options */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowEnvelopes(!showEnvelopes)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    showEnvelopes
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {showEnvelopes ? '✓ Envoltória Exponencial' : 'Envoltória'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    showGrid
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {showGrid ? '✓ Grid Milimetrado' : 'Grid'}
                </button>
              </div>
            </div>

            {/* Pedagogical Explanation Card */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Interpretação Física do Antes vs Depois:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                O <strong>Antes</strong> representa o sinal de excitação ou o estado puro conservativo (sem dissipação, polos no eixo <span className="font-mono text-amber-300">jω</span>). O <strong>Depois</strong> exibe a resposta estabilizada com atenuação <span className="font-mono text-sky-300">e^(σt)</span> após o processamento da equação diferencial.
              </p>
            </div>
          </div>

          {/* Key Metric Indicators */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">Polo Final:</span>
              <span className="font-mono font-bold text-sky-400">
                {paramSigma.toFixed(1)} ± j{paramOmega.toFixed(1)}
              </span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">Freq. Natural ωₙ:</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.sqrt(paramSigma ** 2 + paramOmega ** 2).toFixed(2)} rad/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
