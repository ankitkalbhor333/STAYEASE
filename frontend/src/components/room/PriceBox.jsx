import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { checkAvailabilityAPI } from "../../services/bookingApi";

export default function PriceBox({ price, roomId, onBooking, status }) {
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const [availStatus, setAvailStatus] = useState(null); // 'checking', 'available', 'unavailable'
  const [availError, setAvailError] = useState("");

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const check_in = new Date(checkInDate);
    const check_out = new Date(checkOutDate);
    if (check_in >= check_out) return 0;
    return Math.ceil((check_out - check_in) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const serviceFee = Math.round(price * 0.1);
  const cleaningFee = 50;
  const totalPrice = nights > 0 ? price * nights + serviceFee + cleaningFee : 0;

  useEffect(() => {
    const verifyAvailability = async () => {
      if (!checkInDate || !checkOutDate) {
        setAvailStatus(null);
        setAvailError("");
        return;
      }

      const check_in = new Date(checkInDate);
      const check_out = new Date(checkOutDate);
      if (check_in >= check_out) {
        setAvailStatus("unavailable");
        setAvailError("Check-out date must be after check-in date.");
        return;
      }

      try {
        setAvailStatus("checking");
        setAvailError("");

        const res = await checkAvailabilityAPI({
          roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
        });

        if (res.data?.data?.available) {
          setAvailStatus("available");
        } else {
          setAvailStatus("unavailable");
          setAvailError(res.data?.message || "Room is not available for selected dates.");
        }
      } catch (err) {
        setAvailStatus("unavailable");
        setAvailError(err.response?.data?.message || err.message || "Failed to check availability.");
      }
    };

    verifyAvailability();
  }, [checkInDate, checkOutDate, guests, roomId]);

  const handleBooking = () => {
    if (!user) {
      alert("Please login to book a room");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }
    if (availStatus === "unavailable") {
      alert(availError || "Selected dates are not available for booking.");
      return;
    }
    if (onBooking) {
      onBooking({ checkInDate, checkOutDate, guests, totalPrice });
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const isBookButtonDisabled =
    status !== "active" ||
    availStatus === "checking" ||
    availStatus === "unavailable" ||
    !checkInDate ||
    !checkOutDate;

  return (
    <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg max-w-sm w-full">
      {/* Price Header & Status Badge */}
      <div className="mb-6 flex flex-col items-start gap-1">
        <p className="text-3xl font-bold text-slate-900">
          ${price}{" "}
          <span className="text-sm font-normal text-slate-600">/night</span>
        </p>
        {status === "active" ? (
          <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full uppercase tracking-wider">
            Available
          </span>
        ) : (
          <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full uppercase tracking-wider">
            Not Available
          </span>
        )}
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
            min={todayStr}
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
            min={checkInDate || todayStr}
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

        {/* Real-time availability messages */}
        <div className="pt-1">
          {availStatus === "checking" && (
            <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5 animate-pulse">
              🔄 Checking availability...
            </p>
          )}
          {availStatus === "available" && (
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5">
              ✅ Available for selected dates!
            </p>
          )}
          {availStatus === "unavailable" && (
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
              ❌ {availError || "Room unavailable for selected dates"}
            </p>
          )}
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={isBookButtonDisabled}
        className="w-full bg-[#B40032] text-white font-bold py-2.5 rounded-lg hover:bg-[#8c0126] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg text-sm mb-4"
      >
        {status !== "active" ? "Room Inactive" : "Book Now"}
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
