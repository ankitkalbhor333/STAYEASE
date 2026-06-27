import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { createReviewAPI } from "../../api/review.api";

export default function AddReviewForm({ roomId, onCreated }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please login to add a review");
      return;
    }

    try {
      setSubmitting(true);
      await createReviewAPI({ roomId, rating, comment });
      setRating(5);
      setComment("");
      onCreated?.();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Leave a review</h3>
          <p className="text-sm text-slate-600">Your feedback helps others decide.</p>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-lg p-2"
            disabled={submitting}
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-[#B40032] text-white px-5 py-2 rounded-lg hover:bg-[#8c0126] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full border border-slate-200 rounded-lg p-2"
          placeholder="What did you like?"
          disabled={submitting}
        />
        <div className="text-xs text-slate-500 mt-1">{comment.length}/500</div>
      </div>
    </form>
  );

}