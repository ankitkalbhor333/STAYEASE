import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function RoomBasicForm({ roomId, next, room }) {
  const [title, setTitle] = useState(room?.title || "");
  const [description, setDescription] = useState(room?.description || "");
  const [propertyType, setPropertyType] = useState(room?.propertyType || "Apartment");
  const [roomType, setRoomType] = useState(room?.roomType || "Entire Place");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateRoomStepAPI(roomId, "basic", {
        title,
        description,
        propertyType,
        roomType,
      });
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save room basic info.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Room title"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your space"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 min-h-[140px] resize-none focus:border-[#B40032] outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-semibold text-slate-700">Property Type</span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          >
            <option>Apartment</option>
            <option>House</option>
            <option>Villa</option>
            <option>PG</option>
            <option>Hostel</option>
            <option>Flat</option>
            <option>Room</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-slate-700">Room Type</span>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          >
            <option>Entire Place</option>
            <option>Private Room</option>
            <option>Shared Room</option>
          </select>
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