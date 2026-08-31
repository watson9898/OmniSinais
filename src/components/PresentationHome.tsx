import React from 'react';
import { StudentProfile } from '../types';
import { CHAPTERS_DATA, ChapterMeta } from '../data/chaptersData';
import {
  BookOpen,
  PenTool,
  CheckCircle2,
  Sliders,
  Trophy,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Layers,
  Activity,
  Radio,
  Waves,
  Cpu,
  GraduationCap,
  Download,
  Coffee,
  CircleDollarSign,
  Coins,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  ShieldCheck,
  Lock,
  Mail,
  UserCheck,
  EyeOff,
  ExternalLink,
  KeyRound,
  Calculator,
} from 'lucide-react';
import { MathView } from './MathView';

interface PresentationHomeProps {
  profile: StudentProfile;
  totalStepProblemsCount: number;
  totalQuizProblemsCount: number;
  onStartStudying: () => void;
  onSelectChapter: (chapterNum: number) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenFormulas: () => void;
  onOpenResponseGraphs: () => void;
  onOpenCalculator: () => void;
  onOpenBlackboard?: () => void;
  onOpenNotebook: () => void;
  onOpenVisualizer: () => void;
  onOpenLeaderboard: () => void;
  onOpenKofi: () => void;
}

export const PresentationHome: React.FC<PresentationHomeProps> = ({
  profile,
  totalStepProblemsCount,
  totalQuizProblemsCount,
  onStartStudying,
  onSelectChapter,
  onOpenProfile,
  onOpenAuth,
  onOpenFormulas,
  onOpenResponseGraphs,
  onOpenCalculator,
  onOpenBlackboard,
  onOpenNotebook,
  onOpenVisualizer,
  onOpenLeaderboard,
  onOpenKofi,
}) => {
  const totalResolved = profile.completedProblems.length + profile.completedQuizIds.length;
  const totalQuestions = totalStepProblemsCount + totalQuizProblemsCount;
  const progressPercent = Math.min(100, Math.round((totalResolved / (totalQuestions || 1)) * 100));

  const isUserAuthenticated = profile.authData?.isLoggedIn;
  const userEmail = profile.authData?.email;
  const authProvider = profile.authData?.authProvider;

  const getChapterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Waves':
        return <Waves className="w-5 h-5" />;
      case 'Radio':
        return <Radio className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Hero Banner with Brand & Direct Action */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 border border-indigo-500/20 shadow-xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Engenharia Elétrica & Computação • Sinais & Sistemas</span>
            </div>

            {/* Privacy & Account Status Tag */}
            <div
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md cursor-pointer transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isUserAuthenticated
                  ? `Conta Protegida • ${authProvider === 'google' ? 'Google' : authProvider === 'apple' ? 'Apple' : 'E-mail'}`
                  : 'Salvar Progresso • Cadastro Sigiloso'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              OmniSinais
            </h1>
            <p className="text-lg sm:text-xl text-indigo-200/90 font-medium">
              Plataforma Estruturada de Resolução e Estudo Interativo
            </p>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Aprenda Sinais, Fourier, Transformada de Laplace e EDOs através de um fluxo pedagógico guiado em 3 etapas: escolha o tema, selecione a questão e resolva com deduções passo a passo e caderno de rascunhos integrado.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-start-studying-btn"
              onClick={onStartStudying}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Começar Estudos • Escolher Capítulo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-notebook-btn"
              onClick={onOpenNotebook}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Caderno de Resolvidos ({totalResolved})</span>
            </button>

            <button
              id="hero-auth-btn"
              onClick={onOpenAuth}
              className="px-4 py-3.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-100 font-semibold text-sm rounded-2xl border border-indigo-400/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              <span>{isUserAuthenticated ? 'Minha Conta & Sigilo' : 'Salvar Meu Cadastro'}</span>
            </button>

            <button
              id="hero-response-graphs-btn"
              onClick={onOpenResponseGraphs}
              className="px-4 py-3.5 bg-gradient-to-r from-sky-500/30 to-indigo-500/30 hover:from-sky-500/45 hover:to-indigo-500/45 text-sky-200 font-semibold text-sm rounded-2xl border border-sky-400/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Acessar os gráficos de resposta de todos os exercícios para consulta pré-cálculo e conferência"
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Gráficos de Resposta & Pré-Cálculo</span>
            </button>

            <button
              id="hero-calculator-btn"
              onClick={onOpenCalculator}
              className="px-4 py-3.5 bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/45 hover:to-orange-500/45 text-amber-200 font-semibold text-sm rounded-2xl border border-amber-400/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Abrir calculadora científica com gráficos 2D e 3D em tempo real"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Calculadora & Gráfico 2D/3D</span>
            </button>
          </div>
        </div>
      </section>

      {/* Cadastro do Aluno & Garantia de Sigilo dos Dados Card */}
      <section className="bg-gradient-to-r from-indigo-900/10 via-sky-900/10 to-indigo-900/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isUserAuthenticated
                    ? 'Registro e Progresso Sincronizados com Sigilo Total'
                    : 'Cadastre-se para Garantir seus Pontos e Histórico'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  100% Confidencial
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {isUserAuthenticated ? (
                  <>
                    Conectado com sucesso via <strong className="text-indigo-600 dark:text-indigo-300">{authProvider?.toUpperCase()}</strong> ({userEmail || profile.name}). Seus pontos XP ({profile.xp}), histórico de resolução e caderno estão salvos com privacidade absoluta.
                  </>
                ) : (
                  <>
                    Entre com seu <strong>Google (Gmail)</strong>, <strong>Apple ID</strong> ou e-mail. Seus dados permanecem em total sigilo acadêmico — o cadastro serve apenas para preservar seus pontos e resoluções.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenAuth}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isUserAuthenticated ? 'Gerenciar Conta & Backup' : 'Entrar / Salvar Cadastro'}</span>
            </button>

            <button
              onClick={onOpenKofi}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/40 dark:to-amber-950/40 hover:from-emerald-100 hover:to-amber-100 dark:hover:from-emerald-900/50 dark:hover:to-amber-900/50 text-slate-800 dark:text-slate-200 border border-emerald-300 dark:border-emerald-800/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Apoie o desenvolvedor voluntariamente via PIX ou Ko-fi"
            >
              <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Apoiar o Desenvolvedor</span>
            </button>
          </div>
        </div>
      </section>

      {/* Student Overview & Gamification Stats Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Student Profile Info */}
          <div className="flex items-center gap-4">
            <div
              onClick={onOpenProfile}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-100 to-sky-100 dark:from-indigo-950/80 dark:to-slate-800 border-2 border-indigo-300 dark:border-indigo-700/60 flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:scale-105 transition-transform"
              title="Editar Perfil do Estudante"
            >
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {profile.name || 'Estudante'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  Nível {profile.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                {profile.course} • {profile.university}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={onOpenProfile}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Editar Perfil & RA →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 shrink-0">
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">XP Acumulado</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-200 font-mono">
                {profile.xp}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Ofensiva
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-200 font-mono">
                {profile.streakDays} dias
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">Resolvidas</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200 font-mono">
                {totalResolved}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block">Conclusão</span>
              <span className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-200 font-mono">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Methodology Presentation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Como Funciona a Jornada de Aprendizado
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fluxo simplificado em 3 etapas sequenciais para máximo rendimento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div
            onClick={onStartStudying}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                1
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                1ª Etapa
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Escolha do Tema ou Capítulo
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Selecione o módulo temático da matéria: Sinais Básicos, Fourier, Laplace, EDOs ou Circuitos Elétricos.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Explorar Capítulos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={onStartStudying}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                2
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                2ª Etapa
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Seleção da Questão
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Filtre por nível de dificuldade e escolha praticar no modo Passo a Passo (dedução guiada) ou Quizzes rápidos de múltipla escolha.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Ver Banco de Questões</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={onStartStudying}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                3
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                3ª Etapa
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Espaço de Resolução & Rascunho
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Resolva com roteiro interpretativo, consulte fórmulas da questão, insira equações no teclado virtual e anote no caderno de deduções.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Abrir Resolvedor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Overview Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Capítulos do Programa de Engenharia
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique em qualquer capítulo para navegar diretamente para a seleção de questões daquele tema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHAPTERS_DATA.map((ch) => (
            <div
              key={ch.num}
              onClick={() => onSelectChapter(ch.num)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group select-none hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${ch.gradient} text-white shadow-sm`}>
                    {getChapterIcon(ch.iconName)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ch.badgeColor}`}>
                    Capítulo {ch.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {ch.description}
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Tópicos Principais:
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {ch.topics.slice(0, 3).map((topic, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                  Ver Questões do Capítulo
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-slate-400">
                  Passo a Passo & Quizzes
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Auxiliary Learning Tools Showcase */}
      <section className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Recursos Auxiliares Disponíveis na Barra Superior
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ferramentas interativas para enriquecer seus estudos a qualquer momento
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <button
            onClick={onOpenResponseGraphs}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-left transition-all hover:shadow-sm cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">Gráficos de Resposta & Pré-Cálculo</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Gabarito gráfico interativo 2D/3D de todos os exercícios para consulta prévia e conferência de resultados.
            </p>
          </button>

          <button
            onClick={onOpenCalculator}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 text-left transition-all hover:shadow-sm cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">Calculadora & Gráficos 2D/3D</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Calcule qualquer equação matemática ou sinal livremente com plotagem 2D e superfície 3D em tempo real.
            </p>
          </button>

          <button
            onClick={onOpenFormulas}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 text-left transition-all hover:shadow-sm cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Formulário Geral</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tabelas completas de pares de Laplace, Fourier, propriedades e derivadas.
            </p>
          </button>

          <button
            onClick={onOpenVisualizer}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-left transition-all hover:shadow-sm cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Simulador de Sinais</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Canvas interativo com síntese de Fourier, plano complexo s e polos/zeros.
            </p>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700 text-left transition-all hover:shadow-sm cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <Trophy className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ranking Online</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Compare seu XP com outros alunos de Engenharia e suba de nível.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
