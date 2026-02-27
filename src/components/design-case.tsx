"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const mranData = [
  {
    name: 'HIV', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
  {
    name: 'linear_mrna', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
  {
    name: 'vzv', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
  {
    name: 'RABV', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
];

const circData = [
  {
    name: 'sars1', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
  {
    name: 't41', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
  {
    name: 'rabv', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
  {
    name: 'quliang', datas: [
      {
        name: 'EVA', value: [
          { mfe: 1160.5, cai: 0.8451 },
          { mfe: 1161.5, cai: 0.8551 },
          { mfe: 1162.5, cai: 0.8651 },
          { mfe: 1163.5, cai: 0.8751 },
          { mfe: 1164.5, cai: 0.8851 },
          { mfe: 1165.5, cai: 0.8451 },
          { mfe: 1166.5, cai: 0.8351 },
          { mfe: 1167.5, cai: 0.8251 },
        ]
      },
      {
        name: 'EVA-Nolineage', value: [
          { mfe: 1160.5, cai: 0.7451 },
          { mfe: 1161.5, cai: 0.7551 },
          { mfe: 1162.5, cai: 0.7651 },
          { mfe: 1163.5, cai: 0.7751 },
          { mfe: 1164.5, cai: 0.7851 },
          { mfe: 1165.5, cai: 0.7451 },
          { mfe: 1166.5, cai: 0.7351 },
          { mfe: 1167.5, cai: 0.7251 },
        ]
      },
      {
        name: 'Evo2-1B', value: [
          { mfe: 1160.5, cai: 0.8421 },
          { mfe: 1161.5, cai: 0.8521 },
          { mfe: 1162.5, cai: 0.8621 },
          { mfe: 1163.5, cai: 0.8721 },
          { mfe: 1164.5, cai: 0.8821 },
          { mfe: 1165.5, cai: 0.8421 },
          { mfe: 1166.5, cai: 0.8321 },
          { mfe: 1167.5, cai: 0.8221 },
        ]
      },
      {
        name: 'CodonFM-1B', value: [
          { mfe: 1160.5, cai: 0.7431 },
          { mfe: 1161.5, cai: 0.7531 },
          { mfe: 1162.5, cai: 0.7631 },
          { mfe: 1163.5, cai: 0.7731 },
          { mfe: 1164.5, cai: 0.7831 },
          { mfe: 1165.5, cai: 0.7431 },
          { mfe: 1166.5, cai: 0.7331 },
          { mfe: 1167.5, cai: 0.7231 },
        ]
      },
      {
        name: 'Random', value: [
          { mfe: 1160.5, cai: 0.6451 },
          { mfe: 1161.5, cai: 0.6551 },
          { mfe: 1162.5, cai: 0.6651 },
          { mfe: 1163.5, cai: 0.6751 },
          { mfe: 1164.5, cai: 0.6851 },
          { mfe: 1165.5, cai: 0.6451 },
          { mfe: 1166.5, cai: 0.6351 },
          { mfe: 1167.5, cai: 0.6251 },
        ]
      },
    ]
  },
];

const colors = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#64748b'];

interface MiniChartProps {
  data: typeof mranData[0]['datas'];
  title: string;
}

function MiniChart({ data, title }: MiniChartProps) {
  const chartData = data[0].value.map((_, idx) => {
    const point: Record<string, number | string> = { index: idx };
    data.forEach((d) => {
      point[d.name] = d.value[idx].cai;
    });
    return point;
  });

  return (
    <div className="flex flex-col items-center border border-gray-200 rounded p-1">
      <h4 className="text-xs font-semibold mb-1 text-center text-primary">{title}</h4>
      <div className="w-full h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="index" tick={{ fontSize: 8 }} interval={3} />
            <YAxis domain={[0.5, 1]} tick={{ fontSize: 8 }} width={25} />
            {data.map((d, idx) => (
              <Line
                key={d.name}
                type="monotone"
                dataKey={d.name}
                stroke={colors[idx]}
                strokeWidth={1.5}
                dot={{ r: 1 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DesignCase() {
  const [activeTab, setActiveTab] = useState<'linear' | 'circular'>('linear');

  const currentData = activeTab === 'linear' ? mranData : circData;

  const handlePrev = () => {
    setActiveTab('linear');
  };

  const handleNext = () => {
    setActiveTab('circular');
  };

  return (
    <section id="design-case" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Design <span className="gradient-text-orange-blue">Case</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Showcase of RNA design capabilities across different applications, demonstrating the versatility of our platform in various research domains.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8 relative"
          style={{ height: '600px' }}
        >
          {/* CRISPR - 居中，宽度占比较大 */}
          <div className="absolute left-2/5 top-6 transform -translate-x-1/2 -translate-y-0" style={{ width: '60%', height: '60%' }}>
            <div className="relative w-full h-full">
              <Image
                src="/designcase/CRISPR.svg"
                alt="CRISPR-Cas De novo Design"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-center mt-2">CRISPR-Cas De novo Design</h3>
          </div>

          {/* 右上角数据折线图 - 带Tab切换 */}
          <div className="absolute right-6 top-8" style={{ width: '35%', height: '40%' }}>
            <div className="flex flex-col h-full">
              {/* 箭头切换 */}
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={handlePrev}
                  disabled={activeTab === 'linear'}
                  className={`p-1 rounded transition-colors ${activeTab === 'linear'
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-muted'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <span className="text-sm font-semibold">
                  {activeTab === 'linear' ? 'Linear mRNA' : 'Circular RNA'} vaccine optimization
                </span>
                <button
                  onClick={handleNext}
                  disabled={activeTab === 'circular'}
                  className={`p-1 rounded transition-colors ${activeTab === 'circular'
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:bg-muted'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              {/* 4个图表 - 2x2 网格 */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {currentData.slice(0, 4).map((item, idx) => (
                  <MiniChart key={item.name} data={item.datas} title={item.name} />
                ))}
              </div>
            </div>
          </div>

          {/* tRNA - 左下角 */}
          <div className="absolute left-6 bottom-16" style={{ width: '50%', height: '20%' }}>
            <div className="relative w-full h-full">
              <Image
                src="/designcase/trna.svg"
                alt="tRNA De novo Design"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-center mt-2">tRNA De novo Design</h3>
          </div>

          {/* RNA-aptamer - 右下角 */}
          <div className="absolute right-6 bottom-6" style={{ width: '50%', height: '20%' }}>
            <div className="relative w-full h-[95%]">
              <Image
                src="/designcase/rnaAptamer.svg"
                alt="RNA-aptamer De novo Design"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-center mt-2">RNA-aptamer De novo Design</h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
