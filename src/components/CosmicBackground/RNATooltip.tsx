'use client';

import type { HoveredStar } from './engine';

interface Props {
  star: HoveredStar | null;
}

export default function RNATooltip({ star }: Props) {
  if (!star) return null;
  // Prevent tooltip from showing at top-left if coordinates are invalid
  if (typeof star.x !== 'number' || typeof star.y !== 'number' || (star.x <= 1 && star.y <= 1)) return null;

  // Position: prefer right of star, avoid edges
  let tx = star.x + 28;
  let ty = star.y - 20;
  if (typeof window !== 'undefined') {
    if (tx + 320 > window.innerWidth) tx = star.x - 310;
    if (ty + 160 > window.innerHeight) ty = window.innerHeight - 170;
    if (ty < 10) ty = 10;
  }

  return (
    <div
      className="rna-tooltip"
      style={{
        left: `${tx}px`,
        top: `${ty}px`,
        opacity: 1,
        transform: 'scale(1) translateY(0)',
      }}
    >
      <div className="rna-tooltip__name" style={{ color: star.col }}>
        {star.name}
      </div>
      <div className="rna-tooltip__desc">{star.desc}</div>
      <span
        className="rna-tooltip__tag"
        style={{
          background: star.col + '18',
          border: `1px solid ${star.col}40`,
          color: star.col,
        }}
      >
        {star.tag}
      </span>
    </div>
  );
}
