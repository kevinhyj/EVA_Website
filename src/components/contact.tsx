"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text-orange-blue">Contact</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col gap-8">
            {/* Social Media */}
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground mb-2">whatsapp</span>
                <div className="relative aspect-video flex-1" style={{ height: '500px', width: '500px' }}>
                  <Image
                    src="/imgs/whatsapp.jpg"
                    alt="whatsapp"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground mb-2">WeChat</span>
                <div className="relative aspect-video flex-1" style={{ height: '500px', width: '500px' }}>
                  <Image
                    src="/imgs/wechat.jpg"
                    alt="wechat"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground mb-2">xhs</span>
                <div className="relative aspect-video flex-1" style={{ height: '500px', width: '500px' }}>
                  <Image
                    src="/imgs/redbook.jpg"
                    alt="xhs"
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
