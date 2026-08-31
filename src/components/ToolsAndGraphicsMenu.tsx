import React, { useState } from 'react';
import {
  X,
  Compass,
  Activity,
  Sliders,
  Calculator,
  BookOpen,
  Sparkles,
  Layers,
  Waves,
  Cpu,
  PenTool,
  ArrowRight,
  Zap,
  Grid,
  Radio,
  FileCheck,
  TrendingUp,
  Boxes,
} from 'lucide-react';

export interface ToolItem {
  id: string;
  title: string;
  category: 'graphics' | 'simulators' | 'calculators' | 'reference';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  actionType: 'open-response-graphs' | 'open-blackboard' | 'open-visualizer' | 'open-calculator' | 'open-formulas' | 'open-notebook' | 'open-exercises';
  previewMath?: string;
  features: string[];
}

interface ToolsAndGraphicsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResponseGraphs?: () => void;
  onOpenBlackboard: () => void;
  onOpenVisualizer: () => void;
  onOpenCalculator: () => void;
  onOpenFormulas: () => void;
  onOpenNotebook: () => void;
  onOpenExercises: () => void;
}

export const ToolsAndGraphicsMenu: React.FC<ToolsAndGraphicsMenuProps> = ({
  isOpen,
  onClose,
  onOpenResponseGraphs,
  onOpenBlackboard,
  onOpenVisualizer,
  onOpenCalculator,
  onOpenFormulas,
  onOpenNotebook,
  onOpenExercises,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'graphics' | 'simulators' | 'calculators' | 'reference'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const tools: ToolItem[] = [
    {
      id: 'gabarito-grafico-exercicios',
      title: 'Gráficos de Resposta & Consulta Pré-Cálculo',
      category: 'graphics',
      categoryLabel: 'Gabarito Gráfico',
      description: 'Acesse os gráficos 2D e 3D de todos os exercícios da plataforma para entender o comportamento esperado antes de resolver e conferir a resposta correta após os cálculos.',
      icon: Activity,
      iconBg: 'bg-sky-500/20 border-sky-500/30',
      iconColor: 'text-sky-400',
      badge: 'Todos os Exercícios',
      actionType: 'open-response-graphs',
      previewMath: 'y(t) \\quad H(s) \\quad |X(j\\omega)|',
      features: ['Consulta visual pré-cálculo', 'Conferência de gabarito passo a passo', 'Gráficos temporais 2D Antes vs Depois', 'Superfície de Laplace e Fourier em 3D'],
    },
    {
      id: 'simulador-2d-3d',
      title: 'Simulador de Equações 2D e 3D',
      category: 'simulators',
      categoryLabel: 'Simulador & Gráficos',
      description: 'Digite qualquer equação matemática ou desenhe à mão na lousa digital para gerar gráficos 2D e superfícies 3D no plano complexo instantaneamente.',
      icon: Boxes,
      iconBg: 'bg-emerald-500/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: 'Gráficos 2D + 3D WebGL',
      actionType: 'open-blackboard',
      previewMath: 'z = f(x,y) \\quad |H(\\sigma + j\\omega)|',
      features: ['Digitação livre de equações', 'Reconhecimento OCR de escrita', 'Gráfico 2D cartesiano contínuo', 'Superfície 3D com rotação 360°'],
    },
    {
      id: 'diagrama-bode',
      title: 'Diagrama de Bode (Magnitude & Fase)',
      category: 'graphics',
      categoryLabel: 'Gráficos & Espectros',
      description: 'Analise a resposta em frequência de sistemas lineares contínuos com curvas assintóticas de ganho em dB e defasagem angular.',
      icon: Activity,
      iconBg: 'bg-indigo-500/20 border-indigo-500/30',
      iconColor: 'text-indigo-400',
      badge: 'Frequência Logarítmica',
      actionType: 'open-visualizer',
      previewMath: '|H(j\\omega)|_{dB} = 20\\log_{10}|H(j\\omega)|',
      features: ['Frequência de corte ajustável', 'Margem de fase e ganho', 'Gráfico semi-logarítmico', 'Visualização em tempo real'],
    },
    {
      id: 'polos-zeros',
      title: 'Diagrama de Polos e Zeros (Plano s & Plano z)',
      category: 'graphics',
      categoryLabel: 'Gráficos & Espectros',
      description: 'Mapeamento visual de estabilidade no plano complexo, localização de singularidades e Região de Convergência (ROC).',
      icon: Sliders,
      iconBg: 'bg-amber-500/20 border-amber-500/30',
      iconColor: 'text-amber-400',
      badge: 'Plano Complexo s & z',
      actionType: 'open-visualizer',
      previewMath: 'H(s) = \\frac{K\\prod (s - z_i)}{\\prod (s - p_k)}',
      features: ['Marcação X para polos e O para zeros', 'Círculo unitário (Plano Z)', 'Eixo imaginário jω (Plano S)', 'Critério de estabilidade BIBO'],
    },
    {
      id: 'resposta-tempo',
      title: 'Resposta no Tempo (Impulso & Degrau)',
      category: 'graphics',
      categoryLabel: 'Gráficos & Sinais',
      description: 'Simulação interativa da dinâmica temporal de sistemas de 1ª e 2ª ordem sob excitações canônicas.',
      icon: Waves,
      iconBg: 'bg-cyan-500/20 border-cyan-500/30',
      iconColor: 'text-cyan-400',
      badge: 'Dinâmica Temporal',
      actionType: 'open-visualizer',
      previewMath: 'y(t) = 1 - e^{-\\zeta\\omega_n t}\\left[\\cos(\\omega_d t) + \\dots\\right]',
      features: ['Ajuste de fator de amortecimento ζ', 'Tempo de subida e acomodação', 'Overshoot / Sobressinal percentual', 'Visualização de envelope exponencial'],
    },
    {
      id: 'convolucao-grafica',
      title: 'Laboratório de Convolução Contínua & Discreta',
      category: 'simulators',
      categoryLabel: 'Simuladores',
      description: 'Animação passo a passo do sinal deslizante x(τ) com a resposta ao impulso h(t-τ) e cálculo da integral de superposição.',
      icon: Layers,
      iconBg: 'bg-purple-500/20 border-purple-500/30',
      iconColor: 'text-purple-400',
      badge: 'Animação Interativa',
      actionType: 'open-visualizer',
      previewMath: '(x * h)(t) = \\int_{-\\infty}^{\\infty} x(\\tau)h(t-\\tau)\\,d\\tau',
      features: ['Sinais retangulares, triangulares e exponenciais', 'Controle de tempo t móvel', 'Área hachurada de sobreposição', 'Gráfico resultante y(t)'],
    },
    {
      id: 'calculadora-casio',
      title: 'Calculadora Científica de Engenharia',
      category: 'calculators',
      categoryLabel: 'Calculadoras',
      description: 'Teclado científico completo com suporte a frações, potências, trigonometria, constantes e operações com números complexos.',
      icon: Calculator,
      iconBg: 'bg-emerald-500/20 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: 'Notação Matemática',
      actionType: 'open-calculator',
      previewMath: 'e^{j\\theta} = \\cos\\theta + j\\sin\\theta',
      features: ['Modo Frações e Potências', 'Número imaginário j / i', 'Conversão polar e retangular', 'Histórico de cálculos'],
    },
    {
      id: 'guia-formulas',
      title: 'Guia de Fórmulas & Teoremas de Transformadas',
      category: 'reference',
      categoryLabel: 'Referência',
      description: 'Tabela periódica interativa com todas as propriedades, pares de transformadas de Laplace, Fourier e Z com busca rápida.',
      icon: BookOpen,
      iconBg: 'bg-blue-500/20 border-blue-500/30',
      iconColor: 'text-blue-400',
      badge: 'Tabela Rápida',
      actionType: 'open-formulas',
      previewMath: '\\mathcal{L}\\{e^{-at}u(t)\\} = \\frac{1}{s+a}',
      features: ['Teorema do Valor Inicial e Final', 'Deslocamento no tempo e frequência', 'Diferenciação e integração', 'Filtro por categorias'],
    },
    {
      id: 'caderno-anotacoes',
      title: 'Caderno de Anotações & Exercícios Resolvidos',
      category: 'reference',
      categoryLabel: 'Referência',
      description: 'Registro detalhado de seu histórico de estudos, resoluções passo a passo, fórmulas salvas e exportação em formato texto.',
      icon: FileCheck,
      iconBg: 'bg-rose-500/20 border-rose-500/30',
      iconColor: 'text-rose-400',
      badge: 'Progresso & Backup',
      actionType: 'open-notebook',
      previewMath: '\\text{Histórico salvo com sigilo}',
      features: ['Armazenamento seguro', 'Exportação de resoluções', 'Anotações livres de estudo', 'Controle de XP'],
    },
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesFilter = selectedFilter === 'all' || tool.category === selectedFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleToolAction = (tool: ToolItem) => {
    onClose();
    switch (tool.actionType) {
      case 'open-response-graphs':
        if (onOpenResponseGraphs) onOpenResponseGraphs();
        else onOpenVisualizer();
        break;
      case 'open-blackboard':
        onOpenBlackboard();
        break;
      case 'open-visualizer':
        onOpenVisualizer();
        break;
      case 'open-calculator':
        onOpenCalculator();
        break;
      case 'open-formulas':
        onOpenFormulas();
        break;
      case 'open-notebook':
        onOpenNotebook();
        break;
      case 'open-exercises':
        onOpenExercises();
        break;
      default:
        onOpenVisualizer();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border-b border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">
                  Hub de Gráficos & Ferramentas de Engenharia
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Catálogo Completo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore todos os simuladores visuais, gráficos 2D/3D, calculadoras e ferramentas analíticas disponíveis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todas ({tools.length})
            </button>
            <button
              onClick={() => setSelectedFilter('simulators')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'simulators'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Simuladores & 3D
            </button>
            <button
              onClick={() => setSelectedFilter('graphics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'graphics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Gráficos & Espectros
            </button>
            <button
              onClick={() => setSelectedFilter('calculators')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'calculators'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Calculadoras
            </button>
            <button
              onClick={() => setSelectedFilter('reference')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'reference'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Fórmulas & Notas
            </button>
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar ferramenta ou gráfico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => handleToolAction(tool)}
                className="group relative p-4 sm:p-5 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              >
                <div>
                  {/* Top line with Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${tool.iconBg} border flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {tool.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {tool.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-3.5">
                    {tool.description}
                  </p>

                  {/* Key Features list */}
                  <div className="grid grid-cols-2 gap-1.5 mb-4">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 shrink-0"></span>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Trigger Action Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {tool.previewMath ? `fx: ${tool.previewMath}` : 'Pronto para uso'}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <span>Abrir Ferramenta</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-between px-6 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Todas as ferramentas funcionam livremente e em modo independente.
          </span>
          <button
            onClick={onClose}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
          >
            Fechar Menu
          </button>
        </div>
      </div>
    </div>
  );
};
