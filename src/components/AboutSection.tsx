import React from 'react';
import { User, GraduationCap, Workflow, CheckCircle, Sparkles, Code, Cpu, ShieldCheck } from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface AboutSectionProps {
  portfolioData: PortfolioDataType;
  onOpenContact?: () => void;
  onOpenResume?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ portfolioData, onOpenContact, onOpenResume }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const about = portfolioData.about || {
    greeting: `Hi, I'm ${portfolioData.name || 'Al Amin Islam'}`,
    bioSummary: portfolioData.bio || "Fullstack Web Developer specializing in React, Next.js, and Node.js. Blending advanced problem-solving with modern design to build scalable, high-performance applications.",
    educationalBackground: "Diploma in Computer Science & Technology from Tangail Polytechnic Institute (2021-2025). Rooted in strong algorithmic foundations and practical software engineering.",
    workPhilosophy: "I build with a clean-code mindset, agile iterations, and performance-first architecture. Emphasizing accessible user interfaces, test-driven stability, and prompt turnaround.",
    highlights: [
      "Full-Stack Web Architecture (Next.js & Node.js)",
      "Competitive Problem Solving (620+ Algorithmic Challenges)",
      "Modern UI/UX Implementation with Tailwind CSS",
      "Robust Database Schema & RESTful API Engineering"
    ]
  };

  return (
    <section id="about" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <User className="w-3.5 h-3.5" />
          <span>About Me</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {portfolioData.sectionTitles?.about || 'Engineering Scalable Solutions With Passion'}
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {portfolioData.sectionSubtitles?.about || 'Get to know my journey, academic credentials, and core development philosophy.'}
        </p>
      </div>

      {/* 3 Pillars Grid: Identity, Education, Working Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1: Identity & Background */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
          isDark
            ? 'bg-slate-900/70 border-slate-800/80 hover:border-sky-500/50 shadow-black/40'
            : 'bg-white/80 border-slate-200/80 hover:border-sky-400/60 shadow-slate-200/50'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-5 border border-sky-500/20">
              <User className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Who I Am (নিজের পরিচয়)
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.bioSummary}
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-800/20 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-sky-500">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Passionate Developer & Problem Solver</span>
          </div>
        </div>

        {/* Card 2: Educational Qualification */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
          isDark
            ? 'bg-slate-900/70 border-slate-800/80 hover:border-emerald-500/50 shadow-black/40'
            : 'bg-white/80 border-slate-200/80 hover:border-emerald-400/60 shadow-slate-200/50'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 border border-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Education (শিক্ষাগত যোগ্যতা)
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.educationalBackground}
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-800/20 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-emerald-500">
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Computer Science & Technology Track</span>
          </div>
        </div>

        {/* Card 3: Working Style & Philosophy */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
          isDark
            ? 'bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/50 shadow-black/40'
            : 'bg-white/80 border-slate-200/80 hover:border-indigo-400/60 shadow-slate-200/50'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 border border-indigo-500/20">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Work Style (কাজের ধরণ)
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {about.workPhilosophy}
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-800/20 dark:border-slate-800 flex items-center gap-2 text-xs font-medium text-indigo-500">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Clean Architecture & Agile Delivery</span>
          </div>
        </div>
      </div>

      {/* Key Highlights Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${
        isDark
          ? 'bg-slate-900/50 border-slate-800'
          : 'bg-slate-50/80 border-slate-200/90'
      }`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Core Competencies & Principles
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(about.highlights || []).map((highlight, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
