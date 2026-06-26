import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBookingsAPI } from "../../services/bookingApi";
import BookingCard from "../../components/booking/BookingCard";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState("ALL");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await getMyBookingsAPI();
        setBookings(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getFilteredBookings = () => {
    if (filterTab === "ALL") return bookings;
    return bookings.filter((b) => b.bookingStatus === filterTab);
  };

  const filtered = getFilteredBookings();

  const tabs = [
    { id: "ALL", label: "All Bookings" },
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "PENDING", label: "Pending Payment" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Navbar header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-slate-700 hover:text-[#B40032] font-semibold text-sm transition"
        >
          ← Home
        </Link>
        <h1 className="font-bold text-slate-900 text-lg">My Reservations</h1>
        <div className="w-12"></div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`pb-3 font-semibold text-sm transition whitespace-nowrap outline-none border-b-2 ${
                filterTab === tab.id
                  ? "border-[#B40032] text-[#B40032]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin text-[#B40032] font-bold text-base">Fetching reservations...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-sm font-semibold">
            ⚠ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
            <div className="text-3xl">🧳</div>
            <p className="text-slate-400 font-semibold text-base">
              No reservations found under this filter.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#B40032] text-white px-5 py-2.5 rounded-2xl hover:bg-red-700 transition font-bold text-sm shadow-sm"
            >
              Explore Stays
            </Link>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {filtered.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
