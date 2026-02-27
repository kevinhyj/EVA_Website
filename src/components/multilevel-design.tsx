"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function MultiLevelDesign() {
  return (
    <section id="multilevel-design" className="py-20">
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
              Multi-level <span className="gradient-text-orange-blue">Conditional Design</span>
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
            {/* 2x2 Grid of images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center" style={{ height: '320px', marginLeft: '20px', marginRight: '20px', paddingBottom: '30px' }}>
                <div className="w-full h-full aspect-video relative mb-2">
                  <Image
                    src="/designcase/multi_level_1.svg"
                    alt="RNA types"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold">Generation conditioned on RNA types</h3>
              </div>
              <div className="flex flex-col items-center" style={{ height: '320px', marginLeft: '20px', marginRight: '20px', paddingBottom: '30px' }}>
                <div className="w-full h-full aspect-video relative mb-2">
                  <Image
                    src="/designcase/multi_level_2.svg"
                    alt="Species"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold">Generation conditioned on Species</h3>
              </div>
              <div className="flex flex-col items-center" style={{ width: '660px', height: '500px', marginLeft: '20px', marginRight: '20px' }}>
                <div className="w-full h-full aspect-video relative mb-2">
                  <Image
                    src="/designcase/multi_level_3.svg"
                    alt="Multi-level 1"
                    width={660}
                    height={500}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center" style={{ width: '660px', height: '500px', marginLeft: '20px', marginRight: '20px' }}>
                <div className="w-full h-full aspect-video relative mb-2">
                  <Image
                    src="/designcase/multi_level_4.svg"
                    alt="Multi-level 2"
                    width={660}
                    height={500}
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
