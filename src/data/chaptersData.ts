import { BookOpen, Waves, Radio, Activity, Cpu, Layers } from 'lucide-react';

export interface ChapterMeta {
  num: number;
  id: string;
  title: string;
  shortTitle: string;
  category: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  subtitle: string;
  description: string;
  iconName: 'Waves' | 'Radio' | 'Activity' | 'Layers' | 'Cpu';
  color: string;
  gradient: string;
  badgeColor: string;
  textColor: string;
  topics: string[];
  keyFormulas: string[];
}

export const CHAPTERS_DATA: ChapterMeta[] = [
  {
    num: 1,
    id: 'ch-1',
    title: 'Capítulo 1 – Sinais & Sistemas',
    shortTitle: 'Sinais & Sistemas',
    category: 'signals',
    subtitle: 'Fundamentos, Transformações Temporais & Propriedades de Sistemas',
    description:
      'Classificação de sinais contínuos e discretos, paridade (par/ímpar), cálculo de energia e potência, transformações de variável independente (deslocamento, escalonamento, reversão) e propriedades de sistemas (Linearidade, Invariância no Tempo, Causalidade, Memória e Estabilidade).',
    iconName: 'Waves',
    color: 'indigo',
    gradient: 'from-indigo-600 to-sky-600',
    badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    topics: [
      'Sinais Elementares: Degrau Unitário u(t), Impulso δ(t) e Rampas',
      'Simetria Temporal: Componentes Pares e Ímpares de Sinais',
      'Energia e Potência de Sinais Contínuos e Discretos',
      'Convolução Contínua e Discreta (Integral de Convolução)',
      'Propriedades de Sistemas LTI (SLIT) e Resposta ao Impulso h(t)'
    ],
    keyFormulas: [
      'x_p(t) = \\frac{1}{2}\\left[x(t) + x(-t)\\right], \\quad x_i(t) = \\frac{1}{2}\\left[x(t) - x(-t)\\right]',
      'E_\\infty = \\int_{-\\infty}^{\\infty} |x(t)|^2 \\, dt \\quad [\\text{J}], \\qquad P_\\infty = \\lim_{T \\to \\infty} \\frac{1}{T}\\int_{-T/2}^{T/2} |x(t)|^2 \\, dt \\quad [\\text{W}]',
      'y(t) = x(t) * h(t) = \\int_{-\\infty}^{\\infty} x(\\tau)h(t-\\tau) \\, d\\tau',
      '\\int_{-\\infty}^{\\infty} x(t)\\delta(t - t_0) \\, dt = x(t_0) \\quad (\\text{Amostragem do Dirac})'
    ]
  },
  {
    num: 2,
    id: 'ch-2',
    title: 'Capítulo 2 – Série & Transformada de Fourier',
    shortTitle: 'Fourier & Frequência',
    category: 'fourier',
    subtitle: 'Análise Espectral, Decomposição Harmônica & Resposta em Frequência',
    description:
      'Representação de sinais periódicos via Série Trigonométrica e Exponencial Complexa de Fourier, coeficientes espectrais c_n, Teorema de Parseval, Transformada de Fourier Contínua X(jω), propriedades de dualidade e modulação, e resposta em frequência H(jω).',
    iconName: 'Radio',
    color: 'purple',
    gradient: 'from-purple-600 to-indigo-600',
    badgeColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    textColor: 'text-purple-600 dark:text-purple-400',
    topics: [
      'Série Trigonométrica e Exponencial Complexa de Fourier',
      'Espectro de Frequência: Magnitude |c_n| e Fase ∠c_n',
      'Potência Harmônica e Teorema de Parseval em Watts (W)',
      'Transformada de Fourier Contínua X(jω) e Pares Clássicos',
      'Resposta em Frequência H(jω) e Filtragem de Sinais'
    ],
    keyFormulas: [
      'c_n = \\frac{1}{T_0} \\int_{T_0} x(t) e^{-j n \\omega_0 t} \\, dt, \\quad x(t) = \\sum_{n=-\\infty}^{\\infty} c_n e^{j n \\omega_0 t}, \\quad \\omega_0 = \\frac{2\\pi}{T_0} \\; [\\text{rad/s}]',
      'X(j\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t} \\, dt, \\quad x(t) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} X(j\\omega) e^{j\\omega t} \\, d\\omega',
      'a_n = 2\\operatorname{Re}\\{c_n\\}, \\quad b_n = -2\\operatorname{Im}\\{c_n\\}, \\quad P = \\sum_{n=-\\infty}^{\\infty} |c_n|^2 = c_0^2 + \\frac{1}{2}\\sum_{n=1}^{\\infty} (a_n^2 + b_n^2) \\; [\\text{W}]'
    ]
  },
  {
    num: 3,
    id: 'ch-3',
    title: 'Capítulo 3 – Transformação de Laplace',
    shortTitle: 'Transformada de Laplace',
    category: 'laplace',
    subtitle: 'Domínio Complexo s, Polos, Zeros & Inversão por Frações Parciais',
    description:
      'Transformada de Laplace Unilateral e Bilateral, Região de Convergência (ROC), propriedades algébricas, Teorema do Valor Inicial e Final, Decomposição em Frações Parciais (Método de Heaviside) e Inversão.',
    iconName: 'Activity',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    topics: [
      'Definição da Transformada de Laplace Unilateral e Região de Convergência (ROC)',
      'Tabela de Pares Fundamentais: Degrau u(t), Exponencial e^{-(a)t}, Seno, Cosseno e Impulso δ(t)',
      'Propriedades da Derivada e Integral no Domínio s com Condições Iniciais',
      'Decomposição em Frações Parciais (Método de Heaviside Cover-Up)',
      'Teoremas do Valor Inicial (TVI) e Valor Final (TVF)'
    ],
    keyFormulas: [
      '\\mathcal{L}\\{x(t)\\} = X(s) = \\int_{0^{-}}^{\\infty} x(t) e^{-st} \\, dt, \\quad s = \\sigma + j\\omega \\; [\\text{rad/s}]',
      '\\mathcal{L}\\{x\'(t)\\} = sX(s) - x(0^-), \\quad \\mathcal{L}\\{x\'\'(t)\\} = s^2 X(s) - s x(0^-) - x\'(0^-)',
      '\\lim_{t \\to 0^+} x(t) = \\lim_{s \\to \\infty} sX(s), \\quad \\lim_{t \\to \\infty} x(t) = \\lim_{s \\to 0} sX(s), \\quad A_k = \\lim_{s \\to p_k} (s - p_k) X(s)'
    ]
  },
  {
    num: 4,
    id: 'ch-4',
    title: 'Capítulo 4 – Equações Diferenciais (EDOs)',
    shortTitle: 'EDOs & Sistemas LTI',
    category: 'differential_equations',
    subtitle: 'Resolução Algébrica de EDOs com Condições Iniciais & Estabilidade',
    description:
      'Modelagem e solução exata de EDOs lineares de 1ª e 2ª ordem via Laplace, resposta ao degrau unitário, resposta ao impulso, separação em Resposta ao Estado Nulo (ZSR) e Entrada Nula (ZIR), e análise de estabilidade pelos polos no plano s.',
    iconName: 'Layers',
    color: 'rose',
    gradient: 'from-rose-600 to-pink-600',
    badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    textColor: 'text-rose-600 dark:text-rose-400',
    topics: [
      'Solução de EDOs de 1ª Ordem com Entrada Exponencial e Degrau',
      'EDOs de 2ª Ordem: Amortecimento Subamortecido, Criticamente Amortecido e Superamortecido',
      'Separação Canônica: Resposta Forçada (ZSR) e Resposta Natural (ZIR)',
      'Frequência Natural ω_n, Frequência Amortecida ω_d e Fator de Amortecimento ζ',
      'Estabilidade BIBO e Localização de Polos no Semi-Plano Esquerdo (SPE)'
    ],
    keyFormulas: [
      'Y(s) = \\frac{B(s)}{A(s)}X(s) + \\frac{I(s)}{A(s)} = Y_{\\text{ZSR}}(s) + Y_{\\text{ZIR}}(s) = H(s)X(s) + Y_{\\text{ZIR}}(s)',
      's^2 + 2\\zeta \\omega_n s + \\omega_n^2 = 0 \\implies s_{1,2} = -\\zeta \\omega_n \\pm \\omega_n \\sqrt{\\zeta^2 - 1}, \\quad \\omega_d = \\omega_n \\sqrt{1 - \\zeta^2} \\; [\\text{rad/s}]',
      'H(s) = \\frac{Y(s)}{X(s)} \\implies y_{\\text{degrau}}(t) = \\mathcal{L}^{-1}\\left\\{ \\frac{H(s)}{s} \\right\\}'
    ]
  },
  {
    num: 5,
    id: 'ch-5',
    title: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
    shortTitle: 'Circuitos & Filtros',
    category: 'electrical_engineering',
    subtitle: 'Circuitos RLC em Laplace, Filtros com Op-Amp & Resposta em Frequência',
    description:
      'Modelagem de circuitos elétricos RC, RL e RLC no domínio da frequência complexa s, impedância operacional Z(s), filtros passa-baixas, passa-altas e passa-faixa com amplificadores operacionais, e resposta transitória completa.',
    iconName: 'Cpu',
    color: 'amber',
    gradient: 'from-amber-600 to-orange-600',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    textColor: 'text-amber-600 dark:text-amber-400',
    topics: [
      'Impedância no Domínio s: Resistor R [Ω], Indutor sL [Ω], Capacitor 1/(sC) [Ω]',
      'Circuitos RLC Série e Paralelo com Condições Iniciais nos Elementos Reativos',
      'Função de Transferência H(s) = V_out(s) / V_in(s) em Circuitos Elétricos',
      'Filtros Ativos de 1ª e 2ª Ordem com Amplificador Operacional (Op-Amp)',
      'Frequência de Corte ω_c [rad/s] e f_c [Hz], Ganho DC H(0) e Diagrama de Bode (-3 dB)'
    ],
    keyFormulas: [
      'Z_R(s) = R \\; [\\Omega], \\quad Z_L(s) = sL \\; [\\Omega], \\quad Z_C(s) = \\frac{1}{sC} \\; [\\Omega]',
      'H_{\\text{RC}}(s) = \\frac{1}{RCs + 1} = \\frac{\\omega_c}{s + \\omega_c}, \\quad \\omega_c = \\frac{1}{RC} \\; [\\text{rad/s}], \\quad f_c = \\frac{\\omega_c}{2\\pi} \\; [\\text{Hz}]',
      'H_{\\text{OpAmp}}(s) = -\\frac{Z_f(s)}{Z_{\\text{in}}(s)}, \\quad S = P + jQ = \\mathbf{V}_{\\text{rms}}\\mathbf{I}_{\\text{rms}}^* \\; [\\text{W}, \\text{VAr}, \\text{VA}], \\quad |H(j\\omega_c)| = \\frac{|H(0)|}{\\sqrt{2}} \\; (-3\\text{ dB})'
    ]
  }
];
