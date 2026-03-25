"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function ZeroShotPrediction() {
  return (
    <section id="zeroshot-prediction" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex-1 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zero-shot <span className="gradient-text-orange-blue">Fitness Prediction</span>
            </h2>
          </div>
          <a href="#" className="text-blue-500 hover:underline mr-4">More</a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col gap-8">
            {/* SOTA comparisons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-full aspect-video relative mb-4">
                  <Image
                    src="/designcase/zero_shot_fitness_ncrna.svg"
                    alt="SOTA in ncRNA"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-primary">SOTA in ncRNA</h3>
                <p className="text-muted-foreground text-center">Non-coding RNA fitness prediction</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full aspect-video relative mb-4">
                  <Image
                    src="/designcase/zero_shot_fitness_mrna.svg"
                    alt="SOTA in mRNA"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-primary">SOTA in mRNA</h3>
                <p className="text-muted-foreground text-center">Messenger RNA fitness prediction</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
