import React, { useState } from 'react';
import { X, Download, Printer, Check, Copy, FileText, Award, Briefcase, GraduationCap, Code } from 'lucide-react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioData?: PortfolioDataType;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, portfolioData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const data = portfolioData || PORTFOLIO_DATA;
  const rm = data.resumeModal || PORTFOLIO_DATA.resumeModal;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const resumeSummary = `${(data.name || 'Al Amin Islam').toUpperCase()} - ${data.title || ''}
Email: ${data.email || ''} | Location: ${data.location || ''}
GitHub: ${data.socials?.github || ''}

SUMMARY:
${data.bio || ''}

ACHIEVEMENTS:
${(data.achievements || []).map(a => `- ${a.title} (${a.organization || ''}, ${a.year || ''}): ${a.description || ''}`).join('\n')}
`;
    navigator.clipboard.writeText(resumeSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`==================================================
${(data.name || 'Al Amin Islam').toUpperCase()} - ${(data.title || '').toUpperCase()}
==================================================
Email: ${data.email || ''}
Phone: ${data.phone || ''}
Location: ${data.location || ''}
GitHub: ${data.socials?.github || ''}

SUMMARY
--------------------------------------------------
${data.bio || ''}

SKILLS
--------------------------------------------------
${(data.skills || []).map(cat => `${cat.category}: ${cat.skills.map(s => s.name).join(', ')}`).join('\n')}

PROJECTS
--------------------------------------------------
${(data.projects || []).map((p, i) => `${i + 1}. ${p.title}\n   Tech: ${p.tech.join(', ')}\n   Description: ${p.description}\n`).join('\n')}

EDUCATION
--------------------------------------------------
${(data.education || []).map(e => `${e.degree} - ${e.institution} (${e.period})`).join('\n')}
`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${(data.name || 'Resume').replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
        id="resume-modal-card"
      >
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-800">
              {rm?.title ? rm.title.replace('{name}', data.name || '') : `Curriculum Vitae — ${data.name || ''}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title={rm?.copySummaryTooltip || 'Copy Resume summary'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (rm?.copiedBtnText || 'Copied') : (rm?.copyBtnText || 'Copy')}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
              id="resume-modal-download-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{rm?.downloadBtnText || 'Download'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors ml-1 cursor-pointer"
              id="resume-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-700 text-sm">
          {/* Header section */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
                <p className="text-sky-600 font-semibold text-base">{data.title}</p>
              </div>
              <div className="text-xs text-slate-500 space-y-0.5 sm:text-right">
                {data.email && <div>{data.email}</div>}
                {data.location && <div>{data.location}</div>}
                {data.socials?.github && (
                  <div className="text-sky-600 font-medium">
                    {data.socials.github.replace('https://', '')}
                  </div>
                )}
              </div>
            </div>
            {data.bio && (
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {data.bio}
              </p>
            )}
          </div>

          {/* Competitive Programming & Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 border-b border-slate-100 pb-1">
                <Award className="w-4 h-4 text-sky-600" />
                <span>{rm?.achievementsHeader || 'Competitive Programming & Honors'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.achievements.map((ach) => (
                  <div key={ach.id} className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">{ach.title}</div>
                    <div className="text-[11px] text-sky-700 font-medium">{ach.organization} • {ach.year}</div>
                    <p className="text-xs text-slate-600 mt-1">{ach.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills */}
          {data.skills && data.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 border-b border-slate-100 pb-1">
                <Code className="w-4 h-4 text-sky-600" />
                <span>{rm?.skillsHeader || 'Technical Skills'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.skills.map((cat) => (
                  <div key={cat.category} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-xs text-slate-800 mb-2 uppercase tracking-wider">{cat.category}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((s) => (
                        <span key={s.name} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          {data.projects && data.projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 border-b border-slate-100 pb-1">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <span>{rm?.projectsHeader || 'Featured Fullstack Projects'}</span>
              </div>
              <div className="space-y-3">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {proj.tech.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-medium border border-sky-200/60">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                    {proj.metrics && (
                      <p className="text-xs text-emerald-700 font-medium mt-1">Impact: {proj.metrics}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-2 border-b border-slate-100 pb-1">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>{rm?.educationHeader || 'Education'}</span>
              </div>
              {data.education.map((edu) => (
                <div key={edu.id} className="text-xs space-y-0.5 mb-2">
                  <div className="font-semibold text-slate-900">{edu.degree}</div>
                  <div className="text-sky-700 font-medium">{edu.institution} ({edu.period})</div>
                  {edu.details && <div className="text-slate-500">{edu.details}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
