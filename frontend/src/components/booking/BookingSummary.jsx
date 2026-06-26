import React from "react";

export default function BookingSummary({ room, nights = 0, guests = 1, totalPrice = 0 }) {
  if (!room) return null;

  const mainImage = room.images?.[0]?.imageUrl || room.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80";

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Room Header */}
      <div className="flex gap-4">
        <div className="w-24 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
          <img
            src={mainImage}
            alt={room.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {room.propertyType || "Stay"} • {room.roomType || "Entire place"}
          </span>
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mt-1 leading-snug">
            {room.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            📍 {room.city}, {room.country}
          </p>
        </div>
      </div>

      {/* Details list */}
      <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="flex justify-between">
          <span>Nights</span>
          <span className="text-slate-900">{nights} night{nights !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex justify-between">
          <span>Guests</span>
          <span className="text-slate-900">{guests} guest{guests !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      {nights > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>
              ${room.pricePerDay || room.price || 0} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span>${(room.pricePerDay || room.price || 0) * nights}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Service fee (10%)</span>
            <span>${Math.round((room.pricePerDay || room.price || 0) * nights * 0.1)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Cleaning fee</span>
            <span>$50</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-950 text-base">
            <span>Total (USD)</span>
            <span className="text-[#B40032]">${totalPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
