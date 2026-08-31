import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import {
  User,
  GraduationCap,
  Award,
  Flame,
  Check,
  X,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Coffee,
  Coins,
  CircleDollarSign,
  ExternalLink,
  EyeOff,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: Partial<StudentProfile>) => void;
  onOpenAuth?: () => void;
  onOpenKofi?: () => void;
}

const AVATAR_OPTIONS = [
  '⚡', '🔬', '📐', '🧠', '🎓', '🚀', '💻', '💡', '🤖', '🛰️', '🪐', '🎯'
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenAuth,
  onOpenKofi,
}) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [name, setName] = useState(profile.name);
  const [ra, setRa] = useState(profile.ra || '');
  const [university, setUniversity] = useState(profile.university);
  const [course, setCourse] = useState(profile.course);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isUserAuthenticated = profile.authData?.isLoggedIn;
  const userEmail = profile.authData?.email;
  const authProvider = profile.authData?.authProvider;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Estudante de Engenharia',
      ra: ra.trim(),
      university: university.trim() || 'Centro Universitário Una - Pouso Alegre',
      course: course.trim() || 'Engenharia Elétrica / Controle & Automação',
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cadastro do Aluno</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Identificação acadêmica e preferências de estudo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Preview Header */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/30 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-white dark:bg-slate-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Pontos XP
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-300 font-mono">{profile.xp}</div>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500" /> Nível
            </div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 font-mono">Nv. {profile.level}</div>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" /> Ofensiva
            </div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-300 font-mono">{profile.streakDays} dias</div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Account Authentication & Privacy Status Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Vínculo de Conta & Sigilo:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                {isUserAuthenticated
                  ? `Protegido (${authProvider?.toUpperCase()})`
                  : 'Modo Local / Convidado'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {isUserAuthenticated ? (
                <>Vinculado com <strong className="text-indigo-600 dark:text-indigo-400">{userEmail}</strong>. Seus pontos, fórmulas e progresso estão salvos com sigilo total.</>
              ) : (
                <>Conecte seu Gmail ou Apple ID para garantir que seu progresso não seja perdido ao limpar o navegador.</>
              )}
            </p>

            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800/60 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isUserAuthenticated ? 'Gerenciar Conta & Backup Seguro' : 'Entrar com Google / Apple'}</span>
              </button>
            )}
          </div>

          {/* Theme Mode Selector in Profile */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tema Visual do Aplicativo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  themeMode === 'system'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Auto ({resolvedTheme === 'dark' ? 'Escuro' : 'Claro'})</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  themeMode === 'light'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Claro</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  themeMode === 'dark'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span>Escuro</span>
              </button>
            </div>
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Escolha seu Ícone / Avatar:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setAvatar(icon)}
                  className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                    avatar === icon
                      ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome Completo do Aluno:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nome Completo do Estudante"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* RA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registro Acadêmico (R.A) / Matrícula:
            </label>
            <input
              type="text"
              value={ra}
              onChange={(e) => setRa(e.target.value)}
              placeholder="Ex: 2026-ENG-0893"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* University / College */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Faculdade / Universidade / Campus:
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Ex: Centro Universitário Una - Campus Pouso Alegre"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Curso / Disciplina:
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ex: Análise de Sinais e Sistemas / Eng. Elétrica"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* External PIX & Ko-fi Donation Note */}
          <div className="p-3 bg-gradient-to-r from-emerald-50/60 to-amber-50/60 dark:from-emerald-950/20 dark:to-amber-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                Apoiar o Desenvolvedor:
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-bold">
                PIX & Ko-fi
              </span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
              O OmniSinais é mantido de forma independente. Contribua com qualquer valor via PIX ou Ko-fi para incentivar o desenvolvimento contínuo!
            </p>
            {onOpenKofi && (
               <button
                 type="button"
                 onClick={() => {
                   onClose();
                   onOpenKofi();
                 }}
                 className="w-full py-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
               >
                 <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                 <span>Apoiar o Desenvolvedor (PIX / Ko-fi)</span>
               </button>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Salvar Cadastro & Atualizar Perfil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileModal;

