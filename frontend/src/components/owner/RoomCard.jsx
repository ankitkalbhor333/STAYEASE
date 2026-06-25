import React from "react";
import { Link } from "react-router-dom";

export default function RoomCard({ room, onView, onEdit, onDelete, onStatusUpdate }) {
  const mainImage = room.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80";
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(room.pricePerDay || 0);

  const statusColors = {
    active: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    inactive: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row gap-6 p-4">
      {/* Thumbnail */}
      <div className="w-full md:w-56 h-40 shrink-0 rounded-2xl overflow-hidden relative bg-slate-100">
        <img
          src={mainImage}
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm uppercase tracking-wider ${
            statusColors[room.status] || "bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          {room.status || "draft"}
        </span>
      </div>

      {/* Info & Details */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
              {room.title || "Untitled Listing"}
            </h3>
            <span className="text-lg font-bold text-slate-900 whitespace-nowrap">
              {formattedPrice}/day
            </span>
          </div>

          <p className="text-sm text-slate-500 mb-3">
            📍 {room.city ? `${room.city}, ${room.state}, ${room.country}` : "No location configured yet"}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div>
              <span className="font-semibold text-slate-800">Guests: </span>
              {room.maxGuests || "—"}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Bedrooms: </span>
              {room.bedrooms || "—"}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Beds: </span>
              {room.beds || "—"}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Bathrooms: </span>
              {room.bathrooms || "—"}
            </div>
            {room.averageRating > 0 && (
              <div className="flex items-center gap-1 text-amber-600 font-semibold">
                ⭐ {room.averageRating.toFixed(1)} ({room.totalReviews || 0})
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex gap-2">
            {room.status === "active" && onView && (
              <button
                onClick={() => onView(room._id)}
                className="text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition"
              >
                👁 View Details
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(room._id)}
                className="text-xs font-semibold text-[#B40032] hover:bg-red-50 border border-red-100 px-3 py-2 rounded-xl transition"
              >
                ✏ Edit Listing
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(room._id)}
                className="text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-100 px-3 py-2 rounded-xl transition"
              >
                🗑 Delete
              </button>
            )}
          </div>

          {/* Quick status toggle */}
          {room.status !== "draft" && onStatusUpdate && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={room.status}
                onChange={(e) => onStatusUpdate(room._id, e.target.value)}
                className="text-xs font-semibold text-slate-700 border border-slate-200 px-2 py-1.5 rounded-lg bg-slate-50 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
