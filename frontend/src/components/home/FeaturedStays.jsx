import RoomGrid from "../room/RoomGrid";

export default function FeaturedStays({ rooms, loading, error, onViewAll }) {
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 grow w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Explore Popular Stays
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Top-rated rentals with premium amenities, handpicked for you.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-sm font-bold text-[#B40032] hover:underline cursor-pointer"
        >
          View all stays
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl bg-slate-100 h-96" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          {error}
        </div>
      ) : (
        <RoomGrid rooms={rooms} />
      )}
    </main>
  );
}
