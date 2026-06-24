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
        <div className="text-lg font-bold text-slate-900">{progress}%</div>
      </div>
      <progress value={progress} max="100" className="w-full h-3 rounded-full overflow-hidden bg-slate-100" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}