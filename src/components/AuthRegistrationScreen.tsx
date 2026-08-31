import React, { useState, useEffect } from 'react';
import { StudentProfile, UserAuthData } from '../types';
import {
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Coffee,
  Coins,
  CircleDollarSign,
  Waves,
  Zap,
  Cpu,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthRegistrationScreenProps {
  onCompleteAuth: (authData: UserAuthData, profileUpdates: Partial<StudentProfile>) => void;
  onOpenKofi: () => void;
}

export const AuthRegistrationScreen: React.FC<AuthRegistrationScreenProps> = ({
  onCompleteAuth,
  onOpenKofi,
}) => {
  const [nameOrEmail, setNameOrEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');
  const [showAdvancedProfile, setShowAdvancedProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const AVATARS = ['🎓', '⚡', '🔬', '💡', '📐', '🚀', '🧠', '🌟'];

  // Check if credentials are saved in localStorage
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('apiKey') || localStorage.getItem('omnisinais_gemini_api_key') || '';
      const storedName = localStorage.getItem('student_name') || localStorage.getItem('omnisinais_student_name') || '';
      if (storedName && !/watson/i.test(storedName)) {
        setNameOrEmail(storedName);
      }
      if (storedKey && storedKey.trim().length > 30) setApiKey(storedKey.trim());
    } catch {
      // ignore
    }
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleGuestAccess = () => {
    const trimmedName = nameOrEmail.trim() || 'Estudante de Engenharia';
    const authData: UserAuthData = {
      isLoggedIn: true,
      authProvider: 'guest',
      email: '',
      fullName: trimmedName,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      privacyAccepted: true,
      dataPrivacyMode: 'strictly_confidential',
    };

    const profileUpdates: Partial<StudentProfile> = {
      name: trimmedName,
      university: university.trim() || 'Engenharia Elétrica & Computação',
      course: 'Análise de Sinais e Sistemas',
      avatar: selectedAvatar,
    };

    triggerCelebration();
    onCompleteAuth(authData, profileUpdates);
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = nameOrEmail.trim();
    const trimmedKey = apiKey.trim();

    // Field 1 validation: Name or Email
    if (!trimmedName) {
      setErrorMessage('Por favor, informe seu Nome ou E-mail para identificação na sessão.');
      return;
    }

    // Field 2 validation: API Key presence
    if (!trimmedKey) {
      setErrorMessage('Por favor, insira sua Chave de API (API Key) do Google AI Studio.');
      return;
    }

    // Rule: Validate that the key has > 30 characters (supports AIza, AQ., etc.)
    if (trimmedKey.length <= 30) {
      setErrorMessage('A chave de API informada é inválida ou muito curta. Verifique se copiou o código completo gerado no Google AI Studio.');
      return;
    }

    setIsValidating(true);

    setTimeout(() => {
      setIsValidating(false);

      // Save to localStorage as specified
      try {
        localStorage.setItem('apiKey', trimmedKey);
        localStorage.setItem('userApiKey', trimmedKey);
        localStorage.setItem('omnisinais_gemini_api_key', trimmedKey);
        localStorage.setItem('student_name', trimmedName);
        localStorage.setItem('omnisinais_student_name', trimmedName);
      } catch (err) {
        console.error('Erro ao salvar no localStorage:', err);
      }

      const isEmail = trimmedName.includes('@');
      const displayName = isEmail
        ? trimmedName.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : trimmedName;

      const authData: UserAuthData = {
        isLoggedIn: true,
        authProvider: 'google',
        email: isEmail ? trimmedName.toLowerCase() : '',
        fullName: displayName,
        apiKey: trimmedKey,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        privacyAccepted: true,
        dataPrivacyMode: 'strictly_confidential',
      };

      const profileUpdates: Partial<StudentProfile> = {
        name: displayName,
        apiKey: trimmedKey,
        university: university.trim() || 'Engenharia Elétrica & Computação',
        course: 'Análise de Sinais e Sistemas',
        avatar: selectedAvatar,
      };

      triggerCelebration();
      onCompleteAuth(authData, profileUpdates);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Identity */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">OmniSinais</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                BYOK 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sinais e Sistemas Lineares • Acesso Descentralizado</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cota Privativa</span>
          </div>

          <button
            type="button"
            onClick={onOpenKofi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-amber-950/40 hover:from-emerald-900/60 hover:to-amber-900/60 text-slate-200 border border-amber-800/50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Apoiar o desenvolvedor voluntariamente com PIX ou Ko-fi"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Apoiar o Desenvolvedor</span>
          </button>
        </div>
      </header>

      {/* Center Onboarding & Auth Card */}
      <main className="max-w-xl mx-auto w-full my-6 sm:my-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Acesso Descentralizado • BYOK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Acesso do Estudante
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Utilize sua chave de API gratuita para desbloquear todas as simulações, calculadoras de Laplace/Fourier e resoluções passo a passo.
            </p>
          </div>

          {/* Seção de Instruções (Card explicativo) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 space-y-3">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Para garantir acesso rápido e gratuito a todos, o <strong>OmniSinais</strong> utiliza o sistema <strong>BYOK (Traga sua própria chave)</strong>. O processamento de Transformadas de Laplace e Fourier consome recursos de IA, por isso, cada aluno utiliza a sua própria conexão.
            </p>

            {/* Pequeno tutorial em 3 passos com link clicável */}
            <div className="pt-2 border-t border-indigo-900/60 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Como obter sua chave gratuita (3 passos):
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Acesse o{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 font-bold underline inline-flex items-center gap-1"
                    >
                      Google AI Studio <ExternalLink className="w-3 h-3 inline" />
                    </a>
                    .
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Clique em <strong>'Get API Key'</strong> (ou <strong>'Create API Key'</strong>) e gere uma chave gratuita.
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Cole sua chave no campo abaixo.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Formulário de Acesso */}
          <form onSubmit={handleAccessSubmit} className="space-y-4">
            {/* Campo 1: 'Seu Nome ou E-mail' */}
            <div className="space-y-1.5">
              <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-200">
                Seu Nome ou E-mail:
              </label>
              <input
                id="student-name-input"
                type="text"
                value={nameOrEmail}
                onChange={(e) => setNameOrEmail(e.target.value)}
                placeholder="Ex: estudante@universidade.edu.br ou seu_usuario"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
                autoComplete="name"
              />
              <p className="text-[11px] text-slate-500">
                Apenas para identificação do seu perfil e pontuação XP na sessão.
              </p>
            </div>

            {/* Campo 2: 'Sua Chave de API (API Key)' */}
            <div className="space-y-1.5">
              <label htmlFor="student-apikey-input" className="block text-xs font-bold text-slate-200">
                Sua Chave de API (API Key):
              </label>
              <div className="relative">
                <input
                  id="student-apikey-input"
                  type={showPassword ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Cole sua chave gerada no Google AI Studio..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                  title={showPassword ? 'Ocultar chave' : 'Mostrar chave'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Chave pessoal gerada no Google AI Studio (copie o código completo).
              </p>
            </div>

            {/* Optional Avatar & Profile Details */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedProfile(!showAdvancedProfile)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{showAdvancedProfile ? '− Ocultar opções de avatar' : '+ Escolher avatar & universidade (opcional)'}</span>
              </button>

              {showAdvancedProfile && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Avatar do Estudante:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedAvatar(emoji)}
                          className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                            selectedAvatar === emoji
                              ? 'bg-indigo-600 border-2 border-indigo-400 scale-110 shadow-sm'
                              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Faculdade / Universidade (opcional):
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Ex: USP, UNICAMP, Una, PUC..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botão de Ação Primário: 'Acessar o OmniSinais' */}
            <button
              type="submit"
              disabled={isValidating}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isValidating ? 'Validando Chave & Acessando...' : 'Acessar o OmniSinais com Chave'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Opção Rápida: Entrar no Modo Prático Offline/Sem Chave */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Entrar no Modo Prático (Sem Chave / Convidado)</span>
              </button>
            </div>
          </form>

          {/* Privacy and Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Armazenamento 100% Local no Navegador:</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Sua chave de API fica salva exclusivamente na memória do seu navegador (<code>localStorage</code>) e é utilizada apenas para conectar suas próprias requisições de resolução ao modelo de IA. Nenhuma chave é enviada a servidores de terceiros.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-3 text-xs text-slate-500 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sessão BYOK Privativa • OmniSinais 2026</span>
        </div>
        <span>Plataforma Acadêmica de Sinais e Sistemas Lineares</span>
      </footer>
    </div>
  );
};
