"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Trophy,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import type { RNAType } from "@/data/rnaTypes";

interface Props {
  rnaType: RNAType;
  onTryExample: (sequence: string, species: string) => void;
}

export function ExamplesShowcase({ rnaType, onTryExample }: Props) {
  const examples = rnaType.examples ?? [];
  const achievements = rnaType.achievements ?? [];

  if (examples.length === 0 && achievements.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* ───────── Section Header ───────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Research <span className="gradient-text-orange-blue">Highlights</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Published examples and benchmark results for {rnaType.id} design.
        </p>
      </div>

      {/* ───────── Examples ───────── */}
      {examples.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Paper Examples</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {examples.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                className="group glass-card rounded-2xl p-5 flex flex-col hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10 flex flex-col flex-1">
                  <h4 className="text-sm font-semibold mb-1.5">{ex.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {ex.description}
                  </p>

                  {/* Sequence preview */}
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border font-mono text-[10px] leading-relaxed break-all mb-3 max-h-16 overflow-hidden relative">
                    {ex.sequence}
                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 mt-auto">
                    <span
                      className="px-2 py-0.5 rounded-full border text-[10px]"
                      style={{ borderColor: `${rnaType.col}40`, color: rnaType.col }}
                    >
                      {ex.species}
                    </span>
                    <span className="truncate">{ex.source}</span>
                  </div>

                  {/* Try it button */}
                  <button
                    onClick={() => onTryExample(ex.sequence, ex.species)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-primary/15 to-secondary/15 hover:from-primary/25 hover:to-secondary/25 text-primary transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Try this example
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ───────── Achievements ───────── */}
      {achievements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold">Benchmark Results</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {achievements.map((ach, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="text-xs text-muted-foreground mb-1">{ach.metric}</div>
                <div className="text-2xl font-bold gradient-text-orange-blue mb-1">
                  {ach.value}
                </div>
                <h4 className="text-sm font-semibold mb-1">{ach.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {ach.description}
                </p>
                {ach.paper && (
                  <a
                    href={ach.paper}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View paper
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
