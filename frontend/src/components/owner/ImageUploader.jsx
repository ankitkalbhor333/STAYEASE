import { useState, useRef } from "react";
import { uploadRoomPhotosAPI } from "../../api/owner.api";

export default function ImageUploader({ roomId, room, next, back }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploaded, setUploaded] = useState(room?.images?.length > 0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILES = 10;

  const addFiles = (newFiles) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("Please select valid image files.");
      return;
    }

    const combined = [...files, ...imageFiles].slice(0, MAX_FILES);
    if (files.length + imageFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed. Some files were skipped.`);
    } else {
      setError("");
    }

    setFiles(combined);
    setSuccess("");

    // Generate previews
    const newPreviews = combined.map((file) => ({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    // Revoke old previews
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews(newPreviews);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]?.url);
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setError("");
    setSuccess("");
  };

  const clearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setPreviews([]);
    setError("");
    setSuccess("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      setSuccess(`${files.length} image(s) uploaded successfully!`);
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setFiles([]);
      setPreviews([]);
      setUploaded(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload images.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="form-section-header">
        <span className="icon">📸</span>
        <h3>Property Photos</h3>
      </div>

      <p className="text-sm text-slate-500">
        Upload high-quality photos to attract more guests. You can upload up to {MAX_FILES} images.
      </p>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${dragActive
          ? "border-[#B40032] bg-red-50 scale-[1.01]"
          : "border-slate-200 bg-slate-50 hover:border-[#B40032] hover:bg-red-50/30"
          }`}
      >
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm font-semibold text-slate-700 mb-1">
          {dragActive ? "Drop images here" : "Click to browse or drag & drop"}
        </p>
        <p className="text-xs text-slate-400">
          JPG, PNG, WEBP — up to {MAX_FILES} images
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Selected Files Preview */}
      {previews.length > 0 && (
        <div className="space-y-3 fade-in-up">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {previews.length} image{previews.length > 1 ? "s" : ""} selected
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="h-28 w-full object-cover"
                />
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove"
                >
                  ✕
                </button>
                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[10px] text-white truncate">{preview.name}</p>
                  <p className="text-[9px] text-white/70">{formatSize(preview.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 fade-in-up">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 fade-in-up">
          ⚠ {error}
        </div>
      )}

      {/* Upload Button */}
      {previews.length > 0 && (
        <button
          onClick={upload}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? `Uploading ${files.length} image(s)...` : `Upload ${files.length} Image${files.length > 1 ? "s" : ""}`}
        </button>
      )}

      {/* Already uploaded images from server */}
      {room?.images?.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-semibold text-slate-700">
            📁 Uploaded images ({room.images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {room.images.map((image, index) => {
              const src = image?.imageUrl || image;
              return (
                <div key={image?.publicId || src || index} className="rounded-xl overflow-hidden border border-emerald-200">
                  <img
                    src={src}
                    alt="Room photo"
                    className="h-28 w-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="form-btn-group pt-2">
        {back && (
          <button type="button" onClick={back} className="btn-back">
            ← Back
          </button>
        )}
        {uploaded && !uploading && (
          <button onClick={next} className="btn-primary">
            Continue to availability →
          </button>
        )}
      </div>
    </div>
  );
}