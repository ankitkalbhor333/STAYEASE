import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getRoomDetailsAPI } from "../../api/room.api";
import { createBookingAPI, createPaymentOrderAPI, verifyPaymentAPI } from "../../services/bookingApi";
import useAuth from "../../hooks/useAuth";
import BookingForm from "../../components/booking/BookingForm";
import BookingSummary from "../../components/booking/BookingSummary";

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

export default function BookingCheckout() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill dates and guests from RoomDetails state if available
  const [checkInDate, setCheckInDate] = useState(location.state?.checkInDate || "");
  const [checkOutDate, setCheckOutDate] = useState(location.state?.checkOutDate || "");
  const [guests, setGuests] = useState(location.state?.guests || 1);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const res = await getRoomDetailsAPI(roomId);
        setRoom(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load room details.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const handleCheckoutSubmit = async ({ checkInDate, checkOutDate, guests, totalPrice }) => {
    try {
      setCheckoutLoading(true);

      // 1. Create Booking (Pending status)
      const bookingRes = await createBookingAPI({
        roomId,
        checkInDate,
        checkOutDate,
        guests,
      });

      const booking = bookingRes.data?.data?.booking || bookingRes.data?.data;
      if (!booking?._id) {
        throw new Error("Failed to create booking reference.");
      }

      // 2. Request Razorpay Order ID
      const orderRes = await createPaymentOrderAPI(booking._id);
      const orderData = orderRes.data?.data;

      // 3. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        setCheckoutLoading(false);
        return;
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100), // convert to paise
        currency: orderData.currency || "INR",
        name: "StayEase",
        description: `Booking for ${room?.title || "Stay"}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setCheckoutLoading(true);
            // Verify payment on the backend
            const verifyRes = await verifyPaymentAPI({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              navigate(`/bookings/${booking._id}`, {
                state: { paymentStatus: "SUCCESS", paymentMessage: "Booking and payment confirmed!" },
              });
            } else {
              alert("Payment verification failed. Please check My Bookings to retry.");
              navigate(`/bookings/${booking._id}`);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Verification error: " + (verifyErr.response?.data?.message || verifyErr.message));
            navigate(`/bookings/${booking._id}`);
          } finally {
            setCheckoutLoading(false);
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
        modal: {
          ondismiss: function () {
            alert("Checkout window closed. You can complete this payment later from 'My Bookings'.");
            navigate(`/bookings/${booking._id}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Something went wrong during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-[#B40032] font-bold text-lg">Loading Details...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
          <p className="text-red-500 font-semibold">{error || "Room details not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#B40032] text-white px-5 py-2.5 rounded-2xl hover:bg-red-700 transition font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Live calculations for the BookingSummary
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (start >= end) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };
  const nights = calculateNights();
  const priceVal = room.pricePerDay || room.price || 0;
  const basePrice = nights * priceVal;
  const serviceFee = Math.round(basePrice * 0.1);
  const cleaningFee = basePrice > 0 ? 50 : 0;
  const totalPrice = basePrice + serviceFee + cleaningFee;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-sm transition"
        >
          ← Back
        </button>
        <h1 className="font-bold text-slate-900 text-lg">Confirm and Pay</h1>
        <div className="w-12"></div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {checkoutLoading && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white px-8 py-6 rounded-3xl border border-slate-200 shadow-xl text-center space-y-3">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-[#B40032] rounded-full"></div>
              <p className="font-bold text-slate-800 text-sm">Processing Payment Window...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-100">
              Trip Details
            </h2>

            <BookingForm
              checkInDate={checkInDate}
              setCheckInDate={setCheckInDate}
              checkOutDate={checkOutDate}
              setCheckOutDate={setCheckOutDate}
              guests={guests}
              setGuests={setGuests}
              maxGuests={room.maxGuests || 10}
              onSubmit={handleCheckoutSubmit}
              loading={checkoutLoading}
              pricePerDay={priceVal}
            />
          </div>

          {/* Summary Side */}
          <div className="lg:col-span-5">
            <BookingSummary
              room={room}
              nights={nights}
              guests={guests}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
