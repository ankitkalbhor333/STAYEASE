import React, { useState } from "react";
import { cancelBookingAPI } from "../../services/bookingApi";

export default function CancelBookingButton({ bookingId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      setLoading(true);
      await cancelBookingAPI(bookingId);
      alert("Booking cancelled successfully.");
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="bg-red-50 hover:bg-red-100/80 border border-red-200 hover:border-red-300 text-red-700 font-bold px-5 py-3 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
    >
      {loading ? "Cancelling..." : "Cancel Reservation"}
    </button>
  );
}
