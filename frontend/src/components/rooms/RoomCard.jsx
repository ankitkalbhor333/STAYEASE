import { Link } from "react-router-dom";

export default function RoomCard({ room }) {
  const imageUrl =
    room.images?.[0]?.imageUrl || room.images?.[0] || "/placeholder.png";
  const locationLabel =
    room.city || room.state || room.fullAddress || room.location || "Unknown location";
  const rating = room.averageRating?.toFixed(1) || room.rating || 4.8;
  const reviews = room.totalReviews || room.reviews || "New";
  const price = room.pricePerDay || room.price || 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-72 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={room.title || "Room image"}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-4 px-4 flex flex-wrap items-start justify-between gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
            {room.propertyType || "Stay"}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
            {room.city || room.state || room.country || "Location"}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900">
            {room.title || "Cozy stay"}
          </h3>
          <p className="text-sm text-slate-500 truncate">{locationLabel}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-slate-900">{rating}</span>
            <span className="text-slate-500">({reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{room.bedrooms ?? room.beds ? `${room.bedrooms || room.beds} beds` : "Flexible"}</span>
            <span>•</span>
            <span>{room.bathrooms ? `${room.bathrooms} bath${room.bathrooms !== 1 ? "s" : ""}` : "—"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div>
            <p className="text-lg font-bold text-slate-900">${price}</p>
            <p className="text-sm text-slate-500">/ night</p>
          </div>
          <Link
            to={`/rooms/${room._id}`}
            className="inline-flex items-center rounded-full bg-[#B40032] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#900028]"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
