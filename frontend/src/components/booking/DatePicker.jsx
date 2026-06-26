import React from "react";

export default function DatePicker({ label, value, onChange, minDate }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B40032] focus:border-transparent transition duration-200 cursor-pointer shadow-sm hover:border-slate-300"
        />
      </div>
    </div>
  );
}
