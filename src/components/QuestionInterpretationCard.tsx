import React, { useState } from 'react';
import { InterpretationGuide } from '../types';
import { MathView } from './MathView';
import {
  Compass,
  Target,
  FileSearch,
  ListOrdered,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface QuestionInterpretationCardProps {
  guide?: InterpretationGuide;
  defaultExpanded?: boolean;
  className?: string;
}

export const QuestionInterpretationCard: React.FC<QuestionInterpretationCardProps> = ({
  guide,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!guide) return null;

  return (
    <div
      className={`rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-900 overflow-hidden shadow-lg transition-all ${className}`}
    >
      {/* Header / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-sky-500/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Como Interpretar a Questão & Saber Fazer
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                Guia Estratégico
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Passo a passo de interpretação, dados extraídos e plano de voo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold shrink-0">
          <span>{isExpanded ? 'Recolher Guia' : 'Ver Interpretação'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-sky-500/20 animate-fade-in text-xs sm:text-sm">
          {/* 1. O que a questão realmente pede */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-sky-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-300 font-bold">
              <Target className="w-4 h-4 text-sky-400" />
              <span>1. Objetivo Principal (O que a questão pede):</span>
            </div>
            <p className="text-slate-200 pl-6 leading-relaxed">
              <MathView math={guide.objective} />
            </p>
          </div>

          {/* 2. Dados Identificados no Enunciado */}
          {guide.givenData && guide.givenData.length > 0 && (
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <FileSearch className="w-4 h-4 text-indigo-400" />
                <span>2. Dados Identificados do Enunciado:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                {guide.givenData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <span className="text-slate-400 font-medium text-xs">{item.label}:</span>
                    <span className="text-slate-100 font-mono text-xs font-semibold text-right">
                      <MathView math={item.value} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Roteiro / Plano de Resolução ("Como Saber Fazer") */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-900/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ListOrdered className="w-4 h-4 text-emerald-400" />
              <span>3. Roteiro de Resolução (Como Saber Fazer):</span>
            </div>
            <ol className="space-y-2 pl-2">
              {guide.strategy.map((stepStr, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-200 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <MathView math={stepStr} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* 4. Armadilhas e Cuidados Comuns */}
          {guide.pitfalls && (
            <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300">Atenção / Armadilha Comum: </span>
                <MathView math={guide.pitfalls} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionInterpretationCard;
