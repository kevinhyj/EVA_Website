"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const METHODS_ORDER = ['EVA', 'EVA-Nolineage', 'Evo2-1B', 'CodonFM-1B', 'Random'] as const;
type MethodName = typeof METHODS_ORDER[number];
type Point = { mfe: number; cai: number };
type MethodSeries = { name: MethodName; value: Point[] };
type CaseData = { name: string; datas: MethodSeries[] };

const SECTION_LABELS: Record<string, string> = {
  mran_HIV: 'HIV',
  mran_linear_mrna: 'linear_mrna',
  mran_vzv: 'vzv',
  mran_RABV: 'RABV',
  circ_sars1: 'sars1',
  circ_t41: 't41',
  circ_rabv: 'rabv',
  circ_quliang: 'quliang',
};

const MRAN_ORDER = ['mran_HIV', 'mran_linear_mrna', 'mran_vzv', 'mran_RABV'];
const CIRC_ORDER = ['circ_sars1', 'circ_t41', 'circ_rabv', 'circ_quliang'];
const SAMPLE_INTERVAL = 20;
const DESIGN_TABS = ['designcase_1', 'designcase_2', 'designcase_3', 'designcase_4', 'designcase_5'] as const;

function samplePoints<T>(points: T[], interval: number): T[] {
  if (points.length <= 2) return points;
  const sampled: T[] = [points[0]];
  for (let i = interval; i < points.length - 1; i += interval) {
    sampled.push(points[i]);
  }
  if (sampled[sampled.length - 1] !== points[points.length - 1]) {
    sampled.push(points[points.length - 1]);
  }
  return sampled;
}

function parseDesignCaseText(text: string): { mranData: CaseData[]; circData: CaseData[] } {
  const sections: Record<string, Record<string, number[][]>> = {};
  const re = /\[(.+?)\]\r?\n([\s\S]*?)(?=\r?\n\[|\s*$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const key = match[1].trim();
    const jsonText = match[2].trim();
    if (!jsonText) continue;
    try {
      const parsed = JSON.parse(jsonText) as Record<string, number[][]>;
      sections[key] = parsed;
    } catch {
      // ignore malformed blocks
    }
  }

  const buildCase = (key: string): CaseData | null => {
    const raw = sections[key];
    if (!raw) return null;
    const label = SECTION_LABELS[key] ?? key;
    const lengths = METHODS_ORDER
      .map((m) => (raw[m] ? raw[m].length : 0))
      .filter((n) => n > 0);
    if (lengths.length === 0) return null;
    const minLen = Math.min(...lengths);
    const datas: MethodSeries[] = METHODS_ORDER
      .map((m) => {
        const pts = raw[m] || [];
        const trimmed = pts.slice(0, minLen).map((p) => ({ mfe: p[1], cai: p[2] }));
        return { name: m, value: trimmed };
      })
      .filter((d) => d.value.length > 0);
    return { name: label, datas };
  };

  const mranData = MRAN_ORDER
    .map((k) => buildCase(k))
    .filter((v): v is CaseData => v !== null);
  const circData = CIRC_ORDER
    .map((k) => buildCase(k))
    .filter((v): v is CaseData => v !== null);

  return { mranData, circData };
}

const COLORS: Record<MethodName, string> = {
  EVA: '#FF6600',
  'EVA-Nolineage': '#F4A261',
  'Evo2-1B': '#C5E8F7',
  'CodonFM-1B': '#96E3BD',
  Random: '#E8E8E8',
};

interface MiniChartProps {
  data: MethodSeries[];
  title: string;
  resetKey: string;
  showStarOnLastPoint?: boolean;
}

function StarDot(props: any) {
  const { cx, cy, stroke, index, points, seriesName } = props;
  if (index !== points.length - 1) return null;
  if (seriesName !== 'EVA' && seriesName !== 'EVA-Nolineage') return null;

  const size = 12;
  const starPath = (cx: number, cy: number, size: number) => {
    const outerRadius = size;
    const innerRadius = size * 0.4;
    let path = '';
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const innerAngle = (Math.PI * 2 * (i + 0.5)) / 5 - Math.PI / 2;
      const outerX = cx + Math.cos(outerAngle) * outerRadius;
      const outerY = cy + Math.sin(outerAngle) * outerRadius;
      const innerX = cx + Math.cos(innerAngle) * innerRadius;
      const innerY = cy + Math.sin(innerAngle) * innerRadius;
      if (i === 0) {
        path += `M ${outerX} ${outerY} `;
      } else {
        path += `L ${outerX} ${outerY} `;
      }
      path += `L ${innerX} ${innerY} `;
    }
    path += 'Z';
    return path;
  };

  return (
    <path
      d={starPath(cx, cy, size)}
      fill={stroke}
      stroke={stroke}
      strokeWidth={1}
    />
  );
}

function MiniChart({ data, title, resetKey, showStarOnLastPoint = false }: MiniChartProps) {
  const seriesData = useMemo(() => {
    return data.map((d) => ({
      name: d.name,
      points: samplePoints(
        d.value.map((p) => ({ cai: p.cai, mfe: p.mfe })),
        SAMPLE_INTERVAL
      ).sort((a, b) => b.mfe - a.mfe),
    }));
  }, [data]);
  const hasData = seriesData.length > 0 && seriesData.some((s) => s.points.length > 0);

  const maxLen = Math.max(...seriesData.map((s) => s.points.length), 0);
  const axisDomain = useMemo(() => {
    let minCai = Infinity;
    let maxCai = -Infinity;
    let minMfe = Infinity;
    let maxMfe = -Infinity;
    seriesData.forEach((s) => {
      s.points.forEach((p) => {
        if (p.cai < minCai) minCai = p.cai;
        if (p.cai > maxCai) maxCai = p.cai;
        if (p.mfe < minMfe) minMfe = p.mfe;
        if (p.mfe > maxMfe) maxMfe = p.mfe;
      });
    });
    if (!Number.isFinite(minCai)) return null;

    // Round CAI to 0.25 multiples
    const roundedMinCai = Math.floor(minCai / 0.025) * 0.025;
    const roundedMaxCai = Math.ceil(maxCai / 0.025) * 0.025;

    // Round MFE to 100 multiples
    const roundedMinMfe = Math.floor(minMfe / 100) * 100;
    const roundedMaxMfe = Math.ceil(maxMfe / 100) * 100;

    return {
      minCai: roundedMinCai,
      maxCai: roundedMaxCai,
      minMfe: roundedMinMfe,
      maxMfe: roundedMaxMfe
    };
  }, [seriesData]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!hasData) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount(1);
    if (maxLen === 0) return;
    if (maxLen <= 1) return;

    const duration = maxLen * 100;
    const tickMs = 50;
    const start = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / 1500, 1);
      const nextCount = Math.max(1, Math.ceil(progress * maxLen));
      setVisibleCount((prev) => (prev === nextCount ? prev : nextCount));
      if (progress < 1) {
        return;
      }
      window.clearInterval(intervalId);
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [hasData, maxLen, resetKey]);

  const visibleSeriesData = useMemo(
    () => seriesData.map((series) => ({ ...series, visiblePoints: series.points.slice(0, visibleCount) })),
    [seriesData, visibleCount]
  );

  if (!hasData) {
    return (
      <div className="flex flex-col items-center border border-gray-200 rounded p-1">
        <h4 className="text-xs font-semibold mb-1 text-center text-primary">{title}</h4>
        <div className="w-full h-[300px] flex items-center justify-center text-xs text-muted-foreground">
          No data
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center border border-gray-200 rounded p-1">
      <h4 className="text-xs font-semibold mb-1 text-center text-primary">{title}</h4>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[]} margin={{ top: 5, right: 5, bottom: 25, left: 10 }}>
            <CartesianGrid stroke="#D3D3D3" strokeWidth={0.8} />
            <XAxis
              type="number"
              dataKey="cai"
              label={{ value: 'CAI', position: 'insideBottom', offset: -1, fontSize: 10 }}
              tick={{ fontSize: 8 }}
              axisLine={{ strokeWidth: 2.5 }}
              tickLine={{ strokeWidth: 1.5 }}
              tickFormatter={(value) => value.toFixed(3)}
              domain={
                axisDomain
                  ? [axisDomain.minCai, axisDomain.maxCai]
                  : ['dataMin', 'dataMax']
              }
            />
            <YAxis
              type="number"
              dataKey="mfe"
              label={{ value: 'MFE', angle: -90, position: 'insideLeft', fontSize: 10, offset: -5 }}
              tick={{ fontSize: 8 }}
              axisLine={{ strokeWidth: 2.5 }}
              tickLine={{ strokeWidth: 1.5 }}
              width={32}
              tickFormatter={(value) => Math.round(value).toString()}
              domain={
                axisDomain
                  ? [axisDomain.minMfe, axisDomain.maxMfe]
                  : ['dataMin', 'dataMax']
              }
            />
            {showStarOnLastPoint && <Legend wrapperStyle={{ fontSize: '10px' }} iconType="line" />}
            {visibleSeriesData.map((series) => (
              <Line
                key={series.name}
                name={series.name}
                data={series.visiblePoints}
                type="linear"
                dataKey="mfe"
                stroke={COLORS[series.name]}
                strokeWidth={4.5}
                strokeOpacity={0.9}
                dot={showStarOnLastPoint ? (props) => <StarDot {...props} points={series.visiblePoints} seriesName={series.name} /> : false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DesignCase() {
  const [activeDesignTab, setActiveDesignTab] = useState<'designcase_1' | 'designcase_2' | 'designcase_3' | 'designcase_4' | 'designcase_5'>('designcase_1');
  const [mranData, setMranData] = useState<CaseData[]>([]);
  const [circData, setCircData] = useState<CaseData[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/design_case_data.txt')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const parsed = parseDesignCaseText(text);
        setMranData(parsed.mranData);
        setCircData(parsed.circData);
      })
      .catch((err) => {
        if (cancelled) return;
        setDataError(err instanceof Error ? err.message : 'Failed to load data');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDesignTab((current) => {
        const idx = DESIGN_TABS.indexOf(current);
        const nextIdx = (idx + 1) % DESIGN_TABS.length;
        return DESIGN_TABS[nextIdx];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDesignPrev = () => {
    const idx = DESIGN_TABS.indexOf(activeDesignTab);
    const nextIdx = (idx - 1 + DESIGN_TABS.length) % DESIGN_TABS.length;
    setActiveDesignTab(DESIGN_TABS[nextIdx]);
  };

  const handleDesignNext = () => {
    const idx = DESIGN_TABS.indexOf(activeDesignTab);
    const nextIdx = (idx + 1) % DESIGN_TABS.length;
    setActiveDesignTab(DESIGN_TABS[nextIdx]);
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8 relative"
          style={{ height: '800px' }}
        >
          <div className="absolute inset-y-0 left-[-2px] right-[-2px] flex items-center justify-between pointer-events-none">
            <button
              onClick={handleDesignPrev}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10 border-2 border-black"
              aria-label="Previous design"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={handleDesignNext}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10 border-2 border-black"
              aria-label="Next design"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="w-full h-full flex flex-col px-14">
            <h3 className="text-2xl md:text-2xl font-semibold text-center mb-4">
              {activeDesignTab === 'designcase_1' && 'CRISPR-Cas De novo Design'}
              {activeDesignTab === 'designcase_2' && 'tRNA De novo Design'}
              {activeDesignTab === 'designcase_3' && 'RNA-aptamer De novo Design'}
              {activeDesignTab === 'designcase_4' && 'mRNA Vaccine Optimization'}
              {activeDesignTab === 'designcase_5' && 'Circular RNA Vaccine Optimization'}
            </h3>
            <div className="relative w-full flex-1">
              {activeDesignTab === 'designcase_1' && (
                <Image
                  src="/designcase/designcase_1.svg"
                  alt="CRISPR-Cas De novo Design"
                  fill
                  sizes="(min-width: 1024px) 70vw, 90vw"
                  className="object-contain"
                />
              )}
              {activeDesignTab === 'designcase_2' && (
                <Image
                  src="/designcase/designcase_2.svg"
                  alt="tRNA De novo Design"
                  fill
                  sizes="(min-width: 1024px) 70vw, 90vw"
                  className="object-contain"
                />
              )}
              {activeDesignTab === 'designcase_3' && (
                <Image
                  src="/designcase/designcase_3.svg"
                  alt="RNA-aptamer De novo Design"
                  fill
                  sizes="(min-width: 1024px) 70vw, 90vw"
                  className="object-contain"
                />
              )}
              {activeDesignTab === 'designcase_4' && (
                <div className="w-full h-full flex items-center">
                  <div className="grid grid-cols-2 gap-3 w-full h-full">
                    {mranData.slice(0, 4).map((item) => (
                      <MiniChart
                        key={`${activeDesignTab}-${item.name}`}
                        data={item.datas}
                        title={item.name}
                        resetKey={activeDesignTab}
                        showStarOnLastPoint={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              {activeDesignTab === 'designcase_5' && (
                <div className="w-full h-full flex items-center">
                  <div className="grid grid-cols-2 gap-3 w-full h-full">
                    {circData.slice(0, 4).map((item) => (
                      <MiniChart
                        key={`${activeDesignTab}-${item.name}`}
                        data={item.datas}
                        title={item.name}
                        resetKey={activeDesignTab}
                        showStarOnLastPoint={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
