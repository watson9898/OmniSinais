import React, { useState } from 'react';
import { FORMULA_CARDS } from '../data/formulasData';
import { MathView } from './MathView';
import { BookOpen, Search, X, Layers } from 'lucide-react';

interface FormulaReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaReferenceModal: React.FC<FormulaReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  if (!isOpen) return null;

  const filteredFormulas = FORMULA_CARDS.filter((f) => {
    if (selectedChapter === '1' && !f.chapter.includes('Capítulo 1')) return false;
    if (selectedChapter === '2' && !f.chapter.includes('Capítulo 2')) return false;
    if (selectedChapter === '3' && !f.chapter.includes('Capítulo 3')) return false;
    if (selectedChapter === '4' && !f.chapter.includes('Capítulo 4')) return false;
    if (selectedChapter === '5' && !f.chapter.includes('Capítulo 5')) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.chapter.toLowerCase().includes(q) ||
      f.ruleCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Formulário & Teoremas da Matéria
              </h3>
              <p className="text-xs text-slate-400">
                Propriedades de Sinais, Série de Fourier, Laplace e Método Heaviside
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', '1', '2', '3', '4', '5'] as const).map((chap) => (
              <button
                key={chap}
                onClick={() => setSelectedChapter(chap)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                  selectedChapter === chap
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {chap === 'all' && 'Todas as Fórmulas'}
                {chap === '1' && 'Cap. 1: Sinais'}
                {chap === '2' && 'Cap. 2: Fourier'}
                {chap === '3' && 'Cap. 3: Laplace'}
                {chap === '4' && 'Cap. 4: EDOs'}
                {chap === '5' && 'Cap. 5: Eng. Elétrica & Circuitos'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar teorema ou fórmula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredFormulas.map((formula) => (
            <div
              key={formula.id}
              className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 hover:border-indigo-900/60 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-indigo-300">
                  {formula.title}
                </span>
                <div className="flex items-center gap-2">
                  {formula.ruleCode && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {formula.ruleCode}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                    {formula.chapter}
                  </span>
                </div>
              </div>

              {/* Math Display */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 text-center overflow-x-auto">
                <MathView math={formula.latex} block={true} className="text-slate-100 text-base" />
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                <MathView math={formula.description} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormulaReferenceModal;
