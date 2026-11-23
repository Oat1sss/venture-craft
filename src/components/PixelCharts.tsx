import React from 'react';

interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const PixelSparkline: React.FC<SparklineProps> = ({
  values,
  color = '#10B981',
  height = 44,
  width = 160,
}) => {
  if (!values || values.length < 2) {
    return (
      <div
        className="flex items-center justify-center bg-[#f0ead8] border border-[#1b1929]/30 text-[11px] font-mono-num text-[#5b5670]"
        style={{ width, height }}
      >
        No history
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4;

  const points = values.map((v, idx) => {
    const x = pad + (idx / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPoints = `${pad},${height - pad} ${points.join(' ')} ${width - pad},${height - pad}`;
  const trendUp = values[values.length - 1] >= values[0];
  const stroke = color === 'auto' ? (trendUp ? '#059669' : '#E11D48') : color;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="bg-[#f6f1e4] border-2 border-[#1b1929] shrink-0"
      aria-label="Trend sparkline"
    >
      <polygon points={areaPoints} fill={stroke} fillOpacity="0.16" />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="miter"
        points={points.join(' ')}
      />
      {values.map((v, idx) => {
        if (idx !== values.length - 1) return null;
        const x = width - pad;
        const y = height - pad - ((v - min) / span) * (height - pad * 2);
        return <rect key={idx} x={x - 3} y={y - 3} width={6} height={6} fill={stroke} stroke="#1b1929" strokeWidth="1" />;
      })}
    </svg>
  );
};
