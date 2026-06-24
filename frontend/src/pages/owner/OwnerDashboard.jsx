import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLatestDraftRoomAPI, getMyRoomsAPI } from "../../api/owner.api";

export default function OwnerDashboard() {
  const [draftRoom, setDraftRoom] = useState(null);
  const [roomCount, setRoomCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [draftRes, roomsRes] = await Promise.all([
          getLatestDraftRoomAPI(),
          getMyRoomsAPI(),
        ]);

        if (draftRes.data?.data) {
          setDraftRoom(draftRes.data.data);
        }

        if (roomsRes.data?.data) {
          setRoomCount(roomsRes.data.data.length);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900 mb-3">Owner dashboard</h1>
          <p className="text-slate-600">
            Manage your listings, continue a draft, or create a new room for guests.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm text-slate-600">Loading owner data...</div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Your rooms</h2>
              <p className="text-slate-600 mb-4">You currently have {roomCount} total listings.</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate("/owner/create")}
                  className="w-full rounded-2xl bg-[#B40032] px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                >
                  Create a new room
                </button>
                <Link
                  to="/owner/rooms"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:border-[#B40032]"
                >
                  View all my rooms
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Continue a draft</h2>
              {draftRoom ? (
                <>
                  <p className="text-slate-600 mb-4">Continue editing your latest draft.</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{draftRoom.title || "Untitled draft"}</p>
                    <p className="text-sm text-slate-500">Current step: {draftRoom.currentStep}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/owner/room/${draftRoom._id}`)}
                    className="mt-4 w-full rounded-2xl bg-[#B40032] px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Resume draft
                  </button>
                </>
              ) : (
                <p className="text-slate-600">You do not have a saved draft yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
