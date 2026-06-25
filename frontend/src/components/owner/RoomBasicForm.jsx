import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function RoomBasicForm({ roomId, next, back, room }) {
  const [title, setTitle] = useState(room?.title || "");
  const [description, setDescription] = useState(room?.description || "");
  const [propertyType, setPropertyType] = useState(room?.propertyType || "Apartment");
  const [roomType, setRoomType] = useState(room?.roomType || "Entire Place");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!title.trim() || title.trim().length < 3) {
      errors.title = "Title is required (min 3 characters)";
    }
    if (!description.trim() || description.trim().length < 10) {
      errors.description = "Description is required (min 10 characters)";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

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
      <div className="form-section-header">
        <span className="icon">📝</span>
        <h3>Basic Information</h3>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-700">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({...p, title: ""})); }}
          placeholder="e.g. Cozy Studio in Downtown"
          className={`draft-input w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ${fieldErrors.title ? "input-error" : ""}`}
        />
        {fieldErrors.title && <p className="field-error-text">⚠ {fieldErrors.title}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-700">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({...p, description: ""})); }}
          placeholder="Describe your space — what makes it special?"
          className={`draft-input w-full rounded-2xl border border-slate-200 px-4 py-3 min-h-[140px] resize-none outline-none ${fieldErrors.description ? "input-error" : ""}`}
        />
        {fieldErrors.description && <p className="field-error-text">⚠ {fieldErrors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-semibold text-slate-700">Property Type</span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="draft-select mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
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
            className="draft-select mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option>Entire Place</option>
            <option>Private Room</option>
            <option>Shared Room</option>
          </select>
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