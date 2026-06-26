import React from "react";
import DatePicker from "./DatePicker";
import GuestSelector from "./GuestSelector";

export default function BookingForm({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guests,
  setGuests,
  maxGuests,
  onSubmit,
  loading,
  pricePerDay,
}) {
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (start >= end) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const basePrice = nights * pricePerDay;
  const serviceFee = Math.round(basePrice * 0.1);
  const cleaningFee = basePrice > 0 ? 50 : 0;
  const totalPrice = basePrice + serviceFee + cleaningFee;

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    onSubmit({
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      nights,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicker
          label="Check In"
          value={checkInDate}
          onChange={setCheckInDate}
          minDate={todayStr}
        />
        <DatePicker
          label="Check Out"
          value={checkOutDate}
          onChange={setCheckOutDate}
          minDate={checkInDate || todayStr}
        />
      </div>

      <GuestSelector
        value={guests}
        onChange={setGuests}
        maxGuests={maxGuests}
      />

      {nights > 0 && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 space-y-3">
          <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider">Price Details</h4>
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              ${pricePerDay} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span className="font-medium text-slate-900">${basePrice}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Service fee (10%)</span>
            <span className="font-medium text-slate-900">${serviceFee}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Cleaning fee</span>
            <span className="font-medium text-slate-900">${cleaningFee}</span>
          </div>
          <div className="border-t border-slate-200/80 pt-3 flex justify-between font-bold text-slate-900 text-base">
            <span>Total (USD)</span>
            <span className="text-[#B40032]">${totalPrice}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || nights <= 0}
        className="w-full bg-[#B40032] text-white font-bold py-3.5 rounded-2xl hover:bg-red-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg text-sm"
      >
        {loading ? "Processing Reservation..." : "Confirm & Pay"}
      </button>
    </form>
  );
}
