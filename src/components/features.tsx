"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Circle,
  Dna,
  FileType,
  FlaskConical,
  Zap,
  Globe,
  Brain,
  Layers,
} from "lucide-react";
import { RNA_TYPES, type RNAType } from '@/data/rnaTypes';

const features11 = [
  {
    icon: Circle,
    title: "circRNA",
    id: "circRNA",
    description:
      "Circular RNA generation with enhanced stability for therapeutic applications.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Dna,
    title: "tRNA",
    id: "tRNA",
    description:
      "Transfer RNA design optimized for codon usage and translation efficiency.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileType,
    title: "mRNA",
    id: "mRNA",
    description:
      "Messenger RNA sequences with improved stability and translation for vaccines.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: FlaskConical,
    title: "lncRNA",
    id: "lncRNA",
    description:
      "Long non-coding RNA generation for regulatory function prediction.",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive{" "}
            <span className="gradient-text-orange-blue">RNA Design</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Support for all major RNA types with state-of-the-art generation
            capabilities powered by our revolutionary MoE architecture.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {RNA_TYPES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
            >
              <Link href={`/rna/${feature.id}`} className="block h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="glass-card rounded-2xl p-6 relative h-full hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4`}
                    style={{ background: `linear-gradient(to bottom right, ${feature.col}, ${feature.col}dd)` }}
                  >
                    <Dna className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.id}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
