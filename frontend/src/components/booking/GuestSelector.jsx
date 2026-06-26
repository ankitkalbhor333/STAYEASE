import React from "react";

export default function GuestSelector({ value, onChange, maxGuests = 10 }) {
  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < maxGuests) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        Guests
      </label>
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <span className="text-sm font-semibold text-slate-800">
          {value} {value === 1 ? "Guest" : "Guests"}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= 1}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
          >
            —
          </button>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= maxGuests}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">
        Max capacity: {maxGuests} guest{maxGuests !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
