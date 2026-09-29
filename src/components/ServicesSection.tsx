import React from 'react';
import { 
  Globe, 
  Layers, 
  Palette, 
  Smartphone, 
  PenTool, 
  ArrowRight, 
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface ServicesSectionProps {
  portfolioData: PortfolioDataType;
  onOpenContact: () => void;
  onOpenBookCall: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  portfolioData, 
  onOpenContact,
  onOpenBookCall 
}) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const services = portfolioData.services || [];

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'fullstack':
        return <Layers className="w-6 h-6 text-sky-400" />;
      case 'web':
        return <Globe className="w-6 h-6 text-cyan-400" />;
      case 'uiux':
        return <Palette className="w-6 h-6 text-purple-400" />;
      case 'graphics':
        return <PenTool className="w-6 h-6 text-amber-400" />;
      case 'android':
        return <Smartphone className="w-6 h-6 text-emerald-400" />;
      default:
        return <Globe className="w-6 h-6 text-sky-400" />;
    }
  };

  const getServiceBadge = (iconType: string) => {
    switch (iconType) {
      case 'fullstack':
        return 'Full-Stack Architecture';
      case 'web':
        return 'Modern Frontend';
      case 'uiux':
        return 'User Experience';
      case 'graphics':
        return 'Brand & Visuals';
      case 'android':
        return 'Mobile Solutions';
      default:
        return 'Specialized Service';
    }
  };

  return (
    <section id="services" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Services Offered</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          High-Impact Engineering & Creative Services
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          From robust full-stack software and fluid web apps to UI/UX prototypes and native Android applications.
        </p>
      </div>

      {/* Services Grid (3 + 2 layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <div
            key={service.id || idx}
            className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group ${
              isDark
                ? 'bg-slate-900/70 border-slate-800/80 hover:border-sky-500/50 shadow-black/40'
                : 'bg-white/80 border-slate-200/80 hover:border-sky-400/60 shadow-slate-200/50'
            }`}
          >
            <div>
              {/* Icon & Category Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-sky-50 border-sky-100'
                }`}>
                  {getServiceIcon(service.icon)}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/20 dark:bg-slate-800 text-slate-400">
                  {getServiceBadge(service.icon)}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {service.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {service.description}
              </p>
            </div>

            {/* Tags & Action Button */}
            <div>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {(service.tags || []).map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={onOpenContact}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-sky-600/10 hover:bg-sky-600 text-sky-500 hover:text-white border border-sky-500/20 hover:border-sky-600"
              >
                <span>Hire For This Service</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Card */}
      <div className={`mt-10 p-6 sm:p-8 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-between gap-6 ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border-sky-900/40'
          : 'bg-gradient-to-r from-sky-50 via-white to-sky-50 border-sky-200/80'
      }`}>
        <div className="text-center sm:text-left">
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Have a custom idea or looking for end-to-end development?
          </h3>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Let&apos;s schedule a discussion or kick off a tailored project with fast delivery.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBookCall}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer hover:scale-105"
          >
            Book a Discussion
          </button>
          <button
            onClick={onOpenContact}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Direct Message
          </button>
        </div>
      </div>
    </section>
  );
};
