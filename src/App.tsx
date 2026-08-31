import React, { useState, useEffect, useMemo } from 'react';
import { StudentProfile, SubjectCategory, ResolvedRecord, StepByStepProblem, MultipleChoiceProblem } from './types';
import { STEP_BY_STEP_PROBLEMS, MULTIPLE_CHOICE_PROBLEMS } from './data/exercisesData';
import { CHAPTERS_DATA } from './data/chaptersData';
import { NavigationStepper, AppViewMode } from './components/NavigationStepper';
import { AuthRegistrationScreen } from './components/AuthRegistrationScreen';
import { PresentationHome } from './components/PresentationHome';
import { ChapterSelectionView } from './components/ChapterSelectionView';
import { QuestionSelectionView } from './components/QuestionSelectionView';
import { ProblemSolvingView } from './components/ProblemSolvingView';
import { InteractiveSignalVisualizer } from './components/InteractiveSignalVisualizer';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';
import { SavedProgressNotebook } from './components/SavedProgressNotebook';
import { StudentProfileModal } from './components/StudentProfileModal';
import { UserAccountAuthModal } from './components/UserAccountAuthModal';
import { KofiSupportModal } from './components/KofiSupportModal';
import { FormulaReferenceModal } from './components/FormulaReferenceModal';
import { ScratchpadModal } from './components/ScratchpadModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { EquationBlackboardModal } from './components/EquationBlackboardModal';
import { SimulatorOnboardingModal } from './components/SimulatorOnboardingModal';
import { ExerciseResponseGraphsModal } from './components/ExerciseResponseGraphsModal';
import { ScientificGraphingCalculatorModal } from './components/ScientificGraphingCalculatorModal';
import { ToolsAndGraphicsMenu } from './components/ToolsAndGraphicsMenu';
import { StackedDeckContainer } from './components/StackedDeckContainer';
import { DeviceSimulatorBar, DeviceMode } from './components/DeviceSimulatorBar';
import { DeviceViewportContainer } from './components/DeviceViewportContainer';
import { ThemeToggle } from './components/ThemeToggle';
import { TopBarAccountUsage } from './components/TopBarAccountUsage';
import {
  PenTool,
  BookOpen,
  CheckCircle2,
  Trophy,
  Sliders,
  Coins,
  CircleDollarSign,
  Coffee,
  Download,
  Flame,
  Award,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Calculator,
  User,
  Compass,
  Layers,
  FileCheck,
  LogOut,
  Boxes,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY_PROFILE = 'omnisinais_student_profile_v2';

const DEFAULT_PROFILE: StudentProfile = {
  name: '',
  ra: '',
  university: 'Engenharia Elétrica & Computação',
  course: 'Análise de Sinais e Sistemas',
  avatar: '🎓',
  xp: 0,
  level: 1,
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  completedProblems: [],
  completedQuizIds: [],
  resolvedRecords: {},
  badges: ['🌱 Novo Estudante'],
  kofiUsername: '',
  authData: {
    isLoggedIn: false,
    authProvider: 'guest',
    email: '',
    fullName: '',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    privacyAccepted: true,
    dataPrivacyMode: 'strictly_confidential',
  },
};

export default function App() {
  // Main view state
  const [currentView, setCurrentView] = useState<AppViewMode>('presentation');
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(1);
  const [activePracticeMode, setActivePracticeMode] = useState<'step_by_step' | 'multiple_choice'>('step_by_step');

  // Device Mode Viewport Simulator State (Smartphone, Tablet, Windows, Responsive)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');

  // Selected problem IDs
  const [selectedStepProblemId, setSelectedStepProblemId] = useState<string>(STEP_BY_STEP_PROBLEMS[0].id);
  const [selectedQuizProblemId, setSelectedQuizProblemId] = useState<string>(MULTIPLE_CHOICE_PROBLEMS[0].id);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isKofiModalOpen, setIsKofiModalOpen] = useState(false);
  const [isFormulasModalOpen, setIsFormulasModalOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isGlobalBlackboardOpen, setIsGlobalBlackboardOpen] = useState(false);
  const [isResponseGraphsModalOpen, setIsResponseGraphsModalOpen] = useState(false);
  const [isScientificCalculatorOpen, setIsScientificCalculatorOpen] = useState(false);
  const [isSimulatorOnboardingOpen, setIsSimulatorOnboardingOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);

  // Helper function to sanitize names and remove 'Watson Lopes' or 'Watson'
  const isWatsonName = (val?: string) => Boolean(val && /watson/i.test(val));

  // Student Profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      // Clear any stored Watson / Watson Lopes names from standalone localStorage keys
      const rawStoredName = localStorage.getItem('student_name') || localStorage.getItem('omnisinais_student_name') || '';
      if (isWatsonName(rawStoredName)) {
        localStorage.removeItem('student_name');
        localStorage.removeItem('omnisinais_student_name');
      }
      const localName = isWatsonName(rawStoredName) ? '' : rawStoredName;

      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      const localApiKey = localStorage.getItem('apiKey') || localStorage.getItem('omnisinais_gemini_api_key') || '';

      if (saved) {
        const parsed = JSON.parse(saved);
        const effectiveKey = parsed.apiKey || localApiKey;
        const hasValidKey = Boolean(effectiveKey && effectiveKey.trim().length > 30);
        
        let sanitizedName = parsed.name || localName || '';
        if (isWatsonName(sanitizedName)) {
          sanitizedName = '';
        }

        const authFullName = parsed.authData?.fullName || '';
        const sanitizedFullName = isWatsonName(authFullName) ? '' : authFullName;

        const authEmail = parsed.authData?.email || '';
        const sanitizedEmail = isWatsonName(authEmail) ? '' : authEmail;

        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          apiKey: effectiveKey,
          name: sanitizedName,
          resolvedRecords: parsed.resolvedRecords || {},
          authData: {
            ...(parsed.authData || DEFAULT_PROFILE.authData),
            fullName: sanitizedFullName,
            email: sanitizedEmail,
            isLoggedIn: Boolean(hasValidKey && (parsed.authData?.isLoggedIn || sanitizedName)),
            apiKey: effectiveKey,
          },
        };
      } else if (localApiKey && localApiKey.trim().length > 30) {
        return {
          ...DEFAULT_PROFILE,
          name: localName || '',
          apiKey: localApiKey,
          authData: {
            isLoggedIn: true,
            authProvider: 'google',
            email: localName.includes('@') ? localName : '',
            fullName: localName || '',
            apiKey: localApiKey,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            privacyAccepted: true,
            dataPrivacyMode: 'strictly_confidential',
          },
        };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  // Sanitize any residual Watson / Watson Lopes on app startup
  useEffect(() => {
    try {
      const keysToCheck = ['student_name', 'omnisinais_student_name', 'user_name'];
      keysToCheck.forEach(k => {
        const val = localStorage.getItem(k);
        if (isWatsonName(val || '')) {
          localStorage.removeItem(k);
        }
      });

      const profileRaw = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw);
        let changed = false;
        if (isWatsonName(parsed.name)) {
          parsed.name = '';
          changed = true;
        }
        if (parsed.authData && isWatsonName(parsed.authData.fullName)) {
          parsed.authData.fullName = '';
          changed = true;
        }
        if (parsed.authData && isWatsonName(parsed.authData.email)) {
          parsed.authData.email = '';
          changed = true;
        }
        if (changed) {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(parsed));
          setProfile(prev => ({
            ...prev,
            name: isWatsonName(prev.name) ? '' : prev.name,
            authData: {
              ...prev.authData,
              fullName: isWatsonName(prev.authData?.fullName) ? '' : prev.authData?.fullName,
              email: isWatsonName(prev.authData?.email) ? '' : prev.authData?.email,
            }
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save profile on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstallPWA(false);
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleProblemCompleted = (problemId: string, earnedXp: number, scratchpadNote?: string) => {
    const alreadyCompleted = profile.completedProblems.includes(problemId);
    const newCompleted = alreadyCompleted ? profile.completedProblems : [...profile.completedProblems, problemId];
    const newXp = alreadyCompleted ? profile.xp : profile.xp + earnedXp;
    const newLevel = Math.floor(newXp / 100) + 1;

    const currentRecords = profile.resolvedRecords || {};
    const newRecords: Record<string, ResolvedRecord> = {
      ...currentRecords,
      [problemId]: {
        problemId,
        type: 'step',
        resolvedAt: new Date().toISOString(),
        earnedXp,
        scratchpadNote: scratchpadNote || currentRecords[problemId]?.scratchpadNote || '',
      },
    };

    const totalCompletedBefore = profile.completedProblems.length + profile.completedQuizIds.length;
    const hasShownSimulatorOnboarding = localStorage.getItem('omnisinais_simulator_onboarding_shown') === 'true';

    if (totalCompletedBefore === 0 && !hasShownSimulatorOnboarding) {
      setTimeout(() => {
        setIsSimulatorOnboardingOpen(true);
        try {
          localStorage.setItem('omnisinais_simulator_onboarding_shown', 'true');
        } catch {}
      }, 1400);
    }

    setProfile({
      ...profile,
      xp: newXp,
      level: newLevel,
      completedProblems: newCompleted,
      resolvedRecords: newRecords,
    });
  };

  const handleQuizCompleted = (quizId: string, earnedXp: number, scratchpadNote?: string) => {
    const alreadyCompleted = profile.completedQuizIds.includes(quizId);
    const newCompleted = alreadyCompleted ? profile.completedQuizIds : [...profile.completedQuizIds, quizId];
    const newXp = alreadyCompleted ? profile.xp : profile.xp + earnedXp;
    const newLevel = Math.floor(newXp / 100) + 1;

    const currentRecords = profile.resolvedRecords || {};
    const newRecords: Record<string, ResolvedRecord> = {
      ...currentRecords,
      [quizId]: {
        problemId: quizId,
        type: 'quiz',
        resolvedAt: new Date().toISOString(),
        earnedXp,
        scratchpadNote: scratchpadNote || currentRecords[quizId]?.scratchpadNote || '',
      },
    };

    const totalCompletedBefore = profile.completedProblems.length + profile.completedQuizIds.length;
    const hasShownSimulatorOnboarding = localStorage.getItem('omnisinais_simulator_onboarding_shown') === 'true';

    if (totalCompletedBefore === 0 && !hasShownSimulatorOnboarding) {
      setTimeout(() => {
        setIsSimulatorOnboardingOpen(true);
        try {
          localStorage.setItem('omnisinais_simulator_onboarding_shown', 'true');
        } catch {}
      }, 1400);
    }

    setProfile({
      ...profile,
      xp: newXp,
      level: newLevel,
      completedQuizIds: newCompleted,
      resolvedRecords: newRecords,
    });
  };

  const handleSaveScratchpadNote = (problemId: string, note: string) => {
    const currentRecords = profile.resolvedRecords || {};
    const existing = currentRecords[problemId];
    const newRecords: Record<string, ResolvedRecord> = {
      ...currentRecords,
      [problemId]: {
        problemId,
        type: existing ? existing.type : 'step',
        resolvedAt: existing ? existing.resolvedAt : new Date().toISOString(),
        earnedXp: existing ? existing.earnedXp : 0,
        scratchpadNote: note,
      },
    };

    setProfile((prev) => ({
      ...prev,
      resolvedRecords: newRecords,
    }));
  };

  const handleResetProblemProgress = (problemId: string, type: 'step' | 'quiz') => {
    if (type === 'step') {
      const nextCompleted = profile.completedProblems.filter((id) => id !== problemId);
      const nextRecords = { ...profile.resolvedRecords };
      delete nextRecords[problemId];
      setProfile((prev) => ({
        ...prev,
        completedProblems: nextCompleted,
        resolvedRecords: nextRecords,
      }));
    } else {
      const nextCompleted = profile.completedQuizIds.filter((id) => id !== problemId);
      const nextRecords = { ...profile.resolvedRecords };
      delete nextRecords[problemId];
      setProfile((prev) => ({
        ...prev,
        completedQuizIds: nextCompleted,
        resolvedRecords: nextRecords,
      }));
    }
  };

  const handleSaveProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateAuth = (authData: StudentProfile['authData'], additionalProfile?: Partial<StudentProfile>) => {
    setProfile((prev) => ({
      ...prev,
      authData,
      ...(additionalProfile || {}),
    }));
  };

  // Navigations
  const handleNavigate = (view: AppViewMode, chapterNum?: number) => {
    if (chapterNum) {
      setSelectedChapterNum(chapterNum);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChapterFromView = (chapterNum: number) => {
    setSelectedChapterNum(chapterNum);
    // Find first problems for chapter
    const firstStep = STEP_BY_STEP_PROBLEMS.find((p) => p.chapter === chapterNum);
    if (firstStep) setSelectedStepProblemId(firstStep.id);

    const firstQuiz = MULTIPLE_CHOICE_PROBLEMS.find((p) => p.chapter === chapterNum);
    if (firstQuiz) setSelectedQuizProblemId(firstQuiz.id);

    setCurrentView('question_selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStepProblem = (problemId: string) => {
    setSelectedStepProblemId(problemId);
    setActivePracticeMode('step_by_step');
    setCurrentView('problem_solving');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuizProblem = (quizId: string) => {
    setSelectedQuizProblemId(quizId);
    setActivePracticeMode('multiple_choice');
    setCurrentView('problem_solving');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Current problem references
  const currentStepProblem = useMemo(() => {
    return (
      STEP_BY_STEP_PROBLEMS.find((p) => p.id === selectedStepProblemId) ||
      STEP_BY_STEP_PROBLEMS.find((p) => p.chapter === selectedChapterNum) ||
      STEP_BY_STEP_PROBLEMS[0]
    );
  }, [selectedStepProblemId, selectedChapterNum]);

  const currentQuizProblem = useMemo(() => {
    return (
      MULTIPLE_CHOICE_PROBLEMS.find((p) => p.id === selectedQuizProblemId) ||
      MULTIPLE_CHOICE_PROBLEMS.find((p) => p.chapter === selectedChapterNum) ||
      MULTIPLE_CHOICE_PROBLEMS[0]
    );
  }, [selectedQuizProblemId, selectedChapterNum]);

  const allChapterStepProblems = useMemo(() => {
    return STEP_BY_STEP_PROBLEMS.filter((p) => p.chapter === selectedChapterNum);
  }, [selectedChapterNum]);

  const allChapterQuizProblems = useMemo(() => {
    return MULTIPLE_CHOICE_PROBLEMS.filter((p) => p.chapter === selectedChapterNum);
  }, [selectedChapterNum]);

  const totalResolvedCount = profile.completedProblems.length + profile.completedQuizIds.length;

  const isUserAuthenticated = !!profile.authData?.isLoggedIn;

  const handleLogout = () => {
    try {
      localStorage.removeItem('apiKey');
      localStorage.removeItem('userApiKey');
      localStorage.removeItem('omnisinais_gemini_api_key');
    } catch (e) {
      console.error(e);
    }
    setProfile((prev) => ({
      ...prev,
      apiKey: '',
      authData: {
        isLoggedIn: false,
        authProvider: 'guest',
        email: '',
        fullName: '',
        apiKey: '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        privacyAccepted: true,
        dataPrivacyMode: 'strictly_confidential',
      },
    }));
  };

  const handleCompleteRegistration = (authData: StudentProfile['authData'], profileUpdates: Partial<StudentProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...profileUpdates,
      authData,
    }));
  };

  // If user is not authenticated/registered, display the mandatory registration gate
  if (!isUserAuthenticated) {
    return (
      <>
        <AuthRegistrationScreen
          onCompleteAuth={handleCompleteRegistration}
          onOpenKofi={() => setIsKofiModalOpen(true)}
        />
        <KofiSupportModal
          isOpen={isKofiModalOpen}
          onClose={() => setIsKofiModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/30 transition-colors duration-200">
      {/* Top Navbar with Uniform Icon & Button Layout */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavigate('presentation')}
            className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
            title="Voltar à tela inicial de apresentação"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg font-bold font-mono">Ω</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-indigo-200 dark:bg-clip-text">
                  OmniSinais
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hidden md:inline-block">
                  Sinais & Sistemas
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:block leading-none">
                Fourier • Laplace • EDOs • Z
              </p>
            </div>
          </button>

          {/* Center / Account Quota Monitor */}
          <div className="hidden lg:flex items-center">
            <TopBarAccountUsage
              profile={profile}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          </div>

          {/* Action Toolbar with Equal Sized Buttons (h-9) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 sm:pb-0">
            {/* Gráficos de Resposta & Gabarito Pré-Cálculo */}
            <button
              id="top-btn-response-graphs"
              onClick={() => setIsResponseGraphsModalOpen(true)}
              className="h-9 flex items-center gap-1.5 px-3 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/70 dark:to-indigo-950/70 hover:from-sky-100 hover:to-indigo-100 dark:hover:from-sky-900/70 dark:hover:to-indigo-900/70 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-xl border border-sky-300 dark:border-sky-700/60 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Acessar Gráficos de Resposta de Todos os Exercícios para Consulta Pré-Cálculo & Conferência"
            >
              <Activity className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="hidden sm:inline">Gráficos de Resposta</span>
            </button>

            {/* Calculadora Científica & Gráfica 2D/3D */}
            <button
              id="top-btn-calculator"
              onClick={() => setIsScientificCalculatorOpen(true)}
              className="h-9 flex items-center gap-1.5 px-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/70 dark:to-orange-950/70 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/70 dark:hover:to-orange-900/70 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700/60 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Abrir Calculadora Científica com Gráficos 2D e 3D em tempo real"
            >
              <Calculator className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Calculadora 2D/3D</span>
            </button>

            {/* Menu de Ferramentas & Gráficos */}
            <button
              id="top-btn-tools-menu"
              onClick={() => setIsToolsMenuOpen(true)}
              className="h-9 flex items-center gap-1.5 px-3 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-700/60 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Abrir Menu com todas as Ferramentas, Gráficos e Simuladores disponíveis"
            >
              <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="hidden md:inline">Ferramentas</span>
            </button>

            {/* Formulário Geral & Tabelas */}
            <button
              id="top-btn-formulas"
              onClick={() => setIsFormulasModalOpen(true)}
              className="h-9 flex items-center gap-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Ver Formulário Geral & Tabelas"
            >
              <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="hidden lg:inline">Formulário</span>
            </button>

            {/* Install PWA Button */}
            <button
              id="top-btn-install"
              onClick={handleInstallApp}
              className="h-9 flex items-center gap-1.5 px-2.5 sm:px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700/80 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Instalar App no dispositivo"
            >
              <Download className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
              <span className="hidden xl:inline">Instalar</span>
            </button>

            {/* Apoiar o Desenvolvedor (PIX & Ko-fi) */}
            <button
              id="top-btn-kofi"
              onClick={() => setIsKofiModalOpen(true)}
              className="h-9 flex items-center gap-1.5 px-2.5 sm:px-3 bg-gradient-to-r from-emerald-600 via-amber-600 to-emerald-700 hover:from-emerald-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl border border-amber-500/30 shadow-md shadow-amber-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Apoiar o Desenvolvedor via PIX ou Ko-fi"
            >
              <Coins className="w-4 h-4 text-white animate-bounce shrink-0" />
              <span className="hidden sm:inline">Apoiar</span>
            </button>

            {/* Conta & Cadastro Status */}
            <button
              id="top-btn-auth"
              onClick={() => setIsAuthModalOpen(true)}
              className={`h-9 flex items-center gap-1.5 px-2.5 sm:px-3 text-xs font-semibold rounded-xl border transition-all shadow-2xs cursor-pointer shrink-0 ${
                profile.authData?.isLoggedIn
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
              title="Cadastro Sigiloso & Backup do Progresso"
            >
              <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="hidden xl:inline">
                {profile.authData?.isLoggedIn ? 'Conta' : 'Cadastro'}
              </span>
            </button>

            {/* System / Light / Dark Theme Toggle */}
            <ThemeToggle className="shrink-0" />

            {/* Student Profile & XP Pill */}
            <button
              id="top-btn-profile"
              onClick={() => setIsProfileModalOpen(true)}
              className="h-9 flex items-center gap-2 px-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-indigo-900/60 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
              title="Ver Perfil do Estudante e Estatísticas"
            >
              <span className="text-base leading-none">{profile.avatar}</span>
              <div className="text-left hidden sm:block leading-tight">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                  {profile.name ? profile.name.split(' ')[0] : 'Estudante'}
                </div>
                <div className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {profile.xp} XP
                </div>
              </div>
            </button>

            {/* Logout / Switch Account Button */}
            <button
              id="top-btn-logout"
              onClick={handleLogout}
              className="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Sair da Conta / Trocar de Estudante"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Device Simulator Bar (Smartphone, Tablet, Windows, Fullscreen) */}
      <DeviceSimulatorBar
        currentMode={deviceMode}
        onChangeMode={setDeviceMode}
      />

      {/* Navigation Stepper (Início -> 1. Tema -> 2. Questão -> 3. Resolver) */}
      <NavigationStepper
        currentView={currentView}
        selectedChapterNum={selectedChapterNum}
        selectedProblemTitle={activePracticeMode === 'step_by_step' ? currentStepProblem.title : currentQuizProblem?.title}
        onNavigate={handleNavigate}
        resolvedCount={totalResolvedCount}
      />

      {/* Device Viewport Wrapper & Main Multi-Screen Content Area */}
      <DeviceViewportContainer
        mode={deviceMode}
        onCloseDeviceMode={() => setDeviceMode('responsive')}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
          {/* Stacked Layered Deck Wrapper for the 3 Core Steps */}
          <StackedDeckContainer
            currentView={currentView}
            selectedChapterNum={selectedChapterNum}
            selectedStepProblemId={selectedStepProblemId}
            selectedQuizProblemId={selectedQuizProblemId}
            activeMode={activePracticeMode}
            stepProblems={STEP_BY_STEP_PROBLEMS}
            quizProblems={MULTIPLE_CHOICE_PROBLEMS}
            onNavigate={handleNavigate}
          >
            {/* Page 0: Página de Apresentação */}
            {currentView === 'presentation' && (
              <PresentationHome
                profile={profile}
                totalStepProblemsCount={STEP_BY_STEP_PROBLEMS.length}
                totalQuizProblemsCount={MULTIPLE_CHOICE_PROBLEMS.length}
                onStartStudying={() => handleNavigate('chapter_selection')}
                onSelectChapter={handleSelectChapterFromView}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenFormulas={() => setIsFormulasModalOpen(true)}
                onOpenResponseGraphs={() => setIsResponseGraphsModalOpen(true)}
                onOpenCalculator={() => setIsScientificCalculatorOpen(true)}
                onOpenBlackboard={() => setIsGlobalBlackboardOpen(true)}
                onOpenNotebook={() => handleNavigate('resolved_notebook')}
                onOpenVisualizer={() => handleNavigate('visualizer')}
                onOpenLeaderboard={() => handleNavigate('leaderboard')}
                onOpenKofi={() => setIsKofiModalOpen(true)}
              />
            )}

            {/* Page 1: Escolha do Tema ou Capítulo */}
            {currentView === 'chapter_selection' && (
              <ChapterSelectionView
                stepProblems={STEP_BY_STEP_PROBLEMS}
                quizProblems={MULTIPLE_CHOICE_PROBLEMS}
                profile={profile}
                onSelectChapter={handleSelectChapterFromView}
                onBackToHome={() => handleNavigate('presentation')}
              />
            )}

            {/* Page 2: Seleção da Questão do Tema Escolhido */}
            {currentView === 'question_selection' && (
              <QuestionSelectionView
                chapterNum={selectedChapterNum}
                stepProblems={STEP_BY_STEP_PROBLEMS}
                quizProblems={MULTIPLE_CHOICE_PROBLEMS}
                profile={profile}
                activeMode={activePracticeMode}
                onChangeMode={setActivePracticeMode}
                onSelectStepProblem={handleSelectStepProblem}
                onSelectQuizProblem={handleSelectQuizProblem}
                onBackToChapters={() => handleNavigate('chapter_selection')}
              />
            )}

            {/* Page 3: Espaço de Resolução da Questão Selecionada */}
            {currentView === 'problem_solving' && (
              <ProblemSolvingView
                chapterNum={selectedChapterNum}
                activeMode={activePracticeMode}
                currentStepProblem={currentStepProblem}
                currentQuizProblem={currentQuizProblem}
                allChapterStepProblems={allChapterStepProblems}
                allChapterQuizProblems={allChapterQuizProblems}
                profile={profile}
                onSelectStepProblem={setSelectedStepProblemId}
                onSelectQuizProblem={setSelectedQuizProblemId}
                onChangeMode={setActivePracticeMode}
                onProblemCompleted={handleProblemCompleted}
                onQuizCompleted={handleQuizCompleted}
                onSaveScratchpad={handleSaveScratchpadNote}
                onOpenScratchpadModal={() => setIsScratchpadOpen(true)}
                onBackToQuestions={() => handleNavigate('question_selection', selectedChapterNum)}
                onBackToChapters={() => handleNavigate('chapter_selection')}
              />
            )}
          </StackedDeckContainer>

          {/* Supplementary View 1: Simulador Visual de Sinais */}
          {currentView === 'visualizer' && (
            <div className="space-y-4 animate-fade-in">
              <InteractiveSignalVisualizer />
            </div>
          )}

          {/* Supplementary View 2: Caderno de Exercícios Salvos */}
          {currentView === 'resolved_notebook' && (
            <div className="space-y-4 animate-fade-in">
              <SavedProgressNotebook
                profile={profile}
                allStepProblems={STEP_BY_STEP_PROBLEMS}
                allQuizProblems={MULTIPLE_CHOICE_PROBLEMS}
                onSelectStepProblem={(id) => {
                  const prob = STEP_BY_STEP_PROBLEMS.find((p) => p.id === id);
                  if (prob) {
                    setSelectedChapterNum(prob.chapter);
                    setSelectedStepProblemId(id);
                    setActivePracticeMode('step_by_step');
                    setCurrentView('problem_solving');
                  }
                }}
                onSelectQuizProblem={(id) => {
                  const quiz = MULTIPLE_CHOICE_PROBLEMS.find((q) => q.id === id);
                  if (quiz) {
                    setSelectedChapterNum(quiz.chapter);
                    setSelectedQuizProblemId(id);
                    setActivePracticeMode('multiple_choice');
                    setCurrentView('problem_solving');
                  }
                }}
                onResetProblemProgress={handleResetProblemProgress}
                onUpdateScratchpadNote={handleSaveScratchpadNote}
              />
            </div>
          )}

          {/* Supplementary View 3: Ranking Mundial */}
          {currentView === 'leaderboard' && (
            <div className="space-y-4 animate-fade-in">
              <GlobalLeaderboard currentUserProfile={profile} />
            </div>
          )}
        </main>
      </DeviceViewportContainer>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-4 px-6 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-left">
            <span className="text-slate-600 dark:text-slate-400">
              OmniSinais — Material didático: Sinais & Sistemas, Série e Transformada de Fourier e Laplace.
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Fluxo em 3 Etapas Ativo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsKofiModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-1.5 font-semibold transition-colors bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 cursor-pointer"
            >
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Apoiar o Desenvolvedor</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenKofi={() => setIsKofiModalOpen(true)}
      />

      <UserAccountAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        profile={profile}
        onUpdateAuth={handleUpdateAuth}
        onOpenKofi={() => setIsKofiModalOpen(true)}
      />

      <KofiSupportModal
        isOpen={isKofiModalOpen}
        onClose={() => setIsKofiModalOpen(false)}
      />

      <FormulaReferenceModal
        isOpen={isFormulasModalOpen}
        onClose={() => setIsFormulasModalOpen(false)}
      />

      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onTriggerPwa={handleInstallApp}
      />

      <ExerciseResponseGraphsModal
        isOpen={isResponseGraphsModalOpen}
        onClose={() => setIsResponseGraphsModalOpen(false)}
        stepProblems={STEP_BY_STEP_PROBLEMS}
        quizProblems={MULTIPLE_CHOICE_PROBLEMS}
        onSelectProblemToSolve={(problemId, type, chapterNum) => {
          setSelectedChapterNum(chapterNum);
          if (type === 'step') {
            setSelectedStepProblemId(problemId);
            setActivePracticeMode('step_by_step');
          } else {
            setSelectedQuizProblemId(problemId);
            setActivePracticeMode('multiple_choice');
          }
          setCurrentView('problem_solving');
        }}
      />

      <EquationBlackboardModal
        isOpen={isGlobalBlackboardOpen}
        onClose={() => setIsGlobalBlackboardOpen(false)}
        onInsertToInput={() => {
          setIsGlobalBlackboardOpen(false);
        }}
        currentExerciseContext="Lousa Livre do Aluno - OmniSinais Engenharia"
      />

      <SimulatorOnboardingModal
        isOpen={isSimulatorOnboardingOpen}
        onClose={() => setIsSimulatorOnboardingOpen(false)}
        onOpenSimulator={() => {
          setIsSimulatorOnboardingOpen(false);
          setIsGlobalBlackboardOpen(true);
        }}
      />

      <ScientificGraphingCalculatorModal
        isOpen={isScientificCalculatorOpen}
        onClose={() => setIsScientificCalculatorOpen(false)}
      />

      <ToolsAndGraphicsMenu
        isOpen={isToolsMenuOpen}
        onClose={() => setIsToolsMenuOpen(false)}
        onOpenResponseGraphs={() => setIsResponseGraphsModalOpen(true)}
        onOpenBlackboard={() => setIsGlobalBlackboardOpen(true)}
        onOpenVisualizer={() => setCurrentView('visualizer')}
        onOpenCalculator={() => setIsScientificCalculatorOpen(true)}
        onOpenFormulas={() => setIsFormulasModalOpen(true)}
        onOpenNotebook={() => setCurrentView('resolved_notebook')}
        onOpenExercises={() => setCurrentView('problem_solving')}
      />
    </div>
  );
}
