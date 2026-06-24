import { useState } from "react";
import useAuth from "../../hooks/useAuth";

export default function PriceBox({ price, roomId, onBooking }) {
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const check_in = new Date(checkInDate);
    const check_out = new Date(checkOutDate);
    return Math.ceil((check_out - check_in) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const serviceFee = Math.round(price * 0.1);
  const cleaningFee = 50;
  const totalPrice = nights > 0 ? price * nights + serviceFee + cleaningFee : 0;

  const handleBooking = () => {
    if (!user) {
      alert("Please login to book a room");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }
    if (onBooking) {
      onBooking({ checkInDate, checkOutDate, guests, totalPrice });
    }
  };

  return (
    <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg max-w-sm w-full">
      {/* Price Header */}
      <div className="mb-6">
        <p className="text-3xl font-bold text-slate-900">
          ${price}{" "}
          <span className="text-sm font-normal text-slate-600">/night</span>
        </p>
      </div>

      {/* Dates */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
            Check In
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#B40032]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
            Check Out
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#B40032]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#B40032]"
          >
            {[1, 2, 3, 4, 5, 6, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        className="w-full bg-[#B40032] text-white font-bold py-2.5 rounded-lg hover:bg-[#8c0126] transition-colors mb-4"
      >
        Book Now
      </button>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-700">
            <span>
              ${price} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span>${price * nights}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Service fee</span>
            <span>${serviceFee}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Cleaning fee</span>
            <span>${cleaningFee}</span>
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
