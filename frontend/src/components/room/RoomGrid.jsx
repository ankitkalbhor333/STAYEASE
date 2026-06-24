import { Link } from "react-router-dom";

export default function RoomGrid({ rooms }) {
  return (
    <div className="flex-1 p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
        {rooms.length} Stays Available
      </h2>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No rooms match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link
              key={room._id}
              to={`/rooms/${room._id}`}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg mb-3 bg-slate-200 h-64">
                <img
                  src={
                    room.images?.[0]?.imageUrl ||
                    room.images?.[0] ||
                    "/placeholder.png"
                  }
                  alt={room.title || room.propertyType || "Room"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {room.isFavorited && (
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
                    <svg
                      className="w-5 h-5 text-[#B40032]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 group-hover:text-[#B40032] transition-colors">
                  {room.city || room.state || room.country || room.fullAddress || "Unknown location"}
                </h3>
                <p className="text-sm text-slate-600 truncate">{room.title || room.propertyType || "Cozy stay"}</p>
                <div className="flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">
                    {room.averageRating?.toFixed(1) || room.rating || 4.8}
                  </span>
                  <span className="text-slate-500">({room.totalReviews || room.reviews || 0} reviews)</span>
                </div>
                <p className="font-bold text-slate-900">
                  ${room.pricePerDay || room.price || 0} <span className="text-sm font-normal text-slate-600">/ night</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
