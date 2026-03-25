"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { RNAType } from "@/data/rnaTypes";
import { ControlPanel } from "@/components/control-panel";
import { ExamplesShowcase } from "@/components/examples-showcase";
import { cn } from "@/lib/utils";

interface Props {
  rnaType: RNAType;
}

interface SavedSession {
  id: string;
  sequence: string;
  species: string;
  taxid?: number;
  temperature: number;
  topK: number;
  maxLength: number;
  mode: string;
  rnaTypeId: string;
  timestamp: number;
}

interface SavedResult {
  sequence?: string;
  score?: number;
  gc_content?: number;
  mfe?: number;
  cai?: number;
  stability?: number;
  [key: string]: any;
}

export default function RNADesignPage({ rnaType }: Props) {
  const [prefillSequence, setPrefillSequence] = useState("");
  const [prefillSpecies, setPrefillSpecies] = useState("");
  const [prefillSettings, setPrefillSettings] = useState<{
    id?: string;
    temperature?: number;
    topK?: number;
    maxLength?: number;
    mode?: string;
    taxid?: number;
  } | null>(null);
  const [prefillResult, setPrefillResult] = useState<SavedResult | null>(null);

  const [restoreStatus, setRestoreStatus] = useState<{
    type: "loading" | "success" | "error";
    message: string;
  } | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /* ---- component lifecycle ---- */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  /* ---- restore from localStorage ---- */
  useEffect(() => {
    const savedSession = localStorage.getItem(`rna_session_${rnaType.id}`);
    if (savedSession) {
      try {
        const session: SavedSession = JSON.parse(savedSession);
        const isRecent = Date.now() - session.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && session.sequence) {
          setPrefillSequence(session.sequence);
          setPrefillSpecies(session.species || "");
          setPrefillSettings({
            id: session.id,
            temperature: session.temperature,
            topK: session.topK,
            maxLength: session.maxLength,
            mode: session.mode,
            taxid: session.taxid,
          });
          fetchResult(session.id, session.mode, rnaType.id);
        }
      } catch (e) {
        console.error("Failed to parse saved session:", e);
      }
    }
  }, [rnaType.id]);

  /* ---- fetch result via task status API ---- */
  const fetchResult = async (taskId: string, mode: string, rnaTypeId: string) => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (!isMountedRef.current) return;

    setRestoreStatus({ type: "loading", message: "Loading previous result..." });

    const poll = async () => {
      if (!isMountedRef.current) return;

      try {
        const response = await fetch(`/api/task/status/${taskId}`);
        if (!response.ok) {
          setRestoreStatus({ type: "error", message: "Failed to load result" });
          return;
        }

        const data = await response.json();
        const status = data.status;

        if (!isMountedRef.current) return;

        if (status === "completed") {
          const result = data.result || {};
          setPrefillResult({
            sequence: result.sequence || "",
            score: result.score ?? result.perplexity,
            ...result,
          });
          setRestoreStatus({ type: "success", message: "Previous result restored" });
          localStorage.removeItem(`rna_session_${rnaTypeId}`);
          fetch(`/api/task/status/${taskId}`, { method: "DELETE" });
          setTimeout(() => {
            if (isMountedRef.current) setRestoreStatus(null);
          }, 3000);
        } else if (status === "processing" || status === "pending") {
          setRestoreStatus({ type: "loading", message: "Previous task is still running..." });
          pollTimerRef.current = setTimeout(poll, 2000);
        } else if (status === "failed") {
          setRestoreStatus({ type: "error", message: data.error || "Task failed" });
          localStorage.removeItem(`rna_session_${rnaTypeId}`);
          fetch(`/api/task/status/${taskId}`, { method: "DELETE" });
        }
      } catch {
        if (!isMountedRef.current) return;
        setRestoreStatus({ type: "error", message: "Failed to load result" });
      }
    };

    await poll();
  };

  const handleTryExample = useCallback((seq: string, species: string) => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setPrefillSequence(seq);
    setPrefillSpecies(species);
    setPrefillSettings(null);
    setRestoreStatus(null);
    document.getElementById("control-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen theme-light bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ───────── Header ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Color dot */}
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: rnaType.col, boxShadow: `0 0 12px ${rnaType.col}60` }}
            />
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="gradient-text-orange-blue">{rnaType.name}</span>
            </h1>
            {/* Tag badge */}
            <span
              className="text-xs font-medium px-3 py-1 rounded-full border shrink-0"
              style={{
                borderColor: `${rnaType.col}50`,
                color: rnaType.col,
                background: `${rnaType.col}15`,
              }}
            >
              {rnaType.tag}
            </span>
          </div>

          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            {rnaType.desc}
          </p>
        </motion.div>

        {/* ───────── Control Panel ───────── */}
        <motion.div
          id="control-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Restore status messages */}
          {restoreStatus && (
            <div className={cn(
              "mb-4 p-3 rounded-xl text-sm flex items-center gap-2",
              restoreStatus.type === "loading" && "bg-blue-50 text-blue-600 border border-blue-200",
              restoreStatus.type === "success" && "bg-green-50 text-green-600 border border-green-200",
              restoreStatus.type === "error" && "bg-red-50 text-red-600 border border-red-200"
            )}>
              {restoreStatus.type === "loading" && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              {restoreStatus.type === "success" && <CheckCircle className="w-4 h-4" />}
              {restoreStatus.type === "error" && <AlertCircle className="w-4 h-4" />}
              <span>{restoreStatus.message}</span>
            </div>
          )}
          <ControlPanel
            rnaType={rnaType}
            prefillSequence={prefillSequence}
            prefillSpecies={prefillSpecies}
            prefillSettings={prefillSettings}
            prefillResult={prefillResult}
            onPrefillConsumed={() => { setPrefillSequence(""); setPrefillSpecies(""); setPrefillSettings(null); setPrefillResult(null); }}
          />
        </motion.div>

        {/* ───────── Examples & Achievements ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 sm:mt-10"
        >
          <ExamplesShowcase rnaType={rnaType} onTryExample={handleTryExample} />
        </motion.div>
      </div>
    </div>
  );
}
