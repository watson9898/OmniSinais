import React, { useState, useEffect, useRef } from 'react';
import {
  Key,
  Mail,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  TokenUsageStats,
  getStoredTokenUsage,
  subscribeTokenUsage,
  getMaskedApiKey,
  getActiveUserEmailDisplay,
  GOOGLE_AI_STUDIO_FREE_LIMITS,
} from '../utils/tokenTracker';
import { StudentProfile } from '../types';

interface TopBarAccountUsageProps {
  profile: StudentProfile;
  onOpenAuthModal: () => void;
}

export const TopBarAccountUsage: React.FC<TopBarAccountUsageProps> = ({
  profile,
  onOpenAuthModal,
}) => {
  const [stats, setStats] = useState<TokenUsageStats>(getStoredTokenUsage());
  const [isOpen, setIsOpen] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Subscribe to token usage updates
  useEffect(() => {
    const unsubscribe = subscribeTokenUsage((updated) => {
      setStats(updated);
    });
    return () => unsubscribe();
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeEmail = getActiveUserEmailDisplay(profile.authData?.email, profile.name);
  const effectiveApiKey =
    profile.apiKey ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('apiKey') || localStorage.getItem('omnisinais_gemini_api_key') || ''
      : '');
  const hasKey = Boolean(effectiveApiKey && effectiveApiKey.trim().length > 0);
  const maskedKey = getMaskedApiKey(effectiveApiKey);

  // Calculate percentage used of daily 1500 requests
  const requestsPercent = Math.min(100, (stats.requestsToday / stats.dailyRequestLimit) * 100);
  const formattedPercent = requestsPercent.toFixed(1);

  // Test quota and connection
  const handleTestQuota = async () => {
    setIsTestingKey(true);
    setTestResult({ status: 'idle', message: '' });
    try {
      const res = await fetch('/api/check-quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': effectiveApiKey,
        },
        body: JSON.stringify({ userApiKey: effectiveApiKey }),
      });
      const data = await res.json();
      if (data.connected) {
        setTestResult({
          status: 'success',
          message: `Conexão verificada! Provedor: ${data.provider} (${data.model}) - 1.500 RPD disponíveis`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: data.message || 'Chave não pôde ser verificada.',
        });
      }
    } catch {
      setTestResult({
        status: 'error',
        message: 'Erro ao contatar o servidor de quota.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Top Bar Trigger Button (Compact on mobile, full metrics on desktop) */}
      <button
        id="top-bar-account-usage-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl transition-all shadow-xs cursor-pointer group"
        title="Clique para ver Detalhes da Conta, Chave de API e Consumo de Tokens"
      >
        {/* User Email & Active Status */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Mail className="w-3 h-3" />
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-[11px] font-semibold text-slate-200 truncate max-w-[130px] leading-tight">
              estudante@universidade.edu.br
            </div>
            <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{hasKey ? 'Chave Conectada' : 'Chave Pendente'}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-slate-800"></div>

        {/* API Key Indicator & Token Usage Meter */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-300">
            <Key className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-bold truncate max-w-[90px]">
              {hasKey ? maskedKey : 'Chave'}
            </span>
          </div>

          {/* Mini Token & Quota Progress Bar */}
          <div className="flex flex-col items-end sm:items-start min-w-[70px] sm:min-w-[100px]">
            <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-300 leading-tight">
              <span className="text-indigo-300 font-bold flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span className="hidden md:inline">Tokens: </span>
                {stats.tokensToday > 1000
                  ? `${(stats.tokensToday / 1000).toFixed(1)}k`
                  : stats.tokensToday}
              </span>
              <span className="text-[9px] text-slate-400 hidden xl:inline">
                {stats.requestsToday}/{stats.dailyRequestLimit} req
              </span>
            </div>

            {/* Visual Mini Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, Math.min(100, requestsPercent))}%` }}
              ></div>
            </div>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180 text-indigo-400' : 'group-hover:text-slate-200'
            }`}
          />
        </div>
      </button>

      {/* Interactive Floating Card / Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  Conta & Monitor de Tokens
                </h4>
                <p className="text-[10px] text-slate-400">
                  Google AI Studio Free Tier Quota
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {hasKey ? 'Conectado' : 'Chave Pendente'}
            </span>
          </div>

          {/* User Account & Key Details */}
          <div className="py-3 space-y-2.5 border-b border-slate-800">
            {/* Email */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Email Conectado
                  </div>
                  <div className="font-semibold text-slate-200 truncate text-xs">
                    {activeEmail}
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono shrink-0">
                {profile.authData?.isLoggedIn ? 'Autenticado' : 'Local'}
              </span>
            </div>

            {/* API Key in Use */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Chave Gemini em Uso
                  </div>
                  <div className="font-mono text-amber-300 font-bold text-xs truncate">
                    {maskedKey}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuthModal();
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Alterar Chave
              </button>
            </div>
          </div>

          {/* Live Token & Quota Metrics */}
          <div className="py-3 space-y-3 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Consumo de Tokens Hoje ({stats.date}):
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {stats.tokensToday.toLocaleString()} tokens
              </span>
            </div>

            {/* Request Quota Bar (RPD) */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-semibold">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  Requisições Diárias (RPD):
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {stats.requestsToday} / {stats.dailyRequestLimit} ({formattedPercent}%)
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, Math.min(100, requestsPercent))}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                <span>0 req</span>
                <span className="text-emerald-400 font-medium">
                  {stats.dailyRequestLimit - stats.requestsToday} requisições restantes hoje
                </span>
                <span>{stats.dailyRequestLimit} máx</span>
              </div>
            </div>

            {/* Token Breakdown (Prompt / Completion) */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">
                  Tokens de Entrada (Prompt)
                </div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                  {stats.promptTokensToday.toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">
                  Tokens de Saída (Resposta)
                </div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                  {stats.candidatesTokensToday.toLocaleString()}
                </div>
              </div>
            </div>

            {stats.lastRequestTime && (
              <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Última requisição:
                </span>
                <span className="font-mono text-slate-300">
                  {stats.lastRequestTime} (+{stats.lastRequestTokens || 0} tokens)
                </span>
              </div>
            )}
          </div>

          {/* Account Limits Specs (Google AI Studio Free Tier) */}
          <div className="py-2.5 space-y-1.5 text-[11px] text-slate-400">
            <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Limites Oficiais da Conta (Free Tier):
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-slate-300">
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-slate-500 text-[9px]">RPM</div>
                <div className="font-bold text-indigo-300">15 / min</div>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-slate-500 text-[9px]">RPD</div>
                <div className="font-bold text-emerald-300">1.500 / dia</div>
              </div>
              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-slate-500 text-[9px]">TPM</div>
                <div className="font-bold text-amber-300">1M / min</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
              <Info className="w-3 h-3 shrink-0 text-slate-400" />
              <span>Modelo padrão: {GOOGLE_AI_STUDIO_FREE_LIMITS.MODEL} • Custo: $0.00</span>
            </div>
          </div>

          {/* Verification Test Result Message */}
          {testResult.message && (
            <div
              className={`p-2 rounded-xl text-[11px] flex items-center gap-1.5 mt-2 ${
                testResult.status === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-800'
              }`}
            >
              {testResult.status === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleTestQuota}
              disabled={isTestingKey}
              className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : ''}`} />
              <span>{isTestingKey ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal();
              }}
              className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gerenciar Chave</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBarAccountUsage;
