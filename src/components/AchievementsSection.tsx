import React from 'react';
import { Trophy, Award, Medal, Star, School, Calendar, CheckCircle } from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface AchievementsSectionProps {
  portfolioData: PortfolioDataType;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ portfolioData }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const achievements = portfolioData.achievements || [];

  const getTrophyBadge = (badge?: string, idx = 0) => {
    if (badge) return badge;
    if (idx === 0) return 'National Silver';
    if (idx === 1) return 'Regional Finalist';
    if (idx === 2) return '1st Place Gold';
    return 'Excellence Award';
  };

  return (
    <section id="achievements" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-amber-500/10 text-amber-500 border-amber-500/20">
          <Trophy className="w-3.5 h-3.5" />
          <span>Honors & Contests</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Institutional Awards & Recognition
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Prestigious competitive programming awards and academic citations earned from universities and polytechnic institutions.
        </p>
      </div>

      {/* Grid of Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group ${
              isDark
                ? 'bg-slate-900/70 border-slate-800/80 hover:border-amber-500/50 shadow-black/40'
                : 'bg-white/80 border-slate-200/80 hover:border-amber-400/60 shadow-slate-200/50'
            }`}
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Medal className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {getTrophyBadge(item.badge, idx)}
                </span>
              </div>

              {/* Award Title */}
              <h3 className={`text-base sm:text-lg font-bold mb-2 group-hover:text-amber-400 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {item.title}
              </h3>

              {/* Educational Institution & Year */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <School className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{item.organization}</span>
                </div>
                {item.year && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.year}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/10 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
              <span>Verified Contest Honor</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
