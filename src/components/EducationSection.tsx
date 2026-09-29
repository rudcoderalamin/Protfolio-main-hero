import React from 'react';
import { GraduationCap, Calendar, BookOpen, Award, CheckCircle } from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface EducationSectionProps {
  portfolioData: PortfolioDataType;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ portfolioData }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const educationList = portfolioData.education || [];

  return (
    <section id="education" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic Background</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Education & Formal Qualifications
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Academic foundation in computer engineering, algorithms, and continuous technical certifications.
        </p>
      </div>

      {/* Education Cards Grid (4-5 items) */}
      <div className="space-y-5">
        {educationList.map((edu, idx) => (
          <div
            key={edu.id || idx}
            className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row md:items-start justify-between gap-6 group ${
              isDark
                ? 'bg-slate-900/70 border-slate-800/80 hover:border-emerald-500/50 shadow-black/40'
                : 'bg-white/80 border-slate-200/80 hover:border-emerald-400/60 shadow-slate-200/50'
            }`}
          >
            {/* Left: Icon & Institution */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {edu.degree}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>{edu.institution}</span>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed pt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {edu.details}
                </p>
              </div>
            </div>

            {/* Right: Period Tag */}
            {edu.period && (
              <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/10 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/10 dark:bg-slate-800 text-slate-400 border border-slate-700/30">
                  <Calendar className="w-3 h-3 text-emerald-500" />
                  <span>{edu.period}</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
