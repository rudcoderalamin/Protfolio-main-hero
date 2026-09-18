/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookCallModal } from './components/BookCallModal';
import { ResumeModal } from './components/ResumeModal';
import { ContactModal } from './components/ContactModal';
import { DetailModal } from './components/DetailModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfilePhoto } from './data/portfolioData';
import {
  PortfolioDataType,
  getStoredPortfolioData,
  saveStoredPortfolioData,
  getStoredPhotos,
  saveStoredPhotos,
  fetchPortfolioFromServer,
  savePortfolioToServer,
  subscribeToGlobalPortfolio
} from './utils/portfolioStorage';

const getInitialRoute = (): 'portfolio' | 'admin' => {
  if (typeof window === 'undefined') return 'portfolio';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#/admin' ||
    hash === '#admin' ||
    hash.startsWith('#/admin')
  ) {
    return 'admin';
  }
  return 'portfolio';
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'portfolio' | 'admin'>(getInitialRoute);

  // Modals state
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Dynamic Portfolio Data & Photos state
  const [portfolioData, setPortfolioData] = useState<PortfolioDataType>(getStoredPortfolioData);
  const [photos, setPhotos] = useState<ProfilePhoto[]>(getStoredPhotos);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [selectedSection, setSelectedSection] = useState<
    'home' | 'experience' | 'skills' | 'projects' | 'achievements' | 'education'
  >('home');
  const [detailModalSection, setDetailModalSection] = useState<
    'experience' | 'skills' | 'projects' | 'achievements' | 'education' | null
  >(null);

  // Sync route on popstate and hashchange (browser URL navigation & back/forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Listen for secret shortcut: Ctrl+Shift+A or Alt+A to quickly open /admin if desired
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        navigateToRoute('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 0. Load & Sync global portfolio data & photos via Firestore Real-Time + Server fallback
  // This guarantees ANY change made in admin appears instantly on every device & browser worldwide!
  useEffect(() => {
    // 1. Listen in real-time to Firestore Cloud Database
    const unsubscribeFirestore = subscribeToGlobalPortfolio((updatedData, updatedPhotos) => {
      setPortfolioData(updatedData);
      if (updatedPhotos && updatedPhotos.length > 0) {
        setPhotos(updatedPhotos);
      }
    });

    // 2. Immediate fetch as backup
    const syncData = async () => {
      const result = await fetchPortfolioFromServer();
      if (result && result.data) {
        setPortfolioData(result.data);
        if (result.photos && result.photos.length > 0) {
          setPhotos(result.photos);
        }
      }
    };

    syncData();

    // Re-check periodically every 4 seconds as redundant backup
    const pollInterval = setInterval(syncData, 4000);

    // Re-check when window is focused or becomes visible (e.g. user switches tabs from admin to main site)
    const onFocus = () => syncData();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncData();
      }
    };

    // Listen to local cross-tab events on same browser
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'alamin_portfolio_data' || e.key === 'alamin_portfolio_photos') {
        syncData();
      }
    };

    const onCustomUpdate = () => syncData();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('storage', onStorage);
    window.addEventListener('portfolio_updated', onCustomUpdate);

    return () => {
      unsubscribeFirestore();
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('portfolio_updated', onCustomUpdate);
    };
  }, []);

  // 1. Advance photo index on every web reload ("web reload dilei photo gulo change hote thakbe")
  useEffect(() => {
    try {
      const storedPhotos = getStoredPhotos();
      const savedIndexStr = localStorage.getItem('alamin_active_photo_index');
      let nextIndex = 0;
      if (savedIndexStr !== null && storedPhotos.length > 0) {
        const savedIndex = parseInt(savedIndexStr, 10);
        if (!isNaN(savedIndex)) {
          // Increment index by 1 on every page reload
          nextIndex = (savedIndex + 1) % storedPhotos.length;
        } else {
          nextIndex = Math.floor(Math.random() * storedPhotos.length);
        }
      } else if (storedPhotos.length > 0) {
        nextIndex = Math.floor(Math.random() * storedPhotos.length);
      }
      localStorage.setItem('alamin_active_photo_index', nextIndex.toString());
      setCurrentPhotoIndex(nextIndex);
    } catch (err) {
      console.warn('Could not update active photo index:', err);
      setCurrentPhotoIndex(0);
    }
  }, []);

  // 2. Automatically rotate profile photo every 5 seconds ("পাঁচ সেকেন্ড পর পর যেন অটোমেটিক চেঞ্জ হয়")
  useEffect(() => {
    if (photos.length <= 1) return;
    const intervalSeconds = portfolioData.autoRotateSeconds || 5;
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => {
        const next = (prev + 1) % photos.length;
        try {
          localStorage.setItem('alamin_active_photo_index', next.toString());
        } catch (err) {
          // ignore
        }
        return next;
      });
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [photos.length, portfolioData.autoRotateSeconds]);

  const navigateToRoute = (route: 'portfolio' | 'admin') => {
    if (route === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentRoute('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState({}, '', '/');
      setCurrentRoute('portfolio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdatePortfolioData = (newData: PortfolioDataType) => {
    setPortfolioData(newData);
    saveStoredPortfolioData(newData);
    savePortfolioToServer(newData, photos);
  };

  const handleUpdatePhotos = (newPhotos: ProfilePhoto[]) => {
    setPhotos(newPhotos);
    saveStoredPhotos(newPhotos);
    savePortfolioToServer(portfolioData, newPhotos);
    if (currentPhotoIndex >= newPhotos.length) {
      const safeIdx = Math.max(0, newPhotos.length - 1);
      setCurrentPhotoIndex(safeIdx);
      localStorage.setItem('alamin_active_photo_index', safeIdx.toString());
    }
  };

  // Manual cycle when user clicks the reload button on Hero
  const handleNextPhoto = () => {
    if (photos.length === 0) return;
    setCurrentPhotoIndex((prev) => {
      const next = (prev + 1) % photos.length;
      localStorage.setItem('alamin_active_photo_index', next.toString());
      return next;
    });
  };

  const handleSectionSelect = (
    section: 'home' | 'experience' | 'skills' | 'projects' | 'achievements' | 'education'
  ) => {
    setSelectedSection(section);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setDetailModalSection(section);
    }
  };

  const activePhoto = photos[currentPhotoIndex] || photos[0];

  // If on /admin route, display Admin Dashboard
  if (currentRoute === 'admin') {
    return (
      <AdminDashboard
        portfolioData={portfolioData}
        photos={photos}
        onUpdatePortfolioData={handleUpdatePortfolioData}
        onUpdatePhotos={handleUpdatePhotos}
        onNavigateHome={() => navigateToRoute('portfolio')}
      />
    );
  }

  // Format footer copyright text
  const currentYear = new Date().getFullYear().toString();
  const rawFooterText = portfolioData.footer?.copyrightText || `© {year} ${portfolioData.name}. Built with Next.js & Tailwind CSS.`;
  const formattedFooterText = rawFooterText.replace(/\{year\}/g, currentYear);

  // Public Home Portfolio View
  return (
    <div className="min-h-screen blueprint-grid-bg flex flex-col justify-between selection:bg-sky-100 selection:text-sky-900 relative">
      {/* Top Navigation */}
      <Navbar
        onOpenBookCall={() => setIsBookCallOpen(true)}
        onSelectSection={handleSectionSelect}
        activeSection={selectedSection}
        portfolioData={portfolioData}
      />

      {/* Hero Section (Center of home page) */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <Hero
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onSelectSection={handleSectionSelect}
          activePhoto={activePhoto}
          photosCount={photos.length}
          currentPhotoIndex={currentPhotoIndex}
          onNextPhoto={handleNextPhoto}
          portfolioData={portfolioData}
        />
      </main>

      {/* Clean User Footer (Strictly read-only: No admin buttons, No photo manager links) */}
      <footer className="w-full border-t border-slate-100 bg-white/80 backdrop-blur-xs py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            {formattedFooterText}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleSectionSelect('skills')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              {portfolioData.navbar?.navSkills || 'Skills'}
            </button>
            <span>•</span>
            <button
              onClick={() => handleSectionSelect('projects')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              {portfolioData.navbar?.navProjects || 'Projects'}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsContactOpen(true)}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              {portfolioData.heroButtons?.contactText || 'Contact'}
            </button>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{portfolioData.footer?.statusBadge || 'Available for Hire'}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookCallModal
        isOpen={isBookCallOpen}
        onClose={() => setIsBookCallOpen(false)}
        portfolioData={portfolioData}
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        portfolioData={portfolioData}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        portfolioData={portfolioData}
      />

      <DetailModal
        section={detailModalSection}
        onClose={() => {
          setDetailModalSection(null);
          setSelectedSection('home');
        }}
        onOpenBookCall={() => {
          setDetailModalSection(null);
          setIsBookCallOpen(true);
        }}
        portfolioData={portfolioData}
      />

      {/* WhatsApp Floating Chat Widget */}
      <WhatsAppWidget portfolioData={portfolioData} />
    </div>
  );
}
