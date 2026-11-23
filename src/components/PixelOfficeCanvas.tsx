import React, { useEffect, useRef } from 'react';
import { Employee, MacroRegime, VentureSector } from '../engine/types';

interface PixelOfficeCanvasProps {
  mode: 'TITLE_CITY' | 'OFFICE_FLOOR';
  sector?: VentureSector;
  employees?: Employee[];
  macroRegime?: MacroRegime;
  hasDeptHeads?: number;
  factoryLines?: number;
  cashValue?: number;
  className?: string;
}

interface AgentSprite {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  hair: string;
  phase: number;
  bubble?: string;
}

interface CoinParticle {
  x: number;
  y: number;
  vy: number;
  life: number;
  label: string;
}

const ROLE_SHIRT: Record<string, string> = {
  Engineer: '#2563EB',
  Designer: '#EC4899',
  Marketer: '#F59E0B',
  Sales: '#10B981',
  Quant: '#7C3AED',
  Security: '#E11D48',
  Operator: '#F97316',
};

export const PixelOfficeCanvas: React.FC<PixelOfficeCanvasProps> = ({
  mode,
  sector = 'SAAS',
  employees = [],
  macroRegime = 'EXPANSION',
  hasDeptHeads = 0,
  factoryLines = 1,
  cashValue = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ sector, employees, macroRegime, hasDeptHeads, factoryLines, mode });
  stateRef.current = { sector, employees, macroRegime, hasDeptHeads, factoryLines, mode };

  const coinsRef = useRef<CoinParticle[]>([]);
  const prevCashRef = useRef<number>(cashValue);

  // Spawn animated floating pixel coins on cash inflow!
  useEffect(() => {
    const diff = cashValue - prevCashRef.current;
    prevCashRef.current = cashValue;
    if (mode === 'OFFICE_FLOOR' && diff > 100) {
      const count = Math.min(6, Math.max(2, Math.floor(Math.log10(diff))));
      for (let i = 0; i < count; i++) {
        coinsRef.current.push({
          x: 40 + Math.random() * 200,
          y: 72 + Math.random() * 35,
          vy: 0.45 + Math.random() * 0.35,
          life: 65,
          label: i === 0 ? '+$' : '$',
        });
      }
      if (coinsRef.current.length > 24) {
        coinsRef.current = coinsRef.current.slice(-24);
      }
    }
  }, [cashValue, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const W = mode === 'TITLE_CITY' ? 320 : 280;
    const H = mode === 'TITLE_CITY' ? 180 : 128;
    canvas.width = W;
    canvas.height = H;

    const agents: AgentSprite[] = Array.from({ length: 14 }, (_, i) => ({
      x: 34 + (i % 5) * 44,
      y: 44 + Math.floor(i / 5) * 34,
      tx: 34 + (i % 5) * 44,
      ty: 44 + Math.floor(i / 5) * 34,
      color: '#2563EB',
      hair: ['#1B1929', '#78350F', '#D97706', '#4C1D95'][i % 4],
      phase: i * 1.1,
      bubble: ['<>', '$$', 'UP', 'OK'][i % 4],
    }));

    let rafId = 0;
    let tick = 0;

    const drawRect = (x: number, y: number, w: number, h: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };

    const drawTitleCity = (t: number) => {
      drawRect(0, 0, W, 38, '#231942');
      drawRect(0, 38, W, 34, '#3E2C6E');
      drawRect(0, 72, W, 32, '#7B3E7D');
      drawRect(0, 104, W, 32, '#D95D68');
      drawRect(0, 136, W, 44, '#F59E0B');

      drawRect(228, 78, 36, 36, '#FDE68A');
      drawRect(232, 74, 28, 44, '#FDE68A');
      drawRect(232, 82, 28, 28, '#FEF3C7');

      const stars = [
        [24, 14], [64, 26], [112, 12], [174, 22], [278, 18], [296, 36], [142, 42],
      ];
      stars.forEach(([sx, sy], i) => {
        if ((Math.floor(t / 25) + i) % 3 !== 0) drawRect(sx, sy, 2, 2, '#FFFBEB');
      });

      const cx1 = Math.floor((t * 0.18) % (W + 60)) - 40;
      const cx2 = Math.floor((t * 0.11 + 140) % (W + 60)) - 40;
      [cx1, cx2].forEach((cx, idx) => {
        const cy = idx === 0 ? 42 : 62;
        drawRect(cx, cy, 34, 8, '#FBCFE8');
        drawRect(cx + 6, cy - 5, 20, 6, '#FDF2F8');
      });

      const backBldgs = [
        [10, 86, 28, 94], [40, 68, 32, 112], [76, 94, 24, 86], [104, 58, 36, 122],
        [146, 82, 30, 98], [182, 64, 34, 116], [222, 90, 26, 90], [254, 72, 36, 108], [292, 88, 28, 92],
      ];
      backBldgs.forEach(([bx, by, bw, bh]) => drawRect(bx, by, bw, bh, '#2E234E'));

      const frontBldgs = [
        { x: 18, y: 102, w: 38, h: 78, col: '#1B1929', win: '#38BDF8' },
        { x: 64, y: 82, w: 46, h: 98, col: '#221E38', win: '#FBBF24' },
        { x: 118, y: 74, w: 54, h: 106, col: '#1B1929', win: '#34D399' },
        { x: 182, y: 92, w: 44, h: 88, col: '#25203B', win: '#F472B6' },
        { x: 234, y: 80, w: 48, h: 100, col: '#1B1929', win: '#A78BFA' },
        { x: 288, y: 104, w: 32, h: 76, col: '#25203B', win: '#60A5FA' },
      ];
      frontBldgs.forEach((b, bi) => {
        drawRect(b.x, b.y, b.w, b.h, b.col);
        drawRect(b.x, b.y, b.w, 3, b.win);
        for (let wy = b.y + 8; wy < H - 14; wy += 9) {
          for (let wx = b.x + 6; wx < b.x + b.w - 8; wx += 9) {
            const lit = (wx + wy + bi + Math.floor(t / 90)) % 5 !== 0;
            drawRect(wx, wy, 5, 5, lit ? b.win : '#3B3459');
          }
        }
      });

      if (Math.floor(t / 20) % 2 === 0) {
        drawRect(143, 66, 4, 8, '#10B981');
        drawRect(142, 64, 6, 3, '#6EE7B7');
      }
      const dx = Math.floor((t * 0.7) % (W + 40)) - 20;
      const dy = 52 + Math.round(Math.sin(t * 0.08) * 3);
      drawRect(dx, dy, 8, 3, '#FDE047');
      drawRect(dx + 2, dy - 2, 4, 2, '#38BDF8');

      drawRect(0, H - 12, W, 12, '#0F0D1A');
      for (let rx = (Math.floor(t * 0.5) % 24) - 24; rx < W; rx += 24) {
        drawRect(rx, H - 6, 12, 2, '#F59E0B');
      }
    };

    const drawFactoryFloor = (t: number, emps: Employee[], heads: number, linesCount: number, reg: MacroRegime) => {
      // Industrial concrete tiled floor
      for (let gy = 22; gy < H; gy += 12) {
        for (let gx = 0; gx < W; gx += 12) {
          const odd = ((gx / 12 + gy / 12) | 0) % 2 === 0;
          drawRect(gx, gy, 12, 12, odd ? '#E2E8F0' : '#CBD5E1');
        }
      }

      // Factory brick/steel wall & skylight windows
      drawRect(0, 0, W, 22, '#334155');
      drawRect(0, 22, W, 3, '#1B1929');
      const skyColor = reg === 'RECESSION' ? '#94A3B8' : '#38BDF8';
      for (let wx = 14; wx < W - 24; wx += 48) {
        drawRect(wx, 4, 30, 13, '#1B1929');
        drawRect(wx + 2, 6, 26, 9, skyColor);
      }

      // Yellow safety hazard stripes on shipping bay right side
      for (let sy = 30; sy < H - 10; sy += 10) {
        drawRect(244, sy, 6, 5, (sy / 10) % 2 === 0 ? '#F59E0B' : '#1B1929');
      }
      // Shipping Pallets
      drawRect(252, 44, 22, 18, '#92400E');
      drawRect(254, 46, 18, 12, '#D97706');
      drawRect(252, 82, 22, 18, '#92400E');
      drawRect(254, 84, 18, 12, '#D97706');

      // Conveyor Belts (up to 3 visible assembly lines)
      const visibleLines = Math.min(3, Math.max(1, linesCount));
      const lineYs = [42, 74, 104];
      for (let li = 0; li < visibleLines; li++) {
        const ly = lineYs[li];
        // Belt base
        drawRect(18, ly, 214, 12, '#1B1929');
        drawRect(20, ly + 2, 210, 8, '#475569');

        // Moving belt treads
        const treadShift = reducedMotion ? 0 : Math.floor(t * 0.5) % 10;
        for (let tx = 20 + treadShift; tx < 226; tx += 10) {
          drawRect(tx, ly + 2, 2, 8, '#64748B');
        }

        // Robotic stamping arm
        const pressOffset = reducedMotion ? 0 : Math.max(0, Math.round(Math.sin(t * 0.14 + li) * 3));
        drawRect(108, ly - 10, 18, 10, '#1E293B');
        drawRect(113, ly - 4 + pressOffset, 8, 6, '#F59E0B');
        if (!reducedMotion && pressOffset > 2) {
          drawRect(111, ly + 2, 2, 2, '#FDE047');
          drawRect(121, ly + 2, 2, 2, '#FDE047');
        }

        // Moving crates on conveyor
        for (let ci = 0; ci < 4; ci++) {
          const cx = 24 + ((Math.floor(t * (reducedMotion ? 0 : 0.6)) + ci * 52 + li * 17) % 196);
          drawRect(cx, ly + 1, 11, 9, '#1B1929');
          drawRect(cx + 1, ly + 2, 9, 7, cx > 118 ? '#10B981' : '#FBBF24'); // turns emerald after QA stamp!
        }
      }

      // Animated Factory Workers (Hardhats + Safety Vests walking & inspecting lines)
      const workerCount = Math.min(12, Math.max(2, emps.length + heads));
      for (let i = 0; i < workerCount; i++) {
        const ag = agents[i];
        const lineIdx = i % visibleLines;
        const stationX = 36 + ((i * 38) % 180);
        const stationY = lineYs[lineIdx] - 8;

        if (!reducedMotion && t % 120 === (i * 19) % 120) {
          if (i % 3 === 0) {
            // Walk to shipping bay
            ag.tx = 236;
            ag.ty = 54 + (i % 2) * 36;
          } else {
            ag.tx = stationX + ((i % 2 === 0 ? 1 : -1) * 14);
            ag.ty = stationY;
          }
        }
        if (!reducedMotion) {
          ag.x += (ag.tx - ag.x) * 0.09;
          ag.y += (ag.ty - ag.y) * 0.09;
        } else {
          ag.x = stationX;
          ag.y = stationY;
        }

        const stepBob = reducedMotion ? 0 : Math.round(Math.sin(t * 0.24 + ag.phase) * 1);
        const ax = Math.round(ag.x);
        const ay = Math.round(ag.y) + stepBob;

        // Outline + Hardhat + Safety Vest
        drawRect(ax - 1, ay - 10, 10, 15, '#1B1929');
        drawRect(ax - 1, ay - 11, 10, 3, '#FACC15'); // yellow hardhat!
        drawRect(ax, ay - 8, 8, 5, '#FDE68A'); // face
        drawRect(ax, ay - 3, 8, 6, '#F97316'); // orange vest
        drawRect(ax + 3, ay - 3, 2, 6, '#FEF08A'); // reflective stripe
      }
    };

    const drawOfficeFloor = (t: number) => {
      const {
        sector: sec,
        employees: emps,
        macroRegime: reg,
        hasDeptHeads: heads,
        factoryLines: lines,
      } = stateRef.current;

      if (sec === 'MANUFACTURING') {
        drawFactoryFloor(t, emps, heads, lines, reg);
      } else {
        const floorA =
          sec === 'CRYPTO_EXCHANGE'
            ? '#E7EEF8'
            : sec === 'AI_LAB'
            ? '#EEE9FA'
            : sec === 'HOLDING_CO'
            ? '#F3EAD8'
            : '#F3ECE0';
        const floorB =
          sec === 'CRYPTO_EXCHANGE'
            ? '#DCE6F5'
            : sec === 'AI_LAB'
            ? '#E3DCF5'
            : sec === 'HOLDING_CO'
            ? '#E9DEC7'
            : '#EAE1D0';

        for (let gy = 18; gy < H; gy += 12) {
          for (let gx = 0; gx < W; gx += 12) {
            const odd = ((gx / 12 + gy / 12) | 0) % 2 === 0;
            drawRect(gx, gy, 12, 12, odd ? floorA : floorB);
          }
        }

        drawRect(0, 0, W, 22, '#2B2640');
        drawRect(0, 22, W, 3, '#1B1929');
        const skyColor =
          reg === 'RECESSION' || reg === 'CRYPTO_WINTER'
            ? '#64748B'
            : reg === 'BOOM' || reg === 'AI_MANIA'
            ? '#38BDF8'
            : '#60A5FA';

        for (let wx = 14; wx < W - 40; wx += 44) {
          drawRect(wx, 4, 28, 14, '#1B1929');
          drawRect(wx + 2, 6, 24, 10, skyColor);
          drawRect(wx + 13, 6, 2, 10, '#1B1929');
        }

        if (sec === 'HOLDING_CO') {
          // Executive Mahogany Boardroom Table & Global Wall Map
          drawRect(60, 46, 130, 48, '#1B1929');
          drawRect(63, 49, 124, 42, '#78350F');
          drawRect(66, 52, 118, 36, '#92400E');
          // Map Monitor
          drawRect(222, 30, 46, 28, '#1B1929');
          drawRect(225, 33, 40, 22, '#0F172A');
          drawRect(229, 37, 12, 8, '#10B981');
          drawRect(245, 41, 14, 10, '#38BDF8');
        } else if (sec === 'CRYPTO_EXCHANGE' || sec === 'AI_LAB') {
          for (let sx = 232; sx < 272; sx += 14) {
            drawRect(sx, 28, 11, 28, '#1E293B');
            drawRect(sx + 1, 29, 9, 26, '#334155');
            const blink = (Math.floor(t / 15) + sx) % 2 === 0;
            drawRect(sx + 3, 33, 2, 2, blink ? '#10B981' : '#38BDF8');
            drawRect(sx + 6, 39, 2, 2, blink ? '#F59E0B' : '#10B981');
            drawRect(sx + 3, 45, 5, 2, '#64748B');
          }
        } else {
          drawRect(230, 30, 38, 18, '#78350F');
          drawRect(232, 32, 34, 10, '#B45309');
          drawRect(240, 28, 8, 6, '#E2E8F0');
          drawRect(243, 25, 2, 2, '#FFFFFF');
        }

        [[10, 28], [262, 104]].forEach(([px, py]) => {
          drawRect(px, py + 8, 10, 7, '#B45309');
          drawRect(px - 2, py + 2, 14, 7, '#10B981');
          drawRect(px + 2, py - 2, 6, 5, '#34D399');
        });

        const deskCoords = [
          [24, 48], [76, 48], [128, 48], [180, 48],
          [24, 90], [76, 90], [128, 90], [180, 90],
        ];

        if (sec !== 'HOLDING_CO') {
          deskCoords.forEach(([dx, dy], idx) => {
            drawRect(dx + 2, dy + 14, 34, 4, 'rgba(27,25,41,0.18)');
            drawRect(dx, dy, 34, 15, '#1B1929');
            drawRect(dx + 2, dy + 2, 30, 11, '#D97706');
            drawRect(dx + 2, dy + 2, 30, 3, '#FBBF24');
            drawRect(dx + 10, dy - 6, 14, 10, '#1B1929');
            const activeDesk = idx < Math.max(1, emps.length + heads);
            const screenGlow = activeDesk
              ? (Math.floor(t / 30) + idx) % 2 === 0
                ? '#38BDF8'
                : '#34D399'
              : '#475569';
            drawRect(dx + 12, dy - 4, 10, 6, screenGlow);
          });
        }

        const workerCount = Math.min(agents.length, Math.max(1, emps.length + heads));
        for (let i = 0; i < workerCount; i++) {
          const emp = emps[i];
          const ag = agents[i];
          const shirt = emp ? ROLE_SHIRT[emp.role] || '#2563EB' : '#7C3AED';
          const seat = deskCoords[i % deskCoords.length];

          if (!reducedMotion && t % 180 === (i * 23) % 180) {
            if (Math.random() < 0.35) {
              ag.tx = 225 + (i % 3) * 10;
              ag.ty = 56 + (i % 2) * 14;
            } else {
              ag.tx = seat[0] + 13;
              ag.ty = seat[1] + 16;
            }
          }

          if (!reducedMotion) {
            ag.x += (ag.tx - ag.x) * 0.08;
            ag.y += (ag.ty - ag.y) * 0.08;
          } else {
            ag.x = seat[0] + 13;
            ag.y = seat[1] + 16;
          }

          const bob = reducedMotion ? 0 : Math.round(Math.sin(t * 0.16 + ag.phase) * 0.7);
          const ax = Math.round(ag.x);
          const ay = Math.round(ag.y) + bob;

          drawRect(ax - 1, ay - 9, 10, 14, '#1B1929');
          drawRect(ax, ay - 8, 8, 5, '#FDE68A');
          drawRect(ax, ay - 9, 8, 3, ag.hair);
          drawRect(ax, ay - 3, 8, 6, shirt);

          if ((Math.floor(t / 45) + i * 3) % 7 === 0) {
            drawRect(ax - 2, ay - 19, 12, 8, '#FFFDF7');
            ctx.fillStyle = '#1B1929';
            ctx.font = 'bold 6px monospace';
            ctx.fillText(ag.bubble || 'OK', ax, ay - 13);
          }
        }
      }

      // Draw animated floating pixel coins on cash inflow!
      coinsRef.current = coinsRef.current.filter((c) => c.life > 0);
      for (const coin of coinsRef.current) {
        coin.y -= coin.vy;
        coin.life -= 1;
        const cx = Math.round(coin.x);
        const cy = Math.round(coin.y);
        drawRect(cx - 1, cy - 1, 9, 9, '#1B1929');
        drawRect(cx, cy, 7, 7, '#FACC15');
        drawRect(cx + 2, cy + 1, 3, 5, '#FEF08A');
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(coin.label, cx + 10, cy + 6);
      }
    };

    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, W, H);
      if (stateRef.current.mode === 'TITLE_CITY') {
        drawTitleCity(tick);
      } else {
        drawOfficeFloor(tick);
      }
      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      data-testid={mode === 'TITLE_CITY' ? 'title-pixel-canvas' : 'office-pixel-canvas'}
      className={`pixel-canvas block w-full h-full ${className}`}
    />
  );
};
