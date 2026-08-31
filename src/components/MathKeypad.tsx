import React, { useState } from 'react';
import { CasioCalculator } from './CasioCalculator';
import { ScientificCalculatorKeypad } from './ScientificCalculatorKeypad';
import { Calculator, Sparkles, Sliders, Table2 } from 'lucide-react';

interface MathKeypadProps {
  onInsert: (char: string) => void;
  contextSymbols?: string[];
  onClear?: () => void;
  onBackspace?: () => void;
  currentInput?: string;
}

type KeypadMode = 'casio' | 'compact' | 'table';

export const MathKeypad: React.FC<MathKeypadProps> = ({
  onInsert,
  contextSymbols = [],
  onClear,
  onBackspace,
  currentInput = '',
}) => {
  const [activeMode, setActiveMode] = useState<KeypadMode>('casio');

  // Fast direct symbols for compact mode
  const quickSymbols = [
    { label: 'ℒ{·}', val: 'L{' },
    { label: 'ℒ⁻¹{·}', val: 'L^-1{' },
    { label: 'Y(s) =', val: 'Y(s) = ' },
    { label: 'y(t) =', val: 'y(t) = ' },
    { label: 'H(s) =', val: 'H(s) = ' },
    { label: 's', val: 's' },
    { label: 't', val: 't' },
    { label: '1/s', val: '1/s' },
    { label: '1/(s-a)', val: '1/(s-a)' },
    { label: '1/(s+a)', val: '1/(s+a)' },
    { label: 'e^(-at)', val: 'e^(-a*t)' },
    { label: 'e^(at)', val: 'e^(a*t)' },
    { label: 'e^(st)', val: 'e^(s*t)' },
    { label: 'u(t)', val: 'u(t)' },
    { label: 'δ(t)', val: 'delta(t)' },
    { label: 'jω', val: 'j*w' },
    { label: 'π', val: 'pi' },
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'a/b', val: '/' },
    { label: '( )', val: '()' },
    { label: 's²', val: 's^2' },
    { label: 's³', val: 's^3' },
    { label: '√', val: 'sqrt(' },
    { label: 'Ω', val: ' Ohm' },
    { label: 'V', val: ' V' },
    { label: 'A', val: ' A' },
    { label: 'W', val: ' W' },
    { label: 'rad/s', val: ' rad/s' },
    { label: 'Hz', val: ' Hz' },
    { label: '+', val: ' + ' },
    { label: '-', val: ' - ' },
    { label: '*', val: '*' },
    { label: '=', val: ' = ' },
  ];

  return (
    <div className="w-full space-y-2">
      {/* Header Selector: Casio vs Compact vs Table */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveMode('casio')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeMode === 'casio'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculadora Casio fx-991</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('compact')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeMode === 'compact'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Fita Rápida</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('table')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeMode === 'table'
                ? 'bg-purple-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Tabela de Símbolos (+80)</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline px-2">
          Layout Científico para Engenharia
        </span>
      </div>

      {/* MODE 1: CASIO SCIENTIFIC CALCULATOR FX-991 (INDEPENDENT SCRATCHPAD & PRE-CALC) */}
      {activeMode === 'casio' && (
        <CasioCalculator
          onInsertToAnswer={onInsert}
          contextSymbols={contextSymbols}
          currentStepExpected={currentInput}
        />
      )}

      {/* MODE 2: COMPACT RIBBON (DIRECT INSERT) */}
      {activeMode === 'compact' && (
        <div className="space-y-2">
          {contextSymbols.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-indigo-950/60 rounded-xl border border-indigo-500/40">
              <div className="flex items-center gap-1.5 w-full text-[11px] font-bold text-indigo-300 uppercase tracking-wider px-1 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Símbolos Desta Questão:</span>
              </div>
              {contextSymbols.map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onInsert(sym)}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg border border-indigo-400 transition-all active:scale-95 shadow-xs"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-900/90 rounded-2xl border border-slate-700/80">
            {quickSymbols.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onInsert(sym.val)}
                className="px-2.5 py-1 text-xs font-mono font-medium bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/70 rounded-lg transition-all active:scale-95 shadow-2xs"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: FULL SYMBOL & UNIT TABLE */}
      {activeMode === 'table' && (
        <ScientificCalculatorKeypad
          onInsert={onInsert}
          onClear={onClear}
          onBackspace={onBackspace}
          contextSymbols={contextSymbols}
          title="Tabela de Caracteres & Grandezas de Engenharia Elétrica"
          defaultExpanded={true}
        />
      )}
    </div>
  );
};

export default MathKeypad;


