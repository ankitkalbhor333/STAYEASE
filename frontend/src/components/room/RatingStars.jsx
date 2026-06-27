export default function RatingStars({ rating = 0, size = 20 }) {
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${normalized} out of 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const starValue = idx + 1;
        const filled = normalized >= starValue;
        const half = !filled && normalized + 0.5 >= starValue;

        return (
          <svg
            key={idx}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={filled ? "#f59e0b" : half ? "#fde68a" : "none"}
            className={filled || half ? "text-yellow-400" : "text-slate-300"}
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              stroke={filled ? "#f59e0b" : half ? "#fde68a" : "#cbd5e1"}
              strokeWidth="1"
            />
          </svg>
        );
      })}
      <span className="text-sm text-slate-600 ml-1">{normalized.toFixed(1)}</span>
    </div>
  );
}


