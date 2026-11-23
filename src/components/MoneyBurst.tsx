import React, { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../utils/format';

interface MoneyBurstProps {
  value: number;
  className?: string;
}

interface FloatingDelta {
  id: number;
  delta: number;
}

export const MoneyBurst: React.FC<MoneyBurstProps> = ({ value, className = '' }) => {
  const prevRef = useRef<number>(value);
  const idRef = useRef<number>(0);
  const [deltas, setDeltas] = useState<FloatingDelta[]>([]);

  useEffect(() => {
    const diff = value - prevRef.current;
    prevRef.current = value;
    if (Math.abs(diff) < 50) return;

    const id = ++idRef.current;
    setDeltas((curr) => [...curr.slice(-2), { id, delta: diff }]);

    const timer = window.setTimeout(() => {
      setDeltas((curr) => curr.filter((d) => d.id !== id));
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [value]);

  if (deltas.length === 0) return null;

  return (
    <span
      className={`pointer-events-none absolute right-2 top-1 z-30 flex flex-col items-end ${className}`}
      aria-hidden="true"
    >
      {deltas.map((item) => {
        const pos = item.delta > 0;
        return (
          <span
            key={item.id}
            className={`animate-money-pop inline-flex items-center gap-1 px-1.5 py-0.5 font-mono-num text-xs font-bold border-2 border-[#1B1929] shadow-[2px_2px_0_#1B1929] ${
              pos ? 'bg-[#10B981] text-[#1B1929]' : 'bg-[#E11D48] text-white'
            }`}
          >
            <span>{pos ? '+' : ''}{formatMoney(item.delta)}</span>
          </span>
        );
      })}
    </span>
  );
};
