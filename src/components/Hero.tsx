import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitHubIcon, 
  LinkedInIcon, 
  FacebookIcon, 
  CodeforcesIcon, 
  CodeChefIcon, 
  LeetCodeIcon,
  ContestChartIcon
} from './TechIcons';
import { Download, Mail, Sparkles, RotateCw } from 'lucide-react';
import { PORTFOLIO_DATA, ProfilePhoto } from '../data/portfolioData';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface HeroProps {
  onOpenResume: () => void;
  onOpenContact: () => void;
  onSelectSection: (section: 'home' | 'experience' | 'skills' | 'projects' | 'achievements' | 'education') => void;
  activePhoto: ProfilePhoto;
  photosCount: number;
  currentPhotoIndex: number;
  onNextPhoto: () => void;
  portfolioData?: PortfolioDataType;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenResume,
  onOpenContact,
  onSelectSection,
  activePhoto,
  photosCount,
  currentPhotoIndex,
  onNextPhoto,
  portfolioData,
}) => {
  const data = portfolioData || PORTFOLIO_DATA;
  
  // Typewriter effect state
  const titles = data.titles && data.titles.length > 0 ? data.titles : PORTFOLIO_DATA.titles;
  const [titleIndex, setTitleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = titles[titleIndex % titles.length];

      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(75);

        if (currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(40);

        if (currentText === '') {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % titles.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, titleIndex, titles, typingSpeed]);

  const heroStats = data.heroStats || PORTFOLIO_DATA.heroStats;
  const heroButtons = data.heroButtons || PORTFOLIO_DATA.heroButtons;

  return (
    <section 
      className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16 flex flex-col items-center text-center"
      id="hero-section-container"
    >
      {/* Profile Photo Stage with smooth 5-second rotation & Manual Reload Button */}
      <div className="relative mb-6">
        {/* Decorative soft glowing blur ring */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-sky-300 via-sky-100 to-sky-200 opacity-60 blur-md animate-pulse" />

        {/* Circular Avatar Frame */}
        <div 
          className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full p-1.5 bg-white shadow-xl shadow-sky-900/5 ring-1 ring-slate-200/80 overflow-visible"
          id="hero-avatar-frame"
        >
          <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={activePhoto?.id || activePhoto?.url}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                src={activePhoto?.url}
                alt={activePhoto?.caption || data.name}
                className="w-full h-full object-cover object-top select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/imran-hasan.jpg";
                }}
              />
            </AnimatePresence>
          </div>

          {/* Experience Pill Badge pinned at the bottom */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20"
          >
            <div
              onClick={() => onSelectSection('experience')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-sky-400 text-sky-600 font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg hover:border-sky-500 hover:scale-105 cursor-pointer transition-all duration-150 whitespace-nowrap"
              id="experience-pill-badge"
            >
              <span>{data.experienceYears || '1+ Year Exp.'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Auto-Rotation & Quick Reload Badge (No edit/upload buttons on user site) */}
      <div className="mb-4 flex items-center justify-center">
        <button
          onClick={onNextPhoto}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[11px] font-medium text-sky-700 shadow-2xs transition-all duration-150 cursor-pointer active:scale-95 group"
          title="Click to cycle next photo manually. Automatically changes every 5 seconds & on web reload."
          id="hero-reload-photo-indicator"
        >
          <RotateCw className="w-3 h-3 text-sky-500 group-hover:rotate-180 transition-transform duration-500" />
          <span>
            Photo {currentPhotoIndex + 1}/{photosCount}
          </span>
          <span className="text-[10px] text-sky-600/90 bg-white px-2 py-0.5 rounded-full border border-sky-200 font-medium">
            Auto-rotates 5s
          </span>
        </button>
      </div>

      {/* Main Name Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2"
        id="hero-name-heading"
      >
        {data.greetingPrefix || "Hi, I'm"} {data.name} <span className="inline-block animate-wave origin-[70%_70%]">{data.greetingEmoji || "👋"}</span>
      </motion.h1>

      {/* Animated Typing Subtitle */}
      <div className="h-8 sm:h-10 flex items-center justify-center mb-4">
        <span
          className="text-sky-600 font-bold text-xl sm:text-2xl md:text-3xl tracking-tight inline-flex items-center"
          id="hero-typewriter-title"
        >
          {currentText}
          <span className="inline-block w-0.5 h-6 sm:h-7 bg-sky-600 ml-1 animate-pulse" />
        </span>
      </div>

      {/* Bio Description */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-6 font-normal px-2"
        id="hero-bio-paragraph"
      >
        {data.bio}
      </motion.p>

      {/* Social Links Row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-center gap-2 sm:gap-3 mb-8"
        id="hero-social-links-row"
      >
        {/* Facebook */}
        {data.socials?.facebook && (
          <a
            href={data.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="Facebook Profile"
            id="social-btn-facebook"
          >
            <FacebookIcon className="w-4 h-4" />
          </a>
        )}

        {/* LinkedIn */}
        {data.socials?.linkedin && (
          <a
            href={data.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="LinkedIn Profile"
            id="social-btn-linkedin"
          >
            <LinkedInIcon className="w-4 h-4" />
          </a>
        )}

        {/* GitHub */}
        {data.socials?.github && (
          <a
            href={data.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="GitHub Profile"
            id="social-btn-github"
          >
            <GitHubIcon className="w-4 h-4" />
          </a>
        )}

        {/* Codeforces */}
        {data.socials?.codeforces && (
          <a
            href={data.socials.codeforces}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="Codeforces Profile"
            title="Codeforces"
            id="social-btn-codeforces"
          >
            <ContestChartIcon className="w-4 h-4" />
          </a>
        )}

        {/* CodeChef */}
        {data.socials?.codechef && (
          <a
            href={data.socials.codechef}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="CodeChef Profile"
            title="CodeChef"
            id="social-btn-codechef"
          >
            <CodeChefIcon className="w-4 h-4" />
          </a>
        )}

        {/* LeetCode */}
        {data.socials?.leetcode && (
          <a
            href={data.socials.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
            aria-label="LeetCode Profile"
            title="LeetCode"
            id="social-btn-leetcode"
          >
            <LeetCodeIcon className="w-4 h-4" />
          </a>
        )}
      </motion.div>

      {/* Primary Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-4"
        id="hero-action-buttons-group"
      >
        {/* Resume Button */}
        <button
          onClick={onOpenResume}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium text-sm sm:text-base shadow-sm shadow-sky-600/25 transition-all duration-150 hover:shadow hover:-translate-y-0.5 cursor-pointer"
          id="hero-resume-btn"
        >
          <span>{heroButtons.resumeText || 'Resume'}</span>
          <Download className="w-4 h-4" />
        </button>

        {/* Contact Me Button */}
        <button
          onClick={onOpenContact}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium text-sm sm:text-base shadow-sm shadow-sky-600/25 transition-all duration-150 hover:shadow hover:-translate-y-0.5 cursor-pointer"
          id="hero-contact-btn"
        >
          <Mail className="w-4 h-4" />
          <span>{heroButtons.contactText || 'Contact Me'}</span>
        </button>
      </motion.div>

      {/* Subtle quick stat pills */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500">
        <div
          onClick={() => onSelectSection('achievements')}
          className="flex items-center gap-1.5 cursor-pointer hover:text-sky-600 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-slate-800">{heroStats.stat1Value}</span> {heroStats.stat1Label}
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div
          onClick={() => onSelectSection('projects')}
          className="flex items-center gap-1.5 cursor-pointer hover:text-sky-600 transition-colors"
        >
          <span className="font-semibold text-slate-800">{heroStats.stat2Value}</span> {heroStats.stat2Label}
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div
          onClick={() => onSelectSection('achievements')}
          className="flex items-center gap-1.5 cursor-pointer hover:text-sky-600 transition-colors"
        >
          <span className="font-semibold text-slate-800">{heroStats.stat3Value}</span> {heroStats.stat3Label}
        </div>
      </div>
    </section>
  );
};
