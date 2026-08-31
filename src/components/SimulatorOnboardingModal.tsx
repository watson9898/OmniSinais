import React from 'react';
import {
  Boxes,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Layers,
  Compass,
  RotateCw,
  Eye,
} from 'lucide-react';

interface SimulatorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator: () => void;
}

export const SimulatorOnboardingModal: React.FC<SimulatorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenSimulator,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden animate-scale-up text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]">
        {/* Glowing Top Ambient Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Fechar guia"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-emerald-100 border border-white/30 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>Dica de Aprendizado • OmniSinais</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Parabéns pelo seu 1º Exercício Resolvido! 🎉
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-md">
              Para fixar o conteúdo de Engenharia, use o <strong className="text-white underline decoration-amber-400 font-extrabold">Simulador 2D/3D</strong> para enxergar o comportamento físico de cada resposta.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Top Bar Callout Spotlight Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-start gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 shrink-0">
              <Boxes className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                  Onde Encontrar a Ferramenta
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                O botão <strong className="text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">Simulador 2D/3D</strong> fica permanentemente fixado no topo da tela e no final de cada questão resolvida.
              </p>
            </div>
          </div>

          {/* 3 Pillars of the Simulator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
            {/* Card 1: 2D */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Activity className="w-4 h-4" />
                <span>Gráficos 2D</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                Curvas de resposta temporal <strong className="font-mono">y(t)</strong>, degrau e polos no plano complexo.
              </p>
            </div>

            {/* Card 2: 3D */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-xs">
                <RotateCw className="w-4 h-4" />
                <span>Superfície 3D</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                Módulo <strong className="font-mono">|H(s)|</strong> tridimensional com rotação e zoom interativo.
              </p>
            </div>

            {/* Card 3: OCR & Paste */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Lousa & OCR</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                Escreva fórmulas à mão com giz digital ou cole expressões para plotar na hora.
              </p>
            </div>
          </div>

          {/* Quick interactive tip */}
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Você pode abrir o simulador a qualquer momento para testar suas próprias equações de aula!
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer text-center"
          >
            Entendido, Continuar Estudando
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSimulator();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Boxes className="w-4 h-4" />
            <span>Experimentar Simulador 2D/3D Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
