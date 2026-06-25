import React from "react";

export default function ProgressBar({ progress, color = "#B40032" }) {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
