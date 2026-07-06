import React from 'react';

// Custom SVG Chart Components for beautiful, dependency-free analytics reporting
export const BarChart = ({ data = [], height = 200, color = '#2e7d32' }) => {
  if (!data.length) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Data Available</div>;

  const maxVal = Math.max(...data.map(d => d.amount || d.soldQty || 1), 1);
  const chartHeight = height - 40;
  
  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${data.length * 70 + 40} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {data.map((d, i) => {
          const val = d.amount || d.soldQty || 0;
          const label = d.date ? d.date.split('-')[2] : d.name;
          const barHeight = (val / maxVal) * chartHeight;
          const x = i * 70 + 30;
          const y = height - barHeight - 30;

          return (
            <g key={i}>
              {/* Tooltip text on top */}
              <text x={x + 20} y={y - 8} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="bold">
                {d.amount ? `₹${val}` : val}
              </text>
              {/* Animated/Rendered Bar */}
              <rect
                x={x}
                y={y}
                width="40"
                height={barHeight}
                rx="4"
                fill={color}
                opacity="0.85"
                style={{ transition: 'all 0.5s ease-out' }}
              />
              {/* X Axis Label */}
              <text x={x + 20} y={height - 10} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                {label.length > 8 ? `${label.substring(0, 6)}..` : label}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line x1="15" y1={height - 28} x2={data.length * 70 + 30} y2={height - 28} stroke="var(--border-color)" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export const LineChart = ({ data = [], height = 200, color = '#2e7d32' }) => {
  if (!data.length) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Data Available</div>;

  const maxVal = Math.max(...data.map(d => d.amount || 1), 1);
  const chartHeight = height - 60;
  const points = data.map((d, i) => {
    const val = d.amount || 0;
    const x = i * 65 + 40;
    const y = height - ((val / maxVal) * chartHeight) - 30;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${data.length * 65 + 40} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {/* Draw Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots & Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-tertiary)" stroke={color} strokeWidth="3" />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontWeight="600">
              ₹{p.amount}
            </text>
            <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
              {p.date ? p.date.split('-')[2] : i}
            </text>
          </g>
        ))}
        <line x1="20" y1={height - 25} x2={data.length * 65 + 20} y2={height - 25} stroke="var(--border-color)" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
