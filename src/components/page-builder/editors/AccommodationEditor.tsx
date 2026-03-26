"use client";

import { AccommodationContent } from "@/lib/section-types";
import RichTextEditor from "../common/RichTextEditor";
import ImageUploader from "../common/ImageUploader";

interface AccommodationEditorProps {
  content: AccommodationContent;
  onChange: (content: AccommodationContent) => void;
}

export default function AccommodationEditor({ content, onChange }: AccommodationEditorProps) {
  const updateFeature = (index: number, value: string) => {
    const newFeatures = (content.features || []).map((f, i) =>
      i === index ? value : f
    );
    onChange({ ...content, features: newFeatures });
  };

  const addFeature = () => {
    onChange({ ...content, features: [...(content.features || []), ""] });
  };

  const removeFeature = (index: number) => {
    onChange({ ...content, features: (content.features || []).filter((_, i) => i !== index) });
  };

  const addImage = () => {
    onChange({ ...content, images: [...(content.images || []), ""] });
  };

  const updateImage = (index: number, url: string) => {
    const newImages = (content.images || []).map((img, i) =>
      i === index ? url : img
    );
    onChange({ ...content, images: newImages });
  };

  const removeImage = (index: number) => {
    onChange({ ...content, images: (content.images || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hotel/Venue Name</label>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Hotel Arts Barcelona"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <RichTextEditor
          value={content.description || ""}
          onChange={(value) => onChange({ ...content, description: value })}
          placeholder="Describe the accommodation..."
          rows={4}
        />
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
        {(content.images && content.images.length > 0) ? (
          <div className="grid grid-cols-2 gap-4">
            {content.images.map((image, index) => (
              <div key={index} className="relative group">
                <ImageUploader
                  value={image}
                  onChange={(url) => updateImage(index, url)}
                  category="event"
                  aspectRatio="video"
                  placeholder="Upload image"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Add images of the accommodation.</p>
        )}
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Features</label>
          <button
            type="button"
            onClick={addFeature}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Feature
          </button>
        </div>
        <div className="space-y-2">
          {(content.features || []).map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="e.g., Free WiFi, Pool, Breakfast included"
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={content.address || ""}
          onChange={(e) => onChange({ ...content, address: e.target.value })}
          placeholder="123 Main Street, Barcelona, Spain"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Map URL</label>
          <input
            type="url"
            value={content.mapUrl || ""}
            onChange={(e) => onChange({ ...content, mapUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Booking URL</label>
          <input
            type="url"
            value={content.bookingUrl || ""}
            onChange={(e) => onChange({ ...content, bookingUrl: e.target.value })}
            placeholder="https://booking.com/..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>
    </div>
  );
}
