import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface ScrollToTopProps {
  portfolioData?: PortfolioDataType;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ portfolioData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isDark = portfolioData?.theme?.textColorMode === 'light';

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero-section-container');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // Appears when the user has scrolled past the hero section
        const isPastHero = rect.bottom < 120 || window.scrollY > 320;
        setIsVisible(isPastHero);
      } else {
        setIsVisible(window.scrollY > 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.75, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[82px] sm:bottom-[88px] right-6 z-40"
        >
          <motion.button
            onClick={scrollToTop}
            whileTap={{ scale: 0.92 }}
            className="w-11 h-11 sm:w-12 sm:h-12 neon-scroll-top-box group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer select-none"
            aria-label="Scroll to top"
            title="Scroll to top"
            id="scroll-to-top-btn"
          >
            <div
              className={`neon-scroll-top-inner ${
                isDark
                  ? 'bg-slate-950/95 text-cyan-400 group-hover:text-cyan-300'
                  : 'bg-white/95 text-sky-600 group-hover:text-sky-500'
              }`}
            >
              {/* Arrow Up Icon with subtle hover leap */}
              <ArrowUp className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />
            </div>

            {/* Subtle neon pulse beacon ring */}
            <span className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-2 ring-cyan-400/30 animate-pulse" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
