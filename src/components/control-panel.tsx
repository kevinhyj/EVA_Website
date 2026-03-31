"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Sparkles,
  Copy,
  Download,
  Wand2,
  Check,
  AlertCircle,
  FlaskConical,
  Hash,
  ChevronDown,
  Settings2,
  Square,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
const SESSION_KEY_CLM = (id: string) => `eva_task_clm_${id}`;
const SESSION_KEY_GLM = (id: string) => `eva_task_glm_${id}`;

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
  /* ---- CLM state ---- */
  const [clmMode, setClmMode] = useState<ClmSubMode>("clm-generate");
  const [clmSequence, setClmSequence] = useState("");
  const [clmSeqError, setClmSeqError] = useState("");
  const [clmMaxLength, setClmMaxLength] = useState(1000);
  const [clmResultSeq, setClmResultSeq] = useState("");
  const [clmResultScore, setClmResultScore] = useState<number | null>(null);
  const [clmTaskStatus, setClmTaskStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const [clmTaskMessage, setClmTaskMessage] = useState("");
  const [clmProgress, setClmProgress] = useState<{ nucleotides: number; max_length: number } | null>(null);

  /* ---- GLM state ---- */
  const [glmSequence, setGlmSequence] = useState("");
  const [glmSeqError, setGlmSeqError] = useState("");
  const [glmResultSeq, setGlmResultSeq] = useState("");
  const [glmResultScore, setGlmResultScore] = useState<number | null>(null);
  const [glmTaskStatus, setGlmTaskStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const [glmTaskMessage, setGlmTaskMessage] = useState("");
  const [glmProgress, setGlmProgress] = useState<{ nucleotides: number; max_length: number } | null>(null);

  /* ---- Shared state ---- */
  const [species, setSpecies] = useState("");
  const [taxid, setTaxid] = useState<number | null>(null);
  const [taxidInput, setTaxidInput] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(50);
  const [showTaxidInput, setShowTaxidInput] = useState(false);
  const [activeTab, setActiveTab] = useState<"clm" | "glm">("clm");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const taxidInputRef = useRef<HTMLInputElement>(null);
  const clmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const glmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clmTaskIdRef = useRef<string | null>(null);
  const glmTaskIdRef = useRef<string | null>(null);
  const clmCancelledRef = useRef(false);
  const glmCancelledRef = useRef(false);
  const prefillConsumedRef = useRef(false);
  const isMountedRef = useRef(true);
  // Track if we've resumed a task from sessionStorage to avoid re-polling
  const clmResumedRef = useRef(false);
  const glmResumedRef = useRef(false);

  const speciesList = rnaType.species ?? [];

  /* ---- component lifecycle ---- */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (clmTimerRef.current) clearTimeout(clmTimerRef.current);
      if (glmTimerRef.current) clearTimeout(glmTimerRef.current);
    };
  }, []);

  /* ---- sessionStorage persistence: restore running tasks on mount ---- */
  useEffect(() => {
    if (prefillConsumedRef.current) return;

    // --- prefill (from parent) ---
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

    // --- restore from sessionStorage ---
    const clmKey = SESSION_KEY_CLM(rnaType.id);
    const glmKey = SESSION_KEY_GLM(rnaType.id);

    try {
      const clmStored = sessionStorage.getItem(clmKey);
      const glmStored = sessionStorage.getItem(glmKey);

      if (clmStored) {
        try {
          const stored = JSON.parse(clmStored);
          if (stored.taskId && Date.now() - stored.timestamp < 24 * 60 * 60 * 1000) {
            // Restore CLM running state
            clmTaskIdRef.current = stored.taskId;
            setClmTaskStatus("running");
            setClmTaskMessage("Task running...");
            setClmMaxLength(stored.maxLength || 1000);
            setClmMode(stored.mode || "clm-generate");
            if (stored.sequence) setClmSequence(stored.sequence);
            if (stored.temperature !== undefined) setTemperature(stored.temperature);
            if (stored.topK !== undefined) setTopK(stored.topK);
            if (stored.taxid) {
              setTaxid(stored.taxid);
              setTaxidInput(String(stored.taxid));
            }
            // Resume polling
            clmResumedRef.current = true;
            resumeClmPolling(stored.taskId);
          }
        } catch { /* ignore parse errors */ }
      }

      if (glmStored && !clmStored) {
        try {
          const stored = JSON.parse(glmStored);
          if (stored.taskId && Date.now() - stored.timestamp < 24 * 60 * 60 * 1000) {
            glmTaskIdRef.current = stored.taskId;
            setGlmTaskStatus("running");
            setGlmTaskMessage("Task running...");
            setGlmSequence(stored.sequence || "");
            if (stored.temperature !== undefined) setTemperature(stored.temperature);
            if (stored.topK !== undefined) setTopK(stored.topK);
            glmResumedRef.current = true;
            resumeGlmPolling(stored.taskId);
          }
        } catch { /* ignore parse errors */ }
      }
    } catch { /* ignore storage errors */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- CLM polling ---- */
  const resumeClmPolling = (taskId: string) => {
    const poll = async () => {
      if (!isMountedRef.current) return;
      if (clmTaskIdRef.current === null) return;

      try {
        const [statusRes, progressRes] = await Promise.all([
          fetch(`/api/task/status/${taskId}`),
          fetch(`/api/task/status/${taskId}/progress`).catch(() => null),
        ]);

        if (!statusRes.ok) {
          clmTimerRef.current = setTimeout(poll, 2000);
          return;
        }

        const data = await statusRes.json();
        if (!isMountedRef.current) return;
        if (clmTaskIdRef.current === null) return;

        if (data.status === "completed") {
          const result = data.result || {};
          let seq = "";
          if (result.sequence) {
            const lines = result.sequence.split("\n");
            seq = lines.length > 1 ? lines.slice(1).join("") : result.sequence;
          }
          let score: number | null = null;
          if (result.score !== undefined) score = result.score;
          else if (result.perplexity !== undefined) score = result.perplexity;
          setClmTaskStatus("completed");
          setClmTaskMessage("Task completed");
          setClmResultSeq(seq);
          setClmResultScore(score);
          setClmProgress(null);
          clmTaskIdRef.current = null;
          sessionStorage.removeItem(SESSION_KEY_CLM(rnaType.id));
        } else if (data.status === "failed") {
          const errorMsg = data.error || "";
          const isCancelled = errorMsg.toLowerCase().includes("cancelled") || errorMsg.toLowerCase().includes("cancel");
          if (clmTaskIdRef.current === null) {
            // Stopped externally (user clicked Stop)
            setClmTaskStatus("idle");
            setClmTaskMessage("");
          } else {
            setClmTaskStatus("error");
            setClmTaskMessage(errorMsg || "Task failed");
          }
          setClmProgress(null);
          clmTaskIdRef.current = null;
          sessionStorage.removeItem(SESSION_KEY_CLM(rnaType.id));
        } else {
          // Running
          if (progressRes) {
            try {
              const pg = await progressRes.json();
              if (pg.nucleotides != null && pg.max_length != null && pg.max_length > 0) {
                setClmProgress({ nucleotides: pg.nucleotides, max_length: pg.max_length });
                setClmTaskMessage(`Processing ${pg.nucleotides}/${pg.max_length} nt...`);
              } else {
                setClmTaskMessage("Processing...");
              }
            } catch {
              setClmTaskMessage("Processing...");
            }
          } else {
            setClmTaskMessage("Processing...");
          }
          clmTimerRef.current = setTimeout(poll, 2000);
        }
      } catch {
        if (!isMountedRef.current) return;
        if (clmTaskIdRef.current === null) return;
        clmTimerRef.current = setTimeout(poll, 2000);
      }
    };

    poll();
  };

  /* ---- GLM polling ---- */
  const resumeGlmPolling = (taskId: string) => {
    const poll = async () => {
      if (!isMountedRef.current) return;
      if (glmTaskIdRef.current === null) return;

      try {
        const [statusRes, progressRes] = await Promise.all([
          fetch(`/api/task/status/${taskId}`),
          fetch(`/api/task/status/${taskId}/progress`).catch(() => null),
        ]);

        if (!statusRes.ok) {
          glmTimerRef.current = setTimeout(poll, 2000);
          return;
        }

        const data = await statusRes.json();
        if (!isMountedRef.current) return;
        if (glmTaskIdRef.current === null) return;

        if (data.status === "completed") {
          const result = data.result || {};
          let seq = "";
          if (result.sequence) {
            const lines = result.sequence.split("\n");
            seq = lines.length > 1 ? lines.slice(1).join("") : result.sequence;
          }
          let score: number | null = null;
          if (result.score !== undefined) score = result.score;
          else if (result.perplexity !== undefined) score = result.perplexity;
          setGlmTaskStatus("completed");
          setGlmTaskMessage("Task completed");
          setGlmResultSeq(seq);
          setGlmResultScore(score);
          setGlmProgress(null);
          glmTaskIdRef.current = null;
          sessionStorage.removeItem(SESSION_KEY_GLM(rnaType.id));
        } else if (data.status === "failed") {
          const errorMsg = data.error || "";
          if (glmTaskIdRef.current === null) {
            setGlmTaskStatus("idle");
            setGlmTaskMessage("");
          } else {
            setGlmTaskStatus("error");
            setGlmTaskMessage(errorMsg || "Task failed");
          }
          setGlmProgress(null);
          glmTaskIdRef.current = null;
          sessionStorage.removeItem(SESSION_KEY_GLM(rnaType.id));
        } else {
          if (progressRes) {
            try {
              const pg = await progressRes.json();
              if (pg.nucleotides != null && pg.max_length != null && pg.max_length > 0) {
                setGlmProgress({ nucleotides: pg.nucleotides, max_length: pg.max_length });
                setGlmTaskMessage(`Processing ${pg.nucleotides}/${pg.max_length} nt...`);
              } else {
                setGlmTaskMessage("Processing...");
              }
            } catch {
              setGlmTaskMessage("Processing...");
            }
          } else {
            setGlmTaskMessage("Processing...");
          }
          glmTimerRef.current = setTimeout(poll, 2000);
        }
      } catch {
        if (!isMountedRef.current) return;
        if (glmTaskIdRef.current === null) return;
        glmTimerRef.current = setTimeout(poll, 2000);
      }
    };

    poll();
  };

  /* ---- CLM validation ---- */
  const validateClmSeq = (val: string) => {
    if (val.length > MAX_SEQ_LEN) { setClmSeqError(`Max ${MAX_SEQ_LEN.toLocaleString()} characters`); return false; }
    if (val.length > 0 && !/^[AUGCaugc\s\n]*$/.test(val)) { setClmSeqError("Only A, U, G, C allowed"); return false; }
    setClmSeqError(""); return true;
  };

  /* ---- GLM validation ---- */
  const validateGlmSeq = (val: string) => {
    if (val.length > MAX_SEQ_LEN) { setGlmSeqError(`Max ${MAX_SEQ_LEN.toLocaleString()} characters`); return false; }
    const cleaned = val.replace(/<mask>/gi, "");
    if (cleaned.length > 0 && !/^[AUGCaugc\s\n]*$/.test(cleaned)) { setGlmSeqError("Only A, U, G, C allowed (plus <mask>)"); return false; }
    if (!val.includes("<mask>") && val.trim().length > 0) { setGlmSeqError("Include <mask> token(s) for infilling"); return false; }
    setGlmSeqError(""); return true;
  };

  /* ---- CLM stop ---- */
  const handleClmStop = async () => {
    if (!clmTaskIdRef.current) return;
    const taskId = clmTaskIdRef.current;
    clmTaskIdRef.current = null;
    clmCancelledRef.current = true;
    clearTimeout(clmTimerRef.current || undefined);
    clmTimerRef.current = null;
    setClmTaskMessage("Cancelling...");
    try {
      await fetch(`/api/task/status/${taskId}`, { method: "POST", headers: { "Content-Type": "application/json" } });
    } catch { /* ignore */ }
    // The polling loop will detect the cancelled state and reset UI
    sessionStorage.removeItem(SESSION_KEY_CLM(rnaType.id));
    // Set a timeout to reset UI if polling doesn't respond quickly
    setTimeout(() => {
      if (clmTaskIdRef.current === null) {
        setClmTaskStatus("idle");
        setClmTaskMessage("");
        setClmProgress(null);
      }
    }, 3000);
  };

  /* ---- CLM run ---- */
  const handleClmRun = async () => {
    if (clmTaskStatus === "running") return; // guard: already running
    if (clmMode === "clm-score" && !clmSequence.trim()) return;
    if (clmSeqError) return;

    clmCancelledRef.current = false;
    clmResumedRef.current = false;
    setClmResultSeq("");
    setClmResultScore(null);
    setClmProgress(null);
    setClmTaskStatus("running");
    setClmTaskMessage("Submitting task...");

    const taskType = clmMode === "clm-generate" ? "generate" : "scoring";
    const payload: any = {
      task_type: taskType,
      rna_type: rnaType.id,
    };
    if (clmSequence.trim()) payload.sequence = clmSequence;
    if (species) payload.species = species;
    if (taxid) payload.taxid = taxid;
    payload.parameters = { temperature, top_k: topK, max_length: clmMaxLength };

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
      const { task_id } = await res.json();
      clmTaskIdRef.current = task_id;
      setClmTaskMessage("Task queued, waiting for GPU...");

      // Persist to sessionStorage for cross-page navigation
      sessionStorage.setItem(SESSION_KEY_CLM(rnaType.id), JSON.stringify({
        taskId: task_id,
        mode: clmMode,
        sequence: clmSequence,
        temperature,
        topK,
        maxLength: clmMaxLength,
        taxid,
        timestamp: Date.now(),
      }));

      // Start polling
      const poll = async () => {
        if (!isMountedRef.current) return;
        if (clmTaskIdRef.current === null) return;

        try {
          const [statusRes, progressRes] = await Promise.all([
            fetch(`/api/task/status/${task_id}`),
            fetch(`/api/task/status/${task_id}/progress`).catch(() => null),
          ]);

          if (!statusRes.ok) {
            clmTimerRef.current = setTimeout(poll, 2000);
            return;
          }

          const data = await statusRes.json();
          if (!isMountedRef.current) return;
          if (clmTaskIdRef.current === null) return;

          if (data.status === "completed") {
            const result = data.result || {};
            let seq = "";
            if (result.sequence) {
              const lines = result.sequence.split("\n");
              seq = lines.length > 1 ? lines.slice(1).join("") : result.sequence;
            }
            let score: number | null = null;
            if (result.score !== undefined) score = result.score;
            else if (result.perplexity !== undefined) score = result.perplexity;
            setClmTaskStatus("completed");
            setClmTaskMessage("Task completed");
            setClmResultSeq(seq);
            setClmResultScore(score);
            setClmProgress(null);
            clmTaskIdRef.current = null;
            sessionStorage.removeItem(SESSION_KEY_CLM(rnaType.id));
          } else if (data.status === "failed") {
            const errorMsg = data.error || "";
            const isCancelled = errorMsg.toLowerCase().includes("cancelled") || errorMsg.toLowerCase().includes("cancel");
            if (isCancelled && clmCancelledRef.current) {
              setClmTaskStatus("idle");
              setClmTaskMessage("");
            } else {
              setClmTaskStatus("error");
              setClmTaskMessage(errorMsg || "Task failed");
            }
            setClmProgress(null);
            clmTaskIdRef.current = null;
            sessionStorage.removeItem(SESSION_KEY_CLM(rnaType.id));
          } else {
            if (progressRes) {
              try {
                const pg = await progressRes.json();
                if (pg.nucleotides != null && pg.max_length != null && pg.max_length > 0) {
                  setClmProgress({ nucleotides: pg.nucleotides, max_length: pg.max_length });
                  setClmTaskMessage(`Processing ${pg.nucleotides}/${pg.max_length} nt...`);
                } else {
                  setClmTaskMessage("Processing...");
                }
              } catch {
                setClmTaskMessage("Processing...");
              }
            } else {
              setClmTaskMessage("Processing...");
            }
            clmTimerRef.current = setTimeout(poll, 2000);
          }
        } catch {
          if (!isMountedRef.current) return;
          if (clmTaskIdRef.current === null) return;
          clmTimerRef.current = setTimeout(poll, 2000);
        }
      };

      poll();
    } catch (error) {
      console.error("CLM task error:", error);
      setClmTaskStatus("error");
      const msg = error instanceof Error ? error.message : "Task failed. Please check your connection and try again.";
      setClmTaskMessage(msg);
      sessionStorage.removeItem(SESSION_KEY_CLM(rnaType.id));
    }
  };

  /* ---- GLM stop ---- */
  const handleGlmStop = async () => {
    if (!glmTaskIdRef.current) return;
    const taskId = glmTaskIdRef.current;
    glmTaskIdRef.current = null;
    glmCancelledRef.current = true;
    clearTimeout(glmTimerRef.current || undefined);
    glmTimerRef.current = null;
    setGlmTaskMessage("Cancelling...");
    try {
      await fetch(`/api/task/status/${taskId}`, { method: "POST", headers: { "Content-Type": "application/json" } });
    } catch { /* ignore */ }
    sessionStorage.removeItem(SESSION_KEY_GLM(rnaType.id));
    setTimeout(() => {
      if (glmTaskIdRef.current === null) {
        setGlmTaskStatus("idle");
        setGlmTaskMessage("");
        setGlmProgress(null);
      }
    }, 3000);
  };

  /* ---- GLM run ---- */
  const handleGlmRun = async () => {
    if (glmTaskStatus === "running") return;
    if (!glmSequence.trim() || glmSeqError) return;

    glmCancelledRef.current = false;
    glmResumedRef.current = false;
    setGlmResultSeq("");
    setGlmResultScore(null);
    setGlmProgress(null);
    setGlmTaskStatus("running");
    setGlmTaskMessage("Submitting task...");

    const payload: any = {
      task_type: "infill",
      rna_type: rnaType.id,
      sequence: glmSequence.replace(/<mask>/gi, "[MASK]"),
    };
    if (species) payload.species = species;
    if (taxid) payload.taxid = taxid;
    payload.parameters = { temperature, top_k: topK };

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
      const { task_id } = await res.json();
      glmTaskIdRef.current = task_id;
      setGlmTaskMessage("Task queued, waiting for GPU...");

      sessionStorage.setItem(SESSION_KEY_GLM(rnaType.id), JSON.stringify({
        taskId: task_id,
        sequence: glmSequence,
        temperature,
        topK,
        taxid,
        timestamp: Date.now(),
      }));

      const poll = async () => {
        if (!isMountedRef.current) return;
        if (glmTaskIdRef.current === null) return;

        try {
          const [statusRes, progressRes] = await Promise.all([
            fetch(`/api/task/status/${task_id}`),
            fetch(`/api/task/status/${task_id}/progress`).catch(() => null),
          ]);

          if (!statusRes.ok) {
            glmTimerRef.current = setTimeout(poll, 2000);
            return;
          }

          const data = await statusRes.json();
          if (!isMountedRef.current) return;
          if (glmTaskIdRef.current === null) return;

          if (data.status === "completed") {
            const result = data.result || {};
            let seq = "";
            if (result.sequence) {
              const lines = result.sequence.split("\n");
              seq = lines.length > 1 ? lines.slice(1).join("") : result.sequence;
            }
            let score: number | null = null;
            if (result.score !== undefined) score = result.score;
            else if (result.perplexity !== undefined) score = result.perplexity;
            setGlmTaskStatus("completed");
            setGlmTaskMessage("Task completed");
            setGlmResultSeq(seq);
            setGlmResultScore(score);
            setGlmProgress(null);
            glmTaskIdRef.current = null;
            sessionStorage.removeItem(SESSION_KEY_GLM(rnaType.id));
          } else if (data.status === "failed") {
            const errorMsg = data.error || "";
            if (glmCancelledRef.current) {
              setGlmTaskStatus("idle");
              setGlmTaskMessage("");
            } else {
              setGlmTaskStatus("error");
              setGlmTaskMessage(errorMsg || "Task failed");
            }
            setGlmProgress(null);
            glmTaskIdRef.current = null;
            sessionStorage.removeItem(SESSION_KEY_GLM(rnaType.id));
          } else {
            if (progressRes) {
              try {
                const pg = await progressRes.json();
                if (pg.nucleotides != null && pg.max_length != null && pg.max_length > 0) {
                  setGlmProgress({ nucleotides: pg.nucleotides, max_length: pg.max_length });
                  setGlmTaskMessage(`Processing ${pg.nucleotides}/${pg.max_length} nt...`);
                } else {
                  setGlmTaskMessage("Processing...");
                }
              } catch {
                setGlmTaskMessage("Processing...");
              }
            } else {
              setGlmTaskMessage("Processing...");
            }
            glmTimerRef.current = setTimeout(poll, 2000);
          }
        } catch {
          if (!isMountedRef.current) return;
          if (glmTaskIdRef.current === null) return;
          glmTimerRef.current = setTimeout(poll, 2000);
        }
      };

      poll();
    } catch (error) {
      console.error("GLM task error:", error);
      setGlmTaskStatus("error");
      const msg = error instanceof Error ? error.message : "Task failed. Please check your connection and try again.";
      setGlmTaskMessage(msg);
      sessionStorage.removeItem(SESSION_KEY_GLM(rnaType.id));
    }
  };

  /* ---- species change ---- */
  const handleSpeciesChange = (val: string) => {
    setSpecies(val);
    if (val && SPECIES_TAXID_MAP[val]) {
      setTaxid(SPECIES_TAXID_MAP[val]);
      setTaxidInput(String(SPECIES_TAXID_MAP[val]));
    } else if (val !== "__taxid__") {
      setTaxid(null);
      setTaxidInput("");
    }
  };

  /* ---- copy / download helpers ---- */
  const copyText = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  /* ---- result display helper ---- */
  const ResultCard = ({
    seq, score, status, message, onCopy, onDownload, progressData
  }: {
    seq: string; score: number | null;
    status: "idle" | "running" | "completed" | "error";
    message: string;
    onCopy: () => void; onDownload: () => void;
    progressData?: { nucleotides: number; max_length: number } | null;
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
            {/* Status message with progress bar */}
            {status !== "idle" && (
              <div className={cn(
                "flex flex-col gap-2 p-3 rounded-xl text-sm",
                status === "running" && "bg-blue-50 text-blue-600 border border-blue-200",
                status === "completed" && "bg-green-50 text-green-600 border border-green-200",
                status === "error" && "bg-red-50 text-red-600 border border-red-200"
              )}>
                <div className="flex items-center gap-2">
                  {status === "running" && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
                  {status === "completed" && <Check className="w-4 h-4 flex-shrink-0" />}
                  {status === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{message}</span>
                </div>
                {/* Progress bar during running */}
                {status === "running" && progressData && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (progressData.nucleotides / progressData.max_length) * 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-blue-600 whitespace-nowrap">
                        {progressData.nucleotides}/{progressData.max_length} nt
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Score */}
            {score !== null && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-semibold text-slate-600">Quality Score</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
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
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 max-h-36 overflow-y-auto break-all leading-relaxed">
                  {seq}
                </div>
                <div className="flex gap-2">
                  <button onClick={onCopy} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                    <Copy className="w-4 h-4" />Copy
                  </button>
                  <button onClick={onDownload} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                    <Download className="w-4 h-4" />FASTA
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ---- render ---- */
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ── Tab bar ── */}
      <div className="flex border-b border-slate-200">
        {(["clm", "glm"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors relative",
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                : "text-slate-400 hover:text-slate-600 bg-slate-50"
            )}
          >
            {tab === "clm" ? "De novo Design & Directed Evolution" : "Domain Redesign"}
          </button>
        ))}
      </div>

      {/* ── Tab body ── */}
      <div>
        {activeTab === "clm" && (
        <div className="p-4 space-y-3">

          {/* CLM sub-mode selector */}
          <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => { if (clmTaskStatus !== "running") { setClmMode("clm-generate"); setClmResultSeq(""); setClmResultScore(null); setClmTaskStatus("idle"); setClmProgress(null); }}}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                clmMode === "clm-generate" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Sparkles className="w-3 h-3" /> De novo Design
            </button>
            <button
              onClick={() => { if (clmTaskStatus !== "running") { setClmMode("clm-score"); setClmResultSeq(""); setClmResultScore(null); setClmTaskStatus("idle"); setClmProgress(null); }}}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                clmMode === "clm-score" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <FlaskConical className="w-3 h-3" /> Directed Evolution
            </button>
          </div>

          {/* Sequence input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              {clmMode === "clm-generate" ? "Seed Sequence" : "Input Sequence"}
              {clmMode === "clm-generate" && <span className="ml-1 text-slate-400">(optional)</span>}
            </label>
            <textarea
              ref={textareaRef}
              value={clmSequence}
              onChange={(e) => { setClmSequence(e.target.value); validateClmSeq(e.target.value); }}
              placeholder={clmMode === "clm-generate" ? "Leave blank or enter seed…" : "Enter RNA sequence to score…"}
              rows={3}
              className={cn(
                "w-full p-2.5 rounded-lg border bg-white resize-none focus:outline-none transition-all text-xs font-mono text-slate-700 placeholder:text-slate-300",
                clmSeqError ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              )}
            />
            <div className="flex items-center justify-between mt-0.5">
              <span className={cn("text-xs", clmSeqError ? "text-red-500" : "text-slate-400")}>
                {clmSeqError || `${clmSequence.length.toLocaleString()} / ${MAX_SEQ_LEN.toLocaleString()} nt`}
              </span>
              {clmMode === "clm-generate" && clmSequence.length === 0 && (
                <button onClick={() => { const s = randomSeq(30); setClmSequence(s); }} className="text-xs text-blue-400 hover:text-blue-600 transition-colors flex items-center gap-0.5">
                  <Wand2 className="w-3 h-3" /> Random
                </button>
              )}
            </div>
          </div>

          {/* Species */}
          {speciesList.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Species</label>
              <select
                value={species}
                onChange={(e) => {
                  if (e.target.value === "__taxid__") { setShowTaxidInput(true); setTimeout(() => taxidInputRef.current?.focus(), 100); }
                  else { handleSpeciesChange(e.target.value); setShowTaxidInput(false); }
                }}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-xs text-slate-700"
              >
                <option value="">Auto-detect</option>
                {speciesList.map((s) => (
                  <option key={s} value={s}>{SPECIES_TAXID_MAP[s] ? `${s} (${SPECIES_TAXID_MAP[s]})` : s}</option>
                ))}
                <option disabled />
                <option value="__taxid__">+ Enter TaxID manually</option>
              </select>
            </div>
          )}

          {/* TaxID manual input */}
          {(showTaxidInput || taxid) && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">NCBI TaxID</label>
              <input
                ref={taxidInputRef}
                type="number"
                value={taxidInput}
                onChange={(e) => { const v = e.target.value; setTaxidInput(v); setTaxid(v ? parseInt(v, 10) : null); }}
                placeholder="e.g. 9606"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-xs font-mono text-slate-700"
              />
            </div>
          )}

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Settings2 className="w-3 h-3" />
            Advanced parameters
            <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
          </button>

          {/* Advanced params */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                key="adv-clm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3 pt-1"
              >
                {/* Max length — only for De novo Design */}
                {clmMode === "clm-generate" && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-500">Max Length</label>
                      <span className="text-xs font-mono text-blue-500">{clmMaxLength}</span>
                    </div>
                    <input type="range" min={10} max={MAX_SEQ_LEN} step={10} value={clmMaxLength} onChange={(e) => setClmMaxLength(Number(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                )}
                {/* Temperature */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Temperature</label>
                    <span className="text-xs font-mono text-blue-500">{temperature}</span>
                  </div>
                  <input type="range" min={0.1} max={2.0} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>Conservative</span><span>Creative</span></div>
                </div>
                {/* Top-K */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Top-K</label>
                    <span className="text-xs font-mono text-blue-500">{topK}</span>
                  </div>
                  <input type="range" min={1} max={100} step={1} value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Run / Stop button — toggle based on running state */}
          <button
            onClick={clmTaskStatus === "running" ? handleClmStop : handleClmRun}
            disabled={clmTaskStatus !== "running" && ((clmMode === "clm-score" && !clmSequence.trim()) || !!clmSeqError)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm",
              clmTaskStatus === "running"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {clmTaskStatus === "running" ? (
              <><Square className="w-4 h-4" /> Stop</>
            ) : (
              <><Play className="w-4 h-4" /> {clmMode === "clm-generate" ? "Run De novo Design" : "Run Directed Evolution"}</>
            )}
          </button>

          {/* Result / Status area */}
          <ResultCard
            seq={clmResultSeq} score={clmResultScore}
            status={clmTaskStatus} message={clmTaskMessage}
            onCopy={() => copyText(clmResultSeq, () => {})}
            onDownload={() => downloadFasta(clmResultSeq)}
            progressData={clmProgress}
          />
        </div>
        )}

        {activeTab === "glm" && (
        <div className="p-4 space-y-3">

          {/* Sequence input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Masked Sequence</label>
            <textarea
              value={glmSequence}
              onChange={(e) => { setGlmSequence(e.target.value); validateGlmSeq(e.target.value); }}
              placeholder="Enter sequence with <mask> tokens…\nExample: AUGCUAGC<mask>UAGCUAGC"
              rows={4}
              className={cn(
                "w-full p-2.5 rounded-lg border bg-white resize-none focus:outline-none transition-all text-sm font-mono text-slate-700 placeholder:text-slate-300",
                glmSeqError ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              )}
            />
            <div className="flex items-center justify-between mt-1">
              <span className={cn("text-xs", glmSeqError ? "text-red-500" : "text-slate-400")}>
                {glmSeqError || `${glmSequence.length.toLocaleString()} / ${MAX_SEQ_LEN.toLocaleString()} nt`}
              </span>
              <span className="text-xs text-slate-400">Use &lt;mask&gt; to mark regions</span>
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Settings2 className="w-3 h-3" />
            Advanced settings
            <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                key="adv-glm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Species */}
                {speciesList.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Species</label>
                    <select
                      value={species}
                      onChange={(e) => {
                        if (e.target.value === "__taxid__") { setShowTaxidInput(true); setTimeout(() => taxidInputRef.current?.focus(), 100); }
                        else { handleSpeciesChange(e.target.value); setShowTaxidInput(false); }
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-xs text-slate-700"
                    >
                      <option value="">Auto-detect</option>
                      {speciesList.map((s) => (
                        <option key={s} value={s}>{SPECIES_TAXID_MAP[s] ? `${s} (${SPECIES_TAXID_MAP[s]})` : s}</option>
                      ))}
                      <option disabled />
                      <option value="__taxid__" className="text-indigo-600 font-medium">+ Enter TaxID manually</option>
                    </select>
                  </div>
                )}
                {/* TaxID */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1"><Hash className="w-3 h-3 inline mr-1 text-indigo-500" />NCBI TaxID</label>
                  <input ref={taxidInputRef} type="number" value={taxidInput}
                    onChange={(e) => { const v = e.target.value; setTaxidInput(v); setTaxid(v ? parseInt(v, 10) : null); }}
                    placeholder="e.g. 9606"
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-xs text-slate-700"
                  />
                </div>
                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Temperature</label>
                    <span className="text-xs font-mono text-indigo-500">{temperature}</span>
                  </div>
                  <input type="range" min={0.1} max={2.0} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                {/* Top-K */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Top-K</label>
                    <span className="text-xs font-mono text-indigo-500">{topK}</span>
                  </div>
                  <input type="range" min={1} max={100} step={1} value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Run / Stop button */}
          <button
            onClick={glmTaskStatus === "running" ? handleGlmStop : handleGlmRun}
            disabled={glmTaskStatus !== "running" && (!glmSequence.trim() || !!glmSeqError)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm",
              glmTaskStatus === "running"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            {glmTaskStatus === "running" ? (
              <><Square className="w-4 h-4" /> Stop</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Run Domain Redesign</>
            )}
          </button>

          {/* Result / Status area */}
          <ResultCard
            seq={glmResultSeq} score={glmResultScore}
            status={glmTaskStatus} message={glmTaskMessage}
            onCopy={() => copyText(glmResultSeq, () => {})}
            onDownload={() => downloadFasta(glmResultSeq)}
            progressData={glmProgress}
          />
        </div>
        )}
      </div>
    </div>
  );
}
