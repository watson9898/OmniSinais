import React, { useState } from 'react';
import { DeviceMode } from './DeviceSimulatorBar';
import {
  Wifi,
  Battery,
  Signal,
  Minus,
  Square,
  X,
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';

interface DeviceViewportContainerProps {
  mode: DeviceMode;
  onCloseDeviceMode?: () => void;
  children: React.ReactNode;
}

export const DeviceViewportContainer: React.FC<DeviceViewportContainerProps> = ({
  mode,
  onCloseDeviceMode,
  children,
}) => {
  const [scale, setScale] = useState<number>(1);

  if (mode === 'responsive') {
    return <div className="w-full transition-all duration-300">{children}</div>;
  }

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-slate-950/90 py-6 px-2 sm:px-4 flex flex-col items-center justify-start overflow-x-auto transition-all duration-300">
      {/* Device Mode Badge & Quick Controls */}
      <div className="mb-4 flex items-center justify-between gap-3 w-full max-w-5xl px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            {mode === 'smartphone' && <Smartphone className="w-4 h-4 text-indigo-400" />}
            {mode === 'tablet' && <Tablet className="w-4 h-4 text-indigo-400" />}
            {mode === 'windows' && <Laptop className="w-4 h-4 text-indigo-400" />}
            {mode === 'smartphone' && 'Modo Smartphone (iPhone / Android • 390px)'}
            {mode === 'tablet' && 'Modo Tablet (iPad / Android Tab • 768px)'}
            {mode === 'windows' && 'Modo Windows PC (Janela Desktop • 1200px)'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {mode === 'smartphone' ? '390 × 844 px' : mode === 'tablet' ? '768 × 1024 px' : '1200 × 820 px'}
          </span>
        </div>

        {/* Zoom Scale Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
          <button
            onClick={() => setScale((s) => Math.max(0.7, Number((s - 0.1).toFixed(1))))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-300 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(1.3, Number((s + 0.1).toFixed(1))))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 text-[10px] font-mono transition-colors ml-1 cursor-pointer"
            title="Resetar Zoom para 100%"
          >
            100%
          </button>
        </div>
      </div>

      {/* Frame Container Scaled */}
      <div
        className="transition-transform duration-200 origin-top flex justify-center w-full"
        style={{ transform: `scale(${scale})` }}
      >
        {/* SMARTPHONE FRAME (390px) */}
        {mode === 'smartphone' && (
          <div className="w-[390px] min-h-[800px] bg-slate-900 border-[10px] border-slate-800 rounded-[50px] shadow-2xl ring-1 ring-white/10 flex flex-col overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-slate-950 text-slate-300 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold border-b border-slate-800 select-none">
              <span>09:41</span>
              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-end px-2">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Signal className="w-3 h-3 text-slate-400" />
                <Wifi className="w-3 h-3 text-slate-400" />
                <Battery className="w-3.5 h-3.5 text-slate-200" />
              </div>
            </div>

            {/* Inner App Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
              {children}
            </div>

            {/* Mobile Home Bar */}
            <div className="bg-slate-950 py-2 flex justify-center border-t border-slate-800 select-none">
              <div className="w-32 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        )}

        {/* TABLET FRAME (768px) */}
        {mode === 'tablet' && (
          <div className="w-[768px] min-h-[820px] bg-slate-900 border-[12px] border-slate-800 rounded-[36px] shadow-2xl ring-1 ring-white/10 flex flex-col overflow-hidden relative">
            {/* Tablet Status Bar */}
            <div className="bg-slate-950 text-slate-300 px-8 py-2.5 flex items-center justify-between text-xs font-semibold border-b border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                <span>iPad OS • OmniSinais</span>
              </div>
              <span>09:41 - Terça-feira</span>
              <div className="flex items-center gap-2 text-xs">
                <Signal className="w-3.5 h-3.5 text-slate-400" />
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                <Battery className="w-4 h-4 text-slate-200" />
              </div>
            </div>

            {/* Inner App Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
              {children}
            </div>

            {/* Tablet Home Bar */}
            <div className="bg-slate-950 py-2.5 flex justify-center border-t border-slate-800 select-none">
              <div className="w-44 h-1.5 bg-slate-600 rounded-full" />
            </div>
          </div>
        )}

        {/* WINDOWS PC FRAME (1200px) */}
        {mode === 'windows' && (
          <div className="w-[1200px] min-h-[820px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl ring-1 ring-white/10 flex flex-col overflow-hidden relative">
            {/* Windows 11 Title Bar */}
            <div className="bg-slate-900 text-slate-200 px-4 py-2 flex items-center justify-between text-xs font-medium border-b border-slate-800 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[11px] font-mono font-bold">
                  Ω
                </div>
                <span className="font-bold tracking-tight text-slate-100">
                  OmniSinais — Plataforma de Engenharia [Windows Desktop Edition]
                </span>
              </div>

              {/* Windows Window Controls */}
              <div className="flex items-center">
                <button
                  className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Minimizar"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Restaurar / Maximizar"
                >
                  <Square className="w-3 h-3" />
                </button>
                <button
                  onClick={onCloseDeviceMode}
                  className="px-3 py-1 text-slate-400 hover:text-white hover:bg-red-600 transition-colors rounded-tr-lg"
                  title="Voltar ao Modo Fluido"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inner App Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
              {children}
            </div>

            {/* Windows 11 Status Bar */}
            <div className="bg-slate-900 text-slate-400 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  OmniSinais v2.4 (Engine OK)
                </span>
                <span>Porta: 3000 (Localhost)</span>
              </div>
              <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span>TypeScript / React</span>
                <span>Windows 11 UI Mode</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
