import React from "react";

export default function StatsCard({ label, value, icon, trend, trendType = "up" }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className="text-2xl p-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          {icon}
        </span>
      </div>
      
      <div className="flex items-baseline justify-between mt-4">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trendType === "up"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
