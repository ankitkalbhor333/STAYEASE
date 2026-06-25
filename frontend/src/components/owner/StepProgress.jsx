import { useEffect, useState } from "react";
import { getProgressAPI } from "../../api/owner.api";

export default function StepProgress({ roomId, refreshKey }) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const res = await getProgressAPI(roomId);
        setProgress(res.data.data.progressPercentage || 0);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load progress.");
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [roomId, refreshKey]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading progress...</p>;
  }

  return (
    <div className="space-y-3 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">Draft progress</p>
          <p className="text-xs text-slate-500">Complete all steps to publish</p>
        </div>
        <div
          className="text-lg font-bold"
          style={{
            background: "linear-gradient(135deg, #B40032, #FF4D6D)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {progress}%
        </div>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}