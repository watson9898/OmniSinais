import React, { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Delete,
  Sparkles,
  Layers,
  Sigma,
  Zap,
  Check,
} from 'lucide-react';

interface ScientificCalculatorKeypadProps {
  onInsert: (char: string) => void;
  onClear?: () => void;
  onBackspace?: () => void;
  contextSymbols?: string[];
  title?: string;
  defaultExpanded?: boolean;
}

type TabType = 'context' | 'basic' | 'baseN' | 'signals' | 'trig' | 'calculus' | 'greek' | 'units' | 'matrices';

interface KeypadButton {
  label: string;
  latexPreview?: string;
  insertVal: string;
  tooltip?: string;
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'operator' | 'func';
}

export const ScientificCalculatorKeypad: React.FC<ScientificCalculatorKeypadProps> = ({
  onInsert,
  onClear,
  onBackspace,
  contextSymbols = [],
  title = 'Teclado Matemático & Calculadora Científica',
  defaultExpanded = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(
    contextSymbols.length > 0 ? 'context' : 'basic'
  );
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [recentKey, setRecentKey] = useState<string | null>(null);

  const handleKeyClick = (val: string) => {
    onInsert(val);
    setRecentKey(val);
    setTimeout(() => setRecentKey(null), 300);
  };

  // 1. ÁLGEBRA E BÁSICO (Scientific Basic & Algebra)
  const basicKeys: KeypadButton[] = [
    { label: 's', insertVal: 's', variant: 'primary', tooltip: 'Variável de Laplace: s = σ + jω' },
    { label: 't', insertVal: 't', variant: 'primary', tooltip: 'Tempo contínuo (s)' },
    { label: 'n', insertVal: 'n', variant: 'primary', tooltip: 'Tempo discreto / Índice harmônico' },
    { label: 'z', insertVal: 'z', variant: 'primary', tooltip: 'Variável da Transformada Z' },
    { label: 'j', insertVal: 'j', variant: 'accent', tooltip: 'Unidade imaginária j = √(-1)' },
    { label: 'π', insertVal: 'pi', variant: 'accent', tooltip: 'Número Pi (π ≈ 3.14159)' },
    { label: 'e', insertVal: 'e', variant: 'accent', tooltip: 'Constante de Euler (e ≈ 2.71828)' },
    { label: '(', insertVal: '(', variant: 'secondary' },
    { label: ')', insertVal: ')', variant: 'secondary' },
    { label: 'a/b', insertVal: '/', variant: 'operator', tooltip: 'Fração / Divisão' },
    { label: '+', insertVal: ' + ', variant: 'operator' },
    { label: '-', insertVal: ' - ', variant: 'operator' },
    { label: '×', insertVal: '*', variant: 'operator', tooltip: 'Multiplicação' },
    { label: '=', insertVal: ' = ', variant: 'operator' },
    { label: 'x²', insertVal: '^2', variant: 'func', tooltip: 'Potência quadrada (x²)' },
    { label: 'x³', insertVal: '^3', variant: 'func', tooltip: 'Potência cúbica (x³)' },
    { label: 'xʸ', insertVal: '^', variant: 'func', tooltip: 'Potência genérica (xʸ)' },
    { label: '√x', insertVal: 'sqrt(', variant: 'func', tooltip: 'Raiz quadrada' },
    { label: '1/x', insertVal: '1/(', variant: 'func', tooltip: 'Inverso multiplicativo' },
    { label: '|x|', insertVal: 'abs(', variant: 'func', tooltip: 'Módulo / Valor Absoluto' },
    { label: 'eˣ', insertVal: 'e^(', variant: 'func', tooltip: 'Exponencial natural' },
    { label: 'ln(x)', insertVal: 'ln(', variant: 'func', tooltip: 'Logaritmo Neperiano (base e)' },
    { label: 'log₁₀', insertVal: 'log(', variant: 'func', tooltip: 'Logaritmo decimal (base 10)' },
    { label: '10ˣ', insertVal: '10^(', variant: 'func', tooltip: 'Potência de base 10' },
    { label: '±', insertVal: ' +/- ', variant: 'operator' },
    { label: '%', insertVal: '%', variant: 'secondary' },
    { label: '0', insertVal: '0', variant: 'secondary' },
    { label: '1', insertVal: '1', variant: 'secondary' },
    { label: '2', insertVal: '2', variant: 'secondary' },
    { label: '3', insertVal: '3', variant: 'secondary' },
    { label: '4', insertVal: '4', variant: 'secondary' },
    { label: '5', insertVal: '5', variant: 'secondary' },
    { label: '6', insertVal: '6', variant: 'secondary' },
    { label: '7', insertVal: '7', variant: 'secondary' },
    { label: '8', insertVal: '8', variant: 'secondary' },
    { label: '9', insertVal: '9', variant: 'secondary' },
    { label: '.', insertVal: '.', variant: 'secondary' },
  ];

  // 1.5 BASE-N / PROGRAMADOR (HEX, BIN, OCT, BITWISE)
  const baseNKeys: KeypadButton[] = [
    { label: '0x (HEX)', insertVal: '0x', variant: 'accent', tooltip: 'Prefixo Hexadecimal (Base 16)' },
    { label: '0b (BIN)', insertVal: '0b', variant: 'accent', tooltip: 'Prefixo Binário (Base 2)' },
    { label: '0o (OCT)', insertVal: '0o', variant: 'accent', tooltip: 'Prefixo Octal (Base 8)' },
    { label: 'A (10)', insertVal: 'A', variant: 'danger', tooltip: 'Dígito Hex A = 10' },
    { label: 'B (11)', insertVal: 'B', variant: 'danger', tooltip: 'Dígito Hex B = 11' },
    { label: 'C (12)', insertVal: 'C', variant: 'danger', tooltip: 'Dígito Hex C = 12' },
    { label: 'D (13)', insertVal: 'D', variant: 'danger', tooltip: 'Dígito Hex D = 13' },
    { label: 'E (14)', insertVal: 'E', variant: 'danger', tooltip: 'Dígito Hex E = 14' },
    { label: 'F (15)', insertVal: 'F', variant: 'danger', tooltip: 'Dígito Hex F = 15' },
    { label: 'AND (&)', insertVal: ' AND ', variant: 'operator', tooltip: 'Bitwise AND' },
    { label: 'OR (|)', insertVal: ' OR ', variant: 'operator', tooltip: 'Bitwise OR' },
    { label: 'XOR (^)', insertVal: ' XOR ', variant: 'operator', tooltip: 'Bitwise XOR' },
    { label: 'NOT (~)', insertVal: 'NOT(', variant: 'operator', tooltip: 'Bitwise NOT' },
    { label: '<< (LSH)', insertVal: ' << ', variant: 'func', tooltip: 'Shift Left (Deslocamento à Esquerda)' },
    { label: '>> (RSH)', insertVal: ' >> ', variant: 'func', tooltip: 'Shift Right (Deslocamento à Direita)' },
    { label: 'MOD (%)', insertVal: ' % ', variant: 'operator', tooltip: 'Resto da Divisão Inteira' },
    { label: '0', insertVal: '0', variant: 'secondary' },
    { label: '1', insertVal: '1', variant: 'secondary' },
    { label: '2', insertVal: '2', variant: 'secondary' },
    { label: '3', insertVal: '3', variant: 'secondary' },
    { label: '4', insertVal: '4', variant: 'secondary' },
    { label: '5', insertVal: '5', variant: 'secondary' },
    { label: '6', insertVal: '6', variant: 'secondary' },
    { label: '7', insertVal: '7', variant: 'secondary' },
    { label: '8', insertVal: '8', variant: 'secondary' },
    { label: '9', insertVal: '9', variant: 'secondary' },
  ];

  // 2. SINAIS, SISTEMAS & LAPLACE / FOURIER
  const signalsKeys: KeypadButton[] = [
    { label: 'ℒ{f(t)}', insertVal: 'L{', variant: 'accent', tooltip: 'Operador Transformada de Laplace: ℒ{f(t)}' },
    { label: 'ℒ⁻¹{F(s)}', insertVal: 'L^-1{', variant: 'accent', tooltip: 'Transformada Inversa de Laplace: ℒ⁻¹{F(s)}' },
    { label: 'Y(s) =', insertVal: 'Y(s) = ', variant: 'primary', tooltip: 'Definir Saída no Domínio s: Y(s) =' },
    { label: 'y(t) =', insertVal: 'y(t) = ', variant: 'primary', tooltip: 'Definir Resposta no Tempo: y(t) =' },
    { label: 'H(s) =', insertVal: 'H(s) = ', variant: 'primary', tooltip: 'Função de Transferência: H(s) =' },
    { label: 'X(s) =', insertVal: 'X(s) = ', variant: 'primary', tooltip: 'Entrada no Domínio s: X(s) =' },
    { label: 'h(t) =', insertVal: 'h(t) = ', variant: 'secondary', tooltip: 'Resposta ao Impulso no Tempo: h(t) =' },
    { label: 'sY(s) - y(0)', insertVal: 's*Y(s) - y(0)', variant: 'func', tooltip: 'Laplace da 1ª Derivada: ℒ{y\'(t)}' },
    { label: 's²Y(s) - sy(0) - y\'(0)', insertVal: 's^2*Y(s) - s*y(0) - y\'(0)', variant: 'func', tooltip: 'Laplace da 2ª Derivada: ℒ{y\'\'(t)}' },
    { label: 'u(t)', insertVal: 'u(t)', variant: 'primary', tooltip: 'Degrau unitário contínuo' },
    { label: 'δ(t)', insertVal: 'delta(t)', variant: 'primary', tooltip: 'Impulso de Dirac' },
    { label: '1/s', insertVal: '1/s', variant: 'func', tooltip: 'Laplace do Degrau: ℒ{u(t)} = 1/s' },
    { label: '1/(s-a)', insertVal: '1/(s-a)', variant: 'func', tooltip: 'Laplace da Exponencial: ℒ{e^(at)} = 1/(s-a)' },
    { label: '1/(s+a)', insertVal: '1/(s+a)', variant: 'func', tooltip: 'Laplace da Exponencial Decrescente: ℒ{e^(-at)} = 1/(s+a)' },
    { label: 'e^(-at)', insertVal: 'e^(-a*t)', variant: 'func', tooltip: 'Exponencial decrescente no tempo' },
    { label: 'e^(at)', insertVal: 'e^(a*t)', variant: 'func', tooltip: 'Exponencial crescente no tempo' },
    { label: 'e^(st)', insertVal: 'e^(s*t)', variant: 'func', tooltip: 'Base modal de Laplace' },
    { label: 'e^(-st)', insertVal: 'e^(-s*t)', variant: 'func', tooltip: 'Kernel da Transformada de Laplace' },
    { label: 'ℱ{x(t)}', insertVal: 'F{', variant: 'accent', tooltip: 'Operador de Fourier: ℱ{x(t)}' },
    { label: 'ℱ⁻¹{X(jω)}', insertVal: 'F^-1{', variant: 'accent', tooltip: 'Inversa de Fourier: ℱ⁻¹{X(jω)}' },
    { label: 'X(jω)', insertVal: 'X(j*w)', variant: 'accent', tooltip: 'Espectro de Fourier: X(jω)' },
    { label: 'H(jω)', insertVal: 'H(j*w)', variant: 'accent', tooltip: 'Resposta em Frequência: H(jω)' },
    { label: 'x(t)*h(t)', insertVal: 'x(t) * h(t)', variant: 'operator', tooltip: 'Convolução Contínua' },
    { label: '∫₀^∞ f(t)e^(-st)dt', insertVal: 'int_0^inf(f(t)*e^(-s*t) dt)', variant: 'accent', tooltip: 'Definição Integral da Transformada de Laplace' },
    { label: 'Z_L = sL', insertVal: 's*L', variant: 'func', tooltip: 'Impedância Indutiva em s [Ω]' },
    { label: 'Z_C = 1/sC', insertVal: '1/(s*C)', variant: 'func', tooltip: 'Impedância Capacitiva em s [Ω]' },
    { label: 'Z_R = R', insertVal: 'R', variant: 'func', tooltip: 'Impedância Resistiva [Ω]' },
    { label: 'u[n]', insertVal: 'u[n]', variant: 'secondary', tooltip: 'Degrau unitário discreto' },
    { label: 'δ[n]', insertVal: 'delta[n]', variant: 'secondary', tooltip: 'Impulso unitário de Kronecker' },
    { label: 'H(z)', insertVal: 'H(z)', variant: 'secondary', tooltip: 'Função de Transferência Discreta Z' },
    { label: 'Y(z)', insertVal: 'Y(z)', variant: 'secondary', tooltip: 'Saída no domínio Z' },
    { label: 'X(z)', insertVal: 'X(z)', variant: 'secondary', tooltip: 'Entrada no domínio Z' },
  ];

  // 3. TRIGONOMETRIA & HIPERBÓLICAS
  const trigKeys: KeypadButton[] = [
    { label: 'sin(x)', insertVal: 'sin(', variant: 'func', tooltip: 'Seno' },
    { label: 'cos(x)', insertVal: 'cos(', variant: 'func', tooltip: 'Cosseno' },
    { label: 'tan(x)', insertVal: 'tan(', variant: 'func', tooltip: 'Tangente' },
    { label: 'sen(ωt)', insertVal: 'sin(w*t)', variant: 'func', tooltip: 'Senoide sen(ωt)' },
    { label: 'cos(ωt)', insertVal: 'cos(w*t)', variant: 'func', tooltip: 'Cossenoide cos(ωt)' },
    { label: 'sin⁻¹(x)', insertVal: 'arcsin(', variant: 'func', tooltip: 'Arco Seno (arcsin)' },
    { label: 'cos⁻¹(x)', insertVal: 'arccos(', variant: 'func', tooltip: 'Arco Cosseno (arccos)' },
    { label: 'tan⁻¹(x)', insertVal: 'arctan(', variant: 'func', tooltip: 'Arco Tangente (arctan)' },
    { label: 'sinh(x)', insertVal: 'sinh(', variant: 'func', tooltip: 'Seno hiperbólico' },
    { label: 'cosh(x)', insertVal: 'cosh(', variant: 'func', tooltip: 'Cosseno hiperbólico' },
    { label: 'tanh(x)', insertVal: 'tanh(', variant: 'func', tooltip: 'Tangente hiperbólica' },
    { label: 'cot(x)', insertVal: 'cot(', variant: 'func', tooltip: 'Cotangente' },
    { label: 'sec(x)', insertVal: 'sec(', variant: 'func', tooltip: 'Secante' },
    { label: 'csc(x)', insertVal: 'csc(', variant: 'func', tooltip: 'Cossecante' },
    { label: 'rad', insertVal: ' rad', variant: 'secondary', tooltip: 'Radianos' },
    { label: '° (graus)', insertVal: '°', variant: 'secondary', tooltip: 'Graus' },
    { label: '∠ (fase)', insertVal: ' ∠ ', variant: 'accent', tooltip: 'Ângulo polar / Fasor' },
  ];

  // 4. CÁLCULO, DERIVADAS & INTEGRAIS
  const calculusKeys: KeypadButton[] = [
    { label: '∫', insertVal: 'int(', variant: 'accent', tooltip: 'Integral indefinida' },
    { label: '∫₀^∞', insertVal: 'int_0^inf(', variant: 'accent', tooltip: 'Integral de 0 a Infinito' },
    { label: '∫_{-∞}^∞', insertVal: 'int_-inf^inf(', variant: 'accent', tooltip: 'Integral bilateral de Fourier' },
    { label: '∫₀^t', insertVal: 'int_0^t(', variant: 'accent', tooltip: 'Integral de convolução' },
    { label: 'dt', insertVal: ' dt', variant: 'secondary', tooltip: 'Diferencial de tempo dt' },
    { label: 'dτ', insertVal: ' dtau', variant: 'secondary', tooltip: 'Diferencial da variável muda dτ' },
    { label: 'd/dt', insertVal: 'd/dt(', variant: 'func', tooltip: 'Primeira derivada temporal' },
    { label: 'd²/dt²', insertVal: 'd^2/dt^2(', variant: 'func', tooltip: 'Segunda derivada temporal' },
    { label: "y'(t)", insertVal: "y'(t)", variant: 'func', tooltip: 'Derivada y-linha' },
    { label: "y''(t)", insertVal: "y''(t)", variant: 'func', tooltip: 'Derivada y-duas-linhas' },
    { label: "y(0⁻)", insertVal: "y(0^-)", variant: 'secondary', tooltip: 'Condição inicial à esquerda' },
    { label: "y'(0⁻)", insertVal: "y'(0^-)", variant: 'secondary', tooltip: 'Derivada inicial à esquerda' },
    { label: '∑', insertVal: 'sum(', variant: 'func', tooltip: 'Somatório' },
    { label: '∑_{n=-∞}^∞', insertVal: 'sum_n=-inf^inf(', variant: 'func', tooltip: 'Somatório bilateral' },
    { label: 'lim', insertVal: 'lim(', variant: 'func', tooltip: 'Limite' },
    { label: 'lim_{s→0}', insertVal: 'lim_s->0(', variant: 'func', tooltip: 'Teorema do Valor Final' },
    { label: 'lim_{s→∞}', insertVal: 'lim_s->inf(', variant: 'func', tooltip: 'Teorema do Valor Inicial' },
    { label: '∞', insertVal: 'inf', variant: 'accent', tooltip: 'Infinito' },
    { label: '-∞', insertVal: '-inf', variant: 'accent', tooltip: 'Menos Infinito' },
  ];

  // 5. LETRAS GREGAS & VARIÁVEIS COMPLEXAS
  const greekKeys: KeypadButton[] = [
    { label: 'ω (ômega)', insertVal: 'w', variant: 'accent', tooltip: 'Frequência angular (rad/s)' },
    { label: 'ω₀', insertVal: 'w_0', variant: 'accent', tooltip: 'Frequência fundamental (rad/s)' },
    { label: 'ω_n', insertVal: 'w_n', variant: 'accent', tooltip: 'Frequência natural não amortecida' },
    { label: 'ω_d', insertVal: 'w_d', variant: 'accent', tooltip: 'Frequência amortecida' },
    { label: 'ω_c', insertVal: 'w_c', variant: 'accent', tooltip: 'Frequência de corte (-3 dB)' },
    { label: 'Ω', insertVal: 'Omega', variant: 'accent', tooltip: 'Frequência digital ou Ohms [Ω]' },
    { label: 'π (pi)', insertVal: 'pi', variant: 'accent', tooltip: 'Constante Pi' },
    { label: 'τ (tau)', insertVal: 'tau', variant: 'secondary', tooltip: 'Constante de tempo ou variável muda' },
    { label: 'θ (teta)', insertVal: 'theta', variant: 'secondary', tooltip: 'Fase angular' },
    { label: 'φ (fi)', insertVal: 'phi', variant: 'secondary', tooltip: 'Ângulo de fase' },
    { label: 'σ (sigma)', insertVal: 'sigma', variant: 'secondary', tooltip: 'Atenuação / Parte real de s' },
    { label: 'α (alfa)', insertVal: 'alpha', variant: 'secondary', tooltip: 'Coeficiente de atenuação' },
    { label: 'β (beta)', insertVal: 'beta', variant: 'secondary', tooltip: 'Coeficiente beta' },
    { label: 'γ (gama)', insertVal: 'gamma', variant: 'secondary', tooltip: 'Fator gamma' },
    { label: 'δ (delta)', insertVal: 'delta', variant: 'secondary', tooltip: 'Impulso / Delta' },
    { label: 'λ (lambda)', insertVal: 'lambda', variant: 'secondary', tooltip: 'Autovalor / Lambda' },
    { label: 'ζ (zeta)', insertVal: 'zeta', variant: 'secondary', tooltip: 'Fator de amortecimento' },
    { label: 'Re{}', insertVal: 'Re{', variant: 'func', tooltip: 'Parte real' },
    { label: 'Im{}', insertVal: 'Im{', variant: 'func', tooltip: 'Parte imaginária' },
    { label: 'σ + jω', insertVal: 'sigma + j*w', variant: 'accent', tooltip: 'Frequência complexa s = σ + jω' },
  ];

  // 6. UNIDADES DE MEDIDA & GRANDEZAS ELÉTRICAS
  const unitsKeys: KeypadButton[] = [
    { label: 'rad/s', insertVal: ' rad/s', variant: 'accent', tooltip: 'Radianos por segundo (Frequência angular)' },
    { label: 'Hz', insertVal: ' Hz', variant: 'accent', tooltip: 'Hertz (Frequência cíclica)' },
    { label: 'kHz', insertVal: ' kHz', variant: 'secondary', tooltip: 'Quilo-Hertz (10³ Hz)' },
    { label: 'MHz', insertVal: ' MHz', variant: 'secondary', tooltip: 'Mega-Hertz (10⁶ Hz)' },
    { label: 'Ω', insertVal: ' Ohm', variant: 'primary', tooltip: 'Ohms (Resistência e Impedância)' },
    { label: 'kΩ', insertVal: ' kOhm', variant: 'secondary', tooltip: 'Quilo-Ohms (10³ Ω)' },
    { label: 'MΩ', insertVal: ' MOhm', variant: 'secondary', tooltip: 'Mega-Ohms (10⁶ Ω)' },
    { label: 'V', insertVal: ' V', variant: 'primary', tooltip: 'Volts (Tensão / Potencial Elétrico)' },
    { label: 'mV', insertVal: ' mV', variant: 'secondary', tooltip: 'Milivolts (10⁻³ V)' },
    { label: 'A', insertVal: ' A', variant: 'primary', tooltip: 'Amperes (Corrente Elétrica)' },
    { label: 'mA', insertVal: ' mA', variant: 'secondary', tooltip: 'Miliamperes (10⁻³ A)' },
    { label: 'W', insertVal: ' W', variant: 'primary', tooltip: 'Watts (Potência Ativa / Média)' },
    { label: 'kW', insertVal: ' kW', variant: 'secondary', tooltip: 'Quilowatts (10³ W)' },
    { label: 'VAr', insertVal: ' VAr', variant: 'accent', tooltip: 'Volt-Ampere Reativo (Potência Reativa)' },
    { label: 'VA', insertVal: ' VA', variant: 'accent', tooltip: 'Volt-Ampere (Potência Aparente |S|)' },
    { label: 'J', insertVal: ' J', variant: 'primary', tooltip: 'Joules (Energia)' },
    { label: 'H', insertVal: ' H', variant: 'primary', tooltip: 'Henries (Indutância L)' },
    { label: 'mH', insertVal: ' mH', variant: 'secondary', tooltip: 'Milihenries (10⁻³ H)' },
    { label: 'F', insertVal: ' F', variant: 'primary', tooltip: 'Farads (Capacitância C)' },
    { label: 'μF', insertVal: ' uF', variant: 'secondary', tooltip: 'Microfarads (10⁻⁶ F)' },
    { label: 'nF', insertVal: ' nF', variant: 'secondary', tooltip: 'Nanofarads (10⁻⁹ F)' },
    { label: 'pF', insertVal: ' pF', variant: 'secondary', tooltip: 'Picofarads (10⁻¹² F)' },
    { label: 's (seg)', insertVal: ' s', variant: 'secondary', tooltip: 'Segundos (Tempo)' },
    { label: 'ms', insertVal: ' ms', variant: 'secondary', tooltip: 'Milissegundos (10⁻³ s)' },
    { label: 'μs', insertVal: ' us', variant: 'secondary', tooltip: 'Microssegundos (10⁻⁶ s)' },
    { label: 'dB', insertVal: ' dB', variant: 'accent', tooltip: 'Decibéis (Ganho / Atenuação)' },
    { label: 'FP', insertVal: ' FP', variant: 'func', tooltip: 'Fator de Potência = cos(θ)' },
  ];

  // 7. FORMATOS, FRAÇÕES & PARÊNTESES
  const matricesKeys: KeypadButton[] = [
    { label: '(s + a)', insertVal: '(s + a)', variant: 'func', tooltip: 'Polo/Zero real' },
    { label: '(s² + 2as + a²+b²)', insertVal: '(s^2 + 2*a*s + a^2 + b^2)', variant: 'func', tooltip: 'Polinômio quadrático de polos complexos' },
    { label: 'A/(s+a) + B/(s+b)', insertVal: 'A/(s+a) + B/(s+b)', variant: 'func', tooltip: 'Frações Parciais' },
    { label: '[ ... ]', insertVal: '[]', variant: 'secondary', tooltip: 'Colchetes' },
    { label: '{ ... }', insertVal: '{}', variant: 'secondary', tooltip: 'Chaves' },
    { label: 'a/b (Fração)', insertVal: '() / ()', variant: 'operator', tooltip: 'Modelo de fração' },
    { label: 'e^(-at)cos(ωt)', insertVal: 'e^(-a*t)*cos(w*t)', variant: 'func', tooltip: 'Sinal senoidal amortecido' },
    { label: 'e^(-at)sin(ωt)', insertVal: 'e^(-a*t)*sin(w*t)', variant: 'func', tooltip: 'Sinal senoidal amortecido' },
  ];

  const getTabKeys = () => {
    switch (activeTab) {
      case 'context':
        return contextSymbols.map((sym) => ({
          label: sym,
          insertVal: sym,
          variant: 'primary' as const,
          tooltip: `Símbolo do exercício atual: ${sym}`,
        }));
      case 'baseN':
        return baseNKeys;
      case 'signals':
        return signalsKeys;
      case 'trig':
        return trigKeys;
      case 'calculus':
        return calculusKeys;
      case 'greek':
        return greekKeys;
      case 'units':
        return unitsKeys;
      case 'matrices':
        return matricesKeys;
      case 'basic':
      default:
        return basicKeys;
    }
  };

  const getButtonClass = (variant?: string, isRecent?: boolean) => {
    const base =
      'px-2.5 py-1.5 min-h-[36px] text-xs font-mono font-medium rounded-lg border transition-all duration-150 active:scale-95 flex items-center justify-center select-none shadow-sm ';

    if (isRecent) {
      return base + 'bg-emerald-500 text-white border-emerald-400 scale-105 ring-2 ring-emerald-300';
    }

    switch (variant) {
      case 'primary':
        return (
          base +
          'bg-indigo-600/90 hover:bg-indigo-500 text-white border-indigo-500/80 hover:border-indigo-300 shadow-indigo-900/30'
        );
      case 'accent':
        return (
          base +
          'bg-cyan-900/70 hover:bg-cyan-600 text-cyan-200 hover:text-white border-cyan-700/60 shadow-cyan-950/40'
        );
      case 'operator':
        return (
          base +
          'bg-amber-950/60 hover:bg-amber-600 text-amber-200 hover:text-white border-amber-800/60'
        );
      case 'func':
        return (
          base +
          'bg-purple-950/60 hover:bg-purple-600 text-purple-200 hover:text-white border-purple-800/60'
        );
      case 'danger':
        return (
          base +
          'bg-rose-950/60 hover:bg-rose-600 text-rose-200 hover:text-white border-rose-800/60'
        );
      case 'secondary':
      default:
        return (
          base +
          'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700/70 hover:border-slate-500'
        );
    }
  };

  const tabs: { id: TabType; label: string; count?: number; icon?: any }[] = [
    ...(contextSymbols.length > 0
      ? [
          {
            id: 'context' as const,
            label: '🎯 Símbolos Desta Questão',
            count: contextSymbols.length,
          },
        ]
      : []),
    { id: 'basic', label: 'Álgebra & Básico', icon: Calculator },
    { id: 'baseN', label: 'Bases (N) & Hex [0x, 0b, A-F, AND, OR]' },
    { id: 'signals', label: 'Sinais & Laplace/Fourier', icon: Zap },
    { id: 'units', label: 'Unidades & Grandezas [Ω, V, A, W, rad/s, Hz]' },
    { id: 'calculus', label: 'Cálculo & Integrais', icon: Sigma },
    { id: 'trig', label: 'Trigonometria', icon: Layers },
    { id: 'greek', label: 'Letras Gregas & Fasores' },
    { id: 'matrices', label: 'Formatos & Frações' },
  ];

  return (
    <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all">
      {/* Header bar with collapse toggle and clear/backspace */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/70"
        >
          <Calculator className="w-4 h-4 text-indigo-400" />
          <span>{title}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {onBackspace && (
            <button
              type="button"
              onClick={onBackspace}
              className="px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-lg flex items-center gap-1 transition-all active:scale-95"
              title="Apagar último caractere"
            >
              <Delete className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DEL</span>
            </button>
          )}

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-lg transition-all active:scale-95"
              title="Limpar campo de digitação"
            >
              AC (Limpar)
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Categorized Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 mb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-900/50'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.icon && <tab.icon className="w-3 h-3" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-950 text-indigo-200 font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Context Question helper notice if in context tab */}
          {activeTab === 'context' && contextSymbols.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 mb-2 bg-indigo-950/50 border border-indigo-800/50 rounded-lg text-[11px] text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                Toque nos blocos abaixo para montar a resposta desta etapa rapidamente sem precisar digitar tudo manualmente:
              </span>
            </div>
          )}

          {/* Keyboard Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 max-h-52 overflow-y-auto p-1 bg-slate-950/70 rounded-xl border border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-700">
            {getTabKeys().map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleKeyClick(btn.insertVal)}
                title={btn.tooltip || btn.label}
                className={getButtonClass(btn.variant, recentKey === btn.insertVal)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ScientificCalculatorKeypad;
