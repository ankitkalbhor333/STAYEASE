export default function HeroSection({
  searchWhere,
  searchCheckIn,
  searchCheckOut,
  searchWho,
  onSearchChange,
  onSearchSubmit,
}) {
  return (
    <section className="relative h-140 flex items-center justify-center px-6 md:px-12 py-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85"
          alt="Luxury Villa background"
          className="w-full h-full object-cover scale-[1.02]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/30 to-slate-900/60" />
      </div>

      <div className="max-w-5xl w-full mx-auto relative z-10 flex flex-col items-center text-center text-white">
        <span className="px-4 py-1.5 bg-[#B40032] text-xs font-bold uppercase tracking-widest rounded-full mb-6 shadow-lg shadow-black/20">
          Premium Lodgings
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl mb-8 drop-shadow-md">
          Extraordinary stays.<br />Effortless discovery.
        </h1>

        <form
          onSubmit={onSearchSubmit}
          className="w-full max-w-4xl bg-white border border-slate-100 rounded-full shadow-2xl p-2.5 grid grid-cols-1 md:grid-cols-4 items-center gap-1 text-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-100"
        >
          <div className="px-6 py-2.5 text-left flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#B40032]">Where</label>
            <input
              type="text"
              placeholder="Search destinations"
              value={searchWhere}
              onChange={(e) => onSearchChange("searchWhere", e.target.value)}
              className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
            />
          </div>

          <div className="px-6 py-2.5 text-left flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Check in</label>
            <input
              type="date"
              value={searchCheckIn}
              onChange={(e) => onSearchChange("searchCheckIn", e.target.value)}
              className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
            />
          </div>

          <div className="px-6 py-2.5 text-left flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Check out</label>
            <input
              type="date"
              value={searchCheckOut}
              onChange={(e) => onSearchChange("searchCheckOut", e.target.value)}
              className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
            />
          </div>

          <div className="px-6 py-2.5 text-left flex justify-between items-center gap-4">
            <div className="flex flex-col flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Who</label>
              <input
                type="text"
                placeholder="Add guests"
                value={searchWho}
                onChange={(e) => onSearchChange("searchWho", e.target.value)}
                className="text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none mt-1 w-full"
              />
            </div>

            <button
              type="submit"
              className="w-12 h-12 bg-[#B40032] hover:bg-[#900028] hover:scale-105 active:scale-95 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg shadow-[#B40032]/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
