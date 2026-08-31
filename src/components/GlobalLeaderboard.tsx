import React, { useState } from 'react';
import { StudentProfile, LeaderboardUser } from '../types';
import { Trophy, Globe, Award, Sparkles, User, Search, Filter } from 'lucide-react';

interface GlobalLeaderboardProps {
  currentUserProfile: StudentProfile;
}

const GLOBAL_BASE_STUDENTS: Omit<LeaderboardUser, 'rank'>[] = [
  {
    id: 'usr-1',
    name: 'Carlos Eduardo Ramos',
    university: 'USP - Universidade de São Paulo',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    xp: 680,
    level: 7,
    badge: '👑 Mestre de Laplace'
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    university: 'TU Munich',
    country: 'Alemanha',
    countryFlag: '🇩🇪',
    xp: 590,
    level: 6,
    badge: '⚡ Fourier Wizard'
  },
  {
    id: 'usr-3',
    name: 'Lucas P. Silva',
    university: 'Centro Universitário Una - Pouso Alegre',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    xp: 510,
    level: 5,
    badge: '🎯 Rei da Convolução'
  },
  {
    id: 'usr-4',
    name: 'David Chen',
    university: 'MIT - Massachusetts Institute of Tech',
    country: 'Estados Unidos',
    countryFlag: '🇺🇸',
    xp: 440,
    level: 4,
    badge: '📐 Especialista em Polos & Zeros'
  },
  {
    id: 'usr-5',
    name: 'Mariana Duarte',
    university: 'UNICAMP - Univ. Estadual de Campinas',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    xp: 380,
    level: 4,
    badge: '🧠 Dirac Sampling Pro'
  },
  {
    id: 'usr-6',
    name: 'João Pedro Alencar',
    university: 'ITA - Instituto Tecnológico de Aeronáutica',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    xp: 320,
    level: 3,
    badge: '🔬 Heaviside Cover-Up'
  },
  {
    id: 'usr-7',
    name: 'Sophie Martin',
    university: 'École Polytechnique',
    country: 'França',
    countryFlag: '🇫🇷',
    xp: 260,
    level: 3,
    badge: '📚 Dirichlet Master'
  },
  {
    id: 'usr-8',
    name: 'Mateo Fernández',
    university: 'Universidad de Buenos Aires',
    country: 'Argentina',
    countryFlag: '🇦🇷',
    xp: 190,
    level: 2,
    badge: '⚡ Sinais Elementares'
  }
];

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  currentUserProfile,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [viewScope, setViewScope] = useState<'global' | 'brazil'>('global');

  // Insert current user into list
  const currentStudentEntry: Omit<LeaderboardUser, 'rank'> = {
    id: 'current-user-id',
    name: currentUserProfile.name || 'Você (Aluno Atual)',
    university: currentUserProfile.university || 'Sua Faculdade',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    xp: currentUserProfile.xp,
    level: currentUserProfile.level,
    badge: currentUserProfile.xp > 500 ? '👑 Elite dos Sinais' : currentUserProfile.xp > 200 ? '⚡ Engenheiro em Foco' : '🌱 Calouro de Sinais',
    isCurrentUser: true,
  };

  // Combine and sort by XP descending
  const allUsers = [...GLOBAL_BASE_STUDENTS, currentStudentEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((user, idx) => ({ ...user, rank: idx + 1 }));

  const filteredUsers = allUsers.filter((u) => {
    if (viewScope === 'brazil' && u.country !== 'Brasil') return false;
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.university.toLowerCase().includes(q);
  });

  const currentUserRank = allUsers.find((u) => u.isCurrentUser)?.rank || 1;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                Ranking Acadêmico Mundial
                <Globe className="w-5 h-5 text-sky-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Classificação online em tempo real de estudantes de Engenharia & Ciências Exatas
              </p>
            </div>
          </div>

          {/* Current User Rank Pill */}
          <div className="p-3 bg-slate-950/80 border border-amber-500/40 rounded-xl flex items-center gap-3">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Sua Posição</div>
              <div className="text-xl font-extrabold text-amber-300 font-mono">#{currentUserRank}</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xs font-semibold text-slate-200">{currentUserProfile.name}</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">{currentUserProfile.xp} XP Acumulados</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewScope('global')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewScope === 'global'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌎 Classificação Global
            </button>
            <button
              onClick={() => setViewScope('brazil')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewScope === 'brazil'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇧🇷 Universidades Brasileiras
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aluno ou faculdade..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-slate-950 text-slate-200 placeholder:text-slate-500 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[600px] space-y-2">
          {filteredUsers.map((user) => {
            const isTop1 = user.rank === 1;
            const isTop2 = user.rank === 2;
            const isTop3 = user.rank === 3;

            return (
              <div
                key={user.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  user.isCurrentUser
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950'
                    : isTop1
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : isTop2
                    ? 'bg-slate-800/60 border-slate-400/40'
                    : isTop3
                    ? 'bg-amber-900/20 border-amber-700/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Rank + User info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                      isTop1
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : isTop2
                        ? 'bg-slate-300 text-slate-950'
                        : isTop3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {user.rank}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{user.countryFlag}</span>
                      <span className={`text-sm font-bold ${user.isCurrentUser ? 'text-indigo-200' : 'text-slate-100'}`}>
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                          VOCÊ
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{user.university}</span>
                    </div>
                  </div>
                </div>

                {/* Badge & XP */}
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-block px-2.5 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {user.badge}
                  </span>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      {user.xp} XP
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Nível {user.level}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;
