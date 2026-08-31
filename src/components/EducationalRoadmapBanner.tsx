import React, { useState } from 'react';
import {
  Compass,
  GraduationCap,
  BookOpen,
  PenTool,
  CheckCircle2,
  Sliders,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Layers,
  ArrowRight,
  Calculator,
  Target
} from 'lucide-react';

interface EducationalRoadmapBannerProps {
  onNavigateTab?: (tab: 'step_by_step' | 'multiple_choice' | 'visualizer' | 'leaderboard' | 'resolved_notebook') => void;
}

export const EducationalRoadmapBanner: React.FC<EducationalRoadmapBannerProps> = ({ onNavigateTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const stages = [
    {
      step: 1,
      title: 'Passo a Passo Guiado',
      subtitle: 'Aprenda a Estruturar a Solução',
      tabKey: 'step_by_step' as const,
      icon: PenTool,
      color: 'from-indigo-600 to-indigo-700',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      description:
        'Resolva exercícios divididos em micro-etapas cognitivas com validação de expressões matemáticas, dicas e cartões de interpretação de enunciados.',
      keySkills: ['Identificar dados e variáveis', 'Aplicar propriedades de sinais', 'Evitar armadilhas comuns de cálculo'],
    },
    {
      step: 2,
      title: 'Múltipla Escolha com Rascunho',
      subtitle: 'Teste Rápido & Caderno de Contas',
      tabKey: 'multiple_choice' as const,
      icon: CheckCircle2,
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
      description:
        'Pratique questões orientadas com justificativas para cada alternativa e um espaço dedicado de rascunho de cálculos com editor de equações.',
      keySkills: ['Velocidade de raciocínio', 'Verificação com dicas teóricas', 'Registro permanente do rascunho'],
    },
    {
      step: 3,
      title: 'Simulador Visual de Sinais',
      subtitle: 'Visualização Gráfica & Intuição Geométrica',
      tabKey: 'visualizer' as const,
      icon: Sliders,
      color: 'from-sky-600 to-sky-700',
      textColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
      description:
        'Altere frequências, polos, ordens e harmônicos em tempo real no canvas gráfico interativo para fixar o comportamento no tempo e frequência.',
      keySkills: ['Plano complexo s e polos', 'Síntese de Fourier em tempo real', 'Comportamento transitório'],
    },
    {
      step: 4,
      title: 'Caderno de Resolvidos & Progresso',
      subtitle: 'Revisão Contínua & Consolidação',
      tabKey: 'resolved_notebook' as const,
      icon: BookOpen,
      color: 'from-emerald-600 to-emerald-700',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      description:
        'Consulte todas as questões resolvidas, revise seus rascunhos de cálculo salvos, imprima resumos para estudo e acompanhe a taxa de domínio por matéria.',
      keySkills: ['Revisão antes das provas', 'Histórico de notas e cálculos', 'Exportação de relatórios PDF'],
    },
  ];

  const chaptersOverview = [
    {
      num: 1,
      title: 'Capítulo 1 – Sinais & Sistemas',
      topics: 'Paridade, Energia & Potência, Convolução Contínua e Discreta, Linearidade e Invariância no Tempo (LTI).',
      badge: '60+ Exercícios Passo a Passo & 300 Quizzes',
    },
    {
      num: 2,
      title: 'Capítulo 2 – Série & Transformada de Fourier',
      topics: 'Série Trigonométrica e Exponencial, Harmônicos, Espectro de Magnitude e Fase, Teorema de Parseval e Resposta em Frequência.',
      badge: '60+ Exercícios Passo a Passo & 300 Quizzes',
    },
    {
      num: 3,
      title: 'Capítulo 3 – Transformação de Laplace',
      topics: 'Laplace Unilateral, Região de Convergência (ROC), Teorema do Valor Final/Inicial, Decomposição em Frações Parciais e Inversão.',
      badge: '60+ Exercícios Passo a Passo & 300 Quizzes',
    },
    {
      num: 4,
      title: 'Capítulo 4 – Equações Diferenciais (EDOs)',
      topics: 'EDOs Lineares de 1ª e 2ª Ordem com Condições Iniciais, Resposta ao Degrau, Resposta Natural e Forçada, Estabilidade BIBO.',
      badge: '60+ Exercícios Passo a Passo & 300 Quizzes',
    },
    {
      num: 5,
      title: 'Capítulo 5 – Engenharia Elétrica & Circuitos',
      topics: 'Circuitos RC, RL e RLC no Domínio de Laplace, Filtros Ativos com Op-Amp, Impedância Operacional Z(s) e Diagrama de Bode.',
      badge: '60+ Exercícios Passo a Passo & 300 Quizzes',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors">
      {/* Collapsed Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Guia Pedagógico & Roteiro de Estudos de Sinais & Sistemas
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hidden md:inline-block">
                Metodologia Ativa de Engenharia
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Aprenda de forma estruturada: Teoria → Resolução Guiada → Testes com Rascunho → Caderno Salvo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            {isExpanded ? (
              <>
                <span>Recolher Roteiro</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Explorar Roteiro de Estudos</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Educational Roadmap */}
      {isExpanded && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
          {/* 4 Learning Stages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Trilha de Aprendizado Recomendada:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {stages.map((stg, idx) => {
                const IconComponent = stg.icon;
                return (
                  <div
                    key={stg.step}
                    onDoubleClick={() => onNavigateTab?.(stg.tabKey)}
                    title="Clique para ver detalhes ou clique duplo para ir direto a esta etapa"
                    className={`p-4 rounded-2xl border transition-all ${stg.bgColor} flex flex-col justify-between cursor-pointer select-none hover:shadow-md hover:scale-[1.01]`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold flex items-center justify-center text-slate-800 dark:text-slate-200">
                          {stg.step}
                        </span>
                        <IconComponent className={`w-4 h-4 ${stg.textColor}`} />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {stg.title}
                        </h4>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {stg.subtitle}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {stg.description}
                      </p>
                    </div>

                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab(stg.tabKey)}
                        className={`mt-4 w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 ${stg.textColor} flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer`}
                      >
                        Abrir Esta Etapa
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chapters & Syllabus Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Ementa e Conteúdo Programático por Capítulo:
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold normal-case hidden sm:inline">
                Clique duplo abre os exercícios do capítulo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {chaptersOverview.map((ch) => (
                <div
                  key={ch.num}
                  onDoubleClick={() => onNavigateTab?.('step_by_step')}
                  title="Clique duplo para abrir os exercícios de passo a passo deste capítulo"
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 cursor-pointer select-none transition-all hover:scale-[1.01] hover:border-indigo-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      Capítulo {ch.num}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                      60+ Exercícios
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {ch.title.split('–')[1] || ch.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ch.topics}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Study Advice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong className="text-amber-800 dark:text-amber-300 font-bold block">
                Dica de Ouro para Engenharia:
              </strong>
              Ao resolver as questões de múltipla escolha, use o espaço de rascunho abaixo das alternativas para anotar os dados, a fórmula canônica e o desenvolvimento algébrico. Seus rascunhos ficam salvos na aba <strong>5. Caderno de Exercícios Resolvidos</strong> para você revisar antes das provas!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
