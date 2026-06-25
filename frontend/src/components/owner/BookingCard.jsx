import React from "react";

export default function BookingCard({ booking, onCancel }) {
  const checkIn = new Date(booking.checkIn).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  const checkOut = new Date(booking.checkOut).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(booking.totalAmount || 0);

  const statusBadges = {
    CONFIRMED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Room Booking
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
              statusBadges[booking.bookingStatus] || "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {booking.bookingStatus}
          </span>
        </div>

        <h4 className="font-bold text-lg text-slate-900">
          {booking.roomId?.title || "Untitled Room"}
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
          <div>
            <p className="text-xs text-slate-400 font-medium">Guest</p>
            <p className="font-semibold text-slate-800">{booking.userId?.name || "Anonymous"}</p>
            <p className="text-xs text-slate-500">{booking.userId?.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Check-In</p>
            <p className="font-semibold text-slate-800">{checkIn}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Check-Out</p>
            <p className="font-semibold text-slate-800">{checkOut}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Guests & Days</p>
            <p className="font-semibold text-slate-800">
              {booking.guests} guest{booking.guests > 1 ? "s" : ""} • {booking.totalDays} day{booking.totalDays > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Total Payout</p>
          <p className="text-2xl font-bold text-slate-950">{formattedAmount}</p>
        </div>

        {booking.bookingStatus === "PENDING" && onCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            className="text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-100 px-4 py-2 rounded-xl transition"
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
