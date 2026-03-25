"use client";

import { motion } from "framer-motion";
import { BarChart3, ZoomIn } from "lucide-react";
import Image from "next/image";
import type { RNAType } from "@/data/rnaTypes";
import { useState } from "react";

interface Props {
  rnaType: RNAType;
}

export function VisualizationsShowcase({ rnaType }: Props) {
  const visualizations = rnaType.visualizations ?? [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (visualizations.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Visualizations */}
      <div className="grid grid-cols-1 gap-4">
        {visualizations.map((viz, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-blue-50 bg-gradient-to-r from-blue-50/60 to-slate-50 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100/70">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">{viz.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{viz.description}</p>
              </div>
            </div>

            {/* Image */}
            <div className="relative p-4 bg-slate-50/50">
              <div
                className="relative w-full rounded-lg overflow-hidden bg-white border border-slate-100 cursor-pointer group"
                onClick={() => setSelectedImage(viz.imagePath)}
              >
                <Image
                  src={viz.imagePath}
                  alt={viz.imageAlt}
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  priority={i === 0}
                />
                {/* Zoom overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
                    <ZoomIn className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-5xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors text-xs font-medium tracking-wide"
            >
              Close
            </button>
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={selectedImage}
                alt="Enlarged visualization"
                width={1600}
                height={1000}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
