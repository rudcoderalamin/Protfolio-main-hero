import React from 'react';
import { Briefcase, CheckCircle2, Trophy, Sparkles, Milestone } from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface ExperienceSectionProps {
  portfolioData: PortfolioDataType;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ portfolioData }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const experiences = portfolioData.experiences || [];

  return (
    <section id="experience" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Institutional Milestones</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {portfolioData.sectionTitles?.experience || 'Institutional Achievements & Impact'}
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {portfolioData.sectionSubtitles?.experience || 'Key technical milestones, software deliveries, and solutions achieved across institutions.'}
        </p>
      </div>

      {/* Experience Cards - NO company name, NO year name */}
      <div className="space-y-6">
        {experiences.map((exp, idx) => (
          <div
            key={exp.id || idx}
            className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl relative overflow-hidden ${
              isDark
                ? 'bg-slate-900/70 border-slate-800/80 hover:border-sky-500/50 shadow-black/40'
                : 'bg-white/80 border-slate-200/80 hover:border-sky-400/60 shadow-slate-200/50'
            }`}
          >
            {/* Top Row: Track Title & Milestone Badge (No company, No year) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/10 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/20">
                  <Milestone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {exp.role}
                  </h3>
                  <span className="text-xs font-medium text-sky-500">
                    {exp.type || 'Key Accomplishments'}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                <Trophy className="w-3.5 h-3.5" />
                <span>Verified Impact</span>
              </div>
            </div>

            {/* Highlights List */}
            <div className="space-y-3">
              {(exp.highlights || []).map((highlight, hIdx) => (
                <div key={hIdx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
