"use client";

import { useState } from "react";
import { GalleryContent, GalleryImage } from "@/lib/section-types";

interface GallerySectionProps {
  title?: string | null;
  content: GalleryContent;
}

function ImageModal({
  image,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  image: GalleryImage;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev Button */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="max-w-5xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.url}
          alt={image.caption || "Gallery image"}
          className="max-w-full max-h-[80vh] object-contain mx-auto"
        />
        {image.caption && (
          <p className="text-white/90 text-center mt-4">{image.caption}</p>
        )}
      </div>
    </div>
  );
}

export default function GallerySection({ title, content }: GallerySectionProps) {
  const { images, layout = "grid" } = content;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title || "Gallery"}
        </h2>

        {/* Grid Layout */}
        {layout === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className="aspect-square overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition"
              >
                <img
                  src={image.url}
                  alt={image.caption || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Masonry Layout */}
        {layout === "masonry" && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className="mb-4 overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition block w-full"
              >
                <img
                  src={image.url}
                  alt={image.caption || `Gallery image ${index + 1}`}
                  className="w-full"
                />
              </button>
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {layout === "carousel" && (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className="flex-shrink-0 w-80 aspect-video overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition snap-center"
              >
                <img
                  src={image.url}
                  alt={image.caption || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedIndex(null)}
            onPrev={() => setSelectedIndex(Math.max(0, selectedIndex! - 1))}
            onNext={() => setSelectedIndex(Math.min(images.length - 1, selectedIndex! + 1))}
            hasPrev={selectedIndex! > 0}
            hasNext={selectedIndex! < images.length - 1}
          />
        )}
      </div>
    </section>
  );
}
