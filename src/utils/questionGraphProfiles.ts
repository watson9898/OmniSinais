// Dedicated Mathematical Graph Profiles for 2D and 3D Visualizations in OmniSinais
// Computes exact, question-specific mathematical behaviors for both Step-by-Step and Multiple Choice problems.

export interface QuestionGraphProfile {
  id: string;
  title: string;
  category: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  interpretationText: string;
  
  // 2D Time Domain
  timeDomain: {
    formulaLatex: string;
    beforeFormulaLatex?: string;
    timeRange: [number, number];
    curveType: 'standard' | 'discrete_stem' | 'piecewise' | 'dirac_sampling' | 'bode_magnitude' | 'fourier_harmonics' | 'even_odd_symmetry' | 'power_signal';
    evaluator: (t: number) => { y: number; dy?: number; beforeY?: number; secondaryY?: number; label?: string };
    discreteSamples?: { n: number; val: number }[];
    annotations?: { x: number; y: number; text: string; color?: string }[];
    yLabel?: string;
    xLabel?: string;
  };

  // 2D Pole-Zero & S-Plane
  poleZero?: {
    poles: { sigma: number; omega: number; label?: string; isUnstable?: boolean }[];
    zeros?: { sigma: number; omega: number; label?: string }[];
    rocDescription?: string;
    stabilityStatus: 'stable' | 'marginally_stable' | 'unstable';
  };

  // 2D Frequency / Harmonic Spectrum
  frequencyDomain?: {
    type: 'bode' | 'discrete_harmonics' | 'fourier_transform';
    evaluatorMag?: (w: number) => number;
    evaluatorPhase?: (w: number) => number;
    harmonics?: { n: number; freq: number; amp: number; phase: number; isSine?: boolean }[];
    cutoffFreq?: number;
  };

  // 3D Surface / Trajectory
  surface3D: {
    title: string;
    equationLatex: string;
    surfaceType: 'laplace_poles' | 'dirac_bowl' | 'fourier_waterfall' | 'discrete_cylinder' | 'even_odd_saddle' | 'power_ripple' | 'rlc_spiral';
    sigmaRange: [number, number];
    omegaRange: [number, number];
    evaluator3D: (sigma: number, omega: number) => number;
    peaks?: { sigma: number; omega: number; label: string; height: number }[];
  };
}

// Map of handcrafted profiles for core benchmark problems
export const DEDICATED_PROBLEM_GRAPH_PROFILES: Record<string, QuestionGraphProfile> = {
  // --------------------------------------------------------------------------------------------------
  // 1. EDO 1ª Ordem via Laplace: y'(t) - 2y(t) = e^{5t}, y(0)=3 -> y(t) = 8/3 e^(2t) + 1/3 e^(5t)
  // --------------------------------------------------------------------------------------------------
  'step-laplace-edo-1': {
    id: 'step-laplace-edo-1',
    title: 'EDO de 1ª Ordem com Polos no Semiplano Direito (Instável)',
    category: 'differential_equations',
    interpretationText: 'Sistema instável com dois polos reais positivos em s = +2 e s = +5. A resposta no tempo cresce exponencialmente sem limite.',
    timeDomain: {
      formulaLatex: 'y(t) = \\frac{8}{3}e^{2t} + \\frac{1}{3}e^{5t}',
      beforeFormulaLatex: 'x(t) = e^{5t}',
      timeRange: [0, 2.5],
      curveType: 'standard',
      yLabel: 'y(t)',
      xLabel: 't (segundos)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const y = (8 / 3) * Math.exp(2 * t) + (1 / 3) * Math.exp(5 * t);
        const dy = (16 / 3) * Math.exp(2 * t) + (5 / 3) * Math.exp(5 * t);
        const beforeY = Math.exp(5 * t);
        return { y: Math.min(y, 100), dy, beforeY: Math.min(beforeY, 100) };
      },
      annotations: [
        { x: 0, y: 3, text: 'Condição Inicial y(0)=3', color: '#38bdf8' },
        { x: 1, y: 22.5, text: 'Crescimento Exponencial Rápido', color: '#f43f5e' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: 2, omega: 0, label: 's₁ = +2 (Modo Natural)', isUnstable: true },
        { sigma: 5, omega: 0, label: 's₂ = +5 (Pólo Forçado)', isUnstable: true },
      ],
      rocDescription: 'Re{s} > 5 (À direita de todos os polos)',
      stabilityStatus: 'unstable',
    },
    surface3D: {
      title: 'Superfície de Laplace |Y(s)| com Polos Reais Positivos',
      equationLatex: '|Y(s)| = \\left| \\frac{3s-14}{(s-2)(s-5)} \\right|',
      surfaceType: 'laplace_poles',
      sigmaRange: [-1, 7],
      omegaRange: [-4, 4],
      evaluator3D: (s, w) => {
        const d1 = Math.sqrt((s - 2) ** 2 + w ** 2) + 0.15;
        const d2 = Math.sqrt((s - 5) ** 2 + w ** 2) + 0.15;
        const num = Math.sqrt((3 * s - 14) ** 2 + (3 * w) ** 2) + 0.1;
        return Math.min(num / (d1 * d2), 7.5);
      },
      peaks: [
        { sigma: 2, omega: 0, label: 'Polo s = 2', height: 7.5 },
        { sigma: 5, omega: 0, label: 'Polo s = 5', height: 7.5 },
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 2. Dirac Sampling: ∫ (3t^2 + 1)δ(t+2) dt = 13
  // --------------------------------------------------------------------------------------------------
  'step-dirac-sampling-2': {
    id: 'step-dirac-sampling-2',
    title: 'Propriedade de Peneiramento do Delta de Dirac em t = -2',
    category: 'signals',
    interpretationText: 'O impulso unitário centrado em t = -2 extrai instantaneamente a amplitude x(-2) = 3(-2)² + 1 = 13.',
    timeDomain: {
      formulaLatex: 'x(t) = 3t^2 + 1, \\quad x(-2) = 13',
      beforeFormulaLatex: '\\delta(t + 2)',
      timeRange: [-4, 2],
      curveType: 'dirac_sampling',
      yLabel: 'x(t)',
      xLabel: 't',
      evaluator: (t) => {
        const y = 3 * t * t + 1;
        const beforeY = Math.abs(t + 2) < 0.05 ? 13 : 0;
        return { y, beforeY, dy: 6 * t };
      },
      annotations: [
        { x: -2, y: 13, text: 'Amostra: x(-2) = 13', color: '#10b981' },
        { x: 0, y: 1, text: 'Vértice (0, 1)', color: '#a855f7' }
      ]
    },
    surface3D: {
      title: 'Superfície Parabólica Tridimensional e Peneiramento no Plano',
      equationLatex: 'z(x, y) = 3x^2 + y^2 + 1',
      surfaceType: 'dirac_bowl',
      sigmaRange: [-3, 3],
      omegaRange: [-3, 3],
      evaluator3D: (x, y) => {
        const base = 0.3 * (3 * x * x + y * y + 1);
        const needle = Math.abs(x + 2) < 0.25 && Math.abs(y) < 0.25 ? 5.5 : 0;
        return Math.min(base + needle, 7.5);
      },
      peaks: [
        { sigma: -2, omega: 0, label: 'Pico Delta em (-2, 0)', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 3. Fourier Orthogonality: f1(t) = Square wave vs C * sin(t), C = 4/pi
  // --------------------------------------------------------------------------------------------------
  'step-fourier-ortho-3': {
    id: 'step-fourier-ortho-3',
    title: 'Aproximação Ótima de Onda Quadrada por Harmônica Fundamental',
    category: 'fourier',
    interpretationText: 'A projeção ortogonal no espaço L2 calcula o coeficiente C = 4/π ≈ 1.273, minimizando a energia do erro quadrático médio.',
    timeDomain: {
      formulaLatex: 'f_1(t) \\approx \\frac{4}{\\pi}\\sin(t)',
      beforeFormulaLatex: 'f_1(t) = \\text{sign}(\\sin(t))',
      timeRange: [0, 2 * Math.PI],
      curveType: 'fourier_harmonics',
      yLabel: 'Amplitude',
      xLabel: 't (radianos)',
      evaluator: (t) => {
        const square = Math.sin(t) >= 0 ? 1 : -1;
        const fundamental = (4 / Math.PI) * Math.sin(t);
        const thirdHarmonic = (4 / (3 * Math.PI)) * Math.sin(3 * t);
        const fifthHarmonic = (4 / (5 * Math.PI)) * Math.sin(5 * t);
        const synth3 = fundamental + thirdHarmonic + fifthHarmonic;
        return {
          y: fundamental,
          beforeY: square,
          secondaryY: synth3,
          label: `Erro = ${(square - fundamental).toFixed(2)}`
        };
      },
      annotations: [
        { x: Math.PI / 2, y: 1.273, text: 'Pico Fundamental C = 4/π = 1.273', color: '#38bdf8' },
        { x: Math.PI / 2, y: 1.0, text: 'Topo Onda Quadrada = 1.0', color: '#fbbf24' }
      ]
    },
    frequencyDomain: {
      type: 'discrete_harmonics',
      harmonics: [
        { n: 1, freq: 1, amp: 4 / Math.PI, phase: 0, isSine: true },
        { n: 3, freq: 3, amp: 4 / (3 * Math.PI), phase: 0, isSine: true },
        { n: 5, freq: 5, amp: 4 / (5 * Math.PI), phase: 0, isSine: true },
        { n: 7, freq: 7, amp: 4 / (7 * Math.PI), phase: 0, isSine: true },
      ]
    },
    surface3D: {
      title: 'Cascata Tridimensional de Harmônicos de Fourier (Waterfall)',
      equationLatex: 'b_n = \\frac{4}{n\\pi}, \\quad n = 1, 3, 5, 7, \\dots',
      surfaceType: 'fourier_waterfall',
      sigmaRange: [-2, 2],
      omegaRange: [0, 8],
      evaluator3D: (x, w) => {
        let sum = 0;
        const freqs = [1, 3, 5, 7];
        for (const f of freqs) {
          const dist = Math.abs(w - f);
          if (dist < 0.6) {
            const amp = (4 / (f * Math.PI)) * Math.cos((dist / 0.6) * (Math.PI / 2));
            sum += amp * 3.5 * Math.exp(-x * x);
          }
        }
        return Math.min(sum, 7);
      }
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 4. Initial & Final Value Theorems: R(s) = 3/(s(s+2)) -> f(0+)=0, f(inf)=1.5
  // --------------------------------------------------------------------------------------------------
  'step-laplace-initial-final-4': {
    id: 'step-laplace-initial-final-4',
    title: 'Resposta ao Degrau com Teoremas de Valor Inicial e Final',
    category: 'laplace',
    interpretationText: 'O polo na origem s = 0 define o regime permanente f(∞) = 1.5, e o polo em s = -2 define a constante de tempo τ = 0.5s.',
    timeDomain: {
      formulaLatex: 'f(t) = 1.5(1 - e^{-2t})u(t)',
      beforeFormulaLatex: 'f_{assíntota}(t) = 1.5',
      timeRange: [0, 5],
      curveType: 'standard',
      yLabel: 'f(t)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, beforeY: 0, dy: 0 };
        const y = 1.5 * (1 - Math.exp(-2 * t));
        const dy = 3.0 * Math.exp(-2 * t);
        return { y, dy, beforeY: 1.5 };
      },
      annotations: [
        { x: 0, y: 0, text: 'TVI: f(0⁺) = 0', color: '#38bdf8' },
        { x: 4, y: 1.499, text: 'TVF: f(∞) = 1.5', color: '#10b981' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: 0, omega: 0, label: 's = 0 (Integrador / DC)' },
        { sigma: -2, omega: 0, label: 's = -2 (Pólo Estável)' }
      ],
      rocDescription: 'Re{s} > 0',
      stabilityStatus: 'marginally_stable'
    },
    surface3D: {
      title: 'Superfície de Laplace |R(s)| com Pólo na Origem',
      equationLatex: '|R(s)| = \\left| \\frac{3}{s(s+2)} \\right|',
      surfaceType: 'laplace_poles',
      sigmaRange: [-4, 2],
      omegaRange: [-4, 4],
      evaluator3D: (s, w) => {
        const d0 = Math.sqrt(s * s + w * w) + 0.15;
        const d2 = Math.sqrt((s + 2) ** 2 + w * w) + 0.15;
        return Math.min(3.0 / (d0 * d2), 7.5);
      },
      peaks: [
        { sigma: 0, omega: 0, label: 'Pólo s = 0', height: 7.5 },
        { sigma: -2, omega: 0, label: 'Pólo s = -2', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 5. Continuous Convolution: 2e^(-t)u(t) * e^(-3t)u(t) = (e^(-t) - e^(-3t))u(t)
  // --------------------------------------------------------------------------------------------------
  'step-convolution-infinite-5': {
    id: 'step-convolution-infinite-5',
    title: 'Convolução de Sinais Exponenciais Causais',
    category: 'signals',
    interpretationText: 'A saída y(t) inicia em 0, alcança o pico máximo em t = ln(3)/2 ≈ 0.549s com amplitude y_max = 2/(3√3) ≈ 0.385 e decai suavemente.',
    timeDomain: {
      formulaLatex: 'y(t) = (e^{-t} - e^{-3t})u(t)',
      beforeFormulaLatex: 'x(t) = 2e^{-t}u(t), \\quad h(t) = e^{-3t}u(t)',
      timeRange: [0, 6],
      curveType: 'standard',
      yLabel: 'y(t)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0, secondaryY: 0 };
        const y = Math.exp(-t) - Math.exp(-3 * t);
        const dy = -Math.exp(-t) + 3 * Math.exp(-3 * t);
        const x_in = 2 * Math.exp(-t);
        const h_imp = Math.exp(-3 * t);
        return { y, dy, beforeY: x_in, secondaryY: h_imp };
      },
      annotations: [
        { x: 0.549, y: 0.385, text: 'Pico Máximo t = 0.55s (y = 0.385)', color: '#38bdf8' }
      ]
    },
    surface3D: {
      title: 'Espaço Bidimensional de Convolução x(τ)h(t-τ)',
      equationLatex: 'z(t, \\tau) = 2e^{-\\tau}e^{-3(t-\\tau)} = 2e^{-3t}e^{2\\tau}',
      surfaceType: 'even_odd_saddle',
      sigmaRange: [0, 5],
      omegaRange: [0, 5],
      evaluator3D: (t, tau) => {
        if (t < 0 || tau < 0 || tau > t) return 0;
        return 2 * Math.exp(-3 * t) * Math.exp(2 * tau) * 2.5;
      }
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 6. RL Filter Circuit: H(w) = jw / (2 + jw)
  // --------------------------------------------------------------------------------------------------
  'step-rl-circuit-fourier-6': {
    id: 'step-rl-circuit-fourier-6',
    title: 'Filtro Passa-Altas RL de 1ª Ordem no Domínio da Frequência',
    category: 'differential_equations',
    interpretationText: 'Filtro passa-altas com frequência de corte wc = R/L = 2 rad/s. Bloqueia sinais contínuos (ganho 0 em w=0) e passa altas frequências com ganho unitário.',
    timeDomain: {
      formulaLatex: 'v_L(t) = 5(3e^{-3t} - 2e^{-2t})u(t)',
      beforeFormulaLatex: 'v_{in}(t) = 5e^{-3t}u(t)',
      timeRange: [0, 4],
      curveType: 'standard',
      yLabel: 'Tensão (V)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const beforeY = 5 * Math.exp(-3 * t);
        const y = 5 * (3 * Math.exp(-3 * t) - 2 * Math.exp(-2 * t));
        const dy = 5 * (-9 * Math.exp(-3 * t) + 4 * Math.exp(-2 * t));
        return { y, dy, beforeY };
      },
      annotations: [
        { x: 0, y: 5, text: 'Tensão Inicial no Indutor = 5V', color: '#38bdf8' }
      ]
    },
    poleZero: {
      poles: [{ sigma: -2, omega: 0, label: 'Pólo wc = 2 rad/s' }],
      zeros: [{ sigma: 0, omega: 0, label: 'Zero na Origem (Bloqueio CC)' }],
      stabilityStatus: 'stable'
    },
    frequencyDomain: {
      type: 'bode',
      cutoffFreq: 2.0,
      evaluatorMag: (w) => Math.abs(w) / Math.sqrt(4 + w * w),
      evaluatorPhase: (w) => Math.atan2(2, w) * (180 / Math.PI)
    },
    surface3D: {
      title: 'Superfície de Laplace |H(s)| com Zero na Origem e Pólo em s = -2',
      equationLatex: '|H(s)| = \\left| \\frac{s}{s+2} \\right|',
      surfaceType: 'laplace_poles',
      sigmaRange: [-4, 2],
      omegaRange: [-4, 4],
      evaluator3D: (s, w) => {
        const num = Math.sqrt(s * s + w * w);
        const den = Math.sqrt((s + 2) ** 2 + w * w) + 0.15;
        return Math.min((num / den) * 3.5, 6);
      },
      peaks: [
        { sigma: -2, omega: 0, label: 'Pólo s = -2', height: 6 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 7. Pulse Convolution (Oppenheim): u(t)-u(t-2) * e^(-2t)u(t)
  // --------------------------------------------------------------------------------------------------
  'step-oppenheim-conv-pulse-7': {
    id: 'step-oppenheim-conv-pulse-7',
    title: 'Convolução em Intervalos Particionados (Crescimento e Decaimento)',
    category: 'signals',
    interpretationText: 'No intervalo 0 ≤ t ≤ 2 a resposta carrega até y(2) = (1-e⁻⁴)/2 ≈ 0.491; para t > 2 descarrega com taxa exponencial e⁻²ᵗ.',
    timeDomain: {
      formulaLatex: 'y(t) = \\begin{cases} 0.5(1 - e^{-2t}), & 0 \\le t \\le 2 \\\\ 26.8e^{-2t}, & t > 2 \\end{cases}',
      beforeFormulaLatex: 'x(t) = u(t) - u(t-2)',
      timeRange: [0, 6],
      curveType: 'piecewise',
      yLabel: 'y(t)',
      xLabel: 't',
      evaluator: (t) => {
        const pulse = (t >= 0 && t <= 2) ? 1 : 0;
        if (t < 0) return { y: 0, beforeY: 0 };
        if (t <= 2) {
          const y = 0.5 * (1 - Math.exp(-2 * t));
          return { y, beforeY: pulse, dy: Math.exp(-2 * t) };
        } else {
          const y = 0.5 * (Math.exp(4) - 1) * Math.exp(-2 * t);
          return { y, beforeY: pulse, dy: -(Math.exp(4) - 1) * Math.exp(-2 * t) };
        }
      },
      annotations: [
        { x: 2, y: 0.491, text: 'Ponto de Transição t = 2s (y = 0.491)', color: '#38bdf8' }
      ]
    },
    surface3D: {
      title: 'Superfície de Integração Particionada no Espaço (t, τ)',
      equationLatex: 'y(t) = \\int_{-\\infty}^\\infty x(\\tau)e^{-2(t-\\tau)}d\\tau',
      surfaceType: 'even_odd_saddle',
      sigmaRange: [0, 6],
      omegaRange: [0, 4],
      evaluator3D: (t, tau) => {
        if (t < 0 || tau < 0 || tau > 2 || tau > t) return 0;
        return Math.exp(-2 * (t - tau)) * 3.5;
      }
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 8. 2nd Order Underdamped EDO: y'' + 4y' + 13y = 13u(t)
  // --------------------------------------------------------------------------------------------------
  'step-second-order-ode-underdamped-8': {
    id: 'step-second-order-ode-underdamped-8',
    title: 'Resposta Subamortecida de 2ª Ordem (Sobressinal e Oscilação)',
    category: 'differential_equations',
    interpretationText: 'Polos complexos conjugados s = -2 ± j3. Fator de amortecimento α = 2, frequência de oscilação wd = 3 rad/s e sobressinal Mp = 16.3%.',
    timeDomain: {
      formulaLatex: 'y(t) = 1 - e^{-2t}\\cos(3t) - \\frac{2}{3}e^{-2t}\\sin(3t)',
      beforeFormulaLatex: 'x(t) = u(t) \\quad [\\text{Entrada Degrau}]',
      timeRange: [0, 5],
      curveType: 'standard',
      yLabel: 'y(t)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const env = Math.exp(-2 * t);
        const y = 1 - env * Math.cos(3 * t) - (2 / 3) * env * Math.sin(3 * t);
        const dy = (13 / 3) * env * Math.sin(3 * t);
        return { y, dy, beforeY: 1.0 };
      },
      annotations: [
        { x: 1.047, y: 1.163, text: 'Pico Máximo (Overshoot 16.3%)', color: '#f43f5e' },
        { x: 3.5, y: 1.0, text: 'Regime Permanente y(∞)=1.0', color: '#10b981' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: -2, omega: 3, label: 's₁ = -2 + j3' },
        { sigma: -2, omega: -3, label: 's₂ = -2 - j3' },
      ],
      rocDescription: 'Re{s} > -2 (Estável)',
      stabilityStatus: 'stable'
    },
    surface3D: {
      title: 'Superfície de Laplace |Y(s)| com Polos Complexos Conjugados',
      equationLatex: '|Y(s)| = \\left| \\frac{13}{s(s^2 + 4s + 13)} \\right|',
      surfaceType: 'laplace_poles',
      sigmaRange: [-5, 2],
      omegaRange: [-6, 6],
      evaluator3D: (s, w) => {
        const d0 = Math.sqrt(s * s + w * w) + 0.15;
        const d1 = Math.sqrt((s + 2) ** 2 + (w - 3) ** 2) + 0.15;
        const d2 = Math.sqrt((s + 2) ** 2 + (w + 3) ** 2) + 0.15;
        return Math.min(13 / (d0 * d1 * d2) * 1.5, 7.5);
      },
      peaks: [
        { sigma: 0, omega: 0, label: 'Pólo Origem s = 0', height: 7.5 },
        { sigma: -2, omega: 3, label: 'Pólo s = -2 + j3', height: 7.5 },
        { sigma: -2, omega: -3, label: 'Pólo s = -2 - j3', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 9. RLC Series Transient: i(t) = 8e^(-4t)sin(3t) A
  // --------------------------------------------------------------------------------------------------
  'step-rlc-series-transient-sadiku-9': {
    id: 'step-rlc-series-transient-sadiku-9',
    title: 'Corrente Transitória RLC Série (Sadiku Cap. 8)',
    category: 'electrical_engineering',
    interpretationText: 'Corrente puramente transitória: inicia em 0 A, alcança pico máximo de 2.45 A em t = 0.21s e decai a 0 A no regime permanente.',
    timeDomain: {
      formulaLatex: 'i(t) = 8e^{-4t}\\sin(3t)\\text{ A}',
      beforeFormulaLatex: 'V_s = 24\\text{ V}',
      timeRange: [0, 2.5],
      curveType: 'standard',
      yLabel: 'Corrente i(t) [A]',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const env = Math.exp(-4 * t);
        const y = 8 * env * Math.sin(3 * t);
        const dy = 8 * env * (-4 * Math.sin(3 * t) + 3 * Math.cos(3 * t));
        return { y, dy, beforeY: 0 };
      },
      annotations: [
        { x: 0.214, y: 2.45, text: 'Corrente Máxima = 2.45 A em t = 0.21s', color: '#38bdf8' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: -4, omega: 3, label: 's₁ = -4 + j3' },
        { sigma: -4, omega: -3, label: 's₂ = -4 - j3' }
      ],
      zeros: [{ sigma: 0, omega: 0, label: 'Zero na Origem' }],
      stabilityStatus: 'stable'
    },
    surface3D: {
      title: 'Superfície de Laplace |I(s)| do Circuito RLC Série',
      equationLatex: '|I(s)| = \\left| \\frac{24}{(s+4)^2 + 3^2} \\right|',
      surfaceType: 'rlc_spiral',
      sigmaRange: [-7, 1],
      omegaRange: [-6, 6],
      evaluator3D: (s, w) => {
        const d1 = Math.sqrt((s + 4) ** 2 + (w - 3) ** 2) + 0.15;
        const d2 = Math.sqrt((s + 4) ** 2 + (w + 3) ** 2) + 0.15;
        return Math.min(24 / (d1 * d2), 7.5);
      },
      peaks: [
        { sigma: -4, omega: 3, label: 'Pólo s = -4 + j3', height: 7.5 },
        { sigma: -4, omega: -3, label: 'Pólo s = -4 - j3', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 10. MC Energy vs Power: 3 cos(200 pi t) -> P = 4.5 W, E = inf
  // --------------------------------------------------------------------------------------------------
  'mc-energy-power-1': {
    id: 'mc-energy-power-1',
    title: 'Sinal Periódico de Potência: 3 cos(200π t)',
    category: 'signals',
    interpretationText: 'Sinal puramente de potência: potência média finita P = A²/2 = 4.5 W e energia total E = ∞.',
    timeDomain: {
      formulaLatex: 'x(t) = 3\\cos(200\\pi t), \\quad P_{méd} = 4.5\\text{ W}',
      beforeFormulaLatex: 'p_{inst}(t) = x^2(t) = 9\\cos^2(200\\pi t)',
      timeRange: [0, 0.03],
      curveType: 'power_signal',
      yLabel: 'x(t) e Potência',
      xLabel: 't (seg)',
      evaluator: (t) => {
        const w0 = 200 * Math.PI;
        const sig = 3 * Math.cos(w0 * t);
        const p_inst = sig * sig;
        const p_avg = 4.5;
        return { y: sig, beforeY: p_inst, secondaryY: p_avg };
      },
      annotations: [
        { x: 0.015, y: 4.5, text: 'Potência Média P = 4.5 W', color: '#10b981' },
        { x: 0.01, y: 9.0, text: 'Potência Instantânea de Pico = 9 W', color: '#fbbf24' }
      ]
    },
    surface3D: {
      title: 'Ondulação Periódica Bidimensional da Potência no Tempo',
      equationLatex: 'z(t, y) = 3\\cos(200\\pi t)\\cos(y)',
      surfaceType: 'power_ripple',
      sigmaRange: [-0.02, 0.02],
      omegaRange: [-4, 4],
      evaluator3D: (t, y) => 3 * Math.cos(200 * Math.PI * t) * Math.cos(y)
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 11. MC Discrete Periodicity: x[n] = cos(n) (Aperiódico)
  // --------------------------------------------------------------------------------------------------
  'mc-discrete-periodicity-2': {
    id: 'mc-discrete-periodicity-2',
    title: 'Amostragem em Tempo Discreto Aperiódica: x[n] = cos(n)',
    category: 'signals',
    interpretationText: 'Como w0/(2π) = 1/(2π) é irracional, a sequência de amostras x[n] nunca se repete em períodos inteiros.',
    timeDomain: {
      formulaLatex: 'x[n] = \\cos(1 \\cdot n), \\quad n \\in \\mathbb{Z}',
      beforeFormulaLatex: 'x_{cont}(t) = \\cos(t)',
      timeRange: [0, 25],
      curveType: 'discrete_stem',
      yLabel: 'x[n]',
      xLabel: 'n (amostras)',
      evaluator: (n) => {
        const roundedN = Math.round(n);
        const discreteVal = Math.cos(roundedN);
        const continuousVal = Math.cos(n);
        return { y: discreteVal, beforeY: continuousVal };
      },
      discreteSamples: Array.from({ length: 26 }, (_, i) => ({ n: i, val: Math.cos(i) })),
      annotations: [
        { x: 0, y: 1.0, text: 'x[0] = 1.0', color: '#38bdf8' },
        { x: 6, y: Math.cos(6), text: 'x[6] ≈ 0.960 (Diferente de x[0])', color: '#f43f5e' }
      ]
    },
    surface3D: {
      title: 'Hélice Discreta Tridimensional de Amostragem Irracional',
      equationLatex: 'z(n, \\theta) = \\cos(n)\\sin(\\theta)',
      surfaceType: 'discrete_cylinder',
      sigmaRange: [0, 20],
      omegaRange: [-Math.PI, Math.PI],
      evaluator3D: (n, theta) => Math.cos(Math.round(n)) * Math.sin(theta) * 3
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 12. MC Fourier Symmetry: Sinal Ímpar -> Apenas Termos bn sin(n w0 t)
  // --------------------------------------------------------------------------------------------------
  'mc-fourier-symmetry-3': {
    id: 'mc-fourier-symmetry-3',
    title: 'Sinal de Simetria Ímpar e Série Senoidal de Fourier',
    category: 'fourier',
    interpretationText: 'Sinais com simetria ímpar f(-t) = -f(t) anulam integralmente todos os coeficientes cosseno a_n = 0 e média a_0 = 0, restando apenas termos senoidais b_n.',
    timeDomain: {
      formulaLatex: 'f(t) = \\sum_{n=1}^\\infty b_n \\sin(n\\omega_0 t)',
      beforeFormulaLatex: 'f(-t) = -f(t) \\implies a_n = 0',
      timeRange: [-Math.PI, Math.PI],
      curveType: 'even_odd_symmetry',
      yLabel: 'f(t)',
      xLabel: 't',
      evaluator: (t) => {
        // Triangular odd wave or sawtooth
        const y = Math.sin(t) - 0.5 * Math.sin(2 * t) + 0.33 * Math.sin(3 * t);
        const flippedY = - (Math.sin(-t) - 0.5 * Math.sin(-2 * t) + 0.33 * Math.sin(-3 * t));
        return { y, beforeY: flippedY };
      },
      annotations: [
        { x: 0, y: 0, text: 'Simetria de Rotação 180° na Origem', color: '#38bdf8' }
      ]
    },
    frequencyDomain: {
      type: 'discrete_harmonics',
      harmonics: [
        { n: 1, freq: 1, amp: 1.0, phase: 0, isSine: true },
        { n: 2, freq: 2, amp: 0.5, phase: 180, isSine: true },
        { n: 3, freq: 3, amp: 0.33, phase: 0, isSine: true },
        { n: 4, freq: 4, amp: 0.25, phase: 180, isSine: true },
      ]
    },
      surface3D: {
      title: 'Superfície de Fourier com Coeficientes Cosseno Nulos (an = 0)',
      equationLatex: 'z(t, \\omega) = \\sin(t\\omega) \\cdot \\frac{1}{\\omega}',
      surfaceType: 'even_odd_saddle',
      sigmaRange: [-Math.PI, Math.PI],
      omegaRange: [0.5, 5],
      evaluator3D: (t, w) => (Math.sin(t * w) / (w + 0.2)) * 3.5
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 13. MC Laplace Shift: 1/(s^2 + 3s + 2) -> (e^-t - e^-2t)u(t)
  // --------------------------------------------------------------------------------------------------
  'mc-laplace-shift-4': {
    id: 'mc-laplace-shift-4',
    title: 'Transformada Inversa de Laplace de Dois Polos Reais Distintos',
    category: 'laplace',
    interpretationText: 'A decomposição em frações parciais 1/(s+1) - 1/(s+2) gera a resposta no tempo y(t) = (e⁻ᵗ - e⁻²ᵗ)u(t), com pico em t = ln(2) ≈ 0.693s.',
    timeDomain: {
      formulaLatex: 'y(t) = (e^{-t} - e^{-2t})u(t)',
      beforeFormulaLatex: 'Y(s) = \\frac{1}{(s+1)(s+2)} = \\frac{1}{s+1} - \\frac{1}{s+2}',
      timeRange: [0, 6],
      curveType: 'standard',
      yLabel: 'y(t)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const y = Math.exp(-t) - Math.exp(-2 * t);
        const dy = -Math.exp(-t) + 2 * Math.exp(-2 * t);
        return { y, dy, beforeY: Math.exp(-t) };
      },
      annotations: [
        { x: 0.693, y: 0.25, text: 'Pico Máximo t = 0.693s (y = 0.25)', color: '#38bdf8' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: -1, omega: 0, label: 's₁ = -1 (Dominante)' },
        { sigma: -2, omega: 0, label: 's₂ = -2' }
      ],
      rocDescription: 'Re{s} > -1 (Causal e Estável)',
      stabilityStatus: 'stable'
    },
    surface3D: {
      title: 'Superfície de Laplace |Y(s)| com Polos em s = -1 e s = -2',
      equationLatex: '|Y(s)| = \\frac{1}{|(s+1)(s+2)|}',
      surfaceType: 'laplace_poles',
      sigmaRange: [-4, 1],
      omegaRange: [-4, 4],
      evaluator3D: (s, w) => {
        const d1 = Math.sqrt((s + 1) ** 2 + w * w) + 0.15;
        const d2 = Math.sqrt((s + 2) ** 2 + w * w) + 0.15;
        return Math.min(2.5 / (d1 * d2), 7.5);
      },
      peaks: [
        { sigma: -1, omega: 0, label: 'Pólo s = -1', height: 7.5 },
        { sigma: -2, omega: 0, label: 'Pólo s = -2', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 14. MC Stability & Poles: Polos em s = -1 e s = 2 +- j3 (Sistema Instável)
  // --------------------------------------------------------------------------------------------------
  'mc-stability-poles-5': {
    id: 'mc-stability-poles-5',
    title: 'Análise de Estabilidade BIBO com Polos no Semiplano Direito (SPD)',
    category: 'laplace',
    interpretationText: 'A presença de polos com parte real positiva Re{s} = +2 no semiplano direito gera oscilações que crescem exponencialmente e^{(2t)}sin(3t), tornando o sistema instável.',
    timeDomain: {
      formulaLatex: 'y(t) = e^{2t}\\sin(3t)u(t) \\quad [\\text{Resposta Divergente}]',
      beforeFormulaLatex: 'y_{estável}(t) = e^{-t}u(t)',
      timeRange: [0, 3],
      curveType: 'standard',
      yLabel: 'y(t)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const y = Math.exp(1.2 * t) * Math.sin(3 * t);
        const beforeY = Math.exp(-t);
        const dy = Math.exp(1.2 * t) * (1.2 * Math.sin(3 * t) + 3 * Math.cos(3 * t));
        return { y: Math.min(Math.max(y, -15), 15), dy, beforeY };
      },
      annotations: [
        { x: 2.0, y: 10, text: 'Divergência Exponencial no SPD', color: '#f43f5e' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: -1, omega: 0, label: 's = -1 (Estável no SPE)' },
        { sigma: 2, omega: 3, label: 's = +2 + j3 (Instável no SPD)', isUnstable: true },
        { sigma: 2, omega: -3, label: 's = +2 - j3 (Instável no SPD)', isUnstable: true }
      ],
      rocDescription: 'Polos no SPD -> Sistema Instável',
      stabilityStatus: 'unstable'
    },
    surface3D: {
      title: 'Superfície de Laplace |H(s)| com Polos Instáveis no SPD (Re{s} > 0)',
      equationLatex: '|H(s)| = \\frac{1}{|(s+1)((s-2)^2 + 9)|}',
      surfaceType: 'laplace_poles',
      sigmaRange: [-3, 4],
      omegaRange: [-5, 5],
      evaluator3D: (s, w) => {
        const d1 = Math.sqrt((s + 1) ** 2 + w * w) + 0.15;
        const d2 = Math.sqrt((s - 2) ** 2 + (w - 3) ** 2) + 0.15;
        const d3 = Math.sqrt((s - 2) ** 2 + (w + 3) ** 2) + 0.15;
        return Math.min(8.0 / (d1 * d2 * d3), 7.5);
      },
      peaks: [
        { sigma: -1, omega: 0, label: 's = -1', height: 5 },
        { sigma: 2, omega: 3, label: 's = +2 + j3', height: 7.5 },
        { sigma: 2, omega: -3, label: 's = +2 - j3', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 15. MC Fourier Scaling Property: f(-3t) <-> 1/3 F(-w/3)
  // --------------------------------------------------------------------------------------------------
  'mc-fourier-transform-prop-6': {
    id: 'mc-fourier-transform-prop-6',
    title: 'Propriedade de Escala Temporal e Inversão da Transformada de Fourier',
    category: 'fourier',
    interpretationText: 'A compressão temporal por fator 3 causa expansão no espectro em frequência por fator 3 e atenuação de amplitude por 1/|a| = 1/3.',
    timeDomain: {
      formulaLatex: 'g(t) = f(-3t) = e^{-3|t|}',
      beforeFormulaLatex: 'f(t) = e^{-|t|} \\quad [\\text{Sinal Original}]',
      timeRange: [-4, 4],
      curveType: 'standard',
      yLabel: 'Amplitude',
      xLabel: 't',
      evaluator: (t) => {
        const beforeY = Math.exp(-Math.abs(t));
        const y = Math.exp(-3 * Math.abs(t));
        return { y, beforeY, dy: 0 };
      },
      annotations: [
        { x: 0, y: 1.0, text: 'Pico em t = 0', color: '#38bdf8' }
      ]
    },
    frequencyDomain: {
      type: 'fourier_transform',
      evaluatorMag: (w) => (1 / 3) * (2 / (1 + (w / 3) ** 2))
    },
    surface3D: {
      title: 'Espectro de Fourier Escalado Tridimensional',
      equationLatex: '|G(\\omega, \\sigma)| = \\frac{1}{3}\\frac{2}{1 + (\\omega/3)^2 + \\sigma^2}',
      surfaceType: 'fourier_waterfall',
      sigmaRange: [-2, 2],
      omegaRange: [-6, 6],
      evaluator3D: (s, w) => {
        const mag = (1 / 3) * (2 / (1 + (w / 3) ** 2 + s * s * 0.5));
        return mag * 6.5;
      }
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 16. MC Routh-Hurwitz Stability: s^3 + 3s^2 + 3s + (1+K) = 0
  // --------------------------------------------------------------------------------------------------
  'mc-routh-hurwitz-7': {
    id: 'mc-routh-hurwitz-7',
    title: 'Critério de Estabilidade de Routh-Hurwitz e Margem de Ganho K',
    category: 'differential_equations',
    interpretationText: 'Pela tabela de Routh, a primeira coluna exige b1 = (9 - (1+K))/3 = (8 - K)/3 > 0, resultando no intervalo de estabilidade estrita 0 < K < 8.',
    timeDomain: {
      formulaLatex: 'y(t) = 1 - e^{-t}\\cos(\\sqrt{3}t) \\quad (\\text{Para } K = 2 < 8)',
      beforeFormulaLatex: 'y_{limite}(t) = \\cos(\\sqrt{3}t) \\quad (\\text{Para } K = 8)',
      timeRange: [0, 8],
      curveType: 'standard',
      yLabel: 'y(t)',
      xLabel: 't (seg)',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const stableY = 1 - Math.exp(-0.6 * t) * Math.cos(2.2 * t);
        const limitY = Math.cos(2.2 * t);
        return { y: stableY, beforeY: limitY, dy: 0 };
      },
      annotations: [
        { x: 4, y: 1.0, text: 'K=2: Estável e convergente a 1.0', color: '#10b981' }
      ]
    },
    poleZero: {
      poles: [
        { sigma: -0.6, omega: 2.2, label: 'K < 8: Estável (SPE)' },
        { sigma: -0.6, omega: -2.2, label: 'K < 8: Estável (SPE)' },
        { sigma: 0, omega: 2.2, label: 'K = 8: Marginal (Eixo jω)' }
      ],
      rocDescription: 'Estável para 0 < K < 8',
      stabilityStatus: 'stable'
    },
    surface3D: {
      title: 'Lugar das Raízes Tridimensional com Variação de Ganho K',
      equationLatex: 'z(\\sigma, \\omega) = |s^3 + 3s^2 + 3s + 1 + K|^{-1}',
      surfaceType: 'laplace_poles',
      sigmaRange: [-3, 1],
      omegaRange: [-4, 4],
      evaluator3D: (s, w) => {
        const d1 = Math.sqrt((s + 0.6) ** 2 + (w - 2.2) ** 2) + 0.15;
        const d2 = Math.sqrt((s + 0.6) ** 2 + (w + 2.2) ** 2) + 0.15;
        return Math.min(3.5 / (d1 * d2), 7.5);
      },
      peaks: [
        { sigma: -0.6, omega: 2.2, label: 'Pólo K=2', height: 7.5 },
        { sigma: -0.6, omega: -2.2, label: 'Pólo K=2', height: 7.5 }
      ]
    }
  },

  // --------------------------------------------------------------------------------------------------
  // 17. MC Power Factor Correction: P = 12 kW, FP1 = 0.6 -> FP2 = 0.95 (Qc = 12.06 kVAr)
  // --------------------------------------------------------------------------------------------------
  'mc-power-factor-correction-8': {
    id: 'mc-power-factor-correction-8',
    title: 'Correção de Fator de Potência em Cargas Industriais (Sadiku Cap. 11)',
    category: 'electrical_engineering',
    interpretationText: 'O banco de capacitores injeta Qc = 12.06 kVAr reativos, reduzindo a potência aparente de S1 = 20 kVA para S2 = 12.63 kVA e aumentando a eficiência energética.',
    timeDomain: {
      formulaLatex: 'i_2(t) = 55\\cos(120\\pi t - 18.2^\\circ)\\text{ A} \\quad [\\text{Com Capacitor: } \\text{FP}=0.95]',
      beforeFormulaLatex: 'i_1(t) = 87\\cos(120\\pi t - 53.1^\\circ)\\text{ A} \\quad [\\text{Sem Capacitor: } \\text{FP}=0.60]',
      timeRange: [0, 0.04],
      curveType: 'power_signal',
      yLabel: 'Corrente e Tensão',
      xLabel: 't (seg)',
      evaluator: (t) => {
        const w0 = 120 * Math.PI;
        const v = 220 * Math.sqrt(2) * Math.cos(w0 * t);
        const i_before = 87 * Math.cos(w0 * t - (53.1 * Math.PI / 180));
        const i_after = 55 * Math.cos(w0 * t - (18.2 * Math.PI / 180));
        return { y: i_after, beforeY: i_before, secondaryY: v / 5 };
      },
      annotations: [
        { x: 0.01, y: 55, text: 'Corrente reduzida de 87A para 55A (-37%)', color: '#10b981' }
      ]
    },
    surface3D: {
      title: 'Triângulo de Potências Tridimensional (P, Q, S)',
      equationLatex: 'S = \\sqrt{P^2 + (Q_L - Q_C)^2}',
      surfaceType: 'power_ripple',
      sigmaRange: [0, 15],
      omegaRange: [0, 20],
      evaluator3D: (p, q) => {
        const s = Math.sqrt(p * p + q * q);
        return Math.min(s * 0.4, 7.5);
      }
    }
  }
};

// ----------------------------------------------------------------------------------------------------
// INTELLIGENT QUESTION-SPECIFIC PROFILE GENERATOR
// ----------------------------------------------------------------------------------------------------
export function getQuestionGraphProfile(
  problem: {
    id: string;
    title: string;
    statement?: string;
    finalSolutionLatex?: string;
    stepByStepSolution?: string;
    category?: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  }
): QuestionGraphProfile {
  // 1. Direct match on handcrafted benchmark question
  if (DEDICATED_PROBLEM_GRAPH_PROFILES[problem.id]) {
    return DEDICATED_PROBLEM_GRAPH_PROFILES[problem.id];
  }

  const pid = problem.id || '';
  const title = problem.title || '';
  const text = `${problem.title} ${problem.statement || ''} ${problem.finalSolutionLatex || ''} ${problem.stepByStepSolution || ''}`.toLowerCase();
  const cat = problem.category || 'laplace';

  // 2. Deterministic generator for generated question bank: (mc|step)-ch(\d)-(ini|med|adv)-(\d+)
  const bankMatch = pid.match(/(mc|step)-ch(\d)-(ini|med|adv)-(\d+)/i);
  if (bankMatch) {
    const chapter = parseInt(bankMatch[2], 10);
    const diff = bankMatch[3].toLowerCase();
    const i = parseInt(bankMatch[4], 10);

    // =========================================================================
    // CHAPTER 1: SINAIS & SISTEMAS
    // =========================================================================
    if (chapter === 1) {
      if (diff === 'ini') {
        const variant = i % 4;
        const a = (i % 7) + 2;
        const b = (i % 5) + 1;
        const w0 = (i % 8) + 2;
        const t0 = (i % 6) + 1;

        if (variant === 0) {
          // Paridade
          const isOdd = (i % 2) === 0;
          return {
            id: pid,
            title: `Questão ${i} (Cap 1) – ${isOdd ? 'Simetria Ímpar' : 'Simetria Par'}: x(t)`,
            category: 'signals',
            interpretationText: isOdd
              ? `Sinal com simetria ímpar x(-t) = -x(t), rotação de 180° em relação à origem. Coeficientes a = ${a}, b = ${b}, ω₀ = ${w0} rad/s.`
              : `Sinal com simetria par x(-t) = x(t), reflexão especular no eixo y. Coeficientes a = ${a}, b = ${b}, ω₀ = ${w0} rad/s.`,
            timeDomain: {
              formulaLatex: isOdd ? `x(t) = ${a}t^3 + ${b}\\sin(${w0}t)` : `x(t) = ${a}t^2 + ${b}\\cos(${w0}t)`,
              beforeFormulaLatex: isOdd ? `x(-t) = -(${a}t^3 + ${b}\\sin(${w0}t))` : `x(-t) = ${a}t^2 + ${b}\\cos(${w0}t)`,
              timeRange: [-3, 3],
              curveType: 'even_odd_symmetry',
              evaluator: (t) => {
                const y = isOdd ? a * Math.pow(t, 3) * 0.12 + b * Math.sin(w0 * t) : a * Math.pow(t, 2) * 0.25 + b * Math.cos(w0 * t);
                const beforeY = isOdd ? -(a * Math.pow(-t, 3) * 0.12 + b * Math.sin(-w0 * t)) : (a * Math.pow(-t, 2) * 0.25 + b * Math.cos(-w0 * t));
                return { y, beforeY, dy: 0 };
              },
              annotations: [{ x: 0, y: isOdd ? 0 : b, text: isOdd ? 'Origem x(0)=0' : `Interseção (0, ${b})`, color: '#38bdf8' }]
            },
            surface3D: {
              title: `Superfície 3D de Simetria ${isOdd ? 'Ímpar' : 'Par'} – Questão ${i}`,
              equationLatex: isOdd ? `z(x, y) = (${a}x^3 + ${b}\\sin(${w0}x))\\cos(y)` : `z(x, y) = (${a}x^2 + ${b}\\cos(${w0}x))\\cos(y)`,
              surfaceType: 'even_odd_saddle',
              sigmaRange: [-3, 3],
              omegaRange: [-3, 3],
              evaluator3D: (x, y) => {
                const base = isOdd ? (a * Math.pow(x, 3) * 0.08 + b * Math.sin(w0 * x)) : (a * Math.pow(x, 2) * 0.15 + b * Math.cos(w0 * x));
                return Math.min(Math.max(base * Math.cos(y) * 0.8, -6), 6);
              }
            }
          };
        } else if (variant === 1) {
          // Deslocamento Temporal
          return {
            id: pid,
            title: `Questão ${i} (Cap 1) – Deslocamento Temporal: u(t - ${t0})`,
            category: 'signals',
            interpretationText: `Degrau unitário atrasado em t₀ = ${t0} segundos com amplitude escalada por ${a}.`,
            timeDomain: {
              formulaLatex: `x(t) = ${a}u(t - ${t0})`,
              beforeFormulaLatex: `x_{orig}(t) = ${a}u(t)`,
              timeRange: [0, t0 + 4],
              curveType: 'standard',
              evaluator: (t) => {
                const y = t >= t0 ? a : 0;
                const beforeY = t >= 0 ? a : 0;
                return { y, beforeY, dy: 0 };
              },
              annotations: [
                { x: t0, y: a, text: `Degrau ativado em t = ${t0}s`, color: '#38bdf8' },
                { x: 0, y: a, text: 'Degrau original em t = 0s', color: '#fbbf24' }
              ]
            },
            surface3D: {
              title: `Superfície 3D de Degrau Deslocado (t₀ = ${t0})`,
              equationLatex: `z(t, y) = ${a}u(t - ${t0})e^{-0.2|y|}`,
              surfaceType: 'even_odd_saddle',
              sigmaRange: [0, t0 + 4],
              omegaRange: [-3, 3],
              evaluator3D: (t, y) => (t >= t0 ? a * Math.exp(-0.2 * Math.abs(y)) * 0.8 : 0)
            }
          };
        } else if (variant === 2) {
          // Linearidade
          return {
            id: pid,
            title: `Questão ${i} (Cap 1) – Teste de Linearidade e Offset: y(t) = ${a}x(t) + ${b}`,
            category: 'signals',
            interpretationText: `Devido ao termo aditivo não-nulo b = ${b}, o sistema viola a homogeneidade x(t)=0 => y(t)=${b} != 0, sendo estritamente Não-Linear.`,
            timeDomain: {
              formulaLatex: `y(t) = ${a}\\cos(2t) + ${b}`,
              beforeFormulaLatex: `x(t) = \\cos(2t) \\quad [\\text{Entrada}]`,
              timeRange: [0, 6],
              curveType: 'standard',
              evaluator: (t) => {
                const x_in = Math.cos(2 * t);
                const y = a * x_in + b;
                return { y, beforeY: x_in, dy: -2 * a * Math.sin(2 * t) };
              },
              annotations: [
                { x: 0, y: a + b, text: `Offset DC = ${b} V`, color: '#10b981' }
              ]
            },
            surface3D: {
              title: `Mapeamento Entrada-Saída Tridimensional com Offset b = ${b}`,
              equationLatex: `z(x, t) = ${a}x + ${b}\\cos(t)`,
              surfaceType: 'power_ripple',
              sigmaRange: [-2, 2],
              omegaRange: [0, 6],
              evaluator3D: (x, t) => Math.min(Math.max((a * x + b * Math.cos(t)) * 0.5, -6), 6)
            }
          };
        } else {
          // Energia e Potência
          return {
            id: pid,
            title: `Questão ${i} (Cap 1) – Sinal Exponencial de Energia: x(t) = ${a}e^{-${b}t}u(t)`,
            category: 'signals',
            interpretationText: `Sinal puramente de energia com energia total finita E = ${a}²/(2·${b}) = ${( (a*a)/(2*b) ).toFixed(2)} J e potência média nula P = 0 W.`,
            timeDomain: {
              formulaLatex: `x(t) = ${a}e^{-${b}t}u(t), \\quad E = ${((a*a)/(2*b)).toFixed(2)}\\text{ J}`,
              beforeFormulaLatex: `p(t) = x^2(t) = ${a*a}e^{-${2*b}t}u(t)`,
              timeRange: [0, Math.max(3, 5 / b)],
              curveType: 'standard',
              evaluator: (t) => {
                if (t < 0) return { y: 0, beforeY: 0, dy: 0 };
                const y = a * Math.exp(-b * t);
                const p = (a * a) * Math.exp(-2 * b * t);
                return { y, beforeY: p, dy: -a * b * Math.exp(-b * t) };
              },
              annotations: [
                { x: 0, y: a, text: `Amplitude Inicial = ${a}`, color: '#38bdf8' }
              ]
            },
            surface3D: {
              title: `Densidade de Energia Tridimensional e(t, y) = ${a}²e^{-${2*b}t}`,
              equationLatex: `z(t, y) = ${a}^2 e^{-${2*b}t}\\cos(y)`,
              surfaceType: 'even_odd_saddle',
              sigmaRange: [0, 4],
              omegaRange: [-3, 3],
              evaluator3D: (t, y) => (t >= 0 ? a * a * Math.exp(-2 * b * t) * Math.cos(y) * 0.2 : 0)
            }
          };
        }
      } else if (diff === 'med') {
        // Convolução de pulsos retangulares
        const len1 = (i % 4) + 2;
        const len2 = (i % 3) + 1;
        const total = len1 + len2;
        const plat = Math.abs(len1 - len2);

        return {
          id: pid,
          title: `Questão ${i} (Cap 1) – Convolução de Pulsos Retangulares (T₁=${len1}s, T₂=${len2}s)`,
          category: 'signals',
          interpretationText: `A convolução entre retângulos de durações ${len1}s e ${len2}s gera um sinal ${len1 === len2 ? 'triangular' : 'trapezoidal'} com suporte total de ${total}s e patamar de ${plat}s.`,
          timeDomain: {
            formulaLatex: `y(t) = \\text{rect}(t/${len1}) * \\text{rect}(t/${len2}) \\quad [\\text{Duração: } ${total}\\text{s}]`,
            beforeFormulaLatex: `x_1(t) = \\text{rect}(t/${len1}), \\quad x_2(t) = \\text{rect}(t/${len2})`,
            timeRange: [0, total + 2],
            curveType: 'piecewise',
            evaluator: (t) => {
              const minL = Math.min(len1, len2);
              const maxL = Math.max(len1, len2);
              let y = 0;
              if (t >= 0 && t < minL) {
                y = t;
              } else if (t >= minL && t < maxL) {
                y = minL;
              } else if (t >= maxL && t < total) {
                y = total - t;
              }
              const p1 = t >= 0 && t <= len1 ? 1 : 0;
              return { y, beforeY: p1, dy: 0 };
            },
            annotations: [
              { x: Math.min(len1, len2), y: Math.min(len1, len2), text: `Pico Máximo = ${Math.min(len1, len2)}`, color: '#38bdf8' },
              { x: total, y: 0, text: `Fim do Suporte t = ${total}s`, color: '#10b981' }
            ]
          },
          surface3D: {
            title: `Superfície de Convolução 2D no Espaço (t, τ) – Questão ${i}`,
            equationLatex: `z(t, \\tau) = \\text{rect}(\\tau/${len1}) \\cdot \\text{rect}((t-\\tau)/${len2})`,
            surfaceType: 'even_odd_saddle',
            sigmaRange: [0, total],
            omegaRange: [0, total],
            evaluator3D: (t, tau) => {
              const inside = tau >= 0 && tau <= len1 && (t - tau) >= 0 && (t - tau) <= len2;
              return inside ? 4.5 : 0;
            }
          }
        };
      } else {
        // Nyquist & Aliasing
        const fmax = (i % 6) * 50 + 100;
        const nyq = 2 * fmax;
        const fs = nyq - 20;

        return {
          id: pid,
          title: `Questão ${i} (Cap 1) – Amostragem de Nyquist e Aliasing (B = ${fmax} Hz)`,
          category: 'signals',
          interpretationText: `A taxa mínima de Nyquist é 2·${fmax} = ${nyq} Hz. Como fs = ${fs} Hz < ${nyq} Hz, as réplicas espectrais colidem, gerando aliasing irreversível.`,
          timeDomain: {
            formulaLatex: `x_{rec}(t) = \\cos(2\\pi \\cdot ${fs - fmax} t) \\quad [\\text{Sinal Falso com Aliasing}]`,
            beforeFormulaLatex: `x_{orig}(t) = \\cos(2\\pi \\cdot ${fmax} t) \\quad [\\text{Sinal Original } ${fmax}\\text{ Hz}]`,
            timeRange: [0, 0.04],
            curveType: 'standard',
            evaluator: (t) => {
              const orig = Math.cos(2 * Math.PI * fmax * t);
              const alias = Math.cos(2 * Math.PI * Math.abs(fs - fmax) * t);
              return { y: alias, beforeY: orig, dy: 0 };
            },
            annotations: [
              { x: 0.01, y: 1.0, text: `Original: ${fmax} Hz vs Falso: ${Math.abs(fs - fmax)} Hz`, color: '#f43f5e' }
            ]
          },
          frequencyDomain: {
            type: 'fourier_transform',
            evaluatorMag: (w) => {
              const f = Math.abs(w / (2 * Math.PI));
              const dist1 = Math.abs(f - fmax);
              const dist2 = Math.abs(f - (fs - fmax));
              return (dist1 < 10 ? 1 : 0) + (dist2 < 10 ? 0.8 : 0);
            }
          },
          surface3D: {
            title: 'Sobreposição de Réplicas Espectrais de Nyquist',
            equationLatex: `X_s(f, y) = \\sum X(f - k f_s), \\quad f_s = ${fs}\\text{ Hz}`,
            surfaceType: 'fourier_waterfall',
            sigmaRange: [-2, 2],
            omegaRange: [-nyq, nyq],
            evaluator3D: (s, f) => {
              const d1 = Math.abs(Math.abs(f) - fmax);
              const d2 = Math.abs(Math.abs(f) - Math.abs(fs - fmax));
              const pk = Math.exp(-d1 * 0.1) + Math.exp(-d2 * 0.1);
              return pk * 3.5 * Math.exp(-s * s * 0.5);
            }
          }
        };
      }
    }

    // =========================================================================
    // CHAPTER 2: ANÁLISE DE FOURIER
    // =========================================================================
    if (chapter === 2) {
      if (diff === 'ini') {
        const w0 = (i % 6) + 2;
        return {
          id: pid,
          title: `Questão ${i} (Cap 2) – Harmônicos de Fourier: 3cos(${w0}πt) + 2sin(${2*w0}πt)`,
          category: 'fourier',
          interpretationText: `Soma harmônica com frequência angular fundamental ω₀ = ${w0}π rad/s e período T₀ = 2/${w0} s. Harmônico 1 (3 cos) e Harmônico 2 (2 sin).`,
          timeDomain: {
            formulaLatex: `x(t) = 3\\cos(${w0}\\pi t) + 2\\sin(${2*w0}\\pi t)`,
            beforeFormulaLatex: `x_1(t) = 3\\cos(${w0}\\pi t) \\quad [\\text{Fundamental}]`,
            timeRange: [0, (4 / w0)],
            curveType: 'fourier_harmonics',
            evaluator: (t) => {
              const f1 = 3 * Math.cos(w0 * Math.PI * t);
              const f2 = 2 * Math.sin(2 * w0 * Math.PI * t);
              return { y: f1 + f2, beforeY: f1, secondaryY: f2, dy: 0 };
            },
            annotations: [
              { x: 2 / w0, y: 3, text: `Período Completo T₀ = ${(2/w0).toFixed(2)}s`, color: '#10b981' }
            ]
          },
          frequencyDomain: {
            type: 'discrete_harmonics',
            harmonics: [
              { n: 1, freq: w0, amp: 3, phase: 0, isSine: false },
              { n: 2, freq: 2 * w0, amp: 2, phase: -90, isSine: true }
            ]
          },
          surface3D: {
            title: `Cascata 3D de Harmônicos – Questão ${i}`,
            equationLatex: `z(t, \\omega) = 3\\cos(${w0}\\pi t)e^{-(\\omega - ${w0})^2} + 2\\sin(${2*w0}\\pi t)e^{-(\\omega - ${2*w0})^2}`,
            surfaceType: 'fourier_waterfall',
            sigmaRange: [0, 4 / w0],
            omegaRange: [0, 3 * w0 + 2],
            evaluator3D: (t, w) => {
              const h1 = 3 * Math.cos(w0 * Math.PI * t) * Math.exp(-((w - w0) ** 2) * 1.5);
              const h2 = 2 * Math.sin(2 * w0 * Math.PI * t) * Math.exp(-((w - 2 * w0) ** 2) * 1.5);
              return Math.min(Math.abs(h1 + h2) * 1.2, 7.5);
            }
          }
        };
      } else if (diff === 'med') {
        return {
          id: pid,
          title: `Questão ${i} (Cap 2) – Segunda Derivada de Fourier: G(ω) = -ω² F(ω)`,
          category: 'fourier',
          interpretationText: 'A propriedade da diferenciação temporal multiplica o espectro original por (jω)² = -ω², acentuando fortemente as altas frequências.',
          timeDomain: {
            formulaLatex: `g(t) = \\frac{d^2}{dt^2}e^{-t^2/2} = (t^2 - 1)e^{-t^2/2}`,
            beforeFormulaLatex: `f(t) = e^{-t^2/2} \\quad [\\text{Gaussiana Original}]`,
            timeRange: [-4, 4],
            curveType: 'standard',
            evaluator: (t) => {
              const orig = Math.exp(-0.5 * t * t);
              const deriv2 = (t * t - 1) * Math.exp(-0.5 * t * t);
              return { y: deriv2, beforeY: orig, dy: 0 };
            },
            annotations: [
              { x: 0, y: -1, text: 'Mínimo da 2ª Derivada em t = 0', color: '#38bdf8' }
            ]
          },
          frequencyDomain: {
            type: 'fourier_transform',
            evaluatorMag: (w) => (w * w) * Math.exp(-0.5 * w * w)
          },
          surface3D: {
            title: 'Acentuação Espectral Tridimensional por -ω²',
            equationLatex: '|G(\\omega, \\sigma)| = (\\omega^2 + \\sigma^2)e^{-(\\omega^2 + \\sigma^2)/2}',
            surfaceType: 'fourier_waterfall',
            sigmaRange: [-3, 3],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const r2 = s * s + w * w;
              return r2 * Math.exp(-0.5 * r2) * 4.5;
            }
          }
        };
      } else {
        const aParam = (i % 3) + 2;
        return {
          id: pid,
          title: `Questão ${i} (Cap 2) – Teorema de Parseval: x(t) = e^{-${aParam}|t|}`,
          category: 'fourier',
          interpretationText: `A energia total calculada no tempo E = ∫|x(t)|²dt = 1/${aParam} J coincide exatamente com a integral da densidade espectral 1/(2π)∫|X(ω)|²dω = ${(1/aParam).toFixed(3)} Joules.`,
          timeDomain: {
            formulaLatex: `x(t) = e^{-${aParam}|t|}, \\quad E = \\frac{1}{${aParam}}\\text{ J} = ${(1/aParam).toFixed(3)}\\text{ J}`,
            beforeFormulaLatex: `S_{xx}(\\omega) = \\left( \\frac{${2*aParam}}{${aParam*aParam} + \\omega^2} \\right)^2`,
            timeRange: [-4, 4],
            curveType: 'standard',
            evaluator: (t) => {
              const y = Math.exp(-aParam * Math.abs(t));
              const p = Math.exp(-2 * aParam * Math.abs(t));
              return { y, beforeY: p, dy: 0 };
            },
            annotations: [
              { x: 0, y: 1.0, text: `Energia Total E = ${(1/aParam).toFixed(3)} J`, color: '#10b981' }
            ]
          },
          surface3D: {
            title: `Densidade Espectral de Energia Tridimensional S_xx(ω, σ)`,
            equationLatex: `S_{xx}(\\omega, \\sigma) = \\frac{${4*aParam*aParam}}{(${aParam*aParam} + \\omega^2 + \\sigma^2)^2}`,
            surfaceType: 'fourier_waterfall',
            sigmaRange: [-3, 3],
            omegaRange: [-6, 6],
            evaluator3D: (s, w) => {
              const num = 4 * aParam * aParam;
              const den = (aParam * aParam + w * w + s * s) ** 2;
              return (num / den) * 4.5;
            }
          }
        };
      }
    }

    // =========================================================================
    // CHAPTER 3: TRANSFORMADA DE LAPLACE
    // =========================================================================
    if (chapter === 3) {
      if (diff === 'ini') {
        const p = (i % 5) + 1;
        const kVal = (i % 4) + 2;
        return {
          id: pid,
          title: `Questão ${i} (Cap 3) – Rampa Exponencial: f(t) = ${kVal}t e^{-${p}t}u(t)`,
          category: 'laplace',
          interpretationText: `Polo duplo em s = -${p}. A resposta atinge valor de pico máximo em t = 1/${p} = ${(1/p).toFixed(2)}s com amplitude y_max = ${( (kVal/p)*Math.exp(-1) ).toFixed(2)}.`,
          timeDomain: {
            formulaLatex: `f(t) = ${kVal}t e^{-${p}t}u(t) \\iff F(s) = \\frac{${kVal}}{(s + ${p})^2}`,
            beforeFormulaLatex: `f_{exp}(t) = ${kVal}e^{-${p}t}u(t)`,
            timeRange: [0, Math.max(4, 6 / p)],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = kVal * t * Math.exp(-p * t);
              const beforeY = kVal * Math.exp(-p * t);
              const dy = kVal * (1 - p * t) * Math.exp(-p * t);
              return { y, dy, beforeY };
            },
            annotations: [
              { x: 1 / p, y: (kVal / p) * Math.exp(-1), text: `Pico em t = ${(1/p).toFixed(2)}s`, color: '#38bdf8' }
            ]
          },
          poleZero: {
            poles: [
              { sigma: -p, omega: 0, label: `Polo Duplo s = -${p} (Ordem 2)` }
            ],
            rocDescription: `Re{s} > -${p}`,
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Superfície de Laplace |F(s)| com Polo de 2ª Ordem em s = -${p}`,
            equationLatex: `|F(s)| = \\frac{${kVal}}{|s + ${p}|^2}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-p - 3, 2],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const d2 = (s + p) ** 2 + w * w + 0.15;
              return Math.min((kVal * 1.5) / d2, 7.5);
            },
            peaks: [{ sigma: -p, omega: 0, label: `Polo Duplo s = -${p}`, height: 7.5 }]
          }
        };
      } else if (diff === 'med') {
        const p1 = (i % 3) + 1;
        const p2 = p1 + (i % 3) + 2;
        const num = p2 - p1;
        return {
          id: pid,
          title: `Questão ${i} (Cap 3) – Frações Parciais: ${num}/((s+${p1})(s+${p2}))`,
          category: 'laplace',
          interpretationText: `Decomposição em dois polos reais em s = -${p1} e s = -${p2}. Resposta no tempo: y(t) = (e^{-${p1}t} - e^{-${p2}t})u(t).`,
          timeDomain: {
            formulaLatex: `f(t) = (e^{-${p1}t} - e^{-${p2}t})u(t)`,
            beforeFormulaLatex: `F(s) = \\frac{1}{s+${p1}} - \\frac{1}{s+${p2}}`,
            timeRange: [0, Math.max(4, 6 / p1)],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = Math.exp(-p1 * t) - Math.exp(-p2 * t);
              const dy = -p1 * Math.exp(-p1 * t) + p2 * Math.exp(-p2 * t);
              return { y, dy, beforeY: Math.exp(-p1 * t) };
            },
            annotations: [
              { x: Math.log(p2 / p1) / (p2 - p1), y: Math.exp(-p1 * (Math.log(p2 / p1) / (p2 - p1))) - Math.exp(-p2 * (Math.log(p2 / p1) / (p2 - p1))), text: 'Pico Transitório', color: '#38bdf8' }
            ]
          },
          poleZero: {
            poles: [
              { sigma: -p1, omega: 0, label: `s₁ = -${p1} (Lento / Dominante)` },
              { sigma: -p2, omega: 0, label: `s₂ = -${p2} (Rápido)` }
            ],
            rocDescription: `Re{s} > -${p1}`,
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Superfície 3D |F(s)| com Polos em s = -${p1} e s = -${p2}`,
            equationLatex: `|F(s)| = \\frac{${num}}{|(s+${p1})(s+${p2})|}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-p2 - 2, 2],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const d1 = Math.sqrt((s + p1) ** 2 + w * w) + 0.15;
              const d2 = Math.sqrt((s + p2) ** 2 + w * w) + 0.15;
              return Math.min((num * 2.5) / (d1 * d2), 7.5);
            },
            peaks: [
              { sigma: -p1, omega: 0, label: `s₁ = -${p1}`, height: 7.5 },
              { sigma: -p2, omega: 0, label: `s₂ = -${p2}`, height: 7.5 }
            ]
          }
        };
      } else {
        const a1 = (i % 3) + 1;
        const a2 = (i % 3) + 3;
        const numVal = a1 * a2 * 5;
        return {
          id: pid,
          title: `Questão ${i} (Cap 3) – Teorema do Valor Inicial e Final: TVI=0, TVF=5`,
          category: 'laplace',
          interpretationText: `O polo integrador em s = 0 fixa o regime permanente y(∞) = 5.0, e a diferença de graus no denominador garante y(0⁺) = 0.`,
          timeDomain: {
            formulaLatex: `y(t) = 5\\left(1 - \\frac{${a2}e^{-${a1}t} - ${a1}e^{-${a2}t}}{${a2 - a1}}\\right)u(t)`,
            beforeFormulaLatex: `y_{final}(t) = 5.0 \\quad [\\text{Assíntota TVF}]`,
            timeRange: [0, Math.max(5, 7 / a1)],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = 5 * (1 - (a2 * Math.exp(-a1 * t) - a1 * Math.exp(-a2 * t)) / (a2 - a1));
              return { y, beforeY: 5.0, dy: 5 * (a1 * a2 * (Math.exp(-a1 * t) - Math.exp(-a2 * t))) / (a2 - a1) };
            },
            annotations: [
              { x: 0, y: 0, text: 'TVI: y(0⁺) = 0', color: '#38bdf8' },
              { x: 5 / a1, y: 5.0, text: 'TVF: y(∞) = 5.0', color: '#10b981' }
            ]
          },
          poleZero: {
            poles: [
              { sigma: 0, omega: 0, label: 's = 0 (Degrau / DC)' },
              { sigma: -a1, omega: 0, label: `s = -${a1}` },
              { sigma: -a2, omega: 0, label: `s = -${a2}` }
            ],
            stabilityStatus: 'marginally_stable'
          },
          surface3D: {
            title: `Superfície 3D |Y(s)| com Polo na Origem e Polos em s = -${a1}, -${a2}`,
            equationLatex: `|Y(s)| = \\frac{${numVal}}{|s(s+${a1})(s+${a2})|}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-a2 - 2, 2],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const d0 = Math.sqrt(s * s + w * w) + 0.15;
              const d1 = Math.sqrt((s + a1) ** 2 + w * w) + 0.15;
              const d2 = Math.sqrt((s + a2) ** 2 + w * w) + 0.15;
              return Math.min(numVal / (d0 * d1 * d2), 7.5);
            },
            peaks: [
              { sigma: 0, omega: 0, label: 's = 0', height: 7.5 },
              { sigma: -a1, omega: 0, label: `s = -${a1}`, height: 7.5 },
              { sigma: -a2, omega: 0, label: `s = -${a2}`, height: 7.5 }
            ]
          }
        };
      }
    }

    // =========================================================================
    // CHAPTER 4: EQUAÇÕES DIFERENCIAIS ORDINÁRIAS (EDOs)
    // =========================================================================
    if (chapter === 4) {
      if (diff === 'ini') {
        const a = (i % 4) + 2;
        const y0 = (i % 3) + 1;
        return {
          id: pid,
          title: `Questão ${i} (Cap 4) – EDO 1ª Ordem: y'(t) + ${a}y(t) = 0, y(0) = ${y0}`,
          category: 'differential_equations',
          interpretationText: `Resposta à entrada nula (ZIR) com decaimento exponencial Puro: y(t) = ${y0}e^{-${a}t} e constante de tempo τ = ${(1/a).toFixed(2)}s.`,
          timeDomain: {
            formulaLatex: `y(t) = ${y0}e^{-${a}t}u(t)`,
            beforeFormulaLatex: `y(0) = ${y0}`,
            timeRange: [0, 6 / a],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = y0 * Math.exp(-a * t);
              return { y, beforeY: y0, dy: -a * y0 * Math.exp(-a * t) };
            },
            annotations: [
              { x: 0, y: y0, text: `Condição Inicial y(0) = ${y0}`, color: '#38bdf8' },
              { x: 1 / a, y: y0 * 0.368, text: `1τ: ${(y0*0.368).toFixed(2)} (36.8%)`, color: '#10b981' }
            ]
          },
          poleZero: {
            poles: [{ sigma: -a, omega: 0, label: `Polo s = -${a}` }],
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Superfície 3D |Y(s)| da EDO de 1ª Ordem`,
            equationLatex: `|Y(s)| = \\frac{${y0}}{|s + ${a}|}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-a - 3, 2],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const d = Math.sqrt((s + a) ** 2 + w * w) + 0.15;
              return Math.min((y0 * 2.5) / d, 7.5);
            },
            peaks: [{ sigma: -a, omega: 0, label: `s = -${a}`, height: 7.5 }]
          }
        };
      } else if (diff === 'med') {
        const wn = (i % 4) + 2;
        return {
          id: pid,
          title: `Questão ${i} (Cap 4) – EDO 2ª Ordem Criticamente Amortecida (ωₙ = ${wn} rad/s, ζ = 1)`,
          category: 'differential_equations',
          interpretationText: `EDO criticamente amortecida com polo real duplo em s = -${wn}. Resposta mais rápida possível sem sobressinal (overshoot nulo).`,
          timeDomain: {
            formulaLatex: `y(t) = 1 - (1 + ${wn}t)e^{-${wn}t}u(t)`,
            beforeFormulaLatex: `y_{final}(t) = 1.0 \\quad [\\text{Entrada Degrau}]`,
            timeRange: [0, 6 / wn],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = 1 - (1 + wn * t) * Math.exp(-wn * t);
              const dy = (wn * wn * t) * Math.exp(-wn * t);
              return { y, dy, beforeY: 1.0 };
            },
            annotations: [
              { x: 3 / wn, y: 0.95, text: '95% de estabilização sem oscilar', color: '#10b981' }
            ]
          },
          poleZero: {
            poles: [{ sigma: -wn, omega: 0, label: `Polo Duplo s = -${wn}` }],
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Superfície 3D de Resposta Criticamente Amortecida`,
            equationLatex: `|H(s)| = \\frac{${wn*wn}}{|s + ${wn}|^2}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-wn - 3, 2],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const d2 = (s + wn) ** 2 + w * w + 0.15;
              return Math.min((wn * wn * 1.5) / d2, 7.5);
            },
            peaks: [{ sigma: -wn, omega: 0, label: `s = -${wn}`, height: 7.5 }]
          }
        };
      } else {
        const l1 = (i % 3) + 1;
        const l2 = (i % 3) + 4;
        return {
          id: pid,
          title: `Questão ${i} (Cap 4) – Espaço de Estados: Autovalores λ₁ = -${l1}, λ₂ = -${l2}`,
          category: 'differential_equations',
          interpretationText: `A matriz de estados possui autovalores reais estritamente no semiplano esquerdo (SPE): λ₁ = -${l1} e λ₂ = -${l2}. Sistema Assintoticamente Estável.`,
          timeDomain: {
            formulaLatex: `x_1(t) = \\frac{${l2}e^{-${l1}t} - ${l1}e^{-${l2}t}}{${l2 - l1}}u(t)`,
            beforeFormulaLatex: `\\dot{\\mathbf{x}} = \\mathbf{A}\\mathbf{x}`,
            timeRange: [0, 6 / l1],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = (l2 * Math.exp(-l1 * t) - l1 * Math.exp(-l2 * t)) / (l2 - l1);
              return { y, beforeY: Math.exp(-l1 * t), dy: 0 };
            },
            annotations: [
              { x: 0, y: 1.0, text: 'Condição Inicial x₁(0) = 1.0', color: '#38bdf8' }
            ]
          },
          poleZero: {
            poles: [
              { sigma: -l1, omega: 0, label: `λ₁ = -${l1} (SPE)` },
              { sigma: -l2, omega: 0, label: `λ₂ = -${l2} (SPE)` }
            ],
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Retrato de Fase Tridimensional de Autovalores`,
            equationLatex: `\\det(s\\mathbf{I} - \\mathbf{A}) = (s + ${l1})(s + ${l2})`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-l2 - 2, 2],
            omegaRange: [-4, 4],
            evaluator3D: (s, w) => {
              const d1 = Math.sqrt((s + l1) ** 2 + w * w) + 0.15;
              const d2 = Math.sqrt((s + l2) ** 2 + w * w) + 0.15;
              return Math.min(3.5 / (d1 * d2), 7.5);
            },
            peaks: [
              { sigma: -l1, omega: 0, label: `λ₁ = -${l1}`, height: 7.5 },
              { sigma: -l2, omega: 0, label: `λ₂ = -${l2}`, height: 7.5 }
            ]
          }
        };
      }
    }

    // =========================================================================
    // CHAPTER 5: ENGENHARIA ELÉTRICA & CIRCUITOS
    // =========================================================================
    if (chapter === 5) {
      if (diff === 'ini') {
        const r = (i % 6) + 1;
        const c = (i % 5) + 1;
        const tau = r * c;
        const vin = (i % 4) * 5 + 10;
        return {
          id: pid,
          title: `Questão ${i} (Cap 5) – Carga de Capacitor RC (R = ${r}kΩ, C = ${c}μF, τ = ${tau}ms)`,
          category: 'electrical_engineering',
          interpretationText: `O capacitor carrega exponencialmente até Vin = ${vin}V com constante de tempo τ = ${tau} ms (em 1τ atinge 63.2% = ${(vin * 0.632).toFixed(1)}V).`,
          timeDomain: {
            formulaLatex: `v_C(t) = ${vin}\\left(1 - e^{-t/${tau}\\text{ms}}\\right)u(t)\\text{ V}`,
            beforeFormulaLatex: `V_{in} = ${vin}\\text{ V} \\quad [\\text{Fonte Degrau}]`,
            timeRange: [0, 5 * tau],
            curveType: 'standard',
            yLabel: 'v_C(t) [V]',
            xLabel: 't (ms)',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = vin * (1 - Math.exp(-t / tau));
              const dy = (vin / tau) * Math.exp(-t / tau);
              return { y, dy, beforeY: vin };
            },
            annotations: [
              { x: tau, y: vin * 0.632, text: `1τ: ${(vin*0.632).toFixed(1)}V (63.2%)`, color: '#38bdf8' },
              { x: 5 * tau, y: vin, text: `Regime Permanente ${vin}V`, color: '#10b981' }
            ]
          },
          poleZero: {
            poles: [{ sigma: -1 / (tau * 0.001), omega: 0, label: `Polo s = -${(1000/tau).toFixed(0)} rad/s` }],
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Superfície 3D de Carga Elétrica no Tempo e Espaço`,
            equationLatex: `v_C(t, y) = ${vin}(1 - e^{-t/${tau}})\\cos(y)`,
            surfaceType: 'even_odd_saddle',
            sigmaRange: [0, 5 * tau],
            omegaRange: [-3, 3],
            evaluator3D: (t, y) => (t >= 0 ? (vin * (1 - Math.exp(-t / tau)) * Math.cos(y) * 0.35) : 0)
          }
        };
      } else if (diff === 'med') {
        const alpha = (i % 3) + 2;
        const wd = (i % 4) + 3;
        return {
          id: pid,
          title: `Questão ${i} (Cap 5) – Circuito RLC Série Subamortecido (α = ${alpha}, ωd = ${wd} rad/s)`,
          category: 'electrical_engineering',
          interpretationText: `Circuito RLC ressonante com fator de amortecimento α = ${alpha} s⁻¹ e frequência oscilatória amortecida ωd = ${wd} rad/s.`,
          timeDomain: {
            formulaLatex: `i(t) = e^{-${alpha}t}\\sin(${wd}t)\\text{ A}`,
            beforeFormulaLatex: `i_{envoltória}(t) = \\pm e^{-${alpha}t}`,
            timeRange: [0, 6 / alpha],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const env = Math.exp(-alpha * t);
              const y = env * Math.sin(wd * t);
              return { y, dy: env * (-alpha * Math.sin(wd * t) + wd * Math.cos(wd * t)), beforeY: env };
            },
            annotations: [
              { x: (Math.PI / 2) / wd, y: Math.exp(-alpha * ((Math.PI / 2) / wd)), text: '1º Pico de Corrente', color: '#38bdf8' }
            ]
          },
          poleZero: {
            poles: [
              { sigma: -alpha, omega: wd, label: `s₁ = -${alpha} + j${wd}` },
              { sigma: -alpha, omega: -wd, label: `s₂ = -${alpha} - j${wd}` }
            ],
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Superfície 3D |I(s)| do Circuito RLC Subamortecido`,
            equationLatex: `|I(s)| = \\frac{1}{|(s+${alpha})^2 + ${wd}^2|}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-alpha - 3, 2],
            omegaRange: [-wd - 3, wd + 3],
            evaluator3D: (s, w) => {
              const d1 = Math.sqrt((s + alpha) ** 2 + (w - wd) ** 2) + 0.15;
              const d2 = Math.sqrt((s + alpha) ** 2 + (w + wd) ** 2) + 0.15;
              return Math.min(6.0 / (d1 * d2), 7.5);
            },
            peaks: [
              { sigma: -alpha, omega: wd, label: `s₁ = -${alpha} + j${wd}`, height: 7.5 },
              { sigma: -alpha, omega: -wd, label: `s₂ = -${alpha} - j${wd}`, height: 7.5 }
            ]
          }
        };
      } else {
        const fc = (i % 5) * 10 + 20;
        return {
          id: pid,
          title: `Questão ${i} (Cap 5) – Filtro Passa-Baixas Ativo (fc = ${fc} rad/s)`,
          category: 'electrical_engineering',
          interpretationText: `Filtro ativo de 1ª ordem com frequência de corte fc = ${fc} rad/s e ganho unitário na banda de passagem.`,
          timeDomain: {
            formulaLatex: `v_o(t) = (1 - e^{-${fc}t})u(t)`,
            beforeFormulaLatex: `v_{in}(t) = u(t)`,
            timeRange: [0, 6 / fc],
            curveType: 'standard',
            evaluator: (t) => {
              if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
              const y = 1 - Math.exp(-fc * t);
              return { y, beforeY: 1.0, dy: fc * Math.exp(-fc * t) };
            },
            annotations: [
              { x: 1 / fc, y: 0.632, text: `Constante de Tempo τ = ${(1/fc).toFixed(3)}s`, color: '#38bdf8' }
            ]
          },
          poleZero: {
            poles: [{ sigma: -fc, omega: 0, label: `Polo de Corte s = -${fc}` }],
            stabilityStatus: 'stable'
          },
          surface3D: {
            title: `Diagrama de Bode Tridimensional |H(s)|`,
            equationLatex: `|H(s)| = \\frac{${fc}}{|s + ${fc}|}`,
            surfaceType: 'laplace_poles',
            sigmaRange: [-fc - 10, 5],
            omegaRange: [-fc - 10, fc + 10],
            evaluator3D: (s, w) => {
              const d = Math.sqrt((s + fc) ** 2 + w * w) + 0.15;
              return Math.min((fc * 1.5) / d, 7.5);
            },
            peaks: [{ sigma: -fc, omega: 0, label: `Polo s = -${fc}`, height: 7.5 }]
          }
        };
      }
    }
  }

  // 3. Robust Regex Extractor for ANY Custom or Dynamic Problem
  // Look for exponential constants
  let extractedSigma = -1.5;
  const expMatch = text.match(/e\^\{?(-?\d*\.?\d*)\s*t\}?/);
  if (expMatch && expMatch[1]) {
    const val = parseFloat(expMatch[1]);
    if (!isNaN(val) && val !== 0) extractedSigma = val;
  }

  // Look for frequency constants
  let extractedOmega = 3.0;
  const freqMatch = text.match(/(?:cos|sin)\(\{?(\d*\.?\d*)\s*(?:\\pi\s*)?t\}?\)/);
  if (freqMatch && freqMatch[1]) {
    const val = parseFloat(freqMatch[1]);
    if (!isNaN(val) && val !== 0) extractedOmega = val;
  }

  const isOscillatory = text.includes('cos') || text.includes('sin') || text.includes('rlc') || text.includes('2ª ordem') || text.includes('subamortec');

  if (isOscillatory) {
    const alphaVal = Math.abs(extractedSigma);
    const wdVal = extractedOmega;

    return {
      id: pid,
      title: `${title} – Gráfico Dinâmico Específico da Questão`,
      category: cat,
      interpretationText: `Resposta oscilatória calculada especificamente para os parâmetros da questão (α = ${alphaVal}, ωd = ${wdVal} rad/s).`,
      timeDomain: {
        formulaLatex: `y(t) = e^{-${alphaVal}t}\\cos(${wdVal}t)u(t)`,
        beforeFormulaLatex: `x(t) = \\cos(${wdVal}t)u(t)`,
        timeRange: [0, Math.max(4, Math.min(10, 6 / alphaVal))],
        curveType: 'standard',
        evaluator: (t) => {
          if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
          const env = Math.exp(-alphaVal * t);
          const y = env * Math.cos(wdVal * t);
          const beforeY = Math.cos(wdVal * t);
          const dy = env * (-alphaVal * Math.cos(wdVal * t) - wdVal * Math.sin(wdVal * t));
          return { y, dy, beforeY };
        },
        annotations: [
          { x: Math.PI / (2 * wdVal), y: 0, text: 'Cruzamento por Zero', color: '#38bdf8' }
        ]
      },
      poleZero: {
        poles: [
          { sigma: -alphaVal, omega: wdVal, label: `s₁ = -${alphaVal} + j${wdVal}` },
          { sigma: -alphaVal, omega: -wdVal, label: `s₂ = -${alphaVal} - j${wdVal}` }
        ],
        stabilityStatus: 'stable'
      },
      surface3D: {
        title: `Superfície 3D |H(s)| Calculada para a Questão`,
        equationLatex: `|H(s)| = \\frac{1}{|(s+${alphaVal})^2 + ${wdVal}^2|}`,
        surfaceType: 'laplace_poles',
        sigmaRange: [-alphaVal - 3, 2],
        omegaRange: [-wdVal - 3, wdVal + 3],
        evaluator3D: (s, w) => {
          const d1 = Math.sqrt((s + alphaVal) ** 2 + (w - wdVal) ** 2) + 0.15;
          const d2 = Math.sqrt((s + alphaVal) ** 2 + (w + wdVal) ** 2) + 0.15;
          return Math.min(6.0 / (d1 * d2), 7.5);
        },
        peaks: [
          { sigma: -alphaVal, omega: wdVal, label: `s₁ = -${alphaVal} + j${wdVal}`, height: 7.5 },
          { sigma: -alphaVal, omega: -wdVal, label: `s₂ = -${alphaVal} - j${wdVal}`, height: 7.5 }
        ]
      }
    };
  }

  // Pure Exponential / 1st Order / Universal
  const sig = extractedSigma;
  return {
    id: pid,
    title: `${title} – Gráfico Dinâmico Específico da Questão`,
    category: cat,
    interpretationText: sig < 0
      ? `Modo natural estável com taxa exponencial e^{${sig}t} e constante de tempo τ = ${(1 / Math.abs(sig)).toFixed(2)}s.`
      : `Modo com taxa e^{${sig}t}.`,
    timeDomain: {
      formulaLatex: problem.finalSolutionLatex || `y(t) = e^{${sig}t}u(t)`,
      beforeFormulaLatex: 'x(t) = u(t)',
      timeRange: [0, Math.max(3, Math.min(8, Math.ceil(5 / (Math.abs(sig) || 1))))],
      curveType: 'standard',
      evaluator: (t) => {
        if (t < 0) return { y: 0, dy: 0, beforeY: 0 };
        const y = Math.exp(sig * t);
        const dy = sig * Math.exp(sig * t);
        return { y: Math.min(y, 50), dy, beforeY: 1.0 };
      },
      annotations: [
        { x: 0, y: 1.0, text: 'Valor Inicial t = 0', color: '#38bdf8' }
      ]
    },
    poleZero: {
      poles: [{ sigma: sig, omega: 0, label: `s = ${sig}`, isUnstable: sig > 0 }],
      stabilityStatus: sig < 0 ? 'stable' : 'unstable'
    },
    surface3D: {
      title: `Superfície 3D |H(s)| com Polo em s = ${sig}`,
      equationLatex: `|H(s)| = \\frac{1}{|s - (${sig})|}`,
      surfaceType: 'laplace_poles',
      sigmaRange: [sig - 3, sig + 3],
      omegaRange: [-4, 4],
      evaluator3D: (s, w) => {
        const d = Math.sqrt((s - sig) ** 2 + w * w) + 0.15;
        return Math.min(2.5 / d, 7.5);
      },
      peaks: [{ sigma: sig, omega: 0, label: `Polo s = ${sig}`, height: 7.5 }]
    }
  };
}
