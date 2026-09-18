import React from 'react';
import { X, Briefcase, Code2, FolderGit2, Trophy, GraduationCap, ExternalLink, Github, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface DetailModalProps {
  section: 'experience' | 'skills' | 'projects' | 'achievements' | 'education' | null;
  onClose: () => void;
  onOpenBookCall: () => void;
  portfolioData?: PortfolioDataType;
}

export const DetailModal: React.FC<DetailModalProps> = ({ section, onClose, onOpenBookCall, portfolioData }) => {
  if (!section) return null;

  const data = portfolioData || PORTFOLIO_DATA;

  const sectionConfig = {
    experience: {
      title: data.sectionTitles?.experience || 'Work Experience',
      subtitle: data.sectionSubtitles?.experience || 'Professional background & technical deliverables',
      icon: Briefcase,
    },
    skills: {
      title: data.sectionTitles?.skills || 'Technical Skills & Stack',
      subtitle: data.sectionSubtitles?.skills || 'Languages, frameworks, databases & developer tooling',
      icon: Code2,
    },
    projects: {
      title: data.sectionTitles?.projects || 'Featured Fullstack Projects',
      subtitle: data.sectionSubtitles?.projects || 'High-performance web applications built from scratch',
      icon: FolderGit2,
    },
    achievements: {
      title: data.sectionTitles?.achievements || 'Achievements & Competitive Programming',
      subtitle: data.sectionSubtitles?.achievements || 'Contest honors, ratings, and problem-solving track record',
      icon: Trophy,
    },
    education: {
      title: data.sectionTitles?.education || 'Education & Academic Training',
      subtitle: data.sectionSubtitles?.education || 'Formal coursework and foundational computer science',
      icon: GraduationCap,
    },
  }[section];

  const Icon = sectionConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]"
        id={`detail-modal-${section}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {data.sectionTitles?.[section] || sectionConfig.title}
              </h2>
              <p className="text-xs text-slate-500">{sectionConfig.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            id="detail-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4 text-slate-700">
          {/* Experience Section */}
          {section === 'experience' && (
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{exp.role}</h3>
                      <div className="text-xs font-semibold text-sky-600">{exp.company} • {exp.type}</div>
                    </div>
                    <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 w-fit">
                      {exp.period}
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Skills Section */}
          {section === 'skills' && (
            <div className="space-y-4">
              {data.skills.map((cat) => (
                <div key={cat.category} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3 text-sky-700">
                    {cat.category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cat.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-slate-800">{skill.name}</span>
                        <span className="text-[10px] font-medium text-sky-600 px-1.5 py-0.5 rounded bg-sky-100/60">
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {section === 'projects' && (
            <div className="grid grid-cols-1 gap-4">
              {data.projects.map((proj) => (
                <div key={proj.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                    </div>
                  </div>
                  {proj.metrics && (
                    <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                      💡 {proj.metrics}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tech.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium border border-sky-100">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-slate-600 hover:text-sky-600 flex items-center gap-1"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements Section */}
          {section === 'achievements' && (
            <div className="space-y-3">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{ach.title}</h3>
                    <span className="text-xs font-semibold text-sky-600">{ach.year}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{ach.organization}</div>
                  <p className="text-xs text-slate-600 mt-1">{ach.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education Section */}
          {section === 'education' && (
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900">{edu.degree}</h3>
                    <span className="text-xs font-semibold text-sky-600">{edu.period}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{edu.institution}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{edu.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenBookCall();
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Discuss a Project with Imran
          </button>
        </div>
      </motion.div>
    </div>
  );
};
