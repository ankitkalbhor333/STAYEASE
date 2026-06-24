import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchRoomsAPI } from "../../api/room.api";
import RoomGrid from "../../components/room/RoomGrid";
import FilterSidebar from "../../components/room/FilterSidebar";

export default function SearchRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params] = useSearchParams();

  const locationQuery = params.get("city") || params.get("location") || "anywhere";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  const guests = params.get("guests") || "";

  const fetchRooms = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await searchRoomsAPI({
        city: params.get("city") || params.get("location"),
        ...filters,
      });
      setRooms(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [params.toString()]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <FilterSidebar onFilter={fetchRooms} />

      <div className="flex-1">
        <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-6 py-5">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-slate-500 mb-2">
              {locationQuery !== "anywhere"
                ? `Search results for ${locationQuery}`
                : "Room search"}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              {locationQuery !== "anywhere"
                ? `Stays in ${locationQuery}`
                : "Find your perfect stay"}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {checkIn && <span>Check-in: {checkIn}</span>}
              {checkOut && <span>Check-out: {checkOut}</span>}
              {guests && <span>Guests: {guests}</span>}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin">
              <svg
                className="w-8 h-8 text-[#B40032]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 m-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-6xl mx-auto px-6 py-8">
            <RoomGrid rooms={rooms} />
            {rooms.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-600 text-lg font-medium">
                  No stays found for those filters. Try a different location or modify your search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

