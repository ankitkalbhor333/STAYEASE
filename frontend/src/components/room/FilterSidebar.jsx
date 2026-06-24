import { useState } from "react";

export default function FilterSidebar({ onFilter }) {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [roomType, setRoomType] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [guests, setGuests] = useState("");

  const roomTypes = ["Entire Place", "Private Room", "Shared Room"];
  const amenityOptions = ["WiFi", "Kitchen", "Pool", "Gym", "Parking", "Air Conditioning"];

  const handleAmenityChange = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    onFilter({
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      roomType,
      amenities,
      guests,
    });
  };

  const resetFilters = () => {
    setPriceRange([0, 500]);
    setRoomType("");
    setAmenities([]);
    setGuests("");
    onFilter({});
  };

  return (
    <div className="w-full md:w-72 bg-white border-r border-slate-100 p-6 md:p-8 sticky top-0 h-fit">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Filters</h2>

      {/* Price Range */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-800 mb-4">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      {/* Room Type */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Room Type</h3>
        <div className="space-y-2">
          {roomTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="roomType"
                value={type}
                checked={roomType === type}
                onChange={(e) => setRoomType(e.target.value)}
                className="rounded"
              />
              <span className="text-sm text-slate-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenityOptions.map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="rounded"
              />
              <span className="text-sm text-slate-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Number of Guests */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-800 mb-3">
          Number of Guests
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          <option value="">Any</option>
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="4">4 Guests</option>
          <option value="6">6+ Guests</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          onClick={applyFilters}
          className="w-full bg-[#B40032] text-white font-semibold py-2.5 rounded-lg hover:bg-[#8c0126] transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="w-full border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
