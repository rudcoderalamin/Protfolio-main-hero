import React from 'react';

interface RgbEdgeBeamsProps {
  gridSize?: number;
  isDark?: boolean;
}

/**
 * Responsive 4-edge and outermost 2-lines RGB blinking & traveling laser beam effect.
 * Responsively positions lines on left, right, top, and bottom edges according to device viewport.
 * Features fluid back-and-forth traveling laser pulses with RGB neon blinking glows.
 */
export const RgbEdgeBeams: React.FC<RgbEdgeBeamsProps> = ({
  gridSize = 34,
  isDark = false
}) => {
  // Mobile responsive line offset (scales gracefully on small screens)
  // On mobile (< 640px), 18px prevents overlap with content while preserving the 2-line effect
  // On desktop, aligns neatly with the background grid lines
  const spacing = Math.max(16, Math.min(gridSize, 40));

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
      aria-hidden="true"
      id="responsive-rgb-edge-beams"
    >
      {/* =========================================================
          LEFT SIDE: 2 OUTERMOST VERTICAL RGB LINES (BLINK & TRAVEL)
          ========================================================= */}
      
      {/* Left Line 1: Extreme Left Edge (0px) */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[1.5px] sm:w-[2px]"
        style={{
          background: 'linear-gradient(180deg, #00f0ff 0%, #3b82f6 20%, #a855f7 40%, #ec4899 60%, #f59e0b 80%, #00f0ff 100%)',
          backgroundSize: '100% 300%',
          animation: 'neon-gradient-flow 4s ease infinite, rgb-edge-blink 2.6s ease-in-out infinite'
        }}
      >
        {/* Traveling Laser Beam (sweeps down, then up) */}
        <div
          className="rgb-laser-beam-v -left-[0.75px]"
          style={{
            animation: 'rgb-laser-travel-down-up 4.8s cubic-bezier(0.45, 0, 0.55, 1) infinite'
          }}
        />
      </div>

      {/* Left Line 2: Second Outermost Grid Line (Responsive spacing) */}
      <div
        className="absolute top-0 bottom-0 w-[1px] sm:w-[1.5px] opacity-75 hidden xs:block"
        style={{
          left: `clamp(14px, 2.5vw, ${spacing}px)`,
          background: 'linear-gradient(180deg, #ec4899 0%, #f59e0b 25%, #10b981 50%, #00f0ff 75%, #ec4899 100%)',
          backgroundSize: '100% 300%',
          animation: 'neon-gradient-flow 5s ease infinite, rgb-edge-blink 3.2s ease-in-out infinite 0.5s'
        }}
      >
        {/* Counter-traveling Laser Beam (sweeps up, then down) */}
        <div
          className="rgb-laser-beam-v -left-[1px]"
          style={{
            animation: 'rgb-laser-travel-up-down 5.6s cubic-bezier(0.45, 0, 0.55, 1) infinite 0.8s'
          }}
        />
      </div>

      {/* =========================================================
          RIGHT SIDE: 2 OUTERMOST VERTICAL RGB LINES (BLINK & TRAVEL)
          ========================================================= */}

      {/* Right Line 1: Extreme Right Edge (0px) */}
      <div
        className="absolute top-0 bottom-0 right-0 w-[1.5px] sm:w-[2px]"
        style={{
          background: 'linear-gradient(180deg, #ec4899 0%, #a855f7 20%, #3b82f6 40%, #00f0ff 60%, #10b981 80%, #ec4899 100%)',
          backgroundSize: '100% 300%',
          animation: 'neon-gradient-flow 4.2s ease infinite, rgb-edge-blink 2.8s ease-in-out infinite 0.3s'
        }}
      >
        {/* Traveling Laser Beam (sweeps up, then down) */}
        <div
          className="rgb-laser-beam-v -left-[0.75px]"
          style={{
            animation: 'rgb-laser-travel-up-down 5.2s cubic-bezier(0.45, 0, 0.55, 1) infinite'
          }}
        />
      </div>

      {/* Right Line 2: Second Outermost Grid Line (Responsive spacing) */}
      <div
        className="absolute top-0 bottom-0 w-[1px] sm:w-[1.5px] opacity-75 hidden xs:block"
        style={{
          right: `clamp(14px, 2.5vw, ${spacing}px)`,
          background: 'linear-gradient(180deg, #00f0ff 0%, #10b981 25%, #f59e0b 50%, #ec4899 75%, #00f0ff 100%)',
          backgroundSize: '100% 300%',
          animation: 'neon-gradient-flow 4.8s ease infinite, rgb-edge-blink 3s ease-in-out infinite 0.9s'
        }}
      >
        {/* Traveling Laser Beam (sweeps down, then up) */}
        <div
          className="rgb-laser-beam-v -left-[1px]"
          style={{
            animation: 'rgb-laser-travel-down-up 6s cubic-bezier(0.45, 0, 0.55, 1) infinite 0.4s'
          }}
        />
      </div>

      {/* =========================================================
          TOP & BOTTOM: OUTERMOST HORIZONTAL RGB LINES (BLINK & TRAVEL)
          ========================================================= */}

      {/* Top Edge Line 1: (0px) */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] sm:h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #00f0ff 0%, #3b82f6 20%, #a855f7 40%, #ec4899 60%, #f59e0b 80%, #00f0ff 100%)',
          backgroundSize: '300% 100%',
          animation: 'neon-gradient-flow 4.5s ease infinite, rgb-edge-blink 3s ease-in-out infinite'
        }}
      >
        {/* Traveling Laser Beam (sweeps left to right, then back) */}
        <div
          className="rgb-laser-beam-h -top-[0.75px]"
          style={{
            animation: 'rgb-laser-travel-left-right 5s cubic-bezier(0.45, 0, 0.55, 1) infinite 0.2s'
          }}
        />
      </div>

      {/* Bottom Edge Line 1: (0px) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1.5px] sm:h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 25%, #a855f7 50%, #00f0ff 75%, #f59e0b 100%)',
          backgroundSize: '300% 100%',
          animation: 'neon-gradient-flow 4.8s ease infinite, rgb-edge-blink 2.7s ease-in-out infinite 0.6s'
        }}
      >
        {/* Traveling Laser Beam (sweeps right to left, then back) */}
        <div
          className="rgb-laser-beam-h -top-[0.75px]"
          style={{
            animation: 'rgb-laser-travel-right-left 5.4s cubic-bezier(0.45, 0, 0.55, 1) infinite 0.7s'
          }}
        />
      </div>

      {/* Corner Ambient Glow Nodes */}
      <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-cyan-400/70 blur-[3px] animate-pulse" />
      <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-pink-500/70 blur-[3px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-purple-500/70 blur-[3px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-400/70 blur-[3px] animate-pulse" />
    </div>
  );
};
