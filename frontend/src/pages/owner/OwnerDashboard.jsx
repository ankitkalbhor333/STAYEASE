import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyRoomsAPI,
  getDraftRoomsAPI,
  getRoomStatsAPI,
  getOwnerBookingsAPI,
  deleteRoomAPI,
  updateRoomStepAPI,
  createRoomAPI,
  publishRoomAPI
} from "../../api/owner.api";

// Custom components
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerNavbar from "../../components/owner/OwnerNavbar";
import StatsCard from "../../components/owner/StatsCard";
import RoomCard from "../../components/owner/RoomCard";
import BookingCard from "../../components/owner/BookingCard";
import RevenueChart from "../../components/owner/RevenueChart";
import ProgressBar from "../../components/owner/ProgressBar";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rooms, setRooms] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [roomsRes, draftsRes, bookingsRes, statsRes] = await Promise.all([
        getMyRoomsAPI(),
        getDraftRoomsAPI(),
        getOwnerBookingsAPI(),
        getRoomStatsAPI(),
      ]);

      setRooms(roomsRes.data?.data || []);
      setDrafts(draftsRes.data?.data?.rooms || draftsRes.data?.data || []);
      setBookings(bookingsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load host data.");
    } finally {
      setLoading(false);
    }
  };

  // Listings Actions
  const handleViewRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const handleEditRoom = (roomId) => {
    navigate(`/owner/room/${roomId}`);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      setActionLoading(true);
      await deleteRoomAPI(roomId);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete listing.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (roomId, newStatus) => {
    try {
      setActionLoading(true);
      // Step update for status is usually saved via PATCH /rooms/:id
      await updateRoomStepAPI(roomId, "basic", { status: newStatus });
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update room status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateListing = async () => {
    try {
      setActionLoading(true);
      const res = await createRoomAPI();
      const roomId = res.data?.data?.roomId || res.data?.data?._id;
      navigate(`/owner/room/${roomId}`);
    } catch (err) {
      alert("Failed to initialize a new listing. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishRoom = async (roomId) => {
    try {
      setActionLoading(true);
      await publishRoomAPI(roomId);
      await loadDashboardData();
      alert("Listing published successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish listing.");
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for dashboard
  const activeRoomsList = rooms.filter((r) => r.status === "active");
  const inactiveRoomsList = rooms.filter((r) => r.status === "inactive");
  const draftRoomsList = drafts.filter((r) => (r.completedSteps?.length || 0) < 6);
  const pendingRoomsList = drafts.filter((r) => (r.completedSteps?.length || 0) >= 6);
  
  const totalBookingsCount = bookings.length;
  const totalEarnings = bookings
    .filter((b) => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const averageRating = rooms.reduce((sum, r) => sum + (r.averageRating || 0), 0) / (rooms.length || 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <OwnerNavbar />

      <div className="flex flex-col md:flex-row flex-1">
        <OwnerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex justify-between items-center">
              <span>⚠ {error}</span>
              <button onClick={loadDashboardData} className="underline font-semibold hover:text-red-950">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#B40032]" />
            </div>
          ) : (
            <>
              {/* ───────────────── VIEW: DASHBOARD ───────────────── */}
              {activeTab === "dashboard" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                      Welcome back, Host
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                      Here is the activity of your property listings and reservations.
                    </p>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatsCard label="Total Listings" value={activeRoomsList.length + draftRoomsList.length + pendingRoomsList.length} icon="🏠" />
                    <StatsCard label="Active Rooms" value={activeRoomsList.length} icon="🟢" />
                    <StatsCard label="Pending Rooms" value={pendingRoomsList.length} icon="⏳" />
                    <StatsCard label="Draft Rooms" value={draftRoomsList.length} icon="📝" />
                    <StatsCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon="💰" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Bookings */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Recent Bookings</h3>
                        <button
                          onClick={() => setActiveTab("bookings")}
                          className="text-xs font-semibold text-[#B40032] hover:underline"
                        >
                          View all
                        </button>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
                          📭 No bookings received yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.slice(0, 3).map((booking) => (
                            <BookingCard key={booking._id} booking={booking} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Launch & Resume Draft */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                        <button
                          onClick={handleCreateListing}
                          className="w-full bg-[#B40032] text-white py-3.5 px-4 rounded-2xl font-bold text-sm hover:bg-red-700 shadow-sm transition"
                        >
                          ➕ Create New Listing
                        </button>

                        {drafts.length > 0 ? (
                          <div className="border-t border-slate-100 pt-4 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Resume Latest Draft
                            </p>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <p className="font-semibold text-sm text-slate-800 line-clamp-1">
                                {drafts[0].title || "Untitled Draft"}
                              </p>
                              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                                <span>{drafts[0].completedSteps?.length || 0}/7 Steps</span>
                                <span>Saved recently</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditRoom(drafts[0]._id)}
                              className="w-full bg-slate-100 text-slate-800 py-2.5 px-4 rounded-xl font-semibold text-xs hover:bg-slate-200 transition"
                            >
                              Continue Editing
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-2">
                            No drafts pending. Everything published!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── VIEW: ACTIVE LISTINGS ───────────────── */}
              {activeTab === "active-listings" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Active Listings</h2>
                    <p className="text-sm text-slate-500">Manage all your published property offerings.</p>
                  </div>

                  {activeRoomsList.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                      <p className="text-slate-400 mb-4">No active listings yet.</p>
                      <button
                        onClick={() => setActiveTab("create-listing")}
                        className="bg-[#B40032] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700"
                      >
                        Create Listing
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeRoomsList.map((room) => (
                        <RoomCard
                          key={room._id}
                          room={room}
                          onView={handleViewRoom}
                          onEdit={handleEditRoom}
                          onDelete={handleDeleteRoom}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────── VIEW: INACTIVE LISTINGS ───────────────── */}
              {activeTab === "inactive-listings" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Inactive Listings</h2>
                    <p className="text-sm text-slate-500">View and reactivate your unavailable property offerings.</p>
                  </div>

                  {inactiveRoomsList.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                      🔴 No inactive listings found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inactiveRoomsList.map((room) => (
                        <RoomCard
                          key={room._id}
                          room={room}
                          onView={handleViewRoom}
                          onEdit={handleEditRoom}
                          onDelete={handleDeleteRoom}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────── VIEW: DRAFT ROOMS ───────────────── */}
              {activeTab === "draft-rooms" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Draft Listings</h2>
                    <p className="text-sm text-slate-500">Continue building your listing profiles.</p>
                  </div>

                  {draftRoomsList.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                      📝 No drafts found. Create a new listing above!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {draftRoomsList.map((room) => {
                        const completedSteps = room.completedSteps?.length || 0;
                        const percentage = Math.round((completedSteps / 7) * 100);
                        return (
                          <div
                            key={room._id}
                            className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between gap-4 hover:shadow-md transition"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-900 text-lg line-clamp-1">
                                  {room.title || "Untitled Draft"}
                                </h3>
                                <button
                                  onClick={() => handleDeleteRoom(room._id)}
                                  className="text-xs text-red-500 hover:underline font-semibold"
                                >
                                  Delete
                                </button>
                              </div>
                              <p className="text-xs text-slate-400 font-semibold">
                                Current Step: {room.currentStep || "basic"}
                              </p>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-slate-500">
                                  <span>Completion</span>
                                  <span>{percentage}%</span>
                                </div>
                                <ProgressBar progress={percentage} />
                              </div>
                            </div>

                            <button
                              onClick={() => handleEditRoom(room._id)}
                              className="w-full bg-[#B40032] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-red-700 transition"
                            >
                              Continue Editing
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────── VIEW: PENDING ROOMS ───────────────── */}
              {activeTab === "pending-rooms" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Pending Listings</h2>
                    <p className="text-sm text-slate-500">
                      These drafts are near completion. Complete missing steps to publish.
                    </p>
                  </div>

                  {pendingRoomsList.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                      ⏳ No pending rooms to publish.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRoomsList.map((room) => {
                        const isReady = room.completedSteps?.length >= 6;
                        return (
                          <div
                            key={room._id}
                            className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-900 text-lg">
                                {room.title || "Untitled Draft"}
                              </h3>
                              <p className="text-xs text-slate-500">
                                Steps complete: {room.completedSteps?.length || 0} of 7 •{" "}
                                <span className={isReady ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                                  {isReady ? "Ready to publish!" : "Missing steps"}
                                </span>
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditRoom(room._id)}
                                className="bg-slate-100 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200"
                              >
                                {isReady ? "Review steps" : "Complete Listing"}
                              </button>
                              {isReady && (
                                <button
                                  onClick={() => handlePublishRoom(room._id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700"
                                >
                                  Publish Now
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────── VIEW: CREATE LISTING INTERMEDIATE UI ───────────────── */}
              {activeTab === "create-listing" && (
                <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm space-y-8 animate-fade-in">
                  <div className="text-center space-y-3">
                    <span className="text-4xl">🏡</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      Publish Your Space on StayEase
                    </h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Become a host and start earning! Our simple 7-step process makes it easy to list your room or apartment.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      How it works:
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-[#B40032] font-bold text-sm shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Basic Info & Location</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Provide property name, details, address, and upload photos.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-[#B40032] font-bold text-sm shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Details & Amenities</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Specify rooms, guest capacity, and amenities like WiFi, A/C, etc.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-[#B40032] font-bold text-sm shrink-0">
                          3
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Pricing & Availability</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Set your daily/weekly price and availability dates.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-[#B40032] font-bold text-sm shrink-0">
                          4
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Publish and Earn</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Once all steps are completed, publish your listing live.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateListing}
                      className="px-8 py-3 rounded-2xl bg-[#B40032] text-white font-bold text-sm hover:bg-red-700 shadow-sm transition flex items-center justify-center gap-2"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Initializing...
                        </>
                      ) : (
                        "Start Listing Process 🚀"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ───────────────── VIEW: BOOKINGS ───────────────── */}
              {activeTab === "bookings" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Reservations</h2>
                    <p className="text-sm text-slate-500">Check incoming guest bookings and details.</p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                      📅 No bookings found for your listings yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <BookingCard key={booking._id} booking={booking} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────── VIEW: EARNINGS ───────────────── */}
              {activeTab === "earnings" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Earnings Summary</h2>
                    <p className="text-sm text-slate-500">Track paid reservations and payouts.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between h-32">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Gross Payouts
                      </span>
                      <p className="text-3xl font-black text-slate-900">
                        ₹{totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between h-32">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Confirmed Bookings
                      </span>
                      <p className="text-3xl font-black text-slate-900">
                        {bookings.filter((b) => b.bookingStatus === "CONFIRMED").length}
                      </p>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between h-32">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Completed Bookings
                      </span>
                      <p className="text-3xl font-black text-slate-900">
                        {bookings.filter((b) => b.bookingStatus === "COMPLETED").length}
                      </p>
                    </div>
                  </div>

                  {/* Revenue Charts */}
                  <RevenueChart bookings={bookings} />
                </div>
              )}

              {/* ───────────────── VIEW: ANALYTICS ───────────────── */}
              {activeTab === "analytics" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Performance Analytics</h2>
                    <p className="text-sm text-slate-500">Analyze page metrics, ratings, and stats.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stats summary */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                      <h4 className="font-bold text-slate-800">Average Ratings</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-extrabold text-slate-900">
                          {averageRating ? averageRating.toFixed(1) : "—"}
                        </span>
                        <div>
                          <p className="text-yellow-500 text-sm">★★★★★</p>
                          <p className="text-xs text-slate-400">based on user reviews</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                      <h4 className="font-bold text-slate-800">Listing Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-slate-600 font-semibold">
                          <span>Active published rooms</span>
                          <span>{activeRoomsList.length}</span>
                        </div>
                        <ProgressBar progress={(activeRoomsList.length / (rooms.length || 1)) * 100} color="#16a34a" />

                        <div className="flex justify-between text-xs text-slate-600 font-semibold">
                          <span>Inactive rooms</span>
                          <span>{inactiveRoomsList.length}</span>
                        </div>
                        <ProgressBar progress={(inactiveRoomsList.length / (rooms.length || 1)) * 100} color="#64748b" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
