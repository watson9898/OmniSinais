// Token Usage & Google AI Studio Quota Tracker for OmniSinais

export interface TokenUsageStats {
  date: string; // YYYY-MM-DD
  requestsToday: number;
  tokensToday: number;
  promptTokensToday: number;
  candidatesTokensToday: number;
  lastRequestTokens?: number;
  lastRequestTime?: string;
  // Free Tier Limits (Google AI Studio - Gemini 1.5/2.0/3.0 Flash)
  dailyRequestLimit: number; // 1500 Requests Per Day (RPD)
  rpmLimit: number; // 15 Requests Per Minute (RPM)
  tpmLimit: number; // 1,000,000 Tokens Per Minute (TPM)
  modelName: string;
}

const STORAGE_KEY = 'omnisinais_token_usage_v2';
const EVENT_NAME = 'omnisinais_token_update';

export const GOOGLE_AI_STUDIO_FREE_LIMITS = {
  DAILY_REQUESTS: 1500, // 1.5k requests/day
  RPM: 15,
  TPM: 1000000,
  ESTIMATED_DAILY_TOKENS: 5000000, // Visual benchmark (5M tokens/day)
  MODEL: 'Gemini 3.7 Flash',
};

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getStoredTokenUsage(): TokenUsageStats {
  const today = getTodayString();
  const defaultStats: TokenUsageStats = {
    date: today,
    requestsToday: 0,
    tokensToday: 0,
    promptTokensToday: 0,
    candidatesTokensToday: 0,
    dailyRequestLimit: GOOGLE_AI_STUDIO_FREE_LIMITS.DAILY_REQUESTS,
    rpmLimit: GOOGLE_AI_STUDIO_FREE_LIMITS.RPM,
    tpmLimit: GOOGLE_AI_STUDIO_FREE_LIMITS.TPM,
    modelName: GOOGLE_AI_STUDIO_FREE_LIMITS.MODEL,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed: TokenUsageStats = JSON.parse(raw);
    if (parsed.date !== today) {
      // New day: reset daily counters, keep limits
      return {
        ...defaultStats,
        date: today,
      };
    }
    return {
      ...defaultStats,
      ...parsed,
    };
  } catch {
    return defaultStats;
  }
}

export function recordTokenUsage(usage: {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}): TokenUsageStats {
  const current = getStoredTokenUsage();
  const promptTokens = usage.promptTokenCount || 0;
  const candidatesTokens = usage.candidatesTokenCount || 0;
  const totalTokens = usage.totalTokenCount || (promptTokens + candidatesTokens);

  const updated: TokenUsageStats = {
    ...current,
    requestsToday: current.requestsToday + 1,
    tokensToday: current.tokensToday + totalTokens,
    promptTokensToday: current.promptTokensToday + promptTokens,
    candidatesTokensToday: current.candidatesTokensToday + candidatesTokens,
    lastRequestTokens: totalTokens,
    lastRequestTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Não foi possível salvar uso de tokens no localStorage:', err);
  }

  // Dispatch custom event so top bar updates in real time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  }

  return updated;
}

export function subscribeTokenUsage(callback: (stats: TokenUsageStats) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<TokenUsageStats>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getStoredTokenUsage());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    }
  };
}

export function getMaskedApiKey(key?: string): string {
  const effectiveKey = key || (typeof localStorage !== 'undefined' ? (localStorage.getItem('apiKey') || localStorage.getItem('omnisinais_gemini_api_key') || '') : '');
  if (!effectiveKey || effectiveKey.trim().length === 0) {
    return 'Não conectada';
  }
  const clean = effectiveKey.trim();
  if (clean.length <= 8) {
    return `${clean.slice(0, 3)}••••`;
  }
  const prefix = clean.slice(0, 6);
  const suffix = clean.slice(-4);
  return `${prefix}••••${suffix}`;
}

export function getActiveUserEmailDisplay(profileEmail?: string, profileName?: string): string {
  // Always keep user identification safe and anonymous for privacy
  return 'estudante@universidade.edu.br';
}
