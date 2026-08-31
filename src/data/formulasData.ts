import { FormulaQuickCard } from '../types';

export const FORMULA_CARDS: FormulaQuickCard[] = [
  // =========================================================================
  // CAPÍTULO 1 – SINAIS & SISTEMAS
  // =========================================================================
  {
    id: 'f-dirac-sampling',
    title: 'Propriedade da Amostragem (Peneiramento) do Impulso',
    chapter: 'Capítulo 1 – Sinais',
    ruleCode: 'Eq. 1.54',
    latex: '\\int_{-\\infty}^{\\infty} x(t)\\delta(t - t_0) \\, dt = x(t_0)',
    description: 'O impulso unitário extrai o valor pontual da função contínua no instante do pico $t = t_0$.'
  },
  {
    id: 'f-dirac-scaling',
    title: 'Escalonamento Temporal do Delta de Dirac',
    chapter: 'Capítulo 1 – Sinais',
    ruleCode: 'Eq. 1.58',
    latex: '\\delta(at) = \\frac{1}{|a|}\\delta(t), \\quad \\delta(at - t_0) = \\frac{1}{|a|}\\delta\\left(t - \\frac{t_0}{a}\\right)',
    description: 'Propriedade de compressão e dilatação do impulso sob escalonamento de variável independente.'
  },
  {
    id: 'f-even-odd-decomp',
    title: 'Decomposição Par e Ímpar de Sinais',
    chapter: 'Capítulo 1 – Sinais',
    ruleCode: 'Eq. 1.71 - 1.72',
    latex: 'x_p(t) = \\frac{x(t) + x(-t)}{2}, \\quad x_i(t) = \\frac{x(t) - x(-t)}{2}, \\quad x(t) = x_p(t) + x_i(t)',
    description: 'Qualquer sinal contínuo ou discreto pode ser decomposto unicamente na soma de suas componentes simétrica (par) e antissimétrica (ímpar).'
  },
  {
    id: 'f-energy-power',
    title: 'Energia e Potência Média de Sinais Contínuos',
    chapter: 'Capítulo 1 – Sinais',
    ruleCode: 'Eq. 1.80 - 1.81',
    latex: 'E_\\infty = \\int_{-\\infty}^{\\infty} |x(t)|^2 \\, dt \\; [\\text{J}], \\qquad P_\\infty = \\lim_{T \\to \\infty} \\frac{1}{T}\\int_{-T/2}^{T/2} |x(t)|^2 \\, dt \\; [\\text{W}]',
    description: 'Sinais de energia finita possuem potência média nula ($P_\\infty = 0$), e sinais de potência finita possuem energia infinita ($E_\\infty = \\infty$).'
  },
  {
    id: 'f-convolution',
    title: 'Integral de Convolução Contínua em SLIT',
    chapter: 'Capítulo 1 – SLIT',
    ruleCode: 'Eq. 1.95',
    latex: 'y(t) = x(t) * h(t) = \\int_{-\\infty}^{\\infty} x(\\tau)h(t - \\tau) \\, d\\tau = \\int_{-\\infty}^{\\infty} h(\\tau)x(t - \\tau) \\, d\\tau',
    description: 'Determina a resposta no tempo $y(t)$ de qualquer sistema linear e invariante no tempo através de sua resposta impulsiva $h(t)$.'
  },

  // =========================================================================
  // CAPÍTULO 2 – SÉRIE & TRANSFORMADA DE FOURIER
  // =========================================================================
  {
    id: 'f-fourier-ortho',
    title: 'Coeficiente de Projeção Ótima em Bases Ortogonais',
    chapter: 'Capítulo 2 – Fourier',
    ruleCode: 'Eq. 2.13',
    latex: 'c_1 = \\frac{\\int_{t_1}^{t_2} x(t)g_1^*(t) \\, dt}{\\int_{t_1}^{t_2} |g_1(t)|^2 \\, dt}',
    description: 'Minimiza o erro quadrático médio $\\varepsilon = \\int |x(t) - c_1 g_1(t)|^2 dt$ na aproximação sobre funções de base.'
  },
  {
    id: 'f-fourier-trig-series',
    title: 'Série Trigonométrica Compacta e Canônica de Fourier',
    chapter: 'Capítulo 2 – Fourier',
    ruleCode: 'Eq. 2.30',
    latex: 'x(t) = a_0 + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos(n\\omega_0 t) + b_n \\sin(n\\omega_0 t) \\right] = C_0 + \\sum_{n=1}^{\\infty} C_n \\cos(n\\omega_0 t + \\theta_n)',
    description: 'Representação harmônica onde $\\omega_0 = \\frac{2\\pi}{T_0} \\; [\\text{rad/s}]$, $C_n = \\sqrt{a_n^2 + b_n^2}$ e $\\theta_n = -\\arctan(b_n/a_n)$.'
  },
  {
    id: 'f-fourier-exponential-series',
    title: 'Série Exponencial Complexa de Fourier',
    chapter: 'Capítulo 2 – Fourier',
    ruleCode: 'Eq. 2.51 - 2.52',
    latex: 'c_n = \\frac{1}{T_0} \\int_{T_0} x(t) e^{-j n \\omega_0 t} \\, dt, \\quad x(t) = \\sum_{n=-\\infty}^{\\infty} c_n e^{j n \\omega_0 t}, \\quad a_n = 2\\operatorname{Re}\\{c_n\\}, \\quad b_n = -2\\operatorname{Im}\\{c_n\\}',
    description: 'Decomposição espectral com espectros bilaterais de magnitude $|c_n|$ e fase $\\angle c_n$.'
  },
  {
    id: 'f-fourier-parseval',
    title: 'Teorema de Parseval para Potência e Energia',
    chapter: 'Capítulo 2 – Fourier',
    ruleCode: 'Eq. 2.65',
    latex: 'P = \\frac{1}{T_0}\\int_{T_0} |x(t)|^2 \\, dt = \\sum_{n=-\\infty}^{\\infty} |c_n|^2 = c_0^2 + \\frac{1}{2}\\sum_{n=1}^{\\infty} (a_n^2 + b_n^2) \\; [\\text{W}]',
    description: 'A potência média total no domínio do tempo é exatamente igual à soma das potências de todas as componentes harmônicas.'
  },
  {
    id: 'f-fourier-transform-def',
    title: 'Par de Transformada Direta e Inversa de Fourier (TFC)',
    chapter: 'Capítulo 2 – Fourier',
    ruleCode: 'Eq. 2.70 / 2.75',
    latex: 'X(j\\omega) = \\int_{-\\infty}^{\\infty} x(t)e^{-j\\omega t} \\, dt, \\qquad x(t) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} X(j\\omega)e^{j\\omega t} \\, d\\omega',
    description: 'Mapeia sinais aperiódicos de energia finita para a densidade espectral contínua de frequência $\\omega \\; [\\text{rad/s}]$.'
  },

  // =========================================================================
  // CAPÍTULO 3 – TRANSFORMAÇÃO DE LAPLACE
  // =========================================================================
  {
    id: 'f-laplace-def',
    title: 'Definição da Transformada Unilateral de Laplace',
    chapter: 'Capítulo 3 – Laplace',
    ruleCode: 'Eq. 3.1',
    latex: '\\mathcal{L}\\{x(t)\\} = X(s) = \\int_{0^{-}}^{\\infty} x(t) e^{-st} \\, dt, \\quad s = \\sigma + j\\omega \\; [\\text{rad/s}]',
    description: 'Transformação integral com frequência complexa $s$, permitindo análise de sinais causais com condições iniciais em $t = 0^-$.'
  },
  {
    id: 'f-laplace-derivatives',
    title: 'Propriedade da Derivada com Condições Iniciais',
    chapter: 'Capítulo 3 – Laplace',
    ruleCode: 'Eq. 3.45 - 3.46',
    latex: '\\mathcal{L}\\{y\'(t)\\} = sY(s) - y(0^-), \\quad \\mathcal{L}\\{y\'\'(t)\\} = s^2Y(s) - sy(0^-) - y\'(0^-)',
    description: 'Converte equações diferenciais lineares em equações algébricas no domínio complexo $s$.'
  },
  {
    id: 'f-laplace-shift-freq',
    title: 'Deslocamento no Domínio da Frequência Complexa',
    chapter: 'Capítulo 3 – Laplace',
    ruleCode: 'Eq. 3.48',
    latex: '\\mathcal{L}\\{e^{-at}x(t)\\} = X(s + a), \\quad \\mathcal{L}\\{e^{-at}\\cos(\\omega t)u(t)\\} = \\frac{s + a}{(s + a)^2 + \\omega^2}',
    description: 'Multiplicação por exponencial decrescente no tempo equivale a transladar a variável $s$ por $+a$.'
  },
  {
    id: 'f-laplace-initial-final-val',
    title: 'Teoremas do Valor Inicial (TVI) e Valor Final (TVF)',
    chapter: 'Capítulo 3 – Laplace',
    ruleCode: 'Eq. 3.53 - 3.54',
    latex: 'x(0^+) = \\lim_{s \\to \\infty} sX(s), \\qquad \\lim_{t \\to \\infty} x(t) = \\lim_{s \\to 0} sX(s) \\quad (\\text{com polos de } sX(s) \\text{ no SPE})',
    description: 'Permite calcular os valores de regime permanente e transiente inicial direto da função racional em $s$.'
  },
  {
    id: 'f-heaviside-cover-up',
    title: 'Método Encobrir de Heaviside (Frações Parciais / Resíduos)',
    chapter: 'Capítulo 3 – Laplace',
    ruleCode: 'Eq. 3.73',
    latex: 'A_k = \\lim_{s \\to p_k} (s - p_k) X(s) = \\left. (s - p_k) \\frac{N(s)}{D(s)} \\right|_{s = p_k}',
    description: 'Cálculo direto dos resíduos para polos simples reais e complexos conjugados sem resolver sistemas lineares.'
  },
  {
    id: 'f-transfer-function',
    title: 'Função de Transferência e Resposta ao Impulso',
    chapter: 'Capítulo 3 – Laplace',
    ruleCode: 'Eq. 3.97',
    latex: 'H(s) = \\frac{Y(s)}{X(s)} = \\mathcal{L}\\{h(t)\\}, \\quad Y(s) = H(s)X(s) \\implies y(t) = h(t) * x(t)',
    description: 'Relação entrada-saída para condições iniciais nulas. A estabilidade BIBO exige polos de $H(s)$ estritamente no Semi-Plano Esquerdo (SPE).'
  },

  // =========================================================================
  // CAPÍTULO 4 – EQUAÇÕES DIFERENCIAIS (EDOs) & SISTEMAS
  // =========================================================================
  {
    id: 'f-edo-canonical-2nd-order',
    title: 'Equação Característica Canônica de 2ª Ordem',
    chapter: 'Capítulo 4 – EDOs',
    ruleCode: 'Eq. 4.10',
    latex: 's^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0 \\implies s_{1,2} = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2 - 1}',
    description: 'Regimes: Superamortecido ($\\zeta > 1$), Criticamente Amortecido ($\\zeta = 1$) e Subamortecido ($0 \\le \\zeta < 1$) com $\\omega_d = \\omega_n\\sqrt{1-\\zeta^2} \\; [\\text{rad/s}]$.'
  },
  {
    id: 'f-edo-step-response',
    title: 'Resposta ao Degrau Unitário e Overshoot Percentual',
    chapter: 'Capítulo 4 – EDOs',
    ruleCode: 'Eq. 4.18',
    latex: 'y(t) = 1 - \\frac{e^{-\\zeta \\omega_n t}}{\\sqrt{1-\\zeta^2}}\\sin\\left(\\omega_d t + \\arccos(\\zeta)\\right), \\quad M_p = e^{-\\frac{\\pi\\zeta}{\\sqrt{1-\\zeta^2}}} \\times 100\\%',
    description: 'Curva de resposta transitória subamortecida com sobressinal percentual $M_p$ e tempo de acomodação $t_s \\approx \\frac{4}{\\zeta\\omega_n} \\; [\\text{s}]$.'
  },
  {
    id: 'f-edo-total-response',
    title: 'Decomposição em Resposta ao Estado Nulo e Entrada Nula',
    chapter: 'Capítulo 4 – EDOs',
    ruleCode: 'Eq. 4.22',
    latex: 'Y(s) = Y_{\\text{ZSR}}(s) + Y_{\\text{ZIR}}(s) = H(s)X(s) + \\frac{I(s)}{A(s)}',
    description: 'Separação entre a resposta forçada devida exclusivamente à excitação externa ($Y_{\\text{ZSR}}$) e a resposta natural devida às condições iniciais ($Y_{\\text{ZIR}}$).'
  },

  // =========================================================================
  // CAPÍTULO 5 – ENGENHARIA ELÉTRICA & CIRCUITOS
  // =========================================================================
  {
    id: 'f-ee-impedance-laplace',
    title: 'Impedâncias Operacionais no Domínio de Laplace',
    chapter: 'Capítulo 5 – Elétrica',
    ruleCode: 'Circ. 5.01',
    latex: 'Z_R(s) = R \\; [\\Omega], \\quad Z_L(s) = sL \\; [\\Omega], \\quad Z_C(s) = \\frac{1}{sC} \\; [\\Omega]',
    description: 'Transforma circuitos dinâmicos RLC com equações diferenciais e derivadas/integrais em circuitos puramente algébricos com lei de Ohm generalizada $V(s) = Z(s)I(s)$.'
  },
  {
    id: 'f-ee-rc-transient',
    title: 'Circuito RC: Constante de Tempo e Resposta Transitória',
    chapter: 'Capítulo 5 – Elétrica',
    ruleCode: 'Circ. 5.05',
    latex: '\\tau = R \\cdot C \\; [\\text{s}], \\quad v_C(t) = V_f + (v_C(0) - V_f)e^{-t/\\tau} \\; [\\text{V}], \\quad i_C(t) = C\\frac{dv_C}{dt} \\; [\\text{A}]',
    description: 'Evolução da tensão e corrente com carga e descarga de capacitores em regime de 1ª ordem.'
  },
  {
    id: 'f-ee-rl-transient',
    title: 'Circuito RL: Constante de Tempo e Corrente no Indutor',
    chapter: 'Capítulo 5 – Elétrica',
    ruleCode: 'Circ. 5.08',
    latex: '\\tau = \\frac{L}{R} \\; [\\text{s}], \\quad i_L(t) = I_f + (i_L(0) - I_f)e^{-t/\\tau} \\; [\\text{A}], \\quad v_L(t) = L\\frac{di_L}{dt} \\; [\\text{V}]',
    description: 'Resposta transitória em indutores sob comutação contínua ($L$ em Henries $[\\text{H}]$ e $R$ em Ohms $[\\Omega]$).'
  },
  {
    id: 'f-ee-rlc-resonance',
    title: 'Ressonância RLC, Fator de Qualidade Q e Largura de Banda',
    chapter: 'Capítulo 5 – Elétrica',
    ruleCode: 'Circ. 5.15',
    latex: '\\omega_0 = \\frac{1}{\\sqrt{LC}} \\; [\\text{rad/s}], \\quad Q = \\frac{\\omega_0 L}{R} = \\frac{1}{\\omega_0 R C}, \\quad \\text{BW} = \\frac{\\omega_0}{Q} = \\frac{R}{L} \\; [\\text{rad/s}]',
    description: 'Frequência de ressonância natural, seletividade e largura de banda $\\text{BW}$ medida nos pontos de meia potência a $-3\\text{ dB}$.'
  },
  {
    id: 'f-ee-opamp-filters',
    title: 'Filtros Ativos com Amplificadores Operacionais Ideais',
    chapter: 'Capítulo 5 – Elétrica',
    ruleCode: 'Circ. 5.30',
    latex: 'H_{\\text{inv}}(s) = -\\frac{Z_f(s)}{Z_{\\text{in}}(s)}, \\quad H_{\\text{LPF}}(s) = -\\frac{R_2 / R_1}{1 + s R_2 C} = -\\frac{K \\omega_c}{s + \\omega_c}, \\quad \\omega_c = \\frac{1}{R_2 C} \\; [\\text{rad/s}]',
    description: 'Topologia inversora clássica com ganho em baixa frequência $K = R_2/R_1$ e atenuação de $-20\\text{ dB/década}$ acima de $\\omega_c$.'
  },
  {
    id: 'f-ee-complex-power',
    title: 'Potência Complexa, Triângulo de Potências e Fator de Potência',
    chapter: 'Capítulo 5 – Elétrica',
    ruleCode: 'Circ. 5.45',
    latex: 'S = P + jQ = \\mathbf{V}_{\\text{rms}}\\mathbf{I}_{\\text{rms}}^* = |S|\\angle(\\theta_v - \\theta_i), \\quad P = |S|\\cos(\\theta) \\; [\\text{W}], \\quad Q = |S|\\sin(\\theta) \\; [\\text{VAr}], \\quad |S| \\; [\\text{VA}]',
    description: 'Triângulo de potências em corrente alternada (CA): Potência Ativa $P \\; [\\text{W}]$, Reativa $Q \\; [\\text{VAr}]$ e Aparente $|S| \\; [\\text{VA}]$ com fator de potência $\\text{FP} = \\cos(\\theta)$.'
  }
];

