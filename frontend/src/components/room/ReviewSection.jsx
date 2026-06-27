import { useEffect, useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getRoomReviewsAPI, deleteReviewAPI } from "../../api/review.api";
import ReviewCard from "./ReviewCard";
import AddReviewForm from "./AddReviewForm";

export default function ReviewSection({ roomId }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const canDelete = (review) => {
    if (!user) return false;
    const authorId = review?.userId?._id?.toString?.() || review?.userId?._id || review?.userId;
    return authorId && user.id && authorId.toString() === user.id.toString();
  };

  const fetchReviews = async (page = 1) => {
    setError(null);
    try {
      setLoading(true);
      const res = await getRoomReviewsAPI(roomId, { page, limit: 10 });
      const payload = res.data?.data;
      const dataReviews = payload?.reviews || [];
      const meta = payload?.pagination || {};

      setReviews(dataReviews);
      setPagination({
        page: meta.page || page,
        limit: meta.limit || 10,
        total: meta.total || 0,
        totalPages: meta.totalPages || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleDelete = async (reviewId) => {
    if (!user) return;
    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;

    try {
      await deleteReviewAPI(reviewId);
      await fetchReviews(pagination.page || 1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete review");
    }
  };

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
          <p className="text-sm text-slate-600">See what guests say.</p>
        </div>
        {avgRating > 0 && (
          <div className="text-right">
            <p className="text-sm text-slate-500">Avg (current page)</p>
            <p className="text-lg font-semibold text-slate-900">{avgRating.toFixed(1)}/5</p>
          </div>
        )}
      </div>

      <AddReviewForm roomId={roomId} onCreated={() => fetchReviews(1)} />

      {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

      {loading ? (
        <div className="py-8 text-slate-600">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-slate-500">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={canDelete(review) ? () => handleDelete(review._id) : null}
            />
          ))}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const page = idx + 1;
                const active = page === pagination.page;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => fetchReviews(page)}
                    className={
                      active
                        ? "bg-[#B40032] text-white px-3 py-1 rounded-lg text-sm font-semibold"
                        : "bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-slate-50"
                    }
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

