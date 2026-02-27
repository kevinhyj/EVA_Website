"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Settings,
  Dna,
  BarChart3,
  Box,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading";

const rnaTypes = ["circRNA", "tRNA", "mRNA", "lncRNA"];
const speciesList = [
  "Homo sapiens",
  "Mus musculus",
  "Escherichia coli",
  "Saccharomyces cerevisiae",
  "Arabidopsis thaliana",
];

const metrics = [
  { name: "MFE", value: -15.8, unit: "kcal/mol", status: "good" },
  { name: "CAI", value: 0.92, unit: "", status: "good" },
  { name: "GC Content", value: 52.3, unit: "%", status: "neutral" },
  { name: "Stability Score", value: 0.87, unit: "", status: "good" },
];

export default function DesignPage() {
  const [sequence, setSequence] = useState("");
  const [rnaType, setRnaType] = useState("mRNA");
  const [species, setSpecies] = useState("Homo sapiens");
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("structure");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleGenerate = async () => {
    if (!sequence.trim()) return;
    setIsGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            RNA <span className="gradient-text-orange-blue">Design Server</span>
          </h1>
          <p className="text-muted-foreground">
            Generate and optimize RNA sequences with our state-of-the-art AI
            model.
          </p>
        </motion.div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* RNA Sequence Input */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Input Sequence</h2>
              </div>
              <textarea
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                placeholder="Enter your RNA sequence or prompt here...&#10;Example: Generate a stable mRNA sequence for protein expression"
                className="w-full h-40 p-4 rounded-xl bg-muted/30 border border-border resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>{sequence.length} characters</span>
                <span>A, U, G, C</span>
              </div>
            </div>

            {/* Configuration */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Configuration</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* RNA Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    RNA Type
                  </label>
                  <select
                    value={rnaType}
                    onChange={(e) => setRnaType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {rnaTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Species */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Species
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {speciesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Temperature</label>
                  <span className="text-sm text-primary">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Top-K Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Top-K</label>
                  <span className="text-sm text-primary">{topK}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Advanced Settings
                {advancedOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {advancedOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Min Length
                      </label>
                      <input
                        type="number"
                        defaultValue="50"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Length
                      </label>
                      <input
                        type="number"
                        defaultValue="5000"
                        className="w-full p-3 rounded-xl bg-muted/30 border border-border focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !sequence.trim()}
              className={cn(
                "w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                isGenerating || !sequence.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary text-white glow-orange"
              )}
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="w-5 h-5" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Generate RNA
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Right Panel - Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("structure")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                    activeTab === "structure"
                      ? "text-primary bg-primary/10 border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Box className="w-4 h-4" />
                  3D Structure
                </button>
                <button
                  onClick={() => setActiveTab("metrics")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                    activeTab === "metrics"
                      ? "text-primary bg-primary/10 border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  Metrics
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "structure" ? (
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder for 3D Viewer */}
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Dna className="w-16 h-16 text-primary/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        3D Structure Visualization
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generate a sequence to view structure
                      </p>
                    </div>

                    {/* Animated background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 rounded-full bg-primary/20"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [0, -50, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {metrics.map((metric, i) => (
                      <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {metric.name}
                          </span>
                          <span
                            className={cn(
                              "text-sm px-2 py-1 rounded-full",
                              metric.status === "good"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            )}
                          >
                            {metric.status === "good" ? "Optimal" : "Normal"}
                          </span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold gradient-text-orange-blue">
                            {metric.value}
                          </span>
                          <span className="text-sm text-muted-foreground mb-1">
                            {metric.unit}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                            className={cn(
                              "h-full rounded-full",
                              metric.status === "good"
                                ? "bg-gradient-to-r from-primary to-secondary"
                                : "bg-gradient-to-r from-yellow-500 to-orange-500"
                            )}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Output Preview */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Generated Sequence</h2>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border font-mono text-sm max-h-40 overflow-y-auto">
                {sequence ? (
                  <pre className="whitespace-pre-wrap break-all">
                    {sequence}
                  </pre>
                ) : (
                  <span className="text-muted-foreground">
                    Enter a sequence or prompt to generate...
                  </span>
                )}
              </div>
              {sequence && (
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted/50 hover:bg-muted transition-colors">
                    Copy Sequence
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted/50 hover:bg-muted transition-colors">
                    Download FASTA
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
