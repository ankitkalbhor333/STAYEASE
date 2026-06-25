import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRoomsAPI } from "../../api/owner.api";

export default function MyRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const response = await getMyRoomsAPI();
        setRooms(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load your rooms.");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900 mb-3">My rooms</h1>
          <p className="text-slate-600">View your drafts and published listings in one place.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm text-slate-600">Loading your rooms...</div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
        ) : rooms.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm text-slate-600">No rooms found.</div>
        ) : (
          <div className="grid gap-6">
            {rooms.map((room) => (
              <div key={room._id} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{room.title || "Untitled room"}</h2>
                    <p className="text-sm text-slate-500">Status: {room.status}</p>
                  </div>
                  <Link
                    to={room.status === "draft" ? `/owner/room/${room._id}` : `/rooms/${room._id}`}
                    className="rounded-2xl bg-[#B40032] px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                  >
                    {room.status === "draft" ? "Continue draft" : "View listing"}
                  </Link>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <p className="text-sm text-slate-600">Guests: {room.maxGuests || "—"}</p>
                  <p className="text-sm text-slate-600">Bedrooms: {room.bedrooms || "—"}</p>
                  <p className="text-sm text-slate-600">Price/day: {room.pricePerDay ? `₹${room.pricePerDay}` : "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
