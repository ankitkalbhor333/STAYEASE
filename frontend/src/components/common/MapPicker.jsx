import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom red marker for StayEase brand
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Inner component that handles map click events
 */
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Inner component that flies to new position
 */
function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

/**
 * Reverse geocode coordinates using Nominatim (free, no API key needed)
 */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
      { headers: { "User-Agent": "StayEase/1.0" } }
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      return {
        fullAddress: data.display_name || "",
        city: a.city || a.town || a.village || a.municipality || "",
        state: a.state || a.county || "",
        country: a.country || "",
        pincode: a.postcode || "",
        area: a.suburb || a.neighbourhood || a.hamlet || "",
      };
    }
  } catch (err) {
    console.error("Reverse geocode error:", err);
  }
  return null;
}

/**
 * Search location using Nominatim (forward geocoding)
 */
async function searchLocation(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en`,
      { headers: { "User-Agent": "StayEase/1.0" } }
    );
    return await res.json();
  } catch (err) {
    console.error("Geocode search error:", err);
    return [];
  }
}

/**
 * MapPicker - Interactive map for selecting a location
 *
 * Props:
 *   latitude  - initial latitude (number or "")
 *   longitude - initial longitude (number or "")
 *   onLocationChange(lat, lng, addressData) - callback when location changes
 *   height    - map height (default "400px")
 *   readOnly  - if true, map is non-interactive (for display only)
 */
export default function MapPicker({
  latitude = "",
  longitude = "",
  onLocationChange,
  height = "400px",
  readOnly = false,
}) {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const initialLat = latitude ? Number(latitude) : null;
  const initialLng = longitude ? Number(longitude) : null;
  const hasInitial = initialLat !== null && initialLng !== null && !isNaN(initialLat) && !isNaN(initialLng);

  const [markerPos, setMarkerPos] = useState(hasInitial ? [initialLat, initialLng] : null);
  const [center] = useState(hasInitial ? [initialLat, initialLng] : defaultCenter);
  const [zoom] = useState(hasInitial ? 15 : 5);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const searchTimeout = useRef(null);
  const resultsRef = useRef(null);
  const [flyTo, setFlyTo] = useState(null);

  // Close results on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLocationSelect = useCallback(async (lat, lng) => {
    if (readOnly) return;

    setMarkerPos([lat, lng]);
    setFlyTo([lat, lng]);
    setGeocoding(true);

    // Reverse geocode to get address
    const address = await reverseGeocode(lat, lng);
    setGeocoding(false);

    if (onLocationChange) {
      onLocationChange(lat, lng, address);
    }
  }, [readOnly, onLocationChange]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    const results = await searchLocation(query);
    setSearchResults(results);
    setShowResults(results.length > 0);
    setSearching(false);
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearch(value), 400);
  };

  const handleResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery(result.display_name);
    setShowResults(false);
    handleLocationSelect(lat, lng);
  };

  return (
    <div className="space-y-3">
      {/* Search Box */}
      {!readOnly && (
        <div className="relative" ref={resultsRef}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search for a location..."
              className="draft-input w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 outline-none text-sm"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                Searching...
              </span>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-[1000] mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={result.place_id || i}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-[#B40032] border-b border-slate-100 last:border-0 transition"
                >
                  <span className="mr-2">📍</span>
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div
        className="rounded-2xl overflow-hidden border-2 border-slate-200 relative"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markerPos && (
            <Marker position={markerPos} icon={redIcon} />
          )}

          {!readOnly && <MapClickHandler onLocationSelect={handleLocationSelect} />}
          {flyTo && <FlyToPosition position={flyTo} />}
        </MapContainer>

        {/* Geocoding indicator */}
        {geocoding && (
          <div className="absolute top-3 right-3 z-[1000] bg-white/90 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 shadow">
            📍 Getting address...
          </div>
        )}

        {/* Instruction overlay */}
        {!readOnly && !markerPos && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 rounded-full px-4 py-2 text-xs font-medium text-slate-600 shadow">
            Click on the map to select location
          </div>
        )}
      </div>

      {/* Selected coordinates display */}
      {markerPos && (
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-100 rounded-lg px-3 py-1.5">
            📍 Lat: {markerPos[0].toFixed(6)}
          </span>
          <span className="bg-slate-100 rounded-lg px-3 py-1.5">
            📍 Lng: {markerPos[1].toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
