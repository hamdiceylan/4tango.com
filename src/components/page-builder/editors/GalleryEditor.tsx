"use client";

import { GalleryContent, GalleryImage } from "@/lib/section-types";
import ImageUploader from "../common/ImageUploader";

interface GalleryEditorProps {
  content: GalleryContent;
  onChange: (content: GalleryContent) => void;
}

export default function GalleryEditor({ content, onChange }: GalleryEditorProps) {
  const addImage = () => {
    const newImage: GalleryImage = {
      url: "",
      caption: "",
    };
    onChange({ ...content, images: [...content.images, newImage] });
  };

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    const newImages = content.images.map((img, i) =>
      i === index ? { ...img, ...updates } : img
    );
    onChange({ ...content, images: newImages });
  };

  const removeImage = (index: number) => {
    onChange({ ...content, images: content.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {(["grid", "carousel", "masonry"] as const).map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => onChange({ ...content, layout })}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                content.layout === layout
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Images</label>
          <button
            type="button"
            onClick={addImage}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </button>
        </div>

        {content.images.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No images yet. Click &quot;Add Image&quot; to build your gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {content.images.map((image, index) => (
              <div key={index} className="relative group">
                <ImageUploader
                  value={image.url}
                  onChange={(url) => updateImage(index, { url })}
                  category="gallery"
                  aspectRatio="video"
                  placeholder="Upload image"
                />

                {image.url && (
                  <>
                    {/* Caption input */}
                    <input
                      type="text"
                      value={image.caption || ""}
                      onChange={(e) => updateImage(index, { caption: e.target.value })}
                      placeholder="Caption (optional)"
                      className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}

                {!image.url && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-gray-200 text-gray-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
