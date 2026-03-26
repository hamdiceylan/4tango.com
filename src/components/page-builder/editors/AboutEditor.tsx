"use client";

import { AboutContent } from "@/lib/section-types";
import RichTextEditor from "../common/RichTextEditor";
import ImageUploader from "../common/ImageUploader";

interface AboutEditorProps {
  content: AboutContent;
  onChange: (content: AboutContent) => void;
}

export default function AboutEditor({ content, onChange }: AboutEditorProps) {
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
      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <RichTextEditor
          value={content.content || ""}
          onChange={(value) => onChange({ ...content, content: value })}
          placeholder="Tell attendees about your event..."
          rows={8}
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Images (optional)</label>
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
          <p className="text-sm text-gray-500">Add images to accompany your event description.</p>
        )}
      </div>
    </div>
  );
}
