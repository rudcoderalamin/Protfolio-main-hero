import React, { useState } from 'react';
import { Code2, Terminal, Database, Wrench, Layers, CheckCircle2, Cpu } from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface SkillsSectionProps {
  portfolioData: PortfolioDataType;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ portfolioData }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const skillCategories = portfolioData.skills || [];

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('frontend')) return <Layers className="w-5 h-5 text-cyan-400" />;
    if (cat.includes('backend') || cat.includes('database')) return <Database className="w-5 h-5 text-emerald-400" />;
    if (cat.includes('language') || cat.includes('cs') || cat.includes('problem')) return <Terminal className="w-5 h-5 text-amber-400" />;
    return <Wrench className="w-5 h-5 text-indigo-400" />;
  };

  const getLevelBadge = (level: string) => {
    const lvl = level.toLowerCase();
    if (lvl.includes('expert')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
          Expert
        </span>
      );
    }
    if (lvl.includes('advanced')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-500 border border-sky-500/30">
          Advanced
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
        Proficient
      </span>
    );
  };

  return (
    <section id="skills" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <Code2 className="w-3.5 h-3.5" />
          <span>Technical Competencies</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Languages, Frameworks & Developer Tools
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Comprehensive technical stack covering modern web architecture, algorithmic computing, and tooling.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((group, idx) => (
          <div
            key={idx}
            className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
              isDark
                ? 'bg-slate-900/70 border-slate-800/80 hover:border-sky-500/50 shadow-black/40'
                : 'bg-white/80 border-slate-200/80 hover:border-sky-400/60 shadow-slate-200/50'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/10 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  {getCategoryIcon(group.category)}
                </div>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {group.category}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {group.skills?.length || 0} Technologies
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Pills / Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(group.skills || []).map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isDark
                      ? 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700 hover:bg-slate-950'
                      : 'bg-slate-50/80 border-slate-200/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {skill.name}
                    </span>
                  </div>
                  {getLevelBadge(skill.level)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
