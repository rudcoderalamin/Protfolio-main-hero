import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../data/portfolioData';

interface InteractiveBackgroundProps {
  theme?: ThemeConfig;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseX: number;
  baseY: number;
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const interactiveEffect = theme?.interactiveEffect ?? 'water_ripples';
  const isDark = theme?.textColorMode === 'light';

  // Refs for tracking mouse with smooth interpolation (lerp)
  const mousePos = useRef({ x: -500, y: -500, targetX: -500, targetY: -500, active: false });
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastRippleTime = useRef<number>(0);

  // Mouse / Pointer listeners for water drops
  useEffect(() => {
    const spawnRipple = (x: number, y: number, isClick = false) => {
      if (interactiveEffect === 'none') return;

      const rippleColor = isDark
        ? 'rgba(56, 189, 248, '
        : 'rgba(2, 132, 199, ';

      // Primary water droplet ripple
      ripplesRef.current.push({
        x,
        y,
        radius: 2,
        maxRadius: isClick ? (Math.random() * 35 + 75) : (Math.random() * 30 + 55),
        opacity: isClick ? (isDark ? 0.6 : 0.45) : (isDark ? 0.4 : 0.3),
        speed: isClick ? (Math.random() * 1.5 + 2.2) : (Math.random() * 1.0 + 1.6),
        color: rippleColor
      });

      // Echo ripple for clicks / taps
      if (isClick) {
        setTimeout(() => {
          ripplesRef.current.push({
            x,
            y,
            radius: 2,
            maxRadius: Math.random() * 25 + 50,
            opacity: isDark ? 0.45 : 0.35,
            speed: 1.8,
            color: rippleColor
          });
        }, 120);
      }

      // Limit maximum ripples to prevent performance degradation
      if (ripplesRef.current.length > 40) {
        ripplesRef.current.shift();
      }
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;
      mousePos.current.active = true;

      // Spawn water drops on move throttled to 70ms
      if (interactiveEffect === 'water_ripples') {
        const now = performance.now();
        if (now - lastRippleTime.current > 70) {
          lastRippleTime.current = now;
          spawnRipple(e.clientX, e.clientY, false);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      if (interactiveEffect === 'water_ripples') {
        spawnRipple(e.clientX, e.clientY, true);
      }
    };

    const handlePointerLeave = () => {
      mousePos.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [interactiveEffect, isDark]);

  // Canvas animation loop
  useEffect(() => {
    if (interactiveEffect === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    // Initialize particles for optional neon_particles effect
    const initParticles = () => {
      if (interactiveEffect !== 'neon_particles') return;
      const count = Math.min(60, Math.floor((width * height) / 24000));
      const p: Particle[] = [];
      const colors = isDark
        ? ['#00f0ff', '#38bdf8', '#818cf8', '#c084fc', '#f472b6']
        : ['#0284c7', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        p.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      particlesRef.current = p;
    };

    initParticles();
    window.addEventListener('resize', handleResize);

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Lerp mouse position
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.15;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.15;

      // 1. WATER DROPS / RIPPLES EFFECT (Clean, natural water physics)
      if (interactiveEffect === 'water_ripples') {
        const ripples = ripplesRef.current;
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += r.speed;
          r.opacity -= 0.0075;

          if (r.opacity <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }

          // Outer water drop ring
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color}${Math.max(0, r.opacity).toFixed(3)})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Inner caustic echo ring
          if (r.radius > 6) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.68, 0, Math.PI * 2);
            ctx.strokeStyle = `${r.color}${(Math.max(0, r.opacity) * 0.45).toFixed(3)})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }

          // Small center water drop splash point at impact
          if (r.radius < 12) {
            const dropAlpha = (1 - r.radius / 12) * r.opacity;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = `${r.color}${dropAlpha.toFixed(3)})`;
            ctx.fill();
          }
        }
      }

      // 2. NEON PARTICLES EFFECT
      else if (interactiveEffect === 'neon_particles') {
        const pList = particlesRef.current;
        const mx = mousePos.current.x;
        const my = mousePos.current.y;

        for (let i = 0; i < pList.length; i++) {
          const p = pList[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          if (mousePos.current.active) {
            const dx = mx - p.x;
            const dy = my - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 130;
            if (dist < maxDist && dist > 0) {
              const force = (maxDist - dist) / maxDist;
              p.x -= (dx / dist) * force * 5;
              p.y -= (dy / dist) * force * 5;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          for (let j = i + 1; j < pList.length; j++) {
            const p2 = pList[j];
            const dxx = p.x - p2.x;
            const dyy = p.y - p2.y;
            const d = Math.sqrt(dxx * dxx + dyy * dyy);
            if (d < 110) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              const alpha = (1 - d / 110) * (isDark ? 0.25 : 0.18);
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // 3. COSMIC AURORA WAVE EFFECT
      else if (interactiveEffect === 'cosmic_aurora') {
        const mx = mousePos.current.x;
        const my = mousePos.current.y;
        const time = frameCount * 0.02;

        ctx.lineWidth = 2;
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          const baseColor = wave === 0 ? 'rgba(0, 240, 255, ' : wave === 1 ? 'rgba(168, 85, 247, ' : 'rgba(236, 72, 153, ';
          for (let x = 0; x <= width; x += 30) {
            const distToMouse = Math.abs(x - mx);
            const mouseLift = distToMouse < 220 ? (1 - distToMouse / 220) * 40 * Math.sin(time * 2) : 0;
            const y = height * 0.45 + Math.sin(x * 0.005 + time + wave) * 45 + Math.cos(x * 0.008 - time) * 30 + mouseLift;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `${baseColor}${isDark ? '0.22' : '0.14'})`;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [interactiveEffect, isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* HTML5 Physics Canvas for Pure Water Drop Ripples (Zero Cursor Shadow) */}
      {interactiveEffect !== 'none' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      )}
    </div>
  );
};
