import { useState, useMemo, useCallback } from "react";
import { updateRoomStepAPI } from "../../api/owner.api";
import countryData, { countryCodes } from "../../utils/countryData";
import MapPicker from "../common/MapPicker";

export default function LocationForm({ roomId, next, back, room }) {
  const [country, setCountry] = useState(room?.country || "");
  const [state, setState] = useState(room?.state || "");
  const [city, setCity] = useState(room?.city || "");
  const [fullAddress, setFullAddress] = useState(room?.fullAddress || "");
  const [pincode, setPincode] = useState(room?.pincode || "");
  const [area, setArea] = useState(room?.area || "");
  const [phoneCode, setPhoneCode] = useState(() => {
    if (room?.country && countryCodes[room.country]) return countryCodes[room.country];
    return "+91";
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const num = room?.phoneNumber || "";
    for (const code of Object.values(countryCodes)) {
      if (num.startsWith(code)) return num.slice(code.length).trim();
    }
    return num;
  });
  const [latitude, setLatitude] = useState(room?.location?.coordinates?.[1] || "");
  const [longitude, setLongitude] = useState(room?.location?.coordinates?.[0] || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Derived lists
  const countries = useMemo(() => Object.keys(countryData).sort(), []);
  const states = useMemo(() => {
    if (!country || !countryData[country]) return [];
    return Object.keys(countryData[country]).sort();
  }, [country]);
  const cities = useMemo(() => {
    if (!country || !state || !countryData[country]?.[state]) return [];
    return [...countryData[country][state]].sort();
  }, [country, state]);

  const handleCountryChange = (val) => {
    setCountry(val);
    setState("");
    setCity("");
    setFieldErrors((p) => ({ ...p, country: "" }));
    if (countryCodes[val]) setPhoneCode(countryCodes[val]);
  };

  const handleStateChange = (val) => {
    setState(val);
    setCity("");
    setFieldErrors((p) => ({ ...p, state: "" }));
  };

  // When map location is picked, auto-fill address fields
  const handleMapLocationChange = useCallback((lat, lng, addressData) => {
    setLatitude(lat);
    setLongitude(lng);

    if (addressData) {
      // Auto-fill address fields from reverse geocoding
      if (addressData.fullAddress && !fullAddress.trim()) {
        setFullAddress(addressData.fullAddress);
      }
      if (addressData.pincode && !pincode.trim()) {
        setPincode(addressData.pincode);
      }
      if (addressData.area) {
        setArea(addressData.area);
      }

      // Try to match country from map to our dropdown data
      if (addressData.country) {
        const matchedCountry = Object.keys(countryData).find(
          (c) => c.toLowerCase() === addressData.country.toLowerCase()
        );
        if (matchedCountry && !country) {
          setCountry(matchedCountry);
          if (countryCodes[matchedCountry]) setPhoneCode(countryCodes[matchedCountry]);

          // Try to match state
          if (addressData.state && countryData[matchedCountry]) {
            const matchedState = Object.keys(countryData[matchedCountry]).find(
              (s) => s.toLowerCase() === addressData.state.toLowerCase()
            );
            if (matchedState) {
              setState(matchedState);
              // Try to match city
              if (addressData.city && countryData[matchedCountry][matchedState]) {
                const matchedCity = countryData[matchedCountry][matchedState].find(
                  (c) => c.toLowerCase() === addressData.city.toLowerCase()
                );
                if (matchedCity) setCity(matchedCity);
              }
            }
          }
        }
      }
    }
  }, [country, fullAddress, pincode]);

  const validatePhone = (num) => {
    const cleaned = num.replace(/[\s\-()]/g, "");
    return /^\d{7,15}$/.test(cleaned);
  };

  const validate = () => {
    const errors = {};
    if (!country) errors.country = "Country is required";
    if (!state) errors.state = "State is required";
    if (!city) errors.city = "City is required";
    if (!fullAddress.trim()) errors.fullAddress = "Address is required";
    if (!pincode.trim()) errors.pincode = "Pincode is required";
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(phoneNumber)) {
      errors.phoneNumber = "Enter a valid phone number (7-15 digits)";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field) => {
    setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const save = async () => {
    if (!validate()) return;

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
        phoneNumber: `${phoneCode} ${phoneNumber.replace(/[\s\-()]/g, "")}`,
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

  const inputCls = (field) =>
    `draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ${fieldErrors[field] ? "input-error" : ""}`;
  const selectCls = (field) =>
    `draft-select mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ${fieldErrors[field] ? "input-error" : ""}`;

  return (
    <div className="space-y-6">
      <div className="form-section-header">
        <span className="icon">📍</span>
        <h3>Location Details</h3>
      </div>

      {/* ── Interactive Map ── */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          📌 Pin your location on the map
        </label>
        <p className="text-xs text-slate-400">
          Search or click on the map to set your property location. Address fields will auto-fill.
        </p>
        <MapPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={handleMapLocationChange}
          height="350px"
        />
      </div>

      {/* Country / State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Country <span className="text-red-400">*</span></span>
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={selectCls("country")}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {fieldErrors.country && <p className="field-error-text">⚠ {fieldErrors.country}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">State <span className="text-red-400">*</span></span>
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className={selectCls("state")}
            disabled={!country}
          >
            <option value="">{country ? "Select state" : "Select country first"}</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {fieldErrors.state && <p className="field-error-text">⚠ {fieldErrors.state}</p>}
        </label>
      </div>

      {/* City / Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">City <span className="text-red-400">*</span></span>
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); clearFieldError("city"); }}
            className={selectCls("city")}
            disabled={!state}
          >
            <option value="">{state ? "Select city" : "Select state first"}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {fieldErrors.city && <p className="field-error-text">⚠ {fieldErrors.city}</p>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Pincode <span className="text-red-400">*</span></span>
          <input
            value={pincode}
            onChange={(e) => { setPincode(e.target.value); clearFieldError("pincode"); }}
            placeholder="Postal / Zip code"
            className={inputCls("pincode")}
          />
          {fieldErrors.pincode && <p className="field-error-text">⚠ {fieldErrors.pincode}</p>}
        </label>
      </div>

      {/* Address */}
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Full Address <span className="text-red-400">*</span></span>
        <textarea
          value={fullAddress}
          onChange={(e) => { setFullAddress(e.target.value); clearFieldError("fullAddress"); }}
          placeholder="Street address, building name, floor, etc."
          className={`draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 min-h-[100px] resize-none outline-none ${fieldErrors.fullAddress ? "input-error" : ""}`}
        />
        {fieldErrors.fullAddress && <p className="field-error-text">⚠ {fieldErrors.fullAddress}</p>}
      </label>

      {/* Phone / Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-semibold text-slate-700">Phone number <span className="text-red-400">*</span></span>
          <div className="phone-input-group mt-2">
            <select
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              className="draft-select phone-code-select border border-slate-200 px-2 py-3 outline-none"
            >
              {Object.entries(countryCodes)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, code]) => (
                  <option key={name} value={code}>{code}</option>
                ))}
            </select>
            <input
              value={phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9\s\-]/g, "");
                setPhoneNumber(val);
                clearFieldError("phoneNumber");
              }}
              placeholder="Phone number"
              className={`draft-input phone-number-input border border-slate-200 px-4 py-3 outline-none ${fieldErrors.phoneNumber ? "input-error" : ""}`}
            />
          </div>
          {fieldErrors.phoneNumber && <p className="field-error-text">⚠ {fieldErrors.phoneNumber}</p>}
          <p className="text-xs text-slate-400 mt-1">Format: 7-15 digits (e.g. 9876543210)</p>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Area / Landmark</span>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Nearby landmark or area"
            className="draft-input mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          />
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