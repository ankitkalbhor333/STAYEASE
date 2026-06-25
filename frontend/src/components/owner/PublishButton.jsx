
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishRoomAPI } from "../../api/owner.api";
import useAuth from "../../hooks/useAuth";

export default function PublishButton({ roomId }) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const publish = async () => {
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      await publishRoomAPI(roomId);
      // Refresh user data so role is updated to OWNER
      await refreshUser();
      setSuccess("Room published successfully.");
      // Redirect to owner dashboard after brief delay
      setTimeout(() => navigate("/owner"), 1200);
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

// import { useState } from "react";
// import { publishRoomAPI } from "../../api/owner.api";
// import { useNavigate } from "react-router-dom";

// export default function PublishButton({ roomId }) {
//   const [publishing, setPublishing] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const navigate = useNavigate();

//   const publish = async () => {
//     setPublishing(true);
//     setError("");
//     setSuccess("");
//     try {
//       await publishRoomAPI(roomId);
//       setSuccess("🎉 Room published successfully!");
//       setTimeout(() => {
//         navigate("/owner/rooms");
//       }, 2000);
//     } catch (err) {
//       const data = err.response?.data;
//       const message = data?.message || err.message || "Unable to publish room.";

//       // Parse the detailed validation object from backend
//       const validation = data?.validation;
//       if (validation?.errors && validation.errors.length > 0) {
//         // Show all specific error messages from backend
//         setError(`${message}\n• ${validation.errors.join("\n• ")}`);
//       } else if (validation?.stepValidation) {
//         // Find steps that have errors
//         const failedSteps = Object.entries(validation.stepValidation)
//           .filter(([, errors]) => Array.isArray(errors) && errors.length > 0)
//           .map(([step, errors]) => `${step}: ${errors.join(", ")}`);
//         if (failedSteps.length > 0) {
//           setError(`${message}\n• ${failedSteps.join("\n• ")}`);
//         } else {
//           setError(message);
//         }
//       } else {
//         setError(message);
//       }
//     } finally {
//       setPublishing(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       {success && (
//         <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 fade-in-up">
//           {success}
//         </div>
//       )}
//       {error && (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 fade-in-up whitespace-pre-line">
//           {error}
//         </div>
//       )}
//       <button
//         onClick={publish}
//         disabled={publishing}
//         className="btn-primary w-full justify-center"
//       >
//         {publishing ? "Publishing..." : "Publish Listing"}
//       </button>
//     </div>
//   );
// }

