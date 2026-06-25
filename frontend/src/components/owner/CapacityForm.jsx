import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function CapacityForm({ roomId, next, back, room }) {
  const [maxGuests, setMaxGuests] = useState(room?.maxGuests || "");
  const [bedrooms, setBedrooms] = useState(room?.bedrooms || "");
  const [beds, setBeds] = useState(room?.beds || "");
  const [bathrooms, setBathrooms] = useState(room?.bathrooms || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!maxGuests || Number(maxGuests) < 1) errors.maxGuests = "At least 1 guest required";
    if (!bedrooms || Number(bedrooms) < 1) errors.bedrooms = "At least 1 bedroom required";
    if (!beds || Number(beds) < 1) errors.beds = "At least 1 bed required";
    if (!bathrooms || Number(bathrooms) < 1) errors.bathrooms = "At least 1 bathroom required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    setError("");
    try {
      await updateRoomStepAPI(roomId, "capacity", {
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        bathrooms: Number(bathrooms),
      });
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save capacity.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ${fieldErrors[field] ? "input-error" : ""}`;

  const clearError = (field) => setFieldErrors((p) => ({ ...p, [field]: "" }));

  return (
    <div className="space-y-6">
      <div className="form-section-header">
        <span className="icon">🛏️</span>
        <h3>Capacity</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Guests <span className="text-red-400">*</span></span>
          <input
            type="number"
            value={maxGuests}
            onChange={(e) => { setMaxGuests(e.target.value); clearError("maxGuests"); }}
            placeholder="How many guests"
            min="1"
            className={inputCls("maxGuests")}
          />
          {fieldErrors.maxGuests && <p className="field-error-text">⚠ {fieldErrors.maxGuests}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Bedrooms <span className="text-red-400">*</span></span>
          <input
            type="number"
            value={bedrooms}
            onChange={(e) => { setBedrooms(e.target.value); clearError("bedrooms"); }}
            placeholder="Number of bedrooms"
            min="1"
            className={inputCls("bedrooms")}
          />
          {fieldErrors.bedrooms && <p className="field-error-text">⚠ {fieldErrors.bedrooms}</p>}
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Beds <span className="text-red-400">*</span></span>
          <input
            type="number"
            value={beds}
            onChange={(e) => { setBeds(e.target.value); clearError("beds"); }}
            placeholder="Number of beds"
            min="1"
            className={inputCls("beds")}
          />
          {fieldErrors.beds && <p className="field-error-text">⚠ {fieldErrors.beds}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Bathrooms <span className="text-red-400">*</span></span>
          <input
            type="number"
            value={bathrooms}
            onChange={(e) => { setBathrooms(e.target.value); clearError("bathrooms"); }}
            placeholder="Number of bathrooms"
            min="1"
            className={inputCls("bathrooms")}
          />
          {fieldErrors.bathrooms && <p className="field-error-text">⚠ {fieldErrors.bathrooms}</p>}
        </label>
      </div>

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