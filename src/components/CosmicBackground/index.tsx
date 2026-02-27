'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { MotionValue } from 'framer-motion';
import { useMouse } from '@/hooks/useMouse';
import { initEngine, updateEngine, drawEngine, type HoveredStar } from './engine';

interface Props {
  /** Called when user clicks a hovered RNA star */
  onStarClick?: (rnaId: string) => void;
  /** Scroll progress from parent for star convergence animation */
  scrollYProgress?: MotionValue<number>;
}

export default function CosmicBackground({ onStarClick, scrollYProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMouse();
  const [hovered, setHovered] = useState<HoveredStar | null>(null);
  const hoveredRef = useRef<HoveredStar | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let lastT = 0;
    let scrollPct = 0;
    let frameCount = 0;

    // Listen for scroll progress changes from parent
    const unsubScroll = scrollYProgress?.on('change', (latest) => {
      scrollPct = latest;
    });

    function resize() {
      // Cap DPR at 1.5 for performance balance on high-res screens
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initEngine(W, H);
    }

    function loop(ts: number) {
      const dt = Math.min((ts - lastT) / 1000, 0.05);
      lastT = ts;
      frameCount++;

      // Convert mouse viewport coords to canvas-relative coords
      const rect = canvas!.getBoundingClientRect();
      const mx = mouse.current.x - rect.left;
      const my = mouse.current.y - rect.top;

      const hoveredStar = updateEngine(dt, mx, my, scrollPct);

      // Only update React state every 3 frames and when hover state actually changes
      if (frameCount % 3 === 0) {
        const prevId = hoveredRef.current?.id;
        const newId = hoveredStar?.id;
        if (prevId !== newId) {
          hoveredRef.current = hoveredStar;
          setHovered(hoveredStar);
        }
      }

      drawEngine(ctx!);
      animId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    resize();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      unsubScroll?.();
    };
  }, [scrollYProgress, mouse]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(() => {
    if (hoveredRef.current && onStarClick) {
      onStarClick(hoveredRef.current.id);
    }
  }, [onStarClick]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        id="bg"
        onClick={handleClick}
        className="cosmic-canvas"
        style={{
          cursor: hovered ? 'pointer' : 'default',
        }}
      />
    </div>
  );
}
