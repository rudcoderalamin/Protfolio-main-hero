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
  const cursorLightRef = useRef<HTMLDivElement | null>(null);

  const interactiveEffect = theme?.interactiveEffect ?? 'water_ripples';
  const showCursorRgb = theme?.cursorRgbLight !== false;
  const isDark = theme?.textColorMode === 'light';

  // Refs for tracking mouse with smooth interpolation (lerp)
  const mousePos = useRef({ x: -500, y: -500, targetX: -500, targetY: -500, active: false });
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastRippleTime = useRef<number>(0);

  // Mouse move listener
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;
      mousePos.current.active = true;

      // Spawn water ripple if effect is water_ripples
      if (interactiveEffect === 'water_ripples') {
        const now = performance.now();
        // Throttle ripple spawn to every 65ms
        if (now - lastRippleTime.current > 65) {
          lastRippleTime.current = now;
          const rippleColor = isDark
            ? 'rgba(56, 189, 248, '
            : 'rgba(2, 132, 199, ';
          ripplesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            radius: 2,
            maxRadius: Math.random() * 50 + 65,
            opacity: isDark ? 0.45 : 0.35,
            speed: Math.random() * 1.5 + 2.0,
            color: rippleColor
          });

          // Limit maximum ripples to prevent memory creep
          if (ripplesRef.current.length > 35) {
            ripplesRef.current.shift();
          }
        }
      }
    };

    const handlePointerLeave = () => {
      mousePos.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
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

    // Initialize particles for neon_particles effect
    const initParticles = () => {
      if (interactiveEffect !== 'neon_particles') return;
      const count = Math.min(65, Math.floor((width * height) / 22000));
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

      // 1. WATER RIPPLES EFFECT
      if (interactiveEffect === 'water_ripples') {
        const ripples = ripplesRef.current;
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += r.speed;
          r.opacity -= 0.008;

          if (r.opacity <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }

          // Outer wave ring
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color}${Math.max(0, r.opacity).toFixed(3)})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Inner caustic reflection ring
          if (r.radius > 8) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = `${r.color}${(Math.max(0, r.opacity) * 0.5).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
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

          // Push particles away from cursor
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

          // Draw node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Connect nearby nodes
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

  // Smooth RGB Cursor Follower Glow element
  useEffect(() => {
    if (!showCursorRgb && interactiveEffect !== 'cursor_rgb') return;

    let animFrame: number;
    let currX = -500;
    let currY = -500;
    let hue = 0;

    const animateLight = () => {
      currX += (mousePos.current.targetX - currX) * 0.12;
      currY += (mousePos.current.targetY - currY) * 0.12;
      hue = (hue + 1) % 360;

      if (cursorLightRef.current) {
        if (mousePos.current.active) {
          cursorLightRef.current.style.opacity = '1';
          cursorLightRef.current.style.transform = `translate3d(${currX - 160}px, ${currY - 160}px, 0)`;
          cursorLightRef.current.style.filter = `hue-rotate(${hue}deg)`;
        } else {
          cursorLightRef.current.style.opacity = '0';
        }
      }

      animFrame = requestAnimationFrame(animateLight);
    };

    animFrame = requestAnimationFrame(animateLight);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [showCursorRgb, interactiveEffect]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* HTML5 Physics Canvas for Water Ripples & Particles */}
      {interactiveEffect !== 'none' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      )}

      {/* Floating RGB Ambient Cursor Spotlight / Laser Light */}
      {(showCursorRgb || interactiveEffect === 'cursor_rgb') && (
        <div
          ref={cursorLightRef}
          className="absolute top-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300 will-change-transform"
          style={{
            background: isDark
              ? 'radial-gradient(circle closest-side, rgba(0, 240, 255, 0.22) 0%, rgba(168, 85, 247, 0.18) 45%, rgba(236, 72, 153, 0.12) 70%, transparent 100%)'
              : 'radial-gradient(circle closest-side, rgba(2, 132, 199, 0.18) 0%, rgba(147, 51, 234, 0.14) 45%, rgba(219, 39, 119, 0.09) 70%, transparent 100%)',
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        />
      )}
    </div>
  );
};
