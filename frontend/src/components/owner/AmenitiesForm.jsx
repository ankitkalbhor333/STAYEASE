import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

const amenityOptions = [
  { label: "WiFi", value: "wifi", icon: "📶" },
  { label: "Air conditioning", value: "airConditioner", icon: "❄️" },
  { label: "Kitchen", value: "kitchen", icon: "🍳" },
  { label: "Washing machine", value: "washingMachine", icon: "🧺" },
  { label: "Parking", value: "parking", icon: "🅿️" },
  { label: "TV", value: "tv", icon: "📺" },
  { label: "Hot water", value: "geyser", icon: "🚿" },
];

export default function AmenitiesForm({ roomId, next, back, room }) {
  const initialAmenities = room?.amenities || {};
  const [selectedAmenities, setSelectedAmenities] = useState(
    Object.keys(initialAmenities).filter((key) => initialAmenities[key])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};
    if (selectedAmenities.length === 0) {
      errors.amenities = "Select at least one amenity";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    setError("");
    try {
      const amenitiesObject = amenityOptions.reduce((acc, item) => {
        acc[item.value] = selectedAmenities.includes(item.value);
        return acc;
      }, {});

      await updateRoomStepAPI(roomId, "amenities", {
        amenities: amenitiesObject,
      });
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save amenities.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="form-section-header">
        <span className="icon">✨</span>
        <h3>Amenities</h3>
      </div>

      <p className="text-sm text-slate-500">Select the amenities your property offers.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {amenityOptions.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity.value);
          return (
            <button
              key={amenity.value}
              type="button"
              onClick={() => toggleAmenity(amenity.value)}
              className={`amenity-btn ${isSelected ? "selected" : ""}`}
            >
              <span className="amenity-check">{isSelected ? "✓" : ""}</span>
              <span>{amenity.icon}</span>
              <span>{amenity.label}</span>
            </button>
          );
        })}
      </div>

      {fieldErrors.amenities && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 fade-in-up">
          ⚠ {fieldErrors.amenities}
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
          {saving ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}