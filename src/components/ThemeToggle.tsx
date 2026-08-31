import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { themeMode, resolvedTheme, setThemeMode, isSystem } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const modes: { mode: ThemeMode; label: string; icon: typeof Sun; description: string }[] = [
    {
      mode: 'system',
      label: 'Sistema (Auto)',
      icon: Laptop,
      description: `Segue o tema do seu dispositivo (${resolvedTheme === 'dark' ? 'Atualmente Escuro' : 'Atualmente Claro'})`,
    },
    {
      mode: 'light',
      label: 'Modo Claro',
      icon: Sun,
      description: 'Visual diurno clássico e nítido',
    },
    {
      mode: 'dark',
      label: 'Modo Escuro',
      icon: Moon,
      description: 'Ideal para estudos noturnos',
    },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Alternar tema de cores"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80"
        title={`Tema: ${
          themeMode === 'system'
            ? `Sistema (${resolvedTheme === 'dark' ? 'Escuro' : 'Claro'})`
            : themeMode === 'dark'
            ? 'Modo Escuro'
            : 'Modo Claro'
        }`}
      >
        {themeMode === 'system' ? (
          <Laptop className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        ) : themeMode === 'light' ? (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-sky-400" />
        )}
        
        <span className="hidden lg:inline text-[11px]">
          {themeMode === 'system' ? 'Tema Auto' : themeMode === 'light' ? 'Claro' : 'Escuro'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Preferência de Tema
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detecção automática via Media Query
            </div>
          </div>

          <div className="p-1 space-y-1">
            {modes.map(({ mode, label, icon: Icon, description }) => {
              const isSelected = themeMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setThemeMode(mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold leading-tight">{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 mt-1 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Sensor SO:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {resolvedTheme === 'dark' ? 'Dark Mode Ativo' : 'Light Mode Ativo'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
