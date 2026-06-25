import { useNavigate } from "react-router-dom";
import { createRoomAPI } from "../../api/owner.api";

export default function CreateRoom() {
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      const res = await createRoomAPI();
      const roomId = res.data.data.roomId || res.data.data._id;
      navigate(`/owner/room/${roomId}`);
    } catch (err) {
      console.error("Error creating room:", err?.response?.data || err.message);
      alert("Unable to create room. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white shadow rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Create your room listing</h1>
        <p className="text-slate-600 mb-6">
          Start a new room draft and complete the listing in a guided step-by-step flow.
        </p>
        <button
          onClick={createRoom}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#B40032] px-5 py-3 text-white font-semibold hover:bg-red-700 transition"
        >
          Create Listing
        </button>
      </div>
    </div>
  );
}
