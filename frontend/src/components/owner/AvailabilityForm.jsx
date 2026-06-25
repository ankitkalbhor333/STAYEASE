import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function AvailabilityForm({ roomId, next, room }) {
  const [availableFrom, setAvailableFrom] = useState(
    room?.availableFrom ? room.availableFrom.slice(0, 10) : ""
  );
  const [availableTo, setAvailableTo] = useState(
    room?.availableTo ? room.availableTo.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateRoomStepAPI(roomId, "availability", {
        availableFrom,
        availableTo,
      });
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Add availability dates so guests can see when the room is bookable.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Available from</span>
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Available to</span>
          <input
            type="date"
            value={availableTo}
            onChange={(e) => setAvailableTo(e.target.value)}
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
        {saving ? "Saving..." : "Save availability"}
      </button>
    </div>
  );
}
