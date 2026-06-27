import RatingStars from "./RatingStars";

export default function ReviewCard({ review, onDelete }) {
  const authorName = review?.userId?.name || "Anonymous";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-slate-900">{authorName}</p>
            <span className="text-slate-500 text-sm">
              {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
            </span>
          </div>
          <RatingStars rating={review?.rating} size={18} />
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 text-sm font-semibold"
            aria-label="Delete review"
          >
            Delete
          </button>
        )}
      </div>

      {review?.comment ? (
        <p className="text-slate-700 leading-relaxed mt-3 whitespace-pre-wrap">{review.comment}</p>
      ) : (
        <p className="text-slate-500 italic mt-3">No comment</p>
      )}
    </div>
  );

}