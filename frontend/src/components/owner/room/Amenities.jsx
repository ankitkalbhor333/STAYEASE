export default function Amenities({ amenities = [] }) {
  const amenityIcons = {
    "WiFi": "📶",
    "Kitchen": "🍳",
    "Pool": "🏊",
    "Gym": "💪",
    "Parking": "🚗",
    "Air Conditioning": "❄️",
    "TV": "📺",
    "Washer": "🧺",
    "Dryer": "🧽",
    "Heating": "🔥",
    "Hot Tub": "🛁",
    "Balcony": "🪟",
  };

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Amenities</h2>

      {amenities && amenities.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{amenityIcons[amenity] || "✨"}</span>
              <span className="font-medium text-slate-700 text-sm">{amenity}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">No amenities listed for this room.</p>
      )}
    </div>
  );
}
