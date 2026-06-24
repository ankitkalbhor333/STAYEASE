export default function CategorySelector({ categories, activeCategory, onCategorySelect }) {
  return (
    <section className="border-b border-slate-100 py-6 px-6 md:px-12 bg-white sticky top-20 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center overflow-x-auto gap-10 no-scrollbar">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id, category.label)}
              className={`flex flex-col items-center gap-2.5 border-b-2 pb-3.5 px-1.5 transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "border-[#B40032] text-[#B40032] font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={category.icon}></path>
              </svg>
              <span className="text-xs tracking-wide">{category.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
