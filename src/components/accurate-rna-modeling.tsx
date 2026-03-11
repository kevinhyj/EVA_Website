"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function AccurateRnaModeling() {
  return (
    <section id="accurate-rna-modeling" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Accurate <span className="gradient-text-orange-blue">RNA Modeling</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="grid text-center" >
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold">10x Higher Accuracy Than Ever Before</h3>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold">&nbsp;</h3>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold">At Both Sequence and Structure Level</h3>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-stretch">
            <div className="relative w-full md:w-1/2 h-[320px] md:h-[420px]">
              <Image
                src="/designcase/accurate_rna_1.svg"
                alt="Accurate RNA Modeling 1"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative w-full md:w-1/2 h-[320px] md:h-[420px]">
              <Image
                src="/designcase/accurate_rna_2.svg"
                alt="Accurate RNA Modeling 2"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
