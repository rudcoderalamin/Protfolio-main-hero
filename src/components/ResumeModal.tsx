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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const resumeSummary = `${data.name.toUpperCase()} - ${data.title}
Email: ${data.email} | Location: ${data.location}
GitHub: ${data.socials?.github || ''}

SUMMARY:
${data.bio}

COMPETITIVE PROGRAMMING:
- 620+ Algorithmic Problems Solved
- CodeChef: 2 Star (1406 Max Rating)
- 2nd Position: DUET IUPC 2025
- ICPC Asia Dhaka Regional Contestant
`;
    navigator.clipboard.writeText(resumeSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Generate a downloadable text resume file
    const element = document.createElement("a");
    const file = new Blob([`==================================================
${data.name.toUpperCase()} - ${data.title.toUpperCase()}
==================================================
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
GitHub: ${data.socials?.github || ''}
Portfolio: https://imran-hasan-personal-portfolio.vercel.app

PROFESSIONAL SUMMARY
--------------------------------------------------
${data.bio}

COMPETITIVE PROGRAMMING HIGHLIGHTS
--------------------------------------------------
• 620+ Algorithmic Problems Solved across CodeChef, Codeforces, and LeetCode.
• CodeChef 2-Star rating (Max 1406).
• 2nd Position in DUET IUPC 2025 (Polytechnic Category).
• ICPC Asia Dhaka Regional Contestant (2024 / 2025).

TECHNICAL SKILLS
--------------------------------------------------
• Languages: TypeScript, JavaScript, C++, C, Python, SQL
• Frontend: Next.js, React.js, Tailwind CSS, Redux, HTML5, CSS3
• Backend: Node.js, Express.js, Prisma ORM, RESTful APIs
• Databases: PostgreSQL, MongoDB, MySQL, Firebase
• Tools: Docker, Git, GitHub, Postman, Linux, Vercel

PROJECTS
--------------------------------------------------
1. Life Care Plus
   Tech: Next.js, Express.js, Prisma, PostgreSQL, Tailwind CSS
   Description: Telemedicine & hospital management portal reducing patient wait times by 30%.

2. EventSphere
   Tech: Next.js, Node.js, MongoDB, JWT
   Description: AI-assisted smart event management and booking system.

3. TouristBook
   Tech: React.js, Node.js, Express, MongoDB
   Description: Tourism discovery and spot booking platform.

EDUCATION
--------------------------------------------------
Diploma in Computer Science & Technology
Tangail Polytechnic Institute (TPI) | 2021 - 2025
`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "Imran_Hasan_Resume.txt";
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
            <h2 className="text-base font-bold text-slate-800">Curriculum Vitae — Imran Hasan</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              title="Copy Resume summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium shadow-xs transition-colors"
              id="resume-modal-download-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors ml-1"
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
                <h1 className="text-2xl font-bold text-slate-900">Imran Hasan</h1>
                <p className="text-sky-600 font-semibold text-base">Fullstack Web Developer & Competitive Programmer</p>
              </div>
              <div className="text-xs text-slate-500 space-y-0.5 sm:text-right">
                <div>{PORTFOLIO_DATA.email}</div>
                <div>{PORTFOLIO_DATA.location}</div>
                <div className="text-sky-600 font-medium">github.com/DeveloperImran1</div>
              </div>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {PORTFOLIO_DATA.bio}
            </p>
          </div>

          {/* Competitive Programming & Achievements */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 border-b border-slate-100 pb-1">
              <Award className="w-4 h-4 text-sky-600" />
              <span>Competitive Programming & Honors</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PORTFOLIO_DATA.achievements.map((ach) => (
                <div key={ach.id} className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">{ach.title}</div>
                  <div className="text-[11px] text-sky-700 font-medium">{ach.organization} • {ach.year}</div>
                  <p className="text-xs text-slate-600 mt-1">{ach.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 border-b border-slate-100 pb-1">
              <Code className="w-4 h-4 text-sky-600" />
              <span>Technical Skills</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PORTFOLIO_DATA.skills.map((cat) => (
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

          {/* Featured Projects */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 border-b border-slate-100 pb-1">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span>Featured Fullstack Projects</span>
            </div>
            <div className="space-y-3">
              {PORTFOLIO_DATA.projects.map((proj) => (
                <div key={proj.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                    <div className="flex gap-1.5">
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

          {/* Education */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-2 border-b border-slate-100 pb-1">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Education</span>
            </div>
            {PORTFOLIO_DATA.education.map((edu) => (
              <div key={edu.id} className="text-xs space-y-0.5">
                <div className="font-semibold text-slate-900">{edu.degree}</div>
                <div className="text-sky-700 font-medium">{edu.institution} ({edu.period})</div>
                <div className="text-slate-500">{edu.details}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
