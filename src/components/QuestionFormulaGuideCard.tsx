import React, { useState } from 'react';
import { QuestionFormulaGuide } from '../types';
import { MathView } from './MathView';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  CheckCircle2,
  Table
} from 'lucide-react';

interface QuestionFormulaGuideCardProps {
  guide?: QuestionFormulaGuide;
  defaultExpanded?: boolean;
  className?: string;
}

export const QuestionFormulaGuideCard: React.FC<QuestionFormulaGuideCardProps> = ({
  guide,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!guide) return null;

  return (
    <div
      className={`rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 overflow-hidden shadow-lg transition-all ${className}`}
    >
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Formulário da Questão & Como Usá-lo
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {guide.title}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fórmula matemática exata e como substituir os termos desta questão
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold shrink-0">
          <span>{isExpanded ? 'Recolher Formulário' : 'Ver Fórmulas'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Formula Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-amber-500/20 animate-fade-in text-xs sm:text-sm">
          {/* Main Formula in LaTeX */}
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 text-center space-y-1 shadow-inner">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              {guide.title}
            </span>
            <div className="text-base sm:text-lg text-slate-100 overflow-x-auto py-1">
              <MathView math={guide.formulaLatex} block={true} />
            </div>
          </div>

          {/* How to Apply Section */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Como aplicar na prática nesta questão:</span>
            </div>
            <div className="text-slate-200 pl-6 leading-relaxed">
              <MathView math={guide.howToApply} />
            </div>
          </div>

          {/* Variables Mapped to this specific problem */}
          {guide.variableMap && guide.variableMap.length > 0 && (
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Table className="w-4 h-4 text-indigo-400" />
                <span>Mapeamento de Variáveis para Substituição:</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5 px-3 font-semibold">Símbolo na Fórmula</th>
                      <th className="py-1.5 px-3 font-semibold">Significado</th>
                      <th className="py-1.5 px-3 font-semibold">Valor nesta Questão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guide.variableMap.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-900/60">
                        <td className="py-2 px-3 text-amber-300 font-bold">
                          <MathView math={v.symbol} />
                        </td>
                        <td className="py-2 px-3 text-slate-300 font-sans">{v.meaning}</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">
                          <MathView math={v.valueInQuestion} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Steps To Follow */}
          {guide.stepsToFollow && guide.stepsToFollow.length > 0 && (
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Passo a passo com a fórmula:</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-slate-200">
                {guide.stepsToFollow.map((step, idx) => (
                  <li key={idx}>
                    <MathView math={step} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionFormulaGuideCard;
