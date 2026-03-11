"use client";

import { motion, px } from "framer-motion";
import Image from "next/image";
import React, { useRef, useState } from "react";

const teamMembers = [
  {
    name: "Yanjie Huang",
    image: "/imgs/yanjiehuang.jpg",
  },
  {
    name: "Guangye Lv",
    image: "/imgs/guangyelv.jpg",
  },
  {
    name: "Anyue Cheng",
    image: "/imgs/anyuecheng.jpg",
  },
  {
    name: "Wei Xie",
    image: "/imgs/weixie.jpg",
  },
  {
    name: "Mengyan Chen",
    image: "/imgs/mengyanchen.png",
  },
  {
    name: "Xinyi Ma",
    image: "/imgs/xinyima.jpg",
  },
  {
    name: "Yijun Huang",
    image: "/imgs/yijunhuang.jpg",
  },
  {
    name: "Qingya Shi",
    image: "/imgs/qingyashi.jpg",
  },
  {
    name: "Yunpeng Xia",
    image: "/imgs/yunpengxia.jpg",
  },
  {
    name: "Yifang Cai",
    image: "/imgs/yifangcai.jpg",
  },
  {
    name: "Zining Wang",
    image: "/imgs/ziningwang.jpg",
  },
  {
    name: "Lu Zhao",
    image: "/imgs/luzhao.jpg",
  },
  {
    name: "Yueyang Tang",
    image: "/imgs/yueyangtang.jpg",
  },
  {
    name: "Shuangjia Zheng",
    image: "/imgs/shuangjiazheng.jpg",
  },
];

export function Team() {
  return (
    <section id="team" className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] bg-primary/8 blur-3xl -z-10" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-20"
        >
          <div className="flex-1 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text-orange-blue">Acknowlegement</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Authors
            </p>
          </div>
          {/* <div className="flex gap-4">
            <Image
              src="/imgs/school_xijiaoda.jpg"
              alt="Xi'an Jiaotong University"
              width={80}
              height={80}
              className="object-contain"
            />
            <Image
              src="/imgs/school_fudan.png"
              alt="Fudan University"
              width={80}
              height={80}
              className="object-contain"
            />
          </div> */}
        </motion.div>

        <div
          className="justify-center gap-4"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 120px)', justifyContent: 'center' }}
        >
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex flex-col items-center"
              style={{ width: '120px', minWidth: '120px', minHeight: '150px' }}
            >
              <div className="relative overflow-hidden rounded-full" style={{ width: '120px', height: '120px' }}>
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={120}
                    height={150}
                    className="w-[120px] h-[150px] object-fill object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/12 to-secondary/12 text-sm font-bold gradient-text-orange-blue">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 text-center">{member.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
