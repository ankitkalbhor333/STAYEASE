import React, { useState } from "react";

export default function RevenueChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Default monthly mock data if none provided
  const chartData = data.length > 0 ? data : [
    { name: "Jan", revenue: 12000, bookings: 4 },
    { name: "Feb", revenue: 19000, bookings: 7 },
    { name: "Mar", revenue: 15000, bookings: 5 },
    { name: "Apr", revenue: 32000, bookings: 12 },
    { name: "May", revenue: 28000, bookings: 9 },
    { name: "Jun", revenue: 45000, bookings: 16 },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.revenue), 10000);
  const height = 180;
  const width = 500;
  const padding = 30;

  // Calculate points for the Line SVG path
  const points = chartData
    .map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (chartData.length - 1);
      const y = height - padding - (d.revenue / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Earnings Overview</h3>
          <p className="text-xs text-slate-400">Total monthly revenue performance</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B40032] inline-block" />
            <span>Revenue (₹)</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = padding + r * (height - padding * 2);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-medium"
                >
                  {Math.round((1 - r) * maxVal / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path
            d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
            fill="url(#grad)"
            opacity="0.15"
          />

          {/* Sparkline */}
          <polyline
            fill="none"
            stroke="#B40032"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B40032" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
          </defs>

          {/* Data nodes */}
          {chartData.map((d, i) => {
            const x = padding + (i * (width - padding * 2)) / (chartData.length - 1);
            const y = height - padding - (d.revenue / maxVal) * (height - padding * 2);

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredIndex === i ? 6 : 4}
                  className="fill-white stroke-[#B40032] stroke-[3px] transition-all"
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-semibold"
                >
                  {d.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute bg-slate-900 text-white rounded-xl px-3 py-2 text-xs font-semibold shadow-md pointer-events-none transition-all duration-150 border border-slate-800"
            style={{
              left: `${(hoveredIndex * 100) / (chartData.length - 1)}%`,
              top: "-40px",
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-slate-400 text-[10px]">{chartData[hoveredIndex].name}</p>
            <p className="text-[#ff5a5f] font-bold">₹{chartData[hoveredIndex].revenue.toLocaleString()}</p>
            <p className="text-slate-300 text-[10px]">{chartData[hoveredIndex].bookings} bookings</p>
          </div>
        )}
      </div>
    </div>
  );
}
