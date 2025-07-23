import React, { useState } from "react";

export default function ImageGalleryModal({ images = [], onClose }) {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const prevImage = () => setCurrent((current - 1 + images.length) % images.length);
  const nextImage = () => setCurrent((current + 1) % images.length);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-2 sm:p-4 max-w-xs sm:max-w-lg w-[95vw] sm:w-full relative flex flex-col items-center">
        <button
          className="absolute top-2 right-3 text-2xl"
          onClick={onClose}
        >×</button>
        <div className="flex items-center justify-center w-full">
          <button
            onClick={prevImage}
            className="text-2xl px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            aria-label="Previous"
            disabled={images.length <= 1}
            style={{ touchAction: "manipulation" }}
          >
            &#8592;
          </button>
          <img
            src={images[current]}
            alt={`Product ${current + 1}`}
            className="h-40 sm:h-48 rounded shadow mx-2 sm:mx-4 object-contain"
            style={{ maxWidth: "70vw", maxHeight: "50vh" }}
          />
          <button
            onClick={nextImage}
            className="text-2xl px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            aria-label="Next"
            disabled={images.length <= 1}
            style={{ touchAction: "manipulation" }}
          >
            &#8594;
          </button>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          {current + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}