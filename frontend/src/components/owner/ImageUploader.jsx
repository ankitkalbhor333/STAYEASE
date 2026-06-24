import { useState } from "react";
import { uploadRoomPhotosAPI } from "../../api/owner.api";

export default function ImageUploader({ roomId, room, next }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploaded, setUploaded] = useState(room?.images?.length > 0);

  const handleChange = (event) => {
    setFiles(Array.from(event.target.files));
    setError("");
    setSuccess("");
  };

  const upload = async () => {
    if (!files.length) {
      setError("Please select at least one image.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      await uploadRoomPhotosAPI(roomId, formData);
      setSuccess("Images uploaded successfully.");
      setFiles([]);
      setUploaded(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload images.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">Upload images</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
      />
      {files.length > 0 && (
        <p className="text-sm text-slate-600">{files.length} file(s) selected</p>
      )}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={upload}
        disabled={uploading}
        className="rounded-2xl bg-[#B40032] px-6 py-3 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>
      {uploaded && !uploading && (
        <button
          onClick={next}
          className="mt-3 rounded-2xl bg-slate-100 px-6 py-3 text-slate-900 font-semibold hover:bg-slate-200 transition"
        >
          Continue to availability
        </button>
      )}
      {room?.images?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
          {room.images.map((image, index) => {
            const src = image?.imageUrl || image;
            return (
              <img
                key={image?.publicId || src || index}
                src={src}
                alt="Room preview"
                className="h-24 w-full rounded-2xl object-cover"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}