"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Copy,
  Download,
  RotateCcw,
  Wand2,
  FlaskConical,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading";
import type { RNAType } from "@/data/rnaTypes";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Mode = "clm" | "glm" | "predict";

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

const MODE_META: Record<Mode, { label: string; icon: React.ElementType; desc: string }> = {
  clm: { label: "Generate (CLM)", icon: Sparkles, desc: "Generate RNA sequence from scratch" },
  glm: { label: "Infill (GLM)", icon: Wand2, desc: "Fill in masked regions of a sequence" },
  predict: { label: "Predict Score", icon: FlaskConical, desc: "Evaluate sequence quality score" },
};

/* Helper: random AUGC sequence */
function randomSeq(len: number): string {
  const bases = "AUGC";
  let s = "";
  for (let i = 0; i < len; i++) s += bases[Math.floor(Math.random() * 4)];
  return s;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ControlPanel({ rnaType, prefillSequence, prefillSpecies, prefillSettings, prefillResult, onPrefillConsumed }: Props) {
  /* ---- state ---- */
  const [mode, setMode] = useState<Mode>("clm");
  const [sequence, setSequence] = useState("");
  const [species, setSpecies] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(50);
  const [maxLength, setMaxLength] = useState(200);

  const [expanded, setExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // task status
  const [taskStatus, setTaskStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const [taskMessage, setTaskMessage] = useState("");

  // results
  const [resultSeq, setResultSeq] = useState("");
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // validation
  const [seqError, setSeqError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---- prefill from example or saved session ---- */
  useEffect(() => {
    // 恢复保存的设置（如果有）
    if (prefillSettings) {
      if (prefillSettings.temperature !== undefined) {
        setTemperature(prefillSettings.temperature);
      }
      if (prefillSettings.topK !== undefined) {
        setTopK(prefillSettings.topK);
      }
      if (prefillSettings.maxLength !== undefined) {
        setMaxLength(prefillSettings.maxLength);
      }
      if (prefillSettings.mode !== undefined) {
        setMode(prefillSettings.mode as Mode);
      }
    }

    // 恢复保存的结果（如果有）
    if (prefillResult) {
      if (prefillResult.sequence) {
        setResultSeq(prefillResult.sequence);
      }
      if (prefillResult.score !== undefined) {
        setResultScore(prefillResult.score);
      }
    }

    if (prefillSequence) {
      setSequence(prefillSequence);
      if (!prefillSettings) {
        setMode("clm");
      }
      onPrefillConsumed?.();
    }
    if (prefillSpecies) {
      setSpecies(prefillSpecies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSequence, prefillSpecies, prefillSettings, prefillResult]);

  /* ---- helpers ---- */
  const speciesList = rnaType.species ?? [];

  const validateSeq = (val: string) => {
    if (val.length > MAX_SEQ_LEN) {
      setSeqError(`Sequence length exceeds ${MAX_SEQ_LEN.toLocaleString()} characters`);
      return false;
    }
    // Allow AUGC + mask tokens for GLM
    const cleaned = val.replace(/<mask>/gi, "");
    if (cleaned.length > 0 && !/^[AUGCaugc\s\n]*$/.test(cleaned)) {
      setSeqError("Only A, U, G, C characters allowed");
      return false;
    }
    setSeqError("");
    return true;
  };

  const handleSeqChange = (val: string) => {
    setSequence(val);
    validateSeq(val);
  };

  const canRun = (() => {
    if (isRunning) return false;
    if (mode === "clm") return true; // CLM can run without input
    return sequence.trim().length > 0 && !seqError;
  })();

  /* ---- run ---- */
  const handleRun = async () => {
    if (!canRun) return;
    setIsRunning(true);
    setResultSeq("");
    setResultScore(null);
    setTaskStatus("running");
    setTaskMessage("Submitting task...");

    // 保存当前参数到 localStorage
    const sessionData = {
      sequence,
      species,
      temperature,
      topK,
      maxLength,
      mode,
      rnaTypeId: rnaType.id,
      timestamp: Date.now(),
    };
    localStorage.setItem(`rna_session_${rnaType.id}`, JSON.stringify(sessionData));

    try {
      // 提交任务到后端 API
      const submitResponse = await fetch("/api/task/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence,
          species,
          temperature,
          topK,
          maxLength,
          mode,
          rnaTypeId: rnaType.id,
        }),
      });

      if (!submitResponse.ok) {
        const errData = await submitResponse.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit task");
      }

      const submitData = await submitResponse.json();
      const taskId = submitData.task_id;

      if (!taskId) {
        throw new Error("No task_id returned from backend");
      }

      setTaskMessage("Task submitted, waiting for inference...");

      // 轮询任务状态
      const POLL_INTERVAL = 2000; // 2秒
      const MAX_POLLS = 150;      // 最多轮询5分钟
      let polls = 0;

      while (polls < MAX_POLLS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        polls++;

        const statusResponse = await fetch(`/api/task/status/${taskId}`);
        if (!statusResponse.ok) {
          throw new Error("Failed to check task status");
        }

        const statusData = await statusResponse.json();
        const progress = statusData.progress ?? 0;
        setTaskMessage(`Inference in progress... ${Math.round(progress * 100)}%`);

        if (statusData.status === "completed") {
          setTaskStatus("completed");
          setTaskMessage("Task completed");
          localStorage.removeItem(`rna_session_${rnaType.id}`);

          const result = statusData.result;
          if (mode === "predict") {
            // 后端可能返回 score 或 perplexity，统一处理
            let score = result?.score;
            if (score == null && result?.perplexity != null) {
              // 将 perplexity 归一化为 0-1 分数（越低越好）
              const ppl = result.perplexity;
              score = Math.max(0, Math.min(1, 1 - Math.log10(ppl) / 4));
            }
            setResultScore(score ?? null);
          } else {
            let seq = result?.sequence || "";
            // 清理模型特殊 token
            seq = seq.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
            // 从 FASTA 格式中提取序列（去掉头行）
            const lines = seq.split("\n");
            const actualSeq = lines.length > 1 ? lines.filter((l: string) => !l.startsWith(">")).join("") : seq;
            setResultSeq(actualSeq || "");
          }
          return; // 任务完成，退出
        }

        if (statusData.status === "failed") {
          throw new Error(statusData.error || "Inference failed");
        }
      }

      // 轮询超时
      throw new Error("Task timed out after 5 minutes");

    } catch (error) {
      console.error("Task error:", error);
      setTaskStatus("error");
      setTaskMessage(error instanceof Error ? error.message : "Task execution failed");
      localStorage.removeItem(`rna_session_${rnaType.id}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    const text = resultSeq || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `>${rnaType.id}_generated\n${resultSeq}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rnaType.id}_generated.fasta`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSequence("");
    setResultSeq("");
    setResultScore(null);
    setSeqError("");
    setTaskStatus("idle");
    setTaskMessage("");
  };

  /* ---- render ---- */
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* ───────── Mode Tabs ───────── */}
      <div className="flex border-b border-border">
        {(Object.keys(MODE_META) as Mode[]).map((m) => {
          const meta = MODE_META[m];
          const Icon = meta.icon;
          return (
            <button
              key={m}
              onClick={() => { setMode(m); setResultSeq(""); setResultScore(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors relative",
                mode === m
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{meta.label}</span>
              <span className="sm:hidden">{meta.label.split(" ")[0]}</span>
              {mode === m && (
                <motion.div
                  layoutId="mode-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ───────── Panel Body ───────── */}
      <div className="p-4 sm:p-6">
        {/* Mode description */}
        <p className="text-xs text-muted-foreground mb-4">
          {MODE_META[mode].desc}
        </p>

        {/* Always-visible: sequence input + species + run */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sequence Input — spans 2 cols on large */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium">
                {mode === "clm" ? "Prompt Sequence (optional)" : mode === "glm" ? "Masked Sequence" : "Input Sequence"}
              </label>
            </div>
            <textarea
              ref={textareaRef}
              value={sequence}
              onChange={(e) => handleSeqChange(e.target.value)}
              placeholder={
                mode === "clm"
                  ? "Optional: provide a seed sequence or leave blank to generate from scratch…"
                  : mode === "glm"
                    ? "Enter sequence with <mask> tokens for infilling…\nExample: AUGCUAGC<mask>UAGCUAGC"
                    : "Enter RNA sequence for quality prediction…\nExample: AUGCGAUUCGAACGUAACGCUUAGCGUAGCU"
              }
              className={cn(
                "w-full h-28 sm:h-32 p-3 rounded-xl bg-muted/30 border resize-none focus:outline-none transition-colors font-mono text-sm",
                seqError ? "border-red-500/60 focus:border-red-500" : "border-border focus:border-primary/50"
              )}
            />
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className={cn("transition-colors", seqError ? "text-red-400" : "text-muted-foreground")}>
                {seqError || `${sequence.length.toLocaleString()} / ${MAX_SEQ_LEN.toLocaleString()}`}
              </span>
              {seqError && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
              {!seqError && <span className="text-muted-foreground">A, U, G, C</span>}
            </div>
          </div>

          {/* Right column: species + action */}
          <div className="flex flex-col gap-3">
            {/* Species */}
            {speciesList.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Species (optional)</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors text-sm"
                >
                  <option value="">Auto-detect</option>
                  {speciesList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Max length — only for CLM */}
            {mode === "clm" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Max Length</label>
                  <span className="text-sm text-primary">{maxLength}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={MAX_SEQ_LEN}
                  step={10}
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {/* Run + Reset */}
            <div className="flex gap-2 mt-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRun}
                disabled={!canRun}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm",
                  canRun
                    ? "bg-gradient-to-r from-primary to-secondary text-white glow-orange"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isRunning ? (
                  <><LoadingSpinner className="w-4 h-4" /> Running…</>
                ) : (
                  <><Play className="w-4 h-4" /> Run</>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Task Status Display */}
            {taskStatus !== "idle" && (
              <div className={cn(
                "mt-3 p-3 rounded-xl text-sm",
                taskStatus === "running" && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                taskStatus === "completed" && "bg-green-500/20 text-green-400 border border-green-500/30",
                taskStatus === "error" && "bg-red-500/20 text-red-400 border border-red-500/30"
              )}>
                <div className="flex items-center gap-2">
                  {taskStatus === "running" && <LoadingSpinner className="w-4 h-4" />}
                  <span>{taskMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───────── Advanced settings (expand/collapse) ───────── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Advanced Settings
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Temperature</label>
                    <span className="text-sm text-primary">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Top-K */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Top-K</label>
                    <span className="text-sm text-primary">{topK}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Min / Max Length (override for non-CLM) */}
                {mode !== "clm" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Len</label>
                      <input
                        type="number"
                        defaultValue={10}
                        min={1}
                        max={MAX_SEQ_LEN}
                        className="w-full p-2.5 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Len</label>
                      <input
                        type="number"
                        defaultValue={5000}
                        min={1}
                        max={MAX_SEQ_LEN}
                        className="w-full p-2.5 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───────── Result Area ───────── */}
        <AnimatePresence>
          {(resultSeq || resultScore !== null) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-border"
            >
              {/* ---- Prediction Score ---- */}
              {resultScore !== null && (
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Prediction Score</h3>
                  <div className="relative w-40 h-40">
                    {/* Circular gauge */}
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="8" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke="url(#scoreGrad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - resultScore) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--primary)" />
                          <stop offset="100%" stopColor="var(--secondary)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold gradient-text-orange-blue">
                        {resultScore.toFixed(4)}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {resultScore >= 0.8 ? "Excellent" : resultScore >= 0.6 ? "Good" : "Fair"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Generated Sequence ---- */}
              {resultSeq && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium">
                      {mode === "clm" ? "Generated Sequence" : "Infilled Sequence"}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {resultSeq.length.toLocaleString()} nt
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border font-mono text-xs sm:text-sm max-h-48 overflow-y-auto break-all leading-relaxed">
                    {resultSeq}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-muted/50 hover:bg-muted transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download FASTA
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
