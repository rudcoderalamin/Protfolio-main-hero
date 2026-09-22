import React from 'react';
import { ThemeConfig } from '../data/portfolioData';

/**
 * Converts a hex code to an rgba string with given alpha (0 to 1)
 */
export function hexToRgba(hex: string, alpha: number = 0.18): string {
  if (!hex) return `rgba(56, 189, 248, ${alpha})`;
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return hex;
}

/**
 * Normalizes any color input (hex, rgb, rgba) and applies the target opacity percentage (0-100)
 */
export function formatLineColor(color: string | undefined, opacityPercent: number = 18, isDark: boolean = false): string {
  if (!color || color === 'transparent') {
    return isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.12)';
  }
  const trimmed = color.trim();
  const alpha = Math.max(0.01, Math.min(1, opacityPercent / 100));

  // If user entered a Hex color (#38bdf8)
  if (trimmed.startsWith('#')) {
    return hexToRgba(trimmed, alpha);
  }

  // If user entered rgba(r, g, b, a)
  if (trimmed.startsWith('rgba(')) {
    // If opacityPercent is explicitly customized and not 100, we can re-scale the alpha
    const parts = trimmed.slice(5, -1).split(',').map(s => s.trim());
    if (parts.length >= 4) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
    return trimmed;
  }

  // If user entered rgb(r, g, b)
  if (trimmed.startsWith('rgb(')) {
    const parts = trimmed.slice(4, -1).split(',').map(s => s.trim());
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }

  return trimmed;
}

/**
 * Extracts a valid 6-char hex code suitable for <input type="color">
 */
export function colorToHex(color: string | undefined, fallback: string = '#38bdf8'): string {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    if (trimmed.length === 7) return trimmed;
    if (trimmed.length === 4) {
      return '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
    }
    if (trimmed.length > 7) return trimmed.substring(0, 7);
  }
  if (trimmed.startsWith('rgba(') || trimmed.startsWith('rgb(')) {
    const nums = trimmed.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const r = parseInt(nums[0], 10).toString(16).padStart(2, '0');
      const g = parseInt(nums[1], 10).toString(16).padStart(2, '0');
      const b = parseInt(nums[2], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return fallback;
}

export interface ThemePresetItem {
  id: string;
  name: string;
  category: 'dots' | 'grid' | 'creative' | 'minimal';
  desc: string;
  bgColor: string;
  pattern: string;
  gridColorHex: string;
  gridColorRgba: string;
  opacity: number;
  gridSize: number;
  textColorMode: 'dark' | 'light';
  accent: string;
}

export const THEME_PRESETS: ThemePresetItem[] = [
  {
    id: 'dots',
    name: 'Matrix Dot Grid',
    category: 'dots',
    desc: 'Clean light canvas with crisp geometric tech dots',
    bgColor: '#ffffff',
    pattern: 'dots',
    gridColorHex: '#0284c7',
    gridColorRgba: 'rgba(2, 132, 199, 0.28)',
    opacity: 28,
    gridSize: 28,
    textColorMode: 'dark',
    accent: '#0284c7'
  },
  {
    id: 'dots-dark',
    name: 'Cyber Stardust',
    category: 'dots',
    desc: 'Deep midnight space with glowing cyan matrix dots',
    bgColor: '#090d16',
    pattern: 'dots',
    gridColorHex: '#00f0ff',
    gridColorRgba: 'rgba(0, 240, 255, 0.35)',
    opacity: 35,
    gridSize: 28,
    textColorMode: 'light',
    accent: '#00f0ff'
  },
  {
    id: 'dots-dense',
    name: 'Dense Tech Micropoints',
    category: 'dots',
    desc: 'Sophisticated engineering micro-dot constellation',
    bgColor: '#ffffff',
    pattern: 'dots-dense',
    gridColorHex: '#64748b',
    gridColorRgba: 'rgba(100, 116, 139, 0.22)',
    opacity: 22,
    gridSize: 20,
    textColorMode: 'dark',
    accent: '#0ea5e9'
  },
  {
    id: 'blueprint',
    name: 'Classic Blueprint',
    category: 'grid',
    desc: 'White canvas with sky blueprint architectural grid',
    bgColor: '#ffffff',
    pattern: 'blueprint',
    gridColorHex: '#38bdf8',
    gridColorRgba: 'rgba(56, 189, 248, 0.18)',
    opacity: 18,
    gridSize: 34,
    textColorMode: 'dark',
    accent: '#0284c7'
  },
  {
    id: 'isometric',
    name: 'Diamond Isometric',
    category: 'grid',
    desc: 'Modern 45° angled architectural diamond mesh',
    bgColor: '#ffffff',
    pattern: 'isometric',
    gridColorHex: '#38bdf8',
    gridColorRgba: 'rgba(56, 189, 248, 0.16)',
    opacity: 16,
    gridSize: 38,
    textColorMode: 'dark',
    accent: '#0284c7'
  },
  {
    id: 'crosshairs',
    name: 'Drafting Crosshairs',
    category: 'grid',
    desc: 'Technical coordinate cross marks and grid intersection lines',
    bgColor: '#ffffff',
    pattern: 'crosshairs',
    gridColorHex: '#0284c7',
    gridColorRgba: 'rgba(2, 132, 199, 0.2)',
    opacity: 20,
    gridSize: 36,
    textColorMode: 'dark',
    accent: '#0284c7'
  },
  {
    id: 'cyber',
    name: 'Cyber Midnight',
    category: 'grid',
    desc: 'Dark navy with vivid cyan digital matrix grid',
    bgColor: '#0b1120',
    pattern: 'cyber',
    gridColorHex: '#38bdf8',
    gridColorRgba: 'rgba(56, 189, 248, 0.22)',
    opacity: 22,
    gridSize: 34,
    textColorMode: 'light',
    accent: '#38bdf8'
  },
  {
    id: 'terminal',
    name: 'Hacker Terminal',
    category: 'creative',
    desc: 'Deep black with phosphor emerald matrix grid',
    bgColor: '#050a0e',
    pattern: 'blueprint',
    gridColorHex: '#10b981',
    gridColorRgba: 'rgba(16, 185, 129, 0.22)',
    opacity: 22,
    gridSize: 32,
    textColorMode: 'light',
    accent: '#10b981'
  },
  {
    id: 'hexagon',
    name: 'Hexagon Honeycomb',
    category: 'creative',
    desc: 'Futuristic geometric cyber honeycomb lattice',
    bgColor: '#090d16',
    pattern: 'hexagon',
    gridColorHex: '#00f0ff',
    gridColorRgba: 'rgba(0, 240, 255, 0.2)',
    opacity: 20,
    gridSize: 36,
    textColorMode: 'light',
    accent: '#00f0ff'
  },
  {
    id: 'circuit',
    name: 'Circuit Board Tech',
    category: 'creative',
    desc: 'High-tech electronics PCB traces and circuit lines',
    bgColor: '#080d1a',
    pattern: 'circuit',
    gridColorHex: '#38bdf8',
    gridColorRgba: 'rgba(56, 189, 248, 0.22)',
    opacity: 22,
    gridSize: 40,
    textColorMode: 'light',
    accent: '#38bdf8'
  },
  {
    id: 'aurora',
    name: 'Cosmic Aurora Glow',
    category: 'creative',
    desc: 'Dark cosmos with vibrant multi-stop glowing nebula',
    bgColor: '#080c14',
    pattern: 'aurora',
    gridColorHex: '#a855f7',
    gridColorRgba: 'rgba(168, 85, 247, 0.28)',
    opacity: 28,
    gridSize: 34,
    textColorMode: 'light',
    accent: '#c084fc'
  },
  {
    id: 'sunset',
    name: 'Tokyo Neon Sunset',
    category: 'creative',
    desc: 'Velvet dark plum with warm electric amber and rose graph',
    bgColor: '#0d0b18',
    pattern: 'blueprint',
    gridColorHex: '#f43f5e',
    gridColorRgba: 'rgba(244, 63, 94, 0.25)',
    opacity: 25,
    gridSize: 32,
    textColorMode: 'light',
    accent: '#f43f5e'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Stealth',
    category: 'minimal',
    desc: 'Minimalist deep carbon black with refined subtle lines',
    bgColor: '#090d16',
    pattern: 'blueprint',
    gridColorHex: '#06b6d4',
    gridColorRgba: 'rgba(6, 182, 212, 0.12)',
    opacity: 12,
    gridSize: 34,
    textColorMode: 'light',
    accent: '#06b6d4'
  },
  {
    id: 'minimal',
    name: 'Crisp Minimal Luxe',
    category: 'minimal',
    desc: 'Pure crisp solid background with zero grid lines',
    bgColor: '#ffffff',
    pattern: 'minimal',
    gridColorHex: '#cbd5e1',
    gridColorRgba: 'transparent',
    opacity: 0,
    gridSize: 34,
    textColorMode: 'dark',
    accent: '#0284c7'
  }
];

/**
 * Computes live background CSS properties for any ThemeConfig
 */
export function generateBackgroundStyles(theme?: Partial<ThemeConfig>): React.CSSProperties {
  const isDark = theme?.textColorMode === 'light';
  const bgColor = theme?.backgroundColor || (isDark ? '#090d16' : '#ffffff');
  const patternType = theme?.patternType || theme?.preset || 'blueprint';
  const opacity = typeof theme?.patternOpacity === 'number' ? theme.patternOpacity : 18;
  const rawGridColor = theme?.gridColor || (isDark ? '#38bdf8' : '#0284c7');
  const effectiveLineColor = formatLineColor(rawGridColor, opacity, isDark);
  const gridSize = theme?.gridSize || 34;

  const baseStyles: React.CSSProperties = {
    backgroundColor: bgColor,
    minHeight: '100vh',
  };

  // If custom background photo is provided
  if (theme?.backgroundImageUrl && theme.backgroundImageUrl.trim().length > 0) {
    const overlayAlpha = ((theme.backgroundOverlayOpacity ?? 50) / 100);
    const overlayColor = isDark 
      ? `rgba(9, 13, 22, ${overlayAlpha})` 
      : `rgba(255, 255, 255, ${overlayAlpha})`;
    
    baseStyles.backgroundImage = `linear-gradient(${overlayColor}, ${overlayColor}), url('${theme.backgroundImageUrl.trim()}')`;
    baseStyles.backgroundSize = 'cover';
    baseStyles.backgroundPosition = 'center';
    baseStyles.backgroundAttachment = 'fixed';
    return baseStyles;
  }

  // 1. Minimal: No pattern
  if (patternType === 'minimal') {
    return baseStyles;
  }

  // 2. Dots Matrix
  if (patternType === 'dots') {
    return {
      ...baseStyles,
      backgroundImage: `radial-gradient(circle, ${effectiveLineColor} 1.8px, transparent 1.8px)`,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  }

  // 3. Dense Tech Dots (Micropoints)
  if (patternType === 'dots-dense') {
    return {
      ...baseStyles,
      backgroundImage: `
        radial-gradient(circle, ${effectiveLineColor} 1.2px, transparent 1.2px),
        radial-gradient(circle, ${effectiveLineColor} 1.2px, transparent 1.2px)
      `,
      backgroundPosition: `0 0, ${gridSize / 2}px ${gridSize / 2}px`,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  }

  // 4. Diamond Isometric Grid (45-degree angle mesh)
  if (patternType === 'isometric' || patternType === 'diagonal') {
    return {
      ...baseStyles,
      backgroundImage: `
        linear-gradient(45deg, ${effectiveLineColor} 1px, transparent 1px),
        linear-gradient(-45deg, ${effectiveLineColor} 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  }

  // 5. Crosshairs / Plus Drafting Graph
  if (patternType === 'crosshairs') {
    return {
      ...baseStyles,
      backgroundImage: `
        radial-gradient(circle, ${effectiveLineColor} 2px, transparent 2px),
        linear-gradient(to right, ${effectiveLineColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${effectiveLineColor} 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  }

  // 6. Hexagon Honeycomb Mesh
  if (patternType === 'hexagon') {
    // Encoded SVG hexagon pattern with dynamic stroke color
    const encodedColor = encodeURIComponent(effectiveLineColor);
    const svgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='48.5' viewBox='0 0 28 48.5'%3E%3Cpath d='M14 0 L28 8.1 L28 24.2 L14 32.3 L0 24.2 L0 8.1 Z M14 48.5 L28 40.4 L28 24.2 L14 16.2 L0 24.2 L0 40.4 Z' fill='none' stroke='${encodedColor}' stroke-width='1'/%3E%3C/svg%3E")`;
    return {
      ...baseStyles,
      backgroundImage: svgPattern,
      backgroundSize: `${gridSize}px ${gridSize * 1.732}px`,
    };
  }

  // 7. Circuit Board PCB Pattern
  if (patternType === 'circuit') {
    const encodedColor = encodeURIComponent(effectiveLineColor);
    const svgCircuit = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='${encodedColor}' stroke-width='1'%3E%3Cpath d='M10 10 h20 v20 h20'/%3E%3Ccircle cx='10' cy='10' r='2.5' fill='${encodedColor}'/%3E%3Ccircle cx='50' cy='30' r='2.5' fill='${encodedColor}'/%3E%3Cpath d='M50 50 v-15 h-20'/%3E%3Ccircle cx='50' cy='50' r='2.5' fill='${encodedColor}'/%3E%3Ccircle cx='30' cy='35' r='2.5' fill='${encodedColor}'/%3E%3C/g%3E%3C/svg%3E")`;
    return {
      ...baseStyles,
      backgroundImage: svgCircuit,
      backgroundSize: `${gridSize * 1.6}px ${gridSize * 1.6}px`,
    };
  }

  // 8. Cosmic Aurora Glow
  if (patternType === 'aurora') {
    return {
      ...baseStyles,
      backgroundImage: isDark
        ? `
          radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.28) 0px, transparent 55%),
          radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.28) 0px, transparent 55%),
          radial-gradient(at 50% 100%, rgba(236, 72, 153, 0.22) 0px, transparent 55%),
          linear-gradient(to right, ${effectiveLineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${effectiveLineColor} 1px, transparent 1px)
        `
        : `
          radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.2) 0px, transparent 55%),
          radial-gradient(at 100% 0%, rgba(192, 132, 252, 0.2) 0px, transparent 55%),
          radial-gradient(at 50% 100%, rgba(244, 114, 182, 0.16) 0px, transparent 55%),
          linear-gradient(to right, ${effectiveLineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${effectiveLineColor} 1px, transparent 1px)
        `,
      backgroundSize: `100% 100%, 100% 100%, 100% 100%, ${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px`,
    };
  }

  // 9. Spotlight
  if (patternType === 'spotlight') {
    return {
      ...baseStyles,
      backgroundImage: `
        radial-gradient(circle at 50% 30%, transparent 20%, ${bgColor} 95%),
        linear-gradient(to right, ${effectiveLineColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${effectiveLineColor} 1px, transparent 1px)
      `,
      backgroundSize: `100% 100%, ${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px`,
    };
  }

  // 10. Cyber Matrix / Blueprint Grid (Default)
  return {
    ...baseStyles,
    backgroundImage: `
      linear-gradient(to right, ${effectiveLineColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${effectiveLineColor} 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  };
}
