"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function OpeningBlackBox() {
  return (
    <section id="opening-blackbox" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Opening the <span className="gradient-text-orange-blue">Black Box</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold text-primary mb-2">Align Neuron with Biological Property</h3>
                <div className="relative aspect-video w-full">
                  <Image
                    src="/designcase/open_black_box_1.png"
                    alt="Bar Chart 1"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center" id='blackbox-2'>
                <h3 className="text-xl font-bold text-primary mb-2">EVA really understands circRNA</h3>
                <div className="flex gap-4 w-full">
                  <div className="relative aspect-video flex-1" style={{ height: '300px', width: '250px' }}>
                    <Image
                      src="/designcase/open_black_box_2.svg"
                      alt="Bar Chart 2"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="relative aspect-video flex-1" style={{ height: '300px', width: '250px' }}>
                    <Image
                      src="/designcase/open_black_box_3.svg"
                      alt="Bar Chart 3"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold text-primary mb-2">EVA really understands mRNA</h3>
              <div className="relative aspect-video w-full" style={{ height: '500px' }}>
                <Image
                  src="/designcase/open_black_box_4.svg"
                  alt="Radar Chart"
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
