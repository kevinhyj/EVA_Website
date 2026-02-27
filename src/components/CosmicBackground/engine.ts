/**
 * RNAVerse Canvas Galaxy Engine
 * Extracted rendering & physics logic — framework-agnostic
 */

import { RNA_TYPES, type RNAType } from '@/data/rnaTypes';

// ─── Utility ───
let _s = 42;
function srand(v: number) { _s = v; }
function rand() { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; }
function gaussR() { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.28 * v); }
function hexRGB(h: string) { return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) }; }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

const GA = -0.32; // galaxy tilt

// ─── Types ───
interface BgStar { x: number; y: number; r: number; a: number; tw: number; tp: number; hue: number; sat: number }
interface DustParticle { x: number; y: number; ox: number; oy: number; r: number; col: { r: number; g: number; b: number }; a: number; phase: number; freq: number; amp: number; ampY: number; depth: number }
interface NebBlob { x: number; y: number; ox: number; oy: number; rx: number; ry: number; orx: number; ory: number; rot: number; col: string; col2: string; phase: number; speed: number; driftX: number; driftY: number }
interface HelixParticle { progress: number; strand: number; speed: number; size: number; alpha: number; hue: number }
interface ShootStar { x: number; y: number; vx: number; vy: number; life: number; decay: number; len: number }

export interface RNAStar extends RNAType {
  x: number; y: number; homeX: number; homeY: number;
  baseR: number; curR: number; targetR: number; hover: number;
  bobPh: number; bobSpd: number; bobAX: number; bobAY: number;
  drPh: number; drSpd: number; drR: number;
  pulsePh: number; pulseSpd: number;
}

export interface HoveredStar {
  id: string; name: string; desc: string; col: string; tag: string;
  x: number; y: number;
}

// ─── State ───
let W = 0, H = 0, t = 0;
let currentConvergeFactor = 0;
let currentScrollPct = 0;
let currentHovered: HoveredStar | null = null;
let tooltipAlpha = 0; // smooth fade in/out
let bgStars: BgStar[] = [];
let dust: DustParticle[] = [];
let nebBlobs: NebBlob[] = [];
let rnaStars: RNAStar[] = [];
let helixParticles: HelixParticle[] = [];
let shootStars: ShootStar[] = [];

function pickCol() {
  const r = Math.random();
  if (r < .35) return { r: 0, g: 160, b: 200 };
  if (r < .55) return { r: 0, g: 120, b: 160 };
  if (r < .70) return { r: 200, g: 120, b: 40 };
  if (r < .82) return { r: 240, g: 160, b: 50 };
  if (r < .92) return { r: 0, g: 200, b: 220 };
  return { r: 160, g: 200, b: 210 };
}

// ─── Init ───
export function initEngine(width: number, height: number) {
  W = width; H = height;
  srand(42);

  // Background stars - reduced count for performance
  bgStars = [];
  for (let i = 0; i < 200; i++) {
    bgStars.push({
      x: rand() * W, y: rand() * H,
      r: rand() < .06 ? rand() * 2 + 1 : rand() * 0.9 + 0.2,
      a: rand() * 0.55 + 0.12, tw: rand() * 0.015 + 0.003, tp: rand() * 6.28,
      hue: rand() < .4 ? 185 + rand() * 20 : (rand() < .5 ? 25 + rand() * 20 : 0),
      sat: rand() * 35,
    });
  }

  // Nebula dust - reduced count for performance
  dust = [];
  const gcx = W * 0.50, gcy = H * 0.50;
  const ax = Math.cos(GA), ay = Math.sin(GA), px = -ay, py = ax;
  // Further reduced max dust for better scrolling performance
  const dustN = Math.min(800, Math.floor(W * H / 1800));
  for (let i = 0; i < dustN; i++) {
    const along = (rand() - 0.5) * 2.2;
    const across = gaussR() * 0.38;
    const sp = Math.max(W, H) * 0.62, spY = Math.max(W, H) * 0.30;
    let bx = gcx + along * sp * ax + across * spY * px;
    let by = gcy + along * sp * ay + across * spY * py;
    if (rand() < .18) { bx += (rand() - 0.5) * 250; by += (rand() - 0.5) * 180; }
    dust.push({
      x: bx, y: by, ox: bx, oy: by,
      r: rand() * 2.5 + 0.3, col: pickCol(),
      a: rand() * 0.4 + 0.06,
      phase: rand() * 6.28, freq: (rand() * 0.15 + 0.04) * (rand() > .5 ? 1 : -1),
      amp: rand() * 35 + 8, ampY: rand() * 18 + 5, depth: rand(),
    });
  }

  // Nebula blobs
  nebBlobs = [];
  const blobPositions = [
    { x: .25, y: .35, rx: 220, ry: 120, col: 'rgba(0,60,80,0.07)', col2: 'rgba(0,100,130,0.04)' },
    { x: .65, y: .28, rx: 280, ry: 140, col: 'rgba(120,60,10,0.07)', col2: 'rgba(200,100,20,0.03)' },
    { x: .45, y: .55, rx: 300, ry: 160, col: 'rgba(0,80,100,0.06)', col2: 'rgba(0,140,170,0.03)' },
    { x: .80, y: .60, rx: 200, ry: 130, col: 'rgba(100,55,10,0.06)', col2: 'rgba(180,90,20,0.03)' },
    { x: .15, y: .65, rx: 240, ry: 110, col: 'rgba(0,70,90,0.06)', col2: 'rgba(0,120,150,0.03)' },
    { x: .50, y: .20, rx: 260, ry: 100, col: 'rgba(80,50,10,0.06)', col2: 'rgba(160,80,15,0.03)' },
    { x: .35, y: .75, rx: 220, ry: 130, col: 'rgba(0,50,70,0.06)', col2: 'rgba(0,100,120,0.03)' },
    { x: .75, y: .42, rx: 190, ry: 120, col: 'rgba(0,80,110,0.06)', col2: 'rgba(0,130,170,0.03)' },
    { x: .90, y: .25, rx: 170, ry: 90, col: 'rgba(140,70,10,0.05)', col2: 'rgba(200,100,20,0.02)' },
    { x: .10, y: .45, rx: 200, ry: 100, col: 'rgba(0,60,80,0.06)', col2: 'rgba(0,110,140,0.03)' },
    { x: .48, y: .46, rx: 350, ry: 180, col: 'rgba(0,70,90,0.09)', col2: 'rgba(0,120,150,0.04)' },
    { x: .55, y: .50, rx: 280, ry: 150, col: 'rgba(80,45,10,0.07)', col2: 'rgba(160,80,20,0.03)' },
  ];
  blobPositions.forEach(b => {
    const bx = b.x * W, by = b.y * H;
    const brx = b.rx * (W / 1400), bry = b.ry * (H / 900);
    nebBlobs.push({
      x: bx, y: by, ox: bx, oy: by,
      rx: brx, ry: bry, orx: brx, ory: bry, rot: 0,
      col: b.col, col2: b.col2,
      phase: Math.random() * 6.28, speed: 0.1 + Math.random() * 0.15,
      driftX: 10 + Math.random() * 20, driftY: 8 + Math.random() * 15,
    });
  });

  // RNA Stars — elliptical orbit
  rnaStars = [];
  const orbitCx = W * 0.50, orbitCy = H * 0.50 - 20;
  const orbitRx = Math.min(W * 0.35, 480);
  const orbitRy = Math.min(H * 0.35, 350);
  RNA_TYPES.forEach((rna, i) => {
    const baseAngle = (i / RNA_TYPES.length) * Math.PI * 2 - Math.PI / 2;
    const angleJitter = (rand() - 0.5) * 0.12;
    const angle = baseAngle + angleJitter;
    const rJitter = 0.92 + rand() * 0.16;
    const sx = orbitCx + Math.cos(angle) * orbitRx * rJitter;
    const sy = orbitCy + Math.sin(angle) * orbitRy * rJitter;
    rnaStars.push({
      ...rna,
      x: sx, y: sy, homeX: sx, homeY: sy,
      baseR: 20 + rand() * 6, curR: 20, targetR: 20, hover: 0,
      bobPh: rand() * 6.28, bobSpd: .4 + rand() * .6,
      bobAX: 3 + rand() * 8, bobAY: 6 + rand() * 12,
      drPh: rand() * 6.28, drSpd: .05 + rand() * .1, drR: 5 + rand() * 15,
      pulsePh: rand() * 6.28, pulseSpd: 1.5 + rand() * 2,
    });
  });

  // Helix energy particles - reduced for performance
  helixParticles = [];
  for (let i = 0; i < 30; i++) {
    helixParticles.push({
      progress: rand(), strand: rand() > .5 ? 0 : 1,
      speed: .08 + rand() * .15, size: 1 + rand() * 2,
      alpha: .3 + rand() * .5, hue: rand() > .5 ? 185 + rand() * 20 : 25 + rand() * 20,
    });
  }

  shootStars = [];
}

// ─── Update — returns hovered star or null ───
export function updateEngine(dt: number, mx: number, my: number, scrollPct: number = 0): HoveredStar | null {
  t += dt;

  // Scroll progress for star convergence (0 = no scroll, 1 = fully scrolled)
  // 使用更平滑的曲线，让聚拢效果更明显
  const convergeFactor = Math.pow(Math.min(scrollPct * 1.5, 1), 0.8);
  currentConvergeFactor = convergeFactor;
  currentScrollPct = scrollPct;
  const interactionScale = 1 - convergeFactor * 0.8;
  const centerX = W * 0.5;
  const centerY = H * 0.5 - 10;

  // RNA双螺旋形状参数 - 与 drawHelix 保持一致以便对齐
  const helixRotation = 0.38; // 与 drawHelix 中的旋转角度一致
  const visH = Math.min(H * 0.35, 320);
  const helixHeight = visH; // 与 drawHelix 的 hH = visH * 2.0 对应
  const helixWidth = 85; // 与 drawHelix 的 hW = 85 一致
  const helixTwist = 5.5; // 与 drawHelix 的 twist = 5.5 一致

  // Dust - 也跟随聚拢
  dust.forEach(p => {
    const px = .3 + p.depth * .7;
    const baseX = p.ox + Math.sin(t * p.freq + p.phase) * p.amp * px;
    const baseY = p.oy + Math.cos(t * p.freq * .7 + p.phase) * p.ampY * px;

    // 尘埃也向中心聚拢
    p.x = baseX * (1 - convergeFactor * 0.6) + centerX * convergeFactor * 0.6;
    p.y = baseY * (1 - convergeFactor * 0.6) + centerY * convergeFactor * 0.6;

    const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 100 && convergeFactor < 0.5) {
      const f = (100 - d) / 100 * 1.5 * px * (1 - convergeFactor * 2);
      p.x += dx / d * f;
      p.y += dy / d * f;
    }
  });

  // RNA Stars
  let hoveredStar: RNAStar | null = null;
  let hDist = 1e9;
  for (let i = 0; i < rnaStars.length; i++) {
    const s = rnaStars[i];

    // Calculate target position based on scroll (converge to RNA helix shape)
    // 与 drawHelix 中的 helixPos 函数保持一致
    const strand = i % 2;
    const helixProgress = (i / rnaStars.length);
    // 使用与 drawHelix 相同的螺旋公式
    const phase = helixProgress * Math.PI * helixTwist + t * 0.7 + (strand ? Math.PI : 0);
    // 在螺旋局部坐标系中的位置
    const localX = Math.sin(phase) * helixWidth;
    const localY = -helixHeight + helixProgress * helixHeight * 2;
    // 应用旋转变换（与 drawHelix 的 rotate(0.38) 一致）
    const cosR = Math.cos(helixRotation);
    const sinR = Math.sin(helixRotation);
    const targetX = centerX + localX * cosR - localY * sinR;
    const targetY = centerY + localX * sinR + localY * cosR;

    // Apply convergence on scroll - 更强的聚拢效果
    const homeX = s.homeX * (1 - convergeFactor) + targetX * convergeFactor;
    const homeY = s.homeY * (1 - convergeFactor) + targetY * convergeFactor;

    // 减少漂浮幅度随聚拢程度
    const bobScale = 1 - convergeFactor * 0.9;
    const bx = Math.sin(t * s.bobSpd + s.bobPh) * s.bobAX * bobScale;
    const by = Math.sin(t * s.bobSpd * .8 + s.bobPh + 1.2) * s.bobAY * bobScale;
    const drx = Math.cos(t * s.drSpd + s.drPh) * s.drR * bobScale * 0.5;
    const dry = Math.sin(t * s.drSpd * .7 + s.drPh) * s.drR * .6 * bobScale * 0.5;

    s.x = homeX + bx + drx; s.y = homeY + by + dry;

    // Stabilize when hovering: dampen bobbing/drifting if close to mouse
    const dPre = Math.hypot(mx - s.x, my - s.y);
    if (dPre < 100 && interactionScale > 0.1) {
      const damp = Math.pow(Math.min(dPre / 100, 1), 1.2);
      s.x = homeX + (bx + drx) * (0.25 + 0.75 * damp);
      s.y = homeY + (by + dry) * (0.25 + 0.75 * damp);
    }

    // 鼠标交互在聚拢时减弱 — 使用更大的命中检测半径
    const dx = mx - s.x, dy = my - s.y, dist = Math.sqrt(dx * dx + dy * dy);
    const hitR = Math.max(50, s.curR * 3 + 15);
    if (dist < hitR && interactionScale > 0.1) {
      const pull = (1 - dist / hitR) * 12 * interactionScale;
      s.x += dx / (dist || 1) * pull * .06;
      s.y += dy / (dist || 1) * pull * .06;
    }
    const isH = dist < hitR && convergeFactor < 0.5;
    s.targetR = isH ? s.baseR * 2.8 : s.baseR * (1 - convergeFactor * 0.5);
    s.curR += (s.targetR - s.curR) * .1;
    s.hover += ((isH ? 1 : 0) - s.hover) * .09;
    if (isH && dist < hDist) { hoveredStar = s; hDist = dist; }
  }

  // Nebula blobs convergence with spiral effect
  nebBlobs.forEach((b, i) => {
    const origDx = b.ox - centerX;
    const origDy = b.oy - centerY;
    const origAngle = Math.atan2(origDy, origDx);
    const origDist = Math.hypot(origDx, origDy);
    // Spiral: each blob rotates at its own speed as it converges
    const spiralSpin = convergeFactor * Math.PI * (0.8 + i * 0.15);
    const newAngle = origAngle + spiralSpin;
    const easedConverge = convergeFactor * convergeFactor; // ease-in for smoother start
    // Minimal convergence (15%) - nebula stays spread across entire window
    const newDist = origDist * (1 - easedConverge * 0.15);

    b.x = centerX + Math.cos(newAngle) * newDist;
    b.y = centerY + Math.sin(newAngle) * newDist;

    // Keep size large - minimum 75% of original
    const pulse = 1 + Math.sin(t * (1.8 + i * 0.2) + b.phase) * 0.12 * convergeFactor;
    const sizeScale = Math.max(0.75, 1 - easedConverge * 0.20);
    const stretch = 1 + convergeFactor * 0.2 * Math.sin(t * 0.7 + b.phase);
    b.rx = b.orx * sizeScale * pulse * stretch;
    b.ry = b.ory * sizeScale * pulse / stretch;

    // Rotation follows spiral
    b.rot = spiralSpin * 0.3 + Math.sin(t * 0.3 + b.phase) * convergeFactor * 0.3;
  });

  // Shooting stars - 聚拢时减少流星
  if (Math.random() > .997 && shootStars.length < 3 && convergeFactor < 0.5) {
    const a = GA + (Math.random() - .5) * .5;
    shootStars.push({ x: Math.random() * W, y: Math.random() * H * .5, vx: Math.cos(a) * 420 * (.8 + Math.random() * .5), vy: Math.sin(a) * 420 * (.8 + Math.random() * .5), life: 1, decay: .6 + Math.random() * .8, len: 60 + Math.random() * 80 });
  }
  for (let i = shootStars.length - 1; i >= 0; i--) {
    const s = shootStars[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= s.decay * dt;
    if (s.life <= 0 || s.x < -100 || s.x > W + 100 || s.y > H + 100) shootStars.splice(i, 1);
  }

  const result = hoveredStar ? { id: hoveredStar.id, name: hoveredStar.name, desc: hoveredStar.desc, col: hoveredStar.col, tag: hoveredStar.tag, x: hoveredStar.x, y: hoveredStar.y } : null;

  // Smooth tooltip fade
  if (result) {
    currentHovered = result;
    tooltipAlpha = Math.min(1, tooltipAlpha + dt * 5);
  } else {
    tooltipAlpha = Math.max(0, tooltipAlpha - dt * 6);
    if (tooltipAlpha <= 0) currentHovered = null;
  }

  return result;
}

// ─── RNA Icon Shapes ───
function drawRNAIcon(X: CanvasRenderingContext2D, s: RNAStar, r: number, c: { r: number; g: number; b: number }) {
  const x = s.x, y = s.y;
  X.fillStyle = s.col;
  X.strokeStyle = s.col;
  X.lineWidth = Math.max(1.2, r * 0.25);
  X.lineCap = 'round';
  X.lineJoin = 'round';

  switch (s.id) {
    case 'mRNA': { // Wavy line (messenger strand)
      X.beginPath();
      const segs = 5, w = r * 2.2, amp = r * 0.6;
      for (let i = 0; i <= segs * 4; i++) {
        const px = x - w + (i / (segs * 4)) * w * 2;
        const py = y + Math.sin((i / (segs * 4)) * Math.PI * segs) * amp;
        i === 0 ? X.moveTo(px, py) : X.lineTo(px, py);
      }
      X.stroke();
      // 5' cap dot
      X.beginPath(); X.arc(x - w, y, r * 0.2, 0, 6.28); X.fill();
      break;
    }
    case 'tRNA': { // Cloverleaf shape
      const lr = r * 0.55; // leaf radius
      // Three lobes
      X.beginPath(); X.arc(x, y - lr * 1.3, lr, 0, 6.28); X.fill(); // top
      X.beginPath(); X.arc(x - lr * 1.1, y + lr * 0.2, lr * 0.85, 0, 6.28); X.fill(); // left
      X.beginPath(); X.arc(x + lr * 1.1, y + lr * 0.2, lr * 0.85, 0, 6.28); X.fill(); // right
      // Stem
      X.beginPath(); X.moveTo(x, y + lr * 0.5); X.lineTo(x, y + r * 1.2);
      X.lineWidth = Math.max(1.5, r * 0.3); X.stroke();
      // White highlight on top lobe
      X.beginPath(); X.arc(x - lr * 0.2, y - lr * 1.5, lr * 0.2, 0, 6.28);
      X.fillStyle = 'rgba(255,255,255,0.5)'; X.fill();
      break;
    }
    case 'rRNA': { // Double arc (ribosome subunit)
      X.beginPath(); X.arc(x, y, r * 0.9, Math.PI * 0.2, Math.PI * 1.8); X.stroke();
      X.beginPath(); X.arc(x, y, r * 0.55, Math.PI * 0.4, Math.PI * 1.6); X.stroke();
      // Center dot
      X.beginPath(); X.arc(x, y, r * 0.15, 0, 6.28); X.fillStyle = s.col; X.fill();
      break;
    }
    case 'miRNA': { // Hairpin (U-shape + stem)
      X.beginPath();
      X.moveTo(x - r * 0.5, y - r);
      X.lineTo(x - r * 0.5, y + r * 0.2);
      X.quadraticCurveTo(x - r * 0.5, y + r, x, y + r);
      X.quadraticCurveTo(x + r * 0.5, y + r, x + r * 0.5, y + r * 0.2);
      X.lineTo(x + r * 0.5, y - r);
      X.stroke();
      // Base pair dashes
      for (let i = 0; i < 3; i++) {
        const dy = y - r * 0.6 + i * r * 0.4;
        X.beginPath(); X.moveTo(x - r * 0.3, dy); X.lineTo(x + r * 0.3, dy);
        X.lineWidth = Math.max(0.8, r * 0.12); X.stroke();
      }
      X.lineWidth = Math.max(1.2, r * 0.25);
      break;
    }
    case 'siRNA': { // Two parallel short lines (double-stranded)
      const hw = r * 1.2, gap = r * 0.35;
      X.beginPath(); X.moveTo(x - hw, y - gap); X.lineTo(x + hw, y - gap); X.stroke();
      X.beginPath(); X.moveTo(x - hw, y + gap); X.lineTo(x + hw, y + gap); X.stroke();
      // Overhang dashes
      X.setLineDash([r * 0.3, r * 0.2]);
      X.beginPath(); X.moveTo(x + hw, y - gap); X.lineTo(x + hw + r * 0.5, y - gap); X.stroke();
      X.beginPath(); X.moveTo(x - hw, y + gap); X.lineTo(x - hw - r * 0.5, y + gap); X.stroke();
      X.setLineDash([]);
      break;
    }
    case 'circRNA': { // Circle ring
      X.beginPath(); X.arc(x, y, r * 0.85, 0, 6.28);
      X.lineWidth = Math.max(1.8, r * 0.3); X.stroke();
      // Arrow head to show circularity
      const ax = x + r * 0.85, ay = y;
      X.beginPath(); X.moveTo(ax, ay - r * 0.3); X.lineTo(ax + r * 0.25, ay); X.lineTo(ax, ay + r * 0.3);
      X.fillStyle = s.col; X.fill();
      break;
    }
    case 'lncRNA': { // Long wavy line
      X.beginPath();
      const lw = r * 2.5, la = r * 0.45;
      for (let i = 0; i <= 30; i++) {
        const px = x - lw + (i / 30) * lw * 2;
        const py = y + Math.sin((i / 30) * Math.PI * 6) * la;
        i === 0 ? X.moveTo(px, py) : X.lineTo(px, py);
      }
      X.stroke();
      break;
    }
    case 'snRNA': { // 5-pointed star
      X.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const sr = i % 2 === 0 ? r * 0.95 : r * 0.4;
        const px = x + Math.cos(a) * sr, py = y + Math.sin(a) * sr;
        i === 0 ? X.moveTo(px, py) : X.lineTo(px, py);
      }
      X.closePath(); X.fillStyle = s.col; X.fill();
      // White center highlight
      X.beginPath(); X.arc(x, y, r * 0.15, 0, 6.28);
      X.fillStyle = 'rgba(255,255,255,0.4)'; X.fill();
      break;
    }
    case 'snoRNA': { // Small circle + tail curve
      X.beginPath(); X.arc(x, y - r * 0.2, r * 0.55, 0, 6.28); X.fillStyle = s.col; X.fill();
      X.beginPath();
      X.moveTo(x, y + r * 0.35);
      X.quadraticCurveTo(x + r * 0.8, y + r * 0.8, x + r * 0.3, y + r * 1.2);
      X.stroke();
      break;
    }
    case 'piRNA': { // Shield shape
      X.beginPath();
      X.moveTo(x, y - r);
      X.lineTo(x + r * 0.85, y - r * 0.4);
      X.lineTo(x + r * 0.7, y + r * 0.5);
      X.quadraticCurveTo(x, y + r * 1.1, x, y + r * 1.1);
      X.quadraticCurveTo(x, y + r * 1.1, x - r * 0.7, y + r * 0.5);
      X.lineTo(x - r * 0.85, y - r * 0.4);
      X.closePath();
      X.fillStyle = s.col; X.fill();
      // Inner highlight
      X.beginPath(); X.arc(x, y - r * 0.1, r * 0.2, 0, 6.28);
      X.fillStyle = 'rgba(255,255,255,0.35)'; X.fill();
      break;
    }
    case 'sRNA': { // Z-shaped zigzag
      X.beginPath();
      X.moveTo(x - r, y - r * 0.7);
      X.lineTo(x + r * 0.5, y - r * 0.7);
      X.lineTo(x - r * 0.5, y + r * 0.7);
      X.lineTo(x + r, y + r * 0.7);
      X.stroke();
      // End dots
      X.beginPath(); X.arc(x - r, y - r * 0.7, r * 0.18, 0, 6.28); X.fillStyle = s.col; X.fill();
      X.beginPath(); X.arc(x + r, y + r * 0.7, r * 0.18, 0, 6.28); X.fill();
      break;
    }
    case 'virus': { // Hexagon (capsid)
      X.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        i === 0 ? X.moveTo(px, py) : X.lineTo(px, py);
      }
      X.closePath(); X.fillStyle = s.col; X.fill();
      // Inner hexagon highlight
      X.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * r * 0.45, py = y + Math.sin(a) * r * 0.45;
        i === 0 ? X.moveTo(px, py) : X.lineTo(px, py);
      }
      X.closePath(); X.fillStyle = 'rgba(255,255,255,0.2)'; X.fill();
      break;
    }
    default: { // Fallback: glowing circle
      const cg = X.createRadialGradient(x - r * .25, y - r * .25, 0, x, y, r);
      cg.addColorStop(0, 'rgba(255,255,255,0.95)'); cg.addColorStop(.35, s.col); cg.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0.7)`);
      X.beginPath(); X.arc(x, y, r, 0, 6.28); X.fillStyle = cg; X.fill();
    }
  }
}

// ─── Draw ───
export function drawEngine(ctx: CanvasRenderingContext2D) {
  const X = ctx;
  X.clearRect(0, 0, W, H);

  // Deep space - background transitions from dark to white based on convergence
  const cf = currentConvergeFactor;
  const bgBlend = Math.max(0, Math.min(1, (currentScrollPct - 0.35) / 0.65));
  const bg = X.createRadialGradient(W * .50, H * .50, 0, W * .50, H * .50, Math.max(W, H) * 1.2);
  // Lerp each color stop from dark to white
  const lc = (dark: number, t: number) => Math.round(dark + (255 - dark) * t);
  bg.addColorStop(0, `rgb(${lc(10,bgBlend)},${lc(26,bgBlend)},${lc(40,bgBlend)})`);
  bg.addColorStop(.45, `rgb(${lc(6,bgBlend)},${lc(21,bgBlend)},${lc(32,bgBlend)})`);
  bg.addColorStop(1, `rgb(${lc(3,bgBlend)},${lc(11,bgBlend)},${lc(20,bgBlend)})`);
  X.fillStyle = bg; X.fillRect(0, 0, W, H);

  // Galaxy glow
  drawGalaxyGlow(X);

  // Nebula blobs with convergence effects
  nebBlobs.forEach((b, i) => {
    const driftScale = Math.max(0, 1 - currentConvergeFactor * 1.2);
    const bx = b.x + Math.sin(t * b.speed + b.phase) * b.driftX * driftScale;
    const by = b.y + Math.cos(t * b.speed * .7 + b.phase) * b.driftY * driftScale;
    const blobAlpha = Math.max(0.15, 1 - currentConvergeFactor * 0.5 + Math.sin(t * 1.5 + b.phase) * currentConvergeFactor * 0.15);
    X.save();
    X.globalAlpha = blobAlpha;
    X.translate(bx, by);
    X.rotate(GA * .5 + b.rot);
    X.scale(1, b.ry / (b.rx || 1));
    const g = X.createRadialGradient(0, 0, 0, 0, 0, b.rx);
    g.addColorStop(0, b.col); g.addColorStop(.6, b.col2); g.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = g; X.beginPath(); X.arc(0, 0, b.rx, 0, 6.28); X.fill();
    X.restore();
  });

  // Convergence vortex glow at center
  if (currentConvergeFactor > 0.05) {
    const gcx = W * 0.5, gcy = H * 0.5;
    const glowAlpha = currentConvergeFactor * 0.18;
    const glowR = Math.min(W, H) * (0.2 - currentConvergeFactor * 0.08);
    X.save();
    // Rotating vortex arms
    for (let arm = 0; arm < 3; arm++) {
      const armAngle = t * 0.4 + (arm / 3) * Math.PI * 2;
      const armLen = glowR * 1.5;
      const armG = X.createLinearGradient(
        gcx, gcy,
        gcx + Math.cos(armAngle) * armLen,
        gcy + Math.sin(armAngle) * armLen
      );
      armG.addColorStop(0, `rgba(0,160,200,${glowAlpha * 0.6})`);
      armG.addColorStop(0.5, `rgba(0,120,160,${glowAlpha * 0.2})`);
      armG.addColorStop(1, 'rgba(0,0,0,0)');
      X.beginPath();
      X.moveTo(gcx, gcy);
      X.quadraticCurveTo(
        gcx + Math.cos(armAngle + 0.5) * armLen * 0.6,
        gcy + Math.sin(armAngle + 0.5) * armLen * 0.6,
        gcx + Math.cos(armAngle) * armLen,
        gcy + Math.sin(armAngle) * armLen
      );
      X.strokeStyle = armG;
      X.lineWidth = 15 + currentConvergeFactor * 25;
      X.stroke();
    }
    // Central radial glow
    const cvg = X.createRadialGradient(gcx, gcy, 0, gcx, gcy, glowR);
    cvg.addColorStop(0, `rgba(0,160,200,${glowAlpha})`);
    cvg.addColorStop(0.3, `rgba(0,120,160,${glowAlpha * 0.5})`);
    cvg.addColorStop(0.6, `rgba(120,70,20,${glowAlpha * 0.2})`);
    cvg.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = cvg;
    X.beginPath(); X.arc(gcx, gcy, glowR, 0, 6.28); X.fill();
    X.restore();
  }

  // Background stars
  bgStars.forEach(s => {
    const a = Math.max(.05, s.a + Math.sin(t * s.tw * 60 + s.tp) * .18);
    X.beginPath(); X.arc(s.x, s.y, s.r, 0, 6.28);
    X.fillStyle = s.sat > 10 ? `hsla(${s.hue},${s.sat}%,80%,${a})` : `rgba(190,220,230,${a})`;
    X.fill();
    if (s.r > 1.2) { X.beginPath(); X.arc(s.x, s.y, s.r * 3, 0, 6.28); X.fillStyle = `rgba(180,220,230,${a * .08})`; X.fill(); }
  });

  // Dust back layer
  X.save(); X.globalCompositeOperation = 'lighter';
  dust.forEach(p => { if (p.depth > .5) return; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 6.28); X.fillStyle = `rgba(${p.col.r},${p.col.g},${p.col.b},${p.a * .7})`; X.fill(); });
  X.restore();

  // DNA Helix
  drawHelix(X, t);

  // Dust front layer
  X.save(); X.globalCompositeOperation = 'lighter';
  dust.forEach(p => { if (p.depth <= .5) return; X.beginPath(); X.arc(p.x, p.y, p.r, 0, 6.28); X.fillStyle = `rgba(${p.col.r},${p.col.g},${p.col.b},${p.a})`; X.fill(); });
  X.restore();

  // Connections
  drawConns(X);

  // Shooting stars
  shootStars.forEach(s => {
    const sp = Math.hypot(s.vx, s.vy), nx = s.vx / sp, ny = s.vy / sp;
    const g = X.createLinearGradient(s.x, s.y, s.x - nx * s.len, s.y - ny * s.len);
    g.addColorStop(0, `rgba(200,240,250,${s.life * .9})`); g.addColorStop(.3, `rgba(0,180,220,${s.life * .4})`); g.addColorStop(1, 'rgba(0,120,160,0)');
    X.beginPath(); X.moveTo(s.x, s.y); X.lineTo(s.x - nx * s.len, s.y - ny * s.len);
    X.strokeStyle = g; X.lineWidth = 1.5 * s.life; X.stroke();
    X.beginPath(); X.arc(s.x, s.y, 2 * s.life, 0, 6.28); X.fillStyle = `rgba(240,250,255,${s.life * .8})`; X.fill();
  });

  // RNA Star Nodes
  rnaStars.forEach(s => {
    const c = hexRGB(s.col), pulse = Math.sin(t * s.pulseSpd + s.pulsePh) * .25 + .75, r = s.curR;
    const gR = r * 4 + s.hover * r * 3;
    const gg = X.createRadialGradient(s.x, s.y, 0, s.x, s.y, gR);
    const ga = .12 * pulse + s.hover * .2;
    gg.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${ga})`); gg.addColorStop(.4, `rgba(${c.r},${c.g},${c.b},${ga * .35})`); gg.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
    X.beginPath(); X.arc(s.x, s.y, gR, 0, 6.28); X.fillStyle = gg; X.fill();
    if (s.hover > .15) { X.beginPath(); X.arc(s.x, s.y, r + 10 + s.hover * 8, 0, 6.28); X.strokeStyle = `rgba(${c.r},${c.g},${c.b},${s.hover * .15})`; X.lineWidth = .8; X.stroke(); }
    // Draw RNA icon shape instead of circle
    X.save();
    X.shadowBlur = 15 + s.hover * 25; X.shadowColor = s.col;
    drawRNAIcon(X, s, r, c);
    X.restore();
    if (s.hover > .1) drawFlare(X, s.x, s.y, r * 2.5 + s.hover * r * 2, c, s.hover, t);
    if (s.hover > .25) { for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + t * 2.5, oR = r + 12 + s.hover * 10; X.beginPath(); X.arc(s.x + Math.cos(a) * oR, s.y + Math.sin(a) * oR * .7, 1.2 * s.hover, 0, 6.28); X.fillStyle = `rgba(${c.r},${c.g},${c.b},${s.hover * .55})`; X.fill(); } }
  });

  // RNA Star Labels (below each star)
  if (currentConvergeFactor < 0.4) {
    const labelAlpha = Math.max(0, 1 - currentConvergeFactor * 2.5);
    rnaStars.forEach(s => {
      if (s.hover > 0.3) return; // hide label when tooltip is showing
      const c = hexRGB(s.col);
      const pulse = Math.sin(t * s.pulseSpd + s.pulsePh) * .15 + .85;
      const a = labelAlpha * pulse * 0.85;
      X.save();
      X.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
      X.textAlign = 'center';
      X.textBaseline = 'top';
      X.fillStyle = `rgba(${c.r},${c.g},${c.b},${a})`;
      X.fillText(s.id, s.x, s.y + s.curR + 10);
      X.restore();
    });
  }

  // Canvas tooltip next to star
  if (currentHovered && tooltipAlpha > 0.01) {
    drawCanvasTooltip(X, currentHovered, tooltipAlpha);
  }
}

// ─── Sub-draw functions ───
function drawGalaxyGlow(X: CanvasRenderingContext2D) {
  const gcx = W * .50, gcy = H * .50;
  X.save(); X.translate(gcx, gcy); X.rotate(GA * .3); X.scale(1, .7);
  const gc = X.createRadialGradient(0, 0, 0, 0, 0, Math.min(W, H) * .22);
  gc.addColorStop(0, 'rgba(0,80,100,0.16)'); gc.addColorStop(.3, 'rgba(0,50,70,0.10)'); gc.addColorStop(.7, 'rgba(0,25,35,0.05)'); gc.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = gc; X.fillRect(-W, -H, W * 2, H * 2); X.restore();
  X.save(); X.translate(gcx, gcy); X.rotate(GA); X.scale(1.8, .45);
  const g1 = X.createRadialGradient(0, 0, 0, 0, 0, W * .45);
  g1.addColorStop(0, 'rgba(0,60,80,0.22)'); g1.addColorStop(.2, 'rgba(0,40,60,0.13)'); g1.addColorStop(.5, 'rgba(0,20,35,0.06)'); g1.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g1; X.fillRect(-W, -H, W * 2, H * 2); X.restore();
  X.save(); X.translate(gcx, gcy); X.rotate(GA); X.scale(2.2, .18);
  const g2 = X.createRadialGradient(0, 0, 0, 0, 0, W * .4);
  g2.addColorStop(0, 'rgba(0,70,90,0.10)'); g2.addColorStop(.5, 'rgba(0,40,55,0.05)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g2; X.fillRect(-W, -H, W * 2, H * 2); X.restore();
  X.save(); X.translate(W * .35, H * .35); X.scale(1.3, .7);
  const g3 = X.createRadialGradient(0, 0, 0, 0, 0, W * .22);
  g3.addColorStop(0, 'rgba(120,60,10,0.08)'); g3.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g3; X.fillRect(-W, -H, W * 2, H * 2); X.restore();
  X.save(); X.translate(W * .70, H * .62); X.scale(.9, .65);
  const g4 = X.createRadialGradient(0, 0, 0, 0, 0, W * .18);
  g4.addColorStop(0, 'rgba(0,80,100,0.08)'); g4.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = g4; X.fillRect(-W, -H, W * 2, H * 2); X.restore();
}

function drawHelix(X: CanvasRenderingContext2D, time: number) {
  X.save();
  const cx = W * .50, cy = H * .50;
  X.translate(cx, cy); X.rotate(0.38);
  X.globalAlpha = 0.28;
  const hW = 85, visH = Math.min(H * .35, 320), hH = visH * 2.0, steps = 70, twist = 5.5;

  function fadeMul(frac: number) { const e = 0.28; if (frac < e) return frac / e; if (frac > 1 - e) return (1 - frac) / e; return 1; }
  function helixPos(frac: number, strand: number) { const y = -hH / 2 + frac * hH; const phase = frac * Math.PI * twist + time * .7 + (strand ? Math.PI : 0); return { x: Math.sin(phase) * hW, y, depth: Math.cos(phase) }; }

  const auraG = X.createRadialGradient(0, 0, hW * .3, 0, 0, hW * 3.5);
  auraG.addColorStop(0, 'rgba(0,80,100,0.035)'); auraG.addColorStop(.5, 'rgba(0,60,80,0.015)'); auraG.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = auraG; X.fillRect(-hW * 4, -hH * .55, hW * 8, hH * 1.1);

  for (let s = 0; s < 2; s++) { X.beginPath(); for (let i = 0; i <= steps; i++) { const { x, y } = helixPos(i / steps, s); i === 0 ? X.moveTo(x, y) : X.lineTo(x, y); } X.strokeStyle = s === 0 ? 'rgba(0,180,220,0.08)' : 'rgba(232,135,44,0.06)'; X.lineWidth = 20; X.stroke(); }
  for (let s = 0; s < 2; s++) { X.beginPath(); for (let i = 0; i <= steps; i++) { const { x, y } = helixPos(i / steps, s); i === 0 ? X.moveTo(x, y) : X.lineTo(x, y); } X.strokeStyle = s === 0 ? 'rgba(0,170,210,0.14)' : 'rgba(230,140,50,0.11)'; X.lineWidth = 9; X.stroke(); }

  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < steps; i++) {
      const f0 = i / steps, f1 = (i + 1) / steps;
      const p0 = helixPos(f0, s), p1 = helixPos(f1, s);
      const fade = Math.min(fadeMul(f0), fadeMul(f1));
      if (fade < .01) continue;
      X.beginPath(); X.moveTo(p0.x, p0.y); X.lineTo(p1.x, p1.y);
      const cMix = f0;
      let r: number, g: number, b: number;
      if (s === 0) { r = lerp(0, 0, cMix); g = lerp(200, 160, cMix); b = lerp(230, 200, cMix); }
      else { r = lerp(240, 200, cMix); g = lerp(140, 100, cMix); b = lerp(50, 30, cMix); }
      X.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.85 * fade})`;
      X.lineWidth = 3; X.shadowBlur = 22;
      X.shadowColor = s === 0 ? `rgba(0,180,220,${0.5 * fade})` : `rgba(232,135,44,${0.4 * fade})`;
      X.stroke();
    }
  }

  X.shadowBlur = 0;
  for (let i = 0; i <= steps; i += 2) {
    const f = i / steps, fade = fadeMul(f); if (fade < .02) continue;
    const p1 = helixPos(f, 0), p2 = helixPos(f, 1), depth = Math.abs(p1.depth), ba = (.04 + depth * .16) * fade;
    X.beginPath(); X.moveTo(p1.x, p1.y); X.lineTo(p2.x, p2.y);
    const bridgeG = X.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    bridgeG.addColorStop(0, `rgba(0,180,220,${ba})`); bridgeG.addColorStop(.5, `rgba(120,160,180,${ba * .7})`); bridgeG.addColorStop(1, `rgba(232,140,50,${ba})`);
    X.strokeStyle = bridgeG; X.lineWidth = 1 + depth * .8; X.stroke();
    [{ pos: .28, c1: `rgba(0,210,240,${ba * 1.5})`, c2: `rgba(240,170,50,${ba * 1.5})` }, { pos: .72, c1: `rgba(0,180,200,${ba * 1.5})`, c2: `rgba(220,130,30,${ba * 1.5})` }].forEach(({ pos, c1, c2 }) => {
      const bx = lerp(p1.x, p2.x, pos), by = lerp(p1.y, p2.y, pos), r = 1.5 + depth * 1.5;
      X.beginPath(); X.arc(bx, by, r, 0, 6.28); X.fillStyle = f % 4 < 2 ? c1 : c2; X.fill();
    });
  }

  helixParticles.forEach(p => {
    p.progress += p.speed * .016; if (p.progress > 1) p.progress -= 1;
    const fade = fadeMul(p.progress); if (fade < .05) return;
    const { x, y, depth } = helixPos(p.progress, p.strand);
    const vis = .3 + Math.abs(depth) * .7, a = p.alpha * vis * fade;
    X.beginPath(); X.arc(x, y, p.size * vis, 0, 6.28);
    X.fillStyle = `hsla(${p.hue},90%,70%,${a})`; X.fill();
    for (let tr = 1; tr <= 3; tr++) {
      const tp = p.progress - tr * .015; if (tp < 0) continue;
      const tFade = fadeMul(tp); const { x: tx, y: ty } = helixPos(tp, p.strand);
      X.beginPath(); X.arc(tx, ty, p.size * vis * (1 - tr * .25), 0, 6.28);
      X.fillStyle = `hsla(${p.hue},80%,65%,${a * (1 - tr * .3) * tFade})`; X.fill();
    }
  });

  for (let i = 0; i <= steps; i += 6) {
    const f = i / steps, fade = fadeMul(f); if (fade < .1) continue;
    const { x, y, depth } = helixPos(f, 0);
    const sparkle = Math.sin(time * 3 + f * 20) * .5 + .5;
    if (depth > .6 && sparkle > .7) {
      const sa = (sparkle - .7) * 3 * 0.4 * fade;
      X.beginPath(); X.arc(x, y, 2, 0, 6.28); X.fillStyle = `rgba(255,255,255,${sa})`; X.fill();
    }
  }
  X.restore();
}

function drawConns(X: CanvasRenderingContext2D) {
  X.save();
  for (let i = 0; i < rnaStars.length; i++) for (let j = i + 1; j < rnaStars.length; j++) {
    const a = rnaStars[i], b = rnaStars[j], d = Math.hypot(a.x - b.x, a.y - b.y), mD = 350;
    if (d < mD) {
      const al = (1 - d / mD) * .05 + Math.max(a.hover, b.hover) * .08 * (1 - d / mD);
      const midX = (a.x + b.x) / 2 + (a.y - b.y) * .06, midY = (a.y + b.y) / 2 - (a.x - b.x) * .06;
      X.beginPath(); X.moveTo(a.x, a.y); X.quadraticCurveTo(midX, midY, b.x, b.y);
      X.strokeStyle = `rgba(0,170,200,${al})`; X.lineWidth = .5; X.stroke();
    }
  }
  const ccx = W * .50, ccy = H * .50;
  rnaStars.forEach(s => {
    const al = 0.025 + s.hover * 0.06;
    X.beginPath(); X.moveTo(s.x, s.y);
    X.lineTo(lerp(s.x, ccx, .4), lerp(s.y, ccy, .4));
    X.strokeStyle = `rgba(0,150,180,${al})`; X.lineWidth = .4; X.stroke();
  });
  X.restore();
}

function drawCanvasTooltip(X: CanvasRenderingContext2D, star: HoveredStar, alpha: number) {
  const pad = 16;
  const lineH = 18;
  const maxW = 280;
  const tagH = 22;

  // Measure text
  X.save();
  X.font = '700 14px Orbitron, SF Pro Display, -apple-system, sans-serif';
  const nameW = X.measureText(star.name).width;
  X.font = '300 12px -apple-system, BlinkMacSystemFont, sans-serif';

  // Word-wrap description
  const words = star.desc.split(' ');
  const descLines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const test = currentLine ? currentLine + ' ' + word : word;
    if (X.measureText(test).width > maxW - pad * 2) {
      if (currentLine) descLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) descLines.push(currentLine);

  X.font = '600 9px -apple-system, sans-serif';
  const tagW = X.measureText(star.tag.toUpperCase()).width + 16;

  const boxW = Math.max(nameW + pad * 2, maxW);
  const boxH = pad + lineH + descLines.length * (lineH - 2) + 8 + tagH + pad;

  // Position: prefer right of star, avoid edges
  let tx = star.x + 28;
  let ty = star.y - boxH / 2;
  if (tx + boxW + 10 > W) tx = star.x - boxW - 28;
  if (ty + boxH + 10 > H) ty = H - boxH - 10;
  if (ty < 10) ty = 10;
  if (tx < 10) tx = 10;

  const eased = alpha * alpha * (3 - 2 * alpha); // smoothstep

  // Connection line from star to tooltip
  const c = hexRGB(star.col);
  X.globalAlpha = eased * 0.4;
  X.beginPath();
  X.moveTo(star.x, star.y);
  const connX = tx < star.x ? tx + boxW : tx;
  const connY = ty + boxH / 2;
  X.lineTo(connX, connY);
  X.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.5)`;
  X.lineWidth = 1;
  X.setLineDash([4, 4]);
  X.stroke();
  X.setLineDash([]);

  // Background with blur-like effect (multiple layers)
  X.globalAlpha = eased;

  // Outer glow
  X.shadowBlur = 30;
  X.shadowColor = `rgba(${c.r},${c.g},${c.b},0.3)`;
  X.fillStyle = 'rgba(6,18,28,0.92)';
  roundRect(X, tx, ty, boxW, boxH, 12);
  X.fill();
  X.shadowBlur = 0;

  // Border
  X.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.25)`;
  X.lineWidth = 1;
  roundRect(X, tx, ty, boxW, boxH, 12);
  X.stroke();

  // Top accent line
  X.fillStyle = `rgba(${c.r},${c.g},${c.b},0.6)`;
  roundRect(X, tx + pad, ty + 1, boxW - pad * 2, 2, 1);
  X.fill();

  // Name
  let yOff = ty + pad + 14;
  X.font = '700 14px Orbitron, SF Pro Display, -apple-system, sans-serif';
  X.fillStyle = star.col;
  X.globalAlpha = eased;
  X.fillText(star.name, tx + pad, yOff);
  yOff += 6;

  // Description lines
  X.font = '300 12px -apple-system, BlinkMacSystemFont, sans-serif';
  X.fillStyle = `rgba(170,220,230,0.85)`;
  for (const line of descLines) {
    yOff += lineH - 2;
    X.fillText(line, tx + pad, yOff);
  }
  yOff += 10;

  // Tag badge
  const tagX = tx + pad;
  const tagY = yOff;
  X.fillStyle = `rgba(${c.r},${c.g},${c.b},0.1)`;
  roundRect(X, tagX, tagY, tagW, tagH, 11);
  X.fill();
  X.strokeStyle = `rgba(${c.r},${c.g},${c.b},0.3)`;
  X.lineWidth = 1;
  roundRect(X, tagX, tagY, tagW, tagH, 11);
  X.stroke();

  X.font = '600 9px -apple-system, sans-serif';
  X.fillStyle = star.col;
  X.fillText(star.tag.toUpperCase(), tagX + 8, tagY + 15);

  X.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawFlare(X: CanvasRenderingContext2D, x: number, y: number, size: number, c: { r: number; g: number; b: number }, hover: number, time: number) {
  X.save(); X.globalAlpha = hover * .5; X.translate(x, y); X.rotate(time * .3);
  [{ len: size, w: .8 }, { len: size * .6, w: .6 }].forEach(({ len, w }, idx) => {
    X.save(); X.rotate(idx * Math.PI / 4);
    const g = X.createLinearGradient(0, -len, 0, len);
    g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0)`); g.addColorStop(.45, `rgba(${c.r},${c.g},${c.b},.5)`);
    g.addColorStop(.5, 'rgba(255,255,255,.7)'); g.addColorStop(.55, `rgba(${c.r},${c.g},${c.b},.5)`);
    g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
    X.fillStyle = g; X.fillRect(-w, -len, w * 2, len * 2); X.restore();
  });
  X.restore();
}
