import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getBookingByIdAPI, createPaymentOrderAPI, verifyPaymentAPI } from "../../services/bookingApi";
import CancelBookingButton from "../../components/booking/CancelBookingButton";
import useAuth from "../../hooks/useAuth";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(location.state?.paymentMessage || "");

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const res = await getBookingByIdAPI(id);
      setBooking(res.data?.data?.booking || res.data?.data);
      setPayment(res.data?.data?.payment || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const handleRetryPayment = async () => {
    try {
      setPaymentLoading(true);

      // 1. Create Razorpay order
      const orderRes = await createPaymentOrderAPI(booking._id);
      const orderData = orderRes.data?.data;

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please try again.");
        setPaymentLoading(false);
        return;
      }

      // 3. Open Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100), // paise
        currency: orderData.currency || "INR",
        name: "StayEase",
        description: `Complete Booking Payment`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setPaymentLoading(true);
            const verifyRes = await verifyPaymentAPI({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              setSuccessMsg("Payment completed and booking confirmed!");
              fetchBookingDetails();
            } else {
              alert("Payment verification failed.");
            }
          } catch (verifyErr) {
            alert("Verification failed: " + (verifyErr.response?.data?.message || verifyErr.message));
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.upi", "card", "netbanking", "wallet"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: "#B40032",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to initiate payment retry.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-[#B40032] font-bold text-lg">Loading Receipt...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <p className="text-red-500 font-semibold">{error || "Booking not found."}</p>
          <Link
            to="/bookings"
            className="inline-block bg-[#B40032] text-white px-5 py-2.5 rounded-2xl hover:bg-red-700 transition font-bold text-sm"
          >
            My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const room = booking.roomId || {};
  const mainImage = room.images?.[0]?.imageUrl || room.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80";

  const isPendingPayment = booking.paymentStatus === "PENDING" && booking.bookingStatus !== "CANCELLED";
  const isCancellable = booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "PENDING";

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link
          to="/bookings"
          className="text-slate-700 hover:text-slate-900 font-semibold text-sm transition"
        >
          ← My Bookings
        </Link>
        <h1 className="font-bold text-slate-900 text-lg">Booking Confirmation</h1>
        <div className="w-16"></div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {paymentLoading && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white px-8 py-6 rounded-3xl border border-slate-200 shadow-xl text-center space-y-3">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-[#B40032] rounded-full"></div>
              <p className="font-bold text-slate-800 text-sm">Initializing Payment window...</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 rounded-3xl bg-green-50 border border-green-200 p-5 text-sm text-green-800 flex justify-between items-center animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-xs text-green-700 hover:underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* Main Booking Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Reservation ID: #{booking._id.slice(-8)}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {booking.bookingStatus === "CONFIRMED" ? "Your trip is confirmed! ✈️" : "Review Booking Details"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <span
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full border tracking-wide uppercase ${
                  booking.bookingStatus === "CONFIRMED"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : booking.bookingStatus === "PENDING"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                Status: {booking.bookingStatus}
              </span>
              <span
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full border tracking-wide uppercase ${
                  booking.paymentStatus === "PAID"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                Payment: {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Room Details Block */}
          <div className="flex flex-col md:flex-row gap-6 bg-slate-50 border border-slate-200/60 p-5 rounded-3xl">
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
              <img
                src={mainImage}
                alt={room.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <span className="text-[10px] font-bold text-[#B40032] uppercase tracking-widest">
                  {room.propertyType || "Stay"} • {room.roomType || "Entire Room"}
                </span>
                <h3 className="font-bold text-slate-950 text-lg line-clamp-1 mt-1 leading-snug">
                  {room.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  📍 {room.fullAddress || `${room.city}, ${room.country}`}
                </p>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-4">
                Hosted by: {room.ownerId?.name || "StayEase Host"}
              </div>
            </div>
          </div>

          {/* Booking Dates & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Check In</p>
              <p className="font-bold text-slate-800 text-base mt-1">{formatDate(booking.checkIn)}</p>
              <p className="text-xs text-slate-500 mt-0.5">After 2:00 PM</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Check Out</p>
              <p className="font-bold text-slate-800 text-base mt-1">{formatDate(booking.checkOut)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Before 11:00 AM</p>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Billing Breakdown</h3>
            <div className="bg-slate-50/50 border border-slate-200/50 p-6 rounded-3xl space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Room cost (${room.pricePerDay || room.price} × {booking.totalDays} nights)</span>
                <span className="font-semibold text-slate-900">${(room.pricePerDay || room.price || 0) * booking.totalDays}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>StayEase Service Fee (10%)</span>
                <span className="font-semibold text-slate-900">${Math.round((room.pricePerDay || room.price || 0) * booking.totalDays * 0.1)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cleaning Fee</span>
                <span className="font-semibold text-slate-900">$50</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900 text-base">
                <span>Total Charge</span>
                <span className="text-[#B40032]">${booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Actions / CTA buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
            {isPendingPayment ? (
              <button
                onClick={handleRetryPayment}
                className="bg-[#B40032] text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-red-700 transition duration-200 active:scale-[0.98] shadow-md hover:shadow-lg text-sm"
              >
                💳 Complete Payment Now
              </button>
            ) : (
              <div className="w-1"></div>
            )}

            {isCancellable && (
              <CancelBookingButton
                bookingId={booking._id}
                onSuccess={fetchBookingDetails}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
