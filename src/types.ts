/**
 * Types and interfaces for OmniSinais educational study app
 */

export type SubjectCategory =
  | 'all'
  | 'signals'
  | 'fourier'
  | 'laplace'
  | 'differential_equations'
  | 'electrical_engineering';

export interface InterpretationGuide {
  objective: string; // O que a questão realmente pede
  givenData: { label: string; value: string }[]; // Dados identificados do enunciado
  strategy: string[]; // Roteiro mental / Passo a passo de resolução
  pitfalls?: string; // Cuidados e erros comuns a evitar
}

export interface QuestionFormulaGuide {
  title: string; // Nome da fórmula ou propriedade
  formulaLatex: string; // LaTeX da fórmula
  howToApply: string; // Como aplicar nesta questão em detalhes
  stepsToFollow?: string[]; // Passo a passo de aplicação
  variableMap?: { symbol: string; meaning: string; valueInQuestion: string }[];
}

export interface StepItem {
  id: string;
  stepNumber: number;
  instruction: string; // What the student needs to do in this step
  formulaHelper?: string; // LaTeX formula reference to help
  expectedAnswer: string; // Standard simplified answer
  acceptableAnswers: string[]; // List of alternative forms (e.g., "1/(s+2)", "3/(s+2)", "(3)/(s+2)")
  explanationOnCorrect: string; // Educational explanation of why this step works
  hint: string; // Progressive hint
  inputType: 'math_text' | 'choice' | 'numeric';
  options?: string[]; // If inputType is choice
}

export interface StepByStepProblem {
  id: string;
  title: string;
  chapter: number; // 1, 2, 3, 4, or 5
  chapterName: string;
  category: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  statement: string; // Problem statement in markdown/LaTeX
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  xpReward: number;
  contextTheory: string; // Brief theory reminder
  interpretationGuide?: InterpretationGuide;
  formulaGuide?: QuestionFormulaGuide;
  steps: StepItem[];
  finalSolutionLatex: string;
  graphType?: 'signal' | 'fourier_series' | 'pole_zero' | 'circuit';
  graphParams?: Record<string, any>;
}

export interface MultipleChoiceProblem {
  id: string;
  title: string;
  chapter: number;
  chapterName: string;
  category: 'signals' | 'fourier' | 'laplace' | 'differential_equations' | 'electrical_engineering';
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  statement: string; // With LaTeX
  interpretationGuide?: InterpretationGuide;
  formulaGuide?: QuestionFormulaGuide;
  options: {
    text: string; // LaTeX or markdown
    isCorrect: boolean;
    explanation: string;
  }[];
  guidedHint: string; // Theoretical hint to guide before answering
  stepByStepSolution: string; // Full breakdown
  xpReward: number;
}

export interface ResolvedRecord {
  problemId: string;
  type: 'step' | 'quiz';
  resolvedAt: string;
  earnedXp: number;
  scratchpadNote?: string;
  userAnswer?: string;
}

export interface UserAuthData {
  isLoggedIn: boolean;
  authProvider: 'google' | 'apple' | 'email' | 'guest';
  email: string;
  fullName?: string;
  apiKey?: string;
  createdAt: string;
  lastLoginAt: string;
  privacyAccepted: boolean;
  dataPrivacyMode: 'strictly_confidential' | 'standard';
  isDonorAcknowledged?: boolean;
  kofiSupporterBadge?: boolean;
}

export interface StudentProfile {
  name: string;
  ra?: string;
  university: string;
  course: string;
  avatar: string;
  apiKey?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedProblems: string[]; // Problem IDs
  completedQuizIds: string[];
  resolvedRecords?: Record<string, ResolvedRecord>;
  badges: string[];
  kofiUsername?: string;
  authData?: UserAuthData;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  university: string;
  country: string;
  countryFlag: string;
  xp: number;
  level: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface FormulaQuickCard {
  id: string;
  title: string;
  chapter: string;
  latex: string;
  description: string;
  ruleCode?: string;
}
