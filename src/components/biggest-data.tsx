"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function BiggestData() {
  return (
    <section id="biggest-data" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Biggest <span className="gradient-text-orange-blue">Data</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col gap-6">
            {/* First row: two bar charts */}
            <div className="flex gap-4 items-start">
              <div className="relative aspect-video" style={{ width: '40%', height: '550px', flexShrink: 0, top: '45px' }}>
                <Image
                  src="/designcase/Biggest_data_1.png"
                  alt="Bar Chart 1"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative aspect-video" style={{ width: '60%', height: '530px', flexShrink: 0 }}>
                <Image
                  src="/designcase/Biggest_data_2.png"
                  alt="Bar Chart 2"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Second row: two charts */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-stretch">
              <div className="relative w-full md:w-1/2 h-[420px] md:h-[520px]">
                <Image
                  src="/designcase/Biggest_data_3.png"
                  alt="Radar Chart"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-full md:w-1/2 h-[420px] md:h-[520px]">
                <Image
                  src="/designcase/Biggest_data_4.svg"
                  alt="Comparison Chart"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
