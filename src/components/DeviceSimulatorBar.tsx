import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  Sparkles,
  Info,
  Radio,
  Cpu,
  Globe,
  Wifi,
  ChevronDown,
  Compass,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export type DeviceMode = 'responsive' | 'smartphone' | 'tablet' | 'windows';

interface DeviceSimulatorBarProps {
  currentMode: DeviceMode;
  onChangeMode: (mode: DeviceMode) => void;
}

interface ClientTelemetry {
  os: string;
  browser: string;
  deviceCategory: 'Mobile' | 'Tablet' | 'Desktop';
  screenRes: string;
  viewportSize: string;
  pixelRatio: number;
  isTouch: boolean;
  orientation: 'Retrato' | 'Paisagem';
  isOnline: boolean;
  accessOrigin: string;
}

export const DeviceSimulatorBar: React.FC<DeviceSimulatorBarProps> = ({
  currentMode,
  onChangeMode,
}) => {
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [viewportDims, setViewportDims] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportDims({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const telemetry: ClientTelemetry = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        os: 'Detectando...',
        browser: 'Navegador Web',
        deviceCategory: 'Desktop',
        screenRes: '1920x1080',
        viewportSize: '1280x800',
        pixelRatio: 1,
        isTouch: false,
        orientation: 'Paisagem',
        isOnline: true,
        accessOrigin: 'Cloud Run / Web',
      };
    }

    const ua = navigator.userAgent || '';
    let os = 'Desktop OS';
    if (/android/i.test(ua)) os = 'Android';
    else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS / Apple';
    else if (/windows phone/i.test(ua)) os = 'Windows Phone';
    else if (/windows/i.test(ua)) os = 'Windows PC';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS Apple';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/cros/i.test(ua)) os = 'Chrome OS';

    let browser = 'Navegador Web';
    if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/chrome|crios/i.test(ua) && !/opr|opera|edg/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Apple Safari';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';

    let deviceCategory: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
    if (/tablet|ipad/i.test(ua) || (window.innerWidth >= 600 && window.innerWidth <= 1024 && 'ontouchstart' in window)) {
      deviceCategory = 'Tablet';
    } else if (/mobile|android|iphone/i.test(ua) || window.innerWidth < 600) {
      deviceCategory = 'Mobile';
    }

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const orientation = window.innerWidth > window.innerHeight ? 'Paisagem' : 'Retrato';
    const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    const viewportSize = `${viewportDims.w}x${viewportDims.h}`;
    const pixelRatio = window.devicePixelRatio || 1;
    const isOnline = navigator.onLine !== false;

    let accessOrigin = 'Navegador Web (HTTPS)';
    if (window.matchMedia('(display-mode: standalone)').matches) {
      accessOrigin = 'PWA Instalado (Aplicativo Nativo)';
    } else if (window.location.hostname.includes('run.app') || window.location.hostname.includes('ais-')) {
      accessOrigin = 'Google Cloud Run (Container Seguro)';
    } else if (window.location.hostname.includes('localhost')) {
      accessOrigin = 'Servidor Local (Dev Mode)';
    }

    return {
      os,
      browser,
      deviceCategory,
      screenRes,
      viewportSize,
      pixelRatio,
      isTouch,
      orientation,
      isOnline,
      accessOrigin,
    };
  }, [viewportDims]);

  return (
    <div className="w-full bg-slate-900 text-slate-200 border-b border-slate-800 px-3 sm:px-5 py-1.5 shadow-md flex flex-wrap items-center justify-between gap-2 text-xs select-none">
      {/* Left: Device Mode & Access Identification */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-500/30">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Multi-Dispositivo
        </span>

        {/* Real Access Origin & System Badge */}
        <button
          onClick={() => setShowTelemetry(!showTelemetry)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[10px] transition-colors cursor-pointer group"
          title="Clique para ver o Diagnóstico de Acesso do seu dispositivo"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">{telemetry.os}</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">{telemetry.browser}</span>
          <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showTelemetry ? 'rotate-180 text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Center Device Switcher Buttons */}
      <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
        {/* Smartphone */}
        <button
          id="device-btn-smartphone"
          onClick={() => onChangeMode('smartphone')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            currentMode === 'smartphone'
              ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title="Modo Smartphone (Mobile 390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Smartphone</span>
          <span className="text-[9px] opacity-70 font-mono hidden md:inline">390px</span>
        </button>

        {/* Tablet */}
        <button
          id="device-btn-tablet"
          onClick={() => onChangeMode('tablet')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            currentMode === 'tablet'
              ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title="Modo Tablet (iPad / 768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Tablet</span>
          <span className="text-[9px] opacity-70 font-mono hidden md:inline">768px</span>
        </button>

        {/* Windows / PC */}
        <button
          id="device-btn-windows"
          onClick={() => onChangeMode('windows')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            currentMode === 'windows'
              ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title="Modo Windows PC (Desktop 1200px com moldura de janelas)"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Windows PC</span>
          <span className="text-[9px] opacity-70 font-mono hidden md:inline">1200px</span>
        </button>

        {/* Responsive / Auto */}
        <button
          id="device-btn-responsive"
          onClick={() => onChangeMode('responsive')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            currentMode === 'responsive'
              ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title="Modo Fluido / Tela Cheia Automática"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Tela Cheia</span>
        </button>
      </div>

      {/* Right live info indicator */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
        <span className="text-slate-500 font-mono text-[10px]">Viewport: {telemetry.viewportSize}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-slate-300">
          {currentMode === 'smartphone' && '📱 Modo Mobile (Touch Ativo)'}
          {currentMode === 'tablet' && '📟 Modo Tablet (Grid Médio)'}
          {currentMode === 'windows' && '💻 Modo Windows (Desktop)'}
          {currentMode === 'responsive' && '⚡ Adaptativo Nativo'}
        </span>
      </div>

      {/* Telemetry Popover Modal */}
      {showTelemetry && (
        <div className="absolute left-3 sm:left-6 top-10 w-80 sm:w-96 bg-slate-950 border border-indigo-500/40 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-100 text-xs">Identificação de Acesso ao Sistema</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Online
            </span>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                Sistema & Plataforma:
              </span>
              <span className="font-bold text-slate-200 font-mono">{telemetry.os} ({telemetry.deviceCategory})</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Navegador & Engine:
              </span>
              <span className="font-bold text-slate-200 font-mono">{telemetry.browser}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Resolução Física & Tela:
              </span>
              <span className="font-mono text-slate-300 text-[11px]">{telemetry.screenRes} (@{telemetry.pixelRatio}x)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Ambiente de Acesso:
              </span>
              <span className="font-mono text-emerald-400 text-[10px] truncate max-w-[180px]">{telemetry.accessOrigin}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-400">Entrada de Dados:</span>
              <span className="font-mono text-indigo-300 font-semibold">{telemetry.isTouch ? '👆 Touchscreen & Caneta' : '🖱️ Teclado & Mouse'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setShowTelemetry(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Fechar Diagnóstico
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
