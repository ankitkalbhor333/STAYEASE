import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function PricingForm({ roomId, next, back, room }) {
  const [pricePerDay, setPricePerDay] = useState(room?.pricePerDay || "");
  const [pricePerWeek, setPricePerWeek] = useState(room?.pricePerWeek || "");
  const [pricePerMonth, setPricePerMonth] = useState(room?.pricePerMonth || "");
  const [cleaningFee, setCleaningFee] = useState(room?.cleaningFee || "");
  const [securityDeposit, setSecurityDeposit] = useState(room?.securityDeposit || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!pricePerDay || Number(pricePerDay) <= 0) {
      errors.pricePerDay = "Price per night is required and must be greater than 0";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

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

  const inputCls = (field) =>
    `draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ${fieldErrors[field] ? "input-error" : ""}`;

  return (
    <div className="space-y-6">
      <div className="form-section-header">
        <span className="icon">💰</span>
        <h3>Pricing</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price per night <span className="text-red-400">*</span></span>
          <input
            type="number"
            value={pricePerDay}
            onChange={(e) => { setPricePerDay(e.target.value); setFieldErrors((p) => ({...p, pricePerDay: ""})); }}
            placeholder="₹ per night"
            className={inputCls("pricePerDay")}
          />
          {fieldErrors.pricePerDay && <p className="field-error-text">⚠ {fieldErrors.pricePerDay}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Cleaning fee <span className="text-xs text-slate-400">(optional)</span></span>
          <input
            type="number"
            value={cleaningFee}
            onChange={(e) => setCleaningFee(e.target.value)}
            placeholder="Optional"
            className="draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price per week <span className="text-xs text-slate-400">(optional)</span></span>
          <input
            type="number"
            value={pricePerWeek}
            onChange={(e) => setPricePerWeek(e.target.value)}
            placeholder="Optional"
            className="draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Price per month <span className="text-xs text-slate-400">(optional)</span></span>
          <input
            type="number"
            value={pricePerMonth}
            onChange={(e) => setPricePerMonth(e.target.value)}
            placeholder="Optional"
            className="draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Security deposit <span className="text-xs text-slate-400">(optional)</span></span>
        <input
          type="number"
          value={securityDeposit}
          onChange={(e) => setSecurityDeposit(e.target.value)}
          placeholder="Optional"
          className="draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 fade-in-up">
          {error}
        </div>
      )}

      <div className="form-btn-group">
        {back && (
          <button type="button" onClick={back} className="btn-back">
            ← Back
          </button>
        )}
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}