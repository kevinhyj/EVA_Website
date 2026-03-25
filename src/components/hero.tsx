"use client";

import { useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import CosmicBackground from "@/components/CosmicBackground";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const autoScrollRaf = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
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

  // Avoid animating full-screen backgroundColor directly; use overlay opacity instead.
  const bgLightOpacity = useTransform(scrollYProgress, [0.35, 0.75, 1.0], [0, 0.9, 1]);

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
    cancelAnimationFrame(autoScrollRaf.current);

    const targetY = heroRef.current.offsetTop + heroRef.current.offsetHeight;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 1200;
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (!isAutoScrolling.current) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      // Use behavior: 'instant' to bypass CSS scroll-smooth
      window.scrollTo({ top: startY + distance * ease, behavior: "instant" as ScrollBehavior });

      if (progress < 1) {
        autoScrollRaf.current = requestAnimationFrame(step);
      } else {
        isAutoScrolling.current = false;
      }
    }

    autoScrollRaf.current = requestAnimationFrame(step);
  }

  // Block native scroll during auto-scroll; allow upward gesture to interrupt.
  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (!isAutoScrolling.current) return;
      if (e.deltaY < 0) {
        isAutoScrolling.current = false;
        cancelAnimationFrame(autoScrollRaf.current);
      } else {
        e.preventDefault();
      }
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isAutoScrolling.current) return;
      const startY = touchStartY.current;
      if (startY == null) return;
      const currentY = e.touches[0]?.clientY ?? startY;

      if (currentY > startY + 30) {
        isAutoScrolling.current = false;
        cancelAnimationFrame(autoScrollRaf.current);
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(autoScrollRaf.current);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative h-[250vh]">
      <motion.div className="sticky top-0 h-screen w-full overflow-hidden bg-[#020617]">
        <motion.div className="absolute inset-0 z-0 bg-white" style={{ opacity: bgLightOpacity }} />

        {/* Cosmic Background */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{
            opacity: starsOpacity,
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
            Unified RNA Generative model for RNA design
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
