import { StepByStepProblem, MultipleChoiceProblem } from '../types';
import { ALL_STEP_BY_STEP_PROBLEMS, ALL_MULTIPLE_CHOICE_PROBLEMS } from './generatedQuestionBank';

const BASE_STEP_BY_STEP_PROBLEMS: StepByStepProblem[] = [
  {
    id: 'step-laplace-edo-1',
    title: 'Resolução de Equação Diferencial de 1ª Ordem via Laplace',
    chapter: 3,
    chapterName: 'Capítulo 3 – Transformação de Laplace',
    category: 'differential_equations',
    difficulty: 'Iniciante',
    xpReward: 80,
    contextTheory: 'Pela propriedade da derivada: $\\mathcal{L}\\{y\'(t)\\} = sY(s) - y(0)$. Aplicamos Laplace em todos os termos, isolamos $Y(s)$ algebricamente e aplicamos a transformada inversa com frações parciais.',
    statement: 'Resolva a equação diferencial ordinária linear para $t > 0$:\n\n$$y\'(t) - 2y(t) = e^{5t}, \\quad \\text{com } y(0) = 3$$',
    finalSolutionLatex: 'y(t) = \\frac{1}{3}e^{5t} + \\frac{8}{3}e^{2t}, \\quad t \\ge 0',
    interpretationGuide: {
      objective: 'Encontrar a função resposta no tempo $y(t)$ para $t \\ge 0$ que satisfaz a EDO e a condição inicial dada.',
      givenData: [
        { label: 'Equação Diferencial', value: 'y\'(t) - 2y(t) = e^{5t}' },
        { label: 'Condição Inicial', value: 'y(0) = 3' },
        { label: 'Entrada / Excitação', value: 'x(t) = e^{5t}' },
        { label: 'Ordem do Sistema', value: '1ª Ordem (1 derivada)' },
      ],
      strategy: [
        '1. Aplicar a Transformada de Laplace $\\mathcal{L}$ em todos os termos de ambos os lados da equação.',
        '2. Substituir o valor numérico da condição inicial $y(0) = 3$.',
        '3. Agrupar os termos com $Y(s)$ e isolar $Y(s) = \\frac{N(s)}{D(s)}$ em uma única fração racional.',
        '4. Decompor $Y(s)$ em Frações Parciais $\\frac{A}{s-2} + \\frac{B}{s-5}$ usando o Método de Heaviside (Cover-up).',
        '5. Aplicar a Transformada Inversa de Laplace $\\mathcal{L}^{-1}$ termo a termo para obter $y(t)$.',
      ],
      pitfalls: 'Cuidado ao subtrair a condição inicial na propriedade da derivada: $\\mathcal{L}\\{y\'\\} = sY(s) - y(0)$, não $+y(0)$. Além disso, preste atenção aos sinais dos polos ao inverter frações da forma $\\frac{1}{s-a} \\implies e^{+at}$.',
    },
    formulaGuide: {
      title: 'Transformada de Derivada e Tabela Básica de Laplace',
      formulaLatex: '\\mathcal{L}\\{y\'(t)\\} = sY(s) - y(0), \\quad \\mathcal{L}\\{e^{at}u(t)\\} = \\frac{1}{s-a}',
      howToApply: 'Substitua cada elemento da EDO pela sua versão algébrica no domínio s: $y\'(t) \\to sY(s) - 3$, $y(t) \\to Y(s)$, e $e^{5t} \\to \\frac{1}{s-5}$ (pois $a=5$).',
      stepsToFollow: [
        'Passo A: $\\mathcal{L}\\{y\' - 2y\\} = \\mathcal{L}\\{e^{5t}\\} \\implies sY(s) - 3 - 2Y(s) = \\frac{1}{s-5}$',
        'Passo B: $(s-2)Y(s) = 3 + \\frac{1}{s-5} = \\frac{3s-15+1}{s-5} = \\frac{3s-14}{s-5}$',
        'Passo C: $Y(s) = \\frac{3s-14}{(s-2)(s-5)} = \\frac{A}{s-2} + \\frac{B}{s-5}$',
        'Passo D: $A = \\left.\\frac{3s-14}{s-5}\\right|_{s=2} = \\frac{8}{3}, \\quad B = \\left.\\frac{3s-14}{s-2}\\right|_{s=5} = \\frac{1}{3}$',
      ],
      variableMap: [
        { symbol: 'a', meaning: 'Expoente da entrada exponencial', valueInQuestion: '5' },
        { symbol: 'y(0)', meaning: 'Condição inicial no tempo t=0', valueInQuestion: '3' },
        { symbol: 's_1, s_2', meaning: 'Polos característicos do sistema', valueInQuestion: 's=2 \\text{ e } s=5' },
      ],
    },
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        instruction: 'Aplique a Transformada de Laplace em ambos os lados da equação: $\\mathcal{L}\\{y\'(t) - 2y(t)\\} = \\mathcal{L}\\{e^{5t}\\}$. Qual é a expressão algébrica transformada com $Y(s)$ antes de substituir a condição inicial?',
        formulaHelper: '\\mathcal{L}\\{y\'(t)\\} = sY(s) - y(0), \\quad \\mathcal{L}\\{e^{at}\\} = \\frac{1}{s-a}',
        expectedAnswer: 'sY(s) - y(0) - 2Y(s) = 1/(s-5)',
        acceptableAnswers: [
          'sY(s)-y(0)-2Y(s)=1/(s-5)',
          '(s-2)Y(s)-y(0)=1/(s-5)',
          'sY(s)-2Y(s)-y(0)=1/(s-5)',
          'sY(s) - 2Y(s) - 3 = 1/(s-5)',
          '(s-2)Y(s) - 3 = 1/(s-5)',
          '(s-2)Y(s)=1/(s-5)+3'
        ],
        explanationOnCorrect: 'Excelente! A derivada $y\'(t)$ transforma-se em $sY(s) - y(0)$, o termo $-2y(t)$ vira $-2Y(s)$ e a exponencial $e^{5t}$ vira $\\frac{1}{s-5}$.',
        hint: 'Lembre-se: $\\mathcal{L}\\{y\'\\} = sY(s)-y(0)$, $\\mathcal{L}\\{y\\} = Y(s)$ e $\\mathcal{L}\\{e^{5t}\\} = \\frac{1}{s-5}$.',
        inputType: 'math_text'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        instruction: 'Substitua a condição inicial $y(0) = 3$ e isole $Y(s)$ como uma única fração racional própria.',
        formulaHelper: '(s-2)Y(s) = 3 + \\frac{1}{s-5} = \\frac{3(s-5) + 1}{s-5}',
        expectedAnswer: 'Y(s) = (3s-14)/((s-2)(s-5))',
        acceptableAnswers: [
          '(3s-14)/((s-2)(s-5))',
          '(3s-14)/(s-2)(s-5)',
          'Y(s)=(3s-14)/((s-2)(s-5))',
          '(3s-14)/(s^2-7s+10)',
          '3/(s-2) + 1/((s-2)(s-5))'
        ],
        explanationOnCorrect: 'Perfeito! Somando $3 + \\frac{1}{s-5} = \\frac{3s-15+1}{s-5} = \\frac{3s-14}{s-5}$. Dividindo por $(s-2)$, obtemos $Y(s) = \\frac{3s-14}{(s-2)(s-5)}$.',
        hint: 'Some $3 + \\frac{1}{s-5} = \\frac{3s - 14}{s-5}$ e depois divida ambos os lados por $(s-2)$.',
        inputType: 'math_text'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        instruction: 'Expanda em Frações Parciais: $Y(s) = \\frac{A}{s-2} + \\frac{B}{s-5}$. Calcule os coeficientes $A$ e $B$ usando o Método de Heaviside (Cover-up). Qual é o valor do par (A, B)?',
        formulaHelper: 'A = \\lim_{s \\to 2} (s-2)Y(s) = \\frac{3(2)-14}{2-5}, \\quad B = \\lim_{s \\to 5} (s-5)Y(s) = \\frac{3(5)-14}{5-2}',
        expectedAnswer: 'A = 8/3, B = 1/3',
        acceptableAnswers: [
          'A=8/3, B=1/3',
          'A=8/3,B=1/3',
          '8/3, 1/3',
          '8/3,1/3',
          'A=8/3 e B=1/3',
          'A = 8/3 e B = 1/3'
        ],
        explanationOnCorrect: 'Muito bem! $A = \\frac{6-14}{-3} = \\frac{-8}{-3} = \\frac{8}{3}$. E $B = \\frac{15-14}{3} = \\frac{1}{3}$. Assim: $Y(s) = \\frac{8/3}{s-2} + \\frac{1/3}{s-5}$.',
        hint: 'Para $A$: cubra $(s-2)$ e faça $s=2 \\implies \\frac{3(2)-14}{2-5} = \\frac{-8}{-3} = 8/3$. Para $B$: cubra $(s-5)$ e faça $s=5$.',
        inputType: 'math_text'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        instruction: 'Aplique a Transformada Inversa de Laplace $\\mathcal{L}^{-1}\\{Y(s)\\}$ para obter a resposta final $y(t)$ no domínio do tempo.',
        formulaHelper: '\\mathcal{L}^{-1}\\left\\{\\frac{1}{s-a}\\right\\} = e^{at}u(t)',
        expectedAnswer: 'y(t) = 8/3*e^(2t) + 1/3*e^(5t)',
        acceptableAnswers: [
          'y(t) = 8/3 e^(2t) + 1/3 e^(5t)',
          '8/3 e^(2t) + 1/3 e^(5t)',
          '1/3 e^(5t) + 8/3 e^(2t)',
          '(8/3)*e^(2t) + (1/3)*e^(5t)',
          'y(t) = 1/3*e^(5t) + 8/3*e^(2t)',
          '8/3*exp(2t) + 1/3*exp(5t)',
          '(8*e^(2t) + e^(5t))/3'
        ],
        explanationOnCorrect: 'Parabéns! A solução completa da equação diferencial é $y(t) = \\frac{8}{3}e^{2t} + \\frac{1}{3}e^{5t}$ para $t \\ge 0$.',
        hint: 'Inverta cada termo: $\\mathcal{L}^{-1}\\left\\{\\frac{8/3}{s-2}\\right\\} = \\frac{8}{3}e^{2t}$ e $\\mathcal{L}^{-1}\\left\\{\\frac{1/3}{s-5}\\right\\} = \\frac{1}{3}e^{5t}$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-dirac-sampling-2',
    title: 'Propriedade de Peneiramento do Impulso Unitário (Delta de Dirac)',
    chapter: 1,
    chapterName: 'Capítulo 1 – Introdução à Teoria de Sinais e Sistemas',
    category: 'signals',
    difficulty: 'Iniciante',
    xpReward: 60,
    contextTheory: 'Propriedade da Amostragem (Peneiramento): $\\int_{-\\infty}^{\\infty} x(t)\\delta(t - t_0)dt = x(t_0)$. O impulso extrai o valor exato da função contínua no instante do pico $t = t_0$.',
    statement: 'Calcule o valor numérico da seguinte integral definida com a função impulso unitário deslocado:\n\n$$I = \\int_{-\\infty}^{\\infty} (3t^2 + 1)\\delta(t + 2) dt$$',
    finalSolutionLatex: 'I = 13',
    interpretationGuide: {
      objective: 'Calcular a integral definida sem precisar calcular antiderivadas complexas, usando a propriedade da amostragem do Delta de Dirac.',
      givenData: [
        { label: 'Função Contínua x(t)', value: '3t^2 + 1' },
        { label: 'Impulso Deslocado', value: '\\delta(t + 2)' },
        { label: 'Limites de Integração', value: '-\\infty \\text{ a } +\\infty' },
      ],
      strategy: [
        '1. Encontrar o ponto de disparo $t_0$ igualando o argumento de $\\delta(t+2)$ a zero ($t+2 = 0 \\implies t_0 = -2$).',
        '2. Pela propriedade de amostragem, a integral inteira se resume a avaliar $x(t_0) = x(-2)$.',
        '3. Substituir $t = -2$ na função contínua $3t^2 + 1$ e calcular o resultado numérico final.',
      ],
      pitfalls: 'Atenção ao sinal de $t_0$: $\\delta(t+2) = \\delta(t - (-2))$, logo $t_0 = -2$, e não $+2$.',
    },
    formulaGuide: {
      title: 'Propriedade de Amostragem / Peneiramento do Impulso',
      formulaLatex: '\\int_{-\\infty}^{\\infty} x(t)\\delta(t - t_0)dt = x(t_0)',
      howToApply: 'Identifique $x(t) = 3t^2 + 1$ e $t_0 = -2$. Substitua diretamente na fórmula: $I = x(-2) = 3(-2)^2 + 1 = 13$.',
      stepsToFollow: [
        'Passo 1: $t - t_0 = t + 2 \\implies t_0 = -2$',
        'Passo 2: $x(t) = 3t^2 + 1$',
        'Passo 3: $x(-2) = 3(-2)^2 + 1 = 3(4) + 1 = 13$',
      ],
      variableMap: [
        { symbol: 'x(t)', meaning: 'Função contínua sendo amostrada', valueInQuestion: '3t^2 + 1' },
        { symbol: 't_0', meaning: 'Instante de pico do impulso', valueInQuestion: '-2' },
      ],
    },
    steps: [
      {
        id: 'dirac-step-1',
        stepNumber: 1,
        instruction: 'Identifique a função contínua $x(t)$ e o ponto de atuação do impulso $t_0$ a partir de $\\delta(t + 2) = \\delta(t - t_0)$. Qual é o valor de $t_0$?',
        formulaHelper: '\\delta(t - t_0) = 0 \\quad \\forall t \\neq t_0 \\implies t + 2 = 0 \\implies t_0 = -2',
        expectedAnswer: 't0 = -2',
        acceptableAnswers: ['-2', 't0=-2', 't = -2', 't=-2', '- 2'],
        explanationOnCorrect: 'Correto! $\\delta(t + 2)$ está centrado em $t_0 = -2$.',
        hint: 'Iguale o argumento do delta a zero: $t + 2 = 0 \\implies t = -2$.',
        inputType: 'math_text'
      },
      {
        id: 'dirac-step-2',
        stepNumber: 2,
        instruction: 'Pela propriedade de amostragem, a integral resulta em $x(t_0) = x(-2)$ onde $x(t) = 3t^2 + 1$. Calcule o valor numérico final.',
        formulaHelper: 'x(-2) = 3(-2)^2 + 1 = 3(4) + 1',
        expectedAnswer: '13',
        acceptableAnswers: ['13', 'I = 13', 'I=13'],
        explanationOnCorrect: 'Exato! $x(-2) = 3(-2)^2 + 1 = 3(4) + 1 = 12 + 1 = 13$. A integral avalia instantaneamente para 13.',
        hint: 'Substitua $t = -2$ em $3t^2 + 1$: $3(4) + 1 = 13$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-fourier-ortho-3',
    title: 'Ortogonalidade de Funções e Coeficiente de Fourier Ótimo',
    chapter: 2,
    chapterName: 'Capítulo 2 – Análise de Fourier',
    category: 'fourier',
    difficulty: 'Intermediário',
    xpReward: 90,
    contextTheory: 'Duas funções $f_1(t)$ e $f_2(t)$ são ortogonais no intervalo $(t_1, t_2)$ se $\\int_{t_1}^{t_2} f_1(t)f_2(t)dt = 0$. O coeficiente de aproximação por menor erro quadrático médio é $C = \\frac{\\int_{t_1}^{t_2} f_1(t)f_2(t)dt}{\\int_{t_1}^{t_2} f_2^2(t)dt}$.',
    statement: 'Dada a função retangular $f_1(t) = 1$ para $0 < t < \\pi$ e $f_1(t) = -1$ para $\\pi < t < 2\\pi$. Deseja-se aproximar $f_1(t) \\approx C \\cdot \\sin(t)$ no intervalo $(0, 2\\pi)$ com o menor erro quadrático médio.',
    finalSolutionLatex: 'C = \\frac{4}{\\pi} \\approx 1.273',
    interpretationGuide: {
      objective: 'Achar o coeficiente multiplicador $C$ que melhor projeta o sinal onda quadrada $f_1(t)$ sobre a função base seno $\\sin(t)$, minimizando a energia do erro.',
      givenData: [
        { label: 'Sinal Alvo f1(t)', value: '1 \\text{ em } (0,\\pi), -1 \\text{ em } (\\pi,2\\pi)' },
        { label: 'Função Base f2(t)', value: '\\sin(t)' },
        { label: 'Intervalo de Análise', value: '(0, 2\\pi)' },
      ],
      strategy: [
        '1. Calcular o produto interno (numerador): $\\int_0^{2\\pi} f_1(t)\\sin(t)dt = \\int_0^\\pi (1)\\sin(t)dt + \\int_\\pi^{2\\pi} (-1)\\sin(t)dt$.',
        '2. Calcular a energia da base (denominador): $\\int_0^{2\\pi} \\sin^2(t)dt = \\pi$.',
        '3. Dividir o numerador pelo denominador: $C = \\frac{4}{\\pi}$.',
      ],
      pitfalls: 'Ao integrar nos dois intervalos de $f_1(t)$, lembre-se que $[-\\cos t]_0^\\pi = -(-1) - (-1) = 2$ e $-[-\\cos t]_\\pi^{2\\pi} = 2$, totalizando $+4$.',
    },
    formulaGuide: {
      title: 'Coeficiente de Mínimo Erro Quadrático Médio',
      formulaLatex: 'C = \\frac{\\int_{t_1}^{t_2} f_1(t)f_2(t)dt}{\\int_{t_1}^{t_2} f_2^2(t)dt}',
      howToApply: 'O numerador é a correlação cruzada entre o sinal e a base senoidal. O denominador é a norma/energia da senoide em um período completo.',
      stepsToFollow: [
        'Numerador: $\\int_0^\\pi \\sin(t)dt - \\int_\\pi^{2\\pi} \\sin(t)dt = 2 - (-2) = 4$',
        'Denominador: $\\int_0^{2\\pi} \\frac{1-\\cos(2t)}{2}dt = \\pi$',
        'Razão: $C = \\frac{4}{\\pi} \\approx 1.2732$',
      ],
      variableMap: [
        { symbol: 'f_1(t)', meaning: 'Sinal a ser aproximado', valueInQuestion: '\\text{Onda quadrada}' },
        { symbol: 'f_2(t)', meaning: 'Função base ortogonal', valueInQuestion: '\\sin(t)' },
        { symbol: 't_1, t_2', meaning: 'Intervalo de ortogonalidade', valueInQuestion: '0 \\text{ a } 2\\pi' },
      ],
    },
    steps: [
      {
        id: 'fourier-step-1',
        stepNumber: 1,
        instruction: 'Monte a integral do numerador $\\int_0^{2\\pi} f_1(t)\\sin(t)dt$ separando nos dois subintervalos $(0, \\pi)$ e $(\\pi, 2\\pi)$. Qual é o valor numérico dessa integral?',
        formulaHelper: '\\int_0^\\pi (1)\\sin t dt + \\int_\\pi^{2\\pi} (-1)\\sin t dt = [-\\cos t]_0^\\pi - [-\\cos t]_\\pi^{2\\pi}',
        expectedAnswer: '4',
        acceptableAnswers: ['4', '4.0', 'numerador = 4', '4 units'],
        explanationOnCorrect: 'Perfeito! $\\int_0^\\pi \\sin t dt = 2$ e $-\\int_\\pi^{2\\pi} \\sin t dt = -(-2) = 2$. A soma é $2 + 2 = 4$.',
        hint: '$[-\\cos(\\pi) - (-\\cos 0)] = -(-1) - (-1) = 2$. Para a segunda parte: $-[-\\cos(2\\pi) - (-\\cos\\pi)] = -[-1 - 1] = 2$. Total = 4.',
        inputType: 'math_text'
      },
      {
        id: 'fourier-step-2',
        stepNumber: 2,
        instruction: 'Calcule a integral do denominador: $\\int_0^{2\\pi} \\sin^2(t)dt$. Qual é o valor exato (em termos de $\\pi$)?',
        formulaHelper: '\\sin^2 t = \\frac{1 - \\cos(2t)}{2} \\implies \\int_0^{2\\pi} \\frac{1 - \\cos(2t)}{2}dt = \\left[ \\frac{t}{2} - \\frac{\\sin(2t)}{4} \\right]_0^{2\\pi} = \\pi',
        expectedAnswer: 'pi',
        acceptableAnswers: ['pi', 'π', '\\pi', '3.14159', '3.14'],
        explanationOnCorrect: 'Excelente! A energia da senoide em um ciclo completo de $2\\pi$ é $\\frac{2\\pi}{2} = \\pi$.',
        hint: 'Use a identidade do arco metade: $\\sin^2(t) = \\frac{1-\\cos(2t)}{2}$. A integral de $\\frac{1}{2}$ de $0$ a $2\\pi$ é $\\pi$.',
        inputType: 'math_text'
      },
      {
        id: 'fourier-step-3',
        stepNumber: 3,
        instruction: 'Obtenha o coeficiente ideal $C = \\frac{\\text{Numerador}}{\\text{Denominador}}$ que minimiza o erro quadrático médio.',
        formulaHelper: 'C = \\frac{4}{\\pi}',
        expectedAnswer: '4/pi',
        acceptableAnswers: ['4/pi', '4/π', '4/\\pi', '1.273', '1.27', '4 / pi'],
        explanationOnCorrect: 'Fantástico! $C = \\frac{4}{\\pi} \\approx 1.2732$. Esse é exatamente o primeiro coeficiente harmônico $b_1$ da Série de Fourier da onda quadrada!',
        hint: 'Divida o resultado do passo 1 pelo resultado do passo 2: $4 / \\pi$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-laplace-initial-final-4',
    title: 'Teoremas do Valor Inicial e Final de Laplace',
    chapter: 3,
    chapterName: 'Capítulo 3 – Transformação de Laplace',
    category: 'laplace',
    difficulty: 'Intermediário',
    xpReward: 75,
    contextTheory: 'Teorema do Valor Inicial: $\\lim_{t \\to 0^+} f(t) = \\lim_{s \\to \\infty} sF(s)$. Teorema do Valor Final: $\\lim_{t \\to \\infty} f(t) = \\lim_{s \\to 0} sF(s)$ (válido se todos os polos de $sF(s)$ estiverem no semiplano esquerdo).',
    statement: 'Dada a transformada de Laplace de um sinal $R(s) = \\frac{3}{s^2 + 2s} = \\frac{3}{s(s+2)}$, determine diretamente pelo domínio da frequência o valor inicial $f(0^+)$ e o valor final $f(\\infty)$.',
    finalSolutionLatex: 'f(0^+) = 0, \\quad f(\\infty) = \\frac{3}{2} = 1.5',
    interpretationGuide: {
      objective: 'Descobrir como o sistema começa ($t=0^+$) e em qual valor ele estabiliza ($t \\to \\infty$) sem precisar fazer a transformada inversa de Laplace.',
      givenData: [
        { label: 'Transformada R(s)', value: '\\frac{3}{s(s+2)}' },
        { label: 'Polos de R(s)', value: 's = 0 \\text{ e } s = -2' },
      ],
      strategy: [
        '1. Multiplicar $R(s)$ pela variável $s$: $sR(s) = s \\cdot \\frac{3}{s(s+2)} = \\frac{3}{s+2}$.',
        '2. Aplicar o TVI: tomar o limite de $sR(s)$ com $s \\to \\infty$ para achar $f(0^+)$.',
        '3. Aplicar o TVF: tomar o limite de $sR(s)$ com $s \\to 0$ para achar $f(\\infty)$.',
      ],
      pitfalls: 'Nunca esqueça de multiplicar por $s$ antes de aplicar os limites! Se fizer o limite direto em $R(s)$, os resultados serão incorretos.',
    },
    formulaGuide: {
      title: 'Teorema do Valor Inicial e Teorema do Valor Final',
      formulaLatex: 'f(0^+) = \\lim_{s \\to \\infty} sF(s), \\quad f(\\infty) = \\lim_{s \\to 0} sF(s)',
      howToApply: 'Multiplique a função dada por $s$ para cancelar o polo na origem. Depois faça $s \\to \\infty$ para o início e $s \\to 0$ para o fim.',
      stepsToFollow: [
        'Expressão de auxílio: $sR(s) = \\frac{3}{s+2}$',
        'Valor Inicial: $\\lim_{s\\to\\infty} \\frac{3}{s+2} = \\frac{3}{\\infty} = 0$',
        'Valor Final: $\\lim_{s\\to 0} \\frac{3}{0+2} = \\frac{3}{2} = 1.5$',
      ],
      variableMap: [
        { symbol: 'F(s)', meaning: 'Transformada de Laplace do sinal', valueInQuestion: '\\frac{3}{s(s+2)}' },
        { symbol: 'sF(s)', meaning: 'Expressão reduzida após cancelar polo na origem', valueInQuestion: '\\frac{3}{s+2}' },
      ],
    },
    steps: [
      {
        id: 'tvf-step-1',
        stepNumber: 1,
        instruction: 'Calcule a expressão de $sR(s)$ simplificando o fator $s$.',
        formulaHelper: 'sR(s) = s \\cdot \\frac{3}{s(s+2)} = \\frac{3}{s+2}',
        expectedAnswer: '3/(s+2)',
        acceptableAnswers: ['3/(s+2)', '3 / (s+2)', '3/(s + 2)'],
        explanationOnCorrect: 'Perfeito! O $s$ do numerador cancela o polo na origem em $s=0$.',
        hint: 'Multiplique $R(s)$ por $s$ e cancele o $s$ do denominador.',
        inputType: 'math_text'
      },
      {
        id: 'tvf-step-2',
        stepNumber: 2,
        instruction: 'Aplique o Teorema do Valor Inicial: $f(0^+) = \\lim_{s \\to \\infty} sR(s) = \\lim_{s \\to \\infty} \\frac{3}{s+2}$. Qual é o resultado?',
        formulaHelper: '\\lim_{s \\to \\infty} \\frac{3}{s+2} = 0',
        expectedAnswer: '0',
        acceptableAnswers: ['0', '0.0', 'zero'],
        explanationOnCorrect: 'Correto! Conforme $s \\to \\infty$, o denominador cresce indefinidamente e o limite vai a 0.',
        hint: 'Quando $s \\to \\infty$, $\\frac{3}{\\infty} = 0$.',
        inputType: 'math_text'
      },
      {
        id: 'tvf-step-3',
        stepNumber: 3,
        instruction: 'Aplique o Teorema do Valor Final: $f(\\infty) = \\lim_{s \\to 0} sR(s) = \\lim_{s \\to 0} \\frac{3}{s+2}$. Qual é o resultado numérico?',
        formulaHelper: '\\lim_{s \\to 0} \\frac{3}{0+2} = \\frac{3}{2} = 1.5',
        expectedAnswer: '3/2',
        acceptableAnswers: ['3/2', '1.5', '1,5', '3 / 2'],
        explanationOnCorrect: 'Excelente! $f(\\infty) = \\frac{3}{2} = 1.5$. O sistema estabiliza no valor em regime permanente de 1.5.',
        hint: 'Substitua $s=0$ na expressão $\\frac{3}{s+2} = \\frac{3}{2}$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-convolution-infinite-5',
    title: 'Convolução Contínua de Sinais Exponenciais Causais',
    chapter: 1,
    chapterName: 'Capítulo 1 – Introdução à Teoria de Sinais e Sistemas',
    category: 'signals',
    difficulty: 'Avançado',
    xpReward: 100,
    contextTheory: 'A integral de convolução é $y(t) = x(t) * h(t) = \\int_{-\\infty}^\\infty x(\\tau)h(t-\\tau)d\\tau$. Para sinais causais com $u(t)$, os limites de integração tornam-se de $0$ até $t$ para $t > 0$.',
    statement: 'Calcule a resposta $y(t) = x(t) * h(t)$ onde $x(t) = 2e^{-t}u(t)$ e $h(t) = e^{-3t}u(t)$ para $t > 0$.',
    finalSolutionLatex: 'y(t) = (e^{-t} - e^{-3t})u(t)',
    interpretationGuide: {
      objective: 'Determinar a resposta total de saída $y(t)$ de um sistema LTI contínuo excitado pela entrada $x(t)$ usando a Integral de Convolução.',
      givenData: [
        { label: 'Entrada x(t)', value: '2e^{-t}u(t)' },
        { label: 'Resposta ao Impulso h(t)', value: 'e^{-3t}u(t)' },
        { label: 'Causalidade', value: 'Ambos contêm u(t) \\implies t \\ge 0' },
      ],
      strategy: [
        '1. Substituir a variável muda $\\tau$ em $x(\\tau) = 2e^{-\\tau}$ e rebater/deslocar $h(t-\\tau) = e^{-3(t-\\tau)}$.',
        '2. Definir os limites de integração: $u(\\tau)$ impõe $\\tau \\ge 0$ e $u(t-\\tau)$ impõe $\\tau \\le t$. Logo os limites são de $0$ a $t$.',
        '3. Fatorar termos independentes de $\\tau$ para fora da integral ($e^{-3t}$).',
        '4. Integrar a exponencial restante $e^{2\\tau}$ e avaliar de $0$ a $t$.',
      ],
      pitfalls: 'Ao calcular $e^{-3(t-\\tau)}$, observe que $(-3)(-\\tau) = +3\\tau$. Agrupando com $e^{-\\tau}$, temos $e^{2\\tau}$. Não confunda os sinais!',
    },
    formulaGuide: {
      title: 'Integral de Convolução para Sinais Causais',
      formulaLatex: 'y(t) = \\int_{0}^{t} x(\\tau)h(t - \\tau)d\\tau, \\quad t \\ge 0',
      howToApply: 'Escreva $x(\\tau) = 2e^{-\\tau}$ e $h(t-\\tau) = e^{-3(t-\\tau)}$. Coloque $e^{-3t}$ para fora e integre $\\int_0^t e^{2\\tau}d\\tau$.',
      stepsToFollow: [
        'Passo 1: $y(t) = \\int_0^t 2e^{-\\tau} e^{-3t} e^{3\\tau} d\\tau$',
        'Passo 2: $y(t) = 2e^{-3t} \\int_0^t e^{2\\tau} d\\tau = 2e^{-3t} \\left[ \\frac{e^{2\\tau}}{2} \\right]_0^t$',
        'Passo 3: $y(t) = e^{-3t}(e^{2t} - 1) = e^{-t} - e^{-3t}$',
      ],
      variableMap: [
        { symbol: '\\tau', meaning: 'Variável muda de integração temporal', valueInQuestion: '0 \\le \\tau \\le t' },
        { symbol: 'h(t-\\tau)', meaning: 'Resposta ao impulso rebatida e transladada', valueInQuestion: 'e^{-3(t-\\tau)}' },
      ],
    },
    steps: [
      {
        id: 'conv-step-1',
        stepNumber: 1,
        instruction: 'Substitua as funções na integral de convolução com a variável muda $\\tau$. Para $t > 0$, quais são os limites de integração inferior e superior?',
        formulaHelper: 'y(t) = \\int_0^t 2e^{-\\tau} \\cdot e^{-3(t-\\tau)} d\\tau',
        expectedAnswer: '0 e t',
        acceptableAnswers: ['0 e t', '0 a t', '[0, t]', '0, t', '0 ate t', 'de 0 a t', '0 e t'],
        explanationOnCorrect: 'Muito bem! Devido ao produto de degraus $u(\\tau)u(t-\\tau)$, a função só é não-nula no intervalo $0 \\le \\tau \\le t$.',
        hint: 'O degrau $u(\\tau)$ exige $\\tau \\ge 0$ e $u(t-\\tau)$ exige $\\tau \\le t$.',
        inputType: 'math_text'
      },
      {
        id: 'conv-step-2',
        stepNumber: 2,
        instruction: 'Coloque o termo independente de $\\tau$ para fora da integral: $e^{-3(t-\\tau)} = e^{-3t}e^{3\\tau}$. Como fica a integral a ser calculada?',
        formulaHelper: 'y(t) = 2e^{-3t} \\int_0^t e^{2\\tau} d\\tau',
        expectedAnswer: '2e^(-3t) * integral(e^(2tau))',
        acceptableAnswers: [
          '2e^(-3t) * integral(e^(2tau))',
          '2e^(-3t)*int(e^(2tau))',
          '2e^(-3t) integral de e^(2tau)',
          '2*e^(-3t)*[e^(2tau)/2]',
          '2e^(-3t) * (e^(2t)-1)/2',
          'e^(-3t)*(e^(2t)-1)',
          'e^(-t) - e^(-3t)'
        ],
        explanationOnCorrect: 'Exato! Agrupando as potências: $e^{-\\tau} \\cdot e^{3\\tau} = e^{2\\tau}$. Integrando: $\\int_0^t e^{2\\tau}d\\tau = \\frac{e^{2t}-1}{2}$.',
        hint: '$e^{-\\tau} \\cdot e^{3\\tau} = e^{(3-1)\\tau} = e^{2\\tau}$. A integral de $e^{2\\tau}$ é $\\frac{1}{2}e^{2\\tau}$.',
        inputType: 'math_text'
      },
      {
        id: 'conv-step-3',
        stepNumber: 3,
        instruction: 'Multiplique por $2e^{-3t}$ e simplifique para obter a expressão final de $y(t)$ para $t > 0$.',
        formulaHelper: 'y(t) = 2e^{-3t} \\cdot \\frac{e^{2t}-1}{2} = e^{-3t+2t} - e^{-3t} = e^{-t} - e^{-3t}',
        expectedAnswer: 'e^(-t) - e^(-3t)',
        acceptableAnswers: [
          'e^(-t) - e^(-3t)',
          'exp(-t) - exp(-3t)',
          '(e^-t - e^-3t)',
          'y(t) = e^(-t) - e^(-3t)',
          'e^(-t)-e^(-3t)'
        ],
        explanationOnCorrect: 'Brilhante! Concluímos que $y(t) = (e^{-t} - e^{-3t})u(t)$. Essa é a resposta de sistema de 1ª ordem a uma excitação exponencial!',
        hint: '$2e^{-3t} \\cdot \\frac{e^{2t}-1}{2} = e^{-3t}e^{2t} - e^{-3t} = e^{-t} - e^{-3t}$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-rl-circuit-fourier-6',
    title: 'Circuito RL Série e Função de Transferência com Fourier',
    chapter: 2,
    chapterName: 'Capítulo 2 – Análise de Fourier',
    category: 'differential_equations',
    difficulty: 'Avançado',
    xpReward: 95,
    contextTheory: 'Em um circuito RL série com entrada $v_{in}(t)$ e saída no indutor $v_L(t)$, a função de transferência é $H(\\omega) = \\frac{V_L(\\omega)}{V_{in}(\\omega)} = \\frac{j\\omega L}{R + j\\omega L} = \\frac{j\\omega}{R/L + j\\omega}$.',
    statement: 'Dado o circuito RL série com $R = 4\\,\\Omega$ e $L = 2\\,\\text{H}$, a tensão de entrada é $v_{in}(t) = 5e^{-3t}u(t)$. Determine a função de transferência $H(\\omega)$ e a transformada de Fourier da entrada $V_{in}(\\omega)$.',
    finalSolutionLatex: 'H(\\omega) = \\frac{j\\omega}{2 + j\\omega}, \\quad V_{in}(\\omega) = \\frac{5}{3 + j\\omega}',
    interpretationGuide: {
      objective: 'Modelar o circuito elétrico no domínio da frequência $\\omega$, calculando a resposta espectral da entrada $V_{in}(\\omega)$ e o ganho $H(\\omega)$ do filtro passa-altas.',
      givenData: [
        { label: 'Resistência R', value: '4\\,\\Omega' },
        { label: 'Indutância L', value: '2\\,\\text{H}' },
        { label: 'Entrada v_in(t)', value: '5e^{-3t}u(t)' },
        { label: 'Frequência de corte', value: '\\omega_c = R/L = 2\\,\\text{rad/s}' },
      ],
      strategy: [
        '1. Aplicar o par clássico de Fourier $\\mathcal{F}\\{e^{-at}u(t)\\} = \\frac{1}{a + j\\omega}$ para obter $V_{in}(\\omega)$.',
        '2. Montar o divisor de impedâncias $H(\\omega) = \\frac{Z_L}{Z_R + Z_L} = \\frac{j\\omega L}{R + j\\omega L}$.',
        '3. Dividir numerador e denominador por $L=2$ para normalizar na forma padrão $\\frac{j\\omega}{\\omega_c + j\\omega}$.',
      ],
      pitfalls: 'A impedância do indutor no domínio de Fourier é $j\\omega L$ (e não $sL$ de Laplace). Lembre-se de manter o termo imaginário $j$.',
    },
    formulaGuide: {
      title: 'Transformada de Fourier e Divisor de Impedância RL',
      formulaLatex: '\\mathcal{F}\\{e^{-at}u(t)\\} = \\frac{1}{a + j\\omega}, \\quad H(\\omega) = \\frac{j\\omega L}{R + j\\omega L}',
      howToApply: 'Para a entrada, faça $a=3$ e multiplique por 5. Para o circuito, substitua $R=4$ e $L=2$ e simplifique dividindo por 2.',
      stepsToFollow: [
        'Entrada: $V_{in}(\\omega) = \\mathcal{F}\\{5e^{-3t}u(t)\\} = \\frac{5}{3 + j\\omega}$',
        'Circuito: $H(\\omega) = \\frac{j\\omega(2)}{4 + j\\omega(2)} = \\frac{j\\omega}{2 + j\\omega}$',
      ],
      variableMap: [
        { symbol: 'a', meaning: 'Taxa de decaimento da exponencial', valueInQuestion: '3' },
        { symbol: 'R/L', meaning: 'Polo / frequência de corte do filtro RL', valueInQuestion: '4/2 = 2\\,\\text{rad/s}' },
      ],
    },
    steps: [
      {
        id: 'rl-step-1',
        stepNumber: 1,
        instruction: 'Calcule a transformada de Fourier da tensão de entrada $v_{in}(t) = 5e^{-3t}u(t)$.',
        formulaHelper: '\\mathcal{F}\\{e^{-at}u(t)\\} = \\frac{1}{a + j\\omega}',
        expectedAnswer: '5/(3 + j*w)',
        acceptableAnswers: [
          '5/(3+j*w)',
          '5/(3+jw)',
          '5/(3 + jw)',
          '5/(3+j\\omega)',
          '5/(3 + j*omega)',
          '5/(3+j*omega)'
        ],
        explanationOnCorrect: 'Correto! A constante 5 multiplica a transformada do degrau exponencial: $\\frac{5}{3 + j\\omega}$.',
        hint: 'Use $\\mathcal{F}\\{e^{-at}u(t)\\} = \\frac{1}{a+j\\omega}$ com $a=3$ e multiplique por 5.',
        inputType: 'math_text'
      },
      {
        id: 'rl-step-2',
        stepNumber: 2,
        instruction: 'Calcule a função de transferência $H(\\omega) = \\frac{j\\omega L}{R + j\\omega L}$ substituindo $R=4$ e $L=2$, dividindo numerador e denominador por $L=2$.',
        formulaHelper: 'H(\\omega) = \\frac{j\\omega(2)}{4 + j\\omega(2)} = \\frac{j\\omega}{2 + j\\omega}',
        expectedAnswer: 'j*w/(2 + j*w)',
        acceptableAnswers: [
          'j*w/(2+j*w)',
          'jw/(2+jw)',
          'j*omega/(2+j*omega)',
          'j\\omega/(2+j\\omega)',
          '(jw)/(2+jw)',
          '2jw/(4+2jw)'
        ],
        explanationOnCorrect: 'Perfeito! $H(\\omega) = \\frac{j\\omega}{2 + j\\omega}$. Esse é um filtro passa-altas clássico de 1ª ordem.',
        hint: 'Divida $2j\\omega / (4 + 2j\\omega)$ por 2 no numerador e no denominador.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-oppenheim-conv-pulse-7',
    title: 'Convolução de Pulso Retangular com Exponencial (Oppenheim Cap. 2)',
    chapter: 1,
    chapterName: 'Capítulo 1 – Introdução à Teoria de Sinais e Sistemas',
    category: 'signals',
    difficulty: 'Intermediário',
    xpReward: 90,
    contextTheory: 'A convolução gráfica de um pulso de duração finita $x(t) = u(t) - u(t-2)$ com uma resposta causal $h(t) = e^{-2t}u(t)$ divide a análise no tempo em três regiões distintas: $t < 0$, $0 \\le t \\le 2$ e $t > 2$.',
    statement: 'Calcule a resposta $y(t) = x(t) * h(t)$ do sistema linear invariante no tempo cuja resposta ao impulso é $h(t) = e^{-2t}u(t)$ para a entrada retangular $x(t) = u(t) - u(t-2)$.',
    finalSolutionLatex: 'y(t) = \\begin{cases} 0, & t < 0 \\\\ \\frac{1}{2}(1 - e^{-2t}), & 0 \\le t \\le 2 \\\\ \\frac{1}{2}(e^4 - 1)e^{-2t}, & t > 2 \\end{cases}',
    interpretationGuide: {
      objective: 'Determinar a resposta contínua $y(t)$ particionando o domínio temporal conforme a sobreposição da janela móvel de integração.',
      givenData: [
        { label: 'Entrada x(t)', value: 'u(t) - u(t-2) \\text{ (pulso de largura 2)}' },
        { label: 'Resposta ao Impulso h(t)', value: 'e^{-2t}u(t)' },
        { label: 'Regiões de Sobreposição', value: 't < 0, \\; 0 \\le t \\le 2, \\; t > 2' },
      ],
      strategy: [
        '1. Para $0 \\le t \\le 2$: a janela integra de $0$ a $t$: $\\int_0^t e^{-2(t-\\tau)}d\\tau = e^{-2t}\\int_0^t e^{2\\tau}d\\tau = \\frac{1}{2}(1 - e^{-2t})$.',
        '2. Para $t > 2$: o pulso de entrada já passou completamente, integrando de $0$ a $2$: $\\int_0^2 e^{-2(t-\\tau)}d\\tau = e^{-2t}\\left[\\frac{e^4 - 1}{2}\\right]$.',
        '3. Unir as regiões usando a representação com degraus unitários.',
      ],
      pitfalls: 'Para $t > 2$, o limite superior da integral é fixado em 2 (término do pulso $x(\\tau)$), e NÃO em $t$.',
    },
    formulaGuide: {
      title: 'Integral de Convolução em Intervalos Limitados',
      formulaLatex: 'y(t) = \\int_{-\\infty}^\\infty x(\\tau)h(t-\\tau)d\\tau = e^{-2t}\\int_{\\tau_{min}}^{\\tau_{max}} e^{2\\tau}d\\tau',
      howToApply: 'No intervalo de entrada $0 \\le t \\le 2$, use limites $[0, t]$. Para $t > 2$, use limites $[0, 2]$.',
    },
    steps: [
      {
        id: 'step-opp-conv-1',
        stepNumber: 1,
        instruction: 'Calcule a integral para a primeira região ativa $0 \\le t \\le 2$: $\\int_0^t e^{-2(t-\\tau)} d\\tau = e^{-2t} \\int_0^t e^{2\\tau} d\\tau$. Qual é a expressão resultante?',
        formulaHelper: 'e^{-2t} \\left[ \\frac{e^{2\\tau}}{2} \\right]_0^t = \\frac{e^{-2t}(e^{2t} - 1)}{2} = \\frac{1 - e^{-2t}}{2}',
        expectedAnswer: '(1 - e^(-2t))/2',
        acceptableAnswers: [
          '(1 - e^(-2t))/2',
          '(1-e^(-2t))/2',
          '1/2*(1-e^(-2t))',
          '0.5*(1-e^(-2t))',
          '0.5 - 0.5*e^(-2t)',
          '(1-exp(-2t))/2'
        ],
        explanationOnCorrect: 'Perfeito! No intervalo $0 \\le t \\le 2$, a saída cresce monotonicamente como $\\frac{1}{2}(1 - e^{-2t})$.',
        hint: 'Integre $e^{2\\tau}$ de 0 a $t$: $\\frac{e^{2t}-1}{2}$. Multiplique pelo termo externo $e^{-2t}$.',
        inputType: 'math_text'
      },
      {
        id: 'step-opp-conv-2',
        stepNumber: 2,
        instruction: 'Para $t > 2$, a integração ocorre em todo o suporte do pulso de $\\tau = 0$ até $\\tau = 2$: $e^{-2t} \\int_0^2 e^{2\\tau} d\\tau$. Calcule a constante multiplicadora de $e^{-2t}$.',
        formulaHelper: '\\int_0^2 e^{2\\tau}d\\tau = \\frac{e^4 - 1}{2} \\approx \\frac{54.598 - 1}{2} \\approx 26.799',
        expectedAnswer: '(e^4 - 1)/2',
        acceptableAnswers: [
          '(e^4 - 1)/2',
          '(e^4-1)/2',
          '(exp(4)-1)/2',
          '26.8',
          '26.799',
          '26.8*e^(-2t)',
          '1/2*(e^4-1)'
        ],
        explanationOnCorrect: 'Excelente! Para $t > 2$, a entrada é zero e o sistema relaxa com decaimento natural exponencial puro proporcional a $\\frac{e^4-1}{2}e^{-2t}$.',
        hint: 'Calcule $\\left[\\frac{e^{2\\tau}}{2}\\right]_0^2 = \\frac{e^4 - 1}{2}$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-second-order-ode-underdamped-8',
    title: 'EDO de 2ª Ordem Subamortecida com Excitação Degrau (Lathi Cap. 2)',
    chapter: 4,
    chapterName: 'Capítulo 4 – Equações Diferenciais (EDOs)',
    category: 'differential_equations',
    difficulty: 'Avançado',
    xpReward: 110,
    contextTheory: 'Para uma EDO de 2ª ordem $y\'\'(t) + 4y\'(t) + 13y(t) = 13u(t)$ com repouso inicial $y(0)=0, y\'(0)=0$, a resposta possui fator de amortecimento $\\alpha = 2$ e frequência amortecida $\\omega_d = \\sqrt{13 - 2^2} = 3\\text{ rad/s}$.',
    statement: 'Determine a resposta temporal completa $y(t)$ da EDO $y\'\'(t) + 4y\'(t) + 13y(t) = 13u(t)$ sujeita às condições iniciais nulas $y(0)=0$ e $y\'(0)=0$.',
    finalSolutionLatex: 'y(t) = \\left[1 - e^{-2t}\\cos(3t) - \\frac{2}{3}e^{-2t}\\sin(3t)\\right]u(t)',
    interpretationGuide: {
      objective: 'Resolver a equação diferencial ordinária de 2ª ordem no domínio de Laplace com polos complexos conjugados e inverter completando o quadrado.',
      givenData: [
        { label: 'EDO', value: 'y\'\'(t) + 4y\'(t) + 13y(t) = 13' },
        { label: 'Condições Iniciais', value: 'y(0) = 0, \\; y\'(0) = 0' },
        { label: 'Polos do Sistema', value: 's = -2 \\pm j3' },
      ],
      strategy: [
        '1. Aplicar Laplace: $(s^2 + 4s + 13)Y(s) = \\frac{13}{s}$.',
        '2. Isolar $Y(s) = \\frac{13}{s(s^2 + 4s + 13)}$.',
        '3. Decompor em frações parciais: $Y(s) = \\frac{1}{s} - \\frac{s+4}{s^2 + 4s + 13} = \\frac{1}{s} - \\frac{(s+2) + 2}{(s+2)^2 + 3^2}$.',
        '4. Inverter termo a termo usando as tabelas de seno e cosseno amortecidos.',
      ],
      pitfalls: 'Ao decompor o numerador residual $(s+4)$, lembre-se de reescrever como $(s+2) + \\frac{2}{3}(3)$ para casar exatamente com $\\mathcal{L}\\{e^{-2t}\\cos(3t)\\}$ e $\\mathcal{L}\\{e^{-2t}\\sin(3t)\\}$.',
    },
    formulaGuide: {
      title: 'Pares de Laplace para Modos Oscilatórios Amortecidos',
      formulaLatex: '\\mathcal{L}\\{e^{-\\alpha t}\\cos(\\omega_d t)\\} = \\frac{s+\\alpha}{(s+\\alpha)^2 + \\omega_d^2}, \\quad \\mathcal{L}\\{e^{-\\alpha t}\\sin(\\omega_d t)\\} = \\frac{\\omega_d}{(s+\\alpha)^2 + \\omega_d^2}',
      howToApply: 'Substitua $\\alpha = 2$ e $\\omega_d = 3$. O termo constante gera a resposta forçada em regime permanente $y(\\infty) = 1$.',
    },
    steps: [
      {
        id: 'step-ode2-1',
        stepNumber: 1,
        instruction: 'Aplique a Transformada de Laplace e isole $Y(s)$ como uma fração racional própria. Qual é a expressão de $Y(s)$?',
        formulaHelper: '(s^2 + 4s + 13)Y(s) = \\frac{13}{s} \\implies Y(s) = \\frac{13}{s(s^2 + 4s + 13)}',
        expectedAnswer: '13/(s(s^2+4s+13))',
        acceptableAnswers: [
          '13/(s(s^2+4s+13))',
          '13/(s*(s^2+4s+13))',
          'Y(s)=13/(s(s^2+4s+13))',
          '13/(s^3+4s^2+13s)'
        ],
        explanationOnCorrect: 'Correto! Com condições iniciais nulas, $Y(s) = \\frac{13}{s(s^2+4s+13)}$.',
        hint: 'A entrada degrau $\\mathcal{L}\\{13u(t)\\} = 13/s$. Divida pelo polinômio característico $(s^2+4s+13)$.',
        inputType: 'math_text'
      },
      {
        id: 'step-ode2-2',
        stepNumber: 2,
        instruction: 'Complete o quadrado no denominador quadrático: $(s^2 + 4s + 13) = (s + \\alpha)^2 + \\omega_d^2$. Quais são os valores de $\\alpha$ e $\\omega_d$?',
        formulaHelper: 's^2 + 4s + 13 = (s^2 + 4s + 4) + 9 = (s+2)^2 + 3^2',
        expectedAnswer: 'alpha=2, wd=3',
        acceptableAnswers: [
          'alpha=2, wd=3',
          'alpha=2,wd=3',
          '2 e 3',
          '2, 3',
          'alpha = 2, omega = 3',
          'alpha=2, omega_d=3',
          '2,3'
        ],
        explanationOnCorrect: 'Muito bem! $\\alpha = 2$ (taxa de amortecimento) e $\\omega_d = 3\\text{ rad/s}$ (frequência de oscilação amortecida).',
        hint: '$(s+2)^2 = s^2 + 4s + 4$. Como tínhamos $+13$, sobra $13 - 4 = 9 = 3^2$.',
        inputType: 'math_text'
      },
      {
        id: 'step-ode2-3',
        stepNumber: 3,
        instruction: 'Escreva a solução temporal final $y(t)$ para $t \\ge 0$.',
        formulaHelper: 'y(t) = 1 - e^{-2t}\\cos(3t) - \\frac{2}{3}e^{-2t}\\sin(3t)',
        expectedAnswer: '1 - e^(-2t)*cos(3t) - 2/3*e^(-2t)*sin(3t)',
        acceptableAnswers: [
          '1 - e^(-2t)*cos(3t) - 2/3*e^(-2t)*sin(3t)',
          '1 - e^(-2t)cos(3t) - (2/3)e^(-2t)sin(3t)',
          '1-e^(-2t)*cos(3t)-(2/3)*e^(-2t)*sin(3t)',
          '1 - exp(-2t)*cos(3t) - 2/3*exp(-2t)*sin(3t)'
        ],
        explanationOnCorrect: 'Brilhante! Essa é a resposta clássica subamortecida com valor final unitário ($y(\\infty) = 1$) e sobressinal oscilatório transitório.',
        hint: 'Inverta $\\frac{1}{s} \\to 1$, $-\\frac{s+2}{(s+2)^2+9} \\to -e^{-2t}\\cos(3t)$ e $-\\frac{2}{3}\\frac{3}{(s+2)^2+9} \\to -\\frac{2}{3}e^{-2t}\\sin(3t)$.',
        inputType: 'math_text'
      }
    ]
  },
  {
    id: 'step-rlc-series-transient-sadiku-9',
    title: 'Transiente Completo em Circuito RLC Série (Alexander & Sadiku Cap. 8)',
    chapter: 5,
    chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
    category: 'electrical_engineering',
    difficulty: 'Avançado',
    xpReward: 120,
    contextTheory: 'Em um circuito RLC série excitado por tensão contínua $V_s$, a Lei das Malhas em Laplace com condições iniciais nulas fornece $I(s) = \\frac{V_s / s}{R + sL + 1/sC} = \\frac{V_s / L}{s^2 + \\frac{R}{L}s + \\frac{1}{LC}}$.',
    statement: 'Um circuito RLC série com $R = 8\\,\\Omega$, $L = 1\\text{ H}$, $C = 0.04\\text{ F} = \\frac{1}{25}\\text{ F}$ e condições iniciais nulas ($i(0)=0, v_C(0)=0$) é conectado a uma fonte contínua de $V_s = 24\\text{ V}$ em $t = 0$. Calcule a corrente transitória $i(t)$ para $t \\ge 0$.',
    finalSolutionLatex: 'i(t) = 8e^{-4t}\\sin(3t)\\text{ A}, \\quad t \\ge 0',
    interpretationGuide: {
      objective: 'Modelar a malha RLC série no domínio s e obter a forma analítica da corrente transitória $i(t)$.',
      givenData: [
        { label: 'Fonte V_s', value: '24\\text{ V}' },
        { label: 'Resistência R', value: '8\\,\\Omega' },
        { label: 'Indutância L', value: '1\\text{ H}' },
        { label: 'Capacitância C', value: '0.04\\text{ F} = 1/25\\text{ F}' },
      ],
      strategy: [
        '1. Calcular $\\omega_0^2 = \\frac{1}{LC} = \\frac{1}{1 \\times 0.04} = 25 \\implies \\omega_0 = 5\\text{ rad/s}$.',
        '2. Calcular $\\alpha = \\frac{R}{2L} = \\frac{8}{2 \\times 1} = 4\\text{ rad/s}$.',
        '3. Como $\\alpha < \\omega_0$, o circuito é subamortecido com $\\omega_d = \\sqrt{\\omega_0^2 - \\alpha^2} = \\sqrt{25 - 16} = 3\\text{ rad/s}$.',
        '4. Montar $I(s) = \\frac{24/1}{s^2 + 8s + 25} = \\frac{24}{(s+4)^2 + 3^2} = 8 \\cdot \\frac{3}{(s+4)^2 + 3^2}$.',
        '5. Inverter para obter $i(t) = 8e^{-4t}\\sin(3t)\\text{ A}$.',
      ],
      pitfalls: 'Observe que a corrente inicial $i(0) = 0$ e a corrente final em regime permanente CC é $i(\\infty) = 0$ (o capacitor bloqueia CC), de modo que a corrente é puramente transitória.',
    },
    formulaGuide: {
      title: 'Equações Canônicas de Circuitos RLC Série',
      formulaLatex: '\\alpha = \\frac{R}{2L}, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad \\omega_d = \\sqrt{\\omega_0^2 - \\alpha^2}, \\quad i(t) = \\frac{V_s}{\\omega_d L}e^{-\\alpha t}\\sin(\\omega_d t)',
      howToApply: 'Substitua $V_s=24$, $L=1$, $\\alpha=4$ e $\\omega_d=3$. O coeficiente resulta em $24 / (3 \\times 1) = 8$.',
    },
    steps: [
      {
        id: 'step-rlc-1',
        stepNumber: 1,
        instruction: 'Calcule a frequência natural não-amortecida $\\omega_0 = \\frac{1}{\\sqrt{LC}}$ e o coeficiente de amortecimento $\\alpha = \\frac{R}{2L}$ para $R=8\\,\\Omega$, $L=1\\text{ H}$ e $C=0.04\\text{ F}$.',
        formulaHelper: '\\omega_0 = \\frac{1}{\\sqrt{1 \\times 0.04}} = \\sqrt{25} = 5, \\quad \\alpha = \\frac{8}{2 \\times 1} = 4',
        expectedAnswer: 'w0=5, alpha=4',
        acceptableAnswers: [
          'w0=5, alpha=4',
          'w0=5,alpha=4',
          '5 e 4',
          '5, 4',
          'omega0=5, alpha=4',
          '5,4'
        ],
        explanationOnCorrect: 'Perfeito! $\\omega_0 = 5\\text{ rad/s}$ e $\\alpha = 4\\text{ rad/s}$. Como $\\alpha < \\omega_0$, a resposta é subamortecida.',
        hint: '$\\sqrt{1/0.04} = \\sqrt{25} = 5$ e $8 / 2 = 4$.',
        inputType: 'math_text'
      },
      {
        id: 'step-rlc-2',
        stepNumber: 2,
        instruction: 'Calcule a frequência de oscilação amortecida $\\omega_d = \\sqrt{\\omega_0^2 - \\alpha^2}$.',
        formulaHelper: '\\omega_d = \\sqrt{5^2 - 4^2} = \\sqrt{25 - 16} = \\sqrt{9} = 3',
        expectedAnswer: '3',
        acceptableAnswers: ['3', '3 rad/s', 'wd=3', 'w_d=3', '3.0'],
        explanationOnCorrect: 'Exato! $\\omega_d = \\sqrt{25-16} = 3\\text{ rad/s}$.',
        hint: '$\\sqrt{25 - 16} = \\sqrt{9} = 3$.',
        inputType: 'math_text'
      },
      {
        id: 'step-rlc-3',
        stepNumber: 3,
        instruction: 'Escreva a equação analítica da corrente $i(t)$ no tempo para $t \\ge 0$.',
        formulaHelper: 'i(t) = \\frac{V_s}{\\omega_d L}e^{-\\alpha t}\\sin(\\omega_d t) = \\frac{24}{3(1)}e^{-4t}\\sin(3t) = 8e^{-4t}\\sin(3t)',
        expectedAnswer: '8*e^(-4t)*sin(3t)',
        acceptableAnswers: [
          '8*e^(-4t)*sin(3t)',
          '8e^(-4t)sin(3t)',
          '8*exp(-4t)*sin(3t)',
          'i(t) = 8e^(-4t)sin(3t)',
          '8 e^(-4t) sin(3t)'
        ],
        explanationOnCorrect: 'Excelente! A corrente do circuito RLC série sob excitação degrau é $i(t) = 8e^{-4t}\\sin(3t)\\text{ A}$, iniciando em 0 A, atingindo um pico e decaindo a 0 A no infinito.',
        hint: 'A amplitude é $24 / (3 \\times 1) = 8$, o expoente é $-4t$ e o argumento do seno é $3t$.',
        inputType: 'math_text'
      }
    ]
  }
];

const BASE_MULTIPLE_CHOICE_PROBLEMS: MultipleChoiceProblem[] = [
  {
    id: 'mc-energy-power-1',
    title: 'Exercício 1.1: Classificação em Sinal de Energia ou Potência',
    chapter: 1,
    chapterName: 'Capítulo 1 – Sinais e Sistemas',
    category: 'signals',
    difficulty: 'Iniciante',
    xpReward: 40,
    statement: 'Analise o sinal periódico contínuo $f(t) = 3\\cos(200\\pi t)$. Como ele é classificado quanto à métrica de Energia ($E$) e Potência Média ($P$)?',
    guidedHint: 'Sinais puramente periódicos e que se estendem de $-\\infty$ a $+\\infty$ possuem energia infinita no tempo total, porém sua potência média em um período $T$ é finita e não-nula.',
    interpretationGuide: {
      objective: 'Classificar o sinal senoidal quanto ao tipo de sinal (Energia ou Potência) e calcular o valor numérico de $P$.',
      givenData: [
        { label: 'Sinal f(t)', value: '3\\cos(200\\pi t)' },
        { label: 'Amplitude A', value: '3' },
        { label: 'Frequência Angular', value: '\\omega_0 = 200\\pi\\,\\text{rad/s}' },
      ],
      strategy: [
        '1. Reconhecer que toda senoide periódica contínua infinita possui energia infinita $E = \\infty$.',
        '2. Aplicar a fórmula da potência média de uma senoide: $P = \\frac{A^2}{2}$.',
        '3. Como $0 < P < \\infty$ e $E = \\infty$, o sinal é estritamente um **Sinal de Potência**.',
      ],
    },
    formulaGuide: {
      title: 'Potência Média de Sinal Periódico Senoidal',
      formulaLatex: 'P = \\frac{1}{T}\\int_0^T |f(t)|^2 dt = \\frac{A^2}{2}, \\quad E = \\int_{-\\infty}^{\\infty} |f(t)|^2 dt',
      howToApply: 'Substitua a amplitude $A=3$ na fórmula $P = \\frac{A^2}{2} = \\frac{3^2}{2} = 4.5\\text{ W}$.',
    },
    options: [
      {
        text: 'Sinal de Potência, com $P = \\frac{9}{2} = 4.5\\text{ W}$ e $E = \\infty$',
        isCorrect: true,
        explanation: 'Para uma senoide de amplitude $A=3$, a potência média é $P = \\frac{A^2}{2} = \\frac{3^2}{2} = 4.5$. Como é periódica infinita, a energia total $E = \\infty$. Logo, é um sinal de potência.'
      },
      {
        text: 'Sinal de Energia, com $E = 9\\text{ J}$ e $P = 0$',
        isCorrect: false,
        explanation: 'Incorreto. A energia $E = \\int_{-\\infty}^\\infty |3\\cos(200\\pi t)|^2 dt$ diverge para $\\infty$.'
      },
      {
        text: 'Nem de energia nem de potência, pois a frequência $100\\text{ Hz}$ é muito alta',
        isCorrect: false,
        explanation: 'A frequência do sinal não impede que ele seja um sinal de potência.'
      },
      {
        text: 'Sinal de Energia, pois a potência média é nula',
        isCorrect: false,
        explanation: 'Sinais senoidais possuem potência média $P = A^2/2 > 0$, logo não é nula.'
      }
    ],
    stepByStepSolution: '1. O sinal $f(t) = 3\\cos(2\\pi \\cdot 100 t)$ tem amplitude $A = 3$ e período $T = \\frac{1}{100} = 0.01\\text{ s}$.\n2. Potência média: $P = \\frac{1}{T}\\int_0^T |f(t)|^2 dt = \\frac{A^2}{2} = \\frac{3^2}{2} = 4.5\\text{ W}$.\n3. Como $0 < P < \\infty$, o sinal é classificado estritamente como **Sinal de Potência** (sua energia $E = \\infty$).'
  },
  {
    id: 'mc-discrete-periodicity-2',
    title: 'Exercício Resumo Aula: Periodicidade em Tempo Discreto',
    chapter: 1,
    chapterName: 'Capítulo 1 – Sinais e Sistemas',
    category: 'signals',
    difficulty: 'Intermediário',
    xpReward: 50,
    statement: 'Considere a sequência senoidal em tempo discreto $x[n] = \\cos(n)$. O sinal $x[n]$ é periódico?',
    guidedHint: 'Lembre-se do critério fundamental: uma senoide discreta $\\cos(\\omega_0 n)$ só é periódica se a frequência cíclica $f = \\frac{\\omega_0}{2\\pi}$ for um número racional $\\left(\\frac{k}{N} \\in \\mathbb{Q}\\right)$.',
    interpretationGuide: {
      objective: 'Verificar a condição matemática de periodicidade de um sinal senoidal no domínio do tempo discreto $n \\in \\mathbb{Z}$.',
      givenData: [
        { label: 'Sinal Discreto x[n]', value: '\\cos(1 \\cdot n)' },
        { label: 'Frequência Angular Discreta', value: '\\omega_0 = 1\\,\\text{rad/amostra}' },
      ],
      strategy: [
        '1. Calcular a razão $f = \\frac{\\omega_0}{2\\pi} = \\frac{1}{2\\pi}$.',
        '2. Analisar se essa razão é um número racional (quociente de dois inteiros $k/N$).',
        '3. Como $\\pi$ é irracional, não existem inteiros $N$ e $k$ que satisfaçam a igualdade.',
      ],
    },
    formulaGuide: {
      title: 'Condição de Periodicidade em Tempo Discreto',
      formulaLatex: '\\frac{\\omega_0}{2\\pi} = \\frac{k}{N} \\in \\mathbb{Q}, \\quad k, N \\in \\mathbb{Z}^+',
      howToApply: 'Substitua $\\omega_0 = 1$. Se $\\frac{1}{2\\pi}$ não puder ser escrito como fração de inteiros, o sinal é aperiódico.',
    },
    options: [
      {
        text: 'Não é periódico, pois $\\frac{\\omega_0}{2\\pi} = \\frac{1}{2\\pi}$ é um número irracional.',
        isCorrect: true,
        explanation: 'Exato! Para haver período inteiro $N$, precisaríamos de $\\omega_0 N = 2\\pi k \\implies N = 2\\pi k / 1$, o que é impossível com $N, k \\in \\mathbb{Z}$ porque $\\pi$ é irracional.'
      },
      {
        text: 'Sim, é periódico com período fundamental $N = 2\\pi$.',
        isCorrect: false,
        explanation: 'Em tempo discreto, o índice $n$ e o período $N$ devem ser números inteiros ($N \\in \\mathbb{Z}$). $2\\pi \\approx 6.283$ não é inteiro.'
      },
      {
        text: 'Sim, é periódico com período $N = 1$ amostra.',
        isCorrect: false,
        explanation: '$\\cos(n+1) \\neq \\cos(n)$ para qualquer $n$.'
      },
      {
        text: 'Sim, pois toda função cosseno é sempre periódica em qualquer domínio.',
        isCorrect: false,
        explanation: 'Cuidado! No tempo contínuo toda senoide é periódica, mas no tempo discreto exige-se a condição de racionalidade $\\frac{\\omega_0}{2\\pi} \\in \\mathbb{Q}$.'
      }
    ],
    stepByStepSolution: '1. Frequência angular discreta: $\\omega_0 = 1\\text{ rad/amostra}$.\n2. Razão com $2\\pi$: $\\frac{\\omega_0}{2\\pi} = \\frac{1}{2\\pi}$.\n3. Como $\\pi$ é transcendente/irracional, $\\frac{1}{2\\pi} \\notin \\mathbb{Q}$. Não existem inteiros $k, N$ tais que $N = \\frac{2\\pi k}{\\omega_0}$.\n4. Logo, $x[n] = \\cos(n)$ **NÃO é periódico**.'
  },
  {
    id: 'mc-fourier-symmetry-3',
    title: 'Exercício 2.5: Simetrias na Série Trigonométrica de Fourier',
    chapter: 2,
    chapterName: 'Capítulo 2 – Análise de Fourier',
    category: 'fourier',
    difficulty: 'Intermediário',
    xpReward: 50,
    statement: 'Uma função periódica $f(t)$ com período $T = 2\\pi$ possui simetria ímpar, isto é, $f(-t) = -f(t)$, e valor médio nulo $a_0 = 0$. Quais coeficientes da Série Trigonométrica de Fourier serão não-nulos?',
    guidedHint: 'Funções ímpares só podem ser construídas por somas ponderadas de funções ímpares (senos), pois cossenos são funções pares.',
    interpretationGuide: {
      objective: 'Identificar a influência da simetria ímpar do sinal nos coeficientes $a_0, a_n, b_n$ da Série de Fourier.',
      givenData: [
        { label: 'Simetria', value: 'Ímpar: f(-t) = -f(t)' },
        { label: 'Valor Médio', value: 'a_0 = 0' },
      ],
      strategy: [
        '1. Lembrar que a Série Trigonométrica é $f(t) = a_0 + \\sum (a_n \\cos(n\\omega_0 t) + b_n \\sin(n\\omega_0 t))$.',
        '2. O cosseno é função par; o produto de função ímpar por par é ímpar, cuja integral em período simétrico é ZERO ($a_n = 0$).',
        '3. O seno é função ímpar; produto de duas funções ímpares é par, gerando coeficientes $b_n \\neq 0$.',
      ],
    },
    formulaGuide: {
      title: 'Propriedades de Simetria de Fourier',
      formulaLatex: 'f(-t) = -f(t) \\implies a_0 = 0, \\quad a_n = 0, \\quad b_n = \\frac{4}{T}\\int_0^{T/2} f(t)\\sin(n\\omega_0 t)dt',
      howToApply: 'Em qualquer sinal ímpar, zere instantaneamente $a_0$ e todos os $a_n$, calculando apenas os termos $b_n$ em seno.',
    },
    options: [
      {
        text: 'Apenas os coeficientes $b_n$ (termos em seno), com $a_0 = 0$ e $a_n = 0$',
        isCorrect: true,
        explanation: 'Correto! Em sinais com simetria ímpar, a integral de $f(t)\\cos(n\\omega_0 t)$ sobre um período simétrico se anula ($a_n = 0$), restando apenas os termos senoidais $b_n$.'
      },
      {
        text: 'Apenas os coeficientes $a_n$ (termos em cosseno), com $b_n = 0$',
        isCorrect: false,
        explanation: 'Termos em cosseno são para simetria par ($f(-t) = f(t)$).'
      },
      {
        text: 'Todos os coeficientes $a_0, a_n, b_n$ serão diferentes de zero',
        isCorrect: false,
        explanation: 'A simetria ímpar anula completamente todos os $a_n$ e $a_0$.'
      },
      {
        text: 'Apenas o valor médio $a_0$',
        isCorrect: false,
        explanation: 'O valor médio de uma função ímpar em período simétrico é sempre zero.'
      }
    ],
    stepByStepSolution: '1. Pela propriedade P10 do texto: Produto de função ímpar por função par (cosseno) é ímpar $\\implies \\int_{-T/2}^{T/2} f(t)\\cos(n\\omega_0 t)dt = 0 \\implies a_n = 0$.\n2. Produto de função ímpar por função ímpar (seno) é par $\\implies b_n = \\frac{4}{T}\\int_0^{T/2} f(t)\\sin(n\\omega_0 t)dt \\neq 0$.\n3. Portanto, $f(t) = \\sum_{n=1}^\\infty b_n \\sin(n\\omega_0 t)$.'
  },
  {
    id: 'mc-laplace-shift-4',
    title: 'Exercício 3.5(a): Transformada Inversa por Frações Parciais',
    chapter: 3,
    chapterName: 'Capítulo 3 – Transformação de Laplace',
    category: 'laplace',
    difficulty: 'Intermediário',
    xpReward: 55,
    statement: 'Determine a transformada inversa de Laplace $\\mathcal{L}^{-1}\\{F(s)\\}$ para a função racional:\n\n$$F(s) = \\frac{1}{s^2 + 3s + 2}$$',
    guidedHint: 'Fatore o denominador de segundo grau: $s^2 + 3s + 2 = (s+1)(s+2)$. Em seguida, decomponha em $\\frac{A}{s+1} + \\frac{B}{s+2}$.',
    interpretationGuide: {
      objective: 'Retornar ao domínio do tempo $f(t)$ a partir de uma função racional própria em $s$.',
      givenData: [
        { label: 'Função F(s)', value: '\\frac{1}{s^2 + 3s + 2}' },
        { label: 'Polos', value: 's = -1 \\text{ e } s = -2' },
      ],
      strategy: [
        '1. Fatorar o denominador: $s^2+3s+2 = (s+1)(s+2)$.',
        '2. Usar o Método de Heaviside (Cover-Up) para calcular $A = 1$ e $B = -1$.',
        '3. Inverter com $\\mathcal{L}^{-1}\\{\\frac{1}{s+a}\\} = e^{-at}u(t)$.',
      ],
    },
    formulaGuide: {
      title: 'Expansão em Frações Parciais e Inversa Exponencial',
      formulaLatex: '\\frac{1}{(s+1)(s+2)} = \\frac{A}{s+1} + \\frac{B}{s+2}, \\quad \\mathcal{L}^{-1}\\left\\{\\frac{1}{s+a}\\right\\} = e^{-at}u(t)',
      howToApply: '$A = \\left.\\frac{1}{s+2}\\right|_{s=-1} = 1$ e $B = \\left.\\frac{1}{s+1}\\right|_{s=-2} = -1$. Logo $f(t) = e^{-t} - e^{-2t}$.',
    },
    options: [
      {
        text: '$$f(t) = (e^{-t} - e^{-2t})u(t)$$',
        isCorrect: true,
        explanation: 'Exato! $A = \\lim_{s\\to -1} \\frac{1}{s+2} = 1$ e $B = \\lim_{s\\to -2} \\frac{1}{s+1} = -1$. Logo $F(s) = \\frac{1}{s+1} - \\frac{1}{s+2} \\implies f(t) = e^{-t} - e^{-2t}$.'
      },
      {
        text: '$$f(t) = (e^{-2t} - e^{-t})u(t)$$',
        isCorrect: false,
        explanation: 'Atenção aos sinais dos resíduos: em $s=-1$, $A = +1$, logo o termo $e^{-t}$ é positivo.'
      },
      {
        text: '$$f(t) = (e^{t} + e^{2t})u(t)$$',
        isCorrect: false,
        explanation: 'Os polos estão em $s = -1$ e $s = -2$, resultando em expoentes negativos na transformada inversa.'
      },
      {
        text: '$$f(t) = \\cos(t)e^{-2t}u(t)$$',
        isCorrect: false,
        explanation: 'As raízes são reais e distintas, não complexas conjugadas (não há oscilação senoidal).'
      }
    ],
    stepByStepSolution: '1. Fatoração: $s^2 + 3s + 2 = (s+1)(s+2)$.\n2. Frações parciais: $\\frac{1}{(s+1)(s+2)} = \\frac{A}{s+1} + \\frac{B}{s+2}$.\n3. Resíduos:\n   - $A = \\left. \\frac{1}{s+2} \\right|_{s=-1} = 1$.\n   - $B = \\left. \\frac{1}{s+1} \\right|_{s=-2} = -1$.\n4. Inversão: $\\mathcal{L}^{-1}\\left\\{ \\frac{1}{s+1} - \\frac{1}{s+2} \\right\\} = e^{-t} - e^{-2t}$ para $t \\ge 0$.'
  },
  {
    id: 'mc-stability-poles-5',
    title: 'Exercício 3.10: Análise de Polos e Estabilidade BIBO no Plano s',
    chapter: 3,
    chapterName: 'Capítulo 3 – Transformação de Laplace',
    category: 'laplace',
    difficulty: 'Avançado',
    xpReward: 65,
    statement: 'Um sistema linear contínuo possui a função de transferência $H(s) = \\frac{s + 2}{(s+1)(s^2 - 4s + 13)}$. Qual é o comportamento dinâmico da resposta ao impulso $h(t)$ e a estabilidade do sistema?',
    guidedHint: 'Calcule as raízes do denominador (polos). Se qualquer polo tiver parte real estritamente positiva ($\\text{Re}\\{s\\} > 0$), a resposta temporal cresce exponencialmente $e^{+at}$, tornando o sistema instável.',
    interpretationGuide: {
      objective: 'Determinar a estabilidade BIBO e a forma temporal do sinal a partir da localização dos polos de $H(s)$ no plano complexo $s$.',
      givenData: [
        { label: 'Denominador D(s)', value: '(s+1)(s^2 - 4s + 13)' },
        { label: 'Polos Encontrados', value: 's = -1 \\text{ e } s = 2 \\pm j3' },
      ],
      strategy: [
        '1. Calcular as raízes de $(s^2 - 4s + 13) = 0 \\implies s = \\frac{4 \\pm \\sqrt{16-52}}{2} = 2 \\pm j3$.',
        '2. Verificar a parte real dos polos: $\\text{Re}\\{2 \\pm j3\\} = +2 > 0$ (Semiplano Direito).',
        '3. Como existe polo com parte real positiva, o modo natural diverge $e^{2t}\\sin(3t) \\to \\infty$, tornando o sistema **Instável**.',
      ],
    },
    formulaGuide: {
      title: 'Critério de Estabilidade de Polos no Plano s',
      formulaLatex: '\\text{Estável BIBO} \\iff \\forall p_i, \\, \\text{Re}\\{p_i\\} < 0',
      howToApply: 'Ache todas as raízes do denominador. Basta um único polo com $\\text{Re}\\{p\\} > 0$ para o sistema ser instável.',
    },
    options: [
      {
        text: 'Instável, pois os polos conjugados $s = 2 \\pm j3$ têm parte real positiva ($+2$), gerando oscilações que crescem exponencialmente ($e^{2t}\\sin(3t)$).',
        isCorrect: true,
        explanation: 'Perfeito! As raízes de $s^2 - 4s + 13 = 0$ são $s = \\frac{4 \\pm \\sqrt{16 - 52}}{2} = 2 \\pm j3$. Como $\\text{Re}\\{s\\} = 2 > 0$, a resposta no tempo contém o termo divergente $e^{2t}$, caracterizando instabilidade BIBO.'
      },
      {
        text: 'Estável, pois possui um polo em $s = -1$ com parte real negativa.',
        isCorrect: false,
        explanation: 'Para estabilidade, TODOS os polos devem estar no semiplano esquerdo ($\\text{Re}\\{s\\} < 0$). A presença de um único polo instável no semiplano direito desestabiliza o sistema todo.'
      },
      {
        text: 'Marginalmente estável, pois oscila com frequência de $3\\text{ rad/s}$.',
        isCorrect: false,
        explanation: 'Estabilidade marginal ocorre apenas quando polos simples estão exatamente sobre o eixo imaginário ($\\text{Re}\\{s\\} = 0$). Aqui $\\text{Re}\\{s\\} = +2 > 0$.'
      },
      {
        text: 'Estável, pois o zero em $s = -2$ anula o efeito dos polos.',
        isCorrect: false,
        explanation: 'Zeros não determinam a estabilidade intrínseca do sistema; apenas os polos determinam os modos naturais temporais.'
      }
    ],
    stepByStepSolution: '1. Polos de $H(s)$ são as raízes de $(s+1)(s^2 - 4s + 13) = 0$:\n   - $p_1 = -1$ (polo real negativo)\n   - $p_{2,3} = \\frac{4 \\pm \\sqrt{-36}}{2} = 2 \\pm j3$ (polos complexos conjugados com parte real $+2$).\n2. No domínio do tempo, o par conjugado gera o modo $h(t) \\supset K e^{2t}\\cos(3t + \\theta)$.\n3. Como $\\lim_{t\\to\\infty} e^{2t} = \\infty$, o sistema é **Instável**.'
  },
  {
    id: 'mc-fourier-transform-prop-6',
    title: 'Exercício 2.19: Mudança de Escala na Transformada de Fourier',
    chapter: 2,
    chapterName: 'Capítulo 2 – Análise de Fourier',
    category: 'fourier',
    difficulty: 'Intermediário',
    xpReward: 45,
    statement: 'Se a transformada de Fourier de $f(t)$ é $F(\\omega)$, qual é a transformada de Fourier da função comprimida $g(t) = f(-3t)$?',
    guidedHint: 'Pela propriedade da mudança de escala P2: $\\mathcal{F}\\{f(at)\\} = \\frac{1}{|a|}F\\left(\\frac{\\omega}{a}\\right)$. Aplique com $a = -3$.',
    interpretationGuide: {
      objective: 'Calcular a nova densidade espectral em frequência quando o sinal no tempo sofre uma reversão e compressão temporal com fator $a = -3$.',
      givenData: [
        { label: 'Sinal Original', value: 'f(t) \\leftrightarrow F(\\omega)' },
        { label: 'Fator de Escala', value: 'a = -3' },
      ],
      strategy: [
        '1. Lembrar que compressão no tempo por fator $|a| > 1$ corresponde a alargamento na frequência.',
        '2. Aplicar a fórmula com $a = -3$: o fator multiplicativo externo é $\\frac{1}{|-3|} = \\frac{1}{3}$.',
        '3. O argumento de frequência vira $\\frac{\\omega}{-3} = -\\frac{\\omega}{3}$.',
      ],
    },
    formulaGuide: {
      title: 'Propriedade da Mudança de Escala no Tempo de Fourier',
      formulaLatex: '\\mathcal{F}\\{f(at)\\} = \\frac{1}{|a|} F\\left( \\frac{\\omega}{a} \\right)',
      howToApply: 'Substitua $a = -3$. Obtenha $\\frac{1}{|-3|}F\\left(\\frac{\\omega}{-3}\\right) = \\frac{1}{3}F\\left(-\\frac{\\omega}{3}\\right)$.',
    },
    options: [
      {
        text: '$$\\mathcal{F}\\{f(-3t)\\} = \\frac{1}{3}F\\left(-\\frac{\\omega}{3}\\right)$$',
        isCorrect: true,
        explanation: 'Exato! Com $a = -3$, $\\frac{1}{|a|} = \\frac{1}{|-3|} = \\frac{1}{3}$, e o argumento da frequência torna-se $\\frac{\\omega}{-3} = -\\frac{\\omega}{3}$.'
      },
      {
        text: '$$\\mathcal{F}\\{f(-3t)\\} = -3F(-3\\omega)$$',
        isCorrect: false,
        explanation: 'Compressão no tempo corresponde a expansão na frequência com fator inverso $1/a$.'
      },
      {
        text: '$$\\mathcal{F}\\{f(-3t)\\} = -\\frac{1}{3}F\\left(\\frac{\\omega}{3}\\right)$$',
        isCorrect: false,
        explanation: 'O módulo $|a|$ garante que o coeficiente multiplicador externo seja estritamente positivo: $\\frac{1}{|-3|} = +\\frac{1}{3}$.'
      },
      {
        text: '$$\\mathcal{F}\\{f(-3t)\\} = 3F(-\\omega)$$',
        isCorrect: false,
        explanation: 'Fórmula incorreta para a propriedade de escala.'
      }
    ],
    stepByStepSolution: '1. Propriedade da Escala: $\\mathcal{F}\\{f(at)\\} = \\frac{1}{|a|}F\\left(\\frac{\\omega}{a}\\right)$.\n2. Para $a = -3$:\n   - Fator de amplitude: $\\frac{1}{|-3|} = \\frac{1}{3}$.\n   - Argumento de frequência: $\\frac{\\omega}{-3} = -\\frac{\\omega}{3}$.\n3. Portanto: $\\mathcal{F}\\{f(-3t)\\} = \\frac{1}{3}F\\left(-\\frac{\\omega}{3}\\right)$.'
  },
  {
    id: 'mc-routh-hurwitz-7',
    title: 'Exercício 4.15: Critério de Estabilidade de Routh-Hurwitz para EDOs de 3ª Ordem',
    chapter: 4,
    chapterName: 'Capítulo 4 – Equações Diferenciais (EDOs)',
    category: 'differential_equations',
    difficulty: 'Avançado',
    xpReward: 65,
    statement: 'A equação característica de um sistema de controle com realimentação é dada por $P(s) = s^3 + 3s^2 + 3s + 1 + K = 0$. Para qual faixa do ganho $K$ o sistema permanece estritamente assintoticamente estável?',
    guidedHint: 'Construa a Tabela de Routh para o polinômio $a_3 s^3 + a_2 s^2 + a_1 s + a_0 = 0$. Para 3ª ordem, a condição necessária e suficiente é $a_2 a_1 > a_3 a_0$ com todos os coeficientes estritamente positivos.',
    interpretationGuide: {
      objective: 'Determinar a faixa de ganho K para que todos os polos do sistema estejam no semiplano esquerdo sem precisar fatorar raízes cúbicas.',
      givenData: [
        { label: 'Polinômio Característico', value: 's^3 + 3s^2 + 3s + (1+K) = 0' },
        { label: 'Coeficientes', value: 'a_3=1, \\; a_2=3, \\; a_1=3, \\; a_0=1+K' },
      ],
      strategy: [
        '1. Garantir que todos os coeficientes sejam positivos: $1 + K > 0 \\implies K > -1$.',
        '2. Montar a linha $s^1$ de Routh: $b_1 = \\frac{a_2 a_1 - a_3 a_0}{a_2} = \\frac{3(3) - 1(1+K)}{3} = \\frac{8 - K}{3}$.',
        '3. Exigir $b_1 > 0 \\implies 8 - K > 0 \\implies K < 8$.',
        '4. Interseção das condições: $-1 < K < 8$ (ou $0 < K < 8$ para ganhos físicos positivos).',
      ],
    },
    formulaGuide: {
      title: 'Critério de Routh para Polinômio Cúbico',
      formulaLatex: 'P(s) = s^3 + a_2 s^2 + a_1 s + a_0 \\implies \\text{Estável} \\iff a_2 > 0, \\; a_0 > 0, \\; a_2 a_1 > a_0',
      howToApply: 'Substitua $a_2=3$, $a_1=3$ e $a_0=1+K$. Obtenha $3 \\times 3 > 1 + K \\implies 9 > 1 + K \\implies K < 8$.',
    },
    options: [
      {
        text: '$$-1 < K < 8$$',
        isCorrect: true,
        explanation: 'Perfeito! Pelo critério de Routh: $a_2 a_1 > a_3 a_0 \\implies 3(3) > 1(1+K) \\implies 9 > 1+K \\implies K < 8$. E para coeficientes positivos, $1+K > 0 \\implies K > -1$.'
      },
      {
        text: '$$K > 8$$',
        isCorrect: false,
        explanation: 'Para $K > 8$, a linha $s^1$ de Routh torna-se negativa ($b_1 < 0$), criando polos no semiplano direito (instabilidade).'
      },
      {
        text: '$$0 < K < 3$$',
        isCorrect: false,
        explanation: 'A condição do produto $a_2 a_1 = 9$ permite que $K$ atinja até 8 antes de ocorrer instabilidade.'
      },
      {
        text: '$$K < -1$$',
        isCorrect: false,
        explanation: 'Para $K < -1$, o termo constante torna-se negativo, violando a condição necessária de coeficientes de mesmo sinal.'
      }
    ],
    stepByStepSolution: '1. Matriz de Routh:\n   - Linha $s^3$: $1 \\quad 3$\n   - Linha $s^2$: $3 \\quad 1+K$\n   - Linha $s^1$: $\\frac{3(3) - 1(1+K)}{3} = \\frac{8-K}{3}$\n   - Linha $s^0$: $1+K$\n2. Para não haver trocas de sinal na 1ª coluna:\n   - $\\frac{8-K}{3} > 0 \\implies K < 8$\n   - $1+K > 0 \\implies K > -1$\n3. Faixa de Estabilidade: $-1 < K < 8$.'
  },
  {
    id: 'mc-power-factor-correction-8',
    title: 'Exercício 5.20: Correção de Fator de Potência com Banco de Capacitores em Paralelo',
    chapter: 5,
    chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
    category: 'electrical_engineering',
    difficulty: 'Avançado',
    xpReward: 65,
    statement: 'Uma instalação industrial monofásica consome uma potência ativa $P = 12\\text{ kW}$ com fator de potência inicial $\\text{FP}_1 = 0.60$ indutivo alimentada em $V_{rms} = 220\\text{ V}$ ($60\\text{ Hz}$). Qual é a potência reativa capacitiva $Q_C$ necessária do banco de capacitores em paralelo para elevar o fator de potência para $\\text{FP}_2 = 0.95$ indutivo?',
    guidedHint: 'Use a relação do triângulo de potências: $Q_C = P(\\tan\\theta_1 - \\tan\\theta_2)$. Sabendo que $\\cos\\theta_1 = 0.60 \\implies \\tan\\theta_1 = \\frac{0.8}{0.6} = 1.333$ e $\\cos\\theta_2 = 0.95 \\implies \\theta_2 = 18.19^\circ \\implies \\tan\\theta_2 \\approx 0.3287$.',
    interpretationGuide: {
      objective: 'Dimensionar o valor de compensação de reativos capacitivos $Q_C$ para reduzir a corrente total exigida da rede elétrica.',
      givenData: [
        { label: 'Potência Ativa P', value: '12\\text{ kW}' },
        { label: 'FP Inicial', value: '0.60 \\implies \\tan\\theta_1 = 1.333' },
        { label: 'FP Alvo', value: '0.95 \\implies \\tan\\theta_2 = 0.3287' },
      ],
      strategy: [
        '1. Calcular a potência reativa inicial: $Q_1 = P \\tan\\theta_1 = 12 \\times 1.3333 = 16.0\\text{ kVAr}$.',
        '2. Calcular a potência reativa permitida no alvo: $Q_2 = P \\tan\\theta_2 = 12 \\times 0.3287 = 3.944\\text{ kVAr}$.',
        '3. Calcular a potência reativa fornecida pelos capacitores: $Q_C = Q_1 - Q_2 = 16.0 - 3.944 = 12.06\\text{ kVAr}$.',
      ],
    },
    formulaGuide: {
      title: 'Equação de Correção de Fator de Potência',
      formulaLatex: 'Q_C = P(\\tan\\theta_1 - \\tan\\theta_2), \\quad C = \\frac{Q_C}{\\omega V_{rms}^2}',
      howToApply: 'Substitua $P = 12\\text{ kW}$, $\\tan\\theta_1 = 1.333$ e $\\tan\\theta_2 = 0.3287$. Obtenha $Q_C = 12(1.333 - 0.3287) \\approx 12.06\\text{ kVAr}$.',
    },
    options: [
      {
        text: '$$Q_C \\approx 12.06\\text{ kVAr}$$',
        isCorrect: true,
        explanation: 'Correto! $Q_1 = 12 \\times \\tan(\\arccos 0.6) = 12 \\times 1.333 = 16.0\\text{ kVAr}$ e $Q_2 = 12 \\times \\tan(\\arccos 0.95) = 12 \\times 0.3287 = 3.94\\text{ kVAr}$. O banco deve suprir $Q_C = 16.0 - 3.94 = 12.06\\text{ kVAr}$.'
      },
      {
        text: '$$Q_C = 16.00\\text{ kVAr}$$',
        isCorrect: false,
        explanation: '$16.0\\text{ kVAr}$ é a potência reativa indutiva inicial total, que compensaria para fator de potência unitário ($1.0$), e não $0.95$.'
      },
      {
        text: '$$Q_C = 4.20\\text{ kVAr}$$',
        isCorrect: false,
        explanation: 'Incorreto. Subtrair simplesmente $(0.95 - 0.60) \\times 12$ é um erro conceitual grave que ignora a trigonometria do triângulo de potências.'
      },
      {
        text: '$$Q_C = 20.00\\text{ kVAr}$$',
        isCorrect: false,
        explanation: '$20.0\\text{ kVA}$ é a potência aparente inicial $|S_1| = P / \\text{FP}_1 = 12 / 0.6$.'
      }
    ],
    stepByStepSolution: '1. Ângulo inicial: $\\theta_1 = \\arccos(0.60) \\approx 53.13^\circ \\implies \\tan\\theta_1 = 1.3333$.\n2. Ângulo final: $\\theta_2 = \\arccos(0.95) \\approx 18.19^\circ \\implies \\tan\\theta_2 = 0.3287$.\n3. Reativo a ser compensado: $Q_C = P(\\tan\\theta_1 - \\tan\\theta_2) = 12(1.3333 - 0.3287) = 12 \\times 1.0046 \\approx 12.06\\text{ kVAr}$.'
  },
  {
    id: 'mc-nyquist-product-9',
    title: 'Exercício 1.25: Frequência de Nyquist de Sinal Produto / Modulado',
    chapter: 1,
    chapterName: 'Capítulo 1 – Sinais e Sistemas',
    category: 'signals',
    difficulty: 'Intermediário',
    xpReward: 50,
    statement: 'Considere o sinal analógico contínuo $x(t) = 5\\cos(200\\pi t)\\sin(600\\pi t)$. Qual é a frequência máxima $f_{max}$ presente no espectro e qual é a taxa mínima de amostragem de Nyquist ($f_s$) para evitar aliasing?',
    guidedHint: 'Use a identidade trigonométrica do produto: $\\cos(A)\\sin(B) = \\frac{1}{2}[\\sin(A+B) - \\sin(A-B)]$. As frequências resultantes são a soma e a diferença das frequências individuais.',
    interpretationGuide: {
      objective: 'Determinar a largura de banda espectral de um sinal obtido por multiplicação temporal e encontrar a taxa de Nyquist $f_s \\ge 2 f_{max}$.',
      givenData: [
        { label: 'Termo 1', value: '\\omega_1 = 200\\pi\\,\\text{rad/s} \\implies f_1 = 100\\text{ Hz}' },
        { label: 'Termo 2', value: '\\omega_2 = 600\\pi\\,\\text{rad/s} \\implies f_2 = 300\\text{ Hz}' },
      ],
      strategy: [
        '1. Aplicar a identidade do produto: $\\cos(200\\pi t)\\sin(600\\pi t) = \\frac{1}{2}[\\sin(800\\pi t) + \\sin(400\\pi t)]$.',
        '2. Identificar as frequências componentes: $f_a = \\frac{800\\pi}{2\\pi} = 400\\text{ Hz}$ e $f_b = \\frac{400\\pi}{2\\pi} = 200\\text{ Hz}$.',
        '3. A frequência máxima é $f_{max} = 400\\text{ Hz}$.',
        '4. Taxa de Nyquist: $f_s = 2 f_{max} = 2 \\times 400 = 800\\text{ Hz}$ (ou amostras/s).',
      ],
    },
    formulaGuide: {
      title: 'Teorema da Amostragem de Nyquist-Shannon',
      formulaLatex: 'f_{max} = f_1 + f_2, \\quad f_s \\ge 2 f_{max}',
      howToApply: 'A multiplicação no tempo equivale à convolução no domínio da frequência, somando as frequências máximas: $f_{max} = 100 + 300 = 400\\text{ Hz}$. Portanto $f_s = 800\\text{ Hz}$.',
    },
    options: [
      {
        text: '$$f_{max} = 400\\text{ Hz}, \\quad f_s \\ge 800\\text{ Hz}$$',
        isCorrect: true,
        explanation: 'Exato! Pela identidade de produto $\\sin(600\\pi t)\\cos(200\\pi t) = \\frac{1}{2}[\\sin(800\\pi t) + \\sin(400\\pi t)]$, a frequência máxima é $f_{max} = \\frac{800\\pi}{2\\pi} = 400\\text{ Hz}$. Pelo critério de Nyquist, $f_s \\ge 2 f_{max} = 800\\text{ Hz}$.'
      },
      {
        text: '$$f_{max} = 300\\text{ Hz}, \\quad f_s \\ge 600\\text{ Hz}$$',
        isCorrect: false,
        explanation: 'Incorreto. A multiplicação no tempo gera componentes nas frequências de soma ($300 + 100 = 400\\text{ Hz}$) e diferença ($300 - 100 = 200\\text{ Hz}$).'
      },
      {
        text: '$$f_{max} = 100\\text{ Hz}, \\quad f_s \\ge 200\\text{ Hz}$$',
        isCorrect: false,
        explanation: '$100\\text{ Hz}$ é apenas a frequência do primeiro cosseno, ignorando a modulação pelo seno de $300\\text{ Hz}$.'
      },
      {
        text: '$$f_{max} = 800\\text{ Hz}, \\quad f_s \\ge 1600\\text{ Hz}$$',
        isCorrect: false,
        explanation: '$800\\pi\\text{ rad/s}$ é a frequência angular em rad/s. Dividindo por $2\\pi$, a frequência em Hertz é $400\\text{ Hz}$.'
      }
    ],
    stepByStepSolution: '1. Decomposição trigonométrica: $5\\cos(200\\pi t)\\sin(600\\pi t) = 2.5\\sin(800\\pi t) + 2.5\\sin(400\\pi t)$.\n2. Frequências em Hertz: $f_1 = \\frac{800\\pi}{2\\pi} = 400\\text{ Hz}$, $f_2 = \\frac{400\\pi}{2\\pi} = 200\\text{ Hz}$.\n3. Frequência mais alta do sinal: $f_{max} = 400\\text{ Hz}$.\n4. Taxa de Amostragem de Nyquist: $f_s \\ge 2 f_{max} = 800\\text{ Hz}$.'
  },
  {
    id: 'mc-frequency-response-bode-10',
    title: 'Exercício 2.30: Resposta em Regime Permanente a Senoide via Função de Transferência',
    chapter: 2,
    chapterName: 'Capítulo 2 – Análise de Fourier',
    category: 'fourier',
    difficulty: 'Avançado',
    xpReward: 60,
    statement: 'Um filtro passa-baixas possui a resposta em frequência $H(j\\omega) = \\frac{1}{1 + j\\frac{\\omega}{100}}$. Se aplicarmos na entrada o sinal senoidal $x(t) = 10\\cos(100t + 30^\\circ)$, qual será a expressão da saída em regime permanente $y_{ss}(t)$?',
    guidedHint: 'A saída senoidal de um sistema LTI em regime permanente é $y_{ss}(t) = A |H(j\\omega_0)| \\cos(\\omega_0 t + \\phi + \\angle H(j\\omega_0))$. Calcule o módulo e a fase de $H(j\\omega)$ em $\\omega_0 = 100\\text{ rad/s}$.',
    interpretationGuide: {
      objective: 'Determinar a amplitude e o ângulo de fase da resposta senoidal em regime estacionário usando a representação fasorial.',
      givenData: [
        { label: 'Entrada x(t)', value: '10\\cos(100t + 30^\\circ)' },
        { label: 'Frequência de Excitação', value: '\\omega_0 = 100\\text{ rad/s}' },
        { label: 'Função de Transferência', value: 'H(j\\omega) = \\frac{1}{1 + j\\frac{\\omega}{100}}' },
      ],
      strategy: [
        '1. Avaliar $H(j100) = \\frac{1}{1 + j1}$.',
        '2. Módulo: $|H(j100)| = \\frac{1}{|1 + j1|} = \\frac{1}{\\sqrt{1^2 + 1^2}} = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\approx 0.7071$.',
        '3. Fase: $\\angle H(j100) = -\\arctan(1/1) = -45^\\circ$.',
        '4. Amplitude de saída: $A_{out} = 10 \\times \\frac{1}{\\sqrt{2}} = 5\\sqrt{2} \\approx 7.071$.',
        '5. Fase de saída: $\\theta_{out} = 30^\\circ - 45^\\circ = -15^\\circ$.',
      ],
    },
    formulaGuide: {
      title: 'Resposta em Regime Permanente Senoidal',
      formulaLatex: 'y_{ss}(t) = |H(j\\omega_0)| X_0 \\cos(\\omega_0 t + \\phi + \\angle H(j\\omega_0))',
      howToApply: 'Substitua $\\omega_0 = 100$: $|H(j100)| = 1/\\sqrt{2}$ e $\\angle H(j100) = -45^\\circ$. Some as fases: $30^\\circ - 45^\\circ = -15^\\circ$.',
    },
    options: [
      {
        text: '$$y_{ss}(t) = 5\\sqrt{2}\\cos(100t - 15^\\circ) \\approx 7.07\\cos(100t - 15^\\circ)$$',
        isCorrect: true,
        explanation: 'Perfeito! Em $\\omega = 100\\text{ rad/s}$, $H(j100) = \\frac{1}{1+j1} = \\frac{1}{\\sqrt{2}}\\angle -45^\\circ$. Multiplicando a amplitude por $1/\\sqrt{2}$ temos $10/\\sqrt{2} = 5\\sqrt{2}$, e somando a fase $30^\\circ - 45^\\circ = -15^\\circ$.'
      },
      {
        text: '$$y_{ss}(t) = 10\\cos(100t + 30^\\circ)$$',
        isCorrect: false,
        explanation: 'O filtro atenua a amplitude em $-3\\text{ dB}$ (fator $1/\\sqrt{2}$) e introduz defasagem de atraso de $-45^\\circ$ na frequência de corte.'
      },
      {
        text: '$$y_{ss}(t) = 5\\cos(100t + 75^\\circ)$$',
        isCorrect: false,
        explanation: 'O polo no denominador provoca atraso de fase (sinal negativo $-45^\\circ$), não avanço $+45^\\circ$.'
      },
      {
        text: '$$y_{ss}(t) = 7.07\\cos(100t + 15^\\circ)$$',
        isCorrect: false,
        explanation: 'Cuidado com o sinal da soma: $30^\\circ + (-45^\\circ) = -15^\\circ$, e não $+15^\\circ$.'
      }
    ],
    stepByStepSolution: '1. Avaliação em $\\omega_0 = 100\\text{ rad/s}$:\n   $H(j100) = \\frac{1}{1 + j(100/100)} = \\frac{1}{1+j} = \\frac{1-j}{2} = \\frac{1}{\\sqrt{2}} e^{-j 45^\\circ}$.\n2. Módulo do ganho: $|H(j100)| = \\frac{1}{\\sqrt{2}} \\approx 0.7071$.\n3. Deslocamento de fase: $\\phi_H = -45^\\circ$.\n4. Sinal de saída:\n   $y_{ss}(t) = 10 \\times \\frac{1}{\\sqrt{2}} \\cos(100t + 30^\\circ - 45^\\circ) = 5\\sqrt{2}\\cos(100t - 15^\\circ)$.'
  }
];

// Combined full question bank: Handcrafted base questions + Algorithmic level-calibrated sets (100+ per level)
export const STEP_BY_STEP_PROBLEMS: StepByStepProblem[] = [
  ...BASE_STEP_BY_STEP_PROBLEMS,
  ...ALL_STEP_BY_STEP_PROBLEMS,
];

export const MULTIPLE_CHOICE_PROBLEMS: MultipleChoiceProblem[] = [
  ...BASE_MULTIPLE_CHOICE_PROBLEMS,
  ...ALL_MULTIPLE_CHOICE_PROBLEMS,
];


