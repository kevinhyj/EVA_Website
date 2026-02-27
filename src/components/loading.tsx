"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  customIcon?: React.ReactNode;
  text?: string;
  showText?: boolean;
}

/**
 * RNAVerse Logo Icon - Based on the official RNAVerse.svg left icon
 * Features the RNA double helix with outer ring
 */
export function RNALoadingIcon({
  className,
  size = 80,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rnaLoadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#03b2f1" />
          <stop offset="100%" stopColor="#f87904" />
        </linearGradient>
        <linearGradient id="rnaLoadingGradientReverse" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#03b2f1" />
          <stop offset="100%" stopColor="#f87904" />
        </linearGradient>
      </defs>

      {/* Outer ring - rotating */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        <motion.path
          fill="url(#rnaLoadingGradient)"
          d="M15.5,62.5c-1.7-4.6-2.6-9.6-2.6-14.8C12.9,22.1,33.1,1.9,58.7,1.9c5.7,0,11.1,1.1,16,3.1c2.3-.4,5.1-.8,7.9-1C75.6,0,67.4-2.4,58.7-2.4C32.1-2.4,10.5,19.2,10.5,45.8c0,4.7.7,9.3,2,13.6c1.4.3,3.2.7,5,1.2z"
          transform="translate(-5, 5) scale(1.05)"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          fill="url(#rnaLoadingGradient)"
          d="M93.5,52.7c-2.9,20.9-20.9,37-42.6,37c-11.5,0-21.9-4.5-29.6-11.9c-2.2-.5-4.9-1.1-7.5-1.7c8.7,10.9,22.1,18,37.1,18c26.1,0,47.4-21.3,47.4-47.4c0-.1,0-.3,0-.4c-1.1,2-2.7,4.4-4.8,6.4z"
          transform="translate(-5, 5) scale(1.05)"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.g>

      {/* Main helix - pulsing */}
      <motion.path
        fill="url(#rnaLoadingGradient)"
        d="M93.2,29.1c3.5,4.7,3.4,12.8.1,17.8c-3.9,5.8-10,8.4-17.6,6.5c-7.2-1.8-14.1-4.5-21.1-6.9c-6.2-2.2-12.5-3.4-19-1.8c-7.7,2-12.8,8.2-13.6,16.1c-.1.6-.2,1.1-.3,1.9c-2.6-.7-5.1-1.3-7.6-2.2c-.5-.2-1-1.3-1-2c-.1-8.8,1.6-17.1,7.7-23.9c5.1-5.7,11.6-8.2,19.4-6.9c6.2,1,11.7,4,17.3,6.5c5.7,2.5,11.6,4.8,17.6,6.7c2.7.8,5.8.7,8.7.4c4.8-.5,8.1-4.3,8.9-9.7c.1-.7.2-1.4.3-2.5z"
        transform="translate(-5, 5) scale(1.05)"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.9, 1, 0.9]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Secondary helix - delayed pulse */}
      <motion.path
        fill="url(#rnaLoadingGradientReverse)"
        d="M-5.8,66.9c4.2-1.3,8.5-1.5,12.8-1.4c5.6.2,10.8,1.5,15.9,3.5c5,2,10,3.3,15.4,3.1c6-.3,10.7-3,13.9-7.8c2.2-3.3,3.8-6.9,5.9-10.7c2.7.8,5.7,1.7,8.7,2.8c.5.2,1,1.7.8,2.3c-2.2,6.4-5.7,11.9-10.4,16.8c-4.2,4.4-9.4,6.2-15,6.5c-3.1.2-6.4-1-9.4-2.1c-3.9-1.5-7.7-3.6-11.4-5.6c-8.3-4.4-17.1-6.7-26.4-7.3c-.3,0-.6-.1-.9-.1z"
        transform="translate(-5, 5) scale(1.05)"
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Small helix accent */}
      <motion.path
        fill="url(#rnaLoadingGradient)"
        d="M96.3,15.3c-2-.4-3.9-.9-5.9-1.3c-11.7-2.5-20.8,4.8-20.1,16.1c0,.7,0,1.5,0,2.5c-1-.1-1.9,0-2.6-.3c-2.3-.9-4.7-1.9-6.9-3.1c-1.6-.9-2.3-2.2-2.1-4.3c1.1-12.7,12.1-20.6,24.3-17c4.2,1.2,8.1,3.7,12.1,5.6c.6.3,1.2.5,1.8.8c-.2.3-.5.6-.7.9z"
        transform="translate(-5, 5) scale(1.05)"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
    </svg>
  );
}

/**
 * Full-screen Loading Component
 * Supports custom loading icon via props
 */
export function Loading({
  className,
  customIcon,
  text = "Exploring EVA...",
  showText = true,
}: LoadingProps) {
  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-background/95 backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(3,178,241,0.1) 0%, rgba(248,121,4,0.05) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Loading icon container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10"
      >
        {customIcon || <RNALoadingIcon size={80} />}
      </motion.div>

      {/* Loading text */}
      {showText && (
        <motion.p
          className="mt-6 text-base font-medium text-muted-foreground tracking-wide"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {text}
        </motion.p>
      )}

      {/* Minimal progress indicator */}
      <motion.div
        className="mt-4 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #03b2f1, #f87904)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/**
 * Small inline loading spinner
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("spinner", className)} />
  );
}
