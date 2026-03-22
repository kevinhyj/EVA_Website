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
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">
          Research <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Visualizations</span>
        </h2>
        <p className="text-sm text-gray-600">
          Detailed analysis and performance metrics for {rnaType.name}.
        </p>
      </div>

      {/* Visualizations Grid */}
      <div className="space-y-6">
        {visualizations.map((viz, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{viz.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{viz.description}</p>
                </div>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative bg-white p-6">
              <div
                className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer group"
                onClick={() => setSelectedImage(viz.imagePath)}
              >
                <Image
                  src={viz.imagePath}
                  alt={viz.imageAlt}
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority={i === 0}
                />
                {/* Zoom overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <ZoomIn className="w-6 h-6 text-gray-900" />
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-sm font-medium"
            >
              Close (ESC)
            </button>
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={selectedImage}
                alt="Enlarged visualization"
                width={1600}
                height={1200}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
