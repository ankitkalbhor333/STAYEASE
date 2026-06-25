import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function AvailabilityForm({ roomId, next, back, room }) {
  const [availableFrom, setAvailableFrom] = useState(
    room?.availableFrom ? room.availableFrom.slice(0, 10) : ""
  );
  const [availableTo, setAvailableTo] = useState(
    room?.availableTo ? room.availableTo.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!availableFrom) errors.availableFrom = "Start date is required";
    if (!availableTo) errors.availableTo = "End date is required";
    if (availableFrom && availableTo && new Date(availableTo) <= new Date(availableFrom)) {
      errors.availableTo = "End date must be after start date";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateRoomStepAPI(roomId, "availability", {
        availableFrom,
        availableTo,
      });
      setSuccess("Availability saved successfully! You can now publish your listing from the sidebar.");
      // Still call next() to refresh data (it will just re-render since this is the last step)
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ${fieldErrors[field] ? "input-error" : ""}`;

  return (
    <div className="space-y-6">
      <div className="form-section-header">
        <span className="icon">📅</span>
        <h3>Availability</h3>
      </div>

      <p className="text-sm text-slate-500">
        Set the dates when your property is available for booking.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Available from <span className="text-red-400">*</span></span>
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => { setAvailableFrom(e.target.value); setFieldErrors((p) => ({...p, availableFrom: ""})); setSuccess(""); }}
            className={inputCls("availableFrom")}
          />
          {fieldErrors.availableFrom && <p className="field-error-text">⚠ {fieldErrors.availableFrom}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Available to <span className="text-red-400">*</span></span>
          <input
            type="date"
            value={availableTo}
            onChange={(e) => { setAvailableTo(e.target.value); setFieldErrors((p) => ({...p, availableTo: ""})); setSuccess(""); }}
            className={inputCls("availableTo")}
          />
          {fieldErrors.availableTo && <p className="field-error-text">⚠ {fieldErrors.availableTo}</p>}
        </label>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 fade-in-up">
          ✓ {success}
        </div>
      )}

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
          {saving ? "Saving..." : "Save availability ✓"}
        </button>
      </div>
    </div>
  );
}
