import React from "react";
import { Link } from "react-router-dom";

export default function BookingCard({ booking }) {
  const room = booking.roomId || {};
  const mainImage = room.images?.[0]?.imageUrl || room.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusColors = {
    CONFIRMED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    COMPLETED: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const paymentColors = {
    PAID: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    REFUNDED: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col sm:flex-row gap-5 p-4">
      {/* Room Thumbnail */}
      <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img
          src={mainImage}
          alt={room.title || "Room"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info & Details */}
      <div className="flex-1 flex flex-col justify-between py-1 gap-3">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-bold text-slate-900 text-lg line-clamp-1 leading-snug">
              {room.title || "Untitled Property"}
            </h3>
            <span className="font-bold text-slate-900 whitespace-nowrap text-lg">
              ${booking.totalAmount}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            📍 {room.city ? `${room.city}, ${room.country}` : "StayEase Listing"}
          </p>

          <div className="flex flex-wrap gap-2.5 items-center mt-3">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                statusColors[booking.bookingStatus] || "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              Booking: {booking.bookingStatus}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                paymentColors[booking.paymentStatus] || "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              Payment: {booking.paymentStatus}
            </span>
            <span className="text-xs text-slate-500 font-semibold ml-auto sm:ml-0">
              {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Action Button & Date */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500 font-medium">
            📅 {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
          </span>
          <Link
            to={`/bookings/${booking._id}`}
            className="text-xs font-bold bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 px-4 py-2 rounded-xl text-slate-700 transition"
          >
            Details & Receipt →
          </Link>
        </div>
      </div>
    </div>
  );
}
