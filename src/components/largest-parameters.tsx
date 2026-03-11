"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function LargestParameters() {
  return (
    <section id="largest-parameters" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Largest <span className="gradient-text-orange-blue">Parameters</span>
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
            {/* First row: title labels */}
            <div className="grid grid-cols-3 gap-4 text-center" style={{ paddingLeft: '50px', paddingRight: '50px' }}>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold">Conditional design</h3>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold">MoE architecture</h3>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold">Controllable design</h3>
              </div>
            </div>

            {/* Second row: largest_params_1 */}
            <div className="flex justify-center" style={{ paddingRight: '0px' }}>
              <Image
                src="/designcase/largest_params_1.svg"
                alt="Largest Parameters Overview"
                width={820}
                height={280}
                style={{ width: '80%', height: 'auto' }}
                className="object-contain"
              />
            </div>

            {/* Second row: largest_params_2 and largest_params_3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold">Scaling</h3>
                <div className="relative aspect-video w-full">
                  <Image
                    src="/designcase/largest_params_2.svg"
                    alt="Parameters Detail 1"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold">Long-context window<br />Consistent performance</h3>
                <div className="relative aspect-video w-full">
                  <Image
                    src="/designcase/largest_params_3.svg"
                    alt="Parameters Detail 2"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
