import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchRoomsAPI } from "../../api/room.api";
import RoomGrid from "../../components/room/RoomGrid";
import FilterSidebar from "../../components/room/FilterSidebar";

export default function SearchRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {locationQuery !== "anywhere"
                  ? `Stays in ${locationQuery}`
                  : "Find your perfect stay"}
              </h1>
            </div>
            
            <div className="w-20"></div>
          </div>

          {/* Search Summary */}
          <div className="pb-4">
            <p className="text-sm text-slate-500 mb-3">
              {locationQuery !== "anywhere"
                ? `Search results for ${locationQuery}`
                : "Browse all available rooms"}
            </p>
            <div className="flex flex-wrap gap-2">
              {locationQuery !== "anywhere" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {locationQuery}
                </span>
              )}
              {checkIn && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                  </svg>
                  Check-in: {checkIn}
                </span>
              )}
              {checkOut && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                  </svg>
                  Check-out: {checkOut}
                </span>
              )}
              {guests && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM17 16a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {guests} Guest{guests > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <FilterSidebar onFilter={fetchRooms} />

        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin mb-4">
                  <svg
                    className="w-12 h-12 text-[#B40032]"
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
                <p className="text-slate-600 font-medium">Searching for rooms...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="m-6 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-700 font-medium">Error loading rooms</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {rooms.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-600 text-lg font-medium mb-2">
                    No stays found
                  </p>
                  <p className="text-slate-500 mb-6">
                    Try adjusting your search filters or explore a different location.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#B40032] text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Back to Home
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-slate-600 font-medium">
                      Found <span className="text-slate-900 font-bold">{rooms.length}</span> {rooms.length === 1 ? "room" : "rooms"}
                    </p>
                  </div>
                  <RoomGrid rooms={rooms} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

