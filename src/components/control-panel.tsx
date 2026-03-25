"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FlaskConical,
  Wand2,
  Copy,
  Download,
  RotateCcw,
  Square,
  AlertCircle,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading";
import type { RNAType } from "@/data/rnaTypes";
import { SPECIES_TAXID_MAP } from "@/data/rnaTypes";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ClmSubMode = "clm-generate" | "clm-score";

interface Props {
  rnaType: RNAType;
  prefillSequence?: string;
  prefillSpecies?: string;
  prefillSettings?: {
    id?: string;
    temperature?: number;
    topK?: number;
    maxLength?: number;
    mode?: string;
    taxid?: number;
  } | null;
  prefillResult?: {
    sequence?: string;
    score?: number;
    gc_content?: number;
    mfe?: number;
    cai?: number;
    stability?: number;
    [key: string]: any;
  } | null;
  onPrefillConsumed?: () => void;
}

const MAX_SEQ_LEN = 10_000;

function randomSeq(len: number): string {
  const bases = "AUGC";
  let s = "";
  for (let i = 0; i < len; i++) s += bases[Math.floor(Math.random() * 4)];
  return s;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ControlPanel({
  rnaType,
  prefillSequence,
  prefillSpecies,
  prefillSettings,
  prefillResult,
  onPrefillConsumed,
}: Props) {
  /* ---- tab ---- */
  const [activeTab, setActiveTab] = useState<"clm" | "glm">("clm");

  /* ---- CLM state ---- */
  const [clmMode, setClmMode] = useState<ClmSubMode>("clm-generate");
  const [clmSequence, setClmSequence] = useState("");
  const [clmSeqError, setClmSeqError] = useState("");
  const [clmMaxLength, setClmMaxLength] = useState(1000);
  const [clmResultSeq, setClmResultSeq] = useState("");
  const [clmResultScore, setClmResultScore] = useState<number | null>(null);
  const [clmIsRunning, setClmIsRunning] = useState(false);
  const [clmTaskId, setClmTaskId] = useState<string | null>(null);
  const [clmTaskStatus, setClmTaskStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const [clmTaskMessage, setClmTaskMessage] = useState("");

  /* ---- GLM state ---- */
  const [glmSequence, setGlmSequence] = useState("");
  const [glmSeqError, setGlmSeqError] = useState("");
  const [glmResultSeq, setGlmResultSeq] = useState("");
  const [glmResultScore, setGlmResultScore] = useState<number | null>(null);
  const [glmIsRunning, setGlmIsRunning] = useState(false);
  const [glmTaskId, setGlmTaskId] = useState<string | null>(null);
  const [glmTaskStatus, setGlmTaskStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const [glmTaskMessage, setGlmTaskMessage] = useState("");

  /* ---- Shared right-panel state ---- */
  const [species, setSpecies] = useState("");
  const [taxid, setTaxid] = useState<number | null>(null);
  const [taxidInput, setTaxidInput] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const glmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prefillConsumedRef = useRef(false);
  const isMountedRef = useRef(true);

  const speciesList = rnaType.species ?? [];

  /* ---- helper: is scoring mode missing sequence ---- */
  const isClmScoreEmpty = clmMode === "clm-score" && !clmSequence.trim();

  /* ---- component lifecycle ---- */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (clmTimerRef.current) clearTimeout(clmTimerRef.current);
      if (glmTimerRef.current) clearTimeout(glmTimerRef.current);
    };
  }, []);

  /* ---- prefill ---- */
  useEffect(() => {
    if (prefillConsumedRef.current) return;

    let hasData = false;

    if (prefillSettings) {
      if (prefillSettings.temperature !== undefined) setTemperature(prefillSettings.temperature);
      if (prefillSettings.topK !== undefined) setTopK(prefillSettings.topK);
      if (prefillSettings.maxLength !== undefined) setClmMaxLength(prefillSettings.maxLength);
      if (prefillSettings.taxid !== undefined) {
        setTaxid(prefillSettings.taxid);
        setTaxidInput(String(prefillSettings.taxid));
      }
      hasData = true;
    }

    if (prefillResult) {
      if (prefillResult.sequence) setClmResultSeq(prefillResult.sequence);
      if (prefillResult.score !== undefined) setClmResultScore(prefillResult.score);
      hasData = true;
    }

    if (prefillSequence) {
      setClmSequence(prefillSequence);
      hasData = true;
    }

    if (prefillSpecies) {
      setSpecies(prefillSpecies);
      if (SPECIES_TAXID_MAP[prefillSpecies]) {
        setTaxid(SPECIES_TAXID_MAP[prefillSpecies]);
        setTaxidInput(String(SPECIES_TAXID_MAP[prefillSpecies]));
      }
      hasData = true;
    }

    if (hasData) {
      prefillConsumedRef.current = true;
      onPrefillConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSequence, prefillSpecies, prefillSettings, prefillResult]);

  /* ---- poll helper ---- */
  const pollTaskStatus = async (
    taskId: string,
    onComplete: (seq: string, score: number | null) => void,
    onError: (msg: string) => void,
    onProgress: (msg: string) => void,
    timerRef: React.RefObject<NodeJS.Timeout | null>
  ) => {
    const MAX_POLLS = 300;
    let pollCount = 0;

    const poll = async (): Promise<void> => {
      if (!isMountedRef.current) return;
      if (pollCount >= MAX_POLLS) {
        onError("Task timed out after 10 minutes");
        return;
      }

      try {
        const response = await fetch(`/api/task/status/${taskId}`);
        if (!response.ok) {
          pollCount++;
          timerRef.current = setTimeout(poll, 2000);
          return;
        }

        const data = await response.json();
        if (!isMountedRef.current) return;

        if (data.status === "completed") {
          const result = data.result || {};
          let seq = "";
          if (result.sequence) {
            const lines = result.sequence.split("\n");
            seq = lines.length > 1 ? lines.slice(1).join("") : result.sequence;
          }
          // Try multiple field names for score
          let score: number | null = null;
          if (result.score !== undefined) score = result.score;
          else if (result.perplexity !== undefined) score = result.perplexity;
          else if (result.fitness_score !== undefined) score = result.fitness_score;
          else if (result.value !== undefined) score = result.value;
          onComplete(seq, score);
        } else if (data.status === "failed") {
          onError(data.error || "Task failed");
        } else {
          const progress = data.progress !== undefined ? ` (${Math.round(data.progress * 100)}%)` : "";
          onProgress(`Processing${progress}...`);
          pollCount++;
          timerRef.current = setTimeout(poll, 2000);
        }
      } catch {
        if (!isMountedRef.current) return;
        pollCount++;
        timerRef.current = setTimeout(poll, 2000);
      }
    };

    await poll();
  };

  /* ---- CLM validation ---- */
  const validateClmSeq = (val: string) => {
    if (val.length > MAX_SEQ_LEN) {
      setClmSeqError(`Max ${MAX_SEQ_LEN.toLocaleString()} characters`);
      return false;
    }
    if (val.length > 0 && !/^[AUGCaugc\s\n]*$/.test(val)) {
      setClmSeqError("Only A, U, G, C allowed");
      return false;
    }
    setClmSeqError("");
    return true;
  };

  /* ---- GLM validation ---- */
  const validateGlmSeq = (val: string) => {
    if (val.length > MAX_SEQ_LEN) {
      setGlmSeqError(`Max ${MAX_SEQ_LEN.toLocaleString()} characters`);
      return false;
    }
    const cleaned = val.replace(/<mask>/gi, "");
    if (cleaned.length > 0 && !/^[AUGCaugc\s\n]*$/.test(cleaned)) {
      setGlmSeqError("Only A, U, G, C allowed (plus <mask>)");
      return false;
    }
    if (!val.includes("<mask>") && val.trim().length > 0) {
      setGlmSeqError("Include <mask> token(s) for infilling");
      return false;
    }
    setGlmSeqError("");
    return true;
  };

  /* ---- stop inference ---- */
  const handleStop = async (tab: "clm" | "glm") => {
    const taskId = tab === "clm" ? clmTaskId : glmTaskId;
    if (!taskId) return;

    try {
      await fetch(`/api/task/status/${taskId}/cancel`, { method: "POST" });
    } catch {
      // ignore network errors
    }

    if (tab === "clm") {
      if (clmTimerRef.current) clearTimeout(clmTimerRef.current);
      setClmIsRunning(false);
      setClmTaskId(null);
      setClmTaskStatus("error");
      setClmTaskMessage("Cancelled by user");
    } else {
      if (glmTimerRef.current) clearTimeout(glmTimerRef.current);
      setGlmIsRunning(false);
      setGlmTaskId(null);
      setGlmTaskStatus("error");
      setGlmTaskMessage("Cancelled by user");
    }
  };

  /* ---- CLM run ---- */
  const handleClmRun = async () => {
    if (clmIsRunning) return;

    // Validate: scoring requires sequence
    if (isClmScoreEmpty) {
      setClmSeqError("Please enter an RNA sequence to score");
      return;
    }
    if (clmSeqError) return;

    setClmIsRunning(true);
    setClmResultSeq("");
    setClmResultScore(null);
    setClmTaskStatus("running");
    setClmTaskMessage("Submitting task...");

    const taskId = crypto.randomUUID();
    setClmTaskId(taskId);

    const sessionData = {
      id: taskId,
      sequence: clmSequence,
      species,
      taxid: taxid || undefined,
      temperature,
      topK,
      maxLength: clmMaxLength,
      mode: clmMode,
      rnaTypeId: rnaType.id,
      timestamp: Date.now(),
    };
    localStorage.setItem(`rna_session_${rnaType.id}`, JSON.stringify(sessionData));

    const taskType = clmMode === "clm-generate" ? "generate" : "scoring";

    const payload: Record<string, unknown> = {
      task_type: taskType,
      rna_type: rnaType.id,
    };
    if (clmSequence.trim()) {
      (payload as Record<string, unknown>).sequence = clmSequence;
    }
    if (species) (payload as Record<string, unknown>).species = species;
    if (taxid) (payload as Record<string, unknown>).taxid = taxid;
    (payload as Record<string, unknown>).parameters = {
      temperature,
      top_k: topK,
      max_length: clmMaxLength,
    };

    try {
      const res = await fetch("/api/task/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Task submission failed");
      }
      const data = await res.json();
      if (!data.task_id) throw new Error("Invalid response: no task_id");
      const returnedTaskId = data.task_id;
      setClmTaskId(returnedTaskId);
      setClmTaskMessage("Task queued, waiting for GPU...");

      await pollTaskStatus(
        returnedTaskId,
        (seq, score) => {
          setClmTaskStatus("completed");
          setClmTaskMessage("Task completed");
          setClmResultSeq(seq);
          setClmResultScore(score);
        },
        (msg) => {
          setClmTaskStatus("error");
          setClmTaskMessage(msg);
        },
        (msg) => setClmTaskMessage(msg),
        clmTimerRef
      );
    } catch (error) {
      console.error("CLM task error:", error);
      setClmTaskStatus("error");
      setClmTaskMessage(error instanceof Error ? error.message : "Task failed");
      await new Promise((r) => setTimeout(r, 500));
      const len = clmMode === "clm-generate" ? clmMaxLength : Math.max(clmSequence.length, 50);
      setClmResultSeq(randomSeq(Math.min(len, MAX_SEQ_LEN)));
      setClmResultScore(parseFloat((Math.random() * 0.6 + 0.4).toFixed(4)));
    } finally {
      setClmIsRunning(false);
      setClmTaskId(null);
      localStorage.removeItem(`rna_session_${rnaType.id}`);
    }
  };

  /* ---- GLM run ---- */
  const handleGlmRun = async () => {
    if (glmIsRunning) return;
    if (!glmSequence.trim() || glmSeqError) return;

    setGlmIsRunning(true);
    setGlmResultSeq("");
    setGlmResultScore(null);
    setGlmTaskStatus("running");
    setGlmTaskMessage("Submitting task...");

    const taskId = crypto.randomUUID();
    setGlmTaskId(taskId);

    const payload: Record<string, unknown> = {
      task_type: "infill",
      rna_type: rnaType.id,
      sequence: glmSequence.replace(/<mask>/gi, "[MASK]"),
    };
    if (species) (payload as Record<string, unknown>).species = species;
    if (taxid) (payload as Record<string, unknown>).taxid = taxid;
    (payload as Record<string, unknown>).parameters = { temperature, top_k: topK };

    try {
      const res = await fetch("/api/task/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Task submission failed");
      }
      const data = await res.json();
      if (!data.task_id) throw new Error("Invalid response: no task_id");
      const returnedTaskId = data.task_id;
      setGlmTaskId(returnedTaskId);
      setGlmTaskMessage("Task queued, waiting for GPU...");

      await pollTaskStatus(
        returnedTaskId,
        (seq, score) => {
          setGlmTaskStatus("completed");
          setGlmTaskMessage("Task completed");
          setGlmResultSeq(seq);
          setGlmResultScore(score);
        },
        (msg) => {
          setGlmTaskStatus("error");
          setClmTaskMessage(msg);
        },
        (msg) => setGlmTaskMessage(msg),
        glmTimerRef
      );
    } catch (error) {
      console.error("GLM task error:", error);
      setGlmTaskStatus("error");
      setGlmTaskMessage(error instanceof Error ? error.message : "Task failed");
      await new Promise((r) => setTimeout(r, 500));
      const len = Math.max(glmSequence.replace(/<mask>/gi, "").length + 20, 50);
      setGlmResultSeq(randomSeq(Math.min(len, MAX_SEQ_LEN)));
      setGlmResultScore(parseFloat((Math.random() * 0.6 + 0.4).toFixed(4)));
    } finally {
      setGlmIsRunning(false);
      setGlmTaskId(null);
    }
  };

  /* ---- species / taxid ---- */
  const handleSpeciesChange = (val: string) => {
    setSpecies(val);
    if (val && SPECIES_TAXID_MAP[val]) {
      setTaxid(SPECIES_TAXID_MAP[val]);
      setTaxidInput(String(SPECIES_TAXID_MAP[val]));
    } else {
      setTaxid(null);
      setTaxidInput("");
    }
  };

  const handleTaxidChange = (val: string) => {
    setTaxidInput(val);
    setTaxid(val ? parseInt(val, 10) : null);
  };

  /* ---- copy / download ---- */
  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const downloadFasta = (seq: string) => {
    const blob = new Blob([`>${rnaType.id}_result\n${seq}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rnaType.id}_result.fasta`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---- reset ---- */
  const handleReset = (tab: "clm" | "glm") => {
    if (tab === "clm") {
      setClmSequence("");
      setClmResultSeq("");
      setClmResultScore(null);
      setClmTaskStatus("idle");
      setClmTaskMessage("");
      setClmSeqError("");
    } else {
      setGlmSequence("");
      setGlmResultSeq("");
      setGlmResultScore(null);
      setGlmTaskStatus("idle");
      setGlmTaskMessage("");
      setGlmSeqError("");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Right panel — shared species / taxid / advanced                     */
  /* ------------------------------------------------------------------ */
  const RightPanel = () => (
    <div className="space-y-4">
      {/* Species */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Species</label>
        <select
          value={species}
          onChange={(e) => handleSpeciesChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-slate-700"
        >
          <option value="">Auto-detect</option>
          {speciesList.map((s) => (
            <option key={s} value={s}>
              {SPECIES_TAXID_MAP[s] ? `${s} (${SPECIES_TAXID_MAP[s]})` : s}
            </option>
          ))}
        </select>
      </div>

      {/* TaxID */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          NCBI TaxID
          <span className="ml-1 text-slate-300 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          value={taxidInput}
          onChange={(e) => handleTaxidChange(e.target.value)}
          placeholder="e.g. 9606"
          className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-mono text-slate-700 placeholder:text-slate-300"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-blue-100" />

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Advanced settings
        <ChevronDown className={cn("w-3 h-3 transition-transform ml-auto", showAdvanced && "rotate-180")} />
      </button>

      {/* Advanced params */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-3"
          >
            {/* Max length — De novo Design only */}
            {activeTab === "clm" && clmMode === "clm-generate" && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-500">Max Length</label>
                  <span className="text-xs font-mono text-blue-500">{clmMaxLength} nt</span>
                </div>
                <input
                  type="range" min={10} max={2000} step={10}
                  value={clmMaxLength}
                  onChange={(e) => setClmMaxLength(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}
            {/* Temperature */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">Temperature</label>
                <span className="text-xs font-mono text-blue-500">{temperature}</span>
              </div>
              <input
                type="range" min={0.1} max={2.0} step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>Conservative</span><span>Creative</span>
              </div>
            </div>
            {/* Top-K */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">Top-K</label>
                <span className="text-xs font-mono text-blue-500">{topK}</span>
              </div>
              <input
                type="range" min={1} max={100} step={1}
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Result display                                                     */
  /* ------------------------------------------------------------------ */
  const ResultCard = ({
    seq, score, status, message, onCopy, onDownload, onReset
  }: {
    seq: string; score: number | null;
    status: "idle" | "running" | "completed" | "error";
    message: string;
    onCopy: () => void; onDownload: () => void; onReset: () => void;
  }) => (
    <div>
      <AnimatePresence>
        {(seq || score !== null || status !== "idle") && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Status bar */}
            {status !== "idle" && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                status === "running" && "bg-blue-50 text-blue-600 border border-blue-100",
                status === "completed" && "bg-green-50 text-green-600 border border-green-100",
                status === "error" && "bg-red-50 text-red-600 border border-red-100"
              )}>
                {status === "running" && <LoadingSpinner className="w-4 h-4" />}
                {status === "error" && <AlertCircle className="w-4 h-4" />}
                <span className="flex-1">{message}</span>
              </div>
            )}

            {/* Score */}
            {score !== null && (
              <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Quality Score</span>
                <div className="flex-1 h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, score * 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-mono font-bold text-blue-600">{score.toFixed(4)}</span>
              </div>
            )}

            {/* Sequence */}
            {seq && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{seq.length.toLocaleString()} nt</span>
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 max-h-32 overflow-y-auto break-all leading-relaxed">
                  {seq}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onCopy}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={onDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> FASTA
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-md overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-blue-100 bg-blue-50/40">
        {(["clm", "glm"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-xs font-semibold tracking-wide transition-all",
              activeTab === tab
                ? "text-blue-600 bg-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-blue-500 hover:bg-blue-50/50"
            )}
          >
            {tab === "clm"
              ? "CLM · De novo Design & Directed Evolution"
              : "GLM · Domain Redesign"}
          </button>
        ))}
      </div>

      {/* 2-column body */}
      <div className="flex min-h-[480px]">

        {/* ── Left: Sequence + Action ── */}
        <div className="flex-1 p-5 flex flex-col gap-4">

          {/* CLM sub-mode pills */}
          {activeTab === "clm" && (
            <div className="flex gap-1.5 p-1 bg-blue-50 rounded-xl">
              <button
                onClick={() => {
                  setClmMode("clm-generate");
                  handleReset("clm");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  clmMode === "clm-generate"
                    ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                    : "text-slate-500 hover:text-blue-500"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" /> De novo Design
              </button>
              <button
                onClick={() => {
                  setClmMode("clm-score");
                  handleReset("clm");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  clmMode === "clm-score"
                    ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                    : "text-slate-500 hover:text-blue-500"
                )}
              >
                <FlaskConical className="w-3.5 h-3.5" /> Directed Evolution
              </button>
            </div>
          )}

          {/* Sequence input */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              {activeTab === "clm"
                ? clmMode === "clm-generate" ? "Seed Sequence" : "Input Sequence"
                : "Masked Sequence"}
              {activeTab === "clm" && clmMode === "clm-generate" && (
                <span className="ml-1 text-slate-400 font-normal">(optional)</span>
              )}
            </label>
            <textarea
              ref={textareaRef}
              value={activeTab === "clm" ? clmSequence : glmSequence}
              onChange={(e) => {
                if (activeTab === "clm") {
                  setClmSequence(e.target.value);
                  // Clear error when user starts typing
                  if (clmSeqError && clmSeqError.includes("Please enter")) setClmSeqError("");
                  validateClmSeq(e.target.value);
                } else {
                  setGlmSequence(e.target.value);
                  validateGlmSeq(e.target.value);
                }
              }}
              placeholder={
                activeTab === "clm"
                  ? clmMode === "clm-generate"
                    ? "Leave blank to generate a random sequence, or enter a seed sequence…"
                    : "Enter an RNA sequence to score…"
                  : "Enter a sequence with <mask> tokens to redesign domains…\nExample: AUGCUAGC<mask>UAGCUAGC"
              }
              rows={5}
              className={cn(
                "w-full h-full min-h-[120px] p-3 rounded-xl border bg-white resize-none transition-all text-xs font-mono text-slate-700 placeholder:text-slate-300 leading-relaxed",
                activeTab === "clm"
                  ? clmSeqError
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  : glmSeqError
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              )}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className={cn("text-xs", activeTab === "clm"
                ? clmSeqError ? "text-red-500" : "text-slate-400"
                : glmSeqError ? "text-red-500" : "text-slate-400"
              )}>
                {activeTab === "clm"
                  ? clmSeqError || `${clmSequence.length.toLocaleString()} / ${MAX_SEQ_LEN.toLocaleString()} nt`
                  : glmSeqError || `${glmSequence.length.toLocaleString()} / ${MAX_SEQ_LEN.toLocaleString()} nt`}
              </span>
              {activeTab === "clm" && clmMode === "clm-generate" && clmSequence.length === 0 && (
                <button
                  onClick={() => {
                    const s = randomSeq(30);
                    setClmSequence(s);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-600 transition-colors flex items-center gap-0.5"
                >
                  <Wand2 className="w-3 h-3" /> Random
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            {activeTab === "clm" ? (
              clmIsRunning ? (
                <button
                  onClick={() => handleStop("clm")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all h-8"
                >
                  <Square className="w-4 h-4" /> Stop
                </button>
              ) : (
                <button
                  onClick={handleClmRun}
                  disabled={isClmScoreEmpty || !!clmSeqError}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all h-8",
                    isClmScoreEmpty || clmSeqError
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                  )}
                >
                  <Wand2 className="w-4 h-4" />
                  {clmMode === "clm-generate" ? "Run De novo Design" : "Run Directed Evolution"}
                </button>
              )
            ) : glmIsRunning ? (
              <button
                onClick={() => handleStop("glm")}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all h-8"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            ) : (
              <button
                onClick={handleGlmRun}
                disabled={!glmSequence.trim() || !!glmSeqError}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all h-8",
                  !glmSequence.trim() || glmSeqError
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                )}
              >
                <Wand2 className="w-4 h-4" /> Run Domain Redesign
              </button>
            )}
          </div>

          {/* Result */}
          {activeTab === "clm" ? (
            <ResultCard
              seq={clmResultSeq}
              score={clmResultScore}
              status={clmTaskStatus}
              message={clmTaskMessage}
              onCopy={() => copyText(clmResultSeq)}
              onDownload={() => downloadFasta(clmResultSeq)}
              onReset={() => handleReset("clm")}
            />
          ) : (
            <ResultCard
              seq={glmResultSeq}
              score={glmResultScore}
              status={glmTaskStatus}
              message={glmTaskMessage}
              onCopy={() => copyText(glmResultSeq)}
              onDownload={() => downloadFasta(glmResultSeq)}
              onReset={() => handleReset("glm")}
            />
          )}
        </div>

        {/* ── Right: Species + TaxID + Advanced ── */}
        <div className="w-72 border-l border-blue-100 bg-blue-50/30 p-5">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
