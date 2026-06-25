import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function CapacityForm({ roomId, next, room }) {
  const [maxGuests, setMaxGuests] = useState(room?.maxGuests || "");
  const [bedrooms, setBedrooms] = useState(room?.bedrooms || "");
  const [beds, setBeds] = useState(room?.beds || "");
  const [bathrooms, setBathrooms] = useState(room?.bathrooms || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Guests</span>
          <input
            type="number"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
            placeholder="How many guests"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Bedrooms</span>
          <input
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            placeholder="Number of bedrooms"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Beds</span>
          <input
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            placeholder="Number of beds"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Bathrooms</span>
          <input
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            placeholder="Number of bathrooms"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
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