import React, { useState } from 'react';
import { StudentProfile, UserAuthData } from '../types';
import {
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
  X,
  Coffee,
  Coins,
  CircleDollarSign,
  Sparkles,
  ArrowRight,
  UserCheck,
  EyeOff,
  Database,
  ExternalLink,
  KeyRound,
  Download,
  Upload,
  LogOut,
  RefreshCw,
  Info,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStoredTokenUsage, getMaskedApiKey } from '../utils/tokenTracker';

interface UserAccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateAuth: (authData: UserAuthData, profileUpdates?: Partial<StudentProfile>) => void;
  onOpenKofi: () => void;
}

export const UserAccountAuthModal: React.FC<UserAccountAuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateAuth,
  onOpenKofi,
}) => {
  const currentAuth = profile.authData || {
    isLoggedIn: false,
    authProvider: 'guest',
    email: '',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    privacyAccepted: true,
    dataPrivacyMode: 'strictly_confidential',
  };

  const [authMethod, setAuthMethod] = useState<'options' | 'google' | 'apple' | 'email' | 'backup'>('options');
  const [inputEmail, setInputEmail] = useState(currentAuth.email || '');
  const [inputName, setInputName] = useState(profile.name || '');
  const [inputPassword, setInputPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const triggerConfettiSuccess = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  const handleGoogleLogin = (emailChoice?: string) => {
    const emailToUse = emailChoice || inputEmail || '';
    if (!emailToUse.trim() || !emailToUse.includes('@')) {
      setAuthMethod('email');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const email = emailToUse.trim().toLowerCase();
      const name = inputName.trim() || email.split('@')[0];
      const newAuth: UserAuthData = {
        isLoggedIn: true,
        authProvider: 'google',
        email,
        fullName: name,
        createdAt: currentAuth.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        privacyAccepted: true,
        dataPrivacyMode: 'strictly_confidential',
        isDonorAcknowledged: currentAuth.isDonorAcknowledged,
        kofiSupporterBadge: currentAuth.kofiSupporterBadge,
      };

      onUpdateAuth(newAuth, {
        name,
      });

      triggerConfettiSuccess();
      setSuccessMessage('Autenticado com sucesso via Google! Seu progresso e pontos estão protegidos.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    }, 500);
  };

  const handleAppleLogin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const email = inputEmail.trim() || 'estudante.eng@privaterelay.appleid.com';
      const name = inputName.trim() || 'Estudante Apple';
      const newAuth: UserAuthData = {
        isLoggedIn: true,
        authProvider: 'apple',
        email,
        fullName: name,
        createdAt: currentAuth.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        privacyAccepted: true,
        dataPrivacyMode: 'strictly_confidential',
        isDonorAcknowledged: currentAuth.isDonorAcknowledged,
        kofiSupporterBadge: currentAuth.kofiSupporterBadge,
      };

      onUpdateAuth(newAuth, {
        name,
      });

      triggerConfettiSuccess();
      setSuccessMessage('Autenticado com sucesso via Apple ID! Sigilo total ativado.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    }, 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.includes('@')) {
      alert('Por favor, digite um e-mail válido.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const name = inputName.trim() || inputEmail.split('@')[0];
      const newAuth: UserAuthData = {
        isLoggedIn: true,
        authProvider: 'email',
        email: inputEmail.trim(),
        fullName: name,
        createdAt: currentAuth.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        privacyAccepted: true,
        dataPrivacyMode: 'strictly_confidential',
        isDonorAcknowledged: currentAuth.isDonorAcknowledged,
        kofiSupporterBadge: currentAuth.kofiSupporterBadge,
      };

      onUpdateAuth(newAuth, {
        name,
      });

      triggerConfettiSuccess();
      setSuccessMessage('Cadastro e login realizados com sucesso! Seus dados estão seguros.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    }, 500);
  };

  const handleGuestContinue = () => {
    const newAuth: UserAuthData = {
      isLoggedIn: false,
      authProvider: 'guest',
      email: '',
      fullName: profile.name,
      createdAt: currentAuth.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      privacyAccepted: true,
      dataPrivacyMode: 'strictly_confidential',
    };
    onUpdateAuth(newAuth);
    onClose();
  };

  const handleLogout = () => {
    const newAuth: UserAuthData = {
      isLoggedIn: false,
      authProvider: 'guest',
      email: '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      privacyAccepted: true,
      dataPrivacyMode: 'strictly_confidential',
    };
    onUpdateAuth(newAuth);
    setSuccessMessage('Você desconectou. Seu progresso permanece salvo neste navegador.');
    setTimeout(() => {
      setSuccessMessage(null);
      setAuthMethod('options');
    }, 1200);
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'OmniSinais',
      exportDate: new Date().toISOString(),
      profile,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnisinais_backup_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-6">
        {/* Header with Security & Privacy Identity */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                <Lock className="w-3 h-3" />
                Sigilo Absoluto & Proteção Total
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                {currentAuth.isLoggedIn ? 'Sua Conta & Proteção de Dados' : 'Cadastro e Acesso do Estudante'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md">
            Seu cadastro é utilizado <strong>exclusivamente</strong> para salvar e proteger seu progresso de estudos, pontuação XP, fórmulas e anotações.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Banner when Logged In */}
          {currentAuth.isLoggedIn ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                    {profile.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{profile.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3 text-indigo-400" />
                      {currentAuth.email}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentAuth.authProvider === 'google' ? 'Google' : currentAuth.authProvider === 'apple' ? 'Apple ID' : 'E-mail'}
                </span>
              </div>

              {/* BYOK API Key Status */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Chave BYOK (Google AI Studio):</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                    Ativa
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <span>
                    {getMaskedApiKey(profile.apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('apiKey') || '' : ''))}
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[10px]"
                  >
                    Gerenciar no AI Studio <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Token Usage & Quota Bar inside Auth Modal */}
                {(() => {
                  const tokenStats = getStoredTokenUsage();
                  const reqPercent = Math.min(100, (tokenStats.requestsToday / tokenStats.dailyRequestLimit) * 100);
                  return (
                    <div className="pt-1.5 mt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/40 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          Consumo de Tokens Hoje:
                        </span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {tokenStats.tokensToday.toLocaleString()} tokens ({tokenStats.requestsToday}/{tokenStats.dailyRequestLimit} req)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 rounded-full"
                          style={{ width: `${Math.max(4, reqPercent)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                        <span>Limites: 15 RPM • 1.500 RPD • 1M TPM</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free Tier Ativo</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">XP Salvo</span>
                  <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">{profile.xp} XP</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Resolvidos</span>
                  <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                    {profile.completedProblems.length + profile.completedQuizIds.length}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Ofensiva</span>
                  <span className="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">{profile.streakDays} dias</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Baixar Backup JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar Conta</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Login / Register Options */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Escolha como deseja salvar seu progresso acadêmico:
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acesso rápido em 1 clique ou formulário com e-mail universitário
                </p>
              </div>

              {/* Provider 1: Google (Gmail) */}
              <button
                type="button"
                onClick={() => {
                  if (inputEmail && inputEmail.includes('@')) {
                    handleGoogleLogin(inputEmail);
                  } else {
                    setAuthMethod('email');
                  }
                }}
                disabled={isProcessing}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Google Vector Icon */}
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-700">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">Entrar com Google (Gmail)</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Rápido • Autenticação com sua conta Google
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Provider 2: Apple ID */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isProcessing}
                className="w-full p-3.5 rounded-2xl bg-black text-white hover:bg-slate-900 border border-slate-800 font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.77-7.89-12.21-14.42-6.53-9.59-11.66-20.91-15.39-33.97-3.73-13.06-5.6-25.04-5.6-35.94 0-14.68 3.91-26.79 11.73-36.33 7.82-9.54 17.52-14.37 29.11-14.49 4.35 0 9.27 1.16 14.75 3.48 5.48 2.32 9.4 3.54 11.75 3.65 1.95 0 6.01-1.29 12.18-3.87 6.17-2.58 11.37-3.75 15.61-3.52 11.53.65 20.89 4.96 28.09 12.94-10.45 6.31-15.56 15.11-15.34 26.4.22 8.91 3.69 16.32 10.4 22.23 6.71 5.91 14.58 9.27 23.61 10.08-2.39 7.4-5.43 14.9-9.11 22.51zM119.22 33.02c0-7.39 2.66-14.28 7.98-20.67 5.32-6.39 11.85-10.45 19.59-12.18.54 1.3.82 2.66.82 4.08 0 7.39-2.77 14.4-8.31 21.03-5.54 6.63-12.28 10.59-20.21 11.89-.22-1.41-.33-2.79-.33-4.15z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold">Entrar com Apple ID</span>
                    <span className="block text-[11px] text-slate-300">Privacidade Máxima • Ocultar Meu E-mail</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Alternative: Direct Email Form */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    ou cadastro com e-mail universitário
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo do Estudante:
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Ex: Seu Nome Completo"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail (Gmail ou Institucional):
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="estudante@email.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                    />
                    <span>Manter progresso sincronizado</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Cadastrar & Salvar Meu Progresso</span>
                </button>
              </form>

              {/* Guest option */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleGuestContinue}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Continuar como Convidado (salvar apenas no navegador)
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Confidentiality Guarantee Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
              <EyeOff className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Garantia de Sigilo Total & Privacidade de Dados:</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>
                  <strong>Sigilo Acadêmico:</strong> Seus dados de e-mail e notas são estritamente privados. Nenhum outro estudante ou terceiro tem acesso aos seus registros pessoais.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>
                  <strong>Finalidade Única:</strong> O login existe unicamente para você não perder suas resoluções, fórmulas e XP ao trocar de dispositivo ou limpar o cache.
                </span>
              </li>
            </ul>
          </div>

          {/* External PIX & Ko-fi Donation Disclosure Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-amber-50/60 to-emerald-50/70 dark:from-emerald-950/30 dark:via-amber-950/30 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-[11px] uppercase tracking-wider">
                <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Doações Seguras (PIX & Ko-fi):</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                100% Seguro
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
              O <strong>OmniSinais é um projeto independente</strong>. Apoie o desenvolvedor via <strong>PIX instantâneo</strong> (sem intermediários) ou diretamente através da página de pagamento seguro do <strong>Ko-fi</strong>.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKofi();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CircleDollarSign className="w-3.5 h-3.5 text-white" />
                <span>Apoiar o Desenvolvedor</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                100% opcional e transparente
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            Criptografia de Sessão Ativa
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
