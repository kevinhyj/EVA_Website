"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { RNAType } from "@/data/rnaTypes";
import { ControlPanel } from "@/components/control-panel";
import { VisualizationsShowcase } from "@/components/visualizations-showcase";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-6xl">

        {/* ───────── Header ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors mb-5 font-medium tracking-wide"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          {/* Title row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Colored indicator bar */}
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: rnaType.col }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {rnaType.name}
            </h1>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full border"
              style={{
                borderColor: `${rnaType.col}40`,
                color: rnaType.col,
                background: `${rnaType.col}10`,
              }}
            >
              {rnaType.tag}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed pl-4">
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
              "mb-4 p-3 rounded-xl text-sm flex items-center gap-2.5",
              restoreStatus.type === "loading" && "bg-blue-50 text-blue-600 border border-blue-100",
              restoreStatus.type === "success" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
              restoreStatus.type === "error" && "bg-red-50 text-red-600 border border-red-100"
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

        {/* ───────── Experiment Visualizations ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          {/* Section divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-blue-200" />
            <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase">Experiment Visualization</span>
            <div className="flex-1 h-px bg-blue-200" />
          </div>
          <VisualizationsShowcase rnaType={rnaType} />
        </motion.div>
      </div>
    </div>
  );
}
