import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function PricingForm({ roomId, next, room }) {
  const [pricePerDay, setPricePerDay] = useState(room?.pricePerDay || "");
  const [pricePerWeek, setPricePerWeek] = useState(room?.pricePerWeek || "");
  const [pricePerMonth, setPricePerMonth] = useState(room?.pricePerMonth || "");
  const [cleaningFee, setCleaningFee] = useState(room?.cleaningFee || "");
  const [securityDeposit, setSecurityDeposit] = useState(room?.securityDeposit || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateRoomStepAPI(roomId, "pricing", {
        pricePerDay: Number(pricePerDay),
        pricePerWeek: Number(pricePerWeek),
        pricePerMonth: Number(pricePerMonth),
        cleaningFee: Number(cleaningFee) || 0,
        securityDeposit: Number(securityDeposit) || 0,
      });
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save pricing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price per night</span>
          <input
            type="number"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            placeholder="₹ per night"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Cleaning fee</span>
          <input
            type="number"
            value={cleaningFee}
            onChange={(e) => setCleaningFee(e.target.value)}
            placeholder="Optional"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price per week</span>
          <input
            type="number"
            value={pricePerWeek}
            onChange={(e) => setPricePerWeek(e.target.value)}
            placeholder="Optional"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price per month</span>
          <input
            type="number"
            value={pricePerMonth}
            onChange={(e) => setPricePerMonth(e.target.value)}
            placeholder="Optional"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Security deposit</span>
        <input
          type="number"
          value={securityDeposit}
          onChange={(e) => setSecurityDeposit(e.target.value)}
          placeholder="Optional"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="rounded-2xl bg-[#B40032] px-6 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
      >
        {saving ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}