import React, { useState } from 'react';
import { Calendar, Menu, X, Sparkles } from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface NavbarProps {
  onOpenBookCall: () => void;
  onSelectSection: (section: 'home' | 'experience' | 'skills' | 'projects' | 'achievements' | 'education') => void;
  activeSection: string;
  portfolioData?: PortfolioDataType;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBookCall,
  onSelectSection,
  activeSection,
  portfolioData
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = portfolioData?.navbar?.brandText || portfolioData?.name || 'Al Amin Islam';
  const brandInitials = portfolioData?.brandInitials || 'AI';
  const bookCallText = portfolioData?.navbar?.bookCallBtnText || portfolioData?.heroButtons?.bookCallText || 'Book a Call';

  const navItems: { id: 'home' | 'experience' | 'skills' | 'projects' | 'achievements' | 'education'; label: string }[] = [
    { id: 'home', label: portfolioData?.navbar?.navHome || 'Home' },
    { id: 'experience', label: portfolioData?.navbar?.navExperience || 'Experience' },
    { id: 'skills', label: portfolioData?.navbar?.navSkills || 'Skills' },
    { id: 'projects', label: portfolioData?.navbar?.navProjects || 'Projects' },
    { id: 'achievements', label: portfolioData?.navbar?.navAchievements || 'Achievements' },
    { id: 'education', label: portfolioData?.navbar?.navEducation || 'Education' },
  ];

  return (
    <header className="w-full sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Monogram / Name with Live Rotating Neon Light Effects */}
        <button
          onClick={() => onSelectSection('home')}
          className="flex items-center gap-3 group focus:outline-none cursor-pointer select-none"
          id="nav-brand-logo-btn"
          aria-label={`${brandName} Home`}
        >
          {/* Rotating Multi-Color Neon Border Logo Badge */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 neon-rotating-logo-box group-hover:scale-105 transition-transform duration-300 shrink-0">
            <div className="neon-logo-inner">
              <span className="neon-logo-letters text-sm sm:text-base font-black tracking-wider">
                {brandInitials}
              </span>
            </div>
          </div>

          {/* Glowing Multi-Color Live Neon Name & Title */}
          <div className="text-left block min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="neon-live-text text-sm sm:text-base font-extrabold tracking-tight leading-tight truncate">
                {brandName}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0"
                title="Active & Available"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse shadow-xs shadow-emerald-400" />
              <span className="truncate text-slate-600 font-medium">
                {portfolioData?.title || 'Fullstack Developer'}
              </span>
            </div>
          </div>
        </button>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-sky-600 bg-sky-50 font-semibold'
                    : 'text-slate-700 hover:text-sky-600 hover:bg-slate-50'
                }`}
                id={`nav-link-${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Book a Call CTA */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={onOpenBookCall}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-medium shadow-sm shadow-sky-600/20 transition-all duration-150 hover:shadow hover:-translate-y-0.5 cursor-pointer"
            id="nav-book-call-btn"
          >
            <Calendar className="w-4 h-4 text-white/90" />
            <span>{bookCallText}</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenBookCall}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium cursor-pointer"
            id="mobile-book-call-btn"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
            id="mobile-menu-toggle-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-sky-600 bg-sky-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
