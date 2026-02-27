"use client";

import { useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import CosmicBackground from "@/components/CosmicBackground";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const autoScrollRaf = useRef<number>(0);
  const router = useRouter();

  const prevProgress = useRef(0);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const handleStarClick = useCallback((rnaId: string) => {
    router.push(`/rna/${rnaId}`);
  }, [router]);

  // Scroll-based animations
  const contentScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const contentOpacity = useTransform(scrollYProgress, [0.05, 0.3], [1, 0]);
  const starsOpacity = useTransform(scrollYProgress, [0.65, 0.9], [1, 0]);

  // Background color transition from dark to white (gradual from 35% to 100%)
  const heroBg = useTransform(
    scrollYProgress,
    [0, 0.35, 0.75, 1.0],
    ['#020617', '#020617', '#f0f2f5', '#ffffff']
  );

  // Auto-scroll: detect small scroll and auto-complete the animation
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const direction = latest - prevProgress.current;
    prevProgress.current = latest;

    // Trigger auto-scroll when user scrolls down past 5% but before 15%
    if (direction > 0 && latest > 0.05 && latest < 0.15 && !isAutoScrolling.current) {
      startAutoScroll();
    }
  });

  function startAutoScroll() {
    if (!heroRef.current || isAutoScrolling.current) return;
    isAutoScrolling.current = true;
    const targetY = heroRef.current.offsetTop + heroRef.current.offsetHeight;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 2000; // 3s
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (!isAutoScrolling.current) return; // interrupted
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Gentle ease: slow start, long linear middle, soft landing
      let ease: number;
      if (progress < 0.08) {
        const t = progress / 0.08;
        ease = t * t * 0.08;
      } else if (progress < 0.85) {
        ease = 0.08 + (progress - 0.08) * (0.84 / 0.77);
      } else {
        const t = (progress - 0.85) / 0.15;
        ease = 0.92 + (1 - (1 - t) * (1 - t)) * 0.08;
      }

      // Use behavior: 'instant' to bypass CSS scroll-smooth
      window.scrollTo({ top: startY + distance * ease, behavior: 'instant' as ScrollBehavior });

      if (progress < 1) {
        autoScrollRaf.current = requestAnimationFrame(step);
      } else {
        isAutoScrolling.current = false;
      }
    }

    autoScrollRaf.current = requestAnimationFrame(step);
  }

  // Block native scroll during auto-scroll; only allow upward scroll to interrupt
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (!isAutoScrolling.current) return;
      if (e.deltaY < 0) {
        // User scrolls up — interrupt auto-scroll
        isAutoScrolling.current = false;
        cancelAnimationFrame(autoScrollRaf.current);
      } else {
        // User scrolls down — block native scroll so it doesn't fight our animation
        e.preventDefault();
      }
    }

    function handleTouch(e: TouchEvent) {
      if (!isAutoScrolling.current) return;
      const startY = e.touches[0].clientY;
      function handleTouchMove(me: TouchEvent) {
        if (me.touches[0].clientY > startY + 30) {
          isAutoScrolling.current = false;
          cancelAnimationFrame(autoScrollRaf.current);
        }
        window.removeEventListener('touchmove', handleTouchMove);
      }
      window.addEventListener('touchmove', handleTouchMove, { passive: true, once: true });
    }

    // Must NOT be passive so we can preventDefault on wheel during auto-scroll
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(autoScrollRaf.current);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative h-[250vh]">
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden will-change-transform"
        style={{ backgroundColor: heroBg }}
      >
        {/* Cosmic Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            opacity: starsOpacity,
            willChange: 'opacity',
          }}
        >
          <CosmicBackground onStarClick={handleStarClick} scrollYProgress={scrollYProgress} />
        </motion.div>

        {/* Title content */}
        <motion.div
          className="center-title"
          style={{
            scale: contentScale,
            opacity: contentOpacity,
            willChange: 'transform, opacity',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            EVA
          </motion.h1>
          <motion.div
            className="sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            The first Generative Foundation Model for RNA design
          </motion.div>
          <motion.div
            className="divider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
