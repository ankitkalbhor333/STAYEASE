import { useState } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";

export default function LocationForm({ roomId, next, room }) {
  const [city, setCity] = useState(room?.city || "");
  const [state, setState] = useState(room?.state || "");
  const [country, setCountry] = useState(room?.country || "");
  const [fullAddress, setFullAddress] = useState(room?.fullAddress || "");
  const [pincode, setPincode] = useState(room?.pincode || "");
  const [area, setArea] = useState(room?.area || "");
  const [phoneNumber, setPhoneNumber] = useState(room?.phoneNumber || "");
  const [latitude, setLatitude] = useState(
    room?.location?.coordinates?.[1] || ""
  );
  const [longitude, setLongitude] = useState(
    room?.location?.coordinates?.[0] || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        city,
        state,
        country,
        fullAddress,
        pincode,
        area,
        phoneNumber,
      };
      if (latitude && longitude) {
        payload.location = {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        };
      }
      await updateRoomStepAPI(roomId, "location", payload);
      next();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save location.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">State</span>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Country</span>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Pincode</span>
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Pincode"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Address</span>
        <textarea
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="Full address"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 min-h-[120px] resize-none focus:border-[#B40032] outline-none"
        />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Phone number</span>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Contact number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Area</span>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Area / Landmark"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Latitude</span>
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            step="any"
            placeholder="Latitude"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-[#B40032] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Longitude</span>
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            step="any"
            placeholder="Longitude"
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