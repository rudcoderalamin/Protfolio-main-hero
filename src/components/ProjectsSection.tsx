import React, { useState } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  Github, 
  Sparkles, 
  Image as ImageIcon,
  Smartphone,
  Globe,
  Layers,
  Maximize2,
  X
} from 'lucide-react';
import { PortfolioDataType } from '../utils/portfolioStorage';
import { Project } from '../data/portfolioData';

interface ProjectsSectionProps {
  portfolioData: PortfolioDataType;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ portfolioData }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  const projects = portfolioData.projects || [];
  const [activeFilter, setActiveFilter] = useState<'all' | 'fullstack' | 'web' | 'android'>('all');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const filteredProjects = projects.filter((proj) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'fullstack') {
      return (
        proj.category === 'fullstack' ||
        proj.tech?.some((t) => ['node', 'express', 'postgresql', 'mongodb', 'prisma'].some((k) => t.toLowerCase().includes(k)))
      );
    }
    if (activeFilter === 'web') {
      return (
        proj.category === 'web' ||
        proj.tech?.some((t) => ['react', 'next', 'tailwind', 'frontend'].some((k) => t.toLowerCase().includes(k)))
      );
    }
    if (activeFilter === 'android') {
      return (
        proj.category === 'android' ||
        proj.title.toLowerCase().includes('mobile') ||
        proj.title.toLowerCase().includes('android') ||
        proj.tech?.some((t) => ['android', 'react native', 'mobile'].some((k) => t.toLowerCase().includes(k)))
      );
    }
    return true;
  });

  return (
    <section id="projects" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Featured Portfolio Projects</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {portfolioData.sectionTitles?.projects || 'Production Web & Mobile Software'}
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {portfolioData.sectionSubtitles?.projects || 'High-performance web applications and mobile software built with modern engineering stacks.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {[
          { id: 'all', label: 'All Projects', icon: Layers },
          { id: 'fullstack', label: 'Full-Stack Web', icon: Globe },
          { id: 'web', label: 'Frontend Apps', icon: Sparkles },
          { id: 'android', label: 'Mobile & Android', icon: Smartphone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-105'
                  : isDark
                  ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  : 'bg-white/80 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project: Project, idx: number) => {
          const projectImage = project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80';
          return (
            <div
              key={project.id || idx}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 shadow-black/40'
                  : 'bg-white/90 border-slate-200/90 hover:border-sky-400/60 shadow-slate-200/50'
              }`}
            >
              <div>
                {/* App Picture / Screenshot Stage */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={projectImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Zoom Preview Button */}
                  <button
                    onClick={() => setPreviewImage({ url: projectImage, title: project.title })}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="View Full Screenshot"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 text-sky-400 backdrop-blur-xs border border-sky-500/30">
                      {project.category?.toUpperCase() || 'FULLSTACK'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h3 className={`text-base sm:text-lg font-bold mb-2 group-hover:text-sky-500 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {project.title}
                  </h3>
                  <p className={`text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {project.description}
                  </p>

                  {/* Impact Metric if available */}
                  {project.metrics && (
                    <div className="mb-4 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{project.metrics}</span>
                    </div>
                  )}

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(project.tech || []).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Links (Live Demo & GitHub) */}
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800/10 dark:border-slate-800 flex items-center justify-between gap-3">
                {project.live ? (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Live Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="flex-1 py-2 px-3 rounded-xl bg-slate-800/30 text-slate-500 text-xs font-semibold text-center">
                    Private Demo
                  </span>
                )}

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Source Code"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Code</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
              <h4 className="text-sm font-bold text-white truncate">{previewImage.title}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-2 bg-slate-950 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
