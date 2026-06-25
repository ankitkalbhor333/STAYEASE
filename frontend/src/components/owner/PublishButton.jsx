import { useState } from "react";
import { publishRoomAPI } from "../../api/owner.api";

export default function PublishButton({ roomId }) {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const publish = async () => {
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      await publishRoomAPI(roomId);
      setSuccess("Room published successfully.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to publish room.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-3">
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={publish}
        disabled={publishing}
        className="w-full rounded-2xl bg-[#B40032] px-5 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
      >
        {publishing ? "Publishing..." : "Publish Listing"}
      </button>
    </div>
  );
}