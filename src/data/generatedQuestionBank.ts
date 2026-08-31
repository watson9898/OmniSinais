import { StepByStepProblem, MultipleChoiceProblem } from '../types';

// ====================================================================================================
// GENERATOR FOR 1500 MULTIPLE CHOICE PROBLEMS (5 CHAPTERS x 3 LEVELS x 100 QUESTIONS)
// PLUS 300 COMPREHENSIVE STEP-BY-STEP GUIDED PROBLEMS
// ====================================================================================================

export function generateQuestionBank() {
  const stepProblems: StepByStepProblem[] = [];
  const mcProblems: MultipleChoiceProblem[] = [];

  const levels = ['Iniciante', 'Intermediário', 'Avançado'] as const;

  // ==================================================================================================
  // CHAPTER 1: SINAIS & SISTEMAS (100 Iniciante, 100 Intermediário, 100 Avançado)
  // ==================================================================================================
  for (const diff of levels) {
    const xp = diff === 'Iniciante' ? 25 : diff === 'Intermediário' ? 45 : 60;

    for (let i = 1; i <= 100; i++) {
      const id = `mc-ch1-${diff.toLowerCase().substring(0, 3)}-${i}`;
      const a = (i % 7) + 2;
      const b = (i % 5) + 1;
      const t0 = (i % 6) + 1;
      const w0 = (i % 8) + 2;

      if (diff === 'Iniciante') {
        const variant = i % 4;
        if (variant === 0) {
          // Paridade de Sinais
          const isOdd = i % 2 === 1;
          const expr = isOdd
            ? `x(t) = ${a}t^3 + ${b}\\sin(${w0}t)`
            : `x(t) = ${a}t^2 + ${b}\\cos(${w0}t)`;
          const symType = isOdd ? 'Ímpar' : 'Par';
          const symDef = isOdd
            ? `x(-t) = ${a}(-t)^3 + ${b}\\sin(-${w0}t) = -(${a}t^3 + ${b}\\sin(${w0}t)) = -x(t)`
            : `x(-t) = ${a}(-t)^2 + ${b}\\cos(-${w0}t) = ${a}t^2 + ${b}\\cos(${w0}t) = x(t)`;

          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Cap 1): Simetria e Paridade de Sinais`,
            chapter: 1,
            chapterName: 'Capítulo 1 – Sinais & Sistemas',
            category: 'signals',
            difficulty: diff,
            xpReward: xp,
            statement: `Analise o sinal contínuo $${expr}$ e classifique sua simetria temporal em Par, Ímpar ou Sem Simetria.`,
            guidedHint: `Avalie $x(-t)$. Lembre-se que potências pares e $\\cos(\\omega t)$ são funções pares, enquanto potências ímpares e $\\sin(\\omega t)$ são ímpares.`,
            interpretationGuide: {
              objective: 'Classificar a paridade do sinal aplicando a definição $x(-t)$.',
              givenData: [
                { label: 'Sinal Dado', value: expr },
                { label: 'Critério Par', value: 'x(-t) = x(t)' },
                { label: 'Critério Ímpar', value: 'x(-t) = -x(t)' },
              ],
              strategy: [
                '1. Substitua $t$ por $-t$ na expressão.',
                `2. Desenvolva: $${symDef}$.`,
                `3. Conclua que o sinal é estritamente **${symType}**.`,
              ],
              pitfalls: 'Cuidado com os sinais dos argumentos trigonométricos: $\\cos(-\\theta) = \\cos(\\theta)$ e $\\sin(-\\theta) = -\\sin(\\theta)$.',
            },
            formulaGuide: {
              title: 'Definição de Sinais Pares e Ímpares',
              formulaLatex: 'x_{par}(t) = \\frac{x(t)+x(-t)}{2}, \\quad x_{impar}(t) = \\frac{x(t)-x(-t)}{2}',
              howToApply: 'Substitua $t$ por $-t$ e compare diretamente com $+x(t)$ e $-x(t)$.',
            },
            options: [
              {
                text: `Sinal Estritamente ${symType}`,
                isCorrect: true,
                explanation: `Correto! Pelo cálculo algébrico, $${symDef}$, satisfazendo a definição de sinal ${symType.toLowerCase()}.`
              },
              {
                text: `Sinal Estritamente ${isOdd ? 'Par' : 'Ímpar'}`,
                isCorrect: false,
                explanation: `Incorreto. Todos os termos presentes possuem simetria ${symType.toLowerCase()}.`
              },
              {
                text: 'Não possui simetria definida',
                isCorrect: false,
                explanation: 'Incorreto. Como ambos os termos somados têm a mesma simetria, a soma preserva a paridade exata.'
              },
              {
                text: 'Sinal Discreto de Energia Infinita',
                isCorrect: false,
                explanation: 'A variável independente $t$ é contínua, não discreta.'
              }
            ],
            stepByStepSolution: `1. Calculamos $x(-t)$:\n   $$${symDef}$$\n2. Como $x(-t) = ${isOdd ? '-x(t)' : 'x(t)'}$, o sinal é **${symType}**.`
          });
        } else if (variant === 1) {
          // Deslocamento e Atraso Temporal
          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Cap 1): Deslocamento e Ganho de Degrau`,
            chapter: 1,
            chapterName: 'Capítulo 1 – Sinais & Sistemas',
            category: 'signals',
            difficulty: diff,
            xpReward: xp,
            statement: `Um atuador é acionado no instante $t = ${t0}\\text{ s}$ aplicando uma amplitude constante de $A = ${a}\\text{ V}$. Qual é a expressão matemática correta utilizando a função degrau unitário $u(t)$?`,
            guidedHint: `O degrau unitário atrasado que inicia em $t_0$ é representado por $u(t - t_0)$. Multiplique pela amplitude $A$.`,
            interpretationGuide: {
              objective: 'Expressar um sinal causal iniciado em instante positivo usando a função degrau.',
              givenData: [
                { label: 'Instante de Ativação', value: `t_0 = ${t0} \\text{ s}` },
                { label: 'Amplitude', value: `A = ${a} \\text{ V}` },
              ],
              strategy: [
                `1. A função degrau $u(t)$ vale 1 para $t \\ge 0$.`,
                `2. Para atrasar para $t = ${t0}$, fazemos a translação $u(t - ${t0})$.`,
                `3. Multiplicamos pelo ganho: $x(t) = ${a}u(t - ${t0})$.`,
              ],
            },
            formulaGuide: {
              title: 'Função Degrau Deslocada no Tempo',
              formulaLatex: 'x(t) = A \\cdot u(t - t_0) = \\begin{cases} A, & t \\ge t_0 \\\\ 0, & t < t_0 \\end{cases}',
              howToApply: `Substitua $A = ${a}$ e $t_0 = ${t0}$.`,
            },
            options: [
              {
                text: `$$x(t) = ${a}u(t - ${t0})$$`,
                isCorrect: true,
                explanation: `Exato! O termo $(t - ${t0})$ desloca a transição para a direita ($t = ${t0}$), e o fator ${a}$ define o nível de tensão.`
              },
              {
                text: `$$x(t) = ${a}u(t + ${t0})$$`,
                isCorrect: false,
                explanation: `O sinal $(t + ${t0})$ representaria um avanço temporal (ativação em $t = -${t0}$ s).`
              },
              {
                text: `$$x(t) = u(${a}t - ${t0})$$`,
                isCorrect: false,
                explanation: 'Multiplicar $t$ por uma constante dentro do argumento afeta a escala de tempo, não a amplitude.'
              },
              {
                text: `$$x(t) = \\frac{${a}}{t - ${t0}}u(t)$$`,
                isCorrect: false,
                explanation: 'A amplitude é constante e não inversamente proporcional ao tempo.'
              }
            ],
            stepByStepSolution: `1. Degrau unitário ativo em $t \\ge ${t0}$: $u(t - ${t0})$.\n2. Com amplitude de ${a} V: $x(t) = ${a}u(t - ${t0})$.`
          });
        } else if (variant === 2) {
          // Classificação de Linearidade e Invariância no Tempo
          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Cap 1): Linearidade de Sistemas Contínuos`,
            chapter: 1,
            chapterName: 'Capítulo 1 – Sinais & Sistemas',
            category: 'signals',
            difficulty: diff,
            xpReward: xp,
            statement: `Considere a relação entrada-saída de um sistema $T\\{x(t)\\}$ dada por $y(t) = ${a}x(t) + ${b}$. O sistema é Linear ou Não-Linear?`,
            guidedHint: `Verifique a condição de homogeneidade: se $x(t) = 0$, a saída $y(t)$ deve ser necessariamente zero para um sistema linear.`,
            interpretationGuide: {
              objective: 'Avaliar a linearidade do sistema testando o princípio da superposição e o ponto de repouso $T\\{0\\} = 0$.',
              givenData: [
                { label: 'Equação do Sistema', value: `y(t) = ${a}x(t) + ${b}` },
                { label: 'Constante Livre', value: `${b} \\neq 0` },
              ],
              strategy: [
                `1. Calcule a resposta para entrada nula: $y(t) = ${a}(0) + ${b} = ${b} \\neq 0$.`,
                '2. Um sistema linear com entrada nula deve obrigatoriamente produzir saída nula (homogeneidade com $\\alpha = 0$).',
                '3. Portanto, o sistema é Não-Linear (é afim, mas não linear).',
              ],
              pitfalls: 'Embora a equação seja de uma reta $y = ax + b$, em teoria de sistemas a constante $+b$ viola a superposição $T\\{x_1 + x_2\\} = T\\{x_1\\} + T\\{x_2\\}$.',
            },
            formulaGuide: {
              title: 'Condição Necessária de Linearidade',
              formulaLatex: 'T\\{\\alpha x_1(t) + \\beta x_2(t)\\} = \\alpha T\\{x_1(t)\\} + \\beta T\\{x_2(t)\\} \\implies T\\{0\\} = 0',
              howToApply: 'Substitua $x(t) = 0$ e avalie se $y(t) = 0$.',
            },
            options: [
              {
                text: `Não-Linear, pois para entrada nula $x(t) = 0$, a saída resulta em $y(t) = ${b} \\neq 0$`,
                isCorrect: true,
                explanation: `Correto! A constante $+${b}$ quebra a homogeneidade: $T\\{0\\} = ${b} \\neq 0$. Sistemas com offset não são estritamente lineares.`
              },
              {
                text: 'Linear, pois $y(t)$ é uma função de primeiro grau em $x(t)$',
                isCorrect: false,
                explanation: 'Incorreto. Na álgebra de sistemas lineares, transformações afins com termo constante não-nulo não respeitam a superposição.'
              },
              {
                text: 'Não-Linear apenas se a entrada for senoidal',
                isCorrect: false,
                explanation: 'A não-linearidade é uma propriedade intrínseca do operador do sistema, independente da forma de onda aplicada.'
              },
              {
                text: 'Linear e Variante no Tempo',
                isCorrect: false,
                explanation: 'O sistema é invariante no tempo (coeficientes constantes), porém estritamente não-linear.'
              }
            ],
            stepByStepSolution: `1. Testando entrada nula $x(t) = 0$:\n   $$y(t) = ${a}(0) + ${b} = ${b} \\neq 0$$\n2. Como $T\\{0\\} \\neq 0$, o sistema viola a homogeneidade e a aditividade.\n3. Conclusão: Sistema **Não-Linear**.`
          });
        } else {
          // Classificação de Energia vs Potência Média
          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Cap 1): Energia vs Potência de Sinal Exponencial`,
            chapter: 1,
            chapterName: 'Capítulo 1 – Sinais & Sistemas',
            category: 'signals',
            difficulty: diff,
            xpReward: xp,
            statement: `Classifique o sinal $x(t) = ${a}e^{-${b}t}u(t)$ (com $t$ em segundos) quanto à sua energia total $E$ e potência média $P$.`,
            guidedHint: `Sinais que decaem exponencialmente para zero possuem energia total finita ($0 < E < \\infty$) e potência média nula ($P = 0$).`,
            interpretationGuide: {
              objective: 'Classificar o sinal determinístico como sinal de energia ou de potência.',
              givenData: [
                { label: 'Sinal', value: `x(t) = ${a}e^{-${b}t}u(t)` },
                { label: 'Taxa de Decaimento', value: `${b} > 0` },
              ],
              strategy: [
                `1. Integral de energia: $E = \\int_0^\\infty (${a}e^{-${b}t})^2 dt = ${a*a} \\int_0^\\infty e^{-${2*b}t} dt = \\frac{${a*a}}{${2*b}} < \\infty$.`,
                '2. Como a energia é finita e não-nula, a potência média no tempo infinito é $P = \\lim_{T\\to\\infty} \\frac{E}{2T} = 0$.',
                '3. Trata-se de um Sinal de Energia.',
              ],
            },
            formulaGuide: {
              title: 'Energia e Potência de Sinais Contínuos',
              formulaLatex: 'E = \\int_{-\\infty}^{\\infty} |x(t)|^2 dt, \\quad P = \\lim_{T \\to \\infty} \\frac{1}{2T}\\int_{-T}^{T} |x(t)|^2 dt',
              howToApply: 'Se $0 < E < \\infty \\implies P = 0$ (Sinal de Energia). Se $0 < P < \\infty \\implies E = \\infty$ (Sinal de Potência).',
            },
            options: [
              {
                text: `Sinal de Energia com $E = \\frac{${a*a}}{${2*b}}\\text{ J}$ e potência média $P = 0\\text{ W}$`,
                isCorrect: true,
                explanation: `Exato! A integral de energia converge para $\\frac{${a}^2}{2 \\times ${b}} = \\frac{${a*a}}{${2*b}}$ J, caracterizando sinal de energia.`
              },
              {
                text: `Sinal de Potência com $P = ${a*a}\\text{ W}$ e energia $E = \\infty$`,
                isCorrect: false,
                explanation: 'Sinais de potência têm amplitude persistente no infinito (ex: senoides ou degraus perpétuos), o que não é o caso de uma exponencial decrescente.'
              },
              {
                text: 'Sinal Nem de Energia Nem de Potência',
                isCorrect: false,
                explanation: 'O sinal possui energia estritamente finita e bem definida, logo é um sinal de energia legítimo.'
              },
              {
                text: `Sinal de Energia com $E = \\frac{${a}}{${b}}\\text{ J}$`,
                isCorrect: false,
                explanation: 'Faltou elevar a amplitude ao quadrado na integral de $|x(t)|^2$.'
              }
            ],
            stepByStepSolution: `1. $E = \\int_0^\\infty (${a}e^{-${b}t})^2 dt = ${a*a}\\left[ -\\frac{e^{-${2*b}t}}{${2*b}} \\right]_0^\\infty = \\frac{${a*a}}{${2*b}}\\text{ J}$.\n2. Como $0 < E < \\infty$, a potência média $P = 0$.\n3. Resposta: **Sinal de Energia**.`
          });
        }
      } else if (diff === 'Intermediário') {
        // Intermediário Cap 1: Convolução contínua, resposta ao degrau, cascata
        const len1 = (i % 4) + 2;
        const len2 = (i % 3) + 1;
        const totalLen = len1 + len2;

        mcProblems.push({
          id,
          title: `Questão ${i} (Intermediário - Cap 1): Convolução de Pulsos e Suporte Temporal`,
          chapter: 1,
          chapterName: 'Capítulo 1 – Sinais & Sistemas',
          category: 'signals',
          difficulty: diff,
          xpReward: xp,
          statement: `Sejam $x(t) = \\text{rect}\\left(\\frac{t - ${len1/2}}{${len1}}\\right)$ e $h(t) = \\text{rect}\\left(\\frac{t - ${len2/2}}{${len2}}\\right)$ dois pulsos retangulares de durações $T_1 = ${len1}\\text{ s}$ e $T_2 = ${len2}\\text{ s}$. Qual é o formato geométrico e a duração total da saída $y(t) = x(t) * h(t)$?`,
          guidedHint: 'A convolução de dois pulsos retangulares de durações desiguais resulta em um sinal trapezoidal com duração total igual à soma $T_1 + T_2$. Se as durações fossem iguais, resultaria em um triângulo.',
          interpretationGuide: {
            objective: 'Determinar a forma de onda resultante e a largura do suporte temporal da convolução.',
            givenData: [
              { label: 'Duração T_1', value: `${len1} \\text{ s}` },
              { label: 'Duração T_2', value: `${len2} \\text{ s}` },
            ],
            strategy: [
              `1. Duração total do sinal de saída: $T_y = T_1 + T_2 = ${len1} + ${len2} = ${totalLen}\\text{ s}$.`,
              `2. Como $T_1 \\neq T_2$ (ou $T_1 = T_2$), a convolução possui subida linear, patamar horizontal de largura $|T_1 - T_2| = ${Math.abs(len1-len2)}\\text{ s}$ e descida linear: formato **${len1 === len2 ? 'Triangular' : 'Trapezoidal'}**.`,
            ],
          },
          formulaGuide: {
            title: 'Propriedade de Suporte da Convolução',
            formulaLatex: '\\text{Suporte}(x * h) = T_1 + T_2, \\quad \\text{Largura do Patamar} = |T_1 - T_2|',
            howToApply: `Some as durações $T_1 = ${len1}$ e $T_2 = ${len2}$.`,
          },
          options: [
            {
              text: `${len1 === len2 ? 'Triângulo' : 'Trapézio'} com duração total de $T_y = ${totalLen}\\text{ s}$`,
              isCorrect: true,
              explanation: `Correto! A convolução soma as durações ($${len1} + ${len2} = ${totalLen}\\text{ s}$) e gera um perfil ${len1 === len2 ? 'triangular' : 'trapezoidal'}.`
            },
            {
              text: `Pulso retangular com duração de $T_y = ${Math.max(len1, len2)}\\text{ s}$`,
              isCorrect: false,
              explanation: 'A convolução de retângulos gera rampas contínuas durante a entrada e saída gradual das áreas, nunca um retângulo abrupto.'
            },
            {
              text: `Trapézio com duração total de $T_y = ${Math.abs(len1 - len2)}\\text{ s}$`,
              isCorrect: false,
              explanation: 'A diferença $|T_1 - T_2|$ é apenas a largura do topo constante do trapézio, não a base total.'
            },
            {
              text: `Impulso de Dirac com área de $${len1 * len2}$`,
              isCorrect: false,
              explanation: 'Convolução de funções contínuas limitadas produz funções estritamente contínuas e suaves, não impulsos.'
            }
          ],
          stepByStepSolution: `1. Suporte temporal do sinal 1: $T_1 = ${len1}\\text{ s}$.\n2. Suporte do sinal 2: $T_2 = ${len2}\\text{ s}$.\n3. Suporte total: $T_y = T_1 + T_2 = ${len1} + ${len2} = ${totalLen}\\text{ s}$.\n4. Formato: ${len1 === len2 ? 'Triângulo perfeito' : 'Trapézio com patamar de ' + Math.abs(len1-len2) + ' s'}.`
        });
      } else {
        // Avançado Cap 1: Amostragem de Nyquist, Aliasing, Autofunções
        const fmax = (i % 6) * 50 + 100;
        const nyquist = 2 * fmax;
        const fsSample = nyquist - 20;

        mcProblems.push({
          id,
          title: `Questão ${i} (Avançado - Cap 1): Teorema da Amostragem de Nyquist e Aliasing`,
          chapter: 1,
          chapterName: 'Capítulo 1 – Sinais & Sistemas',
          category: 'signals',
          difficulty: diff,
          xpReward: xp,
          statement: `Um sinal contínuo possui largura de banda de $B = ${fmax}\\text{ Hz}$. Se o sinal for amostrado a uma taxa de $f_s = ${fsSample}\\text{ Hz}$, haverá aliasing (falseamento espectral)? Qual é a taxa mínima de amostragem de Nyquist estrita?`,
          guidedHint: `O Teorema de Nyquist-Shannon exige que a frequência de amostragem seja estritamente superior ao dobro da frequência máxima: $f_s \\ge 2 f_{max}$.`,
          interpretationGuide: {
            objective: 'Identificar a condição de reconstrução sem distorção e diagnosticar fenômeno de aliasing.',
            givenData: [
              { label: 'Frequência Máxima f_{max}', value: `${fmax} \\text{ Hz}` },
              { label: 'Taxa de Amostragem f_s', value: `${fsSample} \\text{ Hz}` },
            ],
            strategy: [
              `1. Calcular a taxa de Nyquist teórica: $f_{Nyquist} = 2 f_{max} = 2 \\times ${fmax} = ${nyquist}\\text{ Hz}$.`,
              `2. Comparar com $f_s = ${fsSample}\\text{ Hz}$.`,
              `3. Como $f_s < ${nyquist}\\text{ Hz}$, ocorre sobreposição das réplicas espectrais (Aliasing).`,
            ],
          },
          formulaGuide: {
            title: 'Critério de Nyquist-Shannon',
            formulaLatex: 'f_s \\ge 2 f_{max} = \\omega_s \\ge 2\\omega_{max}',
            howToApply: `Calcule $2 \\times ${fmax} = ${nyquist}\\text{ Hz}$ e compare com $f_s$.`,
          },
          options: [
            {
              text: `Sim, haverá aliasing pois $f_s = ${fsSample}\\text{ Hz} < ${nyquist}\\text{ Hz}$ (Taxa de Nyquist: $f_N = ${nyquist}\\text{ Hz}$)`,
              isCorrect: true,
              explanation: `Correto! Para reconstrução perfeita sem sobreposição espectral, $f_s$ deveria ser no mínimo $2 \\times ${fmax} = ${nyquist}\\text{ Hz}$.`
            },
            {
              text: `Não haverá aliasing, pois $f_s > ${fmax}\\text{ Hz}$`,
              isCorrect: false,
              explanation: `Incorreto. A condição de amostragem exige o dobro da frequência máxima ($2 f_{max}$), não apenas $f_{max}$.`
            },
            {
              text: `Taxa de Nyquist é de $${fmax / 2}\\text{ Hz}$, logo a amostragem está superdimensionada`,
              isCorrect: false,
              explanation: 'A taxa de Nyquist é o dobro da largura de banda, nunca a metade.'
            },
            {
              text: 'O sinal se torna discreto no tempo e na amplitude sem perda espectral',
              isCorrect: false,
              explanation: 'A amostragem abaixo da taxa de Nyquist corrompe irreversivelmente as altas frequências do sinal contínuo original.'
            }
          ],
          stepByStepSolution: `1. Frequência máxima: $f_{max} = ${fmax}\\text{ Hz}$.\n2. Taxa de Nyquist: $f_{Nyquist} = 2 f_{max} = ${nyquist}\\text{ Hz}$.\n3. Como $f_s = ${fsSample}\\text{ Hz} < ${nyquist}\\text{ Hz}$, as réplicas espectrais se sobrepõem, gerando **Aliasing irreversível**.`
        });
      }
    }
  }

  // ==================================================================================================
  // CHAPTER 2: ANÁLISE DE FOURIER (100 Iniciante, 100 Intermediário, 100 Avançado)
  // ==================================================================================================
  for (const diff of levels) {
    const xp = diff === 'Iniciante' ? 30 : diff === 'Intermediário' ? 45 : 60;

    for (let i = 1; i <= 100; i++) {
      const id = `mc-ch2-${diff.toLowerCase().substring(0, 3)}-${i}`;
      const k = (i % 5) + 1;
      const w0 = (i % 6) + 2;
      const T0_str = (2 * Math.PI / w0).toFixed(2);

      if (diff === 'Iniciante') {
        mcProblems.push({
          id,
          title: `Questão ${i} (Iniciante - Cap 2): Período Fundamental e Harmônicos de Fourier`,
          chapter: 2,
          chapterName: 'Capítulo 2 – Análise de Fourier',
          category: 'fourier',
          difficulty: diff,
          xpReward: xp,
          statement: `Determine a frequência angular fundamental $\\omega_0$ e o período fundamental $T_0$ do sinal $x(t) = 3\\cos(${w0}\\pi t) + 2\\sin(${2 * w0}\\pi t)$.`,
          guidedHint: `O período fundamental é determinado pelo MDC das frequências angulares: $\\omega_0 = \\text{MDC}(${w0}\\pi, ${2 * w0}\\pi) = ${w0}\\pi\\text{ rad/s}$. Use $T_0 = \\frac{2\\pi}{\\omega_0}$.`,
          interpretationGuide: {
            objective: 'Determinar a frequência angular e o período fundamental de uma soma de senoides harmônicas.',
            givenData: [
              { label: 'Harmônico 1', value: `\\omega_1 = ${w0}\\pi \\text{ rad/s}` },
              { label: 'Harmônico 2', value: `\\omega_2 = ${2 * w0}\\pi \\text{ rad/s}` },
            ],
            strategy: [
              `1. A frequência fundamental $\\omega_0$ é o maior divisor comum entre as frequências presentes: $\\omega_0 = ${w0}\\pi\\text{ rad/s}$.`,
              `2. Período: $T_0 = \\frac{2\\pi}{\\omega_0} = \\frac{2\\pi}{${w0}\\pi} = \\frac{2}{${w0}}\\text{ s}$.`,
            ],
          },
          formulaGuide: {
            title: 'Relação Período-Frequência Fundamental',
            formulaLatex: 'T_0 = \\frac{2\\pi}{\\omega_0}, \\quad \\omega_k = k\\omega_0',
            howToApply: `Substitua $\\omega_0 = ${w0}\\pi$.`,
          },
          options: [
            {
              text: `$$\\omega_0 = ${w0}\\pi\\text{ rad/s}, \\quad T_0 = \\frac{2}{${w0}}\\text{ s}$$`,
              isCorrect: true,
              explanation: `Correto! $\\omega_0 = ${w0}\\pi\\text{ rad/s}$ é a frequência base e $T_0 = \\frac{2\\pi}{${w0}\\pi} = \\frac{2}{${w0}}\\text{ s}$.`
            },
            {
              text: `$$\\omega_0 = ${2 * w0}\\pi\\text{ rad/s}, \\quad T_0 = \\frac{1}{${w0}}\\text{ s}$$`,
              isCorrect: false,
              explanation: `Isso é o segundo harmônico ($2\\omega_0$), não a frequência fundamental.`
            },
            {
              text: `$$\\omega_0 = ${w0}\\text{ rad/s}, \\quad T_0 = 2\\pi\\text{ s}$$`,
              isCorrect: false,
              explanation: 'Faltou o fator $\\pi$ presente no argumento das funções trigonométricas.'
            },
            {
              text: 'O sinal não é periódico',
              isCorrect: false,
              explanation: 'A razão entre as frequências é $\\frac{2\\pi w_0}{\\pi w_0} = 2$ (um número racional), logo o sinal é estritamente periódico.'
            }
          ],
          stepByStepSolution: `1. $\\omega_1 = ${w0}\\pi$ e $\\omega_2 = ${2*w0}\\pi = 2\\omega_1$.\n2. Frequência fundamental: $\\omega_0 = ${w0}\\pi\\text{ rad/s}$.\n3. Período fundamental: $T_0 = \\frac{2\\pi}{\\omega_0} = \\frac{2\\pi}{${w0}\\pi} = \\frac{2}{${w0}}\\text{ s}$.`
        });
      } else if (diff === 'Intermediário') {
        const aVal = (i % 4) + 1;
        mcProblems.push({
          id,
          title: `Questão ${i} (Intermediário - Cap 2): Propriedade da Diferenciação no Tempo (Fourier)`,
          chapter: 2,
          chapterName: 'Capítulo 2 – Análise de Fourier',
          category: 'fourier',
          difficulty: diff,
          xpReward: xp,
          statement: `Se $f(t) \\leftrightarrow F(\\omega)$, qual é a Transformada de Fourier da segunda derivada $g(t) = \\frac{d^2 f(t)}{dt^2}$?`,
          guidedHint: 'Pela propriedade da diferenciação no domínio do tempo: $\\mathcal{F}\\left\\{\\frac{d^n f(t)}{dt^n}\\right\\} = (j\\omega)^n F(\\omega)$. Lembre-se que $j^2 = -1$.',
          interpretationGuide: {
            objective: 'Aplicar a propriedade de diferenciação temporal da Transformada de Fourier.',
            givenData: [
              { label: 'Par Base', value: 'f(t) \\leftrightarrow F(\\omega)' },
              { label: 'Ordem de Derivação', value: 'n = 2' },
            ],
            strategy: [
              '1. Cada diferenciação no tempo equivale à multiplicação por $j\\omega$ no domínio da frequência.',
              '2. Para a segunda derivada: $(j\\omega)^2 F(\\omega) = j^2 \\omega^2 F(\\omega) = -\\omega^2 F(\\omega)$.',
            ],
          },
          formulaGuide: {
            title: 'Propriedade da Diferenciação Temporal de Fourier',
            formulaLatex: '\\mathcal{F}\\left\\{ \\frac{d^n f(t)}{dt^n} \\right\\} = (j\\omega)^n F(\\omega)',
            howToApply: 'Eleve $j\\omega$ à potência $n=2$, resultando em $-\\omega^2$.',
          },
          options: [
            {
              text: `$$G(\\omega) = -\\omega^2 F(\\omega)$$`,
              isCorrect: true,
              explanation: `Exato! $(j\\omega)^2 = j^2 \\omega^2 = -\\omega^2$, portanto $G(\\omega) = -\\omega^2 F(\\omega)$.`
            },
            {
              text: `$$G(\\omega) = j\\omega^2 F(\\omega)$$`,
              isCorrect: false,
              explanation: 'Incorreto. $j^2 = -1$ (número real negativo), sem a unidade imaginária $j$ no resultado final.'
            },
            {
              text: `$$G(\\omega) = \\frac{F(\\omega)}{-\\omega^2}$$`,
              isCorrect: false,
              explanation: 'A divisão por $j\\omega$ corresponde à operação de integração, não de derivação.'
            },
            {
              text: `$$G(\\omega) = \\omega^2 F(\\omega)$$`,
              isCorrect: false,
              explanation: 'Faltou o sinal negativo decorrente de $j^2 = -1$.'
            }
          ],
          stepByStepSolution: `1. $\\mathcal{F}\\left\\{ \\frac{df}{dt} \\right\\} = j\\omega F(\\omega)$.\n2. $\\mathcal{F}\\left\\{ \\frac{d^2 f}{dt^2} \\right\\} = (j\\omega)^2 F(\\omega) = j^2 \\omega^2 F(\\omega) = -\\omega^2 F(\\omega)$.`
        });
      } else {
        // Avançado: Teorema de Parseval / Densidade Espectral
        const aParam = (i % 3) + 2;
        mcProblems.push({
          id,
          title: `Questão ${i} (Avançado - Cap 2): Teorema de Parseval e Densidade Espectral`,
          chapter: 2,
          chapterName: 'Capítulo 2 – Análise de Fourier',
          category: 'fourier',
          difficulty: diff,
          xpReward: xp,
          statement: `Calcule a energia total do sinal $x(t) = e^{-${aParam}|t|}$ integrando sua Densidade Espectral de Energia $S_{xx}(\omega) = |X(\\omega)|^2 = \\left(\\frac{2\\cdot ${aParam}}{${aParam*aParam} + \\omega^2}\\right)^2$.`,
          guidedHint: `Usando o domínio do tempo por Parseval: $E = \\int_{-\\infty}^\\infty (e^{-${aParam}|t|})^2 dt = 2\\int_0^\\infty e^{-${2*aParam}t} dt = \\frac{1}{${aParam}}\\text{ J}$.`,
          interpretationGuide: {
            objective: 'Calcular a energia contida no sinal usando o Teorema de Parseval.',
            givenData: [
              { label: 'Sinal Exponencial Bilateral', value: `x(t) = e^{-${aParam}|t|}` },
              { label: 'Constante \\alpha', value: `${aParam}` },
            ],
            strategy: [
              `1. Devido à simetria par: $E = \\int_{-\\infty}^\\infty e^{-2\\cdot ${aParam}|t|} dt = 2 \\int_0^\\infty e^{-${2*aParam}t} dt$.`,
              `2. Resolvendo a integral: $2 \\left[ -\\frac{e^{-${2*aParam}t}}{${2*aParam}} \\right]_0^\\infty = 2 \\left( 0 - \\left(-\\frac{1}{${2*aParam}}\\right) \\right) = \\frac{2}{${2*aParam}} = \\frac{1}{${aParam}}\\text{ J}$.`,
            ],
          },
          formulaGuide: {
            title: 'Teorema de Parseval / Rayleigh',
            formulaLatex: 'E = \\int_{-\\infty}^{\\infty} |x(t)|^2 dt = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} |X(\\omega)|^2 d\\omega',
            howToApply: `Calcule no tempo: $2 \\int_0^\\infty e^{-2at}dt = \\frac{1}{a}$.`,
          },
          options: [
            {
              text: `$$E = \\frac{1}{${aParam}}\\text{ Joules}$$`,
              isCorrect: true,
              explanation: `Correto! Pelo Teorema de Parseval, $E = 2\\int_0^\\infty e^{-${2*aParam}t}dt = \\frac{2}{${2*aParam}} = \\frac{1}{${aParam}}$ J.`
            },
            {
              text: `$$E = \\frac{1}{${2*aParam}}\\text{ Joules}$$`,
              isCorrect: false,
              explanation: 'Esse seria o valor para uma exponencial unilateral $e^{-at}u(t)$. Para a exponencial bilateral, multiplica-se por 2.'
            },
            {
              text: `$$E = \\frac{2}{${aParam*aParam}}\\text{ Joules}$$`,
              isCorrect: false,
              explanation: 'Incorreto. A integração resulta em $\\frac{1}{a}$, não no inverso do quadrado.'
            },
            {
              text: `$$E = \\infty\\text{ (Sinal Divergente)}$$`,
              isCorrect: false,
              explanation: 'A função decresce exponencialmente em ambas as direções ($t \\to \\pm\\infty$), portanto possui energia estritamente finita.'
            }
          ],
          stepByStepSolution: `1. $E = \\int_{-\\infty}^\\infty |e^{-${aParam}|t|}|^2 dt = 2\\int_0^\\infty e^{-${2*aParam}t} dt$.\n2. Resolvendo: $2 \\cdot \\left( \\frac{1}{${2*aParam}} \\right) = \\frac{1}{${aParam}}\\text{ J}$.\n3. Resposta: $E = \\frac{1}{${aParam}}\\text{ Joules}$.`
        });
      }
    }
  }

  // ==================================================================================================
  // CHAPTER 3: TRANSFORMAÇÃO DE LAPLACE (100 Iniciante, 100 Intermediário, 100 Avançado)
  // ==================================================================================================
  for (const diff of levels) {
    const xp = diff === 'Iniciante' ? 30 : diff === 'Intermediário' ? 45 : 60;

    for (let i = 1; i <= 100; i++) {
      const id = `mc-ch3-${diff.toLowerCase().substring(0, 3)}-${i}`;
      const p = (i % 5) + 1;
      const kVal = (i % 4) + 2;

      if (diff === 'Iniciante') {
        mcProblems.push({
          id,
          title: `Questão ${i} (Iniciante - Cap 3): Par Básico da Transformada de Laplace`,
          chapter: 3,
          chapterName: 'Capítulo 3 – Transformação de Laplace',
          category: 'laplace',
          difficulty: diff,
          xpReward: xp,
          statement: `Determine a Transformada Unilateral de Laplace de $f(t) = ${kVal}t e^{-${p}t}u(t)$.`,
          guidedHint: `Use a tabela de transformadas: $\\mathcal{L}\\{t^n e^{-at}u(t)\\} = \\frac{n!}{(s+a)^{n+1}}$. Para $n=1$, temos $\\frac{1}{(s+a)^2}$.`,
          interpretationGuide: {
            objective: 'Calcular a transformada de Laplace de uma rampa com amortecimento exponencial.',
            givenData: [
              { label: 'Função no Tempo', value: `f(t) = ${kVal}t e^{-${p}t}u(t)` },
              { label: 'Decaimento a', value: `${p}` },
              { label: 'Ganho k', value: `${kVal}` },
            ],
            strategy: [
              `1. Par fundamental da rampa exponencial: $\\mathcal{L}\\{t e^{-${p}t}\\} = \\frac{1}{(s + ${p})^2}$.`,
              `2. Pela linearidade, multiplicar pelo fator ${kVal}: $F(s) = \\frac{${kVal}}{(s + ${p})^2}$.`,
            ],
          },
          formulaGuide: {
            title: 'Par da Rampa Exponencial em Laplace',
            formulaLatex: '\\mathcal{L}\\{t^n e^{-at}u(t)\\} = \\frac{n!}{(s + a)^{n+1}}',
            howToApply: `Substitua $n = 1$, $a = ${p}$ e multiplique por ${kVal}.`,
          },
          options: [
            {
              text: `$$F(s) = \\frac{${kVal}}{(s + ${p})^2}$$`,
              isCorrect: true,
              explanation: `Correto! A multiplicação por $t$ eleva a potência do polo no denominador para 2: $\\frac{${kVal}}{(s + ${p})^2}$.`
            },
            {
              text: `$$F(s) = \\frac{${kVal}}{s + ${p}}$$`,
              isCorrect: false,
              explanation: 'Isso corresponderia à exponencial pura sem o fator $t$ multiplicativo.'
            },
            {
              text: `$$F(s) = \\frac{${kVal}}{(s - ${p})^2}$$`,
              isCorrect: false,
              explanation: 'O sinal do polo deve ser oposto ao do expoente ($e^{-at} \\to s + a$).'
            },
            {
              text: `$$F(s) = \\frac{${kVal}s}{(s + ${p})^2}$$`,
              isCorrect: false,
              explanation: 'A presença de $s$ no numerador representaria uma derivada no tempo, o que não ocorre na rampa exponencial.'
            }
          ],
          stepByStepSolution: `1. $\\mathcal{L}\\{t\\} = \\frac{1}{s^2}$.\n2. Pelo deslocamento em frequência: $\\mathcal{L}\\{e^{-${p}t}t\\} = \\frac{1}{(s+${p})^2}$.\n3. Multiplicando por ${kVal}: $F(s) = \\frac{${kVal}}{(s+${p})^2}$.`
        });
      } else if (diff === 'Intermediário') {
        const p1 = (i % 3) + 1;
        const p2 = p1 + (i % 3) + 2;
        const num = p2 - p1;

        mcProblems.push({
          id,
          title: `Questão ${i} (Intermediário - Cap 3): Frações Parciais e Resposta Temporal`,
          chapter: 3,
          chapterName: 'Capítulo 3 – Transformação de Laplace',
          category: 'laplace',
          difficulty: diff,
          xpReward: xp,
          statement: `Determine a inversa de Laplace $f(t) = \\mathcal{L}^{-1}\\{F(s)\\}$ para $F(s) = \\frac{${num}}{(s + ${p1})(s + ${p2})}$.`,
          guidedHint: `Expansão em frações parciais: $F(s) = \\frac{A}{s+${p1}} + \\frac{B}{s+${p2}}$. Resíduo $A = \\left.\\frac{${num}}{s+${p2}}\\right|_{s=-${p1}} = \\frac{${num}}{${p2}-${p1}} = 1$.`,
          interpretationGuide: {
            objective: 'Calcular a resposta no tempo a partir da decomposição em frações parciais de dois polos reais.',
            givenData: [
              { label: 'Transformada F(s)', value: `\\frac{${num}}{(s+${p1})(s+${p2})}` },
              { label: 'Polos', value: `s = -${p1} \\text{ e } s = -${p2}` },
            ],
            strategy: [
              `1. Resíduo em $s = -${p1}$: $A = \\frac{${num}}{-${p1} + ${p2}} = 1$.`,
              `2. Resíduo em $s = -${p2}$: $B = \\frac{${num}}{-${p2} + ${p1}} = -1$.`,
              `3. Inversão termo a termo: $f(t) = (e^{-${p1}t} - e^{-${p2}t})u(t)$.`,
            ],
          },
          formulaGuide: {
            title: 'Método dos Resíduos de Heaviside',
            formulaLatex: 'A_k = \\lim_{s \\to p_k} (s - p_k) F(s)',
            howToApply: `Calcule os resíduos $A$ e $B$ e aplique $\\mathcal{L}^{-1}\\{1/(s+a)\\} = e^{-at}u(t)$.`,
          },
          options: [
            {
              text: `$$f(t) = (e^{-${p1}t} - e^{-${p2}t})u(t)$$`,
              isCorrect: true,
              explanation: `Correto! Os resíduos calculados são $A = 1$ e $B = -1$, resultando em $(e^{-${p1}t} - e^{-${p2}t})u(t)$.`
            },
            {
              text: `$$f(t) = (e^{-${p1}t} + e^{-${p2}t})u(t)$$`,
              isCorrect: false,
              explanation: 'O resíduo do segundo polo é estritamente negativo ($B = -1$).'
            },
            {
              text: `$$f(t) = ${num}t e^{-${p1}t}u(t)$$`,
              isCorrect: false,
              explanation: 'Polos reais distintos não produzem termos multiplicados por $t$.'
            },
            {
              text: `$$f(t) = (e^{+${p1}t} - e^{+${p2}t})u(t)$$`,
              isCorrect: false,
              explanation: 'Polos no semiplano esquerdo geram exponenciais decrescentes ($e^{-at}$).'
            }
          ],
          stepByStepSolution: `1. $F(s) = \\frac{1}{s+${p1}} - \\frac{1}{s+${p2}}$.\n2. Aplicando a transformada inversa termo a termo:\n   $$f(t) = \\mathcal{L}^{-1}\\left\\{\\frac{1}{s+${p1}}\\right\\} - \\mathcal{L}^{-1}\\left\\{\\frac{1}{s+${p2}}\\right\\} = (e^{-${p1}t} - e^{-${p2}t})u(t)$$`
        });
      } else {
        // Avançado: Teorema do Valor Inicial e Final
        const a1 = (i % 3) + 1;
        const a2 = (i % 3) + 3;
        const numVal = a1 * a2 * 5;

        mcProblems.push({
          id,
          title: `Questão ${i} (Avançado - Cap 3): Teorema do Valor Inicial e Final de Laplace`,
          chapter: 3,
          chapterName: 'Capítulo 3 – Transformação de Laplace',
          category: 'laplace',
          difficulty: diff,
          xpReward: xp,
          statement: `Para a resposta ao degrau $Y(s) = \\frac{${numVal}}{s(s + ${a1})(s + ${a2})}$, calcule os valores assintóticos $y(0^+) = \\lim_{t \\to 0^+} y(t)$ e $y(\\infty) = \\lim_{t \\to \\infty} y(t)$.`,
          guidedHint: `TVI: $y(0^+) = \\lim_{s \\to \\infty} sY(s)$. TVF: $y(\\infty) = \\lim_{s \\to 0} sY(s)$.`,
          interpretationGuide: {
            objective: 'Calcular o valor no instante inicial e o regime permanente sem inverter $Y(s)$ completamente.',
            givenData: [
              { label: 'Transformada Y(s)', value: `\\frac{${numVal}}{s(s+${a1})(s+${a2})}` },
            ],
            strategy: [
              `1. TVI: $y(0^+) = \\lim_{s\\to\\infty} \\frac{${numVal}}{(s+${a1})(s+${a2})} = \\frac{${numVal}}{\\infty} = 0$.`,
              `2. TVF: $y(\\infty) = \\lim_{s\\to 0} \\frac{${numVal}}{(s+${a1})(s+${a2})} = \\frac{${numVal}}{${a1}\\cdot ${a2}} = \\frac{${numVal}}{${a1*a2}} = 5$.`,
            ],
          },
          formulaGuide: {
            title: 'Teoremas do Valor Inicial e Final (TVI e TVF)',
            formulaLatex: 'y(0^+) = \\lim_{s \\to \\infty} s Y(s), \\quad y(\\infty) = \\lim_{s \\to 0} s Y(s)',
            howToApply: 'Multiplique $Y(s)$ por $s$ e calcule os limites com $s \\to \\infty$ e $s \\to 0$.',
          },
          options: [
            {
              text: `$$y(0^+) = 0, \\quad y(\\infty) = 5$$`,
              isCorrect: true,
              explanation: `Correto! No infinito $sY(s) \\to 0$, e em zero $sY(s) = \\frac{${numVal}}{${a1 * a2}} = 5$.`
            },
            {
              text: `$$y(0^+) = 5, \\quad y(\\infty) = 0$$`,
              isCorrect: false,
              explanation: 'Os valores estão invertidos entre a resposta instantânea e o regime permanente.'
            },
            {
              text: `$$y(0^+) = ${numVal}, \\quad y(\\infty) = \\infty$$`,
              isCorrect: false,
              explanation: 'O grau do denominador é maior que o numerador, logo o TVI resulta em zero, e todos os polos são estáveis no SPE.'
            },
            {
              text: 'TVF não pode ser aplicado pois há um polo na origem',
              isCorrect: false,
              explanation: 'O polo $s=0$ é cancelado pelo produto $sY(s)$ e provém da entrada degrau $1/s$. Os polos do sistema ($s=-a_1, -a_2$) estão estritamente no SPE, validando o TVF.'
            }
          ],
          stepByStepSolution: `1. $y(0^+) = \\lim_{s\\to\\infty} sY(s) = \\lim_{s\\to\\infty} \\frac{${numVal}}{(s+${a1})(s+${a2})} = 0$.\n2. $y(\\infty) = \\lim_{s\\to 0} sY(s) = \\lim_{s\\to 0} \\frac{${numVal}}{(s+${a1})(s+${a2})} = \\frac{${numVal}}{${a1}\\times ${a2}} = 5$.`
        });
      }
    }
  }

  // ==================================================================================================
  // CHAPTER 4: EQUAÇÕES DIFERENCIAIS ORDINÁRIAS - EDOs (100 Iniciante, 100 Intermediário, 100 Avançado)
  // ==================================================================================================
  for (const diff of levels) {
    const xp = diff === 'Iniciante' ? 25 : diff === 'Intermediário' ? 45 : 60;

    for (let i = 1; i <= 100; i++) {
      const id = `mc-ch4-${diff.toLowerCase().substring(0, 3)}-${i}`;
      const a = (i % 4) + 2;
      const b = (i % 5) + 3;
      const y0 = (i % 3) + 1;

      if (diff === 'Iniciante') {
        mcProblems.push({
          id,
          title: `Questão ${i} (Iniciante - Cap 4): Resposta Homogênea (ZIR) de EDO de 1ª Ordem`,
          chapter: 4,
          chapterName: 'Capítulo 4 – Equações Diferenciais (EDOs)',
          category: 'differential_equations',
          difficulty: diff,
          xpReward: xp,
          statement: `Encontre a resposta à entrada nula (solução homogênea) da equação diferencial ordinária de 1ª ordem:\n\n$$\\frac{dy(t)}{dt} + ${a}y(t) = 0, \\quad \\text{com } y(0) = ${y0}$$`,
          guidedHint: `A equação característica associada é $s + ${a} = 0 \\implies s = -${a}$. A solução homogênea é $y_h(t) = y(0)e^{st}$.`,
          interpretationGuide: {
            objective: 'Determinar a resposta natural do sistema de 1ª ordem sem excitação externa.',
            givenData: [
              { label: 'EDO', value: `y'(t) + ${a}y(t) = 0` },
              { label: 'Condição Inicial', value: `y(0) = ${y0}` },
            ],
            strategy: [
              `1. Aplicar Laplace: $sY(s) - y(0) + ${a}Y(s) = 0$.`,
              `2. $(s + ${a})Y(s) = ${y0} \\implies Y(s) = \\frac{${y0}}{s + ${a}}$.`,
              `3. Invertendo: $y(t) = ${y0}e^{-${a}t}u(t)$.`,
            ],
          },
          formulaGuide: {
            title: 'Resposta Homogênea de 1ª Ordem',
            formulaLatex: 'y\'(t) + a y(t) = 0 \\implies y(t) = y(0) e^{-at} u(t)',
            howToApply: `Substitua $a = ${a}$ e $y(0) = ${y0}$.`,
          },
          options: [
            {
              text: `$$y(t) = ${y0}e^{-${a}t}u(t)$$`,
              isCorrect: true,
              explanation: `Correto! O polo característico é $s = -${a}$, fornecendo o decaimento $e^{-${a}t}$ escalado pela condição inicial $y(0) = ${y0}$.`
            },
            {
              text: `$$y(t) = ${y0}e^{+${a}t}u(t)$$`,
              isCorrect: false,
              explanation: 'O expoente deve ser negativo (polo em $s = -a$), garantindo estabilidade.'
            },
            {
              text: `$$y(t) = ${a}e^{-${y0}t}u(t)$$`,
              isCorrect: false,
              explanation: 'A constante da EDO e a condição inicial foram trocadas de posição.'
            },
            {
              text: `$$y(t) = ${y0}(1 - e^{-${a}t})u(t)$$`,
              isCorrect: false,
              explanation: 'Isso é a resposta ao degrau com condição inicial nula, não a resposta natural homogênea.'
            }
          ],
          stepByStepSolution: `1. $sY(s) - ${y0} + ${a}Y(s) = 0 \\implies Y(s) = \\frac{${y0}}{s+${a}}$.\n2. Invertendo: $y(t) = ${y0}e^{-${a}t}u(t)$.`
        });
      } else if (diff === 'Intermediário') {
        const wn = (i % 4) + 2;
        const wn2 = wn * wn;

        mcProblems.push({
          id,
          title: `Questão ${i} (Intermediário - Cap 4): Classificação de Amortecimento em EDO de 2ª Ordem`,
          chapter: 4,
          chapterName: 'Capítulo 4 – Equações Diferenciais (EDOs)',
          category: 'differential_equations',
          difficulty: diff,
          xpReward: xp,
          statement: `Analise a equação diferencial de 2ª ordem $\\frac{d^2 y}{dt^2} + ${2 * wn}\\frac{dy}{dt} + ${wn2}y(t) = x(t)$. Qual é a frequência natural $\\omega_n$, o fator de amortecimento $\\zeta$ e o regime de resposta?`,
          guidedHint: `Forma canônica: $s^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0$. Compare os coeficientes: $\\omega_n^2 = ${wn2} \\implies \\omega_n = ${wn}$. Depois $2\\zeta\\omega_n = ${2*wn} \\implies \\zeta = 1$.`,
          interpretationGuide: {
            objective: 'Extrair os parâmetros canônicos de 2ª ordem e classificar o amortecimento.',
            givenData: [
              { label: 'Coeficiente de y', value: `\\omega_n^2 = ${wn2}` },
              { label: 'Coeficiente de y\'', value: `2\\zeta\\omega_n = ${2*wn}` },
            ],
            strategy: [
              `1. $\\omega_n = \\sqrt{${wn2}} = ${wn}\\text{ rad/s}$.`,
              `2. $2\\zeta(${wn}) = ${2*wn} \\implies \\zeta = 1$.`,
              `3. Para $\\zeta = 1$, o sistema possui raiz real dupla em $s = -${wn}$ e é classificado como **Criticamente Amortecido**.`,
            ],
          },
          formulaGuide: {
            title: 'Equação Característica Canônica de 2ª Ordem',
            formulaLatex: 's^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0, \\quad \\zeta = 1 \\implies \\text{Criticamente Amortecido}',
            howToApply: `Compare os termos com $2\\zeta\\omega_n$ e $\\omega_n^2$.`,
          },
          options: [
            {
              text: `$$\\omega_n = ${wn}\\text{ rad/s}, \\quad \\zeta = 1 \\quad (\\text{Criticamente Amortecido})$$`,
              isCorrect: true,
              explanation: `Correto! $\\omega_n = ${wn}$ e $\\zeta = 1$, caracterizando polo real duplo em $s = -${wn}$ (resposta mais rápida sem oscilação).`
            },
            {
              text: `$$\\omega_n = ${wn2}\\text{ rad/s}, \\quad \\zeta = 0.5 \\quad (\\text{Subamortecido})$$`,
              isCorrect: false,
              explanation: `A frequência natural é a raiz quadrada de ${wn2} ($\\omega_n = ${wn}$), não ${wn2}.`
            },
            {
              text: `$$\\omega_n = ${wn}\\text{ rad/s}, \\quad \\zeta = 2 \\quad (\\text{Superamortecido})$$`,
              isCorrect: false,
              explanation: 'Com o coeficiente do meio igual a ' + (2*wn) + ', $\\zeta$ vale exatamente 1.'
            },
            {
              text: `$$\\omega_n = ${wn}\\text{ rad/s}, \\quad \\zeta = 0 \\quad (\\text{Não Amortecido / Oscilatório})$$`,
              isCorrect: false,
              explanation: 'Para $\\zeta = 0$, não haveria termo de primeira derivada ($y\'(t)$).'
            }
          ],
          stepByStepSolution: `1. Da equação $s^2 + ${2*wn}s + ${wn2} = 0$, temos $\\omega_n^2 = ${wn2} \\implies \\omega_n = ${wn}\\text{ rad/s}$.\n2. $2\\zeta\\omega_n = ${2*wn} \\implies 2\\zeta(${wn}) = ${2*wn} \\implies \\zeta = 1$.\n3. Regime: **Criticamente Amortecido**.`
        });
      } else {
        // Avançado: Espaço de Estados e Matriz de Transição
        const lambda1 = (i % 3) + 1;
        const lambda2 = (i % 3) + 4;

        mcProblems.push({
          id,
          title: `Questão ${i} (Avançado - Cap 4): Autovalores da Matriz de Estados e Polos da EDO`,
          chapter: 4,
          chapterName: 'Capítulo 4 – Equações Diferenciais (EDOs)',
          category: 'differential_equations',
          difficulty: diff,
          xpReward: xp,
          statement: `Considere a representação em variáveis de estado $\\dot{\\mathbf{x}}(t) = \\begin{bmatrix} 0 & 1 \\\\ -${lambda1 * lambda2} & -${lambda1 + lambda2} \\end{bmatrix}\\mathbf{x}(t) + \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}u(t)$. Quais são os autovalores da matriz dinâmica $\\mathbf{A}$ e a estabilidade assintótica do sistema?`,
          guidedHint: `Calcule a equação característica $\\det(s\\mathbf{I} - \\mathbf{A}) = 0$. Desenvolva: $s(s + ${lambda1+lambda2}) + ${lambda1*lambda2} = (s + ${lambda1})(s + ${lambda2}) = 0$.`,
          interpretationGuide: {
            objective: 'Determinar os polos do sistema a partir do polinômio característico da matriz de estados.',
            givenData: [
              { label: 'Matriz A', value: `\\begin{bmatrix} 0 & 1 \\\\ -${lambda1*lambda2} & -${lambda1+lambda2} \\end{bmatrix}` },
            ],
            strategy: [
              `1. $\\det(s\\mathbf{I} - \\mathbf{A}) = \\det\\begin{bmatrix} s & -1 \\\\ ${lambda1*lambda2} & s + ${lambda1+lambda2} \\end{bmatrix} = s(s + ${lambda1+lambda2}) + ${lambda1*lambda2}$.`,
              `2. Fatorando: $s^2 + (${lambda1}+${lambda2})s + ${lambda1*lambda2} = (s + ${lambda1})(s + ${lambda2}) = 0$.`,
              `3. Autovalores: $\\lambda_1 = -${lambda1}$ e $\\lambda_2 = -${lambda2}$.`,
              '4. Ambos estão no semiplano esquerdo (partes reais negativas), logo o sistema é **Assintoticamente Estável**.',
            ],
          },
          formulaGuide: {
            title: 'Equação Característica em Espaço de Estados',
            formulaLatex: '\\det(s\\mathbf{I} - \\mathbf{A}) = 0 \\implies \\lambda_i < 0 \\implies \\text{Estabilidade Assintótica}',
            howToApply: `Resolva o determinante da matriz $(s\\mathbf{I} - \\mathbf{A})$.`,
          },
          options: [
            {
              text: `$$\\lambda_1 = -${lambda1}, \\quad \\lambda_2 = -${lambda2} \\quad (\\text{Assintoticamente Estável})$$`,
              isCorrect: true,
              explanation: `Correto! Os autovalores são $\\lambda_1 = -${lambda1}$ e $\\lambda_2 = -${lambda2}$. Como ambos são negativos, o sistema é estável.`
            },
            {
              text: `$$\\lambda_1 = +${lambda1}, \\quad \\lambda_2 = +${lambda2} \\quad (\\text{Instável})$$`,
              isCorrect: false,
              explanation: 'Os sinais das raízes são negativos devido aos coeficientes positivos do polinômio característico.'
            },
            {
              text: `$$\\lambda_1 = 0, \\quad \\lambda_2 = -${lambda1+lambda2} \\quad (\\text{Marginalmente Estável})$$`,
              isCorrect: false,
              explanation: 'O termo independente $\\det(\\mathbf{A}) = ' + (lambda1*lambda2) + ' \\neq 0$, logo nenhum autovalor é nulo.'
            },
            {
              text: 'O sistema não admite solução matricial',
              isCorrect: false,
              explanation: 'A matriz $\\mathbf{A}$ está na forma canônica de controle, perfeitamente determinada e integrável.'
            }
          ],
          stepByStepSolution: `1. $\\det(s\\mathbf{I} - \\mathbf{A}) = s(s + ${lambda1+lambda2}) + ${lambda1*lambda2} = s^2 + ${lambda1+lambda2}s + ${lambda1*lambda2} = 0$.\n2. Raízes: $(s + ${lambda1})(s + ${lambda2}) = 0 \\implies \\lambda_1 = -${lambda1}, \\lambda_2 = -${lambda2}$.\n3. Como $\\text{Re}\\{\\lambda_i\\} < 0$, o sistema é **Assintoticamente Estável**.`
        });
      }
    }
  }

  // ==================================================================================================
  // CHAPTER 5: ENGENHARIA ELÉTRICA & ANÁLISE DE CIRCUITOS (100 Iniciante, 100 Intermediário, 100 Avançado)
  // ==================================================================================================
  for (const diff of levels) {
    const xp = diff === 'Iniciante' ? 30 : diff === 'Intermediário' ? 50 : 65;

    for (let i = 1; i <= 100; i++) {
      const id = `mc-ch5-${diff.toLowerCase().substring(0, 3)}-${i}`;
      const r = (i % 6) + 1; // kOhms
      const c = (i % 5) + 1; // uF
      const tau = r * c; // ms
      const vin = (i % 4) * 5 + 10; // Volts

      if (diff === 'Iniciante') {
        const variant = i % 3;
        if (variant === 0) {
          // Circuito RC de 1ª Ordem (Constante de tempo e Tensão no Capacitor)
          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Elétrica): Constante de Tempo e Resposta ao Degrau em Circuito RC`,
            chapter: 5,
            chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
            category: 'electrical_engineering',
            difficulty: diff,
            xpReward: xp,
            statement: `Um circuito série $RC$ é alimentado por uma fonte degrau de tensão $V_{in} = ${vin}\\text{ V}$ em $t = 0$. Sabendo que $R = ${r}\\text{ k}\\Omega$ e $C = ${c}\\ \\mu\\text{F}$ com capacitor inicialmente descarregado ($v_C(0^-) = 0\\text{ V}$), determine a constante de tempo $\\tau$ e a expressão da tensão no capacitor $v_C(t)$ para $t \\ge 0$.`,
            guidedHint: `A constante de tempo em circuitos RC é $\\tau = R \\cdot C$. A resposta ao degrau é dada pela clássica curva de carga: $v_C(t) = V_{in}(1 - e^{-t/\\tau})u(t)$.`,
            interpretationGuide: {
              objective: 'Calcular a constante de tempo e determinar a evolução temporal da tensão no capacitor.',
              givenData: [
                { label: 'Resistência R', value: `${r} \\text{ k}\\Omega = ${r*1000} \\; \\Omega` },
                { label: 'Capacitância C', value: `${c} \\; \\mu\\text{F} = ${c*1e-6} \\; \\text{F}` },
                { label: 'Tensão da Fonte V_{in}', value: `${vin} \\text{ V}` },
                { label: 'Condição Inicial', value: 'v_C(0) = 0 \\text{ V}' },
              ],
              strategy: [
                `1. Calcular $\\tau = R \\times C = (${r} \\times 10^3) \\times (${c} \\times 10^{-6}) = ${tau} \\times 10^{-3}\\text{ s} = ${tau}\\text{ ms}$.`,
                `2. Aplicar a fórmula de carga do capacitor: $v_C(t) = V_{in}(1 - e^{-t/\\tau}) = ${vin}(1 - e^{-t/${tau}\\text{ms}})\\text{ V}$.`,
                `3. No infinito ($t \\to \\infty$), a tensão atinge o valor de regime permanente $v_C(\\infty) = ${vin}\\text{ V}$.`,
              ],
              pitfalls: 'Cuidado com os prefixos métricos: $k\\Omega = 10^3\\Omega$ e $\\mu F = 10^{-6}F$, resultando em milissegundos ($10^{-3}s$).',
            },
            formulaGuide: {
              title: 'Carga de Capacitor em Circuito RC de 1ª Ordem',
              formulaLatex: '\\tau = R \\cdot C, \\quad v_C(t) = V_f + (V_0 - V_f)e^{-t/\\tau} = V_{in}(1 - e^{-t/\\tau})u(t)',
              howToApply: `Calcule $\\tau = ${r} \\times ${c} = ${tau}\\text{ ms}$ e monte a expressão com $V_{in} = ${vin}$.`,
            },
            options: [
              {
                text: `$$\\tau = ${tau}\\text{ ms}, \\quad v_C(t) = ${vin}\\left(1 - e^{-\\frac{t}{${tau}\\text{ms}}}\\right)u(t)\\text{ V}$$`,
                isCorrect: true,
                explanation: `Correto! $\\tau = ${r}\\text{k}\\Omega \\times ${c}\\mu\\text{F} = ${tau}\\text{ ms}$, e o capacitor carrega assintoticamente até ${vin}\\text{ V}$.`
              },
              {
                text: `$$\\tau = ${tau}\\text{ s}, \\quad v_C(t) = ${vin}e^{-\\frac{t}{${tau}\\text{s}}}u(t)\\text{ V}$$`,
                isCorrect: false,
                explanation: 'A unidade de tempo correta é milissegundos (não segundos), e a expressão exponencial decrescente pura descreve a descarga, não a carga.'
              },
              {
                text: `$$\\tau = ${(r/c).toFixed(2)}\\text{ ms}, \\quad v_C(t) = ${vin}u(t)\\text{ V}$$`,
                isCorrect: false,
                explanation: 'A constante de tempo é o produto $R \\cdot C$, não a divisão $R/C$.'
              },
              {
                text: `$$\\tau = ${tau}\\text{ ms}, \\quad v_C(t) = \\frac{${vin}}{${r}}\\left(1 - e^{-\\frac{t}{${tau}\\text{ms}}}\\right)u(t)\\text{ V}$$`,
                isCorrect: false,
                explanation: 'A amplitude da tensão final é diretamente a tensão da fonte $V_{in}$, não a corrente $V_{in}/R$.'
              }
            ],
            stepByStepSolution: `1. $\\tau = R \\cdot C = (${r} \\times 10^3\\,\\Omega) \\times (${c} \\times 10^{-6}\\,\\text{F}) = ${tau} \\times 10^{-3}\\,\\text{s} = ${tau}\\,\\text{ms}$.\n2. Equação diferencial: $RC \\frac{dv_C}{dt} + v_C(t) = ${vin}$.\n3. Solução com $v_C(0) = 0$: $v_C(t) = ${vin}(1 - e^{-t/${tau}\\text{ms}})u(t)\\,\\text{V}$.`
          });
        } else if (variant === 1) {
          // Circuito RL de 1ª Ordem
          const l = (i % 4) + 2; // Henrys
          const rL = (i % 3) + 2; // Ohms
          const tauL = (l / rL).toFixed(2);
          const iFinal = (vin / rL).toFixed(2);

          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Elétrica): Estabelecimento de Corrente em Indutor (Circuito RL)`,
            chapter: 5,
            chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
            category: 'electrical_engineering',
            difficulty: diff,
            xpReward: xp,
            statement: `Um indutor com $L = ${l}\\text{ H}$ em série com um resistor de $R = ${rL}\\,\\Omega$ é conectado a uma fonte contínua de $V = ${vin}\\text{ V}$ em $t = 0$. Calcule a constante de tempo $\\tau$ e o valor da corrente em regime permanente $i_L(\\infty)$.`,
            guidedHint: `Em circuitos RL, a constante de tempo é $\\tau = \\frac{L}{R}$. Em regime permanente CC ($t \\to \\infty$), o indutor comporta-se como um curto-circuito ($v_L = 0$).`,
            interpretationGuide: {
              objective: 'Calcular a constante de tempo RL e a corrente máxima estabelecida no indutor.',
              givenData: [
                { label: 'Indutância L', value: `${l} \\text{ H}` },
                { label: 'Resistência R', value: `${rL} \\; \\Omega` },
                { label: 'Tensão V', value: `${vin} \\text{ V}` },
              ],
              strategy: [
                `1. Constante de tempo: $\\tau = \\frac{L}{R} = \\frac{${l}}{${rL}} = ${tauL}\\text{ s}$.`,
                `2. Em regime permanente CC ($s = 0$), $Z_L = 0$ (curto-circuito): $i_L(\\infty) = \\frac{V}{R} = \\frac{${vin}}{${rL}} = ${iFinal}\\text{ A}$.`,
              ],
            },
            formulaGuide: {
              title: 'Resposta Transitória em Circuito RL',
              formulaLatex: '\\tau = \\frac{L}{R}, \\quad i_L(t) = \\frac{V}{R}\\left(1 - e^{-t/\\tau}\\right)u(t)',
              howToApply: `Divida $L$ por $R$ para obter $\\tau$, e $V$ por $R$ para a corrente final.`,
            },
            options: [
              {
                text: `$$\\tau = ${tauL}\\text{ s}, \\quad i_L(\\infty) = ${iFinal}\\text{ A}$$`,
                isCorrect: true,
                explanation: `Perfeito! $\\tau = \\frac{L}{R} = \\frac{${l}}{${rL}} = ${tauL}\\text{ s}$, e em CC o indutor vira curto-circuito com $i = \\frac{${vin}}{${rL}} = ${iFinal}\\text{ A}$.`
              },
              {
                text: `$$\\tau = ${l * rL}\\text{ s}, \\quad i_L(\\infty) = ${vin}\\text{ A}$$`,
                isCorrect: false,
                explanation: 'A constante de tempo é $L/R$ (divisão), não o produto $L \\cdot R$.'
              },
              {
                text: `$$\\tau = ${tauL}\\text{ s}, \\quad i_L(\\infty) = 0\\text{ A}$$`,
                isCorrect: false,
                explanation: 'A corrente inicial é $0$ A, mas em regime permanente ela atinge o valor máximo $V/R$.'
              },
              {
                text: `$$\\tau = \\frac{${rL}}{${l}}\\text{ s}, \\quad i_L(\\infty) = ${iFinal}\\text{ A}$$`,
                isCorrect: false,
                explanation: 'A fórmula da constante de tempo foi invertida; o correto é $L/R$.'
              }
            ],
            stepByStepSolution: `1. $\\tau = \\frac{L}{R} = \\frac{${l}}{${rL}} = ${tauL}\\text{ s}$.\n2. Corrente no indutor: $i_L(t) = \\frac{${vin}}{${rL}}(1 - e^{-t/${tauL}})$.\n3. Para $t \\to \\infty$: $i_L(\\infty) = \\frac{${vin}}{${rL}} = ${iFinal}\\text{ A}$.`
          });
        } else {
          // Impedância Operacional em Laplace
          const lVal = (i % 3) + 1;
          const rVal = (i % 4) + 2;

          mcProblems.push({
            id,
            title: `Questão ${i} (Iniciante - Elétrica): Impedância Equivalente no Domínio de Laplace`,
            chapter: 5,
            chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
            category: 'electrical_engineering',
            difficulty: diff,
            xpReward: xp,
            statement: `Qual é a impedância equivalente $Z(s)$ de uma associação série composta por um resistor de $R = ${rVal}\\,\\Omega$ e um indutor de $L = ${lVal}\\text{ H}$ no domínio da frequência complexa $s$?`,
            guidedHint: `No domínio de Laplace (condições iniciais nulas): a impedância do resistor é $Z_R(s) = R$ e do indutor é $Z_L(s) = sL$. Em série, somam-se as impedâncias.`,
            interpretationGuide: {
              objective: 'Representar a impedância operacional de ramo série no domínio s.',
              givenData: [
                { label: 'Resistor R', value: `${rVal} \\; \\Omega` },
                { label: 'Indutor L', value: `${lVal} \\text{ H}` },
              ],
              strategy: [
                `1. Impedância do resistor: $Z_R(s) = ${rVal}$.`,
                `2. Impedância do indutor: $Z_L(s) = s \\cdot ${lVal} = ${lVal}s$.`,
                `3. Associação série: $Z_{eq}(s) = Z_R(s) + Z_L(s) = ${lVal}s + ${rVal}$.`,
              ],
            },
            formulaGuide: {
              title: 'Impedâncias Canônicas de Laplace',
              formulaLatex: 'Z_R(s) = R, \\quad Z_L(s) = sL, \\quad Z_C(s) = \\frac{1}{sC}',
              howToApply: `Some $Z_R(s) + Z_L(s) = R + sL$.`,
            },
            options: [
              {
                text: `$$Z(s) = ${lVal}s + ${rVal}\\ \\Omega$$`,
                isCorrect: true,
                explanation: `Correto! Em Laplace, o indutor contribui com $sL = ${lVal}s$ e o resistor com $R = ${rVal}$, somando $Z(s) = ${lVal}s + ${rVal}$.`
              },
              {
                text: `$$Z(s) = \\frac{${lVal}}{s} + ${rVal}\\ \\Omega$$`,
                isCorrect: false,
                explanation: 'O termo $\\frac{1}{s}$ corresponde a um capacitor ($1/sC$), não a um indutor.'
              },
              {
                text: `$$Z(s) = \\frac{${rVal} \\times ${lVal}s}{${lVal}s + ${rVal}}\\ \\Omega$$`,
                isCorrect: false,
                explanation: 'Essa seria a impedância para uma associação em paralelo, e não em série.'
              },
              {
                text: `$$Z(s) = ${rVal}\\sqrt{1 + (${lVal}s)^2}\\ \\Omega$$`,
                isCorrect: false,
                explanation: 'A impedância complexa em Laplace é uma função racional linear $R + sL$, sem raízes quadradas.'
              }
            ],
            stepByStepSolution: `1. $Z_R(s) = R = ${rVal}\\,\\Omega$.\n2. $Z_L(s) = sL = ${lVal}s\\,\\Omega$.\n3. Em série: $Z(s) = Z_R(s) + Z_L(s) = ${lVal}s + ${rVal}\\,\\Omega$.`
          });
        }
      } else if (diff === 'Intermediário') {
        // Intermediário Elétrica: Filtros Ativos com Op-Amp, Função de Transferência H(s), Circuito RLC Ressonante
        const r1 = (i % 4) + 1; // kOhms
        const r2 = (i % 5) + 2; // kOhms
        const cVal = (i % 3) + 1; // uF
        const gainDC = (r2 / r1).toFixed(2);
        const poleW = (1000 / (r2 * cVal)).toFixed(1);

        mcProblems.push({
          id,
          title: `Questão ${i} (Intermediário - Elétrica): Filtro Passa-Baixas Ativo com Amplificador Operacional`,
          chapter: 5,
          chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
          category: 'electrical_engineering',
          difficulty: diff,
          xpReward: xp,
          statement: `Um filtro ativo passa-baixas inversor é construído com um Amp-Op ideal, resistor de entrada $R_1 = ${r1}\\text{ k}\\Omega$, e na malha de realimentação um resistor $R_2 = ${r2}\\text{ k}\\Omega$ em paralelo com um capacitor $C = ${cVal}\\,\\mu\\text{F}$. Determine a função de transferência $H(s) = \\frac{V_{out}(s)}{V_{in}(s)}$ e o ganho em baixa frequência (ganho DC).`,
          guidedHint: `A função de transferência de um amplificador inversor é $H(s) = -\\frac{Z_f(s)}{Z_{in}(s)}$. A impedância de realimentação é $Z_f(s) = R_2 \\parallel \\frac{1}{sC} = \\frac{R_2}{1 + sR_2 C}$.`,
          interpretationGuide: {
            objective: 'Dedução da função de transferência de um filtro ativo passa-baixas e cálculo do ganho estático.',
            givenData: [
              { label: 'Resistor de Entrada R_1', value: `${r1} \\text{ k}\\Omega` },
              { label: 'Resistor de Realimentação R_2', value: `${r2} \\text{ k}\\Omega` },
              { label: 'Capacitor de Realimentação C', value: `${cVal} \\; \\mu\\text{F}` },
            ],
            strategy: [
              `1. Impedância de entrada: $Z_{in}(s) = R_1 = ${r1}\\text{ k}\\Omega$.`,
              `2. Impedância de realimentação: $Z_f(s) = \\frac{R_2}{1 + sR_2 C}$.`,
              `3. Função de Transferência: $H(s) = -\\frac{Z_f(s)}{Z_{in}(s)} = -\\frac{R_2 / R_1}{1 + sR_2 C} = -\\frac{${gainDC}}{1 + \\frac{s}{${poleW}}}$.`,
              `4. Ganho DC ($s = 0$): $H(0) = -\\frac{R_2}{R_1} = -${gainDC}$.`,
            ],
          },
          formulaGuide: {
            title: 'Filtro Passa-Baixas Ativo de 1ª Ordem',
            formulaLatex: 'H(s) = -\\frac{R_2 / R_1}{1 + s R_2 C}, \\quad \\text{Frequência de Corte } \\omega_c = \\frac{1}{R_2 C}',
            howToApply: `Calcule o ganho $K = R_2/R_1 = ${gainDC}$ e o polo $\\omega_c = 1/(R_2 C)$.`,
          },
          options: [
            {
              text: `$$H(s) = -\\frac{${gainDC}}{1 + s(${r2 * cVal}\\text{ms})}, \\quad \\text{Ganho DC } = -${gainDC}$$`,
              isCorrect: true,
              explanation: `Correto! O circuito atua como amplificador inversor com ganho DC de $-\\frac{R_2}{R_1} = -${gainDC}$ e frequência de corte $\\omega_c = \\frac{1}{R_2 C}$.`
            },
            {
              text: `$$H(s) = +\\frac{${gainDC}}{s(${r2 * cVal}\\text{ms})}, \\quad \\text{Ganho DC } = \\infty$$`,
              isCorrect: false,
              explanation: 'A presença do resistor $R_2$ em paralelo impede a saturação integradora pura, limitando o ganho DC em $-R_2/R_1$.'
            },
            {
              text: `$$H(s) = -\\frac{${(r1/r2).toFixed(2)}}{1 + sR_1 C}, \\quad \\text{Ganho DC } = -${(r1/r2).toFixed(2)}$$`,
              isCorrect: false,
              explanation: 'O ganho do amplificador inversor é $R_2/R_1$ (realimentação sobre entrada), e não $R_1/R_2$.'
            },
            {
              text: `$$H(s) = -${gainDC}(1 + sR_2 C)$$`,
              isCorrect: false,
              explanation: 'O capacitor em paralelo na realimentação coloca o polo no denominador (passa-baixas), não no numerador (passa-altas/derivador).'
            }
          ],
          stepByStepSolution: `1. $Z_{in}(s) = R_1$.\n2. $Z_f(s) = R_2 \\parallel \\frac{1}{sC} = \\frac{R_2}{1 + sR_2 C}$.\n3. $H(s) = -\\frac{Z_f(s)}{Z_{in}(s)} = -\\frac{R_2/R_1}{1 + sR_2 C} = -\\frac{${gainDC}}{1 + s(${r2*cVal}\\times 10^{-3})}$.\n4. Em DC ($s=0$): $H(0) = -${gainDC}$.`
        });
      } else {
        // Avançado Elétrica: RLC Ressonante, Diagrama de Bode, Potência Complexa e Fator de Potência
        const f0 = (i % 5) * 100 + 500; // Hz
        const w0Res = (2 * Math.PI * f0).toFixed(0);
        const qFactor = (i % 4) + 3;
        const bw = (f0 / qFactor).toFixed(1);

        mcProblems.push({
          id,
          title: `Questão ${i} (Avançado - Elétrica): Fator de Qualidade (Q) e Largura de Banda de Circuito RLC`,
          chapter: 5,
          chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
          category: 'electrical_engineering',
          difficulty: diff,
          xpReward: xp,
          statement: `Um circuito ressonante $RLC$ série para recepção de sinais de rádio opera na frequência de ressonância $f_0 = ${f0}\\text{ Hz}$ com fator de qualidade $Q = ${qFactor}$. Calcule a largura de banda a $-3\\text{ dB}$ (Bandwidth, $\\text{BW}$) do circuito e explique o efeito do aumento de $Q$ na seletividade.`,
          guidedHint: `A relação fundamental da largura de banda a -3 dB em circuitos ressonantes é $\\text{BW} = \\frac{f_0}{Q}$. Quanto maior o fator $Q$, mais estreita a faixa e mais seletivo o filtro.`,
          interpretationGuide: {
            objective: 'Determinar a largura de banda de passagem e analisar a seletividade em função do fator de mérito Q.',
            givenData: [
              { label: 'Frequência de Ressonância f_0', value: `${f0} \\text{ Hz}` },
              { label: 'Fator de Qualidade Q', value: `${qFactor}` },
            ],
            strategy: [
              `1. Aplicar a fórmula de largura de banda: $\\text{BW} = \\frac{f_0}{Q} = \\frac{${f0}}{${qFactor}} = ${bw}\\text{ Hz}$.`,
              '2. Avaliar a seletividade: Fator $Q$ elevado resulta em menor dissipação relativa de energia por ciclo, estreitando o pico ressonante e aumentando a capacidade de rejeitar frequências adjacentes.',
            ],
          },
          formulaGuide: {
            title: 'Relações de Ressonância e Fator de Qualidade Q',
            formulaLatex: '\\text{BW} = \\frac{f_0}{Q} = f_2 - f_1, \\quad Q = \\frac{\\omega_0 L}{R} = \\frac{1}{\\omega_0 R C}',
            howToApply: `Divida $f_0 = ${f0}$ por $Q = ${qFactor}$.`,
          },
          options: [
            {
              text: `$$\\text{BW} = ${bw}\\text{ Hz}, \\quad \\text{Maior } Q \\implies \\text{Filtro mais seletivo e estreito}$$`,
              isCorrect: true,
              explanation: `Correto! $\\text{BW} = \\frac{${f0}}{${qFactor}} = ${bw}\\text{ Hz}$. Um $Q$ mais alto concentra a energia em torno de $f_0$, proporcionando maior seletividade.`
            },
            {
              text: `$$\\text{BW} = ${f0 * qFactor}\\text{ Hz}, \\quad \\text{Maior } Q \\implies \\text{Filtro mais largo}$$`,
              isCorrect: false,
              explanation: 'A largura de banda é inversamente proporcional a $Q$ (divisão $f_0/Q$), não multiplicativa.'
            },
            {
              text: `$$\\text{BW} = ${(f0 / 2).toFixed(1)}\\text{ Hz}, \\quad \\text{Independente de } Q$$`,
              isCorrect: false,
              explanation: 'A largura de banda depende criticamente do fator de amortecimento e do valor de $Q$.'
            },
            {
              text: `$$\\text{BW} = ${bw}\\text{ Hz}, \\quad \\text{Maior } Q \\implies \\text{Maior perda por efeito Joule}$$`,
              isCorrect: false,
              explanation: 'Pelo contrário, um $Q$ maior indica menor resistência de perdas $R$ em relação à reatância dos elementos reativos.'
            }
          ],
          stepByStepSolution: `1. Largura de banda a -3 dB: $\\text{BW} = \\frac{f_0}{Q} = \\frac{${f0}}{${qFactor}} = ${bw}\\text{ Hz}$.\n2. Frequências de corte: $f_1 \\approx ${f0} - \\frac{${bw}}{2}\\text{ Hz}$ e $f_2 \\approx ${f0} + \\frac{${bw}}{2}\\text{ Hz}$.\n3. Conclusão: $\\text{BW} = ${bw}\\text{ Hz}$ com alta seletividade espectral.`
        });
      }
    }
  }

  // ==================================================================================================
  // GENERATE 300 STEP-BY-STEP PROBLEMS (60 POR CAPÍTULO: 20 INICIANTE, 20 INTERMEDIÁRIO, 20 AVANÇADO)
  // Cap 1 (Sinais), Cap 2 (Fourier), Cap 3 (Laplace), Cap 4 (EDOs), Cap 5 (Engenharia Elétrica)
  // ==================================================================================================
  for (let ch = 1; ch <= 5; ch++) {
    for (let levelIdx = 0; levelIdx < 3; levelIdx++) {
      const diff = levels[levelIdx];
      const baseReward = diff === 'Iniciante' ? 60 : diff === 'Intermediário' ? 90 : 120;

      for (let k = 1; k <= 20; k++) {
        const questionIndex = levelIdx * 20 + k; // 1 to 60 for this chapter
        const a = (k % 7) + 2;
        const b = (k % 5) + 1;
        const c = (k % 4) + 1;
        const w0 = (k % 6) + 2;
        const t0 = (k % 5) + 1;
        const y0 = (k % 4) + 1;

        if (ch === 1) {
          // ==========================================
          // CAPÍTULO 1: SINAIS & SISTEMAS (60 Exercícios Passo a Passo)
          // ==========================================
          const id = `step-ch1-${diff.toLowerCase().substring(0, 3)}-${questionIndex}`;
          const isOdd = k % 2 === 1;

          stepProblems.push({
            id,
            title: `Exercício ${questionIndex} (${diff} - Cap 1): ${
              k % 3 === 0
                ? 'Cálculo de Energia e Potência Média de Sinal Contínuo'
                : k % 3 === 1
                ? 'Decomposição em Componente Par e Ímpar'
                : 'Convolução Contínua entre Degrau e Exponencial Causal'
            }`,
            chapter: 1,
            chapterName: 'Capítulo 1 – Sinais & Sistemas',
            category: 'signals',
            difficulty: diff,
            xpReward: baseReward,
            contextTheory:
              k % 3 === 0
                ? `A energia de um sinal $x(t)$ é $E = \\int_{-\\infty}^\\infty |x(t)|^2 dt$. Para sinais estritamente causais $x(t) = ${a}e^{-${b}t}u(t)$, $E = \\int_0^\\infty ${a*a}e^{-${2*b}t}dt = \\frac{${a*a}}{${2*b}}$.`
                : k % 3 === 1
                ? `Todo sinal pode ser decomposto unicamente em $x(t) = x_{par}(t) + x_{impar}(t)$, onde $x_{par}(t) = \\frac{x(t)+x(-t)}{2}$ e $x_{impar}(t) = \\frac{x(t)-x(-t)}{2}$.`
                : `A convolução contínua é $y(t) = \\int_{-\\infty}^\\infty x(\\tau)h(t-\\tau)d\\tau$. Para $x(t) = u(t)$ e $h(t) = e^{-${a}t}u(t)$, $y(t) = \\frac{1}{${a}}(1 - e^{-${a}t})u(t)$.`,
            statement:
              k % 3 === 0
                ? `Dado o sinal contínuo $x(t) = ${a}e^{-${b}t}u(t)$, calcule a energia total $E_\\infty$ do sinal e verifique se trata-se de um sinal de energia ($0 < E < \\infty$).`
                : k % 3 === 1
                ? `Considere o sinal $x(t) = ${a}e^{${b}t}$. Determine a expressão analítica de sua componente estritamente par $x_{par}(t)$.`
                : `Calcule a integral de convolução $y(t) = x(t) * h(t)$ entre a entrada $x(t) = u(t)$ e a resposta ao impulso $h(t) = e^{-${a}t}u(t)$ para $t \\ge 0$.`,
            finalSolutionLatex:
              k % 3 === 0
                ? `E_\\infty = \\frac{${a * a}}{${2 * b}} = ${( (a * a) / (2 * b) ).toFixed(2)}\\text{ Joules}`
                : k % 3 === 1
                ? `x_{par}(t) = ${a}\\cosh(${b}t) = \\frac{${a}}{2}(e^{${b}t} + e^{-${b}t})`
                : `y(t) = \\frac{1}{${a}}\\left(1 - e^{-${a}t}\\right)u(t)`,
            interpretationGuide: {
              objective: `Desenvolver a análise temporal do sinal no Capítulo 1 aplicando as definições canônicas de energia, paridade ou convolução.`,
              givenData: [
                { label: 'Parâmetro a', value: `${a}` },
                { label: 'Parâmetro b', value: `${b}` },
                { label: 'Domínio de Definição', value: 't \\ge 0 \\text{ (sinal causal)}' },
              ],
              strategy: [
                '1. Identificar o tipo de operação matemática solicitada no enunciado.',
                '2. Escrever a integral de definição com os limites temporais corretos.',
                '3. Executar a primitivação e aplicar o Teorema Fundamental do Cálculo.',
              ],
            },
            formulaGuide: {
              title: k % 3 === 0 ? 'Energia de Sinais Contínuos' : k % 3 === 1 ? 'Simetria Par e Ímpar' : 'Integral de Convolução',
              formulaLatex:
                k % 3 === 0
                  ? 'E_\\infty = \\int_{-\\infty}^{\\infty} |x(t)|^2 dt'
                  : k % 3 === 1
                  ? 'x_{par}(t) = \\frac{x(t) + x(-t)}{2}'
                  : 'y(t) = \\int_0^t x(\\tau)h(t-\\tau)d\\tau',
              howToApply: `Substitua os dados do enunciado diretamente na fórmula canônica.`,
            },
            steps: [
              {
                id: `${id}-step-1`,
                stepNumber: 1,
                instruction:
                  k % 3 === 0
                    ? `Escreva o integrando da energia $|x(t)|^2 = (${a}e^{-${b}t})^2$. Qual é o expoente resultante da exponencial e o coeficiente multiplicativo?`
                    : k % 3 === 1
                    ? `Substitua na fórmula de paridade: $x_{par}(t) = \\frac{${a}e^{${b}t} + ${a}e^{-${b}t}}{2}$. Qual é a forma com cosseno hiperbólico $\\cosh$?`
                    : `Escreva a integral de convolução para $t > 0$: $\\int_0^t 1 \\cdot e^{-${a}(t-\\tau)} d\\tau$. Colocando o termo $e^{-${a}t}$ fora da integral, qual é a integral em $\\tau$?`,
                formulaHelper: k % 3 === 0 ? `|x(t)|^2 = ${a*a}e^{-${2*b}t}` : k % 3 === 1 ? `\\frac{e^u + e^{-u}}{2} = \\cosh(u)` : `\\int_0^t e^{${a}\\tau} d\\tau`,
                expectedAnswer:
                  k % 3 === 0
                    ? `${a*a}e^(-${2*b}t)`
                    : k % 3 === 1
                    ? `${a}cosh(${b}t)`
                    : `e^(-${a}t) * (e^(${a}t)-1)/${a}`,
                acceptableAnswers:
                  k % 3 === 0
                    ? [`${a*a}e^(-${2*b}t)`, `${a*a}*e^(-${2*b}t)`, `${a*a}e^-${2*b}t`, `${a*a}e^{-${2*b}t}`]
                    : k % 3 === 1
                    ? [`${a}cosh(${b}t)`, `${a}*cosh(${b}t)`, `${a} cosh(${b}t)`, `${a}/2(e^(${b}t)+e^(-${b}t))`]
                    : [`(1-e^(-${a}t))/${a}`, `(1-e^-${a}t)/${a}`, `1/${a}(1-e^(-${a}t))`, `1/${a}*(1-e^(-${a}t))`],
                explanationOnCorrect: `Excelente dedução algébrica!`,
                hint: `Verifique as propriedades operatórias das exponenciais e trigonometria hiperbólica.`,
                inputType: 'math_text',
              },
              {
                id: `${id}-step-2`,
                stepNumber: 2,
                instruction:
                  k % 3 === 0
                    ? `Resolva a integral $\\int_0^\\infty ${a*a}e^{-${2*b}t}dt = \\left[ -\\frac{${a*a}}{${2*b}}e^{-${2*b}t} \\right]_0^\\infty$. Qual é o valor numérico ou fração da energia total $E_\\infty$?`
                    : k % 3 === 1
                    ? `Qual é o valor numérico de $x_{par}(0)$ em $t = 0$?`
                    : `Qual é o valor em regime permanente $\\lim_{t \\to \\infty} y(t)$ da resposta ao degrau?`,
                formulaHelper: k % 3 === 0 ? `E_\\infty = \\frac{${a*a}}{${2*b}}` : k % 3 === 1 ? `x_{par}(0) = ${a}\\cosh(0) = ${a}` : `y(\\infty) = \\frac{1}{${a}}`,
                expectedAnswer:
                  k % 3 === 0
                    ? `${a*a}/${2*b}`
                    : k % 3 === 1
                    ? `${a}`
                    : `1/${a}`,
                acceptableAnswers:
                  k % 3 === 0
                    ? [`${a*a}/${2*b}`, `${((a*a)/(2*b)).toFixed(2)}`, `${(a*a)/(2*b)}`, `${(a*a)/2}/${b}`]
                    : k % 3 === 1
                    ? [`${a}`, `x(0)=${a}`, `${a}.0`]
                    : [`1/${a}`, `${(1/a).toFixed(2)}`, `${1/a}`],
                explanationOnCorrect: `Correto! Resultado perfeitamente calculado.`,
                hint: `Substitua os limites nos extremos superior e inferior.`,
                inputType: 'math_text',
              },
            ],
          });
        } else if (ch === 2) {
          // ==========================================
          // CAPÍTULO 2: TRANSFORMADA & SÉRIE DE FOURIER (60 Exercícios Passo a Passo)
          // ==========================================
          const id = `step-ch2-${diff.toLowerCase().substring(0, 3)}-${questionIndex}`;
          const T0 = (k % 4) * 2 + 2;
          const wFundamental = ((2 * Math.PI) / T0).toFixed(2);

          stepProblems.push({
            id,
            title: `Exercício ${questionIndex} (${diff} - Cap 2): ${
              k % 3 === 0
                ? 'Coeficientes da Série Trigonométrica de Fourier para Onda Quadrada'
                : k % 3 === 1
                ? 'Transformada Contínua de Fourier de Pulso Retangular'
                : 'Resposta em Frequência e Defasagem de Filtro de 1ª Ordem'
            }`,
            chapter: 2,
            chapterName: 'Capítulo 2 – Análise e Transformada de Fourier',
            category: 'fourier',
            difficulty: diff,
            xpReward: baseReward,
            contextTheory:
              k % 3 === 0
                ? `Para sinais periódicos com período $T_0 = ${T0}$, a frequência fundamental é $\\omega_0 = \\frac{2\\pi}{T_0}$. O coeficiente $a_0 = \\frac{1}{T_0}\\int_0^{T_0} x(t)dt$ e $b_n = \\frac{2}{T_0}\\int_0^{T_0} x(t)\\sin(n\\omega_0 t)dt$.`
                : k % 3 === 1
                ? `A Transformada de Fourier de um pulso retangular de largura $\\tau = ${t0}$ e amplitude $A = ${a}$ é $X(j\\omega) = A\\tau \\operatorname{sinc}\\left(\\frac{\\omega \\tau}{2\\pi}\\right) = \\frac{2A}{\\omega}\\sin\\left(\\frac{\\omega \\tau}{2}\\right)$.`
                : `Para um sistema com resposta em frequência $H(j\\omega) = \\frac{1}{1 + j\\frac{\\omega}{${w0}}}$, o ganho na frequência $\\omega_0 = ${w0}\\text{ rad/s}$ é $|H(j${w0})| = \\frac{1}{\\sqrt{2}} \\approx 0.707$ (-3 dB).`,
            statement:
              k % 3 === 0
                ? `Considere uma onda periódica simétrica de período $T_0 = ${T0}\\text{ s}$ e amplitude de pico $A = ${a}\\text{ V}$. Determine a frequência angular fundamental $\\omega_0$ e o coeficiente de valor médio $a_0$.`
                : k % 3 === 1
                ? `Calcule a Transformada de Fourier $X(j\\omega) = \\int_{-\\infty}^\\infty x(t)e^{-j\\omega t}dt$ de um pulso simétrico centrado na origem $x(t) = ${a}\\operatorname{rect}\\left(\\frac{t}{${t0}}\\right)$.`
                : `Dado um filtro com $H(j\\omega) = \\frac{${a}}{${w0} + j\\omega}$, determine o valor do módulo do ganho na frequência $\\omega = 0$ (ganho DC) e a frequência de corte a -3 dB $\\omega_c$.`,
            finalSolutionLatex:
              k % 3 === 0
                ? `\\omega_0 = \\frac{2\\pi}{${T0}} = \\frac{\\pi}{${T0/2}}\\text{ rad/s}, \\quad a_0 = \\frac{${a}}{2}\\text{ V}`
                : k % 3 === 1
                ? `X(j\\omega) = ${a * t0} \\operatorname{sinc}\\left(\\frac{\\omega \\cdot ${t0}}{2\\pi}\\right) = \\frac{2 \\times ${a}}{\\omega}\\sin\\left(\\frac{${t0}\\omega}{2}\\right)`
                : `|H(j0)| = \\frac{${a}}{${w0}}, \\quad \\omega_c = ${w0}\\text{ rad/s}`,
            interpretationGuide: {
              objective: `Determinar os coeficientes espectrais ou a densidade espectral no domínio da frequência contínua $\\omega$.`,
              givenData: [
                { label: 'Período / Duração', value: `${T0} s` },
                { label: 'Amplitude A', value: `${a} V` },
                { label: 'Polo em Frequência', value: `${w0} rad/s` },
              ],
              strategy: [
                '1. Identificar a definição matemática de Fourier apropriada (Série vs. Transformada).',
                '2. Integrar sobre o intervalo simétrico $[-\\tau/2, \\tau/2]$ ou período $[0, T_0]$.',
                '3. Relacionar o resultado com a função seno cardinal sinc.',
              ],
            },
            formulaGuide: {
              title: k % 3 === 0 ? 'Série de Fourier' : k % 3 === 1 ? 'Transformada de Pulso Retangular' : 'Resposta em Frequência',
              formulaLatex:
                k % 3 === 0
                  ? '\\omega_0 = \\frac{2\\pi}{T_0}, \\quad a_0 = \\frac{1}{T_0}\\int_0^{T_0} x(t)dt'
                  : k % 3 === 1
                  ? '\\mathcal{F}\\{A\\operatorname{rect}(t/\\tau)\\} = A\\tau \\frac{\\sin(\\omega \\tau / 2)}{\\omega \\tau / 2}'
                  : '|H(j\\omega)| = \\frac{A}{\\sqrt{\\omega_c^2 + \\omega^2}}',
              howToApply: `Substitua os parâmetros nos domínios do tempo e da frequência.`,
            },
            steps: [
              {
                id: `${id}-step-1`,
                stepNumber: 1,
                instruction:
                  k % 3 === 0
                    ? `Calcule a frequência angular fundamental $\\omega_0 = \\frac{2\\pi}{T_0}$ para $T_0 = ${T0}$. Qual é a expressão simplificada em função de $\\pi$?`
                    : k % 3 === 1
                    ? `Escreva a integral de Fourier com os limites $[- ${t0/2}, ${t0/2}]$: $\\int_{-${t0/2}}^{${t0/2}} ${a} e^{-j\\omega t} dt$. Qual é a primitiva em relação a $t$?`
                    : `Para $\\omega = 0$, calcule o valor do ganho em corrente contínua $H(j0) = \\frac{${a}}{${w0} + j(0)}$.`,
                formulaHelper: k % 3 === 0 ? `\\omega_0 = \\frac{2\\pi}{${T0}}` : k % 3 === 1 ? `\\int e^{-j\\omega t} dt = \\frac{e^{-j\\omega t}}{-j\\omega}` : `H(0) = \\frac{${a}}{${w0}}`,
                expectedAnswer:
                  k % 3 === 0
                    ? `pi/${T0/2}`
                    : k % 3 === 1
                    ? `-${a}/(j*w)*e^(-j*w*t)`
                    : `${a}/${w0}`,
                acceptableAnswers:
                  k % 3 === 0
                    ? [`pi/${T0/2}`, `(2*pi)/${T0}`, `2pi/${T0}`, `${wFundamental}`, `pi/${T0/2} rad/s`]
                    : k % 3 === 1
                    ? [`-${a}/(j*w)*e^(-j*w*t)`, `-${a}/(jw)*e^(-jwt)`, `${a}/(-j*w)*e^(-jwt)`, `${a}/(j*w)`]
                    : [`${a}/${w0}`, `${(a/w0).toFixed(2)}`, `${a/w0}`],
                explanationOnCorrect: `Excelente cálculo dos parâmetros espectrais!`,
                hint: `Lembre-se da relação $\\omega_0 = 2\\pi / T_0$ e da integração de exponenciais complexas.`,
                inputType: 'math_text',
              },
              {
                id: `${id}-step-2`,
                stepNumber: 2,
                instruction:
                  k % 3 === 0
                    ? `Sabendo que a onda é simétrica com ciclo de trabalho de 50%, qual é o valor médio $a_0$?`
                    : k % 3 === 1
                    ? `Aplicando a fórmula de Euler $\\frac{e^{ju} - e^{-ju}}{2j} = \\sin(u)$, qual é a amplitude do lóbulo principal $X(0)$ em $\\omega = 0$?`
                    : `Qual é a frequência de corte angular $\\omega_c$ (em rad/s) onde o ganho cai para $\\frac{1}{\\sqrt{2}}$ do valor máximo?`,
                formulaHelper: k % 3 === 0 ? `a_0 = \\frac{${a}}{2}` : k % 3 === 1 ? `X(0) = A \\cdot \\tau = ${a * t0}` : `\\omega_c = ${w0}`,
                expectedAnswer:
                  k % 3 === 0
                    ? `${a}/2`
                    : k % 3 === 1
                    ? `${a * t0}`
                    : `${w0}`,
                acceptableAnswers:
                  k % 3 === 0
                    ? [`${a}/2`, `${a/2}`, `${(a/2).toFixed(1)}`, `a0=${a/2}`]
                    : k % 3 === 1
                    ? [`${a * t0}`, `${a}*${t0}`, `X(0)=${a*t0}`]
                    : [`${w0}`, `${w0} rad/s`, `w_c=${w0}`],
                explanationOnCorrect: `Muito bem! Etapa de Fourier concluída com sucesso.`,
                hint: `Em $\\omega=0$, a transformada de Fourier é igual à área total sob o sinal no tempo.`,
                inputType: 'math_text',
              },
            ],
          });
        } else if (ch === 3) {
          // ==========================================
          // CAPÍTULO 3: TRANSFORMAÇÃO DE LAPLACE (60 Exercícios Passo a Passo)
          // ==========================================
          const id = `step-ch3-${diff.toLowerCase().substring(0, 3)}-${questionIndex}`;
          const pole1 = (k % 5) + 1;
          const pole2 = pole1 + (k % 3) + 1;

          stepProblems.push({
            id,
            title: `Exercício ${questionIndex} (${diff} - Cap 3): ${
              k % 3 === 0
                ? 'Transformada de Laplace de Exponencial com Deslocamento no Tempo'
                : k % 3 === 1
                ? 'Decomposição em Frações Parciais e Inversão de Laplace'
                : 'Aplicação dos Teoremas do Valor Inicial e Final'
            }`,
            chapter: 3,
            chapterName: 'Capítulo 3 – Transformação de Laplace',
            category: 'laplace',
            difficulty: diff,
            xpReward: baseReward,
            contextTheory:
              k % 3 === 0
                ? `Pelo Teorema do Deslocamento no Tempo: $\\mathcal{L}\\{x(t - t_0)u(t - t_0)\\} = e^{-s t_0} X(s)$. Para $e^{-${a}(t-${t0})}u(t-${t0})$, temos $\\frac{e^{-${t0}s}}{s + ${a}}$, com $\\text{Re}\\{s\\} > -${a}$.`
                : k % 3 === 1
                ? `Para $F(s) = \\frac{${b}s + ${a}}{(s+${pole1})(s+${pole2})}$, expandimos como $\\frac{A}{s+${pole1}} + \\frac{B}{s+${pole2}}$. Usamos o método do cover-up de Heaviside para determinar os resíduos $A$ e $B$.`
                : `O Teorema do Valor Final estabelece que $\\lim_{t \\to \\infty} f(t) = \\lim_{s \\to 0} s F(s)$ (desde que todos os polos de $sF(s)$ estejam no SPE). O Teorema do Valor Inicial é $f(0^+) = \\lim_{s \\to \\infty} s F(s)$.`,
            statement:
              k % 3 === 0
                ? `Determine a Transformada de Laplace $\\mathcal{L}\\{f(t)\\}$ e a respectiva Região de Convergência (ROC) para o sinal atrasado $f(t) = ${a}e^{-${b}(t - ${t0})}u(t - ${t0})$.`
                : k % 3 === 1
                ? `Encontre a Transformada Inversa de Laplace $f(t) = \\mathcal{L}^{-1}\\{F(s)\\}$ para a função de transferência racional $F(s) = \\frac{${a}}{(s + ${pole1})(s + ${pole2})}$.`
                : `Dada a transformada $X(s) = \\frac{${a}s + ${b}}{s(s + ${pole1})}$, calcule o valor final no tempo $x(\\infty) = \\lim_{t \\to \\infty} x(t)$ usando o Teorema do Valor Final.`,
            finalSolutionLatex:
              k % 3 === 0
                ? `F(s) = \\frac{${a}e^{-${t0}s}}{s + ${b}}, \\quad \\text{ROC: } \\text{Re}\\{s\\} > -${b}`
                : k % 3 === 1
                ? `f(t) = \\frac{${a}}{${pole2 - pole1}}\\left(e^{-${pole1}t} - e^{-${pole2}t}\\right)u(t)`
                : `x(\\infty) = \\lim_{s \\to 0} s \\left[\\frac{${a}s + ${b}}{s(s + ${pole1})}\\right] = \\frac{${b}}{${pole1}}`,
            interpretationGuide: {
              objective: `Dominar a manipulação no plano complexo $s$, determinação de resíduos, polos e propriedades operatórias de Laplace.`,
              givenData: [
                { label: 'Polo 1', value: `s = -${pole1}` },
                { label: 'Polo 2', value: `s = -${pole2}` },
                { label: 'Atraso Temporal', value: `t_0 = ${t0} \\text{ s}` },
              ],
              strategy: [
                '1. Identificar as propriedades operatórias (deslocamento no tempo, modulação, valor final).',
                '2. Fatorar o denominador para encontrar os polos característicos.',
                '3. Aplicar Heaviside ou limites operacionais.',
              ],
            },
            formulaGuide: {
              title: k % 3 === 0 ? 'Deslocamento no Tempo' : k % 3 === 1 ? 'Método das Frações Parciais' : 'Teorema do Valor Final',
              formulaLatex:
                k % 3 === 0
                  ? '\\mathcal{L}\\{f(t - t_0)u(t - t_0)\\} = e^{-s t_0} F(s)'
                  : k % 3 === 1
                  ? 'A = \\left. (s+p_1) F(s) \\right|_{s = -p_1}'
                  : 'f(\\infty) = \\lim_{s \\to 0} s F(s)',
              howToApply: `Aplique o cover-up multiplicando pelo polo e substituindo a raiz.`,
            },
            steps: [
              {
                id: `${id}-step-1`,
                stepNumber: 1,
                instruction:
                  k % 3 === 0
                    ? `Qual é a Transformada de Laplace do sinal não-atrasado $g(t) = ${a}e^{-${b}t}u(t)$?`
                    : k % 3 === 1
                    ? `Calcule o resíduo $A$ da fração $\\frac{A}{s + ${pole1}}$ usando Heaviside: $A = \\left.\\frac{${a}}{s + ${pole2}}\\right|_{s = -${pole1}}$.`
                    : `Multiplique $X(s)$ por $s$: $s X(s) = s \\cdot \\frac{${a}s + ${b}}{s(s + ${pole1})}$. Simplifique cancelando o fator $s$.`,
                formulaHelper: k % 3 === 0 ? `G(s) = \\frac{${a}}{s + ${b}}` : k % 3 === 1 ? `A = \\frac{${a}}{-${pole1} + ${pole2}} = \\frac{${a}}{${pole2 - pole1}}` : `s X(s) = \\frac{${a}s + ${b}}{s + ${pole1}}`,
                expectedAnswer:
                  k % 3 === 0
                    ? `${a}/(s+${b})`
                    : k % 3 === 1
                    ? `${a}/${pole2 - pole1}`
                    : `(${a}s+${b})/(s+${pole1})`,
                acceptableAnswers:
                  k % 3 === 0
                    ? [`${a}/(s+${b})`, `${a}/(s + ${b})`, `G(s)=${a}/(s+${b})`]
                    : k % 3 === 1
                    ? [`${a}/${pole2 - pole1}`, `${a/(pole2 - pole1)}`, `${(a/(pole2 - pole1)).toFixed(2)}`, `A=${a}/${pole2 - pole1}`]
                    : [`(${a}s+${b})/(s+${pole1})`, `(${a}s+${b})/(s + ${pole1})`, `${a}s+${b}/(s+${pole1})`],
                explanationOnCorrect: `Muito bem! Manipulação correta no domínio de Laplace.`,
                hint: `Para o cover-up, oculte o fator correspondente ao polo e avalie a fração restante na raiz.`,
                inputType: 'math_text',
              },
              {
                id: `${id}-step-2`,
                stepNumber: 2,
                instruction:
                  k % 3 === 0
                    ? `Multiplicando pelo fator de atraso $e^{-${t0}s}$, qual é a expressão completa de $F(s)$?`
                    : k % 3 === 1
                    ? `Qual é o resíduo $B = \\left.\\frac{${a}}{s + ${pole1}}\\right|_{s = -${pole2}}$?`
                    : `Calcule o limite quando $s \\to 0$ da expressão simplificada: $\\lim_{s \\to 0} \\frac{${a}(0) + ${b}}{0 + ${pole1}}$.`,
                formulaHelper: k % 3 === 0 ? `F(s) = \\frac{${a}e^{-${t0}s}}{s+${b}}` : k % 3 === 1 ? `B = -\\frac{${a}}{${pole2 - pole1}}` : `x(\\infty) = \\frac{${b}}{${pole1}}`,
                expectedAnswer:
                  k % 3 === 0
                    ? `(${a}*e^(-${t0}s))/(s+${b})`
                    : k % 3 === 1
                    ? `-${a}/${pole2 - pole1}`
                    : `${b}/${pole1}`,
                acceptableAnswers:
                  k % 3 === 0
                    ? [`(${a}*e^(-${t0}s))/(s+${b})`, `${a}e^(-${t0}s)/(s+${b})`, `${a}e^-${t0}s/(s+${b})`, `(${a}e^{-${t0}s})/(s+${b})`]
                    : k % 3 === 1
                    ? [`-${a}/${pole2 - pole1}`, `-${a/(pole2 - pole1)}`, `-${(a/(pole2 - pole1)).toFixed(2)}`, `B=-${a}/${pole2 - pole1}`]
                    : [`${b}/${pole1}`, `${(b/pole1).toFixed(2)}`, `${b/pole1}`],
                explanationOnCorrect: `Exato! Resolução de Laplace impecável.`,
                hint: `Substitua $s = 0$ para obter a fração final do Teorema do Valor Final.`,
                inputType: 'math_text',
              },
            ],
          });
        } else if (ch === 4) {
          // ==========================================
          // CAPÍTULO 4: EQUAÇÕES DIFERENCIAIS (EDOs) (60 Exercícios Passo a Passo)
          // ==========================================
          const id = `step-ch4-${diff.toLowerCase().substring(0, 3)}-${questionIndex}`;
          const kGain = (k % 4) + 1;

          stepProblems.push({
            id,
            title: `Exercício ${questionIndex} (${diff} - Cap 4): Resolução de EDO Linear de 1ª Ordem via Laplace com $y(0) = ${y0}$`,
            chapter: 4,
            chapterName: 'Capítulo 4 – Equações Diferenciais (EDOs)',
            category: 'differential_equations',
            difficulty: diff,
            xpReward: baseReward,
            contextTheory: `A transformada de Laplace converte equações diferenciais lineares com coeficientes constantes em equações algébricas: $\\mathcal{L}\\{y\'(t)\\} = sY(s) - y(0)$. Isolando $Y(s)$, decompomos em frações parciais para obter a resposta total $y(t) = y_{natural}(t) + y_{forcada}(t)$.`,
            statement: `Resolva a equação diferencial ordinária de 1ª ordem para $t \\ge 0$:\n\n$$y'(t) + ${a}y(t) = ${b}, \\quad \\text{sujeita à condição inicial } y(0) = ${y0}$$`,
            finalSolutionLatex: `y(t) = \\frac{${b}}{${a}} + \\left(${y0} - \\frac{${b}}{${a}}\\right)e^{-${a}t}, \\quad t \\ge 0`,
            interpretationGuide: {
              objective: `Determinar a resposta completa $y(t)$ da EDO, combinando a resposta natural decorrente de $y(0) = ${y0}$ com a resposta forçada ao degrau ${b}u(t).`,
              givenData: [
                { label: 'Coeficiente da EDO', value: `a = ${a}` },
                { label: 'Entrada / Termo Forçante', value: `x(t) = ${b}u(t)` },
                { label: 'Condição Inicial', value: `y(0) = ${y0}` },
              ],
              strategy: [
                `1. Aplicar Laplace: $sY(s) - ${y0} + ${a}Y(s) = \\frac{${b}}{s}$.`,
                `2. Isolar $Y(s) = \\frac{${y0}s + ${b}}{s(s + ${a})}$.`,
                `3. Decompor em frações parciais $\\frac{A}{s} + \\frac{B}{s + ${a}}$ e aplicar a transformada inversa $\\mathcal{L}^{-1}$.`,
              ],
            },
            formulaGuide: {
              title: 'Transformada de Derivada e Degrau em Laplace',
              formulaLatex: '\\mathcal{L}\\{y\'(t)\\} = sY(s) - y(0), \\quad \\mathcal{L}\\{1\\} = \\frac{1}{s}',
              howToApply: `Substitua $y'(t) \\to sY(s) - ${y0}$, $y(t) \\to Y(s)$ e a constante ${b} \\to \\frac{${b}}{s}$.`,
            },
            steps: [
              {
                id: `${id}-step-1`,
                stepNumber: 1,
                instruction: `Aplique a Transformada de Laplace nos dois membros: $\\mathcal{L}\\{y\'(t) + ${a}y(t)\\} = \\mathcal{L}\\{${b}\\}$. Substitua a condição inicial $y(0) = ${y0}$. Como fica a equação algébrica em $Y(s)$?`,
                formulaHelper: `sY(s) - y(0) + ${a}Y(s) = \\frac{${b}}{s}`,
                expectedAnswer: `(s+${a})Y(s) - ${y0} = ${b}/s`,
                acceptableAnswers: [
                  `(s+${a})Y(s)-${y0}=${b}/s`,
                  `sY(s)-${y0}+${a}Y(s)=${b}/s`,
                  `sY(s)+${a}Y(s)-${y0}=${b}/s`,
                  `(s+${a})Y(s)=${y0}+${b}/s`,
                  `Y(s)(s+${a}) - ${y0} = ${b}/s`,
                ],
                explanationOnCorrect: `Muito bem! A derivada transformou-se em $sY(s) - ${y0}$ e a constante em $\\frac{${b}}{s}$.`,
                hint: `Lembre-se que $\\mathcal{L}\\{y\'\\} = sY(s) - y(0)$ e $\\mathcal{L}\\{${b}\\} = \\frac{${b}}{s}$.`,
                inputType: 'math_text',
              },
              {
                id: `${id}-step-2`,
                stepNumber: 2,
                instruction: `Some os termos do lado direito e isole $Y(s)$. Qual é a expressão algébrica simplificada de $Y(s)$?`,
                formulaHelper: `Y(s) = \\frac{${y0}s + ${b}}{s(s+${a})}`,
                expectedAnswer: `(${y0}s+${b})/(s(s+${a}))`,
                acceptableAnswers: [
                  `(${y0}s+${b})/(s(s+${a}))`,
                  `Y(s)=(${y0}s+${b})/(s(s+${a}))`,
                  `(${y0}s+${b})/(s^2+${a}s)`,
                  `${y0}/(s+${a}) + ${b}/(s(s+${a}))`,
                ],
                explanationOnCorrect: `Exato! Colocando sobre o mesmo denominador: $Y(s) = \\frac{${y0}s + ${b}}{s(s + ${a})}$.`,
                hint: `Some ${y0} + ${b}/s = (${y0}s + ${b})/s$ e divida por $(s + ${a})$.`,
                inputType: 'math_text',
              },
            ],
          });
        } else {
          // ==========================================
          // CAPÍTULO 5: ENGENHARIA ELÉTRICA & CIRCUITOS (60 Exercícios Passo a Passo)
          // ==========================================
          const id = `step-ch5-${diff.toLowerCase().substring(0, 3)}-${questionIndex}`;
          const rStep = (k % 5) + 2;
          const cStep = (k % 3) + 1;
          const tauVal = rStep * cStep;

          stepProblems.push({
            id,
            title: `Exercício ${questionIndex} (${diff} - Cap 5): Resposta Transitória e Constante de Tempo em Circuito RC ($R = ${rStep}\\,\\Omega, C = ${cStep}\\,\\text{F}$)`,
            chapter: 5,
            chapterName: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
            category: 'electrical_engineering',
            difficulty: diff,
            xpReward: baseReward,
            contextTheory: `Em circuitos RC excitados por degrau $V_{in}(s) = \\frac{V_0}{s}$, a LKV no domínio de Laplace com capacitor inicialmente descarregado fornece $V_C(s) = V_{in}(s) \\frac{1/sC}{R + 1/sC} = \\frac{V_0}{s(sRC + 1)} = \\frac{V_0 / (RC)}{s(s + 1/RC)}$. A constante de tempo é $\\tau = RC$.`,
            statement: `Um circuito RC série com $R = ${rStep}\\,\\Omega$, $C = ${cStep}\\,\\text{F}$ e tensão inicial nula ($v_C(0^-) = 0\\text{ V}$) é alimentado por uma fonte degrau de $V_0 = ${b}\\text{ V}$ em $t = 0$. Calcule $V_C(s)$ e a tensão no tempo $v_C(t)$ para $t \\ge 0$.`,
            finalSolutionLatex: `v_C(t) = ${b}\\left(1 - e^{-\\frac{t}{${tauVal}}}\\right)u(t)\\text{ V}`,
            interpretationGuide: {
              objective: `Determinar a transformada $V_C(s)$, a constante de tempo $\\tau = RC$ e a forma de onda de tensão $v_C(t)$ no capacitor através do divisor de tensão em Laplace.`,
              givenData: [
                { label: 'Resistência R', value: `${rStep} \\; \\Omega` },
                { label: 'Capacitância C', value: `${cStep} \\; \\text{F}` },
                { label: 'Tensão de Degrau V_0', value: `${b} \\text{ V}` },
                { label: 'Constante de Tempo', value: `\\tau = RC = ${tauVal} \\text{ s}` },
              ],
              strategy: [
                `1. Escrever o divisor de tensão: $V_C(s) = \\frac{${b}}{s} \\cdot \\frac{1/(s \\cdot ${cStep})}{${rStep} + 1/(s \\cdot ${cStep})}$.`,
                `2. Simplificar a fração: $V_C(s) = \\frac{${b}}{s(${tauVal}s + 1)} = \\frac{${b / tauVal} }{s(s + 1/${tauVal})}$.`,
                `3. Decompor em frações parciais e inverter para obter $v_C(t) = ${b}(1 - e^{-t/${tauVal}})u(t)$.`,
              ],
            },
            formulaGuide: {
              title: 'Divisor de Tensão em Laplace para Circuito RC',
              formulaLatex: 'V_C(s) = V_{in}(s) \\frac{1}{1 + sRC}, \\quad v_C(t) = V_0(1 - e^{-t/RC})u(t)',
              howToApply: `Substitua $R = ${rStep}$, $C = ${cStep}$ e $V_0 = ${b}$.`,
            },
            steps: [
              {
                id: `${id}-step-1`,
                stepNumber: 1,
                instruction: `Escreva a expressão de $V_C(s)$ na forma fatorada padrão $\\frac{K}{s(s + a)}$. Sabendo que $RC = ${tauVal}$, qual é o valor do polo $a = 1/RC$?`,
                formulaHelper: `a = \\frac{1}{RC} = \\frac{1}{${tauVal}}`,
                expectedAnswer: `1/${tauVal}`,
                acceptableAnswers: [
                  `1/${tauVal}`,
                  `${(1 / tauVal).toFixed(2)}`,
                  `${1 / tauVal}`,
                  `a=1/${tauVal}`,
                  `s=-1/${tauVal}`,
                ],
                explanationOnCorrect: `Muito bem! O polo está localizado em $s = -\\frac{1}{RC} = -\\frac{1}{${tauVal}}$, definindo a taxa de decaimento natural do circuito.`,
                hint: `Calcule $1 / (${rStep} \\times ${cStep}) = 1/${tauVal}$.`,
                inputType: 'math_text',
              },
              {
                id: `${id}-step-2`,
                stepNumber: 2,
                instruction: `Qual é o valor final da tensão no capacitor em regime permanente $v_C(\\infty)$ quando $t \\to \\infty$?`,
                formulaHelper: `v_C(\\infty) = \\lim_{s \\to 0} s V_C(s) = V_0`,
                expectedAnswer: `${b}`,
                acceptableAnswers: [`${b}`, `${b}V`, `${b} V`, `v_C(\\infty)=${b}`],
                explanationOnCorrect: `Exato! Em regime permanente CC, o capacitor fica totalmente carregado com a tensão da fonte $V_0 = ${b}\\text{ V}$.`,
                hint: `Em regime permanente, o capacitor atua como circuito aberto e atinge a tensão da fonte $V_0$.`,
                inputType: 'math_text',
              },
            ],
          });
        }
      }
    }
  }

  return {
    stepProblems,
    mcProblems,
  };
}

// Pre-generate problems singleton
const generated = generateQuestionBank();
export const ALL_STEP_BY_STEP_PROBLEMS = generated.stepProblems;
export const ALL_MULTIPLE_CHOICE_PROBLEMS = generated.mcProblems;

