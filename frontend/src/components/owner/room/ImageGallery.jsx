import { useState } from "react";

export default function ImageGallery({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const displayImages = images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative w-full h-96 md:h-[500px] bg-slate-200 rounded-lg overflow-hidden">
        <img
          src={displayImages[selectedIndex]}
          alt="Room"
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === 0 ? displayImages.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-slate-100 shadow-lg"
            >
              <svg
                className="w-6 h-6 text-slate-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === displayImages.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-slate-100 shadow-lg"
            >
              <svg
                className="w-6 h-6 text-slate-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedIndex + 1} / {displayImages.length}
        </div>
      </div>

      {/* Thumbnail Grid */}
      {displayImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-2">
          {displayImages.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-full h-20 md:h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selectedIndex === idx
                  ? "border-[#B40032]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
