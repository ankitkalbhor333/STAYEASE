import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

const amenityOptions = [
  { label: "WiFi", value: "wifi" },
  { label: "Air conditioning", value: "airConditioner" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Washing machine", value: "washingMachine" },
  { label: "Parking", value: "parking" },
  { label: "TV", value: "tv" },
  { label: "Hot water", value: "geyser" },
];

export default function AmenitiesForm({ roomId, next, room }) {
  const initialAmenities = room?.amenities || {};
  const [selectedAmenities, setSelectedAmenities] = useState(
    Object.keys(initialAmenities).filter((key) => initialAmenities[key])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const save = async () => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {amenityOptions.map((amenity) => (
          <button
            key={amenity.value}
            type="button"
            onClick={() => toggleAmenity(amenity.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              selectedAmenities.includes(amenity.value)
                ? "border-[#B40032] bg-[#fee2e2]"
                : "border-slate-200 bg-white hover:border-[#B40032]"
            }`}
          >
            {amenity.label}
          </button>
        ))}
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